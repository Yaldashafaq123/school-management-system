// src/config/adminGradingApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

export interface Grade {
  range: string;
  grade: string;
  points: number;
  remark: string;
}

export interface GradingScheme {
  id: string;
  name: string;
  description: string;
  type: "percentage" | "letter" | "points";
  passingGrade: string;
  isDefault: boolean;
  grades: Grade[];
  createdAt: string;
  updatedAt: string;
}

export interface GradeCalculationResult {
  grade: string;
  points: number;
  remark: string;
  range: string;
  isPassing: boolean;
  schemeName: string;
}

export const adminGradingApi = {
  // Get all grading schemes
  getGradingSchemes: async (): Promise<{
    success: boolean;
    data: GradingScheme[];
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/grading-schemes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching grading schemes:", error);
      return { success: false, data: [] };
    }
  },

  // Get single grading scheme
  getGradingScheme: async (
    id: string,
  ): Promise<{ success: boolean; data: GradingScheme }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/grading-schemes/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching grading scheme:", error);
      return { success: false, data: null as any };
    }
  },

  // Create grading scheme
  createGradingScheme: async (
    data: Partial<GradingScheme>,
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/grading-schemes`, {
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
      console.error("Error creating grading scheme:", error);
      return { success: false, message: "خطا در ایجاد سیستم درجه‌دهی" };
    }
  },

  // Update grading scheme
  updateGradingScheme: async (
    id: string,
    data: Partial<GradingScheme>,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/grading-schemes/${id}`, {
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
      console.error("Error updating grading scheme:", error);
      return { success: false, message: "خطا در به‌روزرسانی سیستم درجه‌دهی" };
    }
  },

  // Delete grading scheme
  deleteGradingScheme: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/grading-schemes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error deleting grading scheme:", error);
      return { success: false, message: "خطا در حذف سیستم درجه‌دهی" };
    }
  },

  // Set default grading scheme
  setDefaultGradingScheme: async (
    id: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/grading-schemes/${id}/default`,
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
      console.error("Error setting default grading scheme:", error);
      return { success: false, message: "خطا در تنظیم سیستم پیش‌فرض" };
    }
  },

  // Calculate grade from percentage
  calculateGrade: async (
    percentage: number,
    schemeId?: string,
  ): Promise<{ success: boolean; data: GradeCalculationResult }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/grading-schemes/calculate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ percentage, schemeId }),
        },
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error calculating grade:", error);
      return { success: false, data: null as any };
    }
  },
};
