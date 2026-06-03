// components/CourseDetailHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Course } from '../types';

interface CourseDetailHeaderProps {
  course: Course;
  onEnroll: () => void;
  onBack: () => void;
}

export const CourseDetailHeader: React.FC<CourseDetailHeaderProps> = ({
  course,
  onEnroll,
  onBack,
}) => {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `دوره ${course.title} - آموزش فارسی\n\n${course.description}`,
        url: course.thumbnail_url,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: course.thumbnail_url }} style={styles.image} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Share Button */}
      <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
        <Ionicons name="share-social" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Course Info */}
      <View style={styles.infoContainer}>
        <View style={styles.badgeContainer}>
          {course.is_general && (
            <View style={[styles.badge, styles.generalBadge]}>
              <Text style={styles.badgeText}>عمومی</Text>
            </View>
          )}
          {course.enrolled && (
            <View style={[styles.badge, styles.enrolledBadge]}>
              <Ionicons name="checkmark-circle" size={12} color="#fff" />
              <Text style={styles.badgeText}>ثبت‌نام شده</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.description} numberOfLines={3}>
          {course.description}
        </Text>

        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Ionicons name="person-circle" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.metaText}>{course.teacher_name}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.metaText}>۲۴ ساعت</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="school" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.metaText}>۱۸ درس</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.enrollButton} onPress={onEnroll}>
            <Text style={styles.enrollButtonText}>
              {course.enrolled ? 'ادامه یادگیری' : 'ثبت نام در دوره'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.wishlistButton}>
            <Ionicons
              name={course.enrolled ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 380,
    position: 'relative',
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  generalBadge: {
    backgroundColor: Colors.secondary,
  },
  enrolledBadge: {
    backgroundColor: Colors.success,
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  metaItem: {
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  enrollButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  wishlistButton: {
    width: 56,
    height: 56,
    backgroundColor: Colors.card,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});