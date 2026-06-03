// src/config/courseApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  teacher_id: number;
  teacher_name: string;
  teacher_image?: string;
  class_id: number | null;
  class_name?: string;
  subject_id: number | null;
  subject_name?: string;
  is_general: boolean;
  is_active: boolean;
  student_count: number;
  lessons_count: number;
  duration: number;
  created_at: string;
  updated_at: string;
}

export interface CourseStats {
  total: number;
  active: number;
  inactive: number;
  general: number;
  class: number;
  avg_students_per_course: number;
}

export interface CreateCourseData {
  title: string;
  description: string;
  subject?: string;
  duration?: number;
  schedule?: string;
  capacity?: number;
  thumbnail?: string;
  classId?: number | null;
  teacherId: number;
  objectives?: string[];
  requirements?: string[];
  is_general?: boolean;
  isActive?: boolean;
}

export interface DropdownItem {
  id: number;
  name: string;
}

export const courseApi = {
  // Get all courses
  getCourses: async (params?: {
    status?: string;
    type?: string;
  }): Promise<{ success: boolean; data: Course[] }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      let url = `${BASE_URL}/admin/courses`;

      if (params) {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append("status", params.status);
        if (params.type) queryParams.append("type", params.type);
        if (queryParams.toString()) url += `?${queryParams.toString()}`;
      }

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
      console.error("Error fetching courses:", error);
      return { success: false, data: [] };
    }
  },

  // Get single course
  getCourse: async (
    id: number,
  ): Promise<{ success: boolean; data: Course }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/courses/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching course:", error);
      return { success: false, data: null as any };
    }
  },

  // Get course stats
  getCourseStats: async (): Promise<{
    success: boolean;
    data: CourseStats;
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/courses/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching course stats:", error);
      return { success: false, data: null as any };
    }
  },

  // Create course
  createCourse: async (
    data: CreateCourseData,
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/courses`, {
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
      console.error("Error creating course:", error);
      return { success: false, message: "خطا در ایجاد دوره" };
    }
  },

  // Update course
  updateCourse: async (
    id: number,
    data: Partial<CreateCourseData>,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/courses/${id}`, {
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
      console.error("Error updating course:", error);
      return { success: false, message: "خطا در به‌روزرسانی دوره" };
    }
  },

  // Toggle course status (activate/deactivate)
  toggleCourseStatus: async (
    id: number,
  ): Promise<{
    success: boolean;
    message: string;
    data?: { isActive: boolean };
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/courses/${id}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error toggling course status:", error);
      return { success: false, message: "خطا در تغییر وضعیت دوره" };
    }
  },

  // Delete course
  deleteCourse: async (
    id: number,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/courses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error deleting course:", error);
      return { success: false, message: "خطا در حذف دوره" };
    }
  },

  // Get classes for dropdown
  getClasses: async (): Promise<{ success: boolean; data: DropdownItem[] }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/dropdown/classes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching classes:", error);
      return { success: false, data: [] };
    }
  },

  // Get teachers for dropdown
  getTeachers: async (): Promise<{
    success: boolean;
    data: DropdownItem[];
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/dropdown/teachers`, {
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

  // Get subjects for dropdown
  getSubjects: async (): Promise<{
    success: boolean;
    data: DropdownItem[];
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/dropdown/subjects`, {
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
      return { success: false, data: [] };
    }
  },
};
