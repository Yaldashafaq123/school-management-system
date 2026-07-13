// app/(admin)/financial/fees/index.tsx
import { EmptyState } from "@/components/finance/EmptyState";
import { FilterBar } from "@/components/finance/FilterBar";
import {
  FeeAssignment,
  financeApi,
  formatCurrency,
} from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_FILTERS = [
  { key: "all", label: "همه", icon: "list-outline" },
  { key: "ACTIVE", label: "فعال", icon: "checkmark-circle-outline" },
  { key: "COMPLETED", label: "تکمیل", icon: "checkmark-done-outline" },
  { key: "CANCELLED", label: "لغو", icon: "close-circle-outline" },
];

export default function FeesListScreen() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<FeeAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchAssignments = useCallback(
    async (pageNum: number = 1) => {
      try {
        setError(null);
        const params: any = {};
        if (statusFilter !== "all") params.status = statusFilter;

        const response = await financeApi.getFeeAssignments(params);

        if (response.success) {
          if (pageNum === 1) {
            setAssignments(response.data);
          } else {
            setAssignments((prev) => [...prev, ...response.data]);
          }
          setHasMore(response.data.length >= 20);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load assignments");
        console.error("Fetch assignments error:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchAssignments(1);
  }, [statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchAssignments(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAssignments(nextPage);
    }
  };

  const calculateTotals = (assignment: FeeAssignment) => {
    let totalAmount = 0;
    let totalPaid = 0;
    let totalBalance = 0;

    for (const item of assignment.feeItems || []) {
      const itemAmount = Number(item.finalAmount || item.amount);
      const itemPaid = Number(item.paidAmount || 0);

      if (item.isRecurring && item.monthlyRecords) {
        for (const record of item.monthlyRecords) {
          totalAmount += Number(record.amount);
          totalPaid += Number(record.paidAmount);
          totalBalance += Number(record.balanceAmount);
        }
      } else {
        totalAmount += itemAmount;
        totalPaid += itemPaid;
        totalBalance += itemAmount - itemPaid;
      }
    }

    return { totalAmount, totalPaid, totalBalance };
  };

  const renderAssignment = ({ item }: { item: FeeAssignment }) => {
    const { totalAmount, totalPaid, totalBalance } = calculateTotals(item);
    const percentage =
      totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/financial/fees/${item.id}`)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.studentInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color="#3b82f6" />
            </View>
            <View>
              <Text style={styles.studentName}>
                {item.student?.user?.fullName || "نامشخص"}
              </Text>
              <Text style={styles.className}>
                {item.student?.class?.name || "بدون صنف"}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "ACTIVE"
                    ? "#eff6ff"
                    : item.status === "COMPLETED"
                      ? "#f0fdf4"
                      : "#f1f5f9",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    item.status === "ACTIVE"
                      ? "#3b82f6"
                      : item.status === "COMPLETED"
                        ? "#059669"
                        : "#64748b",
                },
              ]}
            >
              {item.status === "ACTIVE"
                ? "فعال"
                : item.status === "COMPLETED"
                  ? "تکمیل"
                  : item.status === "CANCELLED"
                    ? "لغو"
                    : item.status}
            </Text>
          </View>
        </View>

        {/* Amounts */}
        <View style={styles.amountRow}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>فیس کل</Text>
            <Text style={styles.amountValue}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>پرداخت شده</Text>
            <Text style={[styles.amountValue, { color: "#059669" }]}>
              {formatCurrency(totalPaid)}
            </Text>
          </View>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>باقیمانده</Text>
            <Text
              style={[
                styles.amountValue,
                { color: totalBalance > 0 ? "#ef4444" : "#059669" },
              ]}
            >
              {formatCurrency(totalBalance)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        {totalAmount > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${percentage}%`,
                    backgroundColor:
                      percentage >= 100
                        ? "#10b981"
                        : percentage >= 50
                          ? "#f59e0b"
                          : "#ef4444",
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{percentage}%</Text>
          </View>
        )}

        {/* Academic Year & Actions */}
        <View style={styles.cardFooter}>
          <View style={styles.academicYearBadge}>
            <Ionicons name="calendar-outline" size={14} color="#64748b" />
            <Text style={styles.academicYearText}>
              {item.academicYear?.name || "نامشخص"}
            </Text>
          </View>

          <View style={styles.actions}>
            {totalBalance > 0 && (
              <TouchableOpacity
                style={styles.payButton}
                onPress={() =>
                  router.push(
                    `/financial/payments/record?studentId=${item.studentId}&assignmentId=${item.id}`,
                  )
                }
              >
                <Ionicons name="wallet-outline" size={16} color="#fff" />
                <Text style={styles.payText}>پرداخت</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => router.push(`/financial/fees/${item.id}`)}
            >
              <Ionicons name="eye-outline" size={16} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && assignments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>فیس شاگردان</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/financial/fees/create")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterContainer}>
        <FilterBar
          options={STATUS_FILTERS}
          selected={statusFilter}
          onSelect={setStatusFilter}
        />
      </View>

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* List */}
      {assignments.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="هیچ فیس پیدا نشد"
          subtitle="برای شاگردان فیس تعیین کنید"
          actionLabel="ایجاد فیس جدید"
          onAction={() => router.push("/financial/fees/create")}
        />
      ) : (
        <FlatList
          data={assignments}
          renderItem={renderAssignment}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && assignments.length > 0 ? (
              <ActivityIndicator style={{ padding: 16 }} color="#3b82f6" />
            ) : null
          }
        />
      )}
    </View>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    fontFamily: "Vazir",
  },

  // Header
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
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },

  // Filter
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  // Error
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: "#dc2626",
    fontSize: 14,
    fontFamily: "Vazir",
  },

  // List
  listContent: {
    padding: 16,
    gap: 12,
  },

  // Card
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
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  className: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Vazir",
  },

  // Amounts
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  amountItem: {
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginBottom: 4,
    fontFamily: "Vazir",
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },

  // Progress
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    fontFamily: "Vazir",
    minWidth: 40,
    textAlign: "center",
  },

  // Footer
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  academicYearBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  academicYearText: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  payText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  detailsButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
});
