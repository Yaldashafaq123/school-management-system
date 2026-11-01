// app/teacher/assignment/[id]/grading.tsx - WITH DUAL GRADING MODES
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import {
  assignmentApi,
  AssignmentWithSubmissions,
  StudentWithoutSubmission,
  Submission,
} from "@/src/config/classApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type GradingMode = "online" | "notebook";

export default function TeacherGradingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [assignment, setAssignment] =
    useState<AssignmentWithSubmissions | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [studentsWithoutSubmission, setStudentsWithoutSubmission] = useState<
    StudentWithoutSubmission[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Tab
  const [mode, setMode] = useState<GradingMode>("online");

  // Online grading
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  // Notebook grading
  const [selectedStudent, setSelectedStudent] =
    useState<StudentWithoutSubmission | null>(null);

  // Shared inputs
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const isUngraded = (s: Submission) =>
    s.grade === null || s.grade === undefined;

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await assignmentApi.getAssignmentWithSubmissions(
        Number(id),
      );
      if (response.success && response.data) {
        const data = response.data;
        setAssignment(data);
        setSubmissions(data.submissions || []);
        setStudentsWithoutSubmission(data.studentsWithoutSubmission || []);

        // Default selection — prefer an ungraded online submission
        const ungraded = (data.submissions || []).find(isUngraded);
        if (ungraded) {
          setSelectedSubmission(ungraded);
          setGrade(ungraded.grade?.toString() ?? "");
          setFeedback(ungraded.feedback ?? "");
        } else if (data.submissions && data.submissions.length > 0) {
          setSelectedSubmission(data.submissions[0]);
          setGrade(data.submissions[0].grade?.toString() ?? "");
          setFeedback(data.submissions[0].feedback ?? "");
        } else if (
          data.studentsWithoutSubmission &&
          data.studentsWithoutSubmission.length > 0
        ) {
          // No online submissions at all — jump straight to notebook mode
          setMode("notebook");
          const first = data.studentsWithoutSubmission[0];
          setSelectedStudent(first);
          setSelectedSubmission(null);
          setGrade("");
          setFeedback("");
        }
      }
    } catch (error) {
      console.error("Load grading data failed:", error);
      Alert.alert("خطا", "بارگذاری اطلاعات ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const resetInputs = () => {
    setGrade("");
    setFeedback("");
  };

  const handleSelectOnline = (sub: Submission) => {
    setSelectedSubmission(sub);
    setSelectedStudent(null);
    setGrade(sub.grade?.toString() ?? "");
    setFeedback(sub.feedback ?? "");
  };

  const handleSelectNotebook = (student: StudentWithoutSubmission) => {
    setSelectedStudent(student);
    setSelectedSubmission(null);
    resetInputs();
  };

  const validateGrade = () => {
    if (!assignment) return false;
    const num = parseInt(grade, 10);
    if (isNaN(num) || num < 0 || num > assignment.max_score) {
      Alert.alert("خطا", `نمره باید بین ۰ و ${assignment.max_score} باشد`);
      return false;
    }
    return true;
  };

  const handleSaveOnlineGrade = async () => {
    if (!selectedSubmission || !assignment) return;
    if (!validateGrade()) return;

    setSaving(true);
    try {
      await assignmentApi.gradeSubmission({
        submissionId: selectedSubmission.id,
        grade: parseInt(grade, 10),
        feedback,
      });
      Alert.alert("موفقیت", `نمره ${grade}/${assignment.max_score} ذخیره شد.`, [
        { text: "باشه", onPress: () => loadData() },
      ]);
    } catch (error: any) {
      console.error("Save online grade failed:", error);
      Alert.alert(
        "خطا",
        error?.response?.data?.message ||
          error?.message ||
          "ذخیره نمره ناموفق بود",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotebookGrade = async () => {
    if (!selectedStudent || !assignment) return;
    if (!validateGrade()) return;

    setSaving(true);
    try {
      await assignmentApi.createManualSubmission(Number(id), {
        studentId: selectedStudent.id,
        grade: parseInt(grade, 10),
        feedback,
      });
      Alert.alert(
        "موفقیت",
        `نمره دفتری ${grade}/${assignment.max_score} برای ${selectedStudent.fullName} ذخیره شد.`,
        [{ text: "باشه", onPress: () => loadData() }],
      );
    } catch (error: any) {
      console.error("Save notebook grade failed:", error);
      Alert.alert(
        "خطا",
        error?.response?.data?.message ||
          error?.message ||
          "ذخیره نمره دفتری ناموفق بود",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!assignment) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          title="تصحیح کارخانگی"
          showBack
          onBackPress={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={Colors.danger} />
          <Text style={styles.errorText}>کارخانگی یافت نشد</Text>
        </View>
      </SafeAreaView>
    );
  }

  const ungradedCount = submissions.filter(isUngraded).length;

  const onlineBadgeCount = submissions.length;
  const notebookBadgeCount = studentsWithoutSubmission.length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="تصحیح کارخانگی" showBack onBackPress={() => router.back()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Assignment Info */}
        <View style={styles.assignmentInfo}>
          <Text style={styles.courseName}>{assignment.course_name}</Text>
          <Text style={styles.assignmentTitle}>{assignment.title}</Text>
          <View style={styles.assignmentMeta}>
            <Text style={styles.maxScore}>
              حداکثر نمره: {assignment.max_score}
            </Text>
            <Text style={styles.submissionInfo}>
              {ungradedCount} تحویل آنلاین تصحیح نشده
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, mode === "online" && styles.tabActive]}
            onPress={() => {
              setMode("online");
              resetInputs();
              setSelectedStudent(null);
              if (submissions.length > 0) handleSelectOnline(submissions[0]);
            }}
          >
            <Ionicons
              name="cloud-upload-outline"
              size={18}
              color={mode === "online" ? Colors.primary : Colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                mode === "online" && styles.tabTextActive,
              ]}
            >
              آنلاین ({onlineBadgeCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, mode === "notebook" && styles.tabActive]}
            onPress={() => {
              setMode("notebook");
              resetInputs();
              setSelectedSubmission(null);
              if (studentsWithoutSubmission.length > 0) {
                handleSelectNotebook(studentsWithoutSubmission[0]);
              }
            }}
          >
            <Ionicons
              name="book-outline"
              size={18}
              color={
                mode === "notebook" ? Colors.primary : Colors.textSecondary
              }
            />
            <Text
              style={[
                styles.tabText,
                mode === "notebook" && styles.tabTextActive,
              ]}
            >
              دفتری ({notebookBadgeCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── ONLINE MODE ── */}
        {mode === "online" && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>تحویل‌های آنلاین</Text>
              {submissions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="cloud-offline-outline"
                    size={40}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.emptyText}>
                    هیچ دانش‌آموزی از طریق اپلیکیشن تکلیف نفرستاده
                  </Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {submissions.map((sub) => {
                    const graded = !isUngraded(sub);
                    const selected = selectedSubmission?.id === sub.id;
                    return (
                      <TouchableOpacity
                        key={sub.id}
                        style={[
                          styles.submissionCard,
                          selected && styles.submissionCardSelected,
                          graded && styles.submissionCardGraded,
                        ]}
                        onPress={() => handleSelectOnline(sub)}
                      >
                        <Text style={styles.studentId} numberOfLines={1}>
                          {sub.student_name || `دانش‌آموز ${sub.student_id}`}
                        </Text>
                        <Text style={styles.submissionDate}>
                          {new Date(sub.submitted_at).toLocaleDateString(
                            "fa-IR",
                          )}
                        </Text>
                        <View style={styles.submissionStatus}>
                          <Ionicons
                            name={graded ? "checkmark-circle" : "time"}
                            size={14}
                            color={graded ? Colors.success : Colors.warning}
                          />
                          <Text
                            style={[
                              styles.statusText,
                              {
                                color: graded ? Colors.success : Colors.warning,
                              },
                            ]}
                          >
                            {graded ? `تصحیح شده (${sub.grade})` : "در انتظار"}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {selectedSubmission && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>پاسخ دانش‌آموز</Text>
                  <View style={styles.submissionContent}>
                    {selectedSubmission.content ? (
                      <Text style={styles.answerText}>
                        {selectedSubmission.content}
                      </Text>
                    ) : (
                      <Text style={styles.noAnswerText}>
                        پاسخ متنی ارائه نشده است
                      </Text>
                    )}
                    {selectedSubmission.attachments &&
                      selectedSubmission.attachments.length > 0 && (
                        <View style={styles.attachments}>
                          <Text style={styles.attachmentsLabel}>پیوست‌ها:</Text>
                          {selectedSubmission.attachments.map((a: any) => (
                            <View key={a.id} style={styles.attachment}>
                              <Ionicons
                                name="document-text"
                                size={16}
                                color={Colors.primary}
                              />
                              <Text style={styles.attachmentName}>
                                {a.name}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                  </View>
                </View>

                <GradeAndFeedback
                  grade={grade}
                  setGrade={setGrade}
                  feedback={feedback}
                  setFeedback={setFeedback}
                  maxScore={assignment.max_score}
                />

                <SaveButton
                  saving={saving}
                  onPress={handleSaveOnlineGrade}
                  label="ذخیره نمره آنلاین"
                />
              </>
            )}
          </>
        )}

        {/* ── NOTEBOOK MODE ── */}
        {mode === "notebook" && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>تصحیح دفتری</Text>
                <Text style={styles.helperText}>
                  برای دانش‌آموزانی که در دفتر نوشته‌اند
                </Text>
              </View>

              {studentsWithoutSubmission.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="checkmark-done-circle"
                    size={40}
                    color={Colors.success}
                  />
                  <Text style={styles.emptyText}>
                    همه دانش‌آموزان قبلاً ثبت شده‌اند
                  </Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {studentsWithoutSubmission.map((s) => {
                    const selected = selectedStudent?.id === s.id;
                    return (
                      <TouchableOpacity
                        key={s.id}
                        style={[
                          styles.submissionCard,
                          selected && styles.submissionCardSelected,
                          {
                            borderColor: selected
                              ? Colors.primary
                              : Colors.border,
                          },
                        ]}
                        onPress={() => handleSelectNotebook(s)}
                      >
                        <Text style={styles.studentId} numberOfLines={1}>
                          {s.fullName}
                        </Text>
                        <Text style={styles.submissionDate}>دفتری</Text>
                        <View style={styles.submissionStatus}>
                          <Ionicons
                            name="book"
                            size={14}
                            color={Colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.statusText,
                              { color: Colors.textSecondary },
                            ]}
                          >
                            تصحیح دستی
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            {selectedStudent && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    نمره دفتری برای {selectedStudent.fullName}
                  </Text>
                  <View style={styles.notebookHint}>
                    <Ionicons
                      name="information-circle"
                      size={18}
                      color={Colors.primary}
                    />
                    <Text style={styles.notebookHintText}>
                      تکلیف این دانش‌آموز در دفتر نوشته شده است. نمره را به صورت
                      دستی وارد کنید.
                    </Text>
                  </View>
                </View>

                <GradeAndFeedback
                  grade={grade}
                  setGrade={setGrade}
                  feedback={feedback}
                  setFeedback={setFeedback}
                  maxScore={assignment.max_score}
                />

                <SaveButton
                  saving={saving}
                  onPress={handleSaveNotebookGrade}
                  label="ذخیره نمره دفتری"
                />
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── small presentational components ───

function GradeAndFeedback({
  grade,
  setGrade,
  feedback,
  setFeedback,
  maxScore,
}: {
  grade: string;
  setGrade: (v: string) => void;
  feedback: string;
  setFeedback: (v: string) => void;
  maxScore: number;
}) {
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>نمره</Text>
        <View style={styles.gradeContainer}>
          <TextInput
            style={styles.gradeInput}
            value={grade}
            onChangeText={setGrade}
            keyboardType="numeric"
            placeholder={`۰ - ${maxScore}`}
            placeholderTextColor={Colors.textSecondary}
          />
          <Text style={styles.gradeMax}>/ {maxScore}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>بازخورد</Text>
        <TextInput
          style={styles.feedbackInput}
          placeholder="نظر خود را بنویسید..."
          placeholderTextColor={Colors.textSecondary}
          value={feedback}
          onChangeText={setFeedback}
          multiline
          textAlignVertical="top"
        />
      </View>
    </>
  );
}

function SaveButton({
  saving,
  onPress,
  label,
}: {
  saving: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <TouchableOpacity
      style={[styles.saveButton, saving && styles.saveButtonDisabled]}
      onPress={onPress}
      disabled={saving}
    >
      {saving ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Ionicons name="save" size={20} color="#fff" />
          <Text style={styles.saveButtonText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { flex: 1, padding: 16 },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: { fontSize: 18, color: Colors.text, marginTop: 16 },
  assignmentInfo: { marginBottom: 20 },
  courseName: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
    marginBottom: 4,
  },
  assignmentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  assignmentMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  maxScore: { fontSize: 14, color: Colors.text },
  submissionInfo: { fontSize: 12, color: Colors.textSecondary },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabActive: { backgroundColor: "rgba(59,130,246,0.1)" },
  tabText: { fontSize: 14, fontWeight: "500", color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },

  section: { marginBottom: 24 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  helperText: { fontSize: 12, color: Colors.textSecondary },

  emptyState: {
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
    gap: 8,
  },
  emptyText: { fontSize: 13, color: Colors.textSecondary, textAlign: "center" },

  submissionCard: {
    width: 150,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submissionCardSelected: { borderColor: Colors.primary, borderWidth: 2 },
  submissionCardGraded: { borderColor: Colors.success },
  studentId: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  submissionDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  submissionStatus: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusText: { fontSize: 12, fontWeight: "500" },

  submissionContent: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  answerText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  noAnswerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: "italic",
    marginBottom: 16,
  },
  attachments: { gap: 8 },
  attachmentsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  attachment: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  attachmentName: { fontSize: 14, color: Colors.text, flex: 1 },

  notebookHint: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: "rgba(59,130,246,0.08)",
    padding: 12,
    borderRadius: 8,
  },
  notebookHintText: { flex: 1, fontSize: 13, color: Colors.text },

  gradeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gradeInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
    padding: 8,
  },
  gradeMax: { fontSize: 18, color: Colors.textSecondary, marginLeft: 8 },
  feedbackInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
    color: Colors.text,
    textAlignVertical: "top",
    minHeight: 100,
    textAlign: "right",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
