import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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
  pendingAmount: number;
  hasPendingFee: boolean;
}

export default function QuickFeeCollection() {
  const router = useRouter();
  const [searchType, setSearchType] = useState<"name" | "rfid" | "roll">("name");
  const [searchValue, setSearchValue] = useState("");
  const [searching, setSearching] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [pendingFees, setPendingFees] = useState<any[]>([]);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      Alert.alert("خطا", "لطفاً مقدار جستجو را وارد کنید");
      return;
    }

    setSearching(true);
    try {
      let response;
      if (searchType === "name") {
        // Use searchStudents from financeApi
        response = await financeApi.searchStudents(searchValue);
      } else if (searchType === "rfid") {
        // Use searchStudents with RFID (using the same endpoint with different param)
        response = await financeApi.searchStudents(searchValue);
      } else {
        // Use searchStudents with roll number
        response = await financeApi.searchStudents(searchValue);
      }

      if (response.success && response.data) {
        const studentData = response.data;
        setStudent(studentData);
        
        // Use getStudentsWithPendingFees to get pending fees for the student
        // Note: This expects a classId, so we need to adapt. For now, use a workaround.
        // Since the API doesn't have a direct getStudentPendingFees, we'll use getStudentFeeDetails
        const feesResponse = await financeApi.getStudentFeeDetails(studentData.id);
        if (feesResponse.success && feesResponse.data) {
          const pendingFeesData = feesResponse.data.fees.filter((fee: any) => 
            fee.status !== "PAID" && fee.remainingAmount > 0
          );
          setPendingFees(pendingFeesData);
          if (pendingFeesData.length === 0) {
            Alert.alert("اطلاع", "این دانش‌آموز هزینه معوقه‌ای ندارد");
          } else if (pendingFeesData.length === 1) {
            setSelectedFee(pendingFeesData[0]);
            setAmount(pendingFeesData[0].remainingAmount.toString());
          }
        }
      } else {
        Alert.alert("خطا", "دانش‌آموز یافت نشد");
        setStudent(null);
      }
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("خطا", "مشکلی در جستجو پیش آمد");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectFee = (fee: any) => {
    setSelectedFee(fee);
    setAmount(fee.remainingAmount.toString());
  };

  const handleSubmitPayment = async () => {
    if (!student || !selectedFee) {
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
        studentId: student.id,
        studentFeeId: selectedFee.id,
        amount: paymentAmount,
        paymentMethod,
      });

      if (response.success) {
        Alert.alert(
          "موفق",
          "پرداخت با موفقیت ثبت شد",
          [
            {
              text: "پرداخت جدید",
              onPress: () => {
                setStudent(null);
                setSearchValue("");
                setSelectedFee(null);
                setAmount("");
                setPendingFees([]);
              },
            },
            {
              text: "مشاهده رسید",
              onPress: () => router.push(`/(admin)/financial/fees/receipt/${response.data.paymentId}` as any),
            },
          ]
        );
      } else {
        Alert.alert("خطا", (response as any).message || "ثبت پرداخت ناموفق بود");
      }
    } catch (error: any) {
      Alert.alert("خطا", error?.message || "ثبت پرداخت ناموفق بود");
    } finally {
      setSubmitting(false);
    }
  };

  const resetSearch = () => {
    setStudent(null);
    setSearchValue("");
    setSelectedFee(null);
    setAmount("");
    setPendingFees([]);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="پرداخت سریع" showBack />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!student ? (
            // Search Section
            <View>
              <View style={styles.stepHeader}>
                <View style={styles.stepIcon}>
                  <Ionicons name="scan-outline" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.stepTitle}>پرداخت سریع</Text>
                <Text style={styles.stepDesc}>
                  جستجو با نام، شماره دانش‌آموزی یا RFID
                </Text>
              </View>

              {/* Search Type Tabs */}
              <View style={styles.tabsContainer}>
                <TouchableOpacity
                  style={[styles.tab, searchType === "name" && styles.tabActive]}
                  onPress={() => setSearchType("name")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person" size={18} color={searchType === "name" ? "white" : Colors.textSecondary} />
                  <Text style={[styles.tabText, searchType === "name" && styles.tabTextActive]}>نام</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, searchType === "roll" && styles.tabActive]}
                  onPress={() => setSearchType("roll")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person" size={18} color={searchType === "roll" ? "white" : Colors.textSecondary} />
                  <Text style={[styles.tabText, searchType === "roll" && styles.tabTextActive]}>شماره دانش‌آموزی</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, searchType === "rfid" && styles.tabActive]}
                  onPress={() => setSearchType("rfid")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="radio-outline" size={18} color={searchType === "rfid" ? "white" : Colors.textSecondary} />
                  <Text style={[styles.tabText, searchType === "rfid" && styles.tabTextActive]}>RFID</Text>
                </TouchableOpacity>
              </View>

              {/* Search Input */}
              <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder={
                      searchType === "name" ? "نام دانش‌آموز..." :
                      searchType === "roll" ? "شماره دانش‌آموزی..." :
                      "کد RFID را اسکن کنید..."
                    }
                    placeholderTextColor={Colors.textSecondary}
                    value={searchValue}
                    onChangeText={setSearchValue}
                    onSubmitEditing={handleSearch}
                    returnKeyType="search"
                    textAlign="right"
                    autoCapitalize="none"
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

              {/* Scan Button for RFID */}
              {searchType === "rfid" && (
                <TouchableOpacity style={styles.scanButton} onPress={() => {}} activeOpacity={0.7}>
                  <Ionicons name="camera" size={24} color={Colors.primary} />
                  <Text style={styles.scanButtonText}>اسکن RFID</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            // Payment Section
            <View>
              {/* Student Info */}
              <View style={styles.studentCard}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentClass}>{student.className}</Text>
                  <Text style={styles.studentRoll}>شماره: {student.rollNumber}</Text>
                </View>
                <TouchableOpacity onPress={resetSearch} style={styles.changeBtn}>
                  <Ionicons name="refresh" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Pending Amount Summary */}
              <View style={styles.pendingCard}>
                <Text style={styles.pendingLabel}>مجموع معوقه</Text>
                <Text style={[styles.pendingValue, { color: Colors.danger }]}>
                  {formatCurrency(student.pendingAmount)}
                </Text>
              </View>

              {/* Fee Selection */}
              {pendingFees.length > 1 && (
                <View style={styles.feeSelection}>
                  <Text style={styles.feeSelectionTitle}>انتخاب هزینه</Text>
                  {pendingFees.map((fee) => (
                    <TouchableOpacity
                      key={fee.id}
                      style={[styles.feeOption, selectedFee?.id === fee.id && styles.feeOptionActive]}
                      onPress={() => handleSelectFee(fee)}
                      activeOpacity={0.7}
                    >
                      <View>
                        <Text style={styles.feeOptionTitle}>{fee.title}</Text>
                        <Text style={styles.feeOptionDue}>سررسید: {fee.dueDate}</Text>
                      </View>
                      <Text style={[styles.feeOptionAmount, { color: Colors.danger }]}>
                        {formatCurrency(fee.remainingAmount)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {selectedFee && (
                <>
                  {/* Amount Input */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>مبلغ پرداختی</Text>
                    <View style={styles.amountContainer}>
                      <TextInput
                        style={styles.amountInput}
                        value={amount}
                        onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ''))}
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
                    <TouchableOpacity
                      style={[styles.quickAmountBtn, amount === selectedFee.remainingAmount.toString() && styles.quickAmountBtnActive]}
                      onPress={() => setAmount(selectedFee.remainingAmount.toString())}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.quickAmountText, amount === selectedFee.remainingAmount.toString() && styles.quickAmountTextActive]}>
                        تمام مبلغ
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Payment Method */}
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>روش پرداخت</Text>
                    <View style={styles.methodsRow}>
                      <TouchableOpacity
                        style={[styles.methodCard, paymentMethod === "CASH" && styles.methodCardActive]}
                        onPress={() => setPaymentMethod("CASH")}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="cash" size={24} color={paymentMethod === "CASH" ? "white" : Colors.success} />
                        <Text style={[styles.methodLabel, paymentMethod === "CASH" && styles.methodLabelActive]}>نقدی</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.methodCard, paymentMethod === "BANK_TRANSFER" && styles.methodCardActive]}
                        onPress={() => setPaymentMethod("BANK_TRANSFER")}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="card" size={24} color={paymentMethod === "BANK_TRANSFER" ? "white" : Colors.primary} />
                        <Text style={[styles.methodLabel, paymentMethod === "BANK_TRANSFER" && styles.methodLabelActive]}>بانکی</Text>
                      </TouchableOpacity>
                    </View>
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
                        <Text style={styles.submitButtonText}>تایید و ثبت پرداخت</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  keyboardAvoid: { flex: 1 },
  content: { flex: 1, padding: 16 },
  
  stepHeader: { alignItems: "center", marginBottom: 24 },
  stepIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: `${Colors.primary}15`, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  stepTitle: { fontSize: 22, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 6 },
  stepDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center" },
  
  tabsContainer: { flexDirection: "row", backgroundColor: Colors.card, borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 8 },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  tabTextActive: { color: "white" },
  
  searchContainer: { marginBottom: 16 },
  searchBox: { flexDirection: "row", gap: 8 },
  searchInput: { flex: 1, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: 15, color: Colors.text, textAlign: "right", fontFamily: "Vazirmatn" },
  searchBtn: { width: 52, height: 52, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" },
  
  scanButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.primary, borderStyle: "dashed", marginBottom: 20 },
  scanButtonText: { fontSize: 14, color: Colors.primary, fontFamily: "Vazirmatn" },
  
  studentCard: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, padding: 16, borderRadius: 14, marginBottom: 16, gap: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  studentAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 24, fontWeight: "bold", color: "white", fontFamily: "Vazirmatn" },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 16, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  studentClass: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  studentRoll: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginTop: 2 },
  changeBtn: { padding: 8 },
  
  pendingCard: { backgroundColor: `${Colors.danger}10`, borderRadius: 12, padding: 14, alignItems: "center", marginBottom: 20 },
  pendingLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 4 },
  pendingValue: { fontSize: 24, fontWeight: "bold", fontFamily: "Vazirmatn" },
  
  feeSelection: { marginBottom: 20 },
  feeSelectionTitle: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 10, textAlign: "right" },
  feeOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: Colors.card, padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: Colors.border },
  feeOptionActive: { borderColor: Colors.primary, backgroundColor: `${Colors.primary}05` },
  feeOptionTitle: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  feeOptionDue: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  feeOptionAmount: { fontSize: 15, fontWeight: "bold", fontFamily: "Vazirmatn" },
  
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 8, textAlign: "right" },
  
  amountContainer: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, overflow: "hidden" },
  amountInput: { flex: 1, padding: 14, fontSize: 20, fontWeight: "bold", color: Colors.text, textAlign: "center", fontFamily: "Vazirmatn" },
  currencyUnit: { paddingHorizontal: 12, fontSize: 14, color: Colors.textSecondary, backgroundColor: Colors.background, textAlignVertical: "center", paddingVertical: 14 },
  
  quickAmounts: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  quickAmountBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  quickAmountBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  quickAmountText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  quickAmountTextActive: { color: "white" },
  
  methodsRow: { flexDirection: "row", gap: 12 },
  methodCard: { flex: 1, alignItems: "center", padding: 14, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.card, gap: 6 },
  methodCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  methodLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  methodLabelActive: { color: "white" },
  
  submitButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.success, borderRadius: 12, paddingVertical: 16, gap: 8, marginTop: 10, marginBottom: 30 },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: "white", fontSize: 16, fontWeight: "bold", fontFamily: "Vazirmatn" },
});