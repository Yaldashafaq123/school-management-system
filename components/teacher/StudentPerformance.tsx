// components/teacher/StudentPerformance.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { StudentPerformance as StudentPerformanceType } from '../../types';

interface StudentPerformanceProps {
  students: StudentPerformanceType[];
  onStudentPress?: (studentId: number) => void;
  onViewAll?: () => void;
}

export const StudentPerformance: React.FC<StudentPerformanceProps> = ({
  students,
  onStudentPress,
  onViewAll,
}) => {
  const getGradeColor = (grade: number) => {
    if (grade >= 18) return Colors.success;
    if (grade >= 14) return Colors.warning;
    return Colors.danger;
  };

  const getGradeText = (grade: number) => {
    if (grade >= 18) return 'عالی';
    if (grade >= 14) return 'خوب';
    if (grade >= 10) return 'متوسط';
    return 'نیاز به تلاش';
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 0) return 'امروز';
    if (diffDays === 1) return 'دیروز';
    if (diffDays < 7) return `${diffDays} روز پیش`;
    return date.toLocaleDateString('fa-IR');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>عملکرد دانش‌آموزان</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAllText}>مشاهده همه</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {students.map((student) => (
          <TouchableOpacity
            key={student.student_id}
            style={styles.studentCard}
            onPress={() => onStudentPress?.(student.student_id)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {student.student_name.charAt(0)}
              </Text>
            </View>

            <Text style={styles.studentName} numberOfLines={2}>
              {student.student_name}
            </Text>

            <View style={styles.performanceStats}>
              <View style={styles.statRow}>
                <Ionicons name="school" size={14} color={Colors.textSecondary} />
                <Text style={styles.statValue}>{student.enrolled_courses}</Text>
                <Text style={styles.statLabel}>دوره</Text>
              </View>

              <View style={styles.statRow}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.textSecondary} />
                <Text style={styles.statValue}>{student.completed_courses}</Text>
                <Text style={styles.statLabel}>تکمیل</Text>
              </View>
            </View>

            <View style={styles.gradeContainer}>
              <Text style={[
                styles.gradeValue,
                { color: getGradeColor(student.avg_grade) }
              ]}>
                {student.avg_grade.toFixed(1)}
              </Text>
              <Text style={styles.gradeLabel}>میانگین</Text>
              <Text style={[
                styles.gradeText,
                { color: getGradeColor(student.avg_grade) }
              ]}>
                {getGradeText(student.avg_grade)}
              </Text>
            </View>

            <View style={styles.lastActive}>
              <Ionicons name="time" size={12} color={Colors.textSecondary} />
              <Text style={styles.lastActiveText}>
                {formatLastActive(student.last_active)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  studentCard: {
    width: 160,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
    height: 40,
  },
  performanceStats: {
    width: '100%',
    gap: 8,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  gradeContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  gradeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gradeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  lastActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastActiveText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
});
