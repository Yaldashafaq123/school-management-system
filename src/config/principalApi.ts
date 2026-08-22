// src/config/principalApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

// ==================== TYPES ====================

export interface PrincipalProfile {
  user: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    profileImage?: string;
    isActive: boolean;
    createdAt: string;
  };
  principalStaff: {
    id: number;
    position: string;
    isActive: boolean;
    joinDate: string;
    experience: string | null;
    qualification: string | null;
  };
  statistics: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalParents: number;
    totalStaff: number;
    activeStudents: number;
    activeTeachers: number;
    totalSubjects: number;
    totalAssignments: number;
    totalExams: number;
  };
}

export interface Student {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  studentNumber: string;
  status: string;
  enrollmentDate: string;
  className: string;
  classId: number;
  hasFeePlan: boolean;
  feeStatus: string | null;
}

export interface StudentResponse {
  students: Student[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

// src/config/principalApi.ts - Updated StudentDetail

export interface StudentDetail {
  id: number;
  User: {
    fullName: string;
    email: string;
    phone: string;
    profileImage?: string;
  };
  Class: {
    id: number;
    name: string;
    section: string;
    status?: string;
    Teacher: {
      id: number;
      User: {
        fullName: string;
      };
    };
  };
  // ✅ Add these missing fields
  studentNumber: string;
  status: string;
  classId: number | null;
  enrollmentDate: string;
  graduationDate: string | null;
  scholarship: boolean;
  scholarshipPercentage: number | null;
  feeWaiver: boolean;
  feeWaiverReason: string | null;
  // Existing fields
  FeeAssignment: any[];
  Grade: any[];
  Attendance: any[];
  ParentStudent: any[];
  feeSummary: {
    totalFees: number;
    totalPaid: number;
    totalBalance: number;
    collectionRate: number;
  };
}

export interface Teacher {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  teacherCode: string;
  teacherId: number | null;
  isActive: boolean;
  joiningDate: string;
  specialization: string;
  rating: number;
  subjects: string[];
  className: string | null;
}

export interface TeacherResponse {
  teachers: Teacher[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface ClassItem {
  id: number;
  name: string;
  section: string;
  description: string;
  is_active: boolean;
  studentCount: number;
  teacherCount: number;
  teacherName: string;
  teacherId: number | null;
  academicYear: string;
  academicYearId: number;
}

export interface Promotion {
  id: number;
  studentId: number;
  fromClassId: number;
  toClassId: number;
  academicYearId: number;
  promotionDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "COMPLETED";
  reason: string | null;
  notes: string | null;
  approvedBy: number;
  approvedAt: string;
  Student: {
    User: {
      fullName: string;
      email: string;
    };
  };
  FromClass: {
    name: string;
    section: string;
  };
  ToClass: {
    name: string;
    section: string;
  };
  AcademicYear: {
    name: string;
  };
}

export interface PrincipalDashboard {
  summary: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalParents: number;
    totalStaff: number;
    activeStudents: number;
    activeTeachers: number;
    totalSubjects: number;
    totalAssignments: number;
    totalExams: number;
    totalFeeAssignments: number;
    totalOutstanding: number;
    monthlyCollection: number;
    todayAttendance: number;
    attendanceRate: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ==================== API CLASS ====================

class PrincipalApi {
  private async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = await this.getToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const headers = await this.getHeaders();
      const url = `${BASE_URL}/principal${endpoint}`;

      console.log(`📡 Principal Request: ${options.method || "GET"} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Network error" }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      return result as T;
    } catch (error) {
      console.error(`❌ Principal API Error [${endpoint}]:`, error);
      throw error;
    }
  }
  // src/config/principalApi.ts - Add this method to the PrincipalApi class

  // ==================== ACADEMIC YEARS ====================

  async getAcademicYears(): Promise<
    ApiResponse<{ id: number; name: string; isActive: boolean }[]>
  > {
    return this.request("/academic-years");
  }
  // ==================== PROFILE ====================

  async getProfile(): Promise<ApiResponse<PrincipalProfile>> {
    return this.request("/profile");
  }
  // src/config/principalApi.ts - Add these methods

  // ==================== CLASS PROMOTION ====================

  async getClassPromotionOptions(params?: {
    academicYearId?: number;
  }): Promise<ApiResponse<any>> {
    let url = "/principal/classes/promotion-options";
    if (params?.academicYearId) {
      url += `?academicYearId=${params.academicYearId}`;
    }
    return this.request(url);
  }

  async promoteClass(data: {
    fromClassId: number;
    toClassId?: number;
    createNewClass?: boolean;
    newClassName?: string;
    newGrade?: string;
    newSection?: string;
    academicYearId?: number;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return this.request("/principal/classes/promote", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getClassPromotionHistory(classId: number): Promise<ApiResponse<any>> {
    return this.request(`/principal/classes/${classId}/promotion-history`);
  }
  async updateProfile(data: {
    fullName?: string;
    phone?: string;
    position?: string;
    experience?: string;
    qualification?: string;
    profileImage?: string;
  }): Promise<ApiResponse<any>> {
    return this.request("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<any>> {
    return this.request("/change-password", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // ==================== DASHBOARD ====================

  async getDashboard(): Promise<ApiResponse<PrincipalDashboard>> {
    return this.request("/dashboard");
  }

  // ==================== STUDENT MANAGEMENT ====================

  async getStudents(params?: {
    classId?: number;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<StudentResponse>> {
    const query = new URLSearchParams();
    if (params?.classId) query.append("classId", params.classId.toString());
    if (params?.status) query.append("status", params.status);
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    const qs = query.toString();
    return this.request(`/students${qs ? `?${qs}` : ""}`);
  }

  async getStudentById(id: number): Promise<ApiResponse<StudentDetail>> {
    return this.request(`/students/${id}`);
  }

  async updateStudent(
    id: number,
    data: {
      status?: string;
      classId?: number;
      studentNumber?: string;
      enrollmentDate?: string;
      graduationDate?: string;
      scholarship?: boolean;
      scholarshipPercentage?: number;
      feeWaiver?: boolean;
      feeWaiverReason?: string;
    },
  ): Promise<ApiResponse<any>> {
    return this.request(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async promoteStudent(
    id: number,
    data: {
      toClassId: number;
      academicYearId: number;
      notes?: string;
    },
  ): Promise<ApiResponse<any>> {
    return this.request(`/students/${id}/promote`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==================== PROMOTIONS ====================

  async getPromotions(params?: {
    status?: string;
    studentId?: number;
    page?: number;
    limit?: number;
  }): Promise<
    ApiResponse<{
      promotions: Promotion[];
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    }>
  > {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.studentId)
      query.append("studentId", params.studentId.toString());
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    const qs = query.toString();
    return this.request(`/promotions${qs ? `?${qs}` : ""}`);
  }

  async updatePromotion(
    id: number,
    data: {
      status: "APPROVED" | "REJECTED";
      notes?: string;
    },
  ): Promise<ApiResponse<any>> {
    return this.request(`/promotions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // ==================== TEACHER MANAGEMENT ====================

  async getTeachers(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<TeacherResponse>> {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.search) query.append("search", params.search);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    const qs = query.toString();
    return this.request(`/teachers${qs ? `?${qs}` : ""}`);
  }

  async getTeacherById(id: number): Promise<ApiResponse<any>> {
    return this.request(`/teachers/${id}`);
  }

  // ==================== CLASS MANAGEMENT ====================

  async getClasses(): Promise<ApiResponse<ClassItem[]>> {
    return this.request("/classes");
  }

  async createClass(data: {
    name: string;
    section?: string;
    academicYearId: number;
    teacherId?: number;
    description?: string;
  }): Promise<ApiResponse<any>> {
    return this.request("/classes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateClass(
    id: number,
    data: {
      name?: string;
      section?: string;
      academicYearId?: number;
      teacherId?: number | null;
      description?: string;
      is_active?: boolean;
    },
  ): Promise<ApiResponse<any>> {
    return this.request(`/classes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteClass(id: number): Promise<ApiResponse<any>> {
    return this.request(`/classes/${id}`, {
      method: "DELETE",
    });
  }
  // src/config/principalApi.ts - Add this method to the PrincipalApi class

  // ==================== TEACHER MANAGEMENT - Add updateTeacher ====================

  async updateTeacher(
    id: number,
    data: {
      fullName?: string;
      phone?: string;
      isActive?: boolean;
      availability?: boolean;
      specialization?: string;
      experience?: string;
      certification?: string;
      baseSalary?: number;
    },
  ): Promise<ApiResponse<any>> {
    return this.request(`/teachers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  // ==================== REPORTS ====================

  async getPerformanceReport(params?: {
    academicYearId?: number;
  }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.academicYearId)
      query.append("academicYearId", params.academicYearId.toString());
    const qs = query.toString();
    return this.request(`/reports/performance${qs ? `?${qs}` : ""}`);
  }

  async getClassReport(params?: {
    academicYearId?: number;
  }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.academicYearId)
      query.append("academicYearId", params.academicYearId.toString());
    const qs = query.toString();
    return this.request(`/reports/classes${qs ? `?${qs}` : ""}`);
  }

  async getFinancialReport(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    const qs = query.toString();
    return this.request(`/reports/financial${qs ? `?${qs}` : ""}`);
  }

  async getAttendanceReport(params?: {
    month?: number;
    year?: number;
  }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.month) query.append("month", params.month.toString());
    if (params?.year) query.append("year", params.year.toString());
    const qs = query.toString();
    return this.request(`/reports/attendance${qs ? `?${qs}` : ""}`);
  }
}

export const principalApi = new PrincipalApi();

// ==================== HELPERS ====================

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fa-AF", {
    style: "currency",
    currency: "AFN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getStudentStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    ACTIVE: "#10b981",
    GRADUATED: "#3b82f6",
    SUSPENDED: "#f59e0b",
    LEFT: "#ef4444",
  };
  return colors[status] || "#94a3b8";
};

export const getStudentStatusText = (status: string): string => {
  const labels: Record<string, string> = {
    ACTIVE: "فعال",
    GRADUATED: "فارغ",
    SUSPENDED: "معلق",
    LEFT: "ترک کرده",
  };
  return labels[status] || status;
};
