// src/config/studentAssignmentsApi.ts
import { apiRequest } from "./api";

export interface SubmissionAttachment {
  id: number;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  submitted_at: string;
  grade?: number;
  feedback?: string;
  graded_at?: string;
  graded_by?: number;
  attachments: SubmissionAttachment[];
}

export interface Assignment {
  id: number;
  course_id: number;
  course_name: string;
  title: string;
  description: string;
  instructions: string;
  due_date: string;
  max_score: number;
  created_at: string;
  updated_at?: string;
  attachments: any[];
  submission?: Submission;
  status: "pending" | "submitted" | "graded" | "late" | "missing";
}

export interface AssignmentStats {
  total: number;
  pending: number;
  submitted: number;
  graded: number;
  late: number;
}

export interface Filters {
  id: string;
  label: string;
  icon: string;
}

export const studentAssignmentsApi = {
  // Get all assignments for student
  getAssignments: async (): Promise<{
    success: boolean;
    data: Assignment[];
  }> => {
    try {
      const response = await apiRequest("/student/assignments", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching assignments:", error);
      throw error;
    }
  },

  // Get single assignment details
  getAssignment: async (
    id: number,
  ): Promise<{ success: boolean; data: Assignment }> => {
    try {
      const response = await apiRequest(`/student/assignments/${id}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching assignment:", error);
      throw error;
    }
  },

  // Submit assignment
  submitAssignment: async (
    assignmentId: number,
    data: { content?: string; attachments?: any[] },
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest(
        `/student/assignments/${assignmentId}/submit`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
      return response;
    } catch (error) {
      console.error("Error submitting assignment:", error);
      throw error;
    }
  },

  // Get assignment stats
  getAssignmentStats: async (): Promise<{
    success: boolean;
    data: AssignmentStats;
  }> => {
    try {
      const response = await apiRequest("/student/assignments/stats", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching assignment stats:", error);
      throw error;
    }
  },

  // Get assignments by status
  getAssignmentsByStatus: async (
    status: string,
  ): Promise<{ success: boolean; data: Assignment[] }> => {
    try {
      const response = await apiRequest(
        `/student/assignments/status/${status}`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching assignments by status:", error);
      throw error;
    }
  },
};

// Filter options
export const ASSIGNMENT_FILTERS: Filters[] = [
  { id: "all", label: "همه", icon: "apps" },
  { id: "pending", label: "در انتظار", icon: "time" },
  { id: "submitted", label: "تحویل داده‌شده", icon: "checkmark-circle" },
  { id: "graded", label: "نمره‌دار", icon: "trophy" },
  { id: "late", label: "تأخیر", icon: "alert-circle" },
];

// Helper function to get status color
export function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "#FF9800";
    case "submitted":
      return "#2196F3";
    case "graded":
      return "#4CAF50";
    case "late":
      return "#F44336";
    case "missing":
      return "#9E9E9E";
    default:
      return "#9E9E9E";
  }
}

// Helper function to get status text
export function getStatusText(status: string): string {
  switch (status) {
    case "pending":
      return "در انتظار";
    case "submitted":
      return "تحویل داده‌شده";
    case "graded":
      return "نمره‌دار";
    case "late":
      return "تأخیر";
    case "missing":
      return "انجام نشده";
    default:
      return "-";
  }
}
