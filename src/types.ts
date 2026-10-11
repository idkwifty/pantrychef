export type Diet =
  | "none"
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "keto"
  | "halal";

export type SpiceLevel = "none" | "mild" | "medium" | "hot";

export type IngredientSource = "manual" | "photo";

export type Preferences = {
  onboarded: boolean;
  allergies: string[];
  diet: Diet;
  cuisines: string[];
  spice: SpiceLevel;
  disliked: string[];
};

export type PantryItem = {
  id: string;
  name: string;
  source: IngredientSource;
  addedAt: number;
};

export type ProviderId = "local" | "mealdb" | "spoonacular" | "edamam" | "custom";

export type ProviderFlags = Record<ProviderId, boolean>;

export type ApiKeys = {
  spoonacular: string;
  edamamId: string;
  edamamKey: string;
  openai: string;
};

export type NormalizedIngredient = {
  name: string;
  canonical: string;
};

export type NormalizedRecipe = {
  id: string;
  provider: ProviderId;
  title: string;
  image?: string;
  sourceUrl?: string;
  cuisine?: string;
  category?: string;
  instructions?: string;
  ingredients: NormalizedIngredient[];
  minutes?: number;
};

export type ScoredRecipe = NormalizedRecipe & {
  score: number;
  matched: string[];
  missing: string[];
  blockedReason?: string;
};

export type DetectedIngredient = {
  name: string;
  confidence: number;
  notes?: string;
};

export const ALLERGY_OPTIONS = [
  { id: "milk", label: "Молоко / лактоза" },
  { id: "eggs", label: "Яйца" },
  { id: "gluten", label: "Глютен" },
  { id: "peanuts", label: "Арахис" },
  { id: "tree-nuts", label: "Орехи" },
  { id: "soy", label: "Соя" },
  { id: "fish", label: "Рыба" },
  { id: "shellfish", label: "Морепродукты" },
  { id: "sesame", label: "Кунжут" },
] as const;

export const DIET_OPTIONS: { id: Diet; label: string; hint: string }[] = [
  { id: "none", label: "Без ограничений", hint: "Ем почти всё" },
  { id: "vegetarian", label: "Вегетарианство", hint: "Без мяса и рыбы" },
  { id: "vegan", label: "Веганство", hint: "Без продуктов животного происхождения" },
  { id: "pescatarian", label: "Пескетарианство", hint: "Рыба можно, мясо нет" },
  { id: "keto", label: "Кето", hint: "Мало углеводов" },
  { id: "halal", label: "Халяль", hint: "Без свинины и алкоголя" },
];

export const CUISINE_OPTIONS = [
  "домашняя",
  "итальянская",
  "азиатская",
  "средиземноморская",
  "мексиканская",
  "восточная",
  "американская",
  "французская",
];

export const SPICE_OPTIONS: { id: SpiceLevel; label: string }[] = [
  { id: "none", label: "Без острого" },
  { id: "mild", label: "Чуть-чуть" },
  { id: "medium", label: "Средне" },
  { id: "hot", label: "Остро" },
];

export const defaultPreferences = (): Preferences => ({
  onboarded: false,
  allergies: [],
  diet: "none",
  cuisines: ["домашняя"],
  spice: "mild",
  disliked: [],
});

export const defaultProviderFlags = (): ProviderFlags => ({
  local: true,
  mealdb: true,
  spoonacular: false,
  edamam: false,
  custom: false,
});

export const defaultApiKeys = (): ApiKeys => ({
  spoonacular: "",
  edamamId: "",
  edamamKey: "",
  openai: "",
});
