export const COLORS = {
  primary: "#7C3AED",
  primaryLight: "#A78BFA",
  accent: "#C026D3",
  background: "#F5F3FF",
  card: "#FFFFFF",
  textPrimary: "#1E1B2E",
  textSecondary: "#6B7280",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const RADIUS = {
  card: 16,
  btn: 12,
} as const;

export const API_ROUTES = {
  // Auth
  signup: "/api/v1/auth/signup",
  login: "/api/v1/auth/login",
  refresh: "/api/v1/auth/refresh",

  // User
  me: "/api/v1/users/me",
  onboarding: "/api/v1/users/me/onboarding",

  // Logs
  foodLogs: "/api/v1/food-logs",
  workoutLogs: "/api/v1/workout-logs",

  // Dashboard
  dashboard: "/api/v1/dashboard",

  // Check-ins
  checkIns: "/api/v1/check-ins",

  // AI
  recommendations: "/api/v1/recommendations",
} as const;