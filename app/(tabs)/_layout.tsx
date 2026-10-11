import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "../../src/theme";

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 18 }}>{emoji}</Text>;
}

export default function TabsLayout() {
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
        options={{ title: "Продукты", tabBarIcon: () => <TabIcon emoji="🥬" /> }}
      />
      <Tabs.Screen
        name="recipes"
        options={{ title: "Блюда", tabBarIcon: () => <TabIcon emoji="🍳" /> }}
      />
      <Tabs.Screen
        name="scan"
        options={{ title: "Скан", tabBarIcon: () => <TabIcon emoji="📷" /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: "Настройки", tabBarIcon: () => <TabIcon emoji="⚙️" /> }}
      />
    </Tabs>
  );
}
