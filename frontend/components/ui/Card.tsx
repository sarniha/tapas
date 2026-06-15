import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "", style, ...props }: CardProps) {
  return (
    <View
      className={`bg-card rounded-card p-4 shadow-sm ${className}`}
      style={[{ shadowColor: "#7C3AED", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }, style as any]}
      {...props}
    >
      {children}
    </View>
  );
}