// components/AdminResetPassword.tsx
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface AdminResetPasswordProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminResetPassword({
  visible,
  onClose,
  onSuccess,
}: AdminResetPasswordProps) {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"email" | "password">("email");

  // Search user by email
  const handleSearchUser = async () => {
    if (!email) {
      Alert.alert("خطا", "لطفاً ایمیل کاربر را وارد کنید");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users?search=${email}&limit=1`);
      const data = await response.json();

      if (data.success && data.data.users.length > 0) {
        const user = data.data.users[0];
        if (user.email.toLowerCase() === email.toLowerCase()) {
          setStep("password");
          Alert.alert("موفقیت", `کاربر ${user.name} یافت شد`);
        } else {
          Alert.alert("خطا", "کاربری با این ایمیل یافت نشد");
        }
      } else {
        Alert.alert("خطا", "کاربری با این ایمیل یافت نشد");
      }
    } catch (error) {
      Alert.alert("خطا", "خطا در جستجوی کاربر");
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("خطا", "لطفاً رمز عبور جدید را وارد کنید");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("خطا", "رمز عبور جدید با تکرار آن مطابقت ندارد");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("خطا", "رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("موفقیت", data.message || "رمز عبور با موفقیت تغییر کرد");
        onSuccess();
        handleClose();
      } else {
        Alert.alert("خطا", data.message || "خطا در تغییر رمز عبور");
      }
    } catch (error) {
      Alert.alert("خطا", "خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setNewPassword("");
    setConfirmPassword("");
    setStep("email");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {step === "email" ? "جستجوی کاربر" : "تغییر رمز عبور"}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {step === "email" ? (
            // Step 1: Enter Email
            <>
              <Text style={styles.subtitle}>
                ایمیل کاربر را وارد کنید تا رمز عبور او را تغییر دهید
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="ایمیل کاربر"
                  placeholderTextColor={Colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textAlign="right"
                />
              </View>

              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchUser}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.searchButtonText}>جستجوی کاربر</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            // Step 2: Enter New Password
            <>
              <Text style={styles.subtitle}>
                تغییر رمز عبور برای:
                <Text style={styles.emailHighlight}> {email}</Text>
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={Colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  placeholder="رمز عبور جدید"
                  placeholderTextColor={Colors.textSecondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                  textAlign="right"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed"
                  size={20}
                  color={Colors.textSecondary}
                />
                <TextInput
                  style={styles.input}
                  placeholder="تکرار رمز عبور جدید"
                  placeholderTextColor={Colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  textAlign="right"
                />
              </View>

              <View style={styles.passwordHint}>
                <Text style={styles.hintText}>
                  • رمز عبور باید حداقل ۶ کاراکتر باشد
                </Text>
              </View>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.resetButtonText}>تغییر رمز عبور</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setStep("email")}
              >
                <Text style={styles.backText}>بازگشت به جستجوی کاربر</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  emailHighlight: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginHorizontal: 8,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resetButton: {
    backgroundColor: Colors.danger,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  passwordHint: {
    marginBottom: 12,
  },
  hintText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  backText: {
    color: Colors.primary,
    fontSize: 14,
  },
});
