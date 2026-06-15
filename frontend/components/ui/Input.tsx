import { useState } from "react";
import { View, TextInput, Text, TextInputProps, TouchableOpacity } from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  secureToggle?: boolean;
}

export function Input({ label, error, secureToggle, secureTextEntry, ...props }: InputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-text-secondary text-sm font-medium mb-1">{label}</Text>
      )}
      <View className="relative">
        <TextInput
          className={`bg-card border rounded-btn px-4 py-3 text-text-primary text-base ${
            error ? "border-danger" : "border-gray-200"
          }`}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureToggle ? !visible : secureTextEntry}
          {...props}
        />
        {secureToggle && (
          <TouchableOpacity
            className="absolute right-4 top-3.5"
            onPress={() => setVisible((v) => !v)}
          >
            <Text className="text-text-secondary text-sm">{visible ? "Hide" : "Show"}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-danger text-xs mt-1">{error}</Text>}
    </View>
  );
}