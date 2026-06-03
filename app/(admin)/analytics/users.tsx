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
import { ProgressChart } from '../../../components/ProgressChart';

interface UserAnalytics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  growthRate: number;
  retentionRate: number;
  avgSessionTime: number;
  userDistribution: {
    students: number;
    teachers: number;
    admins: number;
  };
  deviceDistribution: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  countryDistribution: {
    country: string;
    users: number;
    percentage: number;
  }[];
  monthlyGrowth: {
    month: string;
    newUsers: number;
    activeUsers: number;
  }[];
}

export default function UserAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockAnalytics: UserAnalytics = {
        totalUsers: 1245,
        newUsers: 142,
        activeUsers: 856,
        growthRate: 12.5,
        retentionRate: 78.3,
        avgSessionTime: 24.6,
        userDistribution: {
          students: 1120,
          teachers: 95,
          admins: 30,
        },
        deviceDistribution: {
          mobile: 68,
          desktop: 25,
          tablet: 7,
        },
        countryDistribution: [
          { country: 'ایران', users: 945, percentage: 76 },
          { country: 'آمریکا', users: 85, percentage: 6.8 },
          { country: 'کانادا', users: 45, percentage: 3.6 },
          { country: 'انگلیس', users: 32, percentage: 2.6 },
          { country: 'سایر', users: 138, percentage: 11 },
        ],
        monthlyGrowth: [
          { month: 'فروردین', newUsers: 120, activeUsers: 850 },
          { month: 'اردیبهشت', newUsers: 135, activeUsers: 890 },
          { month: 'خرداد', newUsers: 142, activeUsers: 920 },
          { month: 'تیر', newUsers: 128, activeUsers: 910 },
          { month: 'مرداد', newUsers: 155, activeUsers: 950 },
          { month: 'شهریور', newUsers: 162, activeUsers: 980 },
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
        <Header title="تحلیل کاربران" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="تحلیل کاربران"
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
            <Text style={styles.metricValue}>{analytics.totalUsers.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>کاربر کل</Text>
            <View style={styles.metricTrend}>
              <Ionicons name="trending-up" size={16} color={Colors.success} />
              <Text style={[styles.trendText, { color: Colors.success }]}>
                {analytics.growthRate}%
              </Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analytics.newUsers}</Text>
            <Text style={styles.metricLabel}>کاربر جدید</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analytics.activeUsers.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>کاربر فعال</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{analytics.retentionRate}%</Text>
            <Text style={styles.metricLabel}>نگهداشت</Text>
          </View>
        </View>

        {/* User Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>توزیع کاربران</Text>
          <View style={styles.distributionCard}>
            <View style={styles.distributionItem}>
              <View style={[styles.distributionIcon, { backgroundColor: `${Colors.primary}20` }]}>
                <Ionicons name="school" size={24} color={Colors.primary} />
              </View>
              <View style={styles.distributionInfo}>
                <Text style={styles.distributionValue}>{analytics.userDistribution.students}</Text>
                <Text style={styles.distributionLabel}>دانش‌آموز</Text>
              </View>
              <Text style={styles.distributionPercentage}>
                {Math.round((analytics.userDistribution.students / analytics.totalUsers) * 100)}%
              </Text>
            </View>

            <View style={styles.distributionItem}>
              <View style={[styles.distributionIcon, { backgroundColor: `${Colors.warning}20` }]}>
                <Ionicons name="person" size={24} color={Colors.warning} />
              </View>
              <View style={styles.distributionInfo}>
                <Text style={styles.distributionValue}>{analytics.userDistribution.teachers}</Text>
                <Text style={styles.distributionLabel}>مدرس</Text>
              </View>
              <Text style={styles.distributionPercentage}>
                {Math.round((analytics.userDistribution.teachers / analytics.totalUsers) * 100)}%
              </Text>
            </View>

            <View style={styles.distributionItem}>
              <View style={[styles.distributionIcon, { backgroundColor: `${Colors.danger}20` }]}>
                <Ionicons name="shield" size={24} color={Colors.danger} />
              </View>
              <View style={styles.distributionInfo}>
                <Text style={styles.distributionValue}>{analytics.userDistribution.admins}</Text>
                <Text style={styles.distributionLabel}>مدیر</Text>
              </View>
              <Text style={styles.distributionPercentage}>
                {Math.round((analytics.userDistribution.admins / analytics.totalUsers) * 100)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Growth Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>رشد کاربران</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>کاربران جدید در ماه‌های اخیر</Text>
              <TouchableOpacity>
                <Text style={styles.chartAction}>مشاهده جزئیات</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chartPlaceholder}>
              {/* TODO: Add chart component */}
              {/* <ProgressChart 
                // data={{
                //   labels: analytics.monthlyGrowth.map(m => m.month),
                //   datasets: [
                //     {
                //       data: analytics.monthlyGrowth.map(m => m.newUsers),
                //       color: () => Colors.primary,
                //     },
                //   ],
                // }}
                // height={200}
              /> */}
            </View>
          </View>
        </View>

        {/* Device Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>توزیع دستگاه‌ها</Text>
          <View style={styles.deviceGrid}>
            <View style={styles.deviceCard}>
              <View style={[styles.deviceIcon, { backgroundColor: `${Colors.primary}20` }]}>
                <Ionicons name="phone-portrait" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.deviceValue}>{analytics.deviceDistribution.mobile}%</Text>
              <Text style={styles.deviceLabel}>موبایل</Text>
            </View>

            <View style={styles.deviceCard}>
              <View style={[styles.deviceIcon, { backgroundColor: `${Colors.success}20` }]}>
                <Ionicons name="desktop" size={32} color={Colors.success} />
              </View>
              <Text style={styles.deviceValue}>{analytics.deviceDistribution.desktop}%</Text>
              <Text style={styles.deviceLabel}>دسکتاپ</Text>
            </View>

            <View style={styles.deviceCard}>
              <View style={[styles.deviceIcon, { backgroundColor: `${Colors.warning}20` }]}>
                <Ionicons name="tablet-portrait" size={32} color={Colors.warning} />
              </View>
              <Text style={styles.deviceValue}>{analytics.deviceDistribution.tablet}%</Text>
              <Text style={styles.deviceLabel}>تبلت</Text>
            </View>
          </View>
        </View>

        {/* Country Distribution */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>توزیع جغرافیایی</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>مشاهده همه</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.countryCard}>
            {analytics.countryDistribution.map((country, index) => (
              <View key={index} style={styles.countryItem}>
                <View style={styles.countryInfo}>
                  <View style={styles.countryFlag}>
                    <Text style={styles.countryFlagText}>{country.country.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.countryName}>{country.country}</Text>
                    <Text style={styles.countryUsers}>{country.users.toLocaleString()} کاربر</Text>
                  </View>
                </View>
                <View style={styles.countryStats}>
                  <View style={styles.countryBar}>
                    <View
                      style={[
                        styles.countryBarFill,
                        { width: `${country.percentage}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.countryPercentage}>{country.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Active Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ساعات فعال</Text>
          <View style={styles.hoursCard}>
            <View style={styles.hourItem}>
              <Text style={styles.hourLabel}>صبح (۶-۱۲)</Text>
              <Text style={styles.hourValue}>۳۴٪</Text>
            </View>
            <View style={styles.hourItem}>
              <Text style={styles.hourLabel}>ظهر (۱۲-۱۸)</Text>
              <Text style={styles.hourValue}>۴۲٪</Text>
            </View>
            <View style={styles.hourItem}>
              <Text style={styles.hourLabel}>عصر (۱۸-۲۴)</Text>
              <Text style={styles.hourValue}>۵۸٪</Text>
            </View>
            <View style={styles.hourItem}>
              <Text style={styles.hourLabel}>شب (۲۴-۶)</Text>
              <Text style={styles.hourValue}>۱۸٪</Text>
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
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  distributionCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  distributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  distributionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  distributionInfo: {
    flex: 1,
  },
  distributionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  distributionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  distributionPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  chartAction: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  deviceCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deviceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  deviceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  countryCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  countryItem: {
    marginBottom: 16,
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  countryFlag: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryFlagText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  countryName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  countryUsers: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  countryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countryBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  countryBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  countryPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    minWidth: 40,
  },
  hoursCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  hourItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hourLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  hourValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});