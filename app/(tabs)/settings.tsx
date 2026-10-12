import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { GhostButton, Screen, Subtitle, Title } from "../../src/components/ui";
import { PROVIDERS } from "../../src/providers";
import { useAppStore } from "../../src/store/useAppStore";
import { colors, radius, space } from "../../src/theme";
import { LANGUAGES, setLanguage } from "../../i18n";

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const providers = useAppStore((s) => s.providers);
  const setProviders = useAppStore((s) => s.setProviders);
  const apiKeys = useAppStore((s) => s.apiKeys);
  const setApiKeys = useAppStore((s) => s.setApiKeys);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);
  const preferences = useAppStore((s) => s.preferences);
  const [showKeys, setShowKeys] = useState(false);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
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

        <Text style={styles.section}>{t("settings.sources")}</Text>
        <Subtitle>{t("settings.sourcesHint")}</Subtitle>
        <View style={{ height: space.md }} />
        {PROVIDERS.map((provider) => (
          <View key={provider.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>
                {t(`providers.${provider.id}`, { defaultValue: provider.label })}
              </Text>
              <Text style={styles.rowHint}>
                {provider.needsKey ? t("settings.needsKey") : t("settings.worksNow")}
              </Text>
            </View>
            <Switch
              value={providers[provider.id]}
              onValueChange={(value) => setProviders({ [provider.id]: value })}
              trackColor={{ true: colors.leaf }}
            />
          </View>
        ))}

        <Text style={styles.section}>{t("settings.apiKeys")}</Text>
        <Pressable onPress={() => setShowKeys(!showKeys)}>
          <Text style={styles.link}>{showKeys ? t("settings.hideKeys") : t("settings.showKeys")}</Text>
        </Pressable>
        {showKeys && (
          <>
            <Labeled value={apiKeys.spoonacular} onChange={(spoonacular) => setApiKeys({ spoonacular })} label="Spoonacular API key" />
            <Labeled value={apiKeys.edamamId} onChange={(edamamId) => setApiKeys({ edamamId })} label="Edamam App ID" />
            <Labeled value={apiKeys.edamamKey} onChange={(edamamKey) => setApiKeys({ edamamKey })} label="Edamam App Key" />
            <Labeled value={apiKeys.openai} onChange={(openai) => setApiKeys({ openai })} label={t("settings.openaiKey")} />
          </>
        )}

        <Text style={styles.section}>{t("settings.profile")}</Text>
        <Text style={styles.body}>
          {t("settings.profileSummary", {
            diet: preferences.diet,
            allergies: preferences.allergies.length || t("settings.none"),
            spice: preferences.spice,
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

function Labeled({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        placeholder={t("settings.pasteKey")}
        placeholderTextColor={colors.muted}
        style={styles.input}
      />
    </View>
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
