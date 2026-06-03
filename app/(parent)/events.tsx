// app/(parent)/events/index.tsx
import { useAuth } from "@/contexts/AuthContext";
import {
  Event,
  EventCategory,
  parentEventsApi,
} from "@/src/config/parentEventsApi";
import {
  Bell,
  Calendar,
  Clock,
  Download,
  MapPin,
  Users,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
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

export default function SchoolEvents() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [rsvping, setRsvping] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Get events from announcements API (type: EVENT)
      const eventsRes = await parentEventsApi.getEvents({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        upcoming: true,
      });

      // Get categories
      const categoriesRes = await parentEventsApi.getCategories();

      if (eventsRes.success && eventsRes.data) {
        setEvents(eventsRes.data);
      }
      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }
    } catch (err) {
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRSVP = async (eventId: number, eventTitle: string) => {
    Alert.alert(
      "تایید حضور",
      `آیا از حضور در رویداد "${eventTitle}" مطمئن هستید؟`,
      [
        { text: "لغو", style: "cancel" },
        {
          text: "تایید",
          style: "default",
          onPress: async () => {
            setRsvping(eventId);
            try {
              const response = await parentEventsApi.confirmEvent(eventId);
              if (response.success) {
                Alert.alert("موفقیت", response.message);
                loadData(); // Refresh events
              } else {
                Alert.alert("خطا", response.message || "خطا در تایید حضور");
              }
            } catch (err) {
              Alert.alert("خطا", "خطا در تایید حضور");
            } finally {
              setRsvping(null);
            }
          },
        },
      ],
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fa-IR", {
      weekday: "short",
      month: "short",
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "academic":
        return "#3b82f620";
      case "sports":
        return "#10b98120";
      case "cultural":
        return "#8b5cf620";
      case "parent":
        return "#f59e0b20";
      default:
        return "#e5e7eb";
    }
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find((c) => c.id === category);
    return cat?.label || category;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "#ef4444";
      case "HIGH":
        return "#f59e0b";
      case "NORMAL":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const getPriorityLabel = (priority: string) => {
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

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>در حال بارگذاری رویدادها...</Text>
      </SafeAreaView>
    );
  }

  const upcomingEvents = events.filter((e) => new Date(e.date) > new Date());
  const rsvpEvents = events.filter((e) => e.rsvp);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3b82f6"]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Calendar size={32} color="#3b82f6" />
          <Text style={styles.title}>رویدادهای مکتب</Text>
          <Text style={styles.subtitle}>از فعالیت‌های مکتب مطلع باشید</Text>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryPill,
                selectedCategory === category.id && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id &&
                    styles.selectedCategoryText,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Events List */}
        <View style={styles.eventsList}>
          {events.length === 0 ? (
            <View style={styles.emptyState}>
              <Bell size={48} color="#9ca3af" />
              <Text style={styles.emptyStateTitle}>رویدادی یافت نشد</Text>
              <Text style={styles.emptyStateText}>
                هیچ رویدادی با این دسته‌بندی یافت نشد
              </Text>
            </View>
          ) : (
            events.map((event) => (
              <View key={event.id} style={styles.eventCard}>
                {/* Priority Badge */}
                {event.priority && event.priority !== "NORMAL" && (
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(event.priority) },
                    ]}
                  >
                    <Text style={styles.priorityText}>
                      {getPriorityLabel(event.priority)}
                    </Text>
                  </View>
                )}

                {/* Date Badge */}
                <View style={styles.dateBadge}>
                  <Text style={styles.dateDay}>
                    {new Date(event.date).getDate()}
                  </Text>
                  <Text style={styles.dateMonth}>
                    {new Date(event.date).toLocaleDateString("fa-IR", {
                      month: "short",
                    })}
                  </Text>
                </View>

                {/* Event Details */}
                <View style={styles.eventDetails}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View
                      style={[
                        styles.categoryTag,
                        { backgroundColor: getCategoryColor(event.category) },
                      ]}
                    >
                      <Text style={styles.categoryTagText}>
                        {getCategoryLabel(event.category)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.eventMeta}>
                    <View style={styles.metaItem}>
                      <Calendar size={14} color="#6b7280" />
                      <Text style={styles.metaText}>
                        {formatDate(event.date)}
                      </Text>
                    </View>
                    {event.time && (
                      <View style={styles.metaItem}>
                        <Clock size={14} color="#6b7280" />
                        <Text style={styles.metaText}>{event.time}</Text>
                      </View>
                    )}
                    <View style={styles.metaItem}>
                      <MapPin size={14} color="#6b7280" />
                      <Text style={styles.metaText}>{event.location}</Text>
                    </View>
                  </View>

                  <Text style={styles.eventDescription} numberOfLines={2}>
                    {event.description}
                  </Text>

                  {/* Author Info */}
                  {event.author && (
                    <Text style={styles.authorText}>
                      ثبت کننده: {event.author}
                    </Text>
                  )}

                  {/* RSVP Section */}
                  {event.rsvp && (
                    <View style={styles.rsvpSection}>
                      <View style={styles.attendanceBar}>
                        <View
                          style={[
                            styles.attendanceFill,
                            {
                              width: `${Math.min(
                                (event.attending / (event.maxAttendees || 1)) *
                                  100,
                                100,
                              )}%`,
                            },
                          ]}
                        />
                      </View>
                      <View style={styles.attendanceInfo}>
                        <View style={styles.attendanceText}>
                          <Users size={14} color="#6b7280" />
                          <Text style={styles.attendanceCount}>
                            {event.attending}/{event.maxAttendees || 0} نفر
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.rsvpButton}
                          onPress={() => handleRSVP(event.id, event.title)}
                          disabled={rsvping === event.id}
                        >
                          <Text style={styles.rsvpButtonText}>
                            {rsvping === event.id ? "در حال..." : "تایید حضور"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Actions */}
                  <View style={styles.eventActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        Alert.alert(
                          "یادآوری",
                          `یادآوری برای رویداد "${event.title}" تنظیم شد`,
                        );
                      }}
                    >
                      <Bell size={16} color="#3b82f6" />
                      <Text style={styles.actionText}>یادآوری</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        Alert.alert(
                          "تقویم",
                          `رویداد "${event.title}" به تقویم شما اضافه شد`,
                        );
                      }}
                    >
                      <Download size={16} color="#10b981" />
                      <Text style={styles.actionText}>افزودن به تقویم</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>خلاصه رویدادها</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.statNumber}>{events.length}</Text>
              <Text style={styles.statLabel}>تعداد کل رویدادها</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.statNumber}>{rsvpEvents.length}</Text>
              <Text style={styles.statLabel}>نیازمند تایید</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.statNumber}>{upcomingEvents.length}</Text>
              <Text style={styles.statLabel}>رویدادهای آینده</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    alignItems: "center",
    padding: 32,
    backgroundColor: "white",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginTop: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
  categoryContainer: {
    paddingHorizontal: 16,
    backgroundColor: "white",
  },
  categoryContent: {
    paddingVertical: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: "#3b82f6",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    textAlign: "center",
  },
  selectedCategoryText: {
    color: "white",
  },
  eventsList: {
    padding: 16,
    gap: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
    backgroundColor: "white",
    borderRadius: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  eventCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: "relative",
  },
  priorityBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  priorityText: {
    fontSize: 10,
    color: "white",
    fontWeight: "bold",
  },
  dateBadge: {
    width: 70,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  dateDay: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  dateMonth: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
  },
  eventDetails: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  eventTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  eventMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "right",
  },
  eventDescription: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
    textAlign: "right",
  },
  authorText: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "right",
  },
  rsvpSection: {
    gap: 8,
  },
  attendanceBar: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
  },
  attendanceFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 2,
  },
  attendanceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attendanceText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  attendanceCount: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "right",
  },
  rsvpButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rsvpButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  eventActions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  actionText: {
    fontSize: 12,
    color: "#374151",
    textAlign: "right",
  },
  summaryCard: {
    backgroundColor: "white",
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  summaryStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryStat: {
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
});
