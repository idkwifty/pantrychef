import { useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PrimaryButton, Screen, Subtitle, Title } from "../../src/components/ui";
import { scoreRecipes, searchAllProviders } from "../../src/providers";
import { useAppStore } from "../../src/store/useAppStore";
import { colors, radius, space } from "../../src/theme";

export default function RecipesScreen() {
  const pantry = useAppStore((s) => s.pantry);
  const preferences = useAppStore((s) => s.preferences);
  const providers = useAppStore((s) => s.providers);
  const apiKeys = useAppStore((s) => s.apiKeys);
  const lastResults = useAppStore((s) => s.lastResults);
  const lastErrors = useAppStore((s) => s.lastErrors);
  const setResults = useAppStore((s) => s.setResults);
  const [loading, setLoading] = useState(false);

  async function runSearch() {
    if (!pantry.length) return;
    setLoading(true);
    try {
      const names = pantry.map((item) => item.name);
      const { recipes, errors } = await searchAllProviders(names, providers, apiKeys);
      setResults(scoreRecipes(recipes, names, preferences), errors);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Title>Блюда под вас</Title>
      <Subtitle>
        Учитываем аллергии, рацион и то, что лежит в холодильнике. Источники: встроенные рецепты + любые включённые API.
      </Subtitle>
      <View style={{ height: space.md }} />
      <PrimaryButton
        label={loading ? "Ищем..." : "Обновить подборку"}
        onPress={runSearch}
        disabled={loading || pantry.length === 0}
      />
      {pantry.length === 0 && (
        <Text style={styles.warn}>Сначала добавьте продукты на вкладке «Продукты».</Text>
      )}
      {lastErrors.map((err) => (
        <Text key={err} style={styles.warn}>
          {err}
        </Text>
      ))}
      {loading && <ActivityIndicator style={{ marginTop: 16 }} color={colors.forest} />}
      <ScrollView contentContainerStyle={{ paddingVertical: 16, paddingBottom: 48 }}>
        {lastResults.map((recipe) => (
          <Pressable
            key={recipe.id}
            style={styles.card}
            onPress={() => router.push(`/recipe/${encodeURIComponent(recipe.id)}`)}
          >
            {recipe.image ? <Image source={{ uri: recipe.image }} style={styles.image} /> : <View style={styles.ph} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{recipe.title}</Text>
              <Text style={styles.meta}>
                {recipe.provider} · совпало {recipe.matched.length}
                {recipe.missing.length ? ` · не хватает ${recipe.missing.length}` : " · можно готовить"}
              </Text>
              {recipe.missing.length > 0 && recipe.missing.length <= 4 && (
                <Text style={styles.missing}>Ещё: {recipe.missing.join(", ")}</Text>
              )}
            </View>
          </Pressable>
        ))}
        {!loading && lastResults.length === 0 && pantry.length > 0 && (
          <Text style={styles.empty}>Нажмите «Обновить подборку», чтобы найти блюда.</Text>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  warn: { color: colors.terracotta, marginTop: 10 },
  empty: { color: colors.muted, marginTop: 20, textAlign: "center" },
  card: {
    flexDirection: "row",
    backgroundColor: colors.cream,
    borderRadius: radius.md,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  image: { width: 92, height: 92 },
  ph: { width: 92, height: 92, backgroundColor: colors.bgAlt },
  title: { fontWeight: "800", color: colors.ink, fontSize: 16, padding: 10, paddingBottom: 4 },
  meta: { color: colors.muted, paddingHorizontal: 10, fontSize: 12 },
  missing: { color: colors.terracotta, paddingHorizontal: 10, paddingTop: 4, paddingBottom: 10, fontSize: 12 },
});
