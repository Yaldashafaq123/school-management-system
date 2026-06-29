import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../../../components/Header";
import { Colors } from "../../../../constants/Colors";
import { teacherCoursesApi } from "../../../../src/config/teacherCoursesApi";

interface Student {
  id: number;
  name: string;
  email: string;
  progress: number;
  last_active: string;
  profile_image?: string;
}

interface Assignment {
  id: number;
  title: string;
  submissions: number;
  graded: number;
  average_grade: number;
  max_grade: number;
  due_date: string;
}

interface Exam {
  id: number;
  title: string;
  submissions: number;
  graded: number;
  average_grade: number;
  max_score: number;
  date: string;
}

interface CourseData {
  id: number;
  title: string;
  student_count: number;
  revenue: number;
  rating: number;
  is_active: boolean;
  created_at: string;
}

export default function CourseManagement() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "assignments" | "exams"
  >("overview");

  // In your fetchManagementData function
  const fetchManagementData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await teacherCoursesApi.getCourseManagement(Number(id));

      if (response.success && response.data) {
        setCourse(response.data.course);
        setStudents(response.data.students || []);
        setAssignments(response.data.assignments || []);
        setExams(response.data.exams || []);
      }
    } catch (error) {
      console.error("Error fetching course management:", error);
      Alert.alert("خطا", "مشکلی در دریافت اطلاعات پیش آمد.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchManagementData();
  }, [fetchManagementData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchManagementData();
  };

  const handleAddStudent = () => {
    Alert.prompt(
      "افزودن دانش‌آموز",
      "ایمیل دانش‌آموز را وارد کنید:",
      [
        { text: "لغو", style: "cancel" },
        {
          text: "افزودن",
          onPress: async (email?: string) => {
            if (email && email.includes("@")) {
              try {
                const response = await teacherCoursesApi.addStudent(
                  Number(id),
                  email,
                );
                if (response.success) {
                  Alert.alert("موفقیت", "دانش‌آموز با موفقیت اضافه شد.");
                  fetchManagementData();
                }
              } catch {
                Alert.alert("خطا", "مشکلی در افزودن دانش‌آموز پیش آمد.");
              }
            } else {
              Alert.alert("خطا", "ایمیل معتبر وارد کنید.");
            }
          },
        },
      ],
      "plain-text",
    );
  };

  const handleRemoveStudent = (studentId: number, studentName: string) => {
    Alert.alert(
      "حذف دانش‌آموز",
      `آیا مطمئن هستید که می‌خواهید ${studentName} را از دوره حذف کنید؟`,
      [
        { text: "لغو", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await teacherCoursesApi.removeStudent(
                Number(id),
                studentId,
              );
              if (response.success) {
                setStudents((prev) => prev.filter((s) => s.id !== studentId));
                Alert.alert("موفقیت", "دانش‌آموز حذف شد");
              }
            } catch {
              Alert.alert("خطا", "مشکلی در حذف دانش‌آموز پیش آمد.");
            }
          },
        },
      ],
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header
          title="مدیریت دوره"
          showBack
          onBackPress={() => router.back()} // ✅ FIXED: Use router.back() instead of push
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Course Stats */}
      {course && (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{course.student_count}</Text>
            <Text style={styles.statLabel}>دانش‌آموز</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color={Colors.warning} />
            <Text style={styles.statValue}>{course.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>امتیاز</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color={Colors.info} />
            <Text style={styles.statValue}>۲ ماه</Text>
            <Text style={styles.statLabel}>مدت</Text>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>عملیات سریع</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(teacher)/assignment/create" as any)}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: "rgba(59, 130, 246, 0.1)" },
              ]}
            >
              <Ionicons name="document-text" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.quickActionText}>کارخانگی جدید</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(teacher)/exam/create" as any)}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: "rgba(245, 158, 11, 0.1)" },
              ]}
            >
              <Ionicons name="clipboard" size={24} color={Colors.warning} />
            </View>
            <Text style={styles.quickActionText}>آزمون جدید</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleAddStudent}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: "rgba(16, 185, 129, 0.1)" },
              ]}
            >
              <Ionicons name="person-add" size={24} color={Colors.success} />
            </View>
            <Text style={styles.quickActionText}>افزودن دانش‌آموز</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Students */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>دانش‌آموزان اخیر</Text>
          <TouchableOpacity onPress={() => setActiveTab("students")}>
            <Text style={styles.seeAllText}>مشاهده همه</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recentStudents}>
          {students.slice(0, 3).map((student) => (
            <TouchableOpacity key={student.id} style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.avatarText}>
                    {student.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.studentDetails}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentEmail}>{student.email}</Text>
                </View>
              </View>
              <View style={styles.studentProgress}>
                <Text style={styles.progressText}>{student.progress}%</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${student.progress}%` },
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStudents = () => (
    <View style={styles.tabContent}>
      <View style={styles.studentsHeader}>
        <Text style={styles.studentsCount}>{students.length} دانش‌آموز</Text>
        <TouchableOpacity
          style={styles.addStudentButton}
          onPress={handleAddStudent}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addStudentText}>افزودن دانش‌آموز</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.studentsList}>
        {students.map((student) => (
          <View key={student.id} style={styles.studentRow}>
            <View style={styles.studentInfo}>
              <View style={styles.studentAvatar}>
                <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
              </View>
              <View style={styles.studentDetails}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentEmail}>{student.email}</Text>
                <Text style={styles.studentLastActive}>
                  آخرین فعالیت: {student.last_active}
                </Text>
              </View>
            </View>

            <View style={styles.studentActions}>
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>
                  {student.progress}%
                </Text>
              </View>

              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => {
                  /* Navigate to messaging */
                }}
              >
                <Ionicons name="chatbubble" size={20} color={Colors.primary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveStudent(student.id, student.name)}
              >
                <Ionicons name="trash" size={20} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAssignments = () => (
    <View style={styles.tabContent}>
      <View style={styles.assignmentsHeader}>
        <Text style={styles.assignmentsCount}>
          {assignments.length} کارخانگی
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/(teacher)/assignment/create" as any)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>کارخانگی جدید</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.assignmentsList}>
        {assignments.map((assignment) => (
          <TouchableOpacity
            key={assignment.id}
            style={styles.assignmentRow}
            onPress={() =>
              router.push(`/(teacher)/assignment/${assignment.id}` as any)
            }
          >
            <View style={styles.assignmentInfo}>
              <Text style={styles.assignmentTitle}>{assignment.title}</Text>
              <View style={styles.assignmentStats}>
                <View style={styles.assignmentStat}>
                  <Ionicons
                    name="arrow-up-circle"
                    size={14}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.assignmentStatText}>
                    {assignment.submissions} تحویل
                  </Text>
                </View>
                <View style={styles.assignmentStat}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.assignmentStatText}>
                    {assignment.graded} تصحیح شده
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.assignmentGrade}>
              {assignment.average_grade > 0 ? (
                <>
                  <Text style={styles.gradeValue}>
                    {assignment.average_grade.toFixed(1)}
                  </Text>
                  <Text style={styles.gradeLabel}>میانگین</Text>
                </>
              ) : (
                <Text style={styles.ungradedText}>در انتظار تصحیح</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderExams = () => (
    <View style={styles.tabContent}>
      <View style={styles.examsHeader}>
        <Text style={styles.examsCount}>{exams.length} آزمون</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/(teacher)/exam/create" as any)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>آزمون جدید</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.examsList}>
        {exams.map((exam) => (
          <TouchableOpacity
            key={exam.id}
            style={styles.examRow}
            onPress={() => router.push(`/(public)/notifications` as any)}
          >
            <View style={styles.examInfo}>
              <Text style={styles.examTitle}>{exam.title}</Text>
              <View style={styles.examStats}>
                <View style={styles.examStat}>
                  <Ionicons
                    name="people"
                    size={14}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.examStatText}>
                    {exam.submissions} شرکت‌کننده
                  </Text>
                </View>
                <View style={styles.examStat}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.examStatText}>
                    {exam.graded} تصحیح شده
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.examGradeContainer}>
              {exam.average_grade > 0 ? (
                <>
                  <Text style={styles.gradeValue}>
                    {exam.average_grade.toFixed(1)}
                  </Text>
                  <Text style={styles.gradeLabel}>میانگین</Text>
                </>
              ) : (
                <Text style={styles.ungradedText}>در انتظار</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="مدیریت دوره"
        showBack
        onBackPress={() => router.back()} // ✅ FIXED: Use router.back() instead of push
        rightComponent={
          <TouchableOpacity
            onPress={() => router.push(`/(teacher)/course/${id}` as any)}
          >
            <Ionicons name="settings" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      {/* Course Header */}
      {course && (
        <View style={styles.courseHeader}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <View style={styles.courseStatus}>
            <Ionicons
              name={course.is_active ? "checkmark-circle" : "close-circle"}
              size={16}
              color={course.is_active ? Colors.success : Colors.danger}
            />
            <Text
              style={[
                styles.statusText,
                { color: course.is_active ? Colors.success : Colors.danger },
              ]}
            >
              {course.is_active ? "فعال" : "غیرفعال"}
            </Text>
          </View>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "overview" && styles.activeTab]}
          onPress={() => setActiveTab("overview")}
        >
          <Ionicons
            name="grid"
            size={20}
            color={
              activeTab === "overview" ? Colors.primary : Colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "overview" && styles.activeTabText,
            ]}
          >
            خلاصه
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "students" && styles.activeTab]}
          onPress={() => setActiveTab("students")}
        >
          <Ionicons
            name="people"
            size={20}
            color={
              activeTab === "students" ? Colors.primary : Colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "students" && styles.activeTabText,
            ]}
          >
            دانش‌آموزان ({students.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "assignments" && styles.activeTab]}
          onPress={() => setActiveTab("assignments")}
        >
          <Ionicons
            name="document-text"
            size={20}
            color={
              activeTab === "assignments"
                ? Colors.primary
                : Colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "assignments" && styles.activeTabText,
            ]}
          >
            کارخانگی ({assignments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "exams" && styles.activeTab]}
          onPress={() => setActiveTab("exams")}
        >
          <Ionicons
            name="clipboard"
            size={20}
            color={
              activeTab === "exams" ? Colors.primary : Colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "exams" && styles.activeTabText,
            ]}
          >
            آزمون‌ها ({exams.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {activeTab === "overview" && renderOverview()}
        {activeTab === "students" && renderStudents()}
        {activeTab === "assignments" && renderAssignments()}
        {activeTab === "exams" && renderExams()}
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
  courseHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    flex: 1,
  },
  courseStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
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
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAction: {
    width: "48%",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  recentStudents: {
    gap: 12,
  },
  studentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  studentAvatar: {
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
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  studentProgress: {
    alignItems: "flex-end",
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: "500",
  },
  progressBar: {
    width: 80,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.success,
    borderRadius: 2,
  },
  studentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  studentsCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  addStudentButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addStudentText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  studentsList: {
    gap: 12,
  },
  studentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  studentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBadgeText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: "bold",
  },
  messageButton: {
    padding: 8,
  },
  removeButton: {
    padding: 8,
  },
  studentLastActive: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  assignmentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  assignmentsCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  assignmentsList: {
    gap: 12,
  },
  assignmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  assignmentStats: {
    flexDirection: "row",
    gap: 16,
  },
  assignmentStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  assignmentStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  assignmentGrade: {
    alignItems: "center",
  },
  gradeValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.success,
  },
  gradeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ungradedText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  examsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  examsCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  examsList: {
    gap: 12,
  },
  examRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  examStats: {
    flexDirection: "row",
    gap: 16,
  },
  examStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  examStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  examGradeContainer: {
    alignItems: "center",
  },
});
