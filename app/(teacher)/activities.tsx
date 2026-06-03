// app/(teacher)/activities.tsx
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import {
  Activity,
  activityApi,
  ActivityStats
} from "@/src/config/activityApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Activities() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats>({
    today: 0,
    yesterday: 0,
    lastWeek: 0,
    total: 0,
  });
  const [filter, setFilter] = useState("all");
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);

  // Updated filters without payments
  const teacherFilters = [
    { id: "all", title: "همه", icon: "grid" },
    { id: "assignments", title: "تکالیف", icon: "document-text" },
    { id: "exams", title: "آزمون‌ها", icon: "clipboard" },
    { id: "grades", title: "نمرات", icon: "star" },
    { id: "announcements", title: "اعلان‌ها", icon: "megaphone" },
  ];

  const loadData = useCallback(async () => {
    try {
      const [activitiesRes, statsRes] = await Promise.all([
        activityApi.getActivities(),
        activityApi.getActivityStats(),
      ]);

      if (activitiesRes.success) {
        setActivities(activitiesRes.data);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (filter === "all") {
      setFilteredActivities(activities);
    } else {
      const filtered = activities.filter((activity) => {
        switch (filter) {
          case "assignments":
            return (
              activity.type === "assignment" || activity.type === "submission"
            );
          case "exams":
            return activity.type === "exam";
          case "grades":
            return activity.type === "grade";
          case "announcements":
            return activity.type === "announcement";
          default:
            return true;
        }
      });
      setFilteredActivities(filtered);
    }
  }, [filter, activities]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleActivityPress = (activity: Activity) => {
    switch (activity.type) {
      case "assignment":
        router.push(`./(teacher)/assignments/${activity.data?.assignmentId}`);
        break;
      case "exam":
        router.push(`./(teacher)/exams/${activity.data?.examId}`);
        break;
      case "submission":
        router.push(`./(teacher)/grading/${activity.data?.submissionId}`);
        break;
      case "grade":
        router.push(`./(teacher)/grading/${activity.data?.examId}`);
        break;
      case "announcement":
        router.push(
          `./(teacher)/announcements/${activity.data?.announcementId}`,
        );
        break;
      case "enrollment":
        router.push(`./(teacher)/courses/${activity.data?.courseId}`);
        break;
      case "course":
        router.push(`./(teacher)/courses/${activity.data?.courseId}`);
        break;
      case "student":
        router.push(`./(teacher)/students/${activity.data?.senderId}`);
        break;
      default:
        break;
    }
  };

  const groupActivitiesByDate = () => {
    const today: Activity[] = [];
    const yesterday: Activity[] = [];
    const thisWeek: Activity[] = [];
    const older: Activity[] = [];

    filteredActivities.forEach((activity) => {
      if (activity.time.includes("دقیقه") || activity.time.includes("ساعت")) {
        today.push(activity);
      } else if (activity.time === "دیروز") {
        yesterday.push(activity);
      } else if (
        activity.time.includes("روز پیش") &&
        parseInt(activity.time) <= 7
      ) {
        thisWeek.push(activity);
      } else {
        older.push(activity);
      }
    });

    const sections = [];
    if (today.length > 0) sections.push({ title: "امروز", data: today });
    if (yesterday.length > 0)
      sections.push({ title: "دیروز", data: yesterday });
    if (thisWeek.length > 0)
      sections.push({ title: "این هفته", data: thisWeek });
    if (older.length > 0) sections.push({ title: "قبلی", data: older });

    return sections;
  };

  const sections = groupActivitiesByDate();

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <TouchableOpacity
      style={styles.activityCard}
      onPress={() => handleActivityPress(item)}
    >
      <View style={styles.activityIconContainer}>
        <View
          style={[styles.activityIcon, { backgroundColor: `${item.color}20` }]}
        >
          <Ionicons name={item.icon as any} size={20} color={item.color} />
        </View>
      </View>

      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityDescription}>{item.description}</Text>
        <View style={styles.activityMeta}>
          {item.course ? (
            <View style={styles.courseBadge}>
              <Ionicons name="book" size={12} color={Colors.textSecondary} />
              <Text style={styles.courseText}>{item.course}</Text>
            </View>
          ) : null}
          <Text style={styles.activityTime}>{item.time}</Text>
        </View>
      </View>

      <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: any }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length} فعالیت</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="فعالیت‌ها" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="فعالیت‌ها" />

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="today" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{stats.today}</Text>
            <Text style={styles.statLabel}>امروز</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color={Colors.warning} />
            <Text style={styles.statValue}>{stats.yesterday}</Text>
            <Text style={styles.statLabel}>دیروز</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color={Colors.success} />
            <Text style={styles.statValue}>{stats.lastWeek}</Text>
            <Text style={styles.statLabel}>هفته گذشته</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="stats-chart" size={24} color={Colors.secondary} />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>کل</Text>
          </View>
        </View>
      </View>

      {/* Filters - Updated without payments */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        <View style={styles.filters}>
          {teacherFilters.map((filterItem) => (
            <TouchableOpacity
              key={filterItem.id}
              style={[
                styles.filterButton,
                filter === filterItem.id && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(filterItem.id)}
            >
              <Ionicons
                name={filterItem.icon as any}
                size={16}
                color={filter === filterItem.id ? "#fff" : Colors.text}
              />
              <Text
                style={[
                  styles.filterText,
                  filter === filterItem.id && styles.filterTextActive,
                ]}
              >
                {filterItem.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Activities List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderActivityItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off"
              size={60}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyStateTitle}>فعالیتی یافت نشد</Text>
            <Text style={styles.emptyStateText}>
              با فیلتر انتخاب شده فعالیتی وجود ندارد.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  filtersContainer: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filters: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    color: Colors.text,
  },
  filterTextActive: {
    color: "#fff",
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    gap: 12,
  },
  activityIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  courseBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  courseText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  activityTime: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 60,
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
    lineHeight: 20,
  },
});
