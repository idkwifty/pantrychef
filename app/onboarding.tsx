import { useMemo, useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Chip, Field, PrimaryButton, Title } from "../src/components/ui";
import {
  ALLERGY_OPTIONS,
  CUISINE_OPTIONS,
  DIET_OPTIONS,
  SPICE_OPTIONS,
  defaultPreferences,
} from "../src/types";
import type { Preferences } from "../src/types";
import { useAppStore } from "../src/store/useAppStore";
import { colors, radius, space } from "../src/theme";

const STEPS = ["Привет", "Аллергии", "Рацион", "Кухни", "Острота", "Не люблю"];

export default function Onboarding() {
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<Preferences>(defaultPreferences());
  const [dislikeDraft, setDislikeDraft] = useState("");

  const progress = useMemo(() => (step + 1) / STEPS.length, [step]);

  function toggle(list: string[], id: string) {
    return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      completeOnboarding(prefs);
      router.replace("/(tabs)");
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.stepLabel}>
        {step + 1} / {STEPS.length} · {STEPS[step]}
      </Text>
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <>
            <Text style={styles.emoji}>🥗</Text>
            <Title>PantryChef готовит из того, что уже есть</Title>
            <Text style={styles.lead}>
              Сначала коротко спросим про аллергии и вкус. Потом вы впишете продукты — или позже сфотографируете холодильник.
            </Text>
          </>
        )}
        {step === 1 && (
          <>
            <Title>Есть аллергии?</Title>
            <Text style={styles.lead}>Можно выбрать несколько или пропустить.</Text>
            <View style={styles.wrap}>
              {ALLERGY_OPTIONS.map((item) => (
                <Chip
                  key={item.id}
                  label={item.label}
                  selected={prefs.allergies.includes(item.id)}
                  tone="warn"
                  onPress={() => setPrefs({ ...prefs, allergies: toggle(prefs.allergies, item.id) })}
                />
              ))}
            </View>
          </>
        )}
        {step === 2 && (
          <>
            <Title>Какой рацион ближе?</Title>
            {DIET_OPTIONS.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setPrefs({ ...prefs, diet: item.id })}
                style={[styles.choice, prefs.diet === item.id && styles.choiceOn]}
              >
                <Text style={styles.choiceTitle}>{item.label}</Text>
                <Text style={styles.choiceHint}>{item.hint}</Text>
              </Pressable>
            ))}
          </>
        )}
        {step === 3 && (
          <>
            <Title>Какие кухни любите?</Title>
            <View style={styles.wrap}>
              {CUISINE_OPTIONS.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  selected={prefs.cuisines.includes(item)}
                  onPress={() => setPrefs({ ...prefs, cuisines: toggle(prefs.cuisines, item) })}
                />
              ))}
            </View>
          </>
        )}
        {step === 4 && (
          <>
            <Title>Острота</Title>
            {SPICE_OPTIONS.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setPrefs({ ...prefs, spice: item.id })}
                style={[styles.choice, prefs.spice === item.id && styles.choiceOn]}
              >
                <Text style={styles.choiceTitle}>{item.label}</Text>
              </Pressable>
            ))}
          </>
        )}
        {step === 5 && (
          <>
            <Title>Что лучше не предлагать?</Title>
            <Text style={styles.lead}>Например: кинза, грибы, печень.</Text>
            <Field
              value={dislikeDraft}
              onChangeText={setDislikeDraft}
              placeholder="Добавить продукт"
              onSubmit={() => {
                if (!dislikeDraft.trim()) return;
                setPrefs({ ...prefs, disliked: [...prefs.disliked, dislikeDraft.trim()] });
                setDislikeDraft("");
              }}
            />
            <View style={[styles.wrap, { marginTop: 12 }]}>
              {prefs.disliked.map((item) => (
                <Chip
                  key={item}
                  label={`✕ ${item}`}
                  selected
                  tone="warn"
                  onPress={() =>
                    setPrefs({ ...prefs, disliked: prefs.disliked.filter((x) => x !== item) })
                  }
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
      <View style={styles.footer}>
        {step > 0 ? (
          <Pressable onPress={() => setStep(step - 1)}>
            <Text style={styles.back}>Назад</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <View style={{ flex: 1, marginLeft: 16 }}>
          <PrimaryButton label={step === STEPS.length - 1 ? "К продуктам" : "Дальше"} onPress={next} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  progressTrack: {
    height: 6,
    backgroundColor: colors.bgAlt,
    marginHorizontal: space.lg,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: colors.leaf },
  stepLabel: {
    marginTop: 10,
    marginHorizontal: space.lg,
    color: colors.muted,
    fontWeight: "600",
  },
  body: { padding: space.lg, paddingBottom: 40 },
  emoji: { fontSize: 48, marginBottom: 12 },
  lead: { marginTop: 10, marginBottom: 18, fontSize: 16, lineHeight: 22, color: colors.muted },
  wrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  choice: {
    backgroundColor: colors.cream,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  choiceOn: { borderColor: colors.forest, backgroundColor: "#E7F0E8" },
  choiceTitle: { fontWeight: "700", color: colors.ink, fontSize: 16 },
  choiceHint: { color: colors.muted, marginTop: 4 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    padding: space.lg,
    paddingTop: 8,
  },
  back: { color: colors.forestSoft, fontWeight: "700", fontSize: 16 },
});
