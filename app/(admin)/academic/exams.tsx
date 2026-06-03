import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Plus } from 'lucide-react-native';

// Components
import { ExamStats } from '@/components/ExamStats';
import { ExamCard } from '@/components/ExamCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar } from '@/components/FilterBar';
import { ExamModal } from '@/components/ExamModal';

/* =======================
   TYPES
======================= */

type ExamStatus = 'upcoming' | 'ongoing' | 'completed';

interface Exam {
  id: string;
  name: string;
  subject: string;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  room: string;
  invigilator: string;
  status: ExamStatus;
  totalMarks: number;
  passingMarks: number;
  isPublished: boolean;
  students: number;
}

/* =======================
   SCREEN
======================= */

export default function ExamManagement() {
  const [exams, setExams] = useState<Exam[]>([
    {
      id: '1',
      name: 'Mid-Term Examinations',
      subject: 'Mathematics',
      className: '10A',
      date: '2024-02-15',
      startTime: '09:00',
      endTime: '12:00',
      duration: '3 hours',
      room: 'Room 101',
      invigilator: 'Mr. Johnson',
      status: 'upcoming',
      totalMarks: 100,
      passingMarks: 40,
      isPublished: true,
      students: 45,
    },
    {
      id: '2',
      name: 'Science Practical Exam',
      subject: 'Physics',
      className: '11B',
      date: '2024-02-16',
      startTime: '10:30',
      endTime: '12:30',
      duration: '2 hours',
      room: 'Lab 3',
      invigilator: 'Dr. Smith',
      status: 'upcoming',
      totalMarks: 50,
      passingMarks: 20,
      isPublished: true,
      students: 32,
    },
    {
      id: '3',
      name: 'English Literature Test',
      subject: 'English',
      className: '9C',
      date: '2024-02-10',
      startTime: '11:00',
      endTime: '13:00',
      duration: '2 hours',
      room: 'Room 205',
      invigilator: 'Mrs. Wilson',
      status: 'ongoing',
      totalMarks: 80,
      passingMarks: 32,
      isPublished: true,
      students: 38,
    },
    {
      id: '4',
      name: 'History Final Exam',
      subject: 'History',
      className: '12A',
      date: '2024-01-25',
      startTime: '14:00',
      endTime: '17:00',
      duration: '3 hours',
      room: 'Room 301',
      invigilator: 'Mr. Brown',
      status: 'completed',
      totalMarks: 100,
      passingMarks: 40,
      isPublished: false,
      students: 28,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | ExamStatus | 'published' | 'draft'
  >('all');

  /* =======================
     ACTIONS
  ======================= */

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Exam',
      'Are you sure you want to delete this exam?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            setExams((prev) => prev.filter((e) => e.id !== id)),
        },
      ]
    );
  };

  const togglePublish = (id: string) => {
    setExams((prev) =>
      prev.map((exam) =>
        exam.id === id
          ? { ...exam, isPublished: !exam.isPublished }
          : exam
      )
    );
  };

  /* =======================
     FILTERING
  ======================= */

  const filteredExams = exams.filter((exam) => {
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      exam.name.toLowerCase().includes(q) ||
      exam.subject.toLowerCase().includes(q) ||
      exam.className.toLowerCase().includes(q);

    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'published')
      return matchesSearch && exam.isPublished;
    if (selectedFilter === 'draft')
      return matchesSearch && !exam.isPublished;

    return matchesSearch && exam.status === selectedFilter;
  });

  const examStats = {
    total: exams.length,
    upcoming: exams.filter((e) => e.status === 'upcoming').length,
    ongoing: exams.filter((e) => e.status === 'ongoing').length,
    completed: exams.filter((e) => e.status === 'completed').length,
  };

  /* =======================
     UI
  ======================= */

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Exam Management</Text>
            <Text style={styles.subtitle}>
              Schedule and manage exams
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditingExam(null);
              setShowModal(true);
            }}
          >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>New Exam</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <ExamStats stats={examStats} />

        {/* Controls */}
        <View style={styles.controls}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search exams..."
          />

          <FilterBar
            filters={[
              { id: 'all', label: 'All' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'ongoing', label: 'Ongoing' },
              { id: 'completed', label: 'Completed' },
              { id: 'published', label: 'Published' },
              { id: 'draft', label: 'Draft' },
            ]}
            selectedFilter={selectedFilter}
            onFilterSelect={setSelectedFilter}
          />
        </View>

        {/* Exams */}
        <View style={styles.examsContainer}>
          {filteredExams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onEdit={() => handleEdit(exam)}
              onDelete={() => handleDelete(exam.id)}
              onTogglePublish={() => togglePublish(exam.id)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Modal */}
      <ExamModal
        visible={showModal}
        exam={editingExam}
        onClose={() => setShowModal(false)}
        onSave={(examData: Exam) => {
          setExams((prev) => {
            if (editingExam) {
              return prev.map((e) =>
                e.id === examData.id ? examData : e
              );
            }
            return [...prev, examData];
          });

          setShowModal(false);
        }}
      />
    </View>
  );
}

/* =======================
   STYLES
======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1d1d1f',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  controls: {
    backgroundColor: 'white',
    padding: 16,
  },
  examsContainer: {
    padding: 16,
    paddingBottom: 40,
  },
});
