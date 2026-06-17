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
type WorkoutType = "cardio" | "strength" | "flexibility" | "other";

interface WorkoutEntry {
  id: string;
  exercise_name: string;
  duration_minutes: number;
  calories_burned: number;
  workout_type: WorkoutType;
  logged_at: string;
}

interface AddWorkoutPayload {
  exercise_name: string;
  duration_minutes: number;
  calories_burned: number;
  workout_type: WorkoutType;
  logged_at: string;
}

// ---------- constants ----------
const WORKOUT_TYPES: WorkoutType[] = ["cardio", "strength", "flexibility", "other"];
const WORKOUT_TYPE_LABELS: Record<WorkoutType, string> = {
  cardio: "Cardio",
  strength: "Strength",
  flexibility: "Flexibility",
  other: "Other",
};
const WORKOUT_TYPE_EMOJIS: Record<WorkoutType, string> = {
  cardio: "🏃",
  strength: "🏋️",
  flexibility: "🧘",
  other: "⚡",
};

const SCREEN_HEIGHT = Dimensions.get("window").height;

// ---------- workout card ----------
function WorkoutEntryCard({
  entry,
  onDelete,
}: {
  entry: WorkoutEntry;
  onDelete: (id: string) => void;
}) {
  return (
    <View
      className="bg-white rounded-2xl p-4 mb-3 flex-row items-center justify-between"
      style={cardStyles.shadow}
    >
      <View className="flex-1 mr-3">
        <View className="flex-row items-center mb-1">
          <Text className="text-text-primary text-base font-bold">
            {entry.exercise_name}
          </Text>
          {entry.workout_type && (
            <View style={cardStyles.typeBadge}>
              <Text style={cardStyles.typeBadgeText}>
                {WORKOUT_TYPE_EMOJIS[entry.workout_type]} {WORKOUT_TYPE_LABELS[entry.workout_type]}
              </Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center mt-1" style={{ gap: 12 }}>
          <Text style={cardStyles.durationText}>
            ⏱ {Math.round(entry.duration_minutes)} min
          </Text>
          <Text style={cardStyles.calText}>
            🔥 {Math.round(entry.calories_burned)} kcal
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
function WorkoutLogSkeleton() {
  return (
    <View className="flex-1 bg-background p-4">
      <View className="flex-row justify-between items-center mb-6">
        <SkeletonBox width={140} height={28} borderRadius={8} />
        <SkeletonBox width={40} height={40} borderRadius={12} />
      </View>
      {[1, 2, 3].map((i) => (
        <View key={i} className="mb-3">
          <SkeletonBox width="100%" height={76} borderRadius={16} />
        </View>
      ))}
    </View>
  );
}

// ---------- add workout modal ----------
function AddWorkoutModal({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: AddWorkoutPayload) => void;
  isSubmitting: boolean;
}) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scrollRef = useRef<ScrollView>(null);

  const [exerciseName, setExerciseName] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const [workoutType, setWorkoutType] = useState<WorkoutType>("cardio");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = useCallback(() => {
    setExerciseName("");
    setDuration("");
    setCalories("");
    setWorkoutType("cardio");
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
    if (!exerciseName.trim()) newErrors.exerciseName = "Exercise name is required";
    if (!duration || Number(duration) <= 0) newErrors.duration = "Must be greater than 0";
    if (!calories || Number(calories) <= 0) newErrors.calories = "Must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    onSubmit({
      exercise_name: exerciseName.trim(),
      duration_minutes: Number(duration),
      calories_burned: Number(calories),
      workout_type: workoutType,
      logged_at: new Date().toISOString(),
    });
  };

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
        <TouchableOpacity
          style={modalStyles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
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
            Add Workout
          </Text>

          <ScrollView
            ref={scrollRef}
            className="px-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Exercise Name */}
            <Text className="text-text-secondary text-sm font-medium mb-1">
              Exercise Name
            </Text>
            <TextInput
              style={[
                modalStyles.input,
                { borderColor: errors.exerciseName ? "#EF4444" : "#E5E7EB" },
              ]}
              value={exerciseName}
              onChangeText={(v) => {
                setExerciseName(v);
                if (errors.exerciseName)
                  setErrors((e) => ({ ...e, exerciseName: "" }));
              }}
              placeholder="e.g. Running, Cycling"
              placeholderTextColor="#9CA3AF"
            />
            {!!errors.exerciseName && (
              <Text style={modalStyles.errorText}>{errors.exerciseName}</Text>
            )}

            {/* Duration */}
            <View style={{ marginTop: 12 }}>
              <Text className="text-text-secondary text-sm font-medium mb-1">
                Duration (minutes)
              </Text>
              <TextInput
                style={[
                  modalStyles.input,
                  { borderColor: errors.duration ? "#EF4444" : "#E5E7EB" },
                ]}
                value={duration}
                onChangeText={(v) => {
                  setDuration(v);
                  if (errors.duration)
                    setErrors((e) => ({ ...e, duration: "" }));
                }}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
              />
              {!!errors.duration && (
                <Text style={modalStyles.errorText}>{errors.duration}</Text>
              )}
            </View>

            {/* Calories Burned */}
            <View style={{ marginTop: 12 }}>
              <Text className="text-text-secondary text-sm font-medium mb-1">
                Calories Burned
              </Text>
              <TextInput
                style={[
                  modalStyles.input,
                  { borderColor: errors.calories ? "#EF4444" : "#E5E7EB" },
                ]}
                value={calories}
                onChangeText={(v) => {
                  setCalories(v);
                  if (errors.calories)
                    setErrors((e) => ({ ...e, calories: "" }));
                }}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
              />
              {!!errors.calories && (
                <Text style={modalStyles.errorText}>{errors.calories}</Text>
              )}
            </View>

            {/* Workout Type Selector */}
            <Text className="text-text-secondary text-sm font-medium mt-4 mb-2">
              Workout Type
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {WORKOUT_TYPES.map((type) => {
                const isSelected = workoutType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setWorkoutType(type)}
                    activeOpacity={0.8}
                    style={[
                      modalStyles.typePill,
                      {
                        backgroundColor: isSelected ? "#7C3AED" : "#FFFFFF",
                        borderColor: isSelected ? "#7C3AED" : "#E5E7EB",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: isSelected ? "#FFFFFF" : "#6B7280",
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {WORKOUT_TYPE_EMOJIS[type]} {WORKOUT_TYPE_LABELS[type]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Submit */}
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
                  {isSubmitting ? "Adding..." : "Add Workout"}
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
export default function WorkoutLogScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery<WorkoutEntry[]>({
    queryKey: ["workout-logs"],
    queryFn: async () => {
      const res = await api.get("/api/v1/workout-logs");
      return Array.isArray(res.data)
        ? res.data
        : res.data.items ?? res.data.data ?? [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload: AddWorkoutPayload) => {
      const res = await api.post("/api/v1/workout-logs", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-logs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setModalVisible(false);
    },
    onError: (error: any) => {
      console.log("POST error:", JSON.stringify(error?.response?.data));
      Alert.alert("Error", "Failed to add workout. Please try again.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/workout-logs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-logs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => {
      Alert.alert("Error", "Failed to delete entry. Please try again.");
    },
  });

  const handleDelete = (id: string) => {
    Alert.alert("Delete Workout", "Are you sure you want to delete this entry?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  };

  if (isLoading) return <WorkoutLogSkeleton />;

  if (isError) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-6">
        <Text style={{ color: "#EF4444", fontSize: 16, fontWeight: "600", marginBottom: 16, textAlign: "center" }}>
          Failed to load workout log
        </Text>
        <TouchableOpacity
          style={{ backgroundColor: "#7C3AED", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
          onPress={() => refetch()}
          activeOpacity={0.8}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const entries = data ?? [];
  const isEmpty = entries.length === 0;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pt-14 pb-3">
        <Text className="text-text-primary text-2xl font-bold">Workout Log</Text>
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
          <Text className="text-[48px] mb-4">💪</Text>
          <Text className="text-text-secondary text-base text-center">
            No workouts logged today.{"\n"}Tap + to add.
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-2">
            {entries.map((entry) => (
              <WorkoutEntryCard
                key={entry.id}
                entry={entry}
                onDelete={handleDelete}
              />
            ))}
          </View>
        </ScrollView>
      )}

      <AddWorkoutModal
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
  typeBadge: {
    marginLeft: 8,
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  typeBadgeText: {
    fontSize: 11,
    color: "#7C3AED",
    fontWeight: "600",
  },
  durationText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
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
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center" as const,
  },
});
