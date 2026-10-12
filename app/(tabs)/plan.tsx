import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Chip, PrimaryButton, Screen, Subtitle, Title } from "../../src/components/ui";
import { useAppStore } from "../../src/store/useAppStore";
import { generateMealPlan, type MealPlan } from "../../src/lib/openai";
import { colors, radius, space } from "../../src/theme";

export default function PlanScreen() {
  const { t, i18n } = useTranslation();
  const pantry = useAppStore((s) => s.pantry);
  const preferences = useAppStore((s) => s.preferences);
  const [days, setDays] = useState(1);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      const result = await generateMealPlan({
        pantry: pantry.map((p) => p.name),
        prefs: preferences,
        days,
        lang: i18n.language,
      });
      setPlan(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errors.generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Title>{t("plan.title")}</Title>
      <Subtitle>{t("plan.subtitle")}</Subtitle>
      <View style={{ height: space.md }} />

      <View style={styles.wrap}>
        <Chip label={t("plan.oneDay")} selected={days === 1} onPress={() => setDays(1)} />
        <Chip label={t("plan.week")} selected={days === 7} onPress={() => setDays(7)} />
      </View>
      <View style={{ height: 10 }} />
      <PrimaryButton
        label={loading ? t("plan.generating") : t("plan.generate")}
        onPress={run}
        disabled={loading}
      />

      {pantry.length === 0 && <Text style={styles.hint}>{t("plan.emptyPantryHint")}</Text>}
      {!!error && <Text style={styles.warn}>{error}</Text>}
      {loading && <ActivityIndicator style={{ marginTop: 16 }} color={colors.forest} />}

      <ScrollView contentContainerStyle={{ paddingVertical: 16, paddingBottom: 48 }}>
        {plan?.days.map((day, i) => (
          <View key={`${day.day}-${i}`} style={styles.dayCard}>
            <Text style={styles.dayTitle}>{day.day}</Text>
            {day.meals.map((meal, j) => (
              <View key={j} style={styles.meal}>
                <Text style={styles.mealType}>
                  {t(`plan.meals.${meal.type}`, { defaultValue: meal.type })}
                </Text>
                <Text style={styles.mealTitle}>{meal.title}</Text>
                <Text style={styles.mealText}>{meal.description}</Text>
                {meal.missing?.length > 0 && (
                  <Text style={styles.missing}>
                    {t("plan.missing", { list: meal.missing.join(", ") })}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}
        {plan && plan.shoppingList.length > 0 && (
          <View style={styles.dayCard}>
            <Text style={styles.dayTitle}>{t("plan.shopping")}</Text>
            <Text style={styles.mealText}>{plan.shoppingList.join(", ")}</Text>
          </View>
        )}
        {plan && <Text style={styles.disclaimer}>{t("plan.disclaimer")}</Text>}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap" },
  warn: { color: colors.terracotta, marginTop: 10 },
  hint: { color: colors.muted, marginTop: 10 },
  dayCard: {
    backgroundColor: colors.cream,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dayTitle: { fontWeight: "800", color: colors.ink, fontSize: 18, marginBottom: 8 },
  meal: { marginBottom: 12 },
  mealType: { color: colors.muted, fontWeight: "700", fontSize: 12, textTransform: "uppercase" },
  mealTitle: { color: colors.ink, fontWeight: "800", fontSize: 16, marginTop: 2 },
  mealText: { color: colors.muted, lineHeight: 20, marginTop: 2 },
  missing: { color: colors.terracotta, fontSize: 12, marginTop: 4 },
  disclaimer: { color: colors.muted, fontSize: 12, marginTop: 8, textAlign: "center" },
});