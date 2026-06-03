import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/Colors';
import { Header } from '../../components/Header';

const screenWidth = Dimensions.get('window').width;

const mockReportData = {
  total_students: 245,
  total_courses: 8,
  assignments_graded: 1245,
  average_grade: 16.8,
  completion_rate: 75,
  satisfaction_rate: 4.8,
  attendance_rate: 88,
};

const mockCourseReports = [
  {
    id: 1,
    title: 'ریاضی هفتم',
    students: 45,
    average_grade: 17.2,
    completion_rate: 85,
    assignments_completed: 420,
    satisfaction: 4.9,
  },
  {
    id: 2,
    title: 'علوم تجربی',
    students: 38,
    average_grade: 16.5,
    completion_rate: 78,
    assignments_completed: 350,
    satisfaction: 4.7,
  },
  {
    id: 3,
    title: 'ادبیات فارسی',
    students: 52,
    average_grade: 17.8,
    completion_rate: 92,
    assignments_completed: 475,
    satisfaction: 4.8,
  },
];

const mockMonthlyPerformance = [
  { month: 'مهر', grade: 16.2, completion: 70, satisfaction: 4.6 },
  { month: 'آبان', grade: 16.5, completion: 72, satisfaction: 4.7 },
  { month: 'آذر', grade: 16.8, completion: 75, satisfaction: 4.8 },
  { month: 'دی', grade: 17.1, completion: 78, satisfaction: 4.8 },
  { month: 'بهمن', grade: 17.4, completion: 81, satisfaction: 4.9 },
  { month: 'اسفند', grade: 17.7, completion: 84, satisfaction: 4.9 },
];

const reportTypes = [
  {
    id: 'student',
    title: 'گزارش دانش‌آموز',
    icon: 'people',
    description: 'گزارش عملکرد فردی دانش‌آموزان',
  },
  {
    id: 'course',
    title: 'گزارش دوره',
    icon: 'book',
    description: 'تحلیل عملکرد دوره‌ها',
  },
  {
    id: 'assignment',
    title: 'گزارش تکلیف',
    icon: 'document-text',
    description: 'آمار تکالیف و نمرات',
  },
  {
    id: 'attendance',
    title: 'گزارش حضور',
    icon: 'calendar',
    description: 'حضور و غیاب دانش‌آموزان',
  },
  {
    id: 'revenue',
    title: 'گزارش مالی',
    icon: 'cash',
    description: 'درآمد و پرداخت‌ها',
  },
  {
    id: 'comprehensive',
    title: 'گزارش جامع',
    icon: 'stats-chart',
    description: 'گزارش کامل عملکرد تدریس',
  },
];

const timeRanges = [
  { id: 'week', title: 'هفته گذشته' },
  { id: 'month', title: 'ماه گذشته' },
  { id: 'quarter', title: 'سه‌ماهه' },
  { id: 'year', title: 'سال' },
  { id: 'custom', title: 'سفارشی' },
];

export default function Reports() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState('student');
  const [timeRange, setTimeRange] = useState('month');
  const [reportData] = useState(mockReportData);
  const [courseReports] = useState(mockCourseReports);
  const [monthlyPerformance] = useState(mockMonthlyPerformance);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleGenerateReport = (reportType: string) => {
    Alert.alert(
      'تولید گزارش',
      `آیا می‌خواهید گزارش ${reportTypes.find(r => r.id === reportType)?.title} را تولید کنید؟`,
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'تولید',
          onPress: () => {
            Alert.alert('موفقیت', 'گزارش با موفقیت تولید شد و آماده دانلود است.');
          },
        },
      ]
    );
  };

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    Alert.alert('موفقیت', `گزارش با فرمت ${format.toUpperCase()} با موفقیت صادر شد.`);
  };

  const gradeChartData = {
    labels: monthlyPerformance.map(item => item.month),
    datasets: [{
      data: monthlyPerformance.map(item => item.grade),
    }],
  };

  const completionChartData = {
    labels: monthlyPerformance.map(item => item.month),
    datasets: [{
      data: monthlyPerformance.map(item => item.completion),
    }],
  };

  const chartConfig = {
    backgroundColor: Colors.card,
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    decimalPlaces: 1,
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

  const calculateGrowth = () => {
    const first = monthlyPerformance[0];
    const last = monthlyPerformance[monthlyPerformance.length - 1];
    const gradeGrowth = ((last.grade - first.grade) / first.grade) * 100;
    const completionGrowth = ((last.completion - first.completion) / first.completion) * 100;
    return { gradeGrowth, completionGrowth };
  };

  const growth = calculateGrowth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="گزارش‌ها"
        rightComponent={
          <TouchableOpacity onPress={() => handleExportReport('pdf')}>
            <Ionicons name="download" size={24} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

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
        {/* Time Range Filters */}
        <View style={styles.timeRangeContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.timeRangeButtons}>
              {timeRanges.map((range) => (
                <TouchableOpacity
                  key={range.id}
                  style={[styles.timeRangeButton, timeRange === range.id && styles.timeRangeButtonActive]}
                  onPress={() => setTimeRange(range.id)}
                >
                  <Text style={[styles.timeRangeText, timeRange === range.id && styles.timeRangeTextActive]}>
                    {range.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Overview Stats */}
        <View style={styles.overviewContainer}>
          <Text style={styles.overviewTitle}>خلاصه عملکرد</Text>
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Ionicons name="people" size={24} color={Colors.primary} />
              <Text style={styles.overviewValue}>{reportData.total_students}</Text>
              <Text style={styles.overviewLabel}>دانش‌آموز</Text>
            </View>
            <View style={styles.overviewStat}>
              <Ionicons name="school" size={24} color={Colors.success} />
              <Text style={styles.overviewValue}>{reportData.average_grade.toFixed(1)}</Text>
              <Text style={styles.overviewLabel}>میانگین نمره</Text>
              <View style={styles.growthBadge}>
                <Ionicons name="trending-up" size={12} color={Colors.success} />
                <Text style={styles.growthText}>{growth.gradeGrowth.toFixed(1)}%</Text>
              </View>
            </View>
            <View style={styles.overviewStat}>
              <Ionicons name="checkmark-done" size={24} color={Colors.warning} />
              <Text style={styles.overviewValue}>{reportData.completion_rate}%</Text>
              <Text style={styles.overviewLabel}>نرخ اتمام</Text>
              <View style={styles.growthBadge}>
                <Ionicons name="trending-up" size={12} color={Colors.success} />
                <Text style={styles.growthText}>{growth.completionGrowth.toFixed(1)}%</Text>
              </View>
            </View>
            <View style={styles.overviewStat}>
              <Ionicons name="star" size={24} color={Colors.secondary} />
              <Text style={styles.overviewValue}>{reportData.satisfaction_rate.toFixed(1)}</Text>
              <Text style={styles.overviewLabel}>رضایت</Text>
            </View>
          </View>
        </View>

        {/* Performance Charts */}
        <View style={styles.chartsContainer}>
          <View style={styles.chartWrapper}>
            <Text style={styles.chartTitle}>میانگین نمرات ماهانه</Text>
            <LineChart
              data={gradeChartData}
              width={screenWidth - 40}
              height={160}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withVerticalLines={false}
              withHorizontalLines={false}
              fromZero={false}
              segments={5}
            />
          </View>

          <View style={styles.chartWrapper}>
            <Text style={styles.chartTitle}>نرخ اتمام دوره‌ها</Text>
            <BarChart
              data={completionChartData}
              width={screenWidth - 40}
              height={160}
              chartConfig={chartConfig}
              style={styles.chart}
              showBarTops={false}
              fromZero={true}
              segments={5}
              yAxisLabel=""
              yAxisSuffix=""
            />
          </View>
        </View>

        {/* Report Types */}
        <View style={styles.reportsContainer}>
          <Text style={styles.reportsTitle}>گزارش‌های آماده</Text>
          <View style={styles.reportsGrid}>
            {reportTypes.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={[
                  styles.reportCard,
                  selectedReport === report.id && styles.reportCardSelected
                ]}
                onPress={() => {
                  setSelectedReport(report.id);
                  handleGenerateReport(report.id);
                }}
              >
                <View style={[
                  styles.reportIcon,
                  { backgroundColor: selectedReport === report.id ? Colors.primary + '20' : Colors.background }
                ]}>
                  <Ionicons
                    name={report.icon as any}
                    size={24}
                    color={selectedReport === report.id ? Colors.primary : Colors.text}
                  />
                </View>
                <Text style={[
                  styles.reportTitle,
                  selectedReport === report.id && styles.reportTitleSelected
                ]}>
                  {report.title}
                </Text>
                <Text style={styles.reportDescription}>
                  {report.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Course Reports */}
        <View style={styles.courseReportsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>گزارش‌های دوره</Text>
            <TouchableOpacity onPress={() => router.push('../courses')}>
              <Text style={styles.seeAllText}>مشاهده همه</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.courseReportsList}>
            {courseReports.map((course) => (
              <View key={course.id} style={styles.courseReportCard}>
                <View style={styles.courseReportHeader}>
                  <Text style={styles.courseReportTitle}>{course.title}</Text>
                  <View style={styles.courseReportStats}>
                    <View style={styles.courseStat}>
                      <Ionicons name="people" size={12} color={Colors.textSecondary} />
                      <Text style={styles.courseStatValue}>{course.students}</Text>
                      <Text style={styles.courseStatLabel}>دانش‌آموز</Text>
                    </View>
                    <View style={styles.courseStat}>
                      <Ionicons name="star" size={12} color={Colors.textSecondary} />
                      <Text style={styles.courseStatValue}>{course.satisfaction.toFixed(1)}</Text>
                      <Text style={styles.courseStatLabel}>رضایت</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.courseReportProgress}>
                  <View style={styles.progressItem}>
                    <Text style={styles.progressLabel}>میانگین نمره</Text>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${(course.average_grade / 20) * 100}%`, backgroundColor: Colors.success }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressValue}>{course.average_grade.toFixed(1)}/۲۰</Text>
                  </View>

                  <View style={styles.progressItem}>
                    <Text style={styles.progressLabel}>نرخ اتمام</Text>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${course.completion_rate}%`, backgroundColor: Colors.primary }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressValue}>{course.completion_rate}%</Text>
                  </View>

                  <View style={styles.progressItem}>
                    <Text style={styles.progressLabel}>تکالیف انجام شده</Text>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          { width: `${(course.assignments_completed / 500) * 100}%`, backgroundColor: Colors.warning }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressValue}>{course.assignments_completed}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.generateReportButton}
                  onPress={() => handleGenerateReport('course')}
                >
                  <Ionicons name="document-text" size={16} color={Colors.primary} />
                  <Text style={styles.generateReportText}>گزارش این دوره</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.exportOptionsContainer}>
          <Text style={styles.exportOptionsTitle}>خروجی گزارش</Text>
          <View style={styles.exportOptions}>
            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => handleExportReport('pdf')}
            >
              <View style={[styles.exportIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Ionicons name="document" size={24} color={Colors.danger} />
              </View>
              <Text style={styles.exportOptionTitle}>PDF</Text>
              <Text style={styles.exportOptionDescription}>
                با کیفیت بالا و قابلیت چاپ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => handleExportReport('excel')}
            >
              <View style={[styles.exportIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="grid" size={24} color={Colors.success} />
              </View>
              <Text style={styles.exportOptionTitle}>Excel</Text>
              <Text style={styles.exportOptionDescription}>
                قابل ویرایش و تحلیل
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exportOption}
              onPress={() => handleExportReport('csv')}
            >
              <View style={[styles.exportIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="code" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.exportOptionTitle}>CSV</Text>
              <Text style={styles.exportOptionDescription}>
                سازگار با همه سیستم‌ها
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>نکات کلیدی گزارش</Text>
          <View style={styles.insightsList}>
            <View style={styles.insightItem}>
              <Ionicons name="trending-up" size={20} color={Colors.success} />
              <View>
                <Text style={styles.insightTitle}>روند مثبت</Text>
                <Text style={styles.insightText}>
                  میانگین نمرات در ۶ ماه گذشته ۹.۳% رشد داشته است.
                </Text>
              </View>
            </View>

            <View style={styles.insightItem}>
              <Ionicons name="star" size={20} color={Colors.warning} />
              <View>
                <Text style={styles.insightTitle}>دوره برتر</Text>
                <Text style={styles.insightText}>
                  دوره ادبیات فارسی بالاترین نرخ رضایت (۴.۹) را دارد.
                </Text>
              </View>
            </View>

            <View style={styles.insightItem}>
              <Ionicons name="alert-circle" size={20} color={Colors.danger} />
              <View>
                <Text style={styles.insightTitle}>نیاز به توجه</Text>
                <Text style={styles.insightText}>
                  ۱۲ دانش‌آموز در ریاضی هفتم نیاز به حمایت بیشتر دارند.
                </Text>
              </View>
            </View>

            <View style={styles.insightItem}>
              <Ionicons name="calendar" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.insightTitle}>فصل‌های پربازده</Text>
                <Text style={styles.insightText}>
                  بیشترین پیشرفت در ماه‌های بهمن و اسفند مشاهده شده است.
                </Text>
              </View>
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
  },
  timeRangeContainer: {
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeRangeText: {
    fontSize: 14,
    color: Colors.text,
  },
  timeRangeTextActive: {
    color: '#fff',
  },
  overviewContainer: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  overviewStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewStat: {
    width: '48%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
    gap: 2,
  },
  growthText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: '500',
  },
  chartsContainer: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 20,
  },
  chartWrapper: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 16,
    paddingRight: 0,
  },
  reportsContainer: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  reportsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reportCard: {
    width: '48%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reportCardSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: Colors.primary,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  reportTitleSelected: {
    color: Colors.primary,
  },
  reportDescription: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  courseReportsContainer: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  courseReportsList: {
    gap: 16,
  },
  courseReportCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courseReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  courseReportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  courseReportStats: {
    flexDirection: 'row',
    gap: 12,
  },
  courseStat: {
    alignItems: 'center',
  },
  courseStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 2,
  },
  courseStatLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  courseReportProgress: {
    gap: 12,
    marginBottom: 16,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    width: 80,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
    width: 50,
    textAlign: 'left',
  },
  generateReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  generateReportText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  exportOptionsContainer: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  exportOptionsTitle: {
    fontSize: 18,
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
    width: '31%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  exportOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  exportOptionDescription: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  insightsContainer: {
    padding: 20,
    backgroundColor: Colors.card,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  insightsList: {
    gap: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  insightText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});