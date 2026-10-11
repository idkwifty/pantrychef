import { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../src/components/ui";
import { useAppStore } from "../../src/store/useAppStore";
import { colors, radius, space } from "../../src/theme";

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lastResults = useAppStore((s) => s.lastResults);
  const recipe = useMemo(
    () => lastResults.find((item) => item.id === decodeURIComponent(id ?? "")),
    [id, lastResults]
  );

  if (!recipe) {
    return (
      <Screen>
        <Text style={styles.missing}>Рецепт не найден. Вернитесь к списку и обновите подборку.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        {recipe.image ? <Image source={{ uri: recipe.image }} style={styles.hero} /> : null}
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.meta}>
          {recipe.provider}
          {recipe.cuisine ? ` · ${recipe.cuisine}` : ""}
          {recipe.minutes ? ` · ${recipe.minutes} мин` : ""}
        </Text>
        <View style={styles.pills}>
          <Text style={styles.good}>Есть: {recipe.matched.join(", ") || "—"}</Text>
          {recipe.missing.length > 0 && (
            <Text style={styles.bad}>Не хватает: {recipe.missing.join(", ")}</Text>
          )}
        </View>
        <Text style={styles.h}>Ингредиенты</Text>
        {recipe.ingredients.map((item, index) => (
          <Text key={`${item.canonical}-${index}`} style={styles.line}>
            • {item.name}
          </Text>
        ))}
        {recipe.instructions ? (
          <>
            <Text style={styles.h}>Как готовить</Text>
            <Text style={styles.body}>{recipe.instructions}</Text>
          </>
        ) : null}
        {recipe.sourceUrl ? <Text style={styles.source}>Источник: {recipe.sourceUrl}</Text> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  missing: { color: colors.muted, marginTop: space.lg },
  hero: { width: "100%", height: 220, borderRadius: radius.lg, marginBottom: 16, backgroundColor: colors.bgAlt },
  title: { fontSize: 26, fontWeight: "800", color: colors.ink },
  meta: { marginTop: 6, color: colors.muted, fontWeight: "600" },
  pills: { marginTop: 14 },
  good: { color: colors.forestSoft, fontWeight: "700", marginBottom: 6 },
  bad: { color: colors.terracotta, fontWeight: "700" },
  h: { marginTop: 22, marginBottom: 8, fontSize: 18, fontWeight: "800", color: colors.ink },
  line: { color: colors.ink, marginBottom: 4, lineHeight: 22 },
  body: { color: colors.ink, lineHeight: 24, fontSize: 16 },
  source: { marginTop: 20, color: colors.muted, fontSize: 12 },
});
