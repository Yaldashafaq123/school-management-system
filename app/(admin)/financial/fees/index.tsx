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

interface FeeStats {
  todayCollection: number;
  weekCollection: number;
  monthCollection: number;
  pendingFees: number;
  overdueCount: number;
  totalStudents: number;
  collectionRate: number;
}

export default function FeeDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<FeeStats | null>(null);

  const loadData = useCallback(async () => {
    try {
      const response = await financeApi.getFeeStatistics();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error loading fee stats:", error);
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
        <Header title="مدیریت شهریه" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const collectionRate = stats?.collectionRate || 0;
  const overdueCount = stats?.overdueCount || 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="مدیریت شهریه" showBack />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Quick Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${Colors.success}15` }]}>
              <Ionicons name="today" size={22} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>{formatCurrency(stats?.todayCollection || 0)}</Text>
            <Text style={styles.statLabel}>دریافتی امروز</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${Colors.primary}15` }]}>
              <Ionicons name="calendar" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{formatCurrency(stats?.weekCollection || 0)}</Text>
            <Text style={styles.statLabel}>این هفته</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${Colors.warning}15` }]}>
              <Ionicons name="trending-up" size={22} color={Colors.warning} />
            </View>
            <Text style={styles.statValue}>{formatCurrency(stats?.monthCollection || 0)}</Text>
            <Text style={styles.statLabel}>این ماه</Text>
          </View>
        </View>

        {/* Collection Rate & Pending */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Ionicons name="alert-circle" size={18} color={Colors.danger} />
              <Text style={styles.summaryCardTitle}>معوقه</Text>
            </View>
            <Text style={[styles.summaryCardValue, { color: Colors.danger }]}>
              {formatCurrency(stats?.pendingFees || 0)}
            </Text>
            {overdueCount > 0 && (
              <Text style={styles.summaryCardSubtext}>
                {overdueCount} فقره سررسید گذشته
              </Text>
            )}
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <Ionicons name="pie-chart" size={18} color={Colors.primary} />
              <Text style={styles.summaryCardTitle}>نرخ وصول</Text>
            </View>
            <Text style={[styles.summaryCardValue, { color: Colors.primary }]}>
              {collectionRate}%
            </Text>
            <Text style={styles.summaryCardSubtext}>
              از {stats?.totalStudents || 0} دانش‌آموز
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>دسترسی سریع</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: Colors.success }]}
              onPress={() => router.push("/(admin)/financial/fees/collections/single" as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="cash" size={28} color="white" />
              <Text style={styles.quickActionTitle}>ثبت پرداخت</Text>
              <Text style={styles.quickActionDesc}>انفرادی</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: Colors.primary }]}
              onPress={() => router.push("/(admin)/financial/fees/collections/bulk" as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="people" size={28} color="white" />
              <Text style={styles.quickActionTitle}>ثبت گروهی</Text>
              <Text style={styles.quickActionDesc}>بر اساس صنف</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: Colors.warning }]}
              onPress={() => router.push("/(admin)/financial/fees/templates" as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="grid" size={28} color="white" />
              <Text style={styles.quickActionTitle}>قالب‌های شهریه</Text>
              <Text style={styles.quickActionDesc}>مدیریت</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionCard, { backgroundColor: Colors.info }]}
              onPress={() => router.push("/(admin)/financial/fees/outstanding" as any)}
              activeOpacity={0.8}
            >
              <Ionicons name="alert-circle" size={28} color="white" />
              <Text style={styles.quickActionTitle}>معوقه‌ها</Text>
              <Text style={styles.quickActionDesc}>مشاهده</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Templates Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>قالب‌های فعال شهریه</Text>
            <TouchableOpacity onPress={() => router.push("/(admin)/financial/fees/templates" as any)}>
              <Text style={styles.seeAllText}>مدیریت قالب‌ها</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={18} color={Colors.primary} />
            <Text style={styles.infoText}>
              با استفاده از قالب‌های شهریه می‌توانید هزینه‌های دوره‌ای (ماهانه/سالانه) را برای کل صنف تعریف کرده و به صورت خودکار به همه دانش‌آموزان اعمال کنید.
            </Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.tipBox}>
          <Ionicons name="bulb" size={18} color={Colors.warning} />
          <Text style={styles.tipText}>
            نکته: برای ثبت پرداخت‌های دوره‌ای، ابتدا قالب شهریه را ایجاد کنید، سپس از گزینه ثبت گروهی استفاده نمایید.
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
  statsGrid: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 14, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  statIcon: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  statValue: { fontSize: 14, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 4, textAlign: "center" },
  statLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  summaryCardHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  summaryCardTitle: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  summaryCardValue: { fontSize: 20, fontWeight: "bold", fontFamily: "Vazirmatn", marginBottom: 2 },
  summaryCardSubtext: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 14 },
  seeAllText: { fontSize: 12, color: Colors.primary, fontFamily: "Vazirmatn" },
  quickActionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickActionCard: { width: "48%", borderRadius: 14, padding: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  quickActionTitle: { fontSize: 14, fontWeight: "bold", color: "white", fontFamily: "Vazirmatn", marginTop: 8, marginBottom: 2 },
  quickActionDesc: { fontSize: 10, color: "rgba(255,255,255,0.8)", fontFamily: "Vazirmatn" },
  infoBox: { flexDirection: "row", backgroundColor: `${Colors.primary}08`, borderRadius: 12, padding: 14, gap: 10, alignItems: "flex-start", marginBottom: 16 },
  infoText: { flex: 1, fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", lineHeight: 20, textAlign: "right" },
  tipBox: { flexDirection: "row", backgroundColor: `${Colors.warning}10`, borderRadius: 12, padding: 14, gap: 10, alignItems: "flex-start" },
  tipText: { flex: 1, fontSize: 11, color: Colors.warning, fontFamily: "Vazirmatn", lineHeight: 20, textAlign: "right" },
});