// app/(student)/(tabs)/grades.tsx
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
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

// ===================== TYPES =====================

interface ExamGrade {
  id: number;
  examId: number;
  studentId: number;
  subject: string;
  marks: number; // Raw score
  percentage?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

interface Exam {
  id: number;
  name: string;
  type: "MONTHLY" | "HALF_YEARLY" | "FINAL";
  subjectId: number;
  subjectName: string;
  classId: number;
  className?: string;
  maxScore: number;
  date: string;
  isPublished: boolean;
  month?: number;
  year?: number;
  teacherName?: string;
  grades?: ExamGrade[];
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

interface SubjectGrade {
  subjectId: number;
  subjectName: string;
  teacherName?: string;

  // Progress tracking (self-awareness only)
  monthlyExams: ExamGrade[];
  monthlyAverage: number;
  weeklyAssessments: WeeklyAssessmentResult[];
  weeklyAverage: number;

  // REAL EXAM GRADES (these count toward final)
  halfYearlyExam?: ExamGrade; // 40 points
  halfYearlyExamDetails?: Exam;
  halfYearlyGradeLetter?: string; // الف, ب, ج, د, ه

  finalExam?: ExamGrade; // 60 points
  finalExamDetails?: Exam;
  finalGradeLetter?: string; // الف, ب, ج, د, ه

  // Total combined score (40 + 60 = 100)
  totalScore: number; // Out of 100
  totalGradeLetter: string; // الف, ب, ج, د, ه
  status: "PASSED" | "FAILED";

  rank?: number;
  totalStudents?: number;
}

interface Term {
  id: number;
  name: string;
  isCurrent?: boolean;
  startDate?: string;
  endDate?: string;
  academicYear?: string;
}

interface TermGrades {
  term: Term;
  subjects: SubjectGrade[];
  overallAverage: number; // Out of 100
  classRank?: string;
  totalStudents?: number;
  attendanceRate?: number;
  passedCount?: number;
  failedCount?: number;
}

// ===================== GRADING HELPERS =====================

/**
 * Convert score to Afghan grade letter
 * الف = Excellent (90-100)
 * ب = Very Good (80-89)
 * ج = Good (70-79)
 * د = Pass (60-69)
 * ه = Fail (0-59)
 */
function getGradeLetter(score: number, maxScore: number): string {
  const percentage = (score / maxScore) * 100;

  if (percentage >= 90) return "الف";
  if (percentage >= 80) return "ب";
  if (percentage >= 70) return "ج";
  if (percentage >= 60) return "د";
  return "ه";
}

/**
 * Get grade letter with color
 */
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

function getGradeColor(score: number, maxScore: number): string {
  return getGradeInfo(score, maxScore).color;
}

function getGradeLabel(score: number, maxScore: number): string {
  return getGradeInfo(score, maxScore).label;
}

function formatScore(value: number, max: number): string {
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

/**
 * Check if student passed
 * Pass: >= 60% overall
 */
function isPassed(totalScore: number): boolean {
  return totalScore >= 60;
}

// ===================== API HELPERS =====================

const fetchStudentGrades = async (studentId: number, termId?: number) => {
  try {
    const examsResponse = await fetch(
      `/api/student/${studentId}/exams${termId ? `?termId=${termId}` : ""}`,
    );
    const examsData = await examsResponse.json();

    const assessmentsResponse = await fetch(
      `/api/student/${studentId}/weekly-assessments${termId ? `?termId=${termId}` : ""}`,
    );
    const assessmentsData = await assessmentsResponse.json();

    const yearResponse = await fetch(`/api/student/${studentId}/academic-year`);
    const yearData = await yearResponse.json();

    return {
      success: true,
      data: {
        exams: examsData.data || [],
        assessments: assessmentsData.data || [],
        academicYear: yearData.data || null,
      },
    };
  } catch (error) {
    console.error("Error fetching grades:", error);
    return { success: false, data: null };
  }
};

// ===================== MAIN COMPONENT =====================

export default function GradesScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [termGrades, setTermGrades] = useState<Record<number, TermGrades>>({});
  const [currentGrades, setCurrentGrades] = useState<TermGrades | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);

  const loadGradesData = useCallback(async () => {
    try {
      setLoading(true);

      const studentId = user?.studentId || user?.id;

      if (!studentId) {
        console.error("No student ID found");
        setLoading(false);
        return;
      }

      const response = await fetchStudentGrades(studentId);

      if (response.success && response.data) {
        const { exams, assessments, academicYear } = response.data;
        const groupedData = processGradesData(exams, assessments, academicYear);

        setTerms(groupedData.terms);
        setTermGrades(groupedData.termGrades);
        setCurrentGrades(groupedData.currentTermGrades);

        if (groupedData.terms.length > 0) {
          setSelectedTerm(
            groupedData.currentTermGrades?.term?.id || groupedData.terms[0].id,
          );
        }
      }
    } catch (error) {
      console.error("Error loading grades:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadGradesData();
  }, [loadGradesData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGradesData();
  };

  const handleTermChange = async (termId: number) => {
    setSelectedTerm(termId);
  };

  const processGradesData = (
    exams: any[],
    assessments: any[],
    academicYear: any,
  ) => {
    const terms: Term[] = [];
    const termGradesMap: Record<number, TermGrades> = {};

    const subjectMap: Record<
      number,
      {
        subjectId: number;
        subjectName: string;
        teacherName?: string;
        monthlyExams: any[];
        halfYearlyExam: any | null;
        halfYearlyExamDetails: any | null;
        finalExam: any | null;
        finalExamDetails: any | null;
      }
    > = {};

    exams.forEach((exam) => {
      if (!subjectMap[exam.subjectId]) {
        subjectMap[exam.subjectId] = {
          subjectId: exam.subjectId,
          subjectName: exam.subject || `درس ${exam.subjectId}`,
          teacherName: exam.teacherName,
          monthlyExams: [],
          halfYearlyExam: null,
          halfYearlyExamDetails: null,
          finalExam: null,
          finalExamDetails: null,
        };
      }

      if (exam.type === "MONTHLY") {
        subjectMap[exam.subjectId].monthlyExams.push(exam);
      } else if (exam.type === "HALF_YEARLY") {
        subjectMap[exam.subjectId].halfYearlyExam = exam.grades?.[0] || null;
        subjectMap[exam.subjectId].halfYearlyExamDetails = exam;
      } else if (exam.type === "FINAL") {
        subjectMap[exam.subjectId].finalExam = exam.grades?.[0] || null;
        subjectMap[exam.subjectId].finalExamDetails = exam;
      }
    });

    const assessmentMap: Record<number, any[]> = {};
    assessments.forEach((assessment) => {
      if (!assessmentMap[assessment.subjectId]) {
        assessmentMap[assessment.subjectId] = [];
      }
      assessmentMap[assessment.subjectId].push(assessment);
    });

    const subjectGrades: SubjectGrade[] = [];
    let overallSum = 0;
    let overallCount = 0;
    let passedCount = 0;
    let failedCount = 0;

    Object.values(subjectMap).forEach((subject) => {
      const monthlyExams = subject.monthlyExams || [];
      const monthlyScores = monthlyExams.map((e) => e.marks || 0);
      const monthlyAverage =
        monthlyScores.length > 0
          ? monthlyScores.reduce((a, b) => a + b, 0) / monthlyScores.length
          : 0;

      const weeklyAssessments = assessmentMap[subject.subjectId] || [];
      const weeklyScores = weeklyAssessments.map((a) => a.marks || 0);
      const weeklyAverage =
        weeklyScores.length > 0
          ? weeklyScores.reduce((a, b) => a + b, 0) / weeklyScores.length
          : 0;

      const halfYearlyGrade = subject.halfYearlyExam;
      const finalGrade = subject.finalExam;

      const halfYearlyScore = halfYearlyGrade?.marks || 0;
      const finalScore = finalGrade?.marks || 0;

      // Total = Half-Yearly (40) + Final (60) = 100
      const totalScore = halfYearlyScore + finalScore;

      // Get grade letters
      const halfYearlyLetter = halfYearlyGrade
        ? getGradeLetter(halfYearlyScore, 40)
        : "-";
      const finalLetter = finalGrade ? getGradeLetter(finalScore, 60) : "-";
      const totalLetter = getGradeLetter(totalScore, 100);

      const passed = isPassed(totalScore);

      overallSum += totalScore;
      overallCount++;

      if (passed) {
        passedCount++;
      } else {
        failedCount++;
      }

      subjectGrades.push({
        subjectId: subject.subjectId,
        subjectName: subject.subjectName,
        teacherName: subject.teacherName,
        monthlyExams: monthlyExams.map((e) => ({
          id: e.id,
          examId: e.id,
          studentId: e.studentId,
          subject: e.subject,
          marks: e.marks,
          percentage: e.percentage,
          feedback: e.feedback,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        })),
        monthlyAverage: Math.round(monthlyAverage * 10) / 10,
        weeklyAssessments: weeklyAssessments.map((a) => ({
          id: a.id,
          marks: a.marks,
          percentage: a.percentage,
          feedback: a.feedback,
          createdAt: a.createdAt,
          assessmentTitle: a.title,
          weekNumber: a.weekNumber,
        })),
        weeklyAverage: Math.round(weeklyAverage * 10) / 10,
        halfYearlyExam: halfYearlyGrade
          ? {
              id: halfYearlyGrade.id,
              examId: subject.halfYearlyExamDetails?.id || 0,
              studentId: halfYearlyGrade.studentId,
              subject: halfYearlyGrade.subject,
              marks: halfYearlyGrade.marks,
              percentage: halfYearlyGrade.percentage,
              feedback: halfYearlyGrade.feedback,
              createdAt: halfYearlyGrade.createdAt,
              updatedAt: halfYearlyGrade.updatedAt,
            }
          : undefined,
        halfYearlyExamDetails: subject.halfYearlyExamDetails,
        halfYearlyGradeLetter: halfYearlyLetter,
        finalExam: finalGrade
          ? {
              id: finalGrade.id,
              examId: subject.finalExamDetails?.id || 0,
              studentId: finalGrade.studentId,
              subject: finalGrade.subject,
              marks: finalGrade.marks,
              percentage: finalGrade.percentage,
              feedback: finalGrade.feedback,
              createdAt: finalGrade.createdAt,
              updatedAt: finalGrade.updatedAt,
            }
          : undefined,
        finalExamDetails: subject.finalExamDetails,
        finalGradeLetter: finalLetter,
        totalScore: totalScore,
        totalGradeLetter: totalLetter,
        status: passed ? "PASSED" : "FAILED",
      });
    });

    // Sort by total score (highest first)
    subjectGrades.sort((a, b) => b.totalScore - a.totalScore);
    subjectGrades.forEach((subject, index) => {
      subject.rank = index + 1;
      subject.totalStudents = subjectGrades.length;
    });

    const overallAverage =
      overallCount > 0 ? Math.round(overallSum / overallCount) : 0;

    const term: Term = {
      id: academicYear?.id || 1,
      name: academicYear?.name || "سال تحصیلی ۱۴۰۴",
      isCurrent: academicYear?.isActive || true,
      startDate: academicYear?.startDate,
      endDate: academicYear?.endDate,
      academicYear: academicYear?.name,
    };

    const termGradesData: TermGrades = {
      term,
      subjects: subjectGrades,
      overallAverage,
      classRank: "۳",
      totalStudents: 30,
      attendanceRate: 92,
      passedCount,
      failedCount,
    };

    terms.push(term);
    termGradesMap[term.id] = termGradesData;

    return {
      terms,
      termGrades: termGradesMap,
      currentTermGrades: termGradesData,
    };
  };

  const currentTermGrades =
    selectedTerm && termGrades[selectedTerm]
      ? termGrades[selectedTerm]
      : currentGrades;

  const calculateTermStats = (grades: SubjectGrade[]) => {
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
                      color: getGradeColor(
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
                  <Text style={styles.statTitle}>رتبه کلاسی</Text>
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
                <Text style={styles.passFailValue}>
                  {currentTermGrades.passedCount || 0}
                </Text>
              </View>
              <View style={styles.passFailItem}>
                <View
                  style={[styles.passFailDot, { backgroundColor: "#dc2626" }]}
                />
                <Text style={styles.passFailLabel}>رد</Text>
                <Text style={styles.passFailValue}>
                  {currentTermGrades.failedCount || 0}
                </Text>
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
              {currentTermGrades.subjects &&
              currentTermGrades.subjects.length > 0 ? (
                currentTermGrades.subjects.map((subject: SubjectGrade) => (
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
                    <View style={[styles.tableCell, styles.examCol]}>
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
                                color: getGradeColor(
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
                    <View style={[styles.tableCell, styles.examCol]}>
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
                                color: getGradeColor(
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
                    <View style={[styles.tableCell, styles.totalCol]}>
                      <Text
                        style={[
                          styles.totalScore,
                          { color: getGradeColor(subject.totalScore, 100) },
                        ]}
                      >
                        {subject.totalScore}/۱۰۰
                      </Text>
                    </View>

                    {/* Grade */}
                    <View style={[styles.tableCell, styles.gradeCol]}>
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
              {currentTermGrades.subjects &&
                currentTermGrades.subjects.length > 0 && (
                  <View style={styles.overallRow}>
                    <Text style={styles.overallLabel}>نتیجه کلی:</Text>
                    <View style={styles.overallBadge}>
                      <Text style={styles.overallBadgeText}>
                        {currentTermGrades.passedCount ===
                        currentTermGrades.subjects.length
                          ? "✅ قبول"
                          : currentTermGrades.passedCount > 0
                            ? `⚠️ ${currentTermGrades.passedCount} قبول، ${currentTermGrades.failedCount} رد`
                            : "❌ رد"}
                      </Text>
                    </View>
                  </View>
                )}
            </View>

            {/* ===== DETAILED VIEW (When subject is expanded) ===== */}
            {currentTermGrades.subjects &&
              currentTermGrades.subjects.map(
                (subject) =>
                  showDetails === subject.subjectId && (
                    <View
                      key={`detail-${subject.subjectId}`}
                      style={styles.detailsContainer}
                    >
                      {/* 4.5 Month Exam Details */}
                      <View style={styles.examDetailsCard}>
                        <Text style={styles.examDetailsTitle}>
                          <Ionicons
                            name="book-outline"
                            size={16}
                            color="#3b82f6"
                          />{" "}
                          امتحان ۴.۵ ماهه (۴۰ نمره)
                        </Text>

                        {subject.halfYearlyExamDetails ? (
                          <View style={styles.examDetailsContent}>
                            <View style={styles.examDetailRow}>
                              <Text style={styles.examDetailLabel}>
                                نام درس
                              </Text>
                              <Text style={styles.examDetailValue}>
                                {subject.subjectName}
                              </Text>
                            </View>
                            <View style={styles.examDetailRow}>
                              <Text style={styles.examDetailLabel}>تاریخ</Text>
                              <Text style={styles.examDetailValue}>
                                {formatDate(subject.halfYearlyExamDetails.date)}
                              </Text>
                            </View>
                            <View style={styles.examDetailRow}>
                              <Text style={styles.examDetailLabel}>نمره</Text>
                              <Text
                                style={[
                                  styles.examDetailValue,
                                  {
                                    fontWeight: "bold",
                                    color: subject.halfYearlyExam
                                      ? getGradeColor(
                                          subject.halfYearlyExam.marks,
                                          40,
                                        )
                                      : "#6b7280",
                                  },
                                ]}
                              >
                                {subject.halfYearlyExam
                                  ? `${Math.round(subject.halfYearlyExam.marks)} / ۴۰`
                                  : "ثبت نشده"}
                              </Text>
                            </View>
                            <View style={styles.examDetailRow}>
                              <Text style={styles.examDetailLabel}>درجه</Text>
                              <Text
                                style={[
                                  styles.examDetailValue,
                                  {
                                    fontWeight: "bold",
                                    color: subject.halfYearlyExam
                                      ? getGradeColor(
                                          subject.halfYearlyExam.marks,
                                          40,
                                        )
                                      : "#6b7280",
                                  },
                                ]}
                              >
                                {subject.halfYearlyGradeLetter || "-"}
                              </Text>
                            </View>
                            {subject.halfYearlyExam?.feedback && (
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
                              هنوز نمره امتحان ۴.۵ ماهه ثبت نشده است
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

                        {subject.finalExamDetails ? (
                          <View style={styles.examDetailsContent}>
                            <View style={styles.examDetailRow}>
                              <Text style={styles.examDetailLabel}>
                                نام درس
                              </Text>
                              <Text style={styles.examDetailValue}>
                                {subject.subjectName}
                              </Text>
                            </View>
                            <View style={styles.examDetailRow}>
                              <Text style={styles.examDetailLabel}>تاریخ</Text>
                              <Text style={styles.examDetailValue}>
                                {formatDate(subject.finalExamDetails.date)}
                              </Text>
                            </View>
                            <View style={styles.examDetailRow}>
                              <Text style={styles.examDetailLabel}>نمره</Text>
                              <Text
                                style={[
                                  styles.examDetailValue,
                                  {
                                    fontWeight: "bold",
                                    color: subject.finalExam
                                      ? getGradeColor(
                                          subject.finalExam.marks,
                                          60,
                                        )
                                      : "#6b7280",
                                  },
                                ]}
                              >
                                {subject.finalExam
                                  ? `${Math.round(subject.finalExam.marks)} / ۶۰`
                                  : "ثبت نشده"}
                              </Text>
                            </View>
                            <View style={styles.examDetailRow}>
                              <Text style={styles.examDetailLabel}>درجه</Text>
                              <Text
                                style={[
                                  styles.examDetailValue,
                                  {
                                    fontWeight: "bold",
                                    color: subject.finalExam
                                      ? getGradeColor(
                                          subject.finalExam.marks,
                                          60,
                                        )
                                      : "#6b7280",
                                  },
                                ]}
                              >
                                {subject.finalGradeLetter || "-"}
                              </Text>
                            </View>
                            {subject.finalExam?.feedback && (
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
                              هنوز نمره امتحان سالانه ثبت نشده است
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
                          style={[
                            styles.calculationRow,
                            styles.calculationTotal,
                          ]}
                        >
                          <Text style={styles.calculationLabel}>
                            مجموع (۱۰۰ نمره)
                          </Text>
                          <Text
                            style={[
                              styles.calculationValue,
                              styles.calculationTotalValue,
                              { color: getGradeColor(subject.totalScore, 100) },
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
                                  width: `${subject.totalScore}%`,
                                  backgroundColor: getGradeColor(
                                    subject.totalScore,
                                    100,
                                  ),
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressLabel}>
                            {subject.status === "PASSED" ? "✅ قبول" : "❌ رد"}{" "}
                            - {getGradeLabel(subject.totalScore, 100)}
                          </Text>
                        </View>
                      </View>

                      {/* Progress Tracking (Monthly & Weekly) */}
                      {(subject.monthlyExams.length > 0 ||
                        subject.weeklyAssessments.length > 0) && (
                        <View style={styles.progressTrackingContainer}>
                          <Text style={styles.progressTrackingTitle}>
                            <Ionicons
                              name="trending-up-outline"
                              size={14}
                              color="#6b7280"
                            />{" "}
                            پیگیری پیشرفت (جهت آگاهی)
                          </Text>
                          <Text style={styles.progressTrackingNote}>
                            این نمرات فقط برای پیگیری پیشرفت شما هستند و در نمره
                            نهایی تأثیری ندارند.
                          </Text>

                          <View style={styles.progressTrackingGrid}>
                            {/* Monthly Exams */}
                            {subject.monthlyExams.length > 0 && (
                              <View style={styles.progressTrackingCard}>
                                <Text style={styles.progressTrackingCardTitle}>
                                  امتحانات ماهانه
                                </Text>
                                {subject.monthlyExams.map((exam, index) => (
                                  <View
                                    key={exam.id}
                                    style={styles.progressTrackingRow}
                                  >
                                    <Text style={styles.progressTrackingLabel}>
                                      ماه {index + 1}
                                    </Text>
                                    <Text
                                      style={[
                                        styles.progressTrackingValue,
                                        {
                                          color: getGradeColor(exam.marks, 20),
                                        },
                                      ]}
                                    >
                                      {formatScore(exam.marks, 20)}
                                    </Text>
                                  </View>
                                ))}
                                <View style={styles.progressTrackingAverage}>
                                  <Text style={styles.progressTrackingAvgLabel}>
                                    میانگین
                                  </Text>
                                  <Text style={styles.progressTrackingAvgValue}>
                                    {subject.monthlyAverage.toFixed(1)} / ۲۰
                                  </Text>
                                </View>
                              </View>
                            )}

                            {/* Weekly Assessments */}
                            {subject.weeklyAssessments.length > 0 && (
                              <View style={styles.progressTrackingCard}>
                                <Text style={styles.progressTrackingCardTitle}>
                                  ارزیابی هفتگی
                                </Text>
                                {subject.weeklyAssessments
                                  .slice(0, 4)
                                  .map((assessment) => (
                                    <View
                                      key={assessment.id}
                                      style={styles.progressTrackingRow}
                                    >
                                      <Text
                                        style={styles.progressTrackingLabel}
                                      >
                                        هفته {assessment.weekNumber || "?"}
                                      </Text>
                                      <Text
                                        style={[
                                          styles.progressTrackingValue,
                                          {
                                            color: getGradeColor(
                                              assessment.marks,
                                              100,
                                            ),
                                          },
                                        ]}
                                      >
                                        {formatScore(assessment.marks, 100)}
                                      </Text>
                                    </View>
                                  ))}
                                {subject.weeklyAssessments.length > 4 && (
                                  <Text style={styles.progressTrackingMore}>
                                    + {subject.weeklyAssessments.length - 4}{" "}
                                    مورد دیگر
                                  </Text>
                                )}
                                <View style={styles.progressTrackingAverage}>
                                  <Text style={styles.progressTrackingAvgLabel}>
                                    میانگین
                                  </Text>
                                  <Text style={styles.progressTrackingAvgValue}>
                                    {subject.weeklyAverage.toFixed(1)} / ۱۰۰
                                  </Text>
                                </View>
                              </View>
                            )}
                          </View>
                        </View>
                      )}
                    </View>
                  ),
              )}

            {/* Performance Summary */}
            {currentTermGrades.subjects && (
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
                      {calculateTermStats(currentTermGrades.subjects).passed ||
                        0}
                    </Text>
                    <Text style={styles.performanceLabel}>قبول</Text>
                  </View>
                  <View style={styles.performanceItem}>
                    <Ionicons name="close-circle" size={20} color="#dc2626" />
                    <Text style={styles.performanceValue}>
                      {calculateTermStats(currentTermGrades.subjects).failed ||
                        0}
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
  progressTrackingContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12,
    overflow: "hidden",
  },
  progressTrackingTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  progressTrackingNote: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: "italic",
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  progressTrackingGrid: {
    padding: 12,
    flexDirection: "row",
    gap: 12,
  },
  progressTrackingCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 10,
  },
  progressTrackingCardTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
  },
  progressTrackingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  progressTrackingLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  progressTrackingValue: {
    fontSize: 11,
    fontWeight: "500",
  },
  progressTrackingAverage: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 6,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  progressTrackingAvgLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  progressTrackingAvgValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.text,
  },
  progressTrackingMore: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 4,
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
