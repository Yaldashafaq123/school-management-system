import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define TypeScript interfaces
interface Student {
  id: string;
  name: string;
  rollNumber: string;
  grade: string;
  score: string;
  maxScore: string;
}

interface GradeScaleItem {
  value: string;
  label: string;
}

type GradingMode = 'bulk' | 'individual';

const studentsData: Student[] = [
  { id: '1', name: 'علی رضایی', rollNumber: 'S001', grade: 'A', score: '95', maxScore: '100' },
  { id: '2', name: 'سارا محمدی', rollNumber: 'S002', grade: 'B+', score: '88', maxScore: '100' },
  { id: '3', name: 'محمد حسن', rollNumber: 'S003', grade: 'A-', score: '92', maxScore: '100' },
  { id: '4', name: 'فاطمه کریمی', rollNumber: 'S004', grade: 'B', score: '85', maxScore: '100' },
  { id: '5', name: 'رضا احمدی', rollNumber: 'S005', grade: 'A-', score: '90', maxScore: '100' },
];

const GRADE_SCALE: GradeScaleItem[] = [
  { value: 'A', label: 'A (۹۰-۱۰۰)' },
  { value: 'B+', label: 'B+ (۸۵-۸۹)' },
  { value: 'B', label: 'B (۸۰-۸۴)' },
  { value: 'C+', label: 'C+ (۷۵-۷۹)' },
  { value: 'C', label: 'C (۷۰-۷۴)' },
  { value: 'D', label: 'D (۶۰-۶۹)' },
  { value: 'F', label: 'F (زیر ۶۰)' },
];

export default function GradeEntryPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>(studentsData);
  const [assignmentName, setAssignmentName] = useState('آزمون میان‌ترم');
  const [maxScore, setMaxScore] = useState('100');
  const [gradingMode, setGradingMode] = useState<GradingMode>('bulk'); // 'bulk' or 'individual'

  const updateStudentGrade = (id: string, field: keyof Student, value: string) => {
    setStudents(students.map(student => 
      student.id === id ? { ...student, [field]: value } : student
    ));
  };

  const calculateGradeFromScore = (score: string): string => {
    const numericScore = parseInt(score) || 0;
    if (numericScore >= 90) return 'A';
    if (numericScore >= 85) return 'B+';
    if (numericScore >= 80) return 'B';
    if (numericScore >= 75) return 'C+';
    if (numericScore >= 70) return 'C';
    if (numericScore >= 60) return 'D';
    return 'F';
  };

  const handleBulkGradeChange = (grade: string) => {
    setStudents(students.map(student => ({ ...student, grade })));
  };

  const handleSaveGrades = () => {
    Alert.alert(
      'ذخیره نمرات',
      'آیا مطمئن هستید که می‌خواهید نمرات را ذخیره کنید؟',
      [
        { text: 'لغو', style: 'cancel' },
        { 
          text: 'ذخیره', 
          onPress: () => {
            console.log('Grades saved:', students);
            router.back();
          }
        },
      ]
    );
  };

  // Calculate statistics safely
  const calculateStats = () => {
    const scores = students.map(s => parseInt(s.score) || 0);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const averageScore = students.length > 0 ? totalScore / students.length : 0;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passingCount = scores.filter(score => score >= 70).length;

    return { averageScore, highestScore, lowestScore, passingCount };
  };

  const stats = calculateStats();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ورود نمرات</Text>
        <TouchableOpacity onPress={handleSaveGrades} style={styles.saveButton}>
          <Text style={styles.saveText}>ذخیره</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Assignment Info */}
        <View style={styles.assignmentInfo}>
          <TextInput
            style={styles.assignmentName}
            value={assignmentName}
            onChangeText={setAssignmentName}
            placeholder="نام تکلیف"
            textAlign="right"
          />
          <View style={styles.assignmentMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>کلاس:</Text>
              <Text style={styles.metaValue}>ریاضی ۱۰۱</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>حداکثر نمره:</Text>
              <TextInput
                style={styles.scoreInput}
                value={maxScore}
                onChangeText={setMaxScore}
                keyboardType="numeric"
                textAlign="center"
              />
            </View>
          </View>
        </View>

        {/* Grading Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, gradingMode === 'bulk' && styles.modeButtonActive]}
            onPress={() => setGradingMode('bulk')}
          >
            <Text style={[styles.modeText, gradingMode === 'bulk' && styles.modeTextActive]}>
              نمره‌دهی گروهی
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, gradingMode === 'individual' && styles.modeButtonActive]}
            onPress={() => setGradingMode('individual')}
          >
            <Text style={[styles.modeText, gradingMode === 'individual' && styles.modeTextActive]}>
              نمره‌دهی فردی
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bulk Grading Controls */}
        {gradingMode === 'bulk' && (
          <View style={styles.bulkControls}>
            <Text style={styles.bulkTitle}>تعیین نمره برای همه دانش‌آموزان:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.gradeButtons}>
                {GRADE_SCALE.map((grade) => (
                  <TouchableOpacity
                    key={grade.value}
                    style={styles.gradeButton}
                    onPress={() => handleBulkGradeChange(grade.value)}
                  >
                    <Text style={styles.gradeButtonText}>{grade.value}</Text>
                    <Text style={styles.gradeButtonSubtext}>{grade.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Students List */}
        <View style={styles.studentsContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 2 }]}>دانش‌آموز</Text>
            <Text style={styles.headerCell}>نمره</Text>
            <Text style={styles.headerCell}>درجه</Text>
            <Text style={styles.headerCell}>عملیات</Text>
          </View>

          {students.map((student) => (
            <View key={student.id} style={styles.studentRow}>
              <View style={[styles.studentCell, { flex: 2 }]}>
                <View style={styles.studentInfo}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.avatarText}>{student.name.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentRoll}>{student.rollNumber}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.scoreCell}>
                <TextInput
                  style={styles.scoreInput}
                  value={student.score}
                  onChangeText={(value) => {
                    updateStudentGrade(student.id, 'score', value);
                    const grade = calculateGradeFromScore(value);
                    updateStudentGrade(student.id, 'grade', grade);
                  }}
                  keyboardType="numeric"
                  textAlign="center"
                />
                <Text style={styles.maxScore}>/ {maxScore}</Text>
              </View>

              <View style={styles.gradeCell}>
                <TouchableOpacity style={styles.gradeBadge}>
                  <Text style={styles.gradeText}>{student.grade}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.actionCell}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble-outline" size={18} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="attach-outline" size={18} color="#666" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>آمار کلاسی</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stats.averageScore.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>میانگین نمره</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stats.highestScore}
              </Text>
              <Text style={styles.statLabel}>بالاترین نمره</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stats.lowestScore}
              </Text>
              <Text style={styles.statLabel}>پایین‌ترین نمره</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {stats.passingCount}
              </Text>
              <Text style={styles.statLabel}>قبول‌شده</Text>
            </View>
          </View>
        </View>

        {/* Grade Distribution */}
        <View style={styles.distributionContainer}>
          <Text style={styles.distributionTitle}>توزیع نمرات</Text>
          <View style={styles.distributionBars}>
            {['A', 'B+', 'B', 'C+', 'C', 'D', 'F'].map((grade) => {
              const count = students.filter(s => s.grade === grade).length;
              const percentage = (count / students.length) * 100;
              return (
                <View key={grade} style={styles.distributionBar}>
                  <Text style={styles.barGrade}>{grade}</Text>
                  <View style={styles.barContainer}>
                    <View 
                      style={[
                        styles.barFill,
                        { width: `${percentage}%`, backgroundColor: getGradeColor(grade) }
                      ]} 
                    />
                  </View>
                  <Text style={styles.barCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    'A': '#4CAF50',
    'B+': '#8BC34A',
    'B': '#FFC107',
    'C+': '#FF9800',
    'C': '#FF5722',
    'D': '#F44336',
    'F': '#9E9E9E',
  };
  return colors[grade] || '#607D8B';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  assignmentInfo: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  assignmentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  assignmentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
  },
  scoreInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    color: '#333',
    minWidth: 50,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: '#2196F3',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  modeTextActive: {
    color: '#fff',
  },
  bulkControls: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bulkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'right',
  },
  gradeButtons: {
    flexDirection: 'row',
  },
  gradeButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    minWidth: 60,
  },
  gradeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  gradeButtonSubtext: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  studentsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  studentCell: {
    flex: 1,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
  },
  studentRoll: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'right',
  },
  scoreCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maxScore: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  gradeCell: {
    flex: 1,
    alignItems: 'center',
  },
  gradeBadge: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
    minWidth: 40,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  actionCell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    padding: 8,
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  distributionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  distributionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'right',
  },
  distributionBars: {
    marginBottom: 8,
  },
  distributionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  barGrade: {
    width: 30,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barCount: {
    width: 30,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
});