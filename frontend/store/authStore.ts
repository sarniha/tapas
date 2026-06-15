import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from "../lib/axios";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  setTokens: (access: string, refresh: string) => Promise<void>;
  setOnboarded: (val: boolean) => void;
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

  setOnboarded: (val) => set({ isOnboarded: val }),

  logout: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    set({ accessToken: null, isAuthenticated: false, isOnboarded: false });
  },

  loadFromStorage: async () => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    set({
      accessToken: token,
      isAuthenticated: !!token,
      isLoading: false,
    });
  },
}));