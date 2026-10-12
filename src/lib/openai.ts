import type { DetectedIngredient, Preferences } from "../types";

// Якщо підключиш свій домен, зміни адресу тут
const API_URL = "https://pantrychef-chi-seven.vercel.app/api/openai";

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