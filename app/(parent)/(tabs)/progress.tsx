// app/(parent)/progress/index.tsx
import { useAuth } from "@/contexts/AuthContext";
import { parentChildApi } from "@/src/config/parentChildApi";
import {
  ChildProgress as ChildProgressType,
  parentProgressApi,
  SubjectPerformance,
} from "@/src/config/parentProgressApi";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

interface Child {
  id: number;
  name: string;
  class: string;
}

export default function ChildProgress() {
  const router = useRouter();
  const { user: _user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [progressData, setProgressData] = useState<ChildProgressType | null>(
    null,
  );
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [showChildSelector, setShowChildSelector] = useState(false);

  // Load children list
  const loadChildren = useCallback(async () => {
    try {
      const response = await parentChildApi.getChildren();
      if (response.success && response.data) {
        setChildren(response.data.children);

        // Get stored active child or use first child
        const storedId = await parentChildApi.getStoredActiveChildId();
        if (storedId && response.data.children.some((c) => c.id === storedId)) {
          setSelectedChildId(storedId);
        } else if (response.data.children.length > 0) {
          setSelectedChildId(response.data.children[0].id);
          await parentChildApi.setActiveChild(response.data.children[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading children:", error);
    }
  }, []);

  const loadProgress = useCallback(async () => {
    if (!selectedChildId) {
      console.log("No child selected yet");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response =
        await parentProgressApi.getChildProgress(selectedChildId);
      console.log("Progress API response:", response);

      if (response.success && response.data) {
        setProgressData(response.data);
      } else {
        console.log("No progress data or API failed");
        setProgressData(null);
      }
    } catch (error) {
      console.error("Error loading progress:", error);
      setProgressData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  // Load progress when child ID changes
  useEffect(() => {
    if (selectedChildId) {
      loadProgress();
    }
  }, [selectedChildId, loadProgress]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProgress();
    setRefreshing(false);
  };

  const handleChildSelect = async (childId: number) => {
    setSelectedChildId(childId);
    await parentChildApi.setActiveChild(childId);
    setShowChildSelector(false);
  };

  const selectedChild = children.find((c) => c.id === selectedChildId);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </SafeAreaView>
    );
  }

  // Show child selector if no children
  if (children.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>هیچ فرزندی یافت نشد</Text>
          <Text style={styles.emptySubtitle}>
            لطفاً از طریق پروفایل خود فرزند خود را اضافه کنید
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>بازگشت</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // If no progress data but child exists
  if (!progressData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.childSelectorButton}
            onPress={() => setShowChildSelector(true)}
          >
            <Text style={styles.childSelectorText}>
              {selectedChild?.name || "انتخاب فرزند"} ▼
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyDataContainer}>
          <Text style={styles.emptyDataTitle}>اطلاعاتی موجود نیست</Text>
          <Text style={styles.emptyDataSubtitle}>
            هنوز نمره یا امتحانی برای این دانش‌آموز ثبت نشده است
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const subjects = progressData?.subjects || [];
  const overall = progressData?.overall;
  const chartData = progressData?.chartData;

  // Prepare chart configuration
  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1, index = 0) => {
      if (chartData?.colors && chartData.colors[index]) {
        return chartData.colors[index];
      }
      return `rgba(59, 130, 246, ${opacity})`;
    },
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  // Prepare progress chart data
  const progressChartData =
    chartData && chartData.data && chartData.data.length > 0
      ? {
          labels: chartData.labels,
          data: chartData.data,
        }
      : { labels: [], data: [] };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3b82f6"]}
          />
        }
      >
        {/* Header with Child Selector */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.childSelectorButton}
            onPress={() => setShowChildSelector(true)}
          >
            <Text style={styles.childSelectorText}>
              {progressData?.student?.name || "دانش‌آموز"} ▼
            </Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>
            {progressData?.student?.className || ""}
          </Text>
        </View>

        {/* Overall Stats Card */}
        {overall && (
          <View style={styles.overallCard}>
            <Text style={styles.overallTitle}>میانگین کلی</Text>
            <View style={styles.overallScoreContainer}>
              <Text style={styles.overallScore}>{overall.average}٪</Text>
              <View
                style={[
                  styles.letterGradeBadge,
                  {
                    backgroundColor:
                      overall.average >= 70
                        ? "#10b981"
                        : overall.average >= 50
                          ? "#f59e0b"
                          : "#ef4444",
                  },
                ]}
              >
                <Text style={styles.letterGradeText}>
                  {overall.letterGrade}
                </Text>
              </View>
            </View>
            <View style={styles.overallStats}>
              <View style={styles.overallStat}>
                <Text style={styles.overallStatValue}>
                  {overall.subjectsCount}
                </Text>
                <Text style={styles.overallStatLabel}>مضمون</Text>
              </View>
              <View style={styles.overallStat}>
                <Text style={styles.overallStatValue}>
                  {overall.examsCount}
                </Text>
                <Text style={styles.overallStatLabel}>امتحان</Text>
              </View>
              <View style={styles.overallStat}>
                <Text style={styles.overallStatValue}>
                  {overall.assignmentsAvg}٪
                </Text>
                <Text style={styles.overallStatLabel}>کارخانگی</Text>
              </View>
            </View>
          </View>
        )}

        {/* Progress Chart */}
        {subjects.length > 0 && progressChartData.data.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>پیشرفت کلی</Text>
            <View style={styles.chartContainer}>
              <ProgressChart
                data={progressChartData}
                width={screenWidth - 32}
                height={220}
                strokeWidth={16}
                radius={32}
                chartConfig={chartConfig}
                hideLegend={false}
              />
            </View>
          </View>
        )}

        {/* Subject Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>جزئیات مضامین</Text>
          {subjects.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                اطلاعاتی برای نمایش وجود ندارد
              </Text>
            </View>
          ) : (
            subjects.map((subject: SubjectPerformance, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.subjectCard}
                onPress={() =>
                  router.push(
                    `/(parent)/progress/subject/${subject.name}?childId=${selectedChildId}` as any,
                  )
                }
              >
                <View style={styles.subjectHeader}>
                  <View
                    style={[
                      styles.colorIndicator,
                      { backgroundColor: subject.color },
                    ]}
                  />
                  <Text style={styles.subjectName}>{subject.name}</Text>
                  <View
                    style={[
                      styles.gradeBadge,
                      { backgroundColor: subject.color },
                    ]}
                  >
                    <Text style={styles.gradeText}>{subject.grade}</Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${subject.score}%`,
                        backgroundColor: subject.color,
                      },
                    ]}
                  />
                </View>
                <View style={styles.scoreDetails}>
                  <Text style={styles.scoreText}>{subject.score}٪</Text>
                  <Text style={styles.examCountText}>
                    {subject.examsCount} امتحان
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Teacher Comments */}
        {progressData?.teacherComment && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>نظریات معلم</Text>
            <View style={styles.commentCard}>
              <Text style={styles.commentText}>
                {progressData.teacherComment}
              </Text>
              <Text style={styles.teacherName}>- معلم صنف</Text>
            </View>
          </View>
        )}

        {/* Recent Exam Results */}
        {progressData?.examBreakdown &&
          progressData.examBreakdown.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>نتایج اخیر</Text>
              {progressData.examBreakdown.slice(0, 5).map((exam, index) => (
                <View key={index} style={styles.examCard}>
                  <View style={styles.examHeader}>
                    <Text style={styles.examName}>{exam.examName}</Text>
                    <View
                      style={[
                        styles.examScoreBadge,
                        {
                          backgroundColor:
                            exam.percentage >= 70
                              ? "#10b98120"
                              : exam.percentage >= 50
                                ? "#f59e0b20"
                                : "#ef444420",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.examScoreText,
                          {
                            color:
                              exam.percentage >= 70
                                ? "#10b981"
                                : exam.percentage >= 50
                                  ? "#f59e0b"
                                  : "#ef4444",
                          },
                        ]}
                      >
                        {exam.score}/{exam.maxScore}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.examSubject}>{exam.subject}</Text>
                  <Text style={styles.examDate}>
                    {new Date(exam.date).toLocaleDateString("fa-IR")}
                  </Text>
                  {exam.feedback && (
                    <Text style={styles.examFeedback}>{exam.feedback}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
      </ScrollView>

      {/* Child Selector Modal */}
      {showChildSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>انتخاب فرزند</Text>
              <TouchableOpacity onPress={() => setShowChildSelector(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.modalChildItem,
                  selectedChildId === child.id && styles.modalChildItemActive,
                ]}
                onPress={() => handleChildSelect(child.id)}
              >
                <Text style={styles.modalChildName}>{child.name}</Text>
                <Text style={styles.modalChildClass}>{child.class}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyDataTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  emptyDataSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    alignItems: "center",
  },
  childSelectorButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
  },
  childSelectorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
  overallCard: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  overallTitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 12,
  },
  overallScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  overallScore: {
    fontSize: 48,
    fontWeight: "700",
    color: "#111827",
  },
  letterGradeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
  },
  letterGradeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  overallStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  overallStat: {
    alignItems: "center",
  },
  overallStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  overallStatLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  section: {
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  chartContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  subjectCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  subjectHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorIndicator: {
    width: 4,
    height: 24,
    borderRadius: 2,
  },
  subjectName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  gradeText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  scoreDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    textAlign: "right",
  },
  examCountText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  commentCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  commentText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    textAlign: "right",
  },
  teacherName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3b82f6",
    textAlign: "right",
  },
  examCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  examHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  examName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  examScoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  examScoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
  examSubject: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "right",
  },
  examDate: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "right",
  },
  examFeedback: {
    fontSize: 13,
    color: "#374151",
    marginTop: 4,
    textAlign: "right",
  },
  emptyState: {
    backgroundColor: "white",
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "80%",
    maxHeight: "60%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  modalClose: {
    fontSize: 20,
    color: "#6b7280",
    padding: 4,
  },
  modalChildItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalChildItemActive: {
    backgroundColor: "#eff6ff",
  },
  modalChildName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  modalChildClass: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "right",
  },
});
