import { StyleSheet, TextInput } from "react-native";
import { colors, radius } from "../../theme";

export function Field({ value, onChangeText, placeholder, onSubmit }: { value: string; onChangeText: (value: string) => void; placeholder: string; onSubmit?: () => void }) {
  return <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} onSubmitEditing={onSubmit} style={styles.input} returnKeyType="done" />;
}

const styles = StyleSheet.create({ input: { backgroundColor: colors.cream, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.ink } });
