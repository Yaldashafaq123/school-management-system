// app/(admin)/financial/payments/record.tsx
import { AmountInput } from "@/components/finance/AmountInput";
import { PaymentMethodPicker } from "@/components/finance/PaymentMethodPicker";
import { StudentSearchInput } from "@/components/finance/StudentSearchInput";
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
    TouchableOpacity,
    View,
} from "react-native";

// Need to import TextInput
import { TextInput } from "react-native";

interface PendingFee {
  id: number;
  type: "monthly" | "one-time";
  name: string;
  month?: string;
  monthName?: string;
  year?: number;
  amount: number;
  balance: number;
  recordId?: number;
  itemId?: number;
}

export default function RecordPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"student" | "fee" | "payment">("student");

  // Student
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Fee Selection
  const [pendingFees, setPendingFees] = useState<PendingFee[]>([]);
  const [selectedFee, setSelectedFee] = useState<PendingFee | null>(null);
  const [loadingFees, setLoadingFees] = useState(false);

  // Payment
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (params.studentId) {
      loadStudentFees(Number(params.studentId));
    }
  }, [params.studentId]);

  const handleStudentSelect = async (student: any) => {
    setSelectedStudent(student);
    await loadStudentFees(student.id);
  };

  const loadStudentFees = async (studentId: number) => {
    setLoadingFees(true);
    try {
      const response = await financeApi.getStudentFeeSummary(studentId);
      if (response.success) {
        const fees: PendingFee[] = [];

        response.data.forEach((assignment: any) => {
          assignment.items?.forEach((item: any) => {
            if (item.isRecurring && item.months) {
              item.months.forEach((month: any) => {
                if (month.balance > 0) {
                  fees.push({
                    id: month.id,
                    type: "monthly",
                    name: item.name,
                    month: month.month,
                    monthName: month.monthName,
                    year: month.year,
                    amount: month.amount,
                    balance: month.balance,
                    recordId: month.id,
                    itemId: item.id,
                  });
                }
              });
            } else if (!item.isRecurring && item.totalBalance > 0) {
              fees.push({
                id: item.id,
                type: "one-time",
                name: item.name,
                amount: item.totalAmount,
                balance: item.totalBalance,
                itemId: item.id,
              });
            }
          });
        });

        setPendingFees(fees);
        if (fees.length > 0) {
          setSelectedFee(fees[0]);
          setAmount(fees[0].balance.toString());
        }
        setStep("fee");
      }
    } catch (error) {
      console.error("Load fees error:", error);
      Alert.alert("خطا", "بارگذاری فیس‌ها با مشکل مواجه شد");
    } finally {
      setLoadingFees(false);
    }
  };

  const handleFeeSelect = (fee: PendingFee) => {
    setSelectedFee(fee);
    setAmount(fee.balance.toString());
    setStep("payment");
  };

  const handleSubmit = async () => {
    if (!selectedFee || !amount || Number(amount) <= 0) {
      Alert.alert("خطا", "مبلغ را وارد کنید");
      return;
    }

    if (Number(amount) > selectedFee.balance) {
      Alert.alert(
        "خطا",
        `مبلغ نمی‌تواند بیشتر از ${formatCurrency(selectedFee.balance)} باشد`,
      );
      return;
    }

    setLoading(true);
    try {
      if (selectedFee.type === "monthly" && selectedFee.recordId) {
        await financeApi.recordMonthlyPayment({
          monthlyFeeRecordId: selectedFee.recordId,
          amount: Number(amount),
          paymentMethod,
          referenceNo: referenceNo || undefined,
          notes: notes || undefined,
        });
      } else if (selectedFee.type === "one-time" && selectedFee.itemId) {
        await financeApi.recordOneTimePayment({
          feeAssignmentItemId: selectedFee.itemId,
          amount: Number(amount),
          paymentMethod,
          referenceNo: referenceNo || undefined,
          notes: notes || undefined,
        });
      }

      Alert.alert("موفقیت", "پرداخت با موفقیت ثبت شد", [
        { text: "باشه", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("خطا", error.message || "ثبت پرداخت با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>ثبت پرداخت</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepsContainer}>
        {["student", "fee", "payment"].map((s, index) => (
          <View key={s} style={styles.stepRow}>
            <View
              style={[
                styles.stepDot,
                step === s && styles.stepDotActive,
                ["student", "fee", "payment"].indexOf(step) > index &&
                  styles.stepDotCompleted,
              ]}
            >
              {["student", "fee", "payment"].indexOf(step) > index ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    step === s && styles.stepNumberActive,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[styles.stepLabel, step === s && styles.stepLabelActive]}
            >
              {s === "student" ? "شاگرد" : s === "fee" ? "فیس" : "پرداخت"}
            </Text>
            {index < 2 && <View style={styles.stepLine} />}
          </View>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1: Student Selection */}
        {step === "student" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>انتخاب شاگرد</Text>
            <StudentSearchInput
              onSelect={handleStudentSelect}
              value={selectedStudent}
            />
          </View>
        )}

        {/* Step 2: Fee Selection */}
        {step === "fee" && (
          <View style={styles.section}>
            {/* Selected Student Info */}
            <View style={styles.studentCard}>
              <Ionicons name="person-circle" size={40} color="#3b82f6" />
              <View>
                <Text style={styles.studentName}>{selectedStudent?.name}</Text>
                <Text style={styles.studentClass}>
                  {selectedStudent?.className}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setStep("student")}>
                <Ionicons name="create-outline" size={20} color="#3b82f6" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>انتخاب فیس برای پرداخت</Text>

            {loadingFees ? (
              <ActivityIndicator style={{ padding: 24 }} color="#3b82f6" />
            ) : pendingFees.length === 0 ? (
              <View style={styles.emptyFees}>
                <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                <Text style={styles.emptyText}>همه فیس‌ها پرداخت شده‌اند</Text>
              </View>
            ) : (
              pendingFees.map((fee) => (
                <TouchableOpacity
                  key={`${fee.type}-${fee.id}`}
                  style={[
                    styles.feeCard,
                    selectedFee?.id === fee.id &&
                      selectedFee?.type === fee.type &&
                      styles.feeCardSelected,
                  ]}
                  onPress={() => handleFeeSelect(fee)}
                >
                  <View style={styles.feeCardLeft}>
                    <View
                      style={[
                        styles.feeTypeIcon,
                        {
                          backgroundColor:
                            fee.type === "monthly" ? "#fef3c7" : "#dbeafe",
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          fee.type === "monthly" ? "repeat" : "receipt-outline"
                        }
                        size={20}
                        color={fee.type === "monthly" ? "#d97706" : "#3b82f6"}
                      />
                    </View>
                    <View>
                      <Text style={styles.feeName}>{fee.name}</Text>
                      {fee.type === "monthly" && (
                        <Text style={styles.feeMonth}>
                          {fee.monthName} {fee.year}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.feeCardRight}>
                    <Text style={styles.feeAmount}>
                      {formatCurrency(fee.amount)}
                    </Text>
                    <Text style={styles.feeBalance}>
                      باقی: {formatCurrency(fee.balance)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Step 3: Payment Details */}
        {step === "payment" && selectedFee && (
          <View style={styles.section}>
            {/* Selected Fee Summary */}
            <TouchableOpacity
              style={styles.selectedFeeCard}
              onPress={() => setStep("fee")}
            >
              <View style={styles.selectedFeeHeader}>
                <Ionicons name="wallet" size={24} color="#3b82f6" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.selectedFeeName}>{selectedFee.name}</Text>
                  {selectedFee.type === "monthly" && (
                    <Text style={styles.selectedFeeMonth}>
                      {selectedFee.monthName} {selectedFee.year}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-down" size={20} color="#94a3b8" />
              </View>
              <View style={styles.selectedFeeDetails}>
                <View style={styles.selectedFeeRow}>
                  <Text style={styles.selectedFeeLabel}>مبلغ کل:</Text>
                  <Text style={styles.selectedFeeValue}>
                    {formatCurrency(selectedFee.amount)}
                  </Text>
                </View>
                <View style={styles.selectedFeeRow}>
                  <Text style={styles.selectedFeeLabel}>باقیمانده:</Text>
                  <Text style={[styles.selectedFeeValue, { color: "#ef4444" }]}>
                    {formatCurrency(selectedFee.balance)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Amount Input */}
            <AmountInput
              value={amount}
              onChangeText={setAmount}
              maxAmount={selectedFee.balance}
              label="مبلغ پرداختی"
            />

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              <TouchableOpacity
                style={styles.quickAmountBtn}
                onPress={() => setAmount(selectedFee.balance.toString())}
              >
                <Text style={styles.quickAmountText}>پرداخت کامل</Text>
                <Text style={styles.quickAmountValue}>
                  {formatCurrency(selectedFee.balance)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAmountBtn}
                onPress={() =>
                  setAmount(Math.ceil(selectedFee.balance / 2).toString())
                }
              >
                <Text style={styles.quickAmountText}>پرداخت نصف</Text>
                <Text style={styles.quickAmountValue}>
                  {formatCurrency(Math.ceil(selectedFee.balance / 2))}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Payment Method */}
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
 
                numberOfLines={2}
                textAlign="right"
              />
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      {step === "payment" && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.submitText}>
                  ثبت پرداخت {formatCurrency(Number(amount || 0))}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Need to import TextInput

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    gap: 0,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: {
    backgroundColor: "#3b82f6",
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  stepDotCompleted: {
    backgroundColor: "#10b981",
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    fontFamily: "Vazir",
  },
  stepNumberActive: {
    color: "#fff",
  },
  stepLabel: {
    marginLeft: 6,
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
    marginRight: 8,
  },
  stepLabelActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 4,
  },
  section: {
    margin: 16,
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
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  studentClass: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  feeCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  feeCardSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  feeCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  feeTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  feeName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  feeMonth: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  feeCardRight: {
    alignItems: "flex-end",
  },
  feeAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  feeBalance: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  emptyFees: {
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  selectedFeeCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectedFeeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedFeeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  selectedFeeMonth: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  selectedFeeDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 6,
  },
  selectedFeeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  selectedFeeLabel: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  selectedFeeValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  quickAmounts: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  quickAmountBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f0fdf4",
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  quickAmountText: {
    fontSize: 12,
    color: "#059669",
    fontFamily: "Vazir",
  },
  quickAmountValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#059669",
    marginTop: 2,
    fontFamily: "VazirBold",
  },
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
    backgroundColor: "#10b981",
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
