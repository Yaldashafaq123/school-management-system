// src/config/adminCourseApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

// ============ Core Types ============
export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  teacher_name: string;
  teacher_id: number;
  price?: number;
  is_free?: boolean;
  rating?: number;
  student_count: number;
  category: string;
  status: "published" | "draft" | "archived";
  is_active: boolean;
  created_at: string;
  updated_at: string;
  enrolled_students: number;
  completion_rate: number;
  avg_rating: number;
  class_id?: number | null;
  class_name?: string;
  subject_id?: number | null;
  subject_name?: string;
  duration?: number;
  lessons_count?: number;
}

export interface CourseDetailType {
  id: number;
  title: string;
  description: string;
  long_description: string;
  thumbnail_url: string;
  teacher_id: number;
  teacher_name: string;
  teacher_email: string;
  price: number;
  is_free: boolean;
  discount_price?: number;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: number;
  lectures_count: number;
  quizzes_count: number;
  assignments_count: number;
  status: "published" | "draft" | "archived";
  featured: boolean;
  certificate_available: boolean;
  created_at: string;
  updated_at: string;
  enrolled_students: number;
  completion_rate: number;
  avg_rating: number;
  reviews_count: number;
  requirements: string[];
  learning_outcomes: string[];
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: string;
  type: "video" | "text" | "quiz" | "assignment";
  preview: boolean;
  order_no: number;
  video_url?: string;
  content?: string;
  is_free: boolean;
  order: number;
}

export interface CourseStats {
  total: number;
  active: number;
  inactive: number;
  general: number;
  class: number;
  avg_students_per_course: number;
}

export interface CoursesResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============ Create Course Types ============
export interface CreateCourseData {
  title: string;
  description: string;
  subject: string;
  duration: number;
  teacherId: number;
  classId?: number | null;
  thumbnail?: string;
  isActive: boolean;
  objectives?: string[];
  requirements?: string[];
}

export interface Teacher {
  id: number;
  name: string;
  email?: string;
  profileImage?: string;
}

export interface ClassOption {
  id: number;
  name: string;
  displayName: string;
  section?: string;
}

export interface SubjectOption {
  id: number;
  name: string;
}

// ============ API Methods ============
export const adminCourseApi = {
  // ============ Course Management ============
  getCourses: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  }): Promise<{ success: boolean; data: CoursesResponse }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.status && params.status !== "all")
        queryParams.append("status", params.status);
      if (params?.category && params.category !== "all")
        queryParams.append("category", params.category);

      const url = `${BASE_URL}/admin/courses${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
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
      console.error("Error fetching courses:", error);
      return {
        success: false,
        data: { courses: [], total: 0, page: 1, limit: 20, totalPages: 0 },
      };
    }
  },

  getCourseStats: async (): Promise<{
    success: boolean;
    data: CourseStats;
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/courses/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching course stats:", error);
      return { success: false, data: null as any };
    }
  },

  getCourse: async (
    id: number,
  ): Promise<{ success: boolean; data: Course }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/courses/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching course:", error);
      return { success: false, data: null as any };
    }
  },

  // ✅ ADD THIS METHOD for course detail
  getCourseDetail: async (
    id: number,
  ): Promise<{ success: boolean; data: CourseDetailType }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/courses/${id}/detail`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching course detail:", error);
      return { success: false, data: null as any };
    }
  },

  // ✅ ADD THIS METHOD for course lessons
  getCourseLessons: async (
    courseId: number,
  ): Promise<{ success: boolean; data: Lesson[] }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/courses/${courseId}/lessons`,
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
      console.error("Error fetching course lessons:", error);
      return { success: false, data: [] };
    }
  },

  createCourse: async (
    data: CreateCourseData,
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!data.title) {
        return { success: false, message: "عنوان دوره الزامی است" };
      }
      if (!data.teacherId) {
        return { success: false, message: "انتخاب استاد الزامی است" };
      }

      const payload = {
        title: data.title,
        description: data.description,
        subject: data.subject,
        duration: data.duration,
        teacherId: data.teacherId,
        classId: data.classId,
        thumbnail: data.thumbnail,
        isActive: data.isActive,
        objectives: data.objectives
          ?.filter((obj) => obj.trim())
          .map((obj) => ({ text: obj })),
        requirements: data.requirements
          ?.filter((req) => req.trim())
          .map((req) => ({ text: req })),
      };

      const response = await fetch(`${BASE_URL}/admin/courses`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error creating course:", error);
      return { success: false, message: "خطا در ایجاد دوره" };
    }
  },

  updateCourse: async (
    id: number,
    data: Partial<Course>,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/courses/${id}`, {
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
      console.error("Error updating course:", error);
      return { success: false, message: "خطا در به‌روزرسانی دوره" };
    }
  },

  deleteCourse: async (
    id: number,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/courses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error deleting course:", error);
      return { success: false, message: "خطا در حذف دوره" };
    }
  },

  updateCourseStatus: async (
    id: number,
    status: "published" | "draft" | "archived",
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/courses/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating course status:", error);
      return { success: false, message: "خطا در تغییر وضعیت دوره" };
    }
  },

  toggleCourseStatus: async (
    id: number,
  ): Promise<{
    success: boolean;
    message: string;
    data?: { is_active: boolean };
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/courses/${id}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error toggling course status:", error);
      return { success: false, message: "خطا در تغییر وضعیت دوره" };
    }
  },

  // ============ Dropdown Options ============
  getTeachers: async (): Promise<{ success: boolean; data: Teacher[] }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/teachers/list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (result.success && result.data) {
        const formattedData = result.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          profileImage: item.profileImage,
        }));
        return { success: true, data: formattedData };
      }
      return result;
    } catch (error) {
      console.error("Error fetching teachers:", error);
      return { success: false, data: [] };
    }
  },

  getClasses: async (): Promise<{ success: boolean; data: ClassOption[] }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/classes/list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (result.success && result.data) {
        const formattedData = result.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          displayName: item.displayName || item.name,
          section: item.section,
        }));
        return { success: true, data: formattedData };
      }
      return result;
    } catch (error) {
      console.error("Error fetching classes:", error);
      return { success: false, data: [] };
    }
  },

  getSubjects: async (): Promise<{
    success: boolean;
    data: SubjectOption[];
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/subjects/list`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      if (result.success && result.data) {
        const formattedData = result.data.map((item: any) => ({
          id: item.id,
          name: item.name,
        }));
        return { success: true, data: formattedData };
      }
      return result;
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return { success: false, data: [] };
    }
  },

  getCategories: async (): Promise<{ success: boolean; data: string[] }> => {
    try {
      const subjectsRes = await adminCourseApi.getSubjects();
      if (subjectsRes.success && subjectsRes.data) {
        const categories = subjectsRes.data.map(
          (item: SubjectOption) => item.name,
        );
        return { success: true, data: categories };
      }
      return { success: false, data: [] };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { success: false, data: [] };
    }
  },
};

// ============ Helper Functions ============
export const getCourseStatusLabel = (status: string): string => {
  switch (status) {
    case "published":
      return "منتشر شده";
    case "draft":
      return "پیش‌نویس";
    case "archived":
      return "بایگانی شده";
    default:
      return status;
  }
};

export const getCourseStatusColor = (status: string): string => {
  switch (status) {
    case "published":
      return "#34C759";
    case "draft":
      return "#FF9500";
    case "archived":
      return "#8E8E93";
    default:
      return "#8E8E93";
  }
};

export const getCourseLevelLabel = (level: string): string => {
  switch (level) {
    case "beginner":
      return "مبتدی";
    case "intermediate":
      return "متوسط";
    case "advanced":
      return "پیشرفته";
    default:
      return level;
  }
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} دقیقه`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) return `${hours} ساعت`;
  return `${hours} ساعت و ${remainingMinutes} دقیقه`;
};

export const defaultCourseStats: CourseStats = {
  total: 0,
  active: 0,
  inactive: 0,
  general: 0,
  class: 0,
  avg_students_per_course: 0,
};

export const defaultCourse: Course = {
  id: 0,
  title: "",
  description: "",
  thumbnail_url: "",
  teacher_name: "",
  teacher_id: 0,
  student_count: 0,
  category: "",
  status: "draft",
  is_active: false,
  created_at: "",
  updated_at: "",
  enrolled_students: 0,
  completion_rate: 0,
  avg_rating: 0,
};
