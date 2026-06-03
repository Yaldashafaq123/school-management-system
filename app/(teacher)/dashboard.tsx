// app/(teacher)/dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { Header } from '../../components/Header';
// Remove useAuth import for now since it doesn't exist
// import { useAuth } from '@/contexts/AuthContext';

// Mock data
const mockTeacherStats = {
  total_courses: 8,
  total_students: 245,
  pending_assignments: 12,
  pending_exams: 3,
  revenue: 12500000,
  rating: 4.8,
  total_hours: 480,
};

const recentActivities = [
  { id: 1, type: 'assignment', title: 'تکلیف جدید اضافه شد', time: '۲ ساعت پیش', course: 'ریاضی هفتم' },
  { id: 2, type: 'submission', title: '۵ تحویل جدید', time: '۵ ساعت پیش', course: 'علوم تجربی' },
  { id: 3, type: 'grade', title: 'تصحیح تکلیف', time: 'دیروز', course: 'ادبیات فارسی' },
  { id: 4, type: 'announcement', title: 'اعلان منتشر شد', time: '۲ روز پیش', course: 'ریاضی هشتم' },
];

const quickActions = [
  {
    id: 'create-course',
    title: 'ایجاد دوره',
    icon: 'book',
    color: Colors.primary,
    route: '/courses/create.tsx',
  },
  {
    id: 'create-assignment',
    title: 'تکلیف جدید',
    icon: 'document-text',
    color: Colors.success,
    route: '/assignment/create.tsx',
  },
  {
    id: 'create-exam',
    title: 'آزمون جدید',
    icon: 'clipboard',
    color: Colors.warning,
    route: '/exam/create',
  },
  {
    id: 'students',
    title: 'مدیریت دانش‌آموزان',
    icon: 'people',
    color: Colors.info,
    route: '/(teacher)/students',
  },
  {
    id: 'grading',
    title: 'تصحیح تکالیف',
    icon: 'create',
    color: Colors.danger,
    route: '/(teacher)/grading',
  },
  {
    id: 'analytics',
    title: 'تحلیل و آمار',
    icon: 'stats-chart',
    color: Colors.secondary,
    route: '/(teacher)/analytics',
  },
  {
    id: 'revenue',
    title: 'درآمد و مالی',
    icon: 'cash',
    color: '#10b981',
    route: '/(teacher)/revenue',
  },
  {
    id: 'announcement',
    title: 'اعلان جدید',
    icon: 'megaphone',
    color: Colors.warning,
    route: '/(teacher)/announcement/create',
  },
];

export default function TeacherDashboard() {
  const router = useRouter();
  // Remove useAuth for now since it doesn't exist
  // const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [recentCourses, setRecentCourses] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load teacher data
    const mockCourses = [
      { id: 1, title: 'ریاضی پایه هفتم', student_count: 45, progress: 75 },
      { id: 2, title: 'علوم تجربی هفتم', student_count: 38, progress: 60 },
      { id: 3, title: 'ادبیات فارسی', student_count: 52, progress: 90 },
    ];
    setRecentCourses(mockCourses);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR') + ' تومان';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assignment': return 'document-text';
      case 'submission': return 'arrow-up-circle';
      case 'grade': return 'star';
      case 'announcement': return 'megaphone';
      default: return 'notifications';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="داشبورد معلم"
        rightComponent={
          <TouchableOpacity onPress={() => router.push('./(teacher)/profile')}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/300' }} // Using static image for now
              style={styles.profileImage}
            />
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
        {/* Welcome Card */}
        <LinearGradient
          colors={[Colors.secondary, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeCard}
        >
          <View style={styles.welcomeContent}>
            <View>
              <Text style={styles.welcomeTitle}>سلام استاد محترم 👨‍🏫</Text>
              <Text style={styles.welcomeText}>
                امروز {mockTeacherStats.pending_assignments} تکلیف برای تصحیح دارید
              </Text>
            </View>
            <Ionicons name="school" size={40} color="#fff" />
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="book" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{mockTeacherStats.total_courses}</Text>
            <Text style={styles.statLabel}>دوره</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="people" size={20} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>{mockTeacherStats.total_students}</Text>
            <Text style={styles.statLabel}>دانش‌آموز</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Ionicons name="document-text" size={20} color={Colors.warning} />
            </View>
            <Text style={styles.statValue}>{mockTeacherStats.pending_assignments}</Text>
            <Text style={styles.statLabel}>تکلیف</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Ionicons name="cash" size={20} color={Colors.danger} />
            </View>
            <Text style={styles.statValue}>{formatPrice(mockTeacherStats.revenue)}</Text>
            <Text style={styles.statLabel}>درآمد</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>دسترسی سریع</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>دوره‌های اخیر</Text>
            <TouchableOpacity onPress={() => router.push('./(teacher)/courses')}>
              <Text style={styles.seeAllText}>مشاهده همه</Text>
            </TouchableOpacity>
          </View>
          
          {recentCourses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={40} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>هنوز دوره‌ای ایجاد نکرده‌اید</Text>
              <TouchableOpacity
                style={styles.createCourseButton}
                onPress={() => router.push('./(teacher)/courses/create')}
              >
                <Text style={styles.createCourseText}>ایجاد اولین دوره</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.coursesList}>
              {recentCourses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={styles.courseCard}
                  onPress={() => router.push(`./(teacher)/course/${course.id}/manage`)}
                >
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <Text style={styles.courseStudents}>
                      {course.student_count} دانش‌آموز
                    </Text>
                  </View>
                  <View style={styles.courseProgress}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${course.progress}%` }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>{course.progress}%</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>فعالیت‌های اخیر</Text>
          <View style={styles.activitiesList}>
            {recentActivities.map((activity) => (
              <TouchableOpacity key={activity.id} style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <Ionicons
                    name={getActivityIcon(activity.type) as any}
                    size={20}
                    color={Colors.primary}
                  />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityMeta}>
                    {activity.course} • {activity.time}
                  </Text>
                </View>
                <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pending Actions */}
        {(mockTeacherStats.pending_assignments > 0 || mockTeacherStats.pending_exams > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اقدامات در انتظار</Text>
            <View style={styles.pendingActions}>
              {mockTeacherStats.pending_assignments > 0 && (
                <TouchableOpacity
                  style={styles.pendingCard}
                  onPress={() => router.push('./(teacher)/grading')}
                >
                  <View style={styles.pendingIcon}>
                    <Ionicons name="document-text" size={24} color={Colors.warning} />
                  </View>
                  <View style={styles.pendingInfo}>
                    <Text style={styles.pendingTitle}>{mockTeacherStats.pending_assignments} تکلیف</Text>
                    <Text style={styles.pendingText}>در انتظار تصحیح</Text>
                  </View>
                  <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
              
              {mockTeacherStats.pending_exams > 0 && (
                <TouchableOpacity
                  style={styles.pendingCard}
                  onPress={() => router.push('./(teacher)/grading')}
                >
                  <View style={styles.pendingIcon}>
                    <Ionicons name="clipboard" size={24} color={Colors.danger} />
                  </View>
                  <View style={styles.pendingInfo}>
                    <Text style={styles.pendingTitle}>{mockTeacherStats.pending_exams} آزمون</Text>
                    <Text style={styles.pendingText}>در انتظار تصحیح</Text>
                  </View>
                  <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
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
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
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
    width: '48%',
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '23%',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  createCourseButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createCourseText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  coursesList: {
    gap: 12,
  },
  courseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
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
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  courseStudents: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  courseProgress: {
    alignItems: 'flex-end',
    gap: 4,
  },
  progressBar: {
    width: 100,
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
  activitiesList: {
    gap: 12,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  activityMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pendingActions: {
    gap: 12,
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  pendingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingInfo: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  pendingText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});