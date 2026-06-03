import { Tabs } from "expo-router";
import {
  Calendar,
  DollarSign,
  Home,
  MessageSquare,
  TrendingUp,
  User, // Added User icon for profile
} from "lucide-react-native";
import { Ionicons } from "@expo/vector-icons";
export default function ParentTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#3b82f6", // رنگ فعال تب‌ها
        tabBarInactiveTintColor: "#6b7280", // رنگ غیرفعال تب‌ها
        headerShown: true, // نمایش سربرگ
        headerTitleAlign: "center", // تراز وسط سربرگ
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "داشبورد", // Dashboard
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "پیشرفت", // Progress
          tabBarIcon: ({ color, size }) => (
            <TrendingUp size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "حضور", // Attendance
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          title: "فیس", // Fees
          tabBarIcon: ({ color, size }) => (
            <DollarSign size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "پیام‌ها", // Messages
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "پروفایل",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
