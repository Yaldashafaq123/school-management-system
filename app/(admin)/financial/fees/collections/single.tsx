import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";

interface Student {
  id: number;
  name: string;
  className: string;
  rollNumber: string;
  parentUsername?: string;
}

interface PendingFee {
  id: number;
  title: string;
  amount: number;
  dueDate: string;
  remainingAmount: number;
}

interface Class {
  id: number;
  name: string;
  section?: string;
}

export default function FeeCollection() {
  const router = useRouter();

  // Step 1: Select Class
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedClassName, setSelectedClassName] = useState("");
  const [classes, setClasses] = useState<Class[]>([]);

  // Step 2: Students in class
  const [students, setStudents] = useState<Student[]>([]);
  const [searchName, setSearchName] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  // Step 3: Selected student & fees
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [pendingFees, setPendingFees] = useState<PendingFee[]>([]);

  // Payment
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // UI State
  const [step, setStep] = useState<"class" | "student" | "payment">("class");
  const [loading, setLoading] = useState(false);

  // Load classes on mount
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    try {
      const response = await financeApi.getClasses();
      if (response.success && response.data) {
        setClasses(response.data);
      } else {
        setClasses([]);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
      Alert.alert("خطا", "خطا در دریافت لیست صنف‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClass = async (classItem: Class) => {
    setSelectedClassId(classItem.id);
    setSelectedClassName(classItem.name);
    setLoading(true);
    try {
      // Use getStudentsWithPendingFees to get students with their pending fees
      const response = await financeApi.getStudentsWithPendingFees(
        classItem.id,
      );
      if (response.success && response.data) {
        // Transform the data to match our Student interface
        const transformedStudents = response.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          rollNumber: item.rollNumber,
          className: selectedClassName,
          parentUsername: item.parentUsername || "ثبت نشده",
        }));
        setStudents(transformedStudents);
        setFilteredStudents(transformedStudents);
        setStep("student");
      } else {
        Alert.alert("اطلاع", "هیچ دانش‌آموزی در این صنف یافت نشد");
      }
    } catch (error) {
      console.error("Error loading students:", error);
      Alert.alert("خطا", "خطا در دریافت لیست دانش‌آموزان");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchStudent = (text: string) => {
    setSearchName(text);
    if (text.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter((student) =>
        student.name.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredStudents(filtered);
    }
  };

  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setLoading(true);
    try {
      // Get detailed fee information for the student
      const response = await financeApi.getStudentFeeDetails(student.id);
      if (response.success && response.data) {
        // Extract pending fees from the response
        const pendingFeesList = response.data.fees
          .filter(
            (fee: any) => fee.status === "PENDING" || fee.status === "PARTIAL",
          )
          .map((fee: any) => ({
            id: fee.id,
            title: fee.title,
            amount: fee.amount,
            dueDate: fee.dueDate || "نامشخص",
            remainingAmount: fee.remainingAmount,
          }));

        if (pendingFeesList.length > 0) {
          setPendingFees(pendingFeesList);
          setStep("payment");
        } else {
          Alert.alert("اطلاع", "این دانش‌آموز هزینه معوقه ندارد");
        }
      } else {
        Alert.alert("اطلاع", "هیچ هزینه‌ای برای این دانش‌آموز یافت نشد");
      }
    } catch (error) {
      console.error("Error loading fees:", error);
      Alert.alert("خطا", "خطا در دریافت هزینه‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedStudent || !pendingFees[0]) return;

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      Alert.alert("خطا", "لطفاً مبلغ معتبر وارد کنید");
      return;
    }

    if (paymentAmount > pendingFees[0].remainingAmount) {
      Alert.alert(
        "خطا",
        `مبلغ وارد شده بیشتر از مانده بدهی (${formatCurrency(pendingFees[0].remainingAmount)}) است`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await financeApi.recordPayment({
        studentId: selectedStudent.id,
        studentFeeId: pendingFees[0].id,
        amount: paymentAmount,
        paymentMethod: "CASH",
      });

      if (response.success) {
        Alert.alert("موفق", "پرداخت با موفقیت ثبت شد", [
          { text: "پرداخت جدید", onPress: resetForm },
          { text: "بازگشت", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert(
          "خطا",
          (response as any).message || "ثبت پرداخت ناموفق بود",
        );
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      Alert.alert("خطا", error?.message || "ثبت پرداخت ناموفق بود");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedClassId(null);
    setSelectedClassName("");
    setStudents([]);
    setSelectedStudent(null);
    setPendingFees([]);
    setAmount("");
    setSearchName("");
    setStep("class");
  };

  // Render Class Selection
  const renderClassStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>انتخاب صنف</Text>
      <Text style={styles.subtitle}>ابتدا صنف دانش‌آموز را انتخاب کنید</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={styles.loader}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.classList}
        >
          {classes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>هیچ صنفی یافت نشد</Text>
            </View>
          ) : (
            classes.map((classItem) => (
              <TouchableOpacity
                key={classItem.id}
                style={styles.classCard}
                onPress={() => handleSelectClass(classItem)}
              >
                <View>
                  <Text style={styles.className}>{classItem.name}</Text>
                  {classItem.section && (
                    <Text style={styles.classSection}>{classItem.section}</Text>
                  )}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );

  // Render Student Selection
  const renderStudentStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        onPress={() => setStep("class")}
        style={styles.backButton}
      >
        <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
        <Text style={styles.backText}>بازگشت به صنف‌ها</Text>
      </TouchableOpacity>

      <Text style={styles.title}>صنف: {selectedClassName}</Text>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="جستجوی نام دانش‌آموز..."
          value={searchName}
          onChangeText={handleSearchStudent}
          textAlign="right"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={styles.loader}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredStudents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>هیچ دانش‌آموزی یافت نشد</Text>
            </View>
          ) : (
            filteredStudents.map((student) => (
              <TouchableOpacity
                key={student.id}
                style={styles.studentCard}
                onPress={() => handleSelectStudent(student)}
              >
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentDetail}>
                    نام کاربری والدین: {student.parentUsername || "ثبت نشده"}
                  </Text>
                  <Text style={styles.studentDetail}>
                    شماره: {student.rollNumber}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );

  // Render Payment
  const renderPaymentStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        onPress={() => setStep("student")}
        style={styles.backButton}
      >
        <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
        <Text style={styles.backText}>بازگشت به لیست دانش‌آموزان</Text>
      </TouchableOpacity>

      <View style={styles.studentSummary}>
        <Text style={styles.summaryName}>{selectedStudent?.name}</Text>
        <Text style={styles.summaryClass}>{selectedStudent?.className}</Text>
        <Text style={styles.parentUsername}>
          والدین: {selectedStudent?.parentUsername || "ثبت نشده"}
        </Text>
      </View>

      {pendingFees.map((fee) => (
        <View key={fee.id} style={styles.feeCard}>
          <Text style={styles.feeTitle}>{fee.title}</Text>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>کل مبلغ:</Text>
            <Text style={styles.feeValue}>{formatCurrency(fee.amount)}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>مانده بدهی:</Text>
            <Text style={[styles.feeValue, styles.remaining]}>
              {formatCurrency(fee.remainingAmount)}
            </Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>تاریخ سررسید:</Text>
            <Text style={styles.feeValue}>{fee.dueDate}</Text>
          </View>

          <View style={styles.paymentInput}>
            <Text style={styles.inputLabel}>مبلغ پرداختی:</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
              keyboardType="number-pad"
              placeholder="مبلغ را وارد کنید"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!amount || submitting) && styles.disabledBtn,
            ]}
            onPress={handleSubmitPayment}
            disabled={!amount || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitBtnText}>ثبت پرداخت</Text>
            )}
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="ثبت شهریه" showBack />

      <ScrollView contentContainerStyle={styles.content}>
        {step === "class" && renderClassStep()}
        {step === "student" && renderStudentStep()}
        {step === "payment" && renderPaymentStep()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  backText: {
    fontSize: 14,
    color: Colors.primary,
    marginRight: 8,
  },
  classList: {
    marginTop: 8,
  },
  classCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  className: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  classSection: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
  },
  studentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  studentDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  parentUsername: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  studentSummary: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  summaryClass: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  feeCard: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  feeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  feeLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  feeValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  remaining: {
    color: Colors.danger,
  },
  paymentInput: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    textAlign: "center",
  },
  submitBtn: {
    backgroundColor: Colors.success,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  submitBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledBtn: {
    opacity: 0.5,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
