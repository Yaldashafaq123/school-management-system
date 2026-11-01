// app/(principal)/teacher-evaluations/[id].tsx
import { principalApi } from "@/src/config/principalApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

// ==================== HELPERS ====================

const getGradeLabelFarsi = (grade: string): string => {
  const labels: Record<string, string> = {
    EXCELLENT: "عالی",
    VERY_GOOD: "خیلی خوب",
    GOOD: "خوب",
    SATISFACTORY: "قابل قبول",
    NEEDS_IMPROVEMENT: "نیاز به بهبود",
    UNSATISFACTORY: "ضعیف",
  };
  return labels[grade] || grade;
};

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

const getStatusColor = (status: string): string => {
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

const getCategoryLabelFarsi = (category: string): string => {
  const labels: Record<string, string> = {
    TEACHING: "تدریس",
    DISCIPLINE: "نظم و انضباط",
    COMMUNICATION: "ارتباطات",
    PROFESSIONAL: "حرفه‌ای",
    STUDENT_RELATION: "رابطه با شاگردان",
    ADMINISTRATIVE: "اداری",
    COLLABORATION: "همکاری",
    ATTENDANCE: "حضور",
    PUNCTUALITY: "وقت‌شناسی",
    OTHER: "سایر",
  };
  return labels[category] || category;
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    TEACHING: "#3b82f6",
    DISCIPLINE: "#8b5cf6",
    COMMUNICATION: "#10b981",
    PROFESSIONAL: "#f59e0b",
    STUDENT_RELATION: "#ec4899",
    ADMINISTRATIVE: "#06b6d4",
    OTHER: "#64748b",
  };
  return colors[category] || "#64748b";
};

// ==================== MAIN SCREEN ====================

export default function EvaluationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  // Editable scores (only for DRAFT/PENDING_REVIEW)
  const [scores, setScores] = useState<
    Record<number, { score: number; comment: string }>
  >({});
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [goals, setGoals] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [principalNotes, setPrincipalNotes] = useState("");

  // Collapsible categories — default: all open
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Track unsaved changes for beforeRemove guard
  const [dirty, setDirty] = useState(false);
  const autoSaveTimer = useRef<any>(null);

  const isEditable =
    evaluation?.status === "DRAFT" || evaluation?.status === "PENDING_REVIEW";

  const fetchEvaluation = useCallback(async () => {
    try {
      const res = await principalApi.getTeacherEvaluationDetails(Number(id));
      if (res.success) {
        setEvaluation(res.data);

        const initScores: Record<number, { score: number; comment: string }> =
          {};
        (res.data.criteria || []).forEach((c: any) => {
          initScores[c.criteriaId] = {
            score: c.score || 0,
            comment: c.comment || "",
          };
        });
        setScores(initScores);

        setStrengths(res.data.strengths || "");
        setWeaknesses(res.data.weaknesses || "");
        setGoals(res.data.goals || "");
        setRecommendations(res.data.recommendations || "");
        setPrincipalNotes(res.data.principalNotes || "");
        setDirty(false);
      }
    } catch (error) {
      console.error("Fetch evaluation error:", error);
      Alert.alert("خطا", "خطا در بارگذاری ارزیابی");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id) fetchEvaluation();
  }, [id, fetchEvaluation]);

  // Auto-save draft every 45 seconds when editable and dirty
  useEffect(() => {
    if (!isEditable) return;
    autoSaveTimer.current = setInterval(() => {
      if (dirty) {
        // Silently save — no alert
        (async () => {
          try {
            const scoresArray = (evaluation?.criteria || []).map((c: any) => ({
              criteriaId: c.criteriaId,
              score: scores[c.criteriaId]?.score || 0,
              comment: scores[c.criteriaId]?.comment || undefined,
            }));
            await principalApi.submitEvaluationScores(Number(id), {
              scores: scoresArray,
              strengths: strengths || undefined,
              weaknesses: weaknesses || undefined,
              goals: goals || undefined,
              recommendations: recommendations || undefined,
              principalNotes: principalNotes || undefined,
            });
            setDirty(false);
            console.log("💾 auto-saved draft");
          } catch (e) {
            console.warn("auto-save failed", e);
          }
        })();
      }
    }, 45000);
    return () => {
      if (autoSaveTimer.current) clearInterval(autoSaveTimer.current);
    };
  }, [
    isEditable,
    dirty,
    evaluation,
    scores,
    strengths,
    weaknesses,
    goals,
    recommendations,
    principalNotes,
    id,
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvaluation();
  };

  const markDirty = () => {
    if (!dirty) setDirty(true);
  };

  const handleScoreChange = (criteriaId: number, score: number) => {
    if (Platform.OS !== "web") Vibration.vibrate(10);
    setScores((prev) => ({
      ...prev,
      [criteriaId]: {
        score,
        comment: prev[criteriaId]?.comment || "",
      },
    }));
    markDirty();
  };

  const handleCommentChange = (criteriaId: number, comment: string) => {
    setScores((prev) => ({
      ...prev,
      [criteriaId]: {
        score: prev[criteriaId]?.score || 0,
        comment,
      },
    }));
    markDirty();
  };

  // Bulk fill: set every unscored criteria in a category to `value`
  const bulkFillCategory = (items: any[], value: number) => {
    const updates: any = { ...scores };
    let filled = 0;
    items.forEach((c: any) => {
      if (!updates[c.criteriaId]?.score) {
        updates[c.criteriaId] = {
          score: value,
          comment: updates[c.criteriaId]?.comment || "",
        };
        filled++;
      }
    });
    setScores(updates);
    markDirty();
    if (filled > 0) {
      Alert.alert("تکمیل گروهی", `${filled} معیار با نمره ${value} پر شد`);
    }
  };

  const toggleCategory = (category: string) => {
    setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSaveDraft = async () => {
    try {
      setSubmitting(true);
      const scoresArray = (evaluation?.criteria || []).map((c: any) => ({
        criteriaId: c.criteriaId,
        score: scores[c.criteriaId]?.score || 0,
        comment: scores[c.criteriaId]?.comment || undefined,
      }));

      const res = await principalApi.submitEvaluationScores(Number(id), {
        scores: scoresArray,
        strengths: strengths || undefined,
        weaknesses: weaknesses || undefined,
        goals: goals || undefined,
        recommendations: recommendations || undefined,
        principalNotes: principalNotes || undefined,
      });

      if (res.success) {
        setDirty(false);
        Alert.alert("موفقیت", "پیش‌نویس ذخیره شد");
        fetchEvaluation();
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در ذخیره");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    // Validate all criteria scored
    const totalCriteria = evaluation?.criteria?.length || 0;
    const scored = Object.values(scores).filter((s: any) => s.score > 0).length;
    if (scored < totalCriteria) {
      Alert.alert(
        "ارزیابی ناقص",
        `${totalCriteria - scored} معیار هنوز نمره‌دهی نشده است. آیا می‌خواهید ادامه دهید؟`,
        [
          { text: "انصراف", style: "cancel" },
          {
            text: "بله، ادامه بده",
            onPress: () => confirmSubmit(),
          },
        ],
      );
      return;
    }
    confirmSubmit();
  };

  const confirmSubmit = () => {
    Alert.alert(
      "نهایی‌سازی ارزیابی",
      "آیا از نهایی‌سازی ارزیابی مطمئن هستید؟ این عملیات قابل بازگشت نیست.",
      [
        { text: "انصراف", style: "cancel" },
        {
          text: "بله، نهایی کن",
          style: "destructive",
          onPress: async () => {
            try {
              setSubmitting(true);

              // Save first
              const scoresArray = (evaluation?.criteria || []).map(
                (c: any) => ({
                  criteriaId: c.criteriaId,
                  score: scores[c.criteriaId]?.score || 0,
                  comment: scores[c.criteriaId]?.comment || undefined,
                }),
              );
              await principalApi.submitEvaluationScores(Number(id), {
                scores: scoresArray,
                strengths: strengths || undefined,
                weaknesses: weaknesses || undefined,
                goals: goals || undefined,
                recommendations: recommendations || undefined,
                principalNotes: principalNotes || undefined,
              });

              const res = await principalApi.submitTeacherEvaluation(
                Number(id),
              );
              if (res.success) {
                setDirty(false);
                Alert.alert("موفقیت", "ارزیابی نهایی شد", [
                  {
                    text: "مشاهده کارنامه",
                    onPress: () => {
                      router.replace({
                        pathname:
                          "/(principal)/teacher-evaluations/report/[id]",
                        params: { id: String(id) },
                      } as any);
                    },
                  },
                ]);
                fetchEvaluation();
              }
            } catch (error: any) {
              Alert.alert("خطا", error.message || "خطا در نهایی‌سازی");
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  const handleViewReport = () => {
    router.push({
      pathname: "/(principal)/teacher-evaluations/report/[id]",
      params: { id: String(id) },
    } as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  if (!evaluation) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>ارزیابی یافت نشد</Text>
      </View>
    );
  }

  // Group criteria by category
  const criteriaByCategory: Record<string, any[]> = {};
  (evaluation.criteria || []).forEach((c: any) => {
    if (!criteriaByCategory[c.category]) {
      criteriaByCategory[c.category] = [];
    }
    criteriaByCategory[c.category].push(c);
  });

  // Progress stats
  const totalCriteria = evaluation.criteria?.length || 0;
  const totalScored = Object.values(scores).filter(
    (s: any) => s.score > 0,
  ).length;
  const overallProgress =
    totalCriteria > 0 ? Math.round((totalScored / totalCriteria) * 100) : 0;
  const categoryKeys = Object.keys(criteriaByCategory);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          isEditable && { paddingBottom: 120 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (dirty) {
                Alert.alert(
                  "تغییرات ذخیره نشده",
                  "آیا می‌خواهید بدون ذخیره خارج شوید؟",
                  [
                    { text: "ماندن", style: "cancel" },
                    {
                      text: "خروج",
                      style: "destructive",
                      onPress: () => router.back(),
                    },
                  ],
                );
              } else {
                router.back();
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>جزئیات ارزیابی</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleViewReport}
          >
            <Ionicons name="document-text-outline" size={22} color="#8b5cf6" />
          </TouchableOpacity>
        </View>

        {/* Status & Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(evaluation.status) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(evaluation.status) },
                ]}
              >
                {getStatusLabelFarsi(evaluation.status)}
              </Text>
            </View>
            <View
              style={[
                styles.gradeBadge,
                { backgroundColor: getGradeColor(evaluation.grade) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.gradeText,
                  { color: getGradeColor(evaluation.grade) },
                ]}
              >
                {evaluation.gradeLabel || getGradeLabelFarsi(evaluation.grade)}
              </Text>
            </View>
          </View>

          <View style={styles.scoreCircleRow}>
            <View
              style={[
                styles.scoreCircle,
                { borderColor: getGradeColor(evaluation.grade) },
              ]}
            >
              <Text
                style={[
                  styles.scoreCircleText,
                  { color: getGradeColor(evaluation.grade) },
                ]}
              >
                {evaluation.percentage != null
                  ? `${Math.round(evaluation.percentage)}%`
                  : "—"}
              </Text>
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.summaryTeacher}>
                {evaluation.teacher?.fullName || "نامشخص"}
              </Text>
              <Text style={styles.summaryMeta}>
                {getPeriodLabelFarsi(evaluation.period)} •{" "}
                {evaluation.academicYear || "—"}
              </Text>
              <Text style={styles.summaryMeta}>
                ارزیاب: {evaluation.evaluator?.fullName || "—"}
              </Text>
              {evaluation.evaluatedAt && (
                <Text style={styles.summaryMeta}>
                  تاریخ:{" "}
                  {new Date(evaluation.evaluatedAt).toLocaleDateString("fa-IR")}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Progress Overview (edit mode only) */}
        {isEditable && totalCriteria > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeaderRow}>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
              >
                <Ionicons name="stats-chart" size={18} color="#8b5cf6" />
                <Text style={styles.progressTitle}>پیشرفت ارزیابی</Text>
              </View>
              <Text style={styles.progressCount}>
                {totalScored} / {totalCriteria}
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${overallProgress}%`,
                    backgroundColor:
                      overallProgress === 100 ? "#10b981" : "#8b5cf6",
                  },
                ]}
              />
            </View>
            <View style={styles.categoryChipsRow}>
              {categoryKeys.map((cat) => {
                const items = criteriaByCategory[cat];
                const filled = items.filter(
                  (c: any) => (scores[c.criteriaId]?.score || 0) > 0,
                ).length;
                const pct =
                  items.length > 0
                    ? Math.round((filled / items.length) * 100)
                    : 0;
                const color = getCategoryColor(cat);
                const done = filled === items.length;
                return (
                  <View
                    key={cat}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: done ? color : color + "20",
                        borderColor: color,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: done ? "#fff" : color },
                      ]}
                    >
                      {getCategoryLabelFarsi(cat)} {filled}/{items.length}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Category Scores (view mode) */}
        {!isEditable && evaluation.categoryScores && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>امتیازات دسته‌ها</Text>
            {[
              { key: "teachingScore", label: "تدریس", color: "#3b82f6" },
              {
                key: "disciplineScore",
                label: "نظم و انضباط",
                color: "#8b5cf6",
              },
              {
                key: "communicationScore",
                label: "ارتباطات",
                color: "#10b981",
              },
              { key: "professionalScore", label: "حرفه‌ای", color: "#f59e0b" },
              {
                key: "studentRelationScore",
                label: "رابطه با شاگردان",
                color: "#ec4899",
              },
            ].map((cat) => {
              const value = evaluation.categoryScores[cat.key];
              if (value == null) return null;
              return (
                <View key={cat.key} style={styles.categoryScoreRow}>
                  <Text style={styles.categoryScoreLabel}>{cat.label}</Text>
                  <View style={styles.categoryScoreBarWrapper}>
                    <View style={styles.categoryScoreBarTrack}>
                      <View
                        style={[
                          styles.categoryScoreBarFill,
                          {
                            width: `${Math.min(value, 100)}%`,
                            backgroundColor: cat.color,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[styles.categoryScoreValue, { color: cat.color }]}
                    >
                      {Math.round(value)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Criteria - collapsible by category */}
        {categoryKeys.map((category) => {
          const items = criteriaByCategory[category];
          const isCollapsed = !!collapsed[category];
          const filled = items.filter(
            (c: any) => (scores[c.criteriaId]?.score || 0) > 0,
          ).length;
          const catColor = getCategoryColor(category);
          const catDone = filled === items.length;

          return (
            <View key={category} style={styles.section}>
              {/* Category header — tappable to collapse */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category)}
              >
                <View style={styles.categoryHeaderLeft}>
                  <View
                    style={[styles.categoryDot, { backgroundColor: catColor }]}
                  />
                  <Text style={styles.categoryTitle}>
                    {getCategoryLabelFarsi(category)}
                  </Text>
                </View>
                <View style={styles.categoryHeaderRight}>
                  <View
                    style={[
                      styles.categoryProgressBadge,
                      {
                        backgroundColor: catDone
                          ? "#d1fae5"
                          : filled > 0
                            ? "#fef3c7"
                            : "#f1f5f9",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryProgressText,
                        {
                          color: catDone
                            ? "#047857"
                            : filled > 0
                              ? "#92400e"
                              : "#64748b",
                        },
                      ]}
                    >
                      {filled}/{items.length}
                    </Text>
                  </View>
                  <Ionicons
                    name={isCollapsed ? "chevron-forward" : "chevron-down"}
                    size={18}
                    color="#94a3b8"
                  />
                </View>
              </TouchableOpacity>

              {!isCollapsed && (
                <>
                  {/* Bulk-fill row */}
                  {isEditable && (
                    <View style={styles.bulkFillRow}>
                      <Text style={styles.bulkFillLabel}>پر کردن سریع:</Text>
                      {[3, 4, 5].map((v) => (
                        <TouchableOpacity
                          key={v}
                          style={[
                            styles.bulkFillBtn,
                            { borderColor: catColor },
                          ]}
                          onPress={() => bulkFillCategory(items, v)}
                        >
                          <Text
                            style={[
                              styles.bulkFillBtnText,
                              { color: catColor },
                            ]}
                          >
                            همه {v}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {items.map((c: any) => {
                    const currentScore = scores[c.criteriaId]?.score || 0;
                    return (
                      <View key={c.criteriaId} style={styles.criteriaCard}>
                        <View style={styles.criteriaHeader}>
                          <Text style={styles.criteriaName}>
                            {c.nameFarsi || c.name}
                          </Text>
                          {!isEditable && (
                            <Text style={styles.criteriaScoreText}>
                              {c.score}/{c.maxScore}
                            </Text>
                          )}
                          {isEditable && currentScore > 0 && (
                            <View
                              style={[
                                styles.scoredBadge,
                                {
                                  backgroundColor:
                                    currentScore >= 4
                                      ? "#d1fae5"
                                      : currentScore >= 3
                                        ? "#fef3c7"
                                        : "#fee2e2",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.scoredBadgeText,
                                  {
                                    color:
                                      currentScore >= 4
                                        ? "#047857"
                                        : currentScore >= 3
                                          ? "#92400e"
                                          : "#dc2626",
                                  },
                                ]}
                              >
                                {currentScore}
                              </Text>
                            </View>
                          )}
                        </View>

                        {isEditable ? (
                          <>
                            <View style={styles.scoreRow}>
                              {[1, 2, 3, 4, 5].map((score) => (
                                <TouchableOpacity
                                  key={score}
                                  style={[
                                    styles.scoreButton,
                                    currentScore === score &&
                                      styles.scoreButtonActive,
                                  ]}
                                  onPress={() =>
                                    handleScoreChange(c.criteriaId, score)
                                  }
                                  activeOpacity={0.6}
                                >
                                  <Text
                                    style={[
                                      styles.scoreButtonText,
                                      currentScore === score &&
                                        styles.scoreButtonTextActive,
                                    ]}
                                  >
                                    {score}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>

                            <TextInput
                              style={styles.commentInput}
                              placeholder="یادداشت (اختیاری)..."
                              placeholderTextColor="#94a3b8"
                              value={scores[c.criteriaId]?.comment || ""}
                              onChangeText={(text) =>
                                handleCommentChange(c.criteriaId, text)
                              }
                              multiline
                              textAlign="right"
                            />
                          </>
                        ) : (
                          <>
                            <View style={styles.readonlyScoreRow}>
                              {[1, 2, 3, 4, 5].map((n) => (
                                <View
                                  key={n}
                                  style={[
                                    styles.readonlyDot,
                                    currentScore >= n &&
                                      styles.readonlyDotFilled,
                                  ]}
                                />
                              ))}
                            </View>
                            {c.comment && (
                              <Text style={styles.readonlyComment}>
                                {c.comment}
                              </Text>
                            )}
                          </>
                        )}
                      </View>
                    );
                  })}
                </>
              )}
            </View>
          );
        })}

        {/* Comments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نظرات و توصیه‌ها</Text>

          {[
            {
              label: "نقاط قوت",
              value: strengths,
              setter: (v: string) => {
                setStrengths(v);
                markDirty();
              },
            },
            {
              label: "نقاط ضعف",
              value: weaknesses,
              setter: (v: string) => {
                setWeaknesses(v);
                markDirty();
              },
            },
            {
              label: "اهداف",
              value: goals,
              setter: (v: string) => {
                setGoals(v);
                markDirty();
              },
            },
            {
              label: "توصیه‌ها",
              value: recommendations,
              setter: (v: string) => {
                setRecommendations(v);
                markDirty();
              },
            },
            {
              label: "یادداشت مدیر",
              value: principalNotes,
              setter: (v: string) => {
                setPrincipalNotes(v);
                markDirty();
              },
            },
          ].map((item) => (
            <View key={item.label} style={styles.textAreaWrapper}>
              <Text style={styles.textAreaLabel}>{item.label}</Text>
              {isEditable ? (
                <TextInput
                  style={styles.textArea}
                  placeholder={`${item.label}...`}
                  placeholderTextColor="#94a3b8"
                  value={item.value}
                  onChangeText={item.setter}
                  multiline
                  numberOfLines={3}
                  textAlign="right"
                />
              ) : (
                <View style={styles.readonlyTextArea}>
                  <Text style={styles.readonlyText}>{item.value || "—"}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Action Plans */}
        {evaluation.actionPlans && evaluation.actionPlans.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>برنامه‌های اقدام</Text>
            {evaluation.actionPlans.map((ap: any) => (
              <View key={ap.id} style={styles.actionPlanItem}>
                <View style={styles.actionPlanHeader}>
                  <Text style={styles.actionPlanTitle}>{ap.title}</Text>
                  <View
                    style={[
                      styles.actionPlanStatus,
                      {
                        backgroundColor:
                          ap.status === "COMPLETED"
                            ? "#d1fae5"
                            : ap.status === "IN_PROGRESS"
                              ? "#dbeafe"
                              : "#fef3c7",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.actionPlanStatusText,
                        {
                          color:
                            ap.status === "COMPLETED"
                              ? "#10b981"
                              : ap.status === "IN_PROGRESS"
                                ? "#3b82f6"
                                : "#f59e0b",
                        },
                      ]}
                    >
                      {ap.status === "COMPLETED"
                        ? "تکمیل"
                        : ap.status === "IN_PROGRESS"
                          ? "در جریان"
                          : "در انتظار"}
                    </Text>
                  </View>
                </View>
                {ap.description && (
                  <Text style={styles.actionPlanDesc}>{ap.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* View-mode report button */}
        {!isEditable && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.reportButton}
              onPress={handleViewReport}
            >
              <Ionicons name="document-text" size={18} color="#fff" />
              <Text style={styles.reportButtonText}>مشاهده کارنامه کامل</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Sticky bottom bar (edit mode only) */}
      {isEditable && (
        <View style={styles.stickyBar}>
          <View style={styles.stickyTopRow}>
            <Text style={styles.stickyProgressText}>
              {totalScored} / {totalCriteria} معیار
            </Text>
            <Text
              style={[
                styles.stickyPercentText,
                {
                  color: overallProgress === 100 ? "#10b981" : "#8b5cf6",
                },
              ]}
            >
              {overallProgress}%
            </Text>
          </View>
          <View style={styles.stickyButtonsRow}>
            <TouchableOpacity
              style={styles.stickyDraftBtn}
              onPress={handleSaveDraft}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#8b5cf6" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={16} color="#8b5cf6" />
                  <Text style={styles.stickyDraftText}>ذخیره</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stickySubmitBtn}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  <Text style={styles.stickySubmitText}>نهایی‌سازی</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
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
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  summaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "VazirBold",
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  scoreCircleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  scoreCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  scoreCircleText: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  summaryInfo: { flex: 1 },
  summaryTeacher: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  summaryMeta: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 3,
    fontFamily: "Vazir",
  },

  // Progress card
  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6",
  },
  progressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  progressCount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  categoryChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },

  // Sections
  section: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  categoryScoreRow: { marginBottom: 12 },
  categoryScoreLabel: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 6,
    fontFamily: "Vazir",
  },
  categoryScoreBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryScoreBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  categoryScoreBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  categoryScoreValue: {
    fontSize: 12,
    fontWeight: "700",
    width: 40,
    textAlign: "left",
    fontFamily: "VazirBold",
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  categoryCount: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  categoryProgressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryProgressText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  bulkFillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginBottom: 8,
  },
  bulkFillLabel: {
    fontSize: 11,
    color: "#64748b",
    fontFamily: "Vazir",
    marginRight: 4,
  },
  bulkFillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: "#fff",
  },
  bulkFillBtnText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  criteriaCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  criteriaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  criteriaName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  criteriaScoreText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  scoredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 26,
    alignItems: "center",
  },
  scoredBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  scoreRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  scoreButton: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  scoreButtonActive: {
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
  },
  scoreButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    fontFamily: "VazirBold",
  },
  scoreButtonTextActive: { color: "#fff" },
  commentInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: "#1e293b",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontFamily: "Vazir",
    minHeight: 40,
  },
  readonlyScoreRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  readonlyDot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e2e8f0",
  },
  readonlyDotFilled: { backgroundColor: "#8b5cf6" },
  readonlyComment: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
    fontStyle: "italic",
    fontFamily: "Vazir",
  },
  textAreaWrapper: { marginBottom: 12 },
  textAreaLabel: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 6,
    fontFamily: "Vazir",
  },
  textArea: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#1e293b",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontFamily: "Vazir",
    minHeight: 70,
    textAlignVertical: "top",
  },
  readonlyTextArea: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 50,
  },
  readonlyText: {
    fontSize: 13,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  actionPlanItem: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  actionPlanHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  actionPlanTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  actionPlanStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  actionPlanStatusText: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "VazirBold",
  },
  actionPlanDesc: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  reportButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "VazirBold",
  },

  // Sticky bottom bar
  stickyBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 28 : 14,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stickyTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  stickyProgressText: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  stickyPercentText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  stickyButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  stickyDraftBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#f3e8ff",
    borderWidth: 1,
    borderColor: "#e9d5ff",
    gap: 6,
  },
  stickyDraftText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  stickySubmitBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#8b5cf6",
    gap: 6,
  },
  stickySubmitText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "VazirBold",
  },
});
