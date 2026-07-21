// app/(hr)/evaluations/index.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Evaluation = {
  id: number;
  userId: number;
  period: string;
  date: string;
  teachingQuality: number;
  attendanceScore: number;
  studentFeedback: number;
  overallScore: number;
  status: string;
  User: { fullName: string };
  Evaluator: { fullName: string };
};

export default function EvaluationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/hr/evaluations`,
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );
      const result = await response.json();
      if (result.success) {
        setEvaluations(result.data.evaluations);
      }
    } catch (error) {
      console.error("Fetch evaluations error:", error);
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
    fetchEvaluations();
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "#10b981";
    if (score >= 3) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4) return "عالی";
    if (score >= 3) return "خوب";
    if (score >= 2) return "متوسط";
    return "نیاز به بهبود";
  };

  const renderEvaluation = ({ item }: { item: Evaluation }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/(hr)/evaluations/[id]",
          params: { id: item.id.toString() },
        })
      }
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.staffName}>
            {item.User?.fullName || "نامشخص"}
          </Text>
          <View style={styles.periodContainer}>
            <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
            <Text style={styles.periodText}>{item.period}</Text>
          </View>
        </View>
        <View style={styles.scoreContainer}>
          <View
            style={[
              styles.scoreBadge,
              { backgroundColor: getScoreColor(item.overallScore || 0) + "15" },
            ]}
          >
            <Text
              style={[
                styles.scoreText,
                { color: getScoreColor(item.overallScore || 0) },
              ]}
            >
              {item.overallScore?.toFixed(1) || "N/A"}
            </Text>
          </View>
          <Text
            style={[
              styles.scoreLabel,
              { color: getScoreColor(item.overallScore || 0) },
            ]}
          >
            {getScoreLabel(item.overallScore || 0)}
          </Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <View style={styles.scoreItem}>
          <Ionicons name="school-outline" size={16} color="#8b5cf6" />
          <Text style={styles.scoreLabelText}>کیفیت تدریس</Text>
          <Text style={styles.scoreValue}>{item.teachingQuality || "N/A"}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreItem}>
          <Ionicons name="people-outline" size={16} color="#8b5cf6" />
          <Text style={styles.scoreLabelText}>حضور</Text>
          <Text style={styles.scoreValue}>{item.attendanceScore || "N/A"}</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreItem}>
          <Ionicons name="chatbubbles-outline" size={16} color="#8b5cf6" />
          <Text style={styles.scoreLabelText}>بازخورد شاگردان</Text>
          <Text style={styles.scoreValue}>{item.studentFeedback || "N/A"}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.evaluatorContainer}>
          <Ionicons name="person-outline" size={14} color="#94a3b8" />
          <Text style={styles.evaluatorText}>
            ارزیابی شده توسط: {item.Evaluator?.fullName || "نامشخص"}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#8b5cf6" />
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
        <Text style={styles.headerTitle}>ارزیابی عملکرد</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(hr)/evaluations/create")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{evaluations.length}</Text>
          <Text style={styles.statLabel}>کل ارزیابی‌ها</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {evaluations.length > 0
              ? (
                  evaluations.reduce(
                    (acc, curr) => acc + (curr.overallScore || 0),
                    0,
                  ) / evaluations.length
                ).toFixed(1)
              : "0"}
          </Text>
          <Text style={styles.statLabel}>میانگین امتیاز</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {evaluations.filter((e) => (e.overallScore || 0) >= 4).length}
          </Text>
          <Text style={styles.statLabel}>عالی</Text>
        </View>
      </View>

      <FlatList
        data={evaluations}
        renderItem={renderEvaluation}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="stats-chart-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>هیچ ارزیابی یافت نشد</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/(hr)/evaluations/create")}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>ایجاد ارزیابی جدید</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#8b5cf6",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  statLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e2e8f0",
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
    marginBottom: 2,
  },
  periodContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  periodText: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  scoreContainer: {
    alignItems: "center",
    gap: 2,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 50,
    alignItems: "center",
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: "500",
    fontFamily: "Vazir",
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  scoreItem: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  scoreDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#f1f5f9",
  },
  scoreLabelText: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "Vazir",
    marginTop: 2,
  },
  scoreValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  evaluatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  evaluatorText: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
