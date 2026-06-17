import { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "../../lib/axios";
import { SkeletonBox } from "../../components/ui/SkeletonBox";

// ---------- types ----------
interface CheckIn {
  id: string;
  weight_kg: number;
  notes: string | null;
  checked_in_at: string;
}

// ---------- helpers ----------
function formatCheckinDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ---------- checkin card ----------
function CheckInCard({ item }: { item: CheckIn }) {
  return (
    <View
      className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
      style={styles.cardShadow}
    >
      <View
        style={styles.weightBadge}
        className="items-center justify-center mr-4"
      >
        <Text style={styles.weightBadgeText}>⚖️</Text>
      </View>
      <View className="flex-1">
        <View className="flex-row items-baseline" style={{ gap: 4 }}>
          <Text style={styles.weightText}>{item.weight_kg}</Text>
          <Text style={styles.weightUnit}>kg</Text>
        </View>
        <Text className="text-text-secondary text-xs mt-0.5">
          {formatCheckinDate(item.checked_in_at)}
        </Text>
        {!!item.notes && (
          <Text
            className="text-text-secondary text-xs mt-1"
            numberOfLines={2}
          >
            📝 {item.notes}
          </Text>
        )}
      </View>
    </View>
  );
}

// ---------- skeleton ----------
function CheckInSkeleton() {
  return (
    <View className="flex-1 bg-background p-4">
      <SkeletonBox width={120} height={28} borderRadius={8} />
      <View className="mt-4 mb-6">
        <SkeletonBox width="100%" height={180} borderRadius={16} />
      </View>
      <SkeletonBox width={160} height={20} borderRadius={8} />
      <View className="mt-4" style={{ gap: 12 }}>
        {[1, 2, 3].map((i) => (
          <SkeletonBox key={i} width="100%" height={84} borderRadius={16} />
        ))}
      </View>
    </View>
  );
}

// ---------- main ----------
export default function CheckInScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const queryClient = useQueryClient();

  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading, isError, refetch } = useQuery<CheckIn[]>({
    queryKey: ["check-ins"],
    queryFn: async () => {
      const res = await api.get("/api/v1/check-ins");
      return Array.isArray(res.data)
        ? res.data
        : res.data.items ?? res.data.data ?? [];
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: { weight_kg: number; notes?: string }) => {
      const res = await api.post("/api/v1/check-ins", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["check-ins"] });
      setWeight("");
      setNotes("");
      setErrors({});
      Alert.alert("✅ Logged!", "Your check-in has been recorded.");
    },
    onError: () => {
      Alert.alert("Error", "Failed to log check-in. Please try again.");
    },
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!weight || Number(weight) <= 0) {
      newErrors.weight = "Weight must be greater than 0";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    const payload: { weight_kg: number; notes?: string } = {
      weight_kg: Number(weight),
    };
    if (notes.trim()) payload.notes = notes.trim();
    submitMutation.mutate(payload);
  };

  if (isLoading) return <CheckInSkeleton />;

  if (isError) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text
          style={{ color: "#EF4444", fontSize: 16, fontWeight: "600", marginBottom: 16, textAlign: "center" }}
        >
          Failed to load check-ins
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

  const checkIns = data ?? [];

  return (
    <ScrollView
      ref={scrollRef}
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View className="px-4 pt-14 pb-3">
        <Text className="text-text-primary text-2xl font-bold">Check-in</Text>
      </View>

      {/* Input Card */}
      <View className="mx-4 mb-6">
        <View
          className="bg-white rounded-2xl p-5"
          style={styles.cardShadow}
        >
          {/* Weight input */}
          <Text className="text-text-secondary text-sm font-medium mb-2 text-center">
            Today's Weight
          </Text>
          <View className="flex-row items-center justify-center mb-1">
            <TextInput
              style={[
                styles.weightInput,
                { borderColor: errors.weight ? "#EF4444" : "#E5E7EB" },
              ]}
              value={weight}
              onChangeText={(v) => {
                setWeight(v);
                if (errors.weight) setErrors((e) => ({ ...e, weight: "" }));
              }}
              keyboardType="decimal-pad"
              placeholder="0.0"
              placeholderTextColor="#D1D5DB"
              textAlign="center"
            />
            <Text style={styles.kgSuffix}>kg</Text>
          </View>
          {!!errors.weight && (
            <Text
              style={{ color: "#EF4444", fontSize: 12, marginTop: 4, marginBottom: 8, textAlign: "center" }}
            >
              {errors.weight}
            </Text>
          )}

          {/* Notes input */}
          <Text className="text-text-secondary text-sm font-medium mt-4 mb-2">
            Notes (optional)
          </Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="How are you feeling today?"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Submit button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitMutation.isPending}
            activeOpacity={0.8}
            style={
              submitMutation.isPending
                ? { opacity: 0.5, marginTop: 20 }
                : { marginTop: 20 }
            }
          >
            <LinearGradient
              colors={["#7C3AED", "#C026D3"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitBtn}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: "700",
                  textAlign: "center",
                }}
              >
                {submitMutation.isPending ? "Logging..." : "Log Check-in"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Past Check-ins */}
      <View className="px-4">
        <Text style={styles.sectionTitle}>Past Check-ins</Text>
        <View className="mt-3">
          {checkIns.length === 0 ? (
            <View className="items-center py-12">
              <Text className="text-[40px] mb-3">⚖️</Text>
              <Text className="text-text-secondary text-base text-center">
                No check-ins yet.{"\n"}Log your first one above!
              </Text>
            </View>
          ) : (
            checkIns.map((item) => (
              <CheckInCard key={item.id} item={item} />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  weightInput: {
    fontSize: 56,
    fontWeight: "800",
    color: "#7C3AED",
    borderBottomWidth: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    minWidth: 120,
    textAlign: "center",
  },
  kgSuffix: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6B7280",
    marginLeft: 8,
    marginTop: 16,
  },
  notesInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1E1B2E",
    minHeight: 88,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center" as const,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1B2E",
  },
  weightBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F5F3FF",
  },
  weightBadgeText: {
    fontSize: 22,
  },
  weightText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#7C3AED",
  },
  weightUnit: {
    fontSize: 15,
    fontWeight: "600",
    color: "#7C3AED",
  },
});
