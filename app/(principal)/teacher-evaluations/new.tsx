/* eslint-disable react-hooks/set-state-in-effect */
// app/(principal)/teacher-evaluations/new.tsx
import { principalApi } from "@/src/config/principalApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ==================== TYPES ====================

type Template = {
  id: number;
  name: string;
  description: string | null;
  period: string;
  isDefault: boolean;
  criteriaCount: number;
  academicYear: string | null;
};

type Criteria = {
  id: number;
  name: string;
  nameFarsi: string | null;
  description: string | null;
  category: string;
  weight: number;
  maxScore: number;
  sortOrder: number;
  isRequired: boolean;
};

type CriteriaScore = {
  criteriaId: number;
  score: number;
  comment: string;
};

// ==================== HELPERS ====================

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

const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    TEACHING: "book-outline",
    DISCIPLINE: "shield-checkmark-outline",
    COMMUNICATION: "chatbubbles-outline",
    PROFESSIONAL: "briefcase-outline",
    STUDENT_RELATION: "people-outline",
    ADMINISTRATIVE: "document-text-outline",
    COLLABORATION: "people-circle-outline",
    ATTENDANCE: "calendar-outline",
    PUNCTUALITY: "time-outline",
    OTHER: "ellipsis-horizontal-outline",
  };
  return icons[category] || "ellipse-outline";
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    TEACHING: "#3b82f6",
    DISCIPLINE: "#8b5cf6",
    COMMUNICATION: "#10b981",
    PROFESSIONAL: "#f59e0b",
    STUDENT_RELATION: "#ec4899",
    ADMINISTRATIVE: "#06b6d4",
    COLLABORATION: "#6366f1",
    ATTENDANCE: "#14b8a6",
    PUNCTUALITY: "#f97316",
    OTHER: "#64748b",
  };
  return colors[category] || "#64748b";
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

// ==================== MAIN SCREEN ====================

export default function NewEvaluationScreen() {
  const router = useRouter();
  const { teacherId } = useLocalSearchParams<{ teacherId: string }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [teacher, setTeacher] = useState<any>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [scores, setScores] = useState<Record<number, CriteriaScore>>({});

  // Form fields
  const [period, setPeriod] = useState("SEMESTER");
  const [term, setTerm] = useState("FIRST");
  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [goals, setGoals] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [principalNotes, setPrincipalNotes] = useState("");

  // ==================== DATA LOADING ====================

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);

      const [teacherRes, templatesRes] = await Promise.all([
        principalApi.getTeacherById(Number(teacherId)),
        principalApi.getEvaluationTemplates(),
      ]);

      if (teacherRes.success) {
        setTeacher(teacherRes.data);
      }

      if (templatesRes.success) {
        setTemplates(templatesRes.data);
        // Auto-select default template
        const defaultTemplate = templatesRes.data.find((t) => t.isDefault);
        if (defaultTemplate) {
          setSelectedTemplateId(defaultTemplate.id);
        } else if (templatesRes.data.length > 0) {
          setSelectedTemplateId(templatesRes.data[0].id);
        }
      }
    } catch (error) {
      console.error("Load initial data error:", error);
      Alert.alert("خطا", "خطا در بارگذاری اطلاعات");
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    if (teacherId) {
      loadInitialData();
    }
  }, [teacherId, loadInitialData]);

  // Load criteria when template changes
  useEffect(() => {
    const loadCriteria = async () => {
      if (!selectedTemplateId) return;

      try {
        const res =
          await principalApi.getEvaluationTemplateDetails(selectedTemplateId);
        if (res.success) {
          setCriteria(res.data.criteria || []);
          // Initialize scores
          const initialScores: Record<number, CriteriaScore> = {};
          (res.data.criteria || []).forEach((c) => {
            initialScores[c.id] = {
              criteriaId: c.id,
              score: 0,
              comment: "",
            };
          });
          setScores(initialScores);
        }
      } catch (error) {
        console.error("Load criteria error:", error);
      }
    };

    loadCriteria();
  }, [selectedTemplateId]);

  // ==================== HANDLERS ====================

  const handleScoreChange = (criteriaId: number, score: number) => {
    setScores((prev) => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        criteriaId,
        score,
        comment: prev[criteriaId]?.comment || "",
      },
    }));
  };

  const handleCommentChange = (criteriaId: number, comment: string) => {
    setScores((prev) => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        criteriaId,
        score: prev[criteriaId]?.score || 0,
        comment,
      },
    }));
  };

  const calculateProgress = () => {
    if (criteria.length === 0) return 0;
    const scored = criteria.filter(
      (c) => (scores[c.id]?.score || 0) > 0,
    ).length;
    return Math.round((scored / criteria.length) * 100);
  };

  const calculatePreviewScore = () => {
    if (criteria.length === 0) return { weighted: 0, max: 0, percentage: 0 };
    let weighted = 0;
    let max = 0;
    criteria.forEach((c) => {
      const score = scores[c.id]?.score || 0;
      weighted += score * c.weight;
      max += c.maxScore * c.weight;
    });
    return {
      weighted,
      max,
      percentage: max > 0 ? (weighted / max) * 100 : 0,
    };
  };

  const handleSubmit = async () => {
    if (!teacherId || !selectedTemplateId) {
      Alert.alert("خطا", "اطلاعات ناقص است");
      return;
    }

    // Validate all required criteria are scored
    const missingCriteria = criteria.filter(
      (c) => c.isRequired && (!scores[c.id] || scores[c.id].score === 0),
    );
    if (missingCriteria.length > 0) {
      Alert.alert(
        "توجه",
        `لطفاً ${missingCriteria.length} مورد از معیارهای الزامی را امتیازدهی کنید`,
      );
      return;
    }

    try {
      setSubmitting(true);

      // Step 1: Create the evaluation
      const createRes = await principalApi.createTeacherEvaluation({
        teacherId: Number(teacherId),
        templateId: selectedTemplateId,
        period,
        term,
      });

      if (!createRes.success || !createRes.data?.id) {
        throw new Error("خطا در ایجاد ارزیابی");
      }

      const evaluationId = createRes.data.id;

      // Step 2: Submit scores
      const scoresArray = criteria.map((c) => ({
        criteriaId: c.id,
        score: scores[c.id]?.score || 0,
        comment: scores[c.id]?.comment || undefined,
      }));

      const scoresRes = await principalApi.submitEvaluationScores(
        evaluationId,
        {
          scores: scoresArray,
          strengths: strengths || undefined,
          weaknesses: weaknesses || undefined,
          goals: goals || undefined,
          recommendations: recommendations || undefined,
          principalNotes: principalNotes || undefined,
        },
      );

      if (!scoresRes.success) {
        throw new Error("خطا در ذخیره امتیازات");
      }

      // Step 3: Finalize/submit the evaluation
      const submitRes =
        await principalApi.submitTeacherEvaluation(evaluationId);

      if (!submitRes.success) {
        throw new Error("خطا در نهایی‌سازی ارزیابی");
      }

      Alert.alert("موفقیت", "ارزیابی با موفقیت ثبت و نهایی شد", [
        {
          text: "مشاهده کارنامه",
          onPress: () => {
            router.replace({
              pathname: "/(principal)/teacher-evaluations/report/[id]",
              params: { id: String(evaluationId) },
            } as any);
          },
        },
        {
          text: "بازگشت",
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error("Submit evaluation error:", error);
      Alert.alert("خطا", error.message || "خطا در ثبت ارزیابی");
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== RENDER ====================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  const progress = calculateProgress();
  const preview = calculatePreviewScore();

  // Group criteria by category
  const criteriaByCategory: Record<string, Criteria[]> = {};
  criteria.forEach((c) => {
    if (!criteriaByCategory[c.category]) {
      criteriaByCategory[c.category] = [];
    }
    criteriaByCategory[c.category].push(c);
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ارزیابی معلم</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Teacher Info Card */}
        {teacher && (
          <View style={styles.teacherCard}>
            <View style={styles.teacherAvatar}>
              <Text style={styles.teacherAvatarText}>
                {teacher.User?.fullName?.charAt(0) || "?"}
              </Text>
            </View>
            <View style={styles.teacherInfo}>
              <Text style={styles.teacherName}>
                {teacher.User?.fullName || "نامشخص"}
              </Text>
              <Text style={styles.teacherMeta}>
                {teacher.specialization || "معلم"} •{" "}
                {teacher.teacherCode || "بدون کد"}
              </Text>
            </View>
          </View>
        )}

        {/* Progress Bar */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>پیشرفت ارزیابی</Text>
            <Text style={styles.progressValue}>{progress}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressSubtext}>
            {criteria.filter((c) => (scores[c.id]?.score || 0) > 0).length} از{" "}
            {criteria.length} معیار
          </Text>
        </View>

        {/* Template Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>قالب ارزیابی</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templatesScroll}
          >
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateChip,
                  selectedTemplateId === template.id &&
                    styles.templateChipActive,
                ]}
                onPress={() => setSelectedTemplateId(template.id)}
              >
                <Text
                  style={[
                    styles.templateChipText,
                    selectedTemplateId === template.id &&
                      styles.templateChipTextActive,
                  ]}
                >
                  {template.name}
                </Text>
                {template.isDefault && (
                  <Ionicons
                    name="star"
                    size={12}
                    color={
                      selectedTemplateId === template.id ? "#fff" : "#f59e0b"
                    }
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Period & Term */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>دوره ارزیابی</Text>
          <View style={styles.periodRow}>
            <View style={styles.periodField}>
              <Text style={styles.fieldLabel}>دوره</Text>
              <View style={styles.chipRow}>
                {["MONTHLY", "QUARTERLY", "SEMESTER", "ANNUAL"].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.chip, period === p && styles.chipActive]}
                    onPress={() => setPeriod(p)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        period === p && styles.chipTextActive,
                      ]}
                    >
                      {getPeriodLabelFarsi(p)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.periodField}>
            <Text style={styles.fieldLabel}>ترم</Text>
            <View style={styles.chipRow}>
              {[
                { key: "FIRST", label: "اول" },
                { key: "SECOND", label: "دوم" },
                { key: "THIRD", label: "سوم" },
              ].map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.chip, term === t.key && styles.chipActive]}
                  onPress={() => setTerm(t.key)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      term === t.key && styles.chipTextActive,
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Criteria by Category */}
        {Object.entries(criteriaByCategory).map(([category, items]) => (
          <View key={category} style={styles.section}>
            <View style={styles.categoryHeader}>
              <View
                style={[
                  styles.categoryIconBg,
                  { backgroundColor: getCategoryColor(category) + "20" },
                ]}
              >
                <Ionicons
                  name={getCategoryIcon(category)}
                  size={20}
                  color={getCategoryColor(category)}
                />
              </View>
              <Text style={styles.categoryTitle}>
                {getCategoryLabelFarsi(category)}
              </Text>
              <Text style={styles.categoryCount}>{items.length} معیار</Text>
            </View>

            {items.map((c) => {
              const currentScore = scores[c.id]?.score || 0;
              return (
                <View key={c.id} style={styles.criteriaCard}>
                  <View style={styles.criteriaHeader}>
                    <Text style={styles.criteriaName}>
                      {c.nameFarsi || c.name}
                    </Text>
                    {c.isRequired && (
                      <View style={styles.requiredBadge}>
                        <Text style={styles.requiredText}>الزامی</Text>
                      </View>
                    )}
                  </View>

                  {c.description && (
                    <Text style={styles.criteriaDescription}>
                      {c.description}
                    </Text>
                  )}

                  {/* Score Selection */}
                  <View style={styles.scoreRow}>
                    {[1, 2, 3, 4, 5].map((score) => (
                      <TouchableOpacity
                        key={score}
                        style={[
                          styles.scoreButton,
                          currentScore === score && {
                            backgroundColor: getCategoryColor(category),
                            borderColor: getCategoryColor(category),
                          },
                        ]}
                        onPress={() => handleScoreChange(c.id, score)}
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
                    <View style={styles.scoreLabels}>
                      <Text style={styles.scoreLabelText}>ضعیف</Text>
                      <Text style={styles.scoreLabelText}>عالی</Text>
                    </View>
                  </View>

                  {/* Comment */}
                  <TextInput
                    style={styles.commentInput}
                    placeholder="یادداشت (اختیاری)..."
                    placeholderTextColor="#94a3b8"
                    value={scores[c.id]?.comment || ""}
                    onChangeText={(text) => handleCommentChange(c.id, text)}
                    multiline
                    textAlign="right"
                  />
                </View>
              );
            })}
          </View>
        ))}

        {/* Live Preview */}
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>پیش‌نمایش امتیاز</Text>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>امتیاز وزنی:</Text>
            <Text style={styles.previewValue}>
              {Math.round(preview.weighted * 10) / 10} /{" "}
              {Math.round(preview.max)}
            </Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>درصد:</Text>
            <Text
              style={[
                styles.previewValue,
                {
                  color:
                    preview.percentage >= 80
                      ? "#10b981"
                      : preview.percentage >= 60
                        ? "#f59e0b"
                        : "#ef4444",
                },
              ]}
            >
              {Math.round(preview.percentage * 10) / 10}%
            </Text>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نظرات و توصیه‌ها</Text>

          <View style={styles.textAreaWrapper}>
            <Text style={styles.textAreaLabel}>نقاط قوت</Text>
            <TextInput
              style={styles.textArea}
              placeholder="نقاط قوت معلم..."
              placeholderTextColor="#94a3b8"
              value={strengths}
              onChangeText={setStrengths}
              multiline
              numberOfLines={3}
              textAlign="right"
            />
          </View>

          <View style={styles.textAreaWrapper}>
            <Text style={styles.textAreaLabel}>نقاط ضعف</Text>
            <TextInput
              style={styles.textArea}
              placeholder="نقاط ضعف معلم..."
              placeholderTextColor="#94a3b8"
              value={weaknesses}
              onChangeText={setWeaknesses}
              multiline
              numberOfLines={3}
              textAlign="right"
            />
          </View>

          <View style={styles.textAreaWrapper}>
            <Text style={styles.textAreaLabel}>اهداف</Text>
            <TextInput
              style={styles.textArea}
              placeholder="اهداف بهبود..."
              placeholderTextColor="#94a3b8"
              value={goals}
              onChangeText={setGoals}
              multiline
              numberOfLines={3}
              textAlign="right"
            />
          </View>

          <View style={styles.textAreaWrapper}>
            <Text style={styles.textAreaLabel}>توصیه‌ها</Text>
            <TextInput
              style={styles.textArea}
              placeholder="توصیه‌ها برای بهبود..."
              placeholderTextColor="#94a3b8"
              value={recommendations}
              onChangeText={setRecommendations}
              multiline
              numberOfLines={3}
              textAlign="right"
            />
          </View>

          <View style={styles.textAreaWrapper}>
            <Text style={styles.textAreaLabel}>یادداشت مدیر</Text>
            <TextInput
              style={styles.textArea}
              placeholder="یادداشت خصوصی مدیر..."
              placeholderTextColor="#94a3b8"
              value={principalNotes}
              onChangeText={setPrincipalNotes}
              multiline
              numberOfLines={3}
              textAlign="right"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            submitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.submitButtonText}>در حال ارسال...</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.submitButtonText}>
                ثبت و نهایی‌سازی ارزیابی
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  teacherCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  teacherAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  teacherAvatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#3b82f6",
    fontFamily: "VazirBold",
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  teacherMeta: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  progressCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: "#475569",
    fontFamily: "Vazir",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8b5cf6",
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 6,
    fontFamily: "Vazir",
  },
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
  templatesScroll: {
    gap: 8,
    paddingRight: 8,
  },
  templateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  templateChipActive: {
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
  },
  templateChipText: {
    fontSize: 13,
    color: "#475569",
    fontFamily: "Vazir",
  },
  templateChipTextActive: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "VazirBold",
  },
  periodRow: {
    marginBottom: 12,
  },
  periodField: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 8,
    fontFamily: "Vazir",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chipActive: {
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
  },
  chipText: {
    fontSize: 12,
    color: "#475569",
    fontFamily: "Vazir",
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "VazirBold",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 8,
  },
  categoryIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTitle: {
    flex: 1,
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
    alignItems: "center",
    marginBottom: 6,
  },
  criteriaName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  requiredBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  requiredText: {
    fontSize: 10,
    color: "#ef4444",
    fontFamily: "VazirBold",
  },
  criteriaDescription: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 10,
    fontFamily: "Vazir",
  },
  scoreRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    position: "relative",
    paddingBottom: 20,
  },
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
  scoreButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    fontFamily: "VazirBold",
  },
  scoreButtonTextActive: {
    color: "#fff",
  },
  scoreLabels: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scoreLabelText: {
    fontSize: 10,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
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
  previewCard: {
    backgroundColor: "#f3e8ff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e9d5ff",
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7c3aed",
    marginBottom: 10,
    fontFamily: "VazirBold",
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  previewLabel: {
    fontSize: 13,
    color: "#7c3aed",
    fontFamily: "Vazir",
  },
  previewValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5b21b6",
    fontFamily: "VazirBold",
  },
  textAreaWrapper: {
    marginBottom: 12,
  },
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
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
});
