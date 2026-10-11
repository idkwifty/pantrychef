import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Chip, PrimaryButton, Screen, Subtitle, Title } from "../../src/components/ui";
import { useAppStore } from "../../src/store/useAppStore";
import { createVisionAdapter, VISION_UPGRADE_NOTES } from "../../src/vision";
import { colors, radius, space } from "../../src/theme";
import type { DetectedIngredient } from "../../src/types";

export default function ScanScreen() {
  const apiKeys = useAppStore((s) => s.apiKeys);
  const addMany = useAppStore((s) => s.addMany);
  const adapter = createVisionAdapter(apiKeys);
  const [photo, setPhoto] = useState<string | null>(null);
  const [detected, setDetected] = useState<DetectedIngredient[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(fromCamera: boolean) {
    setError("");
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Нет доступа к камере или галерее.");
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ["images"] });
    if (result.canceled || !result.assets[0]) return;
    setPhoto(result.assets[0].uri);
    setDetected([]);
  }

  async function analyze() {
    if (!photo) return;
    setBusy(true);
    setError("");
    try {
      if (!apiKeys.openai.trim()) {
        setError("ИИ ещё не подключён. Добавьте OpenAI ключ в настройках — или впишите продукты вручную.");
        setDetected([]);
        return;
      }
      const items = await adapter.detectFromImage(photo);
      setDetected(items);
      if (!items.length) setError("На фото ничего не распозналось. Добавьте продукты вручную.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось разобрать фото");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        <Title>Фото холодильника</Title>
        <Subtitle>
          Сейчас основной ввод — текстом. Этот экран уже готов к апгрейду: снимок уходит в VisionAdapter, и продукты попадают в тот же холодильник.
        </Subtitle>
        <View style={{ height: space.md }} />
        <PrimaryButton label="Снять фото" onPress={() => pick(true)} />
        <View style={{ height: 10 }} />
        <PrimaryButton label="Выбрать из галереи" onPress={() => pick(false)} />
        {photo && (
          <>
            <Image source={{ uri: photo }} style={styles.preview} />
            <PrimaryButton
              label={busy ? "Распознаём..." : adapter.ready ? "Распознать продукты" : "ИИ не настроен"}
              onPress={analyze}
              disabled={busy}
            />
          </>
        )}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.wrap}>
          {detected.map((item) => (
            <Chip key={item.name} label={`${item.name} · ${Math.round(item.confidence * 100)}%`} selected />
          ))}
        </View>
        {detected.length > 0 && (
          <PrimaryButton
            label="Добавить всё в холодильник"
            onPress={() => {
              addMany(
                detected.map((item) => item.name),
                "photo"
              );
              setDetected([]);
            }}
          />
        )}
        <View style={styles.note}>
          <Text style={styles.noteTitle}>Как потом включить ИИ</Text>
          {VISION_UPGRADE_NOTES.map((line) => (
            <Text key={line} style={styles.noteLine}>
              • {line}
            </Text>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: "100%",
    height: 220,
    borderRadius: radius.md,
    marginVertical: 14,
    backgroundColor: colors.bgAlt,
  },
  error: { color: colors.terracotta, marginVertical: 10 },
  wrap: { flexDirection: "row", flexWrap: "wrap", marginVertical: 12 },
  note: {
    marginTop: 18,
    backgroundColor: colors.cream,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  noteTitle: { fontWeight: "800", marginBottom: 8, color: colors.ink },
  noteLine: { color: colors.muted, marginBottom: 6, lineHeight: 20 },
});
