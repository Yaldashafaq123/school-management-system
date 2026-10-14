import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Header } from "../../../../components/Header";
import { Colors } from "../../../../constants/Colors";
import { apiRequest } from "../../../../src/config/api";

const { width } = Dimensions.get("window");

interface MonthlyReport {
  classInfo: {
    id: number;
    name: string;
    section: string;
    academicYear: string;
    teacherName: string;
    isSupervisor: boolean;
    role: string;
  };
  reportPeriod: {
    gregorianMonth: number;
    gregorianYear: number;
    persianMonth: string;
    startDate: string;
    endDate: string;
    workingDays: number;
  };
  summary: {
    totalStudents: number;
    classAverage: number;
    classAttendanceRate: number;
    totalExams: number;
    totalAssignments: number;
    totalSubjects: number;
  };
  attendanceStats: {
    totalRecords: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
  students: any[];
  exams: any[];
  assignments: any[];
  subjects: any[];
  topPerformers: any[];
  needsAttention: any[];
  generatedAt: string;
}

export default function ClassMonthlyReportScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear] = useState(new Date().getFullYear()); // ✅ No setter = no unused var
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "attendance" | "grades"
  >("overview");

  // ✅ Wrap fetchReport in useCallback so it can be a stable dependency
  const fetchReport = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await apiRequest(
        `/teacher/classes/${id}/monthly-report?month=${selectedMonth}&year=${selectedYear}`,
      );

      if (data.success) {
        setReport(data.data);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      Alert.alert("خطا", "خطا در دریافت گزارش");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, selectedMonth, selectedYear]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReport();
  }, [fetchReport]); // ✅ fetchReport is now the only dependency

  const onRefresh = () => {
    setRefreshing(true);
    fetchReport();
  };

  const persianMonths = [
    { value: 1, label: "حمل" },
    { value: 2, label: "ثور" },
    { value: 3, label: "جوزا" },
    { value: 4, label: "سرطان" },
    { value: 5, label: "اسد" },
    { value: 6, label: "سنبله" },
    { value: 7, label: "میزان" },
    { value: 8, label: "عقرب" },
    { value: 9, label: "قوس" },
    { value: 10, label: "جدی" },
    { value: 11, label: "دلو" },
    { value: 12, label: "حوت" },
  ];

  const getGradeColor = (average: number) => {
    if (average >= 80) return Colors.success;
    if (average >= 60) return Colors.info;
    if (average >= 50) return Colors.warning;
    return Colors.danger;
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return Colors.success;
    if (rate >= 75) return Colors.info;
    if (rate >= 60) return Colors.warning;
    return Colors.danger;
  };

  if (loading && !report) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="گزارش ماهانه صنف" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری گزارش...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="گزارش ماهانه صنف"
        rightComponent={
          <TouchableOpacity onPress={fetchReport}>
            <Ionicons name="refresh" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Month Selector */}
        <View style={styles.selectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {persianMonths.map((month) => (
              <TouchableOpacity
                key={month.value}
                style={[
                  styles.monthButton,
                  selectedMonth === month.value && styles.monthButtonActive,
                ]}
                onPress={() => setSelectedMonth(month.value)}
              >
                <Text
                  style={[
                    styles.monthText,
                    selectedMonth === month.value && styles.monthTextActive,
                  ]}
                >
                  {month.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Class Info Header */}
        {report && (
          <View style={styles.classHeader}>
            <View style={styles.classInfo}>
              <Text style={styles.className}>{report.classInfo.name}</Text>
              {report.classInfo.section && (
                <Text style={styles.classSection}>
                  شعبه: {report.classInfo.section}
                </Text>
              )}
              <View style={styles.roleBadge}>
                <Ionicons
                  name={
                    report.classInfo.isSupervisor
                      ? "shield-checkmark"
                      : "school"
                  }
                  size={14}
                  color={
                    report.classInfo.isSupervisor ? Colors.primary : Colors.info
                  }
                />
                <Text
                  style={[
                    styles.roleText,
                    {
                      color: report.classInfo.isSupervisor
                        ? Colors.primary
                        : Colors.info,
                    },
                  ]}
                >
                  {report.classInfo.role}
                </Text>
              </View>
            </View>
            <View style={styles.periodInfo}>
              <Text style={styles.periodText}>
                {report.reportPeriod.persianMonth}{" "}
                {report.reportPeriod.gregorianYear}
              </Text>
              <Text style={styles.workingDays}>
                {report.reportPeriod.workingDays} روز کاری
              </Text>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {(
            [
              { key: "overview", icon: "stats-chart", label: "خلاصه" },
              { key: "students", icon: "people", label: "دانش‌آموزان" },
              { key: "attendance", icon: "calendar", label: "حضور" },
              { key: "grades", icon: "star", label: "نمرات" },
            ] as const
          ).map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={
                  activeTab === tab.key ? Colors.primary : Colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Tab */}
        {activeTab === "overview" && report && (
          <View style={styles.tabContent}>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Ionicons name="people" size={24} color={Colors.primary} />
                <Text style={styles.summaryValue}>
                  {report.summary.totalStudents}
                </Text>
                <Text style={styles.summaryLabel}>دانش‌آموز</Text>
              </View>
              <View style={styles.summaryCard}>
                <Ionicons
                  name="star"
                  size={24}
                  color={getGradeColor(report.summary.classAverage)}
                />
                <Text
                  style={[
                    styles.summaryValue,
                    { color: getGradeColor(report.summary.classAverage) },
                  ]}
                >
                  {report.summary.classAverage}
                </Text>
                <Text style={styles.summaryLabel}>میانگین نمرات</Text>
              </View>
              <View style={styles.summaryCard}>
                <Ionicons
                  name="calendar"
                  size={24}
                  color={getAttendanceColor(report.summary.classAttendanceRate)}
                />
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      color: getAttendanceColor(
                        report.summary.classAttendanceRate,
                      ),
                    },
                  ]}
                >
                  {report.summary.classAttendanceRate}%
                </Text>
                <Text style={styles.summaryLabel}>حضور</Text>
              </View>
              <View style={styles.summaryCard}>
                <Ionicons name="document-text" size={24} color={Colors.info} />
                <Text style={styles.summaryValue}>
                  {report.summary.totalAssignments}
                </Text>
                <Text style={styles.summaryLabel}>کارخانگی</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>خلاصه حضور و غیاب</Text>
              <View style={styles.attendanceGrid}>
                <View
                  style={[
                    styles.attendanceItem,
                    { backgroundColor: Colors.success + "20" },
                  ]}
                >
                  <Text
                    style={[styles.attendanceValue, { color: Colors.success }]}
                  >
                    {report.attendanceStats.present}
                  </Text>
                  <Text style={styles.attendanceLabel}>حاضر</Text>
                </View>
                <View
                  style={[
                    styles.attendanceItem,
                    { backgroundColor: Colors.danger + "20" },
                  ]}
                >
                  <Text
                    style={[styles.attendanceValue, { color: Colors.danger }]}
                  >
                    {report.attendanceStats.absent}
                  </Text>
                  <Text style={styles.attendanceLabel}>غایب</Text>
                </View>
                <View
                  style={[
                    styles.attendanceItem,
                    { backgroundColor: Colors.warning + "20" },
                  ]}
                >
                  <Text
                    style={[styles.attendanceValue, { color: Colors.warning }]}
                  >
                    {report.attendanceStats.late}
                  </Text>
                  <Text style={styles.attendanceLabel}>تاخیر</Text>
                </View>
                <View
                  style={[
                    styles.attendanceItem,
                    { backgroundColor: Colors.info + "20" },
                  ]}
                >
                  <Text
                    style={[styles.attendanceValue, { color: Colors.info }]}
                  >
                    {report.attendanceStats.excused}
                  </Text>
                  <Text style={styles.attendanceLabel}>موجه</Text>
                </View>
              </View>
            </View>

            {report.topPerformers?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏆 بهترین دانش‌آموزان</Text>
                {report.topPerformers.map((student, index) => (
                  <View key={student.id} style={styles.performerCard}>
                    <View
                      style={[
                        styles.rankBadge,
                        {
                          backgroundColor:
                            index === 0
                              ? "#FFD700"
                              : index === 1
                                ? "#C0C0C0"
                                : "#CD7F32",
                        },
                      ]}
                    >
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </View>
                    <View style={styles.performerInfo}>
                      <Text style={styles.performerName}>
                        {student.fullName}
                      </Text>
                      <Text style={styles.performerStats}>
                        میانگین: {student.grades.average} | حضور:{" "}
                        {student.attendance.rate}%
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.gradeBadge,
                        {
                          backgroundColor:
                            getGradeColor(student.grades.average) + "20",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.gradeText,
                          { color: getGradeColor(student.grades.average) },
                        ]}
                      >
                        {student.grades.letter}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {report.needsAttention?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚠️ نیاز به توجه</Text>
                {report.needsAttention.map((student) => (
                  <View key={student.id} style={styles.attentionCard}>
                    <View style={styles.attentionInfo}>
                      <Text style={styles.attentionName}>
                        {student.fullName}
                      </Text>
                      <View style={styles.attentionStats}>
                        {student.grades.average < 50 && (
                          <Text style={styles.attentionReason}>
                            میانگین پایین: {student.grades.average}
                          </Text>
                        )}
                        {student.attendance.rate < 70 && (
                          <Text style={styles.attentionReason}>
                            حضور پایین: {student.attendance.rate}%
                          </Text>
                        )}
                      </View>
                    </View>
                    <Ionicons
                      name="alert-circle"
                      size={24}
                      color={Colors.danger}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Students Tab */}
        {activeTab === "students" && report && (
          <View style={styles.tabContent}>
            {report.students.map((student) => (
              <View key={student.id} style={styles.studentCard}>
                <View style={styles.studentHeader}>
                  <View style={styles.studentRank}>
                    <Text style={styles.studentRankText}>#{student.rank}</Text>
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.fullName}</Text>
                    <Text style={styles.studentEmail}>{student.email}</Text>
                  </View>
                  <View
                    style={[
                      styles.gradeBadge,
                      {
                        backgroundColor:
                          getGradeColor(student.grades.average) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.gradeText,
                        { color: getGradeColor(student.grades.average) },
                      ]}
                    >
                      {student.grades.letter}
                    </Text>
                  </View>
                </View>
                <View style={styles.studentStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>
                      {student.grades.average}
                    </Text>
                    <Text style={styles.statItemLabel}>میانگین</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text
                      style={[
                        styles.statItemValue,
                        { color: getAttendanceColor(student.attendance.rate) },
                      ]}
                    >
                      {student.attendance.rate}%
                    </Text>
                    <Text style={styles.statItemLabel}>حضور</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statItemValue}>
                      {student.assignments.total}
                    </Text>
                    <Text style={styles.statItemLabel}>کارخانگی</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && report && (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>آمار حضور</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${report.summary.classAttendanceRate}%`,
                        backgroundColor: getAttendanceColor(
                          report.summary.classAttendanceRate,
                        ),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {report.summary.classAttendanceRate}% حضور کلی
                </Text>
              </View>
            </View>

            {report.students.map((student) => (
              <View key={student.id} style={styles.attendanceRow}>
                <View style={styles.attendanceStudentInfo}>
                  <Text style={styles.attendanceStudentName}>
                    {student.fullName}
                  </Text>
                  <Text style={styles.attendanceStudentStats}>
                    حاضر: {student.attendance.present} | غایب:{" "}
                    {student.attendance.absent} | تاخیر:{" "}
                    {student.attendance.late}
                  </Text>
                </View>
                <View
                  style={[
                    styles.attendanceRateBadge,
                    {
                      backgroundColor:
                        getAttendanceColor(student.attendance.rate) + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.attendanceRateText,
                      { color: getAttendanceColor(student.attendance.rate) },
                    ]}
                  >
                    {student.attendance.rate}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Grades Tab */}
        {activeTab === "grades" && report && (
          <View style={styles.tabContent}>
            {report.exams?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>امتحانات این ماه</Text>
                {report.exams.map((exam) => (
                  <View key={exam.id} style={styles.examCard}>
                    <View style={styles.examHeader}>
                      <Text style={styles.examName}>{exam.name}</Text>
                      <View
                        style={[
                          styles.examTypeBadge,
                          { backgroundColor: Colors.primary + "20" },
                        ]}
                      >
                        <Text style={styles.examTypeText}>{exam.type}</Text>
                      </View>
                    </View>
                    <Text style={styles.examSubject}>{exam.subject}</Text>
                    <View style={styles.examStats}>
                      <Text style={styles.examStat}>
                        نمره از: {exam.maxScore}
                      </Text>
                      <Text style={styles.examStat}>
                        تصحیح شده: {exam.gradedCount}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>نمرات دانش‌آموزان</Text>
              {report.students.map((student) => (
                <View key={student.id} style={styles.gradeRow}>
                  <View style={styles.gradeStudentInfo}>
                    <Text style={styles.gradeStudentName}>
                      {student.fullName}
                    </Text>
                    <Text style={styles.gradeStudentStats}>
                      {student.grades.count} نمره ثبت شده
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.gradeAverageBadge,
                      {
                        backgroundColor:
                          getGradeColor(student.grades.average) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.gradeAverageText,
                        { color: getGradeColor(student.grades.average) },
                      ]}
                    >
                      {student.grades.average}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.textSecondary },
  content: { flex: 1, padding: 16 },
  selectorContainer: { marginBottom: 16 },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  monthButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  monthText: { fontSize: 14, color: Colors.text },
  monthTextActive: { color: "#FFF", fontWeight: "600" },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  classInfo: { flex: 1 },
  className: { fontSize: 18, fontWeight: "bold", color: Colors.text },
  classSection: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  roleText: { fontSize: 12, fontWeight: "600" },
  periodInfo: { alignItems: "flex-end" },
  periodText: { fontSize: 16, fontWeight: "bold", color: Colors.primary },
  workingDays: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  tabActive: { backgroundColor: Colors.primary + "15" },
  tabText: { fontSize: 12, color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: "600" },
  tabContent: { gap: 16 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  summaryCard: {
    width: (width - 56) / 2,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 8,
  },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  section: { marginTop: 8 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  attendanceGrid: { flexDirection: "row", gap: 8 },
  attendanceItem: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  attendanceValue: { fontSize: 18, fontWeight: "bold" },
  attendanceLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
  performerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: { fontSize: 14, fontWeight: "bold", color: "#FFF" },
  performerInfo: { flex: 1, marginLeft: 12 },
  performerName: { fontSize: 14, fontWeight: "600", color: Colors.text },
  performerStats: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  gradeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  gradeText: { fontSize: 14, fontWeight: "bold" },
  attentionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.danger + "10",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.danger + "30",
  },
  attentionInfo: { flex: 1 },
  attentionName: { fontSize: 14, fontWeight: "600", color: Colors.text },
  attentionStats: { marginTop: 4 },
  attentionReason: { fontSize: 12, color: Colors.danger },
  studentCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  studentRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  studentRankText: { fontSize: 14, fontWeight: "bold", color: Colors.primary },
  studentInfo: { flex: 1, marginLeft: 12 },
  studentName: { fontSize: 16, fontWeight: "600", color: Colors.text },
  studentEmail: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  studentStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: { alignItems: "center" },
  statItemValue: { fontSize: 16, fontWeight: "bold", color: Colors.text },
  statItemLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
  progressContainer: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 4 },
  progressText: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 8,
    textAlign: "center",
  },
  attendanceRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attendanceStudentInfo: { flex: 1 },
  attendanceStudentName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  attendanceStudentStats: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  attendanceRateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  attendanceRateText: { fontSize: 14, fontWeight: "bold" },
  examCard: {
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  examHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  examName: { fontSize: 14, fontWeight: "600", color: Colors.text },
  examTypeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  examTypeText: { fontSize: 11, color: Colors.primary, fontWeight: "600" },
  examSubject: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  examStats: { flexDirection: "row", gap: 16, marginTop: 8 },
  examStat: { fontSize: 12, color: Colors.textSecondary },
  gradeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gradeStudentInfo: { flex: 1 },
  gradeStudentName: { fontSize: 14, fontWeight: "600", color: Colors.text },
  gradeStudentStats: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  gradeAverageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  gradeAverageText: { fontSize: 16, fontWeight: "bold" },
});
