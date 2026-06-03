// app/assignment/[id].tsx
import { FileUpload } from '@/components/FileUpload';
import { Header } from '@/components/Header';
import { Colors } from '@/constants/Colors';
import { Assignment, Submission } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data - Replace with API calls
const mockAssignment: Assignment = {
  id: 1,
  course_id: 1,
  course_name: 'ریاضی پایه هفتم',
  title: 'تمرین فصل اول: اعداد طبیعی',
  description: 'تمرینات مربوط به فصل اول کتاب ریاضی هفتم',
  instructions: `# دستورالعمل تمرین
## موارد مورد نیاز:
1. تمامی سوالات را با دقت بخوانید.
2. پاسخ‌ها را به صورت دستی بنویسید و عکس بگیرید.
3. یا از نرم‌افزار Word استفاده کرده و فایل را آپلود کنید.

## قوانین:
- تحویل با تأخیر نمره کم خواهد داشت.
- پاسخ‌های کپی نمره نخواهند گرفت.
- سوالات را به ترتیب پاسخ دهید.`,
  due_date: '2024-12-20T23:59:59',
  max_score: 20,
  created_at: '2024-11-01',
  updated_at: '2024-11-01',
  attachments: [
    {
      id: 1,
      assignment_id: 1,
      name: 'تمرین‌های فصل اول.pdf',
      url: 'https://example.com/assignment1.pdf',
      type: 'application/pdf',
      size: 2048000,
    },
    {
      id: 2,
      assignment_id: 1,
      name: 'نمونه پاسخ‌نامه.docx',
      url: 'https://example.com/sample.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 1536000,
    },
  ],
  status: 'pending',
};

const mockSubmission: Submission = {
  id: 1,
  assignment_id: 1,
  student_id: 1,
  content: 'تمرین‌های فصل اول را انجام دادم. پاسخ‌ها در فایل‌های پیوست آمده است.',
  attachments: [
    {
      id: 1,
      submission_id: 1,
      name: 'تمرین فصل اول.pdf',
      url: 'https://example.com/submission1.pdf',
      type: 'application/pdf',
      size: 3072000,
      uploaded_at: '2024-12-18T14:30:00',
    },
    {
      id: 2,
      submission_id: 1,
      name: 'پاسخ سوالات.docx',
      url: 'https://example.com/answers.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 2048000,
      uploaded_at: '2024-12-18T14:30:00',
    },
  ],
  submitted_at: '2024-12-18T14:30:00',
  grade: 18,
  feedback: 'عالی بود! فقط در سوال ۳ کمی توضیحات کم داشتید.',
  graded_at: '2024-12-19T10:00:00',
  graded_by: 2,
};

export default function AssignmentDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    loadAssignment();
  }, [id]);

  const loadAssignment = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setAssignment(mockAssignment);
      setSubmission(mockSubmission);
      if (mockSubmission?.content) {
        setAnswerText(mockSubmission.content);
      }
    } catch (error) {
      Alert.alert('خطا', 'بارگذاری تکلیف ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!answerText.trim() && files.length === 0) {
      Alert.alert('خطا', 'لطفا پاسخ خود را وارد کنید یا فایل آپلود کنید.');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'موفقیت',
        'تکلیف با موفقیت تحویل داده شد.',
        [
          {
            text: 'باشه',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('خطا', 'خطا در ارسال تکلیف');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilesSelected = (selectedFiles: any[]) => {
    setFiles(selectedFiles);
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getStatusInfo = () => {
    if (!assignment) return null;

    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    const isOverdue = now > dueDate;

    if (assignment.status === 'graded') {
      return {
        color: assignment.submission?.grade && assignment.submission.grade >= assignment.max_score * 0.7 
          ? Colors.success 
          : assignment.submission?.grade && assignment.submission.grade >= assignment.max_score * 0.5 
          ? Colors.warning 
          : Colors.danger,
        icon: 'checkmark-done',
        text: 'تصحیح شده',
      };
    } else if (assignment.status === 'submitted') {
      return {
        color: isOverdue ? Colors.warning : Colors.info,
        icon: isOverdue ? 'time' : 'checkmark-circle',
        text: isOverdue ? 'با تأخیر تحویل داده شده' : 'تحویل داده شده',
      };
    } else {
      return {
        color: isOverdue ? Colors.danger : Colors.warning,
        icon: isOverdue ? 'alert-circle' : 'timer',
        text: isOverdue ? 'مهلت گذشته' : 'در انتظار تحویل',
      };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <Header title="تکلیف" showBack onBackPress={() => router.back()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={Colors.danger} />
          <Text style={styles.errorText}>تکلیف یافت نشد</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="جزئیات تکلیف"
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Assignment Header */}
        <View style={styles.header}>
          <View style={styles.courseInfo}>
            <Text style={styles.courseName}>{assignment.course_name}</Text>
            <Text style={styles.assignmentTitle}>{assignment.title}</Text>
          </View>
          
          {statusInfo && (
            <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
              <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
            </View>
          )}
        </View>

        {/* Assignment Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>مهلت تحویل:</Text>
            <Text style={styles.infoValue}>{formatDate(assignment.due_date)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="trophy" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoLabel}>حداکثر نمره:</Text>
            <Text style={styles.infoValue}>{assignment.max_score} نمره</Text>
          </View>
          
          {submission?.grade !== undefined && (
            <View style={styles.infoRow}>
              <Ionicons name="star" size={16} color={Colors.textSecondary} />
              <Text style={styles.infoLabel}>نمره شما:</Text>
              <View style={styles.gradeContainer}>
                <Text style={[
                  styles.gradeValue,
                  { color: submission.grade >= assignment.max_score * 0.7 ? Colors.success : Colors.warning }
                ]}>
                  {submission.grade}/{assignment.max_score}
                </Text>
                <Text style={styles.gradePercentage}>
                  ({(submission.grade / assignment.max_score * 100).toFixed(1)}%)
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>توضیحات</Text>
          <Text style={styles.description}>{assignment.description}</Text>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>دستورالعمل‌ها</Text>
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsText}>{assignment.instructions}</Text>
          </View>
        </View>

        {/* Attachments */}
        {assignment.attachments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>فایل‌های تکلیف</Text>
            <View style={styles.attachmentsList}>
              {assignment.attachments.map((attachment) => (
                <TouchableOpacity key={attachment.id} style={styles.attachmentItem}>
                  <View style={styles.attachmentIcon}>
                    <Ionicons name="document-text" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentName}>{attachment.name}</Text>
                    <Text style={styles.attachmentSize}>
                      {(attachment.size / 1024 / 1024).toFixed(1)} MB
                    </Text>
                  </View>
                  <Ionicons name="download" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Submission Section */}
        {submission ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تحویل شما</Text>
            <View style={styles.submissionCard}>
              <View style={styles.submissionHeader}>
                <Text style={styles.submissionDate}>
                  تحویل داده شده در: {formatDate(submission.submitted_at)}
                </Text>
                {submission.grade !== undefined && (
                  <View style={[
                    styles.gradeBadge,
                    { backgroundColor: submission.grade >= assignment.max_score * 0.7 ? 
                      `${Colors.success}20` : `${Colors.warning}20` }
                  ]}>
                    <Text style={[
                      styles.gradeBadgeText,
                      { color: submission.grade >= assignment.max_score * 0.7 ? 
                        Colors.success : Colors.warning }
                    ]}>
                      {submission.grade}/{assignment.max_score}
                    </Text>
                  </View>
                )}
              </View>
              
              {submission.content && (
                <View style={styles.answerSection}>
                  <Text style={styles.answerLabel}>پاسخ متنی:</Text>
                  <Text style={styles.answerText}>{submission.content}</Text>
                </View>
              )}
              
              {submission.attachments.length > 0 && (
                <View style={styles.submissionAttachments}>
                  <Text style={styles.attachmentsLabel}>فایل‌های پیوست:</Text>
                  {submission.attachments.map((attachment) => (
                    <View key={attachment.id} style={styles.submissionAttachment}>
                      <Ionicons name="document-text" size={16} color={Colors.primary} />
                      <Text style={styles.submissionAttachmentName}>
                        {attachment.name}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              
              {submission.feedback && (
                <View style={styles.feedbackSection}>
                  <Text style={styles.feedbackLabel}>نظر استاد:</Text>
                  <View style={styles.feedbackCard}>
                    <Text style={styles.feedbackText}>{submission.feedback}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تحویل تکلیف</Text>
            {!showSubmissionForm ? (
              <TouchableOpacity
                style={styles.startSubmissionButton}
                onPress={() => setShowSubmissionForm(true)}
              >
                <Ionicons name="add-circle" size={24} color={Colors.primary} />
                <Text style={styles.startSubmissionText}>شروع تحویل تکلیف</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.submissionForm}>
                <Text style={styles.formLabel}>پاسخ خود را بنویسید (اختیاری)</Text>
                <TextInput
                  style={styles.answerInput}
                  placeholder="پاسخ متنی خود را اینجا بنویسید..."
                  placeholderTextColor={Colors.textSecondary}
                  value={answerText}
                  onChangeText={setAnswerText}
                  multiline
                  textAlignVertical="top"
                  numberOfLines={6}
                />
                
                <Text style={styles.formLabel}>افزودن فایل (حداکثر ۵ فایل)</Text>
                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  maxFiles={5}
                  maxSize={10}
                  existingFiles={files}
                  onRemoveFile={handleRemoveFile}
                />
                
                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowSubmissionForm(false)}
                    disabled={submitting}
                  >
                    <Text style={styles.cancelButtonText}>انصراف</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="send" size={18} color="#fff" />
                        <Text style={styles.submitButtonText}>تحویل تکلیف</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  courseInfo: {
    flex: 1,
    marginRight: 12,
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
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    minWidth: 80,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gradeValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  gradePercentage: {
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
  description: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 24,
  },
  instructionsCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 24,
  },
  attachmentsList: {
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  attachmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  submissionCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  submissionDate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gradeBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  answerSection: {
    marginBottom: 16,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  answerText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 24,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
  },
  submissionAttachments: {
    marginBottom: 16,
  },
  attachmentsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  submissionAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  submissionAttachmentName: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  feedbackSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  feedbackCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  feedbackText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 24,
  },
  startSubmissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: 12,
  },
  startSubmissionText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  submissionForm: {
    gap: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  answerInput: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
    color: Colors.text,
    textAlignVertical: 'top',
    minHeight: 120,
    textAlign: 'right',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    color: Colors.danger,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});