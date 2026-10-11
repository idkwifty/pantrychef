import { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { colors, radius, space } from "../theme";

export function Screen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.primary, disabled && styles.disabled]}
    >
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.ghost}>
      <Text style={styles.ghostText}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  tone = "default",
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: "default" | "warn";
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected && styles.chipOn,
        tone === "warn" && selected && styles.chipWarn,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  value,
  onChangeText,
  placeholder,
  onSubmit,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  onSubmit?: () => void;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      onSubmitEditing={onSubmit}
      style={styles.input}
      returnKeyType="done"
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: space.lg,
    paddingTop: space.md,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 22,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.cream,
    borderRadius: radius.lg,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  primary: {
    backgroundColor: colors.forest,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
  },
  disabled: { opacity: 0.45 },
  ghost: {
    paddingVertical: 12,
    alignItems: "center",
  },
  ghostText: { color: colors.forestSoft, fontWeight: "700" },
  chip: {
    backgroundColor: colors.chip,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    marginRight: 8,
    marginBottom: 8,
  },
  chipOn: { backgroundColor: colors.forest },
  chipWarn: { backgroundColor: colors.terracotta },
  chipText: { color: colors.ink, fontWeight: "600" },
  chipTextOn: { color: colors.white },
  input: {
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
  },
});
