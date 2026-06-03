import { apiRequest } from "./api";

export interface ClassItem {
  id: number;
  name: string;
  grade: string;
  students: number;
  subject: string;
  section?: string;
  academicYearId: number;
  teacherId?: number;
}

export interface TeacherClass {
  id: number;
  name: string;
  section?: string;
  academicYear: {
    id: number;
    name: string;
    isActive: boolean;
  };
  students: {
    id: number;
    user: {
      fullName: string;
      email: string;
    };
  }[];
  teacher?: {
    id: number;
    user: {
      fullName: string;
    };
  };
  subject?: string;
}
// src/config/classApi.ts - Add this to your existing file

export interface ClassStudent {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  rollNumber?: string;
  attendance_rate?: number;
  average_grade?: string;
  profile_image?: string;
}

export interface ClassDetails {
  id: number;
  name: string;
  grade: string;
  section?: string;
  totalStudents: number;
  students: ClassStudent[];
  averageAttendance: number;
  averageGrade: number;
  pendingAssignments: number;
  attendanceHistory: Array<{
    date: string;
    present: number;
    absent: number;
    late: number;
  }>;
}


export const classApi = {
  // Get classes for the logged-in teacher
  getMyClasses: async (): Promise<{ success: boolean; data: ClassItem[] }> => {
    return apiRequest("/teacher/classes");
  },
 getClassDetails: async (classId: number): Promise<{ success: boolean; data: ClassDetails }> => {
    return apiRequest(`/teacher/classes/${classId}/details`);
  },
  // Get class details by ID
  getClassById: async (
    classId: number,
  ): Promise<{ success: boolean; data: TeacherClass }> => {
    return apiRequest(`/teacher/classes/${classId}`);
  },

  // Get students in a class
  getClassStudents: async (
    classId: number,
  ): Promise<{ success: boolean; data: any[] }> => {
    return apiRequest(`/teacher/classes/${classId}/students`);
  },
};
