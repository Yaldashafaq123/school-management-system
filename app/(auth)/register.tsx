import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react"; // ← ADD useRef
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
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";

const API_BASE_URL = "https://asraschools.cloud/api";

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student" as "student" | "parent",
    class_id: undefined as number | undefined,
    phone: "",
    child_email: "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRoleOptions, setShowRoleOptions] = useState(false);
  const [showClassOptions, setShowClassOptions] = useState(false);
  const [isCheckingChild, setIsCheckingChild] = useState(false);
  const [childFound, setChildFound] = useState<{
    exists: boolean;
    name?: string;
    class?: string;
  } | null>(null);

  // ✅ Add this ref for debouncing
  const checkChildTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [classes, setClasses] = useState<{ id: number; name: string }[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Fetch classes from backend
  useEffect(() => {
    const fetchClasses = async () => {
      if (formData.role !== "student") return;

      setLoadingClasses(true);
      try {
        const response = await fetch(`${API_BASE_URL}/public/classes`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Classes response:", data);

        if (data.classes && Array.isArray(data.classes)) {
          setClasses(data.classes);
        } else if (Array.isArray(data)) {
          setClasses(data);
        } else {
          console.error("Unexpected response format:", data);
          setClasses([
            { id: 1, name: "صنف اول" },
            { id: 2, name: "صنف دوم" },
            { id: 3, name: "صنف سوم" },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch classes:", err);
        setClasses([
          { id: 1, name: "صنف اول" },
          { id: 2, name: "صنف دوم" },
          { id: 3, name: "صنف سوم" },
          { id: 4, name: "صنف چهارم" },
          { id: 5, name: "صنف پنجم" },
          { id: 6, name: "صنف ششم" },
        ]);
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, [formData.role]);

  // Check child email
  const checkChildEmail = async (email: string) => {
    if (!email.trim() || formData.role !== "parent") return;

    setIsCheckingChild(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/public/check-student?email=${encodeURIComponent(email)}`,
      );
      const data = await response.json();

      if (response.ok && data.exists) {
        setChildFound({
          exists: true,
          name: data.student?.name,
          class: data.student?.className,
        });
      } else {
        setChildFound({ exists: false });
      }
    } catch (error) {
      console.error("Error checking child email:", error);
      setChildFound({ exists: false });
    } finally {
      setIsCheckingChild(false);
    }
  };

  // ✅ Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (checkChildTimeoutRef.current) {
        clearTimeout(checkChildTimeoutRef.current);
      }
    };
  }, []);

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
      errors.class_id = "انتخاب صنف الزامی است";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await register(formData);

      if (formData.role === "parent") {
        router.replace("/(parent)/(tabs)" as any);
      } else {
        router.replace("/(tabs)" as any);
      }
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

    // Reset child found status when child email changes
    if (field === "child_email") {
      setChildFound(null);
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
    if (!formData.class_id) return "لطفا صنف خود را انتخاب کنید";
    const selected = classes.find((c) => c.id === formData.class_id);
    return selected ? selected.name : "لطفا صنف خود را انتخاب کنید";
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
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.logoText}>صفحه ثبت‌ نام</Text>
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

                {/* Role Selection - Only Student and Parent */}
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
                      {formData.role === "student" ? "دانش‌آموز" : "والدین"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                  {showRoleOptions && (
                    <View style={styles.optionsContainer}>
                      {["student", "parent"].map((role) => (
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
                            {role === "student" ? "دانش‌آموز" : "والدین"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Child Email Input for Parents - FIXED */}
                {formData.role === "parent" && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                      ایمیل دانش‌آموز (اختیاری)
                    </Text>
                    <View
                      style={[
                        styles.inputContainer,
                        childFound?.exists === false && styles.inputWarning,
                        childFound?.exists === true && styles.inputSuccess,
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
                        placeholder="ایمیل دانش‌آموز خود را وارد کنید"
                        placeholderTextColor={Colors.textSecondary}
                        value={formData.child_email}
                        onChangeText={(text) => {
                          // Update form data immediately
                          updateFormData("child_email", text);

                          // Clear previous timeout
                          if (checkChildTimeoutRef.current) {
                            clearTimeout(checkChildTimeoutRef.current);
                          }

                          // Reset child found status
                          setChildFound(null);

                          // Only check if there's text
                          if (text.trim()) {
                            // Set new timeout
                            checkChildTimeoutRef.current = setTimeout(() => {
                              checkChildEmail(text);
                            }, 500);
                          }
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading && !isCheckingChild}
                        textAlign="right"
                      />
                      {isCheckingChild && (
                        <ActivityIndicator
                          size="small"
                          color={Colors.primary}
                        />
                      )}
                    </View>

                    {/* Child Found Status */}
                    {childFound?.exists === true && childFound.name && (
                      <View style={styles.successMessage}>
                        <Ionicons
                          name="checkmark-circle"
                          size={16}
                          color={Colors.success}
                        />
                        <Text style={styles.successText}>
                          دانش‌آموز {childFound.name}{" "}
                          {childFound.class && `(کلاس ${childFound.class})`}{" "}
                          یافت شد
                        </Text>
                      </View>
                    )}

                    {childFound?.exists === false && (
                      <View style={styles.warningMessage}>
                        <Ionicons
                          name="alert-circle"
                          size={16}
                          color={Colors.warning}
                        />
                        <Text style={styles.warningText}>
                          دانش‌آموزی با این ایمیل یافت نشد. می‌توانید بعداً
                          اضافه کنید.
                        </Text>
                      </View>
                    )}

                    <Text style={styles.helperText}>
                      با وارد کردن ایمیل دانش‌آموز، می‌توانید به‌طور خودکار به
                      حساب فرزند خود متصل شوید
                    </Text>
                  </View>
                )}

                {/* Class Selection for Students */}
                {formData.role === "student" && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>صنف</Text>
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
                            لطفا صنف خود را انتخاب کنید
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
  // ... (keep all your existing styles)
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
  inputWarning: {
    borderColor: Colors.warning,
  },
  inputSuccess: {
    borderColor: Colors.success,
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
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  successText: {
    fontSize: 12,
    color: Colors.success,
    flex: 1,
  },
  warningMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  warningText: {
    fontSize: 12,
    color: Colors.warning,
    flex: 1,
  },
  helperText: {
    fontSize: 11,
    color: Colors.textSecondary,
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
