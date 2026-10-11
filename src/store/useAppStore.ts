import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ApiKeys, PantryItem, Preferences, ProviderFlags, ScoredRecipe } from "../types";
import { defaultApiKeys, defaultPreferences, defaultProviderFlags } from "../types";

type AppState = {
  preferences: Preferences;
  pantry: PantryItem[];
  apiKeys: ApiKeys;
  providers: ProviderFlags;
  lastResults: ScoredRecipe[];
  lastErrors: string[];
  setPreferences: (patch: Partial<Preferences>) => void;
  completeOnboarding: (prefs: Preferences) => void;
  addIngredient: (name: string, source: PantryItem["source"]) => void;
  addMany: (names: string[], source: PantryItem["source"]) => void;
  removeIngredient: (id: string) => void;
  clearPantry: () => void;
  setApiKeys: (patch: Partial<ApiKeys>) => void;
  setProviders: (patch: Partial<ProviderFlags>) => void;
  setResults: (recipes: ScoredRecipe[], errors: string[]) => void;
  resetOnboarding: () => void;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      preferences: defaultPreferences(),
      pantry: [],
      apiKeys: defaultApiKeys(),
      providers: defaultProviderFlags(),
      lastResults: [],
      lastErrors: [],
      setPreferences: (patch) =>
        set({ preferences: { ...get().preferences, ...patch } }),
      completeOnboarding: (prefs) => set({ preferences: { ...prefs, onboarded: true } }),
      addIngredient: (name, source) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const exists = get().pantry.some((item) => item.name.toLowerCase() === trimmed.toLowerCase());
        if (exists) return;
        set({
          pantry: [...get().pantry, { id: uid(), name: trimmed, source, addedAt: Date.now() }],
        });
      },
      addMany: (names, source) => {
        names.forEach((name) => get().addIngredient(name, source));
      },
      removeIngredient: (id) => set({ pantry: get().pantry.filter((item) => item.id !== id) }),
      clearPantry: () => set({ pantry: [] }),
      setApiKeys: (patch) => set({ apiKeys: { ...get().apiKeys, ...patch } }),
      setProviders: (patch) => set({ providers: { ...get().providers, ...patch } }),
      setResults: (recipes, errors) => set({ lastResults: recipes, lastErrors: errors }),
      resetOnboarding: () => set({ preferences: defaultPreferences() }),
    }),
    {
      name: "pantrychef-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        pantry: state.pantry,
        apiKeys: state.apiKeys,
        providers: state.providers,
      }),
    }
  )
);
