import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/axios";
import { SkeletonBox } from "../../components/ui/SkeletonBox";

// ---------- types ----------
type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface FoodEntry {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: MealType;
  logged_at: string;
}

interface WorkoutEntry {
  id: string;
  exercise_name: string;
  duration_minutes: number;
  calories_burned: number;
  logged_at: string;
}

type TabType = "food" | "workouts";

// ---------- helpers ----------
function formatDateLabel(dateStr: string): string {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (dateStr === todayStr) return "Today";
  if (dateStr === yesterdayStr) return "Yesterday";

  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDateKey(isoString: string): string {
  return isoString.slice(0, 10);
}

function groupByDate<T extends { logged_at: string }>(
  entries: T[]
): { date: string; items: T[] }[] {
  const map: Record<string, T[]> = {};
  for (const entry of entries) {
    const key = getDateKey(entry.logged_at);
    if (!map[key]) map[key] = [];
    map[key].push(entry);
  }
  return Object.entries(map)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, items]) => ({ date, items }));
}

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: "#F59E0B",
  lunch: "#10B981",
  dinner: "#7C3AED",
  snack: "#C026D3",
};

// ---------- food entry row ----------
function FoodEntryRow({ entry }: { entry: FoodEntry }) {
  const mealColor = MEAL_COLORS[entry.meal_type] ?? "#6B7280";
  return (
    <View
      className="bg-white rounded-2xl p-4 mb-2 flex-row items-center"
      style={styles.cardShadow}
    >
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-text-primary text-base font-bold flex-1 mr-2" numberOfLines={1}>
            {entry.food_name}
          </Text>
          <View
            style={[styles.mealBadge, { backgroundColor: mealColor + "20", borderColor: mealColor + "40" }]}
          >
            <Text style={[styles.mealBadgeText, { color: mealColor }]}>
              {entry.meal_type}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center mt-1" style={{ gap: 8 }}>
          <Text style={styles.calText}>{Math.round(entry.calories)} kcal</Text>
          <Text className="text-text-secondary text-xs">
            P {Math.round(entry.protein)}g · C {Math.round(entry.carbs)}g · F {Math.round(entry.fat)}g
          </Text>
        </View>
      </View>
    </View>
  );
}

// ---------- workout entry row ----------
function WorkoutEntryRow({ entry }: { entry: WorkoutEntry }) {
  return (
    <View
      className="bg-white rounded-2xl p-4 mb-2 flex-row items-center"
      style={styles.cardShadow}
    >
      <View className="flex-1">
        <Text className="text-text-primary text-base font-bold">
          {entry.exercise_name}
        </Text>
        <View className="flex-row items-center mt-1" style={{ gap: 12 }}>
          <Text className="text-text-secondary text-xs">
            ⏱ {Math.round(entry.duration_minutes)} min
          </Text>
          <Text style={styles.calText}>
            🔥 {Math.round(entry.calories_burned)} kcal
          </Text>
        </View>
      </View>
    </View>
  );
}

// ---------- date section ----------
function DateSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View className="mb-5">
      <View className="flex-row items-center mb-3" style={{ gap: 8 }}>
        <Text style={styles.sectionDate}>{label}</Text>
        <View className="flex-1 h-[1px] bg-gray-100" />
      </View>
      {children}
    </View>
  );
}

// ---------- skeleton ----------
function HistorySkeleton() {
  return (
    <View className="flex-1 bg-background p-4">
      <SkeletonBox width={120} height={28} borderRadius={8} />
      <View className="flex-row mt-4 mb-6" style={{ gap: 8 }}>
        <SkeletonBox width={80} height={36} borderRadius={999} />
        <SkeletonBox width={90} height={36} borderRadius={999} />
      </View>
      {[1, 2, 3].map((i) => (
        <View key={i} className="mb-5">
          <SkeletonBox width={80} height={16} borderRadius={8} />
          <View className="mt-3" style={{ gap: 8 }}>
            <SkeletonBox width="100%" height={72} borderRadius={16} />
            <SkeletonBox width="100%" height={72} borderRadius={16} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ---------- main ----------
export default function HistoryScreen() {
  const [activeTab, setActiveTab] = useState<TabType>("food");

  const foodQuery = useQuery<FoodEntry[]>({
    queryKey: ["food-logs"],
    queryFn: async () => {
      const res = await api.get("/api/v1/food-logs");
      return Array.isArray(res.data)
        ? res.data
        : res.data.items ?? res.data.data ?? [];
    },
  });

  const workoutQuery = useQuery<WorkoutEntry[]>({
    queryKey: ["workout-logs"],
    queryFn: async () => {
      const res = await api.get("/api/v1/workout-logs");
      return Array.isArray(res.data)
        ? res.data
        : res.data.items ?? res.data.data ?? [];
    },
  });

  const isLoading = foodQuery.isLoading || workoutQuery.isLoading;
  const isError = foodQuery.isError || workoutQuery.isError;

  if (isLoading) return <HistorySkeleton />;

  if (isError) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text style={{ color: "#EF4444", fontSize: 16, fontWeight: "600", marginBottom: 16, textAlign: "center" }}>
          Failed to load history
        </Text>
        <TouchableOpacity
          className="bg-primary px-6 py-3 rounded-btn"
          onPress={() => {
            foodQuery.refetch();
            workoutQuery.refetch();
          }}
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const foodEntries = foodQuery.data ?? [];
  const workoutEntries = workoutQuery.data ?? [];
  const groupedFood = groupByDate(foodEntries);
  const groupedWorkouts = groupByDate(workoutEntries);

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-14 pb-3">
        <Text className="text-text-primary text-2xl font-bold">History</Text>

        {/* Toggle Tabs */}
        <View className="flex-row mt-4" style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab("food")}
            activeOpacity={0.8}
            style={[
              styles.toggleTab,
              activeTab === "food" ? styles.toggleTabActive : styles.toggleTabInactive,
            ]}
          >
            <Text
              style={[
                styles.toggleTabText,
                activeTab === "food"
                  ? styles.toggleTabTextActive
                  : styles.toggleTabTextInactive,
              ]}
            >
              🍽 Food
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("workouts")}
            activeOpacity={0.8}
            style={[
              styles.toggleTab,
              activeTab === "workouts" ? styles.toggleTabActive : styles.toggleTabInactive,
            ]}
          >
            <Text
              style={[
                styles.toggleTabText,
                activeTab === "workouts"
                  ? styles.toggleTabTextActive
                  : styles.toggleTabTextInactive,
              ]}
            >
              💪 Workouts
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "food" ? (
          groupedFood.length === 0 ? (
            <View className="items-center justify-center py-20">
              <Text className="text-[48px] mb-4">🍽️</Text>
              <Text className="text-text-secondary text-base text-center">
                No food entries yet.{"\n"}Start logging your meals!
              </Text>
            </View>
          ) : (
            groupedFood.map(({ date, items }) => (
              <DateSection key={date} label={formatDateLabel(date)}>
                {items.map((entry) => (
                  <FoodEntryRow key={entry.id} entry={entry} />
                ))}
              </DateSection>
            ))
          )
        ) : groupedWorkouts.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-[48px] mb-4">💪</Text>
            <Text className="text-text-secondary text-base text-center">
              No workouts yet.{"\n"}Start logging your training!
            </Text>
          </View>
        ) : (
          groupedWorkouts.map(({ date, items }) => (
            <DateSection key={date} label={formatDateLabel(date)}>
              {items.map((entry) => (
                <WorkoutEntryRow key={entry.id} entry={entry} />
              ))}
            </DateSection>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  calText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7C3AED",
  },
  mealBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  mealBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  sectionDate: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  toggleContainer: {
    backgroundColor: "#F3F4F6",
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
  },
  toggleTabActive: {
    backgroundColor: "#7C3AED",
  },
  toggleTabInactive: {
    backgroundColor: "transparent",
  },
  toggleTabText: {
    fontSize: 13,
    fontWeight: "700",
  },
  toggleTabTextActive: {
    color: "#FFFFFF",
  },
  toggleTabTextInactive: {
    color: "#6B7280",
  },
});
