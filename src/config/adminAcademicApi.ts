// src/config/adminAcademicApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

export interface AcademicYear {
  id: number;
  name: string;
  startDate: string; // Jalali date format: 1403/01/01
  endDate: string; // Jalali date format
  isActive: boolean;
  terms?: Term[];
  holidays?: Holiday[];
  stats?: {
    totalClasses: number;
    totalStudents: number;
  };
}

export interface Term {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  academicYearId: number;
}

export interface Holiday {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  academicYearId: number;
}

export const adminAcademicApi = {
  // Get all academic years
  getAcademicYears: async (): Promise<{
    success: boolean;
    data: AcademicYear[];
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/academic-years`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching academic years:", error);
      return { success: false, data: [] };
    }
  },

  // Get single academic year
  getAcademicYear: async (
    id: number,
  ): Promise<{ success: boolean; data: AcademicYear }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/academic-years/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching academic year:", error);
      return { success: false, data: null as any };
    }
  },

  // Create academic year
  createAcademicYear: async (data: {
    name: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
  }): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/academic-years`, {
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
      console.error("Error creating academic year:", error);
      return { success: false, message: "خطا در ایجاد سال تحصیلی" };
    }
  },

  // Update academic year
  updateAcademicYear: async (
    id: number,
    data: Partial<AcademicYear>,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/academic-years/${id}`, {
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
      console.error("Error updating academic year:", error);
      return { success: false, message: "خطا در به‌روزرسانی سال تحصیلی" };
    }
  },

  // Delete academic year
  deleteAcademicYear: async (
    id: number,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/academic-years/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error deleting academic year:", error);
      return { success: false, message: "خطا در حذف سال تحصیلی" };
    }
  },

  // Set active academic year
  setActiveAcademicYear: async (
    id: number,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/academic-years/${id}/activate`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error setting active academic year:", error);
      return { success: false, message: "خطا در تنظیم سال تحصیلی فعال" };
    }
  },
};
