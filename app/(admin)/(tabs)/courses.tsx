// app/(admin)/(tabs)/courses.tsx
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import {
  Course,
  courseApi,
  CourseStats
} from "@/src/config/courseApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CourseManagementScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, statsRes] = await Promise.all([
        courseApi.getCourses(),
        courseApi.getCourseStats(),
      ]);

      console.log("Courses response:", coursesRes);
      console.log("Stats response:", statsRes);

      if (coursesRes.success && coursesRes.data) {
        setCourses(coursesRes.data);
      } else {
        console.log("No courses data:", coursesRes);
      }

      if (statsRes.success && statsRes.data) {
        console.log("Stats data received:", statsRes.data);
        setStats(statsRes.data);
      } else {
        console.log("No stats data:", statsRes);
        setStats({
          total: 0,
          active: 0,
          inactive: 0,
          general: 0,
          class: 0,
          avg_students_per_course: 0,
        });
      }
    } catch (err) {
      console.error("Error loading data:", err);
      Alert.alert("خطا", "مشکلی در بارگذاری داده‌ها رخ داد");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleStatus = async (courseId: number) => {
    try {
      const response = await courseApi.toggleCourseStatus(courseId);
      if (response.success) {
        setCourses(
          courses.map((course) =>
            course.id === courseId
              ? { ...course, is_active: !course.is_active }
              : course,
          ),
        );
        Alert.alert("موفقیت", response.message || "وضعیت دوره تغییر کرد");
        loadData();
      } else {
        Alert.alert("خطا", response.message || "خطا در تغییر وضعیت دوره");
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      Alert.alert("خطا", "خطا در تغییر وضعیت دوره");
    }
  };

  const handleDeleteCourse = async (courseId: number, courseTitle: string) => {
    Alert.alert("حذف دوره", `آیا از حذف دوره "${courseTitle}" اطمینان دارید؟`, [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await courseApi.deleteCourse(courseId);
            if (response.success) {
              setCourses(courses.filter((c) => c.id !== courseId));
              Alert.alert(
                "موفقیت",
                response.message || "دوره با موفقیت حذف شد",
              );
              loadData();
            } else {
              Alert.alert("خطا", response.message || "خطا در حذف دوره");
            }
          } catch (err) {
            console.error("Error deleting course:", err);
            Alert.alert("خطا", "خطا در حذف دوره");
          }
        },
      },
    ]);
  };

  const getFilteredCourses = () => {
    let filtered = [...courses];

    if (filterStatus === "active") {
      filtered = filtered.filter((c) => c.is_active);
    } else if (filterStatus === "inactive") {
      filtered = filtered.filter((c) => !c.is_active);
    }

    if (filterType === "general") {
      filtered = filtered.filter((c) => c.is_general);
    } else if (filterType === "class") {
      filtered = filtered.filter((c) => !c.is_general);
    }

    return filtered;
  };

  const filteredCourses = getFilteredCourses();

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header
          title="مدیریت دوره‌ها"
          showBack
          onBackPress={() => router.back()}
        />
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
        title="مدیریت دوره‌ها"
        showBack
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity
            onPress={() => router.push("/(admin)/courses/create")}
          >
            <Ionicons name="add-circle" size={24} color={Colors.primary} />
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
        {/* Course Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "rgba(59, 130, 246, 0.1)" },
              ]}
            >
              <Ionicons name="book" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats?.total || 0}</Text>
            <Text style={styles.statLabel}>دوره کل</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "rgba(16, 185, 129, 0.1)" },
              ]}
            >
              <Ionicons name="school" size={24} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>{stats?.class || 0}</Text>
            <Text style={styles.statLabel}>دوره صنفی</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "rgba(139, 92, 246, 0.1)" },
              ]}
            >
              <Ionicons name="earth" size={24} color={Colors.secondary} />
            </View>
            <Text style={styles.statValue}>{stats?.general || 0}</Text>
            <Text style={styles.statLabel}>دوره عمومی</Text>
          </View>

          <View style={styles.statCard}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: "rgba(245, 158, 11, 0.1)" },
              ]}
            >
              <Ionicons name="people" size={24} color={Colors.warning} />
            </View>
            <Text style={styles.statValue}>
              {stats?.avg_students_per_course || 0}
            </Text>
            <Text style={styles.statLabel}>میانگین دانش‌آموز</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterChips}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterStatus === "all" && styles.filterChipActive,
                ]}
                onPress={() => setFilterStatus("all")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterStatus === "all" && styles.filterChipTextActive,
                  ]}
                >
                  همه
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterStatus === "active" && styles.filterChipActive,
                ]}
                onPress={() => setFilterStatus("active")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterStatus === "active" && styles.filterChipTextActive,
                  ]}
                >
                  فعال
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterStatus === "inactive" && styles.filterChipActive,
                ]}
                onPress={() => setFilterStatus("inactive")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterStatus === "inactive" && styles.filterChipTextActive,
                  ]}
                >
                  غیرفعال
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterType === "class" && styles.filterChipActive,
                ]}
                onPress={() => setFilterType("class")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterType === "class" && styles.filterChipTextActive,
                  ]}
                >
                  صنفی
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterType === "general" && styles.filterChipActive,
                ]}
                onPress={() => setFilterType("general")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterType === "general" && styles.filterChipTextActive,
                  ]}
                >
                  عمومی
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Courses List */}
        <View style={styles.coursesList}>
          {filteredCourses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="book-outline"
                size={60}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyStateTitle}>دوره‌ای یافت نشد</Text>
              <Text style={styles.emptyStateText}>
                برای ایجاد دوره جدید، روی دکمه + در بالای صفحه کلیک کنید
              </Text>
            </View>
          ) : (
            filteredCourses.map((course) => (
              <View key={course.id} style={styles.courseCard}>
                <Image
                  source={{
                    uri:
                      course.thumbnail_url ||
                      "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=دوره",
                  }}
                  style={styles.courseImage}
                />
                <View style={styles.courseContent}>
                  <View style={styles.courseHeader}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <View
                      style={[
                        styles.courseTypeBadge,
                        {
                          backgroundColor: course.is_general
                            ? `${Colors.secondary}20`
                            : `${Colors.primary}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.courseTypeText,
                          {
                            color: course.is_general
                              ? Colors.secondary
                              : Colors.primary,
                          },
                        ]}
                      >
                        {course.is_general ? "عمومی" : "صنفی"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.courseDescription} numberOfLines={2}>
                    {course.description ||
                      "توضیحاتی برای این دوره ثبت نشده است"}
                  </Text>

                  <View style={styles.courseMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="person"
                        size={12}
                        color={Colors.textSecondary}
                      />
                      <Text style={styles.metaText}>
                        {course.teacher_name || "نامشخص"}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons
                        name="people"
                        size={12}
                        color={Colors.textSecondary}
                      />
                      <Text style={styles.metaText}>
                        {course.student_count || 0} دانش‌آموز
                      </Text>
                    </View>
                    {course.duration && course.duration > 0 && (
                      <View style={styles.metaItem}>
                        <Ionicons
                          name="time"
                          size={12}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.metaText}>
                          {course.duration} دقیقه
                        </Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: course.is_active
                            ? `${Colors.success}20`
                            : `${Colors.danger}20`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: course.is_active
                              ? Colors.success
                              : Colors.danger,
                          },
                        ]}
                      >
                        {course.is_active ? "فعال" : "غیرفعال"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.courseFooter}>
                    <TouchableOpacity
                      style={styles.courseActionButton}
                      onPress={() => handleToggleStatus(course.id)}
                    >
                      <Ionicons
                        name={course.is_active ? "eye-off" : "eye"}
                        size={18}
                        color={
                          course.is_active ? Colors.warning : Colors.success
                        }
                      />
                      <Text style={styles.actionText}>
                        {course.is_active ? "غیرفعال" : "فعال"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.courseActionButton}
                      onPress={() =>
                        router.push(`/(admin)/course/${course.id}` as any)
                      }
                    >
                      <Ionicons
                        name="create"
                        size={18}
                        color={Colors.primary}
                      />
                      <Text style={styles.actionText}>ویرایش</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.courseActionButton}
                      onPress={() =>
                        handleDeleteCourse(course.id, course.title)
                      }
                    >
                      <Ionicons name="trash" size={18} color={Colors.danger} />
                      <Text style={styles.actionText}>حذف</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
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
  filtersContainer: {
    marginBottom: 16,
  },
  filterChips: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterChipTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  coursesList: {
    gap: 16,
    marginBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  courseCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courseImage: {
    width: "100%",
    height: 150,
  },
  courseContent: {
    padding: 16,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  courseTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  courseTypeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  courseDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  courseMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  courseFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  courseActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    padding: 8,
  },
  actionText: {
    fontSize: 12,
    color: Colors.text,
  },
});
