// app/(hr)/(tabs)/salaries.tsx - Connected to Backend
import {
    formatCurrency,
    getStatusColor,
    getStatusText,
    hrApi,
    SalaryRecord,
} from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
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

const AFGHAN_MONTHS = [
  { key: 1, name: "حمل" },
  { key: 2, name: "ثور" },
  { key: 3, name: "جوزا" },
  { key: 4, name: "سرطان" },
  { key: 5, name: "اسد" },
  { key: 6, name: "سنبله" },
  { key: 7, name: "میزان" },
  { key: 8, name: "عقرب" },
  { key: 9, name: "قوس" },
  { key: 10, name: "جدی" },
  { key: 11, name: "دلو" },
  { key: 12, name: "حوت" },
];

const CURRENT_YEAR = new Date().getFullYear() - 621; // Afghan year

export default function SalariesScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [filter, setFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(
    CURRENT_YEAR === 1404 ? 1 : 1,
  );
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [summary, setSummary] = useState({
    pendingTotal: 0,
    paidTotal: 0,
    totalSalaries: 0,
    pendingCount: 0,
    paidCount: 0,
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchSalaries();
    fetchSalaryStats();
  }, [selectedMonth, selectedYear, filter]);

  const fetchSalaries = async (pageNum: number = 1) => {
    try {
      const response = await hrApi.getSalaries({
        month: selectedMonth,
        year: selectedYear,
        status: filter === "all" ? undefined : filter,
        page: pageNum,
        limit: 20,
      });

      if (response.success) {
        if (pageNum === 1) {
          setSalaries(response.data.salaries);
        } else {
          setSalaries((prev) => [...prev, ...response.data.salaries]);
        }
        setHasMore(response.data.page < response.data.totalPages);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error("Fetch salaries error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSalaryStats = async () => {
    try {
      const response = await hrApi.getSalaryStats({
        month: selectedMonth,
        year: selectedYear,
      });
      if (response.success) {
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error("Fetch salary stats error:", error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchSalaries(1);
    fetchSalaryStats();
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSalaries(nextPage);
    }
  };

  const handleMonthChange = (direction: "prev" | "next") => {
    let newMonth = selectedMonth;
    let newYear = selectedYear;

    if (direction === "prev") {
      if (selectedMonth === 1) {
        newMonth = 12;
        newYear = selectedYear - 1;
      } else {
        newMonth = selectedMonth - 1;
      }
    } else {
      if (selectedMonth === 12) {
        newMonth = 1;
        newYear = selectedYear + 1;
      } else {
        newMonth = selectedMonth + 1;
      }
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    setPage(1);
  };

  const handlePayAll = async () => {
    try {
      const pendingSalaries = salaries.filter(
        (s) => s.status === "PENDING" || s.status === "PARTIAL",
      );
      if (pendingSalaries.length === 0) {
        alert("هیچ معاش معوقی وجود ندارد");
        return;
      }

      // Pay each pending salary
      let successCount = 0;
      for (const salary of pendingSalaries) {
        try {
          await hrApi.recordSalaryPayment({
            salaryId: salary.id,
            amount: salary.finalAmount,
            paymentMethod: "CASH",
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to pay salary ${salary.id}:`, error);
        }
      }

      alert(`${successCount} معاش با موفقیت پرداخت شد`);
      onRefresh();
    } catch (error) {
      console.error("Pay all error:", error);
      alert("خطا در پرداخت معاشات");
    }
  };

  const getMonthName = (month: number) => {
    return AFGHAN_MONTHS.find((m) => m.key === month)?.name || month.toString();
  };

  const renderItem = ({ item }: { item: SalaryRecord }) => {
    const status = item.status.toLowerCase();
    const staffName = item.teacherName || "نامشخص";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          // Navigate to salary detail if needed
        }}
      >
        <View style={styles.cardLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{staffName.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.staffName}>{staffName}</Text>
            <Text style={styles.monthText}>
              {getMonthName(item.month)} {item.year}
            </Text>
            {item.notes && <Text style={styles.noteText}>{item.notes}</Text>}
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.amount}>{formatCurrency(item.finalAmount)}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(status) + "15" },
            ]}
          >
            <Text
              style={[styles.statusText, { color: getStatusColor(status) }]}
            >
              {getStatusText(status)}
            </Text>
          </View>
          {item.status === "PAID" && item.paidAt && (
            <Text style={styles.paidDate}>
              {new Date(item.paidAt).toLocaleDateString("fa-IR")}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const filteredSalaries = salaries;

  if (loading && salaries.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  const totalPending = summary.pendingTotal || 0;
  const pendingCount = summary.pendingCount || 0;

  return (
    <View style={styles.container}>
      {/* Month Navigation */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={() => handleMonthChange("prev")}>
          <Ionicons name="chevron-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {getMonthName(selectedMonth)} {selectedYear}
        </Text>
        <TouchableOpacity onPress={() => handleMonthChange("next")}>
          <Ionicons name="chevron-forward" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>مجموع معاشات معوق</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(totalPending)}</Text>
        <Text style={styles.summarySub}>تعداد: {pendingCount} کارمند</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === "all" && styles.filterActive]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            همه
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === "paid" && styles.filterActive]}
          onPress={() => setFilter("paid")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "paid" && styles.filterTextActive,
            ]}
          >
            پرداخت شد
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "pending" && styles.filterActive,
          ]}
          onPress={() => setFilter("pending")}
        >
          <Text
            style={[
              styles.filterText,
              filter === "pending" && styles.filterTextActive,
            ]}
          >
            در انتظار
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pay All Button */}
      {pendingCount > 0 && (
        <TouchableOpacity style={styles.payAllButton} onPress={handlePayAll}>
          <Ionicons name="wallet" size={20} color="#fff" />
          <Text style={styles.payAllText}>پرداخت همه معاشات</Text>
        </TouchableOpacity>
      )}

      {/* List */}
      <FlatList
        data={filteredSalaries}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && salaries.length > 0 ? (
            <ActivityIndicator style={{ padding: 16 }} color="#8b5cf6" />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cash-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>هیچ معاشی یافت نشد</Text>
            <Text style={styles.emptySubtext}>
              برای {getMonthName(selectedMonth)} {selectedYear}
            </Text>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={async () => {
                try {
                  const response = await hrApi.generateSalaries({
                    month: selectedMonth,
                    year: selectedYear,
                  });
                  if (response.success) {
                    alert(response.message || "معاشات با موفقیت ایجاد شد");
                    onRefresh();
                  }
                } catch (error) {
                  console.error("Generate salaries error:", error);
                  alert("خطا در ایجاد معاشات");
                }
              }}
            >
              <Text style={styles.generateButtonText}>ایجاد معاشات</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  summaryCard: {
    backgroundColor: "#8b5cf6",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Vazir",
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginTop: 4,
    fontFamily: "VazirBold",
  },
  summarySub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
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
  payAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  payAllText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  staffName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    fontFamily: "Vazir",
  },

  noteText: {
    fontSize: 11,
    color: "#f59e0b",
    fontFamily: "Vazir",
    marginTop: 2,
  },
  cardRight: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  paidDate: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
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
  emptySubtext: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: "Vazir",
    marginTop: 4,
  },
  generateButton: {
    marginTop: 16,
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
