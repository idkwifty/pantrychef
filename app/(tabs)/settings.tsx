import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { GhostButton, Screen, Subtitle, Title } from "../../src/components/ui";
import { PROVIDERS } from "../../src/providers";
import { useAppStore } from "../../src/store/useAppStore";
import { colors, radius, space } from "../../src/theme";

export default function SettingsScreen() {
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
        <Title>Источники рецептов</Title>
        <Subtitle>Включайте любые API. Без ключей работают встроенные рецепты и TheMealDB.</Subtitle>
        <View style={{ height: space.md }} />
        {PROVIDERS.map((provider) => (
          <View key={provider.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{provider.label}</Text>
              <Text style={styles.rowHint}>{provider.needsKey ? "Нужен API-ключ" : "Работает сразу"}</Text>
            </View>
            <Switch
              value={providers[provider.id]}
              onValueChange={(value) => setProviders({ [provider.id]: value })}
              trackColor={{ true: colors.leaf }}
            />
          </View>
        ))}

        <Text style={styles.section}>Ключи API</Text>
        <Pressable onPress={() => setShowKeys(!showKeys)}>
          <Text style={styles.link}>{showKeys ? "Скрыть ключи" : "Показать поля ключей"}</Text>
        </Pressable>
        {showKeys && (
          <>
            <Labeled value={apiKeys.spoonacular} onChange={(spoonacular) => setApiKeys({ spoonacular })} label="Spoonacular API key" />
            <Labeled value={apiKeys.edamamId} onChange={(edamamId) => setApiKeys({ edamamId })} label="Edamam App ID" />
            <Labeled value={apiKeys.edamamKey} onChange={(edamamKey) => setApiKeys({ edamamKey })} label="Edamam App Key" />
            <Labeled value={apiKeys.openai} onChange={(openai) => setApiKeys({ openai })} label="OpenAI key для фото холодильника" />
          </>
        )}

        <Text style={styles.section}>Ваш профиль</Text>
        <Text style={styles.body}>
          Рацион: {preferences.diet}. Аллергии: {preferences.allergies.length || "нет"}. Острота: {preferences.spice}.
        </Text>
        <GhostButton
          label="Пройти опросник заново"
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
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        placeholder="вставьте ключ"
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
