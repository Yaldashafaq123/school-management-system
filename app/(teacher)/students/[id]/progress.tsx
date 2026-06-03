import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define TypeScript interfaces
interface StudentData {
  id: string;
  name: string;
  rollNumber: string;
  grade: string;
  class: string;
  overallGrade: string;
  attendance: string;
  assignmentsCompleted: number;
  totalAssignments: number;
}

interface PerformanceData {
  subject: string;
  grade: string;
  score: string;
  trend: 'up' | 'down' | 'stable';
}

interface AssignmentHistory {
  id: string;
  title: string;
  date: string;
  score: string;
  grade: string;
}

interface AttendanceHistory {
  month: string;
  present: number;
  absent: number;
  late: number;
}

const studentData: StudentData = {
  id: '1',
  name: 'علی رضایی',
  rollNumber: 'S001',
  grade: 'پایه دهم',
  class: 'ریاضی ۱۰۱',
  overallGrade: 'A',
  attendance: '۹۵٪',
  assignmentsCompleted: 15,
  totalAssignments: 18,
};

const performanceData: PerformanceData[] = [
  { subject: 'ریاضی', grade: 'A', score: '۹۵٪', trend: 'up' },
  { subject: 'فیزیک', grade: 'A-', score: '۹۰٪', trend: 'stable' },
  { subject: 'شیمی', grade: 'B+', score: '۸۸٪', trend: 'up' },
  { subject: 'زیست', grade: 'B', score: '۸۵٪', trend: 'down' },
];

const assignmentHistory: AssignmentHistory[] = [
  { id: '1', title: 'آزمون جبر', date: '۱۴۰۲/۱۰/۲۶', score: '۹۵/۱۰۰', grade: 'A' },
  { id: '2', title: 'کویز هندسه', date: '۱۴۰۲/۱۰/۲۱', score: '۴۲/۵۰', grade: 'A-' },
  { id: '3', title: 'تکلیف حسابان', date: '۱۴۰۲/۱۰/۱۶', score: '۳۸/۴۰', grade: 'A' },
  { id: '4', title: 'پروژه آمار', date: '۱۴۰۲/۱۰/۰۱', score: '۸۵/۱۰۰', grade: 'B+' },
];

const attendanceHistory: AttendanceHistory[] = [
  { month: 'دی', present: 18, absent: 1, late: 1 },
  { month: 'آذر', present: 20, absent: 0, late: 2 },
  { month: 'آبان', present: 19, absent: 1, late: 0 },
];

export default function StudentProgressPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Student Header */}
        <LinearGradient
          colors={['#2196F3', '#1976D2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.studentInfo}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{studentData.name.charAt(0)}</Text>
              </View>
              <View style={styles.studentDetails}>
                <Text style={styles.studentName}>{studentData.name}</Text>
                <Text style={styles.studentMeta}>شماره: {studentData.rollNumber} • {studentData.grade}</Text>
                <Text style={styles.studentClass}>{studentData.class}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <Ionicons name="trophy-outline" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.statNumber}>{studentData.overallGrade}</Text>
            <Text style={styles.statLabel}>نمره کلی</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(33, 150, 243, 0.1)' }]}>
              <Ionicons name="calendar-outline" size={24} color="#2196F3" />
            </View>
            <Text style={styles.statNumber}>{studentData.attendance}</Text>
            <Text style={styles.statLabel}>حضور و غیاب</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(156, 39, 176, 0.1)' }]}>
              <Ionicons name="document-text-outline" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.statNumber}>
              {studentData.assignmentsCompleted}/{studentData.totalAssignments}
            </Text>
            <Text style={styles.statLabel}>تکالیف</Text>
          </View>
        </View>

        {/* Performance by Subject */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>عملکرد بر اساس درس</Text>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          {performanceData.map((subject, index) => (
            <View key={index} style={styles.subjectCard}>
              <View style={styles.subjectInfo}>
                <View style={styles.subjectIcon}>
                  <Text style={styles.subjectInitial}>{subject.subject.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.subjectName}>{subject.subject}</Text>
                  <Text style={styles.subjectGrade}>{subject.grade} • {subject.score}</Text>
                </View>
              </View>
              <View style={styles.trendContainer}>
                <Ionicons 
                  name={subject.trend === 'up' ? 'trending-up' : subject.trend === 'down' ? 'trending-down' : 'remove'} 
                  size={20} 
                  color={subject.trend === 'up' ? '#4CAF50' : subject.trend === 'down' ? '#F44336' : '#FF9800'} 
                />
              </View>
            </View>
          ))}
        </View>

        {/* Assignment History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>تکالیف اخیر</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>مشاهده همه</Text>
            </TouchableOpacity>
          </View>
          {assignmentHistory.map((assignment) => (
            <TouchableOpacity key={assignment.id} style={styles.assignmentCard}>
              <View style={styles.assignmentInfo}>
                <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                <Text style={styles.assignmentDate}>{assignment.date}</Text>
              </View>
              <View style={styles.assignmentGrade}>
                <Text style={styles.assignmentScore}>{assignment.score}</Text>
                <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(assignment.grade) }]}>
                  <Text style={styles.gradeBadgeText}>{assignment.grade}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Attendance Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>روند حضور و غیاب</Text>
          <View style={styles.chartContainer}>
            {attendanceHistory.map((month, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        height: `${(month.present / 20) * 100}%`,
                        backgroundColor: '#4CAF50'
                      }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        height: `${(month.absent / 20) * 100}%`,
                        backgroundColor: '#F44336',
                        marginTop: 2
                      }
                    ]} 
                  />
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        height: `${(month.late / 20) * 100}%`,
                        backgroundColor: '#FF9800',
                        marginTop: 2
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.chartLabel}>{month.month}</Text>
              </View>
            ))}
          </View>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.legendText}>حاضر</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
              <Text style={styles.legendText}>غایب</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
              <Text style={styles.legendText}>تأخیر</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#2196F3" />
            <Text style={styles.actionText}>ارسال پیام</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-attach-outline" size={20} color="#4CAF50" />
            <Text style={styles.actionText}>افزودن یادداشت</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar-outline" size={20} color="#9C27B0" />
            <Text style={styles.actionText}>برنامه‌ریزی جلسه</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    'A': '#4CAF50',
    'A-': '#8BC34A',
    'B+': '#CDDC39',
    'B': '#FFC107',
    'B-': '#FF9800',
    'C+': '#FF5722',
    'C': '#F44336',
    'C-': '#9E9E9E',
    'D': '#795548',
    'F': '#607D8B',
  };
  return colors[grade] || '#607D8B';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 8,
    marginLeft: 12,
  },
  studentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'right',
  },
  studentMeta: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
    textAlign: 'right',
  },
  studentClass: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: -30,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  subjectCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  subjectInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
  },
  subjectGrade: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textAlign: 'right',
  },
  trendContainer: {
    padding: 8,
  },
  assignmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    textAlign: 'right',
  },
  assignmentDate: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  assignmentGrade: {
    alignItems: 'flex-end',
  },
  assignmentScore: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  gradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gradeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    marginBottom: 16,
  },
  chartBar: {
    alignItems: 'center',
  },
  barContainer: {
    height: 100,
    width: 20,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  barFill: {
    width: '100%',
    borderRadius: 2,
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButton: {
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
});