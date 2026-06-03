import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

// Types
export type ExamType = 'online' | 'offline' | 'homework' | 'project';
export type ExamStatus = 'upcoming' | 'ongoing' | 'completed' | 'missed';
export type ExamCategory = 'monthly_1' | 'monthly_2' | 'monthly_3' | 'final';

export interface StudentExam {
  id: number;
  title: string;
  course_id: number;
  course_name: string;
  course_code: string;
  exam_type: ExamType;
  category: ExamCategory;
  status: ExamStatus;
  date: string;
  time?: string;
  duration_minutes?: number;
  total_score: number;
  max_score: number;
  percentage?: number;
  is_passed?: boolean;
  weight_percentage: number;
  description?: string;
  location?: string;
  teacher_name: string;
  teacher_image?: string;
  instructions?: string;
  has_attendance?: boolean;
  attendance_status?: 'present' | 'absent' | 'excused';
  submitted_at?: string;
  result_available: boolean;
  is_mandatory: boolean;
  require_upload?: boolean;
  uploaded_file?: string;
  uploaded_at?: string;
}

// Mock data
const mockExams: StudentExam[] = [
  // Monthly Exam 1 (40%)
  {
    id: 1,
    title: 'آزمون ماهانه اول - ریاضی',
    course_id: 1,
    course_name: 'ریاضی هفتم',
    course_code: 'MATH-101',
    exam_type: 'online',
    category: 'monthly_1',
    status: 'completed',
    date: '۱۴۰۳/۰۸/۱۵',
    time: '۱۰:۰۰',
    duration_minutes: 45,
    total_score: 85,
    max_score: 100,
    percentage: 85,
    is_passed: true,
    weight_percentage: 40,
    teacher_name: 'دکتر رضایی',
    teacher_image: 'https://i.pravatar.cc/150?img=12',
    result_available: true,
    is_mandatory: true,
    description: 'آزمون فصل‌های ۱ تا ۳ کتاب ریاضی',
  },
  {
    id: 2,
    title: 'آزمون ماهانه اول - علوم',
    course_id: 2,
    course_name: 'علوم تجربی',
    course_code: 'SCI-101',
    exam_type: 'offline',
    category: 'monthly_1',
    status: 'completed',
    date: '۱۴۰۳/۰۸/۱۶',
    location: 'کلاس ۲۰۳',
    total_score: 78,
    max_score: 100,
    percentage: 78,
    is_passed: true,
    weight_percentage: 40,
    teacher_name: 'خانم محمدی',
    teacher_image: 'https://i.pravatar.cc/150?img=8',
    has_attendance: true,
    attendance_status: 'present',
    result_available: true,
    is_mandatory: true,
  },
  
  // Monthly Exam 2 (40%)
  {
    id: 3,
    title: 'آزمون ماهانه دوم - ریاضی',
    course_id: 1,
    course_name: 'ریاضی هفتم',
    course_code: 'MATH-101',
    exam_type: 'online',
    category: 'monthly_2',
    status: 'upcoming',
    date: '۱۴۰۳/۰۹/۱۵',
    time: '۰۹:۳۰',
    duration_minutes: 60,
    total_score: 0,
    max_score: 100,
    weight_percentage: 40,
    teacher_name: 'دکتر رضایی',
    teacher_image: 'https://i.pravatar.cc/150?img=12',
    instructions: 'لطفا ۱۵ دقیقه قبل از شروع آزمون حاضر باشید.',
    result_available: false,
    is_mandatory: true,
    description: 'آزمون فصل‌های ۴ تا ۶ کتاب ریاضی',
  },
  {
    id: 4,
    title: 'آزمون ماهانه دوم - علوم',
    course_id: 2,
    course_name: 'علوم تجربی',
    course_code: 'SCI-101',
    exam_type: 'offline',
    category: 'monthly_2',
    status: 'upcoming',
    date: '۱۴۰۳/۰۹/۱۷',
    time: '۱۱:۰۰',
    location: 'آزمایشگاه علوم',
    total_score: 0,
    max_score: 100,
    weight_percentage: 40,
    teacher_name: 'خانم محمدی',
    teacher_image: 'https://i.pravatar.cc/150?img=8',
    instructions: 'به همراه داشتن ماسک در آزمایشگاه الزامی است.',
    result_available: false,
    is_mandatory: true,
  },
  
  // Monthly Exam 3 (40%)
//   {
//     id: 5,
//     title: 'آزمون ماهانه سوم - ریاضی',
//     course_id: 1,
//     course_name: 'ریاضی هفتم',
//     course_code: 'MATH-101',
//     exam_type: 'online',
//     category: 'monthly_3',
//     status: 'upcoming',
//     date: '۱۴۰۳/۱۰/۱۵',
//     weight_percentage: 40,
//     teacher_name: 'دکتر رضایی',
//     teacher_image: 'https://i.pravatar.cc/150?img=12',
//     result_available: false,
//     is_mandatory: true,
//   },
  
  // Final Exam
  {
    id: 6,
    title: 'آزمون پایانی - ریاضی',
    course_id: 1,
    course_name: 'ریاضی هفتم',
    course_code: 'MATH-101',
    exam_type: 'offline',
    category: 'final',
    status: 'upcoming',
    date: '۱۴۰۳/۱۱/۲۰',
    location: 'سالن اصلی',
    duration_minutes: 120,
    total_score: 0,
    max_score: 100,
    weight_percentage: 60,
    teacher_name: 'دکتر رضایی',
    teacher_image: 'https://i.pravatar.cc/150?img=12',
    instructions: 'آزمون جامع کلیه فصل‌های کتاب',
    result_available: false,
    is_mandatory: true,
  },
  
  // Missed Exam
  {
    id: 7,
    title: 'آزمون ماهانه اول - فارسی',
    course_id: 3,
    course_name: 'زبان فارسی',
    course_code: 'PER-101',
    exam_type: 'offline',
    category: 'monthly_1',
    status: 'missed',
    date: '۱۴۰۳/۰۸/۱۴',
    location: 'کلاس ۱۰۱',
    total_score: 0,
    max_score: 100,
    weight_percentage: 40,
    teacher_name: 'آقای حسینی',
    teacher_image: 'https://i.pravatar.cc/150?img=15',
    has_attendance: true,
    attendance_status: 'absent',
    result_available: false,
    is_mandatory: true,
  },
  
  // Homework/Project
  {
    id: 8,
    title: 'پروژه تحقیقاتی علوم',
    course_id: 2,
    course_name: 'علوم تجربی',
    course_code: 'SCI-101',
    exam_type: 'project',
    category: 'monthly_2',
    status: 'ongoing',
    date: '۱۴۰۳/۰۹/۲۵',
    total_score: 0,
    max_score: 50,
    weight_percentage: 20,
    teacher_name: 'خانم محمدی',
    teacher_image: 'https://i.pravatar.cc/150?img=8',
    description: 'تحقیق در مورد انرژی‌های تجدیدپذیر',
    require_upload: true,
    result_available: false,
    is_mandatory: true,
  },
];

const categoryLabels = {
  monthly_1: 'آزمون ماهانه اول',
  monthly_2: 'آزمون ماهانه دوم',
  monthly_3: 'آزمون ماهانه سوم',
  final: 'آزمون پایانی',
};

const examTypeLabels = {
  online: 'آنلاین',
  offline: 'حضوری',
  homework: 'تکلیف',
  project: 'پروژه',
};

export default function ExamsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [exams, setExams] = useState<StudentExam[]>(mockExams);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ExamType | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedExam, setSelectedExam] = useState<StudentExam | null>(null);
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const loadExams = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleExamPress = (exam: StudentExam) => {
    if (exam.status === 'completed' && exam.result_available) {
      router.push(`./exam/${exam.id}/result`);
    } else if (exam.status === 'upcoming' && exam.exam_type === 'online') {
      router.push(`./exam/${exam.id}/take`);
    } else if (exam.status === 'ongoing' && exam.require_upload) {
      setSelectedExam(exam);
      setUploadModalVisible(true);
    } else if (exam.status === 'missed') {
      Alert.alert('آزمون غیبت', 'شما در این آزمون غایب بوده‌اید. لطفا با معلم مربوطه تماس بگیرید.');
    } else {
      // Show exam details
      Alert.alert(
        exam.title,
        `نوع: ${examTypeLabels[exam.exam_type]}\nتاریخ: ${exam.date}\n${exam.location ? `مکان: ${exam.location}\n` : ''}${exam.description ? `توضیحات: ${exam.description}` : ''}`
      );
    }
  };

  const handleTakeAttendance = (exam: StudentExam) => {
    setSelectedExam(exam);
    setAttendanceModalVisible(true);
  };

  const handleSubmitAttendance = (status: 'present' | 'absent' | 'excused') => {
    if (selectedExam) {
      // Update local state
      setExams(prev => prev.map(exam => 
        exam.id === selectedExam.id 
          ? { ...exam, has_attendance: true, attendance_status: status }
          : exam
      ));
      
      Alert.alert('موفقیت', `حضور و غیاب با وضعیت "${getAttendanceStatusLabel(status)}" ثبت شد.`);
      setAttendanceModalVisible(false);
      setSelectedExam(null);
    }
  };

  const handleUploadProject = (exam: StudentExam) => {
    // Simulate file upload
    const updatedExam = {
      ...exam,
      uploaded_file: 'project_report.pdf',
      uploaded_at: new Date().toLocaleDateString('fa-IR'),
      status: 'completed' as ExamStatus,
    };
    
    setExams(prev => prev.map(e => e.id === exam.id ? updatedExam : e));
    setUploadModalVisible(false);
    setSelectedExam(null);
    
    Alert.alert('موفقیت', 'پروژه با موفقیت آپلود شد.');
  };

  const getFilteredExams = () => {
    let filtered = exams;
    
    if (selectedCategory) {
      filtered = filtered.filter(exam => exam.category === selectedCategory);
    }
    
    if (selectedType) {
      filtered = filtered.filter(exam => exam.exam_type === selectedType);
    }
    
    return filtered;
  };

  const getExamStatusColor = (status: ExamStatus) => {
    switch (status) {
      case 'upcoming': return Colors.info;
      case 'ongoing': return Colors.warning;
      case 'completed': return Colors.success;
      case 'missed': return Colors.danger;
      default: return Colors.textSecondary;
    }
  };

  const getExamTypeColor = (type: ExamType) => {
    switch (type) {
      case 'online': return Colors.primary;
      case 'offline': return Colors.secondary;
      case 'homework': return Colors.success;
      case 'project': return Colors.warning;
      default: return Colors.textSecondary;
    }
  };

  const getAttendanceStatusLabel = (status?: 'present' | 'absent' | 'excused') => {
    switch (status) {
      case 'present': return 'حاضر';
      case 'absent': return 'غایب';
      case 'excused': return 'معذور';
      default: return 'ثبت‌نشده';
    }
  };

  const getUpcomingExams = () => exams.filter(e => e.status === 'upcoming' || e.status === 'ongoing');
  const getCompletedExams = () => exams.filter(e => e.status === 'completed');
  
  const calculateOverallScore = () => {
    const completed = getCompletedExams();
    if (completed.length === 0) return 0;
    
    const totalWeightedScore = completed.reduce((sum, exam) => {
      if (exam.percentage) {
        return sum + (exam.percentage * exam.weight_percentage / 100);
      }
      return sum;
    }, 0);
    
    const totalWeight = completed.reduce((sum, exam) => sum + exam.weight_percentage, 0);
    
    return totalWeight > 0 ? (totalWeightedScore / totalWeight) : 0;
  };

  const renderExamCard = (exam: StudentExam) => (
    <TouchableOpacity
      key={exam.id}
      style={styles.examCard}
      onPress={() => handleExamPress(exam)}
    >
      <View style={styles.examCardHeader}>
        <View style={styles.examTitleContainer}>
          <Text style={styles.examCourse}>{exam.course_name}</Text>
          <Text style={styles.examTitle} numberOfLines={1}>{exam.title}</Text>
        </View>
        
        <View style={[
          styles.examTypeBadge,
          { backgroundColor: `${getExamTypeColor(exam.exam_type)}20` }
        ]}>
          <Text style={[styles.examTypeText, { color: getExamTypeColor(exam.exam_type) }]}>
            {examTypeLabels[exam.exam_type]}
          </Text>
        </View>
      </View>
      
      <View style={styles.examDetails}>
        <View style={styles.examDetailRow}>
          <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
          <Text style={styles.examDetailText}>{exam.date}</Text>
          {exam.time && (
            <>
              <Ionicons name="time" size={16} color={Colors.textSecondary} />
              <Text style={styles.examDetailText}>{exam.time}</Text>
            </>
          )}
        </View>
        
        {exam.location && (
          <View style={styles.examDetailRow}>
            <Ionicons name="location" size={16} color={Colors.textSecondary} />
            <Text style={styles.examDetailText}>{exam.location}</Text>
          </View>
        )}
        
        <View style={styles.examDetailRow}>
          <Ionicons name="person" size={16} color={Colors.textSecondary} />
          <Text style={styles.examDetailText}>{exam.teacher_name}</Text>
        </View>
      </View>
      
      <View style={styles.examFooter}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: `${getExamStatusColor(exam.status)}20` }
        ]}>
          <Text style={[styles.statusText, { color: getExamStatusColor(exam.status) }]}>
            {exam.status === 'upcoming' ? 'پیش رو' :
             exam.status === 'ongoing' ? 'در جریان' :
             exam.status === 'completed' ? 'تکمیل شده' : 'غایب'}
          </Text>
        </View>
        
        <View style={styles.weightBadge}>
          <Text style={styles.weightText}>{exam.weight_percentage}%</Text>
        </View>
        
        {exam.percentage !== undefined && exam.percentage > 0 && (
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>{exam.percentage}%</Text>
            <Ionicons 
              name={exam.is_passed ? 'checkmark-circle' : 'close-circle'} 
              size={16} 
              color={exam.is_passed ? Colors.success : Colors.danger} 
            />
          </View>
        )}
        
        {exam.has_attendance && exam.attendance_status && (
          <View style={[
            styles.attendanceBadge,
            exam.attendance_status === 'present' && { backgroundColor: `${Colors.success}20` },
            exam.attendance_status === 'absent' && { backgroundColor: `${Colors.danger}20` },
            exam.attendance_status === 'excused' && { backgroundColor: `${Colors.warning}20` },
          ]}>
            <Text style={[
              styles.attendanceText,
              exam.attendance_status === 'present' && { color: Colors.success },
              exam.attendance_status === 'absent' && { color: Colors.danger },
              exam.attendance_status === 'excused' && { color: Colors.warning },
            ]}>
              {getAttendanceStatusLabel(exam.attendance_status)}
            </Text>
          </View>
        )}
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {exam.status === 'completed' && exam.result_available && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push(`./exam/${exam.id}/result`)}
          >
            <Ionicons name="stats-chart" size={18} color={Colors.primary} />
            <Text style={styles.actionButtonText}>مشاهده نتایج</Text>
          </TouchableOpacity>
        )}
        
        {exam.status === 'upcoming' && exam.exam_type === 'online' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.startButton]}
            onPress={() => router.push(`./exam/${exam.id}/take`)}
          >
            <Ionicons name="play" size={18} color="#fff" />
            <Text style={[styles.actionButtonText, { color: '#fff' }]}>شروع آزمون</Text>
          </TouchableOpacity>
        )}
        
        {exam.status === 'ongoing' && exam.require_upload && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.uploadButton]}
            onPress={() => {
              setSelectedExam(exam);
              setUploadModalVisible(true);
            }}
          >
            <Ionicons name="cloud-upload" size={18} color="#fff" />
            <Text style={[styles.actionButtonText, { color: '#fff' }]}>آپلود پروژه</Text>
          </TouchableOpacity>
        )}
        
        {exam.exam_type === 'offline' && !exam.has_attendance && exam.status !== 'completed' && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleTakeAttendance(exam)}
          >
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.actionButtonText}>ثبت حضور</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const filteredExams = getFilteredExams();
  const overallScore = calculateOverallScore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="آزمون‌ها"
        rightComponent={
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Ionicons name="filter" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overall Stats */}
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statsCard}
        >
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>میانگین نمرات</Text>
            <View style={styles.statsBadge}>
              <Text style={styles.statsBadgeText}>ترم اول ۱۴۰۳</Text>
            </View>
          </View>
          
          <View style={styles.statsMain}>
            <View style={styles.overallScore}>
              <Text style={styles.scoreValue}>{overallScore.toFixed(1)}%</Text>
              <Text style={styles.scoreLabel}>میانگین کل</Text>
            </View>
            
            <View style={styles.statsDetails}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getUpcomingExams().length}</Text>
                <Text style={styles.statLabel}>پیش رو</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{getCompletedExams().length}</Text>
                <Text style={styles.statLabel}>تکمیل شده</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {exams.filter(e => e.percentage && e.is_passed).length}
                </Text>
                <Text style={styles.statLabel}>قبول شده</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[styles.filterChipText, !selectedCategory && styles.filterChipTextActive]}>
                  همه آزمون‌ها
                </Text>
              </TouchableOpacity>
              
              {Object.entries(categoryLabels).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.filterChip, selectedCategory === key && styles.filterChipActive]}
                  onPress={() => setSelectedCategory(selectedCategory === key ? null : key)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedCategory === key && styles.filterChipTextActive
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={[styles.filterChip, !selectedType && styles.filterChipActive]}
                onPress={() => setSelectedType(null)}
              >
                <Text style={[styles.filterChipText, !selectedType && styles.filterChipTextActive]}>
                  همه انواع
                </Text>
              </TouchableOpacity>
              
              {Object.entries(examTypeLabels).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.filterChip, selectedType === key && styles.filterChipActive]}
                  onPress={() => setSelectedType(selectedType === key ? null : key as ExamType)}
                >
                  <Text style={[
                    styles.filterChipText,
                    selectedType === key && styles.filterChipTextActive
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Upcoming Exams */}
        {getUpcomingExams().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>آزمون‌های پیش رو</Text>
            {getUpcomingExams().map(renderExamCard)}
          </View>
        )}

        {/* Completed Exams */}
        {getCompletedExams().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>آزمون‌های تکمیل شده</Text>
            {getCompletedExams().map(renderExamCard)}
          </View>
        )}

        {/* Missed Exams */}
        {exams.filter(e => e.status === 'missed').length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>آزمون‌های غیبت</Text>
            {exams.filter(e => e.status === 'missed').map(renderExamCard)}
          </View>
        )}
      </ScrollView>

      {/* Upload Project Modal */}
      <Modal
        visible={uploadModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>آپلود پروژه</Text>
              <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            {selectedExam && (
              <View style={styles.modalBody}>
                <Text style={styles.modalExamTitle}>{selectedExam.title}</Text>
                <Text style={styles.modalExamCourse}>{selectedExam.course_name}</Text>
                
                <Text style={styles.modalLabel}>توضیحات پروژه:</Text>
                <Text style={styles.modalDescription}>{selectedExam.description}</Text>
                
                <Text style={styles.modalLabel}>حداکثر نمره: {selectedExam.max_score}</Text>
                <Text style={styles.modalLabel}>وزن: {selectedExam.weight_percentage}%</Text>
                
                <TouchableOpacity style={styles.uploadFileButton}>
                  <Ionicons name="document-attach" size={24} color={Colors.primary} />
                  <Text style={styles.uploadFileText}>انتخاب فایل</Text>
                  <Text style={styles.uploadFileHint}>(PDF, Word, PowerPoint, Image)</Text>
                </TouchableOpacity>
                
                <View style={styles.modalNote}>
                  <Ionicons name="information-circle" size={18} color={Colors.info} />
                  <Text style={styles.modalNoteText}>
                    پس از آپلود، امکان ویرایش وجود ندارد. لطفا از صحت فایل مطمئن شوید.
                  </Text>
                </View>
              </View>
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setUploadModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>لغو</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={() => selectedExam && handleUploadProject(selectedExam)}
              >
                <Text style={styles.modalSubmitText}>آپلود و ارسال</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Attendance Modal */}
      <Modal
        visible={attendanceModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ثبت حضور و غیاب</Text>
              <TouchableOpacity onPress={() => setAttendanceModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            {selectedExam && (
              <View style={styles.modalBody}>
                <Text style={styles.modalExamTitle}>{selectedExam.title}</Text>
                <Text style={styles.modalExamCourse}>{selectedExam.course_name}</Text>
                <Text style={styles.modalLabel}>تاریخ: {selectedExam.date}</Text>
                {selectedExam.location && (
                  <Text style={styles.modalLabel}>مکان: {selectedExam.location}</Text>
                )}
                
                <Text style={styles.attendanceLabel}>وضعیت حضور خود را انتخاب کنید:</Text>
                
                <View style={styles.attendanceOptions}>
                  <TouchableOpacity
                    style={[styles.attendanceOption, styles.presentOption]}
                    onPress={() => handleSubmitAttendance('present')}
                  >
                    <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                    <Text style={[styles.attendanceOptionText, { color: Colors.success }]}>
                      حاضر
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.attendanceOption, styles.absentOption]}
                    onPress={() => handleSubmitAttendance('absent')}
                  >
                    <Ionicons name="close-circle" size={24} color={Colors.danger} />
                    <Text style={[styles.attendanceOptionText, { color: Colors.danger }]}>
                      غایب
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.attendanceOption, styles.excusedOption]}
                    onPress={() => handleSubmitAttendance('excused')}
                  >
                    <Ionicons name="medical" size={24} color={Colors.warning} />
                    <Text style={[styles.attendanceOptionText, { color: Colors.warning }]}>
                      معذور
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalNote}>
                  <Ionicons name="warning" size={18} color={Colors.warning} />
                  <Text style={styles.modalNoteText}>
                    در صورت انتخاب غایب یا معذور، با معلم مربوطه هماهنگ کنید.
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    paddingBottom: 32,
  },
  statsCard: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statsBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  statsMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overallScore: {
    alignItems: 'center',
    marginRight: 20,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statsDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  examCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  examCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  examTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  examCourse: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  examTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  examTypeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  examDetails: {
    marginBottom: 12,
  },
  examDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  examDetailText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
    marginRight: 12,
  },
  examFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  weightBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  weightText: {
    fontSize: 10,
    color: Colors.secondary,
    fontWeight: '500',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  attendanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  attendanceText: {
    fontSize: 10,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  uploadButton: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalBody: {
    padding: 20,
  },
  modalExamTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  modalExamCourse: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  uploadFileButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginVertical: 16,
  },
  uploadFileText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
  },
  uploadFileHint: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  attendanceLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 12,
  },
  attendanceOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  attendanceOption: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    minWidth: 100,
  },
  presentOption: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  absentOption: {
    borderColor: Colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  excusedOption: {
    borderColor: Colors.warning,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  attendanceOptionText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  modalNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 16,
  },
  modalNoteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.text,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  modalSubmitButton: {
    backgroundColor: Colors.primary,
  },
  modalSubmitText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
});