// app/(admin)/financial/reports/monthly.tsx
import { CollectionProgress } from "@/components/finance/CollectionProgress";
import { ExportButton } from "@/components/finance/ExportButton";
import { FinanceCard } from "@/components/finance/FinanceCard";
import { MonthPicker } from "@/components/finance/MonthPicker";
import {
    financeApi,
    formatCurrency,
    getMonthName,
} from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function MonthlyReportScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("HAMAL");
  const [selectedYear, setSelectedYear] = useState(1403);
  const [reportData, setReportData] = useState<any>(null);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    fetchMonthlyReport();
  }, [selectedMonth, selectedYear]);

  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      const [collectionRes, yearlyRes] = await Promise.all([
        financeApi.getMonthlyCollection({ year: selectedYear }),
        financeApi.getYearlyMonthlyCollection?.({ year: selectedYear }) ||
          Promise.resolve(null),
      ]);

      if (collectionRes.success) {
        setReportData(collectionRes.data);
        // Process monthly data for chart
        if (collectionRes.data?.monthly) {
          setMonthlyData(collectionRes.data.monthly);
        }
      }
    } catch (error) {
      console.error("Fetch monthly report error:", error);
    } finally {
      setLoading(false);
    }
  };

  const afghanMonths = [
    "HAMAL",
    "SAWR",
    "JAWZA",
    "SARATAN",
    "ASAD",
    "SUNBULA",
    "MIZAN",
    "AQRAB",
    "QAWS",
    "JADI",
    "DALWA",
    "HOOT",
  ];

  const monthIndex = afghanMonths.indexOf(selectedMonth);
  const currentMonthData = monthlyData[monthIndex] || {
    collected: 0,
    expected: 0,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
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
        <Text style={styles.title}>راپور ماهانه</Text>
        <ExportButton reportType="monthly" variant="icon" />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Month/Year Picker */}
        <View style={styles.pickerRow}>
          <View style={styles.pickerHalf}>
            <MonthPicker
              value={selectedMonth}
              onSelect={setSelectedMonth}
              label="ماه"
            />
          </View>
          <View style={styles.yearPicker}>
            <TouchableOpacity
              onPress={() => setSelectedYear((prev) => prev - 1)}
            >
              <Ionicons name="chevron-back" size={20} color="#3b82f6" />
            </TouchableOpacity>
            <Text style={styles.yearText}>{selectedYear}</Text>
            <TouchableOpacity
              onPress={() => setSelectedYear((prev) => prev + 1)}
            >
              <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Monthly Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {getMonthName(selectedMonth)} {selectedYear}
          </Text>

          <CollectionProgress
            collected={currentMonthData.collected || 0}
            total={currentMonthData.expected || 1}
            size="large"
            label="نرخ وصول ماه"
          />

          <View style={styles.statsGrid}>
            <FinanceCard
              title="وصول شده"
              value={formatCurrency(currentMonthData.collected || 0)}
              gradientColors={["#10b981", "#059669"]}
              variant="compact"
              icon="checkmark-circle-outline"
            />
            <FinanceCard
              title="مورد انتظار"
              value={formatCurrency(currentMonthData.expected || 0)}
              gradientColors={["#3b82f6", "#2563eb"]}
              variant="compact"
              icon="trending-up-outline"
            />
          </View>
        </View>

        {/* All Months Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نمای کلی سال {selectedYear}</Text>
          <View style={styles.monthsGrid}>
            {afghanMonths.map((month, index) => {
              const data = monthlyData[index] || { collected: 0, expected: 0 };
              const percentage =
                data.expected > 0
                  ? Math.round((data.collected / data.expected) * 100)
                  : 0;

              return (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthCard,
                    selectedMonth === month && styles.monthCardActive,
                  ]}
                  onPress={() => setSelectedMonth(month)}
                >
                  <Text
                    style={[
                      styles.monthName,
                      selectedMonth === month && styles.monthNameActive,
                    ]}
                  >
                    {getMonthName(month)}
                  </Text>
                  <Text style={styles.monthAmount}>
                    {formatCurrency(data.collected || 0)}
                  </Text>
                  <View style={styles.miniProgress}>
                    <View
                      style={[
                        styles.miniProgressFill,
                        {
                          width: `${percentage}%`,
                          backgroundColor:
                            percentage >= 70
                              ? "#10b981"
                              : percentage >= 40
                                ? "#f59e0b"
                                : "#ef4444",
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.monthPercent}>{percentage}%</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  pickerRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  pickerHalf: {
    flex: 1,
  },
  yearPicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignSelf: "flex-end",
    marginTop: 28,
  },
  yearText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  section: {
    margin: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  statsGrid: {
    flexDirection: "row",
    marginTop: 12,
    marginHorizontal: -4,
  },
  monthsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  monthCard: {
    width: "31%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  monthCardActive: {
    borderColor: "#8b5cf6",
    backgroundColor: "#f3e8ff",
  },
  monthName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    fontFamily: "Vazir",
  },
  monthNameActive: {
    color: "#8b5cf6",
  },
  monthAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 4,
    fontFamily: "VazirBold",
  },
  miniProgress: {
    width: "100%",
    height: 3,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    marginTop: 6,
    overflow: "hidden",
  },
  miniProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  monthPercent: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 4,
    fontFamily: "Vazir",
  },
});
