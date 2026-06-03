import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Header } from '../../components/Header';

const mockCourses = [
  { id: 1, title: 'ریاضی هفتم', student_count: 45 },
  { id: 2, title: 'علوم تجربی', student_count: 38 },
  { id: 3, title: 'ادبیات فارسی', student_count: 52 },
];

const mockStudents = [
  {
    id: 1,
    name: 'علی رضایی',
    attendance: [
      { date: '۱۴۰۲/۱۱/۱۵', status: 'present' },
      { date: '۱۴۰۲/۱۱/۱۴', status: 'absent' },
      { date: '۱۴۰۲/۱۱/۱۳', status: 'present' },
      { date: '۱۴۰۲/۱۱/۱۲', status: 'present' },
      { date: '۱۴۰۲/۱۱/۱۱', status: 'late' },
    ],
  },
  {
    id: 2,
    name: 'سارا محمدی',
    attendance: [
      { date: '۱۴۰۲/۱۱/۱۵', status: 'present' },
      { date: '۱۴۰۲/۱۱/۱۴', status: 'present' },
      { date: '۱۴۰۲/۱۱/۱۳', status: 'present' },
      { date: '۱۴۰۲/۱۱/۱۲', status: 'absent' },
      { date: '۱۴۰۲/۱۱/۱۱', status: 'present' },
    ],
  },
  {
    id: 3,
    name: 'محمد حسینی',
    attendance: [
      { date: '۱۴۰۲/۱۱/۱۵', status: 'present' },
      { date: '۱۴۰۲/۱۱/۱۴', status: 'present' },
      { date: '۱۴۰۲/۱۱/۱۳', status: 'present' },
      { date: '۱۴۰۲/۱۱/۱۲', status: 'present' },
      { date: '۱۴۰۲/۱۱/۱۱', status: 'present' },
    ],
  },
  {
    id: 4,
    name: 'فاطمه کریمی',
    attendance: [
      { date: '۱۴۰۲/۱۱/۱۵', status: 'absent' },
      { date: '۱۴۰۲/۱۱/۱۴', status: 'absent' },
      { date: '۱۴۰۲/۱۱/۱۳', status: 'present' },
      { date: '۱۴۰۲/۱۱/۱۲', status: 'absent' },
      { date: '۱۴۰۲/۱۱/۱۱', status: 'late' },
    ],
  },
  {
    id: 5,
    name: 'رضا احمدی',
    attendance: [
      { date: '۱۴۰۲/۱۱/۱۵', status: 'present' },
      { date: '۱۴۰۲/۱۱/۱۴', status: 'late' },
      { date: '۱۴۰۲/۱۱/۱۳', status: 'present' },
      { date: '۱۴۰۲/۱۱/۱۲', status: 'late' },
      { date: '۱۴۰۲/۱۱/۱۱', status: 'absent' },
    ],
  },
];

const attendanceDates = [
  '۱۴۰۲/۱۱/۱۵',
  '۱۴۰۲/۱۱/۱۴',
  '۱۴۰۲/۱۱/۱۳',
  '۱۴۰۲/۱۱/۱۲',
  '۱۴۰۲/۱۱/۱۱',
];

// تعریف نوع برای حضور و غیاب
interface AttendanceRecord {
  date: string;
  status: string;
}

interface Student {
  id: number;
  name: string;
  attendance: AttendanceRecord[];
}

export default function Attendance() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(mockCourses[0].id);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    // In a real app, fetch students based on selected course
    setStudents(mockStudents);
  }, [selectedCourse]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleAttendanceChange = (studentId: number, dateIndex: number, status: string) => {
    const newStudents = [...students];
    const studentIndex = newStudents.findIndex(s => s.id === studentId);
    
    if (studentIndex !== -1) {
      newStudents[studentIndex].attendance[dateIndex].status = status;
      setStudents(newStudents);
    }
  };

  const handleMarkAllPresent = (dateIndex: number) => {
    Alert.alert(
      'ثبت حضور همگانی',
      'آیا می‌خواهید برای همه دانش‌آموزان حضور ثبت کنید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'ثبت',
          onPress: () => {
            const newStudents = students.map(student => ({
              ...student,
              attendance: student.attendance.map((att, idx) => 
                idx === dateIndex ? { ...att, status: 'present' } : att
              )
            }));
            setStudents(newStudents);
          },
        },
      ]
    );
  };

  const handleExportAttendance = () => {
    Alert.alert('موفقیت', 'گزارش حضور و غیاب با موفقیت صادر شد.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return Colors.success;
      case 'absent': return Colors.danger;
      case 'late': return Colors.warning;
      default: return Colors.border;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return 'checkmark-circle';
      case 'absent': return 'close-circle';
      case 'late': return 'time';
      default: return 'help-circle';
    }
  };

  const calculateAttendanceRate = (attendance: AttendanceRecord[]) => {
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const lateCount = attendance.filter(a => a.status === 'late').length;
    return Math.round(((presentCount + (lateCount * 0.5)) / attendance.length) * 100);
  };

  const filteredStudents = students.filter(student => {
    if (searchQuery && !student.name.includes(searchQuery)) {
      return false;
    }
    
    if (filterStatus !== 'all') {
      const rate = calculateAttendanceRate(student.attendance);
      if (filterStatus === 'good' && rate < 80) return false;
      if (filterStatus === 'warning' && (rate >= 80 || rate < 50)) return false;
      if (filterStatus === 'critical' && rate >= 50) return false;
    }
    
    return true;
  });

  const overallStats = {
    total: students.length,
    present: students.reduce((sum, student) => 
      sum + (student.attendance[0].status === 'present' ? 1 : 0), 0
    ),
    absent: students.reduce((sum, student) => 
      sum + (student.attendance[0].status === 'absent' ? 1 : 0), 0
    ),
    late: students.reduce((sum, student) => 
      sum + (student.attendance[0].status === 'late' ? 1 : 0), 0
    ),
  };

  // محاسبه نرخ حضور کل - اصلاح شده
  const calculateOverallAttendanceRate = () => {
    const totalSessions = students.length * attendanceDates.length;
    const presentSessions = students.reduce((sum, student) => 
      sum + student.attendance.filter(a => a.status === 'present').length, 0
    );
    return Math.round((presentSessions / totalSessions) * 100);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="حضور و غیاب"
        rightComponent={
          <TouchableOpacity onPress={handleExportAttendance}>
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
        {/* Course Selection */}
        <View style={styles.coursesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.courseButtons}>
              {mockCourses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={[
                    styles.courseButton,
                    selectedCourse === course.id && styles.courseButtonActive
                  ]}
                  onPress={() => setSelectedCourse(course.id)}
                >
                  <Text style={[
                    styles.courseButtonText,
                    selectedCourse === course.id && styles.courseButtonTextActive
                  ]}>
                    {course.title}
                  </Text>
                  <Text style={[
                    styles.courseButtonCount,
                    selectedCourse === course.id && styles.courseButtonCountActive
                  ]}>
                    {course.student_count} دانش‌آموز
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Search & Filters */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="جستجوی دانش‌آموز..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => {
              Alert.alert(
                'فیلتر وضعیت',
                'بر اساس وضعیت حضور فیلتر کنید:',
                [
                  { text: 'همه', onPress: () => setFilterStatus('all') },
                  { text: 'خوب (۸۰٪+)', onPress: () => setFilterStatus('good') },
                  { text: 'نیاز به توجه (۵۰-۸۰٪)', onPress: () => setFilterStatus('warning') },
                  { text: 'حساب (کمتر از ۵۰٪)', onPress: () => setFilterStatus('critical') },
                  { text: 'لغو', style: 'cancel' },
                ]
              );
            }}
          >
            <Ionicons name="filter" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{overallStats.total}</Text>
              <Text style={styles.statLabel}>کل دانش‌آموزان</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              <Text style={styles.statValue}>{overallStats.present}</Text>
              <Text style={styles.statLabel}>حاضر</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="close-circle" size={24} color={Colors.danger} />
              <Text style={styles.statValue}>{overallStats.absent}</Text>
              <Text style={styles.statLabel}>غایب</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color={Colors.warning} />
              <Text style={styles.statValue}>{overallStats.late}</Text>
              <Text style={styles.statLabel}>تأخیر</Text>
            </View>
          </View>
        </View>

        {/* Today's Date */}
        <View style={styles.todayContainer}>
          <Text style={styles.todayTitle}>تاریخ امروز: {attendanceDates[0]}</Text>
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={() => handleMarkAllPresent(0)}
          >
            <Ionicons name="checkmark-done" size={16} color="#fff" />
            <Text style={styles.markAllText}>ثبت حضور همگانی</Text>
          </TouchableOpacity>
        </View>

        {/* Attendance Table */}
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.studentNameHeader}>
              <Text style={styles.headerText}>دانش‌آموز</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.datesHeader}>
                {attendanceDates.map((date, index) => (
                  <View key={index} style={styles.dateHeader}>
                    <Text style={styles.dateText}>{date}</Text>
                    <TouchableOpacity
                      style={styles.markAllDateButton}
                      onPress={() => handleMarkAllPresent(index)}
                    >
                      <Ionicons name="checkmark" size={12} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
            <View style={styles.rateHeader}>
              <Text style={styles.headerText}>درصد</Text>
            </View>
          </View>

          {/* Table Rows */}
          {filteredStudents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={60} color={Colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>دانش‌آموزی یافت نشد</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery 
                  ? 'هیچ دانش‌آموزی با این نام پیدا نشد.'
                  : 'هیچ دانش‌آموزی در این دوره ثبت‌نام نکرده است.'
                }
              </Text>
            </View>
          ) : (
            filteredStudents.map((student) => {
              const attendanceRate = calculateAttendanceRate(student.attendance);
              
              return (
                <View key={student.id} style={styles.tableRow}>
                  <View style={styles.studentNameCell}>
                    <Text style={styles.studentName} numberOfLines={1}>
                      {student.name}
                    </Text>
                  </View>
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.datesCell}>
                      {student.attendance.map((att, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.attendanceCell}
                          onPress={() => {
                            const statuses = ['present', 'absent', 'late'];
                            const currentIndex = statuses.indexOf(att.status);
                            const nextIndex = (currentIndex + 1) % statuses.length;
                            handleAttendanceChange(student.id, index, statuses[nextIndex]);
                          }}
                        >
                          <Ionicons
                            name={getStatusIcon(att.status)}
                            size={20}
                            color={getStatusColor(att.status)}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                  
                  <View style={styles.rateCell}>
                    <View style={[
                      styles.rateBadge,
                      { 
                        backgroundColor: attendanceRate >= 80 ? `${Colors.success}20` :
                          attendanceRate >= 50 ? `${Colors.warning}20` : `${Colors.danger}20`
                      }
                    ]}>
                      <Text style={[
                        styles.rateText,
                        { 
                          color: attendanceRate >= 80 ? Colors.success :
                            attendanceRate >= 50 ? Colors.warning : Colors.danger
                        }
                      ]}>
                        {attendanceRate}%
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>راهنما:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.legendText}>حاضر</Text>
            </View>
            <View style={styles.legendItem}>
              <Ionicons name="close-circle" size={16} color={Colors.danger} />
              <Text style={styles.legendText}>غایب</Text>
            </View>
            <View style={styles.legendItem}>
              <Ionicons name="time" size={16} color={Colors.warning} />
              <Text style={styles.legendText}>تأخیر</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>اقدامات سریع</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('در حال توسعه', 'این ویژگی به زودی اضافه خواهد شد.')}
            >
              <Ionicons name="calendar" size={24} color={Colors.primary} />
              <Text style={styles.actionText}>برنامه حضور</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleExportAttendance}
            >
              <Ionicons name="document-text" size={24} color={Colors.success} />
              <Text style={styles.actionText}>گزارش ماهانه</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('در حال توسعه', 'این ویژگی به زودی اضافه خواهد شد.')}
            >
              <Ionicons name="notifications" size={24} color={Colors.warning} />
              <Text style={styles.actionText}>اعلان والدین</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('./(teacher)/reports')}
            >
              <Ionicons name="stats-chart" size={24} color={Colors.secondary} />
              <Text style={styles.actionText}>تحلیل آماری</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Attendance Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>خلاصه حضور و غیاب</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValue}>
                {Math.round(
                  (students.reduce((sum, student) => 
                    sum + calculateAttendanceRate(student.attendance), 0) / students.length
                  )
                )}%
              </Text>
              <Text style={styles.summaryLabel}>میانگین حضور کلاس</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValue}>
                {students.filter(s => calculateAttendanceRate(s.attendance) < 50).length}
              </Text>
              <Text style={styles.summaryLabel}>نیاز به توجه فوری</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValue}>
                {attendanceDates.length}
              </Text>
              <Text style={styles.summaryLabel}>جلسه ثبت شده</Text>
            </View>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValue}>
                {calculateOverallAttendanceRate()}%
              </Text>
              <Text style={styles.summaryLabel}>نرخ حضور کل</Text>
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
  },
  coursesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  courseButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  courseButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  courseButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  courseButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  courseButtonTextActive: {
    color: '#fff',
  },
  courseButtonCount: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  courseButtonCountActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
  },
  filterButton: {
    padding: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
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
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  todayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  todayTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  markAllText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  tableContainer: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 50,
  },
  studentNameHeader: {
    width: 100,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  datesHeader: {
    flexDirection: 'row',
  },
  dateHeader: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  dateText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  markAllDateButton: {
    padding: 2,
  },
  rateHeader: {
    width: 60,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 60,
  },
  studentNameCell: {
    width: 100,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  studentName: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'right',
  },
  datesCell: {
    flexDirection: 'row',
  },
  attendanceCell: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  rateCell: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rateText: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  legendContainer: {
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text,
  },
  actionsContainer: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  summaryContainer: {
    padding: 20,
    backgroundColor: Colors.card,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryStat: {
    width: '48%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});