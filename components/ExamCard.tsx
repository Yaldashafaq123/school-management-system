// components/ExamCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

interface BaseExam {
  id: string;
  title: string;
  course_name?: string;
  name?: string;
  start_date?: string;
  end_date?: string;
  date?: string;
  duration_minutes?: number;
  duration?: string;
  question_count?: number;
  max_score?: number;
  totalMarks?: number;
  attempts_allowed?: number;
  is_published?: boolean;
  isPublished?: boolean;
  status?: 'upcoming' | 'ongoing' | 'completed';
  subject?: string;
  class?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  invigilator?: string;
  passingMarks?: number;
  students?: number;
}

interface ExamCardProps {
  exam: BaseExam;
  onPress?: () => void;
  onStatusPress?: () => void;
  showAttempts?: boolean;
  userAttempts?: number;
  // New props for admin management
  onEdit?: () => void;
  onDelete?: () => void;
  onTogglePublish?: () => void;
  showAdminActions?: boolean;
  // For teacher section compatibility
  variant?: 'teacher' | 'student' | 'admin';
}

export const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  onPress,
  onStatusPress,
  showAttempts = false,
  userAttempts = 0,
  // Admin props
  onEdit,
  onDelete,
  onTogglePublish,
  showAdminActions = false,
  // Variant
  variant = 'teacher',
}) => {
  // Helper functions to get data in a consistent way
  const getExamTitle = () => {
    return exam.title || exam.name || 'Untitled Exam';
  };

  const getCourseName = () => {
    return exam.course_name || exam.subject || 'General';
  };

  const getDuration = () => {
    if (exam.duration_minutes) {
      return `${exam.duration_minutes} دقیقه`;
    }
    if (exam.duration) {
      return exam.duration;
    }
    return 'Duration not set';
  };

  const getQuestionCount = () => {
    return exam.question_count || 0;
  };

  const getMaxScore = () => {
    return exam.max_score || exam.totalMarks || 0;
  };

  const isPublished = () => {
    return exam.is_published || exam.isPublished || false;
  };

  const getStatus = () => {
    // If exam has explicit status, use it
    if (exam.status) {
      const now = new Date();
      
      switch (exam.status) {
        case 'upcoming':
          return {
            color: Colors.info,
            icon: 'time',
            label: 'به زودی',
            gradient: [Colors.info, '#0ea5e9'] as [string, string],
          };
        case 'ongoing':
          return {
            color: Colors.success,
            icon: 'play-circle',
            label: 'فعال',
            gradient: [Colors.success, '#059669'] as [string, string],
          };
        case 'completed':
          return {
            color: Colors.danger,
            icon: 'lock-closed',
            label: 'پایان یافته',
            gradient: [Colors.danger, '#dc2626'] as [string, string],
          };
      }
    }
    
    // Calculate status based on dates
    const now = new Date();
    const startDate = exam.start_date ? new Date(exam.start_date) : null;
    const endDate = exam.end_date ? new Date(exam.end_date) : null;
    
    if (!isPublished()) {
      return {
        color: Colors.textSecondary,
        icon: 'eye-off',
        label: 'منتشر نشده',
        gradient: ['#64748b', '#475569'] as [string, string],
      };
    }
    
    if (startDate && now < startDate) {
      return {
        color: Colors.info,
        icon: 'time',
        label: 'به زودی',
        gradient: [Colors.info, '#0ea5e9'] as [string, string],
      };
    }
    
    if (endDate && now > endDate) {
      return {
        color: Colors.danger,
        icon: 'lock-closed',
        label: 'پایان یافته',
        gradient: [Colors.danger, '#dc2626'] as [string, string],
      };
    }
    
    return {
      color: Colors.success,
      icon: 'play-circle',
      label: 'فعال',
      gradient: [Colors.success, '#059669'] as [string, string],
    };
  };

  const getTimeRemaining = () => {
    const endDate = exam.end_date ? new Date(exam.end_date) : null;
    if (!endDate) return 'تاریخ پایان مشخص نیست';
    
    const now = new Date();
    const diffMs = endDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'پایان یافته';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} روز ${diffHours} ساعت`;
    }
    return `${diffHours} ساعت`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'تاریخ نامشخص';
    try {
      return new Date(dateString).toLocaleDateString('fa-IR', {
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'تاریخ نامشخص';
    }
  };

  const status = getStatus();
  const timeRemaining = getTimeRemaining();
  const attemptsAllowed = exam.attempts_allowed || 1;
  const attemptsLeft = Math.max(0, attemptsAllowed - userAttempts);
  const canTakeExam = isPublished() && attemptsLeft > 0;

  // Render different content based on variant
  const renderTeacherContent = () => (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <LinearGradient
        colors={status.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <Ionicons name={status.icon as any} size={14} color="#fff" />
          <Text style={styles.statusText}>{status.label}</Text>
        </View>

        {/* Exam Info */}
        <View style={styles.examInfo}>
          <Text style={styles.courseName}>{getCourseName()}</Text>
          <Text style={styles.title} numberOfLines={2}>{getExamTitle()}</Text>
          
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.detailText}>{getDuration()}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="document-text" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.detailText}>{getQuestionCount()} سوال</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Ionicons name="trophy" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.detailText}>{getMaxScore()} نمره</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.timeInfo}>
            <Ionicons name="calendar" size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.timeText}>
              {formatDate(exam.start_date)} - {formatDate(exam.end_date)}
            </Text>
          </View>
          
          {showAttempts && (
            <View style={styles.attemptsBadge}>
              <Ionicons 
                name={canTakeExam ? "refresh-circle" : "checkmark-circle"} 
                size={12} 
                color={canTakeExam ? "#fff" : "#86efac"} 
              />
              <Text style={styles.attemptsText}>
                {userAttempts}/{attemptsAllowed}
              </Text>
            </View>
          )}
        </View>

        {/* Time Remaining */}
        <View style={styles.timeRemaining}>
          <Ionicons name="hourglass" size={12} color="rgba(255,255,255,0.9)" />
          <Text style={styles.timeRemainingText}>{timeRemaining} باقی مانده</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderAdminContent = () => (
    <View style={[styles.container, styles.adminContainer]}>
      <LinearGradient
        colors={status.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, styles.adminGradient]}
      >
        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <Ionicons name={status.icon as any} size={14} color="#fff" />
          <Text style={styles.statusText}>{status.label}</Text>
        </View>

        {/* Exam Info */}
        <View style={styles.examInfo}>
          <Text style={styles.title} numberOfLines={2}>{getExamTitle()}</Text>
          
          <View style={styles.adminDetails}>
            <View style={styles.adminDetailRow}>
              <View style={styles.adminDetailItem}>
                <Ionicons name="book-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.detailText}>{exam.subject || 'General'}</Text>
              </View>
              <View style={styles.adminDetailItem}>
                <Ionicons name="people-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.detailText}>کلاس {exam.class || 'N/A'}</Text>
              </View>
            </View>
            
            <View style={styles.adminDetailRow}>
              <View style={styles.adminDetailItem}>
                <Ionicons name="calendar" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.detailText}>{exam.date || formatDate(exam.start_date)}</Text>
              </View>
              <View style={styles.adminDetailItem}>
                <Ionicons name="time" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.detailText}>{exam.startTime || '--'}-{exam.endTime || '--'}</Text>
              </View>
            </View>
            
            <View style={styles.adminDetailRow}>
              <View style={styles.adminDetailItem}>
                <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.detailText}>{exam.room || 'Room N/A'}</Text>
              </View>
              <View style={styles.adminDetailItem}>
                <Ionicons name="person" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.detailText}>{exam.invigilator || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Marks and Actions */}
        <View style={styles.adminFooter}>
          <View style={styles.marksContainer}>
            <Text style={styles.marksLabel}>نمره:</Text>
            <Text style={styles.marksValue}>
              {getMaxScore()} (قبول: {exam.passingMarks || 0})
            </Text>
          </View>
          
          {showAdminActions && (
            <View style={styles.adminActions}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.publishButton]}
                onPress={onTogglePublish}
              >
                <Text style={[
                  styles.publishText,
                  isPublished() && styles.publishTextActive
                ]}>
                  {isPublished() ? 'منتشر شده' : 'پیش‌نویس'}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.actionIcons}>
                {onEdit && (
                  <TouchableOpacity 
                    style={[styles.iconButton, styles.editButton]}
                    onPress={onEdit}
                  >
                    <Ionicons name="create-outline" size={16} color="#007AFF" />
                  </TouchableOpacity>
                )}
                
                {onDelete && (
                  <TouchableOpacity 
                    style={[styles.iconButton, styles.deleteButton]}
                    onPress={onDelete}
                  >
                    <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  // Return appropriate variant
  if (variant === 'admin') {
    return renderAdminContent();
  }
  
  return renderTeacherContent();
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  adminContainer: {
    // Add any admin-specific container styles
  },
  gradient: {
    padding: 20,
    minHeight: 180,
  },
  adminGradient: {
    minHeight: 200,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  examInfo: {
    flex: 1,
    marginBottom: 16,
  },
  courseName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    lineHeight: 24,
  },
  details: {
    flexDirection: 'row',
    gap: 16,
  },
  adminDetails: {
    gap: 8,
  },
  adminDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  adminDetailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adminFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
    gap: 12,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  attemptsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  attemptsText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '500',
  },
  timeRemaining: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeRemainingText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  marksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  marksLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  marksValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  publishButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  publishText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  publishTextActive: {
    color: '#86efac',
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    // Specific styles for edit button if needed
  },
  deleteButton: {
    // Specific styles for delete button if needed
  },
  actionButton: {
    // Common action button styles
  },
});