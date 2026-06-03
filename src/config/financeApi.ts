// src/config/financeApi.ts - COMPLETE COMBINED VERSION
import { apiRequest } from "./api";

// =============================
// TYPES & INTERFACES
// =============================

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  verified: boolean;
  createdAt: string;
  profileImage?: string;
  student?: {
    id: number;
    classId: number | null;
    className?: string;
    bio?: string;
    grade?: string;
    school?: string;
    birthDate?: string;
    parentContact?: string;
    address?: string;
    interests?: string[];
    status?: string;
  };
  teacher?: {
    id: number;
    bio?: string;
    experience?: string;
    hourlyRate?: number;
    baseSalary?: number;
    overtimeRate?: number;
    certification?: string;
    availability?: boolean;
    isActive?: boolean;
    rating?: number;
    subjects?: { id: number; name: string }[];
  };
  parent?: {
    id: number;
    relationship?: string;
    occupation?: string;
    address?: string;
    emergencyContact?: string;
    children?: {
      id: number;
      name: string;
      className?: string;
    }[];
  };
}

export interface Class {
  id: number;
  name: string;
  section?: string;
  academicYearId?: number;
  academicYear?: { id: number; name: string; isActive: boolean };
  teacherId?: number;
  teacher?: { id: number; name: string; email: string };
  studentCount: number;
  timetableCount: number;
  assignmentCount: number;
  isActive: boolean;
  description?: string;
  thumbnail?: string;
}

export interface Subject {
  id: number;
  name: string;
  teacherCount: number;
  classCount: number;
  teachers: { id: number; name: string }[];
  classes: { id: number; name: string; section?: string }[];
}

export interface TeacherSalary {
  teacherId: number;
  name: string;
  email: string;
  phone: string;
  hourlyRate: number;
  baseSalary: number;
  overtimeRate: number;
  totalEarned: number;
  pendingAmount: number;
  salaryHistory: {
    id: number;
    month: string;
    year: number;
    baseSalary: number;
    overtimeAmount: number;
    bonusAmount: number;
    deductionAmount: number;
    finalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: string;
  }[];
}

export interface StudentFeeDetails {
  studentId: number;
  studentName: string;
  className?: string;
  fees: {
    id: number;
    title: string;
    amount: number;
    dueDate: string;
    formattedDueDate?: string;
    status: string;
    billingMonth?: number;
    billingYear?: number;
    discount?: { code: string; type: string; value: number };
    paidAmount: number;
    remainingAmount: number;
    payments: {
      id: number;
      amount: number;
      paymentMethod?: string;
      date: string;
      confirmedBy: string;
    }[];
  }[];
  summary: {
    totalDue: number;
    totalPaid: number;
    totalAmount: number;
    pendingCount: number;
    paidCount: number;
  };
}

export interface StudentFee {
  id: number;
  studentId: number;
  studentName: string;
  className?: string;
  feeCategoryId: number;
  feeTitle: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  formattedDueDate?: string;
  status: "PAID" | "PARTIAL" | "PENDING" | "OVERDUE" | "CANCELLED";
  billingMonth?: number;
  billingYear?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  studentId: number;
  studentName: string;
  className?: string;
  feeId: number;
  feeTitle: string;
  amount: number;
  date: string;
  paymentMethod?: string;
  transactionId?: string;
  confirmedBy: string;
  notes?: string;
  createdAt: string;
}

export interface FeeCategory {
  id: number;
  title: string;
  amount: number;
  description?: string;
  isRecurring?: boolean;
  createdAt: string;
  updatedAt: string;
  assignedClasses?: { id: number; name: string; section?: string }[];
  _count?: {
    studentFees: number;
  };
}

export interface FeeTemplate {
  id: number;
  classId: number;
  className: string;
  feeCategoryId: number;
  feeTitle: string;
  amount: number;
  frequency: "MONTHLY" | "YEARLY" | "ONE_TIME";
  dueDay: number;
  isActive: boolean;
  academicYear?: string;
  assignedStudents?: number;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    expenses: number;
  };
}

export interface Expense {
  id: number;
  categoryId: number;
  category?: string;
  amount: number;
  description: string;
  date: string;
  formattedDate?: string;
  receiptUrl?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlySalary {
  id: number;
  teacherId: number;
  teacherName: string;
  month: number;
  year: number;
  baseSalary: number;
  overtimeAmount: number;
  bonusAmount: number;
  deductionAmount: number;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "PENDING" | "PARTIAL" | "PAID" | "CANCELLED";
  overtimeHours?: number;
  createdAt: string;
  updatedAt: string;
  payments?: {
    id: number;
    amount: number;
    date: string;
    confirmedBy: string;
  }[];
}

export interface Salary {
  id: number;
  teacherId: number;
  teacherName: string;
  month: number;
  year: number;
  baseSalary: number;
  overtimeAmount: number;
  bonusAmount: number;
  deductionAmount: number;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: "PENDING" | "PARTIAL" | "PAID" | "CANCELLED";
  paymentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SalaryPayment {
  id: number;
  salaryId: number;
  teacherId: number;
  teacherName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNo?: string;
  transactionId?: string;
  notes?: string;
  isEarlyPayment?: boolean;
  confirmedBy: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items?: T[];
    users?: T[];
    classes?: T[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface IncomeStatement {
  year?: number;
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
  };
  monthlyData: {
    month: number;
    monthName: string;
    income: number;
    expenses: number;
    profit: number;
  }[];
}

export interface FinanceDashboard {
  summary: {
    totalIncome: number;
    monthlyIncome: number;
    yearlyIncome: number;
    pendingFees: number;
    totalExpenses: number;
    monthlyExpenses: number;
    yearlyExpenses?: number;
    pendingSalaries: number;
    totalStudents: number;
    netProfit: number;
    monthlyProfit: number;
  };
  recentPayments: {
    id: number;
    studentName: string;
    amount: number;
    date: string;
    feeTitle: string;
    status: string;
  }[];
  recentExpenses: {
    id: number;
    category: string;
    amount: number;
    date: string;
    description: string;
  }[];
}

export interface OutstandingFee {
  id: number;
  studentId: number;
  studentName: string;
  className: string;
  feeTitle: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  formattedDueDate: string;
  overdueDays: number;
  billingMonth?: number;
  billingYear?: number;
}

export interface FeeStatistics {
  todayCollection: number;
  weekCollection: number;
  monthCollection: number;
  pendingFees: number;
  overdueCount: number;
  totalStudents: number;
  collectionRate: number;
}

export interface PaymentReceipt {
  id: number;
  receiptNo: string;
  studentName: string;
  studentClass: string;
  feeTitle: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: string;
  paymentDate: string;
  dueDate: string;
  status: string;
  collectedBy: string;
}

export interface CashFlowData {
  startDate: string;
  endDate: string;
  openingBalance: number;
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  closingBalance: number;
  inflows: { category: string; amount: number; percentage: number }[];
  outflows: { category: string; amount: number; percentage: number }[];
}

export interface DailyCollection {
  date: string;
  totalAmount: number;
  count: number;
  payments: {
    id: number;
    studentName: string;
    amount: number;
    paymentMethod: string;
  }[];
}

export interface MonthlyCollection {
  month: number;
  monthName: string;
  totalAmount: number;
  count: number;
  averagePerDay: number;
}

export interface ClassCollection {
  classId: number;
  className: string;
  totalCollected: number;
  totalExpected: number;
  collectionRate: number;
  studentCount: number;
  paidCount: number;
  pendingCount: number;
}

export interface AgingBucket {
  bucket: string;
  amount: number;
  count: number;
  color: string;
}

export interface AgingData {
  totalOutstanding: number;
  buckets: AgingBucket[];
  students: {
    id: number;
    name: string;
    className: string;
    amount: number;
    dueDate: string;
    overdueDays: number;
    bucket: string;
  }[];
}

export interface OutstandingReportData {
  totalOutstanding: number;
  totalStudents: number;
  averagePerStudent: number;
  students: {
    id: number;
    studentId: number;
    studentName: string;
    className: string;
    totalAmount: number;
    feeCount: number;
    oldestDueDate: string;
    overdueDays: number;
    fees: {
      id: number;
      title: string;
      amount: number;
      dueDate: string;
      overdueDays: number;
    }[];
  }[];
}

export interface SalaryStatistics {
  totalPaidThisMonth: number;
  totalPending: number;
  totalTeachers: number;
  paidCount: number;
  pendingCount: number;
  averageSalary: number;
}

// Add this new interface
export interface StudentSearchResult {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  rollNumber: string;
  className?: string;
  pendingFees: {
    id: number;
    title: string;
    amount: number;
    paidAmount: number;
    remainingAmount: number;
    dueDate: string;
    status: string;
  }[];
  totalPending: number;
}

// Persian months constant
export const PERSIAN_MONTHS = [
  "حمل",
  "ثور",
  "جوزا",
  "سرطان",
  "اسد",
  "سنبله",
  "میزان",
  "عقرب",
  "قوس",
  "جدی",
  "دلو",
  "حوت",
];

// =============================
// UTILITY FUNCTIONS
// =============================

export const toPersianNumber = (num: number): string => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

export const formatCurrency = (amount: number): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "۰ افغانی";
  }
  return `${toPersianNumber(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} افغانی`;
};

// =============================
// MAIN FINANCE API
// =============================

export const financeApi = {
  // =============================
  // DASHBOARD & SUMMARY
  // =============================

  getDashboard: async (): Promise<FinanceDashboard> => {
    const response = await apiRequest("/finance/admin/dashboard", {
      method: "GET",
    });
    if (response.success && response.data) {
      const summary = response.data.summary || {};
      return {
        summary: {
          totalIncome: summary.totalIncome || 0,
          monthlyIncome: summary.monthlyIncome || 0,
          yearlyIncome: summary.yearlyIncome || 0,
          pendingFees: summary.pendingFees || 0,
          totalExpenses: summary.totalExpenses || 0,
          monthlyExpenses: summary.monthlyExpenses || 0,
          yearlyExpenses: summary.yearlyExpenses || 0,
          pendingSalaries: summary.pendingSalaries || 0,
          totalStudents: summary.totalStudents || 0,
          netProfit:
            summary.netProfit ??
            (summary.totalIncome || 0) - (summary.totalExpenses || 0),
          monthlyProfit:
            summary.monthlyProfit ??
            (summary.monthlyIncome || 0) - (summary.monthlyExpenses || 0),
        },
        recentPayments: response.data.recentPayments || [],
        recentExpenses: response.data.recentExpenses || [],
      };
    }
    return {
      summary: {
        totalIncome: 0,
        monthlyIncome: 0,
        yearlyIncome: 0,
        pendingFees: 0,
        totalExpenses: 0,
        monthlyExpenses: 0,
        yearlyExpenses: 0,
        pendingSalaries: 0,
        totalStudents: 0,
        netProfit: 0,
        monthlyProfit: 0,
      },
      recentPayments: [],
      recentExpenses: [],
    };
  },

  getFinancialSummary: async () => {
    const response = await apiRequest("/finance/admin/summary", {
      method: "GET",
    });
    if (response.success && response.data) {
      const data = response.data;
      return {
        ...data,
        netProfit:
          data.netProfit ?? (data.totalIncome || 0) - (data.totalExpenses || 0),
        monthlyProfit:
          data.monthlyProfit ??
          (data.monthlyIncome || 0) - (data.monthlyExpenses || 0),
      };
    }
    return response.data;
  },

  // =============================
  // STUDENT SEARCH - NEW FUNCTION
  // =============================

  searchStudents: async (
    query: string,
    classId?: string | number,
  ): Promise<{
    success: boolean;
    data: StudentSearchResult[];
  }> => {
    const queryParams = new URLSearchParams();
    queryParams.append("query", query);
    if (classId && classId !== "all") {
      queryParams.append("classId", classId.toString());
    }
    const response = await apiRequest(
      `/finance/admin/students/search?${queryParams.toString()}`,
      { method: "GET" },
    );
    return response;
  },

  // =============================
  // FEE CATEGORY MANAGEMENT
  // =============================

  getFeeCategories: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: FeeCategory[] }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const response = await apiRequest(
      `/finance/admin/fee-categories?${queryParams.toString()}`,
      { method: "GET" },
    );
    return response;
  },

  getFeeCategoryById: async (
    categoryId: number,
  ): Promise<{ success: boolean; data: FeeCategory }> => {
    const response = await apiRequest(
      `/finance/admin/fee-categories/${categoryId}`,
      { method: "GET" },
    );
    return response;
  },

  createFeeCategory: async (data: {
    title: string;
    amount: number;
    description?: string;
    isRecurring?: boolean;
  }): Promise<{ success: boolean; data: FeeCategory; message: string }> => {
    const response = await apiRequest("/finance/admin/fee-categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  updateFeeCategory: async (
    categoryId: number,
    data: {
      title?: string;
      amount?: number;
      description?: string;
      isRecurring?: boolean;
    },
  ): Promise<{ success: boolean; data: FeeCategory; message: string }> => {
    const response = await apiRequest(
      `/finance/admin/fee-categories/${categoryId}`,
      { method: "PUT", body: JSON.stringify(data) },
    );
    return response;
  },

  deleteFeeCategory: async (
    categoryId: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(
      `/finance/admin/fee-categories/${categoryId}`,
      { method: "DELETE" },
    );
    return response;
  },

  // =============================
  // FEE TEMPLATE MANAGEMENT
  // =============================

  getFeeTemplates: async (): Promise<{
    success: boolean;
    data: FeeTemplate[];
  }> => {
    const response = await apiRequest("/finance/admin/fee-templates", {
      method: "GET",
    });
    return response;
  },

  getFeeTemplateById: async (
    templateId: number,
  ): Promise<{ success: boolean; data: FeeTemplate }> => {
    const response = await apiRequest(
      `/finance/admin/fee-templates/${templateId}`,
      { method: "GET" },
    );
    return response;
  },

  createFeeTemplate: async (data: {
    classId: number;
    feeCategoryId: number;
    amount: number;
    frequency: string;
    dueDay: number;
    isActive?: boolean;
    academicYearId?: number;
  }): Promise<{ success: boolean; data: FeeTemplate; message: string }> => {
    const response = await apiRequest("/finance/admin/fee-templates", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  updateFeeTemplate: async (
    templateId: number,
    data: {
      amount?: number;
      frequency?: string;
      dueDay?: number;
      isActive?: boolean;
    },
  ): Promise<{ success: boolean; data: FeeTemplate; message: string }> => {
    const response = await apiRequest(
      `/finance/admin/fee-templates/${templateId}`,
      { method: "PUT", body: JSON.stringify(data) },
    );
    return response;
  },

  deleteFeeTemplate: async (
    templateId: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(
      `/finance/admin/fee-templates/${templateId}`,
      { method: "DELETE" },
    );
    return response;
  },

  getStudentsForTemplate: async (
    templateId: number,
  ): Promise<{
    success: boolean;
    data: {
      id: number;
      name: string;
      rollNumber: string;
      hasExistingFee: boolean;
    }[];
  }> => {
    const response = await apiRequest(
      `/finance/admin/fee-templates/${templateId}/students`,
      { method: "GET" },
    );
    return response;
  },

  assignTemplateToStudents: async (data: {
    templateId: number;
    studentIds: number[];
  }): Promise<{
    success: boolean;
    data: { count: number };
    message: string;
  }> => {
    const response = await apiRequest("/finance/admin/fee-templates/assign", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  // =============================
  // EXPENSE CATEGORY MANAGEMENT
  // =============================

  getExpenseCategories: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: ExpenseCategory[] }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const response = await apiRequest(
      `/finance/admin/expense-categories?${queryParams.toString()}`,
      { method: "GET" },
    );
    return response;
  },

  createExpenseCategory: async (data: {
    name: string;
    description?: string;
  }): Promise<{ success: boolean; data: ExpenseCategory; message: string }> => {
    const response = await apiRequest("/finance/admin/expense-categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  updateExpenseCategory: async (
    categoryId: number,
    data: { name?: string; description?: string },
  ): Promise<{ success: boolean; data: ExpenseCategory; message: string }> => {
    const response = await apiRequest(
      `/finance/admin/expense-categories/${categoryId}`,
      { method: "PUT", body: JSON.stringify(data) },
    );
    return response;
  },

  deleteExpenseCategory: async (
    categoryId: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(
      `/finance/admin/expense-categories/${categoryId}`,
      { method: "DELETE" },
    );
    return response;
  },

  // =============================
  // EXPENSE MANAGEMENT
  // =============================

  getExpenses: async (params?: {
    categoryId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: {
      expenses: Expense[];
      total: number;
      page: number;
      totalPages: number;
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.categoryId)
      queryParams.append("categoryId", params.categoryId.toString());
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const response = await apiRequest(
      `/finance/admin/expenses?${queryParams.toString()}`,
      { method: "GET" },
    );
    return response;
  },

  getExpenseById: async (
    expenseId: number,
  ): Promise<{ success: boolean; data: Expense }> => {
    const response = await apiRequest(`/finance/admin/expenses/${expenseId}`, {
      method: "GET",
    });
    return response;
  },

  createExpense: async (data: {
    categoryId: number;
    amount: number;
    description: string;
    date: string;
    receiptUrl?: string;
  }): Promise<{ success: boolean; data: Expense; message: string }> => {
    const response = await apiRequest("/finance/admin/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  updateExpense: async (
    expenseId: number,
    data: {
      categoryId?: number;
      amount?: number;
      description?: string;
      date?: string;
      receiptUrl?: string;
    },
  ): Promise<{ success: boolean; data: Expense; message: string }> => {
    const response = await apiRequest(`/finance/admin/expenses/${expenseId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response;
  },

  deleteExpense: async (
    expenseId: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(`/finance/admin/expenses/${expenseId}`, {
      method: "DELETE",
    });
    return response;
  },

  getExpenseStatistics: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    data: {
      totalThisMonth: number;
      totalThisYear: number;
      averageDaily: number;
      topCategory: { name: string; amount: number };
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    const response = await apiRequest(
      `/finance/admin/expenses/statistics?${queryParams.toString()}`,
      { method: "GET" },
    );
    return response;
  },

  // =============================
  // STUDENT FEES MANAGEMENT
  // =============================

  getStudentFees: async (params?: {
    status?: string;
    classId?: number;
    studentId?: number;
    billingMonth?: number;
    billingYear?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: {
      fees: StudentFee[];
      total: number;
      page: number;
      totalPages: number;
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.classId)
      queryParams.append("classId", params.classId.toString());
    if (params?.studentId)
      queryParams.append("studentId", params.studentId.toString());
    if (params?.billingMonth)
      queryParams.append("billingMonth", params.billingMonth.toString());
    if (params?.billingYear)
      queryParams.append("billingYear", params.billingYear.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const response = await apiRequest(
      `/finance/admin/student-fees?${queryParams.toString()}`,
      { method: "GET" },
    );
    return response;
  },

  getStudentFeeDetails: async (
    studentId: number,
  ): Promise<{ success: boolean; data: StudentFeeDetails }> => {
    const response = await apiRequest(
      `/finance/admin/students/${studentId}/fees`,
      { method: "GET" },
    );
    return response;
  },

  getAllStudentFees: async (params?: {
    status?: string;
    classId?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: {
      fees: StudentFee[];
      total: number;
      page: number;
      totalPages: number;
    };
  }> => {
    return financeApi.getStudentFees(params);
  },

  generateBulkFees: async (data: {
    classId: number;
    feeCategoryId: number;
    dueDate: string;
    billingMonth?: number;
    billingYear?: number;
    amount?: number;
  }): Promise<{
    success: boolean;
    data?: StudentFee[];
    count?: number;
    message: string;
  }> => {
    const response = await apiRequest("/finance/admin/fees/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  addStudentCustomFee: async (
    studentId: number,
    data: {
      feeCategoryId: number;
      dueDate: string;
      amount?: number;
      billingMonth?: number;
      billingYear?: number;
    },
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(
      `/finance/admin/students/${studentId}/fees`,
      { method: "POST", body: JSON.stringify(data) },
    );
    return response;
  },

  updateStudentFeeCustom: async (
    feeId: number,
    data: { dueDate?: string; status?: string },
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(`/finance/admin/students/fees/${feeId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response;
  },

  deleteStudentFeeCustom: async (
    feeId: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(`/finance/admin/students/fees/${feeId}`, {
      method: "DELETE",
    });
    return response;
  },

  // Update fee status manually (NEW)
  updateFeeStatus: async (
    feeId: number,
    data: { status: string; notes?: string },
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(
      `/finance/admin/student-fees/${feeId}/status`,
      { method: "PUT", body: JSON.stringify(data) },
    );
    return response;
  },

  // Bulk update fee status (NEW)
  bulkUpdateFeeStatus: async (data: {
    feeIds: number[];
    status: string;
    notes?: string;
  }): Promise<{
    success: boolean;
    data: { count: number };
    message: string;
  }> => {
    const response = await apiRequest(
      "/finance/admin/student-fees/bulk-status",
      { method: "PUT", body: JSON.stringify(data) },
    );
    return response;
  },

  // =============================
  // PAYMENT MANAGEMENT
  // =============================

  getPaymentHistory: async (params?: {
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: {
      id: number;
      studentName: string;
      amount: number;
      date: string;
      feeTitle: string;
      paymentMethod: string;
      status: string;
    }[];
    total?: number;
    page?: number;
    totalPages?: number;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const response = await apiRequest(
      `/finance/admin/payments/history?${queryParams.toString()}`,
      { method: "GET" },
    );
    return response;
  },

  getPaymentHistoryWithFilters: async (params?: {
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: {
      id: number;
      studentName: string;
      amount: number;
      date: string;
      feeTitle: string;
      paymentMethod: string;
      status: string;
    }[];
    total?: number;
    page?: number;
    totalPages?: number;
  }> => {
    return financeApi.getPaymentHistory(params);
  },

  getRecentPayments: async (
    limit: number = 10,
  ): Promise<{
    success: boolean;
    data: {
      id: number;
      studentName: string;
      amount: number;
      date: string;
      feeTitle: string;
      status: string;
    }[];
  }> => {
    const response = await apiRequest(
      `/finance/admin/payments/recent?limit=${limit}`,
      { method: "GET" },
    );
    return response;
  },

  getPaymentReceipt: async (
    paymentId: number,
  ): Promise<{ success: boolean; data: PaymentReceipt }> => {
    const response = await apiRequest(
      `/finance/admin/payments/${paymentId}/receipt`,
      { method: "GET" },
    );
    return response;
  },

  confirmPayment: async (data: {
    studentFeeId: number;
    amount: number;
    paymentMethod: string;
    referenceNo?: string;
    notes?: string;
  }): Promise<{
    success: boolean;
    data: { id: number; amount: number };
    message: string;
  }> => {
    const response = await apiRequest("/finance/admin/payments/confirm", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  recordPayment: async (data: {
    studentId: number;
    studentFeeId?: number;
    amount: number;
    paymentMethod: string;
    referenceNo?: string;
    notes?: string;
    feeType?: string;
  }): Promise<{
    success: boolean;
    data: { paymentId: number };
    message: string;
  }> => {
    const response = await apiRequest("/finance/admin/payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  recordBulkPayments: async (data: {
    classId: number;
    payments: {
      studentId: number;
      amount: number;
      paymentMethod: string;
      studentFeeId?: number;
    }[];
  }): Promise<{
    success: boolean;
    data: { count: number };
    message: string;
  }> => {
    const response = await apiRequest("/finance/admin/payments/bulk", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  // =============================
  // FEE COLLECTION & STATISTICS
  // =============================

  getClassesList: async (): Promise<{
    success: boolean;
    data: { id: number; name: string; section: string }[];
  }> => {
    const response = await apiRequest("/finance/admin/classes/list", {
      method: "GET",
    });
    return response;
  },

  getClasses: async (): Promise<{
    success: boolean;
    data: { id: number; name: string; section: string }[];
  }> => {
    return financeApi.getClassesList();
  },

  // Get students for single fee collection (NEW)
  getStudentsForSingleCollection: async (
    classId: number,
  ): Promise<{
    success: boolean;
    data: {
      id: number;
      name: string;
      rollNumber: string;
      feeId: number | null;
      amount: number;
    }[];
  }> => {
    const response = await apiRequest(
      `/finance/admin/classes/${classId}/students/single-collection`,
      { method: "GET" },
    );
    return response;
  },

  getStudentsWithPendingFees: async (
    classId: number,
  ): Promise<{
    success: boolean;
    data: {
      id: number;
      name: string;
      rollNumber: string;
      pendingFees: {
        id: number;
        title: string;
        amount: number;
        dueDate: string;
        billingMonth?: number;
        billingYear?: number;
      }[];
    }[];
  }> => {
    const response = await apiRequest(
      `/finance/admin/classes/${classId}/students/pending-fees`,
      { method: "GET" },
    );
    return response;
  },

  getStudentsForBulkCollection: async (
    classId: number,
  ): Promise<{
    success: boolean;
    data: {
      id: number;
      name: string;
      rollNumber: string;
      feeId: number | null;
      amount: number;
    }[];
  }> => {
    const response = await apiRequest(
      `/finance/admin/classes/${classId}/students/bulk-collection`,
      { method: "GET" },
    );
    return response;
  },

  getFeeStatistics: async (): Promise<{
    success: boolean;
    data: FeeStatistics;
  }> => {
    const response = await apiRequest("/finance/admin/fees/statistics", {
      method: "GET",
    });
    return response;
  },

  // =============================
  // SALARY MANAGEMENT
  // =============================

  getTeachersForSalary: async (): Promise<{
    success: boolean;
    data: {
      id: number;
      name: string;
      email: string;
      phone: string;
      hourlyRate: number;
      baseSalary: number;
      overtimeRate: number;
      totalEarned: number;
      pendingAmount: number;
      lastSalary?: {
        month: number;
        year: number;
        amount: number;
        status: string;
      };
    }[];
  }> => {
    const response = await apiRequest("/finance/admin/teachers-salary", {
      method: "GET",
    });
    return response;
  },

  getTeacherSalaryInfo: async (
    teacherId: number,
  ): Promise<{ success: boolean; data: TeacherSalary }> => {
    const response = await apiRequest(
      `/finance/admin/teachers/${teacherId}/salary`,
      { method: "GET" },
    );
    return response;
  },

  getTeacherSalaries: async (
    teacherId: number,
  ): Promise<{ success: boolean; data: Salary[] }> => {
    const response = await apiRequest(
      `/finance/admin/teachers/${teacherId}/salaries`,
      { method: "GET" },
    );
    return response;
  },

  updateTeacherSalaryConfig: async (
    teacherId: number,
    data: { hourlyRate?: number; baseSalary?: number; overtimeRate?: number },
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(
      `/finance/admin/teachers/${teacherId}/salary`,
      { method: "PUT", body: JSON.stringify(data) },
    );
    return response;
  },

  generateMonthlySalaries: async (data: {
    month: number;
    year: number;
    overtimeHours?: number;
    bonusAmount?: number;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      created: MonthlySalary[];
      skipped: { teacherId: number; name: string; reason: string }[];
    };
    count?: number;
  }> => {
    const response = await apiRequest("/finance/admin/salaries/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  getSalariesList: async (params?: {
    month?: number;
    year?: number;
    status?: string;
    teacherId?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: {
      salaries: Salary[];
      total: number;
      page: number;
      totalPages: number;
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.month) queryParams.append("month", params.month.toString());
    if (params?.year) queryParams.append("year", params.year.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.teacherId)
      queryParams.append("teacherId", params.teacherId.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const response = await apiRequest(
      `/finance/admin/salaries?${queryParams.toString()}`,
      { method: "GET" },
    );
    return response;
  },

  getSalaries: async (params?: {
    teacherId?: number;
    month?: number;
    year?: number;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: MonthlySalary[]; total?: number }> => {
    const queryParams = new URLSearchParams();
    if (params?.teacherId)
      queryParams.append("teacherId", params.teacherId.toString());
    if (params?.month) queryParams.append("month", params.month.toString());
    if (params?.year) queryParams.append("year", params.year.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const response = await apiRequest(
      `/finance/admin/salaries/list?${queryParams.toString()}`,
      { method: "GET" },
    );
    return response;
  },

  getSalaryById: async (
    salaryId: number,
  ): Promise<{ success: boolean; data: MonthlySalary }> => {
    const response = await apiRequest(`/finance/admin/salaries/${salaryId}`, {
      method: "GET",
    });
    return response;
  },

  paySalary: async (data: {
    salaryId: number;
    amount: number;
    paymentMethod: string;
    referenceNo?: string;
    notes?: string;
    isEarlyPayment?: boolean;
    earlyDiscount?: number;
  }): Promise<{ success: boolean; message: string; data?: SalaryPayment }> => {
    const response = await apiRequest("/finance/admin/salaries/pay", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  recordOvertime: async (data: {
    teacherId: number;
    month: number;
    year: number;
    hours: number;
    rate?: number;
  }): Promise<{ success: boolean; message: string; data?: MonthlySalary }> => {
    const response = await apiRequest("/finance/admin/teachers/overtime", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  getSalaryStatistics: async (): Promise<{
    success: boolean;
    data: SalaryStatistics;
  }> => {
    const response = await apiRequest("/finance/admin/salaries/statistics", {
      method: "GET",
    });
    return response;
  },

  // =============================
  // FINANCIAL REPORTS
  // =============================

  getIncomeStatement: async (params?: {
    year?: number;
  }): Promise<IncomeStatement> => {
    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.append("year", params.year.toString());
    const response = await apiRequest(
      `/finance/admin/reports/income-statement?${queryParams.toString()}`,
      { method: "GET" },
    );
    if (response.success && response.data) {
      return response.data;
    }
    return {
      year: params?.year || new Date().getFullYear(),
      summary: { totalIncome: 0, totalExpenses: 0, netProfit: 0 },
      monthlyData: [],
    };
  },

  getOutstandingFees: async (params?: {
    classId?: number;
    studentId?: number;
  }): Promise<{
    totalOutstanding: number;
    count: number;
    items: OutstandingFee[];
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.classId)
      queryParams.append("classId", params.classId.toString());
    if (params?.studentId)
      queryParams.append("studentId", params.studentId.toString());
    const response = await apiRequest(
      `/finance/admin/reports/outstanding?${queryParams.toString()}`,
      { method: "GET" },
    );
    return response.data || { totalOutstanding: 0, count: 0, items: [] };
  },

  getCashFlowReport: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{ success: boolean; data: CashFlowData }> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    const response = await apiRequest(
      `/finance/admin/reports/cash-flow?${queryParams.toString()}`,
      { method: "GET" },
    );
    return response;
  },

  getDailyCollections: async (
    date: string,
  ): Promise<{ success: boolean; data: DailyCollection }> => {
    const response = await apiRequest(
      `/finance/admin/reports/daily-collections?date=${date}`,
      { method: "GET" },
    );
    return response;
  },

  getMonthlyCollections: async (
    year: number,
  ): Promise<{
    success: boolean;
    data: {
      year: number;
      months: MonthlyCollection[];
      summary: {
        totalYearly: number;
        totalCount: number;
        bestMonth: string;
        bestMonthAmount: number;
        averageMonthly: number;
      };
    };
  }> => {
    const response = await apiRequest(
      `/finance/admin/reports/monthly-collections?year=${year}`,
      { method: "GET" },
    );
    return response;
  },

  getCollectionsByClass: async (): Promise<{
    success: boolean;
    data: {
      classes: ClassCollection[];
      summary: {
        totalCollected: number;
        totalExpected: number;
        overallRate: number;
        totalStudents: number;
      };
    };
  }> => {
    const response = await apiRequest(
      "/finance/admin/reports/collections-by-class",
      { method: "GET" },
    );
    return response;
  },

  getAgingReport: async (): Promise<{ success: boolean; data: AgingData }> => {
    const response = await apiRequest("/finance/admin/reports/aging", {
      method: "GET",
    });
    return response;
  },

  getOutstandingFeesReport: async (): Promise<{
    success: boolean;
    data: OutstandingReportData;
  }> => {
    const response = await apiRequest(
      "/finance/admin/reports/outstanding-detailed",
      { method: "GET" },
    );
    return response;
  },

  exportReport: async (options: {
    reportType: string;
    format: string;
    dateRange: { start: string; end: string };
    includeCharts: boolean;
    includeDetails: boolean;
  }): Promise<{
    success: boolean;
    data?: { url: string; filename: string };
  }> => {
    const response = await apiRequest("/finance/admin/reports/export", {
      method: "POST",
      body: JSON.stringify(options),
    });
    return response;
  },
};

// =============================
// USER MANAGEMENT API
// =============================

export const userApi = {
  getAllUsers: async (params?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<User>> => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append("role", params.role);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const response = await apiRequest(
      `/finance/admin/users?${queryParams.toString()}`,
      { method: "GET" },
    );
    return response;
  },

  getUserById: async (
    userId: number,
  ): Promise<{ success: boolean; data: User }> => {
    const response = await apiRequest(`/finance/admin/users/${userId}`, {
      method: "GET",
    });
    return response;
  },

  updateUser: async (
    userId: number,
    data: {
      fullName?: string;
      email?: string;
      phone?: string;
      profileImage?: string;
    },
  ): Promise<{ success: boolean; data: User; message: string }> => {
    const response = await apiRequest(`/finance/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response;
  },

  updateStudentProfile: async (
    userId: number,
    data: {
      bio?: string;
      grade?: string;
      school?: string;
      birthDate?: string;
      parentContact?: string;
      address?: string;
      interests?: string[];
      classId?: number;
      status?: string;
    },
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(
      `/finance/admin/users/${userId}/student-profile`,
      { method: "PUT", body: JSON.stringify(data) },
    );
    return response;
  },

  updateTeacherProfile: async (
    userId: number,
    data: {
      bio?: string;
      experience?: string;
      hourlyRate?: number;
      baseSalary?: number;
      overtimeRate?: number;
      certification?: string;
      availability?: boolean;
      isActive?: boolean;
    },
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(
      `/finance/admin/users/${userId}/teacher-profile`,
      { method: "PUT", body: JSON.stringify(data) },
    );
    return response;
  },
};

// =============================
// CLASS MANAGEMENT API
// =============================

export const classApi = {
  getAllClasses: async (params?: {
    academicYearId?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Class>> => {
    const queryParams = new URLSearchParams();
    if (params?.academicYearId)
      queryParams.append("academicYearId", params.academicYearId.toString());
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const response = await apiRequest(
      `/finance/admin/classes?${queryParams.toString()}`,
      { method: "GET" },
    );
    return response;
  },

  createClass: async (data: {
    name: string;
    section?: string;
    academicYearId?: number;
    teacherId?: number;
    description?: string;
    thumbnail?: string;
  }): Promise<{ success: boolean; data: Class; message: string }> => {
    const response = await apiRequest("/finance/admin/classes", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  updateClass: async (
    classId: number,
    data: {
      name?: string;
      section?: string;
      academicYearId?: number | null;
      teacherId?: number | null;
      description?: string;
      thumbnail?: string;
      isActive?: boolean;
    },
  ): Promise<{ success: boolean; data: Class; message: string }> => {
    const response = await apiRequest(`/finance/admin/classes/${classId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response;
  },

  deleteClass: async (
    classId: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(`/finance/admin/classes/${classId}`, {
      method: "DELETE",
    });
    return response;
  },

  assignStudentToClass: async (data: {
    studentId: number;
    classId: number;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest("/finance/admin/student-class", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  removeStudentFromClass: async (
    studentId: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(
      `/finance/admin/student-class/${studentId}`,
      { method: "DELETE" },
    );
    return response;
  },
};

// =============================
// SUBJECT MANAGEMENT API
// =============================

export const subjectApi = {
  getAllSubjects: async (): Promise<{ success: boolean; data: Subject[] }> => {
    const response = await apiRequest("/finance/admin/subjects", {
      method: "GET",
    });
    return response;
  },

  createSubject: async (data: {
    name: string;
  }): Promise<{ success: boolean; data: Subject; message: string }> => {
    const response = await apiRequest("/finance/admin/subjects", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  updateSubject: async (
    subjectId: number,
    data: { name: string },
  ): Promise<{ success: boolean; data: Subject; message: string }> => {
    const response = await apiRequest(`/finance/admin/subjects/${subjectId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response;
  },

  deleteSubject: async (
    subjectId: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(`/finance/admin/subjects/${subjectId}`, {
      method: "DELETE",
    });
    return response;
  },

  assignTeacherSubject: async (data: {
    teacherId: number;
    subjectId: number;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest("/finance/admin/teacher-subject", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  removeTeacherSubject: async (
    teacherId: number,
    subjectId: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(
      `/finance/admin/teacher-subject/${teacherId}/${subjectId}`,
      { method: "DELETE" },
    );
    return response;
  },
};

// =============================
// TEACHER SALARY API
// =============================

export const teacherSalaryApi = {
  getTeacherSalaryInfo: async (
    teacherId: number,
  ): Promise<{ success: boolean; data: TeacherSalary }> => {
    const response = await apiRequest(
      `/finance/admin/teachers/${teacherId}/salary`,
      { method: "GET" },
    );
    return response;
  },

  updateTeacherSalaryConfig: async (
    teacherId: number,
    data: { hourlyRate?: number; baseSalary?: number; overtimeRate?: number },
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(
      `/finance/admin/teachers/${teacherId}/salary`,
      { method: "PUT", body: JSON.stringify(data) },
    );
    return response;
  },
};

// =============================
// PARENT-CHILD MANAGEMENT API
// =============================

export const parentChildApi = {
  addParentChild: async (data: {
    parentId: number;
    studentId: number;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest("/finance/admin/parent-child", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  removeParentChild: async (
    parentId: number,
    studentId: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(
      `/finance/admin/parent-child/${parentId}/${studentId}`,
      { method: "DELETE" },
    );
    return response;
  },
};

// =============================
// STUDENT FEE CUSTOMIZATION API
// =============================

export const studentFeeCustomApi = {
  addStudentCustomFee: async (
    studentId: number,
    data: {
      feeCategoryId: number;
      dueDate: string;
      amount?: number;
      billingMonth?: number;
      billingYear?: number;
    },
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(
      `/finance/admin/students/${studentId}/fees`,
      { method: "POST", body: JSON.stringify(data) },
    );
    return response;
  },

  updateStudentFee: async (
    feeId: number,
    data: { dueDate?: string; status?: string },
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(`/finance/admin/students/fees/${feeId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response;
  },

  deleteStudentFee: async (
    feeId: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiRequest(`/finance/admin/students/fees/${feeId}`, {
      method: "DELETE",
    });
    return response;
  },

  getStudentFeeDetails: async (
    studentId: number,
  ): Promise<{ success: boolean; data: StudentFeeDetails }> => {
    const response = await apiRequest(
      `/finance/admin/students/${studentId}/fees`,
      { method: "GET" },
    );
    return response;
  },
};

// =============================
// FEE PAYMENT MANAGEMENT API
// =============================

export const feePaymentApi = {
  recordPayment: async (data: {
    studentFeeId: number;
    amount: number;
    paymentMethod?: string;
    transactionId?: string;
    notes?: string;
  }): Promise<{
    success: boolean;
    data: { id: number; amount: number };
    message: string;
  }> => {
    const response = await apiRequest("/finance/admin/fee-payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  },

  getStudentPayments: async (
    studentId: number,
  ): Promise<{ success: boolean; data: Payment[] }> => {
    const response = await apiRequest(
      `/finance/admin/students/${studentId}/payments`,
      { method: "GET" },
    );
    return response;
  },

  getAllPayments: async (params?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Payment>> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.fromDate) queryParams.append("fromDate", params.fromDate);
    if (params?.toDate) queryParams.append("toDate", params.toDate);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const response = await apiRequest(
      `/finance/admin/fee-payments?${queryParams.toString()}`,
      { method: "GET" },
    );
    return response;
  },
};
