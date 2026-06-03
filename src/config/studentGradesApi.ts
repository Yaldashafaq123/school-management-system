// src/config/studentGradesApi.ts
import { apiRequest } from "./api";

export interface Grade {
  id: number;
  examId: number;
  studentId: number;
  subject: string;
  marks: number;
  feedback?: string;
  createdAt: string;
  exam: {
    id: number;
    name: string;
    type: "monthly" | "half_yearly" | "final";
    month?: number;
    year?: number;
    maxScore: number;
    date: string;
  };
}

export interface Term {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface SubjectGrade {
  id: number;
  subject: string;
  teacher?: string;
  // Exam grades (converted to 20-point scale for display)
  firstExam?: number | null;
  secondExam?: number | null;
  finalExam?: number | null;
  homework?: number | null;
  project?: number | null;
  participation?: number | null;

  // Raw scores (original values)
  monthly?: number;
  halfYearly?: number;
  final?: number;

  total: number;
  average: number;
  rank?: number;
  status: string; // Can be any string status
  examIds?: {
    firstExamId?: number;
    secondExamId?: number;
    finalExamId?: number;
  };
}

export interface TermGrades {
  term: Term;
  subjects: SubjectGrade[];
  overallAverage: number;
  classRank?: number;
  totalStudents?: number;
  attendanceRate?: number;
}

export interface GradesData {
  terms: Term[];
  currentTermGrades: TermGrades | null;
  allTermsGrades: Record<number, TermGrades>;
}

// Helper functions for grade calculations
export const calculateAverage = (
  ...grades: (number | null | undefined)[]
): number => {
  const validGrades = grades.filter(
    (g) => g !== null && g !== undefined,
  ) as number[];
  if (validGrades.length === 0) return 0;
  const sum = validGrades.reduce((acc, g) => acc + g, 0);
  return parseFloat((sum / validGrades.length).toFixed(2));
};

export const getGradeStatus = (
  average: number,
): "excellent" | "good" | "average" | "poor" | "fail" => {
  if (average >= 17) return "excellent";
  if (average >= 15) return "good";
  if (average >= 12) return "average";
  if (average >= 10) return "poor";
  return "fail";
};

// Color helper functions
export const getGradeColor = (grade: number | null | undefined): string => {
  if (grade === null || grade === undefined) return "#9E9E9E";
  if (grade >= 17) return "#10b981";
  if (grade >= 14) return "#f59e0b";
  return "#ef4444";
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "pass":
    case "excellent":
      return "#10b981";
    case "good":
      return "#3b82f6";
    case "average":
      return "#f59e0b";
    case "conditional":
    case "poor":
      return "#f97316";
    case "fail":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case "pass":
      return "قبول";
    case "fail":
      return "مردود";
    case "conditional":
      return "مشروط";
    case "excellent":
      return "عالی";
    case "good":
      return "خوب";
    case "average":
      return "متوسط";
    case "poor":
      return "نیاز به تلاش";
    default:
      return "نامشخص";
  }
};

export const getDisplayGrade = (
  grade: number | null | undefined,
): string | number => {
  if (grade === null || grade === undefined) return "-";
  return typeof grade.toFixed === "function" ? grade.toFixed(1) : grade;
};

// API functions
export const studentGradesApi = {
  // Get all terms for the student
  getTerms: async (): Promise<{ success: boolean; data: Term[] }> => {
    try {
      const response = await apiRequest("/student/grades/terms", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching terms:", error);
      throw error;
    }
  },

  // Get grades for a specific term
  getTermGrades: async (
    termId: number,
  ): Promise<{ success: boolean; data?: TermGrades; error?: string }> => {
    try {
      const response = await apiRequest(`/student/grades/term/${termId}`, {
        method: "GET",
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Error fetching term grades:", error);
      return { success: false, error: error.message };
    }
  },

  // Get all grades data
  getAllGrades: async (): Promise<{
    success: boolean;
    data?: GradesData;
    error?: string;
  }> => {
    try {
      const response = await apiRequest("/student/grades", {
        method: "GET",
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Error fetching all grades:", error);
      return { success: false, error: error.message };
    }
  },

  // Get current term grades
  getCurrentTermGrades: async (): Promise<{
    success: boolean;
    data: TermGrades | null;
  }> => {
    try {
      const response = await apiRequest("/student/grades/current", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching current term grades:", error);
      throw error;
    }
  },
};
