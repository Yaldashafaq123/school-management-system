// src/config/parentChildApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

export interface Child {
  id: number;
  name: string;
  class: string;
  classId: number;
  profileImage?: string;
  active: boolean;
  attendanceRate?: number;
  gradesCount?: number;
}

export interface ChildrenListResponse {
  children: Child[];
  activeChildId: number | null;
}

export const parentChildApi = {
  // Get all children for parent
  getChildren: async (): Promise<{
    success: boolean;
    data: ChildrenListResponse;
  }> => {
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

      // Handle both response formats
      if (result.success && result.data) {
        // If data is already an object with children property
        if (result.data.children !== undefined) {
          return result;
        }
        // If data is an array (old format), convert it
        if (Array.isArray(result.data)) {
          return {
            success: true,
            data: {
              children: result.data,
              activeChildId: result.data.length > 0 ? result.data[0].id : null,
            },
          };
        }
      }
      return result;
    } catch (error) {
      console.error("Error fetching children:", error);
      return { success: false, data: { children: [], activeChildId: null } };
    }
  },

  // Set active child
  setActiveChild: async (
    childId: number,
  ): Promise<{
    success: boolean;
    message: string;
    data?: { activeChildId: number };
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/parent/children/active`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ childId }),
      });
      const result = await response.json();

      if (result.success) {
        await AsyncStorage.setItem("active_child_id", childId.toString());
      }

      return result;
    } catch (error) {
      console.error("Error setting active child:", error);
      return { success: false, message: "خطا در تغییر فرزند فعال" };
    }
  },

  // Get stored active child ID
  getStoredActiveChildId: async (): Promise<number | null> => {
    try {
      const id = await AsyncStorage.getItem("active_child_id");
      return id ? parseInt(id) : null;
    } catch (error) {
      console.error("Error getting stored active child:", error);
      return null;
    }
  },
};
