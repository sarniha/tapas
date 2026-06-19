import { useState } from "react";
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
    <View style={[styles.card, styles.cardShadow]}>
      <Text style={styles.mealName}>{item.meal_name}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.macroRow}>
        <Text style={styles.calorieText}>{Math.round(item.calories)} kcal</Text>
        <Text style={styles.macroSummary}>
          P {Math.round(item.protein)}g · C {Math.round(item.carbs)}g · F {Math.round(item.fat)}g
        </Text>
      </View>
      <View style={styles.pillRow}>
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
    <View style={styles.skeletonContainer}>
      <SkeletonBox width={180} height={28} borderRadius={8} />
      <SkeletonBox width={260} height={16} borderRadius={8} />
      <Text style={styles.generatingText}>Generating suggestions...</Text>
      <View style={{ gap: 16, marginTop: 16 }}>
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
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isError } = useQuery<MealSuggestion[]>({
    queryKey: ["meal-suggestions"],
    queryFn: async () => {
      try {
        const res = await api.get("/api/v1/recommendations/today");
        return res.data.suggestions ?? [];
      } catch (err: any) {
        if (err.response?.status === 404) {
          const res = await api.post("/api/v1/recommendations/meal-suggestion");
          return res.data.suggestions ?? [];
        }
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post("/api/v1/recommendations/meal-suggestion");
      queryClient.invalidateQueries({ queryKey: ["meal-suggestions"] });
    } catch (err) {
      console.error("Failed to refresh suggestions", err);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) return <SuggestionsSkeleton />;

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>🤖</Text>
        <Text style={styles.errorText}>Failed to load suggestions</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={handleRefresh}
          activeOpacity={0.8}
        >
          <Text style={styles.retryBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const suggestions = data ?? [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Suggestions ✨</Text>
        <Text style={styles.headerSubtitle}>
          Personalized meal ideas based on your goals
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {suggestions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🍱</Text>
            <Text style={styles.emptyText}>
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
          onPress={handleRefresh}
          activeOpacity={0.8}
          style={styles.refreshBtn}
          disabled={refreshing}
        >
          <Text style={styles.refreshBtnText}>
            {refreshing ? "Generating..." : "🔄  Get New Suggestions"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FF",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E1B2E",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  skeletonContainer: {
    flex: 1,
    backgroundColor: "#F5F3FF",
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
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
  macroRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 12,
    gap: 16,
  },
  macroSummary: {
    fontSize: 12,
    color: "#6B7280",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
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
    opacity: 1,
  },
  refreshBtnText: {
    color: "#7C3AED",
    fontSize: 15,
    fontWeight: "700",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
  },
});
