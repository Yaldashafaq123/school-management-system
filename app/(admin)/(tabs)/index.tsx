// app/(admin)/dashboard.tsx
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { BookOpen, DollarSign, Settings } from "lucide-react-native";
import {
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

  const stats = {
    totalUsers: 1245,
    activeUsers: 856,
    totalCourses: 42,
    totalTeachers: 28,
    totalStudents: 1217,
    systemHealth: 98,
  };

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
      route: "./analytics",
    },
    {
      title: "تنظیمات سیستم",
      icon: "settings",
      color: Colors.warning,
      route: "./settings",
    },
  ];

  const recentActivities = [
    { id: 1, user: "علی احمدی", action: "ثبت‌نام جدید", time: "۵ دقیقه پیش" },
    {
      id: 2,
      user: "محمد کریمی",
      action: "تکمیل دوره ریاضی",
      time: "۱ ساعت پیش",
    },
    { id: 3, user: "مریم رضایی", action: "آپلود کارخانگی", time: "۲ ساعت پیش" },
    {
      id: 4,
      user: "رضا محمدی",
      action: "ثبت‌نام در دوره جدید",
      time: "۳ ساعت پیش",
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.welcomeCard}
        >
          <View style={styles.welcomeContent}>
            <View>
              <Text style={styles.welcomeTitle}>سلام مدیر سیستم </Text>
              <Text style={styles.welcomeSubtitle}>خوش آمدید {user?.name}</Text>
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
              {stats.totalUsers.toLocaleString()}
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
              {stats.activeUsers.toLocaleString()}
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
            <Text style={styles.statValue}>{stats.totalCourses}</Text>
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
            <Text style={styles.statValue}>{stats.systemHealth}%</Text>
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
            {recentActivities.map((activity) => (
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
            ))}
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
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
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
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
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
  },
  moduleCard: {
    flex: 1,
    minWidth: "30%",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  moduleTitle: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "500",
    marginTop: 8,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "48%",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "500",
    textAlign: "center",
  },
  healthCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  healthItem: {
    marginBottom: 16,
  },
  healthInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
  },
  healthBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  activitiesList: {
    gap: 12,
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
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  activityContent: {
    flex: 1,
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
  },
  systemStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
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
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  systemStatusInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  systemStatusItem: {
    alignItems: "center",
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
