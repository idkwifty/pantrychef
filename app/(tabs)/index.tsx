import { useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Chip, Field, PrimaryButton, Screen, Subtitle, Title } from "../../src/components/ui";
import { useAppStore } from "../../src/store/useAppStore";
import { colors, radius, space } from "../../src/theme";

const SUGGESTIONS = ["яйца", "молоко", "курица", "рис", "картофель", "лук", "помидоры", "сыр", "паста", "чеснок"];

export default function PantryScreen() {
  const pantry = useAppStore((s) => s.pantry);
  const addIngredient = useAppStore((s) => s.addIngredient);
  const removeIngredient = useAppStore((s) => s.removeIngredient);
  const clearPantry = useAppStore((s) => s.clearPantry);
  const [draft, setDraft] = useState("");

  function add(name: string) {
    addIngredient(name, "manual");
    setDraft("");
  }

  return (
    <Screen>
      <Title>Что есть дома?</Title>
      <Subtitle>Впишите продукты — подберём блюда. Фото холодильника подключится на вкладке «Скан».</Subtitle>
      <View style={{ height: space.md }} />
      <Field
        value={draft}
        onChangeText={setDraft}
        placeholder="Например: яйца, рис, лук"
        onSubmit={() => add(draft)}
      />
      <View style={{ height: 10 }} />
      <PrimaryButton label="Добавить" onPress={() => add(draft)} disabled={!draft.trim()} />
      <Text style={styles.hint}>Часто берут:</Text>
      <View style={styles.wrap}>
        {SUGGESTIONS.map((item) => (
          <Chip key={item} label={item} onPress={() => add(item)} />
        ))}
      </View>
      <View style={styles.row}>
        <Text style={styles.count}>В холодильнике: {pantry.length}</Text>
        {pantry.length > 0 && (
          <Pressable onPress={clearPantry}>
            <Text style={styles.clear}>Очистить</Text>
          </Pressable>
        )}
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.wrap}>
          {pantry.map((item) => (
            <Chip
              key={item.id}
              label={`${item.source === "photo" ? "📷 " : ""}${item.name}  ×`}
              selected
              onPress={() => removeIngredient(item.id)}
            />
          ))}
        </View>
        {pantry.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <PrimaryButton label="Подобрать блюда" onPress={() => router.push("/(tabs)/recipes")} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { marginTop: 18, marginBottom: 8, color: colors.muted, fontWeight: "600" },
  wrap: { flexDirection: "row", flexWrap: "wrap" },
  row: { flexDirection: "row", justifyContent: "space-between", marginVertical: 12 },
  count: { fontWeight: "700", color: colors.ink },
  clear: { color: colors.terracotta, fontWeight: "700" },
  badge: {
    backgroundColor: colors.bgAlt,
    padding: 8,
    borderRadius: radius.sm,
  },
});
