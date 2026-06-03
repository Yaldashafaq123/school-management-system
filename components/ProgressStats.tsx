// components/ProgressStats.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressAnalytics } from '../types';
import { Colors } from '../constants/Colors';

interface ProgressStatsProps {
  analytics: ProgressAnalytics;
  onViewDetails?: () => void;
}

export const ProgressStats: React.FC<ProgressStatsProps> = ({
  analytics,
  onViewDetails,
}) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} ساعت ${mins} دقیقه`;
    }
    return `${mins} دقیقه`;
  };

  const getStreakEmoji = (days: number) => {
    if (days >= 30) return '🔥';
    if (days >= 14) return '⭐';
    if (days >= 7) return '👍';
    return '💪';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.courseTitle}>{analytics.course_title}</Text>
        {onViewDetails && (
          <TouchableOpacity onPress={onViewDetails}>
            <Text style={styles.viewDetails}>جزئیات بیشتر</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Progress */}
      <View style={styles.mainProgress}>
        <View style={styles.progressCircle}>
          <Text style={styles.progressPercentage}>
            {analytics.completion_percentage}%
          </Text>
          <Text style={styles.progressLabel}>تکمیل شده</Text>
        </View>
        
        <View style={styles.progressInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="book" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              {analytics.completed_lessons} از {analytics.total_lessons} درس
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              {formatTime(analytics.time_spent)} از {formatTime(analytics.total_hours)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="trophy" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              میانگین نمره: {analytics.average_score.toFixed(1)}/۱۰
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Ionicons name="flame" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.statValue}>{analytics.streak_days}</Text>
          <Text style={styles.statLabel}>روز متوالی {getStreakEmoji(analytics.streak_days)}</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <Ionicons name="document-text" size={20} color={Colors.success} />
          </View>
          <Text style={styles.statValue}>
            {analytics.assignments_completed}/{analytics.assignments_total}
          </Text>
          <Text style={styles.statLabel}>تکالیف</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <Ionicons name="clipboard" size={20} color={Colors.warning} />
          </View>
          <Text style={styles.statValue}>
            {analytics.exams_completed}/{analytics.exams_total}
          </Text>
          <Text style={styles.statLabel}>آزمون‌ها</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
            <Ionicons name="calendar" size={20} color={Colors.secondary} />
          </View>
          <Text style={styles.statValue}>
            {new Date(analytics.last_accessed).toLocaleDateString('fa-IR')}
          </Text>
          <Text style={styles.statLabel}>آخرین فعالیت</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },
  viewDetails: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  mainProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 24,
  },
  progressCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 4,
    borderColor: Colors.primary,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  progressInfo: {
    flex: 1,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});