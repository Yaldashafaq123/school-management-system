// app/(teacher)/courses.tsx
// app/(teacher)/courses/index.tsx
import { CourseCard } from "@/components/CourseCard";
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { Course, teacherCoursesApi } from "@/src/config/teacherCoursesApi";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TeacherCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalStudents: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, filter, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await teacherCoursesApi.getCourses();

      if (response.success) {
        setCourses(response.data || []);
        setStats(
          response.stats || {
            total: response.data?.length || 0,
            active: response.data?.filter((c) => c.is_active).length || 0,
            inactive: response.data?.filter((c) => !c.is_active).length || 0,
            totalStudents:
              response.data?.reduce(
                (sum, c) => sum + (c.student_count || 0),
                0,
              ) || 0,
            totalRevenue: 0,
          },
        );
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      Alert.alert("خطا", "مشکلی در دریافت دوره‌ها پیش آمد.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply status filter
    if (filter === "active") {
      filtered = filtered.filter((course) => course.is_active);
    } else if (filter === "inactive") {
      filtered = filtered.filter((course) => !course.is_active);
    }

    setFilteredCourses(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCourses();
  };

  const handleCoursePress = (courseId: number) => {
    router.push(`./(teacher)/course/${courseId}/manage`);
  };

  const handleToggleStatus = async (
    courseId: number,
    currentStatus: boolean,
  ) => {
    Alert.alert(
      "تغییر وضعیت دوره",
      `آیا می‌خواهید این دوره را ${currentStatus ? "غیرفعال" : "فعال"} کنید؟`,
      [
        { text: "لغو", style: "cancel" },
        {
          text: "تأیید",
          style: "default",
          onPress: async () => {
            try {
              const response =
                await teacherCoursesApi.toggleCourseStatus(courseId);
              if (response.success) {
                // Update local state
                setCourses((prev) =>
                  prev.map((course) =>
                    course.id === courseId
                      ? { ...course, is_active: !course.is_active }
                      : course,
                  ),
                );
                Alert.alert("موفقیت", "وضعیت دوره تغییر کرد");
              }
            } catch (error) {
              Alert.alert("خطا", "مشکلی در تغییر وضعیت دوره پیش آمد.");
            }
          },
        },
      ],
    );
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("fa-IR") + " تومان";
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header
          title="مدیریت دوره‌ها"
          showBack
          onBackPress={() => router.push("/(teacher)/dashboard")}
          rightComponent={
            <TouchableOpacity
              onPress={() => router.push("./(teacher)/courses/create")}
            >
              <Ionicons name="add-circle" size={28} color={Colors.primary} />
            </TouchableOpacity>
          }
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری دوره‌ها...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="مدیریت دوره‌ها"
        showBack
        onBackPress={() => router.push("/(teacher)/dashboard")}
        rightComponent={
          <TouchableOpacity
            onPress={() => router.push("./(teacher)/courses/create")}
          >
            <Ionicons name="add-circle" size={28} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>کل دوره‌ها</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {stats.active}
            </Text>
            <Text style={styles.statLabel}>فعال</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>
              {stats.inactive}
            </Text>
            <Text style={styles.statLabel}>غیرفعال</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {stats.totalStudents}
            </Text>
            <Text style={styles.statLabel}>دانش‌آموز</Text>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="جستجوی دوره‌ها..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === "all" && styles.filterChipActive,
            ]}
            onPress={() => setFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                filter === "all" && styles.filterTextActive,
              ]}
            >
              همه
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === "active" && styles.filterChipActive,
            ]}
            onPress={() => setFilter("active")}
          >
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={filter === "active" ? "#fff" : Colors.success}
            />
            <Text
              style={[
                styles.filterText,
                filter === "active" && styles.filterTextActive,
              ]}
            >
              فعال
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filter === "inactive" && styles.filterChipActive,
            ]}
            onPress={() => setFilter("inactive")}
          >
            <Ionicons
              name="close-circle"
              size={16}
              color={filter === "inactive" ? "#fff" : Colors.danger}
            />
            <Text
              style={[
                styles.filterText,
                filter === "inactive" && styles.filterTextActive,
              ]}
            >
              غیرفعال
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Courses List */}
        <View style={styles.coursesContainer}>
          <View style={styles.coursesHeader}>
            <Text style={styles.coursesTitle}>
              دوره‌های شما ({filteredCourses.length})
            </Text>
          </View>

          {filteredCourses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="book-outline"
                size={60}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyStateText}>
                {searchQuery
                  ? "دوره‌ای با جستجوی شما یافت نشد"
                  : "هنوز دوره‌ای ایجاد نکرده‌اید"}
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push("./(teacher)/courses/create")}
              >
                <Text style={styles.createButtonText}>ایجاد دوره جدید</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.coursesList}>
              {filteredCourses.map((course) => (
                <View key={course.id} style={styles.courseWrapper}>
                  <CourseCard
                    course={{
                      ...course,
                      progress: 0,
                      enrolled: false,
                    }}
                    onPress={() => handleCoursePress(course.id)}
                  />

                  <View style={styles.courseActions}>
                    <View style={styles.courseStats}>
                      <View style={styles.courseStat}>
                        <Ionicons
                          name="people"
                          size={14}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.courseStatText}>
                          {course.student_count || 0}
                        </Text>
                      </View>
                      <View style={styles.courseStat}>
                        <Ionicons
                          name="cash"
                          size={14}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.courseStatText}>
                          {formatPrice(course.revenue || 0)}
                        </Text>
                      </View>
                      <View style={styles.courseStat}>
                        <Ionicons
                          name="star"
                          size={14}
                          color={Colors.warning}
                        />
                        <Text style={styles.courseStatText}>
                          {course.rating?.toFixed(1) || 0}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[
                          styles.statusButton,
                          course.is_active
                            ? styles.statusActive
                            : styles.statusInactive,
                        ]}
                        onPress={() =>
                          handleToggleStatus(course.id, course.is_active)
                        }
                      >
                        <Ionicons
                          name={
                            course.is_active
                              ? "checkmark-circle"
                              : "close-circle"
                          }
                          size={16}
                          color={
                            course.is_active ? Colors.success : Colors.danger
                          }
                        />
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
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() =>
                          router.push(`./(teacher)/course/${course.id}`)
                        }
                      >
                        <Ionicons
                          name="create-outline"
                          size={16}
                          color={Colors.primary}
                        />
                        <Text style={styles.editText}>ویرایش</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
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
  loadingContainer: {
    flex: 1,
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
    paddingBottom: 32,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: Colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    marginHorizontal: 12,
    textAlign: "right",
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  coursesContainer: {
    paddingHorizontal: 16,
  },
  coursesHeader: {
    marginBottom: 16,
  },
  coursesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  coursesList: {
    gap: 16,
  },
  courseWrapper: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courseActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  courseStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  courseStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  courseStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  statusActive: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  statusInactive: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "500",
  },
});
