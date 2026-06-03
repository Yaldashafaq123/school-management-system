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

interface SalaryStats {
  totalPaidThisMonth: number;
  totalPending: number;
  totalTeachers: number;
  paidCount: number;
  pendingCount: number;
  averageSalary: number;
}

export default function SalaryDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<SalaryStats | null>(null);

  const loadData = useCallback(async () => {
    try {
      const response = await financeApi.getSalaryStatistics();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error loading salary stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="مدیریت معاشات" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const paymentRate = stats?.totalTeachers 
    ? Math.round((stats.paidCount / stats.totalTeachers) * 100) 
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="مدیریت معاشات" showBack />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderTopColor: Colors.success }]}>
            <View style={[styles.statIcon, { backgroundColor: `${Colors.success}15` }]}>
              <Ionicons name="cash" size={22} color={Colors.success} />
            </View>
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {formatCurrency(stats?.totalPaidThisMonth || 0)}
            </Text>
            <Text style={styles.statLabel}>پرداخت شده این ماه</Text>
          </View>

          <View style={[styles.statCard, { borderTopColor: Colors.danger }]}>
            <View style={[styles.statIcon, { backgroundColor: `${Colors.danger}15` }]}>
              <Ionicons name="hourglass" size={22} color={Colors.danger} />
            </View>
            <Text style={[styles.statValue, { color: Colors.danger }]}>
              {formatCurrency(stats?.totalPending || 0)}
            </Text>
            <Text style={styles.statLabel}>معوقه</Text>
          </View>

          <View style={[styles.statCard, { borderTopColor: Colors.primary }]}>
            <View style={[styles.statIcon, { backgroundColor: `${Colors.primary}15` }]}>
              <Ionicons name="people" size={22} color={Colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {stats?.totalTeachers || 0}
            </Text>
            <Text style={styles.statLabel}>معلم</Text>
          </View>
        </View>

        {/* Payment Rate */}
        <View style={styles.rateCard}>
          <View style={styles.rateHeader}>
            <Text style={styles.rateTitle}>نرخ پرداخت معاش این ماه</Text>
            <Text style={[styles.rateValue, { color: paymentRate >= 70 ? Colors.success : Colors.warning }]}>
              {paymentRate}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${paymentRate}%`, backgroundColor: paymentRate >= 70 ? Colors.success : Colors.warning }]} />
          </View>
          <Text style={styles.rateSubtext}>
            {stats?.paidCount || 0} از {stats?.totalTeachers || 0} معلم پرداخت شده
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>دسترسی سریع</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.primary }]}
              onPress={() => router.push("/(admin)/financial/salaries/generate")}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar" size={28} color="white" />
              <Text style={styles.actionText}>ایجاد معاش ماهیانه</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.success }]}
              onPress={() => router.push("/(admin)/financial/salaries/payments/record")}
              activeOpacity={0.8}
            >
              <Ionicons name="cash" size={28} color="white" />
              <Text style={styles.actionText}>پرداخت معاش</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.warning }]}
              onPress={() => router.push("/(admin)/financial/salaries/teachers")}
              activeOpacity={0.8}
            >
              <Ionicons name="people" size={28} color="white" />
              <Text style={styles.actionText}>مدیریت معلمین</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors.info }]}
              onPress={() => router.push("/(admin)/financial/salaries/reports/monthly")}
              activeOpacity={0.8}
            >
              <Ionicons name="document-text" size={28} color="white" />
              <Text style={styles.actionText}>گزارشات</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={18} color={Colors.primary} />
          <Text style={styles.infoText}>
            برای پرداخت معاش، ابتدا باید معاش ماهیانه را ایجاد کنید. پس از ایجاد، می‌توانید پرداخت را ثبت کنید.
            معلمینی که حقوق پایه ندارند در لیست ایجاد معاش نمایش داده نمی‌شوند.
          </Text>
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
  content: { flex: 1, padding: 16 },
  
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 14, alignItems: "center", borderTopWidth: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  statIcon: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  statValue: { fontSize: 14, fontWeight: "bold", fontFamily: "Vazirmatn", marginBottom: 4, textAlign: "center" },
  statLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  rateCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, marginBottom: 20 },
  rateHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  rateTitle: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },
  rateValue: { fontSize: 20, fontWeight: "bold", fontFamily: "Vazirmatn" },
  progressBar: { height: 8, backgroundColor: Colors.background, borderRadius: 4, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", borderRadius: 4 },
  rateSubtext: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center" },
  
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 14 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionCard: { width: "48%", borderRadius: 14, padding: 18, alignItems: "center", gap: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  actionText: { color: "white", fontSize: 13, fontWeight: "600", fontFamily: "Vazirmatn", textAlign: "center" },
  
  infoBox: { flexDirection: "row", backgroundColor: `${Colors.primary}08`, borderRadius: 12, padding: 14, gap: 10, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", lineHeight: 20, textAlign: "right" },
});