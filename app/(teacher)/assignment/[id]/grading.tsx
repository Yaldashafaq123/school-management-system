// app/teacher/assignment/[id]/grading.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
import { assignmentApi, AssignmentWithSubmissions, Submission } from '@/src/config/assignmentApi';

export default function TeacherGradingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [assignment, setAssignment] = useState<AssignmentWithSubmissions | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await assignmentApi.getAssignmentWithSubmissions(Number(id));
      
      if (response.success && response.data) {
        setAssignment(response.data);
        setSubmissions(response.data.submissions || []);
        
        // Find first ungraded submission
        const ungraded = response.data.submissions?.find((s: Submission) => !s.grade);
        if (ungraded) {
          setSelectedSubmission(ungraded);
          setGrade(ungraded.grade?.toString() || '');
          setFeedback(ungraded.feedback || '');
        } else if (response.data.submissions && response.data.submissions.length > 0) {
          // If all are graded, select the first one
          setSelectedSubmission(response.data.submissions[0]);
          setGrade(response.data.submissions[0].grade?.toString() || '');
          setFeedback(response.data.submissions[0].feedback || '');
        }
      }
    } catch (error) {
      Alert.alert('خطا', 'بارگذاری اطلاعات ناموفق بود');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveGrade = async () => {
    if (!selectedSubmission || !assignment) return;

    const gradeNum = parseInt(grade);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > assignment.max_score) {
      Alert.alert('خطا', `نمره باید بین ۰ و ${assignment.max_score} باشد`);
      return;
    }
    
    setSaving(true);
    try {
      await assignmentApi.gradeSubmission({
        submissionId: selectedSubmission.id,
        grade: gradeNum,
        feedback: feedback
      });
      
      Alert.alert(
        'موفقیت',
        `نمره ${gradeNum}/${assignment.max_score} برای دانش‌آموز ذخیره شد.`,
        [
          {
            text: 'باشه',
            onPress: () => {
              // Refresh data to update the list
              loadData();
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

  if (!assignment) {
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

  const ungradedCount = submissions.filter((s: Submission) => !s.grade).length;
  const currentSubmissionIndex = selectedSubmission 
    ? submissions.findIndex((s: Submission) => s.id === selectedSubmission.id) + 1
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
            {submissions.map((submission: Submission) => {
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
                    setGrade(submission.grade?.toString() || '');
                    setFeedback(submission.feedback || '');
                  }}
                >
                  <View style={styles.submissionHeader}>
                    <Text style={styles.studentId}>
                      {submission.student_name || `دانش‌آموز ${submission.student_id}`}
                    </Text>
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
              
              {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                <View style={styles.attachments}>
                  <Text style={styles.attachmentsLabel}>فایل‌های پیوست:</Text>
                  {selectedSubmission.attachments.map((attachment: any) => (
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

        {/* Grading Section */}
        {selectedSubmission && (
          <>
            {/* Grade Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>نمره</Text>
              <View style={styles.gradeContainer}>
                <TextInput
                  style={styles.gradeInput}
                  value={grade}
                  onChangeText={setGrade}
                  keyboardType="numeric"
                  placeholder={`۰ - ${assignment.max_score}`}
                  placeholderTextColor={Colors.textSecondary}
                />
                <Text style={styles.gradeMax}>/ {assignment.max_score}</Text>
              </View>
            </View>

            {/* Feedback */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>بازخورد</Text>
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
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gradeInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    padding: 8,
  },
  gradeMax: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginLeft: 8,
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
    marginBottom: 24,
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