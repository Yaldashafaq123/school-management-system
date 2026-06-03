// components/AnnouncementCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Announcement } from '../types';

interface AnnouncementCardProps {
  announcement: Announcement;
  onPress?: () => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="megaphone" size={20} color={Colors.primary} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{announcement.title}</Text>
          <Text style={styles.date}>{announcement.date}</Text>
        </View>
        
        <Text style={styles.contentText} numberOfLines={2}>
          {announcement.content}
        </Text>
        
        {announcement.course_name && (
          <View style={styles.courseBadge}>
            <Text style={styles.courseBadgeText}>{announcement.course_name}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginLeft: 8,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  contentText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  courseBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  courseBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
});