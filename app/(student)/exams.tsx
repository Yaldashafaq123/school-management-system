// app/(student)/exams.tsx
import { Colors } from "@/constants/Colors";
import { Announcement, studentApi } from "@/src/config/studentApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExamsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exams, setExams] = useState<Announcement[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async (
    pageNum: number = 1,
    shouldAppend: boolean = false,
  ) => {
    try {
      if (pageNum === 1) setLoading(true);

      const response = await studentApi.getExamAnnouncements({
        page: pageNum,
        limit: 10,
      });

      if (response.success && response.data) {
        const newExams = response.data.items;

        if (shouldAppend) {
          setExams((prev) => [...prev, ...newExams]);
        } else {
          setExams(newExams);
        }

        setTotalPages(response.data.totalPages);
        setHasMore(response.data.hasMore);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error loading exams:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadExams(1, false);
  };

  const loadMore = () => {
    if (!loading && hasMore && page < totalPages) {
      loadExams(page + 1, true);
    }
  };

  const handleExamPress = async (exam: Announcement) => {
    // Mark as read
    if (!exam.isRead) {
      await studentApi.markAnnouncementAsRead(exam.id);
      setExams((prev) =>
        prev.map((e) => (e.id === exam.id ? { ...e, isRead: true } : e)),
      );
    }

    // Navigate to exam detail
    router.push(`/(student)/exam/${exam.id}` as any);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return Colors.danger;
      case "HIGH":
        return Colors.warning;
      case "NORMAL":
        return Colors.primary;
      default:
        return Colors.textSecondary;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "فوری";
      case "HIGH":
        return "مهم";
      case "NORMAL":
        return "عادی";
      default:
        return "";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderExamCard = ({ item }: { item: Announcement }) => (
    <TouchableOpacity
      style={[styles.examCard, !item.isRead && styles.unreadCard]}
      onPress={() => handleExamPress(item)}
    >
      {/* Priority Badge */}
      <View
        style={[
          styles.priorityBadge,
          { backgroundColor: getPriorityColor(item.priority) },
        ]}
      >
        <Text style={styles.priorityText}>
          {getPriorityText(item.priority)}
        </Text>
      </View>

      {/* Exam Header */}
      <View style={styles.examHeader}>
        <View style={styles.examIconContainer}>
          <Ionicons name="calendar" size={24} color={Colors.primary} />
        </View>
        <View style={styles.examTitleContainer}>
          <Text style={[styles.examTitle, !item.isRead && styles.unreadTitle]}>
            {item.title}
          </Text>
          {item.eventDate && (
            <View style={styles.dateContainer}>
              <Ionicons
                name="time-outline"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.examDate}>
                {formatDate(item.eventDate)} - {formatTime(item.eventDate)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Exam Content Preview */}
      <Text style={styles.examContent} numberOfLines={2}>
        {item.content}
      </Text>

      {/* Exam Details */}
      <View style={styles.examDetails}>
        {item.eventLocation && (
          <View style={styles.detailItem}>
            <Ionicons
              name="location-outline"
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.detailText}>{item.eventLocation}</Text>
          </View>
        )}
        <View style={styles.detailItem}>
          <Ionicons
            name="person-outline"
            size={14}
            color={Colors.textSecondary}
          />
          <Text style={styles.detailText}>{item.author.fullName}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons
            name="time-outline"
            size={14}
            color={Colors.textSecondary}
          />
          <Text style={styles.detailText}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>

      {/* Unread Indicator */}
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="calendar-outline"
        size={64}
        color={Colors.textSecondary}
      />
      <Text style={styles.emptyTitle}>هیچ آزمونی یافت نشد</Text>
      <Text style={styles.emptyText}>
        در حال حاضر هیچ آزمون یا اعلامیه‌ای برای شما ثبت نشده است
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.footerText}>در حال بارگذاری بیشتر...</Text>
      </View>
    );
  };

  if (loading && exams.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری آزمون‌ها...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-forward" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>آزمون‌ها</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={exams}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExamCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  examCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
  },
  unreadCard: {
    backgroundColor: "rgba(79, 70, 229, 0.05)",
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  priorityBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },
  examHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingRight: 60, // Space for priority badge
  },
  examIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(79, 70, 229, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  examTitleContainer: {
    flex: 1,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  unreadTitle: {
    color: Colors.primary,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  examDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  examContent: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  examDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  unreadDot: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  footerLoader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
