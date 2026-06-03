import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FlatList, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View,
  ActivityIndicator,
  RefreshControl,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { classApi, ClassDetails, ClassStudent } from '@/src/config/classApi';
import { Colors } from '@/constants/Colors';

export default function ClassDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClassDetails = useCallback(async () => {
    try {
      const response = await classApi.getClassDetails(Number(id));
      if (response.success) {
        setClassDetails(response.data);
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
      Alert.alert('خطا', 'دریافت اطلاعات کلاس با مشکل مواجه شد');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClassDetails();
  }, [fetchClassDetails]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClassDetails();
  };

  const renderStudentItem = ({ item }: { item: ClassStudent }) => (
    <TouchableOpacity 
      style={styles.studentCard}
      onPress={() => router.push({
        pathname: '/(teacher)/students/[id]/progress',
        params: { id: item.id }
      } as any)}
    >
      <View style={styles.studentAvatar}>
        <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.fullName}</Text>
        <Text style={styles.studentRoll}>شماره: {item.rollNumber}</Text>
      </View>
      <View style={styles.studentStats}>
        <Text style={styles.attendanceText}>{item.attendance_rate}%</Text>
        <Text style={styles.gradeText}>{item.average_grade}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderAttendanceItem = ({ item }: { item: any }) => (
    <View style={styles.attendanceCard}>
      <Text style={styles.dateText}>{item.date}</Text>
      <View style={styles.attendanceStats}>
        <View style={[styles.statBadge, { backgroundColor: Colors.success }]}>
          <Text style={styles.statText}>ح: {item.present}</Text>
        </View>
        <View style={[styles.statBadge, { backgroundColor: Colors.danger }]}>
          <Text style={styles.statText}>غ: {item.absent}</Text>
        </View>
        <View style={[styles.statBadge, { backgroundColor: Colors.warning }]}>
          <Text style={styles.statText}>د: {item.late}</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyStudents = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={60} color={Colors.textSecondary} />
      <Text style={styles.emptyText}>هیچ دانش‌آموزی در این کلاس وجود ندارد</Text>
    </View>
  );

  const renderEmptyAttendance = () => (
    <View style={styles.emptyAttendanceContainer}>
      <Text style={styles.emptyAttendanceText}>هنوز حضور و غیابی ثبت نشده است</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!classDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={Colors.danger} />
          <Text style={styles.errorText}>کلاس یافت نشد</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>بازگشت</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Class Header */}
        <View style={styles.classHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-forward" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.classTitle}>{classDetails.name}</Text>
            <Text style={styles.classSubtitle}>
              {classDetails.grade} • {classDetails.totalStudents} دانش‌آموز
              {classDetails.section && ` • بخش ${classDetails.section}`}
            </Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push({
              pathname: '/(teacher)/attendance/take',
              params: { classId: classDetails.id }
            } as any)}
          >
            <Ionicons name="calendar-outline" size={24} color={Colors.primary} />
            <Text style={styles.actionText}>ثبت حضور و غیاب</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push({
              pathname: '/(teacher)/assignments/create',
              params: { classId: classDetails.id }
            } as any)}
          >
            <Ionicons name="document-text-outline" size={24} color={Colors.success} />
            <Text style={styles.actionText}>ایجاد تکلیف</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push({
              pathname: '/(teacher)/grading/entry',
              params: { classId: classDetails.id }
            } as any)}
          >
            <Ionicons name="school-outline" size={24} color={Colors.warning} />
            <Text style={styles.actionText}>ورود نمرات</Text>
          </TouchableOpacity>
        </View>

        {/* Student Roster */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>لیست دانش‌آموزان</Text>
            <Text style={styles.sectionCount}>{classDetails.totalStudents} دانش‌آموز</Text>
          </View>
          {classDetails.students.length > 0 ? (
            <FlatList
              data={classDetails.students}
              renderItem={renderStudentItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            renderEmptyStudents()
          )}
        </View>

        {/* Attendance History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>تاریخچه حضور و غیاب</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>مشاهده همه</Text>
            </TouchableOpacity>
          </View>
          {classDetails.attendanceHistory && classDetails.attendanceHistory.length > 0 ? (
            <FlatList
              data={classDetails.attendanceHistory}
              renderItem={renderAttendanceItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.attendanceList}
            />
          ) : (
            renderEmptyAttendance()
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{classDetails.averageAttendance}%</Text>
            <Text style={styles.statLabel}>میانگین حضور</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>-</Text>
            <Text style={styles.statLabel}>میانگین نمره</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{classDetails.pendingAssignments}</Text>
            <Text style={styles.statLabel}>تکلیف در انتظار</Text>
          </View>
        </View>

        {/* Extra spacing */}
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 20,
  },
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
  },
  headerContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  classTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'right',
  },
  classSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
  menuButton: {
    padding: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.card,
    marginTop: 1,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    padding: 12,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
  },
  section: {
    backgroundColor: Colors.card,
    marginTop: 8,
    padding: 16,
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
    color: Colors.text,
    textAlign: 'right',
  },
  sectionCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'right',
  },
  studentRoll: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'right',
  },
  studentStats: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  attendanceText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '500',
  },
  gradeText: {
    fontSize: 14,
    color: Colors.warning,
    fontWeight: '500',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
  },
  attendanceList: {
    paddingBottom: 8,
  },
  attendanceCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginLeft: 12,
    width: 140,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'right',
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyAttendanceContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyAttendanceText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.card,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  spacer: {
    height: 20,
  },
});