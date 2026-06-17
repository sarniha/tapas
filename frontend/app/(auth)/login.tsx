import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Input } from "../../components/ui/Input";
import { getApiError, useLogin } from "../../hooks/useAuth";

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "Email is required";
  if (!email.includes("@")) return "Enter a valid email address";
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return undefined;
}

export default function LoginScreen() {
  const login = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();

  const handleLogin = () => {
    const nextEmailError = validateEmail(email);
    const nextPasswordError = validatePassword(password);
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) return;

    login.mutate({ email: email.trim(), password });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.hero}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>tapas</Text>
            <Text style={styles.tagline}>fuel your fire</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>Welcome back</Text>
            <Text style={styles.subtext}>Log in to continue your journey</Text>

            <Input
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(undefined);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={emailError}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(undefined);
              }}
              secureToggle
              autoComplete="password"
              error={passwordError}
            />

            <TouchableOpacity
              onPress={handleLogin}
              disabled={login.isPending}
              activeOpacity={0.85}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={["#7C3AED", "#C026D3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                {login.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonLabel}>Log In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {login.isError && (
              <Text style={styles.apiError}>{getApiError(login.error)}</Text>
            )}

            <View style={styles.footerLink}>
              <Text style={styles.footerText}>Don&apos;t have an account? </Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Sign up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  hero: {
    height: "40%",
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1E1B2E",
    textTransform: "lowercase",
  },
  tagline: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#6B7280",
    marginTop: 4,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 4,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E1B2E",
  },
  subtext: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 24,
  },
  buttonWrapper: {
    marginTop: 8,
  },
  gradientButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  apiError: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  footerLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#6B7280",
    fontSize: 14,
  },
  linkText: {
    color: "#7C3AED",
    fontSize: 14,
    fontWeight: "700",
  },
});
