import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../../src/theme";

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 18 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.ink,
        tabBarActiveTintColor: colors.forest,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.cream, borderTopColor: colors.line },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t("tabs.products"), tabBarIcon: () => <TabIcon emoji="🥬" /> }}
      />
      <Tabs.Screen
        name="recipes"
        options={{ title: t("tabs.recipes"), tabBarIcon: () => <TabIcon emoji="🍳" /> }}
      />
      <Tabs.Screen
        name="plan"
        options={{ title: t("tabs.plan"), tabBarIcon: () => <TabIcon emoji="🗓️" /> }}
      />
      <Tabs.Screen
        name="scan"
        options={{ title: t("tabs.scan"), tabBarIcon: () => <TabIcon emoji="📷" /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: t("tabs.settings"), tabBarIcon: () => <TabIcon emoji="⚙️" /> }}
      />
    </Tabs>
  );
}
