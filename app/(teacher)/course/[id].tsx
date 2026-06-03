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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Header } from '../../../components/Header';

const mockCourse = {
  id: 1,
  title: 'ریاضی پایه هفتم',
  description: 'آموزش کامل ریاضی کلاس هفتم با جدیدترین روش‌های تدریس. این دوره شامل تمام مباحث کتاب درسی به همراه تمرین‌های اضافه و نکات کنکوری می‌باشد.',
  subject: 'ریاضی',
  gradeLevel: 'هفتم',
  instructor: {
    name: 'دکتر علی رضایی',
    rating: 4.8,
    students: 245,
    courses: 8,
  },
  price: 450000,
  duration: '۳ ماه',
  schedule: 'روزهای زوج ساعت ۱۶-۱۸',
  capacity: 50,
  enrolled: 45,
  rating: 4.8,
  reviews: 128,
  isActive: true,
  imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  createdAt: '۱۴۰۲/۰۹/۰۱',
  objectives: [
    'آشنایی با مباحث پایه ریاضی هفتم',
    'توانایی حل مسائل مختلف',
    'آمادگی برای آزمون‌های مدرسه',
    'تقویت مهارت‌های حل مسئله',
  ],
  requirements: [
    'آشنایی با ریاضی ششم',
    'دسترسی به اینترنت',
    'علاقه به ریاضی',
  ],
};

export default function CourseDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [course, setCourse] = useState(mockCourse);
  const [isActive, setIsActive] = useState(course.isActive);

  useEffect(() => {
    // Fetch course data based on id
    setCourse(mockCourse);
    setIsActive(mockCourse.isActive);
  }, [id]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `دوره ${course.title} - ${course.description.slice(0, 100)}...`,
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
          onPress: () => {
            Alert.alert('موفقیت', 'دوره با موفقیت حذف شد.');
            router.push('./teacher/courses');
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push(`./teacher/course/${id}/edit`);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR') + ' تومان';
  };

  const renderStats = () => (
    <View style={styles.statsGrid}>
      <View style={styles.statCard}>
        <Ionicons name="people" size={24} color={Colors.primary} />
        <Text style={styles.statValue}>{course.enrolled}</Text>
        <Text style={styles.statLabel}>دانش‌آموز</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="star" size={24} color={Colors.warning} />
        <Text style={styles.statValue}>{course.rating}</Text>
        <Text style={styles.statLabel}>امتیاز</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="chatbubble" size={24} color={Colors.success} />
        <Text style={styles.statValue}>{course.reviews}</Text>
        <Text style={styles.statLabel}>نظر</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="cash" size={24} color={Colors.info} />
        <Text style={styles.statValue}>
          {formatPrice(course.price)}
        </Text>
        <Text style={styles.statLabel}>قیمت</Text>
      </View>
    </View>
  );

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
        <Image source={{ uri: course.imageUrl }} style={styles.courseImage} />

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
              <Text style={styles.metaText}>{course.subject}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="school" size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{course.gradeLevel}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={16} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{course.duration}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        {renderStats()}

        {/* Course Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>توضیحات دوره</Text>
          <Text style={styles.courseDescription}>{course.description}</Text>
        </View>

        {/* Objectives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اهداف یادگیری</Text>
          <View style={styles.list}>
            {course.objectives.map((objective, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.listText}>{objective}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>پیش‌نیازها</Text>
          <View style={styles.list}>
            {course.requirements.map((requirement, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="alert-circle" size={16} color={Colors.warning} />
                <Text style={styles.listText}>{requirement}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Schedule & Capacity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>زمان‌بندی و ظرفیت</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar" size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>زمان کلاس‌ها:</Text>
              <Text style={styles.infoValue}>{course.schedule}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people" size={20} color={Colors.success} />
              <Text style={styles.infoLabel}>ظرفیت:</Text>
              <Text style={styles.infoValue}>
                {course.enrolled} / {course.capacity}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="create" size={20} color={Colors.info} />
              <Text style={styles.infoLabel}>تاریخ ایجاد:</Text>
              <Text style={styles.infoValue}>{course.createdAt}</Text>
            </View>
          </View>
        </View>

        {/* Course Actions */}
        <View style={styles.section}>
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>مدیریت دوره</Text>
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>وضعیت دوره</Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>
          </View>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`./teacher/course/${id}/manage`)}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="settings" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.actionText}>مدیریت دوره</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`./teacher/assignment/create?course=${id}`)}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="document-text" size={24} color={Colors.success} />
              </View>
              <Text style={styles.actionText}>تکلیف جدید</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`./teacher/exam/create?course=${id}`)}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Ionicons name="clipboard" size={24} color={Colors.warning} />
              </View>
              <Text style={styles.actionText}>آزمون جدید</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('./teacher/announcement/create')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <Ionicons name="megaphone" size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.actionText}>اعلان جدید</Text>
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
    flexWrap: 'wrap',
    gap: 12,
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statCard: {
    width: '48%',
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
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
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