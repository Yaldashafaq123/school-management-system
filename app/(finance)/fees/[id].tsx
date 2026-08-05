// app/(admin)/financial/fees/[id].tsx
import { CollectionProgress } from "@/components/finance/CollectionProgress";
import { FeeItemCard } from "@/components/finance/FeeItemCard";
import {
  FeeAssignment,
  financeApi,
  formatCurrency,
  getFeeStatusColor,
  getFeeStatusLabel,
  getMonthName,
} from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FeeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState<FeeAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "monthly" | "onetime">(
    "all",
  );

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setError(null);
      const response = await financeApi.getFeeAssignment(Number(id));
      if (response.success) {
        setAssignment(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    if (!assignment)
      return {
        totalAmount: 0,
        totalPaid: 0,
        totalBalance: 0,
        discountTotal: 0,
      };

    let totalAmount = 0;
    let totalPaid = 0;
    let totalBalance = 0;
    let discountTotal = 0;

    for (const item of assignment.feeItems || []) {
      if (item.isRecurring && item.monthlyRecords) {
        for (const record of item.monthlyRecords) {
          totalAmount += Number(record.amount);
          totalPaid += Number(record.paidAmount);
          totalBalance += Number(record.balanceAmount);
        }
      } else {
        totalAmount += Number(item.finalAmount || item.amount);
        totalPaid += Number(item.paidAmount || 0);
        totalBalance +=
          Number(item.finalAmount || item.amount) -
          Number(item.paidAmount || 0);
      }
      discountTotal += Number(item.discountAmount || 0);
    }

    return { totalAmount, totalPaid, totalBalance, discountTotal };
  };

  const handlePayment = (itemId: number, recordId?: number) => {
    router.push({
      pathname: "/financial/payments/record",
      params: {
        assignmentId: id as string,
        itemId: itemId.toString(),
        recordId: recordId?.toString(),
      },
    });
  };

  const handleDiscount = () => {
    Alert.alert("اعمال تخفیف", "مبلغ تخفیف را وارد کنید", [
      { text: "لغو", style: "cancel" },
      { text: "اعمال", onPress: () => console.log("Apply discount") },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  if (error || !assignment) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>{error || "Not found"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDetails}>
          <Text style={styles.retryText}>تلاش مجدد</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { totalAmount, totalPaid, totalBalance, discountTotal } =
    calculateTotals();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>جزئیات فیس</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() =>
            Alert.alert("حذف", "آیا مطمئن هستید؟", [
              { text: "خیر" },
              {
                text: "بله",
                style: "destructive",
                onPress: () => console.log("Delete"),
              },
            ])
          }
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Student Info */}
        <View style={styles.studentCard}>
          <View style={styles.studentAvatar}>
            <Ionicons name="person" size={40} color="#3b82f6" />
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>
              {assignment.student?.user?.fullName || "نامشخص"}
            </Text>
            <Text style={styles.studentClass}>
              {assignment.student?.class?.name || "بدون صنف"}
            </Text>
            <Text style={styles.academicYear}>
              {assignment.academicYear?.name || "نامشخص"}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getFeeStatusColor(assignment.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getFeeStatusColor(assignment.status) },
              ]}
            >
              {getFeeStatusLabel(assignment.status)}
            </Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <CollectionProgress
            collected={totalPaid}
            total={totalAmount}
            size="large"
          />

          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>فیس کل</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>پرداخت شده</Text>
              <Text style={[styles.summaryValue, { color: "#059669" }]}>
                {formatCurrency(totalPaid)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>باقیمانده</Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: totalBalance > 0 ? "#ef4444" : "#059669" },
                ]}
              >
                {formatCurrency(totalBalance)}
              </Text>
            </View>
            {discountTotal > 0 && (
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>تخفیف</Text>
                <Text style={[styles.summaryValue, { color: "#8b5cf6" }]}>
                  {formatCurrency(discountTotal)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          {totalBalance > 0 && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#10b981" }]}
              onPress={() => handlePayment(0)}
            >
              <Ionicons name="wallet-outline" size={20} color="#fff" />
              <Text style={styles.actionText}>ثبت پرداخت</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#8b5cf6" }]}
            onPress={handleDiscount}
          >
            <Ionicons name="pricetag-outline" size={20} color="#fff" />
            <Text style={styles.actionText}>اعمال تخفیف</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {[
            { key: "all", label: "همه" },
            { key: "monthly", label: "ماهانه" },
            { key: "onetime", label: "یکباره" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fee Items */}
        <View style={styles.itemsContainer}>
          {assignment.feeItems?.map((item) => {
            if (activeTab === "monthly" && !item.isRecurring) return null;
            if (activeTab === "onetime" && item.isRecurring) return null;

            if (item.isRecurring && item.monthlyRecords) {
              return (
                <View key={item.id}>
                  <Text style={styles.itemGroupTitle}>{item.name}</Text>
                  {item.monthlyRecords.map((record) => (
                    <FeeItemCard
                      key={record.id}
                      name={item.name}
                      amount={Number(record.amount)}
                      paid={Number(record.paidAmount)}
                      balance={Number(record.balanceAmount)}
                      status={record.status}
                      month={record.month}
                      monthName={getMonthName(record.month)}
                      year={record.year}
                      isRecurring={true}
                      onPay={() => handlePayment(item.id, record.id)}
                    />
                  ))}
                </View>
              );
            }

            return (
              <FeeItemCard
                key={item.id}
                name={item.name}
                amount={Number(item.finalAmount || item.amount)}
                paid={Number(item.paidAmount || 0)}
                status={item.status}
                isRecurring={false}
                feeType={item.feeType}
                onPay={() => handlePayment(item.id)}
              />
            );
          })}

          {(!assignment.feeItems || assignment.feeItems.length === 0) && (
            <View style={styles.emptyItems}>
              <Ionicons name="document-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>هیچ فیس ثبت نشده</Text>
            </View>
          )}
        </View>

        {/* Discounts History */}
        {assignment.studentDiscounts &&
          assignment.studentDiscounts.length > 0 && (
            <View style={styles.discountsSection}>
              <Text style={styles.sectionTitle}>تخفیف‌ها</Text>
              {assignment.studentDiscounts.map((discount) => (
                <View key={discount.id} style={styles.discountItem}>
                  <View style={styles.discountIcon}>
                    <Ionicons name="pricetag" size={18} color="#8b5cf6" />
                  </View>
                  <View style={styles.discountInfo}>
                    <Text style={styles.discountAmount}>
                      {formatCurrency(Number(discount.amount))}
                    </Text>
                    <Text style={styles.discountReason}>{discount.reason}</Text>
                  </View>
                  <Text style={styles.discountBy}>
                    {discount.approver?.fullName || "نامشخص"}
                  </Text>
                </View>
              ))}
            </View>
          )}

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
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#3b82f6",
    borderRadius: 10,
  },
  retryText: {
    color: "#fff",
    fontFamily: "Vazir",
  },

  // Header
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
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },

  scrollView: {
    flex: 1,
  },

  // Student Card
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  studentAvatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  studentClass: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  academicYear: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Vazir",
  },

  // Summary
  summaryCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 4,
    fontFamily: "VazirBold",
  },

  // Actions
  actionRow: {
    flexDirection: "row",
    margin: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Vazir",
  },

  // Tabs
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#3b82f6",
  },
  tabText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  // Items
  itemsContainer: {
    paddingHorizontal: 16,
  },
  itemGroupTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
    marginTop: 8,
    fontFamily: "VazirBold",
  },
  emptyItems: {
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 8,
    fontFamily: "Vazir",
  },

  // Discounts
  discountsSection: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  discountItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    gap: 12,
  },
  discountIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#f3e8ff",
    justifyContent: "center",
    alignItems: "center",
  },
  discountInfo: {
    flex: 1,
  },
  discountAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  discountReason: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  discountBy: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
});
