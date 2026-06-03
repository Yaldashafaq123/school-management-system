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

interface ClassCollection {
  classId: number;
  className: string;
  totalCollected: number;
  totalExpected: number;
  collectionRate: number;
  studentCount: number;
  paidCount: number;
  pendingCount: number;
}

interface ByClassReportData {
  classes: ClassCollection[];
  summary: {
    totalCollected: number;
    totalExpected: number;
    overallRate: number;
    totalStudents: number;
  };
}

export default function CollectionsByClass() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<ByClassReportData | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const response = await financeApi.getCollectionsByClass();
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error loading class collections:", error);
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

  const getCollectionRateColor = (rate: number) => {
    if (rate >= 80) return Colors.success;
    if (rate >= 50) return Colors.warning;
    return Colors.danger;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="دریافتی به تفکیک صنف" showBack />
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
        <Header title="دریافتی به تفکیک صنف" showBack />
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

  const { classes, summary } = data;
  const filteredClasses = selectedClass ? classes.filter(c => c.classId === selectedClass) : classes;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="دریافتی به تفکیک صنف" showBack />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Overall Summary */}
        <View style={styles.overallCard}>
          <Text style={styles.overallTitle}>خلاصه کلی</Text>
          <View style={styles.overallRow}>
            <View style={styles.overallItem}>
              <Text style={styles.overallLabel}>کل دریافتی</Text>
              <Text style={[styles.overallValue, { color: Colors.success }]}>
                {formatCurrency(summary.totalCollected)}
              </Text>
            </View>
            <View style={styles.overallDivider} />
            <View style={styles.overallItem}>
              <Text style={styles.overallLabel}>کل پیش‌بینی</Text>
              <Text style={styles.overallValue}>{formatCurrency(summary.totalExpected)}</Text>
            </View>
            <View style={styles.overallDivider} />
            <View style={styles.overallItem}>
              <Text style={styles.overallLabel}>نرخ کلی</Text>
              <Text style={[styles.overallValue, { color: getCollectionRateColor(summary.overallRate) }]}>
                {summary.overallRate}%
              </Text>
            </View>
          </View>
        </View>

        {/* Class List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>صنوف</Text>
          
          {filteredClasses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="school-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>صنفی یافت نشد</Text>
            </View>
          ) : (
            filteredClasses.map((cls) => {
              const rateColor = getCollectionRateColor(cls.collectionRate);
              return (
                <TouchableOpacity
                  key={cls.classId}
                  style={styles.classCard}
                  onPress={() => setSelectedClass(cls.classId === selectedClass ? null : cls.classId)}
                  activeOpacity={0.7}
                >
                  <View style={styles.classHeader}>
                    <View style={styles.classIcon}>
                      <Ionicons name="school" size={20} color={Colors.primary} />
                    </View>
                    <Text style={styles.className}>{cls.className}</Text>
                    <View style={[styles.rateBadge, { backgroundColor: `${rateColor}15` }]}>
                      <Text style={[styles.rateText, { color: rateColor }]}>
                        {cls.collectionRate}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.classStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>دریافتی</Text>
                      <Text style={[styles.statValue, { color: Colors.success }]}>
                        {formatCurrency(cls.totalCollected)}
                      </Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>پیش‌بینی</Text>
                      <Text style={styles.statValue}>{formatCurrency(cls.totalExpected)}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>دانش‌آموز</Text>
                      <Text style={styles.statValue}>{cls.studentCount}</Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${cls.collectionRate}%`, backgroundColor: rateColor }]} />
                    </View>
                    <View style={styles.progressDetails}>
                      <Text style={styles.progressText}>
                        {cls.paidCount} از {cls.studentCount} دانش‌آموز پرداخت داشته‌اند
                      </Text>
                      {cls.pendingCount > 0 && (
                        <Text style={[styles.pendingText, { color: Colors.danger }]}>
                          {cls.pendingCount} دانش‌آموز معوقه دارند
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* View Details Button */}
                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => router.push(`/(admin)/financial/fees/students?classId=${cls.classId}` as any)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.detailsButtonText}>مشاهده جزئیات</Text>
                    <Ionicons name="arrow-back" size={14} color={Colors.primary} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Class Ranking */}
        <View style={styles.rankingSection}>
          <Text style={styles.rankingTitle}>رتبه‌بندی صنوف بر اساس وصول</Text>
          {[...classes]
            .sort((a, b) => b.collectionRate - a.collectionRate)
            .slice(0, 3)
            .map((cls, index) => (
              <View key={cls.classId} style={styles.rankingItem}>
                <View style={styles.rankingPosition}>
                  <Text style={styles.rankingNumber}>{index + 1}</Text>
                  {index === 0 && <Ionicons name="trophy" size={16} color="#FFD700" />}
                </View>
                <Text style={styles.rankingName}>{cls.className}</Text>
                <Text style={[styles.rankingRate, { color: getCollectionRateColor(cls.collectionRate) }]}>
                  {cls.collectionRate}%
                </Text>
              </View>
            ))}
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

  overallCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, marginBottom: 20 },
  overallTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 12, textAlign: "center" },
  overallRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  overallItem: { alignItems: "center", flex: 1 },
  overallDivider: { width: 1, height: 30, backgroundColor: Colors.border },
  overallLabel: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 4 },
  overallValue: { fontSize: 16, fontWeight: "bold", fontFamily: "Vazirmatn" },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 12, textAlign: "right" },

  classCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  classHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  classIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: `${Colors.primary}15`, justifyContent: "center", alignItems: "center" },
  className: { flex: 1, fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn" },
  rateBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  rateText: { fontSize: 12, fontWeight: "500", fontFamily: "Vazirmatn" },

  classStats: { flexDirection: "row", backgroundColor: Colors.background, borderRadius: 10, padding: 10, marginBottom: 12 },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: Colors.border },
  statLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 2 },
  statValue: { fontSize: 13, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },

  progressSection: { marginBottom: 12 },
  progressBar: { height: 8, backgroundColor: Colors.background, borderRadius: 4, overflow: "hidden", marginBottom: 6 },
  progressFill: { height: "100%", borderRadius: 4 },
  progressDetails: { flexDirection: "row", justifyContent: "space-between" },
  progressText: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  pendingText: { fontSize: 10, fontFamily: "Vazirmatn" },

  detailsButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, borderRadius: 8, backgroundColor: `${Colors.primary}10`, gap: 6 },
  detailsButtonText: { fontSize: 12, color: Colors.primary, fontFamily: "Vazirmatn" },

  rankingSection: { backgroundColor: Colors.card, borderRadius: 14, padding: 16 },
  rankingTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 12, textAlign: "right" },
  rankingItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  rankingPosition: { flexDirection: "row", alignItems: "center", gap: 4, width: 50 },
  rankingNumber: { fontSize: 14, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn" },
  rankingName: { flex: 1, fontSize: 14, color: Colors.text, fontFamily: "Vazirmatn", textAlign: "right" },
  rankingRate: { fontSize: 14, fontWeight: "bold", fontFamily: "Vazirmatn", width: 50, textAlign: "center" },

  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginTop: 12 },
});