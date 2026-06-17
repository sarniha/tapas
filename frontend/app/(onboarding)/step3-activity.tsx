import { useState } from "react";
import { Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingScreen } from "../../components/onboarding/OnboardingScreen";
import { OptionCard } from "../../components/onboarding/OptionCard";
import { useOnboardingStore } from "../../store/onboardingStore";

const ACTIVITY_OPTIONS = [
  { emoji: "🛋️", label: "Sedentary", value: "sedentary", sublabel: "Little or no exercise" },
  { emoji: "🚶", label: "Lightly Active", value: "light", sublabel: "1–3 days/week" },
  { emoji: "🏃", label: "Moderately Active", value: "moderate", sublabel: "3–5 days/week" },
  { emoji: "💪", label: "Very Active", value: "active", sublabel: "6–7 days/week" },
  {
    emoji: "🔥",
    label: "Extremely Active",
    value: "very_active",
    sublabel: "Twice a day, intense",
  },
] as const;

export default function Step3ActivityScreen() {
  const router = useRouter();
  const { activity_level, setField } = useOnboardingStore();
  const [error, setError] = useState<string>();

  const handleContinue = () => {
    if (!activity_level) {
      setError("Please select your activity level");
      return;
    }
    router.push("/(onboarding)/step4-goal");
  };

  return (
    <OnboardingScreen
      step={3}
      title="How active are you?"
      subtitle="Your typical week"
      onContinue={handleContinue}
      onBack={() => router.replace("/(onboarding)/step2-body")}
    >
      {ACTIVITY_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          emoji={option.emoji}
          label={option.label}
          sublabel={option.sublabel}
          selected={activity_level === option.value}
          onPress={() => {
            setField("activity_level", option.value);
            if (error) setError(undefined);
          }}
        />
      ))}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  error: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: -4,
  },
});
