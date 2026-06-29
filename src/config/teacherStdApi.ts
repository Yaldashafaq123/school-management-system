import { apiRequest } from "./api";

// ============ Student Detail Types ============
export interface StudentDetail {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  profile_image?: string;
  birth_date?: string;
  address?: string;
  grade?: string;
  enrollment_date?: string;
  notes?: string;

  parent?: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
  };

  teacher?: {
    id: number;
    fullName: string;
    email: string;
  };

  class?: {
    id: number;
    name: string;
    section?: string;
    academicYearId: number;
    academicYear?: {
      id: number;
      name: string;
      isActive: boolean;
    };
  };

  courses: {
    id: number;
    name: string;
    teacher: string;
    grade?: string;
    progress: number;
    classId: number;
    thumbnail_url?: string;
    description?: string;
  }[];

  attendance: {
    id: number;
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  }[];

  performance: {
    assignments_completed: number;
    assignments_total: number;
    average_grade: string;
    attendance_rate: number;
    last_active: string;
    total_points?: number;
    rank?: number;
  };
}

// ============ Teacher Student Management API ============
export const teacherStudentApi = {
  // Get student by ID
  getStudentById: async (
    studentId: number,
  ): Promise<{ success: boolean; data: StudentDetail }> => {
    try {
      // Backend route: router.get("/student/:id", teacherController.getStudentById);
      const response = await apiRequest(`/teacher/student/${studentId}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching student details:", error);
      throw error;
    }
  },

  // Update student
  updateStudent: async (
    studentId: number,
    data: Partial<StudentDetail>,
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const response = await apiRequest(`/teacher/students/${studentId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error("Error updating student:", error);
      throw error;
    }
  },

  // Mark attendance for a student
  markAttendance: async (
    studentId: number,
    data: { date: string; status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" },
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest("/teacher/attendance", {
        method: "POST",
        body: JSON.stringify({
          studentId,
          ...data,
        }),
      });
      return response;
    } catch (error) {
      console.error("Error marking attendance:", error);
      throw error;
    }
  },

  // Update student grade for a course
  updateGrade: async (
    studentId: number,
    courseId: number,
    grade: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest("/teacher/grades", {
        method: "POST",
        body: JSON.stringify({
          studentId,
          courseId,
          grade,
        }),
      });
      return response;
    } catch (error) {
      console.error("Error updating grade:", error);
      throw error;
    }
  },

  // Get student full details with all related data
  getStudentFullDetails: async (
    studentId: number,
  ): Promise<{ success: boolean; data: StudentDetail }> => {
    try {
      const response = await apiRequest(
        `/teacher/student/${studentId}/full-details`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching full student details:", error);
      throw error;
    }
  },

  // Get student performance data
  getStudentPerformance: async (
    studentId: number,
  ): Promise<{ success: boolean; data: StudentDetail["performance"] }> => {
    try {
      const response = await apiRequest(
        `/teacher/students/${studentId}/performance`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching student performance:", error);
      throw error;
    }
  },

  // Get student attendance history
  getStudentAttendance: async (
    studentId: number,
    days: number = 30,
  ): Promise<{ success: boolean; data: StudentDetail["attendance"] }> => {
    try {
      const response = await apiRequest(
        `/teacher/students/${studentId}/attendance?days=${days}`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      throw error;
    }
  },

  // Get student courses with grades
  getStudentCoursesWithGrades: async (
    studentId: number,
  ): Promise<{ success: boolean; data: StudentDetail["courses"] }> => {
    try {
      const response = await apiRequest(
        `/teacher/students/${studentId}/courses-with-grades`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching student courses with grades:", error);
      throw error;
    }
  },

  // Get student class info
  getStudentClass: async (
    studentId: number,
  ): Promise<{ success: boolean; data: StudentDetail["class"] }> => {
    try {
      const response = await apiRequest(
        `/teacher/students/${studentId}/class`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching student class:", error);
      throw error;
    }
  },

  // Get student parent info
  getStudentParent: async (
    studentId: number,
  ): Promise<{ success: boolean; data: StudentDetail["parent"] }> => {
    try {
      const response = await apiRequest(
        `/teacher/students/${studentId}/parent`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching student parent:", error);
      throw error;
    }
  },
};
