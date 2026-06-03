import React, { useState, useEffect, useCallback } from 'react';
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
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Header } from '../../../components/Header';

interface CourseDetailType {
  id: number;
  title: string;
  description: string;
  long_description: string;
  thumbnail_url: string;
  teacher_id: number;
  teacher_name: string;
  teacher_email: string;
  price: number;
  is_free: boolean;
  discount_price?: number;
  category: string;
  subcategory: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  lectures_count: number;
  quizzes_count: number;
  assignments_count: number;
  status: 'published' | 'draft' | 'archived';
  featured: boolean;
  certificate_available: boolean;
  created_at: string;
  updated_at: string;
  enrolled_students: number;
  completion_rate: number;
  avg_rating: number;
  reviews_count: number;
  requirements: string[];
  learning_outcomes: string[];
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: number;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  preview: boolean;
  order_no: number;
}

export default function CourseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [course, setCourse] = useState<CourseDetailType | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CourseDetailType>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'stats' | 'reviews'>('overview');

  const fetchCourseDetail = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockCourse: CourseDetailType = {
        id: parseInt(id || '1'),
        title: 'ریاضی پیشرفته پایه هفتم',
        description: 'آموزش کامل ریاضیات پیشرفته برای پایه هفتم',
        long_description: 'این دوره شامل آموزش کامل مباحث ریاضی پایه هفتم به همراه تمرینات و مثال‌های متعدد است.',
        thumbnail_url: 'https://via.placeholder.com/400x300',
        teacher_id: 1,
        teacher_name: 'دکتر علی محمدی',
        teacher_email: 'ali@example.com',
        price: 500000,
        is_free: false,
        discount_price: 450000,
        category: 'ریاضی',
        subcategory: 'متوسطه اول',
        level: 'intermediate',
        duration: 48,
        lectures_count: 24,
        quizzes_count: 6,
        assignments_count: 3,
        status: 'published',
        featured: true,
        certificate_available: true,
        created_at: '۱۴۰۳/۰۱/۱۵',
        updated_at: '۱۴۰۳/۰۶/۲۰',
        enrolled_students: 245,
        completion_rate: 78,
        avg_rating: 4.8,
        reviews_count: 45,
        requirements: [
          'آشنایی با مبانی ریاضی ابتدایی',
          'دسترسی به کامپیوتر یا موبایل',
        ],
        learning_outcomes: [
          'حل مسائل پیچیده ریاضی',
          'درک مفاهیم پایه‌ای هندسه',
          'توانایی حل مسئله',
        ],
      };

      const mockLessons: Lesson[] = [
        { id: 1, title: 'معرفی دوره', description: 'آشنایی با دوره و مباحث', duration: 30, type: 'video', preview: true, order_no: 1 },
        { id: 2, title: 'اعداد طبیعی', description: 'آشنایی با اعداد طبیعی', duration: 45, type: 'video', preview: false, order_no: 2 },
        { id: 3, title: 'تمرین فصل اول', description: 'تمرینات اعداد طبیعی', duration: 20, type: 'assignment', preview: false, order_no: 3 },
        { id: 4, title: 'آزمون کوتاه', description: 'آزمون فصل اول', duration: 15, type: 'quiz', preview: false, order_no: 4 },
      ];

      setCourse(mockCourse);
      setFormData(mockCourse);
      setLessons(mockLessons);
    } catch (error) {
      Alert.alert('خطا', 'در دریافت اطلاعات دوره مشکلی پیش آمده');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourseDetail();
  }, [fetchCourseDetail]);

  const handleSave = async () => {
    try {
      // TODO: Implement update API
      Alert.alert('موفقیت', 'اطلاعات دوره با موفقیت بروزرسانی شد');
      setEditing(false);
      fetchCourseDetail();
    } catch {
      Alert.alert('خطا', 'در بروزرسانی اطلاعات مشکلی پیش آمده');
    }
  };

  const handleStatusChange = (newStatus: CourseDetailType['status']) => {
    Alert.alert(
      'تغییر وضعیت',
      `آیا از تغییر وضعیت دوره به "${newStatus === 'published' ? 'منتشر شده' : newStatus === 'draft' ? 'پیش‌نویس' : 'آرشیو شده'}" اطمینان دارید؟`,
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'تغییر',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement status change API
            setCourse(prev => prev ? { ...prev, status: newStatus } : null);
            Alert.alert('موفقیت', 'وضعیت دوره با موفقیت تغییر یافت');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="جزئیات دوره" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="جزئیات دوره" />
        <View style={styles.errorContainer}>
          <Ionicons name="book-outline" size={64} color={Colors.danger} />
          <Text style={styles.errorText}>دوره یافت نشد</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return Colors.success;
      case 'draft': return Colors.warning;
      case 'archived': return Colors.textSecondary;
      default: return Colors.textSecondary;
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'مبتدی';
      case 'intermediate': return 'متوسط';
      case 'advanced': return 'پیشرفته';
      default: return level;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="جزئیات دوره"
        rightComponent={
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditing(!editing)}
          >
            <Ionicons
              name={editing ? 'close' : 'create'}
              size={24}
              color={editing ? Colors.danger : Colors.primary}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Course Header */}
        <View style={styles.courseHeader}>
          <Image
            source={{ uri: course.thumbnail_url }}
            style={styles.courseImage}
          />
          <View style={styles.courseHeaderContent}>
            {editing ? (
              <TextInput
                style={styles.editTitle}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            ) : (
              <Text style={styles.courseTitle}>{course.title}</Text>
            )}
            <View style={styles.courseMeta}>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(course.status)}20` }]}>
                <Text style={[styles.statusText, { color: getStatusColor(course.status) }]}>
                  {course.status === 'published' ? 'منتشر شده' :
                   course.status === 'draft' ? 'پیش‌نویس' : 'آرشیو شده'}
                </Text>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{getLevelText(course.level)}</Text>
              </View>
              {course.featured && (
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={12} color="#fff" />
                  <Text style={styles.featuredText}>ویژه</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Ionicons
              name="information-circle"
              size={20}
              color={activeTab === 'overview' ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              اطلاعات کلی
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'curriculum' && styles.activeTab]}
            onPress={() => setActiveTab('curriculum')}
          >
            <Ionicons
              name="list"
              size={20}
              color={activeTab === 'curriculum' ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'curriculum' && styles.activeTabText]}>
              محتوای دوره
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
            onPress={() => setActiveTab('stats')}
          >
            <Ionicons
              name="stats-chart"
              size={20}
              color={activeTab === 'stats' ? Colors.primary : Colors.textSecondary}
            />
            <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
              آمار و ارقام
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'overview' && (
          <View>
            {/* Course Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={24} color={Colors.primary} />
                <Text style={styles.statValue}>{course.enrolled_students}</Text>
                <Text style={styles.statLabel}>دانش‌آموز</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time" size={24} color={Colors.secondary} />
                <Text style={styles.statValue}>{course.duration}</Text>
                <Text style={styles.statLabel}>ساعت</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="star" size={24} color={Colors.warning} />
                <Text style={styles.statValue}>{course.avg_rating.toFixed(1)}</Text>
                <Text style={styles.statLabel}>امتیاز</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                <Text style={styles.statValue}>{course.completion_rate}%</Text>
                <Text style={styles.statLabel}>تکمیل</Text>
              </View>
            </View>

            {/* Course Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>توضیحات دوره</Text>
              {editing ? (
                <TextInput
                  style={[styles.infoCard, styles.editDescription]}
                  value={formData.long_description}
                  onChangeText={(text) => setFormData({ ...formData, long_description: text })}
                  multiline
                  numberOfLines={6}
                  placeholder="توضیحات دوره..."
                />
              ) : (
                <View style={styles.infoCard}>
                  <Text style={styles.descriptionText}>{course.long_description}</Text>
                </View>
              )}
            </View>

            {/* Teacher Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>مدرس دوره</Text>
              <View style={styles.teacherCard}>
                <View style={styles.teacherInfo}>
                  <Ionicons name="person-circle" size={48} color={Colors.primary} />
                  <View style={styles.teacherDetails}>
                    <Text style={styles.teacherName}>{course.teacher_name}</Text>
                    <Text style={styles.teacherEmail}>{course.teacher_email}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.teacherButton}>
                  <Text style={styles.teacherButtonText}>مشاهده پروفایل</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>پیش‌نیازها</Text>
                <View style={styles.infoCard}>
                  {course.requirements.map((req, index) => (
                    <View key={index} style={styles.requirementItem}>
                      <Ionicons name="checkmark" size={16} color={Colors.success} />
                      <Text style={styles.requirementText}>{req}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Learning Outcomes */}
            {course.learning_outcomes && course.learning_outcomes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>آنچه یاد خواهید گرفت</Text>
                <View style={styles.infoCard}>
                  {course.learning_outcomes.map((outcome, index) => (
                    <View key={index} style={styles.outcomeItem}>
                      <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                      <Text style={styles.outcomeText}>{outcome}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Course Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>جزئیات دوره</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar" size={20} color={Colors.textSecondary} />
                  <Text style={styles.detailLabel}>تاریخ ایجاد</Text>
                  <Text style={styles.detailValue}>{course.created_at}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="refresh" size={20} color={Colors.textSecondary} />
                  <Text style={styles.detailLabel}>آخرین بروزرسانی</Text>
                  <Text style={styles.detailValue}>{course.updated_at}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="school" size={20} color={Colors.textSecondary} />
                  <Text style={styles.detailLabel}>دسترسی گواهینامه</Text>
                  <Text style={styles.detailValue}>
                    {course.certificate_available ? 'دارد' : 'ندارد'}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="book" size={20} color={Colors.textSecondary} />
                  <Text style={styles.detailLabel}>تعداد دروس</Text>
                  <Text style={styles.detailValue}>{course.lectures_count}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'curriculum' && (
          <View style={styles.section}>
            <View style={styles.curriculumHeader}>
              <Text style={styles.sectionTitle}>محتوای دوره</Text>
              <TouchableOpacity style={styles.addLessonButton}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addLessonText}>افزودن درس</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.lessonsList}>
              {lessons.map((lesson, index) => (
                <TouchableOpacity key={lesson.id} style={styles.lessonItem}>
                  <View style={styles.lessonHeader}>
                    <View style={styles.lessonNumber}>
                      <Text style={styles.lessonNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <View style={styles.lessonMeta}>
                        <Text style={styles.lessonType}>
                          {lesson.type === 'video' ? 'ویدیو' :
                           lesson.type === 'quiz' ? 'آزمون' :
                           lesson.type === 'assignment' ? 'تکلیف' : 'مقاله'}
                        </Text>
                        <Text style={styles.lessonDuration}>{lesson.duration} دقیقه</Text>
                        {lesson.preview && (
                          <View style={styles.previewBadge}>
                            <Text style={styles.previewText}>پیش‌نمایش</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity style={styles.lessonAction}>
                      <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  {lesson.description && (
                    <Text style={styles.lessonDescription}>{lesson.description}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'stats' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>آمار دوره</Text>
            
            {/* Enrollment Stats */}
            <View style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <Ionicons name="trending-up" size={24} color={Colors.primary} />
                <Text style={styles.statsTitle}>آمار ثبت‌نام</Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statsItem}>
                  <Text style={styles.statsValue}>{course.enrolled_students}</Text>
                  <Text style={styles.statsLabel}>ثبت‌نامی کل</Text>
                </View>
                <View style={styles.statsItem}>
                  <Text style={styles.statsValue}>{Math.round(course.enrolled_students * 0.3)}</Text>
                  <Text style={styles.statsLabel}>ثبت‌نامی فعال</Text>
                </View>
                <View style={styles.statsItem}>
                  <Text style={styles.statsValue}>{course.completion_rate}%</Text>
                  <Text style={styles.statsLabel}>نرخ تکمیل</Text>
                </View>
              </View>
            </View>

            {/* Revenue Stats */}
            <View style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <Ionicons name="cash" size={24} color={Colors.success} />
                <Text style={styles.statsTitle}>آمار درآمد</Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statsItem}>
                  <Text style={styles.statsValue}>
                    {(course.price * course.enrolled_students).toLocaleString()}
                  </Text>
                  <Text style={styles.statsLabel}>درآمد کل (تومان)</Text>
                </View>
                <View style={styles.statsItem}>
                  <Text style={styles.statsValue}>
                    {Math.round(course.price * course.enrolled_students * 0.7).toLocaleString()}
                  </Text>
                  <Text style={styles.statsLabel}>درآمد خالص</Text>
                </View>
                <View style={styles.statsItem}>
                  <Text style={styles.statsValue}>
                    {course.is_free ? 'رایگان' : course.price.toLocaleString()}
                  </Text>
                  <Text style={styles.statsLabel}>قیمت دوره</Text>
                </View>
              </View>
            </View>

            {/* Rating Stats */}
            <View style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <Ionicons name="star" size={24} color={Colors.warning} />
                <Text style={styles.statsTitle}>امتیازها</Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statsItem}>
                  <Text style={styles.statsValue}>{course.avg_rating.toFixed(1)}</Text>
                  <Text style={styles.statsLabel}>میانگین امتیاز</Text>
                </View>
                <View style={styles.statsItem}>
                  <Text style={styles.statsValue}>{course.reviews_count}</Text>
                  <Text style={styles.statsLabel}>تعداد نظرات</Text>
                </View>
                <View style={styles.statsItem}>
                  <View style={styles.ratingDistribution}>
                    <Ionicons name="star" size={16} color={Colors.warning} />
                    <Ionicons name="star" size={16} color={Colors.warning} />
                    <Ionicons name="star" size={16} color={Colors.warning} />
                    <Ionicons name="star" size={16} color={Colors.warning} />
                    <Ionicons name="star-half" size={16} color={Colors.warning} />
                  </View>
                  <Text style={styles.statsLabel}>توزیع امتیاز</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Status Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مدیریت دوره</Text>
          <View style={styles.managementActions}>
            <TouchableOpacity
              style={[styles.managementButton, { backgroundColor: Colors.primary + '20' }]}
              onPress={() => handleStatusChange(course.status === 'published' ? 'draft' : 'published')}
            >
              <Ionicons
                name={course.status === 'published' ? 'eye-off' : 'eye'}
                size={20}
                color={Colors.primary}
              />
              <Text style={[styles.managementButtonText, { color: Colors.primary }]}>
                {course.status === 'published' ? 'عدم انتشار' : 'انتشار'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.managementButton, { backgroundColor: Colors.warning + '20' }]}
              onPress={() => setEditing(!editing)}
            >
              <Ionicons name="create" size={20} color={Colors.warning} />
              <Text style={[styles.managementButtonText, { color: Colors.warning }]}>
                ویرایش
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.managementButton, { backgroundColor: Colors.danger + '20' }]}
              onPress={() => Alert.alert('حذف دوره', 'آیا از حذف دوره اطمینان دارید؟')}
            >
              <Ionicons name="trash" size={20} color={Colors.danger} />
              <Text style={[styles.managementButtonText, { color: Colors.danger }]}>
                حذف
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save/Cancel Buttons */}
        {editing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>ذخیره تغییرات</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setEditing(false);
                setFormData(course);
              }}
            >
              <Text style={styles.cancelButtonText}>لغو</Text>
            </TouchableOpacity>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: Colors.danger,
    marginTop: 16,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  courseHeader: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courseImage: {
    width: '100%',
    height: 200,
  },
  courseHeaderContent: {
    padding: 20,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'right',
  },
  editTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: Colors.background,
    textAlign: 'right',
  },
  courseMeta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  levelBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  levelText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  featuredBadge: {
    backgroundColor: Colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  featuredText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary + '20',
  },
  tabText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  descriptionText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 28,
    textAlign: 'right',
  },
  editDescription: {
    minHeight: 150,
    textAlignVertical: 'top',
    fontSize: 16,
    lineHeight: 28,
  },
  teacherCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teacherDetails: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  teacherEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  teacherButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  teacherButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    lineHeight: 24,
  },
  outcomeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  outcomeText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    lineHeight: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  curriculumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addLessonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  addLessonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  lessonsList: {
    gap: 8,
  },
  lessonItem: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  lessonType: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lessonDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  previewBadge: {
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  previewText: {
    fontSize: 10,
    color: Colors.warning,
    fontWeight: 'bold',
  },
  lessonAction: {
    padding: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    lineHeight: 20,
  },
  statsCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsItem: {
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ratingDistribution: {
    flexDirection: 'row',
    gap: 2,
  },
  managementActions: {
    flexDirection: 'row',
    gap: 12,
  },
  managementButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  managementButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
});