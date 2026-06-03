// components/admin/DashboardStats.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { DashboardMetrics } from '../../types';

interface DashboardStatsProps {
  metrics: DashboardMetrics;
  onRefresh?: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  metrics,
  onRefresh,
}) => {
  const statCards = [
    {
      title: 'کاربران کل',
      value: metrics.totalUsers.toLocaleString(),
      change: `+${metrics.newUsers} جدید`,
      icon: 'people',
      color: Colors.primary,
      trend: 'up' as const,
    },
    {
      title: 'کاربران فعال',
      value: metrics.activeUsers.toLocaleString(),
      change: `${((metrics.activeUsers / metrics.totalUsers) * 100).toFixed(1)}%`,
      icon: 'person-circle',
      color: Colors.success,
      trend: 'up' as const,
    },
    {
      title: 'دوره‌ها',
      value: metrics.totalCourses.toLocaleString(),
      change: `${metrics.activeCourses} فعال`,
      icon: 'book',
      color: Colors.secondary,
      trend: 'neutral' as const,
    },
    {
      title: 'ثبت‌نام‌ها',
      value: metrics.totalEnrollments.toLocaleString(),
      change: `${metrics.completionRate}% تکمیل`,
      icon: 'school',
      color: Colors.warning,
      trend: 'up' as const,
    },
    {
      title: 'درآمد کل',
      value: `${metrics.totalRevenue.toLocaleString()} تومان`,
      change: 'این ماه',
      icon: 'cash',
      color: Colors.success,
      trend: 'up' as const,
    },
    {
      title: 'میانگین زمان',
      value: `${metrics.avgSessionDuration} دقیقه`,
      change: 'در هر جلسه',
      icon: 'time',
      color: Colors.info,
      trend: 'neutral' as const,
    },
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <Ionicons name="trending-up" size={12} color={Colors.success} />;
      case 'down':
        return <Ionicons name="trending-down" size={12} color={Colors.danger} />;
      default:
        return <Ionicons name="remove" size={12} color={Colors.textSecondary} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>آمار کلی سیستم</Text>
        {onRefresh && (
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
            </View>
            
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
            
            <View style={styles.statChange}>
              {getTrendIcon(stat.trend)}
              <Text style={styles.statChangeText}>{stat.change}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  refreshButton: {
    padding: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statChangeText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
});