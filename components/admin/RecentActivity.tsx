// components/admin/RecentActivity.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { UserActivity } from '../../types';

interface RecentActivityProps {
  activities: UserActivity[];
  onViewAll?: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  onViewAll,
}) => {
  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
        return 'log-in';
      case 'logout':
        return 'log-out';
      case 'enroll':
        return 'school';
      case 'complete':
        return 'checkmark-circle';
      case 'payment':
        return 'card';
      case 'create':
        return 'add-circle';
      case 'update':
        return 'create';
      case 'delete':
        return 'trash';
      default:
        return 'notifications';
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'complete':
        return Colors.success;
      case 'enroll':
      case 'payment':
        return Colors.primary;
      case 'create':
      case 'update':
        return Colors.info;
      case 'logout':
      case 'delete':
        return Colors.danger;
      default:
        return Colors.textSecondary;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'همین الان';
    if (diffMins < 60) return `${diffMins} دقیقه پیش`;
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    
    return date.toLocaleDateString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>فعالیت‌های اخیر</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAllText}>مشاهده همه</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.activityList} showsVerticalScrollIndicator={false}>
        {activities.map((activity) => {
          const icon = getActionIcon(activity.action);
          const color = getActionColor(activity.action);

          return (
            <TouchableOpacity key={activity.id} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon as any} size={16} color={color} />
              </View>

              <View style={styles.activityContent}>
                <View style={styles.activityHeader}>
                  <Text style={styles.userName}>{activity.user_name}</Text>
                  <Text style={styles.time}>{formatTime(activity.timestamp)}</Text>
                </View>
                
                <Text style={styles.actionText}>{activity.action}</Text>
                <Text style={styles.details} numberOfLines={2}>
                  {activity.details}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  activityList: {
    maxHeight: 400,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  time: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  details: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
