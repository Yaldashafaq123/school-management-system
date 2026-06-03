// app/(teacher)/course/[id]/edit.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Switch,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Header } from '@/components/Header';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';

// Mock data for editing
const mockCourseData = {
  1: {
    id: 1,
    title: 'ریاضی پایه هفتم',
    slug: 'basic-math-7',
    description: 'آموزش کامل ریاضی کلاس هفتم با مثال‌های عملی و تمرین‌های متنوع',
    price: '1000000',
    subject_id: '1',
    class_id: '1',
    is_general: false,
    is_active: true,
    requirements: 'آشنایی با چهار عمل اصلی ریاضی\nمفاهیم اولیه اعداد',
    what_youll_learn: 'حل مسائل ریاضی پایه هفتم\nدرک مفاهیم هندسی\nکار با اعداد گویا',
    thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500',
    lessons: [
      {
        id: 1,
        title: 'آشنایی با اعداد صحیح',
        description: 'مقدمه‌ای بر اعداد صحیح و کاربردهای آن',
        order: 1,
        video_url: 'https://example.com/video1.mp4',
        duration: '15:30',
        is_free: true,
        thumbnail_url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500',
        created_at: '2024-01-15',
      },
      {
        id: 2,
        title: 'جمع و تفریق اعداد صحیح',
        description: 'آموزش عملیات جمع و تفریق روی اعداد صحیح',
        order: 2,
        video_url: 'https://example.com/video2.mp4',
        duration: '22:15',
        is_free: false,
        thumbnail_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500',
        created_at: '2024-01-20',
      },
      {
        id: 3,
        title: 'ضرب و تقسیم اعداد صحیح',
        description: 'آموزش عملیات ضرب و تقسیم اعداد صحیح',
        order: 3,
        video_url: 'https://example.com/video3.mp4',
        duration: '18:45',
        is_free: false,
        thumbnail_url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500',
        created_at: '2024-01-25',
      },
    ],
  },
  2: {
    id: 2,
    title: 'علوم تجربی هفتم',
    slug: 'science-7',
    description: 'آموزش علوم تجربی کلاس هفتم با آزمایش‌های مجازی',
    price: '800000',
    subject_id: '2',
    class_id: '1',
    is_general: false,
    is_active: true,
    requirements: 'علاقه به علوم\nکنجکاوی علمی',
    what_youll_learn: 'مفاهیم علوم تجربی\nآشنایی با بدن انسان\nآزمایش‌های علمی ساده',
    thumbnail_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500',
    lessons: [
      {
        id: 1,
        title: 'سلول و اجزای آن',
        description: 'آشنایی با ساختار سلول و اجزای تشکیل‌دهنده آن',
        order: 1,
        video_url: 'https://example.com/science1.mp4',
        duration: '20:10',
        is_free: true,
        thumbnail_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500',
        created_at: '2024-02-10',
      },
    ],
  },
};

const subjects = [
  { id: 1, name: 'ریاضی' },
  { id: 2, name: 'علوم تجربی' },
  { id: 3, name: 'ادبیات فارسی' },
  { id: 4, name: 'زبان انگلیسی' },
  { id: 5, name: 'دینی' },
  { id: 6, name: 'مطالعات اجتماعی' },
  { id: 7, name: 'هنر' },
  { id: 8, name: 'ورزش' },
  { id: 9, name: 'برنامه‌نویسی' },
  { id: 10, name: 'سایر' },
];

const classes = [
  { id: 1, name: 'پایه هفتم' },
  { id: 2, name: 'پایه هشتم' },
  { id: 3, name: 'پایه نهم' },
  { id: 4, name: 'پایه دهم' },
  { id: 5, name: 'پایه یازدهم' },
  { id: 6, name: 'پایه دوازدهم' },
];

export default function EditCourse() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    subject_id: '',
    class_id: '',
    is_general: false,
    is_active: true,
    requirements: '',
    what_youll_learn: '',
    thumbnail_url: '',
  });
  
  const [lessons, setLessons] = useState([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    video_url: '',
    duration: '',
    is_free: false,
    order: 0,
  });

  useEffect(() => {
    loadCourseData();
  }, [id]);

  const loadCourseData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const courseData = mockCourseData[Number(id)] || mockCourseData[1];
      setFormData({
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        price: courseData.price,
        subject_id: courseData.subject_id,
        class_id: courseData.class_id,
        is_general: courseData.is_general,
        is_active: courseData.is_active,
        requirements: courseData.requirements,
        what_youll_learn: courseData.what_youll_learn,
        thumbnail_url: courseData.thumbnail_url,
      });
      setImage(courseData.thumbnail_url);
      setLessons(courseData.lessons || []);
    } catch (error) {
      Alert.alert('خطا', 'مشکلی در بارگذاری اطلاعات دوره پیش آمد.');
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setFormData(prev => ({
          ...prev,
          thumbnail_url: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert('خطا', 'مشکلی در انتخاب تصویر پیش آمد.');
    }
  };

  // Lesson Management Functions
  const handleAddLesson = () => {
    setEditingLesson(null);
    setLessonForm({
      title: '',
      description: '',
      video_url: '',
      duration: '',
      is_free: false,
      order: lessons.length + 1,
    });
    setShowLessonModal(true);
  };

  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      video_url: lesson.video_url,
      duration: lesson.duration,
      is_free: lesson.is_free,
      order: lesson.order,
    });
    setShowLessonModal(true);
  };

  const handleDeleteLesson = (lessonId) => {
    Alert.alert(
      'حذف درس',
      'آیا از حذف این درس اطمینان دارید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            setLessons(lessons.filter(lesson => lesson.id !== lessonId));
            Alert.alert('موفقیت', 'درس با موفقیت حذف شد.');
          },
        },
      ]
    );
  };

  const handleSaveLesson = () => {
    if (!lessonForm.title.trim()) {
      Alert.alert('خطا', 'عنوان درس الزامی است.');
      return;
    }

    if (!lessonForm.video_url.trim()) {
      Alert.alert('خطا', 'لینک ویدیو الزامی است.');
      return;
    }

    if (editingLesson) {
      // Update existing lesson
      setLessons(lessons.map(lesson => 
        lesson.id === editingLesson.id 
          ? { ...editingLesson, ...lessonForm }
          : lesson
      ));
      Alert.alert('موفقیت', 'درس با موفقیت ویرایش شد.');
    } else {
      // Add new lesson
      const newLesson = {
        id: Date.now(), // Temporary ID
        ...lessonForm,
        thumbnail_url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500',
        created_at: new Date().toISOString().split('T')[0],
      };
      setLessons([...lessons, newLesson]);
      Alert.alert('موفقیت', 'درس جدید اضافه شد.');
    }

    setShowLessonModal(false);
    setEditingLesson(null);
  };

  const handleReorderLessons = (fromIndex, toIndex) => {
    const updatedLessons = [...lessons];
    const [movedLesson] = updatedLessons.splice(fromIndex, 1);
    updatedLessons.splice(toIndex, 0, movedLesson);
    
    // Update order numbers
    const reorderedLessons = updatedLessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1,
    }));
    
    setLessons(reorderedLessons);
  };

  const generateSlug = (title: string) => {
    return title
      .replace(/[^آ-یa-z0-9\s]/gi, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
  };

  const handleTitleChange = (text: string) => {
    setFormData(prev => ({
      ...prev,
      title: text,
      slug: generateSlug(text),
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('خطا', 'عنوان دوره الزامی است.');
      return false;
    }
    
    if (!formData.description.trim()) {
      Alert.alert('خطا', 'توضیحات دوره الزامی است.');
      return false;
    }
    
    if (!formData.subject_id && !formData.is_general) {
      Alert.alert('خطا', 'لطفا موضوع دوره را انتخاب کنید.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'موفقیت',
        'تغییرات دوره با موفقیت ذخیره شد!',
        [
          {
            text: 'باشه',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('خطا', 'مشکلی در ذخیره تغییرات پیش آمد. لطفا دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'حذف دوره',
      'آیا از حذف این دوره اطمینان دارید؟ این عمل قابل بازگشت نیست.',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              // Simulate delete API call
              await new Promise(resolve => setTimeout(resolve, 1000));
              Alert.alert('موفقیت', 'دوره با موفقیت حذف شد.');
              router.push('/(teacher)/courses');
            } catch (error) {
              Alert.alert('خطا', 'مشکلی در حذف دوره پیش آمد.');
            }
          },
        },
      ]
    );
  };

  const renderLessonItem = ({ item, index, drag, isActive }) => (
    <TouchableOpacity
      style={[
        styles.lessonItem,
        isActive && styles.lessonItemActive,
      ]}
      onLongPress={drag}
      onPress={() => handleEditLesson(item)}
    >
      <View style={styles.lessonDragHandle}>
        <Ionicons name="reorder-three" size={24} color={Colors.textSecondary} />
      </View>
      
      <View style={styles.lessonContent}>
        <View style={styles.lessonHeader}>
          <View style={styles.lessonOrder}>
            <Text style={styles.lessonOrderText}>{item.order}</Text>
          </View>
          <Text style={styles.lessonTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.is_free && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>رایگان</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.lessonDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.lessonFooter}>
          <View style={styles.lessonMeta}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.lessonMetaText}>{item.duration}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.lessonAction}
            onPress={() => handleDeleteLesson(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.danger} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.lessonAction}
            onPress={() => handleEditLesson(item)}
          >
            <Ionicons name="create-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="بارگذاری..." showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری اطلاعات دوره...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="ویرایش دوره"
        showBack
        onBackPress={() => router.back()}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleAddLesson} style={styles.headerButton}>
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Ionicons name="trash-outline" size={24} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Course Image */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>تصویر دوره</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
            {image ? (
              <Image source={{ uri: image }} style={styles.selectedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color={Colors.textSecondary} />
                <Text style={styles.imagePlaceholderText}>تغییر تصویر</Text>
                <Text style={styles.imageHintText}>نسبت ۱۶:۹ پیشنهاد می‌شود</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Lessons Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>درس‌های دوره</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddLesson}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>درس جدید</Text>
            </TouchableOpacity>
          </View>
          
          {lessons.length === 0 ? (
            <View style={styles.emptyLessons}>
              <Ionicons name="play-circle-outline" size={60} color={Colors.textSecondary} />
              <Text style={styles.emptyLessonsText}>
                هنوز درسی اضافه نکرده‌اید
              </Text>
              <Text style={styles.emptyLessonsSubtext}>
                درس‌های دوره را در این بخش مدیریت کنید
              </Text>
              <TouchableOpacity style={styles.addFirstButton} onPress={handleAddLesson}>
                <Text style={styles.addFirstButtonText}>اضافه کردن اولین درس</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.lessonsContainer}>
              <Text style={styles.lessonsCount}>
                {lessons.length} درس ({lessons.filter(l => l.is_free).length} رایگان)
              </Text>
              
              <View style={styles.lessonsList}>
                {lessons
                  .sort((a, b) => a.order - b.order)
                  .map((lesson, index) => (
                    <View key={lesson.id} style={styles.lessonWrapper}>
                      {renderLessonItem({ item: lesson, index, drag: () => {}, isActive: false })}
                    </View>
                  ))}
              </View>
              
              <Text style={styles.reorderHint}>
                برای تغییر ترتیب، روی درس نگه دارید و بکشید
              </Text>
            </View>
          )}
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات اصلی</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>عنوان دوره *</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: ریاضی پایه هفتم"
              placeholderTextColor={Colors.textSecondary}
              value={formData.title}
              onChangeText={handleTitleChange}
              maxLength={100}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>شناسه (Slug)</Text>
            <TextInput
              style={[styles.input, styles.slugInput]}
              value={formData.slug}
              onChangeText={(text) => setFormData(prev => ({ ...prev, slug: text }))}
            />
            <Text style={styles.slugHint}>شناسه منحصر به فرد دوره برای URL</Text>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>توضیحات دوره *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="توضیحات کامل دوره را وارد کنید..."
              placeholderTextColor={Colors.textSecondary}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>قیمت دوره (تومان)</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: 1000000"
              placeholderTextColor={Colors.textSecondary}
              value={formData.price}
              onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
              keyboardType="numeric"
            />
            <Text style={styles.hint}>برای دوره رایگان، فیلد را خالی بگذارید</Text>
          </View>
        </View>

        {/* Course Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تنظیمات دوره</Text>
          
          <View style={styles.toggleGroup}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>دوره عمومی</Text>
              <Switch
                value={formData.is_general}
                onValueChange={(value) => setFormData(prev => ({ ...prev, is_general: value }))}
                trackColor={{ false: '#767577', true: Colors.primary }}
              />
            </View>
            <Text style={styles.toggleDescription}>
              دوره‌های عمومی برای همه پایه‌ها قابل دسترسی هستند
            </Text>
          </View>
          
          {!formData.is_general && (
            <>
              <View style={styles.formGroup}>
                <Text style={styles.label}>موضوع</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipContainer}>
                    {subjects.map((subject) => (
                      <TouchableOpacity
                        key={subject.id}
                        style={[
                          styles.chip,
                          formData.subject_id === subject.id.toString() && styles.chipSelected,
                        ]}
                        onPress={() => setFormData(prev => ({ 
                          ...prev, 
                          subject_id: subject.id.toString() 
                        }))}
                      >
                        <Text style={[
                          styles.chipText,
                          formData.subject_id === subject.id.toString() && styles.chipTextSelected,
                        ]}>
                          {subject.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>پایه تحصیلی</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chipContainer}>
                    {classes.map((classItem) => (
                      <TouchableOpacity
                        key={classItem.id}
                        style={[
                          styles.chip,
                          formData.class_id === classItem.id.toString() && styles.chipSelected,
                        ]}
                        onPress={() => setFormData(prev => ({ 
                          ...prev, 
                          class_id: classItem.id.toString() 
                        }))}
                      >
                        <Text style={[
                          styles.chipText,
                          formData.class_id === classItem.id.toString() && styles.chipTextSelected,
                        ]}>
                          {classItem.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </>
          )}
          
          <View style={styles.toggleGroup}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>فعال‌سازی دوره</Text>
              <Switch
                value={formData.is_active}
                onValueChange={(value) => setFormData(prev => ({ ...prev, is_active: value }))}
                trackColor={{ false: '#767577', true: Colors.success }}
              />
            </View>
            <Text style={styles.toggleDescription}>
              دوره غیرفعال برای دانش‌آموزان نمایش داده نمی‌شود
            </Text>
          </View>
        </View>

        {/* Course Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>محتوای دوره</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>پیش‌نیازها</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="دانش و مهارت‌های مورد نیاز برای شرکت در دوره..."
              placeholderTextColor={Colors.textSecondary}
              value={formData.requirements}
              onChangeText={(text) => setFormData(prev => ({ ...prev, requirements: text }))}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>آنچه می‌آموزید</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="مهارت‌ها و دانشی که پس از دوره کسب می‌کنید..."
              placeholderTextColor={Colors.textSecondary}
              value={formData.what_youll_learn}
              onChangeText={(text) => setFormData(prev => ({ ...prev, what_youll_learn: text }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.hint}>
              هر مورد را در یک خط جدید وارد کنید (با Enter)
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>لغو</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.submitButtonText}>در حال ذخیره...</Text>
              </>
            ) : (
              <>
                <Ionicons name="save" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>ذخیره تغییرات</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.spacer} />
      </ScrollView>

      {/* Lesson Modal */}
      <Modal
        visible={showLessonModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLessonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingLesson ? 'ویرایش درس' : 'درس جدید'}
              </Text>
              <TouchableOpacity onPress={() => setShowLessonModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>عنوان درس *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="مثال: آشنایی با اعداد صحیح"
                  value={lessonForm.title}
                  onChangeText={(text) => setLessonForm(prev => ({ ...prev, title: text }))}
                />
              </View>
              
              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>توضیحات</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="توضیحات کامل درس..."
                  value={lessonForm.description}
                  onChangeText={(text) => setLessonForm(prev => ({ ...prev, description: text }))}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>لینک ویدیو *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="https://example.com/video.mp4"
                  value={lessonForm.video_url}
                  onChangeText={(text) => setLessonForm(prev => ({ ...prev, video_url: text }))}
                />
                <Text style={styles.modalHint}>
                  از سرویس‌های میزبانی ویدیو مانند آپارات، یوتیوب یا Vimeo استفاده کنید
                </Text>
              </View>
              
              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>مدت زمان</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="مثال: 15:30"
                  value={lessonForm.duration}
                  onChangeText={(text) => setLessonForm(prev => ({ ...prev, duration: text }))}
                />
                <Text style={styles.modalHint}>فرقت دقیقه:ثانیه (مثال: 25:45)</Text>
              </View>
              
              <View style={styles.modalFormGroup}>
                <View style={styles.modalToggleRow}>
                  <Text style={styles.modalLabel}>درس رایگان</Text>
                  <Switch
                    value={lessonForm.is_free}
                    onValueChange={(value) => setLessonForm(prev => ({ ...prev, is_free: value }))}
                    trackColor={{ false: '#767577', true: Colors.success }}
                  />
                </View>
                <Text style={styles.modalHint}>
                  درس‌های رایگان برای همه قابل مشاهده هستند
                </Text>
              </View>
              
              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>ترتیب</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="شماره ترتیب"
                  value={lessonForm.order.toString()}
                  onChangeText={(text) => setLessonForm(prev => ({ 
                    ...prev, 
                    order: parseInt(text) || 0 
                  }))}
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowLessonModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>لغو</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveLesson}
              >
                <Text style={styles.modalSaveButtonText}>
                  {editingLesson ? 'ذخیره تغییرات' : 'اضافه کردن درس'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.card,
    marginTop: 16,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyLessons: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyLessonsText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyLessonsSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  lessonsContainer: {
    marginTop: 8,
  },
  lessonsCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  lessonsList: {
    gap: 12,
  },
  lessonWrapper: {
    marginBottom: 8,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  lessonItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  lessonDragHandle: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  lessonContent: {
    flex: 1,
    padding: 12,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  lessonOrder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonOrderText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lessonTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  freeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freeBadgeText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: 'bold',
  },
  lessonDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lessonAction: {
    padding: 4,
    marginLeft: 8,
  },
  reorderHint: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  imageSection: {
    backgroundColor: Colors.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  imagePicker: {
    height: 200,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 8,
  },
  imageHintText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    textAlign: 'right',
  },
  slugInput: {
    backgroundColor: '#f8f9fa',
    color: Colors.text,
  },
  slugHint: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  toggleGroup: {
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  toggleDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.text,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  modalFormGroup: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    textAlign: 'right',
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalHint: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  modalToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: 'bold',
  },
  modalSaveButton: {
    backgroundColor: Colors.primary,
  },
  modalSaveButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  spacer: {
    height: 80,
  },
});