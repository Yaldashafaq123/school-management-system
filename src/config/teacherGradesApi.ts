// src/config/teacherGradesApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest} from "./api";

const getToken = async () => {
  return await AsyncStorage.getItem("token");
};

const request = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getToken();
  const response = await fetch(`${apiRequest}/api/teacher${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

export const teacherGradesApi = {
  getStats: async () => {
    return request("/grades/stats");
  },

  getSubjectsForGrading: async (classId: number) => {
    return request(`/classes/${classId}/subjects`);
  },

  getOrCreateExam: async (params: {
    classId: number;
    subjectId: number;
    examType: string;
    month?: number;
    year?: number;
  }) => {
    return request("/exams/get-or-create", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  saveExamGrades: async (params: {
    examId: number;
    grades: { studentId: number; score: number; feedback?: string }[];
    publishResults: boolean;
  }) => {
    return request("/exams/save-grades", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  getExamForGrading: async (examId: number) => {
    return request(`/exams/${examId}/grading`);
  },

  publishExamResults: async (examId: number, announcement?: string) => {
    return request(`/exams/${examId}/publish`, {
      method: "POST",
      body: JSON.stringify({ announcement }),
    });
  },

  getFinalGrades: async (classId: number, academicYearId: number) => {
    return request(`/classes/${classId}/final-grades/${academicYearId}`);
  },
};
