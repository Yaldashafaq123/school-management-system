import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface OutstandingStudent {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  totalAmount: number;
  feeCount: number;
  oldestDueDate: string;
  overdueDays: number;
  fees: {
    id: number;
    title: string;
    amount: number;
    dueDate: string;
    overdueDays: number;
  }[];
}

interface OutstandingReportData {
  totalOutstanding: number;
  totalStudents: number;
  averagePerStudent: number;
  students: OutstandingStudent[];
}

export default function OutstandingFeesReport() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<OutstandingReportData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [classes, setClasses] = useState<string[]>([]);
  const [expandedStudent, setExpandedStudent] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      const response = await financeApi.getOutstandingFeesReport();
      if (response.success) {
        setData(response.data);
        // Extract unique class names
        const uniqueClasses = [...new Set((response.data.students || []).map((s: OutstandingStudent) => s.className))];
        setClasses(uniqueClasses);
      }
    } catch (error) {
      console.error("Error loading outstanding report:", error);
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

  const getOverdueLevel = (days: number) => {
    if (days <= 0) return { level: "در شرف سررسید", color: Colors.warning, icon: "time" };
    if (days <= 30) return { level: "کمتر از 30 روز", color: Colors.warning, icon: "alert-circle" };
    if (days <= 60) return { level: "30 تا 60 روز", color: Colors.danger, icon: "alert-circle" };
    return { level: "بیش از 60 روز", color: "#ff4444", icon: "alert-circle" };
  };

  const filteredStudents = (data?.students || []).filter((student) => {
    if (searchQuery && !student.studentName.includes(searchQuery)) return false;
    if (selectedClass && student.className !== selectedClass) return false;
    return true;
  });

  const totalFilteredAmount = filteredStudents.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalFilteredCount = filteredStudents.length;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="گزارش فیس‌های معوقه" showBack />
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
        <Header title="گزارش فیس‌های معوقه" showBack />
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
      <Header title="گزارش فیس‌های معوقه" showBack />

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderTopColor: Colors.danger }]}>
          <Text style={styles.summaryLabel}>مجموع معوقات</Text>
          <Text style={[styles.summaryValue, { color: Colors.danger }]}>
            {formatCurrency(data.totalOutstanding)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { borderTopColor: Colors.warning }]}>
          <Text style={styles.summaryLabel}>دانش‌آموزان معوق</Text>
          <Text style={[styles.summaryValue, { color: Colors.warning }]}>
            {data.totalStudents}
          </Text>
        </View>
        <View style={[styles.summaryCard, { borderTopColor: Colors.primary }]}>
          <Text style={styles.summaryLabel}>میانگین هر دانش‌آموز</Text>
          <Text style={[styles.summaryValue, { color: Colors.primary }]}>
            {formatCurrency(data.averagePerStudent)}
          </Text>
        </View>
      </View>

      {/* Search & Filter */}
      <View style={styles.controlBar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجوی دانش‌آموز..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Class Filter */}
      {classes.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classFilterScroll}>
          <View style={styles.classFilterRow}>
            <TouchableOpacity
              style={[styles.classChip, !selectedClass && styles.classChipActive]}
              onPress={() => setSelectedClass(null)}
            >
              <Text style={[styles.classChipText, !selectedClass && styles.classChipTextActive]}>همه صنوف</Text>
            </TouchableOpacity>
            {classes.map((cls) => (
              <TouchableOpacity
                key={cls}
                style={[styles.classChip, selectedClass === cls && styles.classChipActive]}
                onPress={() => setSelectedClass(cls)}
              >
                <Text style={[styles.classChipText, selectedClass === cls && styles.classChipTextActive]}>{cls}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Filter Summary */}
      {(selectedClass || searchQuery) && (
        <View style={styles.filterSummary}>
          <Text style={styles.filterSummaryText}>
            {totalFilteredCount} دانش‌آموز - مجموع: {formatCurrency(totalFilteredAmount)}
          </Text>
          <TouchableOpacity onPress={() => { setSelectedClass(null); setSearchQuery(""); }}>
            <Text style={styles.clearFilterText}>پاک کردن فیلتر</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
        renderItem={({ item }) => {
          const overdueInfo = getOverdueLevel(item.overdueDays);
          const isExpanded = expandedStudent === item.studentId;
          
          return (
            <View style={styles.studentCard}>
              <TouchableOpacity
                style={styles.studentHeader}
                onPress={() => setExpandedStudent(isExpanded ? null : item.studentId)}
                activeOpacity={0.7}
              >
                <View style={styles.studentAvatar}>
                  <Text style={styles.avatarText}>{item.studentName.charAt(0)}</Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{item.studentName}</Text>
                  <Text style={styles.studentClass}>{item.className}</Text>
                </View>
                <View style={styles.studentAmounts}>
                  <Text style={styles.studentAmount}>{formatCurrency(item.totalAmount)}</Text>
                  <Text style={[styles.overdueBadge, { color: overdueInfo.color }]}>
                    {item.feeCount} فقره
                  </Text>
                </View>
                <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={Colors.textSecondary} />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  <View style={styles.overdueInfoRow}>
                    <Ionicons name={overdueInfo.icon as any} size={16} color={overdueInfo.color} />
                    <Text style={[styles.overdueInfoText, { color: overdueInfo.color }]}>
                      {overdueInfo.level} - قدیمی‌ترین معوقه: {item.oldestDueDate}
                    </Text>
                  </View>

                  {/* Fee Items */}
                  {item.fees.map((fee) => {
                    const feeOverdue = getOverdueLevel(fee.overdueDays);
                    return (
                      <TouchableOpacity
                        key={fee.id}
                        style={styles.feeItem}
                        onPress={() => router.push(`/(admin)/financial/fees/students/${item.studentId}?feeId=${fee.id}` as any)}
                      >
                        <View>
                          <Text style={styles.feeTitle}>{fee.title}</Text>
                          <Text style={styles.feeDueDate}>سررسید: {fee.dueDate}</Text>
                        </View>
                        <View style={styles.feeRight}>
                          <Text style={styles.feeAmount}>{formatCurrency(fee.amount)}</Text>
                          <Text style={[styles.feeOverdue, { color: feeOverdue.color }]}>
                            {feeOverdue.level}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                  <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => router.push(`/(admin)/financial/fees/collections/single?studentId=${item.studentId}` as any)}
                  >
                    <Ionicons name="cash" size={18} color="white" />
                    <Text style={styles.payButtonText}>ثبت پرداخت</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
            <Text style={styles.emptyTitle}>هیچ معوقه‌ای وجود ندارد</Text>
            <Text style={styles.emptyDesc}>تمام شهریه‌ها پرداخت شده‌اند</Text>
          </View>
        }
      />
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

  summaryRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 12, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 12, alignItems: "center", borderTopWidth: 3 },
  summaryLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 4 },
  summaryValue: { fontSize: 14, fontWeight: "bold", fontFamily: "Vazirmatn" },

  controlBar: { flexDirection: "row", paddingHorizontal: 16, paddingVertical: 10, gap: 8, alignItems: "center" },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 13, color: Colors.text, marginLeft: 6, textAlign: "right", fontFamily: "Vazirmatn" },

  classFilterScroll: { paddingHorizontal: 16, marginBottom: 12 },
  classFilterRow: { flexDirection: "row", gap: 8 },
  classChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  classChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  classChipText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  classChipTextActive: { color: "white" },

  filterSummary: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12 },
  filterSummaryText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  clearFilterText: { fontSize: 12, color: Colors.danger, fontFamily: "Vazirmatn" },

  listContent: { padding: 16, paddingTop: 0, paddingBottom: 30 },

  studentCard: { backgroundColor: Colors.card, borderRadius: 14, marginBottom: 10, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  studentHeader: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10 },
  studentAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${Colors.primary}15`, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 16, fontWeight: "bold", color: Colors.primary, fontFamily: "Vazirmatn" },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  studentClass: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  studentAmounts: { alignItems: "flex-end", marginRight: 8 },
  studentAmount: { fontSize: 14, fontWeight: "bold", color: Colors.danger, fontFamily: "Vazirmatn" },
  overdueBadge: { fontSize: 10, fontWeight: "500", fontFamily: "Vazirmatn" },

  expandedContent: { padding: 14, paddingTop: 0, borderTopWidth: 1, borderTopColor: Colors.border },
  overdueInfoRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  overdueInfoText: { fontSize: 12, fontFamily: "Vazirmatn" },

  feeItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: Colors.background, padding: 12, borderRadius: 10, marginBottom: 8 },
  feeTitle: { fontSize: 13, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  feeDueDate: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  feeRight: { alignItems: "flex-end" },
  feeAmount: { fontSize: 13, fontWeight: "bold", color: Colors.danger, fontFamily: "Vazirmatn", marginBottom: 2 },
  feeOverdue: { fontSize: 10, fontFamily: "Vazirmatn" },

  payButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.success, paddingVertical: 12, borderRadius: 10, gap: 8, marginTop: 8 },
  payButtonText: { color: "white", fontSize: 14, fontWeight: "500", fontFamily: "Vazirmatn" },

  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginTop: 12, marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center" },
});