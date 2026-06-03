// components/AdminDashboard.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

interface AdminDashboardProps {
  stats: {
    total_users: number;
    active_users: number;
    total_courses: number;
    total_revenue: number;
  };
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats }) => {
  return (
    <ScrollView style={styles.container}>
      {/* Welcome Card */}
      <LinearGradient
        colors={[Colors.danger, Colors.warning]}
        style={styles.welcomeCard}
      >
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeTitle}>سلام مدیر سیستم 👑</Text>
          <Text style={styles.welcomeText}>
            پنل مدیریت سیستم آموزش فارسی
          </Text>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Ionicons name="people" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>{stats.total_users}</Text>
          <Text style={styles.statLabel}>کاربر کل</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <Ionicons name="person-circle" size={20} color={Colors.success} />
          </View>
          <Text style={styles.statValue}>{stats.active_users}</Text>
          <Text style={styles.statLabel}>کاربر فعال</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
            <Ionicons name="book" size={20} color={Colors.secondary} />
          </View>
          <Text style={styles.statValue}>{stats.total_courses}</Text>
          <Text style={styles.statLabel}>دوره</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <Ionicons name="cash" size={20} color={Colors.warning} />
          </View>
          <Text style={styles.statValue}>{stats.total_revenue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>درآمد (تومان)</Text>
        </View>
      </View>

      {/* Admin Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>مدیریت سیستم</Text>
        <View style={styles.adminGrid}>
          <TouchableOpacity style={styles.adminCard}>
            <View style={[styles.adminIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="person-add" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.adminText}>مدیریت کاربران</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.adminCard}>
            <View style={[styles.adminIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="school" size={24} color={Colors.success} />
            </View>
            <Text style={styles.adminText}>مدیریت دوره‌ها</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.adminCard}>
            <View style={[styles.adminIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <Ionicons name="stats-chart" size={24} color={Colors.secondary} />
            </View>
            <Text style={styles.adminText}>گزارشات و آمار</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.adminCard}>
            <View style={[styles.adminIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Ionicons name="settings" size={24} color={Colors.warning} />
            </View>
            <Text style={styles.adminText}>تنظیمات سیستم</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.adminCard}>
            <View style={[styles.adminIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Ionicons name="document-text" size={24} color={Colors.danger} />
            </View>
            <Text style={styles.adminText}>لاگ‌های سیستم</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.adminCard}>
            <View style={[styles.adminIcon, { backgroundColor: 'rgba(6, 182, 212, 0.1)' }]}>
              <Ionicons name="notifications" size={24} color={Colors.info} />
            </View>
            <Text style={styles.adminText}>اعلانات</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* System Health */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>وضعیت سیستم</Text>
        <View style={styles.healthCard}>
          <View style={styles.healthItem}>
            <View style={styles.healthIndicator}>
              <View style={[styles.healthDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.healthText}>سرور</Text>
            </View>
            <Text style={styles.healthStatus}>آنلاین</Text>
          </View>

          <View style={styles.healthItem}>
            <View style={styles.healthIndicator}>
              <View style={[styles.healthDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.healthText}>دیتابیس</Text>
            </View>
            <Text style={styles.healthStatus}>آنلاین</Text>
          </View>

          <View style={styles.healthItem}>
            <View style={styles.healthIndicator}>
              <View style={[styles.healthDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.healthText}>API</Text>
            </View>
            <Text style={styles.healthStatus}>آنلاین</Text>
          </View>

          <View style={styles.healthItem}>
            <View style={styles.healthIndicator}>
              <View style={[styles.healthDot, { backgroundColor: Colors.warning }]} />
              <Text style={styles.healthText}>فضای ذخیره‌سازی</Text>
            </View>
            <Text style={styles.healthStatus}>۷۵٪</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  welcomeContent: {
    gap: 8,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
    textAlign: 'center',
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
  adminGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  adminCard: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  adminIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  adminText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  healthCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  healthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  healthItemLast: {
    borderBottomWidth: 0,
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  healthText: {
    fontSize: 14,
    color: Colors.text,
  },
  healthStatus: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});