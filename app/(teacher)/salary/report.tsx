// app/(teacher)/salary/report.tsx - Connected to Backend
import {
  SalaryRecord,
  SalarySummary,
  formatCurrency,
  teacherApi,
} from "@/src/config/teacherApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { Colors } from "../../../constants/Colors";
import { useAuth } from "../../../contexts/AuthContext";

const STATUS_COLORS = {
  PAID: "#10b981",
  PENDING: "#f59e0b",
  PARTIAL: "#3b82f6",
  CANCELLED: "#ef4444",
};

const STATUS_LABELS = {
  PAID: "پرداخت شده",
  PENDING: "در انتظار",
  PARTIAL: "ناقص",
  CANCELLED: "لغو شده",
};

const AFGHAN_MONTHS = [
  "حمل",
  "ثور",
  "جوزا",
  "سرطان",
  "اسد",
  "سنبله",
  "میزان",
  "عقرب",
  "قوس",
  "جدی",
  "دلو",
  "حوت",
];

export default function SalaryReportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [summary, setSummary] = useState<SalarySummary | null>(null);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear() - 621,
  );

  useEffect(() => {
    fetchSalaryData();
  }, [selectedYear]);

  const fetchSalaryData = async () => {
    try {
      const response = await teacherApi.getSalaryReport({ year: selectedYear });

      if (response.success) {
        setRecords(response.data.records || []);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error("Fetch salary error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSalaryData();
  };

  const getMonthName = (month: number) => {
    return AFGHAN_MONTHS[month - 1] || month.toString();
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "#94a3b8";
  };

  const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
  };

  const handleYearChange = (direction: "prev" | "next") => {
    if (direction === "prev") {
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedYear(selectedYear + 1);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>گزارش معاشات</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            // Show year picker
          }}
        >
          <Ionicons name="filter-outline" size={22} color="#1e293b" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Year Selector */}
        <View style={styles.yearSelector}>
          <TouchableOpacity onPress={() => handleYearChange("prev")}>
            <Ionicons name="chevron-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.yearText}>سال {selectedYear}</Text>
          <TouchableOpacity onPress={() => handleYearChange("next")}>
            <Ionicons name="chevron-forward" size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        {summary && (
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryCard, { backgroundColor: "#d1fae5" }]}>
              <Text style={styles.summaryLabel}>مجموع دریافتی</Text>
              <Text style={[styles.summaryValue, { color: "#10b981" }]}>
                {formatCurrency(summary.totalEarned)}
              </Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: "#fef3c7" }]}>
              <Text style={styles.summaryLabel}>معوقه</Text>
              <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>
                {formatCurrency(summary.totalPending)}
              </Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: "#dbeafe" }]}>
              <Text style={styles.summaryLabel}>میانگین ماهانه</Text>
              <Text style={[styles.summaryValue, { color: "#3b82f6" }]}>
                {formatCurrency(summary.averageSalary)}
              </Text>
            </View>
          </View>
        )}

        {/* Current Month Status */}
        {summary && (
          <View style={styles.currentMonthCard}>
            <Text style={styles.currentMonthTitle}>
              وضعیت ماه جاری ({getMonthName(new Date().getMonth() + 1)})
            </Text>
            <View style={styles.currentMonthRow}>
              <Text style={styles.currentMonthAmount}>
                {formatCurrency(summary.thisMonth.amount)}
              </Text>
              <View
                style={[
                  styles.currentMonthStatus,
                  {
                    backgroundColor:
                      getStatusColor(summary.thisMonth.status) + "20",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.currentMonthStatusText,
                    { color: getStatusColor(summary.thisMonth.status) },
                  ]}
                >
                  {summary.thisMonth.status === "PAID"
                    ? "پرداخت شده"
                    : summary.thisMonth.status === "PARTIAL"
                      ? "ناقص"
                      : "در انتظار"}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Monthly Breakdown */}
        <Text style={styles.sectionTitle}>معاشات ماهانه</Text>
        {records.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              هیچ معاشی برای سال {selectedYear} یافت نشد
            </Text>
          </View>
        ) : (
          records.map((record) => (
            <TouchableOpacity
              key={record.id}
              style={styles.recordCard}
              activeOpacity={0.7}
            >
              <View style={styles.recordHeader}>
                <Text style={styles.recordMonth}>
                  {getMonthName(record.month)} {record.year}
                </Text>
                <View
                  style={[
                    styles.recordStatus,
                    { backgroundColor: getStatusColor(record.status) + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.recordStatusText,
                      { color: getStatusColor(record.status) },
                    ]}
                  >
                    {getStatusLabel(record.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.recordDetails}>
                <View style={styles.recordDetailItem}>
                  <Text style={styles.recordDetailLabel}>معاش پایه</Text>
                  <Text style={styles.recordDetailValue}>
                    {formatCurrency(record.baseSalary)}
                  </Text>
                </View>
                {record.bonusAmount > 0 && (
                  <View style={styles.recordDetailItem}>
                    <Text
                      style={[styles.recordDetailLabel, { color: "#10b981" }]}
                    >
                      پاداش
                    </Text>
                    <Text
                      style={[styles.recordDetailValue, { color: "#10b981" }]}
                    >
                      +{formatCurrency(record.bonusAmount)}
                    </Text>
                  </View>
                )}
                {record.overtimeAmount > 0 && (
                  <View style={styles.recordDetailItem}>
                    <Text
                      style={[styles.recordDetailLabel, { color: "#3b82f6" }]}
                    >
                      اضافه کار ({record.overtimeHours}h)
                    </Text>
                    <Text
                      style={[styles.recordDetailValue, { color: "#3b82f6" }]}
                    >
                      +{formatCurrency(record.overtimeAmount)}
                    </Text>
                  </View>
                )}
                {record.deductionAmount > 0 && (
                  <View style={styles.recordDetailItem}>
                    <Text
                      style={[styles.recordDetailLabel, { color: "#ef4444" }]}
                    >
                      کسورات
                    </Text>
                    <Text
                      style={[styles.recordDetailValue, { color: "#ef4444" }]}
                    >
                      -{formatCurrency(record.deductionAmount)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.recordFooter}>
                <Text style={styles.recordTotalLabel}>مجموع</Text>
                <Text style={styles.recordTotal}>
                  {formatCurrency(record.finalAmount)}
                </Text>
              </View>

              {record.paidAt && (
                <Text style={styles.recordPaidDate}>
                  تاریخ پرداخت:{" "}
                  {new Date(record.paidAt).toLocaleDateString("fa-IR")}
                </Text>
              )}
            </TouchableOpacity>
          ))
        )}

        {/* Monthly Trend Chart (Text-based) */}
        {summary && summary.monthlyData && summary.monthlyData.length > 0 && (
          <View style={styles.trendCard}>
            <Text style={styles.trendTitle}>روند معاشات ماهانه</Text>
            {summary.monthlyData.map((item, index) => {
              const maxAmount = Math.max(
                ...summary.monthlyData.map((d) => d.amount),
              );
              const percentage =
                maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
              const barColor =
                item.status === "paid"
                  ? "#10b981"
                  : item.status === "partial"
                    ? "#3b82f6"
                    : "#f59e0b";
              return (
                <View key={index} style={styles.trendItem}>
                  <Text style={styles.trendMonth}>{item.month}</Text>
                  <View style={styles.trendBarContainer}>
                    <View
                      style={[
                        styles.trendBar,
                        {
                          width: `${Math.max(percentage, 5)}%`,
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.trendAmount}>
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#10b981" }]} />
            <Text style={styles.legendText}>پرداخت شده</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#f59e0b" }]} />
            <Text style={styles.legendText}>در انتظار</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#3b82f6" }]} />
            <Text style={styles.legendText}>ناقص</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
            <Text style={styles.legendText}>لغو شده</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#64748b" },
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
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1e293b" },
  filterButton: { padding: 4 },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },
  yearSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  yearText: { fontSize: 16, fontWeight: "600", color: "#1e293b" },
  summaryGrid: { flexDirection: "row", gap: 10, marginBottom: 16 },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  summaryLabel: { fontSize: 12, color: "#64748b" },
  summaryValue: { fontSize: 18, fontWeight: "700", marginTop: 4 },
  currentMonthCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  currentMonthTitle: { fontSize: 14, color: "#64748b", marginBottom: 8 },
  currentMonthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currentMonthAmount: { fontSize: 24, fontWeight: "700", color: "#1e293b" },
  currentMonthStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentMonthStatusText: { fontSize: 13, fontWeight: "600" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
    marginTop: 8,
  },
  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  recordMonth: { fontSize: 16, fontWeight: "600", color: "#1e293b" },
  recordStatus: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  recordStatusText: { fontSize: 12, fontWeight: "600" },
  recordDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
    gap: 6,
  },
  recordDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recordDetailLabel: { fontSize: 13, color: "#64748b" },
  recordDetailValue: { fontSize: 13, fontWeight: "500", color: "#1e293b" },
  recordFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  recordTotalLabel: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  recordTotal: { fontSize: 18, fontWeight: "700", color: "#1e293b" },
  recordPaidDate: { fontSize: 12, color: "#94a3b8", marginTop: 8 },
  trendCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  trendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  trendMonth: { width: 40, fontSize: 13, color: "#64748b" },
  trendBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  trendBar: { height: "100%", borderRadius: 4 },
  trendAmount: {
    width: 80,
    fontSize: 12,
    color: "#64748b",
    textAlign: "right",
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    paddingVertical: 8,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: "#64748b" },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyText: { fontSize: 14, color: "#94a3b8" },
});
