import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useResponsive } from "../../lib/responsive";
import { colors, space } from "../../theme";

export function Screen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { maxContent, pad } = useResponsive();
  return (
    <View style={[styles.screen, style]}>
      <View style={[styles.content, { maxWidth: maxContent, paddingHorizontal: pad }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, alignItems: "center" },
  content: { flex: 1, width: "100%", paddingTop: space.md },
});
