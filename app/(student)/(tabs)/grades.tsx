// app/(student)/(tabs)/grades.tsx
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  SubjectGrade as ApiSubjectGrade,
  GradesData,
  studentGradesApi,
  Term,
  TermGrades,
} from "@/src/config/studentGradesApi";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ===================== EXTENDED TYPE =====================

// Extend the API SubjectGrade with our custom fields
interface ExtendedSubjectGrade extends ApiSubjectGrade {
  halfYearlyExamDetails?: any;
  finalExamDetails?: any;
}

// ===================== LOCAL TYPES (Extended for UI) =====================

interface ExamGrade {
  id: number;
  examId: number;
  studentId: number;
  subject: string;
  marks: number;
  percentage?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

interface WeeklyAssessmentResult {
  id: number;
  marks: number;
  percentage: number;
  feedback?: string;
  createdAt: string;
  assessmentTitle?: string;
  weekNumber?: number;
}

// Extended subject grade for UI with additional fields
interface UISubjectGrade {
  subjectId: number;
  subjectName: string;
  teacherName?: string;

  // Monthly exams (self-awareness)
  monthlyExams: ExamGrade[];
  monthlyAverage: number;
  weeklyAssessments: WeeklyAssessmentResult[];
  weeklyAverage: number;

  // REAL grades
  halfYearlyExam?: ExamGrade;
  halfYearlyExamDetails?: any;
  halfYearlyGradeLetter?: string;

  finalExam?: ExamGrade;
  finalExamDetails?: any;
  finalGradeLetter?: string;

  totalScore: number;
  totalGradeLetter: string;
  status: "PASSED" | "FAILED";

  rank?: number;
  totalStudents?: number;
}

interface UITermGrades {
  term: Term;
  subjects: UISubjectGrade[];
  overallAverage: number;
  classRank?: string;
  totalStudents?: number;
  attendanceRate?: number;
  passedCount: number;
  failedCount: number;
}

// ===================== GRADING HELPERS =====================

function getGradeLetter(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;

  if (percentage >= 90) return "الف";
  if (percentage >= 80) return "ب";
  if (percentage >= 70) return "ج";
  if (percentage >= 60) return "د";
  return "ه";
}

function getGradeInfo(
  score: number,
  maxScore: number,
): { letter: string; color: string; label: string } {
  const percentage = (score / maxScore) * 100;

  if (percentage >= 90) {
    return { letter: "الف", color: "#22c55e", label: "عالی" };
  }
  if (percentage >= 80) {
    return { letter: "ب", color: "#3b82f6", label: "خیلی خوب" };
  }
  if (percentage >= 70) {
    return { letter: "ج", color: "#8b5cf6", label: "خوب" };
  }
  if (percentage >= 60) {
    return { letter: "د", color: "#f59e0b", label: "قابل قبول" };
  }
  return { letter: "ه", color: "#dc2626", label: "نیاز به تلاش" };
}

function getGradeColorUI(score: number, maxScore: number): string {
  return getGradeInfo(score, maxScore).color;
}

function formatScore(value: number, max: number): string {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value)}/${max}`;
}

function formatDate(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function isPassed(totalScore: number): boolean {
  return totalScore >= 60;
}

// ===================== MAIN COMPONENT =====================

export default function GradesScreen() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [termGrades, setTermGrades] = useState<Record<number, UITermGrades>>(
    {},
  );
  const [currentGrades, setCurrentGrades] = useState<UITermGrades | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);

  /**
   * Transform API TermGrades to UI TermGrades
   */
  const transformTermGradesData = useCallback(
    (apiData: TermGrades): UITermGrades => {
      const subjects: UISubjectGrade[] = [];
      let passedCount = 0;
      let failedCount = 0;

      // Transform each subject - cast to ExtendedSubjectGrade to access custom fields
      for (const apiSubject of (apiData.subjects ||
        []) as ExtendedSubjectGrade[]) {
        const halfYearlyScore = apiSubject.halfYearly || 0;
        const finalScore = apiSubject.final || 0;
        const totalScore = halfYearlyScore + finalScore;

        const halfYearlyLetter =
          halfYearlyScore > 0 ? getGradeLetter(halfYearlyScore, 40) : "-";
        const finalLetter =
          finalScore > 0 ? getGradeLetter(finalScore, 60) : "-";
        const totalLetter = getGradeLetter(totalScore, 100);
        const passed = isPassed(totalScore);

        if (passed) {
          passedCount++;
        } else {
          failedCount++;
        }

        // Create UI subject grade
        const uiSubject: UISubjectGrade = {
          subjectId: apiSubject.id || 0,
          subjectName: apiSubject.subject || "نامشخص",
          teacherName: apiSubject.teacher || "",

          // Monthly exams (from API)
          monthlyExams: [],
          monthlyAverage: apiSubject.monthly || 0,
          weeklyAssessments: [],
          weeklyAverage: 0,

          // Half-yearly exam
          halfYearlyExam:
            apiSubject.halfYearly !== undefined &&
            apiSubject.halfYearly !== null
              ? {
                  id: 0,
                  examId: 0,
                  studentId: 0,
                  subject: apiSubject.subject || "",
                  marks: apiSubject.halfYearly,
                  percentage: (apiSubject.halfYearly / 40) * 100,
                  createdAt: "",
                  updatedAt: "",
                }
              : undefined,
          // Use the custom field from the extended type
          halfYearlyExamDetails:
            (apiSubject as ExtendedSubjectGrade).halfYearlyExamDetails || null,
          halfYearlyGradeLetter: halfYearlyLetter,

          // Final exam
          finalExam:
            apiSubject.final !== undefined && apiSubject.final !== null
              ? {
                  id: 0,
                  examId: 0,
                  studentId: 0,
                  subject: apiSubject.subject || "",
                  marks: apiSubject.final,
                  percentage: (apiSubject.final / 60) * 100,
                  createdAt: "",
                  updatedAt: "",
                }
              : undefined,
          // Use the custom field from the extended type
          finalExamDetails:
            (apiSubject as ExtendedSubjectGrade).finalExamDetails || null,
          finalGradeLetter: finalLetter,

          totalScore: totalScore,
          totalGradeLetter: totalLetter,
          status: passed ? "PASSED" : "FAILED",
          rank: apiSubject.rank || 0,
          totalStudents: apiData.totalStudents || 0,
        };

        subjects.push(uiSubject);
      }

      // Sort by total score (highest first)
      subjects.sort((a, b) => b.totalScore - a.totalScore);
      subjects.forEach((subject, index) => {
        subject.rank = index + 1;
      });

      return {
        term: apiData.term,
        subjects: subjects,
        overallAverage: apiData.overallAverage || 0,
        classRank: apiData.classRank ? String(apiData.classRank) : "-",
        totalStudents: apiData.totalStudents || 0,
        attendanceRate: apiData.attendanceRate || 0,
        passedCount: passedCount,
        failedCount: failedCount,
      };
    },
    [],
  );

  /**
   * Transform API GradesData to UI format
   */
  const transformGradesData = useCallback(
    (
      data: GradesData,
    ): {
      terms: Term[];
      termGrades: Record<number, UITermGrades>;
      currentTermGrades: UITermGrades | null;
    } => {
      const termGradesMap: Record<number, UITermGrades> = {};

      // Transform each term's grades
      for (const [termId, termData] of Object.entries(
        data.allTermsGrades || {},
      )) {
        termGradesMap[Number(termId)] = transformTermGradesData(termData);
      }

      const currentTermGrades = data.currentTermGrades
        ? transformTermGradesData(data.currentTermGrades)
        : null;

      return {
        terms: data.terms || [],
        termGrades: termGradesMap,
        currentTermGrades: currentTermGrades,
      };
    },
    [transformTermGradesData],
  );

  const loadGradesData = useCallback(async () => {
    try {
      setLoading(true);

      // Use the API from studentGradesApi
      const response = await studentGradesApi.getAllGrades();

      if (response.success && response.data) {
        const data = response.data as GradesData;

        // Transform API data to UI format
        const transformedData = transformGradesData(data);

        setTerms(transformedData.terms);
        setTermGrades(transformedData.termGrades);
        setCurrentGrades(transformedData.currentTermGrades);

        if (transformedData.terms.length > 0) {
          setSelectedTerm(
            transformedData.currentTermGrades?.term?.id ||
              transformedData.terms[0].id,
          );
        }
      }
    } catch (error) {
      console.error("Error loading grades:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [transformGradesData]);

  useEffect(() => {
    loadGradesData();
  }, [loadGradesData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGradesData();
  };

  const handleTermChange = async (termId: number) => {
    setSelectedTerm(termId);

    // If we don't have grades for this term yet, fetch them
    if (!termGrades[termId]) {
      try {
        const response = await studentGradesApi.getTermGrades(termId);
        if (response.success && response.data) {
          const termData = response.data as TermGrades;
          const uiTermData = transformTermGradesData(termData);

          setTermGrades((prev) => ({
            ...prev,
            [termId]: uiTermData,
          }));
        }
      } catch (error) {
        console.error("Error fetching term grades:", error);
      }
    }
  };

  const currentTermGrades =
    selectedTerm && termGrades[selectedTerm]
      ? termGrades[selectedTerm]
      : currentGrades;

  const calculateTermStats = (grades: UISubjectGrade[]) => {
    if (!grades || grades.length === 0) {
      return { passed: 0, failed: 0 };
    }

    const passed = grades.filter((g) => g.status === "PASSED").length;
    const failed = grades.filter((g) => g.status === "FAILED").length;

    return { passed, failed };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="کارنامه" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Safe access with fallback values
  const safePassedCount = currentTermGrades?.passedCount ?? 0;
  const safeFailedCount = currentTermGrades?.failedCount ?? 0;
  const safeSubjects = currentTermGrades?.subjects ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="کارنامه"
        rightComponent={
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download-outline" size={22} color={Colors.text} />
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
        {/* Term Selector */}
        {terms.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.termSelector}
            contentContainerStyle={styles.termSelectorContent}
          >
            {terms.map((term) => (
              <TouchableOpacity
                key={term.id}
                style={[
                  styles.termChip,
                  selectedTerm === term.id && styles.termChipActive,
                  term.isCurrent && styles.currentTerm,
                ]}
                onPress={() => handleTermChange(term.id)}
              >
                <Text
                  style={[
                    styles.termChipText,
                    selectedTerm === term.id && styles.termChipTextActive,
                  ]}
                >
                  {term.name}
                </Text>
                {term.isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>جاری</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={48}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyStateText}>
              هنوز ترمی برای نمایش وجود ندارد
            </Text>
          </View>
        )}

        {currentTermGrades ? (
          <>
            {/* Report Card Header */}
            <View style={styles.reportCardHeader}>
              <Text style={styles.reportCardTitle}>کارنامه تحصیلی</Text>
              <Text style={styles.reportCardSubtitle}>
                {currentTermGrades.term.name}
              </Text>
              {currentTermGrades.term.startDate &&
                currentTermGrades.term.endDate && (
                  <Text style={styles.reportCardDate}>
                    {formatDate(currentTermGrades.term.startDate)} -{" "}
                    {formatDate(currentTermGrades.term.endDate)}
                  </Text>
                )}
            </View>

            {/* Overall Stats */}
            <View style={styles.overallStats}>
              <View style={styles.overallStatCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="trophy" size={24} color="#f59e0b" />
                  <Text style={styles.statTitle}>میانگین کل</Text>
                </View>
                <Text
                  style={[
                    styles.overallAverage,
                    {
                      color: getGradeColorUI(
                        currentTermGrades.overallAverage,
                        100,
                      ),
                    },
                  ]}
                >
                  {currentTermGrades.overallAverage || "۰"}
                </Text>
                <Text style={styles.statSubtitle}>از ۱۰۰</Text>
              </View>

              <View style={styles.overallStatCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="trending-up" size={24} color="#3b82f6" />
                  <Text style={styles.statTitle}>درجه در صنف </Text>
                </View>
                <Text style={styles.classRank}>
                  {currentTermGrades.classRank || "-"}
                </Text>
                <Text style={styles.statSubtitle}>
                  از {currentTermGrades.totalStudents || 0} نفر
                </Text>
              </View>
            </View>

            {/* Pass/Fail Summary */}
            <View style={styles.passFailContainer}>
              <View style={styles.passFailItem}>
                <View
                  style={[styles.passFailDot, { backgroundColor: "#22c55e" }]}
                />
                <Text style={styles.passFailLabel}>قبول</Text>
                <Text style={styles.passFailValue}>{safePassedCount}</Text>
              </View>
              <View style={styles.passFailItem}>
                <View
                  style={[styles.passFailDot, { backgroundColor: "#dc2626" }]}
                />
                <Text style={styles.passFailLabel}>رد</Text>
                <Text style={styles.passFailValue}>{safeFailedCount}</Text>
              </View>
              <View style={styles.passFailItem}>
                <Ionicons name="time" size={16} color="#3b82f6" />
                <Text style={styles.passFailLabel}>حضور</Text>
                <Text style={styles.passFailValue}>
                  {currentTermGrades.attendanceRate || 0}%
                </Text>
              </View>
            </View>

            {/* Grading System Info */}
            <View style={styles.infoContainer}>
              <Ionicons name="information-circle" size={18} color="#3b82f6" />
              <Text style={styles.infoText}>
                نمره نهایی = نمره ۴.۵ ماهه (۴۰ نمره) + نمره سالانه (۶۰ نمره) =
                ۱۰۰ نمره
              </Text>
            </View>

            {/* ===== REPORT CARD TABLE ===== */}
            <View style={styles.tableContainer}>
              <Text style={styles.sectionTitle}>کارنامه دروس</Text>

              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.subjectCol]}>
                  درس
                </Text>
                <Text style={[styles.tableHeaderText, styles.examCol]}>
                  ۴.۵ ماهه
                </Text>
                <Text style={[styles.tableHeaderText, styles.examCol]}>
                  نهایی
                </Text>
                <Text style={[styles.tableHeaderText, styles.totalCol]}>
                  مجموع
                </Text>
                <Text style={[styles.tableHeaderText, styles.gradeCol]}>
                  درجه
                </Text>
              </View>

              {/* Table Rows */}
              {safeSubjects.length > 0 ? (
                safeSubjects.map((subject: UISubjectGrade) => (
                  <TouchableOpacity
                    key={subject.subjectId}
                    style={styles.tableRow}
                    onPress={() =>
                      setShowDetails(
                        showDetails === subject.subjectId
                          ? null
                          : subject.subjectId,
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.tableCell,
                        styles.subjectCol,
                        styles.subjectNameCell,
                      ]}
                    >
                      {subject.subjectName}
                    </Text>

                    {/* 4.5 Month Exam - 40 points */}
                    <View style={[styles.tableCellWrapper, styles.examCol]}>
                      <Text style={styles.examScore}>
                        {subject.halfYearlyExam
                          ? formatScore(subject.halfYearlyExam.marks, 40)
                          : "—"}
                      </Text>
                      {subject.halfYearlyGradeLetter &&
                        subject.halfYearlyGradeLetter !== "-" && (
                          <Text
                            style={[
                              styles.examGrade,
                              {
                                color: getGradeColorUI(
                                  subject.halfYearlyExam?.marks || 0,
                                  40,
                                ),
                              },
                            ]}
                          >
                            {subject.halfYearlyGradeLetter}
                          </Text>
                        )}
                    </View>

                    {/* Final Exam - 60 points */}
                    <View style={[styles.tableCellWrapper, styles.examCol]}>
                      <Text style={styles.examScore}>
                        {subject.finalExam
                          ? formatScore(subject.finalExam.marks, 60)
                          : "—"}
                      </Text>
                      {subject.finalGradeLetter &&
                        subject.finalGradeLetter !== "-" && (
                          <Text
                            style={[
                              styles.examGrade,
                              {
                                color: getGradeColorUI(
                                  subject.finalExam?.marks || 0,
                                  60,
                                ),
                              },
                            ]}
                          >
                            {subject.finalGradeLetter}
                          </Text>
                        )}
                    </View>

                    {/* Total - 100 points */}
                    <View style={[styles.tableCellWrapper, styles.totalCol]}>
                      <Text
                        style={[
                          styles.totalScore,
                          { color: getGradeColorUI(subject.totalScore, 100) },
                        ]}
                      >
                        {subject.totalScore}/۱۰۰
                      </Text>
                    </View>

                    {/* Grade */}
                    <View style={[styles.tableCellWrapper, styles.gradeCol]}>
                      <View
                        style={[
                          styles.gradeBadge,
                          {
                            backgroundColor:
                              subject.status === "PASSED"
                                ? "rgba(34, 197, 94, 0.15)"
                                : "rgba(220, 38, 38, 0.15)",
                            borderColor:
                              subject.status === "PASSED"
                                ? "#22c55e"
                                : "#dc2626",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.gradeBadgeText,
                            {
                              color:
                                subject.status === "PASSED"
                                  ? "#22c55e"
                                  : "#dc2626",
                            },
                          ]}
                        >
                          {subject.totalGradeLetter}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyTable}>
                  <Text style={styles.emptyTableText}>
                    هنوز نمره‌ای ثبت نشده است
                  </Text>
                </View>
              )}

              {/* Overall Result Row */}
              {safeSubjects.length > 0 && (
                <View style={styles.overallRow}>
                  <Text style={styles.overallLabel}>نتیجه کلی:</Text>
                  <View style={styles.overallBadge}>
                    <Text style={styles.overallBadgeText}>
                      {safePassedCount === safeSubjects.length
                        ? "✅ قبول"
                        : safePassedCount > 0
                          ? `⚠️ ${safePassedCount} قبول، ${safeFailedCount} رد`
                          : "❌ رد"}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Detailed View (expanded subject) */}
            {safeSubjects.map(
              (subject) =>
                showDetails === subject.subjectId && (
                  <View
                    key={`detail-${subject.subjectId}`}
                    style={styles.detailsContainer}
                  >
                    {/* Half-Yearly Exam Details */}
                    <View style={styles.examDetailsCard}>
                      <Text style={styles.examDetailsTitle}>
                        <Ionicons
                          name="book-outline"
                          size={16}
                          color="#3b82f6"
                        />{" "}
                        امتحان ۴.۵ ماهه (۴۰ نمره)
                      </Text>

                      {subject.halfYearlyExam ? (
                        <View style={styles.examDetailsContent}>
                          <View style={styles.examDetailRow}>
                            <Text style={styles.examDetailLabel}>نمره</Text>
                            <Text
                              style={[
                                styles.examDetailValue,
                                { fontWeight: "bold" },
                              ]}
                            >
                              {formatScore(subject.halfYearlyExam.marks, 40)}
                            </Text>
                          </View>
                          <View style={styles.examDetailRow}>
                            <Text style={styles.examDetailLabel}>درجه</Text>
                            <Text
                              style={[
                                styles.examDetailValue,
                                { fontWeight: "bold" },
                              ]}
                            >
                              {subject.halfYearlyGradeLetter || "-"}
                            </Text>
                          </View>
                          {subject.halfYearlyExam.feedback && (
                            <View style={styles.examDetailRow}>
                              <Text style={styles.examDetailLabel}>
                                نظر معلم
                              </Text>
                              <Text style={styles.examDetailValue}>
                                {subject.halfYearlyExam.feedback}
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : (
                        <View style={styles.noExamData}>
                          <Text style={styles.noExamDataText}>
                            نمره امتحان ۴.۵ ماهه ثبت نشده است
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Final Exam Details */}
                    <View style={styles.examDetailsCard}>
                      <Text style={styles.examDetailsTitle}>
                        <Ionicons
                          name="school-outline"
                          size={16}
                          color="#8b5cf6"
                        />{" "}
                        امتحان سالانه (۶۰ نمره)
                      </Text>

                      {subject.finalExam ? (
                        <View style={styles.examDetailsContent}>
                          <View style={styles.examDetailRow}>
                            <Text style={styles.examDetailLabel}>نمره</Text>
                            <Text
                              style={[
                                styles.examDetailValue,
                                { fontWeight: "bold" },
                              ]}
                            >
                              {formatScore(subject.finalExam.marks, 60)}
                            </Text>
                          </View>
                          <View style={styles.examDetailRow}>
                            <Text style={styles.examDetailLabel}>درجه</Text>
                            <Text
                              style={[
                                styles.examDetailValue,
                                { fontWeight: "bold" },
                              ]}
                            >
                              {subject.finalGradeLetter || "-"}
                            </Text>
                          </View>
                          {subject.finalExam.feedback && (
                            <View style={styles.examDetailRow}>
                              <Text style={styles.examDetailLabel}>
                                نظر معلم
                              </Text>
                              <Text style={styles.examDetailValue}>
                                {subject.finalExam.feedback}
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : (
                        <View style={styles.noExamData}>
                          <Text style={styles.noExamDataText}>
                            نمره امتحان سالانه ثبت نشده است
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Final Calculation */}
                    <View style={styles.finalGradeContainer}>
                      <Text style={styles.finalGradeTitle}>
                        <Ionicons
                          name="calculator-outline"
                          size={16}
                          color="#f59e0b"
                        />{" "}
                        محاسبه نمره نهایی
                      </Text>

                      <View style={styles.calculationRow}>
                        <Text style={styles.calculationLabel}>
                          ۴.۵ ماهه (۴۰ نمره)
                        </Text>
                        <Text style={styles.calculationValue}>
                          {subject.halfYearlyExam
                            ? `${Math.round(subject.halfYearlyExam.marks)} / ۴۰`
                            : "۰ / ۴۰"}
                        </Text>
                      </View>
                      <View style={styles.calculationRow}>
                        <Text style={styles.calculationLabel}>
                          سالانه (۶۰ نمره)
                        </Text>
                        <Text style={styles.calculationValue}>
                          {subject.finalExam
                            ? `${Math.round(subject.finalExam.marks)} / ۶۰`
                            : "۰ / ۶۰"}
                        </Text>
                      </View>
                      <View
                        style={[styles.calculationRow, styles.calculationTotal]}
                      >
                        <Text style={styles.calculationLabel}>
                          مجموع (۱۰۰ نمره)
                        </Text>
                        <Text
                          style={[
                            styles.calculationValue,
                            styles.calculationTotalValue,
                            { color: getGradeColorUI(subject.totalScore, 100) },
                          ]}
                        >
                          {subject.totalScore} / ۱۰۰
                          {"  "}
                          <Text style={styles.calculationLetter}>
                            ({subject.totalGradeLetter})
                          </Text>
                        </Text>
                      </View>

                      {/* Progress Bar */}
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${Math.min(subject.totalScore, 100)}%`,
                                backgroundColor: getGradeColorUI(
                                  subject.totalScore,
                                  100,
                                ),
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressLabel}>
                          {subject.status === "PASSED" ? "✅ قبول" : "❌ رد"}
                        </Text>
                      </View>
                    </View>
                  </View>
                ),
            )}

            {/* Performance Summary */}
            {safeSubjects.length > 0 && (
              <View style={styles.performanceContainer}>
                <Text style={styles.sectionTitle}>خلاصه عملکرد</Text>
                <View style={styles.performanceGrid}>
                  <View style={styles.performanceItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#22c55e"
                    />
                    <Text style={styles.performanceValue}>
                      {calculateTermStats(safeSubjects).passed || 0}
                    </Text>
                    <Text style={styles.performanceLabel}>قبول</Text>
                  </View>
                  <View style={styles.performanceItem}>
                    <Ionicons name="close-circle" size={20} color="#dc2626" />
                    <Text style={styles.performanceValue}>
                      {calculateTermStats(safeSubjects).failed || 0}
                    </Text>
                    <Text style={styles.performanceLabel}>رد</Text>
                  </View>
                  <View style={styles.performanceItem}>
                    <Ionicons name="time" size={20} color="#3b82f6" />
                    <Text style={styles.performanceValue}>
                      {currentTermGrades.attendanceRate || 0}%
                    </Text>
                    <Text style={styles.performanceLabel}>حضور</Text>
                  </View>
                  <View style={styles.performanceItem}>
                    <Ionicons name="trophy" size={20} color="#f59e0b" />
                    <Text style={styles.performanceValue}>
                      {currentTermGrades.classRank || "-"}
                    </Text>
                    <Text style={styles.performanceLabel}>رتبه</Text>
                  </View>
                </View>
              </View>
            )}
          </>
        ) : terms.length > 0 ? (
          <View style={styles.emptyGrades}>
            <Ionicons
              name="document-text-outline"
              size={60}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyGradesTitle}>
              هنوز نمره‌ای ثبت نشده است
            </Text>
            <Text style={styles.emptyGradesText}>
              پس از ثبت نمرات توسط معلم، کارنامه شما در این بخش نمایش داده خواهد
              شد.
            </Text>
          </View>
        ) : null}

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>راهنمای درجه‌بندی:</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#22c55e" }]} />
            <Text style={styles.legendText}>الف (۹۰-۱۰۰%) - عالی</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#3b82f6" }]} />
            <Text style={styles.legendText}>ب (۸۰-۸۹%) - خیلی خوب</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#8b5cf6" }]} />
            <Text style={styles.legendText}>ج (۷۰-۷۹%) - خوب</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} />
            <Text style={styles.legendText}>د (۶۰-۶۹%) - قابل قبول</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#dc2626" }]} />
            <Text style={styles.legendText}>ه (۰-۵۹%) - نیاز به تلاش</Text>
          </View>
          <View style={styles.legendNote}>
            <Text style={styles.legendNoteText}>
              * نمره نهایی = نمره ۴.۵ ماهه (۴۰ نمره) + نمره سالانه (۶۰ نمره) =
              ۱۰۰ نمره
            </Text>
            <Text style={styles.legendNoteText}>
              * نمره قبولی: ۶۰% یا بالاتر
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ===================== STYLES =====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    flex: 1,
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
  exportButton: {
    padding: 6,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 20,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyGrades: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 20,
  },
  emptyGradesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyGradesText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  termSelector: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  termSelectorContent: {
    gap: 8,
  },
  termChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    position: "relative",
  },
  termChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  currentTerm: {
    borderColor: "#f59e0b",
  },
  termChipText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  termChipTextActive: {
    color: "#fff",
  },
  currentBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },
  reportCardHeader: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  reportCardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
  },
  reportCardSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  reportCardDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  overallStats: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  overallStatCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  overallAverage: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 4,
  },
  classRank: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  passFailContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "space-around",
  },
  passFailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  passFailDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  passFailLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  passFailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#3b82f6",
    fontWeight: "500",
  },
  tableContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    padding: 16,
    paddingBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#e2e8f0",
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  subjectCol: {
    flex: 2,
    textAlign: "left",
  },
  examCol: {
    flex: 1.5,
    textAlign: "center",
  },
  totalCol: {
    flex: 1.5,
    textAlign: "center",
  },
  gradeCol: {
    flex: 0.8,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    alignItems: "center",
  },
  tableCell: {
    fontSize: 13,
    color: Colors.text,
  },
  tableCellWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  subjectNameCell: {
    fontWeight: "500",
    color: Colors.text,
  },
  examScore: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text,
  },
  examGrade: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 2,
  },
  totalScore: {
    fontSize: 14,
    fontWeight: "bold",
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "center",
  },
  gradeBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyTable: {
    padding: 20,
    alignItems: "center",
  },
  emptyTableText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  overallRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#f8fafc",
    borderTopWidth: 2,
    borderTopColor: "#e2e8f0",
  },
  overallLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
  },
  overallBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  overallBadgeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  detailsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  examDetailsCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
    overflow: "hidden",
  },
  examDetailsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  examDetailsContent: {
    padding: 12,
  },
  examDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  examDetailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  examDetailValue: {
    fontSize: 12,
    color: Colors.text,
    textAlign: "right",
  },
  noExamData: {
    padding: 16,
    alignItems: "center",
  },
  noExamDataText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  finalGradeContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
    overflow: "hidden",
  },
  finalGradeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  calculationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  calculationTotal: {
    backgroundColor: "#f8fafc",
    borderBottomWidth: 0,
  },
  calculationLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  calculationValue: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text,
  },
  calculationTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  calculationLetter: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.textSecondary,
  },
  progressContainer: {
    padding: 12,
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text,
  },
  performanceContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  performanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  performanceItem: {
    flex: 1,
    minWidth: "22%",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginVertical: 4,
  },
  performanceLabel: {
    fontSize: 9,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  legendContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text,
  },
  legendNote: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  legendNoteText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: "italic",
    marginBottom: 2,
  },
});
