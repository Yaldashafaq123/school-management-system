// src/config/attendanceApi.ts
import { apiRequest } from './api';

export interface Student {
  id: number;
  name: string;
  rollNumber: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  profile_image?: string;
  email?: string;
  phone?: string;
}

export interface ClassInfo {
  className: string;
  section: string;
  academicYear: string;
  totalStudents: number;
}

export interface AttendanceData {
  date: string;
  classId: number;
  students: { id: number; status: string }[];
  notes?: string;
}

export interface AttendanceResponse {
  success: boolean;
  data: {
    students: Student[];
    className: string;
    section: string;
    academicYear: string;
    totalStudents: number;
    hasExistingAttendance: boolean;
  };
}

export const attendanceApi = {
  // Get students by class ID for attendance marking
  getStudentsByClass: async (classId: number, date?: Date): Promise<AttendanceResponse> => {
    try {
      const formattedDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const response = await apiRequest(`/attendance/class/${classId}?date=${formattedDate}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching students for attendance:', error);
      throw error;
    }
  },

  // Submit attendance
  submitAttendance: async (data: AttendanceData): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest('/attendance', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error submitting attendance:', error);
      throw error;
    }
  },

  // Get attendance history for a class
  getAttendanceHistory: async (classId: number, days: number = 30): Promise<{ success: boolean; data: any[] }> => {
    try {
      const response = await apiRequest(`/attendance/history/${classId}?days=${days}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      throw error;
    }
  }
};