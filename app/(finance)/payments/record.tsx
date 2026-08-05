// app/(finance)/payments/record.tsx
import { financeApi, formatCurrency } from "@/src/config/financeApi";
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
  discount: number;
  payable: number;
  payment: number;
  remain: number;
  month: number;
  year: number;
  details: string;
}

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
    discount: 0,
    payable: 0,
    payment: 0,
    remain: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    details: "",
  });

  // Fee History
  const [feeHistory, setFeeHistory] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

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

  const searchStudents = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      // searchStudents returns Student[] directly
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
      // Use getStudentById which is available in the API
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
        // Load fee history
        await fetchFeeHistory(id);
      }
    } catch (error) {
      Alert.alert("خطا", "بارگذاری اطلاعات با مشکل مواجه شد");
      console.error(error);
    } finally {
      setLoading(false);
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

  const calculatePayable = () => {
    const total =
      feeData.admissionFee + feeData.tuitionFee + feeData.transportFee;
    const payable = total - feeData.discount;
    const remain = payable - feeData.payment;
    setFeeData({
      ...feeData,
      payable: payable > 0 ? payable : 0,
      remain: remain > 0 ? remain : 0,
    });
  };

  const handleSubmit = async () => {
    if (!selectedStudent) {
      Alert.alert("خطا", "لطفاً ابتدا شاگرد را انتخاب کنید");
      return;
    }

    if (feeData.payment <= 0) {
      Alert.alert("خطا", "مبلغ پرداختی را وارد کنید");
      return;
    }

    if (feeData.payment > feeData.payable) {
      Alert.alert(
        "خطا",
        "مبلغ پرداختی نمی‌تواند بیشتر از مبلغ قابل پرداخت باشد",
      );
      return;
    }

    setLoading(true);
    try {
      await financeApi.recordStudentFeePayment({
        studentId: selectedStudent.id,
        academicYearId: 1, // You should get this from your app state or API
        month: selectedMonth,
        year: feeData.year || new Date().getFullYear(),
        tuitionFee: feeData.tuitionFee,
        admissionFee: feeData.admissionFee,
        transportFee: feeData.transportFee,
        otherFees: 0,
        discount: feeData.discount,
        payment: feeData.payment,
        paymentMethod: "CASH",
        date: new Date().toISOString().split("T")[0],
        details: feeData.details,
      });

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
      discount: 0,
      payable: 0,
      payment: 0,
      remain: 0,
      details: "",
    });
    setSelectedStudent(null);
    setStudentId("");
    setStudentName("");
    setSearchResults([]);
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

              <View style={styles.feeRow}>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>فیس ثبت:</Text>
                  <TextInput
                    style={styles.feeInput}
                    value={feeData.admissionFee.toString()}
                    editable={false}
                  />
                </View>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>فیس تعلیمی:</Text>
                  <TextInput
                    style={styles.feeInput}
                    value={feeData.tuitionFee.toString()}
                    editable={false}
                  />
                </View>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>فیس ترانسپورت:</Text>
                  <TextInput
                    style={styles.feeInput}
                    value={feeData.transportFee.toString()}
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.feeRow}>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>فیس دیگر:</Text>
                  <TextInput
                    style={styles.feeInput}
                    value="0"
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
                      setFeeData({ ...feeData, discount: val });
                      calculatePayable();
                    }}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.feeItem}>
                  <Text style={styles.feeLabel}>قابل پرداخت:</Text>
                  <TextInput
                    style={styles.feeInput}
                    value={feeData.payable.toString()}
                    editable={false}
                  />
                </View>
              </View>

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
                  <Text style={styles.feeLabel}>پرداخت:</Text>
                  <TextInput
                    style={[styles.feeInput, styles.feeEditable]}
                    value={feeData.payment.toString()}
                    onChangeText={(text) => {
                      const val = Number(text) || 0;
                      setFeeData({ ...feeData, payment: val });
                      calculatePayable();
                    }}
                    keyboardType="numeric"
                    placeholder="مبلغ را وارد کنید"
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
                    setFeeData({ ...feeData, details: text })
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
});
