// components/AssignmentCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Assignment } from '../types';

interface AssignmentCardProps {
  assignment: Assignment;
  onPress?: () => void;
  onStatusPress?: () => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  onPress,
  onStatusPress,
}) => {
  const getStatusInfo = () => {
    const now = new Date();
    const dueDate = new Date(assignment.due_date);
    const isOverdue = now > dueDate;

    switch (assignment.status) {
      case 'graded':
        return {
          color: assignment.submission?.grade && assignment.submission.grade >= assignment.max_score * 0.7 
            ? Colors.success 
            : assignment.submission?.grade && assignment.submission.grade >= assignment.max_score * 0.5 
            ? Colors.warning 
            : Colors.danger,
          icon: 'checkmark-done',
          label: 'نمره‌دار',
          text: assignment.submission?.grade 
            ? `نمره: ${assignment.submission.grade}/${assignment.max_score}`
            : 'تصحیح شده',
        };
      case 'submitted':
        return {
          color: isOverdue ? Colors.warning : Colors.info,
          icon: isOverdue ? 'time' : 'checkmark-circle',
          label: isOverdue ? 'تأخیر' : 'تحویل داده شده',
          text: isOverdue ? 'با تأخیر تحویل داده شد' : 'در انتظار تصحیح',
        };
      case 'pending':
        return {
          color: isOverdue ? Colors.danger : Colors.warning,
          icon: isOverdue ? 'alert-circle' : 'timer',
          label: isOverdue ? 'از دست رفته' : 'در انتظار',
          text: isOverdue ? 'مهلت تحویل گذشته' : 'هنوز تحویل داده نشده',
        };
      case 'late':
        return {
          color: Colors.danger,
          icon: 'alert-circle',
          label: 'تأخیر',
          text: 'بعد از مهلت تحویل داده شد',
        };
      case 'missing':
        return {
          color: Colors.danger,
          icon: 'close-circle',
          label: 'غایب',
          text: 'تحویل داده نشده',
        };
      default:
        return {
          color: Colors.textSecondary,
          icon: 'help-circle',
          label: 'نامشخص',
          text: 'وضعیت نامشخص',
        };
    }
  };

  const getDueDateText = () => {
    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    const diffMs = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} روز گذشته`;
    } else if (diffDays === 0) {
      return 'امروز';
    } else if (diffDays === 1) {
      return 'فردا';
    } else if (diffDays <= 7) {
      return `${diffDays} روز دیگر`;
    } else {
      return dueDate.toLocaleDateString('fa-IR');
    }
  };

  const statusInfo = getStatusInfo();
  const dueText = getDueDateText();
  const hasAttachments = assignment.attachments.length > 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.courseName}>{assignment.course_name}</Text>
          <Text style={styles.title} numberOfLines={2}>{assignment.title}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}
          onPress={onStatusPress}
        >
          <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.label}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {assignment.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.dueDate}>
            <Ionicons name="calendar" size={14} color={Colors.textSecondary} />
            <Text style={styles.dueDateText}>مهلت: {dueText}</Text>
          </View>
          
          {hasAttachments && (
            <View style={styles.attachmentBadge}>
              <Ionicons name="attach" size={12} color={Colors.primary} />
              <Text style={styles.attachmentText}>
                {assignment.attachments.length} فایل
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footerRight}>
          <Text style={styles.maxScore}>{assignment.max_score} نمره</Text>
          
          {assignment.submission?.grade !== undefined && (
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeText}>
                {assignment.submission.grade}/{assignment.max_score}
              </Text>
            </View>
          )}
        </View>
      </View>

      {statusInfo.text && (
        <Text style={[styles.statusSubtext, { color: statusInfo.color }]}>
          {statusInfo.text}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  courseName: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  attachmentText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '500',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  maxScore: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  gradeBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gradeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  statusSubtext: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
});