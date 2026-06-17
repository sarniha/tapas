import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface OptionCardProps {
  emoji: string;
  label: string;
  sublabel?: string;
  selected: boolean;
  onPress: () => void;
}

export function OptionCard({ emoji, label, sublabel, selected, onPress }: OptionCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, selected && styles.cardSelected]}
    >
      {selected && (
        <LinearGradient
          colors={["#7C3AED", "#C026D3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.accentBar}
        />
      )}
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.textWrap}>
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
        {sublabel ? (
          <Text style={[styles.sublabel, selected && styles.sublabelSelected]}>{sublabel}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    overflow: "hidden",
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: "#7C3AED",
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  emoji: {
    fontSize: 24,
    marginRight: 14,
    marginLeft: 4,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: "#1E1B2E",
    fontWeight: "500",
  },
  labelSelected: {
    color: "#7C3AED",
    fontWeight: "700",
  },
  sublabel: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  sublabelSelected: {
    color: "#7C3AED",
  },
});
