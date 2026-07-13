// src/config/financeApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

// ==================== TYPES ====================
// src/config/financeApi.ts - Add these methods to the FinanceApi class

// ==================== FINANCE PROFILE ====================

export interface FinanceProfile {
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
  financeStaff: {
    id: number;
    position: string;
    department: string;
    isActive: boolean;
    joinDate: string;
    salary: number | null;
  };
  statistics: {
    totalStudents: number;
    totalAssignments: number;
    activeAssignments: number;
    completedAssignments: number;
    collectionRate: number;
    totalOutstanding: number;
    monthlyCollection: number;
  };
}

export interface FinanceStats {
  summary: {
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    totalAssignments: number;
    activeAssignments: number;
    completedAssignments: number;
    collectionRate: number;
    totalOutstanding: number;
    monthlyCollection: number;
    monthlyExpenses: number;
    pendingFees: number;
    overdueRecords: number;
  };
  financeStaff: {
    id: number;
    position: string;
    department: string;
    joinDate: string;
    salary: number | null;
  };
}

// Add to FinanceApi class:

export interface FeeTemplate {
  id: number;
  name: string;
  academicYearId: number;
  academicYearName?: string;
  classId?: number;
  className?: string;
  description?: string;
  isActive: boolean;
  itemCount: number;
  assignedCount: number;
  studentCount: number;
  items: FeeTemplateItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  class?: {
    id: number;
    name: string;
    section?: string;
  };
  academicYear?: {
    id: number;
    name: string;
  };
  templateItems?: FeeTemplateItem[];
}

export interface FeeTemplateItem {
  id: number;
  feeTemplateId: number;
  feeType: string;
  name: string;
  amount: number;
  isRecurring: boolean;
  isMandatory: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeeAssignment {
  id: number;
  studentId: number;
  academicYearId: number;
  feeTemplateId?: number;
  assignedDate: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  notes?: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: number;
    user: { fullName: string; email: string; phone?: string };
    class?: { id: number; name: string };
  };
  academicYear?: { id: number; name: string };
  feeItems: FeeAssignmentItem[];
  studentDiscounts?: StudentDiscount[];
  feeTemplate?: { id: number; name: string };
}

export interface FeeAssignmentItem {
  id: number;
  feeAssignmentId: number;
  feeType: string;
  name: string;
  amount: number;
  isRecurring: boolean;
  startMonth?: string;
  endMonth?: string;
  discountAmount: number;
  finalAmount: number;
  paidAmount?: number;
  status: "PENDING" | "PAID" | "PARTIAL" | "OVERDUE" | "CANCELLED";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  monthlyRecords?: MonthlyFeeRecord[];
}

export interface MonthlyFeeRecord {
  id: number;
  feeAssignmentItemId: number;
  month: string;
  year: number;
  amount: number;
  paidAmount: number;
  balanceAmount: number;
  dueDate?: string;
  paidDate?: string;
  status: "PENDING" | "PAID" | "PARTIAL" | "OVERDUE" | "CANCELLED";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  payments?: MonthlyFeePayment[];
}

export interface MonthlyFeePayment {
  id: number;
  monthlyFeeRecordId: number;
  amount: number;
  paymentMethod: string;
  referenceNo?: string;
  notes?: string;
  confirmedBy: number;
  confirmedAt: string;
  createdAt: string;
  confirmer?: { fullName: string };
}

export interface FeeItemPayment {
  id: number;
  feeAssignmentItemId: number;
  amount: number;
  paymentMethod: string;
  referenceNo?: string;
  notes?: string;
  confirmedBy: number;
  confirmedAt: string;
  createdAt: string;
  confirmer?: { fullName: string };
}

export interface StudentDiscount {
  id: number;
  studentId: number;
  feeAssignmentId?: number;
  feeAssignmentItemId?: number;
  approvedBy: number;
  amount: number;
  reason: string;
  createdAt: string;
  approver?: { fullName: string };
}

export interface AcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  studentCount?: number;
  templateCount?: number;
  classCount?: number;
}

export interface OutstandingFee {
  studentId: number;
  studentName: string;
  studentPhone?: string;
  className?: string;
  academicYear: string;
  totalBalance: number;
  pendingItems: {
    type: "monthly" | "one-time";
    name: string;
    month?: string;
    year?: number;
    monthName?: string;
    balanceAmount: number;
    recordId?: number;
    itemId?: number;
  }[];
}

export interface OutstandingFeesResponse {
  totalOutstanding: number;
  totalStudents: number;
  students: OutstandingFee[];
}

export interface FeeStatistics {
  todayCollection: number;
  todayCount: number;
  weekCollection: number;
  monthCollection: number;
  pendingFees: number;
  pendingCount: number;
  overdueCount: number;
  totalStudents: number;
  collectionRate: number;
}

export interface PaymentRecord {
  id: number;
  studentId?: number;
  studentName: string;
  studentPhone?: string;
  className: string;
  amount: number;
  paymentMethod: string;
  date: string;
  time: string;
  feeTitle: string;
  confirmedBy: string;
  referenceNo?: string | null;
  notes?: string | null;
  feePlanId?: number;
  academicYear?: string;
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: {
    payments: PaymentRecord[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

export interface ClassItem {
  id: number;
  name: string;
  section: string;
  studentCount: number;
  is_active?: boolean;
}

export interface BulkStudent {
  id: number;
  name: string;
  rollNumber: string;
  amount: number;
  feeId?: number | null;
  defaultAmount?: number;
}

export interface StudentFeeStatus {
  id: number;
  name: string;
  phone?: string;
  className?: string;
  classSection?: string;
  classId?: number;
  totalFees: number;
  totalPaid: number;
  totalPending: number;
  pendingFees: {
    id: number;
    academicYear: string;
    academicYearId: number;
    amount: number;
    paidAmount: number;
    balanceAmount: number;
    discountAmount: number;
    status: string;
    createdAt: string;
  }[];
}

export interface FeeCategory {
  value: string;
  label: string;
  icon: string;
  type: string;
  isRecurring: boolean;
}

export interface AfghanMonth {
  key: string;
  name: string;
}

export interface DashboardSummary {
  totalAssignments: number;
  activeAssignments: number;
  totalOutstanding: number;
  monthlyCollection: number;
}

export interface ExpenseStats {
  totalThisMonth: number;
  totalThisYear: number;
  averageDaily: number;
  topCategory: {
    name: string;
    amount: number;
  };
}

export interface Student {
  id: number;
  userId: number;
  classId?: number;
  status: string;
  studentNumber?: string;
  user: {
    fullName: string;
    email: string;
    phone?: string;
  };
  class?: {
    id: number;
    name: string;
    section?: string;
  };
}

export interface FeeAssignmentInput {
  studentId: number;
  academicYearId: number;
  feeTemplateId?: number;
  items: FeeItemInput[];
  notes?: string;
}

export interface FeeItemInput {
  feeType: string;
  name: string;
  amount: number;
  isRecurring: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ==================== API CLASS ====================

class FinanceApi {
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
      const url = `${BASE_URL}/finance${endpoint}`;

      console.log(`📡 Request: ${options.method || "GET"} ${url}`);

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
      console.error(`❌ API Error [${endpoint}]:`, error);
      throw error;
    }
  }
  async getProfile(): Promise<{ success: boolean; data: FinanceProfile }> {
    return this.request("/profile");
  }

  async updateProfile(data: {
    fullName?: string;
    phone?: string;
    position?: string;
    department?: string;
    salary?: number;
    profileImage?: string;
  }): Promise<{ success: boolean; data: any }> {
    return this.request("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getStats(): Promise<{ success: boolean; data: FinanceStats }> {
    return this.request("/stats");
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    return this.request("/change-password", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  // ==================== DASHBOARD ====================
  async getDashboard(): Promise<{ success: boolean; data: DashboardSummary }> {
    return this.request("/dashboard/summary");
  }

  // ==================== ACADEMIC YEARS ====================
  async getAcademicYears(): Promise<AcademicYear[]> {
    try {
      console.log("📡 Fetching academic years from API...");
      const result = await this.request<{
        success: boolean;
        data: AcademicYear[];
      }>("/academic-years");
      console.log("📡 API Response:", JSON.stringify(result, null, 2));

      if (result && typeof result === "object") {
        const response = result as any;
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        if (response.success && response.data) {
          return response.data;
        }
      }

      console.warn("⚠️ No academic years data found in response");
      return [];
    } catch (error) {
      console.error("❌ Failed to fetch academic years:", error);
      return [];
    }
  }

  // ==================== FEE TEMPLATES ====================
  async getFeeTemplates(params?: {
    classId?: number;
    academicYearId?: number;
    isActive?: boolean;
  }): Promise<FeeTemplate[]> {
    try {
      const query = new URLSearchParams();
      if (params?.classId) query.append("classId", params.classId.toString());
      if (params?.academicYearId)
        query.append("academicYearId", params.academicYearId.toString());
      if (params?.isActive !== undefined)
        query.append("isActive", params.isActive.toString());
      const qs = query.toString();
      const endpoint = `/fee-templates${qs ? `?${qs}` : ""}`;

      console.log("📡 Fetching templates from:", endpoint);
      const result = await this.request<{
        success: boolean;
        data: FeeTemplate[];
      }>(endpoint);
      console.log("📡 Templates Response:", JSON.stringify(result, null, 2));

      if (result && typeof result === "object") {
        const response = result as any;
        if (response.data && Array.isArray(response.data)) {
          // Ensure items are properly mapped
          return response.data.map((template: any) => ({
            ...template,
            items: template.items || template.templateItems || [],
          }));
        }
        if (Array.isArray(response)) {
          return response.map((template: any) => ({
            ...template,
            items: template.items || template.templateItems || [],
          }));
        }
        if (response.success && response.data) {
          return response.data.map((template: any) => ({
            ...template,
            items: template.items || template.templateItems || [],
          }));
        }
      }

      console.warn("⚠️ No templates data found, returning empty array");
      return [];
    } catch (error) {
      console.error("❌ Failed to fetch templates:", error);
      return [];
    }
  }

  async getFeeTemplateById(
    id: number,
  ): Promise<{ success: boolean; data: FeeTemplate }> {
    return this.request(`/fee-templates/${id}`);
  }

  async createFeeTemplate(data: {
    name: string;
    classId?: number;
    academicYearId: number;
    description?: string;
    items: Omit<
      FeeTemplateItem,
      "id" | "feeTemplateId" | "createdAt" | "updatedAt"
    >[];
  }): Promise<{ success: boolean; data: FeeTemplate }> {
    return this.request("/fee-templates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateFeeTemplate(
    id: number,
    data: {
      name?: string;
      description?: string;
      isActive?: boolean;
      items?: Omit<
        FeeTemplateItem,
        "id" | "feeTemplateId" | "createdAt" | "updatedAt"
      >[];
    },
  ): Promise<{ success: boolean; data: FeeTemplate }> {
    return this.request(`/fee-templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteFeeTemplate(
    id: number,
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/fee-templates/${id}`, {
      method: "DELETE",
    });
  }

  async getStudentsForTemplate(
    templateId: number,
  ): Promise<{ success: boolean; data: BulkStudent[] }> {
    return this.request(`/fee-templates/${templateId}/students`);
  }

  async assignTemplateToStudents(data: {
    templateId: number;
    studentIds: number[];
    academicYearId?: number;
  }): Promise<{ success: boolean; data: any }> {
    return this.request("/fee-templates/assign", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==================== FEE CATEGORIES ====================
  async getFeeCategories(): Promise<FeeCategory[]> {
    try {
      const result = await this.request<{
        success: boolean;
        data: FeeCategory[];
      }>("/fee-categories");
      console.log("📡 Categories Response:", JSON.stringify(result, null, 2));

      if (result && typeof result === "object") {
        const response = result as any;
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }
        if (Array.isArray(response)) {
          return response;
        }
        if (response.success && response.data) {
          return response.data;
        }
      }

      return [];
    } catch (error) {
      console.error("❌ Failed to fetch fee categories:", error);
      return [];
    }
  }

  // ==================== FEE ASSIGNMENTS ====================
  async getFeeAssignments(params?: {
    studentId?: number;
    academicYearId?: number;
    status?: string;
    classId?: number;
  }): Promise<{ success: boolean; data: FeeAssignment[] }> {
    const query = new URLSearchParams();
    if (params?.studentId)
      query.append("studentId", params.studentId.toString());
    if (params?.academicYearId)
      query.append("academicYearId", params.academicYearId.toString());
    if (params?.status) query.append("status", params.status);
    if (params?.classId) query.append("classId", params.classId.toString());
    const qs = query.toString();
    return this.request(`/fee-assignments${qs ? `?${qs}` : ""}`);
  }

  async getFeeAssignment(
    id: number,
  ): Promise<{ success: boolean; data: FeeAssignment }> {
    return this.request(`/fee-assignments/${id}`);
  }

  async createFeeAssignment(
    data: FeeAssignmentInput,
  ): Promise<{ success: boolean; data: FeeAssignment }> {
    return this.request("/fee-assignments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==================== CLASSES ====================
  async getClasses(): Promise<ClassItem[]> {
    try {
      const result = await this.request<{
        success: boolean;
        data: ClassItem[];
      }>("/classes-list");
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error("❌ Failed to fetch classes:", error);
      return [];
    }
  }

  // ==================== STUDENTS ====================

  async searchStudents(query: string): Promise<Student[]> {
    try {
      const result = await this.request<{ success: boolean; data: Student[] }>(
        `/students/search?q=${encodeURIComponent(query)}`,
      );
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error("❌ Failed to search students:", error);
      return [];
    }
  }

  // ==================== STUDENT FEE STATUS ====================
  async getStudentFeeStatus(studentId: number): Promise<any> {
    try {
      const result = await this.request<{ success: boolean; data: any }>(
        `/students/${studentId}/fee-summary`,
      );
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error("❌ Failed to fetch student fee status:", error);
      return null;
    }
  }

  // ==================== MONTHLY PAYMENTS ====================
  async recordMonthlyPayment(data: {
    monthlyFeeRecordId: number;
    amount: number;
    paymentMethod: string;
    referenceNo?: string;
    notes?: string;
  }): Promise<{
    success: boolean;
    data: { payment: MonthlyFeePayment; record: any };
  }> {
    return this.request("/monthly-payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==================== ONE-TIME PAYMENTS ====================
  async recordOneTimePayment(data: {
    feeAssignmentItemId: number;
    amount: number;
    paymentMethod: string;
    referenceNo?: string;
    notes?: string;
  }): Promise<{
    success: boolean;
    data: { payment: FeeItemPayment; feeItem: any };
  }> {
    return this.request("/one-time-payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==================== STUDENT DISCOUNTS ====================
  async applyDiscount(data: {
    feeAssignmentId: number;
    feeAssignmentItemId?: number;
    amount: number;
    reason: string;
  }): Promise<{ success: boolean; data: StudentDiscount }> {
    return this.request("/discounts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==================== STUDENT FEE DETAILS ====================
  async getStudentFeeSummary(
    studentId: number,
  ): Promise<{ success: boolean; data: any[] }> {
    return this.request(`/students/${studentId}/fee-summary`);
  }

  async getStudentFeeDetails(
    studentId: number,
  ): Promise<{ success: boolean; data: any }> {
    return this.request(`/students/${studentId}/fee-details`);
  }

  async getStudentsWithPendingFees(
    classId?: number,
  ): Promise<{ success: boolean; data: StudentFeeStatus[]; summary: any }> {
    const query = classId && classId > 0 ? `?classId=${classId}` : "";
    return this.request(`/students-pending-fees${query}`);
  }

  // ==================== OUTSTANDING FEES ====================
  async getOutstandingFees(params?: {
    classId?: number;
    studentId?: number;
  }): Promise<{ success: boolean; data: OutstandingFeesResponse }> {
    const query = new URLSearchParams();
    if (params?.classId) query.append("classId", params.classId.toString());
    if (params?.studentId)
      query.append("studentId", params.studentId.toString());
    const qs = query.toString();
    return this.request(`/outstanding-fees${qs ? `?${qs}` : ""}`);
  }

  // ==================== FEE STATISTICS ====================
  async getFeeStatistics(): Promise<{ success: boolean; data: FeeStatistics }> {
    return this.request("/fee-statistics");
  }

  // ==================== PAYMENT HISTORY ====================
  async getPaymentHistory(params?: {
    search?: string;
    startDate?: string;
    endDate?: string;
    studentId?: number;
    paymentMethod?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: PaymentHistoryResponse["data"] }> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.studentId)
      query.append("studentId", params.studentId.toString());
    if (params?.paymentMethod)
      query.append("paymentMethod", params.paymentMethod);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    const qs = query.toString();
    return this.request(`/payment-history${qs ? `?${qs}` : ""}`);
  }
  // Add this method to the FinanceApi class in financeApi.ts

  // src/config/financeApi.ts - Add/replace this method

  // ==================== STUDENTS ====================
  async getStudentsByClass(classId: number): Promise<Student[]> {
    try {
      console.log(`📡 Fetching students for class ${classId}...`);
      const result = await this.request<{
        success: boolean;
        data: any;
      }>(`/students-by-class/${classId}`);

      console.log(`📡 Students response:`, JSON.stringify(result, null, 2));

      // Handle different response formats
      let studentsData: any[] = [];

      if (result && typeof result === "object") {
        const response = result as any;

        // Check for data property that might be an array or object
        if (response.data) {
          if (Array.isArray(response.data)) {
            studentsData = response.data;
          } else if (typeof response.data === "object") {
            // If data is an object with students property
            if (Array.isArray(response.data.students)) {
              studentsData = response.data.students;
            } else {
              // Try to extract array from data object
              const values = Object.values(response.data);
              if (values.length > 0 && Array.isArray(values[0])) {
                studentsData = values[0];
              }
            }
          }
        }

        // If response itself is an array
        if (Array.isArray(response)) {
          studentsData = response;
        }
      }

      // Map students to expected format
      return studentsData.map((item: any) => {
        // Try to find the user object in different possible locations
        let user = item.user || item.User || item._user || {};

        // If user is not found, try to construct from available data
        if (!user || typeof user !== "object") {
          user = {
            fullName:
              item.fullName ||
              item.name ||
              item.full_name ||
              `دانش‌آموز #${item.id}`,
            email: item.email || "",
            phone: item.phone || "",
          };
        }

        // If user exists but fullName is missing, try other fields
        if (!user.fullName) {
          user.fullName =
            item.fullName ||
            item.name ||
            item.full_name ||
            item.studentName ||
            `دانش‌آموز #${item.id}`;
        }

        return {
          id: item.id,
          userId: item.userId || item.user_id || item.user?.id || 0,
          classId: item.classId || item.class_id || item.class?.id || null,
          status: item.status || "ACTIVE",
          studentNumber:
            item.studentNumber ||
            item.student_number ||
            item.rollNumber ||
            item.roll_number ||
            null,
          user: {
            fullName: user.fullName || `داjjjjjنش‌آموز #${item.id}`,
            email: user.email || item.email || "",
            phone: user.phone || item.phone || "",
          },
          class: item.class || item.Class || null,
        };
      });
    } catch (error) {
      console.error("❌ Failed to fetch students:", error);
      return [];
    }
  }
  // ==================== BULK COLLECTION ====================
  async getClassesList(): Promise<{ success: boolean; data: ClassItem[] }> {
    return this.request("/classes-list");
  }

  async getStudentsForBulkCollection(
    classId: number,
  ): Promise<{ success: boolean; data: BulkStudent[] }> {
    return this.request(`/bulk-collection-students?classId=${classId}`);
  }

  async recordBulkPayments(data: {
    classId: number;
    payments: {
      studentId: number;
      amount: number;
      paymentMethod: string;
      studentFeeId?: number;
      confirmedBy?: number;
    }[];
  }): Promise<{ success: boolean; data: any }> {
    return this.request("/bulk-payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==================== BULK PAYMENT ====================
  async processBulkPayment(data: {
    payments: {
      studentId: number;
      amount: number;
      month?: string;
      year?: number;
      feeType?: "monthly" | "one-time";
    }[];
    paymentMethod: string;
    notes?: string;
  }): Promise<{ success: boolean; data: any }> {
    return this.request("/monthly-payments/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==================== AFGHAN MONTHS ====================
  async getAfghanMonths(): Promise<{ success: boolean; data: AfghanMonth[] }> {
    return this.request("/afghan-months");
  }

  // ==================== SALARY MANAGEMENT ====================
  async getSalaries(params?: {
    teacherId?: number;
    month?: number;
    year?: number;
    status?: string;
  }): Promise<{ success: boolean; data: any[] }> {
    const query = new URLSearchParams();
    if (params?.teacherId)
      query.append("teacherId", params.teacherId.toString());
    if (params?.month) query.append("month", params.month.toString());
    if (params?.year) query.append("year", params.year.toString());
    if (params?.status) query.append("status", params.status);
    const qs = query.toString();
    return this.request(`/salaries${qs ? `?${qs}` : ""}`);
  }

  async createSalary(data: any): Promise<{ success: boolean; data: any }> {
    return this.request("/salaries", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async generateSalaries(data: {
    month: number;
    year: number;
  }): Promise<{ success: boolean; data: any }> {
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
    confirmedBy: number;
  }): Promise<{ success: boolean; data: any }> {
    return this.request("/salaries/payment", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==================== EXPENSE MANAGEMENT ====================
  async getExpenses(params?: {
    categoryId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: any }> {
    const query = new URLSearchParams();
    if (params?.categoryId)
      query.append("categoryId", params.categoryId.toString());
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    const qs = query.toString();
    return this.request(`/expenses${qs ? `?${qs}` : ""}`);
  }

  async createExpense(data: any): Promise<{ success: boolean; data: any }> {
    return this.request("/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getExpenseCategories(): Promise<{ success: boolean; data: any[] }> {
    return this.request("/expense-categories");
  }

  async createExpenseCategory(data: {
    name: string;
    description?: string;
  }): Promise<{ success: boolean; data: any }> {
    return this.request("/expense-categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateExpenseCategory(
    id: number,
    data: { name: string; description?: string },
  ): Promise<{ success: boolean; data: any }> {
    return this.request(`/expense-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteExpenseCategory(
    id: number,
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/expense-categories/${id}`, {
      method: "DELETE",
    });
  }

  async getExpenseStatistics(): Promise<{
    success: boolean;
    data: ExpenseStats;
  }> {
    return this.request("/expense-statistics");
  }

  // ==================== TRANSACTIONS & REPORTS ====================
  async getTransactions(params?: {
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ success: boolean; data: any[] }> {
    const query = new URLSearchParams();
    if (params?.type) query.append("type", params.type);
    if (params?.category) query.append("category", params.category);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    const qs = query.toString();
    return this.request(`/transactions${qs ? `?${qs}` : ""}`);
  }

  async getCashFlowReport(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{ success: boolean; data: any }> {
    const query = new URLSearchParams();
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    const qs = query.toString();
    return this.request(`/reports/cash-flow${qs ? `?${qs}` : ""}`);
  }

  async getIncomeStatement(params?: {
    year?: number;
    month?: number;
  }): Promise<{ success: boolean; data: any }> {
    const query = new URLSearchParams();
    if (params?.year) query.append("year", params.year.toString());
    if (params?.month) query.append("month", params.month.toString());
    const qs = query.toString();
    return this.request(`/reports/income-statement${qs ? `?${qs}` : ""}`);
  }

  async getDailyCollection(params?: {
    date?: string;
  }): Promise<{ success: boolean; data: any }> {
    const query = new URLSearchParams();
    if (params?.date) query.append("date", params.date);
    const qs = query.toString();
    return this.request(`/reports/daily-collection${qs ? `?${qs}` : ""}`);
  }

  async getMonthlyCollection(params?: {
    year?: number;
  }): Promise<{ success: boolean; data: any }> {
    const query = new URLSearchParams();
    if (params?.year) query.append("year", params.year.toString());
    const qs = query.toString();
    return this.request(`/reports/monthly-collection${qs ? `?${qs}` : ""}`);
  }

  async getCollectionByClass(params?: {
    academicYearId?: number;
  }): Promise<{ success: boolean; data: any }> {
    const query = new URLSearchParams();
    if (params?.academicYearId)
      query.append("academicYearId", params.academicYearId.toString());
    const qs = query.toString();
    return this.request(`/reports/collections-by-class${qs ? `?${qs}` : ""}`);
  }

  async getOutstandingAging(): Promise<{ success: boolean; data: any }> {
    return this.request("/reports/outstanding-aging");
  }

  async exportReport(params: {
    type: string;
    startDate?: string;
    endDate?: string;
    format?: string;
  }): Promise<{ success: boolean; data: any }> {
    const query = new URLSearchParams();
    query.append("type", params.type);
    if (params.startDate) query.append("startDate", params.startDate);
    if (params.endDate) query.append("endDate", params.endDate);
    if (params.format) query.append("format", params.format);
    const qs = query.toString();
    return this.request(`/reports/export${qs ? `?${qs}` : ""}`);
  }

  // ==================== DEBUG ====================
  async debugCheckFeePlans(params?: {
    classId?: number;
  }): Promise<{ success: boolean; data: any }> {
    const query = new URLSearchParams();
    if (params?.classId) query.append("classId", params.classId.toString());
    const qs = query.toString();
    return this.request(`/debug/fee-plans${qs ? `?${qs}` : ""}`);
  }
}

// ==================== EXPORT ====================
export const financeApi = new FinanceApi();

// ==================== HELPERS ====================
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fa-AF", {
    style: "currency",
    currency: "AFN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getMonthName = (monthKey: string): string => {
  const monthNames: Record<string, string> = {
    HAMAL: "حمل",
    SAWR: "ثور",
    JAWZA: "جوزا",
    SARATAN: "سرطان",
    ASAD: "اسد",
    SUNBULA: "سنبله",
    MIZAN: "میزان",
    AQRAB: "عقرب",
    QAWS: "قوس",
    JADI: "جدی",
    DALWA: "دلو",
    HOOT: "حوت",
  };
  return monthNames[monthKey] || monthKey;
};

export const getFeeTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    MONTHLY_TUITION: "school",
    MONTHLY_TRANSPORT: "bus",
    ONE_TIME_ADMISSION: "person-add",
    ONE_TIME_REGISTRATION: "clipboard",
    ONE_TIME_BOOKS: "book",
    ONE_TIME_UNIFORM: "shirt",
    ONE_TIME_EXAM: "clipboard",
    ANNUAL: "calendar",
    OTHER: "add-circle",
  };
  return icons[type] || "receipt";
};

export const getFeeTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    MONTHLY_TUITION: "شهریه ماهانه",
    MONTHLY_TRANSPORT: "حمل و نقل ماهانه",
    ONE_TIME_ADMISSION: "هزینه پذیرش",
    ONE_TIME_REGISTRATION: "هزینه ثبت نام",
    ONE_TIME_BOOKS: "کتاب‌ها",
    ONE_TIME_UNIFORM: "یونیفورم",
    ONE_TIME_EXAM: "هزینه امتحانات",
    ANNUAL: "هزینه سالانه",
    OTHER: "سایر",
  };
  return labels[type] || type;
};

export const getAfghanMonths = (): { key: string; name: string }[] => {
  return [
    { key: "HAMAL", name: "حمل" },
    { key: "SAWR", name: "ثور" },
    { key: "JAWZA", name: "جوزا" },
    { key: "SARATAN", name: "سرطان" },
    { key: "ASAD", name: "اسد" },
    { key: "SUNBULA", name: "سنبله" },
    { key: "MIZAN", name: "میزان" },
    { key: "AQRAB", name: "عقرب" },
    { key: "QAWS", name: "قوس" },
    { key: "JADI", name: "جدی" },
    { key: "DALWA", name: "دلو" },
    { key: "HOOT", name: "حوت" },
  ];
};

export const getFeeStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PAID: "#10b981",
    PARTIAL: "#f59e0b",
    PENDING: "#ef4444",
    OVERDUE: "#dc2626",
    CANCELLED: "#6b7280",
    ACTIVE: "#3b82f6",
    COMPLETED: "#10b981",
    DRAFT: "#9ca3af",
  };
  return colors[status] || "#6b7280";
};

export const getFeeStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PAID: "پرداخت شده",
    PARTIAL: "پرداخت ناقص",
    PENDING: "در انتظار",
    OVERDUE: "معوق",
    CANCELLED: "لغو شده",
    ACTIVE: "فعال",
    COMPLETED: "تکمیل شده",
    DRAFT: "پیش‌نویس",
  };
  return labels[status] || status;
};
