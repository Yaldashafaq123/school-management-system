// app/course/[id].tsx - Enhanced version
import { CourseDetailHeader } from '@/components/CourseDetailHeader';
import { Colors } from '@/constants/Colors';
import { mockCourses } from '@/constants/mockData';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [enrolled, setEnrolled] = useState(false);
  
  const course = mockCourses.find(c => c.id === parseInt(id as string)) || mockCourses[0];

  const handleEnroll = () => {
    setEnrolled(true);
    // In real app, call API to enroll
    router.push(`./lesson/${course.id}/1`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <CourseDetailHeader
          course={{ ...course, enrolled }}
          onEnroll={handleEnroll}
          onBack={() => router.back()}
        />

        <View style={styles.content}>
          {/* Course Content */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>سرفصل‌های دوره</Text>
            
            {[1, 2, 3].map((topic) => (
              <TouchableOpacity key={topic} style={styles.topicCard}>
                <View style={styles.topicHeader}>
                  <View style={styles.topicIcon}>
                    <Ionicons name="bookmark-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.topicInfo}>
                    <Text style={styles.topicTitle}>فصل {topic}: اعداد و عملیات</Text>
                    <Text style={styles.topicLessons}>۴ درس • ۲ ساعت</Text>
                  </View>
                  <Ionicons name="chevron-down" size={24} color={Colors.textSecondary} />
                </View>
                
                <View style={styles.lessonsList}>
                  {[1, 2, 3, 4].map((lesson) => (
                    <TouchableOpacity 
                      key={lesson} 
                      style={styles.lessonItem}
                      onPress={() => router.push(`./lesson/${course.id}/${lesson}`)}
                    >
                      <View style={styles.lessonIcon}>
                        <Ionicons 
                          name="play-circle" 
                          size={20} 
                          color={enrolled ? Colors.primary : Colors.textSecondary} 
                        />
                      </View>
                      <Text style={styles.lessonText}>درس {lesson}: معرفی اعداد</Text>
                      <Text style={styles.lessonDuration}>۱۵ دقیقه</Text>
                      {enrolled && lesson === 1 && (
                        <View style={styles.completedBadge}>
                          <Ionicons name="checkmark" size={12} color="#fff" />
                        </View>
                        
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Requirements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>پیش‌نیازها</Text>
            <View style={styles.requirementsList}>
              <View style={styles.requirementItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.requirementText}>آشنایی با ریاضی ابتدایی</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.requirementText}>دسترسی به کامپیوتر یا موبایل</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.requirementText}>اتصال اینترنت</Text>
              </View>
            </View>
          </View>

          {/* Instructor */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>مدرس دوره</Text>
            <View style={styles.instructorCard}>
              <View style={styles.instructorInfo}>
                <Text style={styles.instructorName}>{course.teacher_name}</Text>
                <Text style={styles.instructorTitle}>دکترای ریاضی کاربردی</Text>
                <Text style={styles.instructorBio}>
                  با ۱۰ سال سابقه تدریس در دانشگاه و مدارس نمونه کشور
                </Text>
              </View>
            </View>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>نظرات دانش‌آموزان</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>مشاهده همه</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.reviewsList}>
              {[1, 2].map((review) => (
                <View key={review} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>علی رضایی</Text>
                      <View style={styles.rating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name="star"
                            size={14}
                            color={star <= 4 ? "#fbbf24" : "#e5e7eb"}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>۲ هفته پیش</Text>
                  </View>
                  <Text style={styles.reviewText}>
                    دوره بسیار عالی بود. توضیحات کامل و مثال‌های عملی خوبی داشت.
                  </Text>
                </View>
              ))}
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  topicCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topicIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  topicLessons: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lessonsList: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    position: 'relative',
  },
  lessonIcon: {
    width: 32,
    alignItems: 'center',
  },
  lessonText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    marginHorizontal: 12,
  },
  lessonDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  completedBadge: {
    position: 'absolute',
    left: 16,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirementsList: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
    color: Colors.text,
  },
  instructorCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  instructorInfo: {
    gap: 8,
  },
  instructorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  instructorTitle: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  instructorBio: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  reviewText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});