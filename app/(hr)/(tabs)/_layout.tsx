// app/(hr)/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HRTabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#8b5cf6",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.push("/")}
            style={styles.headerBack}
          >
            <Ionicons name="home-outline" size={24} color="#1e293b" />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "داشبورد",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
          headerTitle: "داشبورد منابع بشری",
        }}
      />

      <Tabs.Screen
        name="staff"
        options={{
          title: "کارمندان",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
          headerTitle: "مدیریت کارمندان",
        }}
      />

      <Tabs.Screen
        name="attendance"
        options={{
          title: "حضور و غیاب",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
          headerTitle: "حضور و غیاب کارمندان",
        }}
      />

      <Tabs.Screen
        name="salaries"
        options={{
          title: "معاشات",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          ),
          headerTitle: "مدیریت معاشات",
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "پروفایل",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          headerTitle: "پروفایل کاربری",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    height: 65,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabLabel: {
    fontFamily: "Vazir",
    fontSize: 11,
    fontWeight: "500",
  },
  header: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontFamily: "VazirBold",
    fontSize: 18,
    color: "#1e293b",
  },
  headerBack: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});