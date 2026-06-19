import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from "../lib/axios";
import axios from "axios";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  setTokens: (access: string, refresh: string) => Promise<void>;
  setOnboarded: (val: boolean) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  isOnboarded: false,
  isLoading: true,

  setTokens: async (access, refresh) => {
    await SecureStore.setItemAsync(TOKEN_KEY, access);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
    set({ accessToken: access, isAuthenticated: true });
  },

  setOnboarded: async (val) => {
    await SecureStore.setItemAsync("isOnboarded", val ? "true" : "false");
    set({ isOnboarded: val });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    set({ accessToken: null, isAuthenticated: false, isOnboarded: false });
  },
  loadFromStorage: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      try {
        // token exists, fetch user to check onboarding status
        const { data } = await axios.get(
          "https://gregarious-emotion-production-ef87.up.railway.app/api/v1/users/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        set({
          accessToken: token,
          isAuthenticated: true,
          isOnboarded: data.is_onboarded,
          isLoading: false,
        });
      } catch {
        // token expired or invalid
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        set({ accessToken: null, isAuthenticated: false, isOnboarded: false, isLoading: false });
      }
    } else {
      set({ accessToken: null, isAuthenticated: false, isOnboarded: false, isLoading: false });
    }
  },


}));