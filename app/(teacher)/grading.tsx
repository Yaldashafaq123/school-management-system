import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/src/config/api';

interface Assignment {
  id: number;
  assignmentId: number;
  title: string;
  course: string;
  student: string;
  studentId: number;
  submitted_at: string;
  status: 'pending' | 'graded';
  grade: number | null;
  max_grade: number;
  graded_at?: string;
  feedback?: string;
  fileUrl?: string;
}

interface Stats {
  total_pending: number;
  total_graded: number;
  average_grade: number;
}

const filters = [
  { id: 'all', title: 'همه' },
  { id: 'pending', title: 'در انتظار' },
  { id: 'graded', title: 'تصحیح شده' },
];

export default function Grading() {
  const router = useRouter();
  const { token, user } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('pending');
  const [pendingAssignments, setPendingAssignments] = useState<Assignment[]>([]);
  const [gradedAssignments, setGradedAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignments, setSelectedAssignments] = useState<number[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_pending: 0,
    total_graded: 0,
    average_grade: 0,
  });

  // Get teacherId from user object with proper type checking
  const teacherId = user?.teacherId;

 const fetchAssignments = useCallback(async () => {
  try {
    console.log("=== GRADING SCREEN DEBUG ===");
    console.log("Token exists:", !!token);
    console.log("User from useAuth():", JSON.stringify(user, null, 2));
    console.log("user?.teacherId:", user?.teacherId);
    console.log("user?.id:", user?.id);
    console.log("user?.role:", user?.role);
    console.log("============================");

    // Try multiple ways to get teacherId
    let actualTeacherId = user?.teacherId;
    
    if (!actualTeacherId) {
      // Try to find teacherId in other locations
      actualTeacherId = (user as any)?.teacher?.id || 
                       (user as any)?.teacher_id ||
                       (user?.role === 'teacher' ? user?.id : null);
      
      console.log('Found teacherId from alternative sources:', actualTeacherId);
    }

    if (!actualTeacherId) {
      console.log('No teacherId found in user object');
      Alert.alert(
        'خطا', 
        `اطلاعات معلم یافت نشد. لطفا دوباره وارد شوید.\n\nUser object: ${JSON.stringify(user)}`
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    
    console.log('Fetching assignments for teacherId:', actualTeacherId);

    const pendingResponse = await apiRequest(`/assignments/teacher/pending?teacherId=${actualTeacherId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('Pending response:', pendingResponse);
    
    if (pendingResponse?.success) {
      setPendingAssignments(pendingResponse.data || []);
    }

    const gradedResponse = await apiRequest(`/assignments/teacher/graded?teacherId=${actualTeacherId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('Graded response:', gradedResponse);
    
    if (gradedResponse?.success) {
      setGradedAssignments(gradedResponse.data || []);
    }

    const statsResponse = await apiRequest(`/assignments/stats?teacherId=${actualTeacherId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('Stats response:', statsResponse);
    
    if (statsResponse?.success) {
      setStats({
        total_pending: statsResponse.data.total_pending || 0,
        total_graded: statsResponse.data.total_graded || 0,
        average_grade: statsResponse.data.average_grade || 0,
      });
    }

  } catch (error) {
    console.error('Error fetching assignments:', error);
    Alert.alert('خطا', 'خطا در دریافت اطلاعات');
  } finally {
    setLoading(false);
  }
}, [token, user]);
  useEffect(() => {
    if (token && teacherId) {
      fetchAssignments();
    } else {
      console.log('Waiting for token and teacherId:', { token: !!token, teacherId });
    }
  }, [token, teacherId, fetchAssignments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAssignments();
    setRefreshing(false);
  };

  const handleGradeAssignment = (assignmentId: number) => {
    const assignment = pendingAssignments.find(a => a.id === assignmentId);
    if (assignment) {
      router.push({
        // @ts-ignore - Dynamic route path
        pathname: '/(teacher)/assignment/[id]/grading',
        params: { 
          id: assignment.assignmentId,
          submissionId: assignment.id,
          studentName: assignment.student,
          title: assignment.title,
          teacherId: teacherId // Pass teacherId for the grading screen
        }
      });
    }
  };

  const handleSelectAssignment = (assignmentId: number) => {
    if (selectedAssignments.includes(assignmentId)) {
      setSelectedAssignments(selectedAssignments.filter(id => id !== assignmentId));
    } else {
      setSelectedAssignments([...selectedAssignments, assignmentId]);
    }
  };

  const handleSelectAll = () => {
    const assignments = activeFilter === 'pending' ? pendingAssignments : gradedAssignments;
    if (selectedAssignments.length === assignments.length) {
      setSelectedAssignments([]);
    } else {
      setSelectedAssignments(assignments.map(a => a.id));
    }
  };

  const handleBulkGrade = () => {
    if (selectedAssignments.length === 0) {
      Alert.alert('خطا', 'لطفاً حداقل یک کارخانگی را انتخاب کنید.');
      return;
    }

    const selectedData = pendingAssignments.filter(a => selectedAssignments.includes(a.id));
    
    router.push({
      // @ts-ignore - Dynamic route path
      pathname: '/(teacher)/bulk-grading',
      params: { 
        assignments: JSON.stringify(selectedData),
        count: selectedAssignments.length,
        teacherId: teacherId // Pass teacherId for bulk grading
      }
    });
  };

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 80) return Colors.success;
    if (percentage >= 60) return Colors.warning;
    return Colors.danger;
  };

  const getGradeText = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 80) return 'عالی';
    if (percentage >= 60) return 'متوسط';
    return 'نیاز به بهبود';
  };

  const renderAssignmentCard = (assignment: Assignment, isPending: boolean) => (
    <TouchableOpacity
      key={assignment.id}
      style={styles.assignmentCard}
      onPress={() => isPending && handleGradeAssignment(assignment.id)}
      disabled={!isPending}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => handleSelectAssignment(assignment.id)}
      >
        <Ionicons
          name={selectedAssignments.includes(assignment.id) ? 'checkbox' : 'square-outline'}
          size={20}
          color={selectedAssignments.includes(assignment.id) ? Colors.primary : Colors.border}
        />
      </TouchableOpacity>

      <View style={styles.assignmentInfo}>
        <Text style={styles.assignmentTitle}>{assignment.title}</Text>
        <View style={styles.assignmentMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="book" size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{assignment.course}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="person" size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{assignment.student}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={12} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{assignment.submitted_at}</Text>
          </View>
        </View>
      </View>

      <View style={styles.assignmentGrade}>
        {isPending ? (
          <TouchableOpacity
            style={styles.gradeButton}
            onPress={() => handleGradeAssignment(assignment.id)}
          >
            <Ionicons name="create" size={16} color={Colors.primary} />
            <Text style={styles.gradeButtonText}>تصحیح</Text>
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.gradeDisplay}>
              <Text style={[
                styles.gradeValue,
                { color: getGradeColor(assignment.grade || 0, assignment.max_grade) }
              ]}>
                {assignment.grade}/{assignment.max_grade}
              </Text>
              <Text style={[
                styles.gradeText,
                { color: getGradeColor(assignment.grade || 0, assignment.max_grade) }
              ]}>
                {getGradeText(assignment.grade || 0, assignment.max_grade)}
              </Text>
            </View>
            <Text style={styles.gradedAt}>{assignment.graded_at}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  const filteredPending = pendingAssignments.filter(a =>
    a.title.includes(searchQuery) || a.student.includes(searchQuery)
  );

  const filteredGraded = gradedAssignments.filter(a =>
    a.title.includes(searchQuery) || a.student.includes(searchQuery)
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="تصحیح کارخانگی" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال دریافت اطلاعات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="تصحیح کارخانگی" />

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Ionicons name="time" size={20} color={Colors.warning} />
            </View>
            <Text style={styles.statValue}>{stats.total_pending}</Text>
            <Text style={styles.statLabel}>در انتظار</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="checkmark-done" size={20} color={Colors.success} />
            </View>
            <Text style={styles.statValue}>{stats.total_graded}</Text>
            <Text style={styles.statLabel}>تصحیح شده</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="stats-chart" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.average_grade.toFixed(1)}</Text>
            <Text style={styles.statLabel}>میانگین نمره</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <Ionicons name="speedometer" size={20} color={Colors.secondary} />
            </View>
            <Text style={styles.statValue}>
              {stats.total_graded > 0 && stats.total_pending + stats.total_graded > 0
                ? Math.round((stats.total_graded / (stats.total_pending + stats.total_graded)) * 100)
                : 0
              }%
            </Text>
            <Text style={styles.statLabel}>پیشرفت</Text>
          </View>
        </View>
      </View>

      {/* Search & Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجوی کارخانگی..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterButtons}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[styles.filterButton, activeFilter === filter.id && styles.filterButtonActive]}
                onPress={() => setActiveFilter(filter.id)}
              >
                <Text style={[styles.filterText, activeFilter === filter.id && styles.filterTextActive]}>
                  {filter.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Bulk Actions */}
      {selectedAssignments.length > 0 && activeFilter === 'pending' && (
        <View style={styles.bulkActions}>
          <TouchableOpacity
            style={styles.bulkActionButton}
            onPress={handleSelectAll}
          >
            <Ionicons name="checkmark-done" size={20} color={Colors.primary} />
            <Text style={styles.bulkActionText}>
              {selectedAssignments.length === filteredPending.length
                ? 'لغو انتخاب همه'
                : 'انتخاب همه'
              }
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.bulkActionButton}
            onPress={handleBulkGrade}
          >
            <Ionicons name="create" size={20} color={Colors.success} />
            <Text style={styles.bulkActionText}>تصحیح گروهی</Text>
          </TouchableOpacity>
          
          <View style={styles.selectedCount}>
            <Text style={styles.selectedCountText}>
              {selectedAssignments.length} انتخاب شده
            </Text>
          </View>
        </View>
      )}

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
        {activeFilter === 'pending' && filteredPending.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done" size={60} color={Colors.success} />
            <Text style={styles.emptyStateTitle}>هیچ کارخانگی در انتظار نیست</Text>
            <Text style={styles.emptyStateText}>
              تمام کارخانگی تصحیح شده‌اند. آفرین!
            </Text>
          </View>
        ) : activeFilter === 'graded' && filteredGraded.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text" size={60} color={Colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>هیچ کارخانگی تصحیح نشده است</Text>
            <Text style={styles.emptyStateText}>
              هنوز کارخانگی تصحیح نکرده‌اید.
            </Text>
          </View>
        ) : (
          <View style={styles.assignmentsList}>
            <View style={styles.listHeader}>
              <Text style={styles.listCount}>
                {activeFilter === 'pending' ? filteredPending.length : filteredGraded.length} کارخانگی
              </Text>
            </View>

            {activeFilter === 'pending' ? (
              filteredPending.map(assignment => 
                renderAssignmentCard(assignment, true)
              )
            ) : (
              filteredGraded.map(assignment => 
                renderAssignmentCard(assignment, false)
              )
            )}
          </View>
        )}

        {/* Grading Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>نکات تصحیح</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="bulb" size={16} color={Colors.warning} />
              <Text style={styles.tipText}>
                بازخورد سازنده ارائه دهید، نه فقط نمره.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="time" size={16} color={Colors.primary} />
              <Text style={styles.tipText}>
                کارخانگی را حداکثر ۴۸ ساعت پس از ارسال تصحیح کنید.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark" size={16} color={Colors.success} />
              <Text style={styles.tipText}>
                نقاط قوت و ضعف هر دانش‌آموز را مشخص کنید.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="chatbubble" size={16} color={Colors.info} />
              <Text style={styles.tipText}>
                برای بهبود عملکرد پیشنهادات عملی ارائه دهید.
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>اقدامات سریع</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/(teacher)/assignment')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Ionicons name="list" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.quickActionText}>لیست کارخانگی ها </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/(teacher)/analytics')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Ionicons name="stats-chart" size={24} color={Colors.success} />
              </View>
              <Text style={styles.quickActionText}>آمار نمرات</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => Alert.alert('در حال توسعه', 'این ویژگی به زودی اضافه خواهد شد.')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <Ionicons name="download" size={24} color={Colors.warning} />
              </View>
              <Text style={styles.quickActionText}>گزارش نمرات</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/(teacher)/students')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
                <Ionicons name="people" size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.quickActionText}>مدیریت دانش‌آموزان</Text>
            </TouchableOpacity>
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
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  },
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  searchInputContainer: {
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
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterTextActive: {
    color: '#fff',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  bulkActionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  selectedCount: {
    flex: 1,
    alignItems: 'flex-end',
  },
  selectedCountText: {
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
  assignmentCard: {
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
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  assignmentMeta: {
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
  assignmentGrade: {
    alignItems: 'flex-end',
    gap: 4,
  },
  gradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  gradeButtonText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  gradeDisplay: {
    alignItems: 'flex-end',
  },
  gradeValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gradeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  gradedAt: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  tipsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipText: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 18,
    flex: 1,
  },
  quickActionsContainer: {
    padding: 16,
    backgroundColor: Colors.card,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: Colors.background,
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
});