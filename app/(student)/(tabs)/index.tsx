// app/(student)/(tabs)/index.tsx
import { CourseCard } from "@/components/CourseCard";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardData, studentApi } from "@/src/config/studentApi";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await studentApi.getDashboard();

      if (response.success && response.data) {
        setDashboardData(response.data);
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

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return "document-text";
      case "exam":
        return "clipboard";
      case "course":
        return "book";
      case "certificate":
        return "trophy";
      case "announcement":
        return "megaphone";
      default:
        return "notifications";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "assignment":
        return Colors.primary;
      case "exam":
        return Colors.warning;
      case "course":
        return Colors.success;
      case "certificate":
        return Colors.secondary;
      case "announcement":
        return Colors.info;
      default:
        return Colors.text;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>در حال بارگذاری داشبورد...</Text>
      </View>
    );
  }

  const stats = dashboardData?.stats || {
    total_courses: 0,
    enrolled_courses: 0,
    completed_courses: 0,
    total_hours: 0,
    certificates: 0,
    assignments_pending: 0,
    exams_upcoming: 0,
    average_score: 0,
  };

  const recentActivities = dashboardData?.recentActivities || [];
  const upcomingExams = dashboardData?.upcomingExams || [];
  const myCourses = dashboardData?.myCourses || [];
  const continueLearning = dashboardData?.continueLearning || [];

  // Transform courses to match CourseCard expected format
  const transformCourseForCard = (course: any) => ({
    id: course.id,
    title: course.title,
    description: course.description || "",
    thumbnail_url: course.thumbnail_url || "",
    teacher_id: course.teacher_id,
    teacher_name: course.teacher_name || "نامشخص",
    class_id: course.class_id,
    subject_id: course.subject_id,
    is_general: course.is_general || false,
    progress: course.progress || 0,
    enrolled: course.enrolled || true,
    slug: course.slug || course.title.toLowerCase().replace(/\s/g, "-"),
    instructor: course.teacher_name || "نامشخص",
    revenue: 0,
    rating: 0,
    is_active: true,
    created_at: course.created_at || new Date().toISOString(),
    assignments_count: 0,
    exams_count: 0,
    objectives: course.objectives || [],
    requirements: course.requirements || [],
  });

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[Colors.primary]}
        />
      }
    >
      {/* Welcome Header with Notification Icon */}
      <LinearGradient
        colors={["#4F46E5", "#7C3AED"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeCard}
      >
        {/* Notification Icon - Top Right */}
        <TouchableOpacity
          style={styles.notificationIcon}
          onPress={() => router.push("/(public)/notifications")}
        >
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          {/* Optional: Add badge for unread count */}
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.welcomeContent}>
          <View>
            <Text style={styles.welcomeTitle}>
              سلام {user?.fullName || "دانش‌آموز"}! 👋
            </Text>
            <Text style={styles.welcomeSubtitle}>
              امروز چطوره؟ آماده یادگیری هستی؟
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push("/(student)/courses")}
        >
          <View
            style={[
              styles.statIcon,
              { backgroundColor: "rgba(59, 130, 246, 0.1)" },
            ]}
          >
            <Ionicons name="book" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>{stats.enrolled_courses}</Text>
          <Text style={styles.statLabel}>دوره فعال</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push("/(student)/(tabs)/grades")}
        >
          <View
            style={[
              styles.statIcon,
              { backgroundColor: "rgba(16, 185, 129, 0.1)" },
            ]}
          >
            <Ionicons name="trending-up" size={24} color={Colors.success} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>
              {stats.average_score?.toFixed(1) || "0"}
            </Text>
            <Text style={styles.statLabel}>میانگین نمره</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push("/(student)/assignments")}
        >
          <View
            style={[
              styles.statIcon,
              { backgroundColor: "rgba(239, 68, 68, 0.1)" },
            ]}
          >
            <Ionicons name="document-text" size={24} color={Colors.danger} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{stats.assignments_pending}</Text>
            <Text style={styles.statLabel}>کارخانگی</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push("/(public)/certificates")}
        >
          <View
            style={[
              styles.statIcon,
              { backgroundColor: "rgba(245, 158, 11, 0.1)" },
            ]}
          >
            <Ionicons name="trophy" size={24} color={Colors.warning} />
          </View>
          <Text style={styles.statValue}>{stats.certificates}</Text>
          <Text style={styles.statLabel}>گواهینامه</Text>
        </TouchableOpacity>
      </View>

      {/* Continue Learning */}
      {continueLearning.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ادامه یادگیری</Text>
            <TouchableOpacity onPress={() => router.push("/(student)/courses")}>
              <Text style={styles.seeAllText}>مشاهده همه</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={continueLearning}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.continueCard}
                onPress={() => router.push(`/(student)/courses`)}
              >
                {item.thumbnail_url ? (
                  <Image
                    source={{ uri: item.thumbnail_url }}
                    style={styles.continueImage}
                  />
                ) : (
                  <View
                    style={[
                      styles.continueImage,
                      styles.continueImagePlaceholder,
                    ]}
                  >
                    <Ionicons
                      name="book-outline"
                      size={40}
                      color={Colors.textSecondary}
                    />
                  </View>
                )}
                <LinearGradient
                  colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.8)"]}
                  style={styles.continueGradient}
                >
                  <View style={styles.continueContent}>
                    <Text style={styles.continueTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.continueLesson} numberOfLines={1}>
                      {item.next_lesson || "ادامه یادگیری"}
                    </Text>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${item.progress || 0}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {item.progress || 0}%
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>دسترسی سریع</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(student)/courses")}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: "rgba(59, 130, 246, 0.1)" },
              ]}
            >
              <Ionicons name="library" size={28} color={Colors.primary} />
            </View>
            <Text style={styles.quickActionText}>کتابخانه</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(student)/assignments")}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: "rgba(16, 185, 129, 0.1)" },
              ]}
            >
              <Ionicons
                name="document-attach"
                size={28}
                color={Colors.success}
              />
            </View>
            <Text style={styles.quickActionText}>کارخانگی</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(student)/exams")}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: "rgba(245, 158, 11, 0.1)" },
              ]}
            >
              <Ionicons name="clipboard" size={28} color={Colors.warning} />
            </View>
            <Text style={styles.quickActionText}>آزمون‌ها</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(student)/calendar")}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: "rgba(139, 92, 246, 0.1)" },
              ]}
            >
              <Ionicons name="calendar" size={28} color={Colors.secondary} />
            </View>
            <Text style={styles.quickActionText}>تقویم</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Exams */}
      {upcomingExams.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>آزمون‌های پیش رو</Text>
            <TouchableOpacity onPress={() => router.push("/(student)/exams")}>
              <Text style={styles.seeAllText}>مشاهده همه</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.examsList}>
            {upcomingExams.map((exam) => (
              <TouchableOpacity
                key={exam.id}
                style={styles.examCard}
                onPress={() => router.push(`/(student)/exam/${exam.id}`)}
              >
                <View style={styles.examHeader}>
                  <View
                    style={[
                      styles.examIcon,
                      { backgroundColor: "rgba(245, 158, 11, 0.1)" },
                    ]}
                  >
                    <Ionicons
                      name="clipboard"
                      size={24}
                      color={Colors.warning}
                    />
                  </View>
                  <View style={styles.examInfo}>
                    <Text style={styles.examTitle}>{exam.title}</Text>
                    <Text style={styles.examCourse}>{exam.course_name}</Text>
                    <View style={styles.examDetails}>
                      <View style={styles.examDetail}>
                        <Ionicons
                          name="calendar-outline"
                          size={14}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.examDetailText}>{exam.date}</Text>
                      </View>
                      <View style={styles.examDetail}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.examDetailText}>
                          {exam.time} • {exam.duration} دقیقه
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                {exam.is_tomorrow && (
                  <View style={styles.examBadge}>
                    <Text style={styles.examBadgeText}>فردا</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Recent Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>فعالیت‌های اخیر</Text>
          <TouchableOpacity
          //  onPress={() => router.push("/(student)/activities")}
          >
            <Text style={styles.seeAllText}>مشاهده همه</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activitiesList}>
          {recentActivities.length === 0 ? (
            <View style={styles.emptyActivities}>
              <Ionicons
                name="time-outline"
                size={40}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyActivitiesText}>
                هیچ فعالیتی ثبت نشده
              </Text>
            </View>
          ) : (
            recentActivities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={styles.activityItem}
                onPress={() => {
                  if (activity.type === "assignment") {
                    router.push("/(student)/assignments");
                  } else if (activity.type === "exam") {
                    router.push("/(student)/exams");
                  } else if (activity.type === "course") {
                    router.push("/(student)/courses");
                  } else if (activity.type === "announcement") {
                    router.push("/(public)/notifications");
                  }
                }}
              >
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: `${getActivityColor(activity.type)}20` },
                  ]}
                >
                  <Ionicons
                    name={getActivityIcon(activity.type) as any}
                    size={20}
                    color={getActivityColor(activity.type)}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>
                    {activity.description}
                  </Text>
                  {activity.course_name && (
                    <Text style={styles.activityCourse}>
                      {activity.course_name}
                    </Text>
                  )}
                </View>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      {/* My Courses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>دوره‌های من</Text>
          <TouchableOpacity onPress={() => router.push("/(student)/courses")}>
            <Text style={styles.seeAllText}>مشاهده همه</Text>
          </TouchableOpacity>
        </View>

        {myCourses.length === 0 ? (
          <View style={styles.emptyCourses}>
            <Ionicons
              name="book-outline"
              size={48}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyCoursesText}>
              هنوز در دوره‌ای ثبت‌نام نکرده‌اید
            </Text>
            <TouchableOpacity
              style={styles.findCourseButton}
              // onPress={() => router.push("/(student)/catalog")}
            >
              <Text style={styles.findCourseButtonText}>پیدا کردن دوره</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.coursesScroll}
          >
            {myCourses.map((course) => {
              const transformedCourse = transformCourseForCard(course);
              return (
                <View key={course.id} style={styles.courseCard}>
                  <CourseCard
                    course={transformedCourse}
                    onPress={() =>
                      router.push(`/(student)/course/${course.id}`)
                    }
                    showProgress={true}
                  />
                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={() =>
                      router.push(`/(student)/course/${course.id}/lesson`)
                    }
                  >
                    <Ionicons name="play-circle" size={20} color="#fff" />
                    <Text style={styles.continueButtonText}>ادامه</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Study Goals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>اهداف مطالعاتی</Text>
        <View style={styles.goalsCard}>
          <View style={styles.goalItem}>
            <View
              style={[
                styles.goalIcon,
                { backgroundColor: "rgba(16, 185, 129, 0.1)" },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={Colors.success}
              />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>۳۰ دقیقه مطالعه روزانه</Text>
              <View style={styles.goalProgress}>
                <View style={styles.goalProgressBar}>
                  <View style={[styles.goalProgressFill, { width: "85%" }]} />
                </View>
                <Text style={styles.goalProgressText}>۸۵%</Text>
              </View>
            </View>
          </View>
          <View style={styles.goalItem}>
            <View
              style={[
                styles.goalIcon,
                { backgroundColor: "rgba(59, 130, 246, 0.1)" },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={Colors.primary}
              />
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>۲ تمرین در هفته</Text>
              <View style={styles.goalProgress}>
                <View style={styles.goalProgressBar}>
                  <View style={[styles.goalProgressFill, { width: "60%" }]} />
                </View>
                <Text style={styles.goalProgressText}>۶۰%</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  welcomeCard: {
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
    position: "relative",
  },
  notificationIcon: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -8,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
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
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.card,
    borderRadius: 16,
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
    textAlign: "center",
  },
  statTextContainer: {
    alignItems: "center",
  },
  section: {
    paddingHorizontal: 16,
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
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  continueCard: {
    width: 280,
    height: 180,
    borderRadius: 16,
    marginRight: 16,
    overflow: "hidden",
  },
  continueImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  continueImagePlaceholder: {
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  continueGradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
  },
  continueContent: {
    gap: 8,
  },
  continueTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  continueLesson: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
    minWidth: 30,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAction: {
    width: "48%",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "500",
    textAlign: "center",
  },
  examsList: {
    gap: 12,
  },
  examCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  examHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  examIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  examCourse: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  examDetails: {
    flexDirection: "row",
    gap: 16,
  },
  examDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  examDetailText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  examBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  examBadgeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  activitiesList: {
    gap: 12,
  },
  emptyActivities: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyActivitiesText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
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
  activityDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  activityCourse: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: "500",
  },
  activityTime: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  coursesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  courseCard: {
    width: 280,
    marginRight: 16,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    gap: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyCourses: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    padding: 40,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  emptyCoursesText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  findCourseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  findCourseButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  goalsCard: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 20,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  goalProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  goalProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  goalProgressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  goalProgressText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
    minWidth: 30,
  },
});
