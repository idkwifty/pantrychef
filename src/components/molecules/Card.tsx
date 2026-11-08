import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { colors, radius, space } from "../../theme";

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({ card: { backgroundColor: colors.cream, borderRadius: radius.lg, padding: space.md, borderWidth: 1, borderColor: colors.line } });
