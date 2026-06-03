import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/Colors';
import { Header } from '../../components/Header';

const screenWidth = Dimensions.get('window').width;

const mockAnalytics = {
  total_students: 245,
  active_students: 210,
  engagement_rate: 85,
  completion_rate: 75,
  average_grade: 16.8,
  satisfaction_rate: 4.8,
};

const mockCoursesData = [
  { name: 'ریاضی هفتم', students: 45, revenue: 4500000, color: '#3B82F6' },
  { name: 'علوم تجربی', students: 38, revenue: 3800000, color: '#10B981' },
  { name: 'ادبیات فارسی', students: 52, revenue: 5200000, color: '#8B5CF6' },
  { name: 'ریاضی هشتم', students: 30, revenue: 3000000, color: '#F59E0B' },
  { name: 'دیگر دوره‌ها', students: 80, revenue: 6000000, color: '#6B7280' },
];

const mockMonthlyEngagement = [
  { month: 'مهر', engagement: 78 },
  { month: 'آبان', engagement: 82 },
  { month: 'آذر', engagement: 85 },
  { month: 'دی', engagement: 88 },
  { month: 'بهمن', engagement: 90 },
  { month: 'اسفند', engagement: 92 },
];

const mockGradeDistribution = [
  { range: '۱۸-۲۰', count: 65, percentage: 26.5 },
  { range: '۱۵-۱۸', count: 98, percentage: 40 },
  { range: '۱۰-۱۵', count: 62, percentage: 25.3 },
  { range: '۰-۱۰', count: 20, percentage: 8.2 },
];

const timeFilters = [
  { id: 'week', title: 'هفته' },
  { id: 'month', title: 'ماه' },
  { id: 'quarter', title: 'سه‌ماهه' },
  { id: 'year', title: 'سال' },
  { id: 'all', title: 'همه زمان' },
];

export default function Analytics() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('month');

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('fa-IR');
  };

  const formatPercentage = (num: number) => {
    return num.toFixed(1) + '%';
  };

  const engagementChartData = {
    labels: mockMonthlyEngagement.map(item => item.month),
    datasets: [{
      data: mockMonthlyEngagement.map(item => item.engagement),
    }],
  };

  const gradeChartData = {
    labels: mockGradeDistribution.map(item => item.range),
    datasets: [{
      data: mockGradeDistribution.map(item => item.percentage),
    }],
  };

  const coursesChartData = mockCoursesData.map(course => ({
    name: course.name,
    population: course.students,
    color: course.color,
    legendFontColor: Colors.text,
    legendFontSize: 12,
  }));

  const chartConfig = {
    backgroundColor: Colors.card,
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: Colors.primary
    },
    propsForLabels: {
      fontSize: 10,
    },
  };

  const barChartConfig = {
    ...chartConfig,
    barPercentage: 0.5,
  };

  const getEngagementTrend = () => {
    const last = mockMonthlyEngagement[mockMonthlyEngagement.length - 1].engagement;
    const first = mockMonthlyEngagement[0].engagement;
    const trend = ((last - first) / first) * 100;
    return {
      trend,
      icon: trend >= 0 ? 'trending-up' as const : 'trending-down' as const,
      color: trend >= 0 ? Colors.success : Colors.danger,
    };
  };

  const engagementTrend = getEngagementTrend();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="تحلیل و آمار" />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="people" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{formatNumber(mockAnalytics.total_students)}</Text>
              <Text style={styles.statLabel}>کل دانش‌آموزان</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              </View>
              <Text style={styles.statValue}>{formatPercentage(mockAnalytics.engagement_rate)}</Text>
              <Text style={styles.statLabel}>نرخ مشارکت</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Ionicons name="school" size={20} color={Colors.warning} />
              </View>
              <Text style={styles.statValue}>{formatPercentage(mockAnalytics.completion_rate)}</Text>
              <Text style={styles.statLabel}>نرخ اتمام دوره</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <Ionicons name="star" size={20} color={Colors.secondary} />
              </View>
              <Text style={styles.statValue}>{mockAnalytics.satisfaction_rate.toFixed(1)}</Text>
              <Text style={styles.statLabel}>رضایت دانش‌آموزان</Text>
            </View>
          </View>
        </View>

        {/* Time Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterButtons}>
              {timeFilters.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[styles.filterButton, timeFilter === filter.id && styles.filterButtonActive]}
                  onPress={() => setTimeFilter(filter.id)}
                >
                  <Text style={[styles.filterText, timeFilter === filter.id && styles.filterTextActive]}>
                    {filter.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Engagement Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>نمودار مشارکت دانش‌آموزان</Text>
              <View style={styles.chartTrend}>
                <Ionicons name={engagementTrend.icon} size={16} color={engagementTrend.color} />
                <Text style={[styles.trendText, { color: engagementTrend.color }]}>
                  {engagementTrend.trend.toFixed(1)}% تغییر
                </Text>
              </View>
            </View>
            <Text style={styles.chartAverage}>
              میانگین: {formatPercentage(mockAnalytics.engagement_rate)}
            </Text>
          </View>
          <LineChart
            data={engagementChartData}
            width={screenWidth - 40}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withVerticalLines={false}
            withHorizontalLines={false}
            withInnerLines={false}
            withOuterLines={false}
            fromZero={true}
            segments={5}
            formatYLabel={(value: string) => `${value}%`}
          />
        </View>

        {/* Courses Distribution */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>توزیع دانش‌آموزان در دوره‌ها</Text>
          <PieChart
            data={coursesChartData}
            width={screenWidth - 40}
            height={180}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute={false}
          />
          <View style={styles.coursesLegend}>
            {mockCoursesData.map((course, index) => (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: course.color }]} />
                <Text style={styles.legendText}>
                  {course.name}: {course.students} دانش‌آموز
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Grade Distribution */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>توزیع نمرات</Text>
          <BarChart
            data={gradeChartData}
            width={screenWidth - 40}
            height={200}
            chartConfig={barChartConfig}
            style={styles.chart}
            showBarTops={false}
            fromZero={true}
            segments={4}
            yAxisSuffix="%"
            yAxisLabel=""
          />
          <View style={styles.gradeDistribution}>
            {mockGradeDistribution.map((grade, index) => (
              <View key={index} style={styles.gradeItem}>
                <View style={styles.gradeRange}>
                  <Text style={styles.gradeRangeText}>{grade.range}</Text>
                </View>
                <View style={styles.gradeBarContainer}>
                  <View
                    style={[
                      styles.gradeBar,
                      { width: `${grade.percentage}%`, backgroundColor: Colors.primary }
                    ]}
                  />
                </View>
                <Text style={styles.gradeCount}>
                  {grade.count} دانش‌آموز ({grade.percentage}%)
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Student Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>فعالیت دانش‌آموزان</Text>
          <View style={styles.activityStats}>
            <View style={styles.activityStat}>
              <Text style={styles.activityValue}>{formatNumber(mockAnalytics.active_students)}</Text>
              <Text style={styles.activityLabel}>دانش‌آموز فعال</Text>
            </View>
            <View style={styles.activityStat}>
              <Text style={styles.activityValue}>{formatNumber(85)}</Text>
              <Text style={styles.activityLabel}>میانگین حضور هفتگی</Text>
            </View>
            <View style={styles.activityStat}>
              <Text style={styles.activityValue}>{mockAnalytics.average_grade.toFixed(1)}</Text>
              <Text style={styles.activityLabel}>میانگین نمره</Text>
            </View>
            <View style={styles.activityStat}>
              <Text style={styles.activityValue}>{formatNumber(1245)}</Text>
              <Text style={styles.activityLabel}>تکلیف ارسال شده</Text>
            </View>
          </View>
        </View>

        {/* Course Performance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>عملکرد دوره‌ها</Text>
            <TouchableOpacity onPress={() => router.push('./(teacher)/courses')}>
              <Text style={styles.seeAllText}>مشاهده همه</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.coursesPerformance}>
            {mockCoursesData.map((course) => (
              <TouchableOpacity
                key={course.name}
                style={styles.performanceCard}
                onPress={() => router.push(`./(teacher)/course/${course.name === 'ریاضی هفتم' ? '1' : '2'}/manage`)}
              >
                <View style={styles.performanceHeader}>
                  <View style={[styles.courseColor, { backgroundColor: course.color }]} />
                  <Text style={styles.courseName}>{course.name}</Text>
                </View>
                
                <View style={styles.performanceStats}>
                  <View style={styles.performanceStat}>
                    <Ionicons name="people" size={14} color={Colors.textSecondary} />
                    <Text style={styles.performanceValue}>{course.students}</Text>
                    <Text style={styles.performanceLabel}>دانش‌آموز</Text>
                  </View>
                  <View style={styles.performanceStat}>
                    <Ionicons name="cash" size={14} color={Colors.textSecondary} />
                    <Text style={styles.performanceValue}>
                      {(course.revenue / 1000000).toFixed(1)}M
                    </Text>
                    <Text style={styles.performanceLabel}>درآمد</Text>
                  </View>
                  <View style={styles.performanceStat}>
                    <Ionicons name="star" size={14} color={Colors.textSecondary} />
                    <Text style={styles.performanceValue}>۴.۷</Text>
                    <Text style={styles.performanceLabel}>امتیاز</Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '85%' }]} />
                  </View>
                  <Text style={styles.progressText}>۸۵% مشارکت</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.insightsTitle}>نکات کلیدی</Text>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <Ionicons name="trending-up" size={20} color={Colors.success} />
              <Text style={styles.insightText}>
                مشارکت دانش‌آموزان در ۳ ماه گذشته ۱۴% رشد داشته است.
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="school" size={20} color={Colors.primary} />
              <Text style={styles.insightText}>
                دوره ادبیات فارسی بالاترین نرخ اتمام (۹۲%) را دارد.
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="alert-circle" size={20} color={Colors.warning} />
              <Text style={styles.insightText}>
                ۸ دانش‌آموز در ریاضی هشتم نیاز به توجه ویژه دارند.
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Ionicons name="time" size={20} color={Colors.info} />
              <Text style={styles.insightText}>
                بیشترین فعالیت دانش‌آموزان بین ساعت ۱۶-۲۰ است.
              </Text>
            </View>
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.exportSection}>
          <Text style={styles.exportTitle}>گزارش‌ها</Text>
          <View style={styles.exportOptions}>
            <TouchableOpacity style={styles.exportOption}>
              <View style={styles.exportIcon}>
                <Ionicons name="download" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.exportText}>گزارش ماهانه</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportOption}>
              <View style={styles.exportIcon}>
                <Ionicons name="document-text" size={24} color={Colors.success} />
              </View>
              <Text style={styles.exportText}>گزارش عملکرد دوره</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportOption}>
              <View style={styles.exportIcon}>
                <Ionicons name="people" size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.exportText}>گزارش دانش‌آموزان</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportOption}>
              <View style={styles.exportIcon}>
                <Ionicons name="stats-chart" size={24} color={Colors.warning} />
              </View>
              <Text style={styles.exportText}>گزارش مالی</Text>
            </TouchableOpacity>
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
  },
  statsContainer: {
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterTextActive: {
    color: '#fff',
  },
  chartContainer: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  chartTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartAverage: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  chart: {
    borderRadius: 16,
    paddingRight: 0,
  },
  coursesLegend: {
    marginTop: 16,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text,
  },
  gradeDistribution: {
    marginTop: 16,
    gap: 12,
  },
  gradeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gradeRange: {
    width: 40,
  },
  gradeRangeText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
  },
  gradeBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  gradeBar: {
    height: '100%',
    borderRadius: 4,
  },
  gradeCount: {
    fontSize: 10,
    color: Colors.textSecondary,
    minWidth: 80,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  activityStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityStat: {
    width: '48%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  coursesPerformance: {
    gap: 12,
  },
  performanceCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  courseColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  performanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  performanceStat: {
    alignItems: 'center',
    gap: 4,
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  performanceLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  insightsSection: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  insightText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    flex: 1,
  },
  exportSection: {
    padding: 20,
    backgroundColor: Colors.card,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  exportOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exportOption: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  exportText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
});