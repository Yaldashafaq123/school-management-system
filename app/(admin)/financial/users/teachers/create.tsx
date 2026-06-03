import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { userApi } from "@/src/config/financeApi";
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
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateTeacher() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    baseSalary: "",
    hourlyRate: "",
    overtimeRate: "",
    experience: "",
    certification: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "نام و نام خانوادگی الزامی است";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "نام باید حداقل ۳ کاراکتر باشد";
    }

    if (!formData.email.trim()) {
      newErrors.email = "ایمیل الزامی است";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "ایمیل معتبر نیست";
    }

    if (!formData.password) {
      newErrors.password = "رمز عبور الزامی است";
    } else if (formData.password.length < 6) {
      newErrors.password = "رمز عبور باید حداقل ۶ کاراکتر باشد";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "رمز عبور با تکرار آن مطابقت ندارد";
    }

    const baseSalary = parseFloat(formData.baseSalary);
    const hourlyRate = parseFloat(formData.hourlyRate);
    if ((!baseSalary || baseSalary <= 0) && (!hourlyRate || hourlyRate <= 0)) {
      newErrors.salary = "حداقل یکی از مقادیر حقوق پایه یا ساعتی الزامی است";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Register the user
      const registerResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: "TEACHER",
          phone: formData.phone.trim() || undefined,
        }),
      });

      const registerData = await registerResponse.json();
      if (!registerResponse.ok) {
        throw new Error(registerData.message || "ثبت‌نام معلم ناموفق بود");
      }

      const userId = registerData.user?.id;
      if (!userId) {
        throw new Error("شناسه کاربر دریافت نشد");
      }

      // Update teacher profile
      await userApi.updateTeacherProfile(userId, {
        baseSalary: formData.baseSalary ? parseFloat(formData.baseSalary) : undefined,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        overtimeRate: formData.overtimeRate ? parseFloat(formData.overtimeRate) : undefined,
        experience: formData.experience || undefined,
        certification: formData.certification || undefined,
        isActive: formData.isActive,
      });

      Alert.alert(
        "موفق",
        `معلم ${formData.fullName} با موفقیت ایجاد شد`,
        [
          { text: "بازگشت به لیست", onPress: () => router.back() },
          { text: "ایجاد دوباره", onPress: () => {
            setFormData({
              fullName: "", email: "", password: "", confirmPassword: "", phone: "",
              baseSalary: "", hourlyRate: "", overtimeRate: "", experience: "", certification: "", isActive: true,
            });
            setErrors({});
          }},
        ]
      );
    } catch (error: any) {
      Alert.alert("خطا", error?.message || "ایجاد معلم ناموفق بود");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.fullName.trim().length >= 3 && formData.email.trim() && formData.password.length >= 6 && formData.password === formData.confirmPassword;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="افزودن معلم جدید" showBack />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>ایمیل و رمز عبور برای ورود معلم به سیستم استفاده می‌شود</Text>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اطلاعات پایه</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>نام و نام خانوادگی <Text style={styles.required}>*</Text></Text>
              <TextInput style={[styles.input, errors.fullName ? styles.inputError : null]} value={formData.fullName} onChangeText={(text) => { setFormData({ ...formData, fullName: text }); if (errors.fullName) setErrors({ ...errors, fullName: "" }); }} placeholder="نام کامل" placeholderTextColor={Colors.textSecondary} textAlign="right" />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>ایمیل <Text style={styles.required}>*</Text></Text>
              <TextInput style={[styles.input, errors.email ? styles.inputError : null]} value={formData.email} onChangeText={(text) => { setFormData({ ...formData, email: text }); if (errors.email) setErrors({ ...errors, email: "" }); }} placeholder="example@email.com" placeholderTextColor={Colors.textSecondary} keyboardType="email-address" autoCapitalize="none" textAlign="right" />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>رمز عبور <Text style={styles.required}>*</Text></Text>
              <View style={[styles.passwordContainer, errors.password ? styles.inputError : null]}>
                <TextInput style={styles.passwordInput} value={formData.password} onChangeText={(text) => { setFormData({ ...formData, password: text }); if (errors.password) setErrors({ ...errors, password: "" }); }} placeholder="حداقل ۶ کاراکتر" placeholderTextColor={Colors.textSecondary} secureTextEntry={!showPassword} textAlign="right" />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>تکرار رمز عبور <Text style={styles.required}>*</Text></Text>
              <View style={[styles.passwordContainer, errors.confirmPassword ? styles.inputError : null]}>
                <TextInput style={styles.passwordInput} value={formData.confirmPassword} onChangeText={(text) => { setFormData({ ...formData, confirmPassword: text }); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" }); }} placeholder="تکرار رمز عبور" placeholderTextColor={Colors.textSecondary} secureTextEntry={!showConfirmPassword} textAlign="right" />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>شماره تلفن (اختیاری)</Text>
              <TextInput style={styles.input} value={formData.phone} onChangeText={(text) => setFormData({ ...formData, phone: text })} placeholder="شماره تلفن" placeholderTextColor={Colors.textSecondary} keyboardType="phone-pad" textAlign="right" />
            </View>
          </View>

          {/* Professional Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اطلاعات حرفه‌ای</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>حقوق پایه ماهیانه (افغانی)</Text>
              <TextInput style={[styles.input, errors.salary ? styles.inputError : null]} value={formData.baseSalary} onChangeText={(text) => setFormData({ ...formData, baseSalary: text.replace(/[^0-9.]/g, '') })} keyboardType="decimal-pad" placeholder="مثال: ۱۵۰۰۰" placeholderTextColor={Colors.textSecondary} textAlign="right" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>حقوق ساعتی (افغانی)</Text>
              <TextInput style={styles.input} value={formData.hourlyRate} onChangeText={(text) => setFormData({ ...formData, hourlyRate: text.replace(/[^0-9.]/g, '') })} keyboardType="decimal-pad" placeholder="مثال: ۱۰۰" placeholderTextColor={Colors.textSecondary} textAlign="right" />
              {formData.hourlyRate && parseFloat(formData.hourlyRate) > 0 && (
                <Text style={styles.hintText}>معادل ماهیانه (۱۶۰ ساعت): {parseFloat(formData.hourlyRate) * 160} افغانی</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>نرخ اضافه‌کار (افغانی/ساعت)</Text>
              <TextInput style={styles.input} value={formData.overtimeRate} onChangeText={(text) => setFormData({ ...formData, overtimeRate: text.replace(/[^0-9.]/g, '') })} keyboardType="decimal-pad" placeholder="اختیاری" placeholderTextColor={Colors.textSecondary} textAlign="right" />
            </View>

            {errors.salary && <Text style={styles.errorText}>{errors.salary}</Text>}

            <View style={styles.formGroup}>
              <Text style={styles.label}>سابقه تدریس</Text>
              <TextInput style={styles.input} value={formData.experience} onChangeText={(text) => setFormData({ ...formData, experience: text })} placeholder="مثال: ۱۲ سال" placeholderTextColor={Colors.textSecondary} textAlign="right" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>مدرک تحصیلی</Text>
              <TextInput style={styles.input} value={formData.certification} onChangeText={(text) => setFormData({ ...formData, certification: text })} placeholder="مدرک تحصیلی" placeholderTextColor={Colors.textSecondary} textAlign="right" />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchLabel}>{formData.isActive ? "فعال" : "غیرفعال"}</Text>
                  <Text style={styles.switchDesc}>{formData.isActive ? "معلم در دسترس است" : "معلم در حال حاضر فعال نیست"}</Text>
                </View>
                <Switch
                  value={formData.isActive}
                  onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                  trackColor={{ false: Colors.border, true: `${Colors.success}50` }}
                  thumbColor={formData.isActive ? Colors.success : "#f4f3f4"}
                />
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, (!isFormValid || loading) && styles.submitButtonDisabled]}
            onPress={handleCreate}
            disabled={!isFormValid || loading}
            activeOpacity={0.8}
          >
            {loading ? <ActivityIndicator size="small" color="white" /> : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="white" />
                <Text style={styles.submitButtonText}>ایجاد معلم</Text>
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
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 14, textAlign: "right" },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 6, textAlign: "right" },
  required: { color: Colors.danger },
  input: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 14, color: Colors.text, fontFamily: "Vazirmatn", textAlign: "right" },
  inputError: { borderColor: Colors.danger },
  errorText: { fontSize: 12, color: Colors.danger, fontFamily: "Vazirmatn", marginTop: 6, textAlign: "right" },
  hintText: { fontSize: 11, color: Colors.primary, fontFamily: "Vazirmatn", marginTop: 6, textAlign: "right" },
  passwordContainer: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12 },
  passwordInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: Colors.text, fontFamily: "Vazirmatn", textAlign: "right" },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: Colors.card, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  switchLabel: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  switchDesc: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  submitButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, gap: 8, marginTop: 10 },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: "white", fontSize: 16, fontWeight: "bold", fontFamily: "Vazirmatn" },
});