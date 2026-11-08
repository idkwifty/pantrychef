import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius } from "../../theme";

export function Chip({ label, selected, onPress, tone = "default" }: { label: string; selected?: boolean; onPress?: () => void; tone?: "default" | "warn" }) {
  return <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipOn, tone === "warn" && selected && styles.chipWarn]}><Text style={[styles.text, selected && styles.textOn]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  chip: { backgroundColor: colors.chip, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, marginRight: 8, marginBottom: 8 },
  chipOn: { backgroundColor: colors.forest }, chipWarn: { backgroundColor: colors.terracotta },
  text: { color: colors.ink, fontWeight: "600" }, textOn: { color: colors.white },
});
