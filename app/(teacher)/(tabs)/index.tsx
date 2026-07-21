import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Header } from "../../../components/Header";
import { Colors } from "../../../constants/Colors";
import { useAuth } from "../../../contexts/AuthContext";
import { apiRequest } from "../../../src/config/api";

// Safe default dashboard data
const defaultDashboard = {
  stats: {
    total_classes: 0,
    total_students: 0,
    attendance_today: "0",
    pending_assignments: 0,
    total_courses: 0,
    revenue: 0,
    rating: 0,
  },
  recentActivities: [],
  quickActions: [
    {
      id: 1,
      title: "ایجاد دوره آموزشی",
      icon: "book",
      color: Colors.primary,
      route: "/(teacher)/courses/create",
    },
    {
      id: 2,
      title: "کارخانگی جدید",
      icon: "document-text",
      color: Colors.success,
      route: "/(teacher)/assignment/create",
    },
    {
      id: 3,
      title: "صنف های من",
      icon: "school",
      color: Colors.info,
      route: "/(teacher)/classes",
    },
    {
      id: 4,
      title: "ثبت حضورغیاب",
      icon: "calendar",
      color: Colors.warning,
      route: "/(teacher)/attendance/take",
    },
    {
      id: 5,
      title: "مدیریت دانش‌آموزان",
      icon: "people",
      color: Colors.danger,
      route: "/(teacher)/(tabs)/students",
    },
    {
      id: 6,
      title: "تصحیح کارخانگی",
      icon: "create",
      color: Colors.primary,
      route: "/(teacher)/grading1",
    },
    {
      id: 7,
      title: "ورود نمرات",
      icon: "stats-chart",
      color: Colors.info,
      route: "/(teacher)/grading",
    },
    {
      id: 8,
      title: " ارزیابی هفتگی",
      icon: "library",
      color: Colors.primary,
      route: "/(teacher)/WeeklyAssessment/WeeklyAssessmentListScreen",
    },
    {
      id: 9,
      title: "درخواست مرخصی",
      icon: "calendar",
      color: Colors.warning,
      route: "/(teacher)/requests/leave",
    },
    {
      id: 10,
      title: "درخواست افزایش معاش",
      icon: "cash",
      color: Colors.success,
      route: "/(teacher)/requests/salary-raise",
    },
    {
      id: 11,
      title: "گزارش حضور و غیاب",
      icon: "time",
      color: Colors.info,
      route: "/(teacher)/attendance/report",
    },
    {
      id: 12,
      title: "درخواست‌های من",
      icon: "list",
      color: Colors.primary,
      route: "/(teacher)/requests",
    },
    {
      id: 13,
      title: "گزارش معاش",
      icon: "cash",
      color: Colors.success,
      route: "/(teacher)/salary/report",
    },
  ],
};

export default function TeacherDashboardTab() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets(); // ✅ ADDED
  const [dashboard, setDashboard] = useState(defaultDashboard);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/teacher/dashboard");

      if (data && data.stats) {
        setDashboard({
          stats: {
            total_classes: data.stats.total_classes || 0,
            total_students: data.stats.total_students || 0,
            attendance_today: data.stats.attendance_today?.toString() || "0",
            pending_assignments: data.stats.pending_assignments || 0,
            total_courses: data.stats.total_courses || 0,
            revenue: data.stats.revenue || 0,
            rating: data.stats.rating || 0,
          },
          recentActivities: data.recentActivities || [],
          quickActions: defaultDashboard.quickActions,
        });
      } else {
        console.log("Unexpected data format:", data);
      }
    } catch (error) {
      console.log("Dashboard API error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const handleNavigation = (route: string) => {
    try {
      router.push(route as any);
    } catch (error) {
      Alert.alert("خطا", "این بخش در حال توسعه است");
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return "document-text";
      case "exam":
        return "clipboard";
      case "submission":
        return "arrow-up-circle";
      case "attendance":
        return "calendar";
      case "lesson":
        return "book";
      default:
        return "notifications";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </SafeAreaView>
    );
  }

  return (
    // ✅ FIXED: Removed edges prop to handle both top and bottom properly
    <SafeAreaView style={styles.container}>
      <Header
        title="داشبورد معلم"
        rightComponent={
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => handleNavigation("/(public)/notifications")}
              style={styles.headerButton}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={Colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleNavigation("/(teacher)/profile")}
              style={styles.headerButton}
            >
              <Ionicons
                name="person-circle-outline"
                size={24}
                color={Colors.text}
              />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        style={styles.content}
        // ✅ FIXED: Added contentContainerStyle with proper bottom padding
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20, // Space above tab bar
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View>
            <Text style={styles.welcomeTitle}>
              سلام، {user?.fullName || "استاد"}
            </Text>
            <Text style={styles.welcomeText}>
              {dashboard.stats.pending_assignments > 0
                ? `${dashboard.stats.pending_assignments} کارخانگی برای تصحیح دارید`
                : "خوش آمدید! هیچ فعالیتی در انتظار نیست"}
            </Text>
          </View>
          <View style={styles.welcomeIcons}>
            <Ionicons name="school-outline" size={32} color={Colors.primary} />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => handleNavigation("/(teacher)/classes")}
          >
            <Ionicons name="school-outline" size={20} color={Colors.primary} />
            <Text style={styles.statValue}>
              {dashboard.stats.total_classes}
            </Text>
            <Text style={styles.statLabel}>صنوف درسی</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => handleNavigation("/(teacher)/(tabs)/students")}
          >
            <Ionicons name="people-outline" size={20} color={Colors.success} />
            <Text style={styles.statValue}>
              {dashboard.stats.total_students}
            </Text>
            <Text style={styles.statLabel}>دانش‌آموز</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => handleNavigation("/(teacher)/attendance/take")}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={Colors.warning}
            />
            <Text style={styles.statValue}>
              {dashboard.stats.attendance_today}
            </Text>
            <Text style={styles.statLabel}>حضور امروز</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => handleNavigation("/(teacher)/grading")}
          >
            <Ionicons
              name="document-text-outline"
              size={20}
              color={Colors.danger}
            />
            <Text style={styles.statValue}>
              {dashboard.stats.pending_assignments}
            </Text>
            <Text style={styles.statLabel}>کارخانگی</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>دسترسی سریع</Text>
          <View style={styles.actionsGrid}>
            {dashboard.quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => handleNavigation(action.route)}
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

        {/* Recent Activities */}
        {dashboard.recentActivities.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>فعالیت‌های اخیر</Text>
              <TouchableOpacity
                onPress={() => handleNavigation("/(teacher)/activities")}
              >
                <Text style={styles.viewAllText}>مشاهده همه</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.activitiesList}>
              {dashboard.recentActivities.map((activity: any) => (
                <TouchableOpacity
                  key={activity.id}
                  style={styles.activityCard}
                  onPress={() => handleNavigation(activity.route || "#")}
                >
                  <View
                    style={[
                      styles.activityIcon,
                      { backgroundColor: Colors.primary + "20" },
                    ]}
                  >
                    <Ionicons
                      name={getActivityIcon(activity.type) as any}
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{activity.time}</Text>
                  </View>
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    paddingHorizontal: 8,
  },
  welcomeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  welcomeIcons: {
    flexDirection: "row",
    gap: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 8,
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
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
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
    padding: 16,
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
  activitiesList: {
    gap: 12,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
