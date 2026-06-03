import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
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
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE_URL = "http://asraschools.cloud:3000/api";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as "student" | "teacher" | "admin" | "parent",
    class_id: undefined as number | undefined,
    phone: "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRoleOptions, setShowRoleOptions] = useState(false);
  const [showClassOptions, setShowClassOptions] = useState(false);

  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Fetch classes from backend using fetch API
  useEffect(() => {
    const fetchClasses = async () => {
      if (formData.role !== "student") return;

      setLoadingClasses(true);
      try {
        const response = await fetch(`${API_BASE_URL}/classes`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Classes response:", data);
        
        // Handle different response formats
        if (data.classes && Array.isArray(data.classes)) {
          setClasses(data.classes);
        } else if (Array.isArray(data)) {
          setClasses(data);
        } else {
          console.error("Unexpected response format:", data);
          // Fallback to mock data
          setClasses([
            { id: 1, name: "کلاس اول" },
            { id: 2, name: "کلاس دوم" },
            { id: 3, name: "کلاس سوم" },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch classes:", err);
        // Fallback to mock data if API fails
        setClasses([
          { id: 1, name: "کلاس اول" },
          { id: 2, name: "کلاس دوم" },
          { id: 3, name: "کلاس سوم" },
          { id: 4, name: "کلاس چهارم" },
          { id: 5, name: "کلاس پنجم" },
          { id: 6, name: "کلاس ششم" },
        ]);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [formData.role]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = "نام و نام خانوادگی الزامی است";
    if (!formData.email.trim()) errors.email = "ایمیل الزامی است";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "ایمیل معتبر نیست";
    if (!formData.password.trim()) errors.password = "رمز عبور الزامی است";
    else if (formData.password.length < 6)
      errors.password = "رمز عبور باید حداقل ۶ کاراکتر باشد";
    if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = "رمز عبور و تکرار آن مطابقت ندارند";
    if (formData.role === "student" && !formData.class_id)
      errors.class_id = "انتخاب کلاس الزامی است";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register(formData);
      router.replace("/(tabs)" as any);
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        "خطا در ثبت‌نام",
        "ثبت‌نام ناموفق بود. لطفا مجددا تلاش کنید.",
      );
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const clearFieldError = (field: string) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const getSelectedClassName = () => {
    if (!formData.class_id) return "لطفا کلاس خود را انتخاب کنید";
    const selected = classes.find(c => c.id === formData.class_id);
    return selected ? selected.name : "لطفا کلاس خود را انتخاب کنید";
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.gradient}
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-forward" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.logoText}>آموزش فارسی</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.welcomeSection}>
                <Text style={styles.title}>ثبت‌نام جدید</Text>
                <Text style={styles.subtitle}>
                  حساب کاربری خود را ایجاد کنید
                </Text>
              </View>

              <View style={styles.form}>
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>نام و نام خانوادگی</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      validationErrors.name && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={Colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="نام کامل خود را وارد کنید"
                      placeholderTextColor={Colors.textSecondary}
                      value={formData.name}
                      onChangeText={(text) => {
                        updateFormData("name", text);
                        clearFieldError("name");
                      }}
                      editable={!loading}
                      textAlign="right"
                    />
                  </View>
                  {validationErrors.name && (
                    <Text style={styles.errorText}>
                      {validationErrors.name}
                    </Text>
                  )}
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ایمیل</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      validationErrors.email && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={Colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="example@email.com"
                      placeholderTextColor={Colors.textSecondary}
                      value={formData.email}
                      onChangeText={(text) => {
                        updateFormData("email", text);
                        clearFieldError("email");
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                      textAlign="right"
                    />
                  </View>
                  {validationErrors.email && (
                    <Text style={styles.errorText}>
                      {validationErrors.email}
                    </Text>
                  )}
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>شماره تلفن (اختیاری)</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color={Colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="0912XXXXXXX"
                      placeholderTextColor={Colors.textSecondary}
                      value={formData.phone}
                      onChangeText={(text) => updateFormData("phone", text)}
                      keyboardType="phone-pad"
                      editable={!loading}
                      textAlign="right"
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>رمز عبور</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      validationErrors.password && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={Colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="رمز عبور دلخواه خود را وارد کنید"
                      placeholderTextColor={Colors.textSecondary}
                      value={formData.password}
                      onChangeText={(text) => {
                        updateFormData("password", text);
                        clearFieldError("password");
                      }}
                      secureTextEntry={!showPassword}
                      editable={!loading}
                      textAlign="right"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.passwordToggle}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={20}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {validationErrors.password && (
                    <Text style={styles.errorText}>
                      {validationErrors.password}
                    </Text>
                  )}
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>تکرار رمز عبور</Text>
                  <View
                    style={[
                      styles.inputContainer,
                      validationErrors.confirmPassword && styles.inputError,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={Colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="رمز عبور را مجددا وارد کنید"
                      placeholderTextColor={Colors.textSecondary}
                      value={formData.confirmPassword}
                      onChangeText={(text) => {
                        updateFormData("confirmPassword", text);
                        clearFieldError("confirmPassword");
                      }}
                      secureTextEntry={!showConfirmPassword}
                      editable={!loading}
                      textAlign="right"
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={styles.passwordToggle}
                    >
                      <Ionicons
                        name={showConfirmPassword ? "eye-off" : "eye"}
                        size={20}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                  {validationErrors.confirmPassword && (
                    <Text style={styles.errorText}>
                      {validationErrors.confirmPassword}
                    </Text>
                  )}
                </View>

                {/* Role Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>نقش کاربری</Text>
                  <TouchableOpacity
                    style={[
                      styles.inputContainer,
                      validationErrors.role && styles.inputError,
                    ]}
                    onPress={() => setShowRoleOptions(!showRoleOptions)}
                  >
                    <Text style={[styles.input, { color: Colors.text }]}>
                      {formData.role === "student"
                        ? "دانش‌آموز"
                        : formData.role === "teacher"
                          ? "معلم"
                          : formData.role === "admin"
                            ? "مدیر"
                            : "والدین"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                  {showRoleOptions && (
                    <View style={styles.optionsContainer}>
                      {["student", "teacher", "admin", "parent"].map((role) => (
                        <TouchableOpacity
                          key={role}
                          style={styles.optionItem}
                          onPress={() => {
                            updateFormData("role", role);
                            setShowRoleOptions(false);
                            clearFieldError("role");
                          }}
                        >
                          <Text style={styles.optionText}>
                            {role === "student"
                              ? "دانش‌آموز"
                              : role === "teacher"
                                ? "معلم"
                                : role === "admin"
                                  ? "مدیر"
                                  : "والدین"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Class Selection for Students - Custom Dropdown */}
                {formData.role === "student" && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>کلاس</Text>
                    <TouchableOpacity
                      style={[
                        styles.inputContainer,
                        validationErrors.class_id && styles.inputError,
                      ]}
                      onPress={() => setShowClassOptions(!showClassOptions)}
                      disabled={loading || loadingClasses}
                    >
                      <Text
                        style={[
                          styles.input,
                          {
                            color: formData.class_id
                              ? Colors.text
                              : Colors.textSecondary,
                          },
                        ]}
                      >
                        {loadingClasses
                          ? "در حال بارگذاری..."
                          : getSelectedClassName()}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={20}
                        color={Colors.textSecondary}
                      />
                    </TouchableOpacity>

                    {showClassOptions && !loadingClasses && (
                      <View style={styles.optionsContainer}>
                        <TouchableOpacity
                          style={styles.optionItem}
                          onPress={() => {
                            updateFormData("class_id", undefined);
                            setShowClassOptions(false);
                            clearFieldError("class_id");
                          }}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              !formData.class_id && styles.selectedOptionText,
                            ]}
                          >
                            لطفا کلاس خود را انتخاب کنید
                          </Text>
                        </TouchableOpacity>
                        {classes.map((classItem) => (
                          <TouchableOpacity
                            key={classItem.id}
                            style={styles.optionItem}
                            onPress={() => {
                              updateFormData("class_id", classItem.id);
                              setShowClassOptions(false);
                              clearFieldError("class_id");
                            }}
                          >
                            <Text
                              style={[
                                styles.optionText,
                                formData.class_id === classItem.id &&
                                  styles.selectedOptionText,
                              ]}
                            >
                              {classItem.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {validationErrors.class_id && (
                      <Text style={styles.errorText}>
                        {validationErrors.class_id}
                      </Text>
                    )}
                  </View>
                )}

                {/* Register Button */}
                <TouchableOpacity
                  style={[
                    styles.registerButton,
                    loading && styles.registerButtonDisabled,
                  ]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  <Text style={styles.registerButtonText}>
                    {loading ? "در حال ثبت‌نام..." : "ایجاد حساب کاربری"}
                  </Text>
                </TouchableOpacity>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <Text style={styles.loginText}>حساب کاربری دارید؟</Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/login")}
                    disabled={loading}
                  >
                    <Text style={styles.loginLink}>وارد شوید</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    padding: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  card: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "right",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 0,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 50,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  inputIcon: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    textAlign: "right",
    paddingVertical: Platform.OS === "ios" ? 14 : 8,
  },
  passwordToggle: {
    padding: 4,
    marginRight: 8,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    textAlign: "right",
    marginTop: 4,
  },
  optionsContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
    overflow: "hidden",
  },
  optionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionText: {
    fontSize: 15,
    color: Colors.text,
    textAlign: "right",
  },
  selectedOptionText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  pickerContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    minHeight: 50,
    justifyContent: "center",
  },
  picker: {
    color: Colors.text,
    height: 50,
    width: "100%",
  },
  registerButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  loginText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "bold",
  },
});