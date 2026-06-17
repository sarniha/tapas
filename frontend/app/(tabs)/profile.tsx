import { View, Text } from "react-native";

export default function ProfileScreen() {
  return (
    <View className="flex-1 bg-background items-center justify-center p-6">
      <Text className="text-[40px] mb-4">👤</Text>
      <Text className="text-text-primary text-lg font-bold">Profile</Text>
      <Text className="text-text-secondary text-sm mt-2">Coming soon</Text>
    </View>
  );
}
