// app/(teacher)/assignment/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Header } from '../../../components/Header';
import { assignmentApi, Assignment, Course, AssignmentStats } from '../../../src/config/assignmentApi';

export default function AssignmentsList() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<AssignmentStats>({
    total: 0,
    pending: 0,
    total_submissions: 0,
    average_grade: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filterAssignments = useCallback(() => {
    let filtered = [...assignments];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.course.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply course filter
    if (filterCourse !== 'all') {
      filtered = filtered.filter(assignment => assignment.course_id.toString() === filterCourse);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(assignment => assignment.status === filterStatus);
    }

    setFilteredAssignments(filtered);
  }, [assignments, searchQuery, filterCourse, filterStatus]);

  useEffect(() => {
    filterAssignments();
  }, [filterAssignments]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch assignments, courses, and stats in parallel
      const [assignmentsRes, coursesRes, statsRes] = await Promise.all([
        assignmentApi.getAssignments(),
        assignmentApi.getCourses(),
        assignmentApi.getAssignmentStats(),
      ]);

      if (assignmentsRes.success) {
        setAssignments(assignmentsRes.data);
      }
      if (coursesRes.success) {
        setCourses(coursesRes.data);
      }
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    } catch {
      Alert.alert('خطا', 'دریافت اطلاعات با مشکل مواجه شد');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const handleDeleteAssignment = (assignmentId: number) => {
    Alert.alert(
      'حذف تکلیف',
      'آیا مطمئن هستید که می‌خواهید این تکلیف را حذف کنید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await assignmentApi.deleteAssignment(assignmentId);
              if (response.success) {
                // Refresh data
                await fetchData();
                Alert.alert('موفقیت', 'تکلیف با موفقیت حذف شد.');
              }
            } catch {
              Alert.alert('خطا', 'حذف تکلیف با مشکل مواجه شد.');
            }
          },
        },
      ]
    );
  };

  const handleDuplicateAssignment = async (assignmentId: number) => {
    try {
      const response = await assignmentApi.duplicateAssignment(assignmentId);
      if (response.success) {
        // Refresh data
        await fetchData();
        Alert.alert('موفقیت', 'تکلیف با موفقیت کپی شد.');
      }
    } catch {
      Alert.alert('خطا', 'کپی کردن تکلیف با مشکل مواجه شد.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return Colors.success;
      case 'completed': return Colors.info;
      case 'draft': return Colors.warning;
      default: return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'فعال';
      case 'completed': return 'تمام شده';
      case 'draft': return 'پیش‌نویس';
      default: return 'نامشخص';
    }
  };

  const renderAssignmentCard = (assignment: Assignment) => (
    <TouchableOpacity
      key={assignment.id}
      style={styles.assignmentCard}
      onPress={() => router.push(`/teacher/assignment/${assignment.id}` as any)}
    >
      <View style={styles.assignmentHeader}>
        <View style={styles.assignmentTitleContainer}>
          <Text style={styles.assignmentTitle}>{assignment.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(assignment.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(assignment.status) }]}>
              {getStatusText(assignment.status)}
            </Text>
          </View>
        </View>
        <View style={styles.assignmentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDuplicateAssignment(assignment.id)}
          >
            <Ionicons name="copy" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteAssignment(assignment.id)}
          >
            <Ionicons name="trash" size={18} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.courseInfo}>
        <Ionicons name="book" size={14} color={Colors.textSecondary} />
        <Text style={styles.courseText}>{assignment.course}</Text>
      </View>

      <View style={styles.assignmentStats}>
        <View style={styles.statItem}>
          <Ionicons name="calendar" size={14} color={Colors.textSecondary} />
          <Text style={styles.statText}>مهلت: {assignment.due_date}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="arrow-up-circle" size={14} color={Colors.textSecondary} />
          <Text style={styles.statText}>{assignment.submissions} تحویل</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={14} color={Colors.textSecondary} />
          <Text style={styles.statText}>{assignment.graded} تصحیح شده</Text>
        </View>
      </View>

      <View style={styles.assignmentFooter}>
        {assignment.average_grade > 0 ? (
          <View style={styles.gradeInfo}>
            <Text style={styles.gradeValue}>{assignment.average_grade.toFixed(1)}</Text>
            <Text style={styles.gradeLabel}>میانگین نمره (از {assignment.max_grade})</Text>
          </View>
        ) : (
          <Text style={styles.ungradedText}>هنوز تصحیح نشده است</Text>
        )}
        
        <TouchableOpacity
          style={styles.gradeButton}
          onPress={() => router.push(`/teacher/assignment/${assignment.id}/grading` as any)}
        >
          <Ionicons name="create" size={16} color={Colors.primary} />
          <Text style={styles.gradeButtonText}>
            {assignment.submissions > 0 ? 'تصحیح تکالیف' : 'مشاهده'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="تکالیف" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="تکالیف"
        rightComponent={
          <TouchableOpacity onPress={() => router.push('/teacher/assignment/create' as any)}>
            <Ionicons name="add" size={24} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجوی تکلیف..."
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
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="filter" size={20} color={showFilters ? Colors.primary : Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>دوره:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[styles.filterOption, filterCourse === 'all' && styles.filterOptionActive]}
                  onPress={() => setFilterCourse('all')}
                >
                  <Text style={[styles.filterOptionText, filterCourse === 'all' && styles.filterOptionTextActive]}>
                    همه دوره‌ها
                  </Text>
                </TouchableOpacity>
                {courses.map((course) => (
                  <TouchableOpacity
                    key={course.id}
                    style={[styles.filterOption, filterCourse === course.id.toString() && styles.filterOptionActive]}
                    onPress={() => setFilterCourse(course.id.toString())}
                  >
                    <Text style={[styles.filterOptionText, filterCourse === course.id.toString() && styles.filterOptionTextActive]}>
                      {course.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>وضعیت:</Text>
            <View style={styles.filterOptions}>
              {['all', 'active', 'completed', 'draft'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterOption, filterStatus === status && styles.filterOptionActive]}
                  onPress={() => setFilterStatus(status)}
                >
                  <Text style={[styles.filterOptionText, filterStatus === status && styles.filterOptionTextActive]}>
                    {status === 'all' && 'همه'}
                    {status === 'active' && 'فعال'}
                    {status === 'completed' && 'تمام شده'}
                    {status === 'draft' && 'پیش‌نویس'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>کل تکالیف</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>در انتظار تصحیح</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total_submissions}</Text>
            <Text style={styles.statLabel}>تحویل‌ها</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.average_grade.toFixed(1)}</Text>
            <Text style={styles.statLabel}>میانگین نمره</Text>
          </View>
        </View>
      </View>

      {/* Assignments List */}
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
        {filteredAssignments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={60} color={Colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>تکلیفی یافت نشد</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || filterCourse !== 'all' || filterStatus !== 'all'
                ? 'هیچ تکلیفی با فیلترهای انتخاب شده پیدا نشد.'
                : 'هنوز تکلیفی ایجاد نکرده‌اید.'}
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/teacher/assignment/create' as any)}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createButtonText}>ایجاد اولین تکلیف</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.assignmentsList}>
            <View style={styles.listHeader}>
              <Text style={styles.listCount}>
                {filteredAssignments.length} تکلیف
              </Text>
              <TouchableOpacity
                style={styles.sortButton}
                onPress={() => {
                  Alert.alert(
                    'مرتب‌سازی',
                    'بر اساس چه معیاری مرتب شود؟',
                    [
                      { text: 'تاریخ مهلت', onPress: () => {} },
                      { text: 'تعداد تحویل', onPress: () => {} },
                      { text: 'میانگین نمره', onPress: () => {} },
                      { text: 'لغو', style: 'cancel' },
                    ]
                  );
                }}
              >
                <Ionicons name="swap-vertical" size={16} color={Colors.textSecondary} />
                <Text style={styles.sortButtonText}>مرتب‌سازی</Text>
              </TouchableOpacity>
            </View>

            {filteredAssignments.map((assignment) => (
              renderAssignmentCard(assignment)
            ))}
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
  filterToggle: {
    padding: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filtersPanel: {
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 16,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterOptionText: {
    fontSize: 12,
    color: Colors.text,
  },
  filterOptionTextActive: {
    color: '#fff',
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  assignmentsList: {
    padding: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listCount: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  sortButtonText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  assignmentCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  assignmentTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  assignmentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  courseText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  assignmentStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  assignmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gradeInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  gradeValue: {
    fontSize: 20,
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
  gradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  gradeButtonText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
});