// app/(hr)/(tabs)/index.tsx - Updated with new features
import { useAuth } from "@/contexts/AuthContext";
import { hrApi } from "@/src/config/hrApi";
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
    id: "leave",
    title: "درخواست مرخصی",
    icon: "calendar",
    route: "/(hr)/leaves/request",
    color: "#f59e0b",
  },
  {
    id: "id-card",
    title: "کارت شناسایی",
    icon: "card",
    route: "/(hr)/id-cards",
    color: "#3b82f6",
  },
];

// HR Modules
const HR_MODULES = [
  {
    id: "leaves",
    title: "مدیریت مرخصی",
    description: "درخواست‌ها و موجودی مرخصی",
    icon: "calendar-outline",
    route: "/(hr)/leaves",
    color: "#f59e0b",
  },
  {
    id: "evaluations",
    title: "ارزیابی عملکرد",
    description: "ارزیابی اساتید و کارمندان",
    icon: "stats-chart-outline",
    route: "/(hr)/evaluations",
    color: "#8b5cf6",
  },
  {
    id: "documents",
    title: "مرکز اسناد",
    description: "مدیریت قراردادها و مدارک",
    icon: "folder-outline",
    route: "/(hr)/documents",
    color: "#3b82f6",
  },
  {
    id: "id-cards",
    title: "کارت‌های شناسایی",
    description: "صدور و چاپ کارت",
    icon: "card-outline",
    route: "/(hr)/id-cards",
    color: "#10b981",
  },
  {
    id: "warnings",
    title: "سیستم اخطار",
    description: "مدیریت اخطارها",
    icon: "alert-circle-outline",
    route: "/(hr)/warnings",
    color: "#ef4444",
  },
];

export default function HRDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);

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
    pendingLeaves: 0,
    expiringContracts: 0,
    totalWarnings: 0,
    todayAttendance: 0,
    attendanceRate: 0,
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
            <Ionicons name="calendar" size={24} color="#f59e0b" />
          </View>
          <Text style={styles.statValue}>{stats.pendingLeaves}</Text>
          <Text style={styles.statLabel}>درخواست مرخصی</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#fce4ec" }]}>
            <Ionicons name="alert-circle" size={24} color="#ef4444" />
          </View>
          <Text style={styles.statValue}>{stats.totalWarnings}</Text>
          <Text style={styles.statLabel}>اخطارها</Text>
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

      {/* HR Modules */}
      <Text style={styles.sectionTitle}>بخش‌های HR</Text>
      <View style={styles.modulesGrid}>
        {HR_MODULES.map((module) => (
          <TouchableOpacity
            key={module.id}
            style={styles.moduleCard}
            onPress={() => router.push(module.route as any)}
          >
            <View
              style={[
                styles.moduleIcon,
                { backgroundColor: module.color + "15" },
              ]}
            >
              <Ionicons
                name={module.icon as any}
                size={28}
                color={module.color}
              />
            </View>
            <Text style={styles.moduleTitle}>{module.title}</Text>
            <Text style={styles.moduleDesc}>{module.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>فعالیت‌های اخیر</Text>
      <View style={styles.activityCard}>
        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: "#f59e0b" }]} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>درخواست مرخصی جدید</Text>
            <Text style={styles.activityDesc}>احمد رحیمی - ۳ روز</Text>
            <Text style={styles.activityTime}>۲ ساعت پیش</Text>
          </View>
        </View>

        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: "#10b981" }]} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>ارزیابی عملکرد تکمیل شد</Text>
            <Text style={styles.activityDesc}>فاطمه حسینی - استاد ریاضی</Text>
            <Text style={styles.activityTime}>۵ ساعت پیش</Text>
          </View>
        </View>

        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: "#3b82f6" }]} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>قرارداد جدید ثبت شد</Text>
            <Text style={styles.activityDesc}>محمد کریمی - استاد زبان</Text>
            <Text style={styles.activityTime}>۱ روز پیش</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
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
  content: { padding: 16 },
  welcomeCard: { borderRadius: 16, padding: 20, marginBottom: 20 },
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  quickActionsScroll: { gap: 12, paddingRight: 8, marginBottom: 24 },
  quickActionButton: { alignItems: "center", width: 80 },
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
  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  moduleCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  moduleDesc: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    fontFamily: "Vazir",
  },
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
  activityContent: { flex: 1 },
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
