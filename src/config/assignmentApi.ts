// src/config/assignmentApi.ts
import { apiRequest } from './api';

// ============ Core Types ============
export interface Assignment {
  id: number;
  title: string;
  course: string;
  course_id: number;
  due_date: string;
  submissions: number;
  graded: number;
  average_grade: number;
  max_grade: number;
  status: 'active' | 'completed' | 'draft';
  created_at: string;
  description?: string;
  instructions?: string;
  updated_at?: string;
  attachments?: any[];
}

export interface AssignmentStats {
  total: number;
  pending: number;
  total_submissions: number;
  average_grade: number;
}

export interface Course {
  id: number;
  title: string;
  student_count: number;
  class_name?: string;
}

// ============ Submission Types ============
export interface SubmissionAttachment {
  id: number;
  name: string;
  url: string;
  type: string;
  size: number;

}

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  student_name?: string;
  content?: string;
  attachments: any[];
  submitted_at: string;
  grade?: number;
  feedback?: string;
  graded_at?: string;
  graded_by?: number;
  status: string;
}

// Extended Assignment type with submissions
export interface AssignmentWithSubmissions {
  id: number;
  title: string;
  description: string;
  instructions?: string;
  course_id: number;
  course_name: string;
  due_date: string;
  max_score: number;  // Make sure this matches your backend
  max_grade?: number; // Some backends use max_grade
  status: string;
  created_at: string;
  updated_at?: string;
  attachments: any[];
  submissions: Submission[]; // This must be an array, not a number
}
// ============ API Methods ============
export const assignmentApi = {
  // ===== Assignment Management =====
  // Get all assignments for teacher
  getAssignments: async (): Promise<{ success: boolean; data: Assignment[] }> => {
    try {
      const response = await apiRequest('/teacher/assignments', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  },

  // Get single assignment details
  getAssignment: async (id: number): Promise<{ success: boolean; data: Assignment }> => {
    try {
      const response = await apiRequest(`/teacher/assignments/${id}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching assignment:', error);
      throw error;
    }
  },

  // Get assignment with submissions for grading
   getAssignmentWithSubmissions: async (id: number): Promise<{ success: boolean; data: AssignmentWithSubmissions }> => {
    try {
      const response = await apiRequest(`/teacher/assignments/${id}/grading`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching assignment for grading:', error);
      throw error;
    }
  },
  // Get courses for filter dropdown
  getCourses: async (): Promise<{ success: boolean; data: Course[] }> => {
    try {
      const response = await apiRequest('/teacher/courses', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Create new assignment
  createAssignment: async (data: any): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const response = await apiRequest('/teacher/assignments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw error;
    }
  },

  // Save as draft
  saveAssignmentDraft: async (data: any): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const response = await apiRequest('/teacher/assignments/draft', {
        method: 'POST',
        body: JSON.stringify({ ...data, is_published: false }),
      });
      return response;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error;
    }
  },

  // Delete assignment
  deleteAssignment: async (id: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest(`/teacher/assignments/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Error deleting assignment:', error);
      throw error;
    }
  },

  // Duplicate assignment
  duplicateAssignment: async (id: number): Promise<{ success: boolean; data: Assignment }> => {
    try {
      const response = await apiRequest(`/teacher/assignments/${id}/duplicate`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Error duplicating assignment:', error);
      throw error;
    }
  },

  // Get assignment stats
  getAssignmentStats: async (): Promise<{ success: boolean; data: AssignmentStats }> => {
    try {
      const response = await apiRequest('/teacher/assignments/stats', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching assignment stats:', error);
      throw error;
    }
  },

  // ===== Submission Management =====
  // Get submission details
  getSubmission: async (submissionId: number): Promise<{ success: boolean; data: Submission }> => {
    try {
      const response = await apiRequest(`/teacher/submissions/${submissionId}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching submission:', error);
      throw error;
    }
  },

  // Grade a submission
  gradeSubmission: async (data: {
    submissionId: number;
    grade: number;
    feedback?: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest('/teacher/submissions/grade', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error grading submission:', error);
      throw error;
    }
  }
};