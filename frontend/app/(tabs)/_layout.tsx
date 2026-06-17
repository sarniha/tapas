import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function TabBarIcon({
  name,
  color,
}: {
  name: IoniconName;
  color: string;
}) {
  return <Ionicons name={name} size={22} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#7C3AED",
        tabBarInactiveTintColor: "#6B7280",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="food-log"
        options={{
          title: "Food Log",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="nutrition" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout-log"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="barbell" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="time" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="checkin"
        options={{
          title: "Check-in",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="scale" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-suggestions"
        options={{
          title: "AI",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="sparkles" color={color} />
          ),
        }}
      />
      {/* Keep profile hidden from tab bar */}
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
