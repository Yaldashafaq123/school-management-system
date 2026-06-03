// app/(auth)/login.tsx - COMPLETELY FIXED
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
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

export default function LoginScreen() {
  const router = useRouter();
  const { login, loading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = () => {
    const errors: typeof validationErrors = {};

    if (!email.trim()) {
      errors.email = "ایمیل الزامی است";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "ایمیل معتبر نیست";
    }

    if (!password.trim()) {
      errors.password = "رمز عبور الزامی است";
    } else if (password.length < 6) {
      errors.password = "رمز عبور باید حداقل ۶ کاراکتر باشد";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login({ email, password, rememberMe });

      const userDataStr = await AsyncStorage.getItem("user_data");

      if (!userDataStr) {
        Alert.alert("خطا", "اطلاعات کاربر یافت نشد");
        return;
      }

      const userData = JSON.parse(userDataStr);
      console.log("User role after login:", userData.role);

      // Convert to uppercase for case-insensitive comparison
      const role = userData.role?.toUpperCase();

      switch (role) {
        case "ADMIN":
          router.replace("/(admin)/(tabs)");
          break;
        case "TEACHER":
          router.replace("/(teacher)/(tabs)");
          break;
        case "STUDENT":
          router.replace("/(student)/(tabs)");
          break;
        case "PARENT":
          router.replace("/(parent)/(tabs)");
          break;
        default:
          router.replace("/");
      }
    } catch (error) {
      Alert.alert("خطا در ورود", "ایمیل یا رمز عبور اشتباه است");
    }
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
              <View style={styles.headerPlaceholder} />
            </View>

            <View style={styles.card}>
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <Image
                  source={require("../../assets/images/icon1.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.appName}>Hoshmand Asra</Text>
              </View>

              <View style={styles.welcomeSection}>
                <Text style={styles.title}>خوش آمدید 👋</Text>
                <Text style={styles.subtitle}>
                  لطفا برای ادامه وارد حساب کاربری خود شوید
                </Text>
              </View>

              <View style={styles.form}>
                {/* Email Input */}
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
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (validationErrors.email) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            email: undefined,
                          }));
                        }
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>
                  {validationErrors.email && (
                    <Text style={styles.errorText}>
                      {validationErrors.email}
                    </Text>
                  )}
                </View>

                {/* Password Input */}
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
                      placeholder="رمز عبور خود را وارد کنید"
                      placeholderTextColor={Colors.textSecondary}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (validationErrors.password) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            password: undefined,
                          }));
                        }
                      }}
                      secureTextEntry={!showPassword}
                      editable={!loading}
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

                {/* Remember Me & Forgot Password */}
                <View style={styles.rememberRow}>
                  <TouchableOpacity
                    style={styles.rememberMe}
                    onPress={() => setRememberMe(!rememberMe)}
                    disabled={loading}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        rememberMe && styles.checkboxChecked,
                      ]}
                    >
                      {rememberMe && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.rememberText}>مرا به خاطر بسپار</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/forgot-password")}
                    disabled={loading}
                  >
                    <Text style={styles.forgotPasswordText}>
                      رمز عبور را فراموش کرده‌اید؟
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Error Message */}
                {error && (
                  <View style={styles.errorContainer}>
                    <Ionicons
                      name="alert-circle"
                      size={18}
                      color={Colors.danger}
                    />
                    <Text style={styles.errorMessage}>{error}</Text>
                  </View>
                )}

                {/* Login Button */}
                <TouchableOpacity
                  style={[
                    styles.loginButton,
                    loading && styles.loginButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <Ionicons name="refresh" size={20} color="#fff" />
                      <Text style={styles.loginButtonText}>در حال ورود...</Text>
                    </View>
                  ) : (
                    <Text style={styles.loginButtonText}>ورود به حساب</Text>
                  )}
                </TouchableOpacity>

                {/* Register Link */}
                <View style={styles.registerContainer}>
                  <TouchableOpacity
                    onPress={() => router.push("/(auth)/register")}
                    disabled={loading}
                  >
                    <Text style={styles.registerLink}>ثبت‌نام کنید</Text>
                  </TouchableOpacity>
                  <Text style={styles.registerText}>حساب کاربری ندارید؟</Text>
                </View>

                {/* Footer - FIXED */}
                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>
                    © {new Date().getFullYear()} Web Studio. All rights
                    reserved.
                  </Text>
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
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    zIndex: 1,
  },
  headerPlaceholder: {
    width: 40,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 0,
  },
  logoSection: {
    alignItems: "center",
    marginTop: -40,
    marginBottom: 24,
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 90,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
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
    gap: 24,
    paddingBottom: 20,
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
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
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
  rememberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rememberMe: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rememberText: {
    fontSize: 14,
    color: Colors.text,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorMessage: {
    flex: 1,
    fontSize: 14,
    color: Colors.danger,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  registerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "bold",
  },
  footerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
