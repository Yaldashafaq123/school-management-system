import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

interface TeacherSalaryDetail {
  teacherId: number;
  name: string;
  email: string;
  phone: string;
  hourlyRate: number;
  baseSalary: number;
  overtimeRate: number;
  totalEarned: number;
  pendingAmount: number;
  salaryHistory: {
    id: number;
    month: string;
    year: number;
    baseSalary: number;
    overtimeAmount: number;
    bonusAmount: number;
    deductionAmount: number;
    finalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
  }[];
}

export default function TeacherSalaryDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<TeacherSalaryDetail | null>(null);
  
  // Config Modal
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [configForm, setConfigForm] = useState({
    baseSalary: "",
    hourlyRate: "",
    overtimeRate: "",
  });
  const [savingConfig, setSavingConfig] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const teacherId = parseInt(id as string);
      const response = await financeApi.getTeacherSalaryInfo(teacherId);
      if (response.success) {
        setData(response.data);
        setConfigForm({
          baseSalary: response.data.baseSalary?.toString() || "",
          hourlyRate: response.data.hourlyRate?.toString() || "",
          overtimeRate: response.data.overtimeRate?.toString() || "",
        });
      } else {
        Alert.alert("خطا", "اطلاعات معلم یافت نشد");
        router.back();
      }
    } catch (error) {
      console.error("Error loading teacher:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری اطلاعات پیش آمد");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSaveConfig = async () => {
    const baseSalary = parseFloat(configForm.baseSalary);
    const hourlyRate = parseFloat(configForm.hourlyRate);

    if ((!baseSalary || baseSalary <= 0) && (!hourlyRate || hourlyRate <= 0)) {
      Alert.alert("خطا", "لطفاً حداقل یکی از مقادیر حقوق پایه یا ساعتی را وارد کنید");
      return;
    }

    setSavingConfig(true);
    try {
      await financeApi.updateTeacherSalaryConfig(parseInt(id), {
        baseSalary: baseSalary > 0 ? baseSalary : undefined,
        hourlyRate: hourlyRate > 0 ? hourlyRate : undefined,
        overtimeRate: parseFloat(configForm.overtimeRate) > 0 ? parseFloat(configForm.overtimeRate) : undefined,
      });

      Alert.alert("موفق", "تنظیمات حقوق معلم با موفقیت بروزرسانی شد");
      setConfigModalVisible(false);
      loadData();
    } catch (error: any) {
      Alert.alert("خطا", error?.message || "بروزرسانی حقوق ناموفق بود");
    } finally {
      setSavingConfig(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return { text: "پرداخت شده", color: Colors.success, bg: `${Colors.success}15`, icon: "checkmark-circle" };
      case "PARTIAL":
        return { text: "پرداخت ناقص", color: Colors.warning, bg: `${Colors.warning}15`, icon: "time" };
      case "PENDING":
        return { text: "در انتظار", color: Colors.danger, bg: `${Colors.danger}15`, icon: "hourglass" };
      default:
        return { text: status, color: Colors.textSecondary, bg: `${Colors.textSecondary}15`, icon: "help-circle" };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="جزئیات معلم" showBack />
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
        <Header title="جزئیات معلم" showBack />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.danger} />
          <Text style={styles.errorText}>معلم یافت نشد</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>بازگشت</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header 
        title="جزئیات معلم" 
        showBack 
        rightComponent={
          <TouchableOpacity onPress={() => setConfigModalVisible(true)} style={styles.headerBtn}>
            <Ionicons name="settings-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{data.name.charAt(0)}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.teacherName}>{data.name}</Text>
              <Text style={styles.teacherEmail}>{data.email}</Text>
              {data.phone && (
                <View style={styles.phoneRow}>
                  <Ionicons name="call-outline" size={12} color={Colors.textSecondary} />
                  <Text style={styles.teacherPhone}>{data.phone}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Salary Config */}
          <View style={styles.configRow}>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>حقوق پایه</Text>
              <Text style={styles.configValue}>
                {data.baseSalary > 0 ? formatCurrency(data.baseSalary) : (data.hourlyRate > 0 ? formatCurrency(data.hourlyRate * 160) : "ثبت نشده")}
              </Text>
            </View>
            <View style={styles.configDivider} />
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>ساعتی</Text>
              <Text style={styles.configValue}>
                {data.hourlyRate > 0 ? formatCurrency(data.hourlyRate) : "ثبت نشده"}
              </Text>
            </View>
            <View style={styles.configDivider} />
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>اضافه‌کار</Text>
              <Text style={styles.configValue}>
                {data.overtimeRate > 0 ? formatCurrency(data.overtimeRate) : "ثبت نشده"}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.success }]}>
                {formatCurrency(data.totalEarned)}
              </Text>
              <Text style={styles.statLabel}>کل دریافتی</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: data.pendingAmount > 0 ? Colors.danger : Colors.success }]}>
                {formatCurrency(data.pendingAmount)}
              </Text>
              <Text style={styles.statLabel}>معوقه</Text>
            </View>
          </View>
        </View>

        {/* Salary History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تاریخچه معاش</Text>

          {data.salaryHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={40} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>معاشی ثبت نشده است</Text>
            </View>
          ) : (
            data.salaryHistory.map((salary) => {
              const badge = getStatusBadge(salary.status);
              const progressPercent = salary.finalAmount > 0 ? (salary.paidAmount / salary.finalAmount) * 100 : 0;

              return (
                <View key={salary.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyPeriod}>
                      {salary.month} {salary.year}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Ionicons name={badge.icon as any} size={12} color={badge.color} />
                      <Text style={[styles.statusText, { color: badge.color }]}>{badge.text}</Text>
                    </View>
                  </View>

                  <View style={styles.historyDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>حقوق پایه:</Text>
                      <Text style={styles.detailValue}>{formatCurrency(salary.baseSalary)}</Text>
                    </View>
                    {salary.overtimeAmount > 0 && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>اضافه‌کار:</Text>
                        <Text style={styles.detailValue}>{formatCurrency(salary.overtimeAmount)}</Text>
                      </View>
                    )}
                    {salary.bonusAmount > 0 && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>پاداش:</Text>
                        <Text style={[styles.detailValue, { color: Colors.success }]}>{formatCurrency(salary.bonusAmount)}</Text>
                      </View>
                    )}
                    <View style={styles.detailDivider} />
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabelBold}>جمع کل:</Text>
                      <Text style={styles.detailValueBold}>{formatCurrency(salary.finalAmount)}</Text>
                    </View>
                  </View>

                  {/* Progress */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${Math.min(progressPercent, 100)}%`, backgroundColor: badge.color }]} />
                    </View>
                    <View style={styles.progressInfo}>
                      <Text style={styles.progressLabel}>پرداخت شده: {formatCurrency(salary.paidAmount)}</Text>
                      <Text style={[styles.progressLabel, { color: Colors.danger }]}>مانده: {formatCurrency(salary.remainingAmount)}</Text>
                    </View>
                  </View>

                  {salary.remainingAmount > 0 && (
                    <TouchableOpacity
                      style={styles.payButton}
                      onPress={() => router.push(`/(admin)/financial/salaries/payments/record?teacherId=${data.teacherId}&salaryId=${salary.id}`)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="cash" size={16} color="white" />
                      <Text style={styles.payButtonText}>پرداخت معاش</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Config Modal */}
      <Modal visible={configModalVisible} animationType="slide" transparent={true} onRequestClose={() => setConfigModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setConfigModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>تنظیم حقوق</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>حقوق پایه ماهیانه (افغانی)</Text>
                <TextInput
                  style={styles.formInput}
                  value={configForm.baseSalary}
                  onChangeText={(text) => setConfigForm({ ...configForm, baseSalary: text.replace(/[^0-9.]/g, '') })}
                  keyboardType="decimal-pad"
                  placeholder="مثال: ۱۵۰۰۰"
                  placeholderTextColor={Colors.textSecondary}
                  textAlign="right"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>حقوق ساعتی (افغانی)</Text>
                <TextInput
                  style={styles.formInput}
                  value={configForm.hourlyRate}
                  onChangeText={(text) => setConfigForm({ ...configForm, hourlyRate: text.replace(/[^0-9.]/g, '') })}
                  keyboardType="decimal-pad"
                  placeholder="مثال: ۱۰۰"
                  placeholderTextColor={Colors.textSecondary}
                  textAlign="right"
                />
                {configForm.hourlyRate && parseFloat(configForm.hourlyRate) > 0 && (
                  <Text style={styles.formHint}>
                    معادل ماهیانه (۱۶۰ ساعت): {formatCurrency(parseFloat(configForm.hourlyRate) * 160)}
                  </Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>نرخ اضافه‌کار (افغانی/ساعت)</Text>
                <TextInput
                  style={styles.formInput}
                  value={configForm.overtimeRate}
                  onChangeText={(text) => setConfigForm({ ...configForm, overtimeRate: text.replace(/[^0-9.]/g, '') })}
                  keyboardType="decimal-pad"
                  placeholder="اختیاری"
                  placeholderTextColor={Colors.textSecondary}
                  textAlign="right"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfigModalVisible(false)}>
                <Text style={styles.cancelText}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, savingConfig && styles.saveBtnDisabled]} onPress={handleSaveConfig} disabled={savingConfig} activeOpacity={0.7}>
                {savingConfig ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.saveText}>ذخیره</Text>}
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
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  errorText: { fontSize: 16, color: Colors.danger, marginTop: 12, fontFamily: "Vazirmatn" },
  retryButton: { marginTop: 16, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  retryButtonText: { color: "white", fontSize: 14, fontFamily: "Vazirmatn" },
  content: { flex: 1, padding: 16 },
  headerBtn: { padding: 4 },
  
  profileCard: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  profileHeader: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 },
  avatarContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 24, fontWeight: "bold", color: "white", fontFamily: "Vazirmatn" },
  profileInfo: { flex: 1 },
  teacherName: { fontSize: 18, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  teacherEmail: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  teacherPhone: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  configRow: { flexDirection: "row", backgroundColor: Colors.background, borderRadius: 10, padding: 12, marginBottom: 14 },
  configItem: { flex: 1, alignItems: "center" },
  configDivider: { width: 1, backgroundColor: Colors.border },
  configLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 4 },
  configValue: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn" },
  
  statsRow: { flexDirection: "row", paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  statItem: { flex: 1, alignItems: "center" },
  statDivider: { width: 1, backgroundColor: Colors.border },
  statValue: { fontSize: 18, fontWeight: "bold", fontFamily: "Vazirmatn", marginBottom: 2 },
  statLabel: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 12 },
  
  historyCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  historyPeriod: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn" },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, gap: 4 },
  statusText: { fontSize: 10, fontWeight: "500", fontFamily: "Vazirmatn" },
  
  historyDetails: { backgroundColor: Colors.background, borderRadius: 10, padding: 12, marginBottom: 10 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  detailLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  detailLabelBold: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn" },
  detailValue: { fontSize: 12, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },
  detailValueBold: { fontSize: 14, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn" },
  detailDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 6 },
  
  progressSection: { gap: 6, marginBottom: 10 },
  progressBar: { height: 6, backgroundColor: Colors.background, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  progressInfo: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  payButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.success, paddingVertical: 10, borderRadius: 10, gap: 6 },
  payButtonText: { color: "white", fontSize: 13, fontWeight: "500", fontFamily: "Vazirmatn" },
  
  emptyState: { alignItems: "center", paddingVertical: 30, backgroundColor: Colors.card, borderRadius: 12 },
  emptyText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginTop: 8 },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "white", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: 17, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn" },
  modalBody: { padding: 20, maxHeight: 400 },
  modalFooter: { flexDirection: "row", padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, gap: 12 },
  
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 6, textAlign: "right" },
  formInput: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 12, fontSize: 14, color: Colors.text, fontFamily: "Vazirmatn", textAlign: "right" },
  formHint: { fontSize: 11, color: Colors.primary, fontFamily: "Vazirmatn", marginTop: 6, textAlign: "right" },
  
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: Colors.background, alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  cancelText: { fontSize: 15, fontWeight: "500", color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 10, backgroundColor: Colors.primary, alignItems: "center" },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { fontSize: 15, fontWeight: "600", color: "white", fontFamily: "Vazirmatn" },
});