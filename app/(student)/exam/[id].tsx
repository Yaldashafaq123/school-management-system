// app/(student)/exam/[id].tsx
import { Colors } from "@/constants/Colors";
import { Announcement, studentApi } from "@/src/config/studentApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExamDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Announcement | null>(null);

  useEffect(() => {
    loadExamDetail();
  }, [id]);

  const loadExamDetail = async () => {
    try {
      setLoading(true);
      const response = await studentApi.getAnnouncementById(Number(id));
      if (response.success && response.data) {
        setExam(response.data);
        
        // Mark as read
        if (!response.data.isRead) {
          await studentApi.markAnnouncementAsRead(Number(id));
        }
      }
    } catch (error) {
      console.error("Error loading exam detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return Colors.danger;
      case 'HIGH':
        return Colors.warning;
      default:
        return Colors.primary;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'فوری';
      case 'HIGH':
        return 'مهم';
      default:
        return 'عادی';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!exam) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={Colors.danger} />
          <Text style={styles.errorText}>آزمون مورد نظر یافت نشد</Text>
          <TouchableOpacity style={styles.errorBackButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>بازگشت</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-forward" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>جزئیات آزمون</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Priority Badge */}
        <View style={[styles.priorityContainer, { backgroundColor: getPriorityColor(exam.priority) }]}>
          <Text style={styles.priorityText}>{getPriorityText(exam.priority)}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{exam.title}</Text>

        {/* Date and Time */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>تاریخ برگزاری:</Text>
            <Text style={styles.infoValue}>
              {exam.eventDate ? formatDate(exam.eventDate) : formatDate(exam.createdAt)}
            </Text>
          </View>
          
          {exam.eventDate && (
            <View style={styles.infoRow}>
              <Ionicons name="time" size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>ساعت:</Text>
              <Text style={styles.infoValue}>{formatTime(exam.eventDate)}</Text>
            </View>
          )}

          {exam.eventLocation && (
            <View style={styles.infoRow}>
              <Ionicons name="location" size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>مکان:</Text>
              <Text style={styles.infoValue}>{exam.eventLocation}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>ثبت کننده:</Text>
            <Text style={styles.infoValue}>{exam.author.fullName}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>توضیحات آزمون</Text>
          <Text style={styles.content}>{exam.content}</Text>
        </View>

        {/* Attachments */}
        {exam.attachments && exam.attachments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>پیوست‌ها</Text>
            {exam.attachments.map((attachment) => (
              <TouchableOpacity key={attachment.id} style={styles.attachmentItem}>
                <Ionicons name="document" size={20} color={Colors.primary} />
                <Text style={styles.attachmentText}>{attachment.filename || 'فایل ضمیمه'}</Text>
                <Ionicons name="download-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Target Classes */}
        {exam.targetClasses && exam.targetClasses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>مخاطبین</Text>
            <View style={styles.classesContainer}>
              {exam.targetClasses.map((tc, index) => (
                <View key={index} style={styles.classBadge}>
                  <Text style={styles.classText}>{tc.class.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Ionicons name="information-circle" size={16} color={Colors.textSecondary} />
          <Text style={styles.footerNoteText}>
            لطفاً برای شرکت در آزمون، در زمان مقرر حاضر باشید.
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  placeholder: {
    width: 40,
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
  errorBackButton: {
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
  priorityContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  priorityText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginLeft: 8,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  contentText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 24,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  attachmentText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  classesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classBadge: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  classText: {
    fontSize: 12,
    color: Colors.primary,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 40,
    gap: 8,
  },
  footerNoteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});