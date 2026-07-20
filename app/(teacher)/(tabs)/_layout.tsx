import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../../constants/Colors";

export default function TeacherTabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Platform.OS === "ios" ? "transparent" : Colors.card,
          borderTopColor: Colors.border,
          borderTopWidth: 1,

          // ✅ FIXED: Prevents clipping on left/right edges
          paddingHorizontal: 12,

          // ✅ FIXED: Proper height with safe area
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,

          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 5,
        },

        tabBarBackground:
          Platform.OS === "ios"
            ? () => (
                <BlurView
                  tint="light"
                  intensity={80}
                  // ✅ FIXED: Added borderRadius to match tab bar corners
                  style={[StyleSheet.absoluteFill, { borderRadius: 0 }]}
                />
              )
            : undefined,

        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },

        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "داشبورد",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="speedometer" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="courses"
        options={{
          title: "دوره‌ها",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="students"
        options={{
          title: "دانش‌آموزان",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="grading"
        options={{
          title: "نمره‌دهی",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle" size={size} color={color} />
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
