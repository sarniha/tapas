import { useMutation } from "@tanstack/react-query";
import { Href, useRouter } from "expo-router";
import { AxiosError } from "axios";
import { api } from "../lib/axios";
import { useAuthStore } from "../store/authStore";
import { AuthResponse, UserProfile } from "../types/api";

interface TokenPayload {
  email: string;
  password: string;
}

interface SignupPayload extends TokenPayload {
  name: string;
}

type AuthTokenResponse = AuthResponse & { user_id: number };

async function fetchMe(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>("/api/v1/users/me");
  return data;
}

export function getApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg ?? String(item)).join(", ");
    }
  }
  return "Something went wrong. Please try again.";
}

export function useLogin() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);

  return useMutation({
    mutationFn: async ({ email, password }: TokenPayload) => {
      const { data } = await api.post<AuthTokenResponse>("/api/v1/auth/login", {
        email,
        password,
      });
      return data;
    },
    onSuccess: async (data) => {
      await setTokens(data.access_token, data.refresh_token);
      const me = await fetchMe();
      setOnboarded(me.is_onboarded);
      router.replace(me.is_onboarded ? ("/(tabs)" as Href) : "/(onboarding)/step1-personal");
    },
  });
}

export function useSignup() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);
  const setOnboarded = useAuthStore((s) => s.setOnboarded);

  return useMutation({
    mutationFn: async ({ email, password, name }: SignupPayload) => {
      const { data } = await api.post<AuthTokenResponse>("/api/v1/auth/signup", {
        email,
        password,
        name,
      });
      return data;
    },
    onSuccess: async (data) => {
      await setTokens(data.access_token, data.refresh_token);
      setOnboarded(false);
      router.replace("/(onboarding)/step1-personal");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      router.replace("/(auth)/login");
    },
  });
}
