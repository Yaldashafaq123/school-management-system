// app/(hr)/leaves/index.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type LeaveRequest = {
  id: number;
  userId: number;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  approvedBy: number;
  approvedAt: string;
  rejectionReason: string;
  User: { fullName: string; email: string };
  Approver: { fullName: string };
  createdAt: string;
};

const STATUS_FILTERS = [
  { key: "all", label: "همه" },
  { key: "PENDING", label: "در انتظار" },
  { key: "APPROVED", label: "تایید شده" },
  { key: "REJECTED", label: "رد شده" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "#f59e0b";
    case "APPROVED":
      return "#10b981";
    case "REJECTED":
      return "#ef4444";
    default:
      return "#94a3b8";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "PENDING":
      return "در انتظار";
    case "APPROVED":
      return "تایید شده";
    case "REJECTED":
      return "رد شده";
    default:
      return status;
  }
};

const getTypeText = (type: string) => {
  switch (type) {
    case "ANNUAL":
      return "مرخصی سالانه";
    case "SICK":
      return "مرخصی استعلاجی";
    case "EMERGENCY":
      return "مرخصی اضطرار";
    case "MATERNITY":
      return "مرخصی زایمان";
    default:
      return type;
  }
};

export default function LeaveRequestsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const fetchLeaves = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/hr/leaves?status=${statusFilter === "all" ? "" : statusFilter}`,
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );
      const result = await response.json();
      if (result.success) {
        setLeaves(result.data.leaves);
      }
    } catch (error) {
      console.error("Fetch leaves error:", error);
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
    fetchLeaves();
  };

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/hr/leaves/${id}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getToken()}`,
          },
        },
      );
      const result = await response.json();
      if (result.success) {
        Alert.alert("موفقیت", "درخواست مرخصی تایید شد");
        fetchLeaves();
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در تایید درخواست");
    }
  };

  const handleReject = async (id: number) => {
    Alert.prompt("رد درخواست مرخصی", "دلیل رد را وارد کنید", [
      { text: "لغو", style: "cancel" },
      {
        text: "رد",
        style: "destructive",
        onPress: async (reason: any) => {
          try {
            const response = await fetch(
              `${process.env.EXPO_PUBLIC_API_URL}/api/hr/leaves/${id}/reject`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${await getToken()}`,
                },
                body: JSON.stringify({ rejectionReason: reason || "" }),
              },
            );
            const result = await response.json();
            if (result.success) {
              Alert.alert("موفقیت", "درخواست مرخصی رد شد");
              fetchLeaves();
            }
          } catch (error: any) {
            Alert.alert("خطا", error.message || "خطا در رد درخواست");
          }
        },
      },
    ]);
  };

  const renderLeave = ({ item }: { item: LeaveRequest }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.staffName}>
            {item.User?.fullName || "نامشخص"}
          </Text>
          <Text style={styles.leaveType}>{getTypeText(item.type)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "15" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.leaveDates}>
        <View style={styles.dateItem}>
          <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
          <Text style={styles.dateText}>
            از {new Date(item.startDate).toLocaleDateString("fa-IR")}
          </Text>
        </View>
        <View style={styles.dateItem}>
          <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
          <Text style={styles.dateText}>
            تا {new Date(item.endDate).toLocaleDateString("fa-IR")}
          </Text>
        </View>
      </View>

      {item.reason && (
        <View style={styles.reasonContainer}>
          <Ionicons name="document-text-outline" size={14} color="#94a3b8" />
          <Text style={styles.reasonText}>دلیل: {item.reason}</Text>
        </View>
      )}

      {item.status === "PENDING" && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprove(item.id)}
          >
            <Ionicons name="checkmark-outline" size={18} color="#fff" />
            <Text style={styles.actionText}>تایید</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReject(item.id)}
          >
            <Ionicons name="close-outline" size={18} color="#fff" />
            <Text style={styles.actionText}>رد</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === "APPROVED" && item.Approver && (
        <View style={styles.infoRow}>
          <Ionicons name="checkmark-circle-outline" size={14} color="#10b981" />
          <Text style={styles.approvedBy}>
            تایید شده توسط: {item.Approver.fullName}
          </Text>
        </View>
      )}

      {item.status === "REJECTED" && item.rejectionReason && (
        <View style={styles.infoRow}>
          <Ionicons name="alert-circle-outline" size={14} color="#ef4444" />
          <Text style={styles.rejectedReason}>
            دلیل رد: {item.rejectionReason}
          </Text>
        </View>
      )}
    </View>
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
        <Text style={styles.headerTitle}>درخواست‌های مرخصی</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(hr)/leaves/request")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Balance Button */}
      <TouchableOpacity
        style={styles.balanceButton}
        onPress={() => router.push("/(hr)/leaves/balance")}
      >
        <Ionicons name="stats-chart" size={20} color="#8b5cf6" />
        <Text style={styles.balanceButtonText}>موجودی مرخصی</Text>
        <Ionicons name="chevron-forward" size={20} color="#8b5cf6" />
      </TouchableOpacity>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {STATUS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              statusFilter === filter.key && styles.filterActive,
            ]}
            onPress={() => setStatusFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={leaves}
        renderItem={renderLeave}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>هیچ درخواست مرخصی یافت نشد</Text>
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
  balanceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 0,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
  },
  balanceButtonText: {
    fontSize: 15,
    color: "#8b5cf6",
    fontFamily: "Vazir",
    fontWeight: "500",
  },
  filterContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  filterActive: {
    backgroundColor: "#8b5cf6",
  },
  filterText: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  filterTextActive: {
    color: "#fff",
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
    marginBottom: 8,
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
  },
  leaveType: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 70,
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  leaveDates: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
    flexWrap: "wrap",
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  reasonContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  reasonText: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
    flex: 1,
  },
  actionContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: "#10b981",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  approvedBy: {
    fontSize: 12,
    color: "#10b981",
    fontFamily: "Vazir",
    flex: 1,
  },
  rejectedReason: {
    fontSize: 12,
    color: "#ef4444",
    fontFamily: "Vazir",
    flex: 1,
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
});
