// src/config/parentAttendanceApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

export interface StudentInfo {
  id: number;
  name: string;
  className: string;
  profileImage?: string;
}

export interface AttendanceStats {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

export interface MonthlyAttendanceData {
  month: string;
  present: number;
  total: number;
  rate: number;
}

export interface WeeklyAttendance {
  day: string;
  date: string;
  status:
    | "present"
    | "absent"
    | "late"
    | "excused"
    | "holiday"
    | "weekend"
    | "future";
}

export interface AttendanceOverview {
  student: StudentInfo;
  stats: AttendanceStats;
  monthlyData: MonthlyAttendanceData[];
  weeklyData: WeeklyAttendance[];
}

export interface DailyAttendance {
  day: number;
  dayName: string;
  status: "present" | "absent" | "late" | "excused" | "weekend";
  time?: string;
}

export interface MonthlyDetail {
  year: number;
  month: number;
  monthName: string;
  days: DailyAttendance[];
}

export const parentAttendanceApi = {
  // Get attendance overview for a child
  getAttendanceOverview: async (
    childId: number,
  ): Promise<{ success: boolean; data: AttendanceOverview }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/parent/attendance/${childId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching attendance overview:", error);
      return { success: false, data: null as any };
    }
  },

  // Get monthly attendance details
  getMonthlyAttendance: async (
    childId: number,
    year: number,
    month: number,
  ): Promise<{ success: boolean; data: MonthlyDetail }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/parent/attendance/${childId}/${year}/${month}`,
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
      console.error("Error fetching monthly attendance:", error);
      return { success: false, data: null as any };
    }
  },
};
