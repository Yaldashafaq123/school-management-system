// src/config/parentApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

export interface Child {
  id: number;
  name: string;
  class: string;
  classId: number;
  active: boolean;
  profileImage?: string;
  attendanceRate?: number;
  lastLogin?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: "urgent" | "info" | "success" | "warning";
  createdAt: string;
  isRead: boolean;
  link?: string;
}

export interface QuickStat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

export interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
}

export interface DashboardData {
  activeChild: Child | null;
  children: Child[];
  notifications: Notification[];
  quickStats: QuickStat[];
  upcomingEvents: UpcomingEvent[];
  pendingFees: number;
  totalAttendance: number;
  unreadMessages: number;
}

export const parentApi = {
  // Get dashboard data for parent
  getDashboard: async (
    childId?: number,
  ): Promise<{ success: boolean; data: DashboardData }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const url = childId
        ? `${BASE_URL}/parent/dashboard?childId=${childId}`
        : `${BASE_URL}/parent/dashboard`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();

      if (result.success && result.data) {
        return result;
      }

      // Return empty data structure on error
      return {
        success: true,
        data: {
          activeChild: null,
          children: [],
          notifications: [],
          quickStats: [
            { label: "حضور", value: "۰٪", icon: "calendar", color: "#3b82f6" },
            {
              label: "فیس باقیمانده",
              value: "۰ $",
              icon: "dollar-sign",
              color: "#10b981",
            },
            {
              label: "پیام‌های نخوانده",
              value: "۰",
              icon: "message-square",
              color: "#f59e0b",
            },
          ],
          upcomingEvents: [],
          pendingFees: 0,
          totalAttendance: 0,
          unreadMessages: 0,
        },
      };
    } catch (error) {
      console.error("Error fetching parent dashboard:", error);
      return {
        success: true,
        data: {
          activeChild: null,
          children: [],
          notifications: [],
          quickStats: [
            { label: "حضور", value: "۰٪", icon: "calendar", color: "#3b82f6" },
            {
              label: "فیس باقیمانده",
              value: "۰ $",
              icon: "dollar-sign",
              color: "#10b981",
            },
            {
              label: "پیام‌های نخوانده",
              value: "۰",
              icon: "message-square",
              color: "#f59e0b",
            },
          ],
          upcomingEvents: [],
          pendingFees: 0,
          totalAttendance: 0,
          unreadMessages: 0,
        },
      };
    }
  },

  // Switch active child
  switchChild: async (
    childId: number,
  ): Promise<{ success: boolean; data: DashboardData }> => {
    return parentApi.getDashboard(childId);
  },

  // Get all children
  getChildren: async (): Promise<{ success: boolean; data: Child[] }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/parent/children`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching children:", error);
      return { success: false, data: [] };
    }
  },

  // Get notifications
  getNotifications: async (
    limit: number = 10,
  ): Promise<{ success: boolean; data: Notification[] }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/parent/notifications?limit=${limit}`,
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
      console.error("Error fetching notifications:", error);
      return { success: false, data: [] };
    }
  },

  // Mark notification as read
  markNotificationRead: async (id: number): Promise<{ success: boolean }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/parent/notifications/${id}/read`,
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
      console.error("Error marking notification read:", error);
      return { success: false };
    }
  },

  // Get upcoming events
  getUpcomingEvents: async (): Promise<{
    success: boolean;
    data: UpcomingEvent[];
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/parent/events/upcoming`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      return { success: false, data: [] };
    }
  },

  // Get fee summary
  getFeeSummary: async (
    childId?: number,
  ): Promise<{
    success: boolean;
    data: { total: number; paid: number; pending: number };
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const url = childId
        ? `${BASE_URL}/parent/fees/summary?childId=${childId}`
        : `${BASE_URL}/parent/fees/summary`;

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
      console.error("Error fetching fee summary:", error);
      return { success: false, data: { total: 0, paid: 0, pending: 0 } };
    }
  },
};
