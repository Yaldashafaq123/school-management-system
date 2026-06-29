// app/(admin)/financial/students/[id].tsx
import { CollectionProgress } from "@/components/finance/CollectionProgress";
import { FeeItemCard } from "@/components/finance/FeeItemCard";
import { OutstandingBadge } from "@/components/finance/OutstandingBadge";
import {
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
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function StudentFinancialProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "history" | "discounts"
  >("overview");

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const fetchStudentDetails = async () => {
    try {
      const response = await financeApi.getStudentFeeDetails(Number(id));
      if (response.success) {
        setStudentData(response.data);
      }
    } catch (error) {
      console.error("Fetch student details error:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallTotals = () => {
    if (!studentData?.feeAssignments)
      return { totalFees: 0, totalPaid: 0, totalBalance: 0 };

    let totalFees = 0;
    let totalPaid = 0;
    let totalBalance = 0;

    studentData.feeAssignments.forEach((assignment: any) => {
      assignment.feeItems?.forEach((item: any) => {
        if (item.isRecurring && item.monthlyRecords) {
          item.monthlyRecords.forEach((record: any) => {
            totalFees += Number(record.amount);
            totalPaid += Number(record.paidAmount);
            totalBalance += Number(record.balanceAmount);
          });
        } else {
          totalFees += Number(item.finalAmount || item.amount);
          totalPaid += Number(item.paidAmount || 0);
          totalBalance +=
            Number(item.finalAmount || item.amount) -
            Number(item.paidAmount || 0);
        }
      });
    });

    return { totalFees, totalPaid, totalBalance };
  };

  const getAllPayments = () => {
    if (!studentData?.feeAssignments) return [];

    const payments: any[] = [];
    studentData.feeAssignments.forEach((assignment: any) => {
      assignment.feeItems?.forEach((item: any) => {
        if (item.monthlyRecords) {
          item.monthlyRecords.forEach((record: any) => {
            record.payments?.forEach((payment: any) => {
              payments.push({
                ...payment,
                type: "monthly",
                itemName: item.name,
                month: record.month,
                year: record.year,
              });
            });
          });
        }
        item.payments?.forEach((payment: any) => {
          payments.push({
            ...payment,
            type: "one-time",
            itemName: item.name,
          });
        });
      });
    });

    return payments.sort(
      (a, b) =>
        new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime(),
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!studentData) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>اطلاعات شاگرد پیدا نشد</Text>
      </View>
    );
  }

  const student = studentData;
  const totals = calculateOverallTotals();
  const allPayments = getAllPayments();
  const allDiscounts =
    student.feeAssignments?.flatMap((a: any) => a.studentDiscounts || []) || [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>پروفایل مالی</Text>
        <TouchableOpacity
          style={styles.payButton}
          onPress={() =>
            router.push(`/financial/payments/record?studentId=${id}`)
          }
        >
          <Ionicons name="wallet-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Student Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarLarge}>
              <Ionicons name="person" size={40} color="#3b82f6" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {student.user?.fullName || "نامشخص"}
              </Text>
              <Text style={styles.profileClass}>
                {student.class?.name || "بدون صنف"}
                {student.class?.section ? ` - ${student.class.section}` : ""}
              </Text>
              {student.user?.phone && (
                <TouchableOpacity
                  style={styles.phoneRow}
                  onPress={() => Linking.openURL(`tel:${student.user.phone}`)}
                >
                  <Ionicons name="call-outline" size={14} color="#3b82f6" />
                  <Text style={styles.phoneText}>{student.user.phone}</Text>
                </TouchableOpacity>
              )}
            </View>
            {totals.totalBalance > 0 ? (
              <OutstandingBadge amount={totals.totalBalance} type="danger" />
            ) : (
              <OutstandingBadge type="success" label="تسویه" />
            )}
          </View>

          {/* Overall Progress */}
          <CollectionProgress
            collected={totals.totalPaid}
            total={totals.totalFees}
            size="large"
            label="نرخ وصول کلی"
          />

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.quickStat}>
              <Text style={styles.quickStatValue}>
                {formatCurrency(totals.totalFees)}
              </Text>
              <Text style={styles.quickStatLabel}>کل فیس</Text>
            </View>
            <View style={styles.quickStat}>
              <Text style={[styles.quickStatValue, { color: "#059669" }]}>
                {formatCurrency(totals.totalPaid)}
              </Text>
              <Text style={styles.quickStatLabel}>پرداخت شده</Text>
            </View>
            <View style={styles.quickStat}>
              <Text
                style={[
                  styles.quickStatValue,
                  { color: totals.totalBalance > 0 ? "#ef4444" : "#059669" },
                ]}
              >
                {formatCurrency(totals.totalBalance)}
              </Text>
              <Text style={styles.quickStatLabel}>باقیمانده</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {[
            { key: "overview", label: "خلاصه", icon: "grid-outline" },
            { key: "history", label: "پرداخت‌ها", icon: "time-outline" },
            { key: "discounts", label: "تخفیف‌ها", icon: "pricetag-outline" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.key ? "#fff" : "#64748b"}
              />
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

        {/* Tab Content */}
        {activeTab === "overview" && (
          <View style={styles.tabContent}>
            {student.feeAssignments?.map((assignment: any, index: number) => (
              <View key={assignment.id || index} style={styles.assignmentCard}>
                <View style={styles.assignmentHeader}>
                  <Ionicons name="calendar-outline" size={18} color="#64748b" />
                  <Text style={styles.assignmentYear}>
                    {assignment.academicYear?.name || `سال تعلیمی ${index + 1}`}
                  </Text>
                  <View
                    style={[
                      styles.assignmentStatus,
                      {
                        backgroundColor:
                          getFeeStatusColor(assignment.status) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.assignmentStatusText,
                        { color: getFeeStatusColor(assignment.status) },
                      ]}
                    >
                      {getFeeStatusLabel(assignment.status)}
                    </Text>
                  </View>
                </View>

                {assignment.feeItems?.map((item: any) => {
                  if (item.isRecurring && item.monthlyRecords) {
                    return (
                      <View key={item.id}>
                        <Text style={styles.itemGroupTitle}>{item.name}</Text>
                        {item.monthlyRecords.map((record: any) => (
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
                            onPay={() =>
                              router.push(
                                `/financial/payments/record?studentId=${id}&recordId=${record.id}`,
                              )
                            }
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
                      onPay={() =>
                        router.push(
                          `/financial/payments/record?studentId=${id}&itemId=${item.id}`,
                        )
                      }
                    />
                  );
                })}
              </View>
            ))}

            {(!student.feeAssignments ||
              student.feeAssignments.length === 0) && (
              <View style={styles.emptySection}>
                <Ionicons name="document-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>هیچ فیس ثبت نشده</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "history" && (
          <View style={styles.tabContent}>
            {allPayments.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons name="wallet-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>هیچ پرداختی ثبت نشده</Text>
              </View>
            ) : (
              allPayments.map((payment, index) => (
                <View key={payment.id || index} style={styles.paymentCard}>
                  <View style={styles.paymentIcon}>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#10b981"
                    />
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>{payment.itemName}</Text>
                    {payment.month && (
                      <Text style={styles.paymentSubtitle}>
                        {getMonthName(payment.month)} {payment.year}
                      </Text>
                    )}
                    <Text style={styles.paymentDate}>
                      {new Date(payment.confirmedAt).toLocaleDateString(
                        "fa-AF",
                      )}
                    </Text>
                  </View>
                  <View style={styles.paymentAmount}>
                    <Text style={styles.paymentAmountText}>
                      + {formatCurrency(Number(payment.amount))}
                    </Text>
                    <Text style={styles.paymentMethod}>
                      {payment.confirmer?.fullName || "نامشخص"}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "discounts" && (
          <View style={styles.tabContent}>
            {allDiscounts.length === 0 ? (
              <View style={styles.emptySection}>
                <Ionicons name="pricetag-outline" size={48} color="#cbd5e1" />
                <Text style={styles.emptyText}>هیچ تخفیفی ثبت نشده</Text>
              </View>
            ) : (
              allDiscounts.map((discount: any, index: number) => (
                <View key={discount.id || index} style={styles.discountCard}>
                  <View style={styles.discountIcon}>
                    <Ionicons name="pricetag" size={22} color="#8b5cf6" />
                  </View>
                  <View style={styles.discountInfo}>
                    <Text style={styles.discountAmount}>
                      {formatCurrency(Number(discount.amount))}
                    </Text>
                    <Text style={styles.discountReason}>{discount.reason}</Text>
                    <Text style={styles.discountDate}>
                      {new Date(discount.createdAt).toLocaleDateString("fa-AF")}
                    </Text>
                  </View>
                  <Text style={styles.discountBy}>
                    {discount.approver?.fullName || "نامشخص"}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

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
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#64748b",
    fontFamily: "Vazir",
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
  payButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },

  // Profile Card
  profileCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  profileClass: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  phoneText: {
    fontSize: 13,
    color: "#3b82f6",
    fontFamily: "Vazir",
  },
  quickStats: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 8,
  },
  quickStat: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  quickStatLabel: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },

  // Tabs
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabActive: {
    backgroundColor: "#3b82f6",
  },
  tabText: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  tabTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  // Tab Content
  tabContent: {
    paddingHorizontal: 16,
  },

  // Assignment Card
  assignmentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  assignmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  assignmentYear: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    fontFamily: "Vazir",
  },
  assignmentStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  assignmentStatusText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  itemGroupTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
    marginTop: 4,
    fontFamily: "VazirBold",
  },

  // Payment History
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderRightWidth: 4,
    borderRightColor: "#10b981",
  },
  paymentIcon: {
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  paymentSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  paymentDate: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  paymentAmount: {
    alignItems: "flex-end",
  },
  paymentAmountText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10b981",
    fontFamily: "VazirBold",
  },
  paymentMethod: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },

  // Discount Cards
  discountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderRightWidth: 4,
    borderRightColor: "#8b5cf6",
  },
  discountIcon: {
    marginRight: 12,
  },
  discountInfo: {
    flex: 1,
  },
  discountAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  discountReason: {
    fontSize: 13,
    color: "#475569",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  discountDate: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  discountBy: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },

  // Empty
  emptySection: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 8,
    fontFamily: "Vazir",
  },
});
