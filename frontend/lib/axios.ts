import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://gregarious-emotion-production-ef87.up.railway.app";

const TOKEN_KEY = "tapas_access_token";
const REFRESH_TOKEN_KEY = "tapas_refresh_token";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Attach access token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(
          `${BASE_URL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken }
        );

        await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

        return api(originalRequest);
      } catch {
        // Refresh failed — clear tokens, redirect to login handled by auth store
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
        // Auth store will react to this via useAuth hook
      }
    }

    return Promise.reject(error);
  }
);

export { TOKEN_KEY, REFRESH_TOKEN_KEY };