// app/(finance)/(tabs)/_layout.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FinanceTabsLayout() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#3b82f6",
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
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.push("/(public)/notifications")}
            style={styles.headerNotification}
          >
            <Ionicons name="notifications-outline" size={24} color="#1e293b" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        ),
      }}
    >
      {/* Tab 1: Dashboard */}
      <Tabs.Screen
        name="index"
        options={{
          title: "داشبورد",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
          headerTitle: "داشبورد مالی",
        }}
      />

      {/* Tab 2: Fees */}
      <Tabs.Screen
        name="fees"
        options={{
          title: "فیس",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school-outline" size={size} color={color} />
          ),
          headerTitle: "مدیریت فیس",
        }}
      />

      {/* Tab 3: Analytics */}
      <Tabs.Screen
        name="analytics"
        options={{
          title: "تحلیل",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
          headerTitle: "تحلیل مالی",
        }}
      />

      {/* Tab 4: Transactions */}
      <Tabs.Screen
        name="transactions"
        options={{
          title: "تراکنش‌ها",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
          headerTitle: "تاریخچه تراکنش‌ها",
        }}
      />

      {/* Tab 5: Profile */}
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
  headerNotification: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "Vazir",
  },
});
