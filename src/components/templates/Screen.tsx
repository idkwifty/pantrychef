import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors, space } from "../../theme";

export function Screen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: space.lg, paddingTop: space.md } });
