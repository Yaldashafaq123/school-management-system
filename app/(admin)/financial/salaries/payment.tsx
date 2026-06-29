// app/(admin)/financial/salaries/payment.tsx
import { AmountInput } from "@/components/finance/AmountInput";
import { PaymentMethodPicker } from "@/components/finance/PaymentMethodPicker";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SalaryPaymentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [salary, setSalary] = useState<any>(null);

  // Form state
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchSalaryInfo();
  }, [id]);

  const fetchSalaryInfo = async () => {
    setLoading(true);
    try {
      const response = await financeApi.getSalaries();
      if (response.success) {
        const found = (response.data || []).find(
          (s: any) => s.id === Number(id),
        );
        if (found) {
          setSalary(found);
          const balance =
            Number(found.finalAmount || found.amount || 0) -
            Number(found.paidAmount || 0);
          setAmount(balance.toString());
        }
      }
    } catch (error) {
      console.error("Fetch salary error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      Alert.alert("خطا", "مبلغ را وارد کنید");
      return;
    }

    const balance =
      Number(salary.finalAmount || salary.amount || 0) -
      Number(salary.paidAmount || 0);
    if (Number(amount) > balance) {
      Alert.alert(
        "خطا",
        `مبلغ نمی‌تواند بیشتر از ${formatCurrency(balance)} باشد`,
      );
      return;
    }

    setSubmitting(true);
    try {
      await financeApi.recordSalaryPayment({
        salaryId: Number(id),
        amount: Number(amount),
        paymentMethod,
        referenceNo: referenceNo || undefined,
        notes: notes || undefined,
        confirmedBy: 1, // Should come from auth context
      });

      Alert.alert("موفقیت", "پرداخت معاش با موفقیت ثبت شد", [
        { text: "باشه", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("خطا", error.message || "ثبت پرداخت با مشکل مواجه شد");
    } finally {
      setSubmitting(false);
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
  const percentage =
    totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>پرداخت معاش</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Salary Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.teacherRow}>
            <Ionicons name="person-circle" size={40} color="#f97316" />
            <View style={styles.teacherInfo}>
              <Text style={styles.teacherName}>
                {salary.teacher?.user?.fullName || "نامشخص"}
              </Text>
              <Text style={styles.periodText}>
                معاش ماه {salary.month} / {salary.year}
              </Text>
            </View>
          </View>

          <View style={styles.amountRow}>
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>معاش کل</Text>
              <Text style={styles.amountValue}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>پرداخت شده</Text>
              <Text style={[styles.amountValue, { color: "#10b981" }]}>
                {formatCurrency(paidAmount)}
              </Text>
            </View>
            <View style={styles.amountItem}>
              <Text style={styles.amountLabel}>باقیمانده</Text>
              <Text style={[styles.amountValue, { color: "#ef4444" }]}>
                {formatCurrency(balance)}
              </Text>
            </View>
          </View>

          {/* Progress */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percentage}%` }]} />
          </View>
        </View>

        {/* Payment Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ثبت پرداخت</Text>

          <AmountInput
            value={amount}
            onChangeText={setAmount}
            maxAmount={balance}
            label="مبلغ پرداختی"
          />

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmounts}>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => setAmount(balance.toString())}
            >
              <Text style={styles.quickBtnText}>پرداخت کامل</Text>
              <Text style={styles.quickBtnAmount}>
                {formatCurrency(balance)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => setAmount(Math.ceil(balance / 2).toString())}
            >
              <Text style={styles.quickBtnText}>پرداخت نصف</Text>
              <Text style={styles.quickBtnAmount}>
                {formatCurrency(Math.ceil(balance / 2))}
              </Text>
            </TouchableOpacity>
          </View>

          <PaymentMethodPicker
            value={paymentMethod}
            onSelect={setPaymentMethod}
          />

          {/* Reference Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>شماره مرجع (اختیاری)</Text>
            <View style={styles.referenceInput}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#94a3b8"
              />
              <TextInput
                style={styles.textInput}
                placeholder="شماره مرجع"
                placeholderTextColor="#94a3b8"
                value={referenceNo}
                onChangeText={setReferenceNo}
                textAlign="right"
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>یادداشت (اختیاری)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="یادداشت..."
              placeholderTextColor="#94a3b8"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
              textAlign="right"
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.submitText}>
                پرداخت {amount ? formatCurrency(Number(amount)) : ""}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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

  // Summary
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
  teacherRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  periodText: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  amountRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  amountItem: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  amountValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 4,
    fontFamily: "VazirBold",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#f97316",
  },

  // Section
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
    marginBottom: 16,
    fontFamily: "VazirBold",
  },

  // Quick Amounts
  quickAmounts: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  quickBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#fff7ed",
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  quickBtnText: {
    fontSize: 12,
    color: "#f97316",
    fontFamily: "Vazir",
  },
  quickBtnAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#f97316",
    marginTop: 4,
    fontFamily: "VazirBold",
  },

  // Inputs
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
    fontFamily: "Vazir",
  },
  referenceInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#1e293b",
    paddingVertical: 12,
    fontFamily: "Vazir",
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
  },

  // Footer
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f97316",
    paddingVertical: 16,
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
