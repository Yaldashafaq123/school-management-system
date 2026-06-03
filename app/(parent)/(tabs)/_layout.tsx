import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
  Calendar,
  DollarSign,
  Home,
  MessageSquare,
  TrendingUp,
} from "lucide-react-native";
import { Platform } from "react-native";
import { Colors } from "../../../constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ParentTabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "center",

        tabBarStyle: {
          backgroundColor: Platform.OS === "ios" ? "transparent" : Colors.card,
          borderTopColor: Colors.border,
          borderTopWidth: 1,

          // ✅ correct height
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,

          // optional shadow
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 5,
        },

        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#6b7280",

        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "داشبورد",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: "پیشرفت",
          tabBarIcon: ({ color, size }) => (
            <TrendingUp size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="attendance"
        options={{
          title: "حضور",
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="fees"
        options={{
          title: "فیس",
          tabBarIcon: ({ color, size }) => (
            <DollarSign size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: "پیام‌ها",
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