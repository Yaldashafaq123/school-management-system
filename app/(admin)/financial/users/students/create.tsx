import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { classApi, userApi } from "@/src/config/financeApi";
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

export default function CreateStudent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    classId: null as number | null,
    grade: "",
    school: "",
    parentContact: "",
    address: "",
    birthDate: "",
    status: "ACTIVE" as string,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loadClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);
      const response = await classApi.getAllClasses({ limit: 200 });
      if (response.success) {
        const raw = response.data.classes || [];
        // Ensure items conform to ClassItem (section must be string)
        const mapped: ClassItem[] = raw.map((c: any) => ({
          id: c.id,
          name: c.name,
          section: c.section || "",
        }));
        setClasses(mapped);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

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

    if (!formData.classId) {
      newErrors.classId = "انتخاب کلاس الزامی است";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // First, register the user
      const registerResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: "STUDENT",
          phone: formData.phone.trim() || undefined,
        }),
      });

      const registerData = await registerResponse.json();
      if (!registerResponse.ok) {
        throw new Error(registerData.message || "ثبت‌نام دانش‌آموز ناموفق بود");
      }

      const userId = registerData.user?.id;
      if (!userId) {
        throw new Error("شناسه کاربر دریافت نشد");
      }

      // Update student profile
      await userApi.updateStudentProfile(userId, {
        classId: formData.classId || undefined,
        grade: formData.grade || undefined,
        school: formData.school || undefined,
        parentContact: formData.parentContact || undefined,
        address: formData.address || undefined,
        birthDate: formData.birthDate || undefined,
        status: formData.status,
      });

      Alert.alert(
        "موفق",
        `دانش‌آموز ${formData.fullName} با موفقیت ایجاد شد`,
        [
          { text: "بازگشت به لیست", onPress: () => router.back() },
          { text: "ایجاد دوباره", onPress: () => {
            setFormData({
              fullName: "", email: "", password: "", confirmPassword: "", phone: "",
              classId: null, grade: "", school: "", parentContact: "", address: "", birthDate: "", status: "ACTIVE",
            });
            setErrors({});
          }},
        ]
      );
    } catch (error: any) {
      Alert.alert("خطا", error?.message || "ایجاد دانش‌آموز ناموفق بود");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.fullName.trim().length >= 3 && formData.email.trim() && formData.password.length >= 6 && formData.password === formData.confirmPassword && formData.classId;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="افزودن دانش‌آموز جدید" showBack />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoid}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>ایمیل و رمز عبور برای ورود دانش‌آموز به سیستم استفاده می‌شود</Text>
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

          {/* Academic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اطلاعات تحصیلی</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>کلاس <Text style={styles.required}>*</Text></Text>
              {loadingClasses ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipContainer}>
                    {classes.map((cls) => (
                      <TouchableOpacity
                        key={cls.id}
                        style={[styles.chip, formData.classId === cls.id && styles.chipActive]}
                        onPress={() => { setFormData({ ...formData, classId: cls.id }); if (errors.classId) setErrors({ ...errors, classId: "" }); }}
                      >
                        <Text style={[styles.chipText, formData.classId === cls.id && styles.chipTextActive]}>
                          {cls.name} {cls.section || ""}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              )}
              {errors.classId && <Text style={styles.errorText}>{errors.classId}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>پایه تحصیلی</Text>
              <TextInput style={styles.input} value={formData.grade} onChangeText={(text) => setFormData({ ...formData, grade: text })} placeholder="مثال: دهم" placeholderTextColor={Colors.textSecondary} textAlign="right" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>نام مدرسه</Text>
              <TextInput style={styles.input} value={formData.school} onChangeText={(text) => setFormData({ ...formData, school: text })} placeholder="نام مدرسه" placeholderTextColor={Colors.textSecondary} textAlign="right" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>شماره تماس والدین</Text>
              <TextInput style={styles.input} value={formData.parentContact} onChangeText={(text) => setFormData({ ...formData, parentContact: text })} placeholder="شماره تماس والدین" placeholderTextColor={Colors.textSecondary} keyboardType="phone-pad" textAlign="right" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>تاریخ تولد</Text>
              <TextInput style={styles.input} value={formData.birthDate} onChangeText={(text) => setFormData({ ...formData, birthDate: text })} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textSecondary} textAlign="right" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>آدرس</Text>
              <TextInput style={[styles.input, styles.textArea]} value={formData.address} onChangeText={(text) => setFormData({ ...formData, address: text })} placeholder="آدرس منزل" placeholderTextColor={Colors.textSecondary} multiline numberOfLines={3} textAlignVertical="top" textAlign="right" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>وضعیت</Text>
              <View style={styles.statusRow}>
                {["ACTIVE", "SUSPENDED", "GRADUATED", "LEFT"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.statusChip, formData.status === status && styles.statusChipActive]}
                    onPress={() => setFormData({ ...formData, status })}
                  >
                    <Text style={[styles.statusChipText, formData.status === status && styles.statusChipTextActive]}>
                      {status === "ACTIVE" ? "فعال" : status === "SUSPENDED" ? "تعلیق" : status === "GRADUATED" ? "فارغ التحصیل" : "ترک تحصیل"}
                    </Text>
                  </TouchableOpacity>
                ))}
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
                <Text style={styles.submitButtonText}>ایجاد دانش‌آموز</Text>
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
  chipContainer: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  chipTextActive: { color: "white" },
  statusRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  statusChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  statusChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  statusChipText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  statusChipTextActive: { color: "white" },
  submitButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, gap: 8, marginTop: 10 },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: "white", fontSize: 16, fontWeight: "bold", fontFamily: "Vazirmatn" },
});