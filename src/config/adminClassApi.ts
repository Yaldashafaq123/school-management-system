// src/config/adminClassApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

export interface ClassItem {
  id: number;
  name: string;
  grade?: string;
  section: string;
  students: number;
  classTeacher: string;
  teacherId?: number;
  teacherImage?: string;
  room?: string;
  subjects?: string[];
  capacity: string;
  academicYear?: string;
  isActive?: boolean;
}

export interface Teacher {
  id: number;
  name: string;
  profileImage?: string;
  subjects?: string[];
}

export interface Subject {
  id: number;
  name: string;
}

export interface ClassesResponse {
  classes: ClassItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const adminClassApi = {
  // Get all classes with filters
  getClasses: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    grade?: string;
    teacherId?: number;
  }): Promise<{ success: boolean; data: ClassesResponse }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      if (!token) {
        console.error("No token found");
        return {
          success: false,
          data: { classes: [], total: 0, page: 1, limit: 20, totalPages: 0 },
        };
      }

      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.grade) queryParams.append("grade", params.grade);
      if (params?.teacherId)
        queryParams.append("teacherId", params.teacherId.toString());

      const url = `${BASE_URL}/admin/classes${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("HTTP error:", response.status);
        return {
          success: false,
          data: { classes: [], total: 0, page: 1, limit: 20, totalPages: 0 },
        };
      }

      const result = await response.json();

      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
        };
      }

      return {
        success: false,
        data: { classes: [], total: 0, page: 1, limit: 20, totalPages: 0 },
      };
    } catch (error) {
      console.error("Error fetching classes:", error);
      return {
        success: false,
        data: { classes: [], total: 0, page: 1, limit: 20, totalPages: 0 },
      };
    }
  },

  // Get single class
  getClass: async (id: number): Promise<{ success: boolean; data: any }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/classes/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching class:", error);
      return { success: false, data: null };
    }
  },

  // ✅ FIXED: Create class with proper teacherId handling and correct payload structure
  createClass: async (data: {
    name: string;
    section: string;
    teacherId?: number | null;
    capacity: string;
  }): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      // Build payload correctly for backend expectations
      const payload: {
        grade: string;
        section: string;
        teacherId: number | null;
        capacity: number;
      } = {
        grade: data.name,        // ← Send as 'grade' not 'name' for backend
        section: data.section,
        teacherId: data.teacherId ? Number(data.teacherId) : null,  // ← Convert to number, ensure null not undefined
        capacity: parseInt(data.capacity) || 40,
      };

      console.log("Creating class with payload:", payload);

      const response = await fetch(`${BASE_URL}/admin/classes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error("Create class error response:", result);
        return { 
          success: false, 
          message: result.message || "خطا در ایجاد صنف",
          data: null 
        };
      }
      
      return result;
    } catch (error) {
      console.error("Error creating class:", error);
      return { success: false, message: "خطا در ایجاد صنف", data: null };
    }
  },

  // Update class
  updateClass: async (
    id: number,
    data: {
      name?: string;
      section?: string;
      teacherId?: number | null;
      capacity?: string;
    },
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const payload: {
        grade?: string;
        section?: string;
        teacherId?: number | null;
        capacity?: number;
      } = {};
      
      // Map name to grade for consistency with backend
      if (data.name !== undefined) payload.grade = data.name;
      if (data.section !== undefined) payload.section = data.section;
      if (data.teacherId !== undefined) payload.teacherId = data.teacherId ? Number(data.teacherId) : null;
      if (data.capacity !== undefined) payload.capacity = parseInt(data.capacity);

      const response = await fetch(`${BASE_URL}/admin/classes/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating class:", error);
      return { success: false, message: "خطا در به‌روزرسانی صنف" };
    }
  },

  // Delete class
  deleteClass: async (
    id: number,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/classes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error deleting class:", error);
      return { success: false, message: "خطا در حذف صنف" };
    }
  },

  // Get teachers list
  getTeachers: async (): Promise<{ success: boolean; data: Teacher[] }> => {
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

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }
      return { success: false, data: [] };
    } catch (error) {
      console.error("Error fetching teachers:", error);
      return { success: false, data: [] };
    }
  },

  // Get grades list
  getGrades: async (): Promise<{ success: boolean; data: string[] }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/grades`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }
      return { success: false, data: [] };
    } catch (error) {
      console.error("Error fetching grades:", error);
      return { success: false, data: [] };
    }
  },
};