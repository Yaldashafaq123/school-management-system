// app/(hr)/(tabs)/index.tsx - Connected to Backend
import { useAuth } from "@/contexts/AuthContext";
import { hrApi, HrDashboard } from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Quick action buttons
const QUICK_ACTIONS = [
  {
    id: "add-staff",
    title: "ثبت کارمند جدید",
    icon: "person-add",
    route: "/(hr)/staff/add",
    color: "#8b5cf6",
  },
  {
    id: "attendance",
    title: "ثبت حضور",
    icon: "checkmark-circle",
    route: "/(hr)/attendance/record",
    color: "#10b981",
  },
  {
    id: "salary",
    title: "پرداخت معاش",
    icon: "wallet",
    route: "/(hr)/salaries/pay",
    color: "#f59e0b",
  },
  {
    id: "reports",
    title: "راپور HR",
    icon: "bar-chart",
    route: "/(hr)/reports",
    color: "#3b82f6",
  },
];

export default function HRDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<HrDashboard | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await hrApi.getDashboard();
      if (response.success) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  const stats = dashboard?.summary || {
    totalStaff: 0,
    activeStaff: 0,
    onLeave: 0,
    pendingRequests: 0,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Card */}
      <LinearGradient
        colors={["#8b5cf6", "#7c3aed"]}
        style={styles.welcomeCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.welcomeContent}>
          <View>
            <Text style={styles.welcomeGreeting}>سلام 👋</Text>
            <Text style={styles.welcomeName}>
              {user?.fullName || "کارمند HR"}
            </Text>
            <Text style={styles.welcomeRole}>مدیریت منابع بشری</Text>
          </View>
          <View style={styles.welcomeAvatar}>
            <Ionicons name="person" size={32} color="#8b5cf6" />
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#ede9fe" }]}>
            <Ionicons name="people" size={24} color="#8b5cf6" />
          </View>
          <Text style={styles.statValue}>{stats.totalStaff}</Text>
          <Text style={styles.statLabel}>مجموع کارمندان</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#d1fae5" }]}>
            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
          </View>
          <Text style={styles.statValue}>{stats.activeStaff}</Text>
          <Text style={styles.statLabel}>فعال</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#fef3c7" }]}>
            <Ionicons name="time" size={24} color="#f59e0b" />
          </View>
          <Text style={styles.statValue}>{stats.onLeave}</Text>
          <Text style={styles.statLabel}>در مرخصی</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#fce4ec" }]}>
            <Ionicons name="alert-circle" size={24} color="#ef4444" />
          </View>
          <Text style={styles.statValue}>{stats.pendingRequests}</Text>
          <Text style={styles.statLabel}>درخواست‌ها</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>دسترسی سریع</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickActionsScroll}
      >
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickActionButton}
            onPress={() => router.push(action.route as any)}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: action.color + "15" },
              ]}
            >
              <Ionicons
                name={action.icon as any}
                size={24}
                color={action.color}
              />
            </View>
            <Text style={styles.quickActionText}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>فعالیت‌های اخیر</Text>
      <View style={styles.activityCard}>
        <View style={styles.activityItem}>
          <View style={styles.activityDot} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>ثبت کارمند جدید</Text>
            <Text style={styles.activityDesc}>احمد رحیمی - مدیر مالی</Text>
            <Text style={styles.activityTime}>۲ ساعت پیش</Text>
          </View>
        </View>

        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: "#10b981" }]} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>درخواست مرخصی تایید شد</Text>
            <Text style={styles.activityDesc}>فاطمه حسینی - ۳ روز</Text>
            <Text style={styles.activityTime}>۵ ساعت پیش</Text>
          </View>
        </View>

        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: "#f59e0b" }]} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>معاش ماهانه پرداخت شد</Text>
            <Text style={styles.activityDesc}>۱۲ کارمند - حمل ۱۴۰۴</Text>
            <Text style={styles.activityTime}>۱ روز پیش</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  content: {
    padding: 16,
  },

  // Welcome
  welcomeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  welcomeContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeGreeting: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Vazir",
  },
  welcomeName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "VazirBold",
  },
  welcomeRole: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  welcomeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  // Stats
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  statLabel: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },

  // Quick Actions
  quickActionsScroll: {
    gap: 12,
    paddingRight: 8,
    marginBottom: 24,
  },
  quickActionButton: {
    alignItems: "center",
    width: 80,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
    fontFamily: "Vazir",
  },

  // Activity
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8b5cf6",
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  activityDesc: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  activityTime: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
});
