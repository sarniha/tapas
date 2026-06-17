import { useState } from "react";
import { useRouter } from "expo-router";
import { OnboardingScreen } from "../../components/onboarding/OnboardingScreen";
import { OptionCard } from "../../components/onboarding/OptionCard";
import { getApiError } from "../../hooks/useAuth";
import { useSubmitOnboarding } from "../../hooks/useOnboarding";
import { useOnboardingStore } from "../../store/onboardingStore";

const DIET_OPTIONS = [
  { emoji: "🥗", label: "Vegetarian", value: "vegetarian" },
  { emoji: "🌱", label: "Vegan", value: "vegan" },
  { emoji: "🍗", label: "Non Vegetarian", value: "non_vegetarian" },
  { emoji: "🥚", label: "Eggetarian", value: "eggetarian" },
  { emoji: "🍽️", label: "No Preference", value: "no_preference" },
] as const;

export default function Step5DietScreen() {
  const router = useRouter();
  const submit = useSubmitOnboarding();
  const { dietary_preference, setField } = useOnboardingStore();
  const [validationError, setValidationError] = useState<string>();

  const handleFinish = () => {
    if (!dietary_preference) {
      setValidationError("Please select a dietary preference");
      return;
    }
    setValidationError(undefined);
    submit.mutate();
  };

  const apiError = submit.isError ? getApiError(submit.error) : undefined;

  return (
    <OnboardingScreen
      step={5}
      title="Dietary preference"
      subtitle="So we can suggest the right meals"
      continueLabel="Finish Setup"
      onContinue={handleFinish}
      onBack={() => router.replace("/(onboarding)/step4-goal")}
      loading={submit.isPending}
      error={validationError ?? apiError}
    >
      {DIET_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          emoji={option.emoji}
          label={option.label}
          selected={dietary_preference === option.value}
          onPress={() => {
            setField("dietary_preference", option.value);
            if (validationError) setValidationError(undefined);
          }}
        />
      ))}
    </OnboardingScreen>
  );
}
