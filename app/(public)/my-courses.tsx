// app/my-courses.tsx
import { CourseCard } from '@/components/CourseCard';
import { Header } from '@/components/Header';
import { Colors } from '@/constants/Colors';
import { classCourses } from '@/constants/mockData';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyCoursesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="دوره‌های من"
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView style={styles.content}>
        {classCourses.filter(course => course.enrolled).length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              هنوز در هیچ دوره‌ای ثبت‌نام نکرده‌اید
            </Text>
            <Text style={styles.emptyStateSubtext}>
              از بخش دوره‌ها می‌توانید در دوره‌های مورد نظر خود ثبت‌نام کنید
            </Text>
          </View>
        ) : (
          <View style={styles.coursesList}>
            {classCourses
              .filter(course => course.enrolled)
              .map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  showProgress
                  onPress={() => router.push(`/course/${course.id}`)}
                />
              ))}
          </View>
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  coursesList: {
    gap: 16,
  },
});