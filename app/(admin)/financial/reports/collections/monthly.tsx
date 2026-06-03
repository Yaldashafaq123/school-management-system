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
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface MonthlyItem {
  month: number;
  monthName: string;
  totalAmount: number;
  count: number;
  averagePerDay: number;
}

interface MonthlyReportData {
  year: number;
  months: MonthlyItem[];
  summary: {
    totalYearly: number;
    totalCount: number;
    bestMonth: string;
    bestMonthAmount: number;
    averageMonthly: number;
  };
}

export default function MonthlyCollectionsReport() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<MonthlyReportData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const response = await financeApi.getMonthlyCollections(selectedYear);
      if (response.success && response.data) {
        // Transform API data to match local interface
        const transformedData: MonthlyReportData = {
          year: response.data.year,
          months: response.data.months.map((item: any) => ({
            month: item.month,
            monthName: item.monthName,
            totalAmount: item.totalAmount,
            count: item.count,
            averagePerDay: item.averagePerDay,
          })),
          summary: response.data.summary,
        };
        setData(transformedData);
      }
    } catch (error) {
      console.error("Error loading monthly collections:", error);
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
        <Header title="گزارش دریافتی ماهانه" showBack />
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
        <Header title="گزارش دریافتی ماهانه" showBack />
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

  const { summary, months } = data;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="گزارش دریافتی ماهانه" showBack />

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
            <Text style={styles.summaryLabel}>کل دریافتی سال</Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              {formatCurrency(summary.totalYearly)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: Colors.primary }]}>
            <Text style={styles.summaryLabel}>میانگین ماهانه</Text>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>
              {formatCurrency(summary.averageMonthly)}
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderTopColor: Colors.warning }]}>
            <Text style={styles.summaryLabel}>بهترین ماه</Text>
            <Text style={[styles.summaryValue, { color: Colors.warning }]}>
              {summary.bestMonth}
            </Text>
            <Text style={styles.summarySubtext}>
              {formatCurrency(summary.bestMonthAmount)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: Colors.info }]}>
            <Text style={styles.summaryLabel}>تعداد کل پرداخت</Text>
            <Text style={[styles.summaryValue, { color: Colors.info }]}>
              {summary.totalCount}
            </Text>
          </View>
        </View>

        {/* Monthly Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>نمودار دریافتی ماهانه</Text>
          <View style={styles.barChart}>
            {months.map((item, index) => {
              const maxAmount = Math.max(...months.map(m => m.totalAmount), 1);
              const heightPercent = (item.totalAmount / maxAmount) * 100;
              return (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barWrapper}>
                    <View style={[styles.bar, { height: `${Math.max(heightPercent, 4)}%`, backgroundColor: Colors.primary }]} />
                  </View>
                  <Text style={styles.barLabel}>{item.monthName.slice(0, 2)}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Monthly Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.monthCol]}>ماه</Text>
            <Text style={[styles.tableHeaderCell, styles.numberCol]}>دریافتی</Text>
            <Text style={[styles.tableHeaderCell, styles.numberCol]}>تعداد</Text>
            <Text style={[styles.tableHeaderCell, styles.numberCol]}>میانگین روزانه</Text>
          </View>

          {months.map((item) => (
            <TouchableOpacity
              key={item.month}
              style={styles.tableRow}
              onPress={() => router.push(`/(admin)/financial/reports/collections/daily?year=${selectedYear}&month=${item.month}` as any)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tableCell, styles.monthCol]}>{item.monthName}</Text>
              <Text style={[styles.tableCell, styles.numberCol, { color: Colors.success }]}>
                {formatCurrency(item.totalAmount)}
              </Text>
              <Text style={[styles.tableCell, styles.numberCol]}>
                {item.count}
              </Text>
              <Text style={[styles.tableCell, styles.numberCol]}>
                {formatCurrency(item.averagePerDay)}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Total Row */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <Text style={[styles.tableCell, styles.monthCol, styles.totalText]}>جمع کل</Text>
            <Text style={[styles.tableCell, styles.numberCol, styles.totalText, { color: Colors.success }]}>
              {formatCurrency(summary.totalYearly)}
            </Text>
            <Text style={[styles.tableCell, styles.numberCol, styles.totalText]}>
              {summary.totalCount}
            </Text>
            <Text style={[styles.tableCell, styles.numberCol, styles.totalText]}>
              {formatCurrency(summary.averageMonthly)}
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

  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  summaryCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 14, alignItems: "center", borderTopWidth: 3 },
  summaryLabel: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 6 },
  summaryValue: { fontSize: 16, fontWeight: "bold", fontFamily: "Vazirmatn" },
  summarySubtext: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginTop: 2 },

  chartContainer: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, marginBottom: 20 },
  chartTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 16, textAlign: "center" },
  barChart: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 180, marginBottom: 8 },
  barColumn: { alignItems: "center", flex: 1 },
  barWrapper: { height: 150, justifyContent: "flex-end", width: 30 },
  bar: { width: 24, borderRadius: 8, alignSelf: "center" },
  barLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginTop: 6 },

  table: { backgroundColor: Colors.card, borderRadius: 14, overflow: "hidden" },
  tableHeader: { flexDirection: "row", backgroundColor: `${Colors.primary}10`, paddingVertical: 12, paddingHorizontal: 12 },
  tableHeaderCell: { fontSize: 12, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn" },
  tableRow: { flexDirection: "row", paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  totalRow: { backgroundColor: `${Colors.primary}05` },
  tableCell: { fontSize: 12, color: Colors.text, fontFamily: "Vazirmatn" },
  monthCol: { flex: 2, textAlign: "right" },
  numberCol: { flex: 3, textAlign: "center" },
  totalText: { fontWeight: "600", color: Colors.text },
});