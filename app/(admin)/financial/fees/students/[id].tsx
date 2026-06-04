import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import {
  financeApi,
  formatCurrency
} from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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

interface LocalStudentFeeDetail {
  studentId: number;
  studentName: string;
  className: string;
  fees: LocalFeeItem[];
  summary: {
    totalDue: number;
    totalPaid: number;
    totalAmount: number;
    pendingCount: number;
    paidCount: number;
  };
}

interface LocalFeeItem {
  id: number;
  title: string;
  amount: number;
  dueDate: string;
  status: string;
  billingMonth?: number;
  billingYear?: number;
  discount?: {
    code: string;
    type: string;
    value: number;
  };
  paidAmount: number;
  remainingAmount: number;
  payments: LocalPaymentItem[];
}

interface LocalPaymentItem {
  id: number;
  amount: number;
  paymentMethod: string;
  date: string;
  confirmedBy: string;
}

const PERSIAN_MONTHS = [
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

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "نقدی",
  BANK_TRANSFER: "انتقال بانکی",
  CARD: "کارت",
  MOBILE_MONEY: "پول موبایل",
  CHECK: "چک",
};

export default function StudentFeeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<LocalStudentFeeDetail | null>(null);
  const [studentBasicInfo, setStudentBasicInfo] = useState<{
    name: string;
    className: string;
  } | null>(null);

  // Add Fee Modal
  const [addFeeModalVisible, setAddFeeModalVisible] = useState(false);
  const [feeCategories, setFeeCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [customAmount, setCustomAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [addingFee, setAddingFee] = useState(false);

  // Payment Modal
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedFee, setSelectedFee] = useState<LocalFeeItem | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "CASH",
    referenceNo: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchStudentBasicInfo = async (studentId: number) => {
    try {
      // Try to get student info from the users API
      const response = await fetch(
        `/api/finance/admin/users?role=STUDENT&search=${studentId}`,
      );
      // This is a fallback - in a real app, you'd have a dedicated endpoint
      // For now, we'll use a default and let the fees data provide the name if available
      return null;
    } catch (error) {
      return null;
    }
  };

  const loadData = useCallback(async () => {
    try {
      const studentId = parseInt(id as string);
      if (isNaN(studentId)) {
        Alert.alert("خطا", "شناسه دانش‌آموز نامعتبر است");
        router.back();
        return;
      }

      console.log("Fetching fees for student ID:", studentId);

      // First, try to get student info from getStudentFees which might have the name
      let studentName = "دانش‌آموز";
      let className = "نامشخص";

      try {
        const feesResponse = await financeApi.getStudentFees({ studentId });
        if (
          feesResponse.success &&
          feesResponse.data &&
          feesResponse.data.fees &&
          feesResponse.data.fees.length > 0
        ) {
          const firstFee = feesResponse.data.fees[0];
          if (firstFee.studentName) {
            studentName = firstFee.studentName;
          }
          if (firstFee.className) {
            className = firstFee.className;
          }
        }
      } catch (error) {
        console.log("Could not fetch student name from fees");
      }

      // Try to get detailed fees
      let response;
      try {
        response = await financeApi.getStudentFeeDetails(studentId);
        console.log("getStudentFeeDetails response:", response);
      } catch (error: any) {
        console.log("getStudentFeeDetails failed:", error.message);
        response = null;
      }

      if (
        response &&
        response.success &&
        response.data &&
        response.data.fees &&
        response.data.fees.length > 0
      ) {
        // Has fees - use the data from the response
        const apiData = response.data;
        const localData: LocalStudentFeeDetail = {
          studentId: apiData.studentId,
          studentName: apiData.studentName || studentName,
          className: apiData.className || className,
          fees: apiData.fees.map((fee) => ({
            id: fee.id,
            title: fee.title,
            amount: fee.amount,
            dueDate: fee.dueDate,
            status: fee.status,
            billingMonth: fee.billingMonth,
            billingYear: fee.billingYear,
            discount: fee.discount,
            paidAmount: fee.paidAmount,
            remainingAmount: fee.remainingAmount,
            payments: fee.payments.map((p) => ({
              id: p.id,
              amount: p.amount,
              paymentMethod: p.paymentMethod || "CASH",
              date: p.date,
              confirmedBy: p.confirmedBy,
            })),
          })),
          summary: apiData.summary,
        };
        setData(localData);
      } else {
        // No fees found - create empty state with student info
        setData({
          studentId: studentId,
          studentName: studentName,
          className: className,
          fees: [],
          summary: {
            totalDue: 0,
            totalPaid: 0,
            totalAmount: 0,
            pendingCount: 0,
            paidCount: 0,
          },
        });

        // Show message that no fees exist
        Alert.alert(
          "اطلاع",
          `${studentName} هیچ هزینه‌ای ندارد. می‌توانید هزینه جدید اضافه کنید.`,
        );
      }
    } catch (error: any) {
      console.error("Error loading student fees:", error);
      Alert.alert("خطا", error?.message || "مشکلی در بارگذاری اطلاعات پیش آمد");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, router]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const loadFeeCategories = async () => {
    try {
      const response = await financeApi.getFeeCategories();
      if (response.success && response.data) {
        setFeeCategories(response.data);
      }
    } catch (error) {
      console.error("Error loading fee categories:", error);
      Alert.alert("خطا", "خطا در دریافت دسته‌بندی هزینه‌ها");
    }
  };

  const openAddFeeModal = () => {
    loadFeeCategories();
    setSelectedCategoryId(null);
    setCustomAmount("");
    setDueDate(new Date().toISOString().split("T")[0]);
    setAddFeeModalVisible(true);
  };

  const handleAddFee = async () => {
    if (!selectedCategoryId) {
      Alert.alert("خطا", "لطفاً نوع هزینه را انتخاب کنید");
      return;
    }

    if (!dueDate) {
      Alert.alert("خطا", "لطفاً تاریخ سررسید را وارد کنید");
      return;
    }

    setAddingFee(true);
    try {
      const response = await financeApi.addStudentCustomFee(
        parseInt(id as string),
        {
          feeCategoryId: selectedCategoryId,
          dueDate: dueDate,
          amount: customAmount ? parseFloat(customAmount) : undefined,
        },
      );

      if (response.success) {
        Alert.alert("موفق", "هزینه با موفقیت اضافه شد");
        setAddFeeModalVisible(false);
        loadData();
      } else {
        Alert.alert(
          "خطا",
          (response as any).message || "خطا در اضافه کردن هزینه",
        );
      }
    } catch (error: any) {
      console.error("Error adding fee:", error);
      Alert.alert("خطا", error?.message || "خطا در اضافه کردن هزینه");
    } finally {
      setAddingFee(false);
    }
  };

  const openPayModal = (fee: LocalFeeItem) => {
    setSelectedFee(fee);
    setPaymentForm({
      amount: fee.remainingAmount.toString(),
      paymentMethod: "CASH",
      referenceNo: "",
      notes: "",
    });
    setPaymentModalVisible(true);
  };

  const handleSubmitPayment = async () => {
    if (!selectedFee || !data) return;

    const amount = parseFloat(paymentForm.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("خطا", "لطفاً مبلغ معتبر وارد کنید");
      return;
    }

    if (amount > selectedFee.remainingAmount) {
      Alert.alert(
        "خطا",
        `مبلغ وارد شده بیشتر از مانده بدهی (${formatCurrency(selectedFee.remainingAmount)}) است`,
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await financeApi.recordPayment({
        studentId: data.studentId,
        studentFeeId: selectedFee.id,
        amount,
        paymentMethod: paymentForm.paymentMethod,
        referenceNo: paymentForm.referenceNo || undefined,
        notes: paymentForm.notes || undefined,
      });

      if (response.success) {
        Alert.alert("موفق", "پرداخت با موفقیت ثبت شد");
        setPaymentModalVisible(false);
        loadData();
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return {
          text: "پرداخت شده",
          color: Colors.success,
          bg: `${Colors.success}15`,
          icon: "checkmark-circle",
        };
      case "PARTIAL":
        return {
          text: "پرداخت ناقص",
          color: Colors.warning,
          bg: `${Colors.warning}15`,
          icon: "time",
        };
      case "PENDING":
        return {
          text: "در انتظار",
          color: Colors.info,
          bg: `${Colors.info}15`,
          icon: "hourglass",
        };
      case "OVERDUE":
        return {
          text: "سررسید گذشته",
          color: Colors.danger,
          bg: `${Colors.danger}15`,
          icon: "alert-circle",
        };
      default:
        return {
          text: status,
          color: Colors.textSecondary,
          bg: `${Colors.textSecondary}15`,
          icon: "help-circle",
        };
    }
  };

  const getBillingPeriod = (month?: number, year?: number) => {
    if (!month || !year) return "";
    return `${PERSIAN_MONTHS[month - 1]} ${year}`;
  };

  const getPaymentMethodLabel = (method: string) => {
    return PAYMENT_METHOD_LABELS[method] || method;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="جزئیات شهریه" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="جزئیات شهریه" showBack />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.danger} />
          <Text style={styles.errorText}>اطلاعات یافت نشد</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>بازگشت</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title={`شهریه ${data.studentName}`} showBack />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Student Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {data.studentName.charAt(0)}
              </Text>
            </View>
            <View style={styles.summaryInfo}>
              <Text style={styles.studentName}>{data.studentName}</Text>
              <Text style={styles.className}>{data.className}</Text>
            </View>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.danger }]}>
                {formatCurrency(data.summary.totalDue)}
              </Text>
              <Text style={styles.statLabel}>بدهی جاری</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.success }]}>
                {formatCurrency(data.summary.totalPaid)}
              </Text>
              <Text style={styles.statLabel}>پرداخت شده</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatCurrency(data.summary.totalAmount)}
              </Text>
              <Text style={styles.statLabel}>کل هزینه‌ها</Text>
            </View>
          </View>

          <View style={styles.countRow}>
            <View
              style={[
                styles.countBadge,
                { backgroundColor: `${Colors.danger}15` },
              ]}
            >
              <Text style={[styles.countText, { color: Colors.danger }]}>
                {data.summary.pendingCount} معوقه
              </Text>
            </View>
            <View
              style={[
                styles.countBadge,
                { backgroundColor: `${Colors.success}15` },
              ]}
            >
              <Text style={[styles.countText, { color: Colors.success }]}>
                {data.summary.paidCount} پرداخت شده
              </Text>
            </View>
          </View>
        </View>

        {/* Add Fee Button */}
        <TouchableOpacity style={styles.addFeeButton} onPress={openAddFeeModal}>
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.addFeeButtonText}>افزودن هزینه جدید</Text>
        </TouchableOpacity>

        {/* Fees List */}
        <Text style={styles.sectionTitle}>لیست هزینه‌ها</Text>

        {data.fees.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={48}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyText}>هیچ هزینه‌ای ثبت نشده است</Text>
            <Text style={styles.emptySubText}>
              با کلیک بر روی دکمه افزودن هزینه جدید می‌توانید هزینه اضافه کنید
            </Text>
          </View>
        ) : (
          data.fees.map((fee) => {
            const badge = getStatusBadge(fee.status);
            const billingPeriod = getBillingPeriod(
              fee.billingMonth,
              fee.billingYear,
            );
            const isPending =
              fee.status !== "PAID" && fee.status !== "CANCELLED";
            const paymentPercent =
              fee.amount > 0 ? (fee.paidAmount / fee.amount) * 100 : 0;

            return (
              <View key={fee.id} style={styles.feeCard}>
                <View style={styles.feeHeader}>
                  <View style={styles.feeTitleRow}>
                    <Text style={styles.feeTitle}>{fee.title}</Text>
                    {billingPeriod && (
                      <View style={styles.periodBadge}>
                        <Text style={styles.periodText}>{billingPeriod}</Text>
                      </View>
                    )}
                  </View>
                  <View
                    style={[styles.statusBadge, { backgroundColor: badge.bg }]}
                  >
                    <Ionicons
                      name={badge.icon as any}
                      size={12}
                      color={badge.color}
                    />
                    <Text style={[styles.statusText, { color: badge.color }]}>
                      {badge.text}
                    </Text>
                  </View>
                </View>

                {fee.discount && (
                  <View style={styles.discountRow}>
                    <Ionicons
                      name="pricetag"
                      size={14}
                      color={Colors.success}
                    />
                    <Text style={styles.discountText}>
                      تخفیف: {fee.discount.code} (
                      {fee.discount.type === "PERCENTAGE"
                        ? `${fee.discount.value}%`
                        : formatCurrency(fee.discount.value)}
                      )
                    </Text>
                  </View>
                )}

                <View style={styles.feeBody}>
                  <View style={styles.feeRow}>
                    <View style={styles.feeItem}>
                      <Text style={styles.feeLabel}>مبلغ کل</Text>
                      <Text style={styles.feeValue}>
                        {formatCurrency(fee.amount)}
                      </Text>
                    </View>
                    <View style={styles.feeItem}>
                      <Text style={styles.feeLabel}>پرداخت شده</Text>
                      <Text
                        style={[styles.feeValue, { color: Colors.success }]}
                      >
                        {formatCurrency(fee.paidAmount)}
                      </Text>
                    </View>
                    <View style={styles.feeItem}>
                      <Text style={styles.feeLabel}>مانده</Text>
                      <Text
                        style={[
                          styles.feeValue,
                          {
                            color:
                              fee.remainingAmount > 0
                                ? Colors.danger
                                : Colors.success,
                          },
                        ]}
                      >
                        {formatCurrency(fee.remainingAmount)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressSection}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.min(paymentPercent, 100)}%`,
                            backgroundColor:
                              fee.status === "PAID"
                                ? Colors.success
                                : Colors.primary,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.round(paymentPercent)}%
                    </Text>
                  </View>
                </View>

                <View style={styles.feeFooter}>
                  <Ionicons
                    name="calendar-outline"
                    size={13}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.feeDate}>
                    سررسید: {new Date(fee.dueDate).toLocaleDateString("fa-IR")}
                  </Text>
                </View>

                {isPending && fee.remainingAmount > 0 && (
                  <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => openPayModal(fee)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="cash" size={18} color="white" />
                    <Text style={styles.payButtonText}>ثبت پرداخت</Text>
                  </TouchableOpacity>
                )}

                {fee.payments && fee.payments.length > 0 && (
                  <View style={styles.paymentHistory}>
                    <Text style={styles.paymentHistoryTitle}>
                      سابقه پرداخت‌ها
                    </Text>
                    {fee.payments.map((payment) => (
                      <View key={payment.id} style={styles.paymentItem}>
                        <View style={styles.paymentItemLeft}>
                          <Text style={styles.paymentAmount}>
                            {formatCurrency(payment.amount)}
                          </Text>
                          <Text style={styles.paymentMethod}>
                            {getPaymentMethodLabel(payment.paymentMethod)}
                          </Text>
                        </View>
                        <View style={styles.paymentItemRight}>
                          <Text style={styles.paymentDate}>{payment.date}</Text>
                          <Text style={styles.paymentBy}>
                            {payment.confirmedBy}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Add Fee Modal */}
      <Modal
        visible={addFeeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddFeeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setAddFeeModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>افزودن هزینه جدید</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>نوع هزینه</Text>
                {feeCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategoryId === category.id &&
                        styles.categoryChipActive,
                    ]}
                    onPress={() => setSelectedCategoryId(category.id)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        selectedCategoryId === category.id &&
                          styles.categoryChipTextActive,
                      ]}
                    >
                      {category.title} - {formatCurrency(category.amount)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  مبلغ (اختیاری - در صورت خالی بودن مبلغ پیش‌فرض استفاده می‌شود)
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={customAmount}
                  onChangeText={(text) =>
                    setCustomAmount(text.replace(/[^0-9]/g, ""))
                  }
                  keyboardType="number-pad"
                  placeholder="مبلغ را وارد کنید"
                  placeholderTextColor={Colors.textSecondary}
                  textAlign="center"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>تاریخ سررسید</Text>
                <TextInput
                  style={styles.formInput}
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.textSecondary}
                  textAlign="center"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAddFeeModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalApplyBtn, addingFee && { opacity: 0.6 }]}
                onPress={handleAddFee}
                disabled={addingFee}
              >
                {addingFee ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.modalApplyText}>افزودن هزینه</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>ثبت پرداخت</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              {selectedFee && (
                <View style={styles.paymentInfoCard}>
                  <View style={styles.paymentInfoRow}>
                    <Text style={styles.paymentInfoLabel}>عنوان:</Text>
                    <Text style={styles.paymentInfoValue}>
                      {selectedFee.title}
                    </Text>
                  </View>
                  <View style={styles.paymentInfoRow}>
                    <Text style={styles.paymentInfoLabel}>مبلغ کل:</Text>
                    <Text style={styles.paymentInfoValue}>
                      {formatCurrency(selectedFee.amount)}
                    </Text>
                  </View>
                  <View style={styles.paymentInfoRow}>
                    <Text style={styles.paymentInfoLabel}>مانده:</Text>
                    <Text
                      style={[
                        styles.paymentInfoValue,
                        { color: Colors.danger },
                      ]}
                    >
                      {formatCurrency(selectedFee.remainingAmount)}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>مبلغ پرداختی</Text>
                <TextInput
                  style={styles.formInput}
                  value={paymentForm.amount}
                  onChangeText={(text) =>
                    setPaymentForm({
                      ...paymentForm,
                      amount: text.replace(/[^0-9.]/g, ""),
                    })
                  }
                  keyboardType="decimal-pad"
                  placeholder="مبلغ"
                  placeholderTextColor={Colors.textSecondary}
                  textAlign="center"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>روش پرداخت</Text>
                <View style={styles.methodRow}>
                  {[
                    { value: "CASH", label: "نقدی" },
                    { value: "BANK_TRANSFER", label: "بانکی" },
                    { value: "CHECK", label: "چک" },
                  ].map((m) => (
                    <TouchableOpacity
                      key={m.value}
                      style={[
                        styles.methodChip,
                        paymentForm.paymentMethod === m.value &&
                          styles.methodChipActive,
                      ]}
                      onPress={() =>
                        setPaymentForm({
                          ...paymentForm,
                          paymentMethod: m.value,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.methodChipText,
                          paymentForm.paymentMethod === m.value &&
                            styles.methodChipTextActive,
                        ]}
                      >
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>شماره مرجع (اختیاری)</Text>
                <TextInput
                  style={styles.formInput}
                  value={paymentForm.referenceNo}
                  onChangeText={(text) =>
                    setPaymentForm({ ...paymentForm, referenceNo: text })
                  }
                  placeholder="شماره پیگیری"
                  placeholderTextColor={Colors.textSecondary}
                  textAlign="right"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>توضیحات (اختیاری)</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={paymentForm.notes}
                  onChangeText={(text) =>
                    setPaymentForm({ ...paymentForm, notes: text })
                  }
                  placeholder="توضیحات اضافی..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                  textAlign="right"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setPaymentModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalApplyBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSubmitPayment}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.modalApplyText}>ثبت پرداخت</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  errorText: {
    fontSize: 16,
    color: Colors.danger,
    marginTop: 12,
    fontFamily: "Vazirmatn",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: { color: "white", fontSize: 14, fontFamily: "Vazirmatn" },
  content: { flex: 1, padding: 16 },

  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    fontFamily: "Vazirmatn",
  },
  summaryInfo: { flex: 1 },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    marginBottom: 2,
  },
  className: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },

  summaryStats: {
    flexDirection: "row",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 12,
  },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: Colors.border },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Vazirmatn",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },

  countRow: { flexDirection: "row", gap: 8 },
  countBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  countText: { fontSize: 12, fontWeight: "500", fontFamily: "Vazirmatn" },

  addFeeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  addFeeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Vazirmatn",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    marginBottom: 14,
    marginTop: 8,
  },

  feeCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  feeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  feeTitleRow: { flexDirection: "row", alignItems: "center", gap: 6, flex: 1 },
  feeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    flex: 1,
  },
  periodBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: `${Colors.primary}10`,
  },
  periodText: { fontSize: 10, color: Colors.primary, fontFamily: "Vazirmatn" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  statusText: { fontSize: 10, fontWeight: "500", fontFamily: "Vazirmatn" },

  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: `${Colors.success}10`,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  discountText: {
    fontSize: 11,
    color: Colors.success,
    fontFamily: "Vazirmatn",
  },

  feeBody: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  feeRow: { flexDirection: "row", gap: 8 },
  feeItem: { flex: 1, alignItems: "center" },
  feeLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    marginBottom: 2,
  },
  feeValue: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text,
    fontFamily: "Vazirmatn",
  },

  progressSection: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: `${Colors.textSecondary}20`,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },

  feeFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  feeDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },

  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.success,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  payButtonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "500",
    fontFamily: "Vazirmatn",
  },

  paymentHistory: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  paymentHistoryTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    marginBottom: 8,
    textAlign: "right",
  },
  paymentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: `${Colors.primary}05`,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  paymentItemLeft: { alignItems: "flex-start" },
  paymentAmount: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.success,
    fontFamily: "Vazirmatn",
  },
  paymentMethod: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    marginTop: 2,
  },
  paymentItemRight: { alignItems: "flex-end" },
  paymentDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  paymentBy: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    marginTop: 2,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: Colors.card,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    marginTop: 8,
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.text,
    fontFamily: "Vazirmatn",
  },
  modalBody: { padding: 20, maxHeight: 500 },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  modalApplyBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  modalApplyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
    fontFamily: "Vazirmatn",
  },

  paymentInfoCard: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  paymentInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentInfoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  paymentInfoValue: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text,
    fontFamily: "Vazirmatn",
  },

  formGroup: { marginBottom: 16 },
  formLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    marginBottom: 6,
    textAlign: "right",
  },
  formInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    fontFamily: "Vazirmatn",
  },
  textArea: { minHeight: 60, textAlignVertical: "top" },

  methodRow: { flexDirection: "row", gap: 8 },
  methodChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  methodChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  methodChipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  methodChipTextActive: { color: "white", fontWeight: "500" },

  categoryChip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: "Vazirmatn",
  },
  categoryChipTextActive: { color: "white" },
});
