// src/config/principalAcademicApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

export interface AcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  stats?: {
    totalClasses: number;
    totalStudents: number;
  };
}

export interface Subject {
  id: number;
  name: string;
  description?: string;
  teachers: {
    id: number;
    name: string;
    profileImage?: string;
    email?: string;
  }[];
  classes: {
    id: number;
    name: string;
    section: string;
    isActive: boolean;
  }[];
  classCount: number;
  teacherCount: number;
}

export interface TimetableEntry {
  startTime: string;
  id: number | null;
  period: number;
  time: string;
  subject: string;
  subjectId: number | null;
  teacher: string;
  teacherId: number | null;
  teacherImage: string | null;
  room: string;
  isBreak: boolean;
  isActive: boolean;
  isEmpty?: boolean;
}

export interface Exam {
  id: number;
  name: string;
  subject: string;
  className: string;
  classId: number;
  date: string;
  totalMarks: number;
  isPublished: boolean;
  type: string;
  month: number | null;
  year: number | null;
  studentCount: number;
  gradesCount: number;
  status: "upcoming" | "ongoing" | "completed";
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class PrincipalAcademicApi {
  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("auth_token");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const token = await this.getToken();

      // ✅ FIX: Correct URL construction
      const baseUrl = BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`;
      const url = `${baseUrl}/principal${endpoint}`;

      console.log("🔍 API Request:", {
        url,
        method: options.method || "GET",
        hasToken: !!token,
      });

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      // ✅ Check if response is OK before parsing
      if (!response.ok) {
        const text = await response.text();
        console.error("❌ API Error Response:", {
          status: response.status,
          statusText: response.statusText,
          body: text.substring(0, 200), // First 200 chars
        });

        // Try to parse as JSON, but if it's HTML, show a clear error
        try {
          const errorJson = JSON.parse(text);
          throw new Error(errorJson.message || `HTTP ${response.status}`);
        } catch (parseError) {
          // If it's not JSON (likely HTML), show the status
          throw new Error(
            `Server error ${response.status}: ${response.statusText || "Unknown error"}`,
          );
        }
      }

      // ✅ Parse JSON response
      const data = await response.json();
      console.log("✅ API Success:", {
        endpoint,
        success: data.success,
        dataLength: data.data?.length,
      });

      return data;
    } catch (error) {
      console.error(`❌ Academic API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ==================== CLASSES ====================
  // ✅ This calls /api/principal/classes
  async getClasses(): Promise<ApiResponse<any[]>> {
    return this.request("/classes");
  }

  // ==================== ACADEMIC YEARS ====================
  async getAcademicYears(): Promise<ApiResponse<AcademicYear[]>> {
    return this.request("/academic/years");
  }

  async createAcademicYear(data: {
    name: string;
    startDate: string;
    endDate: string;
    isActive?: boolean;
  }): Promise<ApiResponse<AcademicYear>> {
    return this.request("/academic/years", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAcademicYear(
    id: number,
    data: {
      name?: string;
      startDate?: string;
      endDate?: string;
      isActive?: boolean;
    },
  ): Promise<ApiResponse<AcademicYear>> {
    return this.request(`/academic/years/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAcademicYear(id: number): Promise<ApiResponse<any>> {
    return this.request(`/academic/years/${id}`, {
      method: "DELETE",
    });
  }

  // ==================== SUBJECTS ====================
  async getSubjects(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<
    ApiResponse<{
      subjects: Subject[];
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    }>
  > {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    const qs = query.toString();
    return this.request(`/academic/subjects${qs ? `?${qs}` : ""}`);
  }

  async createSubject(data: {
    name: string;
    description?: string;
    teacherId?: number;
  }): Promise<ApiResponse<Subject>> {
    return this.request("/academic/subjects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateSubject(
    id: number,
    data: {
      name?: string;
      description?: string;
      teacherId?: number;
    },
  ): Promise<ApiResponse<Subject>> {
    return this.request(`/academic/subjects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteSubject(id: number): Promise<ApiResponse<any>> {
    return this.request(`/academic/subjects/${id}`, {
      method: "DELETE",
    });
  }

  async assignSubjectToClass(data: {
    subjectId: number;
    classId: number;
    teacherId?: number;
  }): Promise<ApiResponse<any>> {
    return this.request("/academic/subjects/assign", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async removeSubjectFromClass(
    subjectId: number,
    classId: number,
  ): Promise<ApiResponse<any>> {
    return this.request(`/academic/subjects/${subjectId}/class/${classId}`, {
      method: "DELETE",
    });
  }

  async getSubjectsByClass(classId: number): Promise<ApiResponse<any[]>> {
    return this.request(`/academic/classes/${classId}/subjects`);
  }

  // ==================== TIMETABLE ====================
  async getTimetable(
    classId: number,
    day: number,
  ): Promise<ApiResponse<{ class: any; day: any; periods: TimetableEntry[] }>> {
    return this.request(`/academic/timetable/${classId}/${day}`);
  }

  async saveTimetableEntry(data: {
    classId: number;
    day: number;
    period: number;
    subjectId: number;
    teacherId?: number;
    room?: string;
    startTime?: string;
    endTime?: string;
  }): Promise<ApiResponse<any>> {
    return this.request("/academic/timetable", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteTimetableEntry(id: number): Promise<ApiResponse<any>> {
    return this.request(`/academic/timetable/${id}`, {
      method: "DELETE",
    });
  }

  // ==================== EXAMS ====================
  async getExams(params?: {
    status?: string;
    published?: string;
    search?: string;
    classId?: number;
    page?: number;
    limit?: number;
  }): Promise<
    ApiResponse<{
      exams: Exam[];
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    }>
  > {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.published) query.append("published", params.published);
    if (params?.search) query.append("search", params.search);
    if (params?.classId) query.append("classId", params.classId.toString());
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    const qs = query.toString();
    return this.request(`/academic/exams${qs ? `?${qs}` : ""}`);
  }

  async createExam(data: {
    name: string;
    subject?: string;
    classId: number;
    date: string;
    startTime?: string;
    totalMarks?: number;
    passingMarks?: number;
    isPublished?: boolean;
    type?: string;
    month?: number;
    year?: number;
    description?: string;
    academicYearId?: number;
    maxScore?: number;
  }): Promise<ApiResponse<Exam>> {
    return this.request("/academic/exams", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateExam(
    id: number,
    data: {
      name?: string;
      subject?: string;
      classId?: number;
      date?: string;
      startTime?: string;
      totalMarks?: number;
      passingMarks?: number;
      isPublished?: boolean;
      type?: string;
      month?: number;
      year?: number;
      description?: string;
      academicYearId?: number;
      maxScore?: number;
    },
  ): Promise<ApiResponse<Exam>> {
    return this.request(`/academic/exams/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteExam(id: number): Promise<ApiResponse<any>> {
    return this.request(`/academic/exams/${id}`, {
      method: "DELETE",
    });
  }

  async toggleExamPublish(id: number): Promise<ApiResponse<any>> {
    return this.request(`/academic/exams/${id}/toggle-publish`, {
      method: "PUT",
    });
  }
}

export const principalAcademicApi = new PrincipalAcademicApi();
