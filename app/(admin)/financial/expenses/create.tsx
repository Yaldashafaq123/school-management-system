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
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ExpenseCategory {
  id: number;
  name: string;
  description: string | null;
}

export default function CreateExpense() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [formData, setFormData] = useState({
    categoryId: null as number | null,
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    receiptUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const response = await financeApi.getExpenseCategories();
      if (response.success) {
        setCategories(response.data || []);
        if (response.data.length === 0) {
          Alert.alert("اطلاع", "لطفاً ابتدا یک دسته‌بندی هزینه ایجاد کنید", [
            { text: "ایجاد دسته‌بندی", onPress: () => router.push("/(admin)/financial/expenses/categories") },
            { text: "بازگشت", onPress: () => router.back() },
          ]);
        }
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری دسته‌بندی‌ها پیش آمد");
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.categoryId) {
      newErrors.categoryId = "انتخاب دسته‌بندی الزامی است";
    }

    if (!formData.amount) {
      newErrors.amount = "مبلغ الزامی است";
    } else {
      const amountNum = parseFloat(formData.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.amount = "مبلغ باید عددی مثبت باشد";
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = "توضیحات الزامی است";
    } else if (formData.description.trim().length < 3) {
      newErrors.description = "توضیحات باید حداقل ۳ کاراکتر باشد";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await financeApi.createExpense({
        categoryId: formData.categoryId!,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        date: formData.date,
        receiptUrl: formData.receiptUrl.trim() || undefined,
      });

      if (response.success) {
        Alert.alert(
          "موفق",
          "هزینه با موفقیت ثبت شد",
          [
            {
              text: "بازگشت به لیست",
              onPress: () => router.back(),
            },
            {
              text: "ثبت دوباره",
              onPress: () => {
                setFormData({
                  categoryId: null,
                  amount: "",
                  description: "",
                  date: new Date().toISOString().split("T")[0],
                  receiptUrl: "",
                });
                setErrors({});
              },
            },
          ]
        );
      } else {
        Alert.alert("خطا", (response as any).message || "ثبت هزینه ناموفق بود");
      }
    } catch (error: any) {
      Alert.alert("خطا", error?.message || "ثبت هزینه ناموفق بود");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const previewAmount = formData.amount && !isNaN(parseFloat(formData.amount))
    ? formatCurrency(parseFloat(formData.amount))
    : "";
  const isFormValid = formData.categoryId && formData.amount && formData.description.trim().length >= 3;

  if (loadingCategories) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="ثبت هزینه جدید" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="ثبت هزینه جدید" showBack />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              هزینه‌های جاری مدرسه مانند خرید لوازم، تعمیرات، قبوض و سایر مخارج را ثبت کنید
            </Text>
          </View>

          {/* Category Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              دسته‌بندی <Text style={styles.required}>*</Text>
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      formData.categoryId === cat.id && styles.categoryChipActive,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, categoryId: cat.id });
                      if (errors.categoryId) setErrors({ ...errors, categoryId: "" });
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="pricetag"
                      size={14}
                      color={formData.categoryId === cat.id ? "white" : Colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        formData.categoryId === cat.id && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.manageCategoryBtn}
                  onPress={() => router.push("/(admin)/financial/expenses/categories")}
                  activeOpacity={0.7}
                >
                  <Ionicons name="settings-outline" size={14} color={Colors.primary} />
                  <Text style={styles.manageCategoryText}>مدیریت</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId}</Text>}
          </View>

          {/* Selected Category Info */}
          {selectedCategory && selectedCategory.description && (
            <View style={styles.categoryInfo}>
              <Ionicons name="information-circle" size={14} color={Colors.info} />
              <Text style={styles.categoryInfoText}>{selectedCategory.description}</Text>
            </View>
          )}

          {/* Amount */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              مبلغ (افغانی) <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.amountContainer}>
              <TextInput
                style={[styles.amountInput, errors.amount ? styles.inputError : null]}
                value={formData.amount}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9.]/g, '');
                  const parts = cleaned.split('.');
                  const sanitized = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
                  setFormData({ ...formData, amount: sanitized });
                  if (errors.amount) setErrors({ ...errors, amount: "" });
                }}
                keyboardType="decimal-pad"
                placeholder="۰"
                placeholderTextColor={Colors.textSecondary}
                textAlign="center"
              />
              <Text style={styles.currencyUnit}>AFN</Text>
            </View>
            {errors.amount ? (
              <Text style={styles.errorText}>{errors.amount}</Text>
            ) : previewAmount ? (
              <View style={styles.previewContainer}>
                <Ionicons name="eye-outline" size={14} color={Colors.danger} />
                <Text style={styles.previewText}>{previewAmount}</Text>
              </View>
            ) : null}
          </View>

          {/* Quick Amounts */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>مبالغ پیشنهادی</Text>
            <View style={styles.quickAmounts}>
              {[100, 500, 1000, 2000, 5000, 10000].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[styles.quickAmountBtn, formData.amount === amount.toString() && styles.quickAmountBtnActive]}
                  onPress={() => {
                    setFormData({ ...formData, amount: amount.toString() });
                    if (errors.amount) setErrors({ ...errors, amount: "" });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.quickAmountText, formData.amount === amount.toString() && styles.quickAmountTextActive]}>
                    {formatCurrency(amount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>
              توضیحات <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textArea, errors.description ? styles.inputError : null]}
              value={formData.description}
              onChangeText={(text) => {
                setFormData({ ...formData, description: text });
                if (errors.description) setErrors({ ...errors, description: "" });
              }}
              placeholder="شرح کامل هزینه را وارد کنید..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              textAlign="right"
              maxLength={500}
            />
            {errors.description ? (
              <Text style={styles.errorText}>{errors.description}</Text>
            ) : (
              <Text style={styles.charCount}>{formData.description.length}/۵۰۰</Text>
            )}
          </View>

          {/* Date */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>تاریخ</Text>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.dateInput}
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textSecondary}
                textAlign="right"
              />
            </View>
            <Text style={styles.dateHint}>تاریخ امروز به صورت پیش‌فرض ثبت می‌شود</Text>
          </View>

          {/* Receipt URL */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>لینک رسید (اختیاری)</Text>
            <View style={styles.receiptContainer}>
              <Ionicons name="link" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.receiptInput}
                value={formData.receiptUrl}
                onChangeText={(text) => setFormData({ ...formData, receiptUrl: text })}
                placeholder="آدرس فایل یا عکس رسید"
                placeholderTextColor={Colors.textSecondary}
                textAlign="right"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, (!isFormValid || loading) && styles.submitButtonDisabled]}
            onPress={handleCreate}
            disabled={!isFormValid || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="white" />
                <Text style={styles.submitButtonText}>ثبت هزینه</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  keyboardAvoid: { flex: 1 },
  content: { flex: 1, padding: 16 },
  footer: { height: 30 },
  
  infoBanner: { flexDirection: "row", backgroundColor: `${Colors.primary}10`, borderRadius: 12, padding: 12, marginBottom: 20, gap: 10, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn", lineHeight: 20, textAlign: "right" },
  
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 8, textAlign: "right" },
  required: { color: Colors.danger },
  
  categoryContainer: { flexDirection: "row", gap: 8, alignItems: "center" },
  categoryChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, gap: 6 },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryChipText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  categoryChipTextActive: { color: "white" },
  manageCategoryBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 20, backgroundColor: `${Colors.primary}15`, gap: 4 },
  manageCategoryText: { fontSize: 12, color: Colors.primary, fontFamily: "Vazirmatn" },
  
  categoryInfo: { flexDirection: "row", alignItems: "center", backgroundColor: `${Colors.info}10`, borderRadius: 8, padding: 10, marginBottom: 16, gap: 8 },
  categoryInfoText: { flex: 1, fontSize: 12, color: Colors.info, fontFamily: "Vazirmatn", textAlign: "right" },
  
  amountContainer: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, overflow: "hidden" },
  amountInput: { flex: 1, padding: 14, fontSize: 18, fontWeight: "bold", color: Colors.text, textAlign: "center", fontFamily: "Vazirmatn" },
  currencyUnit: { paddingHorizontal: 12, fontSize: 14, color: Colors.textSecondary, backgroundColor: Colors.background, textAlignVertical: "center", paddingVertical: 14 },
  inputError: { borderColor: Colors.danger },
  errorText: { fontSize: 12, color: Colors.danger, fontFamily: "Vazirmatn", marginTop: 6, textAlign: "right" },
  
  previewContainer: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 6, marginTop: 6 },
  previewText: { fontSize: 13, fontWeight: "500", color: Colors.danger, fontFamily: "Vazirmatn" },
  
  quickAmounts: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickAmountBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  quickAmountBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  quickAmountText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  quickAmountTextActive: { color: "white" },
  
  textArea: { backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, padding: 14, fontSize: 14, color: Colors.text, textAlignVertical: "top", textAlign: "right", fontFamily: "Vazirmatn", minHeight: 100 },
  charCount: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "right", marginTop: 6 },
  
  dateContainer: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, gap: 8 },
  dateInput: { flex: 1, paddingVertical: 14, fontSize: 14, color: Colors.text, fontFamily: "Vazirmatn", textAlign: "right" },
  dateHint: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginTop: 6, textAlign: "right" },
  
  receiptContainer: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, gap: 8 },
  receiptInput: { flex: 1, paddingVertical: 14, fontSize: 14, color: Colors.text, fontFamily: "Vazirmatn", textAlign: "right" },
  
  submitButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, gap: 8, marginTop: 10 },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: "white", fontSize: 16, fontWeight: "bold", fontFamily: "Vazirmatn" },
});