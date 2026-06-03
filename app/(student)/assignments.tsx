import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  Assignment,
  AssignmentStats,
  studentApi,
} from "@/src/config/studentApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AssignmentWithStatus = Assignment & {
  daysLeft?: number;
  isOverdue?: boolean;
};

export default function AssignmentsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentWithStatus[]>([]);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState<AssignmentStats>({
    total: 0,
    pending: 0,
    submitted: 0,
    graded: 0,
    late: 0,
  });

  const filters = [
    { id: "all", label: "همه", icon: "apps", color: Colors.textSecondary },
    { id: "pending", label: "در انتظار", icon: "time", color: Colors.warning },
    {
      id: "submitted",
      label: "تحویل شده",
      icon: "cloud-upload",
      color: Colors.info,
    },
    {
      id: "graded",
      label: "نمره دار",
      icon: "checkmark-circle",
      color: Colors.success,
    },
    { id: "late", label: "تأخیر", icon: "alert-circle", color: Colors.danger },
  ];

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await studentApi.getAssignments();
      if (response.success && response.data) {
        const processedAssignments = processAssignments(response.data);
        setAssignments(processedAssignments);

        // Get stats
        const statsResponse = await studentApi.getAssignmentStats();
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error("Error loading assignments:", error);
      Alert.alert("خطا", "مشکل در بارگذاری کارخانگی");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAssignments();
    }, []),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAssignments();
    setRefreshing(false);
  };

  const processAssignments = (
    assignments: Assignment[],
  ): AssignmentWithStatus[] => {
    const now = new Date();

    return assignments.map((assignment) => {
      const dueDate = new Date(assignment.due_date);
      const isOverdue =
        dueDate < now &&
        assignment.status !== "submitted" &&
        assignment.status !== "graded";

      let daysLeft = 0;
      if (
        !isOverdue &&
        assignment.status !== "submitted" &&
        assignment.status !== "graded"
      ) {
        const diffTime = dueDate.getTime() - now.getTime();
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        ...assignment,
        daysLeft: daysLeft > 0 ? daysLeft : 0,
        isOverdue,
      };
    });
  };

  const handleSubmitAssignment = (assignmentId: number) => {
    router.push(`/student/assignment/${assignmentId}/submit`);
  };

  const handleViewAssignment = (assignmentId: number) => {
    router.push(`/student/assignment/${assignmentId}`);
  };

  const getFilteredAssignments = () => {
    if (filter === "all") return assignments;
    return assignments.filter((a) => a.status === filter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return Colors.warning;
      case "submitted":
        return Colors.info;
      case "graded":
        return Colors.success;
      case "late":
        return Colors.danger;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "در انتظار";
      case "submitted":
        return "تحویل شده";
      case "graded":
        return "نمره دار";
      case "late":
        return "تأخیر";
      default:
        return "-";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "time";
      case "submitted":
        return "cloud-upload";
      case "graded":
        return "checkmark-circle";
      case "late":
        return "alert-circle";
      default:
        return "document-text";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredAssignments = getFilteredAssignments();

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="کارخانگی" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری کارخانگی...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="کارخانگی"
        rightComponent={
          <TouchableOpacity onPress={loadAssignments}>
            <Ionicons name="refresh" size={24} color={Colors.text} />
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
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>کل</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>
              {stats.pending}
            </Text>
            <Text style={styles.statLabel}>در انتظار</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.info }]}>
              {stats.submitted}
            </Text>
            <Text style={styles.statLabel}>تحویل شده</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {stats.graded}
            </Text>
            <Text style={styles.statLabel}>نمره دار</Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filterItem) => (
            <TouchableOpacity
              key={filterItem.id}
              style={[
                styles.filterChip,
                filter === filterItem.id && styles.filterChipActive,
              ]}
              onPress={() => setFilter(filterItem.id)}
            >
              <Ionicons
                name={filterItem.icon as any}
                size={16}
                color={filter === filterItem.id ? "#fff" : filterItem.color}
              />
              <Text
                style={[
                  styles.filterText,
                  filter === filterItem.id && styles.filterTextActive,
                ]}
              >
                {filterItem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Assignments List */}
        <View style={styles.assignmentsContainer}>
          {filteredAssignments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={60}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyStateTitle}>کارخانگی یافت نشد</Text>
              <Text style={styles.emptyStateText}>
                {filter === "all"
                  ? "هنوز کارخانگی دریافت نکرده‌اید"
                  : `کارخانگی با وضعیت "${filters.find((f) => f.id === filter)?.label}" ندارید`}
              </Text>
            </View>
          ) : (
            filteredAssignments.map((assignment) => (
              <TouchableOpacity
                key={assignment.id}
                style={[
                  styles.assignmentCard,
                  assignment.status === "late" && styles.lateCard,
                  assignment.status === "graded" && styles.gradedCard,
                ]}
                onPress={() => handleViewAssignment(assignment.id)}
              >
                {/* Status Badge */}
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: `${getStatusColor(assignment.status)}20`,
                      },
                    ]}
                  >
                    <Ionicons
                      name={getStatusIcon(assignment.status) as any}
                      size={14}
                      color={getStatusColor(assignment.status)}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(assignment.status) },
                      ]}
                    >
                      {getStatusText(assignment.status)}
                    </Text>
                  </View>

                  {assignment.status === "pending" &&
                    assignment.daysLeft &&
                    assignment.daysLeft > 0 && (
                      <View style={styles.daysLeft}>
                        <Ionicons
                          name="calendar-outline"
                          size={12}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.daysLeftText}>
                          {assignment.daysLeft} روز مانده
                        </Text>
                      </View>
                    )}

                  {assignment.isOverdue && assignment.status !== "graded" && (
                    <View style={styles.overdueBadge}>
                      <Ionicons
                        name="alert-circle"
                        size={12}
                        color={Colors.danger}
                      />
                      <Text style={styles.overdueText}>تأخیر</Text>
                    </View>
                  )}
                </View>

                {/* Assignment Title */}
                <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                <Text style={styles.courseName}>{assignment.course_name}</Text>

                {/* Description */}
                {assignment.description && (
                  <Text style={styles.description} numberOfLines={2}>
                    {assignment.description}
                  </Text>
                )}

                {/* Due Date */}
                <View style={styles.dueDateContainer}>
                  <Ionicons
                    name="calendar"
                    size={16}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.dueDateText}>
                    مهلت: {formatDate(assignment.due_date)}
                  </Text>
                </View>

                {/* Grade Info (if graded) */}
                {assignment.status === "graded" &&
                  assignment.submission?.grade && (
                    <View style={styles.gradeContainer}>
                      <Ionicons name="star" size={16} color={Colors.warning} />
                      <Text style={styles.gradeText}>
                        نمره: {assignment.submission.grade} از{" "}
                        {assignment.max_score}
                      </Text>
                      {assignment.submission.feedback && (
                        <Text style={styles.feedbackText} numberOfLines={1}>
                          {assignment.submission.feedback}
                        </Text>
                      )}
                    </View>
                  )}

                {/* Action Button */}
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    assignment.status === "submitted" && styles.submittedButton,
                    assignment.status === "graded" && styles.gradedButton,
                    assignment.status === "late" && styles.lateButton,
                  ]}
                  onPress={() => {
                    if (
                      assignment.status === "pending" ||
                      assignment.status === "late"
                    ) {
                      handleSubmitAssignment(assignment.id);
                    } else {
                      handleViewAssignment(assignment.id);
                    }
                  }}
                >
                  <Ionicons
                    name={
                      assignment.status === "pending"
                        ? "cloud-upload-outline"
                        : assignment.status === "late"
                          ? "alert-circle-outline"
                          : assignment.status === "submitted"
                            ? "eye-outline"
                            : "document-text-outline"
                    }
                    size={18}
                    color="#fff"
                  />
                  <Text style={styles.actionButtonText}>
                    {assignment.status === "pending"
                      ? "تحویل کارخانگی"
                      : assignment.status === "late"
                        ? "تحویل دیرهنگام"
                        : assignment.status === "submitted"
                          ? "مشاهده تحویل"
                          : assignment.status === "graded"
                            ? "مشاهده نمره"
                            : "جزئیات"}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
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
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  filtersContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  filtersContent: {
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  assignmentsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  assignmentCard: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lateCard: {
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderColor: Colors.danger,
  },
  gradedCard: {
    backgroundColor: "rgba(16, 185, 129, 0.05)",
    borderColor: Colors.success,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
  },
  daysLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  daysLeftText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  overdueBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  overdueText: {
    fontSize: 10,
    color: Colors.danger,
    fontWeight: "500",
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  courseName: {
    fontSize: 13,
    color: Colors.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  dueDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  dueDateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  gradeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  gradeText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.warning,
  },
  feedbackText: {
    fontSize: 12,
    color: Colors.success,
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  submittedButton: {
    backgroundColor: Colors.info,
  },
  gradedButton: {
    backgroundColor: Colors.success,
  },
  lateButton: {
    backgroundColor: Colors.danger,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});
