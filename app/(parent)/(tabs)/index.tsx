// app/(parent)/index.tsx
import { useAuth } from "@/contexts/AuthContext";
import {
  Child,
  DashboardData,
  parentApi
} from "@/src/config/parentApi";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  Bell,
  Calendar,
  ChevronRight,
  DollarSign,
  MessageSquare,
  User,
} from "lucide-react-native";
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

export default function ParentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [activeChild, setActiveChild] = useState<Child | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await parentApi.getDashboard(activeChild?.id);
      if (response.success && response.data) {
        setDashboardData(response.data);
        setActiveChild(response.data.activeChild);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [activeChild?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSwitchChild = (child: Child) => {
    setActiveChild(child);
    loadData();
  };

  const getIconComponent = (iconName: string, color: string) => {
    const icons: Record<string, any> = {
      calendar: Calendar,
      "dollar-sign": DollarSign,
      "message-square": MessageSquare,
    };
    const IconComponent = icons[iconName] || Calendar;
    return <IconComponent size={24} color={color} />;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  const children = dashboardData?.children || [];
  const notifications = dashboardData?.notifications || [];
  const quickStats = dashboardData?.quickStats || [];
  const upcomingEvents = dashboardData?.upcomingEvents || [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={["#3b82f6"]}
        />
      }
    >
      {/* Header with Child Selector */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.childSelector}
          onPress={() => router.push("/(parent)/child-switch")}
        >
          <View style={styles.childInfo}>
            <User size={20} color="#4b5563" />
            <View style={styles.childDetails}>
              <Text style={styles.childName}>
                {activeChild?.name || "انتخاب فرزند"}
              </Text>
              <Text style={styles.childClass}>
                {activeChild?.class || ""} {activeChild?.active ? "• فعال" : ""}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        {quickStats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            {getIconComponent(stat.icon, stat.color)}
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Bell size={20} color="#374151" />
          <Text style={styles.sectionTitle}>اعلان‌ها</Text>
        </View>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>هیچ اعلانی وجود ندارد</Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <View key={notification.id} style={styles.notificationCard}>
              <AlertCircle
                size={20}
                color={notification.type === "urgent" ? "#ef4444" : "#3b82f6"}
              />
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>اقدامات سریع</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(parent)/events")}
          >
            <Calendar size={24} color="#3b82f6" />
            <Text style={styles.actionText}>رویدادها</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(parent)/(tabs)/fees")}
          >
            <DollarSign size={24} color="#10b981" />
            <Text style={styles.actionText}>پرداخت فیس</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>رویدادهای آینده</Text>
          <TouchableOpacity onPress={() => router.push("/(parent)/events")}>
            <Text style={styles.seeAll}>مشاهده همه</Text>
          </TouchableOpacity>
        </View>
        {upcomingEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>رویدادی در پیش رو نیست</Text>
          </View>
        ) : (
          upcomingEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>
                {event.date} {event.time}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#6b7280" },
  header: { padding: 16, backgroundColor: "white" },
  childSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 12,
  },
  childInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  childDetails: { gap: 2 },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  childClass: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "right",
  },
  statsGrid: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  section: { padding: 16, gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  notificationContent: { flex: 1, gap: 4 },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  notificationMessage: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "right",
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  seeAll: {
    color: "#3b82f6",
    fontWeight: "500",
  },
  eventCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    gap: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  eventDate: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "right",
  },
  emptyContainer: {
    backgroundColor: "white",
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
  },
});
