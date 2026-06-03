// app/(teacher)/grading/index.tsx - FULLY FIXED VERSION
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

interface Class {
  id: number;
  name: string;
  section: string;
  studentCount: number;
  grade?: string;
  role?: string;
  isActive?: boolean;
}

interface Subject {
  id: number;
  name: string;
}

interface StudentGrade {
  id: number;
  name: string;
  rollNumber: string;
  score: string;
  feedback: string;
  isSaved: boolean;
}

interface ExamData {
  id: number;
  name: string;
  type: string;
  maxScore: number;
  month?: number;
  year?: number;
}

export default function GradingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [examType, setExamType] = useState<string>("MONTHLY");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"class" | "subject" | "grading">("class");

  const persianMonths = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
  ];

  const examTypes = [
    { id: "MONTHLY", label: "امتحان ماهانه", icon: "calendar", color: Colors.primary },
    { id: "HALF_YEARLY", label: "امتحان چهارنیماه (۴۰٪)", icon: "trending-up", color: Colors.warning },
    { id: "FINAL", label: "امتحان نهایی (۶۰٪)", icon: "school", color: Colors.danger }
  ];

  const fetchClasses = async () => {
    try {
      console.log("Fetching classes for teacher...");
      const response = await apiRequest("/teacher/classes");
      console.log("Classes response:", response);
      
      if (response.success && response.data && response.data.length > 0) {
        const mappedClasses = response.data.map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          section: cls.section || "",
          studentCount: cls.students || 0,
          grade: cls.grade,
          role: cls.role,
          isActive: cls.isActive
        }));
        setClasses(mappedClasses);
        console.log("Classes set:", mappedClasses.length);
      } else {
        console.log("No classes found or empty response");
        setClasses([]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری صنوف پیش آمد");
      setClasses([]);
    }
  };

  const fetchSubjects = async (classId: number) => {
    try {
      console.log(`Fetching subjects for class ID: ${classId}`);
      const response = await apiRequest(`/teacher/classes/${classId}/subjects`);
      console.log("Subjects response:", response);
      
      if (response.success && response.data && response.data.length > 0) {
        setSubjects(response.data);
        console.log("Subjects set:", response.data.length);
      } else {
        console.log("No subjects found for this class");
        setSubjects([]);
        Alert.alert("اطلاع", "هیچ مضمونی برای این صنف ثبت نشده است");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
      Alert.alert("خطا", "مشکلی در بارگذاری مضامین پیش آمد");
    }
  };

  const fetchOrCreateExam = async () => {
    if (!selectedClass || !selectedSubject) return;
    
    try {
      setLoading(true);
      const response = await apiRequest("/teacher/exams/get-or-create", {
        method: "POST",
        body: JSON.stringify({
          classId: selectedClass.id,
          subjectId: selectedSubject.id,
          examType: examType,
          month: examType === "MONTHLY" ? selectedMonth : null,
          year: new Date().getFullYear()
        })
      });
      
      if (response.success && response.data) {
        setExamData(response.data.exam);
        setStudents(response.data.students);
        setStep("grading");
      } else {
        Alert.alert("خطا", response.message || "مشکلی در بارگذاری پیش آمد");
      }
    } catch (error) {
      console.error("Error fetching exam:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری امتحان پیش آمد");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrades = async (publish: boolean = false) => {
    if (!examData) return;
    
    setSaving(true);
    try {
      const gradesToSave = students.map(student => ({
        studentId: student.id,
        score: student.score,
        feedback: student.feedback
      }));
      
      const response = await apiRequest("/teacher/exams/save-grades", {
        method: "POST",
        body: JSON.stringify({
          examId: examData.id,
          grades: gradesToSave,
          publishResults: publish
        })
      });
      
      if (response.success) {
        Alert.alert("موفقیت", publish ? "نمرات با موفقیت ثبت و اعلام شد" : "نمرات با موفقیت ذخیره شد");
        setStudents(prev => prev.map(s => ({ ...s, isSaved: true })));
        if (publish) {
          router.back();
        }
      } else {
        Alert.alert("خطا", response.message || "مشکلی در ذخیره نمرات پیش آمد");
      }
    } catch (error) {
      console.error("Error saving grades:", error);
      Alert.alert("خطا", "مشکلی در ذخیره نمرات پیش آمد");
    } finally {
      setSaving(false);
    }
  };

  const handleGradeChange = (studentId: number, value: string) => {
    const numValue = parseFloat(value);
    const isValid = isNaN(numValue) || (numValue >= 0 && numValue <= (examData?.maxScore || 100));
    
    if (!isValid && value !== "") {
      Alert.alert("خطا", `نمره باید بین 0 تا ${examData?.maxScore} باشد`);
      return;
    }
    
    setStudents(prev =>
      prev.map(student =>
        student.id === studentId
          ? { ...student, score: value, isSaved: false }
          : student
      )
    );
  };

  const handleFeedbackChange = (studentId: number, value: string) => {
    setStudents(prev =>
      prev.map(student =>
        student.id === studentId
          ? { ...student, feedback: value, isSaved: false }
          : student
      )
    );
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (step === "class") {
      await fetchClasses();
    } else if (step === "subject" && selectedClass) {
      await fetchSubjects(selectedClass.id);
    }
    setRefreshing(false);
  };

  const renderClassSelection = () => (
    <View style={styles.container}>
      <Text style={styles.title}>انتخاب صنف</Text>
      <Text style={styles.subtitle}>صنفی را که می‌خواهید نمرات را برای آن وارد کنید انتخاب نمایید</Text>

      {classes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="school-outline" size={60} color={Colors.textSecondary} />
          <Text style={styles.emptyStateTitle}>هیچ صنفی یافت نشد</Text>
          <Text style={styles.emptyStateSubtitle}>
            شما به هیچ صنفی اختصاص داده نشده‌اید.
            {"\n"}لطفاً با مدیر مدرسه تماس بگیرید.
          </Text>
        </View>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.classCard}
              onPress={() => {
                setSelectedClass(item);
                fetchSubjects(item.id);
                setStep("subject");
              }}
            >
              <View style={styles.classIcon}>
                <Ionicons name="school" size={24} color={Colors.primary} />
              </View>
              <View style={styles.classInfo}>
                <Text style={styles.className}>{item.name}</Text>
                {item.section && item.section !== "null" && (
                  <Text style={styles.classSection}>بخش {item.section}</Text>
                )}
                <Text style={styles.classStats}>
                  {item.studentCount || 0} دانش‌آموز
                  {item.role === "supervisor" && " • معلم صنف"}
                  {item.role === "teacher" && " • مدرس مضمون"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );

  const renderSubjectSelection = () => (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setStep("class")} style={styles.backButton}>
        <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
        <Text style={styles.backButtonText}>بازگشت به انتخاب صنف</Text>
      </TouchableOpacity>

      <Text style={styles.title}>انتخاب مضمون</Text>
      <Text style={styles.subtitle}>صنف {selectedClass?.name} - مضمون مورد نظر را انتخاب کنید</Text>

      {subjects.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={60} color={Colors.textSecondary} />
          <Text style={styles.emptyStateTitle}>هیچ مضمونی یافت نشد</Text>
          <Text style={styles.emptyStateSubtitle}>
            برای این صنف هیچ مضمونی ثبت نشده است.
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={subjects}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.subjectCard}
                onPress={() => {
                  setSelectedSubject(item);
                  fetchOrCreateExam();
                }}
              >
                <View style={styles.subjectIcon}>
                  <Ionicons name="book" size={24} color={Colors.warning} />
                </View>
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectName}>{item.name}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
          />

          {/* Exam Type Selection */}
          <Text style={styles.sectionTitle}>نوع امتحان</Text>
          <View style={styles.examTypesRow}>
            {examTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.examTypeCard,
                  examType === type.id && { borderColor: type.color, backgroundColor: `${type.color}10` }
                ]}
                onPress={() => setExamType(type.id)}
              >
                <Ionicons name={type.icon as any} size={24} color={type.color} />
                <Text style={styles.examTypeLabel}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Month Selection for Monthly Exams */}
          {examType === "MONTHLY" && (
            <View style={styles.monthSection}>
              <Text style={styles.label}>ماه امتحان</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthsScroll}>
                {persianMonths.map((month, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.monthChip,
                      selectedMonth === index + 1 && styles.monthChipActive
                    ]}
                    onPress={() => setSelectedMonth(index + 1)}
                  >
                    <Text style={[
                      styles.monthChipText,
                      selectedMonth === index + 1 && styles.monthChipTextActive
                    ]}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <TouchableOpacity
            style={styles.continueButton}
            onPress={fetchOrCreateExam}
          >
            <Text style={styles.continueButtonText}>ادامه به صفحه نمرات</Text>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderGrading = () => (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setStep("subject")} style={styles.backButton}>
        <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
        <Text style={styles.backButtonText}>بازگشت به انتخاب مضمون</Text>
      </TouchableOpacity>

      <View style={styles.gradingHeader}>
        <View>
          <Text style={styles.title}>{examData?.name}</Text>
          <Text style={styles.subtitle}>
            {selectedClass?.name} - {selectedSubject?.name}
          </Text>
          <Text style={styles.maxScoreHint}>نمرات باید بین 0 تا {examData?.maxScore} باشند</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={() => handleSaveGrades(false)}
            disabled={saving}
          >
            <Ionicons name="save" size={18} color="#fff" />
            <Text style={styles.saveButtonText}>ذخیره</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.publishButton, saving && styles.saveButtonDisabled]}
            onPress={() => {
              Alert.alert(
                "اعلام نتایج",
                "آیا از اعلام نتایج این امتحان اطمینان دارید؟",
                [
                  { text: "لغو", style: "cancel" },
                  { text: "اعلام", onPress: () => handleSaveGrades(true) }
                ]
              );
            }}
            disabled={saving}
          >
            <Ionicons name="megaphone" size={18} color="#fff" />
            <Text style={styles.saveButtonText}>اعلام نتایج</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellText, styles.numberColumn]}>#</Text>
            <Text style={[styles.tableCellText, styles.nameColumn]}>نام دانش‌آموز</Text>
            <Text style={[styles.tableCellText, styles.scoreColumn]}>نمره</Text>
            <Text style={[styles.tableCellText, styles.feedbackColumn]}>نظر استاد</Text>
            <Text style={[styles.tableCellText, styles.statusColumn]}>وضعیت</Text>
          </View>

          {/* Table Rows */}
          {students.map((student, index) => (
            <View key={student.id} style={styles.tableRow}>
              <Text style={[styles.tableCellText, styles.numberColumn]}>{index + 1}</Text>
              <Text style={[styles.tableCellText, styles.nameColumn]}>{student.name}</Text>
              <View style={[styles.tableCellView, styles.scoreColumn]}>
                <TextInput
                  style={[
                    styles.scoreInput,
                    student.isSaved && styles.scoreInputSaved
                  ]}
                  value={student.score?.toString() || ""}
                  onChangeText={(value) => handleGradeChange(student.id, value)}
                  keyboardType="numeric"
                  placeholder="-"
                  placeholderTextColor={Colors.textSecondary}
                  textAlign="center"
                />
              </View>
              <View style={[styles.tableCellView, styles.feedbackColumn]}>
                <TextInput
                  style={styles.feedbackInput}
                  value={student.feedback}
                  onChangeText={(value) => handleFeedbackChange(student.id, value)}
                  placeholder="نظر..."
                  placeholderTextColor={Colors.textSecondary}
                  textAlign="right"
                />
              </View>
              <View style={[styles.tableCellView, styles.statusColumn]}>
                {student.isSaved ? (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                ) : student.score ? (
                  <Ionicons name="time-outline" size={20} color={Colors.warning} />
                ) : (
                  <Ionicons name="ellipse-outline" size={20} color={Colors.textSecondary} />
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          <Text style={styles.legendText}>ذخیره شده</Text>
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="time-outline" size={16} color={Colors.warning} />
          <Text style={styles.legendText}>در انتظار ذخیره</Text>
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="ellipse-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.legendText}>بدون نمره</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          کل دانش‌آموزان: {students.length} | 
          نمره‌دهی شده: {students.filter(s => s.score).length} | 
          ذخیره شده: {students.filter(s => s.isSaved).length}
        </Text>
      </View>
    </View>
  );

  if (loading && (step === "grading" || (step === "subject" && !subjects.length))) {
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
        title="ورود نمرات"
        rightComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {step === "class" && renderClassSelection()}
        {step === "subject" && renderSubjectSelection()}
        {step === "grading" && renderGrading()}
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
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "right",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    textAlign: "right",
  },
  maxScoreHint: {
    fontSize: 12,
    color: Colors.info,
    marginTop: 4,
    textAlign: "right",
  },
  listContent: {
    paddingBottom: 20,
  },
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  classIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "right",
  },
  classSection: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: "right",
  },
  classStats: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
    textAlign: "right",
  },
  subjectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.warning}20`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "right",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 20,
    marginBottom: 12,
    textAlign: "right",
  },
  examTypesRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  examTypeCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  examTypeLabel: {
    fontSize: 12,
    color: Colors.text,
    marginTop: 8,
    textAlign: "center",
  },
  monthSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "right",
  },
  monthsScroll: {
    flexDirection: "row",
  },
  monthChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  monthChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  monthChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  monthChipTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 10,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 14,
    color: Colors.primary,
  },
  gradingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 10,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  publishButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.success,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  tableCellText: {
    fontSize: 14,
    color: Colors.text,
  },
  tableCellView: {
    justifyContent: "center",
    alignItems: "center",
  },
  numberColumn: {
    width: 40,
    textAlign: "center",
  },
  nameColumn: {
    width: 140,
    textAlign: "right",
    fontWeight: "500",
  },
  scoreColumn: {
    width: 80,
    alignItems: "center",
  },
  feedbackColumn: {
    width: 180,
    alignItems: "flex-end",
  },
  statusColumn: {
    width: 50,
    alignItems: "center",
  },
  scoreInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 14,
    color: Colors.text,
    width: 70,
    textAlign: "center",
  },
  scoreInputSaved: {
    borderColor: Colors.success,
    backgroundColor: `${Colors.success}10`,
  },
  feedbackInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 12,
    color: Colors.text,
    width: 170,
    textAlign: "right",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statsContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.card,
    borderRadius: 8,
    alignItems: "center",
  },
  statsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
});