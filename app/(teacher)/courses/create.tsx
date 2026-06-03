import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../../constants/Colors';
import { Header } from '../../../components/Header';

const subjects = [
  'ریاضی',
  'فیزیک',
  'شیمی',
  'ادبیات فارسی',
  'زبان انگلیسی',
  'علوم تجربی',
  'تاریخ',
  'جغرافیا',
  'دینی',
  'هنر',
  'ورزش',
];

const gradeLevels = [
  'پیش‌دبستانی',
  'اول دبستان',
  'دوم دبستان',
  'سوم دبستان',
  'چهارم دبستان',
  'پنجم دبستان',
  'ششم دبستان',
  'هفتم',
  'هشتم',
  'نهم',
  'دهم',
  'یازدهم',
  'دوازدهم',
  'کنکور',
  'دانشگاهی',
];

export default function CreateCourse() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [courseImage, setCourseImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    gradeLevel: '',
    description: '',
    objectives: [''],
    requirements: [''],
    price: '',
    duration: '',
    schedule: '',
    capacity: '',
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('مجوز لازم', 'برای انتخاب عکس به دسترسی گالری نیاز دارید.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCourseImage(result.assets[0].uri);
    }
  };

  const handleAddItem = (type: 'objectives' | 'requirements') => {
    setFormData({
      ...formData,
      [type]: [...formData[type], '']
    });
  };

  const handleUpdateItem = (type: 'objectives' | 'requirements', index: number, value: string) => {
    const newItems = [...formData[type]];
    newItems[index] = value;
    setFormData({ ...formData, [type]: newItems });
  };

  const handleRemoveItem = (type: 'objectives' | 'requirements', index: number) => {
    const newItems = formData[type].filter((_, i) => i !== index);
    setFormData({ ...formData, [type]: newItems });
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          Alert.alert('خطا', 'عنوان دوره را وارد کنید.');
          return false;
        }
        if (!formData.subject) {
          Alert.alert('خطا', 'درس را انتخاب کنید.');
          return false;
        }
        if (!formData.gradeLevel) {
          Alert.alert('خطا', 'پایه تحصیلی را انتخاب کنید.');
          return false;
        }
        return true;
      case 2:
        if (!formData.description.trim()) {
          Alert.alert('خطا', 'توضیحات دوره را وارد کنید.');
          return false;
        }
        return true;
      case 3:
        if (!formData.price) {
          Alert.alert('خطا', 'قیمت دوره را وارد کنید.');
          return false;
        }
        if (!formData.duration) {
          Alert.alert('خطا', 'مدت دوره را وارد کنید.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'موفقیت',
        'دوره با موفقیت ایجاد شد.',
        [{ text: 'باشه', onPress: () => router.push('/(teacher)/courses') }]
      );
    }, 1500);
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>اطلاعات پایه دوره</Text>
      
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {courseImage ? (
          <Image source={{ uri: courseImage }} style={styles.courseImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image" size={40} color={Colors.textSecondary} />
            <Text style={styles.imagePlaceholderText}>عکس دوره را انتخاب کنید</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.formGroup}>
        <Text style={styles.label}>عنوان دوره *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => setFormData({...formData, title: text})}
          placeholder="مثال: ریاضی پایه هفتم"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>درس *</Text>
        <View style={styles.tagsContainer}>
          {subjects.map((subject) => (
            <TouchableOpacity
              key={subject}
              style={[
                styles.tag,
                formData.subject === subject && styles.tagSelected
              ]}
              onPress={() => setFormData({...formData, subject})}
            >
              <Text style={[
                styles.tagText,
                formData.subject === subject && styles.tagTextSelected
              ]}>
                {subject}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>پایه تحصیلی *</Text>
        <View style={styles.tagsContainer}>
          {gradeLevels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.tag,
                formData.gradeLevel === level && styles.tagSelected
              ]}
              onPress={() => setFormData({...formData, gradeLevel: level})}
            >
              <Text style={[
                styles.tagText,
                formData.gradeLevel === level && styles.tagTextSelected
              ]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>توضیحات و اهداف</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>توضیحات دوره *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => setFormData({...formData, description: text})}
          placeholder="توضیحات کامل دوره را بنویسید..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>اهداف یادگیری</Text>
        {formData.objectives.map((objective, index) => (
          <View key={index} style={styles.listItem}>
            <TextInput
              style={[styles.input, styles.listInput]}
              value={objective}
              onChangeText={(text) => handleUpdateItem('objectives', index, text)}
              placeholder={`هدف ${index + 1}`}
              placeholderTextColor={Colors.textSecondary}
            />
            {formData.objectives.length > 1 && (
              <TouchableOpacity
                style={styles.removeItemButton}
                onPress={() => handleRemoveItem('objectives', index)}
              >
                <Ionicons name="close" size={20} color={Colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity
          style={styles.addItemButton}
          onPress={() => handleAddItem('objectives')}
        >
          <Ionicons name="add" size={20} color={Colors.primary} />
          <Text style={styles.addItemText}>افزودن هدف یادگیری</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>پیش‌نیازها</Text>
        {formData.requirements.map((requirement, index) => (
          <View key={index} style={styles.listItem}>
            <TextInput
              style={[styles.input, styles.listInput]}
              value={requirement}
              onChangeText={(text) => handleUpdateItem('requirements', index, text)}
              placeholder={`پیش‌نیاز ${index + 1}`}
              placeholderTextColor={Colors.textSecondary}
            />
            {formData.requirements.length > 1 && (
              <TouchableOpacity
                style={styles.removeItemButton}
                onPress={() => handleRemoveItem('requirements', index)}
              >
                <Ionicons name="close" size={20} color={Colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity
          style={styles.addItemButton}
          onPress={() => handleAddItem('requirements')}
        >
          <Ionicons name="add" size={20} color={Colors.primary} />
          <Text style={styles.addItemText}>افزودن پیش‌نیاز</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>تنظیمات دوره</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>قیمت دوره (تومان) *</Text>
        <TextInput
          style={styles.input}
          value={formData.price}
          onChangeText={(text) => setFormData({...formData, price: text})}
          placeholder="مثال: ۲۵۰۰۰۰"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>مدت دوره (ساعت) *</Text>
        <TextInput
          style={styles.input}
          value={formData.duration}
          onChangeText={(text) => setFormData({...formData, duration: text})}
          placeholder="مثال: ۲۰"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>ظرفیت دوره (نفر)</Text>
        <TextInput
          style={styles.input}
          value={formData.capacity}
          onChangeText={(text) => setFormData({...formData, capacity: text})}
          placeholder="مثال: ۵۰ (خالی = نامحدود)"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>زمان‌بندی کلاس‌ها</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.schedule}
          onChangeText={(text) => setFormData({...formData, schedule: text})}
          placeholder="مثال: روزهای زوج ساعت ۱۶-۱۸"
          placeholderTextColor={Colors.textSecondary}
          multiline
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>خلاصه دوره</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>عنوان:</Text>
          <Text style={styles.summaryValue}>{formData.title}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>درس:</Text>
          <Text style={styles.summaryValue}>{formData.subject}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>پایه:</Text>
          <Text style={styles.summaryValue}>{formData.gradeLevel}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>قیمت:</Text>
          <Text style={styles.summaryValue}>
            {parseInt(formData.price || '0').toLocaleString('fa-IR')} تومان
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="ایجاد دوره جدید"
        showBack
        onBackPress={() => router.back()}
      />

      <View style={styles.progressBar}>
        {[1, 2, 3].map((stepNumber) => (
          <View key={stepNumber} style={styles.progressStep}>
            <View style={[
              styles.progressDot,
              step >= stepNumber && styles.progressDotActive
            ]}>
              <Text style={[
                styles.progressDotText,
                step >= stepNumber && styles.progressDotTextActive
              ]}>
                {stepNumber}
              </Text>
            </View>
            <Text style={[
              styles.progressLabel,
              step >= stepNumber && styles.progressLabelActive
            ]}>
              {stepNumber === 1 && 'اطلاعات پایه'}
              {stepNumber === 2 && 'توضیحات'}
              {stepNumber === 3 && 'تنظیمات'}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
            <Text style={styles.backButtonText}>مرحله قبل</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.nextButton, loading && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          <Ionicons
            name={step === 3 ? 'checkmark' : 'arrow-back'}
            size={20}
            color="#fff"
          />
          <Text style={styles.nextButtonText}>
            {loading ? 'در حال ایجاد...' : step === 3 ? 'ایجاد دوره' : 'مرحله بعد'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
  },
  progressDotText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  progressDotTextActive: {
    color: '#fff',
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressLabelActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
  },
  imagePicker: {
    marginBottom: 24,
  },
  courseImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tagText: {
    fontSize: 12,
    color: Colors.text,
  },
  tagTextSelected: {
    color: '#fff',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  listInput: {
    flex: 1,
  },
  removeItemButton: {
    padding: 8,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    gap: 8,
  },
  addItemText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  summary: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});