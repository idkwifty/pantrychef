import type { ApiKeys, NormalizedRecipe, ProviderId } from "../types";
import { canonicalName } from "../lib/normalize";

/**
 * Шаблон своего API. Скопируйте search() в src/providers/index.ts,
 * добавьте объект в массив PROVIDERS — и он сразу попадёт в настройки и подбор блюд.
 */
export async function searchCustomApi(
  ingredients: string[],
  keys: ApiKeys
): Promise<NormalizedRecipe[]> {
  const res = await fetch(
    "https://example.com/recipes?ingredients=" + encodeURIComponent(ingredients.join(",")),
    { headers: { Authorization: `Bearer ${keys.spoonacular || ""}` } }
  );
  if (!res.ok) throw new Error(`Мой API: ${res.status}`);
  const json = (await res.json()) as {
    recipes: { id: string; title: string; image?: string; url?: string; ingredients: string[]; steps?: string }[];
  };
  const provider: ProviderId = "custom";
  return json.recipes.map((row) => ({
    id: `${provider}:${row.id}`,
    provider,
    title: row.title,
    image: row.image,
    sourceUrl: row.url,
    instructions: row.steps,
    ingredients: row.ingredients.map((name) => ({ name, canonical: canonicalName(name) })),
  }));
}
