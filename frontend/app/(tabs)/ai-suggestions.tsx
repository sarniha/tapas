import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/axios";
import { SkeletonBox } from "../../components/ui/SkeletonBox";

// ---------- types ----------
interface MealSuggestion {
  meal_name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// ---------- macro pill ----------
function MacroPill({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <View
      style={[
        styles.macroPill,
        { backgroundColor: color + "18", borderColor: color + "35" },
      ]}
    >
      <Text style={[styles.macroPillText, { color }]}>
        {label} {Math.round(value)}{unit}
      </Text>
    </View>
  );
}

// ---------- suggestion card ----------
function SuggestionCard({ item }: { item: MealSuggestion }) {
  return (
    <View className="bg-white rounded-2xl p-5 mb-4" style={styles.cardShadow}>
      {/* Meal name */}
      <Text style={styles.mealName}>{item.meal_name}</Text>

      {/* Description */}
      <Text style={styles.description}>{item.description}</Text>

      {/* Macro summary row */}
      <View className="flex-row items-center mt-3 mb-3" style={{ gap: 16 }}>
        <Text style={styles.calorieText}>{Math.round(item.calories)} kcal</Text>
        <Text className="text-text-secondary text-xs">
          P {Math.round(item.protein)}g · C {Math.round(item.carbs)}g · F {Math.round(item.fat)}g
        </Text>
      </View>

      {/* Tag pills */}
      <View className="flex-row flex-wrap" style={{ gap: 6 }}>
        <MacroPill label="Protein" value={item.protein} unit="g" color="#10B981" />
        <MacroPill label="Carbs" value={item.carbs} unit="g" color="#F59E0B" />
        <MacroPill label="Fat" value={item.fat} unit="g" color="#C026D3" />
      </View>
    </View>
  );
}

// ---------- skeleton ----------
function SuggestionsSkeleton() {
  return (
    <View className="flex-1 bg-background p-4">
      <SkeletonBox width={180} height={28} borderRadius={8} />
      <SkeletonBox width={260} height={16} borderRadius={8} />
      <Text style={styles.generatingText}>Generating suggestions...</Text>
      <View className="mt-4" style={{ gap: 16 }}>
        {[1, 2, 3].map((i) => (
          <SkeletonBox key={i} width="100%" height={160} borderRadius={16} />
        ))}
      </View>
    </View>
  );
}

// ---------- main ----------
export default function AISuggestionsScreen() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<MealSuggestion[]>({
    queryKey: ["meal-suggestions"],
    queryFn: async () => {
      const res = await api.get("/api/v1/recommendations/meal");
      return res.data.suggestions ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <SuggestionsSkeleton />;

  if (isError) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-[48px] mb-4">🤖</Text>
        <Text
          style={{
            color: "#EF4444",
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Failed to load suggestions
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

  const suggestions = data ?? [];

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 pt-14 pb-1">
        <Text className="text-text-primary text-2xl font-bold">
          AI Suggestions ✨
        </Text>
        <Text className="text-text-secondary text-sm mt-1">
          Personalized meal ideas based on your goals
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4 mt-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {suggestions.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-[48px] mb-4">🍱</Text>
            <Text className="text-text-secondary text-base text-center">
              No suggestions available.{"\n"}Try refreshing!
            </Text>
          </View>
        ) : (
          suggestions.map((item, idx) => (
            <SuggestionCard key={`${item.meal_name}-${idx}`} item={item} />
          ))
        )}

        {/* Refresh button */}
        <TouchableOpacity
          onPress={() =>
            queryClient.invalidateQueries({ queryKey: ["meal-suggestions"] })
          }
          activeOpacity={0.8}
          style={styles.refreshBtn}
        >
          <Text style={styles.refreshBtnText}>🔄  Get New Suggestions</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  mealName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E1B2E",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
  },
  calorieText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#7C3AED",
  },
  macroPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  macroPillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  generatingText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 8,
    marginBottom: 4,
  },
  refreshBtn: {
    borderWidth: 1.5,
    borderColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  refreshBtnText: {
    color: "#7C3AED",
    fontSize: 15,
    fontWeight: "700",
  },
});
