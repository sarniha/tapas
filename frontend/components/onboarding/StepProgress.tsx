import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface StepProgressProps {
  step: number;
  totalSteps?: number;
}

export function StepProgress({ step, totalSteps = 5 }: StepProgressProps) {
  const progress = useRef(new Animated.Value(step / totalSteps)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: step / totalSteps,
      duration: 350,
      useNativeDriver: false, // width animation can't use native driver
    }).start();
  }, [step, totalSteps, progress]);

  const widthInterpolated = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fillWrapper, { width: widthInterpolated }]}>
        <LinearGradient
          colors={["#7C3AED", "#C026D3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.fill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 24,
  },
  fillWrapper: {
    height: "100%",
    overflow: "hidden",
    borderRadius: 999,
  },
  fill: {
    flex: 1,
    borderRadius: 999,
  },
});