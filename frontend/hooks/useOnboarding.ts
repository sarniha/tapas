import { useMutation } from "@tanstack/react-query";
import { Href, useRouter } from "expo-router";
import { api } from "../lib/axios";
import { useAuthStore } from "../store/authStore";
import { useOnboardingStore } from "../store/onboardingStore";
import { OnboardingPayload } from "../types/api";

export function useSubmitOnboarding() {
  const router = useRouter();
  const reset = useOnboardingStore((s) => s.reset);

  return useMutation({
    mutationFn: async () => {
      const state = useOnboardingStore.getState();
      const payload: OnboardingPayload = {
        age: Number(state.age),
        gender: state.gender as OnboardingPayload["gender"],
        height_cm: Number(state.height_cm),
        weight_kg: Number(state.weight_kg),
        activity_level: state.activity_level as OnboardingPayload["activity_level"],
        goal: state.goal as OnboardingPayload["goal"],
        dietary_preference: state.dietary_preference as OnboardingPayload["dietary_preference"],
      };

      const { data } = await api.post("/api/v1/users/me/onboarding", payload);
      return data;
    },
    onSuccess: () => {
      useAuthStore.getState().setOnboarded(true);
      reset();
      router.replace("/(tabs)" as Href);
    },
  });
}
