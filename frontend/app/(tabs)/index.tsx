import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import Svg, { Circle } from "react-native-svg";
import { api } from "../../lib/axios";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { SkeletonBox } from "../../components/ui/SkeletonBox";

// ---------- types ----------
interface DashboardTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Workout {
  id: string;
  exercise_name: string;
  duration_minutes: number;
  calories_burned: number;
  logged_at: string;
}

type AdherenceStatus = "on_track" | "under" | "over" | "way_over" | "way_under";

interface DashboardData {
  targets: DashboardTargets;
  actual: DashboardTargets;
  remaining: DashboardTargets;
  workouts: Workout[];
  adherence_status: AdherenceStatus;
}

// ---------- helpers ----------
const adherenceConfig: Record<AdherenceStatus, { label: string; color: string }> = {
  on_track: { label: "On Track", color: "#10B981" },
  under: { label: "Under Goal", color: "#F59E0B" },
  way_under: { label: "Way Under", color: "#F59E0B" },
  over: { label: "Over Goal", color: "#EF4444" },
  way_over: { label: "Way Over", color: "#EF4444" },
};

// ---------- donut ----------
function CalorieRing({
  actual,
  target,
  remaining,
}: {
  actual: number;
  target: number;
  remaining: number;
}) {
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = target > 0 ? Math.min(actual / target, 1) : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={styles.ringContainer}>
      <Svg width={size} height={size} style={styles.ringSvg}>
        {/* track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* filled */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#7C3AED"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.ringLabel}>
        <Text style={styles.ringNumber}>{Math.round(remaining)}</Text>
        <Text style={styles.ringSubtext}>kcal left</Text>
      </View>
    </View>
  );
}

// ---------- skeleton ----------
function DashboardSkeleton() {
  return (
    <ScrollView className="flex-1 bg-background p-4">
      {/* greeting */}
      <SkeletonBox width={180} height={28} borderRadius={8} />
      <View className="mt-3">
        <SkeletonBox width={100} height={28} borderRadius={999} />
      </View>

      {/* ring */}
      <View className="items-center mt-6">
        <SkeletonBox width={180} height={180} borderRadius={90} />
      </View>

      {/* macro cards */}
      <View className="flex-row mt-6" style={{ gap: 12 }}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={{ flex: 1 }}>
            <SkeletonBox width="100%" height={100} borderRadius={16} />
          </View>
        ))}
      </View>

      {/* workouts */}
      <View className="mt-6">
        <SkeletonBox width={160} height={22} borderRadius={8} />
        <View className="mt-3">
          <SkeletonBox width="100%" height={72} borderRadius={16} />
        </View>
        <View className="mt-3">
          <SkeletonBox width="100%" height={72} borderRadius={16} />
        </View>
      </View>
    </ScrollView>
  );
}

// ---------- main ----------
export default function DashboardScreen() {
  const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await api.get("/api/v1/dashboard");
      return res.data;
    },
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-danger text-base font-semibold mb-4">
          Failed to load dashboard
        </Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-btn"
          onPress={() => refetch()}
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { targets, actual, remaining, workouts, adherence_status } = data;
  const adherence = adherenceConfig[adherence_status] ?? adherenceConfig.on_track;

  const macros = [
    {
      label: "Protein",
      actual: Math.round(actual.protein),
      target: Math.round(targets.protein),
      color: "#7C3AED",
    },
    {
      label: "Carbs",
      actual: Math.round(actual.carbs),
      target: Math.round(targets.carbs),
      color: "#C026D3",
    },
    {
      label: "Fat",
      actual: Math.round(actual.fat),
      target: Math.round(targets.fat),
      color: "#F59E0B",
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting + Badge */}
      <Text className="text-text-primary text-2xl font-bold">
        Good morning 👋
      </Text>

      <View
        style={[styles.badge, { backgroundColor: adherence.color }]}
        className="mt-2 self-start"
      >
        <Text className="text-white text-xs font-bold">{adherence.label}</Text>
      </View>

      {/* Calorie Ring */}
      <View className="items-center mt-6">
        <CalorieRing
          actual={Math.round(actual.calories)}
          target={Math.round(targets.calories)}
          remaining={Math.round(remaining.calories)}
        />
      </View>

      {/* Macro Cards */}
      <View className="flex-row mt-6" style={{ gap: 12 }}>
        {macros.map((m) => (
          <View
            key={m.label}
            className="bg-card rounded-card p-3"
            style={[styles.macroCard, styles.cardShadow]}
          >
            <Text className="text-text-secondary text-xs font-semibold mb-1">
              {m.label}
            </Text>
            <Text className="text-text-primary text-sm font-bold">
              {m.actual}g{" "}
              <Text className="text-text-secondary font-normal">
                / {m.target}g
              </Text>
            </Text>
            <View className="mt-2">
              <ProgressBar
                value={m.target > 0 ? m.actual / m.target : 0}
                color={m.color}
                height={6}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Today's Workouts */}
      <Text className="text-text-primary text-lg font-bold mt-8 mb-3">
        Today's Workouts
      </Text>

      {workouts.length === 0 ? (
        <Text className="text-text-secondary text-sm">
          No workouts logged today
        </Text>
      ) : (
        workouts.map((w) => (
          <View
            key={w.id}
            className="bg-card rounded-card p-4 mb-3"
            style={styles.cardShadow}
          >
            <Text className="text-text-primary text-base font-bold">
              {w.exercise_name}
            </Text>
            <Text className="text-text-secondary text-sm mt-1">
              {Math.round(w.duration_minutes)} min ·{" "}
              {Math.round(w.calories_burned)} kcal burned
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ringContainer: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
  },
  ringSvg: {
    position: "absolute",
  },
  ringLabel: {
    alignItems: "center",
  },
  ringNumber: {
    fontSize: 36,
    fontWeight: "800",
    color: "#1E1B2E",
  },
  ringSubtext: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  macroCard: {
    flex: 1,
  },
  cardShadow: {
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});
