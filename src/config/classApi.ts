// src/config/classApi.ts - COMPLETE MERGED FILE
import { apiRequest } from './api';

// ============ Core Types ============
export interface ClassStudent {
  id: number;
  fullName: string;
  rollNumber: string;
  attendance_rate: number;
  average_grade: string;
  profileImage?: string;
  email?: string;
}

export interface AttendanceHistoryItem {
  date: string;
  present: number;
  absent: number;
  late: number;
  excused?: number;
}

export interface ClassDetails {
  id: number;
  name: string;
  section?: string;
  grade: string;
  academicYear?: {
    id: number;
    name: string;
    isActive: boolean;
  };
  teacher?: string;
  totalStudents: number;
  students: ClassStudent[];
  attendanceHistory: AttendanceHistoryItem[];
  averageAttendance: number;
  pendingAssignments: number;
  stats?: {
    totalStudents: number;
    totalAssignments: number;
    totalExams: number;
    totalCourses?: number;
  };
  subjects?: string[];
  upcomingAssignments?: any[];
  upcomingExams?: any[];
  recentAttendances?: any[];
}

export interface ClassSummary {
  totalClasses: number;
  supervised: number;
  teaching: number;
}

export interface ClassItem {
  id: number;
  name: string;
  grade: string;
  section?: string;
  studentCount: number;
  subjects?: string[];
}

// ============ Assignment Types ============
export interface Course {
  id: number;
  title: string;
  student_count: number;
  class_id?: number;
  class_name?: string;
  created_at?: string;
}

export interface CreateAssignmentData {
  title: string;
  courseId: number;
  type: string;
  description: string;
  instructions?: string;
  max_points: number;
  dueDate: string;
  allow_late_submission: boolean;
  allow_resubmission: boolean;
  notify_students: boolean;
  is_published: boolean;
  attachments?: string[];
}

// ============ Combined API Object ============
export const classApi = {
  // ===== Class Management APIs =====
  // Get all classes for the logged-in teacher
  getMyClasses: async (): Promise<{
    success: boolean;
    data: ClassItem[];
    summary?: ClassSummary;
  }> => {
    try {
      const response = await apiRequest("/teacher/classes", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error in getMyClasses:", error);
      throw error;
    }
  },

  // Get single class details with students and attendance
  getClassDetails: async (
    id: number,
  ): Promise<{ success: boolean; data: ClassDetails }> => {
    try {
      const response = await apiRequest(`/teacher/classes/${id}/details`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error in getClassDetails:', error);
      throw error;
    }
  },

  // Get students in a class (simplified list)
  getClassStudents: async (
    id: number,
  ): Promise<{ success: boolean; data: ClassStudent[] }> => {
    try {
      const response = await apiRequest(`/teacher/classes/${id}/students`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error in getClassStudents:", error);
      throw error;
    }
  },

  // Get attendance history for a class
  getAttendanceHistory: async (
    id: number,
    days: number = 7,
  ): Promise<{
    success: boolean;
    data: AttendanceHistoryItem[];
  }> => {
    try {
      const response = await apiRequest(
        `/teacher/classes/${id}/attendance?days=${days}`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error in getAttendanceHistory:", error);
      throw error;
    }
  },

  // Mark attendance for a class
  markAttendance: async (data: {
    classId: number;
    date: string;
    students: { studentId: number; status: string }[];
    notes?: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest("/attendance/mark", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error("Error in markAttendance:", error);
      throw error;
    }
  },

  // ===== Assignment APIs =====
  // Get courses for teacher
  getTeacherCourses: async (): Promise<{ success: boolean; data: Course[] }> => {
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
  createAssignment: async (data: CreateAssignmentData): Promise<{ success: boolean; message: string; data?: any }> => {
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
  saveAssignmentDraft: async (data: CreateAssignmentData): Promise<{ success: boolean; message: string; data?: any }> => {
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
  }
};

// ============ Helper Functions ============
// Helper function to get subject color
export function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    ریاضی: "#4CAF50",
    فیزیک: "#2196F3",
    شیمی: "#FF9800",
    زیست: "#9C27B0",
    ادبیات: "#E91E63",
    تاریخ: "#795548",
    جغرافیا: "#009688",
    دینی: "#673AB7",
    عربی: "#FF5722",
    زبان: "#3F51B5",
    هنر: "#FFC107",
    ورزش: "#CDDC39",
    کامپیوتر: "#607D8B",
  };
  return colors[subject] || "#607D8B";
}

// ============ Backward Compatibility ============
// Keep assignmentApi export for backward compatibility if needed
export const assignmentApi = {
  getTeacherCourses: classApi.getTeacherCourses,
  createAssignment: classApi.createAssignment,
  saveAssignmentDraft: classApi.saveAssignmentDraft
};