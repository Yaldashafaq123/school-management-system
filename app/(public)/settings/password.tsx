import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Header } from '../../../components/Header';
import apiService from '../../../services/api';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'رمز عبور فعلی الزامی است';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'رمز عبور جدید الزامی است';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'رمز عبور و تکرار آن مطابقت ندارند';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // TODO: Replace with actual API call using apiService
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        'موفقیت',
        'رمز عبور با موفقیت تغییر کرد',
        [
          {
            text: 'باشه',
            onPress: () => router.back(),
          },
        ]
      );
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
    } catch (error: any) {
      Alert.alert('خطا', error.message || 'در تغییر رمز عبور مشکلی پیش آمده');
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (
    label: string,
    field: keyof PasswordForm,
    placeholder: string,
    showPassword: boolean,
    onToggleShow: () => void
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.passwordInputContainer, errors[field] && styles.inputError]}>
        <TextInput
          style={styles.passwordInput}
          placeholder={placeholder}
          value={formData[field]}
          onChangeText={(text) => {
            setFormData({ ...formData, [field]: text });
            if (errors[field]) {
              setErrors({ ...errors, [field]: '' });
            }
          }}
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={onToggleShow}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      {errors[field] ? (
        <Text style={styles.errorText}>{errors[field]}</Text>
      ) : null}
    </View>
  );

  const passwordStrength = () => {
    const password = formData.newPassword;
    if (!password) return { score: 0, label: 'خالی', color: Colors.textSecondary };

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const labels = ['خیلی ضعیف', 'ضعیف', 'متوسط', 'خوب', 'عالی'];
    const colors = [Colors.danger, Colors.warning, Colors.warning, Colors.success, Colors.success];

    return {
      score,
      label: labels[Math.min(score, labels.length - 1)],
      color: colors[Math.min(score, colors.length - 1)],
    };
  };

  const strength = passwordStrength();

  return (
    <SafeAreaView style={styles.container}>
      <Header title="تغییر رمز عبور" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Security Info */}
        <View style={styles.securityInfo}>
          <Ionicons name="shield-checkmark" size={48} color={Colors.primary} />
          <Text style={styles.securityTitle}>امنیت حساب کاربری</Text>
          <Text style={styles.securityDescription}>
            برای حفظ امنیت حساب خود، از رمز عبور قوی و منحصر به فرد استفاده کنید.
          </Text>
        </View>

        {/* Password Form */}
        <View style={styles.formCard}>
          {renderPasswordInput(
            'رمز عبور فعلی',
            'currentPassword',
            'رمز عبور فعلی خود را وارد کنید',
            showCurrentPassword,
            () => setShowCurrentPassword(!showCurrentPassword)
          )}

          {renderPasswordInput(
            'رمز عبور جدید',
            'newPassword',
            'رمز عبور جدید خود را وارد کنید',
            showNewPassword,
            () => setShowNewPassword(!showNewPassword)
          )}

          {/* Password Strength */}
          {formData.newPassword && (
            <View style={styles.strengthContainer}>
              <Text style={styles.strengthLabel}>قدرت رمز عبور:</Text>
              <View style={styles.strengthBar}>
                {[1, 2, 3, 4, 5].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.strengthSegment,
                      index <= strength.score && {
                        backgroundColor: strength.color,
                      },
                    ]}
                  />
                ))}
              </View>
              <Text style={[styles.strengthText, { color: strength.color }]}>
                {strength.label}
              </Text>
            </View>
          )}

          {renderPasswordInput(
            'تکرار رمز عبور جدید',
            'confirmPassword',
            'رمز عبور جدید را مجددا وارد کنید',
            showConfirmPassword,
            () => setShowConfirmPassword(!showConfirmPassword)
          )}

          {/* Password Requirements */}
          <View style={styles.requirementsCard}>
            <Text style={styles.requirementsTitle}>نیازمندی‌های رمز عبور:</Text>
            <View style={styles.requirementItem}>
              <Ionicons
                name={formData.newPassword.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={formData.newPassword.length >= 6 ? Colors.success : Colors.textSecondary}
              />
              <Text style={[
                styles.requirementText,
                formData.newPassword.length >= 6 && styles.requirementMet,
              ]}>
                حداقل ۶ کاراکتر
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons
                name={formData.newPassword.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={formData.newPassword.length >= 8 ? Colors.success : Colors.textSecondary}
              />
              <Text style={[
                styles.requirementText,
                formData.newPassword.length >= 8 && styles.requirementMet,
              ]}>
                حداقل ۸ کاراکتر (توصیه می‌شود)
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons
                name={/[0-9]/.test(formData.newPassword) ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={/[0-9]/.test(formData.newPassword) ? Colors.success : Colors.textSecondary}
              />
              <Text style={[
                styles.requirementText,
                /[0-9]/.test(formData.newPassword) && styles.requirementMet,
              ]}>
                شامل اعداد
              </Text>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="lock-closed" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>تغییر رمز عبور</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>انصراف</Text>
        </TouchableOpacity>

        {/* Security Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>نکات امنیتی:</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark" size={16} color={Colors.success} />
            <Text style={styles.tipText}>
              از ترکیب حروف، اعداد و نمادها استفاده کنید
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark" size={16} color={Colors.success} />
            <Text style={styles.tipText}>
              از اطلاعات شخصی مثل تاریخ تولد استفاده نکنید
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark" size={16} color={Colors.success} />
            <Text style={styles.tipText}>
              رمز عبور را در اختیار دیگران قرار ندهید
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  securityInfo: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  securityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  securityDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
  },
  passwordToggle: {
    padding: 8,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  strengthContainer: {
    marginBottom: 20,
  },
  strengthLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  strengthBar: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  strengthSegment: {
    flex: 1,
    marginHorizontal: 1,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  requirementsCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  requirementMet: {
    color: Colors.success,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginBottom: 24,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
  },
  tipsCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: 8,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    fontSize: 12,
    color: Colors.text,
    flex: 1,
  },
});