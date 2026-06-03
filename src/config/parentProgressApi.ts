// src/config/parentProgressApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

export interface StudentInfo {
  id: number;
  name: string;
  className: string;
  academicYear?: string;
  profileImage?: string;
}

export interface OverallStats {
  average: number;
  letterGrade: string;
  subjectsCount: number;
  examsCount: number;
  assignmentsCount: number;
  assignmentsAvg: number;
}

export interface SubjectPerformance {
  name: string;
  grade: string;
  score: number;
  average: number;
  color: string;
  examsCount: number;
  grades: number[];
}

export interface ChartData {
  labels: string[];
  data: number[];
  colors: string[];
}

export interface ExamBreakdown {
  examName: string;
  subject: string;
  score: number;
  maxScore: number;
  percentage: number;
  date: string;
  feedback?: string;
}

export interface ChildProgress {
  student: StudentInfo;
  overall: OverallStats;
  subjects: SubjectPerformance[];
  chartData: ChartData;
  teacherComment: string;
  examBreakdown: ExamBreakdown[];
}

export interface SubjectDetail {
  subject: string;
  average: number;
  percentage: number;
  letterGrade: string;
  color: string;
  performanceHistory: {
    examName: string;
    score: number;
    maxScore: number;
    percentage: number;
    date: string;
    feedback?: string;
  }[];
  totalExams: number;
}

export const parentProgressApi = {
  // Get child progress overview
  getChildProgress: async (
    childId: number,
  ): Promise<{ success: boolean; data: ChildProgress }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/parent/progress/${childId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching child progress:", error);
      return { success: false, data: null as any };
    }
  },

  // Get subject-specific performance
  getSubjectPerformance: async (
    childId: number,
    subject: string,
  ): Promise<{ success: boolean; data: SubjectDetail }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/parent/progress/${childId}/subject/${encodeURIComponent(subject)}`,
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
      console.error("Error fetching subject performance:", error);
      return { success: false, data: null as any };
    }
  },
};
