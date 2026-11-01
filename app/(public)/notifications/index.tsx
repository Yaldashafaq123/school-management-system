// app/(public)/announcements/index.tsx
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  AnnouncementItem,
  announcementsApi,
} from "@/src/config/announcementApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ==========================================================
// TYPE CONFIG — drives chip labels + colors
// ==========================================================
const TYPES = [
  { id: "all", label: "همه", icon: "apps", color: "#64748B" },
  { id: "GENERAL", label: "عمومی", icon: "megaphone", color: "#3B82F6" },
  {
    id: "ASSIGNMENT",
    label: "کارخانگی",
    icon: "document-text",
    color: "#10B981",
  },
  { id: "EXAM", label: "آزمون", icon: "clipboard", color: "#F59E0B" },
  { id: "EVENT", label: "رویداد", icon: "calendar", color: "#8B5CF6" },
  { id: "FEE", label: "فیس", icon: "cash", color: "#EF4444" },
  { id: "GRADE_RESULT", label: "نمرات", icon: "school", color: "#06B6D4" },
  { id: "PARENT_MEETING", label: "جلسات", icon: "people", color: "#EC4899" },
  { id: "TIMETABLE", label: "برنامه", icon: "time", color: "#14B8A6" },
  { id: "HOLIDAY", label: "رخصتی", icon: "sunny", color: "#F97316" },
  { id: "WORKSHOP", label: "کارگاه", icon: "construct", color: "#A855F7" },
];

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#6B7280",
  NORMAL: "#3B82F6",
  HIGH: "#F59E0B",
  URGENT: "#EF4444",
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "عادی",
  NORMAL: "متوسط",
  HIGH: "مهم",
  URGENT: "فوری",
};

const getTypeMeta = (type: string) =>
  TYPES.find((t) => t.id === type) || {
    label: type,
    icon: "notifications",
    color: "#64748B",
  };

// ==========================================================
// ROLE-AWARE BEHAVIOR
// ==========================================================
const CREATOR_ROLES = ["ADMIN", "PRINCIPAL", "TEACHER", "FINANCE", "HR"];

const getEmptyMessage = (role?: string) => {
  switch (role) {
    case "STUDENT":
      return "هنوز اعلامیه‌ای برای شما منتشر نشده است";
    case "PARENT":
      return "هنوز اعلامیه‌ای برای اولیا منتشر نشده است";
    case "TEACHER":
      return "هنوز اعلامیه‌ای برای معلمان منتشر نشده است";
    case "FINANCE":
      return "هنوز اعلامیه‌ای در بخش مالی منتشر نشده است";
    default:
      return "هیچ اعلامیه‌ای یافت نشد";
  }
};

// ==========================================================
// SCREEN
// ==========================================================
export default function AnnouncementsIndexScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [selectedType, setSelectedType] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const canCreate = CREATOR_ROLES.includes((user?.role || "").toUpperCase());
  console.log("🔍 role:", user?.role, "| canCreate:", canCreate);

  // Load on focus so the list refreshes after creating a new one
  useFocusEffect(
    useCallback(() => {
      // eslint-disable-next-line react-hooks/immutability
      fetchAnnouncements(1, true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedType]),
  );

  const fetchAnnouncements = async (pageNum = 1, replace = false) => {
    try {
      if (pageNum === 1) setLoading(true);

      const res = await announcementsApi.getAnnouncements({
        type: selectedType === "all" ? undefined : selectedType,
        page: pageNum,
        limit: 20,
      });

      if (res.success) {
        const items = res.data.announcements;
        setAnnouncements((prev) =>
          replace || pageNum === 1 ? items : [...prev, ...items],
        );
        setTotal(res.data.total);
        setHasMore(res.data.page < res.data.totalPages);
        setPage(pageNum);
      }
    } catch (err) {
      console.error("fetchAnnouncements:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) fetchAnnouncements(page + 1);
  };

  const openAnnouncement = (item: AnnouncementItem) => {
    router.push(`/(public)/notifications/${item.id}` as any);
  };

  // ----------------------------------------------------------
  // RENDER — row card
  // ----------------------------------------------------------
  const renderItem = ({ item }: { item: AnnouncementItem }) => {
    const t = getTypeMeta(item.type);
    const priorityColor = PRIORITY_COLORS[item.priority] || "#6B7280";
    const isUrgent = item.priority === "URGENT";
    const isEvent = item.isEvent || item.type === "EVENT";

    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.unreadCard]}
        onPress={() => openAnnouncement(item)}
        activeOpacity={0.75}
      >
        {/* Left accent strip by type */}
        <View style={[styles.accentStrip, { backgroundColor: t.color }]} />

        <View style={styles.cardBody}>
          {/* Header row: icon + title + unread dot */}
          <View style={styles.cardHeaderRow}>
            <View
              style={[styles.typeBadge, { backgroundColor: `${t.color}20` }]}
            >
              <Ionicons name={t.icon as any} size={14} color={t.color} />
              <Text style={[styles.typeBadgeText, { color: t.color }]}>
                {t.label}
              </Text>
            </View>

            {isUrgent && (
              <View style={styles.urgentBadge}>
                <Ionicons name="alert-circle" size={12} color="#fff" />
                <Text style={styles.urgentText}>فوری</Text>
              </View>
            )}

            {!item.isRead && <View style={styles.unreadDot} />}
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Content preview */}
          <Text style={styles.preview} numberOfLines={2}>
            {item.content}
          </Text>

          {/* Event detail chip */}
          {isEvent && item.eventDate && (
            <View style={styles.eventChip}>
              <Ionicons name="calendar-outline" size={14} color="#8B5CF6" />
              <Text style={styles.eventChipText}>
                {new Date(item.eventDate).toLocaleDateString("fa-IR", {
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              {item.eventLocation && (
                <>
                  <Ionicons name="location-outline" size={14} color="#8B5CF6" />
                  <Text style={styles.eventChipText} numberOfLines={1}>
                    {item.eventLocation}
                  </Text>
                </>
              )}
            </View>
          )}

          {/* Footer: author + priority + class count */}
          <View style={styles.cardFooter}>
            <View style={styles.authorRow}>
              <Ionicons
                name="person-circle-outline"
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={styles.authorText} numberOfLines={1}>
                {item.author?.fullName || "—"}
              </Text>
            </View>

            <View style={styles.footerRight}>
              {item.classes && item.classes.length > 0 && (
                <View style={styles.classCount}>
                  <Ionicons name="school-outline" size={12} color="#8B5CF6" />
                  <Text style={styles.classCountText}>
                    {item.classes.length}
                  </Text>
                </View>
              )}
              <View
                style={[styles.priorityDot, { backgroundColor: priorityColor }]}
              />
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {PRIORITY_LABELS[item.priority] || item.priority}
              </Text>
            </View>
          </View>

          {/* Confirmation required chip */}
          {item.requireConfirmation && !item.isConfirmed && (
            <View style={styles.needsConfirmChip}>
              <Ionicons name="alert-circle-outline" size={12} color="#EF4444" />
              <Text style={styles.needsConfirmText}>نیاز به تایید حضور</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="اعلامیه‌ها"
        showBack={router.canGoBack()}
        onBackPress={() => router.back()}
        rightComponent={
          canCreate ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                router.push("/(public)/notifications/create" as any)
              }
            >
              <Ionicons name="add-circle" size={26} color={Colors.primary} />
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Type filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRow}
        contentContainerStyle={styles.chipsContent}
      >
        {TYPES.map((t) => {
          const active = selectedType === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.chip,
                active && { backgroundColor: t.color, borderColor: t.color },
              ]}
              onPress={() => setSelectedType(t.id)}
            >
              <Ionicons
                name={t.icon as any}
                size={14}
                color={active ? "#fff" : t.color}
              />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Stats line */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          {total} اعلامیه
          {selectedType !== "all"
            ? ` از نوع ${getTypeMeta(selectedType).label}`
            : ""}
        </Text>
      </View>

      {/* List */}
      {loading && announcements.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loading && announcements.length > 0 ? (
              <ActivityIndicator
                style={{ padding: 16 }}
                color={Colors.primary}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-off-outline"
                size={64}
                color="#CBD5E1"
              />
              <Text style={styles.emptyTitle}>
                {getEmptyMessage(user?.role)}
              </Text>
              {canCreate && (
                <TouchableOpacity
                  style={styles.emptyCreateButton}
                  onPress={() =>
                    router.push("/(public)/notifications/create" as any)
                  }
                >
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={styles.emptyCreateText}>ساخت اعلامیه</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ==========================================================
// STYLES
// ==========================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  addButton: { padding: 4 },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  chipsRow: { maxHeight: 52, marginTop: 4 },
  chipsContent: { paddingHorizontal: 12, gap: 8, alignItems: "center" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: 13,
    color: Colors.text,
    fontFamily: "Vazir",
  },
  chipTextActive: {
    color: "#fff",
    fontFamily: "VazirBold",
    fontWeight: "700",
  },

  statsRow: { paddingHorizontal: 16, paddingVertical: 8 },
  statsText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazir" },

  listContent: { paddingHorizontal: 12, paddingBottom: 80, gap: 10 },

  card: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 4,
  },
  unreadCard: {
    borderWidth: 1,
    borderColor: Colors.primary + "40",
  },
  accentStrip: { width: 5 },
  cardBody: { flex: 1, padding: 12 },

  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: { fontSize: 11, fontFamily: "VazirBold", fontWeight: "700" },

  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgentText: { color: "#fff", fontSize: 10, fontFamily: "VazirBold" },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },

  title: {
    fontSize: 15,
    color: Colors.text,
    fontFamily: "VazirBold",
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "right",
  },
  preview: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Vazir",
    lineHeight: 20,
    textAlign: "right",
    marginBottom: 8,
  },

  eventChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  eventChipText: {
    fontSize: 11,
    color: "#6D28D9",
    fontFamily: "Vazir",
    marginRight: 4,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  authorText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Vazir",
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  classCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  classCountText: { fontSize: 10, color: "#6D28D9", fontFamily: "VazirBold" },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  priorityText: { fontSize: 10, fontFamily: "VazirBold" },

  needsConfirmChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  needsConfirmText: {
    fontSize: 11,
    color: "#B91C1C",
    fontFamily: "VazirBold",
  },

  emptyContainer: {
    paddingVertical: 80,
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontFamily: "Vazir",
    textAlign: "center",
    marginTop: 8,
  },
  emptyCreateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 24,
  },
  emptyCreateText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "VazirBold",
    fontWeight: "700",
  },
});
