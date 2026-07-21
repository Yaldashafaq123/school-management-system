// app/(teacher)/requests/[id].tsx - Connected to Backend
import {
  getRequestStatusColor,
  getRequestStatusText,
  teacherApi,
} from "@/src/config/teacherApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/Colors";

type RequestDetail = {
  id: number;
  type: "leave" | "salary_raise" | "other";
  title: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  date: string;
  amount?: number;
  days?: number;
  rejectionReason?: string;
  approver?: string;
  approvedAt?: string;
  createdAt: string;
  startDate?: string;
  endDate?: string;
};

export default function RequestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [request, setRequest] = useState<RequestDetail | null>(null);

  useEffect(() => {
    if (id) fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const response = await teacherApi.getRequestById(Number(id));
      if (response.success) {
        const data = response.data;
        setRequest({
          id: data.id,
          type: data.type || "other",
          title: data.title || data.type,
          description: data.description || data.reason || "",
          status: data.status,
          date: data.startDate || data.createdAt,
          amount: data.amount || null,
          days: data.days || null,
          rejectionReason: data.rejectionReason,
          approver: data.approver,
          approvedAt: data.approvedAt,
          createdAt: data.createdAt,
          startDate: data.startDate,
          endDate: data.endDate,
        });
      }
    } catch (error) {
      console.error("Fetch request error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequest();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>درخواست یافت نشد</Text>
      </SafeAreaView>
    );
  }

  const getTypeLabel = () => {
    switch (request.type) {
      case "leave":
        return "مرخصی";
      case "salary_raise":
        return "افزایش معاش";
      default:
        return "سایر";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>جزئیات درخواست</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getRequestStatusColor(request.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getRequestStatusColor(request.status) },
              ]}
            >
              {getRequestStatusText(request.status)}
            </Text>
          </View>
          <Text style={styles.requestType}>{getTypeLabel()}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{request.title}</Text>
          <Text style={styles.cardDescription}>{request.description}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>جزئیات</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>تاریخ ثبت</Text>
            <Text style={styles.detailValue}>
              {new Date(request.createdAt).toLocaleDateString("fa-IR")}
            </Text>
          </View>

          {request.days && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>تعداد روزها</Text>
              <Text style={styles.detailValue}>{request.days} روز</Text>
            </View>
          )}

          {request.amount && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>مبلغ</Text>
              <Text style={styles.detailValue}>
                {request.amount.toLocaleString()} افغانی
              </Text>
            </View>
          )}

          {request.startDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>تاریخ شروع</Text>
              <Text style={styles.detailValue}>
                {new Date(request.startDate).toLocaleDateString("fa-IR")}
              </Text>
            </View>
          )}

          {request.endDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>تاریخ پایان</Text>
              <Text style={styles.detailValue}>
                {new Date(request.endDate).toLocaleDateString("fa-IR")}
              </Text>
            </View>
          )}

          {request.approver && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>تایید کننده</Text>
              <Text style={styles.detailValue}>{request.approver}</Text>
            </View>
          )}

          {request.approvedAt && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>تاریخ تایید</Text>
              <Text style={styles.detailValue}>
                {new Date(request.approvedAt).toLocaleDateString("fa-IR")}
              </Text>
            </View>
          )}

          {request.rejectionReason && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: "#ef4444" }]}>
                دلیل رد
              </Text>
              <Text style={[styles.detailValue, { color: "#ef4444" }]}>
                {request.rejectionReason}
              </Text>
            </View>
          )}
        </View>

        {request.status === "pending" && (
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              درخواست شما در حال بررسی است. نتیجه به زودی اعلام می‌شود.
            </Text>
          </View>
        )}

        {request.status === "approved" && (
          <View style={[styles.infoCard, { backgroundColor: "#d1fae5" }]}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={[styles.infoText, { color: "#10b981" }]}>
              درخواست شما تایید شده است.
            </Text>
          </View>
        )}

        {request.status === "rejected" && (
          <View style={[styles.infoCard, { backgroundColor: "#fce4ec" }]}>
            <Ionicons name="close-circle" size={20} color="#ef4444" />
            <Text style={[styles.infoText, { color: "#ef4444" }]}>
              درخواست شما رد شده است.
            </Text>
          </View>
        )}
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: { marginTop: 12, fontSize: 18, color: "#64748b" },
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
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },
  statusCard: {
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
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  statusText: { fontSize: 16, fontWeight: "700" },
  requestType: { fontSize: 14, color: "#64748b" },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  cardDescription: { fontSize: 15, color: "#64748b", lineHeight: 22 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  detailLabel: { fontSize: 14, color: "#64748b" },
  detailValue: { fontSize: 14, fontWeight: "500", color: "#1e293b" },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    borderRadius: 12,
    padding: 16,
    gap: 10,
    marginTop: 8,
  },
  infoText: { flex: 1, fontSize: 14, color: "#64748b" },
});
