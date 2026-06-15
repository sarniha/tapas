import { View, Text } from "react-native";

interface ProgressBarProps {
  label: string;
  actual: number;
  target: number;
  unit?: string;
  color?: string;
}

export function ProgressBar({
  label,
  actual,
  target,
  unit = "g",
  color = "#7C3AED",
}: ProgressBarProps) {
  const pct = Math.min((actual / target) * 100, 100);
  const over = actual > target;

  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <Text className="text-text-secondary text-sm">{label}</Text>
        <Text className="text-text-primary text-sm font-medium">
          {actual}
          <Text className="text-text-secondary">/{target}{unit}</Text>
        </Text>
      </View>
      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <View
          style={{
            width: `${pct}%`,
            backgroundColor: over ? "#EF4444" : color,
            height: "100%",
            borderRadius: 999,
          }}
        />
      </View>
    </View>
  );
}