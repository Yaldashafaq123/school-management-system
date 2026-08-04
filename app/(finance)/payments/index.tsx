import { EmptyState } from "@/components/finance/EmptyState";
import { ExportButton } from "@/components/finance/ExportButton";
import { FilterBar } from "@/components/finance/FilterBar";
import { PaymentHistoryItem } from "@/components/finance/PaymentHistoryItem";
import {
  financeApi,
  formatCurrency,
  PaymentRecord,
} from "@/src/config/financeApi";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PAYMENT_TYPE_FILTERS = [
  { key: "all", label: "همه", icon: "list-outline" },
  { key: "monthly", label: "ماهانه", icon: "repeat" },
  { key: "one-time", label: "یکباره", icon: "receipt-outline" },
];

const METHOD_FILTERS = [
  { key: "all", label: "همه روش‌ها" },
  { key: "CASH", label: "نقدی" },
  { key: "BANK_TRANSFER", label: "بانکی" },
  { key: "CARD", label: "کارت" },
  { key: "MOBILE_MONEY", label: "موبایلی" },
];

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  const fetchPayments = useCallback(
    async (pageNum: number = 1) => {
      try {
        const params: any = {
          page: pageNum,
          limit: 20,
        };

        if (searchQuery.trim()) params.search = searchQuery;
        if (methodFilter !== "all") params.paymentMethod = methodFilter;

        const response = await financeApi.getPaymentHistory(params);

        if (response.success) {
          let filtered = response.data.payments;

          // Client-side type filter
          if (typeFilter === "monthly") {
            filtered = filtered.filter(
              (p) =>
                p.feeTitle.includes("ماهانه") ||
                p.feeTitle.includes("حمل") ||
                p.feeTitle.includes("ثور"),
            );
          } else if (typeFilter === "one-time") {
            filtered = filtered.filter(
              (p) =>
                !p.feeTitle.includes("ماهانه") &&
                !p.feeTitle.includes("حمل") &&
                !p.feeTitle.includes("ثور"),
            );
          }

          if (pageNum === 1) {
            setPayments(filtered);
          } else {
            setPayments((prev) => [...prev, ...filtered]);
          }

          setTotalAmount(filtered.reduce((sum, p) => sum + p.amount, 0));
          setHasMore(filtered.length >= 20);
        }
      } catch (error) {
        console.error("Fetch payments error:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [typeFilter, methodFilter, searchQuery],
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchPayments(1);
  }, [typeFilter, methodFilter, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchPayments(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPayments(nextPage);
    }
  };

  const getTodayTotal = () => {
    const today = new Date().toDateString();
    return payments
      .filter((p) => new Date(p.date).toDateString() === today)
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const renderHeader = () => (
    <View>
      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: "#eff6ff" }]}>
          <Ionicons name="today-outline" size={20} color="#3b82f6" />
          <Text style={styles.summaryLabel}>امروز</Text>
          <Text style={[styles.summaryValue, { color: "#3b82f6" }]}>
            {formatCurrency(getTodayTotal())}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#f0fdf4" }]}>
          <Ionicons name="receipt-outline" size={20} color="#10b981" />
          <Text style={styles.summaryLabel}>تعداد</Text>
          <Text style={[styles.summaryValue, { color: "#10b981" }]}>
            {payments.length} پرداخت
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#fef3c7" }]}>
          <Ionicons name="cash-outline" size={20} color="#f59e0b" />
          <Text style={styles.summaryLabel}>مجموع</Text>
          <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>
            {formatCurrency(totalAmount)}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="جستجوی شاگرد یا شماره مرجع..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          textAlign="right"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
        <ExportButton reportType="payments" variant="icon" />
      </View>

      {/* Type Filter */}
      <View style={styles.filterRow}>
        <FilterBar
          options={PAYMENT_TYPE_FILTERS}
          selected={typeFilter}
          onSelect={setTypeFilter}
        />
      </View>

      {/* Method Filter */}
      <ScrollableMethodFilter
        options={METHOD_FILTERS}
        selected={methodFilter}
        onSelect={setMethodFilter}
      />
    </View>
  );

  if (loading && payments.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>در حال بارگذاری پرداخت‌ها...</Text>
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
        <Text style={styles.title}>تاریخچه پرداخت‌ها</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/financial/payments/record")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {payments.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          title="هیچ پرداختی ثبت نشده"
          subtitle="برای شروع، یک پرداخت جدید ثبت کنید"
          actionLabel="ثبت پرداخت جدید"
          onAction={() => router.push("/financial/payments/record")}
        />
      ) : (
        <FlatList
          data={payments}
          renderItem={({ item }) => (
            <PaymentHistoryItem
              payment={item}
              onPress={() => router.push(`/financial/payments/${item.id}`)}
            />
          )}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <ActivityIndicator style={{ padding: 16 }} color="#10b981" />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

// Scrollable Method Filter Component
const ScrollableMethodFilter = ({ options, selected, onSelect }: any) => (
  <View style={styles.methodFilterContainer}>
    <FlatList
      horizontal
      data={options}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.methodChip,
            selected === item.key && styles.methodChipActive,
          ]}
          onPress={() => onSelect(item.key)}
        >
          <Text
            style={[
              styles.methodChipText,
              selected === item.key && styles.methodChipTextActive,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.key}
      contentContainerStyle={styles.methodFilterContent}
    />
  </View>
);

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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 32,
  },
  summaryRow: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
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
  filterRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  methodFilterContainer: {
    marginBottom: 8,
  },
  methodFilterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  methodChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  methodChipActive: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  methodChipText: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  methodChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});
