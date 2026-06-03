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

interface AgingBucket {
  bucket: string;
  amount: number;
  count: number;
  color: string;
}

interface AgingData {
  totalOutstanding: number;
  buckets: AgingBucket[];
  students: {
    id: number;
    name: string;
    className: string;
    amount: number;
    dueDate: string;
    overdueDays: number;
    bucket: string;
  }[];
}

export default function AgingReport() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<AgingData | null>(null);

  const loadData = useCallback(async () => {
    try {
      const response = await financeApi.getAgingReport();
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error loading aging report:", error);
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

  const getBucketColor = (bucket: string) => {
    switch (bucket) {
      case "0-30 روز": return Colors.success;
      case "31-60 روز": return Colors.warning;
      case "61-90 روز": return Colors.danger;
      default: return "#ff4444";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="گزارش پیری معوقات" showBack />
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
        <Header title="گزارش پیری معوقات" showBack />
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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="گزارش پیری معوقات" showBack />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Total Outstanding */}
        <View style={styles.totalCard}>
          <Ionicons name="alert-circle" size={32} color={Colors.danger} />
          <Text style={styles.totalLabel}>مجموع معوقات</Text>
          <Text style={styles.totalValue}>{formatCurrency(data.totalOutstanding)}</Text>
        </View>

        {/* Aging Buckets */}
        <View style={styles.bucketsContainer}>
          <Text style={styles.bucketsTitle}>تفکیک پیری معوقات</Text>
          {data.buckets.map((bucket, index) => (
            <View key={index} style={styles.bucketRow}>
              <View style={styles.bucketInfo}>
                <View style={[styles.bucketDot, { backgroundColor: bucket.color }]} />
                <Text style={styles.bucketLabel}>{bucket.bucket}</Text>
              </View>
              <View style={styles.bucketStats}>
                <Text style={styles.bucketAmount}>{formatCurrency(bucket.amount)}</Text>
                <Text style={styles.bucketCount}>({bucket.count} فقره)</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(bucket.amount / data.totalOutstanding) * 100}%`,
                      backgroundColor: bucket.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Students List */}
        <View style={styles.studentsContainer}>
          <Text style={styles.studentsTitle}>لیست دانش‌آموزان معوقه</Text>
          
          {data.students.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
              <Text style={styles.emptyText}>هیچ معوقه‌ای وجود ندارد</Text>
            </View>
          ) : (
            data.students.map((student, index) => (
              <TouchableOpacity
                key={student.id}
                style={[
                  styles.studentCard,
                  index === data.students.length - 1 && styles.studentCardLast
                ]}
                onPress={() => router.push(`/(admin)/financial/fees/students/${student.id}` as any)}
                activeOpacity={0.7}
              >
                <View style={styles.studentHeader}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentClass}>{student.className}</Text>
                  </View>
                  <View style={[styles.bucketBadge, { backgroundColor: `${getBucketColor(student.bucket)}20` }]}>
                    <Text style={[styles.bucketBadgeText, { color: getBucketColor(student.bucket) }]}>
                      {student.bucket}
                    </Text>
                  </View>
                </View>
                <View style={styles.studentFooter}>
                  <View style={styles.dueInfo}>
                    <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
                    <Text style={styles.dueText}>سررسید: {student.dueDate}</Text>
                  </View>
                  <Text style={[styles.amount, { color: getBucketColor(student.bucket) }]}>
                    {formatCurrency(student.amount)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
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
  
  totalCard: { backgroundColor: `${Colors.danger}10`, borderRadius: 16, padding: 20, alignItems: "center", marginBottom: 20 },
  totalLabel: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginTop: 8 },
  totalValue: { fontSize: 28, fontWeight: "bold", color: Colors.danger, fontFamily: "Vazirmatn", marginTop: 4 },
  
  bucketsContainer: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, marginBottom: 20 },
  bucketsTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 16, textAlign: "right" },
  bucketRow: { marginBottom: 16 },
  bucketInfo: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  bucketDot: { width: 10, height: 10, borderRadius: 5 },
  bucketLabel: { fontSize: 13, color: Colors.text, fontFamily: "Vazirmatn", flex: 1 },
  bucketStats: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  bucketAmount: { fontSize: 14, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn" },
  bucketCount: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  progressBar: { height: 8, backgroundColor: Colors.background, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  
  studentsContainer: { backgroundColor: Colors.card, borderRadius: 14, padding: 16 },
  studentsTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 16, textAlign: "right" },
  
  studentCard: { borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 12 },
  studentCardLast: { borderBottomWidth: 0 },
  studentHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  studentAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${Colors.primary}15`, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 16, fontWeight: "bold", color: Colors.primary, fontFamily: "Vazirmatn" },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  studentClass: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  bucketBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  bucketBadgeText: { fontSize: 10, fontWeight: "500", fontFamily: "Vazirmatn" },
  studentFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dueInfo: { flexDirection: "row", alignItems: "center", gap: 4 },
  dueText: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  amount: { fontSize: 15, fontWeight: "bold", fontFamily: "Vazirmatn" },
  
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 14, color: Colors.success, fontFamily: "Vazirmatn", marginTop: 12, textAlign: "center" },
});