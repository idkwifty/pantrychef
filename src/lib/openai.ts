import type { DetectedIngredient, NormalizedRecipe, Preferences } from "../types";
import { canonicalName } from "./normalize";

// Якщо підключиш свій домен, зміни адресу тут
const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://pantrychef-chi-seven.vercel.app/api/openai";

async function callProxy(body: unknown) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  return res.json();
}

export async function detectIngredients(base64: string): Promise<DetectedIngredient[]> {
  const data = await callProxy({ kind: "detect", image: base64 });
  return Array.isArray(data.items) ? data.items : [];
}

export type PlanMeal = {
  type: "breakfast" | "lunch" | "dinner" | "snack";
  title: string;
  description: string;
  ingredients: string[];
  missing: string[];
  minutes?: number;
};
export type PlanDay = { day: string; meals: PlanMeal[] };
export type MealPlan = { days: PlanDay[]; shoppingList: string[] };

export async function generateMealPlan(opts: {
  pantry: string[];
  prefs: Preferences;
  days: number;
  lang: string;
}): Promise<MealPlan> {
  const data = await callProxy({ kind: "plan", ...opts });
  return {
    days: Array.isArray(data.days) ? data.days : [],
    shoppingList: Array.isArray(data.shoppingList) ? data.shoppingList : [],
  };
}

export async function generateRecipes(opts: {
  pantry: string[];
  prefs: Preferences;
  lang: string;
}): Promise<NormalizedRecipe[]> {
  const data = await callProxy({ kind: "recipes", ...opts });
  if (!Array.isArray(data.recipes)) return [];
  return data.recipes
    .filter((row: any) => row && typeof row.title === "string" && Array.isArray(row.ingredients))
    .map((row: any, index: number) => ({
      id: `ai:${Date.now()}-${index}`,
      provider: "ai" as const,
      title: String(row.title).slice(0, 120),
      cuisine: typeof row.cuisine === "string" ? row.cuisine.slice(0, 60) : undefined,
      instructions: typeof row.instructions === "string" ? row.instructions.slice(0, 4000) : undefined,
      minutes: Number.isFinite(row.minutes) ? Math.max(1, Math.round(row.minutes)) : undefined,
      ingredients: row.ingredients
        .filter((name: unknown) => typeof name === "string")
        .slice(0, 30)
        .map((name: string) => ({ name: name.slice(0, 100), canonical: canonicalName(name) })),
    }));
}
