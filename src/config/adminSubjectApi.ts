// src/config/adminSubjectApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

export interface Subject {
  id: number;
  name: string;
  description: string;
  teacherId?: number | null;
  teacherName?: string;
  classes?: { id: number; name: string; section?: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectStats {
  total: number;
}

export interface SubjectsResponse {
  subjects: Subject[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const adminSubjectApi = {
  // Get all subjects
  getSubjects: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ success: boolean; data: SubjectsResponse }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);

      const url = `${BASE_URL}/admin/subjects${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return {
        success: false,
        data: { subjects: [], total: 0, page: 1, limit: 20, totalPages: 0 },
      };
    }
  },

  // Get subject stats
  getSubjectStats: async (): Promise<{
    success: boolean;
    data: SubjectStats;
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/subjects/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching subject stats:", error);
      return { success: false, data: { total: 0 } };
    }
  },

  // Get single subject
  getSubject: async (
    id: number,
  ): Promise<{ success: boolean; data: Subject }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/subjects/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching subject:", error);
      return { success: false, data: null as any };
    }
  },

  // Get teachers list for dropdown
  getTeachers: async (): Promise<{
    success: boolean;
    data: { id: number; name: string }[];
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/teachers/list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching teachers:", error);
      return { success: false, data: [] };
    }
  },

  // Create subject
  createSubject: async (data: {
    name: string;
    description?: string;
    teacherId?: number | null;
  }): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/subjects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error creating subject:", error);
      return { success: false, message: "خطا در ایجاد مضمون" };
    }
  },

  // Update subject
  updateSubject: async (
    id: number,
    data: { name?: string; description?: string; teacherId?: number | null },
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/subjects/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating subject:", error);
      return { success: false, message: "خطا در به‌روزرسانی مضمون" };
    }
  },

  // Delete subject
  deleteSubject: async (
    id: number,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/subjects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error deleting subject:", error);
      return { success: false, message: "خطا در حذف مضمون" };
    }
  },
};
