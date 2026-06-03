// app/exam/[id]/take.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Header } from '@/components/Header';
import { ExamTimer } from '@/components/ExamTimer';
import { ExamQuestionComponent } from '@/components/ExamQuestion';
import { Exam, ExamQuestion, ExamAttempt, ExamAnswer  } from '@/types';

// Mock data - Replace with API calls
const mockExam: Exam = {
  id: 1,
  course_id: 1,
  course_name: 'ریاضی پایه هفتم',
  title: 'آزمون میان ترم ریاضی',
  description: 'آزمون میان ترم فصل‌های ۱ تا ۳ کتاب ریاضی هفتم',
  instructions: `# دستورالعمل آزمون
## قوانین آزمون:
۱. مدت زمان آزمون ۴۵ دقیقه است.
۲. پس از اتمام زمان، آزمون به صورت خودکار تحویل داده می‌شود.
۳. امکان بازگشت به سوالات قبلی وجود دارد.
۴. سوالات ضروری باید پاسخ داده شوند.
۵. در صورت خروج از آزمون، زمان متوقف نمی‌شود.

## نکات مهم:
- دقت کنید که اینترنت شما قطع نشود.
- در محیطی آرام آزمون دهید.
- از تقلب خودداری کنید.`,
  duration_minutes: 45,
  max_score: 100,
  passing_score: 50,
  start_date: '2024-11-01T00:00:00',
  end_date: '2024-12-31T23:59:59',
  is_active: true,
  is_published: true,
  question_count: 10,
  created_at: '2024-10-15',
  updated_at: '2024-10-15',
  attempts_allowed: 3,
  show_results: true,
  shuffle_questions: true,
  shuffle_options: true,
  questions: [
    {
      id: 1,
      exam_id: 1,
      question: 'حاصل جمع ۱۵ و ۲۷ چیست؟',
      type: 'multiple_choice',
      points: 10,
      order_no: 1,
      is_required: true,
      options: [
        { id: 1, question_id: 1, text: '۳۲', is_correct: false, order_no: 1 },
        { id: 2, question_id: 1, text: '۴۲', is_correct: true, order_no: 2 },
        { id: 3, question_id: 1, text: '۵۲', is_correct: false, order_no: 3 },
        { id: 4, question_id: 1, text: '۶۲', is_correct: false, order_no: 4 },
      ],
      explanation: '۱۵ + ۲۷ = ۴۲',
    },
    {
      id: 2,
      exam_id: 1,
      question: 'اعداد طبیعی از صفر شروع می‌شوند.',
      type: 'true_false',
      points: 10,
      order_no: 2,
      is_required: true,
      options: [
        { id: 5, question_id: 2, text: 'درست', is_correct: false, order_no: 1 },
        { id: 6, question_id: 2, text: 'غلط', is_correct: true, order_no: 2 },
      ],
      explanation: 'اعداد طبیعی از ۱ شروع می‌شوند، صفر جزء اعداد طبیعی نیست.',
    },
    {
      id: 3,
      exam_id: 1,
      question: 'به عددی که تنها دو مقسوم‌علیه داشته باشد چه می‌گوییم؟',
      type: 'short_answer',
      points: 15,
      order_no: 3,
      is_required: true,
      correct_answer: 'عدد اول',
    },
    {
      id: 4,
      exam_id: 1,
      question: 'مزایای استفاده از کسرها در ریاضی را توضیح دهید.',
      type: 'essay',
      points: 25,
      order_no: 4,
      is_required: true,
    },
    {
      id: 5,
      exam_id: 1,
      question: 'کدام یک از اعداد زیر اول است؟',
      type: 'multiple_choice',
      points: 10,
      order_no: 5,
      is_required: false,
      options: [
        { id: 7, question_id: 5, text: '۹', is_correct: false, order_no: 1 },
        { id: 8, question_id: 5, text: '۱۵', is_correct: false, order_no: 2 },
        { id: 9, question_id: 5, text: '۱۷', is_correct: true, order_no: 3 },
        { id: 10, question_id: 5, text: '۲۱', is_correct: false, order_no: 4 },
      ],
      explanation: '۱۷ تنها بر ۱ و خودش بخش‌پذیر است.',
    },
  ],
};

export default function ExamTakingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Partial<ExamAnswer>>>({});
  const [showInstructions, setShowInstructions] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [examStarted, setExamStarted] = useState(false);

  useEffect(() => {
    loadExam();
  }, [id]);

  const loadExam = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setExam(mockExam);
      
      // Initialize answers
      const initialAnswers: Record<number, Partial<ExamAnswer>> = {};
      mockExam.questions?.forEach(q => {
        initialAnswers[q.id] = {};
      });
      setAnswers(initialAnswers);
    } catch (error) {
      Alert.alert('خطا', 'بارگذاری آزمون ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = () => {
    setExamStarted(true);
    setShowInstructions(false);
  };

  const handleAnswerChange = (questionId: number, answer: Partial<ExamAnswer>) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], ...answer },
    }));
  };

  const handleNextQuestion = () => {
    if (exam?.questions && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleTimeUp = () => {
    setTimeUp(true);
    Alert.alert(
      'اتمام زمان',
      'زمان آزمون به پایان رسید. پاسخ‌های شما ذخیره و تحویل داده می‌شود.',
      [{ text: 'باشه', onPress: submitExam }]
    );
  };

  const handleHalfTime = () => {
    Alert.alert('نیمه زمان', 'نیمی از زمان آزمون گذشته است.');
  };

  const handleLastMinutes = (minutes: number) => {
    if (minutes === 1) {
      Alert.alert('اخطار', 'فقط ۱ دقیقه تا پایان آزمون باقی مانده است!');
    }
  };

  const submitExam = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call to submit exam
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to results
      router.push(`./exam/${id}/result?attempt=${Date.now()}`);
    } catch (error) {
      Alert.alert('خطا', 'خطا در تحویل آزمون');
      setIsSubmitting(false);
    }
  };

  const handleSubmitConfirm = () => {
    // Check required questions
    const unansweredRequired = exam?.questions?.filter(
      q => q.is_required && !answers[q.id]?.answer_text && !answers[q.id]?.selected_option_id
    ) || [];

    if (unansweredRequired.length > 0) {
      Alert.alert(
        'سوالات اجباری',
        `${unansweredRequired.length} سوال اجباری پاسخ داده نشده است. آیا مطمئن هستید که می‌خواهید ادامه دهید؟`,
        [
          { text: 'لغو', style: 'cancel' },
          { 
            text: 'ادامه', 
            style: 'destructive',
            onPress: () => {
              setShowSubmitModal(true);
            }
          },
        ]
      );
    } else {
      setShowSubmitModal(true);
    }
  };

  const getAnsweredCount = () => {
    if (!exam?.questions) return 0;
    return exam.questions.filter(
      q => answers[q.id]?.answer_text || answers[q.id]?.selected_option_id
    ).length;
  };

  const getRequiredAnsweredCount = () => {
    if (!exam?.questions) return 0;
    const requiredQuestions = exam.questions.filter(q => q.is_required);
    return requiredQuestions.filter(
      q => answers[q.id]?.answer_text || answers[q.id]?.selected_option_id
    ).length;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!exam) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="آزمون" showBack onBackPress={() => router.back()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={Colors.danger} />
          <Text style={styles.errorText}>آزمون یافت نشد</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showInstructions && !examStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="دستورالعمل آزمون" showBack onBackPress={() => router.back()} />
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.instructionsContainer}>
            <Text style={styles.examTitle}>{exam.title}</Text>
            <Text style={styles.courseName}>{exam.course_name}</Text>
            
            <View style={styles.examInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={20} color={Colors.primary} />
                <Text style={styles.infoText}>{exam.duration_minutes} دقیقه</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="document-text" size={20} color={Colors.primary} />
                <Text style={styles.infoText}>{exam.question_count} سوال</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="trophy" size={20} color={Colors.primary} />
                <Text style={styles.infoText}>{exam.max_score} نمره</Text>
              </View>
            </View>

            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>دستورالعمل‌ها</Text>
              <Text style={styles.instructionsText}>{exam.instructions}</Text>
            </View>

            <View style={styles.warningCard}>
              <Ionicons name="warning" size={24} color={Colors.warning} />
              <Text style={styles.warningText}>
                پس از شروع آزمون، زمان متوقف نمی‌شود. مطمئن شوید که آماده هستید.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.startButtonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartExam}
          >
            <Ionicons name="play" size={24} color="#fff" />
            <Text style={styles.startButtonText}>شروع آزمون</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = exam.questions?.[currentQuestionIndex];
  const answeredCount = getAnsweredCount();
  const requiredAnsweredCount = getRequiredAnsweredCount();
  const totalRequired = exam.questions?.filter(q => q.is_required).length || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="آزمون"
        showBack
        onBackPress={() => {
          Alert.alert(
            'خروج از آزمون',
            'در صورت خروج، زمان آزمون متوقف نمی‌شود. آیا مطمئن هستید؟',
            [
              { text: 'لغو', style: 'cancel' },
              { 
                text: 'خروج', 
                style: 'destructive',
                onPress: () => router.back()
              },
            ]
          );
        }}
      />

      {/* Timer */}
      <ExamTimer
        durationMinutes={exam.duration_minutes}
        onTimeUp={handleTimeUp}
        onHalfTime={handleHalfTime}
        onLastMinutes={handleLastMinutes}
        isPaused={!examStarted || timeUp}
      />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${((currentQuestionIndex + 1) / (exam.question_count || 1)) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentQuestionIndex + 1}/{exam.question_count}
        </Text>
      </View>

      {/* Question Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.questionNav}
        contentContainerStyle={styles.questionNavContent}
      >
        {exam.questions?.map((q, index) => {
          const isAnswered = answers[q.id]?.answer_text || answers[q.id]?.selected_option_id;
          const isCurrent = index === currentQuestionIndex;
          const isRequired = q.is_required;
          
          return (
            <TouchableOpacity
              key={q.id}
              style={[
                styles.questionNavItem,
                isCurrent && styles.questionNavItemCurrent,
                isAnswered && styles.questionNavItemAnswered,
                isRequired && !isAnswered && styles.questionNavItemRequired,
              ]}
              onPress={() => setCurrentQuestionIndex(index)}
            >
              <Text style={[
                styles.questionNavText,
                isCurrent && styles.questionNavTextCurrent,
                isAnswered && styles.questionNavTextAnswered,
              ]}>
                {index + 1}
              </Text>
              {isRequired && !isAnswered && (
                <View style={styles.requiredDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Current Question */}
      {currentQuestion && (
        <ExamQuestionComponent
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={exam.question_count || 0}
          answer={answers[currentQuestion.id] as ExamAnswer}
          onAnswerChange={handleAnswerChange}
        />
      )}

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons 
            name="chevron-back" 
            size={24} 
            color={currentQuestionIndex === 0 ? Colors.textSecondary : Colors.primary} 
          />
          <Text style={[
            styles.navButtonText,
            currentQuestionIndex === 0 && styles.navButtonTextDisabled
          ]}>
            قبلی
          </Text>
        </TouchableOpacity>

        <View style={styles.answeredInfo}>
          <Text style={styles.answeredText}>
            {answeredCount}/{exam.question_count} پاسخ داده شده
          </Text>
          {totalRequired > 0 && (
            <Text style={styles.requiredText}>
              {requiredAnsweredCount}/{totalRequired} اجباری
            </Text>
          )}
        </View>

        {currentQuestionIndex === (exam.question_count || 1) - 1 ? (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>تحویل آزمون</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNextQuestion}
          >
            <Text style={styles.navButtonText}>بعدی</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Submit Confirmation Modal */}
      <Modal
        visible={showSubmitModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="help-circle" size={48} color={Colors.warning} />
            <Text style={styles.modalTitle}>تحویل آزمون</Text>
            <Text style={styles.modalText}>
              آیا مطمئن هستید که می‌خواهید آزمون را تحویل دهید؟
              پس از تحویل، امکان ویرایش پاسخ‌ها وجود نخواهد داشت.
            </Text>
            
            <View style={styles.modalStats}>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatValue}>{answeredCount}</Text>
                <Text style={styles.modalStatLabel}>پاسخ داده شده</Text>
              </View>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatValue}>{exam.question_count - answeredCount}</Text>
                <Text style={styles.modalStatLabel}>بدون پاسخ</Text>
              </View>
              <View style={styles.modalStat}>
                <Text style={styles.modalStatValue}>{exam.question_count}</Text>
                <Text style={styles.modalStatLabel}>کل سوالات</Text>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.modalCancelText}>بازگشت</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalSubmitButton, isSubmitting && styles.modalSubmitButtonDisabled]}
                onPress={submitExam}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalSubmitText}>تحویل نهایی</Text>
                )}
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
  instructionsContainer: {
    padding: 20,
  },
  examTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  courseName: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  examInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  infoItem: {
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  instructionsCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'right',
  },
  instructionsText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 26,
    textAlign: 'right',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    textAlign: 'right',
  },
  startButtonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 16,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    minWidth: 40,
  },
  questionNav: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  questionNavContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  questionNavItem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  questionNavItemCurrent: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  questionNavItemAnswered: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  questionNavItemRequired: {
    borderColor: Colors.danger,
  },
  questionNavText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  questionNavTextCurrent: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  questionNavTextAnswered: {
    color: Colors.success,
  },
  requiredDot: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  navButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  answeredInfo: {
    alignItems: 'center',
  },
  answeredText: {
    fontSize: 12,
    color: Colors.text,
    marginBottom: 2,
  },
  requiredText: {
    fontSize: 10,
    color: Colors.danger,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  modalStat: {
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  modalSubmitButtonDisabled: {
    opacity: 0.7,
  },
  modalSubmitText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
});