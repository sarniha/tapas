import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "../../lib/axios";
import { SkeletonBox } from "../../components/ui/SkeletonBox";

// ---------- types ----------
type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface FoodLogEntry {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: MealType;
  logged_at: string;
}

interface AddFoodPayload {
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: MealType;
  logged_at: string;
}

// ---------- constants ----------
const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};
const MEAL_EMOJIS: Record<MealType, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍿",
};
const SCREEN_HEIGHT = Dimensions.get("window").height;

// ---------- helpers ----------
function groupByMeal(entries: FoodLogEntry[]): Record<MealType, FoodLogEntry[]> {
  const grouped: Record<MealType, FoodLogEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };
  for (const entry of entries) {
    if (grouped[entry.meal_type]) {
      grouped[entry.meal_type].push(entry);
    }
  }
  return grouped;
}

// ---------- food card ----------
function FoodEntryCard({
  entry,
  onDelete,
}: {
  entry: FoodLogEntry;
  onDelete: (id: string) => void;
}) {
  return (
    <View
      className="bg-card rounded-card p-4 mb-2 flex-row items-center justify-between"
      style={cardStyles.shadow}
    >
      <View className="flex-1 mr-3">
        <Text className="text-text-primary text-base font-bold">
          {entry.food_name}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text style={cardStyles.calText}>
            {Math.round(entry.calories)} kcal
          </Text>
          <Text className="text-text-secondary text-xs ml-3">
            P {Math.round(entry.protein)}g · C {Math.round(entry.carbs)}g · F{" "}
            {Math.round(entry.fat)}g
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => onDelete(entry.id)}
        activeOpacity={0.6}
        className="p-2"
      >
        <Text style={cardStyles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------- skeleton ----------
function FoodLogSkeleton() {
  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-4">
        <SkeletonBox width={120} height={28} borderRadius={8} />
        <SkeletonBox width={40} height={40} borderRadius={12} />
      </View>
      {[1, 2, 3].map((section) => (
        <View key={section} className="mb-6">
          <SkeletonBox width={100} height={20} borderRadius={8} />
          <View className="mt-3">
            <SkeletonBox width="100%" height={72} borderRadius={16} />
          </View>
          <View className="mt-2">
            <SkeletonBox width="100%" height={72} borderRadius={16} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ---------- add food bottom sheet modal ----------
function AddFoodModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: AddFoodPayload) => void;
  isSubmitting: boolean;
}) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scrollRef = useRef<ScrollView>(null);

  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = useCallback(() => {
    setFoodName("");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
    setMealType("breakfast");
    setErrors({});
  }, []);

  const onShow = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 150,
    }).start();
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      resetForm();
      onClose();
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!foodName.trim()) newErrors.foodName = "Food name is required";
    if (!calories || Number(calories) <= 0) newErrors.calories = "Must be greater than 0";
    if (!protein || Number(protein) <= 0) newErrors.protein = "Must be greater than 0";
    if (!carbs || Number(carbs) <= 0) newErrors.carbs = "Must be greater than 0";
    if (!fat || Number(fat) <= 0) newErrors.fat = "Must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      // scroll to top so user sees the errors
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    onSubmit({
      food_name: foodName.trim(),
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
      meal_type: mealType,
      logged_at: new Date().toISOString(),
    });
  };

  const numericFields: [string, string, (v: string) => void, string][] = [
    ["Calories", calories, setCalories, "calories"],
    ["Protein (g)", protein, setProtein, "protein"],
    ["Carbs (g)", carbs, setCarbs, "carbs"],
    ["Fat (g)", fat, setFat, "fat"],
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onShow={onShow}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={modalStyles.overlay}
      >
        {/* Backdrop */}
        <TouchableOpacity
          style={modalStyles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Sheet */}
        <Animated.View
          style={[
            modalStyles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Handle */}
          <View className="items-center pt-3 pb-4">
            <View className="w-[40px] h-[5px] rounded-full bg-gray-300" />
          </View>

          <Text className="text-text-primary text-xl font-bold px-6 mb-4">
            Add Food
          </Text>

          <ScrollView
            ref={scrollRef}
            className="px-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Food Name */}
            <Text className="text-text-secondary text-sm font-medium mb-1">
              Food Name
            </Text>
            <TextInput
              style={[
                modalStyles.input,
                { borderColor: errors.foodName ? "#EF4444" : "#E5E7EB" },
              ]}
              value={foodName}
              onChangeText={(v) => {
                setFoodName(v);
                if (errors.foodName) setErrors((e) => ({ ...e, foodName: "" }));
              }}
              placeholder="e.g. Chicken Breast"
              placeholderTextColor="#9CA3AF"
            />
            {!!errors.foodName && (
              <Text style={modalStyles.errorText}>{errors.foodName}</Text>
            )}

            {/* Numeric Fields */}
            {numericFields.map(([label, val, setter, key]) => (
              <View key={key} style={{ marginTop: 12 }}>
                <Text className="text-text-secondary text-sm font-medium mb-1">
                  {label}
                </Text>
                <TextInput
                  style={[
                    modalStyles.input,
                    { borderColor: errors[key] ? "#EF4444" : "#E5E7EB" },
                  ]}
                  value={val}
                  onChangeText={(v) => {
                    setter(v);
                    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
                  }}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                />
                {!!errors[key] && (
                  <Text style={modalStyles.errorText}>{errors[key]}</Text>
                )}
              </View>
            ))}

            {/* Meal Type Selector */}
            <Text className="text-text-secondary text-sm font-medium mt-4 mb-2">
              Meal Type
            </Text>
            <View className="flex-row" style={{ gap: 8 }}>
              {MEAL_ORDER.map((type) => {
                const isSelected = mealType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setMealType(type)}
                    activeOpacity={0.8}
                    style={[
                      modalStyles.mealPill,
                      {
                        backgroundColor: isSelected ? "#7C3AED" : "#FFFFFF",
                        borderColor: isSelected ? "#7C3AED" : "#E5E7EB",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: isSelected ? "#FFFFFF" : "#6B7280",
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      {MEAL_LABELS[type]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
              style={isSubmitting ? { opacity: 0.5, marginTop: 24 } : { marginTop: 24 }}
            >
              <LinearGradient
                colors={["#7C3AED", "#C026D3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={modalStyles.submitBtn}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700", textAlign: "center" }}>
                  {isSubmitting ? "Adding..." : "Add Food"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ height: 32 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ---------- main ----------
export default function FoodLogScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const queryClient = useQueryClient();

  // --- fetch ---
  const { data, isLoading, isError, refetch } = useQuery<FoodLogEntry[]>({
    queryKey: ["food-logs"],
    queryFn: async () => {
      const res = await api.get("/api/v1/food-logs");
      return Array.isArray(res.data) ? res.data : res.data.items ?? res.data.data ?? [];
    },
  });

  // --- add ---
  const addMutation = useMutation({
    mutationFn: async (payload: AddFoodPayload) => {
      const res = await api.post("/api/v1/food-logs", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["food-logs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setModalVisible(false);
    },
    onError: () => {
      Alert.alert("Error", "Failed to add food entry. Please try again.");
    },
  });

  // --- delete ---
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/food-logs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["food-logs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete entry. Please try again.");
    },
  });

  const handleDelete = (id: string) => {
    Alert.alert("Delete Entry", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  };

  if (isLoading) return <FoodLogSkeleton />;

  if (isError) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text className="text-danger text-base font-semibold mb-4">
          Failed to load food log
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

  const entries = data ?? [];
  const grouped = groupByMeal(entries);
  const isEmpty = entries.length === 0;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pt-14 pb-3">
        <Text className="text-text-primary text-2xl font-bold">Food Log</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
          style={headerStyles.addBtn}
        >
          <Text style={headerStyles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {isEmpty ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-[48px] mb-4">🍽️</Text>
          <Text className="text-text-secondary text-base text-center">
            No food logged today.{"\n"}Tap + to add.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {MEAL_ORDER.map((meal) => {
            const items = grouped[meal];
            if (items.length === 0) return null;
            return (
              <View key={meal} className="mb-6">
                <View className="flex-row items-center mb-3">
                  <Text className="text-[18px] mr-2">{MEAL_EMOJIS[meal]}</Text>
                  <Text className="text-text-primary text-base font-bold">
                    {MEAL_LABELS[meal]}
                  </Text>
                  <Text className="text-text-secondary text-xs ml-2">
                    {Math.round(items.reduce((sum, e) => sum + e.calories, 0))} kcal
                  </Text>
                </View>
                {items.map((entry) => (
                  <FoodEntryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={handleDelete}
                  />
                ))}
              </View>
            );
          })}
        </ScrollView>
      )}

      <AddFoodModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={(payload) => addMutation.mutate(payload)}
        isSubmitting={addMutation.isPending}
      />
    </View>
  );
}

// ---------- styles ----------
const cardStyles = StyleSheet.create({
  shadow: {
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
  deleteIcon: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "700",
  },
});

const headerStyles = StyleSheet.create({
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  addIcon: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 26,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1E1B2E",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 2,
  },
  mealPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    borderWidth: 1,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center" as const,
  },
});
