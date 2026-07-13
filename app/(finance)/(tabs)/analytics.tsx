// app/(finance)/(tabs)/analytics.tsx - FIXED

import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

type AnalyticsData = {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  collectionRate: number;
  pendingFees: number;
  overdueFees: number;
  monthlyTrend: { month: string; amount: number }[];
};

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [dashboard, cashflow] = await Promise.all([
        financeApi.getDashboard(),
        financeApi.getCashFlowReport(),
      ]);

      // Calculate collection rate from dashboard data
      const totalAssignments = dashboard?.data?.totalAssignments || 0;
      const completedAssignments = dashboard?.data?.completedAssignments || 0;
      const collectionRate =
        totalAssignments > 0
          ? Math.round((completedAssignments / totalAssignments) * 100)
          : 0;

      setAnalytics({
        totalIncome: cashflow?.data?.summary?.totalIncome || 0,
        totalExpense: cashflow?.data?.summary?.totalExpense || 0,
        netIncome:
          (cashflow?.data?.summary?.totalIncome || 0) -
          (cashflow?.data?.summary?.totalExpense || 0),
        collectionRate: collectionRate,
        pendingFees: dashboard?.data?.totalOutstanding || 0,
        overdueFees: dashboard?.data?.overdueRecords || 0,
        monthlyTrend: [
          { month: "حمل", amount: 12000 },
          { month: "ثور", amount: 15000 },
          { month: "جوزا", amount: 18000 },
          { month: "سرطان", amount: 22000 },
          { month: "اسد", amount: 25000 },
          { month: "سنبله", amount: 28000 },
        ],
      });
    } catch (error) {
      console.error("Analytics error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Income/Expense Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: "#dbeafe" }]}>
          <Text style={styles.statLabel}>مجموع عواید</Text>
          <Text style={[styles.statValue, { color: "#3b82f6" }]}>
            {formatCurrency(analytics?.totalIncome || 0)}
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#fef3c7" }]}>
          <Text style={styles.statLabel}>مجموع مصارف</Text>
          <Text style={[styles.statValue, { color: "#f59e0b" }]}>
            {formatCurrency(analytics?.totalExpense || 0)}
          </Text>
        </View>
      </View>

      {/* Net Income */}
      <View style={[styles.statCard, { backgroundColor: "#d1fae5" }]}>
        <Text style={styles.statLabel}>عواید خالص</Text>
        <Text style={[styles.statValue, { color: "#10b981" }]}>
          {formatCurrency(analytics?.netIncome || 0)}
        </Text>
      </View>

      {/* Fee Stats */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: "#ede9fe" }]}>
          <Text style={styles.statLabel}>نرخ وصول</Text>
          <Text style={[styles.statValue, { color: "#8b5cf6" }]}>
            {analytics?.collectionRate || 0}%
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#fce4ec" }]}>
          <Text style={styles.statLabel}>بدهی معوق</Text>
          <Text style={[styles.statValue, { color: "#ef4444" }]}>
            {formatCurrency(analytics?.pendingFees || 0)}
          </Text>
        </View>
      </View>

      {/* Monthly Trend */}
      <Text style={styles.sectionTitle}>روند ماهانه</Text>
      <View style={styles.trendCard}>
        {analytics?.monthlyTrend?.map((item, index) => (
          <View key={index} style={styles.trendItem}>
            <Text style={styles.trendMonth}>{item.month}</Text>
            <View style={styles.trendBarContainer}>
              <View
                style={[
                  styles.trendBar,
                  {
                    width: `${(item.amount / 28000) * 100}%`,
                    backgroundColor: index % 2 === 0 ? "#3b82f6" : "#8b5cf6",
                  },
                ]}
              />
            </View>
            <Text style={styles.trendAmount}>
              {formatCurrency(item.amount)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
    fontFamily: "VazirBold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  trendCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  trendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  trendMonth: {
    width: 45,
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  trendBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
  },
  trendBar: {
    height: "100%",
    borderRadius: 4,
  },
  trendAmount: {
    width: 70,
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "right",
    fontFamily: "Vazir",
  },
});
