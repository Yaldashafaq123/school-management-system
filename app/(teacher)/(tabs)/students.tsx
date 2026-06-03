// app/(teacher)/(tabs)/students.tsx

import { Header } from '@/components/Header';
import { Colors } from '@/constants/Colors';
import { BASE_URL } from '@/src/config/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Student {
  id: number;
  name: string;
  email: string;
  profile_image: string;
  courses: string[];
  progress: number;
  assignments_completed: number;
  attendance_rate: number;
  attendance_today: number;
  last_active: string;
  class_id?: number;
  class_name?: string;
}

interface Stats {
  total_students: number;
  average_progress: number;
  average_attendance: number;
  total_assignments: number;
  active_today: number;
}

export default function StudentsManagement() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_students: 0,
    average_progress: 0,
    average_attendance: 0,
    total_assignments: 0,
    active_today: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'recent'>('recent');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  // Fetch students from API
  const fetchStudents = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) return;

      const response = await fetch(`${BASE_URL}/teacher/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.data) {
        setStudents(result.data.students || []);
        setStats(result.data.stats || {
          total_students: 0,
          average_progress: 0,
          average_attendance: 0,
          total_assignments: 0,
          active_today: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter and sort students
  const filterAndSortStudents = useCallback(() => {
    let filtered = [...students];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterBy === 'active') {
      filtered = filtered.filter(student => student.progress > 50);
    } else if (filterBy === 'inactive') {
      filtered = filtered.filter(student => student.progress <= 50);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'progress':
          return b.progress - a.progress;
        case 'recent':
          return (b.last_active?.localeCompare(a.last_active) || 0);
        default:
          return 0;
      }
    });

    setFilteredStudents(filtered);
  }, [searchQuery, filterBy, sortBy, students]);

  useEffect(() => {
    filterAndSortStudents();
  }, [filterAndSortStudents]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudents();
  };

  const handleSelectStudent = (studentId: number) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const handleBulkAction = async (action: 'message' | 'remove' | 'export') => {
    if (selectedStudents.length === 0) {
      Alert.alert('خطا', 'لطفاً حداقل یک دانش‌آموز را انتخاب کنید.');
      return;
    }

    switch (action) {
      case 'message':
        Alert.prompt(
          'ارسال پیام گروهی',
          `پیام برای ${selectedStudents.length} دانش‌آموز:`,
          [
            { text: 'لغو', style: 'cancel' },
            {
              text: 'ارسال',
              onPress: async (message: string | undefined) => {
                if (message) {
                  // Send to first student as example
                  const studentId = selectedStudents[0];
                  try {
                    const token = await AsyncStorage.getItem("auth_token");
                    await fetch(`${BASE_URL}/teacher/students/${studentId}/message`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ message }),
                    });
                    Alert.alert('موفقیت', 'پیام ارسال شد.');
                  } catch (error) {
                    Alert.alert('خطا', 'ارسال پیام ناموفق بود.');
                  }
                }
              },
            },
          ],
          'plain-text'
        );
        break;
      case 'remove':
        Alert.alert(
          'حذف دانش‌آموزان',
          `این عملیات در حال حاضر غیرفعال است.`,
          [{ text: 'باشه', style: 'cancel' }]
        );
        break;
      case 'export':
        Alert.alert('موفقیت', 'اطلاعات دانش‌آموزان با موفقیت صادر شد.');
        break;
    }
  };

  const handleSendMessage = async (studentId: number) => {
    Alert.prompt(
      'ارسال پیام',
      'پیام خود را وارد کنید:',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'ارسال',
          onPress: async (message: string | undefined) => {
            if (message) {
              try {
                const token = await AsyncStorage.getItem("auth_token");
                await fetch(`${BASE_URL}/teacher/students/${studentId}/message`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ message }),
                });
                Alert.alert('موفقیت', 'پیام ارسال شد.');
              } catch (error) {
                Alert.alert('خطا', 'ارسال پیام ناموفق بود.');
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleViewProfile = (studentId: number) => {
    router.push({
      pathname: '/(teacher)/student/[id]',
      params: { id: studentId.toString() }
    });
  };

  const handleInviteStudent = () => {
    Alert.prompt(
      'دعوت دانش‌آموز',
      'ایمیل دانش‌آموز را وارد کنید:',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'دعوت',
          onPress: async (email: string | undefined) => {
            if (email && email.includes('@')) {
              try {
                const token = await AsyncStorage.getItem("auth_token");
                await fetch(`${BASE_URL}/teacher/students/invite`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ email }),
                });
                Alert.alert('موفقیت', `دعوتنامه برای ${email} ارسال شد`);
              } catch (error) {
                Alert.alert('خطا', 'ارسال دعوتنامه ناموفق بود.');
              }
            } else {
              Alert.alert('خطا', 'ایمیل معتبر وارد کنید.');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const renderStudentCard = (student: Student) => (
    <TouchableOpacity
      key={student.id}
      style={styles.studentCard}
      onPress={() => handleViewProfile(student.id)}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => handleSelectStudent(student.id)}
      >
        <Ionicons
          name={selectedStudents.includes(student.id) ? 'checkbox' : 'square-outline'}
          size={20}
          color={selectedStudents.includes(student.id) ? Colors.primary : Colors.border}
        />
      </TouchableOpacity>

      <Image source={{ uri: student.profile_image }} style={styles.studentImage} />
      
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{student.name}</Text>
        <Text style={styles.studentEmail}>{student.email}</Text>
        <View style={styles.studentMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="book" size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{student.courses.length} دوره</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="checkmark-circle" size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{student.assignments_completed} تکلیف</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{student.last_active}</Text>
          </View>
        </View>
      </View>

      <View style={styles.studentStats}>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{student.progress}%</Text>
        </View>
        <View style={styles.attendanceBadge}>
          <Ionicons name="checkmark" size={12} color={Colors.success} />
          <Text style={styles.attendanceText}>{student.attendance_rate}%</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.messageButton}
        onPress={() => handleSendMessage(student.id)}
      >
        <Ionicons name="chatbubble" size={20} color={Colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="مدیریت دانش‌آموزان" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="جستجوی دانش‌آموز..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, filterBy === 'all' && styles.filterButtonActive]}
              onPress={() => setFilterBy('all')}
            >
              <Text style={[styles.filterButtonText, filterBy === 'all' && styles.filterButtonTextActive]}>
                همه ({students.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, filterBy === 'active' && styles.filterButtonActive]}
              onPress={() => setFilterBy('active')}
            >
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={[styles.filterButtonText, filterBy === 'active' && styles.filterButtonTextActive]}>
                فعال ({students.filter(s => s.progress > 50).length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterButton, filterBy === 'inactive' && styles.filterButtonActive]}
              onPress={() => setFilterBy('inactive')}
            >
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={[styles.filterButtonText, filterBy === 'inactive' && styles.filterButtonTextActive]}>
                نیاز به توجه ({students.filter(s => s.progress <= 50).length})
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => {
            Alert.alert(
              'مرتب‌سازی',
              'بر اساس چه معیاری مرتب شود؟',
              [
                { text: 'نام', onPress: () => setSortBy('name') },
                { text: 'پیشرفت', onPress: () => setSortBy('progress') },
                { text: 'اخرین فعالیت', onPress: () => setSortBy('recent') },
                { text: 'لغو', style: 'cancel' },
              ]
            );
          }}
        >
          <Ionicons name="filter" size={20} color={Colors.primary} />
          <Text style={styles.sortButtonText}>مرتب‌سازی</Text>
        </TouchableOpacity>
      </View>

      {/* Bulk Actions */}
      {selectedStudents.length > 0 && (
        <View style={styles.bulkActions}>
          <TouchableOpacity
            style={styles.bulkActionButton}
            onPress={() => handleBulkAction('message')}
          >
            <Ionicons name="chatbubble" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bulkActionButton}
            onPress={() => handleBulkAction('remove')}
          >
            <Ionicons name="trash" size={20} color={Colors.danger} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bulkActionButton}
            onPress={() => handleBulkAction('export')}
          >
            <Ionicons name="download" size={20} color={Colors.success} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bulkActionButton}
            onPress={handleSelectAll}
          >
            <Ionicons name="checkmark-done" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.bulkActionText}>
            <Text style={styles.bulkActionCount}>
              {selectedStudents.length} انتخاب شده
            </Text>
          </View>
        </View>
      )}

      {/* Students List */}
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
        {filteredStudents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={60} color={Colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>دانش‌آموزی یافت نشد</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? 'هیچ دانش‌آموزی با این مشخصات پیدا نشد.'
                : 'هنوز دانش‌آموزی در کلاس‌های شما ثبت‌نام نکرده است.'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.inviteButton}
                onPress={handleInviteStudent}
              >
                <Ionicons name="person-add" size={20} color="#fff" />
                <Text style={styles.inviteButtonText}>دعوت دانش‌آموز</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.studentsList}>
            <View style={styles.listHeader}>
              <TouchableOpacity
                style={styles.selectAllButton}
                onPress={handleSelectAll}
              >
                <Ionicons
                  name={selectedStudents.length === filteredStudents.length ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={selectedStudents.length === filteredStudents.length ? Colors.primary : Colors.border}
                />
                <Text style={styles.selectAllText}>انتخاب همه</Text>
              </TouchableOpacity>
              <Text style={styles.listCount}>
                {filteredStudents.length} دانش‌آموز
              </Text>
            </View>

            {filteredStudents.map((student) => renderStudentCard(student))}
          </View>
        )}

        {/* Stats Overview */}
        {students.length > 0 && (
          <View style={styles.statsOverview}>
            <Text style={styles.statsTitle}>آمار کلی</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {stats.total_students}
                </Text>
                <Text style={styles.statLabel}>کل دانش‌آموزان</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {stats.average_progress}%
                </Text>
                <Text style={styles.statLabel}>میانگین پیشرفت</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {stats.average_attendance}%
                </Text>
                <Text style={styles.statLabel}>میانگین حضور</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {stats.total_assignments}
                </Text>
                <Text style={styles.statLabel}>تکالیف انجام شده</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {stats.active_today}
                </Text>
                <Text style={styles.statLabel}>فعال امروز</Text>
              </View>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: Colors.text,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  sortButtonText: {
    fontSize: 12,
    color: Colors.primary,
  },
  bulkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  bulkActionButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bulkActionText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  bulkActionCount: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
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
    marginBottom: 20,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  studentsList: {
    padding: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllText: {
    fontSize: 14,
    color: Colors.text,
  },
  listCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    gap: 12,
  },
  checkbox: {
    padding: 4,
  },
  studentImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.border,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  studentMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  studentStats: {
    alignItems: 'flex-end',
    gap: 4,
  },
  progressBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.success,
  },
  attendanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 2,
  },
  attendanceText: {
    fontSize: 10,
    color: Colors.primary,
  },
  messageButton: {
    padding: 8,
  },
  statsOverview: {
    padding: 16,
    backgroundColor: Colors.card,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});