// app/(teacher)/WeeklyAssessment/WeeklyAssessmentDetailScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../../components/Header";
import { Colors } from "../../../constants/Colors";
import { apiRequest } from "../../../src/config/api";

interface Student {
  studentId: number;
  studentName: string;
  email: string;
  marks: string;
  percentage: number;
  feedback: string;
  isSaved: boolean;
  rollNumber?: string;
}

interface AssessmentDetail {
  id: number;
  title: string;
  classId: number;
  className: string;
  classSection: string;
  subjectId: number;
  subjectName: string;
  weekNumber: number;
  maxMarks: number;
  createdAt: string;
  students: Student[];
}

interface Statistics {
  totalStudents: number;
  savedCount: number;
  averageMarks: number;
}

export default function WeeklyAssessmentDetailScreen() {
  const router = useRouter();
  const { assessmentId } = useLocalSearchParams<{ assessmentId: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalStudents: 0,
    savedCount: 0,
    averageMarks: 0,
  });

  useEffect(() => {
    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(
        `/teacher/weekly-assessments/${assessmentId}`,
      );
      if (response.success && response.data) {
        setAssessment(response.data);
        setStudents(response.data.students || []);
        calculateStatistics(response.data.students || []);
      } else {
        Alert.alert(
          "خطا",
          response.message || "مشکلی در بارگذاری ارزیابی پیش آمد",
        );
        router.back();
      }
    } catch (error) {
      console.error("Error fetching assessment:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری ارزیابی پیش آمد");
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStatistics = (studentList: Student[]) => {
    const total = studentList.length;
    const saved = studentList.filter((s) => s.isSaved).length;
    const marks = studentList
      .filter((s) => s.marks !== "")
      .map((s) => parseFloat(s.marks) || 0);
    const avg =
      marks.length > 0 ? marks.reduce((a, b) => a + b, 0) / marks.length : 0;

    setStatistics({
      totalStudents: total,
      savedCount: saved,
      averageMarks: Math.round(avg * 100) / 100,
    });
  };

  const handleStudentMarksChange = (studentId: number, marks: string) => {
    const updatedStudents = students.map((student) => {
      if (student.studentId === studentId) {
        return { ...student, marks, isSaved: false };
      }
      return student;
    });
    setStudents(updatedStudents);
    calculateStatistics(updatedStudents);
  };

  const handleStudentFeedbackChange = (studentId: number, feedback: string) => {
    const updatedStudents = students.map((student) => {
      if (student.studentId === studentId) {
        return { ...student, feedback, isSaved: false };
      }
      return student;
    });
    setStudents(updatedStudents);
  };

  const handleSaveAll = async () => {
    const results = students.map((student) => ({
      studentId: student.studentId,
      marks: parseFloat(student.marks) || 0,
      feedback: student.feedback || "",
    }));

    setSaving(true);
    try {
      const response = await apiRequest(
        `/teacher/weekly-assessments/${assessmentId}/results`,
        {
          method: "POST",
          body: JSON.stringify({ results }),
        },
      );

      if (response.success) {
        Alert.alert("موفق", "نمرات با موفقیت ذخیره شد");
        fetchAssessment();
      } else {
        Alert.alert("خطا", response.message || "مشکلی در ذخیره نمرات پیش آمد");
      }
    } catch (error) {
      console.error("Error saving results:", error);
      Alert.alert("خطا", "مشکلی در ذخیره نمرات پیش آمد");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAssessment();
  };

  const renderStudentItem = ({ item }: { item: Student }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentHeader}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.studentName}</Text>
          {item.isSaved && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={Colors.success}
            />
          )}
        </View>
        <Text style={styles.rollNumber}>شماره: {item.rollNumber || "N/A"}</Text>
      </View>

      <View style={styles.studentBody}>
        <View style={styles.marksContainer}>
          <Text style={styles.marksLabel}>نمره</Text>
          <TextInput
            style={styles.marksInput}
            value={item.marks.toString()}
            onChangeText={(text) =>
              handleStudentMarksChange(item.studentId, text)
            }
            placeholder="نمره"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="numeric"
            textAlign="center"
          />
          <Text style={styles.maxMarksText}>
            / {assessment?.maxMarks || 100}
          </Text>
        </View>

        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackLabel}>نظر</Text>
          <TextInput
            style={styles.feedbackInput}
            value={item.feedback || ""}
            onChangeText={(text) =>
              handleStudentFeedbackChange(item.studentId, text)
            }
            placeholder="نظر و بازخورد..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={2}
            textAlign="right"
          />
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title={assessment?.title || "ارزیابی هفتگی"}
        rightComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Badges */}
        <View style={styles.infoContainer}>
          <View style={styles.infoBadge}>
            <Ionicons
              name="book-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.infoBadgeText}>{assessment?.subjectName}</Text>
          </View>
          <View style={styles.infoBadge}>
            <Ionicons
              name="school-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.infoBadgeText}>
              {assessment?.className}
              {assessment?.classSection ? ` - ${assessment.classSection}` : ""}
            </Text>
          </View>
          <View style={styles.infoBadge}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text style={styles.infoBadgeText}>
              هفته {assessment?.weekNumber}
            </Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.totalStudents}</Text>
            <Text style={styles.statLabel}>تعداد دانش‌آموزان</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{statistics.savedCount}</Text>
            <Text style={styles.statLabel}>نمرات ثبت شده</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {statistics.averageMarks.toFixed(1)}
            </Text>
            <Text style={styles.statLabel}>میانگین نمرات</Text>
          </View>
        </View>

        {/* Students List */}
        <View style={styles.studentsContainer}>
          <View style={styles.studentsHeader}>
            <Text style={styles.studentsTitle}>دانش‌آموزان</Text>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveAll}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>ذخیره همه</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <FlatList
            data={students}
            renderItem={renderStudentItem}
            keyExtractor={(item) => item.studentId.toString()}
            scrollEnabled={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  هیچ دانش‌آموزی در این کلاس وجود ندارد
                </Text>
              </View>
            )}
          />
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
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  infoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  infoBadgeText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  studentsContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  studentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  studentsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  studentCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  studentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  studentName: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  rollNumber: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  studentBody: {
    marginTop: 4,
  },
  marksContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "flex-end",
  },
  marksLabel: {
    fontSize: 13,
    color: Colors.text,
    marginLeft: 8,
  },
  marksInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    width: 60,
    backgroundColor: Colors.card,
    color: Colors.text,
  },
  maxMarksText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  feedbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  feedbackLabel: {
    fontSize: 13,
    color: Colors.text,
    marginLeft: 8,
  },
  feedbackInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    backgroundColor: Colors.card,
    color: Colors.text,
    minHeight: 40,
    textAlign: "right",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
