import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency, PERSIAN_MONTHS } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Teacher {
  id: number;
  name: string;
}

interface Salary {
  id: number;
  teacherId: number;
  teacherName: string;
  month: number;
  year: number;
  baseSalary: number;
  overtimeAmount: number;
  bonusAmount: number;
  deductionAmount: number;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "نقدی", icon: "cash", color: Colors.success },
  { value: "BANK_TRANSFER", label: "انتقال بانکی", icon: "card", color: Colors.primary },
  { value: "CHECK", label: "چک", icon: "document-text", color: Colors.warning },
];

export default function RecordSalaryPayment() {
  const router = useRouter();
  const { teacherId, salaryId } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [selectedSalary, setSelectedSalary] = useState<Salary | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "CASH",
    referenceNo: "",
    notes: "",
    isEarlyPayment: false,
    earlyDiscount: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showTeacherSelect, setShowTeacherSelect] = useState(!teacherId);

  const loadTeachers = useCallback(async () => {
    try {
      const response = await financeApi.getTeachersForSalary();
      if (response.success) {
        setTeachers(response.data);
        if (teacherId) {
          const teacher = response.data.find((t: Teacher) => t.id === parseInt(teacherId as string));
          if (teacher) {
            setSelectedTeacher(teacher);
            loadSalaries(teacher.id);
          }
        }
      }
    } catch (error) {
      console.error("Error loading teachers:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری معلمین پیش آمد");
    }
  }, [teacherId]);

  const loadSalaries = async (teacherIdNum: number) => {
    setLoading(true);
    try {
      const response = await financeApi.getTeacherSalaries(teacherIdNum);
      if (response.success) {
        const pendingSalaries = response.data.filter((s: Salary) => s.status !== "PAID");
        setSalaries(pendingSalaries);
        
        if (salaryId) {
          const salary = pendingSalaries.find((s: Salary) => s.id === parseInt(salaryId as string));
          if (salary) {
            setSelectedSalary(salary);
            setPaymentForm(prev => ({ ...prev, amount: salary.remainingAmount.toString() }));
          } else if (pendingSalaries.length === 1) {
            setSelectedSalary(pendingSalaries[0]);
            setPaymentForm(prev => ({ ...prev, amount: pendingSalaries[0].remainingAmount.toString() }));
          }
        } else if (pendingSalaries.length === 1) {
          setSelectedSalary(pendingSalaries[0]);
          setPaymentForm(prev => ({ ...prev, amount: pendingSalaries[0].remainingAmount.toString() }));
        }
      }
    } catch (error) {
      console.error("Error loading salaries:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری معاشات پیش آمد");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const handleSelectTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setSelectedSalary(null);
    loadSalaries(teacher.id);
    setShowTeacherSelect(false);
  };

  const handleSubmit = async () => {
    if (!selectedSalary) {
      Alert.alert("خطا", "لطفاً معاش مورد نظر را انتخاب کنید");
      return;
    }

    let amount = parseFloat(paymentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("خطا", "لطفاً مبلغ معتبر وارد کنید");
      return;
    }

    let discountAmount = 0;
    if (paymentForm.isEarlyPayment && paymentForm.earlyDiscount) {
      discountAmount = amount * (parseFloat(paymentForm.earlyDiscount) / 100);
      amount = amount - discountAmount;
    }

    if (amount > selectedSalary.remainingAmount) {
      Alert.alert("خطا", `مبلغ وارد شده بیشتر از مانده معاش (${formatCurrency(selectedSalary.remainingAmount)}) است`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await financeApi.paySalary({
        salaryId: selectedSalary.id,
        amount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        referenceNo: paymentForm.referenceNo || undefined,
        notes: paymentForm.notes || undefined,
        isEarlyPayment: paymentForm.isEarlyPayment,
        earlyDiscount: paymentForm.earlyDiscount ? parseFloat(paymentForm.earlyDiscount) : undefined,
      });

      if (response.success) {
        Alert.alert(
          "موفق",
          `پرداخت معاش با موفقیت ثبت شد${paymentForm.isEarlyPayment ? " (پرداخت زودهنگام)" : ""}`,
          [
            {
              text: "ثبت دوباره",
              onPress: () => {
                setSelectedTeacher(null);
                setSelectedSalary(null);
                setPaymentForm({
                  amount: "",
                  paymentMethod: "CASH",
                  referenceNo: "",
                  notes: "",
                  isEarlyPayment: false,
                  earlyDiscount: "",
                });
                setShowTeacherSelect(true);
              },
            },
            { text: "بازگشت", onPress: () => router.back() },
          ]
        );
      } else {
        Alert.alert("خطا", (response as any).message || "پرداخت معاش ناموفق بود");
      }
    } catch (error: any) {
      Alert.alert("خطا", error?.message || "پرداخت معاش ناموفق بود");
    } finally {
      setSubmitting(false);
    }
  };

  if (showTeacherSelect) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="پرداخت معاش" showBack />
        <View style={styles.content}>
          <Text style={styles.selectTitle}>انتخاب معلم</Text>
          <Text style={styles.selectDesc}>معلم مورد نظر را برای پرداخت معاش انتخاب کنید</Text>
          
          {teachers.map((teacher) => (
            <TouchableOpacity
              key={teacher.id}
              style={styles.teacherCard}
              onPress={() => handleSelectTeacher(teacher)}
              activeOpacity={0.7}
            >
              <View style={styles.teacherAvatar}>
                <Text style={styles.teacherAvatarText}>{teacher.name.charAt(0)}</Text>
              </View>
              <Text style={styles.teacherName}>{teacher.name}</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="پرداخت معاش" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="پرداخت معاش" showBack />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Teacher Info */}
          <View style={styles.teacherInfoCard}>
            <View style={styles.teacherAvatarLarge}>
              <Text style={styles.teacherAvatarLargeText}>{selectedTeacher?.name.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.teacherNameLarge}>{selectedTeacher?.name}</Text>
              <TouchableOpacity onPress={() => setShowTeacherSelect(true)}>
                <Text style={styles.changeTeacherText}>تغییر معلم</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Salary Selection */}
          {salaries.length > 1 && !selectedSalary && (
            <View style={styles.salarySelection}>
              <Text style={styles.salarySelectionTitle}>انتخاب معاش</Text>
              {salaries.map((salary) => (
                <TouchableOpacity
                  key={salary.id}
                  style={styles.salaryOption}
                  onPress={() => {
                    setSelectedSalary(salary);
                    setPaymentForm(prev => ({ ...prev, amount: salary.remainingAmount.toString() }));
                  }}
                  activeOpacity={0.7}
                >
                  <View>
                    <Text style={styles.salaryPeriod}>
                      {PERSIAN_MONTHS[salary.month - 1]} {salary.year}
                    </Text>
                    <Text style={styles.salaryAmount}>{formatCurrency(salary.finalAmount)}</Text>
                  </View>
                  <Text style={[styles.salaryRemaining, { color: Colors.danger }]}>
                    {formatCurrency(salary.remainingAmount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedSalary && (
            <>
              {/* Salary Summary */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>جزئیات معاش</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>دوره:</Text>
                  <Text style={styles.summaryValue}>
                    {PERSIAN_MONTHS[selectedSalary.month - 1]} {selectedSalary.year}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>حقوق پایه:</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(selectedSalary.baseSalary)}</Text>
                </View>
                {selectedSalary.overtimeAmount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>اضافه‌کار:</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(selectedSalary.overtimeAmount)}</Text>
                  </View>
                )}
                {selectedSalary.bonusAmount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>پاداش:</Text>
                    <Text style={[styles.summaryValue, { color: Colors.success }]}>{formatCurrency(selectedSalary.bonusAmount)}</Text>
                  </View>
                )}
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabelBold}>جمع کل:</Text>
                  <Text style={styles.summaryValueBold}>{formatCurrency(selectedSalary.finalAmount)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>پرداخت شده:</Text>
                  <Text style={[styles.summaryValue, { color: Colors.success }]}>{formatCurrency(selectedSalary.paidAmount)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>مانده:</Text>
                  <Text style={[styles.summaryValue, { color: Colors.danger }]}>{formatCurrency(selectedSalary.remainingAmount)}</Text>
                </View>
              </View>

              {/* Amount Input */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>مبلغ پرداختی</Text>
                <View style={styles.amountContainer}>
                  <TextInput
                    style={styles.amountInput}
                    value={paymentForm.amount}
                    onChangeText={(text) => setPaymentForm({ ...paymentForm, amount: text.replace(/[^0-9.]/g, '') })}
                    keyboardType="decimal-pad"
                    placeholder="مبلغ"
                    placeholderTextColor={Colors.textSecondary}
                    textAlign="center"
                  />
                  <Text style={styles.currencyUnit}>AFN</Text>
                </View>
              </View>

              {/* Quick Amounts */}
              <View style={styles.quickAmounts}>
                <TouchableOpacity
                  style={styles.quickAmountBtn}
                  onPress={() => setPaymentForm(prev => ({ ...prev, amount: selectedSalary.remainingAmount.toString() }))}
                >
                  <Text style={styles.quickAmountText}>تمام مبلغ</Text>
                </TouchableOpacity>
              </View>

              {/* Early Payment */}
              <View style={styles.earlyPaymentSection}>
                <View style={styles.earlyPaymentHeader}>
                  <View>
                    <Text style={styles.earlyPaymentTitle}>پرداخت زودهنگام</Text>
                    <Text style={styles.earlyPaymentDesc}>در صورت پرداخت قبل از موعد، تخفیف اعمال شود</Text>
                  </View>
                  <Switch
                    value={paymentForm.isEarlyPayment}
                    onValueChange={(value) => setPaymentForm({ ...paymentForm, isEarlyPayment: value })}
                    trackColor={{ false: Colors.border, true: `${Colors.success}50` }}
                    thumbColor={paymentForm.isEarlyPayment ? Colors.success : "#f4f3f4"}
                  />
                </View>
                {paymentForm.isEarlyPayment && (
                  <View style={styles.earlyDiscountInput}>
                    <TextInput
                      style={styles.discountInput}
                      value={paymentForm.earlyDiscount}
                      onChangeText={(text) => setPaymentForm({ ...paymentForm, earlyDiscount: text.replace(/[^0-9.]/g, '') })}
                      keyboardType="decimal-pad"
                      placeholder="درصد تخفیف"
                      placeholderTextColor={Colors.textSecondary}
                      textAlign="center"
                    />
                    <Text style={styles.discountUnit}>%</Text>
                  </View>
                )}
              </View>

              {/* Payment Method */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>روش پرداخت</Text>
                <View style={styles.methodsRow}>
                  {PAYMENT_METHODS.map((method) => (
                    <TouchableOpacity
                      key={method.value}
                      style={[styles.methodCard, paymentForm.paymentMethod === method.value && { borderColor: method.color, backgroundColor: `${method.color}10` }]}
                      onPress={() => setPaymentForm({ ...paymentForm, paymentMethod: method.value })}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={method.icon as any} size={24} color={paymentForm.paymentMethod === method.value ? method.color : Colors.textSecondary} />
                      <Text style={[styles.methodLabel, paymentForm.paymentMethod === method.value && { color: method.color, fontWeight: "500" }]}>
                        {method.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Reference Number */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>شماره مرجع (اختیاری)</Text>
                <TextInput
                  style={styles.input}
                  value={paymentForm.referenceNo}
                  onChangeText={(text) => setPaymentForm({ ...paymentForm, referenceNo: text })}
                  placeholder="شماره پیگیری / شماره چک"
                  placeholderTextColor={Colors.textSecondary}
                  textAlign="right"
                />
              </View>

              {/* Notes */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>توضیحات (اختیاری)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={paymentForm.notes}
                  onChangeText={(text) => setPaymentForm({ ...paymentForm, notes: text })}
                  placeholder="توضیحات اضافی..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  textAlign="right"
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, (submitting || !paymentForm.amount || parseFloat(paymentForm.amount) <= 0) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting || !paymentForm.amount || parseFloat(paymentForm.amount) <= 0}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={22} color="white" />
                    <Text style={styles.submitButtonText}>تایید و ثبت پرداخت</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  keyboardAvoid: { flex: 1 },
  content: { flex: 1, padding: 16 },
  
  selectTitle: { fontSize: 20, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", textAlign: "center", marginBottom: 8 },
  selectDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center", marginBottom: 20 },
  
  teacherCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, padding: 16, borderRadius: 14, marginBottom: 10, gap: 12 },
  teacherAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: `${Colors.primary}15`, justifyContent: "center", alignItems: "center" },
  teacherAvatarText: { fontSize: 18, fontWeight: "bold", color: Colors.primary, fontFamily: "Vazirmatn" },
  teacherName: { flex: 1, fontSize: 16, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },
  
  teacherInfoCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, padding: 16, borderRadius: 14, marginBottom: 20, gap: 14 },
  teacherAvatarLarge: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" },
  teacherAvatarLargeText: { fontSize: 24, fontWeight: "bold", color: "white", fontFamily: "Vazirmatn" },
  teacherNameLarge: { fontSize: 16, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 4 },
  changeTeacherText: { fontSize: 12, color: Colors.primary, fontFamily: "Vazirmatn" },
  
  salarySelection: { marginBottom: 20 },
  salarySelectionTitle: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 10, textAlign: "right" },
  salaryOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: Colors.card, padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  salaryPeriod: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 4 },
  salaryAmount: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  salaryRemaining: { fontSize: 14, fontWeight: "bold", fontFamily: "Vazirmatn" },
  
  summaryCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, marginBottom: 20 },
  summaryTitle: { fontSize: 16, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 12, textAlign: "center" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  summaryLabelBold: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn" },
  summaryValue: { fontSize: 13, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },
  summaryValueBold: { fontSize: 14, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn" },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 8, textAlign: "right" },
  
  amountContainer: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, overflow: "hidden" },
  amountInput: { flex: 1, padding: 14, fontSize: 20, fontWeight: "bold", color: Colors.text, textAlign: "center", fontFamily: "Vazirmatn" },
  currencyUnit: { paddingHorizontal: 12, fontSize: 14, color: Colors.textSecondary, backgroundColor: Colors.background, textAlignVertical: "center", paddingVertical: 14 },
  
  quickAmounts: { flexDirection: "row", gap: 8, marginBottom: 20 },
  quickAmountBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.primary, alignItems: "center" },
  quickAmountText: { fontSize: 13, color: "white", fontWeight: "500", fontFamily: "Vazirmatn" },
  
  earlyPaymentSection: { backgroundColor: `${Colors.warning}10`, borderRadius: 12, padding: 14, marginBottom: 20 },
  earlyPaymentHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  earlyPaymentTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  earlyPaymentDesc: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  earlyDiscountInput: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 8 },
  discountInput: { flex: 1, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, fontSize: 16, textAlign: "center", fontFamily: "Vazirmatn" },
  discountUnit: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  methodsRow: { flexDirection: "row", gap: 12 },
  methodCard: { flex: 1, alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.card, gap: 6 },
  methodLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  input: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12, fontSize: 14, color: Colors.text, fontFamily: "Vazirmatn" },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  
  submitButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.success, borderRadius: 12, paddingVertical: 16, gap: 8, marginTop: 10, marginBottom: 30 },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: "white", fontSize: 16, fontWeight: "bold", fontFamily: "Vazirmatn" },
});