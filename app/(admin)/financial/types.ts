// app/(admin)/financial/types.ts

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
  assignedStudents: number;
  academicYear?: string;
}

export interface StudentFeeSummary {
  studentId: number;
  studentName: string;
  className: string;
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  lastPaymentDate?: string;
  paymentStatus: "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";
  overdueDays: number;
}

export interface TeacherSalarySummary {
  teacherId: number;
  teacherName: string;
  baseSalary: number;
  hourlyRate: number;
  totalEarned: number;
  pendingAmount: number;
  lastPaymentDate?: string;
  currentMonthStatus: "PAID" | "PENDING" | "PARTIAL";
}

export interface Transaction {
  id: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  description: string;
  date: string;
  reference: string;
  user: string;
}

export interface FinancialDashboardData {
  todayIncome: number;
  todayExpenses: number;
  monthIncome: number;
  monthExpenses: number;
  pendingFees: number;
  pendingSalaries: number;
  collectionRate: number;
  recentTransactions: Transaction[];
  alerts: {
    overdueFees: number;
    unpaidSalaries: number;
    lowBalance?: boolean;
  };
}

export interface FeeCollectionData {
  studentId: number;
  studentName: string;
  className: string;
  feeId: number;
  feeTitle: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "PARTIAL" | "OVERDUE";
}

export interface SalaryPaymentData {
  salaryId: number;
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
  status: "PENDING" | "PAID" | "PARTIAL";
  paymentDate?: string;
}
