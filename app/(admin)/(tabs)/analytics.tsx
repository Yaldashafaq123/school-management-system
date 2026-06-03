// app/(admin)/analytics.tsx
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import {
  adminAnalyticsApi,
  AnalyticsData,
  SystemMetrics,
} from "@/src/config/adminAnalyticsApi";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function AnalyticsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">(
    "month",
  );
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(
    null,
  );

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, metricsRes] = await Promise.all([
        adminAnalyticsApi.getAnalytics(timeRange),
        adminAnalyticsApi.getSystemMetrics(),
      ]);

      if (analyticsRes.success && analyticsRes.data) {
        setAnalyticsData(analyticsRes.data);
      }
      if (metricsRes.success && metricsRes.data) {
        setSystemMetrics(metricsRes.data);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header
          title="گزارشات و آمار"
          showBack
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری داده‌ها...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = analyticsData?.stats || {
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    newUsersGrowth: 0,
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    averageScore: 0,
    completionRate: 0,
    activeRate: 0,
  };

  const userGrowth = analyticsData?.userGrowth || [];
  const coursePerformance = analyticsData?.coursePerformance || [];
  const topTeachers = analyticsData?.topTeachers || [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="گزارشات و آمار"
        showBack
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity
            onPress={() =>
              Alert.alert("در حال توسعه", "گزارشات CSV به زودی اضافه می‌شود")
            }
          >
            <Ionicons name="download" size={24} color={Colors.primary} />
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
        {/* Time Range Selector */}
        <View style={styles.timeRangeSelector}>
          {[
            { id: "week", label: "هفته" },
            { id: "month", label: "ماه" },
            { id: "year", label: "سال" },
          ].map((range) => (
            <TouchableOpacity
              key={range.id}
              style={[
                styles.timeRangeButton,
                timeRange === range.id && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(range.id as any)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range.id && styles.timeRangeTextActive,
                ]}
              >
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Stats */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>نمای کلی</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewCard}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.overviewGradient}
              >
                <Ionicons name="people" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.overviewValue}>
                {stats.totalUsers.toLocaleString()}
              </Text>
              <Text style={styles.overviewLabel}>کاربر کل</Text>
              <Text
                style={[
                  styles.overviewChange,
                  stats.newUsersGrowth >= 0 && { color: Colors.success },
                ]}
              >
                {stats.newUsersGrowth > 0 ? "+" : ""}
                {stats.newUsersGrowth}% نسبت به قبل
              </Text>
            </View>

            <View style={styles.overviewCard}>
              <LinearGradient
                colors={[Colors.success, "#0ca678"]}
                style={styles.overviewGradient}
              >
                <Ionicons name="person-circle" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.overviewValue}>
                {stats.activeUsers.toLocaleString()}
              </Text>
              <Text style={styles.overviewLabel}>کاربر فعال</Text>
              <Text style={styles.overviewChange}>
                {stats.activeRate}٪ فعال
              </Text>
            </View>

            <View style={styles.overviewCard}>
              <LinearGradient
                colors={[Colors.secondary, "#7048e8"]}
                style={styles.overviewGradient}
              >
                <Ionicons name="book" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.overviewValue}>{stats.totalCourses}</Text>
              <Text style={styles.overviewLabel}>دوره</Text>
              <Text style={styles.overviewChange}>
                {stats.completedCourses} تکمیل شده
              </Text>
            </View>

            <View style={styles.overviewCard}>
              <LinearGradient
                colors={[Colors.warning, "#f08c00"]}
                style={styles.overviewGradient}
              >
                <Ionicons name="trophy" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.overviewValue}>{stats.averageScore}٪</Text>
              <Text style={styles.overviewLabel}>میانگین نمره</Text>
              <Text style={styles.overviewChange}>
                {stats.completionRate}٪ نرخ تکمیل
              </Text>
            </View>
          </View>
        </View>

        {/* User Growth Chart */}
        <View style={styles.chartSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>رشد کاربران</Text>
            <Text style={styles.sectionSubtitle}>۶ ماه اخیر</Text>
          </View>
          <View style={styles.chartContainer}>
            {userGrowth.length > 0 ? (
              userGrowth.map((item, index) => {
                const maxUsers = Math.max(...userGrowth.map((i) => i.users), 1);
                const height = (item.users / maxUsers) * 120;

                return (
                  <View key={index} style={styles.chartBarContainer}>
                    <View style={[styles.chartBar, { height }]}>
                      <LinearGradient
                        colors={[Colors.primary, Colors.primaryDark]}
                        style={StyleSheet.absoluteFill}
                      />
                    </View>
                    <Text style={styles.chartLabel}>{item.month}</Text>
                    <Text style={styles.chartValue}>{item.users}</Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.chartEmpty}>
                <Text style={styles.emptyText}>
                  داده‌ای برای نمایش وجود ندارد
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Course Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>عملکرد دوره‌ها</Text>
          <View style={styles.performanceList}>
            {coursePerformance.length > 0 ? (
              coursePerformance.map((course, index) => (
                <View key={index} style={styles.performanceItem}>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseName}>{course.name}</Text>
                    <View style={styles.courseStats}>
                      <View style={styles.statBadge}>
                        <Ionicons
                          name="checkmark-circle"
                          size={12}
                          color={Colors.success}
                        />
                        <Text style={styles.statText}>
                          {course.completion}٪
                        </Text>
                      </View>
                      <View style={styles.statBadge}>
                        <Ionicons
                          name="star"
                          size={12}
                          color={Colors.warning}
                        />
                        <Text style={styles.statText}>{course.avgScore}٪</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${course.completion}%` },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  داده‌ای برای نمایش وجود ندارد
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Top Teachers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>برترین معلمان</Text>
          <View style={styles.teachersList}>
            {topTeachers.length > 0 ? (
              topTeachers.map((teacher, index) => (
                <View key={index} style={styles.teacherCard}>
                  <View style={styles.teacherInfo}>
                    <View style={styles.teacherAvatar}>
                      <Text style={styles.avatarText}>
                        {teacher.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.teacherDetails}>
                      <Text style={styles.teacherName}>{teacher.name}</Text>
                      <View style={styles.teacherStats}>
                        <Text style={styles.teacherStat}>
                          {teacher.courses} دوره
                        </Text>
                        <Text style={styles.teacherStat}>•</Text>
                        <Text style={styles.teacherStat}>
                          {teacher.students} دانش‌آموز
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.teacherRating}>
                    <Ionicons name="star" size={16} color={Colors.warning} />
                    <Text style={styles.ratingText}>
                      {teacher.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  داده‌ای برای نمایش وجود ندارد
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* System Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>متریک‌های سیستم</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Ionicons name="server" size={24} color={Colors.primary} />
              <Text style={styles.metricValue}>
                {systemMetrics?.uptime || 99.9}٪
              </Text>
              <Text style={styles.metricLabel}>آپتایم</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="speedometer" size={24} color={Colors.success} />
              <Text style={styles.metricValue}>
                {systemMetrics?.responseTime || 122}ms
              </Text>
              <Text style={styles.metricLabel}>زمان پاسخ</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="hardware-chip" size={24} color={Colors.warning} />
              <Text style={styles.metricValue}>
                {systemMetrics?.cpuLoad || 24}٪
              </Text>
              <Text style={styles.metricLabel}>بار CPU</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="save" size={24} color={Colors.secondary} />
              <Text style={styles.metricValue}>
                {systemMetrics?.storageUsed || 45}٪
              </Text>
              <Text style={styles.metricLabel}>فضای ذخیره</Text>
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
  timeRangeSelector: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.primary,
  },
  timeRangeText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  timeRangeTextActive: {
    color: "#fff",
  },
  overviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overviewGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  overviewValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  overviewChange: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: "500",
  },
  chartSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 180,
  },
  chartBarContainer: {
    alignItems: "center",
    flex: 1,
  },
  chartBar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  chartValue: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "500",
    marginTop: 4,
  },
  chartEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  section: {
    marginBottom: 24,
  },
  performanceList: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  performanceItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  courseInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  courseName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  courseStats: {
    flexDirection: "row",
    gap: 8,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  teachersList: {
    gap: 12,
  },
  teacherCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  teacherInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  teacherAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  teacherDetails: {
    flex: 1,
  },
  teacherName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  teacherStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  teacherStat: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  teacherRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
