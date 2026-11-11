import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { GhostButton, Screen, Title } from "../../src/components";
import { useAppStore } from "../../src/store/useAppStore";
import { colors, radius, space } from "../../src/theme";
import { LANGUAGES, setLanguage } from "../../i18n";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);
  const preferences = useAppStore((s) => s.preferences);

  return (
    <Screen>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 48 }}>
        <Title>{t("settings.language")}</Title>
        <View style={{ height: space.md }} />
        {LANGUAGES.map((lang) => {
          const active = i18n.language === lang.code;
          return (
            <Pressable
              key={lang.code}
              onPress={() => setLanguage(lang.code)}
              style={[styles.langRow, active && styles.langRowActive]}
            >
              <Text style={[styles.rowTitle, active && { color: colors.forest }]}>{lang.label}</Text>
              {active && <Text style={{ color: colors.forest, fontWeight: "800" }}>✓</Text>}
            </Pressable>
          );
        })}

        <Text style={styles.section}>{t("settings.profile")}</Text>
        <Text style={styles.body}>
          {t("settings.profileSummary", {
            diet: t(`onboarding.diets.${preferences.diet}`),
            allergies: preferences.allergies.length || t("settings.none"),
            spice: t(`onboarding.spice.${preferences.spice}`),
          })}
        </Text>
        <GhostButton
          label={t("settings.retake")}
          onPress={() => {
            resetOnboarding();
            router.replace("/onboarding");
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cream,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  langRow: {
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
  langRowActive: { borderColor: colors.forest, borderWidth: 2 },
  rowTitle: { fontWeight: "800", color: colors.ink },
  rowHint: { color: colors.muted, marginTop: 2 },
  section: { marginTop: 22, marginBottom: 8, fontSize: 18, fontWeight: "800", color: colors.ink },
  link: { color: colors.forestSoft, fontWeight: "700", marginBottom: 8 },
  body: { color: colors.muted, lineHeight: 20, marginBottom: 8 },
  fieldLabel: { color: colors.muted, marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.ink,
  },
});
