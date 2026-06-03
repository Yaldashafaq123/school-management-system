import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import {
  FeeCategory as ApiFeeCategory,
  financeApi,
  formatCurrency,
} from "@/src/config/financeApi";
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
  Switch,
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

interface FeeCategory {
  id: number;
  title: string;
  amount: number;
  isRecurring: boolean;
}

const FREQUENCY_OPTIONS = [
  { value: "MONTHLY", label: "ماهانه", icon: "repeat", color: Colors.primary },
  { value: "YEARLY", label: "سالانه", icon: "calendar", color: Colors.warning },
  { value: "ONE_TIME", label: "یکباره", icon: "flash", color: Colors.success },
];

export default function CreateFeeTemplate() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [feeCategories, setFeeCategories] = useState<FeeCategory[]>([]);

  const [formData, setFormData] = useState({
    classId: null as number | null,
    feeCategoryId: null as number | null,
    amount: "",
    frequency: "MONTHLY",
    dueDay: "10",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    try {
      const [classesRes, categoriesRes] = await Promise.all([
        financeApi.getClassesList(),
        financeApi.getFeeCategories(),
      ]);

      if (classesRes.success) {
        setClasses(classesRes.data || []);
      }
      if (categoriesRes.success) {
        // Transform API FeeCategory to local FeeCategory with default for isRecurring
        const transformedCategories: FeeCategory[] = (
          categoriesRes.data || []
        ).map((cat: ApiFeeCategory) => ({
          id: cat.id,
          title: cat.title,
          amount: cat.amount,
          isRecurring: cat.isRecurring || false,
        }));
        setFeeCategories(transformedCategories);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری اطلاعات پیش آمد");
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedCategory = feeCategories.find(
    (c) => c.id === formData.feeCategoryId,
  );
  const selectedClass = classes.find((c) => c.id === formData.classId);

  // Auto-populate amount when category is selected
  useEffect(() => {
    if (selectedCategory && selectedCategory.amount > 0) {
      setFormData((prev) => ({
        ...prev,
        amount: selectedCategory.amount.toString(),
      }));
    }
  }, [selectedCategory]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.classId) newErrors.classId = "انتخاب صنف الزامی است";
    if (!formData.feeCategoryId)
      newErrors.feeCategoryId = "انتخاب نوع هزینه الزامی است";

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

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await financeApi.createFeeTemplate({
        classId: formData.classId!,
        feeCategoryId: formData.feeCategoryId!,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        dueDay: parseInt(formData.dueDay),
        isActive: formData.isActive,
      });

      Alert.alert(
        "موفق",
        `قالب شهریه برای ${selectedClass?.name} با موفقیت ایجاد شد`,
        [
          {
            text: "مشاهده قالب‌ها",
            onPress: () => router.back(),
          },
          {
            text: "ایجاد دوباره",
            onPress: () => {
              setFormData({
                classId: null,
                feeCategoryId: null,
                amount: "",
                frequency: "MONTHLY",
                dueDay: "10",
                isActive: true,
              });
              setErrors({});
            },
          },
        ],
      );
    } catch (error: any) {
      Alert.alert("خطا", error?.message || "ایجاد قالب ناموفق بود");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.classId &&
    formData.feeCategoryId &&
    formData.amount &&
    parseFloat(formData.amount) > 0;

  if (loadingData) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="ایجاد قالب شهریه" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* <Header title="ایجاد قالب شهریه" showBack /> */}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons
              name="information-circle"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.infoText}>
              قالب شهریه به شما امکان می‌دهد هزینه‌های دوره‌ای را برای یک صنف
              تعریف کنید. پس از ایجاد قالب، می‌توانید آن را به دانش‌آموزان آن
              صنف تخصیص دهید.
            </Text>
          </View>

          {/* Class Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              انتخاب صنف <Text style={styles.required}>*</Text>
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {classes.map((cls) => (
                  <TouchableOpacity
                    key={cls.id}
                    style={[
                      styles.chip,
                      formData.classId === cls.id && styles.chipActive,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, classId: cls.id });
                      if (errors.classId) setErrors({ ...errors, classId: "" });
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="school"
                      size={14}
                      color={
                        formData.classId === cls.id
                          ? "white"
                          : Colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.chipText,
                        formData.classId === cls.id && styles.chipTextActive,
                      ]}
                    >
                      {cls.name} {cls.section || ""}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            {errors.classId && (
              <Text style={styles.errorText}>{errors.classId}</Text>
            )}
          </View>

          {/* Fee Category Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              نوع هزینه <Text style={styles.required}>*</Text>
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {feeCategories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.chip,
                      styles.categoryChip,
                      formData.feeCategoryId === cat.id && styles.chipActive,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, feeCategoryId: cat.id });
                      if (errors.feeCategoryId)
                        setErrors({ ...errors, feeCategoryId: "" });
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="pricetag"
                      size={14}
                      color={
                        formData.feeCategoryId === cat.id
                          ? "white"
                          : Colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.chipText,
                        formData.feeCategoryId === cat.id &&
                          styles.chipTextActive,
                      ]}
                    >
                      {cat.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            {errors.feeCategoryId && (
              <Text style={styles.errorText}>{errors.feeCategoryId}</Text>
            )}
          </View>

          {/* Selected Category Info */}
          {selectedCategory && (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedInfoText}>
                مبلغ پیش‌فرض: {formatCurrency(selectedCategory.amount)}
              </Text>
            </View>
          )}

          {/* Amount */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              مبلغ (افغانی) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.amountInput,
                errors.amount ? styles.inputError : null,
              ]}
              value={formData.amount}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, "");
                setFormData({ ...formData, amount: cleaned });
                if (errors.amount) setErrors({ ...errors, amount: "" });
              }}
              keyboardType="decimal-pad"
              placeholder="مبلغ را وارد کنید"
              placeholderTextColor={Colors.textSecondary}
              textAlign="center"
            />
            {errors.amount && (
              <Text style={styles.errorText}>{errors.amount}</Text>
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
                    formData.frequency === freq.value && {
                      borderColor: freq.color,
                      backgroundColor: `${freq.color}10`,
                    },
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, frequency: freq.value })
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={freq.icon as any}
                    size={24}
                    color={
                      formData.frequency === freq.value
                        ? freq.color
                        : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.frequencyLabel,
                      formData.frequency === freq.value && {
                        color: freq.color,
                        fontWeight: "600",
                      },
                    ]}
                  >
                    {freq.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Due Day */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              روز سررسید ماهانه <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.dueDayContainer}>
              <TextInput
                style={[
                  styles.dueDayInput,
                  errors.dueDay ? styles.inputError : null,
                ]}
                value={formData.dueDay}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, "");
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
            {errors.dueDay && (
              <Text style={styles.errorText}>{errors.dueDay}</Text>
            )}
            <Text style={styles.hintText}>
              مثال: 10 یعنی هر ماه در تاریخ 10
            </Text>
          </View>

          {/* Active Status */}
          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: formData.isActive
                        ? Colors.success
                        : Colors.danger,
                    },
                  ]}
                />
                <View>
                  <Text style={styles.switchLabel}>
                    {formData.isActive ? "قالب فعال" : "قالب غیرفعال"}
                  </Text>
                  <Text style={styles.switchDesc}>
                    {formData.isActive
                      ? "قالب فعال است و می‌تواند تخصیص داده شود"
                      : "قالب غیرفعال است و در لیست نمایش داده نمی‌شود"}
                  </Text>
                </View>
              </View>
              <Switch
                value={formData.isActive}
                onValueChange={(value) =>
                  setFormData({ ...formData, isActive: value })
                }
                trackColor={{
                  false: Colors.border,
                  true: `${Colors.success}50`,
                }}
                thumbColor={formData.isActive ? Colors.success : "#f4f3f4"}
              />
            </View>
          </View>

          {/* Summary */}
          {selectedClass && selectedCategory && isFormValid && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>خلاصه قالب</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>صنف:</Text>
                <Text style={styles.summaryValue}>
                  {selectedClass.name} {selectedClass.section || ""}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>نوع هزینه:</Text>
                <Text style={styles.summaryValue}>
                  {selectedCategory.title}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>مبلغ:</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: Colors.success, fontWeight: "bold" },
                  ]}
                >
                  {formatCurrency(parseFloat(formData.amount))}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>دوره:</Text>
                <Text style={styles.summaryValue}>
                  {
                    FREQUENCY_OPTIONS.find(
                      (f) => f.value === formData.frequency,
                    )?.label
                  }
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>روز سررسید:</Text>
                <Text style={styles.summaryValue}>
                  روز {formData.dueDay} هر ماه
                </Text>
              </View>
            </View>
          )}

          {/* Create Button */}
          <TouchableOpacity
            style={[
              styles.createButton,
              (!isFormValid || loading) && styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={!isFormValid || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="white" />
                <Text style={styles.createButtonText}>ایجاد قالب شهریه</Text>
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  keyboardAvoid: { flex: 1 },
  content: { flex: 1, padding: 16 },
  infoBanner: {
    flexDirection: "row",
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 10,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    lineHeight: 20,
    textAlign: "right",
  },
  formGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    marginBottom: 8,
    textAlign: "right",
  },
  required: { color: Colors.danger },
  chipContainer: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  chipTextActive: { color: "white" },
  categoryChip: { backgroundColor: Colors.background },
  selectedInfo: {
    backgroundColor: `${Colors.success}10`,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    alignItems: "center",
  },
  selectedInfoText: {
    fontSize: 12,
    color: Colors.success,
    fontFamily: "Vazirmatn",
  },
  amountInput: {
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    fontFamily: "Vazirmatn",
  },
  inputError: { borderColor: Colors.danger },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    fontFamily: "Vazirmatn",
    marginTop: 6,
    textAlign: "right",
  },
  frequencyGrid: { flexDirection: "row", gap: 10 },
  frequencyCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    gap: 8,
  },
  frequencyLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  dueDayContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  dueDayInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Vazirmatn",
  },
  dueDaySuffix: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  hintText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    marginTop: 6,
    textAlign: "right",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  switchInfo: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    fontFamily: "Vazirmatn",
  },
  switchDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: `${Colors.primary}08`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    marginBottom: 12,
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text,
    fontFamily: "Vazirmatn",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginTop: 10,
  },
  createButtonDisabled: { opacity: 0.5 },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Vazirmatn",
  },
});
