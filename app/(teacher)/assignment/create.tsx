import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../../constants/Colors';
import { Header } from '../../../components/Header';

const mockCourses = [
  { id: 1, title: 'ریاضی هفتم', student_count: 45 },
  { id: 2, title: 'علوم تجربی', student_count: 38 },
  { id: 3, title: 'ادبیات فارسی', student_count: 52 },
];

const assignmentTypes = [
  { id: 'homework', title: 'تکلیف خانگی', icon: 'home' },
  { id: 'quiz', title: 'آزمون کوتاه', icon: 'time' },
  { id: 'project', title: 'پروژه', icon: 'briefcase' },
  { id: 'essay', title: 'مقاله', icon: 'document-text' },
];

export default function CreateAssignment() {
  const { course } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days from now
  const [formData, setFormData] = useState({
    title: '',
    courseId: course || '',
    type: 'homework',
    description: '',
    instructions: '',
    attachments: [] as string[],
    points: '20',
    max_points: '20',
    allow_late_submission: false,
    allow_resubmission: false,
    notify_students: true,
    is_published: false,
  });

  useEffect(() => {
    if (course) {
      setFormData(prev => ({ ...prev, courseId: course as string }));
    }
  }, [course]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(dueDate.getHours(), dueDate.getMinutes());
      setDueDate(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDate = new Date(dueDate);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDueDate(newDate);
    }
  };

  const handleAddAttachment = () => {
    Alert.alert(
      'افزودن پیوست',
      'نوع پیوست را انتخاب کنید:',
      [
        { text: 'فایل PDF', onPress: () => addAttachment('pdf') },
        { text: 'فایل ورد', onPress: () => addAttachment('word') },
        { text: 'عکس', onPress: () => addAttachment('image') },
        { text: 'لینک', onPress: () => {
          Alert.prompt('افزودن لینک', 'آدرس لینک را وارد کنید:', (url) => {
            if (url) addAttachment('link', url);
          });
        }},
        { text: 'لغو', style: 'cancel' },
      ]
    );
  };

  const addAttachment = (type: string, url?: string) => {
    const newAttachment = type === 'link' && url ? url : `attachment_${formData.attachments.length + 1}.${type}`;
    setFormData({
      ...formData,
      attachments: [...formData.attachments, newAttachment]
    });
  };

  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...formData.attachments];
    newAttachments.splice(index, 1);
    setFormData({ ...formData, attachments: newAttachments });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('خطا', 'عنوان تکلیف را وارد کنید.');
      return false;
    }
    if (!formData.courseId) {
      Alert.alert('خطا', 'لطفاً دوره را انتخاب کنید.');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('خطا', 'توضیحات تکلیف را وارد کنید.');
      return false;
    }
    if (!formData.max_points || parseInt(formData.max_points) <= 0) {
      Alert.alert('خطا', 'نمره کل معتبر وارد کنید.');
      return false;
    }
    return true;
  };

  const handleSaveDraft = () => {
    if (validateForm()) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        Alert.alert('موفقیت', 'تکلیف به صورت پیش‌نویس ذخیره شد.', [
          { text: 'باشه', onPress: () => router.back() }
        ]);
      }, 1500);
    }
  };

  const handlePublish = () => {
    if (validateForm()) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          'موفقیت',
          'تکلیف با موفقیت منتشر شد و به دانش‌آموزان اطلاع‌رسانی شد.',
          [{ text: 'باشه', onPress: () => router.back() }]
        );
      }, 1500);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const selectedCourse = mockCourses.find(c => c.id.toString() === formData.courseId);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="ایجاد تکلیف جدید"
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات اصلی</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>عنوان تکلیف *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({...formData, title: text})}
              placeholder="مثال: تمرین فصل اول - اعداد صحیح"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>دوره *</Text>
            <View style={styles.coursesGrid}>
              {mockCourses.map((courseItem) => (
                <TouchableOpacity
                  key={courseItem.id}
                  style={[
                    styles.courseOption,
                    formData.courseId === courseItem.id.toString() && styles.courseOptionSelected
                  ]}
                  onPress={() => setFormData({...formData, courseId: courseItem.id.toString()})}
                >
                  <View style={styles.courseOptionContent}>
                    <Text style={[
                      styles.courseOptionTitle,
                      formData.courseId === courseItem.id.toString() && styles.courseOptionTitleSelected
                    ]}>
                      {courseItem.title}
                    </Text>
                    <Text style={styles.courseOptionStudents}>
                      {courseItem.student_count} دانش‌آموز
                    </Text>
                  </View>
                  {formData.courseId === courseItem.id.toString() && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>نوع تکلیف</Text>
            <View style={styles.typeGrid}>
              {assignmentTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeOption,
                    formData.type === type.id && styles.typeOptionSelected
                  ]}
                  onPress={() => setFormData({...formData, type: type.id})}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={24}
                    color={formData.type === type.id ? '#fff' : Colors.primary}
                  />
                  <Text style={[
                    styles.typeText,
                    formData.type === type.id && styles.typeTextSelected
                  ]}>
                    {type.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Description & Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>توضیحات و دستورالعمل</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>توضیحات تکلیف *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({...formData, description: text})}
              placeholder="توضیحات کامل تکلیف را بنویسید..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>دستورالعمل‌های ارسال</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.instructions}
              onChangeText={(text) => setFormData({...formData, instructions: text})}
              placeholder="نحوه ارسال تکلیف و فرمت مورد نیاز را مشخص کنید..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Attachments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>پیوست‌ها</Text>
            <TouchableOpacity
              style={styles.addAttachmentButton}
              onPress={handleAddAttachment}
            >
              <Ionicons name="add" size={20} color={Colors.primary} />
              <Text style={styles.addAttachmentText}>افزودن پیوست</Text>
            </TouchableOpacity>
          </View>

          {formData.attachments.length === 0 ? (
            <View style={styles.emptyAttachments}>
              <Ionicons name="attach" size={40} color={Colors.textSecondary} />
              <Text style={styles.emptyAttachmentsText}>
                هنوز فایل‌ای پیوست نشده است
              </Text>
            </View>
          ) : (
            <View style={styles.attachmentsList}>
              {formData.attachments.map((attachment, index) => (
                <View key={index} style={styles.attachmentItem}>
                  <View style={styles.attachmentInfo}>
                    <Ionicons name="document" size={20} color={Colors.primary} />
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      {attachment}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveAttachment(index)}
                  >
                    <Ionicons name="close" size={20} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Grading & Due Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نمره‌دهی و مهلت</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>نمره کل *</Text>
            <View style={styles.pointsContainer}>
              <TextInput
                style={[styles.input, styles.pointsInput]}
                value={formData.max_points}
                onChangeText={(text) => setFormData({...formData, max_points: text})}
                placeholder="۲۰"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="numeric"
              />
              <Text style={styles.pointsLabel}>نمره</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>مهلت تحویل</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color={Colors.primary} />
                <Text style={styles.dateTimeText}>{formatDate(dueDate)}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time" size={20} color={Colors.primary} />
                <Text style={styles.dateTimeText}>{formatTime(dueDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={dueDate}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تنظیمات</Text>
          
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingTitle}>ارسال با تاخیر</Text>
                <Text style={styles.settingDescription}>
                  اجازه ارسال تکلیف پس از مهلت مقرر
                </Text>
              </View>
              <Switch
                value={formData.allow_late_submission}
                onValueChange={(value) => setFormData({...formData, allow_late_submission: value})}
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingTitle}>ارسال مجدد</Text>
                <Text style={styles.settingDescription}>
                  اجازه ارسال مجدد تکلیف پس از تصحیح
                </Text>
              </View>
              <Switch
                value={formData.allow_resubmission}
                onValueChange={(value) => setFormData({...formData, allow_resubmission: value})}
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={styles.settingTitle}>اعلان به دانش‌آموزان</Text>
                <Text style={styles.settingDescription}>
                  ارسال اعلان برای دانش‌آموزان دوره
                </Text>
              </View>
              <Switch
                value={formData.notify_students}
                onValueChange={(value) => setFormData({...formData, notify_students: value})}
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>خلاصه</Text>
          <View style={styles.summary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>عنوان:</Text>
              <Text style={styles.summaryValue}>{formData.title || '-'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>دوره:</Text>
              <Text style={styles.summaryValue}>{selectedCourse?.title || 'انتخاب نشده'}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>نوع:</Text>
              <Text style={styles.summaryValue}>
                {assignmentTypes.find(t => t.id === formData.type)?.title || '-'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>مهلت:</Text>
              <Text style={styles.summaryValue}>
                {formatDate(dueDate)} ساعت {formatTime(dueDate)}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>نمره کل:</Text>
              <Text style={styles.summaryValue}>{formData.max_points} نمره</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.draftButton, loading && styles.draftButtonDisabled]}
          onPress={handleSaveDraft}
          disabled={loading}
        >
          
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.publishButton, loading && styles.publishButtonDisabled]}
          onPress={handlePublish}
          disabled={loading}
        >
          <Ionicons name="send" size={20} color="#fff" />
          <Text style={styles.publishButtonText}>
            {loading ? 'در حال ذخیره...' : 'انتشار تکلیف'}
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
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  coursesGrid: {
    gap: 8,
  },
  courseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courseOptionSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: Colors.primary,
  },
  courseOptionContent: {
    flex: 1,
  },
  courseOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  courseOptionTitleSelected: {
    color: Colors.primary,
  },
  courseOptionStudents: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  typeOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
  },
  typeTextSelected: {
    color: '#fff',
  },
  addAttachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  addAttachmentText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyAttachments: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyAttachmentsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  attachmentsList: {
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  attachmentName: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pointsInput: {
    flex: 1,
  },
  pointsLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  dateTimeText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  settingsList: {
    gap: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  summary: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
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
    padding: 20,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  draftButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  draftButtonDisabled: {
    opacity: 0.7,
  },
  draftButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  publishButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  publishButtonDisabled: {
    opacity: 0.7,
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});