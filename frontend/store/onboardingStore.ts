import { create } from "zustand";

type Gender = "male" | "female" | "other" | "";
type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active" | "";
type Goal = "lose" | "maintain" | "gain" | "";
type DietaryPreference =
  | "vegetarian"
  | "vegan"
  | "non_vegetarian"
  | "eggetarian"
  | "no_preference"
  | "";

interface OnboardingState {
  age: string;
  gender: Gender;
  height_cm: string;
  weight_kg: string;
  activity_level: ActivityLevel;
  goal: Goal;
  dietary_preference: DietaryPreference;
  setField: (field: string, value: string) => void;
  reset: () => void;
}

const initialState = {
  age: "",
  gender: "" as Gender,
  height_cm: "",
  weight_kg: "",
  activity_level: "" as ActivityLevel,
  goal: "" as Goal,
  dietary_preference: "" as DietaryPreference,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  setField: (field, value) => set({ [field]: value }),

  reset: () => set(initialState),
}));
