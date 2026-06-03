// utils/navigation.ts
import { router } from 'expo-router';

export const navigateToCourse = (courseId: number) => {
  router.push(`/course/${courseId}`);
};

export const navigateToLesson = (lessonId: number) => {
  router.push(`/lesson/${lessonId}`);
};

export const navigateToProfile = () => {
  router.push('/profile');
};

export const navigateToLogin = () => {
  router.replace('/(auth)/login');
};

export const navigateToRegister = () => {
  router.push('/(auth)/register');
};