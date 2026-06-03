import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

interface StudentResult {
  id: number;
  name: string;
  student_id: string;
  score: string;
  max_score: number;
  percentage?: number;
  is_passed?: boolean;
  notes?: string;
  attendance: 'present' | 'absent' | 'excused';
  grade?: string;
}

export default function OfflineExamResultScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  
  const [examTitle, setExamTitle] = useState('آزمون میان ترم ریاضی');
  const [courseName, setCourseName] = useState('ریاضی هفتم');
  const [examDate, setExamDate] = useState('۱۴۰۳/۰۸/۱۵');
  const [maxScore, setMaxScore] = useState(100);
  const [passingScore, setPassingScore] = useState(50);
  
  const [students, setStudents] = useState<StudentResult[]>([
    { id: 1, name: 'علی احمدی', student_id: 'S001', score: '85', max_score: 100, attendance: 'present' },
    { id: 2, name: 'سارا محمدی', student_id: 'S002', score: '92', max_score: 100, attendance: 'present' },
    { id: 3, name: 'رضا کریمی', student_id: 'S003', score: '45', max_score: 100, attendance: 'present' },
    { id: 4, name: 'فاطمه حسینی', student_id: 'S004', score: '', max_score: 100, attendance: 'absent' },
    { id: 5, name: 'محمد رضایی', student_id: 'S005', score: '78', max_score: 100, attendance: 'present' },
    { id: 6, name: 'زهرا اکبری', student_id: 'S006', score: '95', max_score: 100, attendance: 'present' },
    { id: 7, name: 'امیر عباسی', student_id: 'S007', score: '60', max_score: 100, attendance: 'excused' },
    { id: 8, name: 'نازنین جعفری', student_id: 'S008', score: '82', max_score: 100, attendance: 'present' },
  ]);

  useEffect(() => {
    loadExamData();
  }, [id]);

  const loadExamData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
  };

  const calculateStudentResult = (student: StudentResult) => {
    const score = parseFloat(student.score) || 0;
    const percentage = (score / student.max_score) * 100;
    const isPassed = percentage >= passingScore;
    
    let grade = '';
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';
    else grade = 'F';
    
    return { percentage, isPassed, grade };
  };

  const handleScoreChange = (id: number, score: string) => {
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, score } : student
    ));
  };

  const handleNotesChange = (id: number, notes: string) => {
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, notes } : student
    ));
  };

  const handleAttendanceChange = (id: number, attendance: 'present' | 'absent' | 'excused') => {
    setStudents(prev => prev.map(student => 
      student.id === id ? { 
        ...student, 
        attendance,
        score: attendance !== 'present' ? '0' : student.score
      } : student
    ));
  };

  const handleSubmitResults = async () => {
    // Validate all scores
    const invalidScores = students.filter(s => 
      s.attendance === 'present' && (!s.score || isNaN(parseFloat(s.score)))
    );
    
    if (invalidScores.length > 0) {
      Alert.alert('خطا', `${invalidScores.length} دانش‌آموز نمره معتبر ندارند.`);
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'موفقیت',
        'نتایج آزمون با موفقیت ثبت شد.',
        [
          { 
            text: 'بازگشت',
            onPress: () => router.back()
          },
          {
            text: 'مشاهده تحلیل',
            onPress: () => setShowAnalysisModal(true),
            style: 'default'
          }
        ]
      );
    } catch (error) {
      Alert.alert('خطا', 'ثبت نتایج ناموفق بود.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateStatistics = () => {
    const presentStudents = students.filter(s => s.attendance === 'present');
    const scores = presentStudents
      .map(s => parseFloat(s.score) || 0)
      .filter(score => !isNaN(score));
    
    if (scores.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        passCount: 0,
        failCount: 0,
        totalStudents: students.length,
        presentCount: presentStudents.length,
      };
    }
    
    const sum = scores.reduce((a, b) => a + b, 0);
    const average = sum / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passCount = scores.filter(score => (score / maxScore * 100) >= passingScore).length;
    const failCount = scores.length - passCount;
    
    return {
      average: (average / maxScore * 100),
      highest: (highest / maxScore * 100),
      lowest: (lowest / maxScore * 100),
      passCount,
      failCount,
      totalStudents: students.length,
      presentCount: presentStudents.length,
    };
  };

  const stats = calculateStatistics();

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="ثبت نتایج آزمون"
        showBack
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity onPress={() => setShowAnalysisModal(true)}>
            <Ionicons name="stats-chart" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exam Info */}
        <View style={styles.examInfoCard}>
          <Text style={styles.examTitle}>{examTitle}</Text>
          <Text style={styles.courseName}>{courseName}</Text>
          
          <View style={styles.examDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>{examDate}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="trophy" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>حداکثر نمره: {maxScore}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.textSecondary} />
              <Text style={styles.detailText}>حداقل قبولی: {passingScore}%</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{students.length}</Text>
            <Text style={styles.statLabel}>کل دانش‌آموزان</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.success }]}>
              {stats.presentCount}
            </Text>
            <Text style={styles.statLabel}>حاضر</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.danger }]}>
              {students.length - stats.presentCount}
            </Text>
            <Text style={styles.statLabel}>غایب</Text>
          </View>
        </View>

        {/* Students List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نتایج دانش‌آموزان</Text>
          
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 2 }]}>نام دانش‌آموز</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>حضور</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>نمره</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>درصد</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>وضعیت</Text>
          </View>
          
          {students.map((student) => {
            const { percentage, isPassed, grade } = calculateStudentResult(student);
            
            return (
              <View key={student.id} style={styles.studentRow}>
                <View style={[styles.cell, { flex: 2 }]}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentId}>{student.student_id}</Text>
                </View>
                
                <View style={[styles.cell, { flex: 1 }]}>
                  <TouchableOpacity
                    style={[
                      styles.attendanceButton,
                      student.attendance === 'present' && styles.presentButton,
                      student.attendance === 'absent' && styles.absentButton,
                      student.attendance === 'excused' && styles.excusedButton,
                    ]}
                    onPress={() => {
                      const nextStatus = 
                        student.attendance === 'present' ? 'absent' :
                        student.attendance === 'absent' ? 'excused' : 'present';
                      handleAttendanceChange(student.id, nextStatus);
                    }}
                  >
                    <Text style={[
                      styles.attendanceText,
                      student.attendance === 'present' && { color: Colors.success },
                      student.attendance === 'absent' && { color: Colors.danger },
                      student.attendance === 'excused' && { color: Colors.warning },
                    ]}>
                      {student.attendance === 'present' ? 'حاضر' :
                       student.attendance === 'absent' ? 'غایب' : 'معذور'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={[styles.cell, { flex: 1 }]}>
                  <TextInput
                    style={[
                      styles.scoreInput,
                      student.attendance !== 'present' && styles.disabledInput,
                      !isNaN(parseFloat(student.score)) && 
                      parseFloat(student.score) > maxScore && styles.errorInput,
                    ]}
                    value={student.score}
                    onChangeText={(text) => handleScoreChange(student.id, text)}
                    placeholder="۰"
                    keyboardType="numeric"
                    editable={student.attendance === 'present'}
                    maxLength={4}
                  />
                </View>
                
                <View style={[styles.cell, { flex: 1 }]}>
                  <Text style={[
                    styles.percentageText,
                    isPassed && { color: Colors.success },
                    !isPassed && percentage > 0 && { color: Colors.danger },
                  ]}>
                    {student.attendance === 'present' && student.score ? 
                      `${percentage.toFixed(1)}%` : '-'
                    }
                  </Text>
                </View>
                
                <View style={[styles.cell, { flex: 1 }]}>
                  {student.attendance === 'present' && student.score ? (
                    <View style={[
                      styles.statusBadge,
                      isPassed && { backgroundColor: `${Colors.success}20` },
                      !isPassed && { backgroundColor: `${Colors.danger}20` },
                    ]}>
                      <Ionicons 
                        name={isPassed ? 'checkmark-circle' : 'close-circle'} 
                        size={14} 
                        color={isPassed ? Colors.success : Colors.danger} 
                      />
                      <Text style={[
                        styles.statusText,
                        isPassed && { color: Colors.success },
                        !isPassed && { color: Colors.danger },
                      ]}>
                        {isPassed ? 'قبول' : 'رد'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.naText}>-</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>یادداشت‌ها</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="یادداشت‌های کلی در مورد آزمون (اختیاری)"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmitResults}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={styles.submitText}>ثبت نتایج</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Analysis Modal */}
      <Modal
        visible={showAnalysisModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>تحلیل نتایج</Text>
              <TouchableOpacity onPress={() => setShowAnalysisModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.analysisStats}>
                <View style={styles.analysisStatCard}>
                  <Ionicons name="stats-chart" size={24} color={Colors.primary} />
                  <Text style={styles.analysisStatValue}>{stats.average.toFixed(1)}%</Text>
                  <Text style={styles.analysisStatLabel}>میانگین کلاس</Text>
                </View>
                
                <View style={styles.analysisStatCard}>
                  <Ionicons name="trophy" size={24} color={Colors.warning} />
                  <Text style={styles.analysisStatValue}>{stats.highest.toFixed(1)}%</Text>
                  <Text style={styles.analysisStatLabel}>بیشترین</Text>
                </View>
                
                <View style={styles.analysisStatCard}>
                  <Ionicons name="trending-down" size={24} color={Colors.info} />
                  <Text style={styles.analysisStatValue}>{stats.lowest.toFixed(1)}%</Text>
                  <Text style={styles.analysisStatLabel}>کمترین</Text>
                </View>
              </View>
              
              <View style={styles.passFailStats}>
                <View style={styles.passFailItem}>
                  <View style={[styles.passFailBar, { width: '70%' }]} />
                  <View style={styles.passFailInfo}>
                    <Text style={[styles.passFailText, { color: Colors.success }]}>
                      قبول: {stats.passCount} نفر
                    </Text>
                    <Text style={styles.passFailPercentage}>
                      {((stats.passCount / stats.presentCount) * 100 || 0).toFixed(1)}%
                    </Text>
                  </View>
                </View>
                
                <View style={styles.passFailItem}>
                  <View style={[styles.passFailBar, { width: '30%', backgroundColor: Colors.danger }]} />
                  <View style={styles.passFailInfo}>
                    <Text style={[styles.passFailText, { color: Colors.danger }]}>
                      مردود: {stats.failCount} نفر
                    </Text>
                    <Text style={styles.passFailPercentage}>
                      {((stats.failCount / stats.presentCount) * 100 || 0).toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.gradeDistribution}>
                <Text style={styles.analysisSectionTitle}>توزیع نمرات</Text>
                <View style={styles.gradeBars}>
                  {['A', 'B', 'C', 'D', 'F'].map((grade) => {
                    const count = students.filter(s => {
                      if (s.attendance !== 'present' || !s.score) return false;
                      const percentage = (parseFloat(s.score) / maxScore) * 100;
                      if (grade === 'A') return percentage >= 90;
                      if (grade === 'B') return percentage >= 80 && percentage < 90;
                      if (grade === 'C') return percentage >= 70 && percentage < 80;
                      if (grade === 'D') return percentage >= 60 && percentage < 70;
                      return percentage < 60;
                    }).length;
                    
                    const percentage = (count / stats.presentCount) * 100;
                    
                    return (
                      <View key={grade} style={styles.gradeBarItem}>
                        <Text style={styles.gradeLabel}>{grade}</Text>
                        <View style={styles.gradeBarContainer}>
                          <View 
                            style={[
                              styles.gradeBar,
                              { 
                                width: `${percentage}%`,
                                backgroundColor: 
                                  grade === 'A' ? Colors.success :
                                  grade === 'B' ? Colors.warning :
                                  grade === 'C' ? Colors.info :
                                  grade === 'D' ? Colors.primary :
                                  Colors.danger,
                              }
                            ]} 
                          />
                        </View>
                        <Text style={styles.gradeCount}>{count} نفر</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
              
              <View style={styles.recommendations}>
                <Text style={styles.analysisSectionTitle}>توصیه‌ها</Text>
                <View style={styles.recommendationCard}>
                  <Ionicons name="bulb" size={20} color={Colors.warning} />
                  <Text style={styles.recommendationText}>
                    {stats.average >= 80 
                      ? 'عملکرد کلاس عالی است. می‌توانید مباحث پیشرفته‌تری را آموزش دهید.'
                      : stats.average >= 60
                      ? 'عملکرد کلاس متوسط است. روی مباحث مشکل‌دار بیشتر تمرکز کنید.'
                      : 'عملکرد کلاس نیاز به بهبود دارد. پیشنهاد می‌شود جلسه رفع اشکال برگزار کنید.'
                    }
                  </Text>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCloseButton]}
                onPress={() => setShowAnalysisModal(false)}
              >
                <Text style={styles.modalCloseText}>بستن</Text>
              </TouchableOpacity>
            </View>
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
    paddingBottom: 100,
  },
  examInfoCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  examTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  courseName: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 12,
  },
  examDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
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
    fontSize: 10,
    color: Colors.textSecondary,
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
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerCell: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  studentRow: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cell: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  studentName: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'center',
  },
  studentId: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  attendanceButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presentButton: {
    borderColor: Colors.success,
  },
  absentButton: {
    borderColor: Colors.danger,
  },
  excusedButton: {
    borderColor: Colors.warning,
  },
  attendanceText: {
    fontSize: 10,
    fontWeight: '500',
  },
  scoreInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    minWidth: 50,
  },
  disabledInput: {
    backgroundColor: Colors.border,
    color: Colors.textSecondary,
  },
  errorInput: {
    borderColor: Colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  naText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  notesInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'right',
    minHeight: 100,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
  analysisStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  analysisStatCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  analysisStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  analysisStatLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  passFailStats: {
    marginBottom: 20,
  },
  passFailItem: {
    marginBottom: 12,
  },
  passFailBar: {
    height: 8,
    backgroundColor: Colors.success,
    borderRadius: 4,
    marginBottom: 6,
  },
  passFailInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passFailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  passFailPercentage: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  gradeDistribution: {
    marginBottom: 20,
  },
  analysisSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  gradeBars: {
    gap: 12,
  },
  gradeBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gradeLabel: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
    width: 20,
  },
  gradeBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  gradeBar: {
    height: '100%',
    borderRadius: 4,
  },
  gradeCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    width: 40,
    textAlign: 'left',
  },
  recommendations: {
    marginBottom: 20,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButton: {
    backgroundColor: Colors.primary,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});