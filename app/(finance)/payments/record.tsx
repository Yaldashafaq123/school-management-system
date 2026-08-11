// app/(finance)/payments/record.tsx
import {
  financeApi,
  formatCurrency,
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface FeeData {
  studentId: number;
  studentName: string;
  fatherName: string;
  phone: string;
  className: string;
  classTime: string;
  admissionDate: string;
  admissionFee: number;
  tuitionFee: number;
  transportFee: number;
  otherFees: number;
  discount: number;
  payable: number;
  payment: number;
  remain: number;
  month: number;
  year: number;
  details: string;
  academicYearId: number;
}

// Month mapping for API
const MONTH_MAP: { [key: string]: string } = {
  حمل: "HAMAL",
  ثور: "SAWR",
  جوزا: "JAWZA",
  سرطان: "SARATAN",
  اسد: "ASAD",
  سنبله: "SUNBULA",
  میزان: "MIZAN",
  عقرب: "AQRAB",
  قوس: "QAWS",
  جدی: "JADI",
  دلو: "DALWA",
  حوت: "HOOT",
};

export default function RecordPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  // Student Search
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Fee Data
  const [feeData, setFeeData] = useState<FeeData>({
    studentId: 0,
    studentName: "",
    fatherName: "",
    phone: "",
    className: "",
    classTime: "",
    admissionDate: "",
    admissionFee: 0,
    tuitionFee: 0,
    transportFee: 0,
    otherFees: 0,
    discount: 0,
    payable: 0,
    payment: 0,
    remain: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    details: "",
    academicYearId: 1,
  });

  // Fee History
  const [feeHistory, setFeeHistory] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [monthlyFees, setMonthlyFees] = useState<any[]>([]);
  const [oneTimeFees, setOneTimeFees] = useState<any[]>([]);
  const [academicYearId, setAcademicYearId] = useState(1);

  // Payment inputs
  const [monthlyPaymentInput, setMonthlyPaymentInput] = useState("");
  const [oneTimePaymentInput, setOneTimePaymentInput] = useState("");
  const [totalPaymentInput, setTotalPaymentInput] = useState("");

  // Options
  const months = [
    "حمل",
    "ثور",
    "جوزا",
    "سرطان",
    "اسد",
    "سنبله",
    "میزان",
    "عقرب",
    "قوس",
    "جدی",
    "دلو",
    "حوت",
  ];

  useEffect(() => {
    if (params.studentId) {
      setStudentId(params.studentId as string);
      fetchStudentInfo(Number(params.studentId));
    }
  }, [params.studentId]);

  // Refetch fee info when month changes
  useEffect(() => {
    if (selectedStudent && selectedStudent.id) {
      fetchStudentFeeInfo(selectedStudent.id);
    }
  }, [selectedMonth]);

  const searchStudents = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await financeApi.searchStudents(query);
      if (results && Array.isArray(results)) {
        setSearchResults(results);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const fetchStudentInfo = async (id: number) => {
    setLoading(true);
    try {
      const response = await financeApi.getStudentById(id);
      if (response && response.success && response.data) {
        const studentData = response.data;
        setSelectedStudent(studentData);

        setFeeData({
          ...feeData,
          studentId: studentData.id,
          studentName: studentData.fullName || studentData.name || "",
          fatherName: studentData.fatherName || "",
          phone: studentData.phone || "",
          className: studentData.class?.name || "",
          classTime: studentData.classTime === 1 ? "بعد از ظهر" : "صبح",
          admissionDate: studentData.admissionDate || "",
        });

        await fetchStudentFeeInfo(id);
        await fetchFeeHistory(id);
      }
    } catch (error) {
      Alert.alert("خطا", "بارگذاری اطلاعات با مشکل مواجه شد");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentFeeInfo = async (id: number) => {
    try {
      const response = await financeApi.getStudentFeeInfo(id);
      if (response && response.success && response.data) {
        const data = response.data;

        // Get academic year ID
        if (data.academicYear) {
          setAcademicYearId(data.academicYear.id);
          setFeeData((prev) => ({
            ...prev,
            academicYearId: data.academicYear.id,
          }));
        }

        // Store ALL monthly fees
        setMonthlyFees(data.monthlyFees || []);

        // ✅ FIX: Store only one-time fees with balance > 0
        const activeOneTimeFees = (data.oneTimeFees || []).filter(
          (f: any) =>
            f.balance > 0 && (f.status === "PENDING" || f.status === "PARTIAL"),
        );
        setOneTimeFees(activeOneTimeFees);

        const monthKey = months[selectedMonth - 1];
        const monthKeyEnglish = MONTH_MAP[monthKey] || monthKey;

        // Find monthly fee for selected month
        let monthlyFee = data.monthlyFees?.find(
          (f: any) => f.month === monthKeyEnglish,
        );

        if (!monthlyFee) {
          monthlyFee = data.monthlyFees?.find(
            (f: any) => f.status === "PENDING" || f.status === "PARTIAL",
          );
        }

        // Calculate monthly fee
        const tuitionFee = monthlyFee ? Number(monthlyFee.amount) : 0;
        const monthlyBalance = monthlyFee
          ? Number(monthlyFee.balance || monthlyFee.amount)
          : 0;

        // ✅ Calculate ONE-TIME balance from active fees only
        const oneTimeBalance = activeOneTimeFees.reduce(
          (sum: number, f: any) => sum + Number(f.balance || f.amount),
          0,
        );

        // Total payable = monthly + pending one-time
        const totalPayable = monthlyBalance + oneTimeBalance;

        setFeeData((prev) => ({
          ...prev,
          tuitionFee: tuitionFee,
          admissionFee: 0,
          transportFee: 0,
          otherFees: oneTimeBalance,
          payable: totalPayable,
          remain: totalPayable - prev.payment,
        }));

        setMonthlyPaymentInput("");
        setOneTimePaymentInput("");
        setTotalPaymentInput("");
      }
    } catch (error) {
      console.error("Fetch fee info error:", error);
    }
  };

  const fetchFeeHistory = async (studentId: number) => {
    try {
      const response = await financeApi.getStudentFeeHistory(studentId);
      if (response && response.success) {
        setFeeHistory(response.data || []);
      }
    } catch (error) {
      console.error("Fetch history error:", error);
    }
  };

  // Handle monthly payment change
  const handleMonthlyPaymentChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");
    setMonthlyPaymentInput(numericText);
    const val = numericText ? Number(numericText) : 0;
    updateTotals(val, Number(oneTimePaymentInput) || 0);
  };

  // Handle one-time payment change
  const handleOneTimePaymentChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");
    setOneTimePaymentInput(numericText);
    const val = numericText ? Number(numericText) : 0;
    updateTotals(Number(monthlyPaymentInput) || 0, val);
  };

  // Update totals when either payment changes
  const updateTotals = (monthly: number, oneTime: number) => {
    const total = monthly + oneTime;
    setTotalPaymentInput(total > 0 ? total.toString() : "");

    const payable = feeData.tuitionFee + feeData.otherFees;
    const remain = payable - total;

    setFeeData((prev) => ({
      ...prev,
      payment: total,
      remain: remain > 0 ? remain : 0,
    }));
  };

  // Handle total payment change (auto-distribute)
  const handleTotalPaymentChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, "");
    setTotalPaymentInput(numericText);
    const total = numericText ? Number(numericText) : 0;

    // Auto-distribute: first pay monthly, then one-time
    const monthlyBalance = feeData.tuitionFee;
    let monthly = Math.min(total, monthlyBalance);
    let oneTime = total - monthly;

    // Cap one-time payment to remaining one-time balance
    const oneTimeBalance = feeData.otherFees;
    if (oneTime > oneTimeBalance) {
      oneTime = oneTimeBalance;
      monthly = total - oneTime;
    }

    setMonthlyPaymentInput(monthly > 0 ? monthly.toString() : "");
    setOneTimePaymentInput(oneTime > 0 ? oneTime.toString() : "");

    const remain = monthlyBalance - monthly + (oneTimeBalance - oneTime);
    setFeeData((prev) => ({
      ...prev,
      payment: total,
      remain: remain > 0 ? remain : 0,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedStudent) {
      Alert.alert("خطا", "لطفاً ابتدا شاگرد را انتخاب کنید");
      return;
    }

    const monthlyAmount = Number(monthlyPaymentInput) || 0;
    const oneTimeAmount = Number(oneTimePaymentInput) || 0;
    const totalAmount = monthlyAmount + oneTimeAmount;

    if (totalAmount <= 0) {
      Alert.alert("خطا", "مبلغ پرداختی را وارد کنید");
      return;
    }

    if (totalAmount > feeData.payable) {
      Alert.alert(
        "خطا",
        "مبلغ پرداختی نمی‌تواند بیشتر از مبلغ قابل پرداخت باشد",
      );
      return;
    }

    setLoading(true);
    try {
      const monthKey = months[selectedMonth - 1];
      const monthKeyEnglish = MONTH_MAP[monthKey] || monthKey;

      const monthlyFee = monthlyFees.find(
        (f: any) => f.month === monthKeyEnglish,
      );

      if (!monthlyFee) {
        Alert.alert("خطا", "فیس برای این ماه ثبت نشده است");
        setLoading(false);
        return;
      }

      // ✅ Calculate actual one-time fee from active fees only
      const activeOneTime = oneTimeFees.filter(
        (f: any) =>
          f.balance > 0 && (f.status === "PENDING" || f.status === "PARTIAL"),
      );
      const oneTimeTotal = activeOneTime.reduce(
        (sum: number, f: any) => sum + Number(f.balance || f.amount),
        0,
      );

      const payload = {
        studentId: selectedStudent.id,
        academicYearId: feeData.academicYearId || 1,
        month: selectedMonth,
        year: feeData.year || new Date().getFullYear(),
        tuitionFee: monthlyAmount > 0 ? monthlyAmount : feeData.tuitionFee,
        admissionFee: 0,
        transportFee: 0,
        otherFees: oneTimeTotal,
        discount: feeData.discount,
        payment: totalAmount,
        paymentMethod: "CASH",
        date: new Date().toISOString().split("T")[0],
        details: feeData.details,
      };

      await financeApi.recordStudentFeePayment(payload);

      // Refresh data
      await fetchStudentFeeInfo(selectedStudent.id);
      await fetchFeeHistory(selectedStudent.id);

      Alert.alert("موفقیت", "پرداخت با موفقیت ثبت شد", [
        { text: "باشه", onPress: () => resetForm() },
      ]);
    } catch (error: any) {
      Alert.alert("خطا", error.message || "ثبت پرداخت با مشکل مواجه شد");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFeeData({
      ...feeData,
      admissionFee: 0,
      tuitionFee: 0,
      transportFee: 0,
      otherFees: 0,
      discount: 0,
      payable: 0,
      payment: 0,
      remain: 0,
      details: "",
    });
    setMonthlyPaymentInput("");
    setOneTimePaymentInput("");
    setTotalPaymentInput("");
    setSelectedStudent(null);
    setStudentId("");
    setStudentName("");
    setSearchResults([]);
    setMonthlyFees([]);
    setOneTimeFees([]);
  };

  const renderSearchResults = () => {
    if (searchResults.length === 0) return null;

    return (
      <View style={styles.searchResults}>
        {searchResults.map((student: any) => (
          <TouchableOpacity
            key={student.id}
            style={styles.searchResultItem}
            onPress={() => {
              setSelectedStudent(student);
              setStudentId(student.id.toString());
              setStudentName(
                student.user?.fullName ||
                  student.fullName ||
                  student.name ||
                  "",
              );
              setSearchResults([]);
              fetchStudentInfo(student.id);
            }}
          >
            <Ionicons name="person" size={20} color="#3b82f6" />
            <View style={styles.searchResultInfo}>
              <Text style={styles.searchResultName}>
                {student.user?.fullName ||
                  student.fullName ||
                  student.name ||
                  "نامشخص"}
              </Text>
              <Text style={styles.searchResultClass}>
                {student.class?.name || student.className || "بدون صنف"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>دریافت فیس شاگردان</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Student Search */}
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>جستجوی شاگرد</Text>

          <View style={styles.searchRow}>
            <View style={styles.searchField}>
              <Text style={styles.fieldLabel}>آی دی شاگرد:</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="آی دی را وارد کنید"
                value={studentId}
                onChangeText={(text) => {
                  setStudentId(text);
                  if (text.length >= 1) {
                    fetchStudentInfo(Number(text));
                  }
                }}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.searchField}>
              <Text style={styles.fieldLabel}>نام شاگرد:</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="نام یا نام پدر را وارد کنید"
                value={studentName}
                onChangeText={(text) => {
                  setStudentName(text);
                  searchStudents(text);
                }}
              />
            </View>
          </View>

          {renderSearchResults()}
        </View>

        {/* Student Info */}
        {selectedStudent && (
          <>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>اطلاعات شاگرد</Text>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>آی دی:</Text>
                  <Text style={styles.infoValue}>{selectedStudent.id}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>نام:</Text>
                  <Text style={styles.infoValue}>{feeData.studentName}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>نام پدر:</Text>
                  <Text style={styles.infoValue}>{feeData.fatherName}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>تلفن:</Text>
                  <Text style={styles.infoValue}>{feeData.phone}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>صنف:</Text>
                  <Text style={styles.infoValue}>{feeData.className}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>وقت صنف:</Text>
                  <Text style={styles.infoValue}>{feeData.classTime}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>تاریخ ثبت:</Text>
                  <Text style={styles.infoValue}>{feeData.admissionDate}</Text>
                </View>
              </View>
            </View>

            {/* Fee Entry */}
            <View style={styles.feeSection}>
              <Text style={styles.sectionTitle}>دریافت فیس</Text>

              {/* Monthly Fee Status */}
              {monthlyFees.length > 0 && (
                <View style={styles.monthlyStatusContainer}>
                  <Text style={styles.monthlyStatusTitle}>
                    وضعیت فیس ماهانه:
                  </Text>
                  {monthlyFees.map((fee, index) => (
                    <View key={index} style={styles.monthlyStatusItem}>
                      <Text style={styles.monthlyStatusMonth}>
                        {getMonthName(fee.month)}
                      </Text>
                      <Text
                        style={[
                          styles.monthlyStatusBadge,
                          fee.status === "PAID"
                            ? styles.statusPaid
                            : fee.status === "PARTIAL"
                              ? styles.statusPartial
                              : styles.statusPending,
                        ]}
                      >
                        {fee.status === "PAID"
                          ? "✅ پرداخت شده"
                          : fee.status === "PARTIAL"
                            ? "⚡ پرداخت ناقص"
                            : "⏳ در انتظار"}
                      </Text>
                      <Text style={styles.monthlyStatusAmount}>
                        {formatCurrency(fee.amount)}
                        {fee.status !== "PAID" &&
                          ` (باقی: ${formatCurrency(fee.balance)})`}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* One-Time Fee Status - ✅ Only shows fees with balance > 0 */}
              {(() => {
                const activeOneTime = oneTimeFees.filter(
                  (f: any) =>
                    f.balance > 0 &&
                    (f.status === "PENDING" || f.status === "PARTIAL"),
                );
                if (activeOneTime.length === 0) return null;

                return (
                  <View style={styles.oneTimeStatusContainer}>
                    <Text style={styles.oneTimeStatusTitle}>
                      فیس‌های یکباره:
                    </Text>
                    {activeOneTime.map((fee, index) => (
                      <View key={index} style={styles.oneTimeStatusItem}>
                        <Text style={styles.oneTimeStatusName}>{fee.name}</Text>
                        <Text
                          style={[
                            styles.oneTimeStatusBadge,
                            fee.status === "PAID"
                              ? styles.statusPaid
                              : fee.status === "PARTIAL"
                                ? styles.statusPartial
                                : styles.statusPending,
                          ]}
                        >
                          {fee.status === "PAID"
                            ? "✅ پرداخت شده"
                            : fee.status === "PARTIAL"
                              ? "⚡ پرداخت ناقص"
                              : "⏳ در انتظار"}
                        </Text>
                        <Text style={styles.oneTimeStatusAmount}>
                          {formatCurrency(fee.amount)}
                          {fee.status !== "PAID" &&
                            ` (باقی: ${formatCurrency(fee.balance)})`}
                        </Text>
                      </View>
                    ))}
                  </View>
                );
              })()}

              {/* Fee Amounts Display */}
              <View style={styles.feeRow}>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>فیس تعلیمی:</Text>
                  <TextInput
                    style={styles.feeInput}
                    value={feeData.tuitionFee.toString()}
                    editable={false}
                  />
                </View>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>فیس یکباره:</Text>
                  <TextInput
                    style={styles.feeInput}
                    value={feeData.otherFees.toString()}
                    editable={false}
                  />
                </View>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>تخفیف:</Text>
                  <TextInput
                    style={[styles.feeInput, styles.feeEditable]}
                    value={feeData.discount.toString()}
                    onChangeText={(text) => {
                      const val = Number(text) || 0;
                      setFeeData((prev) => {
                        const total = prev.tuitionFee + prev.otherFees;
                        const payable = total - val;
                        const remain = payable - prev.payment;
                        return {
                          ...prev,
                          discount: val,
                          payable: payable > 0 ? payable : 0,
                          remain: remain > 0 ? remain : 0,
                        };
                      });
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Payment Inputs */}
              <View style={styles.feeRow}>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>پرداخت فیس تعلیمی:</Text>
                  <TextInput
                    style={[styles.feeInput, styles.feeEditable]}
                    value={monthlyPaymentInput}
                    onChangeText={handleMonthlyPaymentChange}
                    keyboardType="numeric"
                    placeholder="مبلغ"
                  />
                </View>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>پرداخت فیس یکباره:</Text>
                  <TextInput
                    style={[styles.feeInput, styles.feeEditable]}
                    value={oneTimePaymentInput}
                    onChangeText={handleOneTimePaymentChange}
                    keyboardType="numeric"
                    placeholder="مبلغ"
                  />
                </View>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>مجموع پرداخت:</Text>
                  <TextInput
                    style={[styles.feeInput, styles.feeEditable]}
                    value={totalPaymentInput}
                    onChangeText={handleTotalPaymentChange}
                    keyboardType="numeric"
                    placeholder="مجموع"
                  />
                </View>
              </View>

              {/* Month and Balance */}
              <View style={styles.feeRow}>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>ماه:</Text>
                  <TouchableOpacity
                    style={styles.monthPicker}
                    onPress={() => {
                      Alert.alert(
                        "انتخاب ماه",
                        "ماه مورد نظر را انتخاب کنید",
                        months.map((m, i) => ({
                          text: m,
                          onPress: () => setSelectedMonth(i + 1),
                        })),
                      );
                    }}
                  >
                    <Text style={styles.monthPickerText}>
                      {months[selectedMonth - 1]}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#64748b" />
                  </TouchableOpacity>
                </View>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>قابل پرداخت:</Text>
                  <TextInput
                    style={styles.feeInput}
                    value={feeData.payable.toString()}
                    editable={false}
                  />
                </View>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>باقیمانده:</Text>
                  <TextInput
                    style={[
                      styles.feeInput,
                      { color: feeData.remain > 0 ? "#ef4444" : "#10b981" },
                    ]}
                    value={feeData.remain.toString()}
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.detailsRow}>
                <Text style={styles.fieldLabel}>جزئیات:</Text>
                <TextInput
                  style={styles.detailsInput}
                  placeholder="توضیحات (اختیاری)"
                  value={feeData.details}
                  onChangeText={(text) =>
                    setFeeData((prev) => ({ ...prev, details: text }))
                  }
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={20} color="#fff" />
                    <Text style={styles.submitText}>ذخیره فیس</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Fee History */}
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>تاریخچه فیس شاگرد</Text>

              <View style={styles.historyHeader}>
                <Text style={[styles.historyCell, styles.historyDate]}>
                  تاریخ
                </Text>
                <Text style={[styles.historyCell, styles.historyMonth]}>
                  ماه
                </Text>
                <Text style={[styles.historyCell, styles.historyAmount]}>
                  فیس تعلیمی
                </Text>
                <Text style={[styles.historyCell, styles.historyAmount]}>
                  پرداخت
                </Text>
                <Text style={[styles.historyCell, styles.historyAmount]}>
                  باقی
                </Text>
              </View>

              {feeHistory.length === 0 ? (
                <Text style={styles.historyEmpty}>هیچ فیس ثبت نشده است</Text>
              ) : (
                feeHistory.map((fee, index) => (
                  <View key={index} style={styles.historyRow}>
                    <Text style={[styles.historyCell, styles.historyDate]}>
                      {fee.date || ""}
                    </Text>
                    <Text style={[styles.historyCell, styles.historyMonth]}>
                      {fee.monthName || ""}
                    </Text>
                    <Text style={[styles.historyCell, styles.historyAmount]}>
                      {formatCurrency(fee.tuitionFee || fee.amount || 0)}
                    </Text>
                    <Text style={[styles.historyCell, styles.historyAmount]}>
                      {formatCurrency(fee.payment || 0)}
                    </Text>
                    <Text
                      style={[
                        styles.historyCell,
                        styles.historyAmount,
                        styles.historyBalance,
                      ]}
                    >
                      {formatCurrency(fee.balance || 0)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  searchSection: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  searchRow: {
    flexDirection: "row",
    gap: 12,
  },
  searchField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 4,
    fontFamily: "Vazir",
  },
  fieldInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  searchResults: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 12,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    marginBottom: 6,
    gap: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  searchResultClass: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  infoSection: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  infoItem: {
    width: "48%",
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  feeSection: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  feeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  feeItem: {
    flex: 1,
  },
  feeLabel: {
    fontSize: 12,
    color: "#475569",
    marginBottom: 4,
    fontFamily: "Vazir",
  },
  feeInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Vazir",
    textAlign: "center",
  },
  feeEditable: {
    backgroundColor: "#fff",
    borderColor: "#3b82f6",
  },
  monthPicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 8,
  },
  monthPickerText: {
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  detailsRow: {
    marginTop: 10,
  },
  detailsInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Vazir",
    minHeight: 50,
    textAlignVertical: "top",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  historySection: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
  },
  historyHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  historyCell: {
    fontFamily: "Vazir",
    fontSize: 12,
    color: "#475569",
  },
  historyDate: {
    flex: 1.2,
  },
  historyMonth: {
    flex: 1,
  },
  historyAmount: {
    flex: 1,
    textAlign: "center",
  },
  historyBalance: {
    fontWeight: "700",
  },
  historyEmpty: {
    textAlign: "center",
    color: "#94a3b8",
    padding: 20,
    fontFamily: "Vazir",
  },
  monthlyStatusContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  monthlyStatusTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
    fontFamily: "VazirBold",
  },
  monthlyStatusItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  monthlyStatusMonth: {
    fontSize: 13,
    color: "#475569",
    fontFamily: "Vazir",
    flex: 1,
  },
  monthlyStatusBadge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: "Vazir",
    marginHorizontal: 8,
  },
  statusPaid: {
    backgroundColor: "#dcfce7",
    color: "#059669",
  },
  statusPartial: {
    backgroundColor: "#fef3c7",
    color: "#d97706",
  },
  statusPending: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
  },
  monthlyStatusAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  oneTimeStatusContainer: {
    backgroundColor: "#f0fdf4",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  oneTimeStatusTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 8,
    fontFamily: "VazirBold",
  },
  oneTimeStatusItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#dcfce7",
  },
  oneTimeStatusName: {
    fontSize: 13,
    color: "#166534",
    fontFamily: "Vazir",
    flex: 1,
  },
  oneTimeStatusBadge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: "Vazir",
    marginHorizontal: 8,
  },
  oneTimeStatusAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#166534",
    fontFamily: "Vazir",
  },
});
