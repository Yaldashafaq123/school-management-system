import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency, PERSIAN_MONTHS } from "@/src/config/financeApi";
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

export default function GenerateSalaries() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [overtimeHours, setOvertimeHours] = useState("");
  const [bonusAmount, setBonusAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedMonth) newErrors.month = "لطفاً ماه را انتخاب کنید";
    if (!selectedYear) newErrors.year = "لطفاً سال را انتخاب کنید";
    if (overtimeHours && (isNaN(parseFloat(overtimeHours)) || parseFloat(overtimeHours) <= 0)) {
      newErrors.overtime = "ساعات اضافه‌کار باید عددی مثبت باشد";
    }
    if (bonusAmount && (isNaN(parseFloat(bonusAmount)) || parseFloat(bonusAmount) <= 0)) {
      newErrors.bonus = "مبلغ پاداش باید عددی مثبت باشد";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    Alert.alert(
      "تایید ایجاد معاش",
      `آیا از ایجاد معاش برای ${PERSIAN_MONTHS[selectedMonth - 1]} ${selectedYear} اطمینان دارید؟\n\nمعاش برای تمام معلمینی که حقوق پایه دارند ایجاد خواهد شد.`,
      [
        { text: "انصراف", style: "cancel" },
        {
          text: "تایید",
          onPress: async () => {
            setLoading(true);
            try {
              const response = await financeApi.generateMonthlySalaries({
                month: selectedMonth,
                year: selectedYear,
                overtimeHours: overtimeHours ? parseFloat(overtimeHours) : undefined,
                bonusAmount: bonusAmount ? parseFloat(bonusAmount) : undefined,
              });

              if (response.success) {
                const createdCount = response.data?.created?.length || response.count || 0;
                const skippedCount = response.data?.skipped?.length || 0;

                Alert.alert(
                  "موفق",
                  `${createdCount} معاش با موفقیت ایجاد شد${skippedCount > 0 ? `\n${skippedCount} معلم قبلاً معاش داشتند` : ""}`,
                  [
                    {
                      text: "مشاهده لیست",
                      onPress: () => router.back(),
                    },
                    {
                      text: "ایجاد دوباره",
                      onPress: () => {
                        setOvertimeHours("");
                        setBonusAmount("");
                      },
                    },
                  ]
                );
              } else {
                Alert.alert("خطا", (response as any).message || "ایجاد معاش ناموفق بود");
              }
            } catch (error: any) {
              Alert.alert("خطا", error?.message || "ایجاد معاش ماهیانه ناموفق بود");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="ایجاد معاش ماهیانه" showBack />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              با انتخاب ماه و سال، معاش برای تمام معلمینی که حقوق پایه دارند ایجاد می‌شود.
              معلمینی که قبلاً برای این ماه معاش دارند، نادیده گرفته می‌شوند.
            </Text>
          </View>

          {/* Month Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              انتخاب ماه <Text style={styles.required}>*</Text>
            </Text>
            {errors.month && <Text style={styles.errorText}>{errors.month}</Text>}
            <View style={styles.monthsGrid}>
              {PERSIAN_MONTHS.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.monthButton, selectedMonth === index + 1 && styles.monthButtonActive]}
                  onPress={() => {
                    setSelectedMonth(index + 1);
                    if (errors.month) setErrors({ ...errors, month: "" });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.monthText, selectedMonth === index + 1 && styles.monthTextActive]}>
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Year Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              انتخاب سال <Text style={styles.required}>*</Text>
            </Text>
            {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
            <View style={styles.yearsRow}>
              {[1402, 1403, 1404, 1405, 1406].map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[styles.yearButton, selectedYear === year && styles.yearButtonActive]}
                  onPress={() => {
                    setSelectedYear(year);
                    if (errors.year) setErrors({ ...errors, year: "" });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.yearText, selectedYear === year && styles.yearTextActive]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Optional Fields */}
          <Text style={styles.optionalTitle}>موارد اختیاری</Text>

          {/* Overtime Hours */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ساعات اضافه‌کار</Text>
            <TextInput
              style={[styles.input, errors.overtime ? styles.inputError : null]}
              value={overtimeHours}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, '');
                setOvertimeHours(cleaned);
                if (errors.overtime) setErrors({ ...errors, overtime: "" });
              }}
              keyboardType="decimal-pad"
              placeholder="مثال: ۱۰"
              placeholderTextColor={Colors.textSecondary}
              textAlign="center"
            />
            {errors.overtime && <Text style={styles.errorText}>{errors.overtime}</Text>}
            <Text style={styles.hintText}>ساعات اضافه‌کار برای همه معلمین اعمال می‌شود</Text>
          </View>

          {/* Bonus Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>مبلغ پاداش (افغانی)</Text>
            <TextInput
              style={[styles.input, errors.bonus ? styles.inputError : null]}
              value={bonusAmount}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9.]/g, '');
                setBonusAmount(cleaned);
                if (errors.bonus) setErrors({ ...errors, bonus: "" });
              }}
              keyboardType="decimal-pad"
              placeholder="مثال: ۲۰۰۰"
              placeholderTextColor={Colors.textSecondary}
              textAlign="center"
            />
            {errors.bonus && <Text style={styles.errorText}>{errors.bonus}</Text>}
            {bonusAmount && !isNaN(parseFloat(bonusAmount)) && (
              <Text style={styles.previewText}>{formatCurrency(parseFloat(bonusAmount))}</Text>
            )}
          </View>

          {/* Summary */}
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Ionicons name="calendar" size={16} color={Colors.primary} />
              <Text style={styles.summaryLabel}>دوره:</Text>
              <Text style={styles.summaryValue}>
                {PERSIAN_MONTHS[selectedMonth - 1]} {selectedYear}
              </Text>
            </View>
            {overtimeHours && parseFloat(overtimeHours) > 0 && (
              <View style={styles.summaryRow}>
                <Ionicons name="time" size={16} color={Colors.warning} />
                <Text style={styles.summaryLabel}>اضافه‌کار:</Text>
                <Text style={styles.summaryValue}>{overtimeHours} ساعت</Text>
              </View>
            )}
            {bonusAmount && parseFloat(bonusAmount) > 0 && (
              <View style={styles.summaryRow}>
                <Ionicons name="gift" size={16} color={Colors.success} />
                <Text style={styles.summaryLabel}>پاداش:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(parseFloat(bonusAmount))}</Text>
              </View>
            )}
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[styles.generateButton, loading && styles.generateButtonDisabled]}
            onPress={handleGenerate}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="white" />
                <Text style={styles.generateButtonText}>ایجاد معاش ماهیانه</Text>
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
  keyboardAvoid: { flex: 1 },
  content: { flex: 1, padding: 16 },
  
  infoBanner: { flexDirection: "row", backgroundColor: `${Colors.primary}10`, borderRadius: 12, padding: 12, marginBottom: 20, gap: 10, alignItems: "flex-start" },
  infoText: { flex: 1, fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn", lineHeight: 20, textAlign: "right" },
  
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 10, textAlign: "right" },
  required: { color: Colors.danger },
  errorText: { fontSize: 12, color: Colors.danger, fontFamily: "Vazirmatn", marginBottom: 6, textAlign: "right" },
  hintText: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center", marginTop: 6 },
  previewText: { fontSize: 13, color: Colors.primary, fontFamily: "Vazirmatn", textAlign: "center", marginTop: 6, fontWeight: "500" },
  
  monthsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  monthButton: { width: "23%", paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center" },
  monthButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  monthText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  monthTextActive: { color: "white", fontWeight: "600" },
  
  yearsRow: { flexDirection: "row", gap: 8 },
  yearButton: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border, alignItems: "center" },
  yearButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  yearText: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  yearTextActive: { color: "white", fontWeight: "600" },
  
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },
  optionalTitle: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 16, textAlign: "right" },
  
  input: { backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn" },
  inputError: { borderColor: Colors.danger },
  
  summaryBox: { backgroundColor: `${Colors.primary}08`, borderRadius: 10, padding: 14, marginBottom: 20, gap: 8 },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryLabel: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  summaryValue: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn" },
  
  generateButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, gap: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  generateButtonDisabled: { opacity: 0.5, shadowOpacity: 0, elevation: 0 },
  generateButtonText: { color: "white", fontSize: 16, fontWeight: "bold", fontFamily: "Vazirmatn" },
});