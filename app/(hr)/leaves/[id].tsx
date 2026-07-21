// app/(hr)/leaves/[id].tsx
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

type LeaveDetail = {
  id: number;
  userId: number;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  rejectionReason: string;
  User: { fullName: string; email: string; phone: string };
  Approver: { fullName: string };
  createdAt: string;
};

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "PENDING":
      return "time-outline";
    case "APPROVED":
      return "checkmark-circle";
    case "REJECTED":
      return "close-circle";
    default:
      return "help-circle-outline";
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

const getTypeIcon = (type: string) => {
  switch (type) {
    case "ANNUAL":
      return "calendar";
    case "SICK":
      return "medkit";
    case "EMERGENCY":
      return "alert-circle";
    case "MATERNITY":
      return "heart";
    default:
      return "calendar-outline";
  }
};

export default function LeaveDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leave, setLeave] = useState<LeaveDetail | null>(null);

  useEffect(() => {
    if (id) fetchLeave();
  }, [id]);

  const fetchLeave = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/hr/leaves/${id}`,
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );
      const result = await response.json();
      if (result.success) {
        setLeave(result.data);
      }
    } catch (error) {
      console.error("Fetch leave error:", error);
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
    fetchLeave();
  };

  const handleApprove = async () => {
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
        fetchLeave();
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در تایید درخواست");
    }
  };

  const handleReject = async () => {
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
              fetchLeave();
            }
          } catch (error: any) {
            Alert.alert("خطا", error.message || "خطا در رد درخواست");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#8b5cf6" />
      </SafeAreaView>
    );
  }

  if (!leave) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar style="dark" />
        <Ionicons name="alert-circle-outline" size={60} color="#ef4444" />
        <Text style={styles.errorTitle}>درخواست یافت نشد</Text>
        <Text style={styles.errorText}>
          درخواست مرخصی مورد نظر موجود نیست یا حذف شده است
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

  const days =
    Math.ceil(
      (new Date(leave.endDate).getTime() -
        new Date(leave.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;

  const statusColor = getStatusColor(leave.status);
  const statusIcon = getStatusIcon(leave.status);
  const typeIcon = getTypeIcon(leave.type);

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
        <Text style={styles.headerTitle}>جزئیات درخواست مرخصی</Text>
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
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + "15" },
              ]}
            >
              <Ionicons
                name={statusIcon as any}
                size={16}
                color={statusColor}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusText(leave.status)}
              </Text>
            </View>
            <View style={styles.daysBadge}>
              <Ionicons name="calendar-outline" size={14} color="#8b5cf6" />
              <Text style={styles.daysText}>{days} روز</Text>
            </View>
          </View>

          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {leave.User?.fullName?.charAt(0) || "?"}
              </Text>
            </View>
          </View>

          <Text style={styles.staffName}>
            {leave.User?.fullName || "نامشخص"}
          </Text>

          <View style={styles.infoRow}>
            <Ionicons name={typeIcon as any} size={18} color="#8b5cf6" />
            <Text style={styles.leaveType}>{getTypeText(leave.type)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#94a3b8" />
            <Text style={styles.emailText}>{leave.User?.email}</Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>جزئیات درخواست</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
              <Text style={styles.infoLabel}>تاریخ شروع</Text>
            </View>
            <Text style={styles.infoValue}>
              {new Date(leave.startDate).toLocaleDateString("fa-IR")}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
              <Text style={styles.infoLabel}>تاریخ پایان</Text>
            </View>
            <Text style={styles.infoValue}>
              {new Date(leave.endDate).toLocaleDateString("fa-IR")}
            </Text>
          </View>

          {leave.reason && (
            <View style={styles.infoRow}>
              <View style={styles.infoLabelContainer}>
                <Ionicons
                  name="document-text-outline"
                  size={16}
                  color="#94a3b8"
                />
                <Text style={styles.infoLabel}>دلیل</Text>
              </View>
              <Text style={[styles.infoValue, styles.reasonText]}>
                {leave.reason}
              </Text>
            </View>
          )}

          {leave.status === "REJECTED" && leave.rejectionReason && (
            <View style={[styles.infoRow, styles.rejectedRow]}>
              <View style={styles.infoLabelContainer}>
                <Ionicons
                  name="close-circle-outline"
                  size={16}
                  color="#ef4444"
                />
                <Text style={[styles.infoLabel, { color: "#ef4444" }]}>
                  دلیل رد
                </Text>
              </View>
              <Text style={[styles.infoValue, { color: "#ef4444" }]}>
                {leave.rejectionReason}
              </Text>
            </View>
          )}

          {leave.status === "APPROVED" && leave.Approver && (
            <View style={[styles.infoRow, styles.approvedRow]}>
              <View style={styles.infoLabelContainer}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color="#10b981"
                />
                <Text style={[styles.infoLabel, { color: "#10b981" }]}>
                  تایید شده توسط
                </Text>
              </View>
              <Text style={[styles.infoValue, { color: "#10b981" }]}>
                {leave.Approver.fullName}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Ionicons name="time-outline" size={16} color="#94a3b8" />
              <Text style={styles.infoLabel}>تاریخ ثبت</Text>
            </View>
            <Text style={styles.infoValue}>
              {new Date(leave.createdAt).toLocaleDateString("fa-IR")}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {leave.status === "PENDING" && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={handleApprove}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.actionText}>تایید</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={handleReject}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle" size={22} color="#fff" />
              <Text style={styles.actionText}>رد</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Status Info */}
        {leave.status !== "PENDING" && (
          <View style={styles.statusInfoCard}>
            <Ionicons
              name={
                leave.status === "APPROVED"
                  ? "checkmark-circle"
                  : "close-circle"
              }
              size={24}
              color={leave.status === "APPROVED" ? "#10b981" : "#ef4444"}
            />
            <Text style={styles.statusInfoText}>
              {leave.status === "APPROVED"
                ? "این درخواست تایید شده است"
                : "این درخواست رد شده است"}
            </Text>
          </View>
        )}
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
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  daysBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ede9fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  daysText: {
    fontSize: 13,
    color: "#8b5cf6",
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  avatarContainer: {
    marginBottom: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  staffName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  leaveType: {
    fontSize: 15,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  emailText: {
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  infoCard: {
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

  infoLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    fontFamily: "Vazir",
    maxWidth: "60%",
    textAlign: "right",
  },
  reasonText: {
    fontWeight: "400",
    color: "#64748b",
  },
  rejectedRow: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  approvedRow: {
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  approveButton: {
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  rejectButton: {
    backgroundColor: "#ef4444",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  statusInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statusInfoText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
});
