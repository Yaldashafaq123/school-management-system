// app/(admin)/courses.tsx
import { Header } from '@/components/Header';
import { Colors } from '@/constants/Colors';
import { Course } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CourseManagementScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: 'ریاضی پایه هفتم',
      slug: 'basic-math',
      description: 'یادگیری مفاهیم پایه ریاضی',
      thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500',
      teacher_id: 2,
      teacher_name: 'آقای محمدی',
      class_id: 1,
      subject_id: 1,
      is_general: false,
      progress: 0,
      enrolled: false,
    },
    // Add more courses...
  ]);
  
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    class_id: null as number | null,
    subject_id: null as number | null,
    teacher_id: 0 as number,
    is_general: false,
  });

  const classes = [
    { id: 1, name: 'کلاس هفتم' },
    { id: 2, name: 'کلاس هشتم' },
    { id: 3, name: 'کلاس نهم' },
  ];

  const subjects = [
    { id: 1, name: 'ریاضی' },
    { id: 2, name: 'علوم' },
    { id: 3, name: 'ادبیات فارسی' },
  ];

  const teachers = [
    { id: 1, name: 'آقای احمدی' },
    { id: 2, name: 'خانم رضایی' },
    { id: 3, name: 'آقای کریمی' },
  ];

  const handleCreateCourse = async () => {
    if (!newCourse.title.trim() || !newCourse.description.trim()) {
      Alert.alert('خطا', 'لطفا عنوان و توضیحات دوره را وارد کنید');
      return;
    }

    // Validate teacher selection
    if (!newCourse.teacher_id || newCourse.teacher_id === 0) {
      Alert.alert('خطا', 'لطفا مدرس دوره را انتخاب کنید');
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const teacher = teachers.find(t => t.id === newCourse.teacher_id);
      
      const course: Course = {
        id: courses.length + 1,
        title: newCourse.title,
        slug: newCourse.title.toLowerCase().replace(/\s+/g, '-'),
        description: newCourse.description,
        thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500',
        teacher_id: newCourse.teacher_id,
        teacher_name: teacher?.name || '',
        class_id: newCourse.class_id,
        subject_id: newCourse.subject_id,
        is_general: newCourse.is_general,
        progress: 0,
        enrolled: false,
      };

      setCourses([...courses, course]);
      setNewCourse({
        title: '',
        description: '',
        class_id: null,
        subject_id: null,
        teacher_id: 0,
        is_general: false,
      });
      setShowCourseModal(false);
      
      Alert.alert('موفقیت', 'دوره جدید با موفقیت ایجاد شد');
    } catch {
      Alert.alert('خطا', 'ایجاد دوره ناموفق بود');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="مدیریت دوره‌ها"
        showBack
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity onPress={() => setShowCourseModal(true)}>
            <Ionicons name="add-circle" size={24} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Course Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="book" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{courses.length}</Text>
            <Text style={styles.statLabel}>دوره کل</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="school" size={24} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>{courses.filter(c => !c.is_general).length}</Text>
            <Text style={styles.statLabel}>دوره کلاسی</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <Ionicons name="earth" size={24} color={Colors.secondary} />
            </View>
            <Text style={styles.statValue}>{courses.filter(c => c.is_general).length}</Text>
            <Text style={styles.statLabel}>دوره عمومی</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Ionicons name="people" size={24} color={Colors.warning} />
            </View>
            <Text style={styles.statValue}>1245</Text>
            <Text style={styles.statLabel}>دانش‌آموز</Text>
          </View>
        </View>

        {/* Courses List */}
        <View style={styles.coursesList}>
          {courses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={styles.courseCard}
              onPress={() => router.push(`/course/${course.id}` as any)}
            >
              <Image
                source={{ uri: course.thumbnail_url }}
                style={styles.courseImage}
              />
              <View style={styles.courseContent}>
                <View style={styles.courseHeader}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <View style={[
                    styles.courseTypeBadge,
                    { backgroundColor: course.is_general ? `${Colors.secondary}20` : `${Colors.primary}20` }
                  ]}>
                    <Text style={[
                      styles.courseTypeText,
                      { color: course.is_general ? Colors.secondary : Colors.primary }
                    ]}>
                      {course.is_general ? 'عمومی' : 'کلاسی'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.courseDescription} numberOfLines={2}>
                  {course.description}
                </Text>
                
                <View style={styles.courseFooter}>
                  <View style={styles.courseInfo}>
                    <Ionicons name="person" size={14} color={Colors.textSecondary} />
                    <Text style={styles.courseTeacher}>{course.teacher_name}</Text>
                  </View>
                  <View style={styles.courseActions}>
                    <TouchableOpacity 
                      style={styles.courseActionButton}
                      onPress={() => {
                        // Handle edit
                      }}
                    >
                      <Ionicons name="create" size={18} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.courseActionButton}
                      onPress={() => {
                        Alert.alert(
                          'حذف دوره',
                          'آیا از حذف این دوره اطمینان دارید؟',
                          [
                            { text: 'لغو', style: 'cancel' },
                            { 
                              text: 'حذف', 
                              style: 'destructive',
                              onPress: () => {
                                setCourses(courses.filter(c => c.id !== course.id));
                              }
                            },
                          ]
                        );
                      }}
                    >
                      <Ionicons name="trash" size={18} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Create Course Modal */}
      <Modal
        visible={showCourseModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCourseModal(false)}>
              <Text style={styles.modalCancel}>لغو</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>ایجاد دوره جدید</Text>
            <TouchableOpacity onPress={handleCreateCourse}>
              <Text style={styles.modalSave}>ذخیره</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>عنوان دوره</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="عنوان دوره را وارد کنید"
                  value={newCourse.title}
                  onChangeText={(text) => setNewCourse(prev => ({ ...prev, title: text }))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>توضیحات دوره</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="توضیحات کامل دوره را وارد کنید"
                  value={newCourse.description}
                  onChangeText={(text) => setNewCourse(prev => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>نوع دوره</Text>
                <View style={styles.typeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      !newCourse.is_general && styles.typeButtonActive,
                    ]}
                    onPress={() => setNewCourse(prev => ({ ...prev, is_general: false }))}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      !newCourse.is_general && styles.typeButtonTextActive,
                    ]}>
                      دوره کلاسی
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      newCourse.is_general && styles.typeButtonActive,
                    ]}
                    onPress={() => setNewCourse(prev => ({ ...prev, is_general: true }))}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      newCourse.is_general && styles.typeButtonTextActive,
                    ]}>
                      دوره عمومی
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {!newCourse.is_general && (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>کلاس</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={newCourse.class_id}
                        onValueChange={(value) => setNewCourse(prev => ({ ...prev, class_id: value as number | null }))}
                        style={styles.picker}
                      >
                        <Picker.Item label="انتخاب کلاس" value={null} />
                        {classes.map((classItem) => (
                          <Picker.Item key={classItem.id} label={classItem.name} value={classItem.id} />
                        ))}
                      </Picker>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.formLabel}>درس</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={newCourse.subject_id}
                        onValueChange={(value) => setNewCourse(prev => ({ ...prev, subject_id: value as number | null }))}
                        style={styles.picker}
                      >
                        <Picker.Item label="انتخاب درس" value={null} />
                        {subjects.map((subject) => (
                          <Picker.Item key={subject.id} label={subject.name} value={subject.id} />
                        ))}
                      </Picker>
                    </View>
                  </View>
                </>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>مدرس</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newCourse.teacher_id}
                    onValueChange={(value) => setNewCourse(prev => ({ ...prev, teacher_id: value as number }))}
                    style={styles.picker}
                  >
                    <Picker.Item label="انتخاب مدرس" value={0} />
                    {teachers.map((teacher) => (
                      <Picker.Item key={teacher.id} label={teacher.name} value={teacher.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>تصویر دوره (اختیاری)</Text>
                <TouchableOpacity style={styles.imageUpload}>
                  <Ionicons name="image" size={24} color={Colors.textSecondary} />
                  <Text style={styles.imageUploadText}>انتخاب تصویر</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  coursesList: {
    gap: 16,
  },
  courseCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courseImage: {
    width: '100%',
    height: 150,
  },
  courseContent: {
    padding: 16,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  courseTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  courseTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  courseDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseTeacher: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  courseActions: {
    flexDirection: 'row',
    gap: 12,
  },
  courseActionButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalCancel: {
    fontSize: 16,
    color: Colors.danger,
  },
  modalSave: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  form: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  formInput: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 15,
    color: Colors.text,
    textAlign: 'right',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  pickerContainer: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  picker: {
    color: Colors.text,
  },
  imageUpload: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    gap: 12,
  },
  imageUploadText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});