// src/config/activityApi.ts
import { apiRequest } from "./api";

export interface Activity {
  id: number;
  type:
    | "assignment"
    | "exam"
    | "submission"
    | "grade"
    | "announcement"
    | "enrollment"
    | "course"
    | "payment"
    | "student"
    | "report";
  title: string;
  description: string;
  course?: string;
  time: string;
  icon: string;
  color: string;
  data?: any;
}

export interface ActivityStats {
  today: number;
  yesterday: number;
  lastWeek: number;
  total: number;
}

export interface ActivityFilters {
  id: string;
  title: string;
  icon: string;
}

export const activityFilters: ActivityFilters[] = [
  { id: "all", title: "همه", icon: "grid" },
  { id: "assignments", title: "تکالیف", icon: "document-text" },
  { id: "exams", title: "آزمون‌ها", icon: "clipboard" },
  { id: "grades", title: "نمرات", icon: "star" },
  { id: "announcements", title: "اعلان‌ها", icon: "megaphone" },
  { id: "payments", title: "پرداخت‌ها", icon: "cash" },
];

export const activityApi = {
  // Get all activities for teacher
  getActivities: async (): Promise<{ success: boolean; data: Activity[] }> => {
    const response = await apiRequest("/teacher/activities", {
      method: "GET",
    });
    return response;
  },

  // Get activity statistics
  getActivityStats: async (): Promise<{
    success: boolean;
    data: ActivityStats;
  }> => {
    const response = await apiRequest("/teacher/activities/stats", {
      method: "GET",
    });
    return response;
  },

  // Get filtered activities by type
  getActivitiesByType: async (
    type: string,
  ): Promise<{ success: boolean; data: Activity[] }> => {
    const response = await apiRequest(`/teacher/activities?type=${type}`, {
      method: "GET",
    });
    return response;
  },
};
