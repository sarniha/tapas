import { useState } from "react";
import { Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Input } from "../../components/ui/Input";
import { OnboardingScreen } from "../../components/onboarding/OnboardingScreen";
import { OptionCard } from "../../components/onboarding/OptionCard";
import { useOnboardingStore } from "../../store/onboardingStore";

const GENDER_OPTIONS = [
  { emoji: "🧔", label: "Male", value: "male" as const },
  { emoji: "👩", label: "Female", value: "female" as const },
  { emoji: "🧑", label: "Other", value: "other" as const },
];

export default function Step1PersonalScreen() {
  const router = useRouter();
  const { age, gender, setField } = useOnboardingStore();
  const [ageError, setAgeError] = useState<string>();
  const [genderError, setGenderError] = useState<string>();

  const handleContinue = () => {
    const parsedAge = Number(age);
    const nextAgeError =
      !age.trim()
        ? "Age is required"
        : Number.isNaN(parsedAge) || parsedAge < 10 || parsedAge > 100
          ? "Enter an age between 10 and 100"
          : undefined;
    const nextGenderError = !gender ? "Please select your gender" : undefined;

    setAgeError(nextAgeError);
    setGenderError(nextGenderError);
    if (nextAgeError || nextGenderError) return;

    router.push("/(onboarding)/step2-body");
  };

  return (
    <OnboardingScreen
      step={1}
      title="Let's get to know you"
      subtitle="Tell us a bit about yourself"
      onContinue={handleContinue}
      keyboardAvoiding
    >
      <Input
        label="Your age"
        value={age}
        onChangeText={(text) => {
          setField("age", text);
          if (ageError) setAgeError(undefined);
        }}
        keyboardType="numeric"
        placeholder="25"
        error={ageError}
      />

      <Text style={styles.sectionLabel}>Gender</Text>
      {GENDER_OPTIONS.map((option) => (
        <OptionCard
          key={option.value}
          emoji={option.emoji}
          label={option.label}
          selected={gender === option.value}
          onPress={() => {
            setField("gender", option.value);
            if (genderError) setGenderError(undefined);
          }}
        />
      ))}
      {genderError ? <Text style={styles.error}>{genderError}</Text> : null}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginBottom: 12,
  },
  error: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: -4,
    marginBottom: 8,
  },
});
