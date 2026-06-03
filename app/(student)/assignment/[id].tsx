import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Header } from '@/components/Header';
import { studentApi, Assignment } from '@/src/config/studentApi';

export default function AssignmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const response = await studentApi.getAssignmentDetail(Number(id));
      if (response.success && response.data) {
        setAssignment(response.data);
      } else {
        Alert.alert('خطا', 'تکلیف مورد نظر یافت نشد');
        router.back();
      }
    } catch (error) {
      console.error('Error loading assignment:', error);
      Alert.alert('خطا', 'مشکل در بارگذاری تکلیف');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAssignment();
    }, [id])
  );

  const handleSubmit = () => {
    router.push(`/student/assignment/${id}/submit`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openFile = async (url: string) => {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('خطا', 'امکان باز کردن فایل وجود ندارد');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="جزئیات تکلیف" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!assignment) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="خطا" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={Colors.danger} />
          <Text style={styles.errorText}>تکلیف مورد نظر یافت نشد</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>بازگشت</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isSubmitted = assignment.status === 'submitted' || assignment.status === 'graded';
  const isGraded = assignment.status === 'graded';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="جزئیات تکلیف" />

      <ScrollView style={styles.content}>
        {/* Status Banner */}
        <View style={[
          styles.statusBanner,
          isGraded ? styles.gradedBanner :
          isSubmitted ? styles.submittedBanner :
          styles.pendingBanner
        ]}>
          <Ionicons
            name={isGraded ? 'checkmark-circle' : isSubmitted ? 'cloud-upload' : 'time'}
            size={24}
            color="#fff"
          />
          <Text style={styles.statusBannerText}>
            {isGraded ? 'نمره داده شده' : isSubmitted ? 'تحویل داده شده' : 'در انتظار تحویل'}
          </Text>
        </View>

        {/* Assignment Info */}
        <View style={styles.card}>
          <Text style={styles.title}>{assignment.title}</Text>
          <Text style={styles.courseName}>{assignment.course_name}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={18} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              مهلت: {formatDate(assignment.due_date)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="star" size={18} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              نمره: {assignment.max_score}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="person" size={18} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              مدرس: {assignment.teacher_name}
            </Text>
          </View>

          {assignment.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>توضیحات</Text>
              <Text style={styles.sectionText}>{assignment.description}</Text>
            </View>
          )}

          {assignment.instructions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>دستورالعمل</Text>
              <Text style={styles.sectionText}>{assignment.instructions}</Text>
            </View>
          )}
        </View>

        {/* Submission Info (if submitted) */}
        {assignment.submission && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>اطلاعات تحویل</Text>
            <View style={styles.infoRow}>
              <Ionicons name="time" size={18} color={Colors.textSecondary} />
              <Text style={styles.infoText}>
                تاریخ تحویل: {formatDate(assignment.submission.submitted_at)}
              </Text>
            </View>
            
            {assignment.submission.content && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>پاسخ شما</Text>
                <Text style={styles.sectionText}>{assignment.submission.content}</Text>
              </View>
            )}
          </View>
        )}

        {/* Grade Info (if graded) */}
        {assignment.submission?.grade !== undefined && (
          <View style={styles.gradeCard}>
            <View style={styles.gradeHeader}>
              <Ionicons name="star" size={24} color={Colors.warning} />
              <Text style={styles.gradeTitle}>نمره شما</Text>
            </View>
            <Text style={styles.gradeValue}>
              {assignment.submission.grade} / {assignment.max_score}
            </Text>
            {assignment.submission.feedback && (
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackTitle}>بازخورد مدرس:</Text>
                <Text style={styles.feedbackText}>{assignment.submission.feedback}</Text>
              </View>
            )}
          </View>
        )}

        {/* Submit Button */}
        {!isSubmitted && (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Ionicons name="cloud-upload" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>تحویل تکلیف</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  pendingBanner: {
    backgroundColor: Colors.warning,
  },
  submittedBanner: {
    backgroundColor: Colors.info,
  },
  gradedBanner: {
    backgroundColor: Colors.success,
  },
  statusBannerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  section: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  gradeCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  gradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  gradeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  gradeValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.warning,
    textAlign: 'center',
    marginVertical: 8,
  },
  feedbackContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(245, 158, 11, 0.2)',
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 32,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});