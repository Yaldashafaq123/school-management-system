// src/config/hrApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

// ==================== TYPES ====================

export interface HRProfile {
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
  hrStaff: {
    id: number;
    position: string;
    department: string;
    isActive: boolean;
    joinDate: string;
    salary: number | null;
  };
  statistics: {
    totalStaff: number;
    totalTeachers: number;
    totalStudents: number;
    totalParents: number;
    activeStaff: number;
    onLeave: number;
    pendingRequests: number;
    totalDepartments: number;
  };
}

export type StaffType =
  | "TEACHER"
  | "ADMIN"
  | "FINANCE"
  | "HR"
  | "PRINCIPAL"
  | "CHEF"
  | "GUARD"
  | "DRIVER"
  | "CLEANER"
  | "SECURITY"
  | "MAINTENANCE"
  | "LIBRARIAN"
  | "NURSE"
  | "COUNSELOR"
  | "COACH"
  | "OTHER";

export interface StaffMember {
  id: number;
  fullName: string;
  nameFarsi?: string;
  email: string;
  phone: string;
  role: string;
  staffType: StaffType;
  position: string;
  department: string;
  isActive: boolean;
  verified: boolean;
  createdAt: string;
  profileImage?: string;
  staffId?: number;
  joiningDate?: string;
  salary?: number;
  specialization?: string;
  teacherCode?: string;
  experience?: string;
  qualification?: string;
  fatherName?: string;
  fatherNameFarsi?: string;
  grandfatherName?: string;
  civilId?: string;
  birthDate?: string;
  birthPlace?: string;
  currentAddress?: string;
  permanentAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  sex?: string;
  maritalStatus?: string;
  bloodType?: string;
  nationality?: string;
  educationLevel?: string;
  educationField?: string;
  bankAccountNumber?: string;
  bankName?: string;
  insuranceNumber?: string;
  insuranceProvider?: string;
  hasInsurance?: boolean;
  attendanceCount?: number;
  salaryCount?: number;
}

export interface StaffResponse {
  staff: StaffMember[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface AttendanceRecord {
  id: number;
  staffId: number;
  staffName: string;
  role: string;
  scanTime: string;
  punchType: string;
  deviceName: string;
}

export interface TodayAttendance {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "present" | "absent" | "late";
  time: string | null;
}

export interface AttendanceSummary {
  date: string;
  summary: {
    late: number;
    present: number;
    absent: number;
    total: number;
  };
  attendance: TodayAttendance[];
}

export interface SalaryRecord {
  id: number;
  teacherId: number;
  teacherName: string;
  teacherRole: string;
  amount: number;
  baseSalary: number;
  bonusAmount: number;
  deductionAmount: number;
  overtimeAmount: number;
  overtimeHours: number;
  finalAmount: number;
  month: number;
  year: number;
  status: "PENDING" | "PAID" | "PARTIAL" | "CANCELLED";
  notes?: string;
  paidAt?: string;
  payments?: any[];
  createdAt: string;
}

export interface SalaryResponse {
  salaries: SalaryRecord[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  summary: {
    pendingTotal: number;
    paidTotal: number;
    totalSalaries: number;
    pendingCount: number;
    paidCount: number;
  };
}

export interface HrDashboard {
  summary: {
    totalStaff: number;
    activeStaff: number;
    onLeave: number;
    totalTeachers: number;
    totalStudents: number;
    totalParents: number;
    pendingRequests: number;
    todayAttendance: number;
    totalDepartments: number;
    attendanceRate: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ==================== API CLASS ====================

class HRApi {
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
      const url = `${BASE_URL}/hr${endpoint}`;

      console.log(`📡 HR Request: ${options.method || "GET"} ${url}`);

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
      console.error(`❌ HR API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ==================== PROFILE ====================

  async getProfile(): Promise<ApiResponse<HRProfile>> {
    return this.request("/profile");
  }

  async updateProfile(data: {
    fullName?: string;
    phone?: string;
    position?: string;
    department?: string;
    salary?: number;
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

  async getDashboard(): Promise<ApiResponse<HrDashboard>> {
    return this.request("/dashboard");
  }

  // ==================== STAFF MANAGEMENT ====================

  async getStaff(params?: {
    role?: string;
    status?: string;
    search?: string;
    department?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<StaffResponse>> {
    const query = new URLSearchParams();
    if (params?.role) query.append("role", params.role);
    if (params?.status) query.append("status", params.status);
    if (params?.search) query.append("search", params.search);
    if (params?.department) query.append("department", params.department);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    const qs = query.toString();
    return this.request(`/staff${qs ? `?${qs}` : ""}`);
  }

  async getStaffById(id: number): Promise<ApiResponse<any>> {
    return this.request(`/staff/${id}`);
  }

  async createStaff(data: {
    fullName: string;
    nameFarsi?: string;
    email: string;
    phone?: string;
    password: string;
    role?: string;
    staffType: StaffType;
    position?: string;
    department?: string;
    joinDate?: string;
    salary?: number;
    isActive?: boolean;
    notes?: string;
    specialization?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    contractFile?: string;
    idCardFile?: string;
    photoFile?: string;
    fatherName?: string;
    fatherNameFarsi?: string;
    grandfatherName?: string;
    grandfatherNameFarsi?: string;
    sex?: string;
    maritalStatus?: string;
    bloodType?: string;
    civilId?: string;
    civilIdIssueDate?: string;
    civilIdExpiryDate?: string;
    birthDate?: string;
    birthPlace?: string;
    nationality?: string;
    currentAddress?: string;
    permanentAddress?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    educationLevel?: string;
    educationField?: string;
    educationInstitution?: string;
    graduationYear?: number;
    workExperience?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    contractType?: string;
    workSchedule?: string;
    workShift?: string;
    baseSalary?: number;
    salaryCurrency?: string;
    bankAccountNumber?: string;
    bankName?: string;
    insuranceNumber?: string;
    insuranceProvider?: string;
    hasInsurance?: boolean;
    hasContract?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request("/staff", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateStaff(
    id: number,
    data: {
      fullName?: string;
      nameFarsi?: string;
      email?: string;
      phone?: string;
      isActive?: boolean;
      position?: string;
      department?: string;
      salary?: number;
      specialization?: string;
      experience?: string;
      qualification?: string;
      staffType?: string;
      joinDate?: string;
      notes?: string;
      fatherName?: string;
      fatherNameFarsi?: string;
      grandfatherName?: string;
      grandfatherNameFarsi?: string;
      sex?: string;
      maritalStatus?: string;
      bloodType?: string;
      civilId?: string;
      civilIdIssueDate?: string;
      civilIdExpiryDate?: string;
      birthDate?: string;
      birthPlace?: string;
      nationality?: string;
      currentAddress?: string;
      permanentAddress?: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
      emergencyContactRelation?: string;
      educationLevel?: string;
      educationField?: string;
      educationInstitution?: string;
      graduationYear?: number;
      workExperience?: string;
      contractStartDate?: string;
      contractEndDate?: string;
      contractType?: string;
      workSchedule?: string;
      workShift?: string;
      baseSalary?: number;
      salaryCurrency?: string;
      bankAccountNumber?: string;
      bankName?: string;
      insuranceNumber?: string;
      insuranceProvider?: string;
      hasInsurance?: boolean;
      hasContract?: boolean;
    },
  ): Promise<ApiResponse<any>> {
    return this.request(`/staff/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteStaff(id: number): Promise<ApiResponse<any>> {
    return this.request(`/staff/${id}`, {
      method: "DELETE",
    });
  }

  // ==================== ATTENDANCE ====================

  async getTodayAttendance(): Promise<ApiResponse<AttendanceSummary>> {
    return this.request("/attendance/today");
  }

  async getAttendance(params?: {
    startDate?: string;
    endDate?: string;
    staffId?: number;
    page?: number;
    limit?: number;
  }): Promise<
    ApiResponse<{
      attendance: AttendanceRecord[];
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    }>
  > {
    const query = new URLSearchParams();
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.staffId) query.append("staffId", params.staffId.toString());
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    const qs = query.toString();
    return this.request(`/attendance${qs ? `?${qs}` : ""}`);
  }

  async recordAttendance(data: {
    staffId: number;
    punchType?: string;
    deviceName?: string;
  }): Promise<ApiResponse<any>> {
    return this.request("/attendance", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAttendanceSummary(params?: {
    month?: number;
    year?: number;
  }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.month) query.append("month", params.month.toString());
    if (params?.year) query.append("year", params.year.toString());
    const qs = query.toString();
    return this.request(`/attendance/summary${qs ? `?${qs}` : ""}`);
  }

  // ==================== ATTENDANCE REPORTS (NEW) ====================

  /**
   * Get attendance report for all staff with filtering
   */
  async getAttendanceReport(params?: {
    startDate?: string;
    endDate?: string;
    staffId?: number;
    staffType?: string;
    department?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.staffId) query.append("staffId", params.staffId.toString());
    if (params?.staffType) query.append("staffType", params.staffType);
    if (params?.department) query.append("department", params.department);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    const qs = query.toString();
    return this.request(`/attendance/report${qs ? `?${qs}` : ""}`);
  }

  /**
   * Get monthly attendance for a specific staff member
   */
  async getStaffMonthlyAttendance(
    staffId: number,
    params?: {
      month?: number;
      year?: number;
    },
  ): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.month) query.append("month", params.month.toString());
    if (params?.year) query.append("year", params.year.toString());
    const qs = query.toString();
    return this.request(
      `/attendance/staff/${staffId}/monthly${qs ? `?${qs}` : ""}`,
    );
  }

  /**
   * Export attendance report
   */
  async exportAttendanceReport(params?: {
    startDate?: string;
    endDate?: string;
    staffType?: string;
  }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.staffType) query.append("staffType", params.staffType);
    const qs = query.toString();
    return this.request(`/attendance/export${qs ? `?${qs}` : ""}`);
  }

  // ==================== SALARIES ====================

  async getSalaries(params?: {
    month?: number;
    year?: number;
    status?: string;
    staffId?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<SalaryResponse>> {
    const query = new URLSearchParams();
    if (params?.month) query.append("month", params.month.toString());
    if (params?.year) query.append("year", params.year.toString());
    if (params?.status) query.append("status", params.status);
    if (params?.staffId) query.append("staffId", params.staffId.toString());
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    const qs = query.toString();
    return this.request(`/salaries${qs ? `?${qs}` : ""}`);
  }

  async generateSalaries(data: {
    month: number;
    year: number;
  }): Promise<ApiResponse<any>> {
    return this.request("/salaries/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async recordSalaryPayment(data: {
    salaryId: number;
    amount: number;
    paymentMethod: string;
    referenceNo?: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return this.request("/salaries/pay", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getSalaryStats(params?: {
    month?: number;
    year?: number;
  }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.month) query.append("month", params.month.toString());
    if (params?.year) query.append("year", params.year.toString());
    const qs = query.toString();
    return this.request(`/salaries/stats${qs ? `?${qs}` : ""}`);
  }
}

export const hrApi = new HRApi();

// ==================== HELPERS ====================

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fa-AF", {
    style: "currency",
    currency: "AFN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    ADMIN: "مدیر",
    TEACHER: "استاد",
    STUDENT: "شاگرد",
    PARENT: "والد",
    FINANCE: "مالی",
    HR: "منابع بشری",
    PRINCIPAL: "مدیر مکتب",
  };
  return labels[role] || role;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    active: "#10b981",
    present: "#10b981",
    "on-leave": "#f59e0b",
    late: "#f59e0b",
    terminated: "#ef4444",
    absent: "#ef4444",
    inactive: "#94a3b8",
    PAID: "#10b981",
    PENDING: "#f59e0b",
    PARTIAL: "#f59e0b",
    CANCELLED: "#ef4444",
  };
  return colors[status] || "#94a3b8";
};

export const getStatusText = (status: string): string => {
  const labels: Record<string, string> = {
    active: "فعال",
    present: "حاضر",
    "on-leave": "در مرخصی",
    late: "تأخیر",
    terminated: "اخراج",
    absent: "غایب",
    inactive: "غیرفعال",
    PAID: "پرداخت شد",
    PENDING: "در انتظار",
    PARTIAL: "ناقص",
    CANCELLED: "لغو",
  };
  return labels[status] || status;
};
