// src/config/studentProfileApi.ts
import { apiRequest } from './api';
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    user: {
      id: number;
      fullName: string;
      email: string;
      phone: string;
      profileImage?: string;
      role: string;
    };
    student: {
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
    stats: StudentStats;
  };
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
  // Get student profile
  getProfile: async (): Promise<StudentProfileResponse> => {
    try {
      const response = await apiRequest('/student/profile', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching student profile:', error);
      throw error;
    }
  },

  // Update student profile
  updateProfile: async (data: UpdateProfileData): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest('/student/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error updating student profile:', error);
      throw error;
    }
  },

  // Get student stats
  getStats: async (): Promise<{ success: boolean; data: StudentStats }> => {
    try {
      const response = await apiRequest('/student/stats', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching student stats:', error);
      throw error;
    }
  },

  // Upload profile image
  uploadProfileImage: async (imageUri: string): Promise<{ success: boolean; image: string }> => {
    try {
      const formData = new FormData();
      formData.append('profile_image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/student/profile/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('auth_token')}`,
        },
        body: formData,
      });

      return await response.json();
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }
};

// List of student grades
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