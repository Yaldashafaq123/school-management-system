// components/ProgressCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { ProgressItem } from '../types';

interface ProgressCardProps {
  progress: ProgressItem;
  onPress?: () => void;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  progress,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.courseTitle}>{progress.course_title}</Text>
        <Text style={styles.progressPercentage}>{progress.progress_percentage}%</Text>
      </View>
      
      <View style={styles.progressBar}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={[styles.progressFill, { width: `${progress.progress_percentage}%` }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
      
      {progress.next_lesson_title && (
        <View style={styles.nextLesson}>
          <Ionicons name="play-circle" size={16} color={Colors.textSecondary} />
          <Text style={styles.nextLessonText} numberOfLines={1}>
            درس بعدی: {progress.next_lesson_title}
          </Text>
        </View>
      )}
      
      {progress.last_accessed && (
        <Text style={styles.lastAccessed}>
          آخرین بازدید: {progress.last_accessed}
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
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginLeft: 8,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  nextLesson: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nextLessonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 6,
    flex: 1,
  },
  lastAccessed: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'left',
  },
});