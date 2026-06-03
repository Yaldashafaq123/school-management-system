import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency, IncomeStatement as IncomeStatementType } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
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

interface MonthlyData {
  month: number;
  monthName: string;
  income: number;
  expenses: number;
  profit: number;
}

interface IncomeStatementData {
  year: number;
  monthlyData: MonthlyData[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
  };
}

export default function IncomeStatementReport() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<IncomeStatementData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);

  const loadData = useCallback(async () => {
    try {
      // getIncomeStatement returns IncomeStatement directly, not wrapped in { success, data }
      const response: IncomeStatementType = await financeApi.getIncomeStatement({ year: selectedYear });
      // Transform API response to match local interface
      const transformedData: IncomeStatementData = {
        year: response.year || selectedYear,
        monthlyData: response.monthlyData || [],
        summary: response.summary || {
          totalIncome: 0,
          totalExpenses: 0,
          netProfit: 0,
        },
      };
      setData(transformedData);
    } catch (error) {
      console.error("Error loading income statement:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedYear]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const years = [1402, 1403, 1404, 1405, 1406];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="صورت سود و زیان" showBack />
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
        <Header title="صورت سود و زیان" showBack />
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

  const { summary, monthlyData } = data;
  const isProfitable = summary.netProfit >= 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="صورت سود و زیان" showBack />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Year Selector */}
        <View style={styles.yearSelector}>
          <Text style={styles.yearLabel}>سال مالی:</Text>
          <TouchableOpacity
            style={styles.yearPicker}
            onPress={() => setShowYearPicker(!showYearPicker)}
            activeOpacity={0.7}
          >
            <Text style={styles.yearValue}>{selectedYear}</Text>
            <Ionicons name="chevron-down" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {showYearPicker && (
          <View style={styles.yearOptions}>
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                style={[styles.yearOption, selectedYear === year && styles.yearOptionActive]}
                onPress={() => {
                  setSelectedYear(year);
                  setShowYearPicker(false);
                }}
              >
                <Text style={[styles.yearOptionText, selectedYear === year && styles.yearOptionTextActive]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderTopColor: Colors.success }]}>
            <Text style={styles.summaryLabel}>کل درآمد</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              {formatCurrency(summary.totalIncome)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: Colors.danger }]}>
            <Text style={styles.summaryLabel}>کل هزینه</Text>
            <Text style={[styles.summaryValue, { color: Colors.danger }]}>
              {formatCurrency(summary.totalExpenses)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: isProfitable ? Colors.success : Colors.danger }]}>
            <Text style={styles.summaryLabel}>سود خالص</Text>
            <Text style={[styles.summaryValue, { color: isProfitable ? Colors.success : Colors.danger }]}>
              {formatCurrency(summary.netProfit)}
            </Text>
          </View>
        </View>

        {/* Monthly Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.monthCol]}>ماه</Text>
            <Text style={[styles.tableHeaderCell, styles.numberCol]}>درآمد</Text>
            <Text style={[styles.tableHeaderCell, styles.numberCol]}>هزینه</Text>
            <Text style={[styles.tableHeaderCell, styles.numberCol]}>سود</Text>
          </View>

          {monthlyData.map((item) => {
            const isPositive = item.profit >= 0;
            return (
              <View key={item.month} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.monthCol]}>{item.monthName}</Text>
                <Text style={[styles.tableCell, styles.numberCol, { color: Colors.success }]}>
                  {formatCurrency(item.income)}
                </Text>
                <Text style={[styles.tableCell, styles.numberCol, { color: Colors.danger }]}>
                  {formatCurrency(item.expenses)}
                </Text>
                <Text style={[styles.tableCell, styles.numberCol, { color: isPositive ? Colors.success : Colors.danger }]}>
                  {formatCurrency(item.profit)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Chart Placeholder - Can integrate with a chart library */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>نمودار سود و زیان ماهانه</Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="bar-chart" size={48} color={Colors.textSecondary} />
            <Text style={styles.chartPlaceholderText}>
              نمودار تعاملی - برای مشاهده دقیق تر، از خروجی Excel استفاده کنید
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
  
  yearSelector: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", marginBottom: 16, gap: 8 },
  yearLabel: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  yearPicker: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4, borderWidth: 1, borderColor: Colors.border },
  yearValue: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },
  yearOptions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginBottom: 16 },
  yearOption: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  yearOptionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  yearOptionText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  yearOptionTextActive: { color: "white" },
  
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 14, alignItems: "center", borderTopWidth: 3 },
  summaryLabel: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 6 },
  summaryValue: { fontSize: 14, fontWeight: "bold", fontFamily: "Vazirmatn" },
  
  table: { backgroundColor: Colors.card, borderRadius: 14, overflow: "hidden", marginBottom: 20 },
  tableHeader: { flexDirection: "row", backgroundColor: `${Colors.primary}10`, paddingVertical: 12, paddingHorizontal: 12 },
  tableHeaderCell: { fontSize: 12, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn" },
  tableRow: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tableCell: { fontSize: 12, color: Colors.text, fontFamily: "Vazirmatn" },
  monthCol: { flex: 2, textAlign: "right" },
  numberCol: { flex: 3, textAlign: "center" },
  
  chartContainer: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, marginBottom: 20 },
  chartTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 12, textAlign: "center" },
  chartPlaceholder: { alignItems: "center", paddingVertical: 30, backgroundColor: Colors.background, borderRadius: 10 },
  chartPlaceholderText: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center", marginTop: 10 },
});