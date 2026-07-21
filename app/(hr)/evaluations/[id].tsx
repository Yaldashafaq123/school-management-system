// app/(hr)/evaluations/[id].tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type EvaluationDetail = {
  id: number;
  userId: number;
  evaluatorId: number;
  period: string;
  date: string;
  teachingQuality: number;
  attendanceScore: number;
  studentFeedback: number;
  teamworkScore: number;
  punctualityScore: number;
  overallScore: number;
  strengths: string;
  weaknesses: string;
  goals: string;
  recommendations: string;
  status: string;
  User: { fullName: string; email: string; role: string };
  Evaluator: { fullName: string };
};

export default function EvaluationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationDetail | null>(null);

  useEffect(() => {
    if (id) fetchEvaluation();
  }, [id]);

  const fetchEvaluation = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/hr/evaluations/${id}`,
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );
      const result = await response.json();
      if (result.success) {
        setEvaluation(result.data);
      }
    } catch (error) {
      console.error("Fetch evaluation error:", error);
      Alert.alert("خطا", "خطا در دریافت اطلاعات ارزیابی");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getToken = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    return token;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvaluation();
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "#10b981";
    if (score >= 3) return "#f59e0b";
    if (score >= 2) return "#f97316";
    return "#ef4444";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4) return "عالی";
    if (score >= 3) return "خوب";
    if (score >= 2) return "متوسط";
    return "نیاز به بهبود";
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "پیش‌نویس";
      case "SUBMITTED":
        return "ارسال شده";
      case "REVIEWED":
        return "بررسی شده";
      case "COMPLETED":
        return "تکمیل شده";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "#94a3b8";
      case "SUBMITTED":
        return "#f59e0b";
      case "REVIEWED":
        return "#3b82f6";
      case "COMPLETED":
        return "#10b981";
      default:
        return "#94a3b8";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#8b5cf6" />
      </SafeAreaView>
    );
  }

  if (!evaluation) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={60} color="#ef4444" />
        <Text style={styles.errorTitle}>ارزیابی یافت نشد</Text>
        <Text style={styles.errorText}>
          ارزیابی مورد نظر موجود نیست یا حذف شده است
        </Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.errorButtonText}>بازگشت</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>جزئیات ارزیابی</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {evaluation.User?.fullName?.charAt(0) || "?"}
              </Text>
            </View>
          </View>

          <Text style={styles.staffName}>{evaluation.User?.fullName}</Text>
          <View style={styles.staffInfoRow}>
            <Ionicons name="briefcase-outline" size={14} color="#94a3b8" />
            <Text style={styles.staffRole}>{evaluation.User?.role}</Text>
          </View>
          <View style={styles.staffInfoRow}>
            <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
            <Text style={styles.periodText}>{evaluation.period}</Text>
          </View>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getStatusColor(evaluation.status) + "15",
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(evaluation.status) },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(evaluation.status) },
                ]}
              >
                {getStatusText(evaluation.status)}
              </Text>
            </View>

            <View
              style={[
                styles.scoreBadge,
                {
                  backgroundColor:
                    getScoreColor(evaluation.overallScore || 0) + "15",
                },
              ]}
            >
              <Text
                style={[
                  styles.scoreText,
                  { color: getScoreColor(evaluation.overallScore || 0) },
                ]}
              >
                {evaluation.overallScore?.toFixed(1) || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.scoreLabelContainer}>
            <Text
              style={[
                styles.scoreLabelText,
                { color: getScoreColor(evaluation.overallScore || 0) },
              ]}
            >
              {getScoreLabel(evaluation.overallScore || 0)}
            </Text>
          </View>
        </View>

        {/* Scores Card */}
        <View style={styles.scoresCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={20} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>امتیازات</Text>
          </View>

          <View style={styles.scoreItem}>
            <View style={styles.scoreLabelContainer}>
              <Ionicons name="school-outline" size={16} color="#8b5cf6" />
              <Text style={styles.scoreLabel}>کیفیت تدریس</Text>
            </View>
            <View style={styles.scoreBarContainer}>
              <View style={styles.scoreBar}>
                <View
                  style={[
                    styles.scoreFill,
                    {
                      width: `${Math.min((evaluation.teachingQuality || 0) * 20, 100)}%`,
                      backgroundColor: getScoreColor(
                        evaluation.teachingQuality || 0,
                      ),
                    },
                  ]}
                />
              </View>
              <Text style={styles.scoreValue}>
                {evaluation.teachingQuality?.toFixed(1) || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.scoreItem}>
            <View style={styles.scoreLabelContainer}>
              <Ionicons name="people-outline" size={16} color="#8b5cf6" />
              <Text style={styles.scoreLabel}>حضور</Text>
            </View>
            <View style={styles.scoreBarContainer}>
              <View style={styles.scoreBar}>
                <View
                  style={[
                    styles.scoreFill,
                    {
                      width: `${Math.min((evaluation.attendanceScore || 0) * 20, 100)}%`,
                      backgroundColor: getScoreColor(
                        evaluation.attendanceScore || 0,
                      ),
                    },
                  ]}
                />
              </View>
              <Text style={styles.scoreValue}>
                {evaluation.attendanceScore?.toFixed(1) || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.scoreItem}>
            <View style={styles.scoreLabelContainer}>
              <Ionicons name="chatbubbles-outline" size={16} color="#8b5cf6" />
              <Text style={styles.scoreLabel}>بازخورد شاگردان</Text>
            </View>
            <View style={styles.scoreBarContainer}>
              <View style={styles.scoreBar}>
                <View
                  style={[
                    styles.scoreFill,
                    {
                      width: `${Math.min((evaluation.studentFeedback || 0) * 20, 100)}%`,
                      backgroundColor: getScoreColor(
                        evaluation.studentFeedback || 0,
                      ),
                    },
                  ]}
                />
              </View>
              <Text style={styles.scoreValue}>
                {evaluation.studentFeedback?.toFixed(1) || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.scoreItem}>
            <View style={styles.scoreLabelContainer}>
              <Ionicons
                name="people-circle-outline"
                size={16}
                color="#8b5cf6"
              />
              <Text style={styles.scoreLabel}>کار تیمی</Text>
            </View>
            <View style={styles.scoreBarContainer}>
              <View style={styles.scoreBar}>
                <View
                  style={[
                    styles.scoreFill,
                    {
                      width: `${Math.min((evaluation.teamworkScore || 0) * 20, 100)}%`,
                      backgroundColor: getScoreColor(
                        evaluation.teamworkScore || 0,
                      ),
                    },
                  ]}
                />
              </View>
              <Text style={styles.scoreValue}>
                {evaluation.teamworkScore?.toFixed(1) || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.scoreItem}>
            <View style={styles.scoreLabelContainer}>
              <Ionicons name="time-outline" size={16} color="#8b5cf6" />
              <Text style={styles.scoreLabel}>وقت‌شناسی</Text>
            </View>
            <View style={styles.scoreBarContainer}>
              <View style={styles.scoreBar}>
                <View
                  style={[
                    styles.scoreFill,
                    {
                      width: `${Math.min((evaluation.punctualityScore || 0) * 20, 100)}%`,
                      backgroundColor: getScoreColor(
                        evaluation.punctualityScore || 0,
                      ),
                    },
                  ]}
                />
              </View>
              <Text style={styles.scoreValue}>
                {evaluation.punctualityScore?.toFixed(1) || "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Details Card */}
        {(evaluation.strengths ||
          evaluation.weaknesses ||
          evaluation.goals ||
          evaluation.recommendations) && (
          <View style={styles.detailsCard}>
            {evaluation.strengths && (
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#10b981"
                  />
                  <Text style={styles.detailTitle}>نقاط قوت</Text>
                </View>
                <Text style={styles.detailText}>{evaluation.strengths}</Text>
              </View>
            )}

            {evaluation.weaknesses && (
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color="#ef4444"
                  />
                  <Text style={styles.detailTitle}>نقاط ضعف</Text>
                </View>
                <Text style={styles.detailText}>{evaluation.weaknesses}</Text>
              </View>
            )}

            {evaluation.goals && (
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Ionicons name="flag-outline" size={20} color="#f59e0b" />
                  <Text style={styles.detailTitle}>اهداف</Text>
                </View>
                <Text style={styles.detailText}>{evaluation.goals}</Text>
              </View>
            )}

            {evaluation.recommendations && (
              <View style={styles.detailSection}>
                <View style={styles.detailHeader}>
                  <Ionicons name="bulb-outline" size={20} color="#8b5cf6" />
                  <Text style={styles.detailTitle}>توصیه‌ها</Text>
                </View>
                <Text style={styles.detailText}>
                  {evaluation.recommendations}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer Info */}
        <View style={styles.footerInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={16} color="#94a3b8" />
            <Text style={styles.footerText}>
              ارزیابی شده توسط: {evaluation.Evaluator?.fullName || "نامشخص"}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
            <Text style={styles.footerText}>
              تاریخ: {new Date(evaluation.date).toLocaleDateString("fa-IR")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  scrollView: {
    flex: 1,
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
    padding: 20,
    backgroundColor: "#f1f5f9",
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    fontFamily: "Vazir",
  },
  errorButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  backButton: {
    padding: 4,
    minWidth: 40,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    width: 40,
  },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  staffName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  staffInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  staffRole: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  periodText: {
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  scoreBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 50,
    alignItems: "center",
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  scoreLabelContainer: {
    marginTop: 8,
  },
  scoreLabelText: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Vazir",
  },
  scoresCard: {
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
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  scoreItem: {
    marginBottom: 12,
  },

  scoreLabel: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  scoreBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreFill: {
    height: "100%",
    borderRadius: 4,
  },
  scoreValue: {
    width: 40,
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "right",
    fontFamily: "VazirBold",
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    gap: 16,
  },
  detailSection: {
    gap: 4,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  detailText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 24,
    fontFamily: "Vazir",
    paddingLeft: 26,
  },
  footerInfo: {
    gap: 8,
    paddingVertical: 8,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
});
