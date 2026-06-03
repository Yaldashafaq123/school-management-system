// app/teacher/assignment/[id]/grading.tsx
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Header } from '@/components/Header';
import { Assignment, Submission, GradingRubric, GradingCriteria } from '@/types';

export default function TeacherGradingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [rubric, setRubric] = useState<GradingRubric | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [grades, setGrades] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockAssignment: Assignment = {
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
        status: 'graded',
      };

      const mockSubmissions: Submission[] = [
        {
          id: 1,
          assignment_id: 1,
          student_id: 1,
          content: 'تمرین‌های فصل اول را انجام دادم.',
          attachments: [],
          submitted_at: '2024-12-18T14:30:00',
          grade: 18,
          feedback: 'عالی بود! فقط در سوال ۳ کمی توضیحات کم داشتید.',
          graded_at: '2024-12-19T10:00:00',
          graded_by: 2,
        },
        {
          id: 2,
          assignment_id: 1,
          student_id: 2,
          content: 'انجام تمرینات فصل اول',
          attachments: [],
          submitted_at: '2024-12-19T09:15:00',
          grade: 15,
          feedback: 'خوب بود، می‌توانست بهتر باشد.',
          graded_at: '2024-12-20T11:30:00',
          graded_by: 2,
        },
        {
          id: 3,
          assignment_id: 1,
          student_id: 3,
          content: '',
          attachments: [],
          submitted_at: '2024-12-20T22:45:00',
        },
      ];

      const mockRubric: GradingRubric = {
        id: 1,
        assignment_id: 1,
        total_points: 20,
        criteria: [
          {
            id: 1,
            rubric_id: 1,
            title: 'درستی پاسخ‌ها',
            description: 'صحیح بودن پاسخ‌های داده شده',
            max_score: 10,
          },
          {
            id: 2,
            rubric_id: 1,
            title: 'توضیحات کامل',
            description: 'کامل بودن توضیحات و راه حل‌ها',
            max_score: 6,
          },
          {
            id: 3,
            rubric_id: 1,
            title: 'نظم و ترتیب',
            description: 'مرتب بودن پاسخ‌ها و خوانایی',
            max_score: 4,
          },
        ],
      };

      setAssignment(mockAssignment);
      setSubmissions(mockSubmissions);
      setRubric(mockRubric);
      
      // Initialize grades for ungraded submission
      const ungradedSubmission = mockSubmissions.find(s => !s.grade);
      if (ungradedSubmission) {
        setSelectedSubmission(ungradedSubmission);
        // Initialize grades for rubric criteria
        const initialGrades: Record<number, number> = {};
        mockRubric.criteria.forEach(criteria => {
          initialGrades[criteria.id] = criteria.max_score;
        });
        setGrades(initialGrades);
      }
    } catch (error) {
      Alert.alert('خطا', 'بارگذاری اطلاعات ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (criteriaId: number, score: number) => {
    setGrades(prev => ({
      ...prev,
      [criteriaId]: Math.max(0, Math.min(score, rubric?.criteria.find(c => c.id === criteriaId)?.max_score || 0)),
    }));
  };

  const calculateTotalGrade = () => {
    return Object.values(grades).reduce((sum, score) => sum + score, 0);
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission || !assignment) return;

    const totalGrade = calculateTotalGrade();
    
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'موفقیت',
        `نمره ${totalGrade}/${assignment.max_score} برای دانش‌آموز ذخیره شد.`,
        [
          {
            text: 'باشه',
            onPress: () => {
              // Move to next ungraded submission
              const nextUngraded = submissions.find(
                s => !s.grade && s.id !== selectedSubmission.id
              );
              if (nextUngraded) {
                setSelectedSubmission(nextUngraded);
                // Reset grades for new submission
                const initialGrades: Record<number, number> = {};
                rubric?.criteria.forEach(criteria => {
                  initialGrades[criteria.id] = criteria.max_score;
                });
                setGrades(initialGrades);
                setFeedback('');
              } else {
                router.back();
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('خطا', 'ذخیره نمره ناموفق بود');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!assignment || !rubric) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="تصحیح تکلیف" showBack onBackPress={() => router.back()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={Colors.danger} />
          <Text style={styles.errorText}>تکلیف یافت نشد</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalGrade = calculateTotalGrade();
  const ungradedCount = submissions.filter(s => !s.grade).length;
  const currentSubmissionIndex = selectedSubmission 
    ? submissions.findIndex(s => s.id === selectedSubmission.id) + 1
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="تصحیح تکلیف"
        showBack
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity>
            <Ionicons name="stats-chart" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Assignment Info */}
        <View style={styles.assignmentInfo}>
          <Text style={styles.courseName}>{assignment.course_name}</Text>
          <Text style={styles.assignmentTitle}>{assignment.title}</Text>
          <View style={styles.assignmentMeta}>
            <Text style={styles.maxScore}>حداکثر نمره: {assignment.max_score}</Text>
            <Text style={styles.submissionInfo}>
              {currentSubmissionIndex}/{submissions.length} • {ungradedCount} تحویل تصحیح نشده
            </Text>
          </View>
        </View>

        {/* Submissions List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تحویل‌های دانش‌آموزان</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.submissionsList}
          >
            {submissions.map((submission) => {
              const isGraded = submission.grade !== undefined;
              const isSelected = selectedSubmission?.id === submission.id;
              
              return (
                <TouchableOpacity
                  key={submission.id}
                  style={[
                    styles.submissionCard,
                    isSelected && styles.submissionCardSelected,
                    isGraded && styles.submissionCardGraded,
                  ]}
                  onPress={() => {
                    setSelectedSubmission(submission);
                    if (submission.grade === undefined) {
                      // Initialize grades for new submission
                      const initialGrades: Record<number, number> = {};
                      rubric.criteria.forEach(criteria => {
                        initialGrades[criteria.id] = criteria.max_score;
                      });
                      setGrades(initialGrades);
                    }
                    setFeedback(submission.feedback || '');
                  }}
                >
                  <View style={styles.submissionHeader}>
                    <Text style={styles.studentId}>دانش‌آموز #{submission.student_id}</Text>
                    {isGraded && (
                      <View style={[
                        styles.gradeBadge,
                        { backgroundColor: submission.grade! >= assignment.max_score * 0.7 
                          ? `${Colors.success}20` 
                          : `${Colors.warning}20` }
                      ]}>
                        <Text style={[
                          styles.gradeBadgeText,
                          { color: submission.grade! >= assignment.max_score * 0.7 
                            ? Colors.success 
                            : Colors.warning }
                        ]}>
                          {submission.grade}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.submissionDate}>
                    {new Date(submission.submitted_at).toLocaleDateString('fa-IR')}
                  </Text>
                  <View style={styles.submissionStatus}>
                    <Ionicons
                      name={isGraded ? 'checkmark-circle' : 'time'}
                      size={14}
                      color={isGraded ? Colors.success : Colors.warning}
                    />
                    <Text style={[
                      styles.statusText,
                      { color: isGraded ? Colors.success : Colors.warning }
                    ]}>
                      {isGraded ? 'تصحیح شده' : 'در انتظار'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Selected Submission Content */}
        {selectedSubmission && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>پاسخ دانش‌آموز</Text>
            <View style={styles.submissionContent}>
              {selectedSubmission.content ? (
                <Text style={styles.answerText}>{selectedSubmission.content}</Text>
              ) : (
                <Text style={styles.noAnswerText}>پاسخ متنی ارائه نشده است</Text>
              )}
              
              {selectedSubmission.attachments.length > 0 && (
                <View style={styles.attachments}>
                  <Text style={styles.attachmentsLabel}>فایل‌های پیوست:</Text>
                  {selectedSubmission.attachments.map((attachment) => (
                    <TouchableOpacity key={attachment.id} style={styles.attachment}>
                      <Ionicons name="document-text" size={16} color={Colors.primary} />
                      <Text style={styles.attachmentName}>{attachment.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Grading Rubric */}
        {selectedSubmission && selectedSubmission.grade === undefined && rubric && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>روبارب نمره‌دهی</Text>
              <View style={styles.rubricContainer}>
                {rubric.criteria.map((criteria) => (
                  <View key={criteria.id} style={styles.criteriaCard}>
                    <View style={styles.criteriaHeader}>
                      <Text style={styles.criteriaTitle}>{criteria.title}</Text>
                      <Text style={styles.criteriaMaxScore}>
                        حداکثر: {criteria.max_score}
                      </Text>
                    </View>
                    <Text style={styles.criteriaDescription}>
                      {criteria.description}
                    </Text>
                    
                    <View style={styles.scoreInputContainer}>
                      <Text style={styles.scoreLabel}>نمره:</Text>
                      <TextInput
                        style={styles.scoreInput}
                        value={grades[criteria.id]?.toString() || '0'}
                        onChangeText={(text) => {
                          const score = parseInt(text) || 0;
                          handleGradeChange(criteria.id, score);
                        }}
                        keyboardType="numeric"
                        maxLength={3}
                      />
                      <Text style={styles.scoreSlash}>/</Text>
                      <Text style={styles.scoreMax}>{criteria.max_score}</Text>
                      
                      <View style={styles.scoreSlider}>
                        <TouchableOpacity
                          style={styles.scoreButton}
                          onPress={() => handleGradeChange(criteria.id, Math.max(0, (grades[criteria.id] || 0) - 1))}
                        >
                          <Ionicons name="remove" size={20} color={Colors.text} />
                        </TouchableOpacity>
                        
                        <View style={styles.scoreBar}>
                          <View
                            style={[
                              styles.scoreFill,
                              {
                                width: `${((grades[criteria.id] || 0) / criteria.max_score) * 100}%`,
                                backgroundColor: (grades[criteria.id] || 0) >= criteria.max_score * 0.7
                                  ? Colors.success
                                  : (grades[criteria.id] || 0) >= criteria.max_score * 0.5
                                  ? Colors.warning
                                  : Colors.danger,
                              },
                            ]}
                          />
                        </View>
                        
                        <TouchableOpacity
                          style={styles.scoreButton}
                          onPress={() => handleGradeChange(criteria.id, Math.min(criteria.max_score, (grades[criteria.id] || 0) + 1))}
                        >
                          <Ionicons name="add" size={20} color={Colors.text} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
                
                <View style={styles.totalGradeCard}>
                  <Text style={styles.totalGradeLabel}>نمره کل:</Text>
                  <Text style={styles.totalGradeValue}>
                    {totalGrade}/{assignment.max_score}
                  </Text>
                  <Text style={styles.totalGradePercentage}>
                    ({(totalGrade / assignment.max_score * 100).toFixed(1)}%)
                  </Text>
                </View>
              </View>
            </View>

            {/* Feedback */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>نظر و بازخورد</Text>
              <TextInput
                style={styles.feedbackInput}
                placeholder="نظر خود را درباره این تکلیف بنویسید..."
                placeholderTextColor={Colors.textSecondary}
                value={feedback}
                onChangeText={setFeedback}
                multiline
                textAlignVertical="top"
                numberOfLines={6}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSaveGrade}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="save" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>ذخیره نمره</Text>
                </>
              )}
            </TouchableOpacity>
          </>
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
  content: {
    flex: 1,
    padding: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text,
    marginTop: 16,
  },
  assignmentInfo: {
    marginBottom: 24,
  },
  courseName: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  assignmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  assignmentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maxScore: {
    fontSize: 14,
    color: Colors.text,
  },
  submissionInfo: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  submissionsList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  submissionCard: {
    width: 150,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submissionCardSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  submissionCardGraded: {
    borderColor: Colors.success,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentId: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  gradeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gradeBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  submissionDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  submissionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  submissionContent: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  answerText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  noAnswerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  attachments: {
    gap: 8,
  },
  attachmentsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  attachmentName: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  rubricContainer: {
    gap: 12,
  },
  criteriaCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  criteriaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  criteriaTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
  },
  criteriaMaxScore: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  criteriaDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
  },
  scoreInputContainer: {
    gap: 12,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  scoreInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    width: 60,
  },
  scoreSlash: {
    fontSize: 16,
    color: Colors.text,
  },
  scoreMax: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  scoreSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  totalGradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    gap: 12,
  },
  totalGradeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  totalGradeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  totalGradePercentage: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  feedbackInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
    color: Colors.text,
    textAlignVertical: 'top',
    minHeight: 120,
    textAlign: 'right',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});