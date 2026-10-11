import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAppStore } from "../src/store/useAppStore";
import { colors } from "../src/theme";

export default function Gate() {
  const onboarded = useAppStore((s) => s.preferences.onboarded);
  const [hydrated, setHydrated] = useState(useAppStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useAppStore.persist.hasHydrated());
    return unsub;
  }, []);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.forest} />
      </View>
    );
  }

  if (!onboarded) return <Redirect href="/onboarding" />;
  return <Redirect href="/(tabs)" />;
}
