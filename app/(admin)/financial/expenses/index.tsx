import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Expense {
  id: number;
  category: string;
  categoryId: number;
  amount: number;
  description: string;
  date: string;
  receiptUrl?: string;
  createdBy: string;
}

interface ExpenseStats {
  totalThisMonth: number;
  totalThisYear: number;
  averageDaily: number;
  topCategory: {
    name: string;
    amount: number;
  };
  recentExpenses: Expense[];
}

const CATEGORY_COLORS: Record<string, string> = {
  "اجاره": "#FF6B6B",
  "حقوق": "#4ECDC4",
  "لوازم التحریر": "#45B7D1",
  "تعمیرات": "#96CEB4",
  "آب و برق": "#FFEAA7",
  "اینترنت": "#DFE6E9",
  "بیمه": "#74B9FF",
  "سایر": "#A8E6CF",
};

export default function ExpensesList() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [expensesRes, statsRes] = await Promise.all([
        financeApi.getExpenses({
          category: selectedCategory || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page,
          limit: 20,
        }),
        financeApi.getExpenseStatistics(),
      ]);

      if (expensesRes.success) {
        setExpenses(expensesRes.data.expenses || []);
        setTotal(expensesRes.data.total || 0);
        setTotalPages(expensesRes.data.totalPages || 1);
        
        // Extract unique categories
        const uniqueCats = [...new Set((expensesRes.data.expenses || []).map((e: Expense) => e.category))];
        setCategories(uniqueCats);
      }

      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, startDate, endDate, page]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadData();
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const resetFilters = () => {
    setSelectedCategory(null);
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
    setFilterModalVisible(false);
    setPage(1);
  };

  const getCategoryColor = (category: string) => {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS["سایر"];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fa-IR");
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const hasActiveFilters = selectedCategory !== null || startDate !== "" || endDate !== "";

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      style={styles.expenseCard}
      onPress={() => router.push(`/(admin)/financial/expenses/edit?id=${item.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.expenseHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: `${getCategoryColor(item.category)}20` }]}>
          <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
            {item.category}
          </Text>
        </View>
        <Text style={styles.expenseAmount}>{formatCurrency(item.amount)}</Text>
      </View>

      <Text style={styles.expenseDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.expenseFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.footerText}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="person-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.footerText}>{item.createdBy}</Text>
        </View>
        {item.receiptUrl && (
          <View style={styles.receiptBadge}>
            <Ionicons name="document-attach" size={10} color={Colors.info} />
            <Text style={styles.receiptText}>رسید</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // Summary Bar Component
  const SummaryBar = () => (
    <View style={styles.summaryBar}>
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: Colors.danger }]}>
          {formatCurrency(stats?.totalThisMonth || 0)}
        </Text>
        <Text style={styles.summaryLabel}>هزینه این ماه</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: Colors.warning }]}>
          {formatCurrency(stats?.totalThisYear || 0)}
        </Text>
        <Text style={styles.summaryLabel}>هزینه امسال</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>
          {stats?.topCategory?.name || "-"}
        </Text>
        <Text style={styles.summaryLabel}>بیشترین هزینه</Text>
      </View>
    </View>
  );

  if (loading && page === 1) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="مدیریت هزینه‌ها" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="مدیریت هزینه‌ها" showBack />

      <SummaryBar />

      {/* Search & Filter Bar */}
      <View style={styles.controlBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجوی هزینه..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, hasActiveFilters && styles.filterBtnActive]}
          onPress={() => setFilterModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="filter" size={16} color={hasActiveFilters ? "white" : Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/(admin)/financial/expenses/create")}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {hasActiveFilters && (
        <View style={styles.activeFilters}>
          {selectedCategory && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>{selectedCategory}</Text>
              <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                <Ionicons name="close-circle" size={14} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity onPress={resetFilters} style={styles.clearAllBtn}>
            <Text style={styles.clearAllText}>پاک کردن همه</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderExpenseItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={48} color={Colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>هزینه‌ای ثبت نشده است</Text>
            <Text style={styles.emptyDesc}>
              {hasActiveFilters ? "با فیلترهای اعمال شده هزینه‌ای یافت نشد" : "برای شروع، یک هزینه جدید ثبت کنید"}
            </Text>
            {!hasActiveFilters && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push("/(admin)/financial/expenses/create")}
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle" size={20} color="white" />
                <Text style={styles.emptyButtonText}>ثبت هزینه جدید</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          page < totalPages ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
      />

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} animationType="slide" transparent={true} onRequestClose={() => setFilterModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>فیلتر هزینه‌ها</Text>
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.modalClearText}>پاک کردن</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Category Filter */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>دسته‌بندی</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.categoryChips}>
                    <TouchableOpacity
                      style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
                      onPress={() => setSelectedCategory(null)}
                    >
                      <Text style={[styles.categoryChipText, !selectedCategory && styles.categoryChipTextActive]}>همه</Text>
                    </TouchableOpacity>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                        onPress={() => setSelectedCategory(cat)}
                      >
                        <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipTextActive]}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Date Range */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>بازه زمانی</Text>
                <View style={styles.dateRow}>
                  <View style={styles.dateField}>
                    <Text style={styles.dateLabel}>از تاریخ</Text>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="۱۴۰۳/۰۱/۰۱"
                      placeholderTextColor={Colors.textSecondary}
                      value={startDate}
                      onChangeText={setStartDate}
                      textAlign="center"
                    />
                  </View>
                  <Text style={styles.dateSeparator}>تا</Text>
                  <View style={styles.dateField}>
                    <Text style={styles.dateLabel}>تا تاریخ</Text>
                    <TextInput
                      style={styles.dateInput}
                      placeholder="۱۴۰۳/۱۲/۲۹"
                      placeholderTextColor={Colors.textSecondary}
                      value={endDate}
                      onChangeText={setEndDate}
                      textAlign="center"
                    />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelFilterBtn} onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.cancelFilterText}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFilterBtn}
                onPress={() => {
                  setFilterModalVisible(false);
                  setPage(1);
                  loadData();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.applyFilterText}>اعمال فیلتر</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FAB for adding expense - shown when list is not empty */}
      {expenses.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/(admin)/financial/expenses/create")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  // Summary Bar
  summaryBar: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryItem: { alignItems: "center" },
  summaryDivider: { width: 1, height: 24, backgroundColor: Colors.border },
  summaryValue: { fontSize: 16, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  summaryLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  // Control Bar
  controlBar: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8, alignItems: "center" },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 13, color: Colors.text, marginLeft: 6, textAlign: "right", fontFamily: "Vazirmatn" },
  filterBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, justifyContent: "center", alignItems: "center" },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  addBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" },
  
  // Active Filters
  activeFilters: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, paddingBottom: 8, gap: 8, alignItems: "center" },
  filterChip: { flexDirection: "row", alignItems: "center", backgroundColor: `${Colors.primary}15`, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, gap: 6 },
  filterChipText: { fontSize: 12, color: Colors.primary, fontFamily: "Vazirmatn" },
  clearAllBtn: { paddingHorizontal: 8, paddingVertical: 5 },
  clearAllText: { fontSize: 12, color: Colors.danger, fontFamily: "Vazirmatn" },
  
  // List
  listContent: { padding: 16, paddingTop: 0, paddingBottom: 80 },
  
  // Expense Card
  expenseCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  expenseHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 12, fontWeight: "500", fontFamily: "Vazirmatn" },
  expenseAmount: { fontSize: 16, fontWeight: "bold", color: Colors.danger, fontFamily: "Vazirmatn" },
  expenseDescription: { fontSize: 13, color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 10, lineHeight: 20, textAlign: "right" },
  expenseFooter: { flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8 },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  footerText: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  receiptBadge: { flexDirection: "row", alignItems: "center", backgroundColor: `${Colors.info}15`, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 3 },
  receiptText: { fontSize: 9, color: Colors.info, fontFamily: "Vazirmatn" },
  
  // Empty State
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: `${Colors.textSecondary}10`, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center", marginBottom: 16 },
  emptyButton: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, gap: 8 },
  emptyButtonText: { color: "white", fontSize: 14, fontWeight: "500", fontFamily: "Vazirmatn" },
  
  // Load More
  loadMoreContainer: { paddingVertical: 20, alignItems: "center" },
  
  // FAB
  fab: { position: "absolute", right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center", shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "white", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: 17, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn" },
  modalClearText: { fontSize: 14, color: Colors.danger, fontFamily: "Vazirmatn" },
  modalBody: { padding: 20 },
  modalFooter: { flexDirection: "row", padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, gap: 12 },
  
  filterGroup: { marginBottom: 20 },
  filterLabel: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 10, textAlign: "right" },
  
  categoryChips: { flexDirection: "row", gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryChipText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  categoryChipTextActive: { color: "white" },
  
  dateRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  dateField: { flex: 1 },
  dateLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 4, textAlign: "right" },
  dateInput: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, fontSize: 13, color: Colors.text, fontFamily: "Vazirmatn" },
  dateSeparator: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginTop: 14 },
  
  cancelFilterBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: Colors.background, alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  cancelFilterText: { fontSize: 15, fontWeight: "500", color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  applyFilterBtn: { flex: 2, paddingVertical: 14, borderRadius: 10, backgroundColor: Colors.primary, alignItems: "center" },
  applyFilterText: { fontSize: 15, fontWeight: "600", color: "white", fontFamily: "Vazirmatn" },
});