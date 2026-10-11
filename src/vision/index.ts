import * as FileSystem from "expo-file-system/legacy";
import type { ApiKeys, DetectedIngredient } from "../types";
import { canonicalName } from "../lib/normalize";

export type VisionAdapter = {
  id: string;
  label: string;
  ready: boolean;
  detectFromImage: (imageUri: string) => Promise<DetectedIngredient[]>;
};

class ManualFallbackAdapter implements VisionAdapter {
  id = "manual-fallback";
  label = "Пока без ИИ";
  ready = true;
  async detectFromImage(): Promise<DetectedIngredient[]> {
    return [];
  }
}

class OpenAiVisionAdapter implements VisionAdapter {
  id = "openai-vision";
  label = "OpenAI Vision";
  constructor(private key: string) {}
  get ready() {
    return Boolean(this.key.trim());
  }
  async detectFromImage(imageUri: string): Promise<DetectedIngredient[]> {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const mime = imageUri.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You identify grocery ingredients visible in a fridge or kitchen photo. Return JSON {\"items\":[{\"name\":\"...\",\"confidence\":0-1}]}. Use short Russian names. Only real edible ingredients, no utensils.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Какие продукты видны на фото холодильника?" },
              { type: "image_url", image_url: { url: `data:${mime};base64,${base64}` } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      throw new Error(`Vision API: ${res.status}`);
    }
    const json = await res.json();
    const text = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text) as { items?: { name: string; confidence?: number }[] };
    return (parsed.items ?? [])
      .map((item) => ({
        name: item.name.trim(),
        confidence: item.confidence ?? 0.7,
      }))
      .filter((item) => canonicalName(item.name));
  }
}

export function createVisionAdapter(keys: ApiKeys): VisionAdapter {
  if (keys.openai.trim()) {
    return new OpenAiVisionAdapter(keys.openai.trim());
  }
  return new ManualFallbackAdapter();
}

export const VISION_UPGRADE_NOTES = [
  "Сейчас можно вписывать продукты вручную.",
  "Экран «Скан» уже умеет снимать или выбирать фото.",
  "Чтобы ИИ распознал продукты, вставьте OpenAI API ключ в настройках.",
  "Позже сюда же можно подключить другой vision-провайдер: Gemini, Claude, облачный endpoint.",
];
