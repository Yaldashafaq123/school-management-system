import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Header } from '../../../components/Header';

interface CourseAnalytics {
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  avgRating: number;
  completionRate: number;
  totalRevenue: number;
  topCourses: {
    id: number;
    title: string;
    enrollments: number;
    rating: number;
    revenue: number;
    completionRate: number;
  }[];
  categoryDistribution: {
    category: string;
    courses: number;
    enrollments: number;
    revenue: number;
  }[];
  monthlyPerformance: {
    month: string;
    newCourses: number;
    enrollments: number;
    revenue: number;
  }[];
}

export default function CourseAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockAnalytics: CourseAnalytics = {
        totalCourses: 42,
        activeCourses: 38,
        totalEnrollments: 1245,
        avgRating: 4.7,
        completionRate: 68.5,
        totalRevenue: 18500000,
        topCourses: [
          {
            id: 1,
            title: 'ریاضی پیشرفته پایه هفتم',
            enrollments: 245,
            rating: 4.8,
            revenue: 12250000,
            completionRate: 78,
          },
          {
            id: 2,
            title: 'برنامه‌نویسی پایتون',
            enrollments: 320,
            rating: 4.9,
            revenue: 0,
            completionRate: 65,
          },
          {
            id: 3,
            title: 'آموزش زبان انگلیسی',
            enrollments: 180,
            rating: 4.7,
            revenue: 5400000,
            completionRate: 72,
          },
          {
            id: 4,
            title: 'فیزیک مدرن',
            enrollments: 154,
            rating: 4.6,
            revenue: 4620000,
            completionRate: 68,
          },
        ],
        categoryDistribution: [
          { category: 'ریاضی', courses: 12, enrollments: 420, revenue: 12600000 },
          { category: 'برنامه‌نویسی', courses: 8, enrollments: 380, revenue: 0 },
          { category: 'زبان', courses: 6, enrollments: 220, revenue: 6600000 },
          { category: 'علوم', courses: 5, enrollments: 180, revenue: 5400000 },
          { category: 'سایر', courses: 11, enrollments: 45, revenue: 1350000 },
        ],
        monthlyPerformance: [
          { month: 'فروردین', newCourses: 4, enrollments: 320, revenue: 9600000 },
          { month: 'اردیبهشت', newCourses: 5, enrollments: 280, revenue: 8400000 },
          { month: 'خرداد', newCourses: 6, enrollments: 420, revenue: 12600000 },
          { month: 'تیر', newCourses: 3, enrollments: 180, revenue: 5400000 },
          { month: 'مرداد', newCourses: 7, enrollments: 380, revenue: 11400000 },
          { month: 'شهریور', newCourses: 8, enrollments: 450, revenue: 13500000 },
        ],
      };
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="تحلیل دوره‌ها" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString() + ' تومان';
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="تحلیل دوره‌ها"
        rightComponent={
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => Alert.alert('خروجی', 'گزارش در حال تولید است')}
          >
            <Ionicons name="download" size={24} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Range Filter */}
        <View style={styles.timeRangeContainer}>
          {(['week', 'month', 'quarter', 'year'] as const).map(range => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {range === 'week' && 'هفته'}
                {range === 'month' && 'ماه'}
                {range === 'quarter' && 'فصل'}
                {range === 'year' && 'سال'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analytics.totalCourses}</Text>
            <Text style={styles.metricLabel}>دوره کل</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analytics.totalEnrollments.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>ثبت‌نامی</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analytics.avgRating.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>میانگین امتیاز</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analytics.completionRate}%</Text>
            <Text style={styles.metricLabel}>نرخ تکمیل</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {formatCurrency(analytics.totalRevenue)}
            </Text>
            <Text style={styles.metricLabel}>درآمد کل</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analytics.activeCourses}</Text>
            <Text style={styles.metricLabel}>دوره فعال</Text>
          </View>
        </View>

        {/* Top Courses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>پرفروش‌ترین دوره‌ها</Text>
          <View style={styles.coursesList}>
            {analytics.topCourses.map((course, index) => (
              <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                onPress={() => router.push(`/(admin)/courses/${course.id}`)}
              >
                <View style={styles.courseHeader}>
                  <View style={styles.courseRank}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle} numberOfLines={1}>
                      {course.title}
                    </Text>
                    <View style={styles.courseStats}>
                      <View style={styles.courseStat}>
                        <Ionicons name="people" size={12} color={Colors.textSecondary} />
                        <Text style={styles.courseStatText}>
                          {course.enrollments.toLocaleString()}
                        </Text>
                      </View>
                      <View style={styles.courseStat}>
                        <Ionicons name="star" size={12} color={Colors.warning} />
                        <Text style={styles.courseStatText}>{course.rating.toFixed(1)}</Text>
                      </View>
                      <View style={styles.courseStat}>
                        <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                        <Text style={styles.courseStatText}>{course.completionRate}%</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.courseFooter}>
                  <Text style={styles.revenueText}>
                    {course.revenue > 0 ? formatCurrency(course.revenue) : 'رایگان'}
                  </Text>
                  <TouchableOpacity style={styles.detailButton}>
                    <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>توزیع بر اساس دسته‌بندی</Text>
          <View style={styles.categoryCard}>
            {analytics.categoryDistribution.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{category.category}</Text>
                  <View style={styles.categoryStats}>
                    <Text style={styles.categoryCourses}>{category.courses} دوره</Text>
                    <Text style={styles.categoryEnrollments}>
                      {category.enrollments.toLocaleString()} ثبت‌نامی
                    </Text>
                  </View>
                </View>
                
                <View style={styles.categoryProgress}>
                  <View
                    style={[
                      styles.categoryBar,
                      { width: `${(category.courses / Math.max(...analytics.categoryDistribution.map(c => c.courses))) * 100}%` },
                    ]}
                  />
                </View>
                
                <View style={styles.categoryFooter}>
                  <Text style={styles.revenueLabel}>درآمد:</Text>
                  <Text style={styles.revenueValue}>
                    {category.revenue > 0 ? formatCurrency(category.revenue) : 'رایگان'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>عملکرد ماهانه</Text>
          <View style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <Text style={styles.performanceHeaderCell}>ماه</Text>
              <Text style={styles.performanceHeaderCell}>دوره جدید</Text>
              <Text style={styles.performanceHeaderCell}>ثبت‌نامی</Text>
              <Text style={styles.performanceHeaderCell}>درآمد</Text>
            </View>
            
            {analytics.monthlyPerformance.map((month, index) => (
              <View key={index} style={styles.performanceRow}>
                <Text style={styles.performanceCell}>{month.month}</Text>
                <Text style={styles.performanceCell}>{month.newCourses}</Text>
                <Text style={styles.performanceCell}>{month.enrollments.toLocaleString()}</Text>
                <Text style={styles.performanceCell}>
                  {formatCurrency(month.revenue)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Course Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نوع دوره‌ها</Text>
          <View style={styles.typesGrid}>
            <View style={styles.typeCard}>
              <View style={[styles.typeIcon, { backgroundColor: `${Colors.primary}20` }]}>
                <Ionicons name="cash" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.typeValue}>۲۸</Text>
              <Text style={styles.typeLabel}>پولی</Text>
            </View>
            
            <View style={styles.typeCard}>
              <View style={[styles.typeIcon, { backgroundColor: `${Colors.success}20` }]}>
                <Ionicons name="gift" size={32} color={Colors.success} />
              </View>
              <Text style={styles.typeValue}>۱۴</Text>
              <Text style={styles.typeLabel}>رایگان</Text>
            </View>
            
            <View style={styles.typeCard}>
              <View style={[styles.typeIcon, { backgroundColor: `${Colors.warning}20` }]}>
                <Ionicons name="time" size={32} color={Colors.warning} />
              </View>
              <Text style={styles.typeValue}>۲۱</Text>
              <Text style={styles.typeLabel}>در حال برگزاری</Text>
            </View>
            
            <View style={styles.typeCard}>
              <View style={[styles.typeIcon, { backgroundColor: `${Colors.secondary}20` }]}>
                <Ionicons name="checkmark-done" size={32} color={Colors.secondary} />
              </View>
              <Text style={styles.typeValue}>۱۷</Text>
              <Text style={styles.typeLabel}>تکمیل شده</Text>
            </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.primary,
  },
  timeRangeText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  timeRangeTextActive: {
    color: '#fff',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  metricLabel: {
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
  coursesList: {
    gap: 12,
  },
  courseCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  courseRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  courseStats: {
    flexDirection: 'row',
    gap: 16,
  },
  courseStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  courseStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  revenueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  detailButton: {
    padding: 4,
  },
  categoryCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryItem: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  categoryStats: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryCourses: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  categoryEnrollments: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  categoryProgress: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  categoryBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  revenueValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  performanceCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  performanceHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  performanceHeaderCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  performanceRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  performanceRowLast: {
    borderBottomWidth: 0,
  },
  performanceCell: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});