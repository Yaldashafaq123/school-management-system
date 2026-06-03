import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Student {
  id: number;
  name: string;
  className: string;
  rollNumber: string;
}

interface PendingFee {
  id: number;
  title: string;
  amount: number;
  dueDate: string;
  remainingAmount: number;
  billingMonth?: number;
  billingYear?: number;
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "نقدی", icon: "cash", color: Colors.success },
  { value: "BANK_TRANSFER", label: "انتقال بانکی", icon: "card", color: Colors.primary },
  { value: "CHECK", label: "چک", icon: "document-text", color: Colors.warning },
];

export default function SingleFeeCollection() {
  const router = useRouter();
  const [step, setStep] = useState<"search" | "student" | "payment">("search");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [pendingFees, setPendingFees] = useState<PendingFee[]>([]);
  const [selectedFee, setSelectedFee] = useState<PendingFee | null>(null);
  
  // Payment form
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receiptModal, setReceiptModal] = useState(false);
  const [lastPayment, setLastPayment] = useState<any>(null);
  
  // Fee selection modal
  const [feeModalVisible, setFeeModalVisible] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      Alert.alert("خطا", "لطفاً نام دانش‌آموز را وارد کنید");
      return;
    }

    setSearching(true);
    try {
      const response = await (financeApi as any).searchStudents(searchQuery);
      if (response.success) {
        setSearchResults(response.data);
        if (response.data.length === 0) {
          Alert.alert("اطلاع", "دانش‌آموزی یافت نشد");
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("خطا", "مشکلی در جستجو پیش آمد");
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setLoading(true);
    try {
      // financeApi does not have getStudentPendingFees; use getStudentsWithPendingFees
      const response = await (financeApi as any).getStudentsWithPendingFees(student.id);
      if (response.success) {
        setPendingFees(response.data);
        if (response.data.length === 0) {
          Alert.alert("اطلاع", "این دانش‌آموز هزینه معوقه‌ای ندارد");
          setStep("search");
        } else if (response.data.length === 1) {
          setSelectedFee(response.data[0]);
          setAmount(response.data[0].remainingAmount.toString());
          setStep("payment");
        } else {
          setStep("student");
        }
      }
    } catch (error) {
      console.error("Error loading fees:", error);
      Alert.alert("خطا", "خطا در بارگذاری هزینه‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFee = (fee: PendingFee) => {
    setSelectedFee(fee);
    setAmount(fee.remainingAmount.toString());
    setFeeModalVisible(false);
    setStep("payment");
  };

  const handleSubmitPayment = async () => {
    if (!selectedStudent || !selectedFee) {
      Alert.alert("خطا", "اطلاعات کامل نیست");
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      Alert.alert("خطا", "لطفاً مبلغ معتبر وارد کنید");
      return;
    }

    if (paymentAmount > selectedFee.remainingAmount) {
      Alert.alert("خطا", `مبلغ وارد شده بیشتر از مانده بدهی (${formatCurrency(selectedFee.remainingAmount)}) است`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await financeApi.recordPayment({
        studentId: selectedStudent.id,
        studentFeeId: selectedFee.id,
        amount: paymentAmount,
        paymentMethod,
        referenceNo: referenceNo || undefined,
        notes: notes || undefined,
      });

      if (response.success) {
        setLastPayment({
          studentName: selectedStudent.name,
          amount: paymentAmount,
          paymentMethod,
          receiptNo: `RCP-${Date.now()}`,
          date: new Date().toLocaleDateString("fa-IR"),
          remainingAmount: selectedFee.remainingAmount - paymentAmount,
        });
        setReceiptModal(true);
      } else {
        Alert.alert("خطا", (response as any).message || "ثبت پرداخت ناموفق بود");
      }
    } catch (error: any) {
      Alert.alert("خطا", error?.message || "ثبت پرداخت ناموفق بود");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    setReceiptModal(false);
    Alert.alert("موفق", "پرداخت با موفقیت ثبت شد", [
      {
        text: "پرداخت جدید",
        onPress: () => {
          resetForm();
          setStep("search");
        },
      },
      { text: "بازگشت به داشبورد", onPress: () => router.back() },
    ]);
  };

  const resetForm = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedStudent(null);
    setPendingFees([]);
    setSelectedFee(null);
    setAmount("");
    setPaymentMethod("CASH");
    setReferenceNo("");
    setNotes("");
  };

  // Render Search Step
  const renderSearchStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIcon}>
          <Ionicons name="search" size={32} color={Colors.primary} />
        </View>
        <Text style={styles.stepTitle}>جستجوی دانش‌آموز</Text>
        <Text style={styles.stepDesc}>نام دانش‌آموز را برای ثبت پرداخت جستجو کنید</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="نام دانش‌آموز..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            textAlign="right"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchBtn} activeOpacity={0.7}>
            {searching ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="search" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {searchResults.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>نتایج جستجو ({searchResults.length})</Text>
          {searchResults.map((student) => (
            <TouchableOpacity
              key={student.id}
              style={styles.studentCard}
              onPress={() => handleSelectStudent(student)}
              activeOpacity={0.7}
            >
              <View style={styles.studentAvatar}>
                <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentClass}>{student.className}</Text>
                <Text style={styles.studentRoll}>شماره: {student.rollNumber}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  // Render Student Step (Multiple Fees)
  const renderStudentStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity onPress={() => setStep("search")} style={styles.backButton}>
        <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
        <Text style={styles.backButtonText}>بازگشت به جستجو</Text>
      </TouchableOpacity>

      <View style={styles.studentHeader}>
        <View style={styles.studentHeaderAvatar}>
          <Text style={styles.studentHeaderAvatarText}>{selectedStudent?.name.charAt(0)}</Text>
        </View>
        <View style={styles.studentHeaderInfo}>
          <Text style={styles.studentHeaderName}>{selectedStudent?.name}</Text>
          <Text style={styles.studentHeaderClass}>{selectedStudent?.className}</Text>
          <Text style={styles.studentHeaderRoll}>شماره: {selectedStudent?.rollNumber}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>هزینه‌های معوقه</Text>
      <Text style={styles.sectionDesc}>لطفاً هزینه مورد نظر برای پرداخت را انتخاب کنید</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        pendingFees.map((fee) => (
          <TouchableOpacity
            key={fee.id}
            style={styles.feeCard}
            onPress={() => handleSelectFee(fee)}
            activeOpacity={0.7}
          >
            <View style={styles.feeHeader}>
              <Text style={styles.feeTitle}>{fee.title}</Text>
              <View style={styles.feeAmount}>
                <Text style={styles.feeAmountLabel}>بدهی:</Text>
                <Text style={styles.feeAmountValue}>{formatCurrency(fee.remainingAmount)}</Text>
              </View>
            </View>
            <View style={styles.feeDetails}>
              <View style={styles.feeDetail}>
                <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.feeDetailText}>سررسید: {fee.dueDate}</Text>
              </View>
              <View style={styles.feeDetail}>
                <Ionicons name="cash-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.feeDetailText}>کل: {formatCurrency(fee.amount)}</Text>
              </View>
            </View>
            <View style={styles.selectBadge}>
              <Ionicons name="arrow-back" size={16} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  // Render Payment Step
  const renderPaymentStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity onPress={() => setStep("student")} style={styles.backButton}>
        <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
        <Text style={styles.backButtonText}>بازگشت به انتخاب هزینه</Text>
      </TouchableOpacity>

      {/* Student & Fee Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>دانش‌آموز:</Text>
          <Text style={styles.summaryValue}>{selectedStudent?.name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>صنف:</Text>
          <Text style={styles.summaryValue}>{selectedStudent?.className}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>نوع هزینه:</Text>
          <Text style={styles.summaryValue}>{selectedFee?.title}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>کل بدهی:</Text>
          <Text style={styles.summaryValue}>{formatCurrency(selectedFee?.amount || 0)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>مانده:</Text>
          <Text style={[styles.summaryValue, { color: Colors.danger }]}>
            {formatCurrency(selectedFee?.remainingAmount || 0)}
          </Text>
        </View>
      </View>

      {/* Amount Input */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>مبلغ پرداختی <Text style={styles.required}>*</Text></Text>
        <View style={styles.amountContainer}>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            placeholder="مبلغ را وارد کنید"
            placeholderTextColor={Colors.textSecondary}
            textAlign="center"
          />
          <Text style={styles.currencyUnit}>AFN</Text>
        </View>
        {selectedFee && parseFloat(amount) > selectedFee.remainingAmount && (
          <Text style={styles.errorHint}>مبلغ بیشتر از مانده بدهی است</Text>
        )}
      </View>

      {/* Quick Amounts */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>مبالغ پیشنهادی</Text>
        <View style={styles.quickAmounts}>
          {[500, 1000, 2000, 5000].map((amt) => (
            <TouchableOpacity
              key={amt}
              style={[styles.quickAmountBtn, amount === amt.toString() && styles.quickAmountBtnActive]}
              onPress={() => setAmount(amt.toString())}
              activeOpacity={0.7}
            >
              <Text style={[styles.quickAmountText, amount === amt.toString() && styles.quickAmountTextActive]}>
                {formatCurrency(amt)}
              </Text>
            </TouchableOpacity>
          ))}
          {selectedFee && (
            <TouchableOpacity
              style={[styles.quickAmountBtn, amount === selectedFee.remainingAmount.toString() && styles.quickAmountBtnActive]}
              onPress={() => setAmount(selectedFee.remainingAmount.toString())}
              activeOpacity={0.7}
            >
              <Text style={[styles.quickAmountText, amount === selectedFee.remainingAmount.toString() && styles.quickAmountTextActive]}>
                تمام مبلغ
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>روش پرداخت</Text>
        <View style={styles.methodsRow}>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.value}
              style={[
                styles.methodCard,
                paymentMethod === method.value && { borderColor: method.color, backgroundColor: `${method.color}10` },
              ]}
              onPress={() => setPaymentMethod(method.value)}
              activeOpacity={0.7}
            >
              <Ionicons name={method.icon as any} size={24} color={paymentMethod === method.value ? method.color : Colors.textSecondary} />
              <Text style={[styles.methodLabel, paymentMethod === method.value && { color: method.color, fontWeight: "500" }]}>
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
          value={referenceNo}
          onChangeText={setReferenceNo}
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
          value={notes}
          onChangeText={setNotes}
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
        style={[styles.submitButton, (submitting || !amount || parseFloat(amount) <= 0) && styles.submitButtonDisabled]}
        onPress={handleSubmitPayment}
        disabled={submitting || !amount || parseFloat(amount) <= 0}
        activeOpacity={0.8}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={22} color="white" />
            <Text style={styles.submitButtonText}>ثبت پرداخت</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  // Receipt Modal
  const renderReceiptModal = () => (
    <Modal visible={receiptModal} animationType="slide" transparent={true} onRequestClose={() => setReceiptModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.receiptContent}>
          <View style={styles.receiptHeader}>
            <View style={styles.receiptIcon}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
            </View>
            <Text style={styles.receiptTitle}>پرداخت با موفقیت ثبت شد</Text>
          </View>

          <View style={styles.receiptBody}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>شماره رسید:</Text>
              <Text style={styles.receiptValue}>{lastPayment?.receiptNo}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>دانش‌آموز:</Text>
              <Text style={styles.receiptValue}>{lastPayment?.studentName}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>مبلغ:</Text>
              <Text style={[styles.receiptValue, { color: Colors.success, fontWeight: "bold" }]}>
                {formatCurrency(lastPayment?.amount)}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>روش پرداخت:</Text>
              <Text style={styles.receiptValue}>
                {PAYMENT_METHODS.find(m => m.value === lastPayment?.paymentMethod)?.label}
              </Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>تاریخ:</Text>
              <Text style={styles.receiptValue}>{lastPayment?.date}</Text>
            </View>
            {lastPayment?.remainingAmount > 0 && (
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>مانده بدهی:</Text>
                <Text style={[styles.receiptValue, { color: Colors.warning }]}>
                  {formatCurrency(lastPayment?.remainingAmount)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.receiptFooter}>
            <TouchableOpacity style={styles.printButton} onPress={handlePrintReceipt} activeOpacity={0.7}>
              <Ionicons name="print-outline" size={20} color="white" />
              <Text style={styles.printButtonText}>تایید و ادامه</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={handlePrintReceipt} activeOpacity={0.7}>
              <Ionicons name="share-outline" size={20} color={Colors.primary} />
              <Text style={styles.shareButtonText}>اشتراک‌گذاری</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="ثبت پرداخت شهریه" showBack />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {step === "search" && renderSearchStep()}
          {step === "student" && renderStudentStep()}
          {step === "payment" && renderPaymentStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      {renderReceiptModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  keyboardAvoid: { flex: 1 },
  content: { flex: 1, padding: 16 },
  
  stepContainer: { flex: 1 },
  stepHeader: { alignItems: "center", marginBottom: 24 },
  stepIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: `${Colors.primary}15`, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  stepTitle: { fontSize: 22, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 6 },
  stepDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center" },
  
  searchContainer: { marginBottom: 20 },
  searchBox: { flexDirection: "row", gap: 8 },
  searchInput: { flex: 1, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: 15, color: Colors.text, textAlign: "right", fontFamily: "Vazirmatn" },
  searchBtn: { width: 52, height: 52, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" },
  
  resultsContainer: { marginTop: 8 },
  resultsTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 12, textAlign: "right" },
  studentCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, padding: 14, borderRadius: 12, marginBottom: 10, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  studentAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: `${Colors.primary}15`, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 18, fontWeight: "bold", color: Colors.primary, fontFamily: "Vazirmatn" },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  studentClass: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  studentRoll: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginTop: 2 },
  
  backButton: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16, alignSelf: "flex-start" },
  backButtonText: { fontSize: 14, color: Colors.primary, fontFamily: "Vazirmatn" },
  
  studentHeader: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, padding: 16, borderRadius: 14, marginBottom: 20, gap: 14 },
  studentHeaderAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" },
  studentHeaderAvatarText: { fontSize: 24, fontWeight: "bold", color: "white", fontFamily: "Vazirmatn" },
  studentHeaderInfo: { flex: 1 },
  studentHeaderName: { fontSize: 16, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  studentHeaderClass: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  studentHeaderRoll: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginTop: 2 },
  
  sectionTitle: { fontSize: 17, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 4, textAlign: "right" },
  sectionDesc: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 16, textAlign: "right" },
  
  feeCard: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  feeHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  feeTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn" },
  feeAmount: { flexDirection: "row", alignItems: "center", gap: 4 },
  feeAmountLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  feeAmountValue: { fontSize: 14, fontWeight: "bold", color: Colors.danger, fontFamily: "Vazirmatn" },
  feeDetails: { flexDirection: "row", gap: 12 },
  feeDetail: { flexDirection: "row", alignItems: "center", gap: 4 },
  feeDetailText: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  selectBadge: { position: "absolute", right: 14, top: "50%", marginTop: -12 },
  
  summaryCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, marginBottom: 20 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  summaryValue: { fontSize: 13, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 8, textAlign: "right" },
  required: { color: Colors.danger },
  
  amountContainer: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, overflow: "hidden" },
  amountInput: { flex: 1, padding: 14, fontSize: 20, fontWeight: "bold", color: Colors.text, textAlign: "center", fontFamily: "Vazirmatn" },
  currencyUnit: { paddingHorizontal: 12, fontSize: 14, color: Colors.textSecondary, backgroundColor: Colors.background, textAlignVertical: "center", paddingVertical: 14 },
  errorHint: { fontSize: 12, color: Colors.danger, marginTop: 6, textAlign: "right" },
  
  quickAmounts: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickAmountBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  quickAmountBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  quickAmountText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  quickAmountTextActive: { color: "white" },
  
  methodsRow: { flexDirection: "row", gap: 12 },
  methodCard: { flex: 1, alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.card, gap: 6 },
  methodLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  input: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12, fontSize: 14, color: Colors.text, fontFamily: "Vazirmatn" },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  
  submitButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.success, borderRadius: 12, paddingVertical: 16, gap: 8, marginTop: 10, marginBottom: 30 },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: "white", fontSize: 16, fontWeight: "bold", fontFamily: "Vazirmatn" },
  
  loadingContainer: { paddingVertical: 40, alignItems: "center" },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  receiptContent: { backgroundColor: "white", borderRadius: 20, width: "90%", maxHeight: "80%" },
  receiptHeader: { alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
  receiptIcon: { marginBottom: 12 },
  receiptTitle: { fontSize: 18, fontWeight: "bold", color: Colors.success, fontFamily: "Vazirmatn" },
  receiptBody: { padding: 20 },
  receiptRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  receiptLabel: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  receiptValue: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },
  receiptFooter: { flexDirection: "row", padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, gap: 12 },
  printButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 10, gap: 8 },
  printButtonText: { color: "white", fontSize: 14, fontWeight: "500", fontFamily: "Vazirmatn" },
  shareButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: `${Colors.primary}15`, paddingVertical: 12, borderRadius: 10, gap: 8 },
  shareButtonText: { color: Colors.primary, fontSize: 14, fontWeight: "500", fontFamily: "Vazirmatn" },
});