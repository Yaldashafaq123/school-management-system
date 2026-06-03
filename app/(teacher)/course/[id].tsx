// app/(teacher)/course/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Header } from '../../../components/Header';
import { teacherCoursesApi, Course } from '../../../src/config/teacherCoursesApi';

export default function CourseDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await teacherCoursesApi.getCourse(Number(id));
      if (response.success && response.data) {
        setCourse(response.data);
        setIsActive(response.data.is_active);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      Alert.alert('خطا', 'مشکلی در دریافت اطلاعات دوره پیش آمد.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!course) return;
    try {
      await Share.share({
        message: `دوره ${course.title} - ${course.description?.slice(0, 100)}...`,
        url: `https://edukon.com/courses/${id}`,
        title: course.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'حذف دوره',
      'آیا مطمئن هستید که می‌خواهید این دوره را حذف کنید؟ این عمل قابل بازگشت نیست.',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await teacherCoursesApi.deleteCourse(Number(id));
              if (response.success) {
                Alert.alert('موفقیت', 'دوره با موفقیت حذف شد.');
                router.push('/(teacher)/courses');
              }
            } catch (error) {
              Alert.alert('خطا', 'مشکلی در حذف دوره پیش آمد.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`./${id}/edit`);
  };

  const handleToggleStatus = async (value: boolean) => {
    try {
      const response = await teacherCoursesApi.toggleCourseStatus(Number(id));
      if (response.success) {
        setIsActive(value);
        setCourse(prev => prev ? { ...prev, is_active: value } : prev);
      }
    } catch (error) {
      Alert.alert('خطا', 'مشکلی در تغییر وضعیت دوره پیش آمد.');
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR') + ' تومان';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="جزئیات دوره" showBack onBackPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="جزئیات دوره" showBack onBackPress={() => router.back()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={Colors.danger} />
          <Text style={styles.errorText}>دوره یافت نشد</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="جزئیات دوره"
        showBack
        onBackPress={() => router.back()}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare}>
              <Ionicons name="share-social" size={24} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEdit}>
              <Ionicons name="create" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Course Image */}
        <Image 
          source={{ uri: course.thumbnail_url || 'https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=دوره' }} 
          style={styles.courseImage} 
        />

        {/* Course Header */}
        <View style={styles.courseHeader}>
          <View style={styles.courseHeaderTop}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <View style={styles.courseBadge}>
              <Ionicons
                name={isActive ? 'checkmark-circle' : 'close-circle'}
                size={16}
                color={isActive ? Colors.success : Colors.danger}
              />
              <Text style={[
                styles.courseStatus,
                { color: isActive ? Colors.success : Colors.danger }
              ]}>
                {isActive ? 'فعال' : 'غیرفعال'}
              </Text>
            </View>
          </View>
          
          <View style={styles.courseMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="book" size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{course.subject || 'عمومی'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{course.duration || 0} ساعت</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{course.student_count || 0}</Text>
            <Text style={styles.statLabel}>دانش‌آموز</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="star" size={24} color={Colors.warning} />
            <Text style={styles.statValue}>{course.rating?.toFixed(1) || 0}</Text>
            <Text style={styles.statLabel}>امتیاز</Text>
          </View>
        </View>

        {/* Course Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>توضیحات دوره</Text>
          <Text style={styles.courseDescription}>
            {course.description || 'توضیحاتی برای این دوره ثبت نشده است.'}
          </Text>
        </View>

        {/* Objectives */}
        {course.objectives && course.objectives.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اهداف یادگیری</Text>
            <View style={styles.list}>
              {course.objectives.map((objective, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.listText}>{objective.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Requirements */}
        {course.requirements && course.requirements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>پیش‌نیازها</Text>
            <View style={styles.list}>
              {course.requirements.map((requirement, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="alert-circle" size={16} color={Colors.warning} />
                  <Text style={styles.listText}>{requirement.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Course Actions */}
        <View style={styles.section}>
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>مدیریت دوره</Text>
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>وضعیت دوره</Text>
              <Switch
                value={isActive}
                onValueChange={handleToggleStatus}
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>
          </View>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`./${id}/manage`)}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="settings" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.actionText}>مدیریت دوره</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/(teacher)/assignment/create?course=${id}`)}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="document-text" size={24} color={Colors.success} />
              </View>
              <Text style={styles.actionText}>تکلیف جدید</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/(teacher)/exam/create?course=${id}`)}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Ionicons name="clipboard" size={24} color={Colors.warning} />
              </View>
              <Text style={styles.actionText}>آزمون جدید</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>منطقه خطر</Text>
          <Text style={styles.dangerZoneDescription}>
            این عملیات قابل بازگشت نیستند. لطفاً با دقت اقدام کنید.
          </Text>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.deleteButtonText}>حذف دوره</Text>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text,
    marginTop: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  content: {
    flex: 1,
  },
  courseImage: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.border,
  },
  courseHeader: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  courseHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  courseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  courseStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  courseMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  courseDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 24,
    textAlign: 'justify',
  },
  list: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  listText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  dangerZone: {
    margin: 20,
    padding: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  dangerZoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.danger,
    marginBottom: 8,
  },
  dangerZoneDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.danger,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});