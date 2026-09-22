/* eslint-disable react-hooks/set-state-in-effect */
// app/(principal)/teacher-evaluations/report/[id].tsx
import { principalApi } from "@/src/config/principalApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

// ==================== HELPERS ====================

const getGradeColor = (grade: string): string => {
  const colors: Record<string, string> = {
    EXCELLENT: "#10b981",
    VERY_GOOD: "#3b82f6",
    GOOD: "#f59e0b",
    SATISFACTORY: "#f97316",
    NEEDS_IMPROVEMENT: "#ef4444",
    UNSATISFACTORY: "#dc2626",
  };
  return colors[grade] || "#64748b";
};

const getPeriodLabelFarsi = (period: string): string => {
  const labels: Record<string, string> = {
    MONTHLY: "ماهانه",
    QUARTERLY: "سه‌ماهه",
    SEMESTER: "سمستر",
    ANNUAL: "سالانه",
    PROBATION: "دوره آزمایشی",
    SPECIAL: "ویژه",
  };
  return labels[period] || period;
};

const getTermLabelFarsi = (term: string): string => {
  const labels: Record<string, string> = {
    FIRST: "چهارونیم‌ماهه اول",
    SECOND: "چهارونیم‌ماهه دوم",
    THIRD: "سمستر سوم",
    SUMMER: "تابستانی",
  };
  return labels[term] || term;
};

const getStatusLabelFarsi = (status: string): string => {
  const labels: Record<string, string> = {
    DRAFT: "پیش‌نویس",
    PENDING_REVIEW: "در انتظار بررسی",
    SUBMITTED: "ارسال شده",
    ACKNOWLEDGED: "تأیید شده",
    DISPUTED: "اعتراض",
    ARCHIVED: "بایگانی",
  };
  return labels[status] || status;
};

// ==================== MAIN SCREEN ====================

export default function ReportCardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [report, setReport] = useState<any>(null);

  const fetchReport = useCallback(async () => {
    try {
      const res = await principalApi.getEvaluationReportCard(Number(id));
      if (res.success) {
        setReport(res.data);
      }
    } catch (error) {
      console.error("Fetch report error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchReport();
  }, [id, fetchReport]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReport();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>کارنامه یافت نشد</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>کارنامه ارزیابی</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Report Card */}
      <View style={styles.reportCard}>
        {/* Report Header */}
        <View style={styles.reportHeader}>
          <View style={styles.reportHeaderIcon}>
            <Ionicons name="school" size={28} color="#fff" />
          </View>
          <Text style={styles.reportTitle}>کارنامه ارزیابی معلم</Text>
          <Text style={styles.reportSubtitle}>
            {report.evaluation.templateName}
          </Text>
        </View>

        {/* Teacher Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>نام معلم:</Text>
            <Text style={styles.infoValue}>{report.teacher.fullName}</Text>
          </View>
          {report.teacher.teacherCode && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>کد معلم:</Text>
              <Text style={styles.infoValue}>{report.teacher.teacherCode}</Text>
            </View>
          )}
          {report.teacher.specialization && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>تخصص:</Text>
              <Text style={styles.infoValue}>
                {report.teacher.specialization}
              </Text>
            </View>
          )}
          {report.teacher.subjects?.length > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>مواد درسی:</Text>
              <Text style={styles.infoValue}>
                {report.teacher.subjects.join("، ")}
              </Text>
            </View>
          )}
        </View>

        {/* Evaluation Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>دوره:</Text>
            <Text style={styles.infoValue}>
              {getPeriodLabelFarsi(report.evaluation.period)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ترم:</Text>
            <Text style={styles.infoValue}>
              {getTermLabelFarsi(report.evaluation.term)}
            </Text>
          </View>
          {report.evaluation.academicYear && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>سال تعلیمی:</Text>
              <Text style={styles.infoValue}>
                {report.evaluation.academicYear}
              </Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ارزیاب:</Text>
            <Text style={styles.infoValue}>
              {report.evaluation.evaluatorName} (
              {report.evaluation.evaluatorRole})
            </Text>
          </View>
          {report.evaluation.evaluatedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>تاریخ ارزیابی:</Text>
              <Text style={styles.infoValue}>
                {new Date(report.evaluation.evaluatedAt).toLocaleDateString(
                  "fa-IR",
                )}
              </Text>
            </View>
          )}
        </View>

        {/* Overall Score Card */}
        <View style={styles.overallCard}>
          <View
            style={[
              styles.overallCircle,
              {
                borderColor: report.overallScore.performanceColor,
                backgroundColor: report.overallScore.performanceColor + "10",
              },
            ]}
          >
            <Text
              style={[
                styles.overallPercentage,
                { color: report.overallScore.performanceColor },
              ]}
            >
              {Math.round(report.overallScore.percentage)}%
            </Text>
            <Text style={styles.overallPercentLabel}>درصد کل</Text>
          </View>

          <View style={styles.overallInfo}>
            <Text
              style={[
                styles.overallGrade,
                { color: report.overallScore.performanceColor },
              ]}
            >
              {report.overallScore.performanceLabel}
            </Text>
            <Text style={styles.overallScoreText}>
              امتیاز: {report.overallScore.totalScore} از{" "}
              {report.overallScore.totalMaxScore}
            </Text>
            <View
              style={[
                styles.performanceIconWrapper,
                {
                  backgroundColor: report.overallScore.performanceColor + "20",
                },
              ]}
            >
              <Ionicons
                name={report.overallScore.performanceIcon as any}
                size={20}
                color={report.overallScore.performanceColor}
              />
              <Text
                style={[
                  styles.performanceIconText,
                  { color: report.overallScore.performanceColor },
                ]}
              >
                {report.overallScore.gradeLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        <Text style={styles.sectionTitle}>امتیازات دسته‌ها</Text>
        {report.categoryBreakdown.map((cat: any) => (
          <View key={cat.category} style={styles.categoryBlock}>
            <View style={styles.categoryBlockHeader}>
              <Text style={styles.categoryBlockTitle}>{cat.categoryLabel}</Text>
              <Text style={[styles.categoryBlockValue, { color: cat.color }]}>
                {cat.percentage}%
              </Text>
            </View>
            <View style={styles.categoryBlockTrack}>
              <View
                style={[
                  styles.categoryBlockFill,
                  {
                    width: `${Math.min(cat.percentage, 100)}%`,
                    backgroundColor: cat.color,
                  },
                ]}
              />
            </View>
            {cat.criteria.map((c: any, idx: number) => (
              <View key={idx} style={styles.categoryCriteriaRow}>
                <Text style={styles.categoryCriteriaName}>{c.name}</Text>
                <Text
                  style={[styles.categoryCriteriaScore, { color: cat.color }]}
                >
                  {c.score}/{c.maxScore}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {/* Strengths */}
        {report.strengths && report.strengths.length > 0 && (
          <View style={styles.listBlock}>
            <View style={styles.listHeader}>
              <Ionicons name="thumbs-up" size={18} color="#10b981" />
              <Text style={[styles.listTitle, { color: "#10b981" }]}>
                نقاط قوت
              </Text>
            </View>
            {report.strengths.map((s: any, i: number) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: "#10b981" }]} />
                <Text style={styles.listItemText}>
                  {s.name}{" "}
                  <Text style={styles.listItemMeta}>({s.percentage}%)</Text>
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Weaknesses */}
        {report.weaknesses && report.weaknesses.length > 0 && (
          <View style={styles.listBlock}>
            <View style={styles.listHeader}>
              <Ionicons name="trending-down" size={18} color="#ef4444" />
              <Text style={[styles.listTitle, { color: "#ef4444" }]}>
                نیاز به بهبود
              </Text>
            </View>
            {report.weaknesses.map((w: any, i: number) => (
              <View key={i} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: "#ef4444" }]} />
                <Text style={styles.listItemText}>
                  {w.name}{" "}
                  <Text style={styles.listItemMeta}>({w.percentage}%)</Text>
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Comments */}
        {(report.comments.strengths ||
          report.comments.weaknesses ||
          report.comments.goals ||
          report.comments.recommendations) && (
          <View style={styles.commentsBlock}>
            <Text style={styles.sectionTitle}>نظرات و توصیه‌ها</Text>
            {report.comments.strengths && (
              <View style={styles.commentRow}>
                <Text style={styles.commentLabel}>نقاط قوت:</Text>
                <Text style={styles.commentText}>
                  {report.comments.strengths}
                </Text>
              </View>
            )}
            {report.comments.weaknesses && (
              <View style={styles.commentRow}>
                <Text style={styles.commentLabel}>نقاط ضعف:</Text>
                <Text style={styles.commentText}>
                  {report.comments.weaknesses}
                </Text>
              </View>
            )}
            {report.comments.goals && (
              <View style={styles.commentRow}>
                <Text style={styles.commentLabel}>اهداف:</Text>
                <Text style={styles.commentText}>{report.comments.goals}</Text>
              </View>
            )}
            {report.comments.recommendations && (
              <View style={styles.commentRow}>
                <Text style={styles.commentLabel}>توصیه‌ها:</Text>
                <Text style={styles.commentText}>
                  {report.comments.recommendations}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Plans */}
        {report.actionPlans && report.actionPlans.length > 0 && (
          <View style={styles.commentsBlock}>
            <Text style={styles.sectionTitle}>برنامه‌های اقدام</Text>
            {report.actionPlans.map((ap: any) => (
              <View key={ap.id} style={styles.planItem}>
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>{ap.title}</Text>
                  <Text style={styles.planProgress}>{ap.progress}%</Text>
                </View>
                {ap.description && (
                  <Text style={styles.planDesc}>{ap.description}</Text>
                )}
                <View style={styles.planTrack}>
                  <View
                    style={[styles.planFill, { width: `${ap.progress}%` }]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Summary Stats */}
        <View style={styles.summaryBlock}>
          <Text style={styles.sectionTitle}>خلاصه</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryItemValue}>
                {report.summary.totalCriteria}
              </Text>
              <Text style={styles.summaryItemLabel}>کل معیارها</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryItemValue, { color: "#10b981" }]}>
                {report.summary.criteriaAbove70}
              </Text>
              <Text style={styles.summaryItemLabel}>بالای ۷۰٪</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryItemValue, { color: "#ef4444" }]}>
                {report.summary.criteriaBelow50}
              </Text>
              <Text style={styles.summaryItemLabel}>زیر ۵۰٪</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>قوی‌ترین دسته:</Text>
            <Text style={styles.summaryRowValue}>
              {report.summary.strongestCategory || "—"}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryRowLabel}>ضعیف‌ترین دسته:</Text>
            <Text style={styles.summaryRowValue}>
              {report.summary.weakestCategory || "—"}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            تاریخ گزارش:{" "}
            {new Date(report.reportDate).toLocaleDateString("fa-IR")}
          </Text>
          <Text style={styles.footerText}>
            وضعیت: {getStatusLabelFarsi(report.evaluation.status)}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>بازگشت</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  content: { padding: 16, paddingBottom: 40 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  reportHeader: {
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#8b5cf6",
    marginBottom: 16,
  },
  reportHeaderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#8b5cf6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  reportSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  infoSection: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "left",
    fontFamily: "VazirBold",
  },
  overallCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  overallCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  overallPercentage: {
    fontSize: 26,
    fontWeight: "800",
    fontFamily: "VazirBold",
  },
  overallPercentLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  overallInfo: { flex: 1 },
  overallGrade: {
    fontSize: 24,
    fontWeight: "800",
    fontFamily: "VazirBold",
  },
  overallScoreText: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  performanceIconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    marginTop: 8,
  },
  performanceIconText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
    marginTop: 8,
    fontFamily: "VazirBold",
  },
  categoryBlock: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  categoryBlockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryBlockTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  categoryBlockValue: {
    fontSize: 15,
    fontWeight: "800",
    fontFamily: "VazirBold",
  },
  categoryBlockTrack: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 10,
  },
  categoryBlockFill: { height: "100%", borderRadius: 3 },
  categoryCriteriaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  categoryCriteriaName: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
    fontFamily: "Vazir",
  },
  categoryCriteriaScore: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  listBlock: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  bullet: { width: 6, height: 6, borderRadius: 3 },
  listItemText: {
    flex: 1,
    fontSize: 13,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  listItemMeta: {
    fontSize: 11,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  commentsBlock: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  commentRow: { marginBottom: 10 },
  commentLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 4,
    fontFamily: "VazirBold",
  },
  commentText: {
    fontSize: 13,
    color: "#1e293b",
    lineHeight: 20,
    fontFamily: "Vazir",
  },
  planItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  planTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  planProgress: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  planDesc: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 6,
    fontFamily: "Vazir",
  },
  planTrack: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  planFill: {
    height: "100%",
    backgroundColor: "#8b5cf6",
    borderRadius: 3,
  },
  summaryBlock: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  summaryItemValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  summaryItemLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  summaryRowLabel: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  summaryRowValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  actionsContainer: {
    flexDirection: "row",
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
});
