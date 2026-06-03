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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ApiPaymentRecord {
  id: number;
  studentName: string;
  amount: number;
  date: string;
  feeTitle: string;
  paymentMethod: string;
  status: string;
  className?: string;
  confirmedBy?: string;
}

interface PaymentRecord {
  id: number;
  studentName: string;
  className: string;
  amount: number;
  paymentMethod: string;
  date: string;
  feeTitle: string;
  confirmedBy: string;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "نقدی",
  BANK_TRANSFER: "انتقال بانکی",
  CARD: "کارت",
  MOBILE_MONEY: "پول موبایل",
  CHECK: "چک",
};

const PAYMENT_METHOD_ICONS: Record<string, string> = {
  CASH: "cash",
  BANK_TRANSFER: "card",
  CARD: "card-outline",
  MOBILE_MONEY: "phone-portrait",
  CHECK: "document-text",
};

export default function PaymentHistory() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const loadPayments = useCallback(async () => {
    try {
      const response = await financeApi.getPaymentHistory({
        search: searchQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 20,
      });

      if (response.success) {
        const apiData = response.data || [];
        // Transform API data to match PaymentRecord interface with defaults
        const transformedData: PaymentRecord[] = apiData.map((item: ApiPaymentRecord) => ({
          id: item.id,
          studentName: item.studentName,
          className: item.className || "نامشخص",
          amount: item.amount,
          paymentMethod: item.paymentMethod,
          date: item.date,
          feeTitle: item.feeTitle,
          confirmedBy: item.confirmedBy || "سیستم",
        }));
        
        if (page === 1) {
          setPayments(transformedData);
        } else {
          setPayments((prev) => [...prev, ...transformedData]);
        }
        setTotal(response.total || apiData.length);
        setTotalPages(response.totalPages || 1);
      }
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, startDate, endDate, page]);

  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, [loadPayments])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadPayments();
  };

  const handleSearch = () => {
    setPage(1);
    loadPayments();
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setShowFilters(false);
    setFilterModalVisible(false);
    setPage(1);
  };

  const applyFilters = () => {
    setFilterModalVisible(false);
    setPage(1);
    loadPayments();
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    return PAYMENT_METHOD_LABELS[method] || method || "نقدی";
  };

  const getPaymentMethodIcon = (method: string) => {
    return PAYMENT_METHOD_ICONS[method] || "cash";
  };

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const hasActiveFilters = startDate !== "" || endDate !== "" || searchQuery !== "";

  const renderPaymentItem = ({ item }: { item: PaymentRecord }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => router.push(`/(admin)/financial/fees/receipt/${item.id}` as any)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.paymentHeader}>
        <View style={styles.studentInfo}>
          <View style={styles.studentAvatar}>
            <Text style={styles.avatarText}>
              {item.studentName?.charAt(0) || "؟"}
            </Text>
          </View>
          <View>
            <Text style={styles.studentName} numberOfLines={1}>
              {item.studentName}
            </Text>
            <Text style={styles.className} numberOfLines={1}>
              {item.className}
            </Text>
          </View>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.paymentAmount}>{formatCurrency(item.amount)}</Text>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>پرداخت شده</Text>
          </View>
        </View>
      </View>

      {/* Fee Title */}
      <View style={styles.feeRow}>
        <Ionicons name="pricetag-outline" size={14} color={Colors.textSecondary} />
        <Text style={styles.feeTitle} numberOfLines={1}>
          {item.feeTitle}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.paymentFooter}>
        <View style={styles.footerLeft}>
          <View style={styles.footerItem}>
            <Ionicons name="calendar-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.footerText}>{item.date}</Text>
          </View>
          <View style={styles.footerDivider} />
          <View style={styles.footerItem}>
            <Ionicons
              name={getPaymentMethodIcon(item.paymentMethod) as any}
              size={13}
              color={Colors.textSecondary}
            />
            <Text style={styles.footerText}>
              {getPaymentMethodLabel(item.paymentMethod)}
            </Text>
          </View>
        </View>
        <View style={styles.footerRight}>
          <Ionicons name="person-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.footerText}>{item.confirmedBy}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Statistics Summary
  const SummaryBar = () => (
    <View style={styles.summaryBar}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{total}</Text>
        <Text style={styles.summaryLabel}>پرداخت</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: Colors.success }]}>
          {formatCurrency(totalAmount)}
        </Text>
        <Text style={styles.summaryLabel}>مجموع</Text>
      </View>
      {hasActiveFilters && (
        <>
          <View style={styles.summaryDivider} />
          <TouchableOpacity onPress={resetFilters} style={styles.clearFiltersBtn}>
            <Ionicons name="close-circle" size={16} color={Colors.danger} />
            <Text style={styles.clearFiltersText}>پاک کردن فیلتر</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  if (loading && page === 1) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="تاریخچه پرداخت‌ها" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="تاریخچه پرداخت‌ها" showBack />

      <SummaryBar />

      {/* Search & Filter Bar */}
      <View style={styles.controlBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجوی دانش‌آموز..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            textAlign="right"
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => { setSearchQuery(""); setPage(1); }}>
              <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, (showFilters || hasActiveFilters) && styles.filterBtnActive]}
          onPress={() => setFilterModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="filter"
            size={16}
            color={(showFilters || hasActiveFilters) ? "white" : Colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Date Filter Quick Access */}
      {showFilters && (
        <View style={styles.quickFilterPanel}>
          <View style={styles.quickFilterRow}>
            <View style={styles.quickFilterField}>
              <Text style={styles.quickFilterLabel}>از تاریخ</Text>
              <TextInput
                style={styles.quickFilterInput}
                placeholder="۱۴۰۳/۰۱/۰۱"
                placeholderTextColor={Colors.textSecondary}
                value={startDate}
                onChangeText={setStartDate}
                textAlign="center"
              />
            </View>
            <Text style={styles.quickFilterSeparator}>تا</Text>
            <View style={styles.quickFilterField}>
              <Text style={styles.quickFilterLabel}>تا تاریخ</Text>
              <TextInput
                style={styles.quickFilterInput}
                placeholder="۱۴۰۳/۱۲/۲۹"
                placeholderTextColor={Colors.textSecondary}
                value={endDate}
                onChangeText={setEndDate}
                textAlign="center"
              />
            </View>
          </View>
          <View style={styles.quickFilterActions}>
            <TouchableOpacity style={styles.applyQuickFilter} onPress={handleSearch} activeOpacity={0.7}>
              <Text style={styles.applyQuickFilterText}>اعمال</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.hideQuickFilter} onPress={() => setShowFilters(false)} activeOpacity={0.7}>
              <Text style={styles.hideQuickFilterText}>بستن</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPaymentItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="cash-outline" size={48} color={Colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>پرداختی یافت نشد</Text>
            <Text style={styles.emptyDesc}>
              {hasActiveFilters
                ? "با فیلترهای اعمال شده پرداختی یافت نشد"
                : "هنوز هیچ پرداختی ثبت نشده است"}
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity style={styles.clearSearchBtn} onPress={resetFilters} activeOpacity={0.7}>
                <Text style={styles.clearSearchText}>پاک کردن فیلترها</Text>
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
              <Text style={styles.loadMoreText}>در حال بارگذاری بیشتر...</Text>
            </View>
          ) : null
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>فیلتر پرداخت‌ها</Text>
              <TouchableOpacity onPress={resetFilters}>
                <Text style={styles.modalClearText}>پاک کردن</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>از تاریخ</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="مثال: ۱۴۰۳-۰۱-۰۱"
                  placeholderTextColor={Colors.textSecondary}
                  value={startDate}
                  onChangeText={setStartDate}
                  textAlign="right"
                />
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>تا تاریخ</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="مثال: ۱۴۰۳-۱۲-۲۹"
                  placeholderTextColor={Colors.textSecondary}
                  value={endDate}
                  onChangeText={setEndDate}
                  textAlign="right"
                />
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>روش پرداخت</Text>
                <View style={styles.methodGrid}>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                    <TouchableOpacity
                      key={value}
                      style={styles.methodFilterChip}
                      onPress={() => {}}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.methodFilterText}>{label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelFilterBtn} onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.cancelFilterText}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyFilterBtn} onPress={applyFilters} activeOpacity={0.7}>
                <Text style={styles.applyFilterText}>اعمال فیلتر</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  clearFiltersBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  clearFiltersText: { fontSize: 11, color: Colors.danger, fontFamily: "Vazirmatn" },
  
  // Control Bar
  controlBar: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8, alignItems: "center" },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 13, color: Colors.text, marginLeft: 6, textAlign: "right", fontFamily: "Vazirmatn" },
  filterBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, justifyContent: "center", alignItems: "center" },
  filterBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  
  // Quick Filter
  quickFilterPanel: { marginHorizontal: 16, marginBottom: 12, backgroundColor: Colors.card, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.border },
  quickFilterRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 10 },
  quickFilterField: { flex: 1 },
  quickFilterLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 4, textAlign: "right" },
  quickFilterInput: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 8, fontSize: 13, color: Colors.text, fontFamily: "Vazirmatn" },
  quickFilterSeparator: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn", paddingBottom: 8 },
  quickFilterActions: { flexDirection: "row", gap: 8 },
  applyQuickFilter: { flex: 1, backgroundColor: Colors.primary, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  applyQuickFilterText: { color: "white", fontSize: 13, fontWeight: "500", fontFamily: "Vazirmatn" },
  hideQuickFilter: { flex: 1, backgroundColor: Colors.background, paddingVertical: 8, borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  hideQuickFilterText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  // List
  listContent: { padding: 16, paddingTop: 0, paddingBottom: 30 },
  
  // Payment Card
  paymentCard: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  paymentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  studentInfo: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  studentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${Colors.primary}15`, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 16, fontWeight: "bold", color: Colors.primary, fontFamily: "Vazirmatn" },
  studentName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  className: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  amountContainer: { alignItems: "flex-end" },
  paymentAmount: { fontSize: 16, fontWeight: "bold", color: Colors.success, fontFamily: "Vazirmatn", marginBottom: 4 },
  statusBadge: { flexDirection: "row", alignItems: "center", backgroundColor: `${Colors.success}15`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, gap: 4 },
  statusDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.success },
  statusText: { fontSize: 9, color: Colors.success, fontWeight: "500", fontFamily: "Vazirmatn" },
  feeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 10 },
  feeTitle: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn", flex: 1 },
  paymentFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10 },
  footerLeft: { flexDirection: "row", alignItems: "center" },
  footerItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  footerDivider: { width: 1, height: 12, backgroundColor: Colors.border, marginHorizontal: 8 },
  footerRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  footerText: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  // Empty State
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: `${Colors.textSecondary}10`, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center", marginBottom: 16 },
  clearSearchBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: `${Colors.primary}15` },
  clearSearchText: { fontSize: 13, color: Colors.primary, fontFamily: "Vazirmatn" },
  
  // Load More
  loadMoreContainer: { flexDirection: "row", justifyContent: "center", alignItems: "center", paddingVertical: 20, gap: 8 },
  loadMoreText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "white", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: 17, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn" },
  modalClearText: { fontSize: 14, color: Colors.danger, fontFamily: "Vazirmatn" },
  modalBody: { padding: 16 },
  modalFooter: { flexDirection: "row", padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, gap: 12 },
  
  filterGroup: { marginBottom: 16 },
  filterLabel: { fontSize: 13, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 8, textAlign: "right" },
  filterInput: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 14, color: Colors.text, fontFamily: "Vazirmatn" },
  methodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  methodFilterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  methodFilterText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  cancelFilterBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: Colors.background, alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  cancelFilterText: { fontSize: 15, fontWeight: "500", color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  applyFilterBtn: { flex: 2, paddingVertical: 14, borderRadius: 10, backgroundColor: Colors.primary, alignItems: "center" },
  applyFilterText: { fontSize: 15, fontWeight: "600", color: "white", fontFamily: "Vazirmatn" },
});