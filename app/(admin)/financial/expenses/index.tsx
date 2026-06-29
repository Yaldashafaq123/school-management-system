// app/(admin)/financial/expenses/index.tsx
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
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const TIME_FILTERS = [
  { key: "all", label: "همه", icon: "list-outline" },
  { key: "today", label: "امروز", icon: "today-outline" },
  { key: "week", label: "این هفته", icon: "calendar-outline" },
  { key: "month", label: "این ماه", icon: "calendar-outline" },
];

export default function ExpensesListScreen() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchExpenses = useCallback(
    async (pageNum: number = 1) => {
      try {
        const params: any = { page: pageNum, limit: 20 };

        // Apply time filter
        if (timeFilter !== "all") {
          const now = new Date();
          const startOfDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );

          if (timeFilter === "today") {
            params.startDate = startOfDay.toISOString();
            params.endDate = now.toISOString();
          } else if (timeFilter === "week") {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            params.startDate = startOfWeek.toISOString();
            params.endDate = now.toISOString();
          } else if (timeFilter === "month") {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            params.startDate = startOfMonth.toISOString();
            params.endDate = now.toISOString();
          }
        }

        const [expensesRes, statsRes] = await Promise.all([
          financeApi.getExpenses(params),
          financeApi.getExpenseStatistics(),
        ]);

        if (expensesRes.success) {
          if (pageNum === 1) {
            setExpenses(expensesRes.data.expenses || []);
          } else {
            setExpenses((prev) => [
              ...prev,
              ...(expensesRes.data.expenses || []),
            ]);
          }
          setHasMore((expensesRes.data.expenses || []).length >= 20);
        }

        if (statsRes.success) {
          setStats(statsRes.data);
        }
      } catch (error) {
        console.error("Fetch expenses error:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [timeFilter],
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchExpenses(1);
  }, [timeFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchExpenses(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchExpenses(nextPage);
    }
  };

  const filteredExpenses = searchQuery
    ? expenses.filter(
        (e) =>
          e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : expenses;

  const totalAmount = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0,
  );

  const renderExpense = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.expenseCard}
      onPress={() => router.push(`/financial/expenses/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.expenseLeft}>
        <View
          style={[
            styles.expenseIcon,
            { backgroundColor: getCategoryColor(item.category?.name) + "20" },
          ]}
        >
          <Ionicons
            name={getCategoryIcon(item.category?.name)}
            size={22}
            color={getCategoryColor(item.category?.name)}
          />
        </View>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseCategory}>
            {item.category?.name || "بدون دسته‌بندی"}
          </Text>
          <Text style={styles.expenseDescription} numberOfLines={2}>
            {item.description || "بدون توضیح"}
          </Text>
          <Text style={styles.expenseDate}>
            {new Date(item.date || item.createdAt).toLocaleDateString("fa-AF", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
      </View>
      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>
          - {formatCurrency(Number(item.amount))}
        </Text>
        {item.receiptUrl && (
          <Ionicons name="document-attach-outline" size={16} color="#94a3b8" />
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && expenses.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
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
        <Text style={styles.title}>مصارف</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/financial/expenses/create")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      {stats && (
        <View style={styles.statsRow}>
          <FinanceCard
            title="مصرف این ماه"
            value={formatCurrency(stats.totalThisMonth || 0)}
            gradientColors={["#ef4444", "#dc2626"]}
            variant="compact"
            icon="trending-down-outline"
          />
          <FinanceCard
            title="مصرف امسال"
            value={formatCurrency(stats.totalThisYear || 0)}
            gradientColors={["#f59e0b", "#d97706"]}
            variant="compact"
            icon="calendar-outline"
          />
        </View>
      )}

      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="جستجوی مصرف..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          textAlign="right"
        />
        <TouchableOpacity
          style={styles.categoriesButton}
          onPress={() => router.push("/financial/expenses/categories")}
        >
          <Ionicons name="pricetags-outline" size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <FilterBar
          options={TIME_FILTERS}
          selected={timeFilter}
          onSelect={setTimeFilter}
        />
      </View>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon="trending-down-outline"
          title="هیچ مصرفی ثبت نشده"
          subtitle="برای شروع، یک مصرف جدید ثبت کنید"
          actionLabel="ثبت مصرف جدید"
          onAction={() => router.push("/financial/expenses/create")}
        />
      ) : (
        <>
          {/* Total */}
          <View style={styles.totalBar}>
            <Text style={styles.totalLabel}>مجموع:</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>

          <FlatList
            data={filteredExpenses}
            renderItem={renderExpense}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading ? (
                <ActivityIndicator style={{ padding: 16 }} color="#ef4444" />
              ) : null
            }
          />
        </>
      )}
    </View>
  );
}

// Helper functions
function getCategoryColor(categoryName: string): string {
  const colors: Record<string, string> = {
    اجاره: "#ef4444",
    معاش: "#f59e0b",
    برق: "#fbbf24",
    آب: "#3b82f6",
    انترنت: "#8b5cf6",
    تعمیرات: "#ec4899",
    لوازم: "#14b8a6",
    "حمل و نقل": "#f97316",
    غذا: "#84cc16",
  };
  return colors[categoryName] || "#64748b";
}

function getCategoryIcon(categoryName: string): string {
  const icons: Record<string, string> = {
    اجاره: "home-outline",
    معاش: "cash-outline",
    برق: "flash-outline",
    آب: "water-outline",
    انترنت: "wifi-outline",
    تعمیرات: "build-outline",
    لوازم: "cart-outline",
    "حمل و نقل": "car-outline",
    غذا: "restaurant-outline",
  };
  return icons[categoryName] || "receipt-outline";
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
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    padding: 12,
    marginHorizontal: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b",
    paddingVertical: 10,
    fontFamily: "Vazir",
  },
  categoriesButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  totalBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fef2f2",
    marginHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ef4444",
    fontFamily: "VazirBold",
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    gap: 8,
  },
  expenseCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderRightWidth: 4,
    borderRightColor: "#ef4444",
  },
  expenseLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  expenseInfo: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  expenseDescription: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  expenseDate: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  expenseRight: {
    alignItems: "flex-end",
    marginLeft: 10,
    gap: 4,
  },
  expenseAmount: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ef4444",
    fontFamily: "VazirBold",
  },
});
