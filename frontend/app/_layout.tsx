import { useEffect } from "react";
import { Stack, useRouter, useSegments, Href } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { queryClient } from "../lib/queryClient";
import { useAuthStore } from "../store/authStore";
import "../global.css";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isOnboarded, isLoading, loadFromStorage } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuth = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "(onboarding)";

    if (!isAuthenticated && !inAuth) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && !isOnboarded && !inOnboarding) {
      router.replace("/(onboarding)/step1-personal");
    } else if (isAuthenticated && isOnboarded && (inAuth || inOnboarding)) {
      router.replace("/(tabs)" as Href);
    }
  }, [isAuthenticated, isOnboarded, isLoading]);

  if (isLoading) return null;

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate>
        <StatusBar style="dark" backgroundColor="#F5F3FF" />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthGate>
    </QueryClientProvider>
  );
}