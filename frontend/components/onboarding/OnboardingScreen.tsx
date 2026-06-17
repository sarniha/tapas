import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StepProgress } from "./StepProgress";

interface OnboardingScreenProps {
  step: number;
  title: string;
  subtitle: string;
  onContinue: () => void;
  onBack?: () => void;
  continueLabel?: string;
  loading?: boolean;
  error?: string;
  keyboardAvoiding?: boolean;
  children: React.ReactNode;
}

export function OnboardingScreen({
  step,
  title,
  subtitle,
  onContinue,
  onBack,
  continueLabel = "Continue",
  loading = false,
  error,
  keyboardAvoiding = false,
  children,
}: OnboardingScreenProps) {
  const content = (
    <>
      <StepProgress step={step} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <View style={styles.body}>{children}</View>
      <View style={styles.footer}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          onPress={onContinue}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#7C3AED", "#C026D3"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButton}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.continueLabel}>{continueLabel}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1E1B2E",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },
  body: {
    flex: 1,
  },
  footer: {
    marginTop: 24,
    paddingTop: 8,
  },
  backButton: {
    alignItems: "center",
    marginBottom: 16,
  },
  backText: {
    fontSize: 15,
    color: "#6B7280",
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  continueLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
});
