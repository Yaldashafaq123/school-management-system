import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../contexts/AuthContext";
import { apiRequest } from "../../../src/config/api";

interface Student {
  id: number;
  name: string;
  rollNumber: string;
  score: number | null;
  percentage: number | null;
  letterGrade: string | null;
  feedback?: string;
}

export default function ExamGradingScreen() {
  const { examId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exam, setExam] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    fetchExamData();
  }, [examId]);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(`/teacher/exams/${examId}/grading`);

      if (response.success && response.data) {
        setExam(response.data);
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error("Error fetching exam:", error);
      Alert.alert("خطا", "مشکل در دریافت اطلاعات امتحان");
    } finally {
      setLoading(false);
    }
  };

  const updateStudentScore = (studentId: number, score: string) => {
    const numericScore = parseInt(score) || 0;
    const maxScore = exam.maxScore;
    const percentage = (numericScore / maxScore) * 100;
    let letterGrade = "F";

    if (percentage >= 90) letterGrade = "A";
    else if (percentage >= 85) letterGrade = "B+";
    else if (percentage >= 80) letterGrade = "B";
    else if (percentage >= 75) letterGrade = "C+";
    else if (percentage >= 70) letterGrade = "C";
    else if (percentage >= 60) letterGrade = "D";

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, score: numericScore, percentage, letterGrade }
          : s,
      ),
    );
  };

  const saveGrades = async (publishResults = false) => {
    if (!exam) return;

    // Validate all scores are entered
    const missingScores = students.filter((s) => s.score === null);
    if (missingScores.length > 0) {
      Alert.alert(
        "نمرات ناقص",
        `نمرات ${missingScores.length} دانش‌آموز وارد نشده است. آیا مطمئن هستید؟`,
        [
          { text: "لغو", style: "cancel" },
          {
            text: "ادامه",
            onPress: () => saveGradesWithConfirmation(publishResults),
          },
        ],
      );
      return;
    }

    await saveGradesWithConfirmation(publishResults);
  };

  const saveGradesWithConfirmation = async (publishResults: boolean) => {
    try {
      setSaving(true);

      const gradesData = students.map((s) => ({
        studentId: s.id,
        score: s.score || 0,
        feedback: s.feedback || null,
      }));

      const response = await apiRequest("/teacher/exams/grades/save", {
        method: "POST",
        body: JSON.stringify({
          examId: parseInt(examId as string),
          grades: gradesData,
          publishResults,
        }),
      });

      if (response.success) {
        if (publishResults) {
          Alert.alert("موفقیت", "نمرات با موفقیت ذخیره و منتشر شد", [
            { text: "باشه", onPress: () => router.back() },
          ]);
        } else {
          Alert.alert("موفقیت", "نمرات با موفقیت ذخیره شد");
          router.back();
        }
      } else {
        Alert.alert("خطا", response.message || "خطا در ذخیره نمرات");
      }
    } catch (error) {
      console.error("Error saving grades:", error);
      Alert.alert("خطا", "مشکل در ذخیره نمرات");
    } finally {
      setSaving(false);
      setShowPublishModal(false);
    }
  };

  const publishResults = async () => {
    try {
      setSaving(true);
      const response = await apiRequest(`/teacher/exams/${examId}/publish`, {
        method: "POST",
        body: JSON.stringify({ announcement }),
      });

      if (response.success) {
        Alert.alert("موفقیت", "نتایج امتحان با موفقیت منتشر شد");
        router.back();
      }
    } catch (error) {
      Alert.alert("خطا", "مشکل در انتشار نتایج");
    } finally {
      setSaving(false);
      setShowPublishModal(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>در حال دریافت اطلاعات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-forward" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ورود نمرات</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Exam Info Card */}
        <View style={styles.examInfo}>
          <Text style={styles.examTitle}>{exam?.title}</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="book" size={16} color="#666" />
              <Text style={styles.infoText}>{exam?.subject}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.infoText}>{exam?.persianDate}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time" size={16} color="#666" />
              <Text style={styles.infoText}>{exam?.time}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.infoText}>{exam?.location}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="star" size={16} color="#666" />
              <Text style={styles.infoText}>حداکثر نمره: {exam?.maxScore}</Text>
            </View>
          </View>
        </View>

        {/* Grading Table */}
        <View style={styles.gradingTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 2 }]}>دانش‌آموز</Text>
            <Text style={styles.headerCell}>نمره</Text>
            <Text style={styles.headerCell}>درصد</Text>
            <Text style={styles.headerCell}>درجه</Text>
          </View>

          {students.map((student) => (
            <View key={student.id} style={styles.studentRow}>
              <View style={[styles.studentCell, { flex: 2 }]}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.rollNumber}>{student.rollNumber}</Text>
              </View>

              <View style={styles.scoreCell}>
                <TextInput
                  style={styles.scoreInput}
                  value={student.score?.toString() || ""}
                  onChangeText={(value) =>
                    updateStudentScore(student.id, value)
                  }
                  keyboardType="numeric"
                  placeholder="-"
                  placeholderTextColor="#ccc"
                />
                <Text style={styles.maxScore}>/{exam?.maxScore}</Text>
              </View>

              <View style={styles.percentageCell}>
                <Text style={styles.percentageText}>
                  {student.percentage
                    ? `${student.percentage.toFixed(1)}%`
                    : "-"}
                </Text>
              </View>

              <View style={styles.gradeCell}>
                <View
                  style={[
                    styles.gradeBadge,
                    {
                      backgroundColor:
                        getGradeColor(student.letterGrade || "F") + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.gradeText,
                      { color: getGradeColor(student.letterGrade || "F") },
                    ]}
                  >
                    {student.letterGrade || "-"}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Statistics */}
        {students.length > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>آمار کلاسی</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {calculateAverage(students)}
                </Text>
                <Text style={styles.statLabel}>میانگین نمره</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {calculatePassingRate(students)}%
                </Text>
                <Text style={styles.statLabel}>نرخ قبولی</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {getGradeDistribution(students).highest}
                </Text>
                <Text style={styles.statLabel}>بالاترین نمره</Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={() => saveGrades(false)}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="#fff" />
                <Text style={styles.buttonText}>ذخیره نمرات</Text>
              </>
            )}
          </TouchableOpacity>

          {exam?.type !== "MONTHLY" && (
            <TouchableOpacity
              style={[styles.button, styles.publishButton]}
              onPress={() => setShowPublishModal(true)}
              disabled={saving}
            >
              <Ionicons name="megaphone" size={20} color="#fff" />
              <Text style={styles.buttonText}>ذخیره و انتشار نتایج</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Publish Results Modal */}
      <Modal
        visible={showPublishModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>انتشار نتایج امتحان</Text>
            <Text style={styles.modalSubtitle}>
              با انتشار نتایج، دانش‌آموزان می‌توانند نمرات خود را مشاهده کنند
            </Text>

            <TextInput
              style={styles.announcementInput}
              placeholder="پیام به دانش‌آموزان (اختیاری)"
              placeholderTextColor="#999"
              value={announcement}
              onChangeText={setAnnouncement}
              multiline
              textAlign="right"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPublishModal(false)}
              >
                <Text style={styles.cancelButtonText}>لغو</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => saveGrades(true)}
              >
                <Text style={styles.confirmButtonText}>انتشار نتایج</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Helper functions
const getGradeColor = (grade: string) => {
  switch (grade) {
    case "A":
      return "#4CAF50";
    case "B+":
      return "#8BC34A";
    case "B":
      return "#CDDC39";
    case "C+":
      return "#FFC107";
    case "C":
      return "#FF9800";
    case "D":
      return "#FF5722";
    default:
      return "#F44336";
  }
};

const calculateAverage = (students: Student[]) => {
  const scores = students
    .filter((s) => s.score !== null)
    .map((s) => s.score || 0);
  if (scores.length === 0) return "0";
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return avg.toFixed(1);
};

const calculatePassingRate = (students: Student[]) => {
  const passed = students.filter((s) => (s.percentage || 0) >= 70).length;
  return Math.round((passed / students.length) * 100);
};

const getGradeDistribution = (students: Student[]) => {
  const scores = students
    .filter((s) => s.score !== null)
    .map((s) => s.score || 0);
  return {
    highest: Math.max(...scores, 0),
    lowest: Math.min(...scores, 100),
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  examInfo: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "right",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
  },
  gradingTable: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  studentCell: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  rollNumber: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  scoreCell: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    textAlign: "center",
    width: 60,
  },
  maxScore: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
  },
  percentageCell: {
    flex: 1,
    alignItems: "center",
  },
  percentageText: {
    fontSize: 13,
    color: "#666",
  },
  gradeCell: {
    flex: 1,
    alignItems: "center",
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 40,
    alignItems: "center",
  },
  gradeText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  statsContainer: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "right",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statCard: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2196F3",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  publishButton: {
    backgroundColor: "#FF9800",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  announcementInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  confirmButton: {
    backgroundColor: "#2196F3",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 14,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
