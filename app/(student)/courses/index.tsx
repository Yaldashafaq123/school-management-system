// app/(student)/courses.tsx
import { CourseCard } from "@/components/CourseCard";
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { Course, studentApi } from "@/src/config/studentApi";
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

export default function CoursesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [classInfo, setClassInfo] = useState<{
    id: number;
    name: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, enrolledCourses]);

  const loadData = async () => {
    try {
      setLoading(true);
      await loadEnrolledCourses();
      await loadStudentClass();
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری اطلاعات پیش آمد");
    } finally {
      setLoading(false);
    }
  };

  const loadStudentClass = async () => {
    try {
      const response = await studentApi.getProfile();
      if (response.success && response.data) {
        if (response.data.student?.classId) {
          setClassInfo({
            id: response.data.student.classId,
            name: response.data.student.className || "",
          });
        }
      }
    } catch (error) {
      console.error("Error loading student class:", error);
    }
  };

  const loadEnrolledCourses = async () => {
    try {
      const response = await studentApi.getMyCourses();
      if (response.success && response.data) {
        const courses = response.data;
        setEnrolledCourses(courses);
      }
    } catch (error) {
      console.error("Error loading enrolled courses:", error);
      setEnrolledCourses([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterCourses = () => {
    let filtered = [...enrolledCourses];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title.includes(searchQuery) ||
          (course.description && course.description.includes(searchQuery)) ||
          (course.teacher_name && course.teacher_name.includes(searchQuery)),
      );
    }

    setFilteredCourses(filtered);
  };

  const stats = {
    total: enrolledCourses.length,
    completed: enrolledCourses.filter((c) => c.progress === 100).length,
    inProgress: enrolledCourses.filter(
      (c) => c.progress > 0 && c.progress < 100,
    ).length,
  };

  const transformCourseForCard = (course: Course) => ({
    id: course.id,
    title: course.title,
    description: course.description || "",
    thumbnail_url:
      course.thumbnail_url ||
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500",
    teacher_id: course.teacher_id || 0,
    teacher_name: course.teacher_name || "نامشخص",
    class_id: course.class_id,
    subject_id: course.subject_id,
    is_general: course.is_general || false,
    progress: course.progress || 0,
    enrolled: true,
    slug: course.title.toLowerCase().replace(/\s/g, "-"),
    instructor: course.teacher_name || "نامشخص",
    revenue: 0,
    rating: course.rating || 0,
    is_active: true,
    created_at: new Date().toISOString(),
    assignments_count: 0,
    exams_count: 0,
    objectives: course.objectives || [],
    requirements: course.requirements || [],
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="دوره‌های من" />
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
        title="دوره‌های من"
        rightComponent={
          <TouchableOpacity onPress={handleRefresh}>
            <Ionicons name="refresh" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Class Info Banner */}
        {classInfo && (
          <View style={styles.classBanner}>
            <Ionicons name="school" size={20} color={Colors.primary} />
            <Text style={styles.classBannerText}>صنف {classInfo.name}</Text>
          </View>
        )}

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>کل دوره‌ها</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {stats.inProgress}
            </Text>
            <Text style={styles.statLabel}>در حال یادگیری</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {stats.completed}
            </Text>
            <Text style={styles.statLabel}>تکمیل شده</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجوی دوره‌های من..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
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

        {/* Courses Grid */}
        <View style={styles.coursesContainer}>
          <View style={styles.coursesHeader}>
            <Text style={styles.coursesTitle}>
              دوره‌های من ({filteredCourses.length})
            </Text>
          </View>

          {filteredCourses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="book-outline"
                size={60}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyStateTitle}>دوره‌ای یافت نشد</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery
                  ? "با عبارت دیگری جستجو کنید"
                  : "هنوز در دوره‌ای ثبت‌نام نکرده‌اید"}
              </Text>
            </View>
          ) : (
            <View style={styles.coursesGrid}>
              {filteredCourses.map((course) => (
                <View key={course.id} style={styles.courseCardWrapper}>
                  <CourseCard
                    course={transformCourseForCard(course)}
                    onPress={async () => {
                      try {
                        // Enroll first if not enrolled
                        if (!course.enrolled) {
                          const result = await studentApi.enrollCourse(
                            course.id,
                          );

                          if (!result.success) {
                            Alert.alert("خطا", "ثبت نام در دوره انجام نشد");
                            return;
                          }
                        }

                        // Open course after successful enrollment
                        router.push(`/(student)/course/${course.id}`);
                      } catch (error) {
                        console.error(error);
                        Alert.alert("خطا", "مشکلی پیش آمد");
                      }
                    }}
                    showProgress={true}
                  />
                  {/* Show Continue Button for courses in progress */}
                  {course.progress > 0 && course.progress < 100 && (
                    <TouchableOpacity
                      style={styles.continueButton}
                      onPress={() =>
                        router.push(`/(student)/course/${course.id}`)
                      }
                    >
                      <Ionicons name="play-circle" size={18} color="#fff" />
                      <Text style={styles.continueButtonText}>
                        ادامه یادگیری
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Show Completed Badge for completed courses */}
                  {course.progress === 100 && (
                    <View style={styles.completedBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={Colors.success}
                      />
                      <Text style={styles.completedBadgeText}>تکمیل شده</Text>
                    </View>
                  )}

                  {/* Show Start Button for courses not started */}
                  {(!course.progress || course.progress === 0) && (
                    <TouchableOpacity
                      style={styles.startButton}
                      onPress={() =>
                        router.push(`/(student)/course/${course.id}`)
                      }
                    >
                      <Ionicons name="play-circle" size={18} color="#fff" />
                      <Text style={styles.startButtonText}>شروع یادگیری</Text>
                    </TouchableOpacity>
                  )}
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
  content: {
    flex: 1,
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
  classBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  classBannerText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginHorizontal: 12,
  },
  coursesContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  coursesHeader: {
    marginBottom: 16,
  },
  coursesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  coursesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  courseCardWrapper: {
    width: "48%",
    marginBottom: 16,
    position: "relative",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    gap: 6,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -8,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.success,
    paddingVertical: 8,
    gap: 6,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -8,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingVertical: 8,
    gap: 4,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -8,
  },
  completedBadgeText: {
    color: Colors.success,
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    padding: 40,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
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
    marginBottom: 20,
  },
});
