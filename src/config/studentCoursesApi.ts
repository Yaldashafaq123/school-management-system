// src/config/studentCoursesApi.ts
import { apiRequest } from './api';

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  teacher_id: number;
  teacher_name: string;
  class_id: number | null;
  subject_id: number | null;
  is_general: boolean;
  progress?: number;
  enrolled?: boolean;
  instructor?: string;
  rating?: number;
  student_count?: number;
  duration?: number;
  is_active: boolean;
  created_at: string;
  objectives?: CourseObjective[];
  requirements?: CourseRequirement[];
  assignments_count?: number;
  exams_count?: number;
}

export interface CourseObjective {
  id: number;
  text: string;
}

export interface CourseRequirement {
  id: number;
  text: string;
}

export interface Class {
  id: number;
  class_name: string;
  description?: string;
  student_count?: number;
}

export interface Subject {
  id: number;
  subject_name: string;
  class_id?: number;
}

export interface CourseFilter {
  class_id?: number;
  subject_id?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  is_free?: boolean;
  has_certificate?: boolean;
  rating_min?: number;
  price_range?: [number, number];
}

export interface SortOption {
  id: string;
  label: string;
  field: string;
  order: 'asc' | 'desc';
}

export type ViewMode = 'grid' | 'list';

export interface CourseStats {
  total: number;
  enrolled: number;
  completed: number;
  in_progress: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export const SORT_OPTIONS: SortOption[] = [
  { id: 'popular', label: 'محبوب‌ترین', field: 'enrollments', order: 'desc' },
  { id: 'newest', label: 'جدیدترین', field: 'created_at', order: 'desc' },
  { id: 'title-asc', label: 'نام (الف تا ی)', field: 'title', order: 'asc' },
  { id: 'title-desc', label: 'نام (ی تا الف)', field: 'title', order: 'desc' },
  { id: 'rating', label: 'بالاترین امتیاز', field: 'rating', order: 'desc' },
  { id: 'duration-asc', label: 'کوتاه‌ترین', field: 'duration', order: 'asc' },
  { id: 'duration-desc', label: 'بلندترین', field: 'duration', order: 'desc' },
];

export const studentCoursesApi = {
  // Get all courses with pagination and filters
  getCourses: async (
    page: number = 1,
    limit: number = 10,
    filters?: CourseFilter,
    sort?: SortOption,
    search?: string
  ): Promise<{ success: boolean; data: PaginatedResponse<Course> }> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      if (sort) {
        queryParams.append('sortField', sort.field);
        queryParams.append('sortOrder', sort.order);
      }
      
      if (search) {
        queryParams.append('search', search);
      }
      
      const response = await apiRequest(`/student/courses?${queryParams.toString()}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get course details
  getCourse: async (id: number): Promise<{ success: boolean; data: Course }> => {
    try {
      const response = await apiRequest(`/student/courses/${id}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  },

  // Get all classes
  getClasses: async (): Promise<{ success: boolean; data: Class[] }> => {
    try {
      const response = await apiRequest('/student/courses/classes', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }
  },

  // Get all subjects
  getSubjects: async (): Promise<{ success: boolean; data: Subject[] }> => {
    try {
      const response = await apiRequest('/student/courses/subjects', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  },

  // Get subjects by class
  getSubjectsByClass: async (classId: number): Promise<{ success: boolean; data: Subject[] }> => {
    try {
      const response = await apiRequest(`/student/courses/subjects/class/${classId}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching subjects by class:', error);
      throw error;
    }
  },

  // Enroll in a course
  enrollCourse: async (courseId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest(`/student/courses/${courseId}/enroll`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  },

  // Get enrolled courses
  getEnrolledCourses: async (): Promise<{ success: boolean; data: Course[] }> => {
    try {
      const response = await apiRequest('/student/courses/enrolled', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      throw error;
    }
  },

  // Get course stats
  getCourseStats: async (): Promise<{ success: boolean; data: CourseStats }> => {
    try {
      const response = await apiRequest('/student/courses/stats', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching course stats:', error);
      throw error;
    }
  },

  // Search courses
  searchCourses: async (query: string): Promise<{ success: boolean; data: Course[] }> => {
    try {
      const response = await apiRequest(`/student/courses/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  }
};