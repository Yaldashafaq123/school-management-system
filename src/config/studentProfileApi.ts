// src/config/studentProfileApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "./api";

export interface StudentProfileData {
  bio?: string;
  grade?: string;
  school?: string;
  birthDate?: string;
  parentContact?: string;
  address?: string;
  interests?: string[];
}

export interface StudentStats {
  total_courses: number;
  enrolled_courses: number;
  completed_courses: number;
  total_hours: number;
  certificates: number;
  assignments_pending: number;
  exams_upcoming: number;
}

export interface StudentProfileResponse {
  success: boolean;
  data: {
    User?: {
      // ← Optional, in case it's missing
      id: number;
      fullName: string;
      email: string;
      phone: string;
      profileImage?: string;
      role: string;
    };
    student?: {
      id: number;
      classId?: number;
      className?: string;
      bio?: string;
      grade?: string;
      school?: string;
      birthDate?: string;
      parentContact?: string;
      address?: string;
      interests?: string[];
    };
    stats?: StudentStats;
  };
  message?: string;
}

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  profileImage?: string;
  bio?: string;
  grade?: string;
  school?: string;
  birthDate?: string;
  parentContact?: string;
  address?: string;
  interests?: string[];
}

export const studentProfileApi = {
  getProfile: async (): Promise<StudentProfileResponse> => {
    try {
      const response = await apiRequest("/student/profile", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching student profile:", error);
      throw error;
    }
  },

  updateProfile: async (
    data: UpdateProfileData,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest("/student/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error("Error updating student profile:", error);
      throw error;
    }
  },

  getStats: async (): Promise<{ success: boolean; data: StudentStats }> => {
    try {
      const response = await apiRequest("/student/stats", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching student stats:", error);
      throw error;
    }
  },

  uploadProfileImage: async (
    imageUri: string,
  ): Promise<{
    message: string; success: boolean; image: string 
}> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      // Create form data
      const formData = new FormData();

      // Get file extension and mime type
      const filename = imageUri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("profile_image", {
        uri: imageUri,
        type: type,
        name: filename,
      } as any);

      // ✅ Use the correct URL - matches your backend route
      // Your backend route is: /student/profile/image
      const url = `${apiRequest}/student/profile/image`;

      console.log("📤 Uploading to:", url);
      console.log("📎 File:", filename, "Type:", type);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          // ❌ DO NOT set Content-Type header for FormData - browser will set it with boundary
        },
        body: formData,
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("❌ Non-JSON response:", text.substring(0, 200));
        throw new Error(
          "Server returned non-JSON response. Please check the API endpoint.",
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      return data;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      throw error;
    }
  },
};

export const studentGrades = [
  "اول ابتدایی",
  "دوم ابتدایی",
  "سوم ابتدایی",
  "چهارم ابتدایی",
  "پنجم ابتدایی",
  "ششم ابتدایی",
  "اول متوسطه",
  "دوم متوسطه",
  "سوم متوسطه",
  "چهارم متوسطه",
];
