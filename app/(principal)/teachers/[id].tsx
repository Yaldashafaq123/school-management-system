/* eslint-disable react-hooks/set-state-in-effect */
// app/(principal)/teachers/[id].tsx
import { formatCurrency, principalApi } from "@/src/config/principalApi";
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

// ==================== TYPES ====================

type TeacherDetail = {
  id: number;
  User: {
    fullName: string;
    email: string;
    phone: string;
    profileImage?: string;
  };
  teacherCode: string;
  isActive: boolean;
  joiningDate: string;
  specialization: string;
  rating: number;
  baseSalary: number;
  experience: string;
  certification: string;
  availability: boolean;
  TeacherSubject: {
    Subject: {
      id: number;
      name: string;
    };
  }[];
  Class: {
    id: number;
    name: string;
    section: string;
    _count?: {
      Student: number;
    };
  } | null;
  Salary: {
    id: number;
    amount: number;
    month: number;
    year: number;
    status: string;
  }[];
};

type EvaluationSummary = {
  totalEvaluations: number;
  completedEvaluations: number;
  averagePercentage: number;
  averageGrade: string;
  averageGradeLabel: string;
};

type Evaluation = {
  id: number;
  templateName: string;
  period: string;
  term: string;
  academicYear: string;
  evaluatorName: string;
  evaluatorRole: string;
  overallScore: number;
  percentage: number;
  grade: string;
  gradeLabel: string;
  status: string;
  evaluatedAt: string;
  submittedAt: string;
  scoresCount: number;
  actionPlansCount: number;
};

type PerformanceSummary = {
  teacher: {
    id: number;
    fullName: string;
    email: string;
    profileImage: string | null;
  };
  hasEvaluations: boolean;
  summary?: {
    totalEvaluations: number;
    averagePercentage: number;
    averageGrade: string;
    averageGradeLabel: string;
    trend: string;
    trendLabel: string;
  };
  categoryAverages?: {
    teaching: number;
    discipline: number;
    communication: number;
    professional: number;
    studentRelation: number;
  };
  latestEvaluation?: {
    id: number;
    templateName: string;
    academicYear: string;
    percentage: number;
    grade: string;
    gradeLabel: string;
    evaluatedAt: string;
  };
  evaluationHistory?: {
    id: number;
    templateName: string;
    academicYear: string;
    period: string;
    percentage: number;
    grade: string;
    gradeLabel: string;
    evaluatedAt: string;
  }[];
};

// ==================== HELPERS ====================

const getGradeColor = (grade: string) => {
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

const getStatusLabelFarsi = (status: string) => {
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

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    DRAFT: "#94a3b8",
    PENDING_REVIEW: "#f59e0b",
    SUBMITTED: "#3b82f6",
    ACKNOWLEDGED: "#10b981",
    DISPUTED: "#ef4444",
    ARCHIVED: "#64748b",
  };
  return colors[status] || "#64748b";
};

const getTrendIcon = (trend: string): keyof typeof Ionicons.glyphMap => {
  if (trend === "IMPROVING") return "trending-up";
  if (trend === "DECLINING") return "trending-down";
  return "remove";
};

const getTrendColor = (trend: string) => {
  if (trend === "IMPROVING") return "#10b981";
  if (trend === "DECLINING") return "#ef4444";
  return "#64748b";
};

const getPeriodLabelFarsi = (period: string) => {
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

const getMonthName = (month: number) => {
  const months = [
    "حمل",
    "ثور",
    "جوزا",
    "سرطان",
    "اسد",
    "سنبله",
    "میزان",
    "عقرب",
    "قوس",
    "جدی",
    "دلو",
    "حوت",
  ];
  return months[month - 1] || month;
};

// ==================== COMPONENTS ====================

const CircularProgress = ({
  percentage,
  size = 100,
  strokeWidth = 10,
  color = "#3b82f6",
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Background circle */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: "#e2e8f0",
        }}
      />
      {/* Progress circle */}
      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderTopColor: "transparent",
          borderRightColor: percentage > 25 ? color : "transparent",
          borderBottomColor: percentage > 50 ? color : "transparent",
          borderLeftColor: percentage > 75 ? color : "transparent",
          transform: [{ rotate: `${(percentage / 100) * 360 - 45}deg` }],
        }}
      />
      {/* Center text */}
      <View
        style={{
          width: size - strokeWidth * 2,
          height: size - strokeWidth * 2,
          borderRadius: (size - strokeWidth * 2) / 2,
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: size * 0.22,
            fontWeight: "700",
            color,
            fontFamily: "VazirBold",
          }}
        >
          {Math.round(percentage)}%
        </Text>
      </View>
    </View>
  );
};

const ScoreBar = ({
  label,
  score,
  maxScore = 100,
  color = "#3b82f6",
}: {
  label: string;
  score: number;
  maxScore?: number;
  color?: string;
}) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  return (
    <View style={styles.scoreBarContainer}>
      <View style={styles.scoreBarHeader}>
        <Text style={styles.scoreBarLabel}>{label}</Text>
        <Text style={[styles.scoreBarValue, { color }]}>
          {Math.round(score)}%
        </Text>
      </View>
      <View style={styles.scoreBarTrack}>
        <View
          style={[
            styles.scoreBarFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

// ==================== MAIN SCREEN ====================

export default function TeacherDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);

  // Evaluation state
  const [, setEvaluationSummary] = useState<EvaluationSummary | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [performanceSummary, setPerformanceSummary] =
    useState<PerformanceSummary | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [showAllEvaluations, setShowAllEvaluations] = useState(false);

  const fetchTeacher = useCallback(async () => {
    try {
      const response = await principalApi.getTeacherById(Number(id));
      if (response.success) {
        setTeacher(response.data);
      }
    } catch (error) {
      console.error("Fetch teacher error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  const fetchEvaluations = useCallback(async () => {
    try {
      setEvalLoading(true);
      const response = await principalApi.getTeacherEvaluations(Number(id));
      if (response.success) {
        setEvaluationSummary(response.data.summary);
        setEvaluations(response.data.evaluations || []);
      }
    } catch (error) {
      console.error("Fetch evaluations error:", error);
    } finally {
      setEvalLoading(false);
    }
  }, [id]);

  const fetchPerformanceSummary = useCallback(async () => {
    try {
      const response = await principalApi.getTeacherPerformanceSummary(
        Number(id),
      );
      if (response.success && response.data.hasEvaluations) {
        setPerformanceSummary(response.data);
      }
    } catch (error) {
      console.error("Fetch performance summary error:", error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchTeacher();
      fetchEvaluations();
      fetchPerformanceSummary();
    }
  }, [id, fetchTeacher, fetchEvaluations, fetchPerformanceSummary]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeacher();
    fetchEvaluations();
    fetchPerformanceSummary();
  };

  const handleStartEvaluation = () => {
    router.push({
      pathname: "/(principal)/teacher-evaluations/new",
      params: { teacherId: id },
    } as any);
  };

  const handleViewEvaluation = (evaluationId: number) => {
    router.push({
      pathname: "/(principal)/teacher-evaluations/[id]",
      params: { id: String(evaluationId) },
    } as any);
  };

  const handleViewReportCard = (evaluationId: number) => {
    router.push({
      pathname: "/(principal)/teacher-evaluations/report/[id]",
      params: { id: String(evaluationId) },
    } as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!teacher) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>استاد یافت نشد</Text>
      </View>
    );
  }

  const subjects = teacher.TeacherSubject?.map((ts) => ts.Subject.name) || [];
  const studentCount = teacher.Class?._count?.Student ?? 0;

  const displayedEvaluations = showAllEvaluations
    ? evaluations
    : evaluations.slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {teacher.User?.fullName?.charAt(0) || "?"}
          </Text>
        </View>
        <Text style={styles.teacherName}>
          {teacher.User?.fullName || "نامشخص"}
        </Text>
        <Text style={styles.specializationText}>
          {teacher.specialization || "متخصص"}
        </Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: teacher.isActive ? "#d1fae5" : "#fef3c7" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: teacher.isActive ? "#10b981" : "#f59e0b" },
              ]}
            >
              {teacher.isActive ? "فعال" : "غیرفعال"}
            </Text>
          </View>
          {teacher.availability && (
            <View style={[styles.statusBadge, { backgroundColor: "#dbeafe" }]}>
              <Text style={[styles.statusText, { color: "#3b82f6" }]}>
                در دسترس
              </Text>
            </View>
          )}
        </View>
        {teacher.rating > 0 && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#f59e0b" />
            <Text style={styles.ratingText}>{teacher.rating}</Text>
          </View>
        )}
      </View>

      {/* ==================== EVALUATION SECTION ==================== */}
      <View style={styles.infoCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="school-outline" size={22} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>ارزیابی عملکرد</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleStartEvaluation}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addButtonText}>ارزیابی جدید</Text>
          </TouchableOpacity>
        </View>

        {evalLoading ? (
          <View style={styles.evalLoadingContainer}>
            <ActivityIndicator size="small" color="#8b5cf6" />
            <Text style={styles.evalLoadingText}>
              در حال بارگذاری ارزیابی‌ها...
            </Text>
          </View>
        ) : !performanceSummary?.hasEvaluations && evaluations.length === 0 ? (
          <View style={styles.emptyEvalContainer}>
            <Ionicons name="clipboard-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyEvalTitle}>هنوز ارزیابی ثبت نشده</Text>
            <Text style={styles.emptyEvalSubtitle}>
              برای ارزیابی این معلم، دکمه «ارزیابی جدید» را بزنید
            </Text>
          </View>
        ) : (
          <>
            {/* Performance Summary Card */}
            {performanceSummary?.hasEvaluations && (
              <View style={styles.performanceSummaryCard}>
                <View style={styles.performanceMainRow}>
                  <CircularProgress
                    percentage={
                      performanceSummary.summary?.averagePercentage || 0
                    }
                    size={110}
                    strokeWidth={12}
                    color={getGradeColor(
                      performanceSummary.summary?.averageGrade || "GOOD",
                    )}
                  />
                  <View style={styles.performanceInfo}>
                    <Text style={styles.performanceGradeLabel}>
                      {performanceSummary.summary?.averageGradeLabel}
                    </Text>
                    <Text style={styles.performanceGradeSubtext}>
                      میانگین {performanceSummary.summary?.totalEvaluations}{" "}
                      ارزیابی
                    </Text>
                    <View
                      style={[
                        styles.trendBadge,
                        {
                          backgroundColor:
                            getTrendColor(
                              performanceSummary.summary?.trend || "STABLE",
                            ) + "20",
                        },
                      ]}
                    >
                      <Ionicons
                        name={getTrendIcon(
                          performanceSummary.summary?.trend || "STABLE",
                        )}
                        size={16}
                        color={getTrendColor(
                          performanceSummary.summary?.trend || "STABLE",
                        )}
                      />
                      <Text
                        style={[
                          styles.trendText,
                          {
                            color: getTrendColor(
                              performanceSummary.summary?.trend || "STABLE",
                            ),
                          },
                        ]}
                      >
                        {performanceSummary.summary?.trendLabel}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Category Averages */}
                {performanceSummary.categoryAverages && (
                  <View style={styles.categoryAveragesContainer}>
                    <Text style={styles.categoryAveragesTitle}>
                      میانگین دسته‌ها
                    </Text>
                    <ScoreBar
                      label="تدریس"
                      score={performanceSummary.categoryAverages.teaching}
                      color="#3b82f6"
                    />
                    <ScoreBar
                      label="نظم و انضباط"
                      score={performanceSummary.categoryAverages.discipline}
                      color="#8b5cf6"
                    />
                    <ScoreBar
                      label="ارتباطات"
                      score={performanceSummary.categoryAverages.communication}
                      color="#10b981"
                    />
                    <ScoreBar
                      label="حرفه‌ای"
                      score={performanceSummary.categoryAverages.professional}
                      color="#f59e0b"
                    />
                    <ScoreBar
                      label="رابطه با شاگردان"
                      score={
                        performanceSummary.categoryAverages.studentRelation
                      }
                      color="#ec4899"
                    />
                  </View>
                )}
              </View>
            )}

            {/* Evaluations List */}
            {evaluations.length > 0 && (
              <View style={styles.evaluationsListContainer}>
                <Text style={styles.evaluationsListTitle}>
                  تاریخچه ارزیابی‌ها ({evaluations.length})
                </Text>

                {displayedEvaluations.map((evaluation) => (
                  <TouchableOpacity
                    key={evaluation.id}
                    style={styles.evaluationItem}
                    onPress={() => handleViewEvaluation(evaluation.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.evaluationItemHeader}>
                      <View style={styles.evaluationItemLeft}>
                        <View
                          style={[
                            styles.evaluationScoreBadge,
                            {
                              backgroundColor:
                                getGradeColor(evaluation.grade) + "15",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.evaluationScoreText,
                              { color: getGradeColor(evaluation.grade) },
                            ]}
                          >
                            {evaluation.percentage}%
                          </Text>
                        </View>
                        <View style={styles.evaluationItemInfo}>
                          <Text style={styles.evaluationTemplateName}>
                            {evaluation.templateName}
                          </Text>
                          <Text style={styles.evaluationMeta}>
                            {getPeriodLabelFarsi(evaluation.period)} •{" "}
                            {evaluation.academicYear || "—"}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.evaluationStatusBadge,
                          {
                            backgroundColor:
                              getStatusColor(evaluation.status) + "20",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.evaluationStatusText,
                            { color: getStatusColor(evaluation.status) },
                          ]}
                        >
                          {getStatusLabelFarsi(evaluation.status)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.evaluationItemFooter}>
                      <View style={styles.evaluationItemFooterLeft}>
                        <Ionicons
                          name="person-outline"
                          size={14}
                          color="#64748b"
                        />
                        <Text style={styles.evaluationFooterText}>
                          {evaluation.evaluatorName}
                        </Text>
                      </View>
                      <View style={styles.evaluationItemFooterRight}>
                        {evaluation.evaluatedAt && (
                          <Text style={styles.evaluationFooterText}>
                            {new Date(
                              evaluation.evaluatedAt,
                            ).toLocaleDateString("fa-IR")}
                          </Text>
                        )}
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="#94a3b8"
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

                {evaluations.length > 3 && (
                  <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => setShowAllEvaluations(!showAllEvaluations)}
                  >
                    <Text style={styles.showMoreText}>
                      {showAllEvaluations
                        ? "نمایش کمتر"
                        : `نمایش همه (${evaluations.length})`}
                    </Text>
                    <Ionicons
                      name={showAllEvaluations ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#8b5cf6"
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Quick Report Card Button */}
            {performanceSummary?.latestEvaluation && (
              <TouchableOpacity
                style={styles.reportCardButton}
                onPress={() =>
                  handleViewReportCard(performanceSummary.latestEvaluation!.id)
                }
              >
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#8b5cf6"
                />
                <Text style={styles.reportCardButtonText}>
                  مشاهده کارنامه آخرین ارزیابی
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#8b5cf6" />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* Contact Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>اطلاعات تماس</Text>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>
            {teacher.User?.email || "ثبت نشده"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>
            {teacher.User?.phone || "ثبت نشده"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>
            کد: {teacher.teacherCode || "ندارد"}
          </Text>
        </View>
      </View>

      {/* Professional Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>اطلاعات حرفه‌ای</Text>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>
            تاریخ پیوستن:{" "}
            {teacher.joiningDate
              ? new Date(teacher.joiningDate).toLocaleDateString("fa-IR")
              : "ثبت نشده"}
          </Text>
        </View>
        {teacher.experience && (
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>{teacher.experience}</Text>
          </View>
        )}
        {teacher.certification && (
          <View style={styles.infoRow}>
            <Ionicons name="document-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>{teacher.certification}</Text>
          </View>
        )}
        {teacher.baseSalary > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>
              معاش پایه: {formatCurrency(teacher.baseSalary)}
            </Text>
          </View>
        )}
      </View>

      {/* Subjects */}
      {subjects.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>مواد درسی</Text>
          <View style={styles.subjectsContainer}>
            {subjects.map((subject, index) => (
              <View key={index} style={styles.subjectTag}>
                <Text style={styles.subjectText}>{subject}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Class Info */}
      {teacher.Class && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>صنف</Text>
          <View style={styles.classInfoCard}>
            <Text style={styles.className}>
              {teacher.Class.name} {teacher.Class.section || ""}
            </Text>
            <Text style={styles.classStudents}>
              تعداد شاگردان: {studentCount}
            </Text>
          </View>
        </View>
      )}

      {/* Recent Salaries */}
      {teacher.Salary && teacher.Salary.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>معاشات اخیر</Text>
          {teacher.Salary.slice(0, 5).map((salary) => (
            <View key={salary.id} style={styles.salaryItem}>
              <Text style={styles.salaryMonth}>
                {getMonthName(salary.month)} {salary.year}
              </Text>
              <Text style={styles.salaryAmount}>
                {formatCurrency(salary.amount)}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      salary.status === "PAID" ? "#d1fae5" : "#fef3c7",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: salary.status === "PAID" ? "#10b981" : "#f59e0b",
                    },
                  ]}
                >
                  {salary.status === "PAID" ? "پرداخت شد" : "در انتظار"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#3b82f6" }]}
          onPress={() =>
            router.push({
              pathname: "/(principal)/teachers/[id]/edit",
              params: { id },
            } as any)
          }
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>ویرایش اطلاعات</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
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
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#3b82f6",
    fontFamily: "VazirBold",
  },
  teacherName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  specializationText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f59e0b",
    fontFamily: "VazirBold",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  infoText: {
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  subjectsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  subjectTag: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  subjectText: {
    fontSize: 13,
    color: "#8b5cf6",
    fontFamily: "Vazir",
  },
  classInfoCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
  },
  className: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  classStudents: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  salaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  salaryMonth: {
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  salaryAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  actionContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Vazir",
  },

  // ==================== EVALUATION STYLES ====================
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "VazirBold",
  },
  evalLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8,
  },
  evalLoadingText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  emptyEvalContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyEvalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 12,
    fontFamily: "VazirBold",
  },
  emptyEvalSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 6,
    textAlign: "center",
    fontFamily: "Vazir",
  },

  // Performance Summary
  performanceSummaryCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  performanceMainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  performanceInfo: {
    flex: 1,
  },
  performanceGradeLabel: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  performanceGradeSubtext: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginTop: 8,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "VazirBold",
  },

  // Category Averages
  categoryAveragesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  categoryAveragesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  scoreBarContainer: {
    marginBottom: 10,
  },
  scoreBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  scoreBarLabel: {
    fontSize: 13,
    color: "#475569",
    fontFamily: "Vazir",
  },
  scoreBarValue: {
    fontSize: 13,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  scoreBarTrack: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 4,
  },

  // Evaluations List
  evaluationsListContainer: {
    marginTop: 8,
  },
  evaluationsListTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  evaluationItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  evaluationItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  evaluationItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  evaluationScoreBadge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  evaluationScoreText: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  evaluationItemInfo: {
    flex: 1,
  },
  evaluationTemplateName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  evaluationMeta: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  evaluationStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  evaluationStatusText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "VazirBold",
  },
  evaluationItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  evaluationItemFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  evaluationItemFooterRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  evaluationFooterText: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 4,
  },
  showMoreText: {
    fontSize: 13,
    color: "#8b5cf6",
    fontWeight: "600",
    fontFamily: "VazirBold",
  },

  // Report Card Button
  reportCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3e8ff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e9d5ff",
  },
  reportCardButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
});
