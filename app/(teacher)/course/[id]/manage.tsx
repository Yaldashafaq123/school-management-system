// app/(teacher)/course/[id]/manage.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { Header } from '../../../../components/Header';

// Mock data
const mockCourse = {
  id: 1,
  title: 'ریاضی پایه هفتم',
  description: 'آموزش کامل ریاضی کلاس هفتم',
  student_count: 45,
  revenue: 4500000,
  rating: 4.8,
  is_active: true,
  created_at: '2024-09-01',
};

const mockStudents = [
  { id: 1, name: 'علی رضایی', email: 'ali@example.com', progress: 85, last_active: 'امروز' },
  { id: 2, name: 'سارا محمدی', email: 'sara@example.com', progress: 72, last_active: 'دیروز' },
  { id: 3, name: 'محمد حسینی', email: 'mohammad@example.com', progress: 91, last_active: '۲ روز پیش' },
  { id: 4, name: 'فاطمه کریمی', email: 'fatemeh@example.com', progress: 68, last_active: 'هفته گذشته' },
  { id: 5, name: 'رضا احمدی', email: 'reza@example.com', progress: 45, last_active: '۲ هفته پیش' },
];

const mockAssignments = [
  { id: 1, title: 'تمرین فصل اول', submissions: 38, graded: 35, average_grade: 17.5 },
  { id: 2, title: 'تمرین فصل دوم', submissions: 42, graded: 30, average_grade: 16.2 },
  { id: 3, title: 'پروژه نهایی', submissions: 25, graded: 10, average_grade: 0 },
];

const mockExams = [
  { id: 1, title: 'آزمون میان ترم', submissions: 40, graded: 40, average_grade: 18.5 },
  { id: 2, title: 'آزمون پایان ترم', submissions: 0, graded: 0, average_grade: 0 },
];

export default function CourseManagement() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [students, setStudents] = useState(mockStudents);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'assignments' | 'exams'>('overview');

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleAddStudent = () => {
    Alert.prompt(
      'افزودن دانش‌آموز',
      'ایمیل دانش‌آموز را وارد کنید:',
      (email: string) => {
        if (email && email.includes('@')) {
          Alert.alert('موفقیت', `دعوتنامه برای ${email} ارسال شد`);
        }
      },
      'plain-text'
    );
  };

  const handleRemoveStudent = (studentId: number, studentName: string) => {
    Alert.alert(
      'حذف دانش‌آموز',
      `آیا مطمئن هستید که می‌خواهید ${studentName} را از دوره حذف کنید؟`,
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            setStudents(prev => prev.filter(s => s.id !== studentId));
            Alert.alert('موفقیت', 'دانش‌آموز حذف شد');
          },
        },
      ]
    );
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('fa-IR') + ' تومان';
  };

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Course Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={24} color={Colors.primary} />
          <Text style={styles.statValue}>{mockCourse.student_count}</Text>
          <Text style={styles.statLabel}>دانش‌آموز</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash" size={24} color={Colors.success} />
          <Text style={styles.statValue}>{formatPrice(mockCourse.revenue)}</Text>
          <Text style={styles.statLabel}>درآمد</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star" size={24} color={Colors.warning} />
          <Text style={styles.statValue}>{mockCourse.rating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>امتیاز</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={24} color={Colors.info} />
          <Text style={styles.statValue}>۲ ماه</Text>
          <Text style={styles.statLabel}>مدت</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>عملیات سریع</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/(teacher)/assignment/create')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="document-text" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.quickActionText}>تکلیف جدید</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/(teacher)/exam/create')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Ionicons name="clipboard" size={24} color={Colors.warning} />
            </View>
            <Text style={styles.quickActionText}>آزمون جدید</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={handleAddStudent}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="person-add" size={24} color={Colors.success} />
            </View>
            <Text style={styles.quickActionText}>افزودن دانش‌آموز</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/(teacher)/announcements/create')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <Ionicons name="megaphone" size={24} color={Colors.secondary} />
            </View>
            <Text style={styles.quickActionText}>اعلان جدید</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Students */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>دانش‌آموزان اخیر</Text>
          <TouchableOpacity onPress={() => setActiveTab('students')}>
            <Text style={styles.seeAllText}>مشاهده همه</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.recentStudents}>
          {students.slice(0, 3).map((student) => (
            <TouchableOpacity key={student.id} style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.avatarText}>
                    {student.name.split(' ')[0].charAt(0)}
                  </Text>
                </View>
                <View style={styles.studentDetails}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentEmail}>{student.email}</Text>
                </View>
              </View>
              <View style={styles.studentProgress}>
                <Text style={styles.progressText}>{student.progress}%</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${student.progress}%` }
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStudents = () => (
    <View style={styles.tabContent}>
      <View style={styles.studentsHeader}>
        <Text style={styles.studentsCount}>
          {students.length} دانش‌آموز
        </Text>
        <TouchableOpacity
          style={styles.addStudentButton}
          onPress={handleAddStudent}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addStudentText}>افزودن دانش‌آموز</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.studentsList}>
        {students.map((student) => (
          <View key={student.id} style={styles.studentRow}>
            <View style={styles.studentInfo}>
              <View style={styles.studentAvatar}>
                <Text style={styles.avatarText}>
                  {student.name.split(' ')[0].charAt(0)}
                </Text>
              </View>
              <View style={styles.studentDetails}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentEmail}>{student.email}</Text>
                <Text style={styles.studentLastActive}>
                  آخرین فعالیت: {student.last_active}
                </Text>
              </View>
            </View>
            
            <View style={styles.studentActions}>
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>{student.progress}%</Text>
              </View>
              
              <TouchableOpacity
                style={styles.messageButton}
                onPress={() => {/* Navigate to messaging */}}
              >
                <Ionicons name="chatbubble" size={20} color={Colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveStudent(student.id, student.name)}
              >
                <Ionicons name="trash" size={20} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderAssignments = () => (
    <View style={styles.tabContent}>
      <View style={styles.assignmentsHeader}>
        <Text style={styles.assignmentsCount}>
          {mockAssignments.length} تکلیف
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/(teacher)/assignment/create')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>تکلیف جدید</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.assignmentsList}>
        {mockAssignments.map((assignment) => (
          <TouchableOpacity
            key={assignment.id}
            style={styles.assignmentRow}
            onPress={() => router.push(`/(teacher)/assignment/${assignment.id}`)}
          >
            <View style={styles.assignmentInfo}>
              <Text style={styles.assignmentTitle}>{assignment.title}</Text>
              <View style={styles.assignmentStats}>
                <View style={styles.assignmentStat}>
                  <Ionicons name="arrow-up-circle" size={14} color={Colors.textSecondary} />
                  <Text style={styles.assignmentStatText}>
                    {assignment.submissions} تحویل
                  </Text>
                </View>
                <View style={styles.assignmentStat}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.textSecondary} />
                  <Text style={styles.assignmentStatText}>
                    {assignment.graded} تصحیح شده
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.assignmentGrade}>
              {assignment.average_grade > 0 ? (
                <>
                  <Text style={styles.gradeValue}>{assignment.average_grade.toFixed(1)}</Text>
                  <Text style={styles.gradeLabel}>میانگین</Text>
                </>
              ) : (
                <Text style={styles.ungradedText}>در انتظار تصحیح</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderExams = () => (
    <View style={styles.tabContent}>
      <View style={styles.examsHeader}>
        <Text style={styles.examsCount}>
          {mockExams.length} آزمون
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('./(teacher)/exam/create')}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.createButtonText}>آزمون جدید</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.examsList}>
        {mockExams.map((exam) => (
          <TouchableOpacity
            key={exam.id}
            style={styles.examRow}
            onPress={() => router.push(`./(teacher)/exam/${exam.id}`)}
          >
            <View style={styles.examInfo}>
              <Text style={styles.examTitle}>{exam.title}</Text>
              <View style={styles.examStats}>
                <View style={styles.examStat}>
                  <Ionicons name="people" size={14} color={Colors.textSecondary} />
                  <Text style={styles.examStatText}>
                    {exam.submissions} شرکت‌کننده
                  </Text>
                </View>
                <View style={styles.examStat}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.textSecondary} />
                  <Text style={styles.examStatText}>
                    {exam.graded} تصحیح شده
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.examGradeContainer}>
              {exam.average_grade > 0 ? (
                <>
                  <Text style={styles.gradeValue}>{exam.average_grade.toFixed(1)}</Text>
                  <Text style={styles.gradeLabel}>میانگین</Text>
                </>
              ) : (
                <Text style={styles.ungradedText}>در انتظار</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="مدیریت دوره"
        showBack
        onBackPress={() => router.push('/(teacher)/courses')}
        rightComponent={
          <TouchableOpacity onPress={() => router.push(`/(teacher)/course/${id}`)}>
            <Ionicons name="settings" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      {/* Course Header */}
      <View style={styles.courseHeader}>
        <Text style={styles.courseTitle}>{mockCourse.title}</Text>
        <View style={styles.courseStatus}>
          <Ionicons
            name={mockCourse.is_active ? 'checkmark-circle' : 'close-circle'}
            size={16}
            color={mockCourse.is_active ? Colors.success : Colors.danger}
          />
          <Text style={[
            styles.statusText,
            { color: mockCourse.is_active ? Colors.success : Colors.danger }
          ]}>
            {mockCourse.is_active ? 'فعال' : 'غیرفعال'}
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Ionicons
            name="grid"
            size={20}
            color={activeTab === 'overview' ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            خلاصه
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'students' && styles.activeTab]}
          onPress={() => setActiveTab('students')}
        >
          <Ionicons
            name="people"
            size={20}
            color={activeTab === 'students' ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'students' && styles.activeTabText]}>
            دانش‌آموزان ({students.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'assignments' && styles.activeTab]}
          onPress={() => setActiveTab('assignments')}
        >
          <Ionicons
            name="document-text"
            size={20}
            color={activeTab === 'assignments' ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'assignments' && styles.activeTabText]}>
            تکالیف ({mockAssignments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'exams' && styles.activeTab]}
          onPress={() => setActiveTab('exams')}
        >
          <Ionicons
            name="clipboard"
            size={20}
            color={activeTab === 'exams' ? Colors.primary : Colors.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'exams' && styles.activeTabText]}>
            آزمون‌ها ({mockExams.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'assignments' && renderAssignments()}
        {activeTab === 'exams' && renderExams()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  courseHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  courseStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
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
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
    textAlign: 'center',
  },
  recentStudents: {
    gap: 12,
  },
  studentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  studentProgress: {
    alignItems: 'flex-end',
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  progressBar: {
    width: 80,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success,
    borderRadius: 2,
  },
  studentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentsCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addStudentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addStudentText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  studentsList: {
    gap: 12,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  studentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBadgeText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: 'bold',
  },
  messageButton: {
    padding: 8,
  },
  removeButton: {
    padding: 8,
  },
  studentLastActive: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  assignmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  assignmentsCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  assignmentsList: {
    gap: 12,
  },
  assignmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  assignmentStats: {
    flexDirection: 'row',
    gap: 16,
  },
  assignmentStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assignmentStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  assignmentGrade: {
    alignItems: 'center',
  },
  gradeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success,
  },
  gradeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  ungradedText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  examsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  examsCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  examsList: {
    gap: 12,
  },
  examRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  examStats: {
    flexDirection: 'row',
    gap: 16,
  },
  examStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  examStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  examGradeContainer: {
    alignItems: 'center',
  },
});