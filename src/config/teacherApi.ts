// src/config/teacherApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

// ==================== TYPES ====================

export interface LeaveRequest {
  id: number;
  type: "ANNUAL" | "SICK" | "EMERGENCY" | "MATERNITY" | "UNPAID";
  startDate: string;
  endDate: string;
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  rejectionReason?: string;
  approver?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface SalaryRaiseRequest {
  id: number;
  type: "salary_raise";
  currentSalary?: number;
  requestedAmount: number;
  reason: string;
  achievements?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
  approver?: string;
  approvedAt?: string;
  createdAt: string;
}

export type RequestUnion = LeaveRequest | SalaryRaiseRequest;

export interface SalaryRecord {
  id: number;
  month: number;
  year: number;
  monthName: string;
  baseSalary: number;
  bonusAmount: number;
  deductionAmount: number;
  overtimeAmount: number;
  overtimeHours: number;
  finalAmount: number;
  status: "PENDING" | "PAID" | "PARTIAL" | "CANCELLED";
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
}

export interface SalarySummary {
  totalEarned: number;
  totalPending: number;
  totalPaid: number;
  averageSalary: number;
  thisMonth: {
    amount: number;
    status: string;
  };
  monthlyData: {
    month: string;
    amount: number;
    status: "paid" | "pending" | "partial";
  }[];
}

export interface AttendanceRecord {
  id: number;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  checkIn: string;
  checkOut: string;
  hours: number;
}

export interface AttendanceSummary {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
  monthlyData: {
    month: string;
    present: number;
    total: number;
  }[];
}

export interface LeaveBalance {
  userId: number;
  year: number;
  annualLeave: number;
  sickLeave: number;
  emergencyLeave: number;
  maternityLeave: number;
  usedAnnual: number;
  usedSick: number;
  usedEmergency: number;
  usedMaternity: number;
  remainingAnnual: number;
  remainingSick: number;
  remainingEmergency: number;
  remainingMaternity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ==================== API CLASS ====================

class TeacherApi {
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
      const url = `${BASE_URL}/api/teacher${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Network error" }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ Teacher API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ==================== REQUESTS ====================

  async getRequests(params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<
    ApiResponse<{
      requests: any[];
      total: number;
      page: number;
      totalPages: number;
    }>
  > {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.type) query.append("type", params.type);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    const qs = query.toString();
    return this.request(`/requests${qs ? `?${qs}` : ""}`);
  }

  async getRequestById(id: number): Promise<ApiResponse<any>> {
    return this.request(`/requests/${id}`);
  }

  async requestLeave(data: {
    type: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }): Promise<ApiResponse<any>> {
    return this.request("/requests/leave", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async requestSalaryRaise(data: {
    currentSalary?: string;
    requestedAmount: string;
    reason: string;
    achievements?: string;
  }): Promise<ApiResponse<any>> {
    return this.request("/requests/salary-raise", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==================== SALARY ====================

  async getSalaryReport(params?: {
    year?: number;
  }): Promise<
    ApiResponse<{ records: SalaryRecord[]; summary: SalarySummary }>
  > {
    const query = new URLSearchParams();
    if (params?.year) query.append("year", params.year.toString());
    const qs = query.toString();
    return this.request(`/salary/report${qs ? `?${qs}` : ""}`);
  }

  // ==================== ATTENDANCE ====================

  async getAttendanceReport(params?: {
    month?: number;
    year?: number;
  }): Promise<
    ApiResponse<{ records: AttendanceRecord[]; summary: AttendanceSummary }>
  > {
    const query = new URLSearchParams();
    if (params?.month) query.append("month", params.month.toString());
    if (params?.year) query.append("year", params.year.toString());
    const qs = query.toString();
    return this.request(`/attendance/report${qs ? `?${qs}` : ""}`);
  }

  // ==================== LEAVE BALANCE ====================

  async getLeaveBalance(params?: {
    year?: number;
  }): Promise<ApiResponse<LeaveBalance>> {
    const query = new URLSearchParams();
    if (params?.year) query.append("year", params.year.toString());
    const qs = query.toString();
    return this.request(`/leave/balance${qs ? `?${qs}` : ""}`);
  }
}

export const teacherApi = new TeacherApi();

// ==================== HELPERS ====================

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fa-AF", {
    style: "currency",
    currency: "AFN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getRequestStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: "#f59e0b",
    approved: "#10b981",
    rejected: "#ef4444",
    cancelled: "#94a3b8",
  };
  return colors[status] || "#94a3b8";
};

export const getRequestStatusText = (status: string): string => {
  const labels: Record<string, string> = {
    pending: "در انتظار",
    approved: "تایید شده",
    rejected: "رد شده",
    cancelled: "لغو شده",
  };
  return labels[status] || status;
};

export const getLeaveTypeText = (type: string): string => {
  const labels: Record<string, string> = {
    ANNUAL: "مرخصی سالانه",
    SICK: "مرخصی استعلاجی",
    EMERGENCY: "مرخصی اضطرار",
    MATERNITY: "مرخصی زایمان",
    UNPAID: "مرخصی بدون حقوق",
  };
  return labels[type] || type;
};
