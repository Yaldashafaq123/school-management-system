// src/config/adminExamApi.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './api';

export interface Exam {
  id: number;
  name: string;
  title: string;           // Added for ExamCard component
  subject: string;
  className: string;
  classId: number;
  class?: {                // For ExamModal component
    id: number;
    name: string;
    section?: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  room: string;
  invigilator: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  totalMarks: number;
  passingMarks: number;
  isPublished: boolean;
  students: number;
  gradesCount?: number;
  type?: string;
  month?: number;
  year?: number;
}

export interface ExamStats {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  published: number;
  draft: number;
}

export interface ExamClass {
  id: number;
  name: string;
  displayName: string;
}

export const adminExamApi = {
  // Get all exams with filters
  getExams: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    published?: string;
    classId?: number;
  }): Promise<{ success: boolean; data: { exams: Exam[]; total: number; page: number; limit: number; totalPages: number } }> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params?.published) queryParams.append('published', params.published);
      if (params?.classId) queryParams.append('classId', params.classId.toString());
      
      const url = `${BASE_URL}/admin/exams${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      
      // Transform data to match Exam interface
      if (result.success && result.data?.exams) {
        const transformedExams = result.data.exams.map((exam: any) => ({
          ...exam,
          title: exam.name,  // Map name to title for ExamCard
          class: exam.classId ? { id: exam.classId, name: exam.className } : undefined
        }));
        return {
          ...result,
          data: {
            ...result.data,
            exams: transformedExams
          }
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching exams:', error);
      return { 
        success: false, 
        data: { exams: [], total: 0, page: 1, limit: 20, totalPages: 0 } 
      };
    }
  },

  // Get exam stats
  getExamStats: async (): Promise<{ success: boolean; data: ExamStats }> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${BASE_URL}/admin/exams/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching exam stats:', error);
      return { success: false, data: null as any };
    }
  },

  // Get single exam
  getExam: async (id: number): Promise<{ success: boolean; data: Exam }> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${BASE_URL}/admin/exams/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      
      if (result.success && result.data) {
        return {
          ...result,
          data: {
            ...result.data,
            title: result.data.name,
            class: result.data.classId ? { id: result.data.classId, name: result.data.className } : undefined
          }
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching exam:', error);
      return { success: false, data: null as any };
    }
  },

  // Create exam
  createExam: async (data: Partial<Exam>): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      // Transform data for backend
      const backendData = {
        name: data.title || data.name,
        subject: data.subject,
        classId: data.classId,
        date: data.date,
        startTime: data.startTime,
        duration: data.duration,
        room: data.room,
        invigilator: data.invigilator,
        totalMarks: data.totalMarks,
        passingMarks: data.passingMarks,
        isPublished: data.isPublished,
        type: data.type,
        month: data.month,
        year: data.year
      };
      
      const response = await fetch(`${BASE_URL}/admin/exams`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating exam:', error);
      return { success: false, message: 'خطا در ایجاد امتحان' };
    }
  },

  // Update exam
  updateExam: async (id: number, data: Partial<Exam>): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const backendData = {
        name: data.title || data.name,
        subject: data.subject,
        classId: data.classId,
        date: data.date,
        startTime: data.startTime,
        duration: data.duration,
        room: data.room,
        invigilator: data.invigilator,
        totalMarks: data.totalMarks,
        passingMarks: data.passingMarks,
        isPublished: data.isPublished,
        type: data.type,
        month: data.month,
        year: data.year
      };
      
      const response = await fetch(`${BASE_URL}/admin/exams/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendData),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error updating exam:', error);
      return { success: false, message: 'خطا در به‌روزرسانی امتحان' };
    }
  },

  // Delete exam
  deleteExam: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${BASE_URL}/admin/exams/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting exam:', error);
      return { success: false, message: 'خطا در حذف امتحان' };
    }
  },

  // Toggle exam publish status
  toggleExamPublish: async (id: number): Promise<{ success: boolean; message: string; data?: { isPublished: boolean } }> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${BASE_URL}/admin/exams/${id}/toggle-publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error toggling exam publish:', error);
      return { success: false, message: 'خطا در تغییر وضعیت انتشار' };
    }
  },

  // Get classes for dropdown
  getExamClasses: async (): Promise<{ success: boolean; data: ExamClass[] }> => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${BASE_URL}/admin/exam-classes`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching exam classes:', error);
      return { success: false, data: [] };
    }
  },
};