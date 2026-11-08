import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius } from "../../theme";

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable onPress={onPress} disabled={disabled} style={[styles.primary, disabled && styles.disabled]}><Text style={styles.primaryText}>{label}</Text></Pressable>;
}

export function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.ghost}><Text style={styles.ghostText}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  primary: { backgroundColor: colors.forest, borderRadius: radius.md, paddingVertical: 14, alignItems: "center" },
  primaryText: { color: colors.white, fontWeight: "700", fontSize: 16 },
  disabled: { opacity: 0.45 },
  ghost: { paddingVertical: 12, alignItems: "center" },
  ghostText: { color: colors.forestSoft, fontWeight: "700" },
});
