// src/config/adminTimetableApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

export interface Period {
  id: number;
  time: string;
  period: number;
  subject: string;
  teacher: string;
  room: string;
  isBreak: boolean;
}

export interface ClassOption {
  id: number;
  name: string;
  displayName: string;
}

export interface SubjectOption {
  id: number;
  name: string;
  isBreak: boolean;
}

export interface SavePeriodData {
  classId: number;
  day: number;
  period: number;
  subjectId: number;
  teacherId?: number;
  room?: string;
  isBreak?: boolean;
}

export const adminTimetableApi = {
  // Get all classes for dropdown
  getClasses: async (): Promise<{ success: boolean; data: ClassOption[] }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/timetable/classes`, {
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

  // Get all subjects for dropdown
  getSubjects: async (): Promise<{
    success: boolean;
    data: SubjectOption[];
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/timetable/subjects`, {
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

  // Get timetable for specific class and day
  getTimetable: async (
    classId: number,
    day: number,
  ): Promise<{ success: boolean; data: Period[] }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/timetable/${classId}/${day}`,
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
      console.error("Error fetching timetable:", error);
      return { success: false, data: [] };
    }
  },

  // Get weekly timetable for a class
  getWeeklyTimetable: async (
    classId: number,
  ): Promise<{ success: boolean; data: Record<string, Period[]> }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/timetable/weekly/${classId}`,
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
      console.error("Error fetching weekly timetable:", error);
      return { success: false, data: {} };
    }
  },

  // Save timetable entry (create or update)
  savePeriod: async (
    data: SavePeriodData,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/timetable/entry`, {
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
      console.error("Error saving period:", error);
      return { success: false, message: "خطا در ذخیره برنامه" };
    }
  },

  // Delete timetable entry
  deletePeriod: async (
    id: number,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/timetable/entry/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error deleting period:", error);
      return { success: false, message: "خطا در حذف برنامه" };
    }
  },
};