// src/config/gradeApi.ts
import { apiRequest } from "./api";

// Afghan Persian (Dari) month names
export const AFGHAN_MONTHS = [
  "حمل",
  "ثور",
  "جوزا",
  "سرطان",
  "اسد",
  "سنبله",
  "میزان",
  "عقرب",
  "قوس",
  "جدی",
  "دلو",
  "حوت",
];

export type ExamType = "monthly" | "half_yearly" | "final";

export interface Student {
  id: number;
  name: string;
  rollNumber: string;
  grade: string;
  score: number;
  maxScore: number;
  classId: number;
  className?: string;
}

export interface GradeScale {
  value: string;
  label: string;
  minScore: number;
  maxScore: number;
}

export const GRADE_SCALE: GradeScale[] = [
  { value: "A", label: "A (۹۰-۱۰۰)", minScore: 90, maxScore: 100 },
  { value: "B+", label: "B+ (۸۵-۸۹)", minScore: 85, maxScore: 89 },
  { value: "B", label: "B (۸۰-۸۴)", minScore: 80, maxScore: 84 },
  { value: "C+", label: "C+ (۷۵-۷۹)", minScore: 75, maxScore: 79 },
  { value: "C", label: "C (۷۰-۷۴)", minScore: 70, maxScore: 74 },
  { value: "D", label: "D (۶۰-۶۹)", minScore: 60, maxScore: 69 },
  { value: "F", label: "F (زیر ۶۰)", minScore: 0, maxScore: 59 },
];

export interface Exam {
  id: number;
  name: string;
  type: ExamType;
  subject: string;
  classId: number;
  className: string;
  month?: number; // 0-11 for monthly exams
  year?: number;
  maxScore: number;
  date: string;
  isPublished: boolean;
}

export interface GradeEntry {
  studentId: number;
  examId: number;
  score: number;
  grade?: string;
  feedback?: string;
}

export interface GradeStatistics {
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passingCount: number;
  totalStudents: number;
  distribution: Record<string, number>;
}

export const gradeApi = {
  // Get students by class for grade entry
  getStudentsByClass: async (
    classId: number,
  ): Promise<{ success: boolean; data: Student[] }> => {
    try {
      const response = await apiRequest(
        `/teacher/classes/${classId}/students`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching students for grading:", error);
      throw error;
    }
  },

  // Get exams for a class
  getExamsByClass: async (
    classId: number,
  ): Promise<{ success: boolean; data: Exam[] }> => {
    try {
      const response = await apiRequest(`/teacher/classes/${classId}/exams`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching exams:", error);
      throw error;
    }
  },

  // Create a new exam
  createExam: async (data: {
    name: string;
    type: ExamType;
    subject: string;
    classId: number;
    month?: number;
    year?: number;
    maxScore: number;
    date: string;
  }): Promise<{ success: boolean; data: Exam }> => {
    try {
      const response = await apiRequest("/teacher/exams", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error("Error creating exam:", error);
      throw error;
    }
  },

  // Save grades for an exam
  saveGrades: async (data: {
    examId: number;
    grades: GradeEntry[];
  }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest("/teacher/grades", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error("Error saving grades:", error);
      throw error;
    }
  },

  // Get grades for an exam
  getGradesByExam: async (
    examId: number,
  ): Promise<{ success: boolean; data: GradeEntry[] }> => {
    try {
      const response = await apiRequest(`/teacher/exams/${examId}/grades`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching grades:", error);
      throw error;
    }
  },

  // Get grade statistics for an exam
  getGradeStatistics: async (
    examId: number,
  ): Promise<{ success: boolean; data: GradeStatistics }> => {
    try {
      const response = await apiRequest(`/teacher/exams/${examId}/statistics`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching grade statistics:", error);
      throw error;
    }
  },
};

export function calculateGradeFromScore(score: number): string {
  const scale = GRADE_SCALE.find(
    (g) => score >= g.minScore && score <= g.maxScore,
  );
  return scale?.value || "F";
}

export function getGradeColor(grade: string): string {
  const colors: Record<string, string> = {
    A: "#4CAF50",
    "B+": "#8BC34A",
    B: "#FFC107",
    "C+": "#FF9800",
    C: "#FF5722",
    D: "#F44336",
    F: "#9E9E9E",
  };
  return colors[grade] || "#607D8B";
}
