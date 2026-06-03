// app/(student)/course/[id].tsx (or wherever your course detail screen is)
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Header } from '@/components/Header';
import { studentApi, CourseDetail } from '@/src/config/studentApi';

interface Lesson {
  id: number;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: string;
  order: number;
  isFree: boolean;
  thumbnail?: string;
  isCompleted?: boolean;
}

export default function CourseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'reviews'>('overview');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  const loadCourseDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await studentApi.getCourseDetail(Number(id));
      if (response.success && response.data) {
        setCourse(response.data);
      }
    } catch (error) {
      console.error('Error loading course detail:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadCourseLessons = useCallback(async () => {
    try {
      setLoadingLessons(true);
      // Fetch lessons for this course from your API
      // You need to add this endpoint to your backend
      const response = await studentApi.getCourseLessons(Number(id));
      if (response.success && response.data) {
        setLessons(response.data);
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
      // Fallback: try to get lessons from course data if available
      if (course?.lessons) {
        setLessons(course.lessons as Lesson[]);
      }
    } finally {
      setLoadingLessons(false);
    }
  }, [id, course]);

  useEffect(() => {
    if (id) {
      loadCourseDetail();
    }
  }, [id, loadCourseDetail]);

  useEffect(() => {
    // Load lessons after course is loaded
    if (course) {
      loadCourseLessons();
    }
  }, [course, loadCourseLessons]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCourseDetail();
    await loadCourseLessons();
    setRefreshing(false);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `دوره ${course?.title} را در اپلیکیشن ما ببینید!`,
        url: `https://app.com/course/${id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleStartLesson = (lessonId: number) => {
    // Fixed navigation path - using correct Expo Router syntax
    router.push(`/(student)/lesson/${lessonId}`);
  };

  const getCompletionPercentage = () => {
    if (!lessons || lessons.length === 0) return 0;
    const completed = lessons.filter(l => l.isCompleted).length;
    return Math.round((completed / lessons.length) * 100);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="جزئیات دوره" />
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
        <Header title="خطا" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={Colors.danger} />
          <Text style={styles.errorText}>دوره مورد نظر یافت نشد</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>بازگشت</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const completionPercentage = getCompletionPercentage();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title={course.title}
        rightComponent={
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="bookmark-outline" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Course Thumbnail */}
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: course.thumbnail_url || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500' }}
            style={styles.thumbnail}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
            style={styles.thumbnailGradient}
          >
            <View>
              <Text style={styles.teacherName}>مدرس: {course.teacher_name}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{course.rating || 4.5}</Text>
                <Text style={styles.studentsCount}>({course.student_count || 0} دانش آموز)</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Progress Bar */}
        {course.progress > 0 && completionPercentage > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>پیشرفت شما</Text>
              <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
              معرفی دوره
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'lessons' && styles.activeTab]}
            onPress={() => setActiveTab('lessons')}
          >
            <Text style={[styles.tabText, activeTab === 'lessons' && styles.activeTabText]}>
              جلسات ({lessons.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              نظرات
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'overview' && (
            <View>
              {/* Course Description */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>توضیحات دوره</Text>
                <Text style={styles.description}>{course.description}</Text>
              </View>

              {/* What You'll Learn */}
              {course.objectives && course.objectives.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>آنچه یاد خواهید گرفت</Text>
                  {course.objectives?.map((objective: any, index: number) => (
                    <View key={index} style={styles.objectiveItem}>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                      <Text style={styles.objectiveText}>{objective.text || objective}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>پیش‌نیازها</Text>
                  {course.requirements?.map((requirement: any, index: number) => (
                    <View key={index} style={styles.requirementItem}>
                      <Ionicons name="arrow-back-circle" size={20} color={Colors.warning} />
                      <Text style={styles.requirementText}>{requirement.text || requirement}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Teacher Info */}
              <View style={styles.teacherSection}>
                <Text style={styles.sectionTitle}>مدرس دوره</Text>
                <View style={styles.teacherCard}>
                  <Image
                    source={{ uri: course.teacher_image || 'https://i.pravatar.cc/1' }}
                    style={styles.teacherAvatar}
                  />
                  <View style={styles.teacherInfo}>
                    <Text style={styles.teacherNameLarge}>{course.teacher_name}</Text>
                    <Text style={styles.teacherBio}>{course.teacher_bio || 'معلم با تجربه'}</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'lessons' && (
            <View>
              {loadingLessons ? (
                <View style={styles.loadingLessonsContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.loadingLessonsText}>در حال بارگذاری جلسات...</Text>
                </View>
              ) : lessons.length === 0 ? (
                <View style={styles.emptyLessonsContainer}>
                  <Ionicons name="book-outline" size={48} color={Colors.textSecondary} />
                  <Text style={styles.emptyLessonsText}>هنوز جلسه‌ای برای این دوره ثبت نشده است</Text>
                </View>
              ) : (
                lessons.map((lesson, index) => (
                  <TouchableOpacity
                    key={lesson.id}
                    style={styles.lessonItem}
                    onPress={() => handleStartLesson(lesson.id)}
                  >
                    <View style={styles.lessonNumber}>
                      <Text style={styles.lessonNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <View style={styles.lessonMeta}>
                        <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.lessonDuration}>{lesson.duration || '۱۵:۳۰'}</Text>
                        {lesson.isCompleted && (
                          <View style={styles.completedBadge}>
                            <Ionicons name="checkmark" size={12} color="#fff" />
                            <Text style={styles.completedText}>انجام شده</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Ionicons name="play-circle" size={32} color={Colors.primary} />
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {activeTab === 'reviews' && (
            <View style={styles.reviewsContainer}>
              <Text style={styles.noReviewsText}>هنوز نظری ثبت نشده است</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Start Course Button - Only show if not started and has lessons */}
      {course.progress === 0 && lessons.length > 0 && (
        <View style={styles.bottomButton}>
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={() => handleStartLesson(lessons[0].id)}
          >
            <Text style={styles.startButtonText}>شروع دوره</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  thumbnailContainer: {
    height: 200,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  teacherName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 4,
    marginRight: 8,
  },
  studentsCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  progressSection: {
    backgroundColor: Colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  objectiveText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  requirementText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  teacherSection: {
    marginBottom: 24,
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  teacherAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherNameLarge: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  teacherBio: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    gap: 12,
  },
  lessonNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lessonDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  completedText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  reviewsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noReviewsText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  bottomButton: {
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: 16,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingLessonsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingLessonsText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyLessonsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyLessonsText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});