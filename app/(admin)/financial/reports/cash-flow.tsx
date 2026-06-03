import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface CashFlowData {
  startDate: string;
  endDate: string;
  openingBalance: number;
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  closingBalance: number;
  inflows: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  outflows: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}

export default function CashFlowReport() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<CashFlowData | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const response = await financeApi.getCashFlowReport({ startDate, endDate });
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error loading cash flow:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [startDate, endDate]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleApplyFilters = () => {
    setLoading(true);
    loadData();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setLoading(true);
    loadData();
    setShowFilters(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="گزارش جریان نقدی" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="گزارش جریان نقدی" showBack />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.danger} />
          <Text style={styles.errorText}>خطا در بارگذاری اطلاعات</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>تلاش مجدد</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isPositive = data.netCashFlow >= 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="گزارش جریان نقدی" showBack />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Filter Button */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
          activeOpacity={0.7}
        >
          <Ionicons name="filter" size={16} color={Colors.primary} />
          <Text style={styles.filterButtonText}>فیلتر بازه زمانی</Text>
        </TouchableOpacity>

        {/* Filter Panel */}
        {showFilters && (
          <View style={styles.filterPanel}>
            <View style={styles.filterRow}>
              <View style={styles.filterField}>
                <Text style={styles.filterLabel}>از تاریخ</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="۱۴۰۳/۰۱/۰۱"
                  placeholderTextColor={Colors.textSecondary}
                  value={startDate}
                  onChangeText={setStartDate}
                  textAlign="center"
                />
              </View>
              <Text style={styles.filterSeparator}>تا</Text>
              <View style={styles.filterField}>
                <Text style={styles.filterLabel}>تا تاریخ</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="۱۴۰۳/۱۲/۲۹"
                  placeholderTextColor={Colors.textSecondary}
                  value={endDate}
                  onChangeText={setEndDate}
                  textAlign="center"
                />
              </View>
            </View>
            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.applyFilterBtn} onPress={handleApplyFilters} activeOpacity={0.7}>
                <Text style={styles.applyFilterText}>اعمال</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.clearFilterBtn} onPress={resetFilters} activeOpacity={0.7}>
                <Text style={styles.clearFilterText}>پاک کردن</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Period Display */}
        <View style={styles.periodCard}>
          <Ionicons name="calendar" size={16} color={Colors.primary} />
          <Text style={styles.periodText}>
            بازه گزارش: {data.startDate || "شروع"} تا {data.endDate || "امروز"}
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>موجودی اول دوره</Text>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>
              {formatCurrency(data.openingBalance)}
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>موجودی آخر دوره</Text>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>
              {formatCurrency(data.closingBalance)}
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderTopColor: Colors.success }]}>
            <Text style={styles.summaryLabel}>کل ورودی‌ها</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              + {formatCurrency(data.totalInflow)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: Colors.danger }]}>
            <Text style={styles.summaryLabel}>کل خروجی‌ها</Text>
            <Text style={[styles.summaryValue, { color: Colors.danger }]}>
              - {formatCurrency(data.totalOutflow)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: isPositive ? Colors.success : Colors.danger }]}>
            <Text style={styles.summaryLabel}>جریان نقد خالص</Text>
            <Text style={[styles.summaryValue, { color: isPositive ? Colors.success : Colors.danger }]}>
              {isPositive ? "+" : "-"} {formatCurrency(Math.abs(data.netCashFlow))}
            </Text>
          </View>
        </View>

        {/* Inflows Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ورودی‌ها (درآمدها)</Text>
          {data.inflows.map((item, index) => (
            <View key={index} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.category}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${item.percentage}%`, backgroundColor: Colors.success }]} />
                </View>
              </View>
              <View style={styles.categoryAmount}>
                <Text style={styles.amountText}>{formatCurrency(item.amount)}</Text>
                <Text style={styles.percentageText}>{item.percentage}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Outflows Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>خروجی‌ها (هزینه‌ها)</Text>
          {data.outflows.map((item, index) => (
            <View key={index} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{item.category}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${item.percentage}%`, backgroundColor: Colors.danger }]} />
                </View>
              </View>
              <View style={styles.categoryAmount}>
                <Text style={styles.amountText}>{formatCurrency(item.amount)}</Text>
                <Text style={styles.percentageText}>{item.percentage}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Net Cash Flow Highlight */}
        <View style={[styles.netCard, { backgroundColor: isPositive ? `${Colors.success}10` : `${Colors.danger}10` }]}>
          <Ionicons name={isPositive ? "trending-up" : "trending-down"} size={24} color={isPositive ? Colors.success : Colors.danger} />
          <View>
            <Text style={styles.netLabel}>جریان نقد خالص</Text>
            <Text style={[styles.netValue, { color: isPositive ? Colors.success : Colors.danger }]}>
              {formatCurrency(Math.abs(data.netCashFlow))}
              <Text style={styles.netSign}>{isPositive ? " ورودی" : " خروجی"}</Text>
            </Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  errorText: { fontSize: 16, color: Colors.danger, marginTop: 12, marginBottom: 16, fontFamily: "Vazirmatn" },
  retryButton: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  retryButtonText: { color: "white", fontSize: 14, fontFamily: "Vazirmatn" },
  content: { flex: 1, padding: 16 },
  
  filterButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.card, paddingVertical: 10, borderRadius: 10, gap: 6, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  filterButtonText: { fontSize: 13, color: Colors.primary, fontFamily: "Vazirmatn" },
  
  filterPanel: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  filterRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 12 },
  filterField: { flex: 1 },
  filterLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 4, textAlign: "right" },
  filterInput: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 8, fontSize: 13, color: Colors.text, fontFamily: "Vazirmatn" },
  filterSeparator: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn", paddingBottom: 8 },
  filterActions: { flexDirection: "row", gap: 8 },
  applyFilterBtn: { flex: 1, backgroundColor: Colors.primary, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  applyFilterText: { color: "white", fontSize: 13, fontFamily: "Vazirmatn" },
  clearFilterBtn: { flex: 1, backgroundColor: `${Colors.danger}10`, paddingVertical: 8, borderRadius: 8, alignItems: "center" },
  clearFilterText: { color: Colors.danger, fontSize: 13, fontFamily: "Vazirmatn" },
  
  periodCard: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: `${Colors.primary}10`, borderRadius: 10, padding: 10, marginBottom: 16, gap: 8 },
  periodText: { fontSize: 12, color: Colors.primary, fontFamily: "Vazirmatn" },
  
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 14, alignItems: "center", borderTopWidth: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  summaryLabel: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 6 },
  summaryValue: { fontSize: 15, fontWeight: "bold", fontFamily: "Vazirmatn" },
  
  section: { marginBottom: 20, backgroundColor: Colors.card, borderRadius: 14, padding: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 12, textAlign: "right" },
  
  categoryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  categoryInfo: { flex: 1, marginRight: 12 },
  categoryName: { fontSize: 13, color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 4, textAlign: "right" },
  progressBar: { height: 6, backgroundColor: Colors.background, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  categoryAmount: { alignItems: "flex-end", minWidth: 100 },
  amountText: { fontSize: 14, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn" },
  percentageText: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginTop: 2 },
  
  netCard: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, borderRadius: 14, padding: 16, marginBottom: 20 },
  netLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center" },
  netValue: { fontSize: 20, fontWeight: "bold", fontFamily: "Vazirmatn" },
  netSign: { fontSize: 12, fontWeight: "normal" },
});