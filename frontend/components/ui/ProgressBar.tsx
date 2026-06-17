import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";

interface ProgressBarProps {
  /** Progress value between 0 and 1 */
  value: number;
  /** Fill color */
  color: string;
  /** Bar height in pixels */
  height?: number;
}

export function ProgressBar({
  value,
  color,
  height = 8,
}: ProgressBarProps) {
  const clampedValue = Math.min(Math.max(value, 0), 1);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: clampedValue,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [clampedValue, animatedWidth]);

  return (
    <View style={[styles.track, { height, borderRadius: 999 }]}>
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius: 999,
            backgroundColor: color,
            width: animatedWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  fill: {
    position: "absolute",
    left: 0,
    top: 0,
  },
});