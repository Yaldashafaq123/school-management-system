// app/(admin)/dashboard.tsx
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi, DashboardStats } from "@/src/config/adminApi";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { BookOpen, DollarSign, Settings } from "lucide-react-native";
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const quickActions = [
    {
      title: "مدیریت کاربران",
      icon: "people",
      color: Colors.primary,
      route: "/(admin)/users",
    },
    {
      title: "مدیریت دوره‌ها",
      icon: "book",
      color: Colors.secondary,
      route: "/(admin)/courses",
    },
    {
      title: "گزارشات",
      icon: "analytics",
      color: Colors.success,
      route: "/(admin)/analytics",
    },
    {
      title: "تنظیمات سیستم",
      icon: "settings",
      color: Colors.warning,
      route: "/(admin)/settings",
    },
  ];

  const systemHealthItems = [
    { label: "سرور", value: 100, status: "excellent" },
    { label: "دیتابیس", value: 98, status: "good" },
    { label: "فضای ذخیره‌سازی", value: 75, status: "warning" },
    { label: "پهنای باند", value: 60, status: "normal" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return Colors.success;
      case "good":
        return Colors.info;
      case "warning":
        return Colors.warning;
      case "normal":
        return Colors.primary;
      default:
        return Colors.textSecondary;
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="داشبورد مدیریت" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="داشبورد مدیریت"
        rightComponent={
          <TouchableOpacity onPress={() => router.push("/notifications")}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={Colors.text}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Welcome Section */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.welcomeCard}
        >
          <View style={styles.welcomeContent}>
            <View>
              <Text style={styles.welcomeTitle}>سلام مدیر سیستم</Text>
              <Text style={styles.welcomeSubtitle}>
                خوش آمدید {user?.fullName || "مدیر"}
              </Text>
            </View>
            <Ionicons name="shield-checkmark" size={40} color="#fff" />
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "rgba(59, 130, 246, 0.1)" },
              ]}
            >
              <Ionicons name="people" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>
              {stats?.totalUsers?.toLocaleString() || 0}
            </Text>
            <Text style={styles.statLabel}>کاربر کل</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "rgba(16, 185, 129, 0.1)" },
              ]}
            >
              <Ionicons name="person-circle" size={24} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>
              {stats?.activeUsers?.toLocaleString() || 0}
            </Text>
            <Text style={styles.statLabel}>کاربر فعال</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "rgba(139, 92, 246, 0.1)" },
              ]}
            >
              <Ionicons name="book" size={24} color={Colors.secondary} />
            </View>
            <Text style={styles.statValue}>{stats?.totalCourses || 0}</Text>
            <Text style={styles.statLabel}>دوره</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "rgba(245, 158, 11, 0.1)" },
              ]}
            >
              <Ionicons name="school" size={24} color={Colors.warning} />
            </View>
            <Text style={styles.statValue}>{stats?.systemHealth || 98}%</Text>
            <Text style={styles.statLabel}>سلامت سیستم</Text>
          </View>
        </View>

        {/* Quick Access Modules */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>دسترسی سریع</Text>
          <View style={styles.modulesGrid}>
            <Link href="/(admin)/academic" asChild>
              <TouchableOpacity style={styles.moduleCard}>
                <BookOpen size={24} color="#007AFF" />
                <Text style={styles.moduleTitle}>درسی</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(admin)/financial" asChild>
              <TouchableOpacity style={styles.moduleCard}>
                <DollarSign size={24} color="#34C759" />
                <Text style={styles.moduleTitle}>مالی</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(admin)/system" asChild>
              <TouchableOpacity style={styles.moduleCard}>
                <Settings size={24} color="#FF9500" />
                <Text style={styles.moduleTitle}>سیستم</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>دسترسی سریع</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={() => router.push(action.route as any)}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: `${action.color}20` },
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color={action.color}
                  />
                </View>
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Financial Summary */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>خلاصه مالی</Text>
          <View style={styles.financialCard}>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>کل درآمد:</Text>
              <Text style={styles.financialValue}>
                {stats?.totalIncome?.toLocaleString() || 0} تومان
              </Text>
            </View>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>شهریه‌های معوق:</Text>
              <Text style={[styles.financialValue, { color: Colors.warning }]}>
                {stats?.pendingFees || 0} مورد
              </Text>
            </View>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>معلمان:</Text>
              <Text style={styles.financialValue}>
                {stats?.totalTeachers || 0} نفر
              </Text>
            </View>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>دانش‌آموزان:</Text>
              <Text style={styles.financialValue}>
                {stats?.totalStudents || 0} نفر
              </Text>
            </View>
          </View>
        </View> */}

        {/* System Health */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>سلامت سیستم</Text>
          <View style={styles.healthCard}>
            {systemHealthItems.map((item, index) => (
              <View key={index} style={styles.healthItem}>
                <View style={styles.healthInfo}>
                  <Text style={styles.healthLabel}>{item.label}</Text>
                  <Text
                    style={[
                      styles.healthValue,
                      { color: getStatusColor(item.status) },
                    ]}
                  >
                    {item.value}%
                  </Text>
                </View>
                <View style={styles.healthBar}>
                  <View
                    style={[
                      styles.healthBarFill,
                      {
                        width: `${item.value}%`,
                        backgroundColor: getStatusColor(item.status),
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>فعالیت‌های اخیر</Text>
            <TouchableOpacity onPress={() => router.push("/(admin)/analytics")}>
              <Text style={styles.seeAllText}>مشاهده همه</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activitiesList}>
            {stats?.recentActivities?.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  هیچ فعالیتی ثبت نشده است
                </Text>
              </View>
            ) : (
              stats?.recentActivities?.map((activity) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons
                      name="time"
                      size={16}
                      color={Colors.textSecondary}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>
                      <Text style={styles.activityUser}>{activity.user}</Text>{" "}
                      {activity.action}
                    </Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* System Status */}
        <View style={styles.section}>
          <View style={styles.systemStatusCard}>
            <View style={styles.systemStatusHeader}>
              <Ionicons name="server" size={24} color={Colors.primary} />
              <Text style={styles.systemStatusTitle}>وضعیت سرور</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${Colors.success}20` },
                ]}
              >
                <Text
                  style={[styles.statusBadgeText, { color: Colors.success }]}
                >
                  آنلاین
                </Text>
              </View>
            </View>
            <View style={styles.systemStatusInfo}>
              <View style={styles.systemStatusItem}>
                <Text style={styles.systemStatusLabel}>آپتایم:</Text>
                <Text style={styles.systemStatusValue}>۹۹.۹٪</Text>
              </View>
              <View style={styles.systemStatusItem}>
                <Text style={styles.systemStatusLabel}>پاسخ سرور:</Text>
                <Text style={styles.systemStatusValue}>۱۲۲ms</Text>
              </View>
              <View style={styles.systemStatusItem}>
                <Text style={styles.systemStatusLabel}>بار سرور:</Text>
                <Text style={styles.systemStatusValue}>۲۴٪</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
    // ✅ ADD THIS: Ensures proper scrolling
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    // ✅ ADD THIS: Prevents compression
    flexShrink: 0,
  },
  welcomeContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
    // ✅ ADD THIS: Forces proper wrapping
    justifyContent: "space-between",
  },
  statCard: {
    // ✅ CHANGE: Don't use flex:1 with percentages
    width: "47%", // Use exact width instead of flex:1
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    // ✅ ADD THIS: Prevents shrinking
    flexShrink: 0,
    // ✅ ADD THIS: Prevents growing beyond container
    flexGrow: 0,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    flexShrink: 0,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
    // ✅ ADD THIS: Prevents text from breaking layout
    minHeight: 28,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
    // ✅ ADD THIS: Ensures section doesn't compress
    flexShrink: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
    flexShrink: 0,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  modulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
    // ✅ ADD THIS: Prevents wrapping issues
    justifyContent: "space-between",
  },
  moduleCard: {
    // ✅ CHANGE: Use exact width
    width: "30%",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    // ✅ ADD THESE: Prevent compression
    flexShrink: 0,
    flexGrow: 0,
    minHeight: 80,
  },
  moduleTitle: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "center",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    // ✅ ADD THIS: Ensures proper spacing
    justifyContent: "space-between",
  },
  actionCard: {
    // ✅ CHANGE: Use exact width
    width: "47%",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    // ✅ ADD THESE: Prevent compression
    flexShrink: 0,
    flexGrow: 0,
    minHeight: 100,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    flexShrink: 0,
  },
  actionText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "500",
    textAlign: "center",
  },
  financialCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexShrink: 0,
  },
  financialItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    flexShrink: 0,
  },
  financialLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  financialValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  healthCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexShrink: 0,
  },
  healthItem: {
    marginBottom: 16,
    flexShrink: 0,
  },
  healthInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    flexShrink: 0,
  },
  healthLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  healthValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  healthBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
    flexShrink: 0,
  },
  healthBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  activitiesList: {
    gap: 12,
  },
  emptyState: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    flexShrink: 0,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    flexShrink: 0,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  activityContent: {
    flex: 1,
    flexShrink: 1,
  },
  activityText: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  activityUser: {
    fontWeight: "bold",
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  systemStatusCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    flexShrink: 0,
  },
  systemStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
    flexShrink: 0,
  },
  systemStatusTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexShrink: 0,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  systemStatusInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexShrink: 0,
  },
  systemStatusItem: {
    alignItems: "center",
    flexShrink: 0,
  },
  systemStatusLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  systemStatusValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
});
