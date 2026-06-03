import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { BASE_URL } from '../../src/config/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'verification' | 'newPassword'>('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    verificationCode?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validateEmail = () => {
    const errors: typeof validationErrors = {};
    
    if (!email.trim()) {
      errors.email = 'ایمیل الزامی است';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'ایمیل معتبر نیست';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateVerificationCode = () => {
    const errors: typeof validationErrors = {};
    
    if (!verificationCode.trim()) {
      errors.verificationCode = 'کد تایید الزامی است';
    } else if (verificationCode.length !== 6) {
      errors.verificationCode = 'کد تایید باید ۶ رقمی باشد';
    } else if (!/^\d+$/.test(verificationCode)) {
      errors.verificationCode = 'کد تایید باید عددی باشد';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswords = () => {
    const errors: typeof validationErrors = {};
    
    if (!newPassword.trim()) {
      errors.newPassword = 'رمز عبور جدید الزامی است';
    } else if (newPassword.length < 6) {
      errors.newPassword = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    }
    
    if (!confirmPassword.trim()) {
      errors.confirmPassword = 'تکرار رمز عبور الزامی است';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'رمز عبور با تکرار آن مطابقت ندارد';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendCode = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "خطا در ارسال کد");
      }

      Alert.alert(
        'کد تایید ارسال شد',
        `کد تایید به ایمیل ${email} ارسال شد.`,
        [{ text: 'باشه', onPress: () => setStep('verification') }]
      );
    } catch (error: any) {
      Alert.alert('خطا', error.message || 'ارسال کد تایید ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!validateVerificationCode()) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "کد نامعتبر است");
      }

      setStep('newPassword');
    } catch (error: any) {
      Alert.alert('خطا', error.message || 'تایید کد ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validatePasswords()) return;

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          code: verificationCode,
          newPassword 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "خطا در تغییر رمز عبور");
      }

      Alert.alert(
        'موفقیت',
        'رمز عبور شما با موفقیت تغییر یافت.',
        [
          {
            text: 'ورود به حساب',
            onPress: () => {
              router.replace({
                pathname: '/(auth)/login',
                params: { email }
              });
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('خطا', error.message || 'تغییر رمز عبور ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "خطا در ارسال مجدد کد");
      }

      Alert.alert('توجه', 'کد جدید به ایمیل شما ارسال شد.');
    } catch (error: any) {
      Alert.alert('خطا', error.message || 'ارسال مجدد کد ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  // All the render functions (renderStepEmail, renderStepVerification, renderStepNewPassword) 
  // remain EXACTLY the same as your original file - NO UI CHANGES

  const renderStepEmail = () => (
    <>
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, styles.stepActive]} />
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, styles.stepInactive]} />
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, styles.stepInactive]} />
      </View>

      <Text style={styles.stepTitle}>بازیابی رمز عبور</Text>
      <Text style={styles.stepDescription}>
        لطفا آدرس ایمیل حساب کاربری خود را وارد کنید تا کد تایید برای شما ارسال شود.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>ایمیل</Text>
        <View style={[
          styles.inputContainer,
          validationErrors.email && styles.inputError
        ]}>
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
                setValidationErrors(prev => ({ ...prev, email: undefined }));
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>
        {validationErrors.email && (
          <Text style={styles.errorText}>{validationErrors.email}</Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleSendCode}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>در حال ارسال...</Text>
          </View>
        ) : (
          <Text style={styles.primaryButtonText}>ارسال کد تایید</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backToLogin}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Ionicons name="arrow-back" size={16} color={Colors.primary} style={styles.backIcon} />
        <Text style={styles.backToLoginText}>بازگشت به صفحه ورود</Text>
      </TouchableOpacity>
    </>
  );

  const renderStepVerification = () => (
    <>
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, styles.stepCompleted]} />
        <View style={styles.stepLineCompleted} />
        <View style={[styles.stepDot, styles.stepActive]} />
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, styles.stepInactive]} />
      </View>

      <Text style={styles.stepTitle}>تایید ایمیل</Text>
      <Text style={styles.stepDescription}>
        کد ۶ رقمی ارسال شده به ایمیل 
        <Text style={styles.emailHighlight}> {email} </Text>
        را وارد کنید.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>کد تایید</Text>
        <View style={[
          styles.inputContainer,
          validationErrors.verificationCode && styles.inputError
        ]}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={Colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="۶ ۵ ۴ ۳ ۲ ۱"
            placeholderTextColor={Colors.textSecondary}
            value={verificationCode}
            onChangeText={(text) => {
              const numericText = text.replace(/[^0-9]/g, '');
              if (numericText.length <= 6) {
                setVerificationCode(numericText);
                if (validationErrors.verificationCode) {
                  setValidationErrors(prev => ({ ...prev, verificationCode: undefined }));
                }
              }
            }}
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
          <Text style={styles.codeLength}>
            {verificationCode.length}/6
          </Text>
        </View>
        {validationErrors.verificationCode && (
          <Text style={styles.errorText}>{validationErrors.verificationCode}</Text>
        )}
      </View>

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>کد را دریافت نکردید؟</Text>
        <TouchableOpacity onPress={handleResendCode} disabled={loading}>
          <Text style={styles.resendLink}>ارسال مجدد کد</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleVerifyCode}
        disabled={loading || verificationCode.length !== 6}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>در حال تایید...</Text>
          </View>
        ) : (
          <Text style={styles.primaryButtonText}>تایید کد</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => {
          setStep('email');
          setVerificationCode('');
        }}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>ویرایش ایمیل</Text>
      </TouchableOpacity>
    </>
  );

  const renderStepNewPassword = () => (
    <>
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, styles.stepCompleted]} />
        <View style={styles.stepLineCompleted} />
        <View style={[styles.stepDot, styles.stepCompleted]} />
        <View style={styles.stepLineCompleted} />
        <View style={[styles.stepDot, styles.stepActive]} />
      </View>

      <Text style={styles.stepTitle}>رمز عبور جدید</Text>
      <Text style={styles.stepDescription}>
        لطفا رمز عبور جدید خود را وارد کنید.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>رمز عبور جدید</Text>
        <View style={[
          styles.inputContainer,
          validationErrors.newPassword && styles.inputError
        ]}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={Colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="رمز عبور جدید"
            placeholderTextColor={Colors.textSecondary}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              if (validationErrors.newPassword) {
                setValidationErrors(prev => ({ ...prev, newPassword: undefined }));
              }
            }}
            secureTextEntry={!showNewPassword}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
            style={styles.passwordToggle}
          >
            <Ionicons
              name={showNewPassword ? 'eye-off' : 'eye'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {validationErrors.newPassword && (
          <Text style={styles.errorText}>{validationErrors.newPassword}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>تکرار رمز عبور جدید</Text>
        <View style={[
          styles.inputContainer,
          validationErrors.confirmPassword && styles.inputError
        ]}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={Colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="تکرار رمز عبور جدید"
            placeholderTextColor={Colors.textSecondary}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (validationErrors.confirmPassword) {
                setValidationErrors(prev => ({ ...prev, confirmPassword: undefined }));
              }
            }}
            secureTextEntry={!showConfirmPassword}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.passwordToggle}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {validationErrors.confirmPassword && (
          <Text style={styles.errorText}>{validationErrors.confirmPassword}</Text>
        )}
      </View>

      <View style={styles.passwordRequirements}>
        <Text style={styles.requirementsTitle}>الزامات رمز عبور:</Text>
        <View style={styles.requirementItem}>
          <Ionicons
            name={newPassword.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={newPassword.length >= 6 ? Colors.success : Colors.textSecondary}
          />
          <Text style={styles.requirementText}>حداقل ۶ کاراکتر</Text>
        </View>
        <View style={styles.requirementItem}>
          <Ionicons
            name={newPassword && confirmPassword && newPassword === confirmPassword ? 'checkmark-circle' : 'ellipse-outline'}
            size={16}
            color={newPassword && confirmPassword && newPassword === confirmPassword ? Colors.success : Colors.textSecondary}
          />
          <Text style={styles.requirementText}>رمز عبور و تکرار آن مطابقت دارند</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.primaryButtonText}>در حال تغییر...</Text>
          </View>
        ) : (
          <Text style={styles.primaryButtonText}>تغییر رمز عبور</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setStep('verification')}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>بازگشت به مرحله قبل</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                disabled={loading}
              >
                <Ionicons name="arrow-forward" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.logoText}>آموزش فارسی</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.form}>
                {step === 'email' && renderStepEmail()}
                {step === 'verification' && renderStepVerification()}
                {step === 'newPassword' && renderStepNewPassword()}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    padding: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  form: {
    gap: 32,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepActive: {
    backgroundColor: Colors.primary,
  },
  stepInactive: {
    backgroundColor: Colors.border,
  },
  stepCompleted: {
    backgroundColor: Colors.success,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.border,
  },
  stepLineCompleted: {
    width: 40,
    height: 2,
    backgroundColor: Colors.success,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emailHighlight: {
    color: Colors.primary,
    fontWeight: '600',
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    textAlign: 'right',
  },
  codeLength: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  passwordToggle: {
    padding: 4,
    marginRight: 8,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    textAlign: 'right',
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  backIcon: {
    marginRight: 4,
  },
  backToLoginText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  resendText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resendLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  passwordRequirements: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});