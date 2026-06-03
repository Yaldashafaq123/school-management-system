import { Header } from '@/components/Header';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Term = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
};

type SubjectGrade = {
  id: number;
  subject: string;
  teacher: string;
  firstExam?: number | null;
  secondExam?: number | null;
  finalExam?: number | null;
  homework?: number | null;
  project?: number | null;
  participation?: number | null;
  total: number;
  average: number;
  rank: number;
  status: 'pass' | 'fail' | 'conditional';
};

type TermGrades = {
  term: Term;
  subjects: SubjectGrade[];
  overallAverage: number;
  classRank: number;
  totalStudents: number;
  attendanceRate: number;
};

export default function GradesScreen() {
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState<number | null>(null);

  // Mock data
  const terms: Term[] = [
    { id: 1, name: 'ترم اول', startDate: '۱۴۰۳/۰۷/۰۱', endDate: '۱۴۰۳/۱۰/۳۰', isCurrent: false },
    { id: 2, name: 'ترم دوم', startDate: '۱۴۰۳/۱۱/۰۱', endDate: '۱۴۰۴/۰۳/۳۱', isCurrent: true },
  ];

  const termGrades: Record<number, TermGrades> = {
    1: {
      term: terms[0],
      subjects: [
        {
          id: 1,
          subject: 'ریاضی',
          teacher: 'آقای احمدی',
          firstExam: 18,
          secondExam: 17,
          finalExam: 19,
          homework: 20,
          project: 18,
          total: 92,
          average: 18.4,
          rank: 3,
          status: 'pass',
        },
        {
          id: 2,
          subject: 'علوم تجربی',
          teacher: 'خانم رحیمی',
          firstExam: 16,
          secondExam: 15,
          finalExam: 17,
          homework: 18,
          project: 16,
          total: 82,
          average: 16.4,
          rank: 7,
          status: 'pass',
        },
        {
          id: 3,
          subject: 'ادبیات فارسی',
          teacher: 'آقای کریمی',
          firstExam: 14,
          secondExam: 13,
          finalExam: 15,
          homework: 16,
          project: 14,
          total: 72,
          average: 14.4,
          rank: 15,
          status: 'conditional',
        },
        {
          id: 4,
          subject: 'زبان انگلیسی',
          teacher: 'خانم محمدی',
          firstExam: 19,
          secondExam: 18,
          finalExam: 20,
          homework: 19,
          project: 20,
          total: 96,
          average: 19.2,
          rank: 1,
          status: 'pass',
        },
        {
          id: 5,
          subject: 'مطالعات اجتماعی',
          teacher: 'آقای حسینی',
          firstExam: 17,
          secondExam: 16,
          finalExam: 18,
          homework: 17,
          project: 16,
          total: 84,
          average: 16.8,
          rank: 5,
          status: 'pass',
        },
      ],
      overallAverage: 17.04,
      classRank: 4,
      totalStudents: 30,
      attendanceRate: 95,
    },
    2: {
      term: terms[1],
      subjects: [
        {
          id: 1,
          subject: 'ریاضی',
          teacher: 'آقای احمدی',
          firstExam: 19,
          secondExam: 18,
          finalExam: null,
          homework: 19,
          project: 20,
          total: 76,
          average: 19,
          rank: 2,
          status: 'pass',
        },
        {
          id: 2,
          subject: 'فیزیک',
          teacher: 'آقای کریمی',
          firstExam: 17,
          secondExam: 16,
          finalExam: null,
          homework: 18,
          project: 17,
          total: 68,
          average: 17,
          rank: 8,
          status: 'pass',
        },
      ],
      overallAverage: 18,
      classRank: 3,
      totalStudents: 30,
      attendanceRate: 98,
    },
  };

  const currentGrades = termGrades[selectedTerm];

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: SubjectGrade['status']) => {
    switch (status) {
      case 'pass': return Colors.success;
      case 'conditional': return Colors.warning;
      case 'fail': return Colors.danger;
      default: return Colors.textSecondary;
    }
  };

  const getStatusText = (status: SubjectGrade['status']) => {
    switch (status) {
      case 'pass': return 'قبول';
      case 'conditional': return 'مشروط';
      case 'fail': return 'مردود';
      default: return '-';
    }
  };

  const getGradeColor = (grade: number | null | undefined) => {
    if (!grade && grade !== 0) return Colors.textSecondary;
    if (grade >= 17) return Colors.success;
    if (grade >= 14) return Colors.warning;
    return Colors.danger;
  };

  const getDisplayGrade = (grade: number | null | undefined) => {
    return grade !== null && grade !== undefined ? grade : '-';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="کارنامه"
        rightComponent={
          <TouchableOpacity>
            <Ionicons name="download-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Term Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.termSelector}
          contentContainerStyle={styles.termSelectorContent}
        >
          {terms.map((term) => (
            <TouchableOpacity
              key={term.id}
              style={[
                styles.termChip,
                selectedTerm === term.id && styles.termChipActive,
                term.isCurrent && styles.currentTerm,
              ]}
              onPress={() => setSelectedTerm(term.id)}
            >
              <Text style={[
                styles.termChipText,
                selectedTerm === term.id && styles.termChipTextActive,
              ]}>
                {term.name}
              </Text>
              {term.isCurrent && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>جاری</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Overall Stats */}
        <View style={styles.overallStats}>
          <View style={styles.overallStatCard}>
            <View style={styles.statHeader}>
              <Ionicons name="trophy" size={24} color={Colors.warning} />
              <Text style={styles.statTitle}>میانگین کل</Text>
            </View>
            <Text style={styles.overallAverage}>
              {currentGrades.overallAverage.toFixed(2)}
            </Text>
            <Text style={styles.statSubtitle}>از ۲۰</Text>
          </View>

          <View style={styles.overallStatCard}>
            <View style={styles.statHeader}>
              <Ionicons name="trending-up" size={24} color={Colors.success} />
              <Text style={styles.statTitle}>رتبه کلاسی</Text>
            </View>
            <Text style={styles.classRank}>{currentGrades.classRank}</Text>
            <Text style={styles.statSubtitle}>
              از {currentGrades.totalStudents} نفر
            </Text>
          </View>
        </View>

        {/* Term Dates */}
        <View style={styles.termDates}>
          <Text style={styles.termDatesTitle}>دوره آموزشی</Text>
          <View style={styles.datesRow}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>شروع</Text>
              <Text style={styles.dateValue}>{currentGrades.term.startDate}</Text>
            </View>
            <View style={styles.dateSeparator}>
              <Ionicons name="arrow-forward" size={16} color={Colors.textSecondary} />
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>پایان</Text>
              <Text style={styles.dateValue}>{currentGrades.term.endDate}</Text>
            </View>
          </View>
        </View>

        {/* Subjects List */}
        <View style={styles.subjectsContainer}>
          <Text style={styles.sectionTitle}>نمرات دروس</Text>
          
          {currentGrades.subjects.map((subject) => (
            <View key={subject.id} style={styles.subjectCard}>
              <TouchableOpacity
                style={styles.subjectHeader}
                onPress={() => setShowDetails(showDetails === subject.id ? null : subject.id)}
              >
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectName}>{subject.subject}</Text>
                  <Text style={styles.subjectTeacher}>{subject.teacher}</Text>
                </View>
                
                <View style={styles.subjectSummary}>
                  <View style={styles.gradeContainer}>
                    <Text style={[
                      styles.gradeValue,
                      { color: getGradeColor(subject.average) }
                    ]}>
                      {subject.average.toFixed(1)}
                    </Text>
                    <Text style={styles.gradeLabel}>میانگین</Text>
                  </View>
                  
                  <View style={styles.rankContainer}>
                    <Ionicons name="stats-chart" size={16} color={Colors.textSecondary} />
                    <Text style={styles.rankValue}>{subject.rank}</Text>
                  </View>
                  
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(subject.status)}20` }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(subject.status) }
                    ]}>
                      {getStatusText(subject.status)}
                    </Text>
                  </View>
                  
                  <Ionicons
                    name={showDetails === subject.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>

              {showDetails === subject.id && (
                <View style={styles.detailsContainer}>
                  <View style={styles.gradesGrid}>
                    <View style={styles.gradeItem}>
                      <Text style={styles.gradeItemLabel}>آزمون اول</Text>
                      <Text style={[
                        styles.gradeItemValue,
                        { color: getGradeColor(subject.firstExam) }
                      ]}>
                        {getDisplayGrade(subject.firstExam)}
                      </Text>
                    </View>
                    <View style={styles.gradeItem}>
                      <Text style={styles.gradeItemLabel}>آزمون دوم</Text>
                      <Text style={[
                        styles.gradeItemValue,
                        { color: getGradeColor(subject.secondExam) }
                      ]}>
                        {getDisplayGrade(subject.secondExam)}
                      </Text>
                    </View>
                    <View style={styles.gradeItem}>
                      <Text style={styles.gradeItemLabel}>آزمون پایانی</Text>
                      <Text style={[
                        styles.gradeItemValue,
                        { color: getGradeColor(subject.finalExam) }
                      ]}>
                        {getDisplayGrade(subject.finalExam)}
                      </Text>
                    </View>
                    <View style={styles.gradeItem}>
                      <Text style={styles.gradeItemLabel}>تکالیف</Text>
                      <Text style={[
                        styles.gradeItemValue,
                        { color: getGradeColor(subject.homework) }
                      ]}>
                        {getDisplayGrade(subject.homework)}
                      </Text>
                    </View>
                    <View style={styles.gradeItem}>
                      <Text style={styles.gradeItemLabel}>پروژه</Text>
                      <Text style={[
                        styles.gradeItemValue,
                        { color: getGradeColor(subject.project) }
                      ]}>
                        {getDisplayGrade(subject.project)}
                      </Text>
                    </View>
                    <View style={styles.gradeItem}>
                      <Text style={styles.gradeItemLabel}>مجموع</Text>
                      <Text style={[
                        styles.gradeItemValue,
                        { color: getGradeColor(subject.average) }
                      ]}>
                        {subject.total}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressLabel}>پیشرفت نسبت به ترم قبل:</Text>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${(subject.average / 20) * 100}%`,
                            backgroundColor: getGradeColor(subject.average),
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.progressValue}>
                      {subject.average.toFixed(1)} از ۲۰
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Performance Summary */}
        <View style={styles.performanceContainer}>
          <Text style={styles.sectionTitle}>خلاصه عملکرد</Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.performanceValue}>
                {currentGrades.subjects.filter(s => s.status === 'pass').length}
              </Text>
              <Text style={styles.performanceLabel}>دروس قبول</Text>
            </View>
            <View style={styles.performanceItem}>
              <Ionicons name="alert-circle" size={20} color={Colors.warning} />
              <Text style={styles.performanceValue}>
                {currentGrades.subjects.filter(s => s.status === 'conditional').length}
              </Text>
              <Text style={styles.performanceLabel}>مشروط</Text>
            </View>
            <View style={styles.performanceItem}>
              <Ionicons name="time" size={20} color={Colors.info} />
              <Text style={styles.performanceValue}>
                {currentGrades.attendanceRate}%
              </Text>
              <Text style={styles.performanceLabel}>حضور</Text>
            </View>
            <View style={styles.performanceItem}>
              <Ionicons name="trending-up" size={20} color={Colors.primary} />
              <Text style={styles.performanceValue}>
                {currentGrades.classRank}
              </Text>
              <Text style={styles.performanceLabel}>رتبه</Text>
            </View>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>راهنمای رنگ‌ها:</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.legendText}>۱۷ تا ۲۰ (عالی)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.warning }]} />
              <Text style={styles.legendText}>۱۴ تا ۱۷ (متوسط)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.danger }]} />
              <Text style={styles.legendText}>زیر ۱۴ (نیاز به تلاش)</Text>
            </View>
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
  content: {
    flex: 1,
  },
  termSelector: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  termSelectorContent: {
    gap: 8,
  },
  termChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    position: 'relative',
  },
  termChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  currentTerm: {
    borderColor: Colors.warning,
  },
  termChipText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  termChipTextActive: {
    color: '#fff',
  },
  currentBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  overallStats: {
    flexDirection: 'row',
    margin: 16,
    gap: 12,
  },
  overallStatCard: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  overallAverage: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  classRank: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  termDates: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  termDatesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateItem: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  dateSeparator: {
    paddingHorizontal: 12,
  },
  subjectsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  subjectCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subjectTeacher: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  subjectSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gradeContainer: {
    alignItems: 'center',
  },
  gradeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  gradeLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  gradesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  gradeItem: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gradeItemLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  gradeItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressValue: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  performanceContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  performanceItem: {
    width: '22%',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginVertical: 8,
  },
  performanceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  legendContainer: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  legendItems: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text,
  },
});