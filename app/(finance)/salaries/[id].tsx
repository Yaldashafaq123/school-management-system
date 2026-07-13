// app/(admin)/financial/salaries/[id].tsx
import { CollectionProgress } from "@/components/finance/CollectionProgress";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function SalaryDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [salary, setSalary] = useState<any>(null);

  useEffect(() => {
    fetchSalaryDetails();
  }, [id]);

  const fetchSalaryDetails = async () => {
    try {
      const response = await financeApi.getSalaries();
      if (response.success) {
        const found = (response.data || []).find(
          (s: any) => s.id === Number(id),
        );
        setSalary(found || null);
      }
    } catch (error) {
      console.error("Fetch salary error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!salary) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>معاش پیدا نشد</Text>
      </View>
    );
  }

  const totalAmount = Number(salary.finalAmount || salary.amount || 0);
  const paidAmount = Number(salary.paidAmount || 0);
  const balance = totalAmount - paidAmount;
  const baseSalary = Number(salary.baseSalary || salary.amount || 0);
  const bonusAmount = Number(salary.bonusAmount || 0);
  const deductionAmount = Number(salary.deductionAmount || 0);
  const overtimeAmount = Number(salary.overtimeAmount || 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>جزئیات معاش</Text>
        <TouchableOpacity
          onPress={() =>
            router.push(`/financial/salaries/payment?id=${salary.id}`)
          }
        >
          <Ionicons name="wallet-outline" size={24} color="#f97316" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Teacher Info */}
        <View style={styles.teacherCard}>
          <View style={styles.teacherAvatar}>
            <Ionicons name="person" size={48} color="#f97316" />
          </View>
          <Text style={styles.teacherName}>
            {salary.teacher?.user?.fullName || "نامشخص"}
          </Text>
          <Text style={styles.teacherPeriod}>
            معاش ماه {salary.month} / {salary.year}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  salary.status === "PAID"
                    ? "#d1fae5"
                    : salary.status === "PARTIAL"
                      ? "#fef3c7"
                      : "#fecaca",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    salary.status === "PAID"
                      ? "#059669"
                      : salary.status === "PARTIAL"
                        ? "#d97706"
                        : "#dc2626",
                },
              ]}
            >
              {salary.status === "PAID"
                ? "پرداخت شده"
                : salary.status === "PARTIAL"
                  ? "پرداخت ناقص"
                  : "در انتظار"}
            </Text>
          </View>
        </View>

        {/* Payment Progress */}
        <View style={styles.section}>
          <CollectionProgress
            collected={paidAmount}
            total={totalAmount}
            size="large"
          />
        </View>

        {/* Salary Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>جزئیات معاش</Text>

          <View style={styles.breakdownItem}>
            <View style={styles.breakdownLeft}>
              <View
                style={[styles.breakdownDot, { backgroundColor: "#3b82f6" }]}
              />
              <Text style={styles.breakdownLabel}>معاش پایه</Text>
            </View>
            <Text style={styles.breakdownValue}>
              {formatCurrency(baseSalary)}
            </Text>
          </View>

          {bonusAmount > 0 && (
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View
                  style={[styles.breakdownDot, { backgroundColor: "#10b981" }]}
                />
                <Text style={styles.breakdownLabel}>بونس</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: "#10b981" }]}>
                + {formatCurrency(bonusAmount)}
              </Text>
            </View>
          )}

          {overtimeAmount > 0 && (
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View
                  style={[styles.breakdownDot, { backgroundColor: "#8b5cf6" }]}
                />
                <Text style={styles.breakdownLabel}>
                  اضافه‌کاری ({salary.overtimeHours || 0} ساعت)
                </Text>
              </View>
              <Text style={[styles.breakdownValue, { color: "#8b5cf6" }]}>
                + {formatCurrency(overtimeAmount)}
              </Text>
            </View>
          )}

          {deductionAmount > 0 && (
            <View style={styles.breakdownItem}>
              <View style={styles.breakdownLeft}>
                <View
                  style={[styles.breakdownDot, { backgroundColor: "#ef4444" }]}
                />
                <Text style={styles.breakdownLabel}>کسورات</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: "#ef4444" }]}>
                - {formatCurrency(deductionAmount)}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>مجموع قابل پرداخت</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
        </View>

        {/* Payment History */}
        {salary.payments && salary.payments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>پرداخت‌ها</Text>
            {salary.payments.map((payment: any, index: number) => (
              <View key={payment.id || index} style={styles.paymentCard}>
                <Ionicons name="checkmark-circle" size={22} color="#10b981" />
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentAmount}>
                    {formatCurrency(Number(payment.amount))}
                  </Text>
                  <Text style={styles.paymentDate}>
                    {new Date(payment.paidAt).toLocaleDateString("fa-AF")}
                  </Text>
                </View>
                <Text style={styles.paymentMethod}>
                  {payment.paymentMethod || "نقدی"}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {salary.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>یادداشت</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{salary.notes}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        {balance > 0 && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.payButton}
              onPress={() =>
                router.push(`/financial/salaries/payment?id=${salary.id}`)
              }
            >
              <Ionicons name="wallet-outline" size={22} color="#fff" />
              <Text style={styles.payText}>
                پرداخت {formatCurrency(balance)}
              </Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  teacherCard: {
    margin: 16,
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  teacherAvatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#fff7ed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  teacherName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  teacherPeriod: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  statusBadge: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  breakdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabel: {
    fontSize: 14,
    color: "#475569",
    fontFamily: "Vazir",
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#f97316",
    fontFamily: "VazirBold",
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    gap: 10,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#10b981",
    fontFamily: "VazirBold",
  },
  paymentDate: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  paymentMethod: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  notesCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 14,
  },
  notesText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    fontFamily: "Vazir",
  },
  actionsSection: {
    margin: 16,
    marginTop: 8,
  },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f97316",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    elevation: 4,
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  payText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
});
