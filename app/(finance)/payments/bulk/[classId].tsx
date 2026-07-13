// app/(admin)/financial/payments/bulk/[classId].tsx
import { AmountInput } from "@/components/finance/AmountInput";
import { EmptyState } from "@/components/finance/EmptyState";
import { PaymentMethodPicker } from "@/components/finance/PaymentMethodPicker";
import {
    BulkStudent,
    financeApi,
    formatCurrency,
} from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function BulkPaymentScreen() {
  const { classId } = useLocalSearchParams();
  const router = useRouter();
  const [students, setStudents] = useState<BulkStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(
    new Set(),
  );
  const [amounts, setAmounts] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchStudents();
  }, [classId]);

  const fetchStudents = async () => {
    try {
      const response = await financeApi.getStudentsForBulkCollection(
        Number(classId),
      );
      if (response.success) {
        setStudents(response.data);
        // Initialize amounts with default values
        const defaultAmounts: Record<number, string> = {};
        response.data.forEach((s) => {
          if (s.amount > 0) {
            defaultAmounts[s.id] = s.amount.toString();
          }
        });
        setAmounts(defaultAmounts);
      }
    } catch (error) {
      console.error("Fetch students error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (studentId: number) => {
    const newSet = new Set(selectedStudents);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedStudents(newSet);
  };

  const toggleAll = () => {
    const eligibleStudents = students.filter((s) => s.amount > 0);
    if (selectedStudents.size === eligibleStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(eligibleStudents.map((s) => s.id)));
    }
  };

  const updateAmount = (studentId: number, amount: string) => {
    setAmounts((prev) => ({ ...prev, [studentId]: amount }));
  };

  const getTotalSelected = () => {
    let total = 0;
    selectedStudents.forEach((id) => {
      total += Number(amounts[id] || 0);
    });
    return total;
  };

  const handleSubmit = async () => {
    if (selectedStudents.size === 0) {
      Alert.alert("خطا", "حداقل یک شاگرد انتخاب کنید");
      return;
    }

    const payments = Array.from(selectedStudents)
      .filter((id) => Number(amounts[id]) > 0)
      .map((studentId) => ({
        studentId,
        amount: Number(amounts[studentId]),
        paymentMethod,
      }));

    if (payments.length === 0) {
      Alert.alert("خطا", "مبلغ پرداختی را وارد کنید");
      return;
    }

    setSubmitting(true);
    try {
      const response = await financeApi.recordBulkPayments({
        classId: Number(classId),
        payments,
      });

      if (response.success) {
        Alert.alert(
          "موفقیت",
          `پرداخت ${payments.length} شاگرد با موفقیت ثبت شد`,
          [{ text: "باشه", onPress: () => router.back() }],
        );
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "ثبت پرداخت با مشکل مواجه شد");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  const eligibleStudents = students.filter((s) => s.amount > 0);
  const totalPending = students.reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>پرداخت جمعی</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>کل شاگردان</Text>
              <Text style={styles.summaryValue}>{students.length}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>بدهکار</Text>
              <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
                {eligibleStudents.length}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>مجموع بدهی</Text>
              <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>
                {formatCurrency(totalPending)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <PaymentMethodPicker
            value={paymentMethod}
            onSelect={setPaymentMethod}
          />
        </View>

        {/* Students List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              شاگردان ({eligibleStudents.length})
            </Text>
            <TouchableOpacity onPress={toggleAll}>
              <Text style={styles.selectAllText}>
                {selectedStudents.size === eligibleStudents.length
                  ? "حذف همه"
                  : "انتخاب همه"}
              </Text>
            </TouchableOpacity>
          </View>

          {eligibleStudents.length === 0 ? (
            <EmptyState
              icon="checkmark-circle-outline"
              title="همه پرداخت کرده‌اند"
              subtitle="هیچ بدهی برای این صنف وجود ندارد"
            />
          ) : (
            eligibleStudents.map((student) => {
              const isSelected = selectedStudents.has(student.id);
              return (
                <View
                  key={student.id}
                  style={[
                    styles.studentCard,
                    isSelected && styles.studentCardSelected,
                  ]}
                >
                  <TouchableOpacity
                    style={styles.studentCheckbox}
                    onPress={() => toggleStudent(student.id)}
                  >
                    <Ionicons
                      name={isSelected ? "checkbox" : "square-outline"}
                      size={24}
                      color={isSelected ? "#8b5cf6" : "#cbd5e1"}
                    />
                  </TouchableOpacity>

                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentRoll}>{student.rollNumber}</Text>
                    <Text style={styles.studentBalance}>
                      بدهی: {formatCurrency(student.amount || 0)}
                    </Text>
                  </View>

                  <View style={styles.studentAmount}>
                    <AmountInput
                      value={amounts[student.id] || ""}
                      onChangeText={(text) => updateAmount(student.id, text)}
                      maxAmount={student.amount}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      {selectedStudents.size > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerCount}>
              {selectedStudents.size} شاگرد
            </Text>
            <Text style={styles.footerTotal}>
              مجموع: {formatCurrency(getTotalSelected())}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={styles.submitText}>ثبت پرداخت جمعی</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  summaryCard: {
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
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 4,
    fontFamily: "VazirBold",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    fontFamily: "VazirBold",
  },
  selectAllText: {
    fontSize: 14,
    color: "#8b5cf6",
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  studentCardSelected: {
    backgroundColor: "#f3e8ff",
    borderColor: "#c4b5fd",
  },
  studentCheckbox: {
    marginRight: 10,
  },
  studentInfo: {
    flex: 1,
    marginRight: 8,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  studentRoll: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  studentBalance: {
    fontSize: 13,
    color: "#ef4444",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  studentAmount: {
    width: 120,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  footerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  footerCount: {
    fontSize: 14,
    color: "#475569",
    fontFamily: "Vazir",
  },
  footerTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
});
