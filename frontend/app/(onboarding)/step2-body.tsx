import { useState } from "react";
import { useRouter } from "expo-router";
import { Input } from "../../components/ui/Input";
import { OnboardingScreen } from "../../components/onboarding/OnboardingScreen";
import { useOnboardingStore } from "../../store/onboardingStore";

export default function Step2BodyScreen() {
  const router = useRouter();
  const { height_cm, weight_kg, setField } = useOnboardingStore();
  const [heightError, setHeightError] = useState<string>();
  const [weightError, setWeightError] = useState<string>();

  const handleContinue = () => {
    const parsedHeight = Number(height_cm);
    const parsedWeight = Number(weight_kg);

    const nextHeightError =
      !height_cm.trim()
        ? "Height is required"
        : Number.isNaN(parsedHeight) || parsedHeight < 50 || parsedHeight > 250
          ? "Enter height between 50 and 250 cm"
          : undefined;

    const nextWeightError =
      !weight_kg.trim()
        ? "Weight is required"
        : Number.isNaN(parsedWeight) || parsedWeight < 20 || parsedWeight > 300
          ? "Enter weight between 20 and 300 kg"
          : undefined;

    setHeightError(nextHeightError);
    setWeightError(nextWeightError);
    if (nextHeightError || nextWeightError) return;

    router.push("/(onboarding)/step3-activity");
  };

  return (
    <OnboardingScreen
      step={2}
      title="Your body stats"
      subtitle="This helps us calculate your targets"
      onContinue={handleContinue}
      onBack={() => router.replace("/(onboarding)/step1-personal")}
      keyboardAvoiding
    >
      <Input
        label="Height (cm)"
        value={height_cm}
        onChangeText={(text) => {
          setField("height_cm", text);
          if (heightError) setHeightError(undefined);
        }}
        keyboardType="numeric"
        placeholder="170"
        error={heightError}
      />

      <Input
        label="Weight (kg)"
        value={weight_kg}
        onChangeText={(text) => {
          setField("weight_kg", text);
          if (weightError) setWeightError(undefined);
        }}
        keyboardType="numeric"
        placeholder="65"
        error={weightError}
      />
    </OnboardingScreen>
  );
}
