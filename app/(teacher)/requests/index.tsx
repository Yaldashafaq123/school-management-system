// app/(teacher)/requests/index.tsx - Connected to Backend
import {
  getLeaveTypeText,
  getRequestStatusColor,
  getRequestStatusText,
  teacherApi,
} from "@/src/config/teacherApi";
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
import { Colors } from "../../../constants/Colors";
import { useAuth } from "../../../contexts/AuthContext";

type Request = {
  id: number;
  type: "leave" | "salary_raise" | "other";
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  amount?: number;
  days?: number;
  rejectionReason?: string;
};

const TYPE_LABELS = {
  leave: "مرخصی",
  salary_raise: "افزایش معاش",
  other: "سایر",
};

const TYPE_ICONS = {
  leave: "calendar-outline",
  salary_raise: "cash-outline",
  other: "document-text-outline",
};

export default function RequestsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await teacherApi.getRequests({
        status: filter === "all" ? undefined : filter,
        limit: 50,
      });

      if (response.success) {
        // Format the requests for the UI
        const formatted = response.data.requests.map((item: any) => ({
          id: item.id,
          type: item.type || "other",
          title:
            item.type === "salary_raise"
              ? "درخواست افزایش معاش"
              : getLeaveTypeText(item.title) || item.title,
          description: item.description || item.reason || "",
          status: item.status,
          date: item.createdAt || item.date,
          amount: item.amount || null,
          days: item.days || null,
          rejectionReason: item.rejectionReason,
        }));
        setRequests(formatted);
      }
    } catch (error) {
      console.error("Fetch requests error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  const renderRequest = ({ item }: { item: Request }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/(teacher)/requests/[id]",
          params: { id: item.id.toString() },
        })
      }
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: Colors.primary + "20" },
            ]}
          >
            <Ionicons
              name={TYPE_ICONS[item.type] as any}
              size={22}
              color={Colors.primary}
            />
          </View>
          <View>
            <Text style={styles.requestTitle}>{item.title}</Text>
            <Text style={styles.requestType}>{TYPE_LABELS[item.type]}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getRequestStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getRequestStatusColor(item.status) },
            ]}
          >
            {getRequestStatusText(item.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.requestDesc} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.requestDate}>
          {new Date(item.date).toLocaleDateString("fa-IR")}
        </Text>
        {item.days && <Text style={styles.requestMeta}>{item.days} روز</Text>}
        {item.amount && (
          <Text style={styles.requestMeta}>
            {item.amount.toLocaleString()} افغانی
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>درخواست‌های من</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(teacher)/requests/leave")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {["all", "pending", "approved", "rejected"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterTab, filter === tab && styles.filterTabActive]}
            onPress={() => setFilter(tab as any)}
          >
            <Text
              style={[
                styles.filterText,
                filter === tab && styles.filterTextActive,
              ]}
            >
              {tab === "all"
                ? "همه"
                : tab === "pending"
                  ? "در انتظار"
                  : tab === "approved"
                    ? "تایید شده"
                    : "رد شده"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>هیچ درخواستی یافت نشد</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/(teacher)/requests/leave")}
            >
              <Text style={styles.emptyButtonText}>ثبت درخواست جدید</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#64748b" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1e293b" },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  filterTabActive: { backgroundColor: Colors.primary },
  filterText: { fontSize: 14, color: "#64748b" },
  filterTextActive: { color: "#fff" },
  listContent: { padding: 16, gap: 12 },
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
    alignItems: "center",
  },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  requestTitle: { fontSize: 15, fontWeight: "600", color: "#1e293b" },
  requestType: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 12, fontWeight: "600" },
  requestDesc: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  requestDate: { fontSize: 12, color: "#94a3b8" },
  requestMeta: { fontSize: 12, color: "#94a3b8" },
  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyText: { marginTop: 16, fontSize: 16, color: "#94a3b8" },
  emptyButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
