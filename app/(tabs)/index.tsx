import { useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Chip, Field, PrimaryButton, Screen, Subtitle, Title } from "../../src/components/ui";
import { useAppStore } from "../../src/store/useAppStore";
import { colors, radius, space } from "../../src/theme";

// id: ключ перекладу, ru: назва, яка записується в сховище (на ній працює пошук)
const SUGGESTIONS = [
  { id: "eggs", ru: "яйца" },
  { id: "milk", ru: "молоко" },
  { id: "chicken", ru: "курица" },
  { id: "rice", ru: "рис" },
  { id: "potatoes", ru: "картофель" },
  { id: "onion", ru: "лук" },
  { id: "tomatoes", ru: "помидоры" },
  { id: "cheese", ru: "сыр" },
  { id: "pasta", ru: "паста" },
  { id: "garlic", ru: "чеснок" },
];

const ID_BY_RU = Object.fromEntries(SUGGESTIONS.map((s) => [s.ru, s.id]));

export default function PantryScreen() {
  const { t } = useTranslation();
  const pantry = useAppStore((s) => s.pantry);
  const addIngredient = useAppStore((s) => s.addIngredient);
  const removeIngredient = useAppStore((s) => s.removeIngredient);
  const clearPantry = useAppStore((s) => s.clearPantry);
  const [draft, setDraft] = useState("");

  function add(name: string) {
    addIngredient(name, "manual");
    setDraft("");
  }

  // Якщо продукт додано з готових кнопок, показуємо його перекладеним
  function displayName(name: string) {
    const id = ID_BY_RU[name];
    return id ? t(`products.items.${id}`) : name;
  }

  return (
    <Screen>
      <Title>{t("products.title")}</Title>
      <Subtitle>{t("products.subtitle")}</Subtitle>
      <View style={{ height: space.md }} />
      <Field
        value={draft}
        onChangeText={setDraft}
        placeholder={t("products.placeholder")}
        onSubmit={() => add(draft)}
      />
      <View style={{ height: 10 }} />
      <PrimaryButton label={t("products.add")} onPress={() => add(draft)} disabled={!draft.trim()} />
      <Text style={styles.hint}>{t("products.common")}</Text>
      <View style={styles.wrap}>
        {SUGGESTIONS.map((item) => (
          <Chip key={item.id} label={t(`products.items.${item.id}`)} onPress={() => add(item.ru)} />
        ))}
      </View>
      <View style={styles.row}>
        <Text style={styles.count}>{t("products.inFridge", { n: pantry.length })}</Text>
        {pantry.length > 0 && (
          <Pressable onPress={clearPantry}>
            <Text style={styles.clear}>{t("products.clear")}</Text>
          </Pressable>
        )}
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.wrap}>
          {pantry.map((item) => (
            <Chip
              key={item.id}
              label={`${item.source === "photo" ? "📷 " : ""}${displayName(item.name)}  ×`}
              selected
              onPress={() => removeIngredient(item.id)}
            />
          ))}
        </View>
        {pantry.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <PrimaryButton label={t("products.find")} onPress={() => router.push("/(tabs)/recipes")} />
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
