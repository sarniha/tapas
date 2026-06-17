import { useState } from "react";
import { Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { OnboardingScreen } from "../../components/onboarding/OnboardingScreen";
import { OptionCard } from "../../components/onboarding/OptionCard";
import { useOnboardingStore } from "../../store/onboardingStore";

const GOAL_OPTIONS = [
  { emoji: "📉", label: "Lose Weight", value: "lose", sublabel: "Burn fat, feel lighter" },
  { emoji: "⚖️", label: "Maintain Weight", value: "maintain", sublabel: "Stay where you are" },
  { emoji: "📈", label: "Gain Weight", value: "gain", sublabel: "Build mass and strength" },
] as const;

export default function Step4GoalScreen() {
  const router = useRouter();
  const { goal, setField } = useOnboardingStore();
  const [error, setError] = useState<string>();

  const handleContinue = () => {
    if (!goal) {
      setError("Please select your goal");
      return;
    }
    router.push("/(onboarding)/step5-diet");
  };

  return (
    <OnboardingScreen
      step={4}
      title="What's your goal?"
      subtitle="We'll build your plan around this"
      onContinue={handleContinue}
      onBack={() => router.replace("/(onboarding)/step3-activity")}
    >
      {GOAL_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          emoji={option.emoji}
          label={option.label}
          sublabel={option.sublabel}
          selected={goal === option.value}
          onPress={() => {
            setField("goal", option.value);
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
