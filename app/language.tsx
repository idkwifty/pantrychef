import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { PrimaryButton, Screen, Subtitle, Title } from "../src/components/ui";
import { colors, radius, space } from "../src/theme";
import { LANGUAGES, setLanguage } from "../i18n";

export default function LanguageScreen() {
  const { t, i18n } = useTranslation();

  async function next() {
    // зберігаємо вибір, навіть якщо користувач залишив мову, визначену автоматично
    await setLanguage(i18n.language);
    router.replace("/onboarding");
  }

  return (
    <Screen>
      <Title>{t("chooseLanguage.title")}</Title>
      <Subtitle>{t("chooseLanguage.subtitle")}</Subtitle>
      <View style={{ height: space.md }} />
      {LANGUAGES.map((lang) => {
        const active = i18n.language === lang.code;
        return (
          <Pressable
            key={lang.code}
            onPress={() => setLanguage(lang.code)}
            style={[styles.row, active && styles.rowActive]}
          >
            <Text style={[styles.label, active && { color: colors.forest }]}>{lang.label}</Text>
            {active && <Text style={{ color: colors.forest, fontWeight: "800" }}>✓</Text>}
          </Pressable>
        );
      })}
      <View style={{ height: space.md }} />
      <PrimaryButton label={t("chooseLanguage.continue")} onPress={next} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.cream,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rowActive: { borderColor: colors.forest, borderWidth: 2 },
  label: { fontWeight: "800", color: colors.ink },
});