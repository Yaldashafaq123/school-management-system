import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '../constants/Colors';
import { DashboardStats } from '../types';
import { CourseCard } from './CourseCard';
import { Header } from './Header';
import { ProgressCard } from './ProgressCard';

interface StudentDashboardProps {
  stats: DashboardStats;
  recentCourses: any[];
  progressItems: any[];
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  stats,
  recentCourses,
  progressItems,
}) => {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      {/* Header with Notification */}
      <Header
        title="داشبورد دانش‌آموز"
        rightComponent={
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={Colors.text}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.welcomeCard}
        >
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>سلام دانش‌آموز 👋</Text>
            <Text style={styles.welcomeText}>
              امروز {stats.enrolled_courses} دوره فعال داری. بیا یادگیری رو ادامه بدهیم!
            </Text>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
              <Ionicons name="book" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.statValue}>{stats.enrolled_courses}</Text>
              <Text style={styles.statLabel}>دوره فعال</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
              <Ionicons name="time" size={20} color={Colors.success} />
            </View>
            <View>
              <Text style={styles.statValue}>{stats.total_hours}h</Text>
              <Text style={styles.statLabel}>ساعت مطالعه</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
              <Ionicons name="trophy" size={20} color={Colors.warning} />
            </View>
            <View>
              <Text style={styles.statValue}>{stats.certificates}</Text>
              <Text style={styles.statLabel}>گواهینامه</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
              <Ionicons name="document-text" size={20} color={Colors.danger} />
            </View>
            <View>
              <Text style={styles.statValue}>{stats.assignments_pending}</Text>
              <Text style={styles.statLabel}>کارخانگی</Text>
            </View>
          </View>
        </View>

        {/* Continue Learning */}
        {progressItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ادامه یادگیری</Text>
            {progressItems.map((item, index) => (
              <ProgressCard key={index} progress={item} />
            ))}
          </View>
        )}

        {/* Recent Courses */}
        {recentCourses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>دوره‌های اخیر</Text>
            {recentCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                showProgress
              />
            ))}
          </View>
        )}

        {/* Upcoming Exams */}
        {stats.exams_upcoming > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>آزمون‌های پیش رو</Text>

            <TouchableOpacity style={styles.examCard}>
              <View style={styles.examHeader}>
                <View style={styles.examIcon}>
                  <Ionicons name="clipboard" size={20} color={Colors.primary} />
                </View>
                <View style={styles.examInfo}>
                  <Text style={styles.examTitle}>آزمون ریاضی صنف هفتم</Text>
                  <Text style={styles.examDate}>۱۴۰۳/۱۰/۲۰ - ساعت ۱۰:۰۰</Text>
                </View>
              </View>

              <View style={styles.examBadge}>
                <Text style={styles.examBadgeText}>فردا</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  statItem: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
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
  examCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  examHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  examIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59,130,246,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  examInfo: {
    gap: 4,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  examDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  examBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  examBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
});
