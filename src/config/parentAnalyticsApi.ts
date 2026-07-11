// src/config/parentAnalyticsApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

export interface Child {
  id: number;
  name: string;
  class: string;
  classId: number;
  profileImage?: string | null;
}

export interface SubjectAnalytics {
  subjectName: string;
  currentAverage: number | null;
  previousAverage: number | null;
  growth: number | null;
  classAverage: number | null;
  schoolAverage: number | null;
  classification: string;
  hasData: boolean;
}

export interface StudentAnalyticsResponse {
  studentId: number;
  studentName: string;
  className: string;
  academicYear: string;
  hasAnalytics: boolean;

  readiness: {
    score: number | null;
    confidence: string;
    dataCompleteness: number;
    components: {
      attendance: number | null;
      assignments: number | null;
      weeklyAssessments: number | null;
      monthlyExams: number | null;
      halfYearExams: number | null;
      growth: number | null;
    };
  };

  attendance: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    score: number | null;
  };

  growth: {
    score: number | null;
    percentage: number;
    direction: string;
  };

  trend: {
    direction: string;
    percentage: number;
    hasData: boolean;
  };

  rankings: {
    class: { rank: number; total: number };
    school: { rank: number; total: number };
    percentile: { value: number; label: string };
  };

  risk: {
    level: string;
    factors: string[];
  };

  subjects: SubjectAnalytics[];
  recommendations: { priority: string; message: string }[];
  predictedFinal: {
    min: number | null;
    max: number | null;
    confidence: number;
  };
  behaviorMetrics: { classAverage: number; schoolAverage: number };
}

export const parentAnalyticsApi = {
  // Get children with analytics data
  getChildren: async (): Promise<{
    success: boolean;
    data: { children: Child[]; activeChildId: number | null };
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/parent/analytics/children`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (result.success && result.data) {
        return result;
      }
      return { success: false, data: { children: [], activeChildId: null } };
    } catch (error) {
      console.error("Error fetching children:", error);
      return { success: false, data: { children: [], activeChildId: null } };
    }
  },

  // Get student analytics
  getStudentAnalytics: async (
    childId: number,
  ): Promise<{
    success: boolean;
    data: StudentAnalyticsResponse | null;
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/parent/analytics/student/${childId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const result = await response.json();

      if (result.success && result.data) {
        return result;
      }
      return { success: false, data: null };
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return { success: false, data: null };
    }
  },

  // Set active child
  setActiveChild: async (
    childId: number,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/parent/children/active`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ childId }),
      });
      const result = await response.json();

      if (result.success) {
        await AsyncStorage.setItem("active_child_id", childId.toString());
      }

      return result;
    } catch (error) {
      console.error("Error setting active child:", error);
      return { success: false, message: "خطا در تغییر فرزند فعال" };
    }
  },

  // Get stored active child ID
  getStoredActiveChildId: async (): Promise<number | null> => {
    try {
      const id = await AsyncStorage.getItem("active_child_id");
      return id ? parseInt(id) : null;
    } catch (error) {
      console.error("Error getting stored active child:", error);
      return null;
    }
  },
};
