// app/(tabs)/assignments.tsx - Enhanced version
import React, { useState } from 'react'; // Removed unused useEffect
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'; // Removed unused ActivityIndicator
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Header } from '@/components/Header';
import { AssignmentCard } from '@/components/AssignmentCard';
import { Assignment } from '@/types';

// Mock data - Replace with API calls
const mockAssignments: Assignment[] = [
  {
    id: 1,
    course_id: 1,
    course_name: 'ریاضی پایه هفتم',
    title: 'تمرین فصل اول: اعداد طبیعی',
    description: 'تمرینات مربوط به فصل اول کتاب ریاضی هفتم',
    instructions: '',
    due_date: '2024-12-20T23:59:59',
    max_score: 20,
    created_at: '2024-11-01',
    updated_at: '2024-11-01',
    attachments: [],
    submission: {
      id: 1,
      assignment_id: 1,
      student_id: 1,
      submitted_at: '2024-12-18T14:30:00',
      grade: 18,
      feedback: 'عالی بود!',
      graded_at: '2024-12-19T10:00:00',
      graded_by: 2,
      attachments: [],
    },
    status: 'graded',
  },
  {
    id: 2,
    course_id: 2,
    course_name: 'علوم تجربی هفتم',
    title: 'پروژه تحقیقاتی درباره گیاهان',
    description: 'تحقیق درباره انواع گیاهان و ویژگی‌های آنها',
    instructions: '',
    due_date: '2024-12-25T23:59:59',
    max_score: 25,
    created_at: '2024-11-05',
    updated_at: '2024-11-05',
    attachments: [
      {
        id: 3,
        assignment_id: 2,
        name: 'راهنمای پروژه.pdf',
        url: 'https://example.com/guide.pdf',
        type: 'application/pdf',
        size: 1024000,
      },
    ],
    submission: {
      id: 2,
      assignment_id: 2,
      student_id: 1,
      submitted_at: '2024-12-24T20:15:00',
      attachments: [],
    },
    status: 'submitted',
  },
  {
    id: 3,
    course_id: 3,
    course_name: 'ادبیات فارسی',
    title: 'مقاله درباره فردوسی',
    description: 'مقاله‌ای درباره زندگی و آثار فردوسی',
    instructions: '',
    due_date: '2024-12-15T23:59:59',
    max_score: 15,
    created_at: '2024-11-10',
    updated_at: '2024-11-10',
    attachments: [],
    status: 'missing',
  },
  {
    id: 4,
    course_id: 1,
    course_name: 'ریاضی پایه هفتم',
    title: 'تمرین فصل دوم: کسرها',
    description: 'تمرینات مربوط به کسرهای متعارفی',
    instructions: '',
    due_date: '2024-12-28T23:59:59',
    max_score: 20,
    created_at: '2024-11-15',
    updated_at: '2024-11-15',
    attachments: [],
    status: 'pending',
  },
];

export default function AssignmentsScreen() {
  const router = useRouter();
  const [, setAssignments] = useState<Assignment[]>(mockAssignments); // Prefix with underscore since it's not used
  const [filter, setFilter] = useState<string>('all');
  const [, setLoading] = useState(false); // Prefix with underscore since it's not used
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { id: 'all', label: 'همه', icon: 'apps' },
    { id: 'pending', label: 'در انتظار', icon: 'time' },
    { id: 'submitted', label: 'تحویل داده‌شده', icon: 'checkmark-circle' },
    { id: 'graded', label: 'نمره‌دار', icon: 'trophy' },
    { id: 'late', label: 'تأخیر', icon: 'alert-circle' },
  ];

  const filteredAssignments = mockAssignments.filter(assignment => { // Use mockAssignments directly
    if (filter === 'all') return true;
    return assignment.status === filter;
  });

  const stats = {
    total: mockAssignments.length,
    pending: mockAssignments.filter(a => a.status === 'pending').length,
    submitted: mockAssignments.filter(a => a.status === 'submitted').length,
    graded: mockAssignments.filter(a => a.status === 'graded').length,
    late: mockAssignments.filter(a => a.status === 'late' || a.status === 'missing').length,
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleAssignmentPress = (assignmentId: number) => {
    // For Expo Router with dynamic routes
    router.push({ pathname: `/assignment/[id]`, params: { id: assignmentId } } as any);
  };

  const handleStatusPress = (assignment: Assignment) => {
    // Show status details or quick actions
    console.log('Status pressed for assignment:', assignment.id);
  };

  const handleCreateAssignment = () => {
    // If the route doesn't exist, you can create it or handle differently
    console.log('Navigate to create assignment');
    // router.push('/assignment/create' as any); // Commented out since route may not exist
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="تکالیف"
        rightComponent={
          <TouchableOpacity>
            <Ionicons name="filter" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>کل</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>در انتظار</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.info }]}>{stats.submitted}</Text>
            <Text style={styles.statLabel}>تحویل داده‌شده</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.success }]}>{stats.graded}</Text>
            <Text style={styles.statLabel}>نمره‌دار</Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filterItem) => (
            <TouchableOpacity
              key={filterItem.id}
              style={[
                styles.filterChip,
                filter === filterItem.id && styles.filterChipActive,
              ]}
              onPress={() => setFilter(filterItem.id)}
            >
              <Ionicons
                name={filterItem.icon as any}
                size={16}
                color={filter === filterItem.id ? '#fff' : Colors.text}
              />
              <Text
                style={[
                  styles.filterText,
                  filter === filterItem.id && styles.filterTextActive,
                ]}
              >
                {filterItem.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Assignments List */}
        <View style={styles.assignmentsContainer}>
          <View style={styles.assignmentsHeader}>
            <Text style={styles.assignmentsTitle}>
              {filter === 'all' ? 'همه تکالیف' : filters.find(f => f.id === filter)?.label}
            </Text>
            <Text style={styles.assignmentsCount}>
              {filteredAssignments.length} تکلیف
            </Text>
          </View>

          {filteredAssignments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name={filter === 'graded' ? 'trophy-outline' : 'document-text-outline'}
                size={60}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyStateText}>
                {filter === 'all'
                  ? 'هنوز تکلیفی ندارید'
                  : `تکلیفی با وضعیت "${filters.find(f => f.id === filter)?.label}" ندارید`}
              </Text>
            </View>
          ) : (
            <View style={styles.assignmentsList}>
              {filteredAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onPress={() => handleAssignmentPress(assignment.id)}
                  onStatusPress={() => handleStatusPress(assignment)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Assignment Button (for teachers) */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleCreateAssignment}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  filtersContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  filtersContent: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  assignmentsContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  assignmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  assignmentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  assignmentsCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  assignmentsList: {
    gap: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});