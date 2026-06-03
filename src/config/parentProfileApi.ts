// src/config/parentProfileApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

export interface Child {
  id: number;
  name: string;
  grade: string;
  classId: number;
  profileImage?: string;
  attendanceRate: number;
}

export interface ParentProfile {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  bio: string;
  occupation: string;
  address: string;
  emergencyContact: string;
  relationship: string;
  verified: boolean;
  children: Child[];
  stats: {
    childrenCount: number;
    unreadMessages: number;
    pendingAssignments: number;
    attendanceRate: number;
  };
  subscription: {
    plan: string;
    status: "active" | "expired" | "cancelled";
    expiryDate: string | null;
  };
}

export interface NotificationSettings {
  childAttendance: boolean;
  examResults: boolean;
  teacherMessages: boolean;
  homeworkReminders: boolean;
  schoolEvents: boolean;
  paymentReminders: boolean;
  systemAnnouncements: boolean;
  marketingEmails: boolean;
}

export const parentProfileApi = {
  /// src/config/parentProfileApi.ts - Update getProfile

getProfile: async (): Promise<{
  success: boolean;
  data?: ParentProfile;
  message?: string;
}> => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    console.log("Fetching profile from:", `${BASE_URL}/parent/profile`);
    console.log("Token exists:", !!token);
    
    const response = await fetch(`${BASE_URL}/parent/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    
    console.log("Response status:", response.status);
    
    const result = await response.json();
    console.log("Profile API response:", JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error("Error fetching parent profile:", error);
    return { success: false, message: "خطا در دریافت اطلاعات" };
  }
},
  // Update parent profile
  updateProfile: async (
    data: Partial<ParentProfile>,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/parent/profile`, {
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
      console.error("Error updating parent profile:", error);
      return { success: false, message: "خطا در به‌روزرسانی پروفایل" };
    }
  },

  // Upload profile image
  uploadProfileImage: async (
    formData: FormData,
  ): Promise<{ success: boolean; message: string; image?: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/parent/profile/image`, {
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

  // Update notification settings
  updateNotificationSettings: async (
    settings: NotificationSettings,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/parent/notifications`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating notification settings:", error);
      return {
        success: false,
        message: "خطا در به‌روزرسانی تنظیمات اطلاع‌رسانی",
      };
    }
  },
};
