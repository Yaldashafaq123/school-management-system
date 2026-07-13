// app/(admin)/financial/reports/income-statement.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { FinanceCard } from "@/components/finance/FinanceCard";
import { MonthPicker } from "@/components/finance/MonthPicker";
import { EmptyState } from "@/components/finance/EmptyState";
import { ExportButton } from "@/components/finance/ExportButton";

export default function IncomeStatementScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(1403);
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>();
  const [statementData, setStatementData] = useState<any>(null);

  useEffect(() => {
    fetchIncomeStatement();
  }, [selectedYear, selectedMonth]);

  const fetchIncomeStatement = async () => {
    setLoading(true);
    try {
      const monthIndex = selectedMonth
        ? ["HAMAL", "SAWR", "JAWZA", "SARATAN", "ASAD", "SUNBULA", "MIZAN", "AQRAB", "QAWS", "JADI", "DALWA", "HOOT"].indexOf(selectedMonth) + 1
        : undefined;

      const response = await financeApi.getIncomeStatement({
        year: selectedYear,
        month: monthIndex,
      });

      if (response.success) {
        setStatementData(response.data);
      }
    } catch (error) {
      console.error("Fetch income statement error:", error);
    } finally {
      setLoading(false);
    }
  };

  const income = statementData?.income || { total: 0, breakdown: [] };
  const expenses = statementData?.expenses || { total: 0, breakdown: [] };
  const netIncome = income.total - expenses.total;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
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
        <Text style={styles.title}>صورت عایدات</Text>
        <ExportButton reportType="income-statement" variant="icon" />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Year/Month Filter */}
        <View style={styles.filterRow}>
          <View style={styles.yearPicker}>
            <TouchableOpacity onPress={() => setSelectedYear(prev => prev - 1)}>
              <Ionicons name="chevron-back" size={20} color="#3b82f6" />
            </TouchableOpacity>
            <Text style={styles.yearText}>{selectedYear}</Text>
            <TouchableOpacity onPress={() => setSelectedYear(prev => prev + 1)}>
              <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
            </TouchableOpacity>
          </View>
          <View style={styles.monthPicker}>
            <MonthPicker
              value={selectedMonth}
              onSelect={(month) => setSelectedMonth(month || undefined)}
              label="ماه (اختیاری)"
            />
          </View>
        </View>

        {/* Net Income */}
        <View style={styles.netIncomeCard}>
          <Text style={styles.netIncomeLabel}>عاید خالص</Text>
          <Text style={[
            styles.netIncomeAmount,
            { color: netIncome >= 0 ? "#10b981" : "#ef4444" }
          ]}>
            {netIncome >= 0 ? "+" : "-"} {formatCurrency(Math.abs(netIncome))}
          </Text>
          <View style={styles.netIncomeBar}>
            <View style={[styles.incomeBar, { flex: income.total }]} />
            <View style={[styles.expenseBar, { flex: expenses.total }]} />
          </View>
        </View>

        {/* Income & Expense Cards */}
        <View style={styles.cardsRow}>
          <FinanceCard
            title="مجموع عایدات"
            value={formatCurrency(income.total)}
            gradientColors={["#10b981", "#059669"]}
            icon="trending-up-outline"
            variant="default"
          />
          <FinanceCard
            title="مجموع مصارف"
            value={formatCurrency(expenses.total)}
            gradientColors={["#ef4444", "#dc2626"]}
            icon="trending-down-outline"
            variant="default"
          />
        </View>

        {/* Income Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>عایدات</Text>
          {income.breakdown?.length > 0 ? (
            income.breakdown.map((item: any, index: number) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <View style={[styles.breakdownDot, { backgroundColor: "#10b981" }]} />
                  <Text style={styles.breakdownName}>{item.name || item.category}</Text>
                </View>
                <Text style={[styles.breakdownAmount, { color: "#10b981" }]}>
                  + {formatCurrency(item.amount)}
                </Text>
              </View>
            ))
          ) : (
            <EmptyState
              icon="trending-up-outline"
              title="عایداتی ثبت نشده"
              subtitle="در این دوره عایداتی وجود ندارد"
            />
          )}
        </View>

        {/* Expense Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مصارف</Text>
          {expenses.breakdown?.length > 0 ? (
            expenses.breakdown.map((item: any, index: number) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <View style={[styles.breakdownDot, { backgroundColor: "#ef4444" }]} />
                  <Text style={styles.breakdownName}>{item.name || item.category}</Text>
                </View>
                <Text style={[styles.breakdownAmount, { color: "#ef4444" }]}>
                  - {formatCurrency(item.amount)}
                </Text>
              </View>
            ))
          ) : (
            <EmptyState
              icon="trending-down-outline"
              title="مصرفی ثبت نشده"
              subtitle="در این دوره مصرفی وجود ندارد"
            />
          )}
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
  filterRow: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    alignItems: "center",
  },
  yearPicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  yearText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  monthPicker: {
    flex: 1,
  },

  // Net Income
  netIncomeCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  netIncomeLabel: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  netIncomeAmount: {
    fontSize: 36,
    fontWeight: "800",
    marginTop: 8,
    fontFamily: "VazirBold",
  },
  netIncomeBar: {
    flexDirection: "row",
    width: "100%",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 16,
  },
  incomeBar: {
    backgroundColor: "#10b981",
  },
  expenseBar: {
    backgroundColor: "#ef4444",
  },

  // Cards
  cardsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  // Section
  section: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },

  // Breakdown
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  breakdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownName: {
    fontSize: 14,
    color: "#475569",
    fontFamily: "Vazir",
  },
  breakdownAmount: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
});