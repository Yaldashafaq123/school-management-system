// src/config/studentAttendanceApi.ts
import { apiRequest } from './api';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface SubjectAttendance {
  name: string;
  status: AttendanceStatus;
  time: string;
}

export interface AttendanceDay {
  date: string;
  dayOfWeek: string;
  status: AttendanceStatus;
  subjects: SubjectAttendance[];
}

export interface MonthlySummary {
  month: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
}

export interface AttendanceStats {
  totalDays: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalExcused: number;
  averageRate: number;
}

export interface ClassComparison {
  studentAverage: number;
  classAverage: number;
}

export interface AttendanceInsight {
  type: 'positive' | 'neutral' | 'warning';
  icon: string;
  text: string;
}

export interface AttendanceAnalytics {
  monthlyTrend: {
    labels: string[];
    data: number[];
  };
  comparison: ClassComparison;
  insights: AttendanceInsight[];
  subjectBreakdown: {
    subject: string;
    presentCount: number;
    totalClasses: number;
    rate: number;
  }[];
}

export interface StudentAttendanceData {
  stats: AttendanceStats;
  monthlySummaries: MonthlySummary[];
  dailyAttendance: AttendanceDay[];
  analytics: AttendanceAnalytics;
}

export const studentAttendanceApi = {
  // Get student attendance overview
  getAttendanceOverview: async (): Promise<{ success: boolean; data: StudentAttendanceData }> => {
    try {
      const response = await apiRequest('/student/attendance/overview', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching attendance overview:', error);
      throw error;
    }
  },

  // Get daily attendance for a specific month
  getDailyAttendance: async (month?: string, year?: number): Promise<{ success: boolean; data: AttendanceDay[] }> => {
    try {
      let url = '/student/attendance/daily';
      if (month && year) {
        url += `?month=${month}&year=${year}`;
      }
      const response = await apiRequest(url, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching daily attendance:', error);
      throw error;
    }
  },

  // Get monthly summaries
  getMonthlySummaries: async (): Promise<{ success: boolean; data: MonthlySummary[] }> => {
    try {
      const response = await apiRequest('/student/attendance/monthly', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching monthly summaries:', error);
      throw error;
    }
  },

  // Get attendance analytics
  getAttendanceAnalytics: async (): Promise<{ success: boolean; data: AttendanceAnalytics }> => {
    try {
      const response = await apiRequest('/student/attendance/analytics', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching attendance analytics:', error);
      throw error;
    }
  },

  // Get attendance for a specific date
  getAttendanceByDate: async (date: string): Promise<{ success: boolean; data: AttendanceDay }> => {
    try {
      const response = await apiRequest(`/student/attendance/date/${date}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching attendance by date:', error);
      throw error;
    }
  }
};

// Helper functions
export function getStatusColor(status: AttendanceStatus): string {
  switch (status) {
    case 'present': return '#4CAF50';
    case 'absent': return '#F44336';
    case 'late': return '#FF9800';
    case 'excused': return '#2196F3';
    default: return '#9E9E9E';
  }
}

export function getStatusIcon(status: AttendanceStatus): string {
  switch (status) {
    case 'present': return 'checkmark-circle';
    case 'absent': return 'close-circle';
    case 'late': return 'time';
    case 'excused': return 'medical';
    default: return 'help-circle';
  }
}

export function getStatusText(status: AttendanceStatus): string {
  switch (status) {
    case 'present': return 'حاضر';
    case 'absent': return 'غایب';
    case 'late': return 'تأخیر';
    case 'excused': return 'موجه';
    default: return '-';
  }
}

// Persian month names
export const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

// Persian weekdays
export const persianWeekdays = [
  'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'
];