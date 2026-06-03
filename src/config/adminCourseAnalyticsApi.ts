// src/config/adminCourseAnalyticsApi.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './api';

// ============ Analytics Types ============
export interface TopCourse {
  id: number;
  title: string;
  enrollments: number;
  rating: number;
  revenue: number;
  completionRate: number;
}

export interface CategoryDistribution {
  category: string;
  courses: number;
  enrollments: number;
  revenue: number;
}

export interface MonthlyPerformance {
  month: string;
  newCourses: number;
  enrollments: number;
  revenue: number;
}

export interface CourseTypes {
  paid: number;
  free: number;
  ongoing: number;
  completed: number;
}

export interface CourseAnalytics {
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  avgRating: number;
  completionRate: number;
  totalRevenue: number;
  topCourses: TopCourse[];
  categoryDistribution: CategoryDistribution[];
  monthlyPerformance: MonthlyPerformance[];
  courseTypes: CourseTypes;
}

// Alias for backward compatibility (if needed)
export type CourseAnalyticsData = CourseAnalytics;

// ============ API Methods ============
export const adminCourseAnalyticsApi = {
  /**
   * Get course analytics overview
   * @param range - Time range: 'day' | 'week' | 'month' | 'year' (default: 'month')
   */
  getCourseAnalytics: async (
    range: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<{ success: boolean; data: CourseAnalytics }> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(
        `${BASE_URL}/admin/analytics/courses?range=${range}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      return { success: false, data: null as any };
    }
  },

  /**
   * Get detailed analytics for a specific course
   * @param courseId - ID of the course
   */
  getCourseDetailAnalytics: async (
    courseId: number
  ): Promise<{ success: boolean; data: any }> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(
        `${BASE_URL}/admin/analytics/courses/${courseId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching course detail analytics:', error);
      return { success: false, data: null };
    }
  },

  /**
   * Export course analytics report
   * @param format - Export format: 'csv' | 'pdf' (default: 'csv')
   * @param range - Time range: 'day' | 'week' | 'month' | 'year' (default: 'month')
   */
  exportCourseAnalytics: async (
    format: 'csv' | 'pdf' = 'csv',
    range: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<{ success: boolean; data: string }> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(
        `${BASE_URL}/admin/analytics/courses/export?format=${format}&range=${range}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error exporting course analytics:', error);
      return { success: false, data: '' };
    }
  },
};

// ============ Legacy Support ============
// For backward compatibility with code that uses exportAnalytics
export const exportAnalytics = adminCourseAnalyticsApi.exportCourseAnalytics;

// ============ Helper Functions ============
// Helper function to format revenue
export const formatRevenue = (amount: number): string => {
  return amount.toLocaleString('fa-AF') + ' افغانی';
};

// Helper function to format percentage
export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Helper function to get rating color
export const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return '#34C759';
  if (rating >= 4) return '#FF9500';
  if (rating >= 3) return '#FFC107';
  return '#FF3B30';
};

// Helper function to get rating text
export const getRatingText = (rating: number): string => {
  if (rating >= 4.5) return 'عالی';
  if (rating >= 4) return 'خوب';
  if (rating >= 3) return 'متوسط';
  return 'ضعیف';
};

// Helper function to get completion rate color
export const getCompletionColor = (rate: number): string => {
  if (rate >= 80) return '#34C759';
  if (rate >= 60) return '#FF9500';
  if (rate >= 40) return '#FFC107';
  return '#FF3B30';
};

// Helper function to get completion text
export const getCompletionText = (rate: number): string => {
  if (rate >= 80) return 'عالی';
  if (rate >= 60) return 'خوب';
  if (rate >= 40) return 'متوسط';
  return 'نیاز به بهبود';
};

// Helper function to calculate growth percentage
export const calculateGrowth = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Helper function to get trend icon
export const getTrendIcon = (growth: number): string => {
  if (growth > 0) return 'trending-up';
  if (growth < 0) return 'trending-down';
  return 'trending-flat';
};

// Helper function to get trend color
export const getTrendColor = (growth: number): string => {
  if (growth > 0) return '#34C759';
  if (growth < 0) return '#FF3B30';
  return '#FF9500';
};

// Helper function to format trend text
export const getTrendText = (growth: number): string => {
  const absGrowth = Math.abs(growth).toFixed(1);
  if (growth > 0) return `${absGrowth}% افزایش`;
  if (growth < 0) return `${absGrowth}% کاهش`;
  return 'بدون تغییر';
};