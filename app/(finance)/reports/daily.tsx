import { EmptyState } from "@/components/finance/EmptyState";
import { ExportButton } from "@/components/finance/ExportButton";
import { FinanceCard } from "@/components/finance/FinanceCard";
import { PaymentHistoryItem } from "@/components/finance/PaymentHistoryItem";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DailyReportScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    fetchDailyReport();
  }, []);

  const fetchDailyReport = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const [statsRes, paymentsRes] = await Promise.all([
        financeApi.getDailyCollection({ date: today }),
        financeApi.getPaymentHistory({
          startDate: today,
          endDate: today,
          limit: 50,
        }),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (paymentsRes.success) setPayments(paymentsRes.data.payments || []);
    } catch (error) {
      console.error("Fetch daily report error:", error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString("fa-AF", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
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
        <Text style={styles.title}>راپور روزانه</Text>
        <ExportButton reportType="daily" variant="icon" />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Banner */}
        <View style={styles.dateBanner}>
          <Ionicons name="today" size={24} color="#3b82f6" />
          <Text style={styles.dateText}>{today}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <FinanceCard
            title="وصولی امروز"
            value={formatCurrency(stats?.totalAmount || 0)}
            icon="cash-outline"
            gradientColors={["#3b82f6", "#2563eb"]}
            variant="default"
          />
          <FinanceCard
            title="تعداد پرداخت"
            value={`${payments.length} مورد`}
            icon="receipt-outline"
            gradientColors={["#10b981", "#059669"]}
            variant="default"
          />
        </View>

        <View style={styles.statsGrid}>
          <FinanceCard
            title="پرداخت نقدی"
            value={formatCurrency(
              payments
                .filter((p) => p.paymentMethod === "CASH")
                .reduce((s, p) => s + p.amount, 0),
            )}
            icon="cash-outline"
            gradientColors={["#f59e0b", "#d97706"]}
            variant="compact"
          />
          <FinanceCard
            title="پرداخت بانکی"
            value={formatCurrency(
              payments
                .filter((p) => p.paymentMethod !== "CASH")
                .reduce((s, p) => s + p.amount, 0),
            )}
            icon="card-outline"
            gradientColors={["#8b5cf6", "#7c3aed"]}
            variant="compact"
          />
        </View>

        {/* Payment List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            پرداخت‌های امروز ({payments.length})
          </Text>
          {payments.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="پرداختی ثبت نشده"
              subtitle="امروز هیچ پرداختی ثبت نشده است"
            />
          ) : (
            payments.map((payment, index) => (
              <PaymentHistoryItem
                key={payment.id || index}
                payment={payment}
                onPress={() => router.push(`/financial/payments/${payment.id}`)}
              />
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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
  dateBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 16,
    padding: 14,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3b82f6",
    fontFamily: "Vazir",
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 8,
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
});
