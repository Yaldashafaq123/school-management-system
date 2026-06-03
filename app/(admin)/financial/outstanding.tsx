import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import {
  financeApi,
  formatCurrency,
  OutstandingFee,
} from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PERSIAN_MONTHS = [
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

export default function OutstandingFees() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [outstandingFees, setOutstandingFees] = useState<OutstandingFee[]>([]);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [filter, setFilter] = useState<"all" | "overdue" | "upcoming">(
    "overdue",
  );
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [classes, setClasses] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    try {
      const response = await financeApi.getOutstandingFees();
      const fees = response.items || [];
      setOutstandingFees(fees);
      setTotalOutstanding(response.totalOutstanding || 0);

      const uniqueClasses: string[] = [
        ...new Set(fees.map((f: OutstandingFee) => f.className)),
      ];
      setClasses(uniqueClasses);
    } catch (error) {
      console.error("Error loading outstanding fees:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری اطلاعات پیش آمد");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getBillingPeriod = (month?: number, year?: number) => {
    if (!month || !year) return "";
    return `${PERSIAN_MONTHS[month - 1]} ${year}`;
  };

  // FIXED: Replaced Chinese characters with Persian
  const getOverdueLevel = (days: number) => {
    if (days <= 7)
      return { level: "کم", color: Colors.warning, icon: "alert-circle" };
    if (days <= 30)
      return { level: "متوسط", color: Colors.danger, icon: "alert-circle" };
    return { level: "زیاد", color: "#ff4444", icon: "alert-circle" };
  };

  const getOverdueText = (days: number) => {
    if (days === 0) return "امروز";
    if (days === 1) return "دیروز";
    return `${days} روز پیش`;
  };

  const filteredFees = outstandingFees.filter((fee) => {
    if (filter === "overdue" && fee.overdueDays <= 0) return false;
    if (filter === "upcoming" && fee.overdueDays > 0) return false;
    if (selectedClass && fee.className !== selectedClass) return false;
    return true;
  });

  const totalFilteredAmount = filteredFees.reduce(
    (sum, f) => sum + f.amount,
    0,
  );

  const renderOutstandingItem = ({ item }: { item: OutstandingFee }) => {
    const overdueInfo = getOverdueLevel(item.overdueDays);
    const billingPeriod = getBillingPeriod(item.billingMonth, item.billingYear);
    const isOverdue = item.overdueDays > 0;

    return (
      <TouchableOpacity
        style={[styles.feeCard, isOverdue && styles.overdueCard]}
        onPress={() =>
          router.push(
            `/(admin)/financial/fees/students/${item.studentId}` as any,
          )
        }
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.feeHeader}>
          <View style={styles.studentInfo}>
            <View
              style={[
                styles.studentAvatar,
                isOverdue && { backgroundColor: `${Colors.danger}15` },
              ]}
            >
              <Text
                style={[
                  styles.avatarText,
                  isOverdue && { color: Colors.danger },
                ]}
              >
                {item.studentName?.charAt(0) || "؟"}
              </Text>
            </View>
            <View>
              <Text style={styles.studentName} numberOfLines={1}>
                {item.studentName}
              </Text>
              <Text style={styles.className}>{item.className}</Text>
              {billingPeriod && (
                <Text style={styles.billingPeriod}>{billingPeriod}</Text>
              )}
            </View>
          </View>
          <View
            style={[
              styles.overdueBadge,
              { backgroundColor: `${overdueInfo.color}15` },
            ]}
          >
            <Ionicons
              name={overdueInfo.icon as any}
              size={12}
              color={overdueInfo.color}
            />
            <Text style={[styles.overdueText, { color: overdueInfo.color }]}>
              {getOverdueText(item.overdueDays)}
            </Text>
          </View>
        </View>

        {/* Fee Details */}
        <View style={styles.feeBody}>
          <View style={styles.feeDetailRow}>
            <View style={styles.feeDetailItem}>
              <Text style={styles.feeDetailLabel}>عنوان</Text>
              <Text style={styles.feeDetailValue}>{item.feeTitle}</Text>
            </View>
            <View style={styles.feeDetailItem}>
              <Text style={styles.feeDetailLabel}>مبلغ</Text>
              <Text style={[styles.feeDetailValue, styles.amountText]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          </View>
          <View style={styles.feeDetailRow}>
            <View style={styles.feeDetailItem}>
              <Text style={styles.feeDetailLabel}>سررسید</Text>
              <Text
                style={[
                  styles.feeDetailValue,
                  isOverdue && { color: Colors.danger },
                ]}
              >
                {item.dueDate}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.success }]}
            onPress={() =>
              router.push(
                `/(admin)/financial/fees/collections/single?studentId=${item.studentId}` as any,
              )
            }
            activeOpacity={0.7}
          >
            <Ionicons name="cash" size={16} color="white" />
            <Text style={styles.actionBtnText}>ثبت پرداخت</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: `${Colors.primary}15` },
            ]}
            onPress={() =>
              router.push(
                `/(admin)/financial/fees/students/${item.studentId}` as any,
              )
            }
            activeOpacity={0.7}
          >
            <Ionicons name="list" size={16} color={Colors.primary} />
            <Text style={[styles.actionBtnText, { color: Colors.primary }]}>
              جزئیات
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // FIXED: Render filter tabs as ListHeaderComponent to avoid nested ScrollView
  const ListHeader = () => (
    <View>
      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderTopColor: Colors.danger }]}>
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: `${Colors.danger}15` },
            ]}
          >
            <Ionicons name="alert-circle" size={22} color={Colors.danger} />
          </View>
          <Text style={[styles.summaryValue, { color: Colors.danger }]}>
            {formatCurrency(totalOutstanding)}
          </Text>
          <Text style={styles.summaryLabel}>مجموع معوقه</Text>
        </View>

        <View style={[styles.summaryCard, { borderTopColor: Colors.warning }]}>
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: `${Colors.warning}15` },
            ]}
          >
            <Ionicons name="document-text" size={22} color={Colors.warning} />
          </View>
          <Text style={[styles.summaryValue, { color: Colors.warning }]}>
            {outstandingFees.length}
          </Text>
          <Text style={styles.summaryLabel}>تعداد فقره</Text>
        </View>

        <View style={[styles.summaryCard, { borderTopColor: Colors.info }]}>
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: `${Colors.info}15` },
            ]}
          >
            <Ionicons name="school" size={22} color={Colors.info} />
          </View>
          <Text style={[styles.summaryValue, { color: Colors.info }]}>
            {classes.length}
          </Text>
          <Text style={styles.summaryLabel}>صنف</Text>
        </View>
      </View>

      {/* Alert Banner */}
      {outstandingFees.length > 0 && (
        <View style={styles.alertBanner}>
          <Ionicons name="warning" size={18} color={Colors.warning} />
          <Text style={styles.alertText}>
            {outstandingFees.length} فقره شهریه معوقه به مبلغ{" "}
            {formatCurrency(totalOutstanding)} ثبت شده است
          </Text>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.tab, filter === "overdue" && styles.tabActive]}
          onPress={() => setFilter("overdue")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              filter === "overdue" && styles.tabTextActive,
            ]}
          >
            سررسید گذشته (
            {outstandingFees.filter((f) => f.overdueDays > 0).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === "upcoming" && styles.tabActive]}
          onPress={() => setFilter("upcoming")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              filter === "upcoming" && styles.tabTextActive,
            ]}
          >
            در شرف سررسید (
            {outstandingFees.filter((f) => f.overdueDays <= 0).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === "all" && styles.tabActive]}
          onPress={() => setFilter("all")}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.tabText, filter === "all" && styles.tabTextActive]}
          >
            همه ({outstandingFees.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Class Filter */}
      {classes.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.classFilterScroll}
        >
          <View style={styles.classFilterRow}>
            <TouchableOpacity
              style={[
                styles.classChip,
                !selectedClass && styles.classChipActive,
              ]}
              onPress={() => setSelectedClass(null)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.classChipText,
                  !selectedClass && styles.classChipTextActive,
                ]}
              >
                همه صنوف
              </Text>
            </TouchableOpacity>
            {classes.map((cls) => (
              <TouchableOpacity
                key={cls}
                style={[
                  styles.classChip,
                  selectedClass === cls && styles.classChipActive,
                ]}
                onPress={() => setSelectedClass(cls)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.classChipText,
                    selectedClass === cls && styles.classChipTextActive,
                  ]}
                >
                  {cls}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Summary of Filtered Results */}
      {filteredFees.length > 0 && (
        <View style={styles.filterSummary}>
          <Text style={styles.filterSummaryText}>
            {filteredFees.length} فقره - مجموع:{" "}
            {formatCurrency(totalFilteredAmount)}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="فیس‌های معوقه" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="فیس‌های معوقه" showBack />

      {/* FIXED: Removed nested ScrollView - ListHeader handles filters */}
      <FlatList
        data={filteredFees}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOutstandingItem}
        ListHeaderComponent={<ListHeader />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: `${Colors.success}15` },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={48}
                color={Colors.success}
              />
            </View>
            <Text style={styles.emptyTitle}>هیچ شهریه معوقه‌ای وجود ندارد</Text>
            <Text style={styles.emptyDesc}>
              تمام شهریه‌ها پرداخت شده‌اند. وضعیت مالی مدرسه خوب است!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderTopWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Vazirmatn",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.warning}10`,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  alertText: {
    flex: 1,
    fontSize: 12,
    color: Colors.warning,
    fontFamily: "Vazirmatn",
    textAlign: "right",
  },
  filterTabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  tabTextActive: { color: "white", fontWeight: "500" },
  classFilterScroll: { marginHorizontal: 16, marginBottom: 12 },
  classFilterRow: { flexDirection: "row", gap: 8 },
  classChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  classChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  classChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  classChipTextActive: { color: "white" },
  filterSummary: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  filterSummaryText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  listContent: { paddingBottom: 30 },
  feeCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  overdueCard: { borderLeftWidth: 3, borderLeftColor: Colors.danger },
  feeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  studentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
    fontFamily: "Vazirmatn",
  },
  studentName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    marginBottom: 2,
  },
  className: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  billingPeriod: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    marginTop: 2,
  },
  overdueBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  overdueText: {
    fontSize: 10,
    fontWeight: "500",
    fontFamily: "Vazirmatn",
  },
  feeBody: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  feeDetailRow: { flexDirection: "row", gap: 12 },
  feeDetailItem: { flex: 1 },
  feeDetailLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    marginBottom: 2,
  },
  feeDetailValue: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text,
    fontFamily: "Vazirmatn",
  },
  amountText: { fontWeight: "bold" },
  actionButtons: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "500",
    color: "white",
    fontFamily: "Vazirmatn",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    textAlign: "center",
    lineHeight: 22,
  },
});
