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
  monthName?: string;
  monthNumber?: number;
  year?: number;
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

// ==================== MONTH CONSTANTS ====================

/**
 * Persian (Iranian) month names
 */
export const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

/**
 * Afghan (Dari) month names in order
 */
export const AFGHAN_MONTHS = [
  "حمل", // 1
  "ثور", // 2
  "جوزا", // 3
  "سرطان", // 4
  "اسد", // 5
  "سنبله", // 6
  "میزان", // 7
  "عقرب", // 8
  "قوس", // 9
  "جدی", // 10
  "دلو", // 11
  "حوت", // 12
];

/**
 * Persian (Iranian) to Afghan (Dari) month names mapping
 */
export const PERSIAN_TO_AFGHAN: Record<string, string> = {
  فروردین: "حمل",
  اردیبهشت: "ثور",
  خرداد: "جوزا",
  تیر: "سرطان",
  مرداد: "اسد",
  شهریور: "سنبله",
  مهر: "میزان",
  آبان: "عقرب",
  آذر: "قوس",
  دی: "جدی",
  بهمن: "دلو",
  اسفند: "حوت",
};

/**
 * Afghan (Dari) to Persian (Iranian) month names mapping
 */
export const AFGHAN_TO_PERSIAN: Record<string, string> = {
  حمل: "فروردین",
  ثور: "اردیبهشت",
  جوزا: "خرداد",
  سرطان: "تیر",
  اسد: "مرداد",
  سنبله: "شهریور",
  میزان: "مهر",
  عقرب: "آبان",
  قوس: "آذر",
  جدی: "دی",
  دلو: "بهمن",
  حوت: "اسفند",
};

// ==================== MONTH CONVERSION FUNCTIONS ====================

/**
 * Convert a Persian (Iranian) month name to Afghan (Dari) month name
 */
export function persianToAfghan(persianMonth: string): string {
  // If it's already an Afghan month, return as is
  if (AFGHAN_MONTHS.includes(persianMonth)) {
    return persianMonth;
  }

  // Convert from Persian to Afghan
  const afghan = PERSIAN_TO_AFGHAN[persianMonth];
  if (afghan) {
    return afghan;
  }

  // If it's a number (1-12), map to Afghan month
  const monthNum = parseInt(persianMonth);
  if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
    return AFGHAN_MONTHS[monthNum - 1];
  }

  // Return original if no mapping found
  return persianMonth;
}

/**
 * Convert an Afghan (Dari) month name to Persian (Iranian) month name
 */
export function afghanToPersian(afghanMonth: string): string {
  // If it's already a Persian month, return as is
  if (PERSIAN_MONTHS.includes(afghanMonth)) {
    return afghanMonth;
  }

  // Convert from Afghan to Persian
  const persian = AFGHAN_TO_PERSIAN[afghanMonth];
  if (persian) {
    return persian;
  }

  // If it's a number (1-12), map to Persian month
  const monthNum = parseInt(afghanMonth);
  if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
    return PERSIAN_MONTHS[monthNum - 1];
  }

  return afghanMonth;
}

/**
 * Get the Persian month name from a date string
 * Extracts the month name from a date like "15 فروردین 1404"
 */
export function extractMonthFromDate(dateStr: string): string {
  const parts = dateStr.split(" ");
  if (parts.length >= 2) {
    // Check if the second part is a Persian month
    const month = parts[1];
    if (PERSIAN_MONTHS.includes(month) || AFGHAN_MONTHS.includes(month)) {
      return month;
    }
  }
  return "";
}

/**
 * Check if a date string belongs to a specific Persian month
 */
export function dateMatchesMonth(dateStr: string, monthName: string): boolean {
  const extractedMonth = extractMonthFromDate(dateStr);
  if (!extractedMonth) return false;

  // Check both Persian and Afghan names
  const persianName = afghanToPersian(monthName);
  const afghanName = persianToAfghan(monthName);

  return extractedMonth === persianName || extractedMonth === afghanName;
}

/**
 * Convert Persian month number to Gregorian month number
 * Returns the Gregorian month that contains the START of the Persian month
 */
export function persianMonthNumberToGregorian(persianMonth: number): number {
  // Persian month → Gregorian month (where the Persian month STARTS)
  const mapping: Record<number, number> = {
    1: 3, // فروردین → March (starts March 21)
    2: 4, // اردیبهشت → April (starts April 21)
    3: 5, // خرداد → May (starts May 22)
    4: 6, // تیر → June (starts June 22)
    5: 7, // مرداد → July (starts July 23)
    6: 8, // شهریور → August (starts August 23)
    7: 9, // مهر → September (starts September 23)
    8: 10, // آبان → October (starts October 23)
    9: 11, // آذر → November (starts November 22)
    10: 12, // دی → December (starts December 22)
    11: 1, // بهمن → January (starts January 21)
    12: 2, // اسفند → February (starts February 20)
  };
  return mapping[persianMonth] || 1;
}

/**
 * Get the Gregorian months that contain a Persian month
 * Returns an array of [month, year] pairs to fetch
 */
export function getGregorianRangeForPersianMonth(
  persianMonth: number,
  persianYear: number,
): { month: number; year: number }[] {
  const gregorianYear = persianYear + 621;
  const startMonth = persianMonthNumberToGregorian(persianMonth);

  // Persian months span across 2 Gregorian months
  const result = [{ month: startMonth, year: gregorianYear }];

  // If the start month is December, the next month is January of next year
  if (startMonth === 12) {
    result.push({ month: 1, year: gregorianYear + 1 });
  } else {
    result.push({ month: startMonth + 1, year: gregorianYear });
  }

  return result;
}

// ==================== DATA PROCESSING FUNCTIONS ====================

/**
 * Process attendance data to convert Persian months to Afghan months
 */
export function processAttendanceData(data: {
  records: AttendanceRecord[];
  summary: AttendanceSummary;
}): {
  records: AttendanceRecord[];
  summary: AttendanceSummary;
} {
  // Convert monthName in summary
  if (data.summary.monthName) {
    data.summary.monthName = persianToAfghan(data.summary.monthName);
  }

  // Convert month names in monthlyData
  if (data.summary.monthlyData && Array.isArray(data.summary.monthlyData)) {
    data.summary.monthlyData = data.summary.monthlyData.map((item) => ({
      ...item,
      month: persianToAfghan(item.month),
    }));
  }

  // Convert month names in records (daily records)
  if (data.records && Array.isArray(data.records)) {
    data.records = data.records.map((record) => {
      const parts = record.date.split(" ");
      if (parts.length === 3) {
        const day = parts[0];
        const persianMonth = parts[1];
        const year = parts[2];
        const afghanMonth = persianToAfghan(persianMonth);
        record.date = `${day} ${afghanMonth} ${year}`;
      }
      return record;
    });
  }

  return data;
}

/**
 * Process salary data to convert Persian months to Afghan months
 */
export function processSalaryData(data: {
  records: SalaryRecord[];
  summary: SalarySummary;
}): {
  records: SalaryRecord[];
  summary: SalarySummary;
} {
  if (data.records && Array.isArray(data.records)) {
    data.records = data.records.map((record) => ({
      ...record,
      monthName: persianToAfghan(record.monthName),
    }));
  }

  if (data.summary.monthlyData && Array.isArray(data.summary.monthlyData)) {
    data.summary.monthlyData = data.summary.monthlyData.map((item) => ({
      ...item,
      month: persianToAfghan(item.month),
    }));
  }

  return data;
}

/**
 * Filter attendance records by a specific Persian month
 */
export function filterRecordsByMonth(
  records: AttendanceRecord[],
  monthName: string,
): AttendanceRecord[] {
  const persianName = afghanToPersian(monthName);
  const afghanName = persianToAfghan(monthName);

  return records.filter((record) => {
    const extractedMonth = extractMonthFromDate(record.date);
    return extractedMonth === persianName || extractedMonth === afghanName;
  });
}

/**
 * Get statistics for filtered records
 */
export function getFilteredStats(records: AttendanceRecord[]): {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
} {
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  const excused = records.filter((r) => r.status === "excused").length;
  const total = present + absent + late + excused;

  // Count unique dates
  const uniqueDates = new Set(records.map((r) => r.date));

  return {
    totalDays: uniqueDates.size,
    present,
    absent,
    late,
    excused,
    attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
  };
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
      const url = `${BASE_URL}/teacher${endpoint}`;

      console.log(`🌐 API Request: ${url}`);

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
    SICK: "مرخصی مریضی",
    EMERGENCY: "مرخصی اضطرار",
    MATERNITY: "مرخصی مادران",
    UNPAID: "مرخصی بدون معاش",
  };
  return labels[type] || type;
};

// ==================== CURRENT DATE HELPERS ====================

/**
 * Get current Persian (Jalali) month and year
 * This is a rough estimate - for exact conversion, use moment-jalaali on backend
 */
export function getCurrentPersianDate(): {
  month: number;
  year: number;
  monthName: string;
} {
  const now = new Date();
  const gregorianMonth = now.getMonth() + 1;
  const gregorianDay = now.getDate();

  // Persian months start around 20-23 of each Gregorian month
  let persianMonth = 0;
  let persianYear = now.getFullYear() - 621;

  if (gregorianMonth === 3 && gregorianDay >= 21) persianMonth = 12;
  else if (gregorianMonth === 4) persianMonth = 1;
  else if (gregorianMonth === 5) persianMonth = 2;
  else if (gregorianMonth === 6) persianMonth = 3;
  else if (gregorianMonth === 7) persianMonth = 4;
  else if (gregorianMonth === 8) persianMonth = 5;
  else if (gregorianMonth === 9) persianMonth = 6;
  else if (gregorianMonth === 10) persianMonth = 7;
  else if (gregorianMonth === 11) persianMonth = 8;
  else if (gregorianMonth === 12) persianMonth = 9;
  else if (gregorianMonth === 1) persianMonth = 10;
  else if (gregorianMonth === 2) persianMonth = 11;
  else if (gregorianMonth === 3 && gregorianDay < 21) persianMonth = 11;

  if (persianMonth === 0) persianMonth = 1;

  return {
    month: persianMonth,
    year: persianYear,
    monthName: AFGHAN_MONTHS[persianMonth - 1],
  };
}
