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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../../constants/Colors';
import { Header } from '../../../components/Header';
import { Picker } from '@react-native-picker/picker';

interface CourseForm {
  title: string;
  description: string;
  long_description: string;
  teacher_id: number;
  category: string;
  subcategory: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  is_free: boolean;
  discount_price?: number;
  duration: number;
  status: 'published' | 'draft';
  featured: boolean;
  certificate_available: boolean;
  requirements: string[];
  learning_outcomes: string[];
  thumbnail_url?: string;
}

export default function CreateCourse() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<CourseForm>({
    title: '',
    description: '',
    long_description: '',
    teacher_id: 1,
    category: 'ریاضی',
    subcategory: 'متوسطه اول',
    level: 'intermediate',
    price: 0,
    is_free: false,
    duration: 0,
    status: 'draft',
    featured: false,
    certificate_available: false,
    requirements: ['', ''],
    learning_outcomes: ['', '', ''],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'عنوان دوره الزامی است';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'توضیحات کوتاه الزامی است';
    }

    if (!formData.long_description.trim()) {
      newErrors.long_description = 'توضیحات کامل الزامی است';
    }

    if (formData.duration <= 0) {
      newErrors.duration = 'مدت زمان دوره باید بیشتر از صفر باشد';
    }

    if (!formData.is_free && formData.price <= 0) {
      newErrors.price = 'قیمت دوره باید بیشتر از صفر باشد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploadingImage(true);
        // TODO: Upload image to server
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const imageUri = result.assets[0].uri;
        setFormData({ ...formData, thumbnail_url: imageUri });
        Alert.alert('موفقیت', 'تصویر با موفقیت آپلود شد');
      }
    } catch (error) {
      Alert.alert('خطا', 'در انتخاب تصویر مشکلی پیش آمده');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, ''],
    });
  };

  const handleRemoveRequirement = (index: number) => {
    const newRequirements = [...formData.requirements];
    newRequirements.splice(index, 1);
    setFormData({ ...formData, requirements: newRequirements });
  };

  const handleUpdateRequirement = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const handleAddLearningOutcome = () => {
    setFormData({
      ...formData,
      learning_outcomes: [...formData.learning_outcomes, ''],
    });
  };

  const handleRemoveLearningOutcome = (index: number) => {
    const newOutcomes = [...formData.learning_outcomes];
    newOutcomes.splice(index, 1);
    setFormData({ ...formData, learning_outcomes: newOutcomes });
  };

  const handleUpdateLearningOutcome = (index: number, value: string) => {
    const newOutcomes = [...formData.learning_outcomes];
    newOutcomes[index] = value;
    setFormData({ ...formData, learning_outcomes: newOutcomes });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      // TODO: Replace with actual API call using apiService
      await new Promise(resolve => setTimeout(resolve, 1500));

      Alert.alert(
        'موفقیت',
        'دوره جدید با موفقیت ایجاد شد',
        [
          {
            text: 'باشه',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('خطا', 'در ایجاد دوره مشکلی پیش آمده');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof CourseForm,
    placeholder: string,
    options?: {
      keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
      multiline?: boolean;
      numberOfLines?: number;
    }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          errors[field] && styles.inputError,
          options?.multiline && styles.textArea,
        ]}
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
        multiline={options?.multiline}
        numberOfLines={options?.multiline ? (options.numberOfLines || 3) : 1}
        textAlignVertical={options?.multiline ? 'top' : 'center'}
      />
      {errors[field] ? (
        <Text style={styles.errorText}>{errors[field]}</Text>
      ) : null}
    </View>
  );

  const renderNumberInput = (
    label: string,
    field: keyof CourseForm,
    placeholder: string,
    suffix?: string
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.numberInputContainer, errors[field] && styles.inputError]}>
        <TextInput
          style={styles.numberInput}
          placeholder={placeholder}
          value={formData[field] ? formData[field].toString() : ''}
          onChangeText={(text) => {
            const value = text ? parseInt(text) || 0 : 0;
            setFormData({ ...formData, [field]: value });
            if (errors[field]) {
              setErrors({ ...errors, [field]: '' });
            }
          }}
          placeholderTextColor={Colors.textSecondary}
          keyboardType="numeric"
        />
        {suffix && <Text style={styles.numberInputSuffix}>{suffix}</Text>}
      </View>
      {errors[field] ? (
        <Text style={styles.errorText}>{errors[field]}</Text>
      ) : null}
    </View>
  );

  const renderPicker = (
    label: string,
    field: keyof CourseForm,
    items: Array<{ label: string; value: any }>
  ) => (
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

  const renderSwitch = (
    label: string,
    field: keyof CourseForm,
    description?: string
  ) => (
    <View style={styles.switchGroup}>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{label}</Text>
        <TouchableOpacity
          style={[
            styles.switchButton,
            formData[field] ? styles.switchButtonActive : styles.switchButtonInactive,
          ]}
          onPress={() => setFormData({ ...formData, [field]: !formData[field] })}
        >
          <View style={[
            styles.switchCircle,
            formData[field] ? styles.switchCircleActive : styles.switchCircleInactive,
          ]} />
        </TouchableOpacity>
      </View>
      {description && <Text style={styles.switchDescription}>{description}</Text>}
    </View>
  );

  const teachers = [
    { id: 1, name: 'دکتر علی محمدی' },
    { id: 2, name: 'مهندس مریم رضایی' },
    { id: 3, name: 'استاد محمد کریمی' },
  ];

  const categories = ['ریاضی', 'برنامه‌نویسی', 'زبان', 'علوم', 'تاریخ', 'هنر'];
  const subcategories = ['متوسطه اول', 'متوسطه دوم', 'دانشگاه', 'عمومی'];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="ایجاد دوره جدید" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات پایه</Text>
          <View style={styles.card}>
            {renderInput('عنوان دوره', 'title', 'عنوان دوره...')}
            
            {renderInput('توضیحات کوتاه', 'description', 'توضیحات مختصر دوره...', {
              multiline: true,
              numberOfLines: 2,
            })}
            
            {renderInput('توضیحات کامل', 'long_description', 'توضیحات کامل دوره...', {
              multiline: true,
              numberOfLines: 6,
            })}

            {/* Teacher Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>مدرس دوره</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.teacher_id}
                  onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                  style={styles.picker}
                >
                  {teachers.map((teacher) => (
                    <Picker.Item key={teacher.id} label={teacher.name} value={teacher.id} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </View>

        {/* Thumbnail Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تصویر دوره</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.imageUpload}
              onPress={pickImage}
              disabled={uploadingImage}
            >
              {formData.thumbnail_url ? (
                <Image
                  source={{ uri: formData.thumbnail_url }}
                  style={styles.uploadedImage}
                />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  {uploadingImage ? (
                    <ActivityIndicator color={Colors.primary} />
                  ) : (
                    <>
                      <Ionicons name="camera" size={48} color={Colors.textSecondary} />
                      <Text style={styles.uploadText}>انتخاب تصویر</Text>
                      <Text style={styles.uploadSubtext}>
                        تصویر دوره با نسبت ۱۶:۹
                      </Text>
                    </>
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Course Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>جزئیات دوره</Text>
          <View style={styles.card}>
            <View style={styles.detailsGrid}>
              <View style={styles.gridItem}>
                {renderPicker('دسته‌بندی', 'category', 
                  categories.map(cat => ({ label: cat, value: cat }))
                )}
              </View>
              <View style={styles.gridItem}>
                {renderPicker('زیردسته', 'subcategory', 
                  subcategories.map(sub => ({ label: sub, value: sub }))
                )}
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.gridItem}>
                {renderPicker('سطح', 'level', [
                  { label: 'مبتدی', value: 'beginner' },
                  { label: 'متوسط', value: 'intermediate' },
                  { label: 'پیشرفته', value: 'advanced' },
                ])}
              </View>
              <View style={styles.gridItem}>
                {renderNumberInput('مدت زمان', 'duration', '۰', 'ساعت')}
              </View>
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>قیمت‌گذاری</Text>
          <View style={styles.card}>
            {renderSwitch('دوره رایگان', 'is_free')}
            
            {!formData.is_free && (
              <>
                {renderNumberInput('قیمت دوره', 'price', '۰', 'تومان')}
                {renderNumberInput('قیمت با تخفیف', 'discount_price', 'اختیاری', 'تومان')}
              </>
            )}
          </View>
        </View>

        {/* Course Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تنظیمات دوره</Text>
          <View style={styles.card}>
            <View style={styles.detailsGrid}>
              <View style={styles.gridItem}>
                {renderPicker('وضعیت', 'status', [
                  { label: 'پیش‌نویس', value: 'draft' },
                  { label: 'منتشر شده', value: 'published' },
                ])}
              </View>
              <View style={styles.gridItem}>
                {renderSwitch('ویژه', 'featured', 'نمایش در صفحه اصلی')}
              </View>
            </View>
            
            {renderSwitch('ارائه گواهینامه', 'certificate_available')}
          </View>
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>پیش‌نیازها</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddRequirement}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            {formData.requirements.map((req, index) => (
              <View key={index} style={styles.listItem}>
                <TextInput
                  style={styles.listInput}
                  placeholder={`پیش‌نیاز ${index + 1}`}
                  value={req}
                  onChangeText={(text) => handleUpdateRequirement(index, text)}
                  placeholderTextColor={Colors.textSecondary}
                />
                {formData.requirements.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveRequirement(index)}
                  >
                    <Ionicons name="close" size={20} color={Colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Learning Outcomes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>اهداف یادگیری</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddLearningOutcome}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            {formData.learning_outcomes.map((outcome, index) => (
              <View key={index} style={styles.listItem}>
                <TextInput
                  style={styles.listInput}
                  placeholder={`هدف یادگیری ${index + 1}`}
                  value={outcome}
                  onChangeText={(text) => handleUpdateLearningOutcome(index, text)}
                  placeholderTextColor={Colors.textSecondary}
                />
                {formData.learning_outcomes.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveLearningOutcome(index)}
                  >
                    <Ionicons name="close" size={20} color={Colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
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
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>ایجاد دوره</Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingRight: 12,
  },
  numberInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
  },
  numberInputSuffix: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
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
  switchGroup: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  switchDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  switchButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  switchButtonActive: {
    backgroundColor: Colors.primary,
  },
  switchButtonInactive: {
    backgroundColor: Colors.border,
  },
  switchCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  switchCircleActive: {
    backgroundColor: '#fff',
    marginLeft: 22,
  },
  switchCircleInactive: {
    backgroundColor: Colors.textSecondary,
    marginRight: 22,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  gridItem: {
    flex: 1,
  },
  imageUpload: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  uploadText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  listInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'right',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
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