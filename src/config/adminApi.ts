// src/config/adminApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalTeachers: number;
  totalStudents: number;
  totalParents: number;
  systemHealth: number;
  totalIncome: number;
  pendingFees: number;
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  id: number;
  user: string;
  action: string;
  time: string;
  timestamp: string;
}

export interface SystemHealth {
  server: number;
  database: number;
  storage: number;
  bandwidth: number;
}

export interface UserStats {
  total: number;
  admin: number;
  teacher: number;
  student: number;
  parent: number;
  active: number;
  inactive: number;
}

export const adminApi = {
  // Get dashboard stats
  getDashboardStats: async (): Promise<{
    success: boolean;
    data: DashboardStats;
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/dashboard/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return { success: false, data: null as any };
    }
  },
  // Add to adminApi.ts

  // Get admin profile
  getProfile: async (): Promise<{ success: boolean; data: any }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      return { success: false, data: null };
    }
  },

  // Update admin profile
  updateProfile: async (
    data: any,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/profile`, {
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
      console.error("Error updating admin profile:", error);
      return { success: false, message: "خطا در به‌روزرسانی پروفایل" };
    }
  },

  // Upload profile image
  uploadProfileImage: async (
    formData: FormData,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/profile/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      return { success: false, message: "خطا در آپلود عکس" };
    }
  },
  // Get system health
  getSystemHealth: async (): Promise<{
    success: boolean;
    data: SystemHealth;
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/system/health`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching system health:", error);
      return { success: false, data: null as any };
    }
  },

  // Get user stats
  getUserStats: async (): Promise<{ success: boolean; data: UserStats }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/users/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return { success: false, data: null as any };
    }
  },

  // Get recent activities
  getRecentActivities: async (
    limit: number = 10,
  ): Promise<{ success: boolean; data: RecentActivity[] }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/activities/recent?limit=${limit}`,
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
      console.error("Error fetching recent activities:", error);
      return { success: false, data: [] };
    }
  },
};
