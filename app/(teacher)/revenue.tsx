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
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/Colors';
import { Header } from '../../components/Header';

const screenWidth = Dimensions.get('window').width;

const mockRevenueData = {
  total_revenue: 12500000,
  monthly_revenue: 4500000,
  daily_revenue: 150000,
  pending_payments: 800000,
  growth_rate: 15,
};

const mockTransactions = [
  {
    id: 1,
    student: 'علی رضایی',
    course: 'ریاضی هفتم',
    amount: 450000,
    type: 'course_purchase',
    status: 'completed',
    date: '۱۴۰۲/۱۱/۱۵',
  },
  {
    id: 2,
    student: 'سارا محمدی',
    course: 'علوم تجربی',
    amount: 380000,
    type: 'course_purchase',
    status: 'completed',
    date: '۱۴۰۲/۱۱/۱۴',
  },
  {
    id: 3,
    student: 'محمد حسینی',
    course: 'ریاضی هفتم',
    amount: 450000,
    type: 'course_purchase',
    status: 'pending',
    date: '۱۴۰۲/۱۱/۱۳',
  },
  {
    id: 4,
    student: 'فاطمه کریمی',
    course: 'ادبیات فارسی',
    amount: 520000,
    type: 'course_purchase',
    status: 'completed',
    date: '۱۴۰۲/۱۱/۱۲',
  },
  {
    id: 5,
    student: 'رضا احمدی',
    course: 'علوم تجربی',
    amount: 380000,
    type: 'course_purchase',
    status: 'failed',
    date: '۱۴۰۲/۱۱/۱۱',
  },
  {
    id: 6,
    student: 'نازنین رحمانی',
    course: 'ادبیات فارسی',
    amount: 520000,
    type: 'course_purchase',
    status: 'completed',
    date: '۱۴۰۲/۱۱/۱۰',
  },
];

const mockMonthlyData = [
  { month: 'مهر', revenue: 3800000 },
  { month: 'آبان', revenue: 4200000 },
  { month: 'آذر', revenue: 4500000 },
  { month: 'دی', revenue: 5000000 },
  { month: 'بهمن', revenue: 5500000 },
  { month: 'اسفند', revenue: 6000000 },
];

const mockTopCourses = [
  { id: 1, title: 'ریاضی هفتم', revenue: 4500000, students: 45, growth: 20 },
  { id: 2, title: 'علوم تجربی', revenue: 3800000, students: 38, growth: 15 },
  { id: 3, title: 'ادبیات فارسی', revenue: 5200000, students: 52, growth: 25 },
  { id: 4, title: 'ریاضی هشتم', revenue: 3000000, students: 30, growth: 10 },
];

const timeFilters = [
  { id: 'week', title: 'هفته' },
  { id: 'month', title: 'ماه' },
  { id: 'quarter', title: 'سه‌ماهه' },
  { id: 'year', title: 'سال' },
];

export default function Revenue() {
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

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR') + ' تومان';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return Colors.success;
      case 'pending': return Colors.warning;
      case 'failed': return Colors.danger;
      default: return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'موفق';
      case 'pending': return 'در انتظار';
      case 'failed': return 'ناموفق';
      default: return 'نامشخص';
    }
  };

  const chartData = {
    labels: mockMonthlyData.map(item => item.month),
    datasets: [{
      data: mockMonthlyData.map(item => item.revenue / 1000000), // Convert to million
    }],
  };

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

  const handleWithdraw = () => {
    Alert.alert(
      'برداشت وجه',
      'آیا می‌خواهید درآمد خود را برداشت کنید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'برداشت',
          onPress: () => {
            // Using a simple alert instead of prompt for compatibility
            Alert.alert(
              'برداشت وجه',
              'این قابلیت در نسخه فعلی فعال نیست. در آینده نزدیک اضافه خواهد شد.',
              [{ text: 'باشه' }]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="درآمد و مالی"
        rightComponent={
          <TouchableOpacity onPress={handleWithdraw}>
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
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="cash" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{formatPrice(mockRevenueData.total_revenue)}</Text>
              <Text style={styles.statLabel}>کل درآمد</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="calendar" size={20} color={Colors.success} />
              </View>
              <Text style={styles.statValue}>{formatPrice(mockRevenueData.monthly_revenue)}</Text>
              <Text style={styles.statLabel}>درآمد ماهانه</Text>
              <View style={styles.growthBadge}>
                <Ionicons name="trending-up" size={12} color={Colors.success} />
                <Text style={styles.growthText}>{mockRevenueData.growth_rate}%</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Ionicons name="time" size={20} color={Colors.warning} />
              </View>
              <Text style={styles.statValue}>{formatPrice(mockRevenueData.daily_revenue)}</Text>
              <Text style={styles.statLabel}>میانگین روزانه</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <Ionicons name="alert-circle" size={20} color={Colors.danger} />
              </View>
              <Text style={styles.statValue}>{formatPrice(mockRevenueData.pending_payments)}</Text>
              <Text style={styles.statLabel}>در انتظار تایید</Text>
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

        {/* Revenue Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>نمودار درآمد</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withVerticalLines={false}
            withHorizontalLines={false}
            withInnerLines={false}
            withOuterLines={false}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero={true}
            segments={5}
            formatYLabel={(value: string) => `${value}M`}
          />
        </View>

        {/* Top Courses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>دوره‌های پرفروش</Text>
          <View style={styles.coursesList}>
            {mockTopCourses.map((course) => (
              <View key={course.id} style={styles.courseCard}>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseStudents}>
                    {course.students} دانش‌آموز
                  </Text>
                </View>
                <View style={styles.courseStats}>
                  <Text style={styles.courseRevenue}>
                    {formatPrice(course.revenue)}
                  </Text>
                  <View style={styles.courseGrowth}>
                    <Ionicons name="trending-up" size={12} color={Colors.success} />
                    <Text style={styles.growthText}>{course.growth}%</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>تراکنش‌های اخیر</Text>
            <TouchableOpacity onPress={() => router.push('./(teacher)/reports')}>
              <Text style={styles.seeAllText}>مشاهده همه</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionsList}>
            {mockTransactions.map((transaction) => (
              <TouchableOpacity key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionIcon}>
                  <Ionicons
                    name={transaction.type === 'course_purchase' ? 'book' : 'cash'}
                    size={20}
                    color={Colors.primary}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>
                    {transaction.type === 'course_purchase' ? 'خرید دوره' : 'برداشت وجه'}
                  </Text>
                  <Text style={styles.transactionDescription}>
                    {transaction.student} • {transaction.course}
                  </Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={styles.amountValue}>
                    {formatPrice(transaction.amount)}
                  </Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(transaction.status)}20` }
                  ]}>
                    <Text style={[styles.statusText, { color: getStatusColor(transaction.status) }]}>
                      {getStatusText(transaction.status)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Withdrawal Summary */}
        <View style={styles.withdrawalSection}>
          <Text style={styles.withdrawalTitle}>برداشت وجه</Text>
          <Text style={styles.withdrawalDescription}>
            شما می‌توانید درآمد قابل برداشت خود را به حساب بانکی واریز کنید.
          </Text>
          
          <View style={styles.withdrawalStats}>
            <View style={styles.withdrawalStat}>
              <Text style={styles.withdrawalStatValue}>
                {formatPrice(mockRevenueData.total_revenue - mockRevenueData.pending_payments)}
              </Text>
              <Text style={styles.withdrawalStatLabel}>قابل برداشت</Text>
            </View>
            
            <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
              <Ionicons name="download" size={20} color="#fff" />
              <Text style={styles.withdrawButtonText}>برداشت وجه</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>روش‌های پرداخت</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity style={styles.paymentMethod}>
              <View style={styles.paymentIcon}>
                <Ionicons name="card" size={24} color={Colors.primary} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>حساب بانکی</Text>
                <Text style={styles.paymentDescription}>
                  حساب بانکی ثبت شده: ۶۰۳۷ **** **** ۱۲۳۴
                </Text>
              </View>
              <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.paymentMethod}>
              <View style={styles.paymentIcon}>
                <Ionicons name="wallet" size={24} color={Colors.success} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>کیف پول</Text>
                <Text style={styles.paymentDescription}>
                  موجودی کیف پول: {formatPrice(1500000)}
                </Text>
              </View>
              <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
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
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  growthText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: '500',
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
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    paddingRight: 0,
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
  coursesList: {
    gap: 12,
  },
  courseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  courseStudents: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  courseStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  courseRevenue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.success,
  },
  courseGrowth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  transactionsList: {
    gap: 12,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  withdrawalSection: {
    margin: 20,
    padding: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  withdrawalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  withdrawalDescription: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 20,
  },
  withdrawalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  withdrawalStat: {
    alignItems: 'flex-start',
  },
  withdrawalStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  withdrawalStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});