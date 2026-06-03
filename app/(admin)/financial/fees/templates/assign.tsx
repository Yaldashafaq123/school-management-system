import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Student {
  id: number;
  name: string;
  rollNumber: string;
  selected: boolean;
  existingFee?: boolean;
}

interface Template {
  id: number;
  className: string;
  feeTitle: string;
  amount: number;
  frequency: string;
  dueDay: number;
}

export default function AssignTemplateToStudents() {
  const router = useRouter();
  const { templateId } = useLocalSearchParams<{ templateId: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [template, setTemplate] = useState<Template | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [templateRes, studentsRes] = await Promise.all([
        financeApi.getFeeTemplateById(parseInt(templateId)),
        financeApi.getStudentsForTemplate(parseInt(templateId)),
      ]);

      if (templateRes.success) setTemplate(templateRes.data);
      if (studentsRes.success) {
        setStudents(studentsRes.data.map((s: any) => ({ ...s, selected: false, existingFee: s.hasExistingFee })));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری اطلاعات پیش آمد");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [templateId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setStudents((prev) => prev.map((s) => ({ ...s, selected: newSelectAll && !s.existingFee })));
  };

  const toggleStudent = (id: number) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, selected: !s.selected } : s
      )
    );
    // Update selectAll state
    setStudents((prev) => {
      const allSelected = prev.filter(s => !s.existingFee).every((s) => s.selected);
      setSelectAll(allSelected);
      return prev;
    });
  };

  const handleAssign = async () => {
    const selectedStudents = students.filter((s) => s.selected && !s.existingFee);
    if (selectedStudents.length === 0) {
      Alert.alert("خطا", "لطفاً حداقل یک دانش‌آموز را انتخاب کنید");
      return;
    }

    setAssigning(true);
    try {
      const response = await financeApi.assignTemplateToStudents({
        templateId: parseInt(templateId),
        studentIds: selectedStudents.map((s) => s.id),
      });

      if (response.success) {
        Alert.alert(
          "موفق",
          `${response.data.count} هزینه برای دانش‌آموزان ایجاد شد`,
          [
            {
              text: "مشاهده قالب‌ها",
              onPress: () => router.back(),
            },
            {
              text: "تخصیص دوباره",
              onPress: () => {
                setStudents((prev) => prev.map((s) => ({ ...s, selected: false })));
                setSelectAll(false);
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert("خطا", error?.message || "تخصیص قالب ناموفق بود");
    } finally {
      setAssigning(false);
    }
  };

  const selectedCount = students.filter((s) => s.selected && !s.existingFee).length;
  const totalAmount = selectedCount * (template?.amount || 0);
  const existingCount = students.filter((s) => s.existingFee).length;

  // Render footer component conditionally
  const renderFooter = () => {
    if (selectedCount > 0) {
      return (
        <View style={styles.footer}>
          <View style={styles.footerSummary}>
            <Text style={styles.footerSummaryText}>
              مجموع مبلغ برای {selectedCount} دانش‌آموز: {formatCurrency(totalAmount)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.assignButton, assigning && styles.assignButtonDisabled]}
            onPress={handleAssign}
            disabled={assigning}
            activeOpacity={0.8}
          >
            {assigning ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.assignButtonText}>تخصیص قالب به {selectedCount} دانش‌آموز</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="تخصیص قالب شهریه" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!template) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="تخصیص قالب شهریه" showBack />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.danger} />
          <Text style={styles.errorText}>قالب یافت نشد</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>بازگشت</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="تخصیص قالب شهریه" showBack />

      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
        ListHeaderComponent={
          <>
            {/* Template Info Card */}
            <View style={styles.templateCard}>
              <Text style={styles.templateClass}>{template.className}</Text>
              <Text style={styles.templateTitle}>{template.feeTitle}</Text>
              <View style={styles.templateDetails}>
                <View style={styles.templateDetail}>
                  <Ionicons name="cash" size={14} color={Colors.success} />
                  <Text style={styles.templateDetailLabel}>مبلغ:</Text>
                  <Text style={styles.templateDetailValue}>{formatCurrency(template.amount)}</Text>
                </View>
                <View style={styles.templateDetail}>
                  <Ionicons name="calendar" size={14} color={Colors.primary} />
                  <Text style={styles.templateDetailLabel}>روز سررسید:</Text>
                  <Text style={styles.templateDetailValue}>روز {template.dueDay} هر ماه</Text>
                </View>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsBar}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{students.length}</Text>
                <Text style={styles.statLabel}>دانش‌آموز</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.warning }]}>{existingCount}</Text>
                <Text style={styles.statLabel}>دارای قالب</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.success }]}>{selectedCount}</Text>
                <Text style={styles.statLabel}>انتخاب شده</Text>
              </View>
            </View>

            {/* Control Bar */}
            <View style={styles.controlBar}>
              <TouchableOpacity style={styles.selectAllBtn} onPress={toggleSelectAll} activeOpacity={0.7}>
                <View style={[styles.checkbox, selectAll && styles.checkboxChecked]}>
                  {selectAll && <Ionicons name="checkmark" size={12} color="white" />}
                </View>
                <Text style={styles.selectAllText}>{selectAll ? "عدم انتخاب همه" : "انتخاب همه"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.previewBtn} onPress={() => setShowPreview(true)} activeOpacity={0.7}>
                <Ionicons name="eye-outline" size={16} color={Colors.primary} />
                <Text style={styles.previewBtnText}>پیش‌نمایش</Text>
              </TouchableOpacity>
            </View>

            {/* Existing Fee Warning */}
            {existingCount > 0 && (
              <View style={styles.warningBox}>
                <Ionicons name="information-circle" size={16} color={Colors.warning} />
                <Text style={styles.warningText}>
                  {existingCount} دانش‌آموز قبلاً این هزینه را دارند و در لیست قابل انتخاب نیستند.
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.studentItem, item.existingFee && styles.studentItemDisabled]}
            onPress={() => !item.existingFee && toggleStudent(item.id)}
            activeOpacity={0.7}
            disabled={item.existingFee}
          >
            <View style={[styles.checkbox, item.selected && styles.checkboxChecked, item.existingFee && styles.checkboxDisabled]}>
              {item.selected && <Ionicons name="checkmark" size={12} color="white" />}
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{item.name}</Text>
              <Text style={styles.studentRoll}>{item.rollNumber}</Text>
            </View>
            {item.existingFee && (
              <View style={styles.existingBadge}>
                <Text style={styles.existingBadgeText}>قبلاً تخصیص یافته</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListFooterComponent={renderFooter}
      />

      {/* Preview Modal */}
      <Modal visible={showPreview} animationType="slide" transparent={true} onRequestClose={() => setShowPreview(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowPreview(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>پیش‌نمایش قالب</Text>
              <View style={{ width: 24 }} />
            </View>
            <View style={styles.modalBody}>
              <View style={styles.previewCard}>
                <Text style={styles.previewClass}>{template.className}</Text>
                <Text style={styles.previewTitle}>{template.feeTitle}</Text>
                <Text style={styles.previewAmount}>{formatCurrency(template.amount)}</Text>
                <Text style={styles.previewPeriod}>هر {template.frequency === "MONTHLY" ? "ماه" : template.frequency === "YEARLY" ? "سال" : "بار"}</Text>
                <Text style={styles.previewDueDay}>سررسید: روز {template.dueDay} هر ماه</Text>
              </View>
              <Text style={styles.previewInfo}>
                با تخصیص این قالب، برای {students.filter(s => !s.existingFee).length} دانش‌آموز قابل تخصیص، هزینه ایجاد خواهد شد.
              </Text>
            </View>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowPreview(false)}>
                <Text style={styles.modalCancelText}>بستن</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={() => setShowPreview(false)}>
                <Text style={styles.modalConfirmText}>متوجه شدم</Text>
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
  errorText: { fontSize: 16, color: Colors.danger, marginTop: 12, marginBottom: 16, fontFamily: "Vazirmatn" },
  retryButton: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  retryButtonText: { color: "white", fontSize: 14, fontFamily: "Vazirmatn" },
  listContent: { padding: 16, paddingBottom: 100 },
  templateCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 16, marginBottom: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  templateClass: { fontSize: 16, fontWeight: "bold", color: Colors.primary, fontFamily: "Vazirmatn", marginBottom: 4 },
  templateTitle: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 10 },
  templateDetails: { flexDirection: "row", gap: 16 },
  templateDetail: { flexDirection: "row", alignItems: "center", gap: 4 },
  templateDetailLabel: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  templateDetailValue: { fontSize: 12, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },
  statsBar: { flexDirection: "row", backgroundColor: Colors.card, borderRadius: 12, padding: 12, marginBottom: 16, justifyContent: "space-around" },
  statItem: { alignItems: "center", flex: 1 },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.border },
  statValue: { fontSize: 18, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn" },
  statLabel: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  controlBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  selectAllBtn: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: Colors.primary, justifyContent: "center", alignItems: "center" },
  checkboxChecked: { backgroundColor: Colors.primary },
  checkboxDisabled: { borderColor: Colors.textSecondary, backgroundColor: `${Colors.textSecondary}20` },
  selectAllText: { fontSize: 13, color: Colors.text, fontFamily: "Vazirmatn" },
  previewBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: `${Colors.primary}15` },
  previewBtnText: { fontSize: 12, color: Colors.primary, fontFamily: "Vazirmatn" },
  warningBox: { flexDirection: "row", backgroundColor: `${Colors.warning}10`, borderRadius: 10, padding: 12, gap: 8, marginBottom: 12, alignItems: "center" },
  warningText: { flex: 1, fontSize: 12, color: Colors.warning, fontFamily: "Vazirmatn", textAlign: "right" },
  studentItem: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, padding: 14, borderRadius: 12, marginBottom: 8, gap: 12 },
  studentItemDisabled: { opacity: 0.5 },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  studentRoll: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  existingBadge: { backgroundColor: `${Colors.warning}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  existingBadgeText: { fontSize: 10, color: Colors.warning, fontFamily: "Vazirmatn" },
  footer: { marginTop: 20, paddingBottom: 20 },
  footerSummary: { backgroundColor: `${Colors.primary}08`, borderRadius: 10, padding: 12, marginBottom: 12, alignItems: "center" },
  footerSummaryText: { fontSize: 13, fontWeight: "500", color: Colors.primary, fontFamily: "Vazirmatn" },
  assignButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.success, borderRadius: 12, paddingVertical: 14, gap: 8 },
  assignButtonDisabled: { opacity: 0.5 },
  assignButtonText: { color: "white", fontSize: 15, fontWeight: "bold", fontFamily: "Vazirmatn" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "white", borderRadius: 20, width: "85%", maxHeight: "70%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: 17, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn" },
  modalBody: { padding: 16, alignItems: "center" },
  previewCard: { backgroundColor: `${Colors.primary}08`, borderRadius: 14, padding: 20, alignItems: "center", width: "100%", marginBottom: 16 },
  previewClass: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 4 },
  previewTitle: { fontSize: 18, fontWeight: "bold", color: Colors.primary, fontFamily: "Vazirmatn", marginBottom: 8 },
  previewAmount: { fontSize: 24, fontWeight: "bold", color: Colors.success, fontFamily: "Vazirmatn", marginBottom: 4 },
  previewPeriod: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 4 },
  previewDueDay: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  previewInfo: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center", lineHeight: 20 },
  modalFooter: { flexDirection: "row", padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, gap: 12 },
  modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.background, alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  modalCancelText: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  modalConfirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.primary, alignItems: "center" },
  modalConfirmText: { fontSize: 14, fontWeight: "500", color: "white", fontFamily: "Vazirmatn" },
});