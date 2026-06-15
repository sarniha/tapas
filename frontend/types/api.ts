// Auth
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// User
export type Gender = "male" | "female" | "other";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "lose" | "maintain" | "gain";
export type DietaryPreference = "vegetarian" | "vegan" | "non_vegetarian" | "eggetarian" | "no_preference";

export interface OnboardingPayload {
  age: number;
  gender: Gender;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  goal: Goal;
  dietary_preference: DietaryPreference;
}

export interface UserProfile extends OnboardingPayload {
  id: number;
  email: string;
  name: string;
  is_onboarded: boolean;
}

// Dashboard
export type AdherenceStatus = "on_track" | "under" | "over" | "way_over" | "way_under";

export interface MacroTarget {
  target: number;
  actual: number;
  remaining: number;
}

export interface DashboardData {
  calories: MacroTarget;
  protein: MacroTarget;
  carbs: MacroTarget;
  fat: MacroTarget;
  workouts: WorkoutLog[];
  adherence_status: AdherenceStatus;
}

// Food log
export interface FoodLog {
  id: number;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: string;
  logged_at: string;
}

// Workout log
export interface WorkoutLog {
  id: number;
  exercise_name: string;
  duration_minutes: number;
  calories_burned: number;
  logged_at: string;
}

// Check-in
export interface CheckIn {
  id: number;
  weight_kg: number;
  notes?: string;
  checked_in_at: string;
}