// src/config/studentAttendanceApi.ts
import { apiRequest } from "./api";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

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
  type: "positive" | "neutral" | "warning";
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
  getAttendanceOverview: async (): Promise<{
    success: boolean;
    data: StudentAttendanceData;
  }> => {
    try {
      const response = await apiRequest("/student/attendance/overview", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching attendance overview:", error);
      throw error;
    }
  },

  // Get daily attendance for a specific month
  getDailyAttendance: async (
    month?: string,
    year?: number,
  ): Promise<{ success: boolean; data: AttendanceDay[] }> => {
    try {
      let url = "/student/attendance/daily";
      if (month && year) {
        url += `?month=${month}&year=${year}`;
      }
      const response = await apiRequest(url, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching daily attendance:", error);
      throw error;
    }
  },

  // Get monthly summaries
  getMonthlySummaries: async (): Promise<{
    success: boolean;
    data: MonthlySummary[];
  }> => {
    try {
      const response = await apiRequest("/student/attendance/monthly", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching monthly summaries:", error);
      throw error;
    }
  },

  // Get attendance analytics
  getAttendanceAnalytics: async (): Promise<{
    success: boolean;
    data: AttendanceAnalytics;
  }> => {
    try {
      const response = await apiRequest("/student/attendance/analytics", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching attendance analytics:", error);
      throw error;
    }
  },

  // Get attendance for a specific date
  getAttendanceByDate: async (
    date: string,
  ): Promise<{ success: boolean; data: AttendanceDay }> => {
    try {
      const response = await apiRequest(`/student/attendance/date/${date}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching attendance by date:", error);
      throw error;
    }
  },
};

// Helper functions
export function getStatusColor(status: AttendanceStatus): string {
  switch (status) {
    case "present":
      return "#4CAF50";
    case "absent":
      return "#F44336";
    case "late":
      return "#FF9800";
    case "excused":
      return "#2196F3";
    default:
      return "#9E9E9E";
  }
}

export function getStatusIcon(status: AttendanceStatus): string {
  switch (status) {
    case "present":
      return "checkmark-circle";
    case "absent":
      return "close-circle";
    case "late":
      return "time";
    case "excused":
      return "medical";
    default:
      return "help-circle";
  }
}

export function getStatusText(status: AttendanceStatus): string {
  switch (status) {
    case "present":
      return "حاضر";
    case "absent":
      return "غایب";
    case "late":
      return "تأخیر";
    case "excused":
      return "موجه";
    default:
      return "-";
  }
}

// Afghan Solar Hijri month names (Hamal to Hoot)
// These replace the Iranian Persian month names that were here before.
// Use these for display only — all actual date conversion is done via
// moment-jalaali in attendance.tsx, NOT via index lookups against Gregorian months.
export const afghanMonths = [
  "حمل", // 0  — starts ~March 21
  "ثور", // 1  — starts ~April 21
  "جوزا", // 2  — starts ~May 22
  "سرطان", // 3  — starts ~June 22
  "اسد", // 4  — starts ~July 23
  "سنبله", // 5  — starts ~August 23
  "میزان", // 6  — starts ~September 23
  "عقرب", // 7  — starts ~October 23
  "قوس", // 8  — starts ~November 22
  "جدی", // 9  — starts ~December 22
  "دلو", // 10 — starts ~January 21
  "حوت", // 11 — starts ~February 20
];

// Afghan weekdays (Saturday-based week, matching Afghan school schedule)
export const afghanWeekdays = [
  "شنبه", // Saturday  (0)
  "یکشنبه", // Sunday    (1)
  "دوشنبه", // Monday    (2)
  "سه‌شنبه", // Tuesday   (3)
  "چهارشنبه", // Wednesday (4)
  "پنجشنبه", // Thursday  (5)
  "جمعه", // Friday    (6) — holiday
];

// ---------------------------------------------------------------------------
// REMOVED: persianMonths array (Iranian calendar — wrong for Afghan use)
// REMOVED: persianWeekdays array (was a duplicate; use afghanWeekdays above)
// ---------------------------------------------------------------------------
