import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ClassItem {
  id: number;
  name: string;
  section: string;
}

interface BulkStudent {
  id: number;
  name: string;
  rollNumber: string;
  amount: string;
  selected: boolean;
  feeId?: number;
  defaultAmount?: number;
}

const PAYMENT_METHODS = [
  { value: "CASH", label: "نقدی", icon: "cash", color: Colors.success },
  { value: "BANK_TRANSFER", label: "انتقال بانکی", icon: "card", color: Colors.primary },
];

export default function BulkFeeCollection() {
  const router = useRouter();
  const [step, setStep] = useState<"class" | "collection">("class");
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<BulkStudent[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [bulkAmount, setBulkAmount] = useState("");
  const [applyBulkAmount, setApplyBulkAmount] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loadClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);
      const response = await financeApi.getClassesList();
      if (response.success) {
        setClasses(response.data || []);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری صنوف پیش آمد");
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const loadStudentsForClass = async (classId: number) => {
    setLoading(true);
    try {
      const response = await financeApi.getStudentsForBulkCollection(classId);
      if (response.success) {
        const studentData = (response.data || []).map((s: any) => ({
          ...s,
          selected: false,
          amount: s.amount ? s.amount.toString() : "",
          defaultAmount: s.amount || undefined,
        }));
        setStudents(studentData);
        setSelectAll(false);
        setBulkAmount("");
        setApplyBulkAmount(false);
      }
    } catch (error) {
      console.error("Error loading students:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری دانش‌آموزان پیش آمد");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleSelectClass = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    loadStudentsForClass(classItem.id);
    setStep("collection");
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        selected: newSelectAll,
        amount: newSelectAll && applyBulkAmount && bulkAmount ? bulkAmount : s.amount,
      }))
    );
  };

  const toggleStudent = (index: number) => {
    setStudents((prev) => {
      const updated = [...prev];
      updated[index].selected = !updated[index].selected;
      if (updated[index].selected && applyBulkAmount && bulkAmount) {
        updated[index].amount = bulkAmount;
      }
      return updated;
    });

    // Update selectAll state
    setStudents((prev) => {
      const allSelected = prev.every((s) => s.selected);
      setSelectAll(allSelected);
      return prev;
    });
  };

  const updateAmount = (index: number, amount: string) => {
    const cleaned = amount.replace(/[^0-9.]/g, "");
    setStudents((prev) => {
      const updated = [...prev];
      updated[index].amount = cleaned;
      return updated;
    });
  };

  const handleApplyBulkAmount = () => {
    if (!bulkAmount || isNaN(parseFloat(bulkAmount)) || parseFloat(bulkAmount) <= 0) {
      Alert.alert("خطا", "لطفاً مبلغ معتبر وارد کنید");
      return;
    }
    setApplyBulkAmount(true);
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        amount: s.selected ? bulkAmount : s.amount,
      }))
    );
  };

  const handleResetBulkAmount = () => {
    setBulkAmount("");
    setApplyBulkAmount(false);
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        amount: s.defaultAmount ? s.defaultAmount.toString() : "",
      }))
    );
  };

  const handleSubmitAll = () => {
    const selectedStudents = students.filter(
      (s) => s.selected && s.amount && parseFloat(s.amount) > 0
    );

    if (selectedStudents.length === 0) {
      Alert.alert("خطا", "لطفاً حداقل یک دانش‌آموز را انتخاب کنید و مبلغ را وارد کنید");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    const selectedStudents = students.filter(
      (s) => s.selected && s.amount && parseFloat(s.amount) > 0
    );

    setShowConfirmModal(false);
    setSubmitting(true);
    try {
      const payments = selectedStudents.map((s) => ({
        studentId: s.id,
        amount: parseFloat(s.amount),
        paymentMethod,
        studentFeeId: s.feeId,
      }));

      const response = await financeApi.recordBulkPayments({
        classId: selectedClass!.id,
        payments,
      });

      if (response.success) {
        Alert.alert(
          "موفق",
          `${response.data.count} پرداخت با موفقیت ثبت شد`,
          [
            {
              text: "بازگشت به لیست صنوف",
              onPress: () => {
                setSelectedClass(null);
                setStep("class");
              },
            },
            {
              text: "ثبت دوباره",
              onPress: () => {
                setStudents((prev) => prev.map((s) => ({ ...s, selected: false })));
                setSelectAll(false);
                setBulkAmount("");
                setApplyBulkAmount(false);
              },
            },
          ]
        );
      } else {
        Alert.alert("خطا", (response as any).message || "مشکلی در ثبت پرداخت‌ها پیش آمد");
      }
    } catch (error: any) {
      Alert.alert("خطا", error?.message || "مشکلی در ثبت پرداخت‌ها پیش آمد");
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedCount = () => students.filter((s) => s.selected).length;
  const getTotalAmount = () => {
    return students
      .filter((s) => s.selected && s.amount)
      .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
  };

  // Render Class Selection
  const renderClassSelection = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIcon}>
          <Ionicons name="school" size={32} color={Colors.primary} />
        </View>
        <Text style={styles.stepTitle}>انتخاب صنف</Text>
        <Text style={styles.stepDesc}>صنف مورد نظر را برای ثبت گروهی پرداخت انتخاب کنید</Text>
      </View>

      {loadingClasses ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : classes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="school-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>صنفی یافت نشد</Text>
        </View>
      ) : (
        classes.map((cls) => (
          <TouchableOpacity
            key={cls.id}
            style={styles.classCard}
            onPress={() => handleSelectClass(cls)}
            activeOpacity={0.7}
          >
            <View style={styles.classIcon}>
              <Ionicons name="school" size={24} color={Colors.primary} />
            </View>
            <View style={styles.classInfo}>
              <Text style={styles.className}>{cls.name}</Text>
              {cls.section && <Text style={styles.classSection}>بخش {cls.section}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  // Render Bulk Collection Form
  const renderCollectionForm = () => (
    <View style={styles.stepContainer}>
      {/* Back Button */}
      <TouchableOpacity onPress={() => setStep("class")} style={styles.backLink}>
        <Ionicons name="arrow-back" size={16} color={Colors.primary} />
        <Text style={styles.backLinkText}>تغییر صنف</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.bulkHeader}>
        <View style={styles.bulkHeaderInfo}>
          <Ionicons name="school" size={20} color={Colors.primary} />
          <Text style={styles.bulkHeaderText}>
            {selectedClass?.name} {selectedClass?.section ? `- ${selectedClass.section}` : ""}
          </Text>
        </View>
        <View style={styles.bulkHeaderBadge}>
          <Ionicons name="people" size={14} color={Colors.primary} />
          <Text style={styles.bulkHeaderBadgeText}>{students.length} دانش‌آموز</Text>
        </View>
      </View>

      {/* Bulk Amount Setter */}
      <View style={styles.bulkAmountCard}>
        <Text style={styles.bulkAmountTitle}>تعیین مبلغ گروهی</Text>
        <Text style={styles.bulkAmountDesc}>مبلغ یکسان برای همه دانش‌آموزان انتخاب شده</Text>
        <View style={styles.bulkAmountRow}>
          <TextInput
            style={styles.bulkAmountInput}
            value={bulkAmount}
            onChangeText={setBulkAmount}
            keyboardType="decimal-pad"
            placeholder="مبلغ (افغانی)"
            placeholderTextColor={Colors.textSecondary}
            textAlign="center"
          />
          <TouchableOpacity
            style={[styles.bulkAmountApplyBtn, !bulkAmount && styles.btnDisabled]}
            onPress={handleApplyBulkAmount}
            disabled={!bulkAmount}
            activeOpacity={0.7}
          >
            <Text style={styles.bulkAmountApplyText}>اعمال</Text>
          </TouchableOpacity>
        </View>
        {applyBulkAmount && (
          <TouchableOpacity onPress={handleResetBulkAmount} style={styles.resetBulkLink}>
            <Text style={styles.resetBulkText}>بازنشانی به مقادیر پیش‌فرض</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Select All & Payment Method */}
      <View style={styles.controlRow}>
        <TouchableOpacity style={styles.selectAllRow} onPress={toggleSelectAll} activeOpacity={0.7}>
          <View style={[styles.checkbox, selectAll && styles.checkboxChecked]}>
            {selectAll && <Ionicons name="checkmark" size={14} color="white" />}
          </View>
          <Text style={styles.selectAllText}>{selectAll ? "عدم انتخاب همه" : "انتخاب همه"}</Text>
        </TouchableOpacity>

        <View style={styles.paymentMethodRow}>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.value}
              style={[
                styles.paymentMethodChip,
                paymentMethod === method.value && { backgroundColor: method.color, borderColor: method.color },
              ]}
              onPress={() => setPaymentMethod(method.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.paymentMethodChipText, paymentMethod === method.value && { color: "white" }]}>
                {method.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Students List */}
      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      ) : students.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={48} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>دانش‌آموزی یافت نشد</Text>
        </View>
      ) : (
        students.map((student, index) => (
          <View
            key={student.id}
            style={[styles.studentRow, student.selected && styles.studentRowSelected]}
          >
            <TouchableOpacity onPress={() => toggleStudent(index)} style={styles.studentCheckArea} activeOpacity={0.7}>
              <View style={[styles.checkbox, student.selected && styles.checkboxChecked]}>
                {student.selected && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
            </TouchableOpacity>

            <View style={styles.studentInfo}>
              <Text style={styles.studentName} numberOfLines={1}>{student.name}</Text>
              <Text style={styles.studentRoll}>{student.rollNumber}</Text>
            </View>

            <TextInput
              style={[styles.amountInput, !student.selected && styles.amountInputDisabled]}
              value={student.amount}
              onChangeText={(value) => updateAmount(index, value)}
              keyboardType="decimal-pad"
              placeholder="مبلغ"
              placeholderTextColor={Colors.textSecondary}
              editable={student.selected}
              textAlign="center"
            />
          </View>
        ))
      )}

      {/* Summary */}
      {getSelectedCount() > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="people" size={16} color={Colors.primary} />
              <Text style={styles.summaryLabel}>انتخاب شده:</Text>
            </View>
            <Text style={styles.summaryValue}>{getSelectedCount()} دانش‌آموز</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="cash" size={16} color={Colors.success} />
              <Text style={styles.summaryLabel}>مجموع:</Text>
            </View>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              {formatCurrency(getTotalAmount())}
            </Text>
          </View>
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, (submitting || getSelectedCount() === 0) && styles.submitButtonDisabled]}
        onPress={handleSubmitAll}
        disabled={submitting || getSelectedCount() === 0}
        activeOpacity={0.8}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={22} color="white" />
            <Text style={styles.submitButtonText}>ثبت {getSelectedCount()} پرداخت</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </View>
  );

  // Confirm Modal
  const renderConfirmModal = () => (
    <Modal visible={showConfirmModal} animationType="fade" transparent={true} onRequestClose={() => setShowConfirmModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.confirmModal}>
          <View style={styles.confirmIcon}>
            <Ionicons name="alert-circle" size={48} color={Colors.warning} />
          </View>
          <Text style={styles.confirmTitle}>تایید پرداخت گروهی</Text>
          <Text style={styles.confirmDesc}>
            آیا از ثبت {getSelectedCount()} پرداخت به مبلغ {formatCurrency(getTotalAmount())} اطمینان دارید؟
          </Text>
          <View style={styles.confirmButtons}>
            <TouchableOpacity style={styles.confirmCancel} onPress={() => setShowConfirmModal(false)} activeOpacity={0.7}>
              <Text style={styles.confirmCancelText}>انصراف</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmOk} onPress={confirmSubmit} activeOpacity={0.7}>
              <Text style={styles.confirmOkText}>تایید پرداخت</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="ثبت گروهی پرداخت" showBack />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {step === "class" ? renderClassSelection() : renderCollectionForm()}
      </ScrollView>
      {renderConfirmModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  
  stepContainer: { flex: 1 },
  stepHeader: { alignItems: "center", marginBottom: 20 },
  stepIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: `${Colors.primary}15`, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  stepTitle: { fontSize: 22, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 6 },
  stepDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center" },
  
  classCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, padding: 16, borderRadius: 14, marginBottom: 10, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  classIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: `${Colors.primary}15`, justifyContent: "center", alignItems: "center" },
  classInfo: { flex: 1 },
  className: { fontSize: 16, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", textAlign: "right" },
  classSection: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginTop: 2, textAlign: "right" },
  
  backLink: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16, alignSelf: "flex-start" },
  backLinkText: { fontSize: 13, color: Colors.primary, fontFamily: "Vazirmatn" },
  
  bulkHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: Colors.card, borderRadius: 12, padding: 14, marginBottom: 16 },
  bulkHeaderInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  bulkHeaderText: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn" },
  bulkHeaderBadge: { flexDirection: "row", alignItems: "center", backgroundColor: `${Colors.primary}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  bulkHeaderBadgeText: { fontSize: 11, color: Colors.primary, fontFamily: "Vazirmatn" },
  
  bulkAmountCard: { backgroundColor: `${Colors.warning}10`, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: `${Colors.warning}30` },
  bulkAmountTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 4, textAlign: "right" },
  bulkAmountDesc: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 10, textAlign: "right" },
  bulkAmountRow: { flexDirection: "row", gap: 8 },
  bulkAmountInput: { flex: 1, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn" },
  bulkAmountApplyBtn: { backgroundColor: Colors.warning, paddingHorizontal: 20, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  bulkAmountApplyText: { color: "white", fontSize: 14, fontWeight: "600", fontFamily: "Vazirmatn" },
  btnDisabled: { opacity: 0.5 },
  resetBulkLink: { alignItems: "flex-end", marginTop: 8 },
  resetBulkText: { fontSize: 11, color: Colors.danger, fontFamily: "Vazirmatn" },
  
  controlRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  selectAllRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.primary, justifyContent: "center", alignItems: "center" },
  checkboxChecked: { backgroundColor: Colors.primary },
  selectAllText: { fontSize: 13, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },
  paymentMethodRow: { flexDirection: "row", gap: 6 },
  paymentMethodChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  paymentMethodChipText: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  studentRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  studentRowSelected: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}05` },
  studentCheckArea: { padding: 2 },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", textAlign: "right" },
  studentRoll: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginTop: 2, textAlign: "right" },
  amountInput: { width: 100, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", textAlign: "center" },
  amountInputDisabled: { backgroundColor: Colors.background, color: Colors.textSecondary, opacity: 0.5 },
  
  summaryCard: { backgroundColor: Colors.card, borderRadius: 12, padding: 16, marginTop: 20, marginBottom: 20 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  summaryDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  summaryLabel: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  summaryValue: { fontSize: 15, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn" },
  
  submitButton: { flexDirection: "row", backgroundColor: Colors.success, borderRadius: 12, paddingVertical: 16, alignItems: "center", justifyContent: "center", gap: 8, shadowColor: Colors.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  submitButtonDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
  submitButtonText: { color: "white", fontSize: 16, fontWeight: "bold", fontFamily: "Vazirmatn" },
  
  centerState: { alignItems: "center", paddingVertical: 40 },
  loadingText: { marginTop: 10, fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 15, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginTop: 12 },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  confirmModal: { backgroundColor: "white", borderRadius: 20, width: "85%", padding: 20, alignItems: "center" },
  confirmIcon: { marginBottom: 16 },
  confirmTitle: { fontSize: 18, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 8 },
  confirmDesc: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center", marginBottom: 20 },
  confirmButtons: { flexDirection: "row", gap: 12, width: "100%" },
  confirmCancel: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, alignItems: "center" },
  confirmCancelText: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  confirmOk: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.success, alignItems: "center" },
  confirmOkText: { fontSize: 14, fontWeight: "500", color: "white", fontFamily: "Vazirmatn" },
});