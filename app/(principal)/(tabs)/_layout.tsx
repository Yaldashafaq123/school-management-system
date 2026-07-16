// app/(principal)/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PrincipalTabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#f59e0b",
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
          headerTitle: "داشبورد مدیریت",
        }}
      />

      <Tabs.Screen
        name="students"
        options={{
          title: "شاگردان",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school-outline" size={size} color={color} />
          ),
          headerTitle: "مدیریت شاگردان",
        }}
      />

      <Tabs.Screen
        name="teachers"
        options={{
          title: "اساتید",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
          headerTitle: "مدیریت اساتید",
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: "راپورها",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
          headerTitle: "راپورهای مدیریتی",
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