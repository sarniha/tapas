import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = "primary",
  loading = false,
  fullWidth = true,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const base = "items-center justify-center py-4 rounded-btn";
  const variants = {
    primary: "bg-primary",
    outline: "border-2 border-primary bg-transparent",
    ghost: "bg-transparent",
  };
  const textVariants = {
    primary: "text-white font-semibold text-base",
    outline: "text-primary font-semibold text-base",
    ghost: "text-primary font-medium text-base",
  };

  return (
    <TouchableOpacity
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${disabled || loading ? "opacity-50" : ""}`}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#7C3AED"} />
      ) : (
        <Text className={textVariants[variant]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}