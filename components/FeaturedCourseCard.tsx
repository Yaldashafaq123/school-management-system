// components/FeaturedCourseCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { FeaturedCourse } from '../types';

interface FeaturedCourseCardProps {
  course: FeaturedCourse;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 64; // Account for padding

export const FeaturedCourseCard: React.FC<FeaturedCourseCardProps> = ({
  course,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image source={{ uri: course.thumbnail_url }} style={styles.image} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      
      {course.is_free && (
        <View style={styles.freeBadge}>
          <Text style={styles.freeBadgeText}>رایگان</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {course.description}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.teacherInfo}>
            <Ionicons name="person-circle" size={16} color="#fff" />
            <Text style={styles.teacherText}>{course.teacher_name}</Text>
          </View>
          
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text style={styles.statText}>{course.rating.toFixed(1)}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="people" size={14} color="#fff" />
              <Text style={styles.statText}>{course.student_count.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 8,
    backgroundColor: Colors.card,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  freeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: Colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  freeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teacherText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#fff',
  },
});