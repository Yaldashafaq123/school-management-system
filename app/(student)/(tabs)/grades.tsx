// app/(student)/(tabs)/grades.tsx
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  getDisplayGrade,
  getGradeColor,
  getStatusColor,
  getStatusText,
  studentGradesApi,
  SubjectGrade,
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

export default function GradesScreen() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [termGrades, setTermGrades] = useState<Record<number, TermGrades>>({});
  const [currentGrades, setCurrentGrades] = useState<TermGrades | null>(null);

  const loadGradesData = useCallback(async () => {
    try {
      const response = await studentGradesApi.getAllGrades();
      if (response.success && response.data) {
        setTerms(response.data.terms || []);
        setTermGrades(response.data.allTermsGrades || {});
        setCurrentGrades(response.data.currentTermGrades || null);

        // Set initial selected term
        if (response.data.terms?.length > 0) {
          setSelectedTerm(
            response.data.currentTermGrades?.term?.id ||
              response.data.terms[0].id,
          );
        }
      }
    } catch (error) {
      console.error("Error loading grades:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
          // Fix: Create a new object with proper typing
          setTermGrades((prev: Record<number, TermGrades>) => {
            const updated = { ...prev };
            updated[termId] = response.data as TermGrades;
            return updated;
          });
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

  // Calculate term statistics
  const calculateTermStats = (grades: SubjectGrade[]) => {
    if (!grades || grades.length === 0)
      return { passed: 0, failed: 0, conditional: 0 };

    const passed = grades.filter((g) => (g.average || 0) >= 10).length;
    const failed = grades.filter((g) => (g.average || 0) < 10).length;
    const conditional = grades.filter(
      (g) => (g.average || 0) >= 10 && (g.average || 0) < 12,
    ).length;

    return { passed, failed, conditional };
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
          <TouchableOpacity>
            <Ionicons name="download-outline" size={24} color={Colors.text} />
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
            {/* Overall Stats */}
            <View style={styles.overallStats}>
              <View style={styles.overallStatCard}>
                <View style={styles.statHeader}>
                  <Ionicons name="trophy" size={24} color={Colors.warning} />
                  <Text style={styles.statTitle}>میانگین کل</Text>
                </View>
                <Text style={styles.overallAverage}>
                  {currentTermGrades.overallAverage?.toFixed(2) || "0.00"}
                </Text>
                <Text style={styles.statSubtitle}>از ۲۰</Text>
              </View>

              <View style={styles.overallStatCard}>
                <View style={styles.statHeader}>
                  <Ionicons
                    name="trending-up"
                    size={24}
                    color={Colors.success}
                  />
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

            {/* Term Dates */}
            {currentTermGrades.term && (
              <View style={styles.termDates}>
                <Text style={styles.termDatesTitle}>دوره آموزشی</Text>
                <View style={styles.datesRow}>
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>شروع</Text>
                    <Text style={styles.dateValue}>
                      {currentTermGrades.term.startDate || "-"}
                    </Text>
                  </View>
                  <View style={styles.dateSeparator}>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color={Colors.textSecondary}
                    />
                  </View>
                  <View style={styles.dateItem}>
                    <Text style={styles.dateLabel}>پایان</Text>
                    <Text style={styles.dateValue}>
                      {currentTermGrades.term.endDate || "-"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Subjects List */}
            <View style={styles.subjectsContainer}>
              <Text style={styles.sectionTitle}>نمرات دروس</Text>

              {currentTermGrades.subjects &&
              currentTermGrades.subjects.length > 0 ? (
                currentTermGrades.subjects.map((subject: SubjectGrade) => (
                  <View key={subject.id} style={styles.subjectCard}>
                    <TouchableOpacity
                      style={styles.subjectHeader}
                      onPress={() =>
                        setShowDetails(
                          showDetails === subject.id ? null : subject.id,
                        )
                      }
                    >
                      <View style={styles.subjectInfo}>
                        <Text style={styles.subjectName}>
                          {subject.subject}
                        </Text>
                        <Text style={styles.subjectTeacher}>
                          {subject.teacher || ""}
                        </Text>
                      </View>

                      <View style={styles.subjectSummary}>
                        <View style={styles.gradeContainer}>
                          <Text
                            style={[
                              styles.gradeValue,
                              { color: getGradeColor(subject.average) },
                            ]}
                          >
                            {subject.average?.toFixed(1) || "0.0"}
                          </Text>
                          <Text style={styles.gradeLabel}>میانگین</Text>
                        </View>

                        <View style={styles.rankContainer}>
                          <Ionicons
                            name="stats-chart"
                            size={16}
                            color={Colors.textSecondary}
                          />
                          <Text style={styles.rankValue}>
                            {subject.rank || "-"}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: `${getStatusColor(subject.status)}20`,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: getStatusColor(subject.status) },
                            ]}
                          >
                            {getStatusText(subject.status)}
                          </Text>
                        </View>

                        <Ionicons
                          name={
                            showDetails === subject.id
                              ? "chevron-up"
                              : "chevron-down"
                          }
                          size={20}
                          color={Colors.textSecondary}
                        />
                      </View>
                    </TouchableOpacity>

                    {showDetails === subject.id && (
                      <View style={styles.detailsContainer}>
                        <View style={styles.gradesGrid}>
                          <View style={styles.gradeItem}>
                            <Text style={styles.gradeItemLabel}>
                              ماهانه (۲۰ نمره)
                            </Text>
                            <Text
                              style={[
                                styles.gradeItemValue,
                                {
                                  color: getGradeColor(
                                    (subject.monthly ?? 0) / 2,
                                  ),
                                },
                              ]}
                            >
                              {getDisplayGrade(subject.monthly)}
                            </Text>
                          </View>
                          <View style={styles.gradeItem}>
                            <Text style={styles.gradeItemLabel}>
                              نیم‌سال (۴۰ نمره)
                            </Text>
                            <Text
                              style={[
                                styles.gradeItemValue,
                                {
                                  color: getGradeColor(
                                    (subject.halfYearly ?? 0) / 4,
                                  ),
                                },
                              ]}
                            >
                              {getDisplayGrade(subject.halfYearly)}
                            </Text>
                          </View>
                          <View style={styles.gradeItem}>
                            <Text style={styles.gradeItemLabel}>
                              پایانی (۶۰ نمره)
                            </Text>
                            <Text
                              style={[
                                styles.gradeItemValue,
                                {
                                  color: getGradeColor(
                                    (subject.final ?? 0) / 6,
                                  ),
                                },
                              ]}
                            >
                              {getDisplayGrade(subject.final)}
                            </Text>
                          </View>
                          <View
                            style={[styles.gradeItem, styles.totalGradeItem]}
                          >
                            <Text style={styles.gradeItemLabel}>
                              مجموع (۱۰۰)
                            </Text>
                            <Text
                              style={[
                                styles.gradeItemValue,
                                {
                                  color: getGradeColor(
                                    (subject.total || 0) / 5,
                                  ),
                                },
                              ]}
                            >
                              {subject.total || "۰"}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.progressContainer}>
                          <Text style={styles.progressLabel}>پیشرفت:</Text>
                          <View style={styles.progressBar}>
                            <View
                              style={[
                                styles.progressFill,
                                {
                                  width: `${subject.total || 0}%`,
                                  backgroundColor: getGradeColor(
                                    subject.average,
                                  ),
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.progressValue}>
                            {subject.total || 0} از ۱۰۰
                          </Text>
                        </View>

                        <View style={styles.weightInfo}>
                          <Text style={styles.weightInfoText}>
                            <Ionicons
                              name="information-circle"
                              size={14}
                              color={Colors.primary}
                            />
                            ماهانه: ۲۰٪ | نیم‌سال: ۴۰٪ | پایانی: ۶۰٪
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <View style={styles.emptySubjects}>
                  <Ionicons
                    name="document-text-outline"
                    size={40}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.emptySubjectsText}>
                    هنوز نمره‌ای ثبت نشده است
                  </Text>
                </View>
              )}
            </View>

            {/* Performance Summary */}
            {currentTermGrades.subjects && (
              <View style={styles.performanceContainer}>
                <Text style={styles.sectionTitle}>خلاصه عملکرد</Text>
                <View style={styles.performanceGrid}>
                  <View style={styles.performanceItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.success}
                    />
                    <Text style={styles.performanceValue}>
                      {calculateTermStats(currentTermGrades.subjects).passed ||
                        0}
                    </Text>
                    <Text style={styles.performanceLabel}>دروس قبول</Text>
                  </View>
                  <View style={styles.performanceItem}>
                    <Ionicons
                      name="alert-circle"
                      size={20}
                      color={Colors.warning}
                    />
                    <Text style={styles.performanceValue}>
                      {calculateTermStats(currentTermGrades.subjects)
                        .conditional || 0}
                    </Text>
                    <Text style={styles.performanceLabel}>مشروط</Text>
                  </View>
                  <View style={styles.performanceItem}>
                    <Ionicons name="time" size={20} color={Colors.info} />
                    <Text style={styles.performanceValue}>
                      {currentTermGrades.attendanceRate || 0}%
                    </Text>
                    <Text style={styles.performanceLabel}>حضور</Text>
                  </View>
                  <View style={styles.performanceItem}>
                    <Ionicons
                      name="trending-up"
                      size={20}
                      color={Colors.primary}
                    />
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
          <Text style={styles.legendTitle}>راهنمای رنگ‌ها:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: Colors.success }]}
              />
              <Text style={styles.legendText}>۱۷ تا ۲۰ (عالی)</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: Colors.warning }]}
              />
              <Text style={styles.legendText}>۱۴ تا ۱۷ (متوسط)</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: Colors.danger }]}
              />
              <Text style={styles.legendText}>زیر ۱۴ (نیاز به تلاش)</Text>
            </View>
          </View>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
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
  emptySubjects: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  emptySubjectsText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    position: "relative",
  },
  termChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  currentTerm: {
    borderColor: Colors.warning,
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
    backgroundColor: Colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },
  overallStats: {
    flexDirection: "row",
    margin: 16,
    gap: 12,
  },
  overallStatCard: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
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
  termDates: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  termDatesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  datesRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateItem: {
    flex: 1,
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  dateSeparator: {
    paddingHorizontal: 12,
  },
  subjectsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  subjectCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  subjectTeacher: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  subjectSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  gradeContainer: {
    alignItems: "center",
  },
  gradeValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  gradeLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  rankContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rankValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  detailsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  gradesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  gradeItem: {
    width: "48%",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  totalGradeItem: {
    width: "48%",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    borderColor: Colors.primary,
  },
  gradeItemLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 6,
    textAlign: "center",
  },
  gradeItemValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  progressContainer: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressValue: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "500",
    textAlign: "right",
  },
  weightInfo: {
    padding: 8,
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    borderRadius: 6,
  },
  weightInfoText: {
    fontSize: 11,
    color: Colors.primary,
    textAlign: "center",
  },
  performanceContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  performanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  performanceItem: {
    width: "22%",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginVertical: 6,
  },
  performanceLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  legendContainer: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  legendItems: {
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
});
