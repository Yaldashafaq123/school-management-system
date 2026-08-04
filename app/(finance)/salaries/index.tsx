import { EmptyState } from "@/components/finance/EmptyState";
import { FilterBar } from "@/components/finance/FilterBar";
import { FinanceCard } from "@/components/finance/FinanceCard";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_FILTERS = [
  { key: "all", label: "همه", icon: "list-outline" },
  { key: "PENDING", label: "در انتظار", icon: "time-outline" },
  { key: "PAID", label: "پرداخت شده", icon: "checkmark-circle-outline" },
  { key: "PARTIAL", label: "ناقص", icon: "alert-circle-outline" },
];

export default function SalariesListScreen() {
  const router = useRouter();
  const [salaries, setSalaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState({ totalPending: 0, totalPaid: 0 });

  const fetchSalaries = useCallback(
    async (pageNum: number = 1) => {
      try {
        const params: any = { page: pageNum, limit: 20 };
        if (statusFilter !== "all") params.status = statusFilter;

        const response = await financeApi.getSalaries(params);

        if (response.success) {
          const data = response.data || [];
          if (pageNum === 1) {
            setSalaries(data);
          } else {
            setSalaries((prev) => [...prev, ...data]);
          }
          setHasMore(data.length >= 20);

          // Calculate stats
          let pending = 0;
          let paid = 0;
          data.forEach((s: any) => {
            if (s.status === "PENDING" || s.status === "PARTIAL") {
              pending +=
                Number(s.finalAmount || s.amount) - Number(s.paidAmount || 0);
            } else if (s.status === "PAID") {
              paid += Number(s.paidAmount || 0);
            }
          });
          setStats({ totalPending: pending, totalPaid: paid });
        }
      } catch (error) {
        console.error("Fetch salaries error:", error);
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
    fetchSalaries(1);
  }, [statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchSalaries(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSalaries(nextPage);
    }
  };

  const getSalaryStatus = (salary: any) => {
    if (salary.status === "PAID")
      return { label: "پرداخت شده", color: "#10b981", bg: "#d1fae5" };
    if (salary.status === "PARTIAL")
      return { label: "پرداخت ناقص", color: "#f59e0b", bg: "#fef3c7" };
    if (salary.status === "CANCELLED")
      return { label: "لغو شده", color: "#6b7280", bg: "#f3f4f6" };
    return { label: "در انتظار", color: "#ef4444", bg: "#fecaca" };
  };

  const renderSalary = ({ item }: { item: any }) => {
    const totalAmount = Number(item.finalAmount || item.amount || 0);
    const paidAmount = Number(item.paidAmount || 0);
    const balance = totalAmount - paidAmount;
    const percentage =
      totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;
    const status = getSalaryStatus(item);

    return (
      <TouchableOpacity
        style={styles.salaryCard}
        onPress={() => router.push(`/financial/salaries/${item.id}`)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.teacherInfo}>
            <View style={styles.teacherAvatar}>
              <Ionicons name="person" size={22} color="#f97316" />
            </View>
            <View>
              <Text style={styles.teacherName}>
                {item.teacher?.user?.fullName || "نامشخص"}
              </Text>
              <Text style={styles.salaryPeriod}>
                ماه {item.month} / {item.year}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        {/* Amounts */}
        <View style={styles.amountRow}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>معاش اصلی</Text>
            <Text style={styles.amountValue}>
              {formatCurrency(Number(item.baseSalary || item.amount || 0))}
            </Text>
          </View>
          {Number(item.bonusAmount || 0) > 0 && (
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>بونس</Text>
              <Text style={[styles.amountValue, { color: "#10b981" }]}>
                +{formatCurrency(Number(item.bonusAmount))}
              </Text>
            </View>
          )}
          {Number(item.overtimeAmount || 0) > 0 && (
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>اضافه‌کاری</Text>
              <Text style={[styles.amountValue, { color: "#3b82f6" }]}>
                +{formatCurrency(Number(item.overtimeAmount))}
              </Text>
            </View>
          )}
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>مجموع</Text>
            <Text style={[styles.amountValue, styles.totalAmount]}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
        </View>

        {/* Progress */}
        {totalAmount > 0 && balance > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${percentage}%` }]}
              />
            </View>
            <Text style={styles.progressText}>{percentage}%</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          {balance > 0 && statusFilter !== "PAID" && (
            <TouchableOpacity
              style={styles.payButton}
              onPress={() =>
                router.push(`/financial/salaries/payment?id=${item.id}`)
              }
            >
              <Ionicons name="wallet-outline" size={16} color="#fff" />
              <Text style={styles.payText}>پرداخت</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.balanceText}>
            {balance > 0
              ? `باقیمانده: ${formatCurrency(balance)}`
              : "تسویه شده"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && salaries.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>در حال بارگذاری معاشات...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>معاشات اساتید</Text>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={() => router.push("/financial/salaries/generate")}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <FinanceCard
          title="معاشات معوق"
          value={formatCurrency(stats.totalPending)}
          gradientColors={["#ef4444", "#dc2626"]}
          variant="compact"
          icon="alert-circle-outline"
        />
        <FinanceCard
          title="پرداخت شده"
          value={formatCurrency(stats.totalPaid)}
          gradientColors={["#10b981", "#059669"]}
          variant="compact"
          icon="checkmark-circle-outline"
        />
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        <FilterBar
          options={STATUS_FILTERS}
          selected={statusFilter}
          onSelect={setStatusFilter}
        />
      </View>

      {/* List */}
      {salaries.length === 0 ? (
        <EmptyState
          icon="cash-outline"
          title="هیچ معاشی ثبت نشده"
          subtitle="برای شروع، معاشات ماهانه را تولید کنید"
          actionLabel="تولید معاشات"
          onAction={() => router.push("/financial/salaries/generate")}
        />
      ) : (
        <FlatList
          data={salaries}
          renderItem={renderSalary}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator style={{ padding: 16 }} color="#f97316" />
            ) : null
          }
        />
      )}
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    fontFamily: "Vazir",
  },
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
  generateButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    padding: 12,
    marginHorizontal: 4,
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    gap: 12,
  },

  // Salary Card
  salaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  teacherInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  teacherAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff7ed",
    justifyContent: "center",
    alignItems: "center",
  },
  teacherName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  salaryPeriod: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  amountItem: {
    flex: 1,
    minWidth: "40%",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 10,
  },
  amountLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  amountValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
    marginTop: 2,
    fontFamily: "VazirBold",
  },
  totalAmount: {
    color: "#1e293b",
    fontSize: 17,
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
    backgroundColor: "#f97316",
  },
  progressText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    fontFamily: "Vazir",
    minWidth: 36,
  },

  // Footer
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f97316",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  payText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  balanceText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    fontFamily: "Vazir",
  },
});
