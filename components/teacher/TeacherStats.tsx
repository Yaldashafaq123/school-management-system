// components/teacher/TeacherStats.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { TeacherStats as TeacherStatsType } from '../../types';

interface TeacherStatsProps {
  stats: TeacherStatsType;
  onRefresh?: () => void;
}

export const TeacherStats: React.FC<TeacherStatsProps> = ({
  stats,
  onRefresh,
}) => {
  const statCards = [
    {
      title: 'دانش‌آموزان',
      value: stats.totalStudents,
      subtitle: `${stats.activeStudents} فعال`,
      icon: 'people',
      color: Colors.primary,
      gradient: [Colors.primary, Colors.primary] as [string, string], // Fixed: added type assertion
    },
    {
      title: 'دوره‌ها',
      value: stats.totalCourses,
      subtitle: 'در حال تدریس',
      icon: 'book',
      color: Colors.secondary,
      gradient: [Colors.secondary, Colors.primary] as [string, string], // Fixed: added type assertion
    },
    {
      title: 'درآمد',
      value: `${(stats.totalRevenue / 1000000).toFixed(1)}M`,
      subtitle: 'تومان',
      icon: 'cash',
      color: Colors.success,
      gradient: [Colors.success, Colors.info] as [string, string], // Fixed: added type assertion
    },
    {
      title: 'میانگین امتیاز',
      value: stats.avgRating.toFixed(1),
      subtitle: 'از ۵',
      icon: 'star',
      color: Colors.warning,
      gradient: [Colors.warning, Colors.danger] as [string, string], // Fixed: added type assertion
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>آمار تدریس</Text>
        {onRefresh && (
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <LinearGradient
            key={index}
            colors={stat.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <View style={styles.statHeader}>
              <View style={[styles.statIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name={stat.icon as any} size={20} color="#fff" />
              </View>
              
              {stats.pendingGrading > 0 && index === 0 && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>{stats.pendingGrading}</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
            <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
          </LinearGradient>
        ))}
      </View>

      {stats.pendingGrading > 0 && (
        <TouchableOpacity style={styles.gradingAlert}>
          <View style={styles.alertIcon}>
            <Ionicons name="document-text" size={20} color={Colors.warning} />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>
              {stats.pendingGrading} تکلیف در انتظار تصحیح
            </Text>
            <Text style={styles.alertSubtitle}>
              برای مشاهده و تصحیح کلیک کنید
            </Text>
          </View>
          <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} /> {/* Fixed: changed chevron-left to chevron-back */}
        </TouchableOpacity>
      )}
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
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingBadge: {
    backgroundColor: Colors.danger,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  gradingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    gap: 12,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});