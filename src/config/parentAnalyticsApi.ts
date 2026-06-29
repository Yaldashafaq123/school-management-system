// src/config/parentAnalyticsApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

export interface ReadinessComponent {
  attendance: number | null;
  assignments: number | null;
  weeklyAssessments: number | null;
  monthlyExams: number | null;
  halfYearExams: number | null;
  growth: number | null;
}

export interface Readiness {
  score: number | null;
  components: ReadinessComponent;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  dataCompleteness: number;
}

export interface RankInfo {
  rank: number;
  total: number;
}

export interface Rankings {
  class: RankInfo;
  school: RankInfo;
  percentile: {
    score: number;
    label: string;
  };
}

export interface BehaviorMetrics {
  classAverageDifference: number;
  schoolAverageDifference: number;
  classAverage: number;
  schoolAverage: number;
  studentScore: number;
  hasData: boolean;
}

export interface HistoryDataPoint {
  month: string;
  fullMonth: string;
  average: number;
  count: number;
}

export interface ReadinessHistory {
  data: HistoryDataPoint[];
  currentScore: number | null;
  trendDirection: "IMPROVING" | "DECLINING" | "STABLE";
  trendPercentage: number;
  hasData: boolean;
}

export interface SubjectAnalytics {
  subjectId: number;
  subjectName: string;
  currentAverage: number | null;
  previousAverage: number | null;
  growth: number | null;
  classAverage: number | null;
  schoolAverage: number | null;
  classification: "STRONG" | "AVERAGE" | "WEAK" | "CRITICAL" | "NO_DATA";
  hasData: boolean;
}

export interface Risk {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  score: number;
  factors: string[];
  factorsChecked: number;
}

export interface Recommendation {
  id: number;
  type: string;
  category: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  message: string;
  actionable: boolean;
}

export interface StudentAnalyticsResponse {
  student: {
    id: number;
    name: string;
    class: string;
    rollNumber: string;
  };
  readiness: Readiness;
  rankings: Rankings;
  behaviorMetrics: BehaviorMetrics;
  readinessHistory: ReadinessHistory;
  growth: {
    score: number | null;
    percentage: number | null;
  };
  trend: {
    direction: "IMPROVING" | "DECLINING" | "STABLE";
    percentage: number;
    hasData: boolean;
    dataPoints: number;
  };
  predictedFinal: {
    min: number | null;
    max: number | null;
    confidence: number;
  };
  subjects: SubjectAnalytics[];
  risk: Risk;
  recommendations: Recommendation[];
  attendance: {
    score: number | null;
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
  };
  assignments: {
    score: number | null;
    submitted: number;
    graded: number;
    total: number;
  };
  hasAnalytics: boolean;
}

export interface Child {
  id: number;
  name: string;
  class: string;
  classId: number;
  profileImage?: string;
  active: boolean;
}

export interface ChildrenListResponse {
  children: Child[];
  activeChildId: number | null;
}

export const parentAnalyticsApi = {
  // Get all children for parent
  getChildren: async (): Promise<{
    success: boolean;
    data: ChildrenListResponse;
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/parent/children`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (result.success && result.data) {
        if (result.data.children !== undefined) {
          return result;
        }
        if (Array.isArray(result.data)) {
          return {
            success: true,
            data: {
              children: result.data,
              activeChildId: result.data.length > 0 ? result.data[0].id : null,
            },
          };
        }
      }
      return result;
    } catch (error) {
      console.error("Error fetching children:", error);
      return { success: false, data: { children: [], activeChildId: null } };
    }
  },

  // Get student analytics for a child
  getStudentAnalytics: async (
    studentId: number,
  ): Promise<{
    success: boolean;
    data?: StudentAnalyticsResponse;
    message?: string;
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/analytics/student/${studentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching student analytics:", error);
      return { success: false, message: "خطا در دریافت اطلاعات" };
    }
  },

  // Set active child
  setActiveChild: async (
    childId: number,
  ): Promise<{
    success: boolean;
    message: string;
    data?: { activeChildId: number };
  }> => {
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
