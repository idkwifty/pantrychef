import type {
  ApiKeys,
  NormalizedRecipe,
  Preferences,
  ProviderFlags,
  ProviderId,
  ScoredRecipe,
} from "../types";
import {
  ALLERGEN_CANONICAL,
  ANIMAL,
  FISH,
  HIGH_CARB,
  MEAT,
  canonicalName,
} from "../lib/normalize";
import { LOCAL_RECIPES } from "../data/localRecipes";

export type RecipeProvider = {
  id: ProviderId;
  label: string;
  needsKey: boolean;
  search: (ingredients: string[], keys: ApiKeys) => Promise<NormalizedRecipe[]>;
};

function ingredient(name: string) {
  return { name, canonical: canonicalName(name) };
}

export const localProvider: RecipeProvider = {
  id: "local",
  label: "Встроенные рецепты",
  needsKey: false,
  async search() {
    return LOCAL_RECIPES;
  },
};

export const mealDbProvider: RecipeProvider = {
  id: "mealdb",
  label: "TheMealDB",
  needsKey: false,
  async search(ingredients) {
    const queries = ingredients.slice(0, 4);
    const maps = await Promise.all(
      queries.map(async (item) => {
        const q = encodeURIComponent(canonicalName(item) || item);
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${q}`);
        if (!res.ok) return [] as { idMeal: string; strMeal: string; strMealThumb: string }[];
        const json = await res.json();
        return (json.meals ?? []) as { idMeal: string; strMeal: string; strMealThumb: string }[];
      })
    );
    const counts = new Map<string, { meal: { idMeal: string; strMeal: string; strMealThumb: string }; hits: number }>();
    for (const list of maps) {
      for (const meal of list) {
        const prev = counts.get(meal.idMeal);
        counts.set(meal.idMeal, { meal, hits: (prev?.hits ?? 0) + 1 });
      }
    }
    const ranked = [...counts.values()].sort((a, b) => b.hits - a.hits).slice(0, 12);
    const details = await Promise.all(
      ranked.map(async ({ meal }) => {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
        if (!res.ok) return null;
        const json = await res.json();
        const row = json.meals?.[0];
        if (!row) return null;
        const ingredients = [];
        for (let i = 1; i <= 20; i += 1) {
          const name = String(row[`strIngredient${i}`] ?? "").trim();
          if (name) ingredients.push(ingredient(name));
        }
        const recipe: NormalizedRecipe = {
          id: `mealdb:${row.idMeal}`,
          provider: "mealdb",
          title: row.strMeal,
          image: row.strMealThumb,
          sourceUrl: row.strSource || `https://www.themealdb.com/meal/${row.idMeal}`,
          cuisine: row.strArea,
          category: row.strCategory,
          instructions: row.strInstructions,
          ingredients,
        };
        return recipe;
      })
    );
    return details.filter((item): item is NormalizedRecipe => Boolean(item));
  },
};

export const spoonacularProvider: RecipeProvider = {
  id: "spoonacular",
  label: "Spoonacular",
  needsKey: true,
  async search(ingredients, keys) {
    if (!keys.spoonacular.trim()) return [];
    const q = encodeURIComponent(ingredients.join(","));
    const res = await fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${q}&number=12&ranking=2&ignorePantry=true&apiKey=${encodeURIComponent(keys.spoonacular)}`
    );
    if (!res.ok) throw new Error(`Spoonacular: ${res.status}`);
    const list = (await res.json()) as Array<{
      id: number;
      title: string;
      image?: string;
      usedIngredients?: { name: string }[];
      missedIngredients?: { name: string }[];
    }>;
    return list.map((row) => ({
      id: `spoonacular:${row.id}`,
      provider: "spoonacular" as const,
      title: row.title,
      image: row.image,
      sourceUrl: `https://spoonacular.com/recipes/${row.id}`,
      ingredients: [...(row.usedIngredients ?? []), ...(row.missedIngredients ?? [])].map((item) =>
        ingredient(item.name)
      ),
    }));
  },
};

export const edamamProvider: RecipeProvider = {
  id: "edamam",
  label: "Edamam",
  needsKey: true,
  async search(ingredients, keys) {
    if (!keys.edamamId.trim() || !keys.edamamKey.trim()) return [];
    const q = encodeURIComponent(ingredients.slice(0, 6).join(" "));
    const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${q}&app_id=${encodeURIComponent(keys.edamamId)}&app_key=${encodeURIComponent(keys.edamamKey)}`;
    const res = await fetch(url, { headers: { "Edamam-Account-User": keys.edamamId } });
    if (!res.ok) throw new Error(`Edamam: ${res.status}`);
    const json = (await res.json()) as {
      hits?: { recipe: { uri: string; label: string; image?: string; url?: string; ingredientLines?: string[]; cuisineType?: string[]; totalTime?: number } }[];
    };
    return (json.hits ?? []).slice(0, 12).map((hit) => {
      const id = hit.recipe.uri.split("_").pop() ?? hit.recipe.uri;
      return {
        id: `edamam:${id}`,
        provider: "edamam" as const,
        title: hit.recipe.label,
        image: hit.recipe.image,
        sourceUrl: hit.recipe.url,
        cuisine: hit.recipe.cuisineType?.[0],
        minutes: hit.recipe.totalTime || undefined,
        ingredients: (hit.recipe.ingredientLines ?? []).map((line) => ingredient(line)),
      };
    });
  },
};

export const PROVIDERS: RecipeProvider[] = [
  localProvider,
  mealDbProvider,
  spoonacularProvider,
  edamamProvider,
];

export function scoreRecipes(
  recipes: NormalizedRecipe[],
  pantryNames: string[],
  prefs: Preferences
): ScoredRecipe[] {
  const pantry = new Set(pantryNames.map(canonicalName).filter(Boolean));
  const disliked = new Set(prefs.disliked.map(canonicalName).filter(Boolean));
  const allergenSet = new Set(
    prefs.allergies.flatMap((id) => ALLERGEN_CANONICAL[id] ?? [])
  );

  return recipes
    .map((recipe) => {
      const canons = recipe.ingredients.map((item) => item.canonical).filter(Boolean);
      const unique = [...new Set(canons)];
      const blockedReason = blockReason(unique, allergenSet, disliked, prefs);
      const matched = unique.filter((item) => pantry.has(item));
      const missing = unique.filter((item) => !pantry.has(item) && !["salt", "oil", "black pepper"].includes(item));
      let score = matched.length * 12 - missing.length * 4;
      if (recipe.cuisine && prefs.cuisines.some((c) => recipe.cuisine!.toLowerCase().includes(c.toLowerCase()))) {
        score += 8;
      }
      if (prefs.spice === "none" && /chili|spicy|остр/i.test(`${recipe.title} ${recipe.instructions ?? ""}`)) {
        score -= 6;
      }
      return { ...recipe, score, matched, missing, blockedReason };
    })
    .filter((recipe) => !recipe.blockedReason)
    .filter((recipe) => recipe.matched.length > 0)
    .sort((a, b) => b.score - a.score);
}

function blockReason(
  ingredients: string[],
  allergens: Set<string>,
  disliked: Set<string>,
  prefs: Preferences
): string | undefined {
  if (ingredients.some((item) => allergens.has(item))) return "аллерген";
  if (ingredients.some((item) => disliked.has(item))) return "нелюбимый продукт";
  if (prefs.diet === "vegetarian" && ingredients.some((item) => [...MEAT, ...FISH, "shrimp"].includes(item))) {
    return "не вегетарианское";
  }
  if (prefs.diet === "vegan" && ingredients.some((item) => ANIMAL.includes(item))) return "не веганское";
  if (prefs.diet === "pescatarian" && ingredients.some((item) => MEAT.includes(item))) return "есть мясо";
  if (prefs.diet === "keto" && ingredients.some((item) => HIGH_CARB.includes(item))) return "много углеводов";
  if (prefs.diet === "halal" && ingredients.some((item) => ["pork"].includes(item))) return "не халяль";
  return undefined;
}

export async function searchAllProviders(
  ingredients: string[],
  flags: ProviderFlags,
  keys: ApiKeys
): Promise<{ recipes: NormalizedRecipe[]; errors: string[] }> {
  const errors: string[] = [];
  const enabled = PROVIDERS.filter((provider) => flags[provider.id]);
  const chunks = await Promise.all(
    enabled.map(async (provider) => {
      try {
        return await provider.search(ingredients, keys);
      } catch (error) {
        errors.push(`${provider.label}: ${error instanceof Error ? error.message : "ошибка"}`);
        return [] as NormalizedRecipe[];
      }
    })
  );
  const seen = new Set<string>();
  const recipes: NormalizedRecipe[] = [];
  for (const list of chunks) {
    for (const recipe of list) {
      const key = `${recipe.provider}:${recipe.title.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      recipes.push(recipe);
    }
  }
  return { recipes, errors };
}
