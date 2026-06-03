// app/progress/index.tsx
import { Header } from '@/components/Header';
import { ProgressChart } from '@/components/ProgressChart';
import { ProgressStats } from '@/components/ProgressStats';
import { Colors } from '@/constants/Colors';
import { ProgressAnalytics } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data - Replace with API calls
const mockAnalytics: ProgressAnalytics[] = [
  {
    course_id: 1,
    course_title: 'ریاضی پایه هفتم',
    total_lessons: 24,
    completed_lessons: 18,
    completion_percentage: 75,
    total_hours: 48,
    time_spent: 32,
    last_accessed: '2024-12-20T14:30:00',
    streak_days: 14,
    average_score: 8.5,
    assignments_completed: 5,
    assignments_total: 8,
    exams_completed: 2,
    exams_total: 3,
    weekly_progress: [
      { week: '2024-W50', lessons_completed: 3, time_spent: 240, average_score: 8.2 },
      { week: '2024-W51', lessons_completed: 4, time_spent: 320, average_score: 8.7 },
      { week: '2024-W52', lessons_completed: 5, time_spent: 400, average_score: 9.0 },
      { week: '2025-W01', lessons_completed: 3, time_spent: 280, average_score: 8.5 },
      { week: '2025-W02', lessons_completed: 3, time_spent: 240, average_score: 8.3 },
    ],
  },
  {
    course_id: 2,
    course_title: 'علوم تجربی هفتم',
    total_lessons: 20,
    completed_lessons: 12,
    completion_percentage: 60,
    total_hours: 40,
    time_spent: 24,
    last_accessed: '2024-12-18T10:15:00',
    streak_days: 7,
    average_score: 7.8,
    assignments_completed: 3,
    assignments_total: 6,
    exams_completed: 1,
    exams_total: 2,
    weekly_progress: [
      { week: '2024-W50', lessons_completed: 2, time_spent: 180, average_score: 7.5 },
      { week: '2024-W51', lessons_completed: 3, time_spent: 220, average_score: 7.8 },
      { week: '2024-W52', lessons_completed: 4, time_spent: 280, average_score: 8.0 },
      { week: '2025-W01', lessons_completed: 2, time_spent: 200, average_score: 7.9 },
      { week: '2025-W02', lessons_completed: 1, time_spent: 160, average_score: 7.6 },
    ],
  },
];

export default function ProgressAnalyticsScreen() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<ProgressAnalytics[]>(mockAnalytics);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('month');
  const [selectedCourse, setSelectedCourse] = useState<number | null>(1);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const handleCourseSelect = (courseId: number) => {
    setSelectedCourse(courseId);
  };

  const selectedAnalytics = analytics.find(a => a.course_id === selectedCourse) || analytics[0];

  const calculateOverallStats = () => {
    const totalCourses = analytics.length;
    const totalCompletion = analytics.reduce((sum, a) => sum + a.completion_percentage, 0) / totalCourses;
    const totalTimeSpent = analytics.reduce((sum, a) => sum + a.time_spent, 0);
    const totalAssignments = analytics.reduce((sum, a) => sum + a.assignments_completed, 0);
    const totalExams = analytics.reduce((sum, a) => sum + a.exams_completed, 0);
    const averageScore = analytics.reduce((sum, a) => sum + a.average_score, 0) / totalCourses;

    return {
      totalCourses,
      totalCompletion: Math.round(totalCompletion),
      totalTimeSpent,
      totalAssignments,
      totalExams,
      averageScore: averageScore.toFixed(1),
    };
  };

  const overallStats = calculateOverallStats();

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="تحلیل پیشرفت"
        rightComponent={
          <TouchableOpacity onPress={() => router.push('progress/certificates' as any)}>
            <Ionicons name="trophy" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Overall Stats */}
        <View style={styles.overallStats}>
          <Text style={styles.overallTitle}>آمار کلی</Text>
          <View style={styles.overallGrid}>
            <View style={styles.overallStat}>
              <Text style={styles.overallValue}>{overallStats.totalCourses}</Text>
              <Text style={styles.overallLabel}>دوره فعال</Text>
            </View>
            <View style={styles.overallStat}>
              <Text style={styles.overallValue}>{overallStats.totalCompletion}%</Text>
              <Text style={styles.overallLabel}>میانگین پیشرفت</Text>
            </View>
            <View style={styles.overallStat}>
              <Text style={styles.overallValue}>
                {Math.floor(overallStats.totalTimeSpent / 60)}h
              </Text>
              <Text style={styles.overallLabel}>زمان مطالعه</Text>
            </View>
            <View style={styles.overallStat}>
              <Text style={styles.overallValue}>{overallStats.averageScore}</Text>
              <Text style={styles.overallLabel}>میانگین نمره</Text>
            </View>
          </View>
        </View>

        {/* Time Range Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>بازه زمانی</Text>
          <View style={styles.filterButtons}>
            {[
              { id: 'week', label: 'هفته گذشته' },
              { id: 'month', label: 'ماه گذشته' },
              { id: 'all', label: 'همه زمان' },
            ].map((range) => (
              <TouchableOpacity
                key={range.id}
                style={[
                  styles.filterButton,
                  timeRange === range.id && styles.filterButtonActive,
                ]}
                onPress={() => setTimeRange(range.id as any)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    timeRange === range.id && styles.filterButtonTextActive,
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Course Selection */}
        <View style={styles.courseSection}>
          <Text style={styles.sectionTitle}>انتخاب دوره</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.courseList}
          >
            {analytics.map((course) => (
              <TouchableOpacity
                key={course.course_id}
                style={[
                  styles.courseButton,
                  selectedCourse === course.course_id && styles.courseButtonActive,
                ]}
                onPress={() => handleCourseSelect(course.course_id)}
              >
                <Text
                  style={[
                    styles.courseButtonText,
                    selectedCourse === course.course_id && styles.courseButtonTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {course.course_title}
                </Text>
                <Text style={styles.courseProgress}>
                  {course.completion_percentage}% تکمیل
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Selected Course Analytics */}
        {selectedAnalytics && (
          <>
            <ProgressStats
              analytics={selectedAnalytics}
              onViewDetails={() => {
                const path = 'progress/course/' + selectedAnalytics.course_id;
                router.push(path as any);
              }}
            />

            <View style={styles.chartsSection}>
              <ProgressChart
                analytics={selectedAnalytics}
                type="line"
              />
              <ProgressChart
                analytics={selectedAnalytics}
                type="bar"
              />
              <ProgressChart
                analytics={selectedAnalytics}
                type="pie"
              />
            </View>
          </>
        )}

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>نکات و پیشنهادات</Text>
          <View style={styles.insightsList}>
            <View style={styles.insightCard}>
              <Ionicons name="bulb" size={24} color={Colors.warning} />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>نکته‌ای برای شما</Text>
                <Text style={styles.insightText}>
                  شما {selectedAnalytics?.streak_days || 0} روز متوالی در حال یادگیری هستید! 
                  برای حفظ این رکورد ادامه دهید.
                </Text>
              </View>
            </View>
            
            {selectedAnalytics && selectedAnalytics.completion_percentage < 50 && (
              <View style={styles.insightCard}>
                <Ionicons name="alert-circle" size={24} color={Colors.danger} />
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>نیازمند توجه</Text>
                  <Text style={styles.insightText}>
                    پیشرفت شما در این دوره کمتر از ۵۰٪ است. 
                    سعی کنید زمان بیشتری را به یادگیری اختصاص دهید.
                  </Text>
                </View>
              </View>
            )}

            {selectedAnalytics && selectedAnalytics.average_score >= 9 && (
              <View style={styles.insightCard}>
                <Ionicons name="trophy" size={24} color={Colors.success} />
                <View style={styles.insightContent}>
                  <Text style={styles.insightTitle}>عالی!</Text>
                  <Text style={styles.insightText}>
                    میانگین نمرات شما عالی است. همین روند را ادامه دهید.
                  </Text>
                </View>
              </View>
            )}
          </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  overallStats: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overallTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  overallGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overallStat: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overallValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  overallLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: Colors.card,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  courseSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  courseList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  courseButton: {
    backgroundColor: Colors.card,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 12,
    minWidth: 150,
  },
  courseButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: Colors.primary,
  },
  courseButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  courseButtonTextActive: {
    color: Colors.primary,
  },
  courseProgress: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chartsSection: {
    gap: 16,
    marginBottom: 24,
  },
  insightsSection: {
    marginBottom: 32,
  },
  insightsList: {
    gap: 12,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  insightText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});