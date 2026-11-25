import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Chip, PrimaryButton, Screen, Subtitle, Title } from "../../src/components";
import { useAppStore } from "../../src/store/useAppStore";
import { detectIngredients } from "../../src/lib/openai";
import { colors, radius, space } from "../../src/theme";
import type { DetectedIngredient } from "../../src/types";

export default function ScanScreen() {
  const addMany = useAppStore((s) => s.addMany);
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
      const base64 = await FileSystem.readAsStringAsync(photo, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const items = await detectIngredients(base64);
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
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 48 }}>
        <Title>Фото холодильника</Title>
        <Subtitle>
          Сфотографируйте холодильник или выберите снимок. OpenAI распознает продукты, и вы сможете добавить их в холодильник.
        </Subtitle>
        <View style={{ height: space.md }} />
        <PrimaryButton label="Снять фото" onPress={() => pick(true)} />
        <View style={{ height: 10 }} />
        <PrimaryButton label="Выбрать из галереи" onPress={() => pick(false)} />
        {photo && (
          <>
            <Image source={{ uri: photo }} style={styles.preview} />
            <PrimaryButton
              label={busy ? "Распознаём..." : "Распознать продукты"}
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
});
