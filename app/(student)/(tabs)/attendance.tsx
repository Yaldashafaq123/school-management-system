import { Header } from '@/components/Header';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type AttendanceDay = {
  date: string;
  dayOfWeek: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  subjects: {
    name: string;
    status: 'present' | 'absent' | 'late' | 'excused'; // Updated to include all statuses
    time: string;
  }[];
};

type MonthlySummary = {
  month: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
};

export default function AttendanceScreen() {
  const [selectedMonth, setSelectedMonth] = useState<string>('دی ۱۴۰۳');
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewType, setViewType] = useState<'daily' | 'monthly' | 'analytics'>('daily');

  // Mock data
  const months: MonthlySummary[] = [
    {
      month: 'دی ۱۴۰۳',
      totalDays: 20,
      presentDays: 18,
      absentDays: 1,
      lateDays: 1,
      excusedDays: 0,
      attendanceRate: 90,
    },
    {
      month: 'آذر ۱۴۰۳',
      totalDays: 22,
      presentDays: 20,
      absentDays: 1,
      lateDays: 0,
      excusedDays: 1,
      attendanceRate: 90.9,
    },
    {
      month: 'آبان ۱۴۰۳',
      totalDays: 21,
      presentDays: 19,
      absentDays: 2,
      lateDays: 0,
      excusedDays: 0,
      attendanceRate: 90.5,
    },
  ];

  const dailyAttendance: AttendanceDay[] = [
    {
      date: '۱۴۰۳/۱۰/۰۱',
      dayOfWeek: 'شنبه',
      status: 'present',
      subjects: [
        { name: 'ریاضی', status: 'present', time: '۸:۰۰' },
        { name: 'علوم', status: 'present', time: '۹:۰۰' },
        { name: 'ادبیات', status: 'present', time: '۱۰:۰۰' },
      ],
    },
    {
      date: '۱۴۰۳/۱۰/۰۲',
      dayOfWeek: 'یکشنبه',
      status: 'late',
      subjects: [
        { name: 'ریاضی', status: 'present', time: '۸:۰۰' },
        { name: 'علوم', status: 'absent', time: '۹:۰۰' },
        { name: 'ادبیات', status: 'present', time: '۱۰:۰۰' },
      ],
    },
    {
      date: '۱۴۰۳/۱۰/۰۳',
      dayOfWeek: 'دوشنبه',
      status: 'absent',
      subjects: [
        { name: 'ریاضی', status: 'absent', time: '۸:۰۰' },
        { name: 'علوم', status: 'absent', time: '۹:۰۰' },
        { name: 'ادبیات', status: 'absent', time: '۱۰:۰۰' },
      ],
    },
    {
      date: '۱۴۰۳/۱۰/۰۴',
      dayOfWeek: 'سه‌شنبه',
      status: 'present',
      subjects: [
        { name: 'ریاضی', status: 'present', time: '۸:۰۰' },
        { name: 'علوم', status: 'present', time: '۹:۰۰' },
        { name: 'ادبیات', status: 'present', time: '۱۰:۰۰' },
      ],
    },
    {
      date: '۱۴۰۳/۱۰/۰۵',
      dayOfWeek: 'چهارشنبه',
      status: 'excused',
      subjects: [
        { name: 'ریاضی', status: 'excused', time: '۸:۰۰' },
        { name: 'علوم', status: 'excused', time: '۹:۰۰' },
        { name: 'ادبیات', status: 'excused', time: '۱۰:۰۰' },
      ],
    },
  ];

  const currentMonth = months.find(m => m.month === selectedMonth) || months[0];

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: AttendanceDay['status'] | 'present' | 'absent' | 'late' | 'excused') => {
    switch (status) {
      case 'present': return Colors.success;
      case 'absent': return Colors.danger;
      case 'late': return Colors.warning;
      case 'excused': return Colors.info;
      default: return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status: AttendanceDay['status'] | 'present' | 'absent' | 'late' | 'excused') => {
    switch (status) {
      case 'present': return 'checkmark-circle';
      case 'absent': return 'close-circle';
      case 'late': return 'time';
      case 'excused': return 'medical';
      default: return 'help-circle';
    }
  };

  const getStatusText = (status: AttendanceDay['status'] | 'present' | 'absent' | 'late' | 'excused') => {
    switch (status) {
      case 'present': return 'حاضر';
      case 'absent': return 'غایب';
      case 'late': return 'تأخیر';
      case 'excused': return 'موجه';
      default: return '-';
    }
  };

  const pieData = [
    {
      name: 'حاضر',
      population: currentMonth.presentDays,
      color: Colors.success,
      legendFontColor: Colors.text,
      legendFontSize: 12,
    },
    {
      name: 'غایب',
      population: currentMonth.absentDays,
      color: Colors.danger,
      legendFontColor: Colors.text,
      legendFontSize: 12,
    },
    {
      name: 'تأخیر',
      population: currentMonth.lateDays,
      color: Colors.warning,
      legendFontColor: Colors.text,
      legendFontSize: 12,
    },
    {
      name: 'موجه',
      population: currentMonth.excusedDays,
      color: Colors.info,
      legendFontColor: Colors.text,
      legendFontSize: 12,
    },
  ];

  const chartData = {
    labels: months.map(m => m.month.slice(0, 3)),
    datasets: [
      {
        data: months.map(m => m.attendanceRate),
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: Colors.card,
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: Colors.primary,
    },
  };

  const renderDailyView = () => (
    <View style={styles.dailyContainer}>
      <Text style={styles.sectionTitle}>حضور و غیاب روزانه</Text>
      
      {dailyAttendance.map((day, index) => (
        <View key={index} style={styles.dayCard}>
          <TouchableOpacity
            style={styles.dayHeader}
            onPress={() => setShowDetails(showDetails === index ? null : index)}
          >
            <View style={styles.dateContainer}>
              <Text style={styles.dayOfWeek}>{day.dayOfWeek}</Text>
              <Text style={styles.dateText}>{day.date}</Text>
            </View>
            
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: `${getStatusColor(day.status)}20` }
              ]}>
                <Ionicons
                  name={getStatusIcon(day.status) as any}
                  size={16}
                  color={getStatusColor(day.status)}
                />
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(day.status) }
                ]}>
                  {getStatusText(day.status)}
                </Text>
              </View>
              
              <Ionicons
                name={showDetails === index ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={Colors.textSecondary}
              />
            </View>
          </TouchableOpacity>

          {showDetails === index && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>جزییات کلاس‌ها:</Text>
              {day.subjects.map((subject, subIndex) => (
                <View key={subIndex} style={styles.subjectRow}>
                  <View style={styles.subjectInfo}>
                    <Text style={styles.subjectName}>{subject.name}</Text>
                    <Text style={styles.subjectTime}>{subject.time}</Text>
                  </View>
                  <View style={[
                    styles.subjectStatus,
                    subject.status === 'present' && styles.presentStatus,
                    subject.status === 'absent' && styles.absentStatus,
                    subject.status === 'late' && styles.lateStatus,
                    subject.status === 'excused' && styles.excusedStatus,
                  ]}>
                    <Text style={styles.subjectStatusText}>
                      {subject.status === 'present' ? 'حاضر' :
                       subject.status === 'absent' ? 'غایب' :
                       subject.status === 'late' ? 'تأخیر' : 'موجه'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderMonthlyView = () => (
    <View style={styles.monthlyContainer}>
      <Text style={styles.sectionTitle}>خلاصه ماهانه</Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.monthsSelector}
        contentContainerStyle={styles.monthsSelectorContent}
      >
        {months.map((month) => (
          <TouchableOpacity
            key={month.month}
            style={[
              styles.monthChip,
              selectedMonth === month.month && styles.monthChipActive,
            ]}
            onPress={() => setSelectedMonth(month.month)}
          >
            <Text style={[
              styles.monthChipText,
              selectedMonth === month.month && styles.monthChipTextActive,
            ]}>
              {month.month}
            </Text>
            <Text style={styles.monthRate}>{month.attendanceRate}%</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.monthStats}>
        <View style={styles.monthStatCard}>
          <Text style={styles.statValue}>{currentMonth.totalDays}</Text>
          <Text style={styles.statLabel}>روز کاری</Text>
        </View>
        <View style={styles.monthStatCard}>
          <Text style={[styles.statValue, { color: Colors.success }]}>
            {currentMonth.presentDays}
          </Text>
          <Text style={styles.statLabel}>حاضر</Text>
        </View>
        <View style={styles.monthStatCard}>
          <Text style={[styles.statValue, { color: Colors.danger }]}>
            {currentMonth.absentDays}
          </Text>
          <Text style={styles.statLabel}>غایب</Text>
        </View>
        <View style={styles.monthStatCard}>
          <Text style={[styles.statValue, { color: Colors.warning }]}>
            {currentMonth.lateDays}
          </Text>
          <Text style={styles.statLabel}>تأخیر</Text>
        </View>
      </View>

      <View style={styles.attendanceRateCard}>
        <Text style={styles.rateTitle}>نرخ حضور</Text>
        <Text style={styles.rateValue}>{currentMonth.attendanceRate}%</Text>
        <View style={styles.rateBar}>
          <View
            style={[
              styles.rateFill,
              { width: `${currentMonth.attendanceRate}%` }
            ]}
          />
        </View>
        <Text style={styles.rateSubtitle}>
          {currentMonth.presentDays} از {currentMonth.totalDays} روز
        </Text>
      </View>

      <View style={styles.pieChartContainer}>
        <Text style={styles.chartTitle}>توزیع حضور و غیاب</Text>
        <PieChart
          data={pieData}
          width={SCREEN_WIDTH - 32}
          height={200}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      </View>
    </View>
  );

  const renderAnalyticsView = () => (
    <View style={styles.analyticsContainer}>
      <Text style={styles.sectionTitle}>تحلیل آماری</Text>
      
      <View style={styles.trendCard}>
        <Text style={styles.trendTitle}>روند حضور در ۳ ماه اخیر</Text>
        <LineChart
          data={chartData}
          width={SCREEN_WIDTH - 32}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.comparisonCard}>
        <Text style={styles.comparisonTitle}>مقایسه با کلاس</Text>
        <View style={styles.comparisonRow}>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>میانگین شما</Text>
            <Text style={styles.comparisonValue}>
              {months.reduce((sum, m) => sum + m.attendanceRate, 0) / months.length}%
            </Text>
          </View>
          <View style={styles.comparisonItem}>
            <Text style={styles.comparisonLabel}>میانگین کلاس</Text>
            <Text style={styles.comparisonValue}>92.5%</Text>
          </View>
        </View>
      </View>

      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>نکات کلیدی</Text>
        <View style={styles.insightItem}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          <Text style={styles.insightText}>
            حضور شما از میانگین کلاس بالاتر است
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Ionicons name="trending-up" size={20} color={Colors.primary} />
          <Text style={styles.insightText}>
            روند حضور شما در ماه‌های اخیر صعودی بوده است
          </Text>
        </View>
        <View style={styles.insightItem}>
          <Ionicons name="calendar" size={20} color={Colors.warning} />
          <Text style={styles.insightText}>
            بیشترین غیبت در درس علوم بوده است
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="حضور و غیاب"
        rightComponent={
          <TouchableOpacity>
            <Ionicons name="download-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
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
        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Ionicons name="calendar" size={24} color={Colors.primary} />
            <View style={styles.quickStatInfo}>
              <Text style={styles.quickStatValue}>
                {months.reduce((sum, m) => sum + m.totalDays, 0)}
              </Text>
              <Text style={styles.quickStatLabel}>روز کاری</Text>
            </View>
          </View>
          <View style={styles.quickStat}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <View style={styles.quickStatInfo}>
              <Text style={styles.quickStatValue}>
                {months.reduce((sum, m) => sum + m.presentDays, 0)}
              </Text>
              <Text style={styles.quickStatLabel}>روز حاضر</Text>
            </View>
          </View>
          <View style={styles.quickStat}>
            <Ionicons name="trending-up" size={24} color={Colors.warning} />
            <View style={styles.quickStatInfo}>
              <Text style={styles.quickStatValue}>
                {(months.reduce((sum, m) => sum + m.attendanceRate, 0) / months.length).toFixed(1)}%
              </Text>
              <Text style={styles.quickStatLabel}>میانگین حضور</Text>
            </View>
          </View>
        </View>

        {/* View Toggle */}
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewType === 'daily' && styles.viewToggleActive,
            ]}
            onPress={() => setViewType('daily')}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={viewType === 'daily' ? '#fff' : Colors.text}
            />
            <Text style={[
              styles.viewToggleText,
              viewType === 'daily' && styles.viewToggleTextActive,
            ]}>
              روزانه
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewType === 'monthly' && styles.viewToggleActive,
            ]}
            onPress={() => setViewType('monthly')}
          >
            <Ionicons
              name="stats-chart-outline"
              size={20}
              color={viewType === 'monthly' ? '#fff' : Colors.text}
            />
            <Text style={[
              styles.viewToggleText,
              viewType === 'monthly' && styles.viewToggleTextActive,
            ]}>
              ماهانه
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewType === 'analytics' && styles.viewToggleActive,
            ]}
            onPress={() => setViewType('analytics')}
          >
            <Ionicons
              name="analytics-outline"
              size={20}
              color={viewType === 'analytics' ? '#fff' : Colors.text}
            />
            <Text style={[
              styles.viewToggleText,
              viewType === 'analytics' && styles.viewToggleTextActive,
            ]}>
              تحلیل
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        {viewType === 'daily' && renderDailyView()}
        {viewType === 'monthly' && renderMonthlyView()}
        {viewType === 'analytics' && renderAnalyticsView()}

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>راهنمای رنگ‌ها:</Text>
          <View style={styles.legendGrid}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.legendText}>حاضر</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
              <Text style={styles.legendText}>غایب</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
              <Text style={styles.legendText}>تأخیر</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.info }]} />
              <Text style={styles.legendText}>موجه</Text>
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
  quickStats: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  quickStatInfo: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  quickStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  viewToggleActive: {
    backgroundColor: Colors.primary,
  },
  viewToggleText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  viewToggleTextActive: {
    color: '#fff',
  },
  dailyContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  dayCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  dateContainer: {},
  dayOfWeek: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  subjectInfo: {},
  subjectName: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  subjectTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  subjectStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  presentStatus: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  absentStatus: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  lateStatus: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  excusedStatus: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  subjectStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  monthlyContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  monthsSelector: {
    marginBottom: 20,
  },
  monthsSelectorContent: {
    gap: 8,
  },
  monthChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  monthChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  monthChipText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  monthChipTextActive: {
    color: '#fff',
  },
  monthRate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  monthStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  monthStatCard: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 80,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  attendanceRateCard: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  rateValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  rateBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  rateFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  rateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pieChartContainer: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  analyticsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  trendCard: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  comparisonCard: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  comparisonItem: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  insightsContainer: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  legendContainer: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
});