import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAppStore } from "../src/store/useAppStore";
import { colors } from "../src/theme";
import { hasChosenLanguage } from "../i18n";

export default function Gate() {
  const onboarded = useAppStore((s) => s.preferences.onboarded);
  const [hydrated, setHydrated] = useState(useAppStore.persist.hasHydrated());
  const [langChecked, setLangChecked] = useState(false);
  const [langChosen, setLangChosen] = useState(false);

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useAppStore.persist.hasHydrated());
    return unsub;
  }, []);

  useEffect(() => {
    hasChosenLanguage().then((chosen) => {
      setLangChosen(chosen);
      setLangChecked(true);
    });
  }, []);

  console.log("Gate:", { hydrated, langChecked, langChosen, onboarded });

  if (!hydrated || !langChecked) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.forest} />
      </View>
    );
  }

  if (!onboarded && !langChosen) return <Redirect href="/language" />;
  if (!onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
