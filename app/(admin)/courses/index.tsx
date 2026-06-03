import React, { useState, useEffect } from 'react';
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
import { Colors } from '../../../constants/Colors';
import { Header } from '../../../components/Header';

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  teacher_name: string;
  price: number;
  is_free: boolean;
  rating: number;
  student_count: number;
  category: string;
  status: 'published' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
  enrolled_students: number;
  completion_rate: number;
  avg_rating: number;
}

export default function CoursesManagement() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [searchQuery, filterStatus, filterCategory, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockCourses: Course[] = [
        {
          id: 1,
          title: 'ریاضی پیشرفته پایه هفتم',
          description: 'آموزش کامل ریاضیات پیشرفته برای پایه هفتم',
          thumbnail_url: 'https://via.placeholder.com/300x200',
          teacher_name: 'دکتر علی محمدی',
          price: 500000,
          is_free: false,
          rating: 4.8,
          student_count: 245,
          category: 'ریاضی',
          status: 'published',
          created_at: '۱۴۰۳/۰۱/۱۵',
          updated_at: '۱۴۰۳/۰۶/۲۰',
          enrolled_students: 245,
          completion_rate: 78,
          avg_rating: 4.8,
        },
        {
          id: 2,
          title: 'برنامه‌نویسی پایتون',
          description: 'آموزش برنامه‌نویسی پایتون از صفر',
          thumbnail_url: 'https://via.placeholder.com/300x200',
          teacher_name: 'مهندس مریم رضایی',
          price: 0,
          is_free: true,
          rating: 4.9,
          student_count: 320,
          category: 'برنامه‌نویسی',
          status: 'published',
          created_at: '۱۴۰۳/۰۲/۱۰',
          updated_at: '۱۴۰۳/۰۵/۱۵',
          enrolled_students: 320,
          completion_rate: 65,
          avg_rating: 4.9,
        },
        {
          id: 3,
          title: 'آموزش زبان انگلیسی',
          description: 'آموزش کامل زبان انگلیسی در ۶ ماه',
          thumbnail_url: 'https://via.placeholder.com/300x200',
          teacher_name: 'استاد محمد کریمی',
          price: 300000,
          is_free: false,
          rating: 4.7,
          student_count: 180,
          category: 'زبان',
          status: 'draft',
          created_at: '۱۴۰۳/۰۳/۰۵',
          updated_at: '۱۴۰۳/۰۶/۱۰',
          enrolled_students: 0,
          completion_rate: 0,
          avg_rating: 0,
        },
      ];
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);
    } catch (error) {
      Alert.alert('خطا', 'در دریافت اطلاعات دوره‌ها مشکلی پیش آمده');
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.includes(searchQuery) ||
        course.description.includes(searchQuery) ||
        course.teacher_name.includes(searchQuery)
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(course => course.status === filterStatus);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(course => course.category === filterCategory);
    }

    setFilteredCourses(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return Colors.success;
      case 'draft': return Colors.warning;
      case 'archived': return Colors.textSecondary;
      default: return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'منتشر شده';
      case 'draft': return 'پیش‌نویس';
      case 'archived': return 'آرشیو شده';
      default: return status;
    }
  };

  const handleDeleteCourse = (courseId: number) => {
    Alert.alert(
      'حذف دوره',
      'آیا از حذف این دوره اطمینان دارید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete API
            setCourses(courses.filter(course => course.id !== courseId));
            Alert.alert('موفق', 'دوره با موفقیت حذف شد');
          },
        },
      ]
    );
  };

  const handleChangeStatus = (courseId: number, newStatus: Course['status']) => {
    // TODO: Implement status change API
    setCourses(courses.map(course =>
      course.id === courseId ? { ...course, status: newStatus } : course
    ));
  };

  const categories = ['همه', 'ریاضی', 'برنامه‌نویسی', 'زبان', 'علوم', 'تاریخ'];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="مدیریت دوره‌ها" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="مدیریت دوره‌ها"
        rightComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(admin)/courses/create')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content}>
        {/* Search and Filters */}
        <View style={styles.filterSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="جستجوی دوره..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filterChip, filterStatus === 'all' && styles.filterChipActive]}
                onPress={() => setFilterStatus('all')}
              >
                <Text style={[styles.filterChipText, filterStatus === 'all' && styles.filterChipTextActive]}>
                  همه
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterStatus === 'published' && styles.filterChipActive]}
                onPress={() => setFilterStatus('published')}
              >
                <Text style={[styles.filterChipText, filterStatus === 'published' && styles.filterChipTextActive]}>
                  منتشر شده
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterStatus === 'draft' && styles.filterChipActive]}
                onPress={() => setFilterStatus('draft')}
              >
                <Text style={[styles.filterChipText, filterStatus === 'draft' && styles.filterChipTextActive]}>
                  پیش‌نویس
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterStatus === 'archived' && styles.filterChipActive]}
                onPress={() => setFilterStatus('archived')}
              >
                <Text style={[styles.filterChipText, filterStatus === 'archived' && styles.filterChipTextActive]}>
                  آرشیو شده
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.categoryChip, filterCategory === (category === 'همه' ? 'all' : category) && styles.categoryChipActive]}
                onPress={() => setFilterCategory(category === 'همه' ? 'all' : category)}
              >
                <Text style={[styles.categoryChipText, filterCategory === (category === 'همه' ? 'all' : category) && styles.categoryChipTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{courses.length}</Text>
            <Text style={styles.statLabel}>دوره کل</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {courses.filter(c => c.status === 'published').length}
            </Text>
            <Text style={styles.statLabel}>منتشر شده</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {courses.filter(c => c.is_free).length}
            </Text>
            <Text style={styles.statLabel}>رایگان</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {courses.reduce((sum, course) => sum + course.enrolled_students, 0)}
            </Text>
            <Text style={styles.statLabel}>ثبت‌نامی</Text>
          </View>
        </View>

        {/* Courses List */}
        <View style={styles.coursesList}>
          {filteredCourses.map(course => (
            <TouchableOpacity
              key={course.id}
              style={styles.courseCard}
              onPress={() => router.push(`/(admin)/courses/${course.id}`)}
            >
              <Image
                source={{ uri: course.thumbnail_url }}
                style={styles.courseImage}
              />
              <View style={styles.courseContent}>
                <View style={styles.courseHeader}>
                  <View style={styles.courseTitleRow}>
                    <Text style={styles.courseTitle} numberOfLines={1}>
                      {course.title}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(course.status)}20` }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(course.status) }]}>
                        {getStatusText(course.status)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.courseDescription} numberOfLines={2}>
                    {course.description}
                  </Text>
                </View>

                <View style={styles.courseMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="person" size={14} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>{course.teacher_name}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="people" size={14} color={Colors.textSecondary} />
                    <Text style={styles.metaText}>{course.enrolled_students} دانش‌آموز</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="star" size={14} color={Colors.warning} />
                    <Text style={styles.metaText}>{course.avg_rating.toFixed(1)}</Text>
                  </View>
                </View>

                <View style={styles.courseFooter}>
                  <View style={styles.priceContainer}>
                    {course.is_free ? (
                      <Text style={styles.freeText}>رایگان</Text>
                    ) : (
                      <Text style={styles.priceText}>
                        {course.price.toLocaleString()} تومان
                      </Text>
                    )}
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleChangeStatus(course.id, course.status === 'published' ? 'draft' : 'published');
                      }}
                    >
                      <Ionicons
                        name={course.status === 'published' ? 'eye-off' : 'eye'}
                        size={20}
                        color={Colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteCourse(course.id);
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredCourses.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyStateText}>دوره‌ای یافت نشد</Text>
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
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginRight: 8,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
  },
  filterRow: {
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  categoryChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
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
    height: 160,
  },
  courseContent: {
    padding: 16,
  },
  courseHeader: {
    marginBottom: 12,
  },
  courseTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  courseDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  courseMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  freeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.success,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
});