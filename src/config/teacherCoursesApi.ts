// src/config/teacherCoursesApi.ts
import { apiRequest } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CourseObjective {
  id?: number;
  text: string;
}

export interface CourseRequirement {
  id?: number;
  text: string;
}

export interface Lesson {
  id?: number;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  isFree: boolean;
  order: number;
  thumbnail?: string;
  course_id?: number;
}

// Updated Course interface to match backend
export interface Course {
  id: number;
  title: string;
  description: string;
  subject: string;
  duration: number;
  schedule?: string;
  capacity?: number;
  thumbnail_url?: string;
  teacher_id: number;
  teacher_name?: string;
  class_id: number | null;
  class_name?: string;
  student_count: number;
  revenue: number;
  rating: number;
  is_active: boolean;
  created_at: string;
  objectives?: CourseObjective[];
  requirements?: CourseRequirement[];
}

export interface CourseStats {
  total: number;
  active: number;
  inactive: number;
  totalStudents: number;
  totalRevenue: number;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  progress: number;
  last_active: string;
  profile_image?: string;
}

export interface Assignment {
  id: number;
  title: string;
  submissions: number;
  graded: number;
  average_grade: number;
  max_grade: number;
  due_date: string;
}

export interface Exam {
  id: number;
  title: string;
  submissions: number;
  graded: number;
  average_grade: number;
  max_score: number;
  date: string;
}

export const teacherCoursesApi = {
  // Get all courses for teacher
  getCourses: async (): Promise<{ success: boolean; data: Course[]; stats: CourseStats }> => {
    try {
      const response = await apiRequest('/teacher/courses', {
        method: 'GET',
      });
      // Handle both response formats (if response.data is the array or response.courses is the array)
      if (response.courses) {
        return {
          success: true,
          data: response.courses,
          stats: response.stats || { total: response.courses.length, active: 0, inactive: 0, totalStudents: 0, totalRevenue: 0 }
        };
      }
      return response;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get single course details
  getCourse: async (id: number): Promise<{ success: boolean; data: Course }> => {
    try {
      const response = await apiRequest(`/teacher/courses/${id}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  },

  // Get course with students, assignments, exams for management
  getCourseManagement: async (id: number): Promise<{ 
    success: boolean; 
    data: {
      course: Course;
      students: Student[];
      assignments: Assignment[];
      exams: Exam[];
    }
  }> => {
    try {
      const response = await apiRequest(`/teacher/courses/${id}/manage`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching course management:', error);
      throw error;
    }
  },

  // Update course
  updateCourse: async (id: number, data: any): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest(`/teacher/courses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  // Toggle course status
  toggleCourseStatus: async (id: number): Promise<{ success: boolean; is_active: boolean }> => {
    try {
      const response = await apiRequest(`/teacher/courses/${id}/toggle`, {
        method: 'PATCH',
      });
      return response;
    } catch (error) {
      console.error('Error toggling course status:', error);
      throw error;
    }
  },

  // Delete course
  deleteCourse: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest(`/teacher/courses/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },

  // Get students in course
  getCourseStudents: async (id: number): Promise<{ success: boolean; data: Student[] }> => {
    try {
      const response = await apiRequest(`/teacher/courses/${id}/students`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching course students:', error);
      throw error;
    }
  },

  // Get assignments for course
  getCourseAssignments: async (id: number): Promise<{ success: boolean; data: Assignment[] }> => {
    try {
      const response = await apiRequest(`/teacher/courses/${id}/assignments`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching course assignments:', error);
      throw error;
    }
  },

  // Get exams for course
  getCourseExams: async (id: number): Promise<{ success: boolean; data: Exam[] }> => {
    try {
      const response = await apiRequest(`/teacher/courses/${id}/exams`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching course exams:', error);
      throw error;
    }
  },

  // Add student to course
  addStudent: async (courseId: number, email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest(`/teacher/courses/${courseId}/students`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return response;
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  },

  // Remove student from course
  removeStudent: async (courseId: number, studentId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest(`/teacher/courses/${courseId}/students/${studentId}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Error removing student:', error);
      throw error;
    }
  },

  // Upload course image
  uploadImage: async (imageUri: string): Promise<{ success: boolean; url: string }> => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'course.jpg',
      } as any);

      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      return { success: true, url: data.url || data.imageUrl || '' };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Get course lessons
  getCourseLessons: async (courseId: number): Promise<{ success: boolean; data: Lesson[] }> => {
    try {
      const response = await apiRequest(`/teacher/courses/${courseId}/lessons`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
  },

  // Create lesson
// In teacherCoursesApi.ts, update these methods:

// Create lesson
createLesson: async (courseId: number, lessonData: Partial<Lesson>): Promise<{ success: boolean; data: Lesson }> => {
  try {
    // Convert from camelCase to what backend expects (videoUrl, not video_url)
    const backendData = {
      title: lessonData.title,
      description: lessonData.description,
      videoUrl: lessonData.videoUrl,  // ← Use videoUrl
      duration: lessonData.duration,
      order: lessonData.order,
      isFree: lessonData.isFree,
      thumbnail: lessonData.thumbnail
    };
    
    const response = await apiRequest(`/teacher/courses/${courseId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
    return response;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
},

// Update lesson
updateLesson: async (lessonId: number, lessonData: Partial<Lesson>): Promise<{ success: boolean; data: Lesson }> => {
  try {
    const backendData = {
      title: lessonData.title,
      description: lessonData.description,
      videoUrl: lessonData.videoUrl,  // ← Use videoUrl
      duration: lessonData.duration,
      order: lessonData.order,
      isFree: lessonData.isFree,
      thumbnail: lessonData.thumbnail
    };
    
    const response = await apiRequest(`/teacher/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
    return response;
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
},

  // Delete lesson
  deleteLesson: async (lessonId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest(`/teacher/lessons/${lessonId}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  },
};