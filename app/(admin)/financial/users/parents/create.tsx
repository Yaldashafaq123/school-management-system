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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateParent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    relationship: "",
    occupation: "",
    address: "",
    emergencyContact: "",
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const registerResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: "PARENT",
          phone: formData.phone.trim() || undefined,
        }),
      });

      const registerData = await registerResponse.json();
      if (!registerResponse.ok) {
        throw new Error(registerData.message || "ثبت‌نام والد ناموفق بود");
      }

      Alert.alert(
        "موفق",
        `والد ${formData.fullName} با موفقیت ایجاد شد`,
        [
          { text: "بازگشت به لیست", onPress: () => router.back() },
          { text: "ایجاد دوباره", onPress: () => {
            setFormData({
              fullName: "", email: "", password: "", confirmPassword: "", phone: "",
              relationship: "", occupation: "", address: "", emergencyContact: "",
            });
            setErrors({});
          }},
        ]
      );
    } catch (error: any) {
      Alert.alert("خطا", error?.message || "ایجاد والد ناموفق بود");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.fullName.trim().length >= 3 && formData.email.trim() && formData.password.length >= 6 && formData.password === formData.confirmPassword;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="افزودن والد جدید" showBack />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>ایمیل و رمز عبور برای ورود والد به سیستم استفاده می‌شود</Text>
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

          {/* Additional Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اطلاعات تکمیلی</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>نسبت با دانش‌آموز</Text>
              <TextInput style={styles.input} value={formData.relationship} onChangeText={(text) => setFormData({ ...formData, relationship: text })} placeholder="مثال: پدر، مادر، سرپرست" placeholderTextColor={Colors.textSecondary} textAlign="right" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>شغل</Text>
              <TextInput style={styles.input} value={formData.occupation} onChangeText={(text) => setFormData({ ...formData, occupation: text })} placeholder="شغل" placeholderTextColor={Colors.textSecondary} textAlign="right" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>تماس اضطراری</Text>
              <TextInput style={styles.input} value={formData.emergencyContact} onChangeText={(text) => setFormData({ ...formData, emergencyContact: text })} placeholder="شماره تماس اضطراری" placeholderTextColor={Colors.textSecondary} keyboardType="phone-pad" textAlign="right" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>آدرس</Text>
              <TextInput style={[styles.input, styles.textArea]} value={formData.address} onChangeText={(text) => setFormData({ ...formData, address: text })} placeholder="آدرس منزل" placeholderTextColor={Colors.textSecondary} multiline numberOfLines={3} textAlignVertical="top" textAlign="right" />
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
                <Text style={styles.submitButtonText}>ایجاد والد</Text>
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
  textArea: { minHeight: 80, textAlignVertical: "top" },
  errorText: { fontSize: 12, color: Colors.danger, fontFamily: "Vazirmatn", marginTop: 6, textAlign: "right" },
  passwordContainer: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12 },
  passwordInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: Colors.text, fontFamily: "Vazirmatn", textAlign: "right" },
  submitButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, gap: 8, marginTop: 10 },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: "white", fontSize: 16, fontWeight: "bold", fontFamily: "Vazirmatn" },
});