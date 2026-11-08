import { ReactNode } from "react";
import { StyleSheet, Text } from "react-native";
import { colors } from "../../theme";

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: colors.ink, letterSpacing: -0.4 },
  subtitle: { marginTop: 8, fontSize: 16, lineHeight: 22, color: colors.muted },
});
