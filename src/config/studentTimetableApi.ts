// src/config/studentTimetableApi.ts
import { apiRequest } from "./api";

export interface TimetableEntry {
  id: number;
  day: number;
  period: number;
  subject: string;
  teacher: string;
  room: string;
  color: string;
  startTime: string;
  endTime?: string;
}

export interface WeeklySummary {
  totalClasses: number;
  totalMinutes: number;
  uniqueTeachers: number;
  subjectsPerDay: Record<number, number>;
}

export interface TimetableData {
  entries: TimetableEntry[];
  days: string[];
  periods: string[];
  summary: WeeklySummary;
  classInfo: {
    className: string;
    section?: string;
    academicYear?: string;
  };
}

export const studentTimetableApi = {
  // Get student's weekly timetable
  getWeeklyTimetable: async (): Promise<{
    success: boolean;
    data: TimetableData;
  }> => {
    try {
      // Make sure the URL matches your backend route
      const response = await apiRequest("/student/timetable/weekly", {
        method: "GET",
      });

      console.log("✅ Timetable API response:", response);
      return response;
    } catch (error) {
      console.error("❌ Error fetching weekly timetable:", error);
      // Return empty data structure on error
      return {
        success: false,
        data: {
          entries: [],
          days: PERSIAN_DAYS,
          periods: TIME_PERIODS,
          summary: {
            totalClasses: 0,
            totalMinutes: 0,
            uniqueTeachers: 0,
            subjectsPerDay: {},
          },
          classInfo: {
            className: "",
            section: "",
            academicYear: "",
          },
        },
      };
    }
  },

  // Get timetable for a specific day
  getDayTimetable: async (
    day: number,
  ): Promise<{ success: boolean; data: TimetableEntry[] }> => {
    try {
      const response = await apiRequest(`/student/timetable/day/${day}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching day timetable:", error);
      return { success: false, data: [] };
    }
  },

  // Get timetable for current week
  getCurrentWeek: async (): Promise<{
    success: boolean;
    data: TimetableData;
  }> => {
    try {
      const response = await apiRequest("/student/timetable/current", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching current week:", error);
      return {
        success: false,
        data: {
          entries: [],
          days: PERSIAN_DAYS,
          periods: TIME_PERIODS,
          summary: {
            totalClasses: 0,
            totalMinutes: 0,
            uniqueTeachers: 0,
            subjectsPerDay: {},
          },
          classInfo: {
            className: "",
            section: "",
            academicYear: "",
          },
        },
      };
    }
  },
};

// Persian days
export const PERSIAN_DAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
];

// Time periods (7 periods)
export const TIME_PERIODS = [
  "۷:۳۰ - ۸:۱۵",
  "۸:۱۵ - ۹:۰۰",
  "۹:۰۰ - ۹:۴۵",
  "۱۰:۰۰ - ۱۰:۴۵",
  "۱۰:۴۵ - ۱۱:۳۰",
  "۱۱:۳۰ - ۱۲:۱۵",
  "۱۲:۱۵ - ۱۳:۰۰",
];

// Helper function to get color based on subject
export function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    ریاضی: "#3B82F6",
    فیزیک: "#10B981",
    شیمی: "#F59E0B",
    ادبیات: "#8B5CF6",
    دینی: "#EC4899",
    "زبان انگلیسی": "#06B6D4",
    ورزش: "#22C55E",
    هنر: "#F97316",
    علوم: "#84CC16",
    "زبان عربی": "#14B8A6",
    کامپیوتر: "#6366F1",
    مطالعات: "#A855F7",
    تاریخ: "#8B5CF6",
    جغرافیا: "#84CC16",
    هندسه: "#3B82F6",
    آمار: "#F59E0B",
    تفسیر: "#8B5CF6",
    کیمیا: "#F59E0B",
    بیولوژی: "#10B981",
    عقاید: "#EC4899",
    دری: "#06B6D4",
    پشتو: "#14B8A6",
    سپورت: "#22C55E",
    جغرافیه: "#84CC16",
  };
  return colors[subject] || "#6B7280";
}
