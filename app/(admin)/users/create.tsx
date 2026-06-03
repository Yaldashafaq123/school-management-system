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
import { Picker } from '@react-native-picker/picker';

interface UserForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'teacher' | 'student';
  class_id?: number;
  status: 'active' | 'inactive';
}

export default function CreateUser() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserForm>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    status: 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'نام کاربر الزامی است';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'ایمیل الزامی است';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'ایمیل نامعتبر است';
    }

    if (!formData.password) {
      newErrors.password = 'رمز عبور الزامی است';
    } else if (formData.password.length < 6) {
      newErrors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    }

    if (formData.password !== formData.confirmPassword) {
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
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        'موفقیت',
        'کاربر جدید با موفقیت ایجاد شد',
        [
          {
            text: 'باشه',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('خطا', 'در ایجاد کاربر مشکلی پیش آمده');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof UserForm,
    placeholder: string,
    options?: {
      keyboardType?: 'default' | 'email-address' | 'phone-pad';
      secureTextEntry?: boolean;
      multiline?: boolean;
    }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, errors[field] && styles.inputError]}
        placeholder={placeholder}
        value={formData[field] as string}
        onChangeText={(text) => {
          setFormData({ ...formData, [field]: text });
          if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
          }
        }}
        placeholderTextColor={Colors.textSecondary}
        keyboardType={options?.keyboardType || 'default'}
        secureTextEntry={options?.secureTextEntry}
        multiline={options?.multiline}
        numberOfLines={options?.multiline ? 3 : 1}
      />
      {errors[field] ? (
        <Text style={styles.errorText}>{errors[field]}</Text>
      ) : null}
    </View>
  );

  const renderPicker = (label: string, field: keyof UserForm, items: Array<{ label: string; value: any }>) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.pickerContainer, errors[field] && styles.inputError]}>
        <Picker
          selectedValue={formData[field]}
          onValueChange={(value) => {
            setFormData({ ...formData, [field]: value });
            if (errors[field]) {
              setErrors({ ...errors, [field]: '' });
            }
          }}
          style={styles.picker}
        >
          {items.map((item, index) => (
            <Picker.Item key={index} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
      {errors[field] ? (
        <Text style={styles.errorText}>{errors[field]}</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header with Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ایجاد کاربر جدید</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات شخصی</Text>
          <View style={styles.card}>
            {renderInput('نام کامل', 'name', 'نام و نام خانوادگی')}
            {renderInput('ایمیل', 'email', 'example@email.com', { keyboardType: 'email-address' })}
            {renderInput('شماره تماس', 'phone', '۰۹۱۲۳۴۵۶۷۸۹', { keyboardType: 'phone-pad' })}
            
            {renderPicker('نقش', 'role', [
              { label: 'دانش‌آموز', value: 'student' },
              { label: 'مدرس', value: 'teacher' },
              { label: 'مدیر', value: 'admin' },
            ])}

            {renderPicker('وضعیت', 'status', [
              { label: 'فعال', value: 'active' },
              { label: 'غیرفعال', value: 'inactive' },
            ])}
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>امنیت</Text>
          <View style={styles.card}>
            {renderInput('رمز عبور', 'password', 'رمز عبور', { secureTextEntry: true })}
            {renderInput('تکرار رمز عبور', 'confirmPassword', 'تکرار رمز عبور', { secureTextEntry: true })}
            
            <View style={styles.passwordHint}>
              <Ionicons name="information-circle" size={16} color={Colors.textSecondary} />
              <Text style={styles.hintText}>
                رمز عبور باید حداقل ۶ کاراکتر و شامل حروف و اعداد باشد
              </Text>
            </View>
          </View>
        </View>

        {/* Class Selection (for students) */}
        {formData.role === 'student' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اطلاعات کلاس</Text>
            <View style={styles.card}>
              {renderPicker('کلاس', 'class_id', [
                { label: 'انتخاب کلاس', value: undefined },
                { label: 'کلاس هفتم', value: 7 },
                { label: 'کلاس هشتم', value: 8 },
                { label: 'کلاس نهم', value: 9 },
                { label: 'کلاس دهم', value: 10 },
                { label: 'کلاس یازدهم', value: 11 },
                { label: 'کلاس دوازدهم', value: 12 },
              ])}
            </View>
          </View>
        )}

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات اضافی</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>توضیحات اضافی</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="توضیحات اختیاری..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
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
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>ایجاد کاربر</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Header styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  headerRightPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  passwordHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  hintText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
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
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
  },
});