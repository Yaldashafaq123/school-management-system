import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency, FeeTemplate } from "@/src/config/financeApi";
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

interface TemplateData {
  id: number;
  classId: number;
  className: string;
  feeCategoryId: number;
  feeTitle: string;
  amount: number;
  frequency: string;
  dueDay: number;
  isActive: boolean;
  assignedStudents: number;
}

const FREQUENCY_OPTIONS = [
  { value: "MONTHLY", label: "ماهانه", icon: "repeat", color: Colors.primary },
  { value: "YEARLY", label: "سالانه", icon: "calendar", color: Colors.warning },
  { value: "ONE_TIME", label: "یکباره", icon: "flash", color: Colors.success },
];

export default function EditFeeTemplate() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [formData, setFormData] = useState({
    amount: "",
    frequency: "MONTHLY",
    dueDay: "10",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadTemplate = useCallback(async () => {
    try {
      const response = await financeApi.getFeeTemplateById(parseInt(id));
      if (response.success) {
        const data = response.data as FeeTemplate;
        // Transform API data to match TemplateData interface with fallback for assignedStudents
        const templateData: TemplateData = {
          id: data.id,
          classId: data.classId,
          className: data.className,
          feeCategoryId: data.feeCategoryId,
          feeTitle: data.feeTitle,
          amount: data.amount,
          frequency: data.frequency,
          dueDay: data.dueDay,
          isActive: data.isActive,
          assignedStudents: data.assignedStudents || 0,
        };
        setTemplate(templateData);
        setFormData({
          amount: data.amount.toString(),
          frequency: data.frequency,
          dueDay: data.dueDay.toString(),
          isActive: data.isActive,
        });
      } else {
        Alert.alert("خطا", "قالب مورد نظر یافت نشد");
        router.back();
      }
    } catch (error) {
      console.error("Error loading template:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری قالب پیش آمد");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadTemplate();
  }, [loadTemplate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount) {
      newErrors.amount = "مبلغ الزامی است";
    } else {
      const amountNum = parseFloat(formData.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.amount = "مبلغ باید عددی مثبت باشد";
      }
    }

    const dueDayNum = parseInt(formData.dueDay);
    if (isNaN(dueDayNum) || dueDayNum < 1 || dueDayNum > 31) {
      newErrors.dueDay = "روز سررسید باید بین 1 تا 31 باشد";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await financeApi.updateFeeTemplate(parseInt(id), {
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        dueDay: parseInt(formData.dueDay),
        isActive: formData.isActive,
      });

      Alert.alert(
        "موفق",
        `قالب "${template?.feeTitle}" برای ${template?.className} با موفقیت بروزرسانی شد`,
        [
          {
            text: "بازگشت به لیست",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("خطا", error?.message || "بروزرسانی قالب ناموفق بود");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "حذف قالب",
      `آیا از حذف قالب "${template?.feeTitle}" برای ${template?.className} مطمئن هستید؟`,
      [
        { text: "انصراف", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            setSaving(true);
            try {
              await financeApi.deleteFeeTemplate(parseInt(id));
              Alert.alert("موفق", "قالب با موفقیت حذف شد");
              router.back();
            } catch (error: any) {
              Alert.alert("خطا", error?.message || "حذف قالب ناموفق بود");
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="ویرایش قالب شهریه" showBack />
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
        <Header title="ویرایش قالب شهریه" showBack />
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
      <Header 
        title="ویرایش قالب شهریه" 
        showBack 
        rightComponent={
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={22} color={Colors.danger} />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Template Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>صنف:</Text>
              <Text style={styles.infoValue}>{template.className}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>نوع هزینه:</Text>
              <Text style={styles.infoValue}>{template.feeTitle}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>تخصیص داده شده به:</Text>
              <Text style={styles.infoValue}>{template.assignedStudents} دانش‌آموز</Text>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>مبلغ (افغانی) <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.amountInput, errors.amount ? styles.inputError : null]}
              value={formData.amount}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, '');
                setFormData({ ...formData, amount: cleaned });
                if (errors.amount) setErrors({ ...errors, amount: "" });
              }}
              keyboardType="decimal-pad"
              placeholder="مبلغ را وارد کنید"
              placeholderTextColor={Colors.textSecondary}
              textAlign="center"
            />
            {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
            {formData.amount && !errors.amount && (
              <Text style={styles.previewText}>{formatCurrency(parseFloat(formData.amount))}</Text>
            )}
          </View>

          {/* Frequency */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>دوره پرداخت</Text>
            <View style={styles.frequencyGrid}>
              {FREQUENCY_OPTIONS.map((freq) => (
                <TouchableOpacity
                  key={freq.value}
                  style={[
                    styles.frequencyCard,
                    formData.frequency === freq.value && { borderColor: freq.color, backgroundColor: `${freq.color}10` },
                  ]}
                  onPress={() => setFormData({ ...formData, frequency: freq.value })}
                  activeOpacity={0.7}
                >
                  <Ionicons name={freq.icon as any} size={24} color={formData.frequency === freq.value ? freq.color : Colors.textSecondary} />
                  <Text style={[styles.frequencyLabel, formData.frequency === freq.value && { color: freq.color, fontWeight: "600" }]}>
                    {freq.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Due Day */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>روز سررسید ماهانه <Text style={styles.required}>*</Text></Text>
            <View style={styles.dueDayContainer}>
              <TextInput
                style={[styles.dueDayInput, errors.dueDay ? styles.inputError : null]}
                value={formData.dueDay}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setFormData({ ...formData, dueDay: cleaned });
                  if (errors.dueDay) setErrors({ ...errors, dueDay: "" });
                }}
                keyboardType="number-pad"
                placeholder="10"
                placeholderTextColor={Colors.textSecondary}
                textAlign="center"
              />
              <Text style={styles.dueDaySuffix}>هر ماه</Text>
            </View>
            {errors.dueDay && <Text style={styles.errorText}>{errors.dueDay}</Text>}
          </View>

          {/* Active Status */}
          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <View style={[styles.statusDot, { backgroundColor: formData.isActive ? Colors.success : Colors.danger }]} />
                <View>
                  <Text style={styles.switchLabel}>{formData.isActive ? "قالب فعال" : "قالب غیرفعال"}</Text>
                  <Text style={styles.switchDesc}>
                    {formData.isActive ? "قالب فعال است و می‌تواند تخصیص داده شود" : "قالب غیرفعال است و در لیست نمایش داده نمی‌شود"}
                  </Text>
                </View>
              </View>
              <Switch
                value={formData.isActive}
                onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                trackColor={{ false: Colors.border, true: `${Colors.success}50` }}
                thumbColor={formData.isActive ? Colors.success : "#f4f3f4"}
              />
            </View>
          </View>

          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>خلاصه قالب</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>صنف:</Text>
              <Text style={styles.summaryValue}>{template.className}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>نوع هزینه:</Text>
              <Text style={styles.summaryValue}>{template.feeTitle}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>مبلغ:</Text>
              <Text style={[styles.summaryValue, { color: Colors.success, fontWeight: "bold" }]}>
                {formatCurrency(parseFloat(formData.amount) || 0)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>دوره:</Text>
              <Text style={styles.summaryValue}>{FREQUENCY_OPTIONS.find(f => f.value === formData.frequency)?.label}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>روز سررسید:</Text>
              <Text style={styles.summaryValue}>روز {formData.dueDay} هر ماه</Text>
            </View>
          </View>

          {/* Update Button */}
          <TouchableOpacity
            style={[styles.updateButton, (!formData.amount || saving) && styles.updateButtonDisabled]}
            onPress={handleUpdate}
            disabled={!formData.amount || saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="save-outline" size={22} color="white" />
                <Text style={styles.updateButtonText}>ذخیره تغییرات</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoid: { flex: 1 },
  content: { flex: 1, padding: 16 },
  deleteBtn: { padding: 4 },
  
  infoCard: { backgroundColor: `${Colors.primary}08`, borderRadius: 12, padding: 16, marginBottom: 20 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  infoLabel: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  infoValue: { fontSize: 13, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },
  
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 8, textAlign: "right" },
  required: { color: Colors.danger },
  
  amountInput: { backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: 18, fontWeight: "bold", color: Colors.text, textAlign: "center", fontFamily: "Vazirmatn" },
  inputError: { borderColor: Colors.danger },
  previewText: { fontSize: 13, color: Colors.primary, fontFamily: "Vazirmatn", marginTop: 6, textAlign: "center" },
  
  frequencyGrid: { flexDirection: "row", gap: 10 },
  frequencyCard: { flex: 1, alignItems: "center", padding: 12, borderRadius: 12, borderWidth: 2, borderColor: Colors.border, backgroundColor: Colors.card, gap: 8 },
  frequencyLabel: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  dueDayContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  dueDayInput: { flex: 1, backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: 16, textAlign: "center", fontFamily: "Vazirmatn" },
  dueDaySuffix: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: Colors.card, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  switchInfo: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  switchLabel: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },
  switchDesc: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginTop: 2 },
  
  summaryCard: { backgroundColor: `${Colors.primary}08`, borderRadius: 12, padding: 16, marginBottom: 20 },
  summaryTitle: { fontSize: 15, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 12, textAlign: "center" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  summaryValue: { fontSize: 13, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },
  
  updateButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, gap: 8, marginTop: 10 },
  updateButtonDisabled: { opacity: 0.5 },
  updateButtonText: { color: "white", fontSize: 16, fontWeight: "bold", fontFamily: "Vazirmatn" },
});