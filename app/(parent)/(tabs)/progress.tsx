// app/(parent)/(tabs)/progress.tsx
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  Child,
  parentAnalyticsApi,
  StudentAnalyticsResponse,
  SubjectAnalytics,
} from "@/src/config/parentAnalyticsApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

// Helper function to get color based on score
const getScoreColor = (score: number | null): string => {
  if (score === null) return Colors.textSecondary;
  if (score >= 80) return Colors.success;
  if (score >= 60) return Colors.warning;
  return Colors.danger;
};

// Helper function to get risk color
const getRiskColor = (level: string): string => {
  switch (level) {
    case "LOW":
      return Colors.success;
    case "MEDIUM":
      return Colors.warning;
    case "HIGH":
      return Colors.danger;
    case "CRITICAL":
      return "#DC2626";
    default:
      return Colors.textSecondary;
  }
};

// Helper function to get risk label
const getRiskLabel = (level: string): string => {
  switch (level) {
    case "LOW":
      return "کم";
    case "MEDIUM":
      return "متوسط";
    case "HIGH":
      return "بالا";
    case "CRITICAL":
      return "بحرانی";
    default:
      return "نامشخص";
  }
};

// Helper function to get classification color
const getClassificationColor = (classification: string): string => {
  switch (classification) {
    case "STRONG":
      return Colors.success;
    case "AVERAGE":
      return Colors.warning;
    case "WEAK":
      return "#F59E0B";
    case "CRITICAL":
      return Colors.danger;
    default:
      return Colors.textSecondary;
  }
};

// Helper function to get classification label
const getClassificationLabel = (classification: string): string => {
  switch (classification) {
    case "STRONG":
      return "قوی";
    case "AVERAGE":
      return "متوسط";
    case "WEAK":
      return "ضعیف";
    case "CRITICAL":
      return "بحرانی";
    default:
      return "بدون داده";
  }
};

// Helper function to get confidence color
const getConfidenceColor = (confidence: string): string => {
  switch (confidence) {
    case "HIGH":
      return Colors.success;
    case "MEDIUM":
      return Colors.warning;
    default:
      return Colors.textSecondary;
  }
};

// Helper function to get overall status color
const getOverallStatusColor = (status: string): string => {
  switch (status) {
    case "EXCELLENT":
      return Colors.success;
    case "GOOD":
      return Colors.primary;
    case "AVERAGE":
      return Colors.warning;
    case "NEEDS_ATTENTION":
      return Colors.danger;
    default:
      return Colors.textSecondary;
  }
};

// Helper function to get overall status label
const getOverallStatusLabel = (status: string): string => {
  switch (status) {
    case "EXCELLENT":
      return "عالی";
    case "GOOD":
      return "خوب";
    case "AVERAGE":
      return "متوسط";
    case "NEEDS_ATTENTION":
      return "نیاز به توجه";
    default:
      return "نامشخص";
  }
};

// Helper function to get overall status icon
const getOverallStatusIcon = (status: string): string => {
  switch (status) {
    case "EXCELLENT":
      return "star";
    case "GOOD":
      return "checkmark-circle";
    case "AVERAGE":
      return "remove-circle";
    case "NEEDS_ATTENTION":
      return "alert-circle";
    default:
      return "help-circle";
  }
};

// Helper function to get exam readiness status
const getExamReadinessStatus = (
  score: number,
): { label: string; color: string } => {
  if (score >= 90) return { label: "کاملاً آماده", color: Colors.success };
  if (score >= 80) return { label: "آماده", color: Colors.success };
  if (score >= 70) return { label: "تقریباً آماده", color: Colors.warning };
  if (score >= 60) return { label: "نیاز به تمرین", color: Colors.warning };
  return { label: "نیاز به توجه جدی", color: Colors.danger };
};

export default function ChildProgress() {
  const router = useRouter();
  const { user: _user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] =
    useState<StudentAnalyticsResponse | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [showChildSelector, setShowChildSelector] = useState(false);

  // ============================================================
  // DEBUG: Load children list with full logging
  // ============================================================
  const loadChildren = useCallback(async () => {
    try {
      console.log("🔍 [DEBUG] ===== loadChildren START =====");

      const response = await parentAnalyticsApi.getChildren();

      console.log("🔍 [DEBUG] Response success:", response.success);
      console.log(
        "🔍 [DEBUG] Response data:",
        JSON.stringify(response.data, null, 2),
      );

      if (response.success && response.data) {
        console.log(
          "🔍 [DEBUG] Children count:",
          response.data.children.length,
        );
        console.log(
          "🔍 [DEBUG] Children raw:",
          JSON.stringify(response.data.children, null, 2),
        );

        // Log each child's details
        response.data.children.forEach((child, index) => {
          console.log(`🔍 [DEBUG] Child ${index + 1}:`, {
            id: child.id,
            name: child.name,
            class: child.class,
            classId: child.classId,
            profileImage: child.profileImage,
          });
        });

        // ✅ Set children state
        setChildren(response.data.children);

        // ✅ Handle active child selection
        const storedId = await parentAnalyticsApi.getStoredActiveChildId();
        console.log("🔍 [DEBUG] Stored active child ID:", storedId);

        if (storedId && response.data.children.some((c) => c.id === storedId)) {
          console.log("🔍 [DEBUG] ✅ Using stored ID:", storedId);
          setSelectedChildId(storedId);
        } else if (response.data.children.length > 0) {
          console.log(
            "🔍 [DEBUG] ✅ Using first child ID:",
            response.data.children[0].id,
          );
          console.log(
            "🔍 [DEBUG] ✅ First child name:",
            response.data.children[0].name,
          );
          setSelectedChildId(response.data.children[0].id);
          await parentAnalyticsApi.setActiveChild(response.data.children[0].id);
        } else {
          console.log("🔍 [DEBUG] ⚠️ No children in response");
        }
      } else {
        console.log("🔍 [DEBUG] ❌ No children found or response failed");
        console.log("🔍 [DEBUG] Response:", JSON.stringify(response, null, 2));
      }
      console.log("🔍 [DEBUG] ===== loadChildren END =====");
    } catch (error) {
      console.error("❌ Error loading children:", error);
    }
  }, []);

  // ============================================================
  // DEBUG: Load analytics with full logging
  // ============================================================
  const loadAnalytics = useCallback(async () => {
    if (!selectedChildId) {
      console.log("🔍 [DEBUG] No selectedChildId, skipping analytics load");
      setLoading(false);
      return;
    }

    console.log(
      `🔍 [DEBUG] ===== loadAnalytics START for child ${selectedChildId} =====`,
    );

    try {
      setLoading(true);
      const response =
        await parentAnalyticsApi.getStudentAnalytics(selectedChildId);

      console.log("🔍 [DEBUG] Analytics response success:", response.success);
      console.log(
        "🔍 [DEBUG] Analytics response data:",
        JSON.stringify(response.data, null, 2),
      );

      if (response.success && response.data) {
        console.log(
          `🔍 [DEBUG] ✅ Student name from analytics: "${response.data.studentName}"`,
        );
        console.log(
          `🔍 [DEBUG] ✅ Student class: "${response.data.className}"`,
        );
        console.log(
          `🔍 [DEBUG] ✅ Has analytics: ${response.data.hasAnalytics}`,
        );
        setAnalyticsData(response.data);
      } else {
        console.log("🔍 [DEBUG] ❌ No analytics data received");
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error("❌ Error loading analytics:", error);
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
    console.log("🔍 [DEBUG] ===== loadAnalytics END =====");
  }, [selectedChildId]);

  // ============================================================
  // Effects
  // ============================================================
  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  useEffect(() => {
    if (selectedChildId) {
      loadAnalytics();
    }
  }, [selectedChildId, loadAnalytics]);

  // ============================================================
  // Handlers
  // ============================================================
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const handleChildSelect = async (childId: number) => {
    console.log(`🔍 [DEBUG] Child selected: ${childId}`);
    setSelectedChildId(childId);
    await parentAnalyticsApi.setActiveChild(childId);
    setShowChildSelector(false);
  };

  // ============================================================
  // DEBUG: Log selected child
  // ============================================================
  const selectedChild = children.find((c) => c.id === selectedChildId);

  console.log("🔍 [DEBUG] Selected child:", selectedChild);
  console.log("🔍 [DEBUG] Selected child name:", selectedChild?.name);
  console.log(
    "🔍 [DEBUG] All children names:",
    children.map((c) => ({ id: c.id, name: c.name })),
  );
  console.log("🔍 [DEBUG] children.length:", children.length);

  // ============================================================
  // Loading State
  // ============================================================
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </SafeAreaView>
    );
  }

  // ============================================================
  // Empty State
  // ============================================================
  if (children.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="people-outline"
            size={64}
            color={Colors.textSecondary}
          />
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

  const data = analyticsData;
  const hasData = data?.hasAnalytics || false;

  // ============================================================
  // Calculate derived data
  // ============================================================
  const calculateStrengthsAndWeaknesses = (subjects: SubjectAnalytics[]) => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    subjects.forEach((subject) => {
      if (subject.hasData && subject.currentAverage !== null) {
        if (subject.currentAverage >= 80) {
          strengths.push(subject.subjectName);
        } else if (subject.currentAverage < 60) {
          weaknesses.push(subject.subjectName);
        }
      }
    });

    return { strengths, weaknesses };
  };

  const generateTeacherInsight = (data: StudentAnalyticsResponse): string => {
    const insights: string[] = [];

    if (data.trend.hasData) {
      if (data.trend.direction === "IMPROVING") {
        insights.push("دانش‌آموز در چند هفته اخیر روند مثبتی داشته است.");
      } else if (data.trend.direction === "DECLINING") {
        insights.push("توجه به روند نزولی عملکرد دانش‌آموز ضروری است.");
      } else {
        insights.push("عملکرد دانش‌آموز در ماه‌های اخیر ثابت بوده است.");
      }
    }

    if (data.attendance.score !== null) {
      if (data.attendance.score >= 90) {
        insights.push("حضور منظم دانش‌آموز در کلاس قابل تقدیر است.");
      } else if (data.attendance.score < 70) {
        insights.push("بهبود حضور دانش‌آموز در کلاس توصیه می‌شود.");
      }
    }

    const { strengths, weaknesses } = calculateStrengthsAndWeaknesses(
      data.subjects,
    );
    if (strengths.length > 0) {
      insights.push(
        `عملکرد در مضمون ${strengths.join(" و ")} بالاتر از میانگین صنف است.`,
      );
    }
    if (weaknesses.length > 0) {
      insights.push(
        `برای بهبود بیشتر توصیه می‌شود روی مضمون ${weaknesses.join(" و ")} تمرکز شود.`,
      );
    }

    if (data.growth.score !== null && data.growth.score > 0) {
      insights.push(
        `دانش‌آموز ${Math.abs(data.growth.score)} نمره رشد داشته است.`,
      );
    }

    if (insights.length === 0) {
      insights.push(
        "دانش‌آموز در مسیر درست قرار دارد. ادامه تلاش‌ها توصیه می‌شود.",
      );
    }

    return insights.join(" ");
  };

  const getComparison = (data: StudentAnalyticsResponse) => {
    const studentScore = data.readiness.score || 0;
    const classAvg = data.behaviorMetrics.classAverage || 0;
    const schoolAvg = data.behaviorMetrics.schoolAverage || 0;

    const classDiff = studentScore - classAvg;
    const schoolDiff = studentScore - schoolAvg;

    return {
      studentAverage: studentScore,
      classAverage: classAvg,
      schoolAverage: schoolAvg,
      classDiff,
      schoolDiff,
      classDiffLabel:
        classDiff > 0 ? "بالاتر" : classDiff < 0 ? "پایین‌تر" : "برابر",
      schoolDiffLabel:
        schoolDiff > 0 ? "بالاتر" : schoolDiff < 0 ? "پایین‌تر" : "برابر",
    };
  };

  const getExamReadiness = (data: StudentAnalyticsResponse) => {
    const halfYearScore = data.readiness.components.halfYearExams;
    const finalScore = data.readiness.components.halfYearExams;

    return {
      halfYear: {
        score: halfYearScore !== null ? halfYearScore : 0,
        status:
          halfYearScore !== null
            ? getExamReadinessStatus(halfYearScore)
            : { label: "بدون داده", color: Colors.textSecondary },
      },
      finalExam: {
        score: finalScore !== null ? finalScore : 0,
        status:
          finalScore !== null
            ? getExamReadinessStatus(finalScore)
            : { label: "بدون داده", color: Colors.textSecondary },
      },
    };
  };

  const getOverallStatus = (data: StudentAnalyticsResponse) => {
    const score = data.readiness.score;
    if (score === null) {
      return {
        label: "NEEDS_ATTENTION",
        message: "اطلاعات کافی برای ارزیابی وجود ندارد",
      };
    }

    if (score >= 85) {
      return { label: "EXCELLENT", message: "عملکرد دانش‌آموز عالی است" };
    } else if (score >= 75) {
      return { label: "GOOD", message: "عملکرد دانش‌آموز خوب است" };
    } else if (score >= 60) {
      return { label: "AVERAGE", message: "عملکرد دانش‌آموز متوسط است" };
    } else {
      return {
        label: "NEEDS_ATTENTION",
        message: "عملکرد دانش‌آموز نیاز به توجه دارد",
      };
    }
  };

  const getGrowthSummary = (data: StudentAnalyticsResponse) => {
    const current = data.readiness.score || 0;
    const subjectsWithData = data.subjects.filter(
      (s) => s.hasData && s.previousAverage !== null,
    );
    const previousAvg =
      subjectsWithData.length > 0
        ? subjectsWithData.reduce(
            (sum, s) => sum + (s.previousAverage || 0),
            0,
          ) / subjectsWithData.length
        : current - 10;

    const change = current - previousAvg;
    const percentage = previousAvg > 0 ? (change / previousAvg) * 100 : 0;

    return {
      previousAverage: Math.round(previousAvg),
      currentAverage: Math.round(current),
      change: Math.round(change),
      percentage: Math.round(percentage),
    };
  };

  // ============================================================
  // No Data State
  // ============================================================
  if (!hasData || !data) {
    // ✅ FIXED: Prioritize analytics name
    const displayName =
      data?.studentName || selectedChild?.name || "انتخاب فرزند";
    console.log(`🔍 [DEBUG] No data state - Display name: "${displayName}"`);
    console.log(`🔍 [DEBUG] selectedChild:`, selectedChild);

    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.childSelectorButton}
            onPress={() => setShowChildSelector(true)}
          >
            <Text style={styles.childSelectorText}>{displayName}</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.subtitle}>{selectedChild?.class || ""}</Text>
        </View>
        <View style={styles.emptyDataContainer}>
          <Ionicons
            name="document-text-outline"
            size={64}
            color={Colors.textSecondary}
          />
          <Text style={styles.emptyDataTitle}>اطلاعاتی موجود نیست</Text>
          <Text style={styles.emptyDataSubtitle}>
            هنوز اطلاعات کافی برای این دانش‌آموز ثبت نشده است.
            {"\n"}پس از تکمیل ارزیابی‌ها، اطلاعات اینجا نمایش داده می‌شود.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================
  // Calculate all derived data
  // ============================================================
  const overallStatus = getOverallStatus(data);
  const growthSummary = getGrowthSummary(data);
  const { strengths, weaknesses } = calculateStrengthsAndWeaknesses(
    data.subjects,
  );
  const teacherInsight = generateTeacherInsight(data);
  const examReadiness = getExamReadiness(data);
  const comparison = getComparison(data);

  // ✅ FIXED: Prioritize analytics name (THIS IS THE KEY CHANGE!)
  const displayName =
    data?.studentName || selectedChild?.name || "انتخاب فرزند";
  const displayClass = data?.className || selectedChild?.class || "";

  console.log(`🔍 [DEBUG] Main render - Display name: "${displayName}"`);
  console.log(`🔍 [DEBUG] selectedChild.name: "${selectedChild?.name}"`);
  console.log(`🔍 [DEBUG] data.studentName: "${data?.studentName}"`);

  // ============================================================
  // Main Render
  // ============================================================
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header with Child Selector - USING FIXED DISPLAY NAME */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.childSelectorButton}
            onPress={() => setShowChildSelector(true)}
          >
            <Text style={styles.childSelectorText}>{displayName}</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.subtitle}>{displayClass}</Text>
        </View>

        {/* 1. Overall Student Status Card */}
        <View
          style={[
            styles.overallStatusCard,
            { borderColor: getOverallStatusColor(overallStatus.label) },
          ]}
        >
          <View style={styles.overallStatusHeader}>
            <View style={styles.overallStatusIconContainer}>
              <Ionicons
                name={getOverallStatusIcon(overallStatus.label) as any}
                size={24}
                color={getOverallStatusColor(overallStatus.label)}
              />
            </View>
            <View style={styles.overallStatusTextContainer}>
              <Text style={styles.overallStatusTitle}>وضعیت کلی دانش‌آموز</Text>
              <Text
                style={[
                  styles.overallStatusLabel,
                  { color: getOverallStatusColor(overallStatus.label) },
                ]}
              >
                {getOverallStatusLabel(overallStatus.label)}
              </Text>
            </View>
          </View>
          <Text style={styles.overallStatusMessage}>
            {overallStatus.message}
          </Text>
          <View style={styles.overallStatusStats}>
            <View style={styles.overallStatusStat}>
              <Text style={styles.overallStatusStatValue}>
                {data.rankings.class.rank} / {data.rankings.class.total}
              </Text>
              <Text style={styles.overallStatusStatLabel}>رتبه صنف</Text>
            </View>
            <View style={styles.overallStatusStatDivider} />
            <View style={styles.overallStatusStat}>
              <Text style={styles.overallStatusStatValue}>
                {data.readiness.score !== null
                  ? Math.round(data.readiness.score)
                  : "—"}
                %
              </Text>
              <Text style={styles.overallStatusStatLabel}>آمادگی امتحان</Text>
            </View>
            <View style={styles.overallStatusStatDivider} />
            <View style={styles.overallStatusStat}>
              <Text
                style={[
                  styles.overallStatusStatValue,
                  {
                    color:
                      data.trend.direction === "IMPROVING"
                        ? Colors.success
                        : Colors.danger,
                  },
                ]}
              >
                {data.trend.direction === "IMPROVING"
                  ? "در حال بهبود"
                  : data.trend.direction === "DECLINING"
                    ? "در حال کاهش"
                    : "ثابت"}
              </Text>
              <Text style={styles.overallStatusStatLabel}>روند</Text>
            </View>
          </View>
        </View>

        {/* 2. Growth Since Last Month Card */}
        <View style={styles.growthCard}>
          <View style={styles.growthHeader}>
            <View style={styles.growthIconContainer}>
              <Ionicons
                name={
                  growthSummary.change >= 0 ? "trending-up" : "trending-down"
                }
                size={24}
                color={
                  growthSummary.change >= 0 ? Colors.success : Colors.danger
                }
              />
            </View>
            <Text style={styles.growthTitle}>پیشرفت نسبت به ماه گذشته</Text>
          </View>
          <View style={styles.growthScoreContainer}>
            <Text style={styles.growthPrevious}>
              {growthSummary.previousAverage}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={Colors.textSecondary}
            />
            <Text style={styles.growthCurrent}>
              {growthSummary.currentAverage}
            </Text>
          </View>
          <View style={styles.growthChangeContainer}>
            <Text
              style={[
                styles.growthChange,
                {
                  color:
                    growthSummary.change >= 0 ? Colors.success : Colors.danger,
                },
              ]}
            >
              {growthSummary.change >= 0 ? "+" : ""}
              {growthSummary.change} نمره
            </Text>
            <Text
              style={[
                styles.growthPercentage,
                {
                  color:
                    growthSummary.percentage >= 0
                      ? Colors.success
                      : Colors.danger,
                },
              ]}
            >
              {growthSummary.percentage >= 0 ? "+" : ""}
              {growthSummary.percentage}%
            </Text>
          </View>
        </View>

        {/* 3. Readiness Score Card */}
        <View style={styles.readinessCard}>
          <View style={styles.readinessHeader}>
            <Text style={styles.readinessTitle}>نمره آمادگی</Text>
            <View style={styles.confidenceBadge}>
              <View
                style={[
                  styles.confidenceDot,
                  {
                    backgroundColor: getConfidenceColor(
                      data.readiness.confidence,
                    ),
                  },
                ]}
              />
              <Text style={styles.confidenceText}>
                {data.readiness.confidence === "HIGH"
                  ? "اطمینان بالا"
                  : data.readiness.confidence === "MEDIUM"
                    ? "اطمینان متوسط"
                    : "اطمینان کم"}
              </Text>
            </View>
          </View>
          <View style={styles.readinessScoreContainer}>
            <Text
              style={[
                styles.readinessScore,
                { color: getScoreColor(data.readiness.score) },
              ]}
            >
              {data.readiness.score !== null
                ? Math.round(data.readiness.score)
                : "—"}
            </Text>
            <Text style={styles.readinessMax}>/ 100</Text>
          </View>
          <View style={styles.readinessStatus}>
            <Text style={styles.readinessStatusLabel}>
              {data.readiness.score !== null && data.readiness.score >= 70
                ? "آماده برای امتحان"
                : "نیاز به آمادگی بیشتر"}
            </Text>
          </View>
          <View style={styles.readinessFactors}>
            <Text style={styles.readinessFactorsTitle}>تحلیل بر اساس:</Text>
            <View style={styles.readinessFactorsList}>
              {data.readiness.components.attendance !== null && (
                <View style={styles.readinessFactor}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={Colors.success}
                  />
                  <Text style={styles.readinessFactorText}>حضور</Text>
                </View>
              )}
              {data.readiness.components.weeklyAssessments !== null && (
                <View style={styles.readinessFactor}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={Colors.success}
                  />
                  <Text style={styles.readinessFactorText}>ارزیابی هفتگی</Text>
                </View>
              )}
              {data.readiness.components.monthlyExams !== null && (
                <View style={styles.readinessFactor}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={Colors.success}
                  />
                  <Text style={styles.readinessFactorText}>
                    امتحانات ماهانه
                  </Text>
                </View>
              )}
              {data.readiness.components.halfYearExams !== null && (
                <View style={styles.readinessFactor}>
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={Colors.success}
                  />
                  <Text style={styles.readinessFactorText}>
                    امتحانات نیم‌سال
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.readinessMeta}>
            <Text style={styles.readinessMetaText}>
              تکمیل داده: {data.readiness.dataCompleteness}%
            </Text>
            <View style={styles.trendBadge}>
              <Ionicons
                name={
                  data.trend.direction === "IMPROVING"
                    ? "trending-up"
                    : data.trend.direction === "DECLINING"
                      ? "trending-down"
                      : "remove"
                }
                size={16}
                color={
                  data.trend.direction === "IMPROVING"
                    ? Colors.success
                    : data.trend.direction === "DECLINING"
                      ? Colors.danger
                      : Colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.trendText,
                  {
                    color:
                      data.trend.direction === "IMPROVING"
                        ? Colors.success
                        : data.trend.direction === "DECLINING"
                          ? Colors.danger
                          : Colors.textSecondary,
                  },
                ]}
              >
                {data.trend.direction === "IMPROVING"
                  ? "در حال بهبود"
                  : data.trend.direction === "DECLINING"
                    ? "در حال کاهش"
                    : "ثابت"}
              </Text>
            </View>
          </View>
        </View>

        {/* 4. Rankings Card */}
        <View style={styles.rankingsCard}>
          <View style={styles.rankingItem}>
            <Text style={styles.rankingLabel}>رتبه در صنف</Text>
            <Text style={styles.rankingValue}>
              {data.rankings.class.rank} / {data.rankings.class.total}
            </Text>
          </View>
          <View style={styles.rankingDivider} />
          <View style={styles.rankingItem}>
            <Text style={styles.rankingLabel}>رتبه در مکتب</Text>
            <Text style={styles.rankingValue}>
              {data.rankings.school.rank} / {data.rankings.school.total}
            </Text>
          </View>
          <View style={styles.rankingDivider} />
          <View style={styles.rankingItem}>
            <Text style={styles.rankingLabel}>درصد برتر</Text>
            <Text style={[styles.rankingValue, { fontSize: 14 }]}>
              {data.rankings.percentile.label}
            </Text>
          </View>
        </View>

        {/* 5. Comparison with Class */}
        <View style={styles.comparisonCard}>
          <View style={styles.comparisonHeader}>
            <Ionicons name="stats-chart" size={20} color={Colors.primary} />
            <Text style={styles.comparisonTitle}>مقایسه با صنف</Text>
          </View>
          <View style={styles.comparisonBars}>
            <View style={styles.comparisonBarItem}>
              <View style={styles.comparisonBarLabelContainer}>
                <Text style={styles.comparisonBarLabel}>دانش‌آموز</Text>
                <Text style={styles.comparisonBarValue}>
                  {Math.round(comparison.studentAverage)}
                </Text>
              </View>
              <View style={styles.comparisonBarTrack}>
                <View
                  style={[
                    styles.comparisonBarFill,
                    {
                      width: `${Math.min(100, comparison.studentAverage)}%`,
                      backgroundColor: Colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.comparisonBarItem}>
              <View style={styles.comparisonBarLabelContainer}>
                <Text style={styles.comparisonBarLabel}>میانگین صنف</Text>
                <Text style={styles.comparisonBarValue}>
                  {Math.round(comparison.classAverage)}
                </Text>
              </View>
              <View style={styles.comparisonBarTrack}>
                <View
                  style={[
                    styles.comparisonBarFill,
                    {
                      width: `${Math.min(100, comparison.classAverage)}%`,
                      backgroundColor: Colors.textSecondary,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.comparisonBarItem}>
              <View style={styles.comparisonBarLabelContainer}>
                <Text style={styles.comparisonBarLabel}>میانگین مکتب</Text>
                <Text style={styles.comparisonBarValue}>
                  {Math.round(comparison.schoolAverage)}
                </Text>
              </View>
              <View style={styles.comparisonBarTrack}>
                <View
                  style={[
                    styles.comparisonBarFill,
                    {
                      width: `${Math.min(100, comparison.schoolAverage)}%`,
                      backgroundColor: Colors.textSecondary,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
          <View style={styles.comparisonDiff}>
            <Text
              style={[
                styles.comparisonDiffText,
                {
                  color:
                    comparison.classDiff >= 0 ? Colors.success : Colors.danger,
                },
              ]}
            >
              {Math.abs(comparison.classDiff)} {comparison.classDiffLabel} از
              میانگین صنف
            </Text>
          </View>
        </View>

        {/* 6. Risk Card */}
        <View style={styles.riskCard}>
          <View style={styles.riskHeader}>
            <Text style={styles.riskTitle}>وضعیت ریسک</Text>
            <View
              style={[
                styles.riskBadge,
                { backgroundColor: getRiskColor(data.risk.level) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.riskBadgeText,
                  { color: getRiskColor(data.risk.level) },
                ]}
              >
                {getRiskLabel(data.risk.level)}
              </Text>
            </View>
          </View>
          {data.risk.factors.length > 0 && (
            <View style={styles.riskFactors}>
              {data.risk.factors.map((factor: string, index: number) => (
                <View key={index} style={styles.riskFactorItem}>
                  <Ionicons
                    name="warning-outline"
                    size={16}
                    color={Colors.danger}
                  />
                  <Text style={styles.riskFactorText}>{factor}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 7. Readiness Components */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>جزئیات نمرات</Text>
          <View style={styles.componentsGrid}>
            {Object.entries(data.readiness.components).map(([key, value]) => (
              <View key={key} style={styles.componentItem}>
                <View style={styles.componentHeader}>
                  <Text style={styles.componentLabel}>
                    {key === "attendance"
                      ? "حضور"
                      : key === "assignments"
                        ? "کارخانگی"
                        : key === "weeklyAssessments"
                          ? "ارزیابی هفتگی"
                          : key === "monthlyExams"
                            ? "امتحانات ماهانه"
                            : key === "halfYearExams"
                              ? "امتحانات نیم‌سال"
                              : key === "growth"
                                ? "رشد"
                                : key}
                  </Text>
                  <Text
                    style={[
                      styles.componentValue,
                      { color: getScoreColor(value) },
                    ]}
                  >
                    {value !== null ? Math.round(value) : "—"}
                  </Text>
                </View>
                <View style={styles.componentBar}>
                  <View
                    style={[
                      styles.componentBarFill,
                      {
                        width:
                          value !== null ? `${Math.min(100, value)}%` : "0%",
                        backgroundColor: getScoreColor(value),
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 8. Subject Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>عملکرد دروس</Text>
          {data.subjects.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                اطلاعاتی برای نمایش وجود ندارد
              </Text>
            </View>
          ) : (
            data.subjects.map((subject: SubjectAnalytics, index: number) => (
              <View key={index} style={styles.subjectCard}>
                <View style={styles.subjectHeader}>
                  <View style={styles.subjectNameContainer}>
                    <View
                      style={[
                        styles.colorIndicator,
                        {
                          backgroundColor: getClassificationColor(
                            subject.classification,
                          ),
                        },
                      ]}
                    />
                    <Text style={styles.subjectName}>
                      {subject.subjectName}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.classificationBadge,
                      {
                        backgroundColor:
                          getClassificationColor(subject.classification) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.classificationText,
                        {
                          color: getClassificationColor(subject.classification),
                        },
                      ]}
                    >
                      {getClassificationLabel(subject.classification)}
                    </Text>
                  </View>
                </View>
                <View style={styles.subjectStats}>
                  <View style={styles.subjectStat}>
                    <Text style={styles.subjectStatLabel}>نمره فعلی</Text>
                    <Text
                      style={[
                        styles.subjectStatValue,
                        { color: getScoreColor(subject.currentAverage) },
                      ]}
                    >
                      {subject.currentAverage !== null
                        ? Math.round(subject.currentAverage)
                        : "—"}
                    </Text>
                  </View>
                  <View style={styles.subjectStat}>
                    <Text style={styles.subjectStatLabel}>نمره صنف</Text>
                    <Text style={styles.subjectStatValue}>
                      {subject.classAverage !== null
                        ? Math.round(subject.classAverage)
                        : "—"}
                    </Text>
                  </View>
                  <View style={styles.subjectStat}>
                    <Text style={styles.subjectStatLabel}>رشد</Text>
                    <Text
                      style={[
                        styles.subjectStatValue,
                        {
                          color:
                            subject.growth !== null && subject.growth > 0
                              ? Colors.success
                              : Colors.textSecondary,
                        },
                      ]}
                    >
                      {subject.growth !== null
                        ? (subject.growth > 0 ? "+" : "") +
                          Math.round(subject.growth)
                        : "—"}
                    </Text>
                  </View>
                </View>
                <View style={styles.subjectProgress}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width:
                            subject.currentAverage !== null
                              ? `${Math.min(100, subject.currentAverage)}%`
                              : "0%",
                          backgroundColor: getClassificationColor(
                            subject.classification,
                          ),
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.subjectPercent}>
                    {subject.currentAverage !== null
                      ? Math.round(subject.currentAverage)
                      : "—"}
                    %
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* 9. Strengths & Weaknesses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نقاط قوت و ضعف</Text>
          <View style={styles.strengthWeaknessContainer}>
            {strengths.length > 0 && (
              <View style={styles.strengthSection}>
                <View style={styles.strengthHeader}>
                  <Ionicons
                    name="bulb-outline"
                    size={20}
                    color={Colors.success}
                  />
                  <Text style={styles.strengthTitle}>نقاط قوت</Text>
                </View>
                {strengths.map((subject, index) => (
                  <View key={index} style={styles.strengthItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={Colors.success}
                    />
                    <Text style={styles.strengthText}>{subject}</Text>
                  </View>
                ))}
              </View>
            )}
            {weaknesses.length > 0 && (
              <View style={styles.weaknessSection}>
                <View style={styles.weaknessHeader}>
                  <Ionicons
                    name="warning-outline"
                    size={20}
                    color={Colors.danger}
                  />
                  <Text style={styles.weaknessTitle}>نیاز به توجه</Text>
                </View>
                {weaknesses.map((subject, index) => (
                  <View key={index} style={styles.weaknessItem}>
                    <Ionicons
                      name="close-circle"
                      size={16}
                      color={Colors.danger}
                    />
                    <Text style={styles.weaknessText}>{subject}</Text>
                  </View>
                ))}
              </View>
            )}
            {strengths.length === 0 && weaknesses.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  اطلاعات کافی برای تحلیل وجود ندارد
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 10. AI Teacher Insight */}
        <View style={styles.section}>
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View style={styles.insightIconContainer}>
                <Ionicons
                  name="bulb-outline"
                  size={24}
                  color={Colors.warning}
                />
              </View>
              <Text style={styles.insightTitle}>تحلیل معلم</Text>
            </View>
            <Text style={styles.insightText}>{teacherInsight}</Text>
          </View>
        </View>

        {/* 11. Exam Readiness */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>آمادگی امتحان</Text>
          <View style={styles.examReadinessContainer}>
            <View style={styles.examReadinessItem}>
              <Text style={styles.examReadinessLabel}>نیم‌سال</Text>
              <Text style={styles.examReadinessScore}>
                {examReadiness.halfYear.score > 0
                  ? Math.round(examReadiness.halfYear.score)
                  : "—"}
                %
              </Text>
              <View
                style={[
                  styles.examReadinessStatus,
                  {
                    backgroundColor: examReadiness.halfYear.status.color + "20",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.examReadinessStatusText,
                    { color: examReadiness.halfYear.status.color },
                  ]}
                >
                  {examReadiness.halfYear.status.label}
                </Text>
              </View>
            </View>
            <View style={styles.examReadinessDivider} />
            <View style={styles.examReadinessItem}>
              <Text style={styles.examReadinessLabel}>امتحان نهایی</Text>
              <Text style={styles.examReadinessScore}>
                {examReadiness.finalExam.score > 0
                  ? Math.round(examReadiness.finalExam.score)
                  : "—"}
                %
              </Text>
              <View
                style={[
                  styles.examReadinessStatus,
                  {
                    backgroundColor:
                      examReadiness.finalExam.status.color + "20",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.examReadinessStatusText,
                    { color: examReadiness.finalExam.status.color },
                  ]}
                >
                  {examReadiness.finalExam.status.label}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 12. Predicted Final Score */}
        {data.predictedFinal.min !== null &&
          data.predictedFinal.max !== null && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>پیش‌بینی نمره نهایی</Text>
              <View style={styles.predictionCard}>
                <Text style={styles.predictionRange}>
                  {Math.round(data.predictedFinal.min)} -{" "}
                  {Math.round(data.predictedFinal.max)}
                </Text>
                <Text style={styles.predictionConfidence}>
                  اطمینان: {data.predictedFinal.confidence}%
                </Text>
                <View style={styles.predictionBar}>
                  <View
                    style={[
                      styles.predictionBarFill,
                      {
                        width: `${data.predictedFinal.confidence}%`,
                        backgroundColor:
                          data.predictedFinal.confidence >= 70
                            ? Colors.success
                            : Colors.warning,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          )}

        {/* 13. Recommendations */}
        {data.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>توصیه‌ها</Text>
            {data.recommendations.map((rec, index) => (
              <View
                key={index}
                style={[
                  styles.recommendationCard,
                  rec.priority === "HIGH" && styles.recommendationHigh,
                  rec.priority === "MEDIUM" && styles.recommendationMedium,
                ]}
              >
                <View style={styles.recommendationHeader}>
                  <Ionicons
                    name={
                      rec.priority === "HIGH"
                        ? "alert-circle"
                        : rec.priority === "MEDIUM"
                          ? "information-circle"
                          : "checkmark-circle"
                    }
                    size={20}
                    color={
                      rec.priority === "HIGH"
                        ? Colors.danger
                        : rec.priority === "MEDIUM"
                          ? Colors.warning
                          : Colors.success
                    }
                  />
                  <Text style={styles.recommendationPriority}>
                    {rec.priority === "HIGH"
                      ? "اولویت بالا"
                      : rec.priority === "MEDIUM"
                        ? "اولویت متوسط"
                        : "اولویت کم"}
                  </Text>
                </View>
                <Text style={styles.recommendationMessage}>{rec.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 14. Attendance Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حضور</Text>
          <View style={styles.attendanceCard}>
            <View style={styles.attendanceStats}>
              <View style={styles.attendanceStat}>
                <Text
                  style={[
                    styles.attendanceStatValue,
                    { color: Colors.success },
                  ]}
                >
                  {data.attendance.present}
                </Text>
                <Text style={styles.attendanceStatLabel}>حاضر</Text>
              </View>
              <View style={styles.attendanceStat}>
                <Text
                  style={[styles.attendanceStatValue, { color: Colors.danger }]}
                >
                  {data.attendance.absent}
                </Text>
                <Text style={styles.attendanceStatLabel}>غایب</Text>
              </View>
              <View style={styles.attendanceStat}>
                <Text
                  style={[
                    styles.attendanceStatValue,
                    { color: Colors.warning },
                  ]}
                >
                  {data.attendance.late}
                </Text>
                <Text style={styles.attendanceStatLabel}>تأخیر</Text>
              </View>
              <View style={styles.attendanceStat}>
                <Text
                  style={[
                    styles.attendanceStatValue,
                    { color: Colors.textSecondary },
                  ]}
                >
                  {data.attendance.excused}
                </Text>
                <Text style={styles.attendanceStatLabel}>معذور</Text>
              </View>
            </View>
            <View style={styles.attendanceTotal}>
              <Text style={styles.attendanceTotalLabel}>مجموع روزها</Text>
              <Text style={styles.attendanceTotalValue}>
                {data.attendance.total}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Child Selector Modal */}
      {showChildSelector && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowChildSelector(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>انتخاب فرزند</Text>
              <TouchableOpacity onPress={() => setShowChildSelector(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
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
                <View>
                  <Text style={styles.modalChildName}>{child.name}</Text>
                  <Text style={styles.modalChildClass}>{child.class}</Text>
                </View>
                {selectedChildId === child.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Colors.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ============================================================
// STYLES (unchanged)
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
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
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
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
    marginTop: 40,
  },
  emptyDataTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
  },
  emptyDataSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: "center",
  },
  childSelectorButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: 20,
    gap: 8,
  },
  childSelectorText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  overallStatusCard: {
    backgroundColor: Colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  overallStatusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  overallStatusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  overallStatusTextContainer: {
    flex: 1,
  },
  overallStatusTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  overallStatusLabel: {
    fontSize: 20,
    fontWeight: "bold",
  },
  overallStatusMessage: {
    fontSize: 15,
    color: Colors.text,
    marginBottom: 12,
    textAlign: "right",
  },
  overallStatusStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  overallStatusStat: {
    alignItems: "center",
    flex: 1,
  },
  overallStatusStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  overallStatusStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  overallStatusStatDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  growthCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  growthHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  growthIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  growthTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  growthScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 8,
  },
  growthPrevious: {
    fontSize: 24,
    color: Colors.textSecondary,
    textDecorationLine: "line-through",
  },
  growthCurrent: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
  },
  growthChangeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  growthChange: {
    fontSize: 16,
    fontWeight: "600",
  },
  growthPercentage: {
    fontSize: 16,
    fontWeight: "600",
  },
  readinessCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  readinessHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  readinessTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  confidenceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  readinessScoreContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 8,
  },
  readinessScore: {
    fontSize: 56,
    fontWeight: "bold",
  },
  readinessMax: {
    fontSize: 20,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  readinessStatus: {
    alignItems: "center",
    marginBottom: 12,
  },
  readinessStatusLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.primary,
    backgroundColor: Colors.primary + "10",
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readinessFactors: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  readinessFactorsTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
    textAlign: "right",
  },
  readinessFactorsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  readinessFactor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readinessFactorText: {
    fontSize: 13,
    color: Colors.text,
  },
  readinessMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  readinessMetaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 13,
    fontWeight: "500",
  },
  rankingsCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankingItem: {
    flex: 1,
    alignItems: "center",
  },
  rankingLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  rankingValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  rankingDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  comparisonCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  comparisonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  comparisonTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  comparisonBars: {
    gap: 10,
  },
  comparisonBarItem: {
    gap: 4,
  },
  comparisonBarLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  comparisonBarLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  comparisonBarValue: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text,
  },
  comparisonBarTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  comparisonBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  comparisonDiff: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: "center",
  },
  comparisonDiffText: {
    fontSize: 14,
    fontWeight: "500",
  },
  riskCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  riskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  riskTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskBadgeText: {
    fontSize: 13,
    fontWeight: "500",
  },
  riskFactors: {
    gap: 6,
  },
  riskFactorItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  riskFactorText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  componentsGrid: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  componentItem: {
    gap: 4,
  },
  componentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  componentLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  componentValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  componentBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  componentBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  subjectCard: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  subjectNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  subjectName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  classificationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  classificationText: {
    fontSize: 12,
    fontWeight: "500",
  },
  subjectStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  subjectStat: {
    alignItems: "center",
  },
  subjectStatLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  subjectStatValue: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  subjectProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  subjectPercent: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    minWidth: 40,
    textAlign: "right",
  },
  strengthWeaknessContainer: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  strengthSection: {
    marginBottom: 12,
  },
  strengthHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  strengthTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.success,
  },
  strengthItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  strengthText: {
    fontSize: 14,
    color: Colors.text,
  },
  weaknessSection: {
    marginTop: 8,
  },
  weaknessHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  weaknessTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.danger,
  },
  weaknessItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  weaknessText: {
    fontSize: 14,
    color: Colors.text,
  },
  insightCard: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  insightIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.warning + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  insightText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    textAlign: "right",
  },
  examReadinessContainer: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  examReadinessItem: {
    flex: 1,
    alignItems: "center",
  },
  examReadinessLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  examReadinessScore: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 6,
  },
  examReadinessStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  examReadinessStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  examReadinessDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  predictionCard: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  predictionRange: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  predictionConfidence: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  predictionBar: {
    width: "100%",
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  predictionBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  recommendationCard: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recommendationHigh: {
    borderColor: Colors.danger,
    borderWidth: 2,
  },
  recommendationMedium: {
    borderColor: Colors.warning,
    borderWidth: 2,
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  recommendationPriority: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  recommendationMessage: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  attendanceCard: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attendanceStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  attendanceStat: {
    alignItems: "center",
  },
  attendanceStatValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  attendanceStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  attendanceTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  attendanceTotalLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  attendanceTotalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  emptyState: {
    backgroundColor: Colors.card,
    padding: 40,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    width: "85%",
    maxHeight: "60%",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  modalChildItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalChildItemActive: {
    backgroundColor: Colors.primary + "10",
  },
  modalChildName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  modalChildClass: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
