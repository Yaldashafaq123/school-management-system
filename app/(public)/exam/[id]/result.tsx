// app/exam/[id]/result.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Header } from '@/components/Header';
import { ExamQuestionComponent } from '@/components/ExamQuestion';
import { ExamResult } from '@/types';

// Mock data - Replace with API calls
const mockResult: ExamResult = {
  attempt_id: 1,
  exam_id: 1,
  student_id: 1,
  total_questions: 10,
  correct_answers: 8,
  wrong_answers: 1,
  unanswered: 1,
  score: 85,
  max_score: 100,
  percentage: 85,
  is_passed: true,
  time_spent_minutes: 38,
  submitted_at: '2024-12-01T14:30:00',
  detailed_results: [
    {
      question_id: 1,
      question_text: 'حاصل جمع ۱۵ و ۲۷ چیست؟',
      question_type: 'multiple_choice',
      your_answer: '۴۲',
      correct_answer: '۴۲',
      is_correct: true,
      points_earned: 10,
      max_points: 10,
      explanation: '۱۵ + ۲۷ = ۴۲',
    },
    {
      question_id: 2,
      question_text: 'اعداد طبیعی از صفر شروع می‌شوند.',
      question_type: 'true_false',
      your_answer: 'غلط',
      correct_answer: 'غلط',
      is_correct: true,
      points_earned: 10,
      max_points: 10,
      explanation: 'اعداد طبیعی از ۱ شروع می‌شوند، صفر جزء اعداد طبیعی نیست.',
    },
    {
      question_id: 3,
      question_text: 'به عددی که تنها دو مقسوم‌علیه داشته باشد چه می‌گوییم؟',
      question_type: 'short_answer',
      your_answer: 'عدد اول',
      correct_answer: 'عدد اول',
      is_correct: true,
      points_earned: 15,
      max_points: 15,
    },
    {
      question_id: 4,
      question_text: 'مزایای استفاده از کسرها در ریاضی را توضیح دهید.',
      question_type: 'essay',
      your_answer: 'کسرها امکان نمایش مقادیر غیرصحیح را فراهم می‌کنند.',
      is_correct: null,
      points_earned: 20,
      max_points: 25,
    },
    {
      question_id: 5,
      question_text: 'کدام یک از اعداد زیر اول است؟',
      question_type: 'multiple_choice',
      your_answer: '۱۵',
      correct_answer: '۱۷',
      is_correct: false,
      points_earned: 0,
      max_points: 10,
      explanation: '۱۷ تنها بر ۱ و خودش بخش‌پذیر است.',
    },
  ],
};

const mockExam = {
  id: 1,
  title: 'آزمون میان ترم ریاضی',
  course_name: 'ریاضی پایه هفتم',
  passing_score: 50,
};

export default function ExamResultsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'summary' | 'review'>('summary');
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  useEffect(() => {
    loadResult();
  }, [id]);

  const loadResult = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResult(mockResult);
    } catch (error) {
      console.error('Error loading result:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!result) return;

    try {
      await Share.share({
        message: `نتیجه آزمون ${mockExam.title}: ${result.percentage}%\nامتیاز: ${result.score}/${result.max_score}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const getPerformanceColor = () => {
    if (!result) return Colors.success;
    
    if (result.percentage >= 80) return Colors.success;
    if (result.percentage >= 60) return Colors.warning;
    if (result.percentage >= 50) return Colors.info;
    return Colors.danger;
  };

  const getPerformanceText = () => {
    if (!result) return 'عالی';
    
    if (result.percentage >= 80) return 'عالی';
    if (result.percentage >= 60) return 'خوب';
    if (result.percentage >= 50) return 'متوسط';
    return 'نیاز به تلاش بیشتر';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (!result) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="نتایج" showBack onBackPress={() => router.back()} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={Colors.danger} />
          <Text style={styles.errorText}>نتایج یافت نشد</Text>
        </View>
      </SafeAreaView>
    );
  }

  const performanceColor = getPerformanceColor();
  const performanceText = getPerformanceText();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="نتایج آزمون"
        showBack
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Result Header */}
        <LinearGradient
          colors={[performanceColor, `${performanceColor}DD`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.resultHeader}
        >
          <View style={styles.resultTitle}>
            <Text style={styles.courseName}>{mockExam.course_name}</Text>
            <Text style={styles.examTitle}>{mockExam.title}</Text>
          </View>
          
          <View style={styles.scoreContainer}>
            <View style={styles.percentageCircle}>
              <Text style={styles.percentageText}>{result.percentage}%</Text>
              <Text style={styles.performanceText}>{performanceText}</Text>
            </View>
            
            <View style={styles.scoreDetails}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>نمره شما:</Text>
                <Text style={styles.scoreValue}>{result.score}/{result.max_score}</Text>
              </View>
              
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>حداقل قبولی:</Text>
                <Text style={styles.scoreValue}>{mockExam.passing_score}%</Text>
              </View>
              
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>وضعیت:</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: result.is_passed ? `${Colors.success}30` : `${Colors.danger}30` }
                ]}>
                  <Ionicons 
                    name={result.is_passed ? 'checkmark-circle' : 'close-circle'} 
                    size={12} 
                    color={result.is_passed ? Colors.success : Colors.danger} 
                  />
                  <Text style={[
                    styles.statusText,
                    { color: result.is_passed ? Colors.success : Colors.danger }
                  ]}>
                    {result.is_passed ? 'قبول' : 'رد'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.submissionInfo}>
            <Ionicons name="time" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.submissionText}>
              {new Date(result.submitted_at).toLocaleDateString('fa-IR')} • {result.time_spent_minutes} دقیقه
            </Text>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'summary' && styles.activeTab]}
            onPress={() => setSelectedTab('summary')}
          >
            <Ionicons 
              name="stats-chart" 
              size={20} 
              color={selectedTab === 'summary' ? Colors.primary : Colors.textSecondary} 
            />
            <Text style={[styles.tabText, selectedTab === 'summary' && styles.activeTabText]}>
              خلاصه نتایج
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'review' && styles.activeTab]}
            onPress={() => setSelectedTab('review')}
          >
            <Ionicons 
              name="document-text" 
              size={20} 
              color={selectedTab === 'review' ? Colors.primary : Colors.textSecondary} 
            />
            <Text style={[styles.tabText, selectedTab === 'review' && styles.activeTabText]}>
              مرور پاسخ‌ها
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {selectedTab === 'summary' ? (
          <View style={styles.summaryContainer}>
            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${Colors.success}20` }]}>
                  <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                </View>
                <Text style={styles.statValue}>{result.correct_answers}</Text>
                <Text style={styles.statLabel}>پاسخ صحیح</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${Colors.danger}20` }]}>
                  <Ionicons name="close-circle" size={24} color={Colors.danger} />
                </View>
                <Text style={styles.statValue}>{result.wrong_answers}</Text>
                <Text style={styles.statLabel}>پاسخ غلط</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${Colors.textSecondary}20` }]}>
                  <Ionicons name="help-circle" size={24} color={Colors.textSecondary} />
                </View>
                <Text style={styles.statValue}>{result.unanswered}</Text>
                <Text style={styles.statLabel}>بدون پاسخ</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: `${Colors.warning}20` }]}>
                  <Ionicons name="time" size={24} color={Colors.warning} />
                </View>
                <Text style={styles.statValue}>{result.time_spent_minutes}</Text>
                <Text style={styles.statLabel}>دقیقه</Text>
              </View>
            </View>

            {/* Performance Breakdown */}
            <View style={styles.breakdownSection}>
              <Text style={styles.sectionTitle}>تحلیل عملکرد</Text>
              
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>درصد پاسخ صحیح:</Text>
                <View style={styles.breakdownBar}>
                  <View 
                    style={[
                      styles.breakdownFill,
                      { 
                        width: `${(result.correct_answers / result.total_questions) * 100}%`,
                        backgroundColor: Colors.success,
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.breakdownValue}>
                  {((result.correct_answers / result.total_questions) * 100).toFixed(1)}%
                </Text>
              </View>
              
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>درصد پاسخ غلط:</Text>
                <View style={styles.breakdownBar}>
                  <View 
                    style={[
                      styles.breakdownFill,
                      { 
                        width: `${(result.wrong_answers / result.total_questions) * 100}%`,
                        backgroundColor: Colors.danger,
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.breakdownValue}>
                  {((result.wrong_answers / result.total_questions) * 100).toFixed(1)}%
                </Text>
              </View>
              
              <View style={styles.breakdownItem}>
                <Text style={styles.breakdownLabel}>نسبت پاسخ‌ها:</Text>
                <View style={styles.ratioContainer}>
                  <View style={[styles.ratioSegment, { flex: result.correct_answers, backgroundColor: Colors.success }]} />
                  <View style={[styles.ratioSegment, { flex: result.wrong_answers, backgroundColor: Colors.danger }]} />
                  <View style={[styles.ratioSegment, { flex: result.unanswered, backgroundColor: Colors.textSecondary }]} />
                </View>
                <Text style={styles.breakdownValue}>
                  {result.correct_answers}:{result.wrong_answers}:{result.unanswered}
                </Text>
              </View>
            </View>

            {/* Recommendations */}
            <View style={styles.recommendationsSection}>
              <Text style={styles.sectionTitle}>توصیه‌ها</Text>
              <View style={styles.recommendationsCard}>
                {result.percentage >= 80 ? (
                  <>
                    <Ionicons name="trophy" size={24} color={Colors.warning} />
                    <Text style={styles.recommendationText}>
                      عملکرد عالی! شما تسلط خوبی بر مباحث آزمون دارید.
                    </Text>
                  </>
                ) : result.percentage >= 60 ? (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                    <Text style={styles.recommendationText}>
                      خوب بود! روی سوالات اشتباه بیشتر تمرین کنید.
                    </Text>
                  </>
                ) : result.is_passed ? (
                  <>
                    <Ionicons name="warning" size={24} color={Colors.warning} />
                    <Text style={styles.recommendationText}>
                      قبول شدید، اما نیاز به مطالعه بیشتر دارید.
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="alert-circle" size={24} color={Colors.danger} />
                    <Text style={styles.recommendationText}>
                      نیاز به تلاش بیشتر دارید. مباحث را دوباره مرور کنید.
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.reviewContainer}>
            {/* Review Navigation */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.reviewNav}
              contentContainerStyle={styles.reviewNavContent}
            >
              {result.detailed_results.map((item, index) => (
                <TouchableOpacity
                  key={item.question_id}
                  style={[
                    styles.reviewNavItem,
                    currentReviewIndex === index && styles.reviewNavItemActive,
                    item.is_correct === true && styles.reviewNavItemCorrect,
                    item.is_correct === false && styles.reviewNavItemIncorrect,
                    item.is_correct === null && styles.reviewNavItemUnknown,
                  ]}
                  onPress={() => setCurrentReviewIndex(index)}
                >
                  <Text style={[
                    styles.reviewNavText,
                    currentReviewIndex === index && styles.reviewNavTextActive,
                  ]}>
                    {index + 1}
                  </Text>
                  <Text style={styles.reviewNavPoints}>
                    {item.points_earned}/{item.max_points}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Current Review Question */}
            {result.detailed_results[currentReviewIndex] && (
              <View style={styles.reviewQuestion}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>
                    سوال {currentReviewIndex + 1} از {result.detailed_results.length}
                  </Text>
                  <View style={[
                    styles.resultBadge,
                    result.detailed_results[currentReviewIndex].is_correct === true && { backgroundColor: `${Colors.success}20` },
                    result.detailed_results[currentReviewIndex].is_correct === false && { backgroundColor: `${Colors.danger}20` },
                    result.detailed_results[currentReviewIndex].is_correct === null && { backgroundColor: `${Colors.warning}20` },
                  ]}>
                    <Ionicons 
                      name={
                        result.detailed_results[currentReviewIndex].is_correct === true ? 'checkmark-circle' :
                        result.detailed_results[currentReviewIndex].is_correct === false ? 'close-circle' :
                        'time'
                      }
                      size={16}
                      color={
                        result.detailed_results[currentReviewIndex].is_correct === true ? Colors.success :
                        result.detailed_results[currentReviewIndex].is_correct === false ? Colors.danger :
                        Colors.warning
                      }
                    />
                    <Text style={[
                      styles.resultBadgeText,
                      result.detailed_results[currentReviewIndex].is_correct === true && { color: Colors.success },
                      result.detailed_results[currentReviewIndex].is_correct === false && { color: Colors.danger },
                      result.detailed_results[currentReviewIndex].is_correct === null && { color: Colors.warning },
                    ]}>
                      {result.detailed_results[currentReviewIndex].points_earned}/{result.detailed_results[currentReviewIndex].max_points} نمره
                    </Text>
                  </View>
                </View>

                <View style={styles.questionCard}>
                  <Text style={styles.questionText}>
                    {result.detailed_results[currentReviewIndex].question_text}
                  </Text>
                  
                  {/* User Answer */}
                  {result.detailed_results[currentReviewIndex].your_answer && (
                    <View style={styles.answerSection}>
                      <Text style={styles.answerLabel}>پاسخ شما:</Text>
                      <View style={[
                        styles.answerCard,
                        result.detailed_results[currentReviewIndex].is_correct === true && styles.answerCardCorrect,
                        result.detailed_results[currentReviewIndex].is_correct === false && styles.answerCardIncorrect,
                      ]}>
                        <Text style={styles.answerText}>
                          {result.detailed_results[currentReviewIndex].your_answer}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Correct Answer (if wrong) */}
                  {result.detailed_results[currentReviewIndex].is_correct === false && 
                   result.detailed_results[currentReviewIndex].correct_answer && (
                    <View style={styles.answerSection}>
                      <Text style={styles.correctAnswerLabel}>پاسخ صحیح:</Text>
                      <View style={styles.correctAnswerCard}>
                        <Text style={styles.correctAnswerText}>
                          {result.detailed_results[currentReviewIndex].correct_answer}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Explanation */}
                  {result.detailed_results[currentReviewIndex].explanation && (
                    <View style={styles.explanationSection}>
                      <Text style={styles.explanationLabel}>توضیح:</Text>
                      <Text style={styles.explanationText}>
                        {result.detailed_results[currentReviewIndex].explanation}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.retakeButton}
          onPress={() => router.push(`./exam/${id}/take`)}
        >
          <Ionicons name="refresh" size={20} color={Colors.primary} />
          <Text style={styles.retakeButtonText}>آزمون مجدد</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('./exams')}
        >
          <Text style={styles.backButtonText}>بازگشت به آزمون‌ها</Text>
        </TouchableOpacity>
      </View>
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
  resultHeader: {
    padding: 24,
  },
  resultTitle: {
    alignItems: 'center',
    marginBottom: 24,
  },
  courseName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  examTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  percentageCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  percentageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  performanceText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  scoreDetails: {
    flex: 1,
    marginRight: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  submissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  submissionText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
  },
  summaryContainer: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
  breakdownSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    color: Colors.text,
    width: 100,
  },
  breakdownBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    width: 50,
  },
  ratioContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratioSegment: {
    height: '100%',
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  recommendationsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  reviewContainer: {
    flex: 1,
  },
  reviewNav: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  reviewNavContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  reviewNavItem: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  reviewNavItemActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  reviewNavItemCorrect: {
    borderColor: Colors.success,
  },
  reviewNavItemIncorrect: {
    borderColor: Colors.danger,
  },
  reviewNavItemUnknown: {
    borderColor: Colors.warning,
  },
  reviewNavText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  reviewNavTextActive: {
    color: Colors.primary,
  },
  reviewNavPoints: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reviewQuestion: {
    padding: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  resultBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  questionCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 28,
    marginBottom: 24,
    textAlign: 'right',
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
  answerCard: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  answerCardCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: Colors.success,
  },
  answerCardIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: Colors.danger,
  },
  answerText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    textAlign: 'right',
  },
  correctAnswerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
    marginBottom: 8,
  },
  correctAnswerCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  correctAnswerText: {
    fontSize: 14,
    color: Colors.success,
    lineHeight: 22,
    textAlign: 'right',
    fontWeight: '500',
  },
  explanationSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  explanationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warning,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
    textAlign: 'right',
  },
  actionButtons: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
    flexDirection: 'row',
    gap: 12,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  retakeButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  backButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
});