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
  studentNumber: string;
  status: string;
  classId: number | null;
  enrollmentDate: string;
  graduationDate: string | null;
  scholarship: boolean;
  scholarshipPercentage: number | null;
  feeWaiver: boolean;
  feeWaiverReason: string | null;
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

// ==================== TEACHER EVALUATION TYPES ====================

export interface EvaluationTemplate {
  id: number;
  name: string;
  description: string | null;
  period: string;
  isActive: boolean;
  isDefault: boolean;
  academicYear: string | null;
  academicYearId: number | null;
  criteriaCount: number;
  evaluationsCount: number;
  createdBy: string;
  createdAt: string;
}

export interface EvaluationCriteria {
  id: number;
  name: string;
  nameFarsi: string | null;
  description: string | null;
  category: string;
  weight: number;
  maxScore: number;
  sortOrder: number;
  isRequired: boolean;
}

export interface EvaluationTemplateDetails extends EvaluationTemplate {
  criteria: EvaluationCriteria[];
  criteriaByCategory: Record<string, EvaluationCriteria[]>;
  totalWeight: number;
  totalMaxScore: number;
}

export interface TeacherEvaluationSummary {
  totalEvaluations: number;
  completedEvaluations: number;
  averagePercentage: number;
  averageGrade: string;
  averageGradeLabel: string;
}

export interface TeacherEvaluationItem {
  id: number;
  templateName: string;
  period: string;
  term: string;
  academicYear: string;
  evaluatorName: string;
  evaluatorRole: string;
  overallScore: number;
  percentage: number;
  grade: string;
  gradeLabel: string;
  status: string;
  evaluatedAt: string;
  submittedAt: string;
  scoresCount: number;
  actionPlansCount: number;
}

export interface TeacherEvaluationsResponse {
  teacher: {
    id: number;
    fullName: string;
    email: string;
    profileImage: string | null;
    teacherCode: string;
    specialization: string;
    subjects: string[];
  };
  summary: TeacherEvaluationSummary;
  evaluations: TeacherEvaluationItem[];
}

export interface TeacherPerformanceSummary {
  teacher: {
    id: number;
    fullName: string;
    email: string;
    profileImage: string | null;
  };
  hasEvaluations: boolean;
  message?: string;
  summary?: {
    totalEvaluations: number;
    averagePercentage: number;
    averageGrade: string;
    averageGradeLabel: string;
    trend: string;
    trendLabel: string;
  };
  categoryAverages?: {
    teaching: number;
    discipline: number;
    communication: number;
    professional: number;
    studentRelation: number;
  };
  latestEvaluation?: {
    id: number;
    templateName: string;
    academicYear: string;
    percentage: number;
    grade: string;
    gradeLabel: string;
    evaluatedAt: string;
  };
  evaluationHistory?: {
    id: number;
    templateName: string;
    academicYear: string;
    period: string;
    percentage: number;
    grade: string;
    gradeLabel: string;
    evaluatedAt: string;
  }[];
}

export interface EvaluationDetails {
  id: number;
  teacher: {
    id: number;
    fullName: string;
    email: string;
    profileImage: string | null;
    teacherCode: string;
    specialization: string;
    subjects: string[];
  };
  template: {
    id: number;
    name: string;
    period: string;
  };
  evaluator: {
    id: number;
    fullName: string;
    role: string;
  };
  academicYear: string;
  period: string;
  term: string;
  status: string;
  overallScore: number | null;
  percentage: number | null;
  grade: string;
  gradeLabel: string;
  gradeColor: string;
  categoryScores: {
    teachingScore: number | null;
    disciplineScore: number | null;
    communicationScore: number | null;
    professionalScore: number | null;
    studentRelationScore: number | null;
  };
  strengths: string | null;
  weaknesses: string | null;
  goals: string | null;
  recommendations: string | null;
  principalNotes: string | null;
  teacherComments: string | null;
  evaluatedAt: string | null;
  submittedAt: string | null;
  acknowledgedAt: string | null;
  criteria: {
    criteriaId: number;
    name: string;
    nameFarsi: string | null;
    description: string | null;
    category: string;
    weight: number;
    maxScore: number;
    sortOrder: number;
    score: number | null;
    comment: string | null;
    scoreId: number | null;
  }[];
  criteriaByCategory: Record<string, any[]>;
  actionPlans: {
    id: number;
    title: string;
    description: string | null;
    category: string;
    targetDate: string | null;
    completedAt: string | null;
    status: string;
    progress: number;
    outcome: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ReportCard {
  evaluationId: number;
  reportDate: string;
  teacher: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    profileImage: string | null;
    teacherCode: string;
    specialization: string;
    subjects: string[];
    classes: string[];
  };
  evaluation: {
    templateName: string;
    period: string;
    term: string;
    academicYear: string;
    evaluatorName: string;
    evaluatorRole: string;
    evaluatedAt: string | null;
    submittedAt: string | null;
    status: string;
  };
  overallScore: {
    totalScore: number;
    totalMaxScore: number;
    percentage: number;
    grade: string;
    gradeLabel: string;
    gradeColor: string;
    performanceLevel: string;
    performanceLabel: string;
    performanceColor: string;
    performanceIcon: string;
  };
  categoryBreakdown: {
    category: string;
    categoryLabel: string;
    percentage: number;
    weight: number;
    color: string;
    criteria: {
      name: string;
      score: number;
      maxScore: number;
      weight: number;
      percentage: number;
      comment: string | null;
    }[];
  }[];
  criteria: {
    criteriaId: number;
    name: string;
    nameFarsi: string | null;
    category: string;
    categoryLabel: string;
    score: number;
    maxScore: number;
    weight: number;
    weightedScore: number;
    percentage: number;
    comment: string | null;
    color: string;
  }[];
  strengths: { name: string; category: string; percentage: number }[];
  weaknesses: { name: string; category: string; percentage: number }[];
  comments: {
    strengths: string | null;
    weaknesses: string | null;
    goals: string | null;
    recommendations: string | null;
    principalNotes: string | null;
    teacherComments: string | null;
  };
  actionPlans: {
    id: number;
    title: string;
    description: string | null;
    category: string;
    categoryLabel: string;
    targetDate: string | null;
    completedAt: string | null;
    status: string;
    progress: number;
    outcome: string | null;
  }[];
  summary: {
    totalCriteria: number;
    criteriaAbove70: number;
    criteriaBelow50: number;
    strongestCategory: string;
    weakestCategory: string;
  };
}

export interface EvaluationAnalytics {
  summary: {
    totalEvaluations: number;
    completedEvaluations: number;
    pendingEvaluations: number;
    averagePercentage: number;
  };
  byStatus: Record<string, number>;
  byGrade: Record<string, number>;
  averageCategoryScores: {
    teaching: number;
    discipline: number;
    communication: number;
    professional: number;
    studentRelation: number;
  };
  topTeachers: {
    rank: number;
    teacherId: number;
    teacherName: string;
    teacherImage: string | null;
    percentage: number;
    grade: string;
  }[];
  recentEvaluations: {
    id: number;
    teacherName: string;
    teacherImage: string | null;
    evaluatorName: string;
    percentage: number;
    grade: string;
    status: string;
    createdAt: string;
  }[];
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

  // ==================== CLASS PROMOTION ====================

  async getClassPromotionOptions(params?: {
    academicYearId?: number;
  }): Promise<ApiResponse<any>> {
    let url = "/classes/promotion-options";
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
    return this.request("/classes/promote", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getClassPromotionHistory(classId: number): Promise<ApiResponse<any>> {
    return this.request(`/classes/${classId}/promotion-history`);
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

  // ==================== TEACHER EVALUATIONS ====================

  /**
   * Get all evaluation templates
   */
  async getEvaluationTemplates(params?: {
    includeInactive?: boolean;
  }): Promise<ApiResponse<EvaluationTemplate[]>> {
    const query = params?.includeInactive ? "?includeInactive=true" : "";
    return this.request(`/teacher-evaluations/templates${query}`);
  }

  /**
   * Get template details with criteria
   */
  async getEvaluationTemplateDetails(
    templateId: number,
  ): Promise<ApiResponse<EvaluationTemplateDetails>> {
    return this.request(`/teacher-evaluations/templates/${templateId}`);
  }

  /**
   * Create a new evaluation template
   */
  async createEvaluationTemplate(data: {
    name: string;
    description?: string;
    period?: string;
    academicYearId?: number;
    isDefault?: boolean;
    criteria?: {
      name: string;
      nameFarsi?: string;
      description?: string;
      category: string;
      weight?: number;
      maxScore?: number;
      sortOrder?: number;
      isRequired?: boolean;
    }[];
  }): Promise<ApiResponse<any>> {
    return this.request("/teacher-evaluations/templates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Create default evaluation template
   */
  async createDefaultEvaluationTemplate(): Promise<ApiResponse<any>> {
    return this.request("/teacher-evaluations/templates/default", {
      method: "POST",
    });
  }

  /**
   * Get teachers available for evaluation
   */
  async getTeachersForEvaluation(params?: {
    search?: string;
    classId?: number;
    subjectId?: number;
  }): Promise<
    ApiResponse<
      {
        id: number;
        userId: number;
        fullName: string;
        email: string;
        phone: string;
        profileImage: string | null;
        teacherCode: string;
        specialization: string;
        rating: number;
        subjects: string[];
        classes: string[];
        evaluationsCount: number;
      }[]
    >
  > {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.classId) query.append("classId", params.classId.toString());
    if (params?.subjectId)
      query.append("subjectId", params.subjectId.toString());
    const qs = query.toString();
    return this.request(`/teacher-evaluations/teachers${qs ? `?${qs}` : ""}`);
  }

  /**
   * Get all evaluations for a specific teacher
   */
  async getTeacherEvaluations(
    teacherId: number,
    params?: {
      period?: string;
      academicYearId?: number;
      status?: string;
    },
  ): Promise<ApiResponse<TeacherEvaluationsResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append("period", params.period);
    if (params?.academicYearId)
      queryParams.append("academicYearId", String(params.academicYearId));
    if (params?.status) queryParams.append("status", params.status);

    const query = queryParams.toString();
    return this.request(
      `/teacher-evaluations/teacher/${teacherId}${query ? `?${query}` : ""}`,
    );
  }

  /**
   * Get performance summary for a teacher
   */
  async getTeacherPerformanceSummary(
    teacherId: number,
  ): Promise<ApiResponse<TeacherPerformanceSummary>> {
    return this.request(
      `/teacher-evaluations/teacher/${teacherId}/performance-summary`,
    );
  }

  /**
   * Create a new teacher evaluation
   */
  async createTeacherEvaluation(data: {
    teacherId: number;
    templateId: number;
    period?: string;
    term?: string;
    academicYearId?: number;
  }): Promise<ApiResponse<any>> {
    return this.request("/teacher-evaluations", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Get evaluation details
   */
  async getTeacherEvaluationDetails(
    evaluationId: number,
  ): Promise<ApiResponse<EvaluationDetails>> {
    return this.request(`/teacher-evaluations/${evaluationId}`);
  }

  /**
   * Submit scores for an evaluation
   */
  async submitEvaluationScores(
    evaluationId: number,
    data: {
      scores: { criteriaId: number; score: number; comment?: string }[];
      strengths?: string;
      weaknesses?: string;
      goals?: string;
      recommendations?: string;
      principalNotes?: string;
    },
  ): Promise<ApiResponse<any>> {
    return this.request(`/teacher-evaluations/${evaluationId}/scores`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Submit/finalize an evaluation
   */
  async submitTeacherEvaluation(
    evaluationId: number,
  ): Promise<ApiResponse<any>> {
    return this.request(`/teacher-evaluations/${evaluationId}/submit`, {
      method: "POST",
    });
  }

  /**
   * Get full report card for an evaluation
   */
  async getEvaluationReportCard(
    evaluationId: number,
  ): Promise<ApiResponse<ReportCard>> {
    return this.request(`/teacher-evaluations/report/${evaluationId}`);
  }

  /**
   * Get all evaluations (with filters)
   */
  async getAllTeacherEvaluations(params?: {
    status?: string;
    period?: string;
    teacherId?: number;
    page?: number;
    limit?: number;
  }): Promise<
    ApiResponse<{
      evaluations: any[];
      stats: {
        total: number;
        draft: number;
        pendingReview: number;
        submitted: number;
        acknowledged: number;
      };
      total: number;
      page: number;
      totalPages: number;
      limit: number;
    }>
  > {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.period) query.append("period", params.period);
    if (params?.teacherId)
      query.append("teacherId", params.teacherId.toString());
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());
    const qs = query.toString();
    return this.request(`/teacher-evaluations${qs ? `?${qs}` : ""}`);
  }

  /**
   * Add action plan to an evaluation
   */
  async createEvaluationActionPlan(
    evaluationId: number,
    data: {
      title: string;
      description?: string;
      category?: string;
      targetDate?: string;
    },
  ): Promise<ApiResponse<any>> {
    return this.request(`/teacher-evaluations/${evaluationId}/action-plans`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Update action plan
   */
  async updateEvaluationActionPlan(
    planId: number,
    data: {
      status?: string;
      progress?: number;
      outcome?: string;
    },
  ): Promise<ApiResponse<any>> {
    return this.request(`/teacher-evaluations/action-plans/${planId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  /**
   * Get evaluation analytics for the school
   */
  async getEvaluationAnalytics(params?: {
    academicYearId?: number;
  }): Promise<ApiResponse<EvaluationAnalytics>> {
    const query = new URLSearchParams();
    if (params?.academicYearId)
      query.append("academicYearId", params.academicYearId.toString());
    const qs = query.toString();
    return this.request(`/teacher-evaluations/analytics${qs ? `?${qs}` : ""}`);
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

// ==================== EVALUATION HELPERS ====================

export const getEvaluationGradeLabel = (grade: string): string => {
  const labels: Record<string, string> = {
    EXCELLENT: "عالی",
    VERY_GOOD: "خیلی خوب",
    GOOD: "خوب",
    SATISFACTORY: "قابل قبول",
    NEEDS_IMPROVEMENT: "نیاز به بهبود",
    UNSATISFACTORY: "ضعیف",
  };
  return labels[grade] || grade;
};

export const getEvaluationGradeColor = (grade: string): string => {
  const colors: Record<string, string> = {
    EXCELLENT: "#10b981",
    VERY_GOOD: "#3b82f6",
    GOOD: "#f59e0b",
    SATISFACTORY: "#f97316",
    NEEDS_IMPROVEMENT: "#ef4444",
    UNSATISFACTORY: "#dc2626",
  };
  return colors[grade] || "#64748b";
};

export const getEvaluationStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    DRAFT: "پیش‌نویس",
    PENDING_REVIEW: "در انتظار بررسی",
    SUBMITTED: "ارسال شده",
    ACKNOWLEDGED: "تأیید شده",
    DISPUTED: "اعتراض",
    ARCHIVED: "بایگانی",
  };
  return labels[status] || status;
};

export const getEvaluationStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    DRAFT: "#94a3b8",
    PENDING_REVIEW: "#f59e0b",
    SUBMITTED: "#3b82f6",
    ACKNOWLEDGED: "#10b981",
    DISPUTED: "#ef4444",
    ARCHIVED: "#64748b",
  };
  return colors[status] || "#64748b";
};

export const getEvaluationPeriodLabel = (period: string): string => {
  const labels: Record<string, string> = {
    MONTHLY: "ماهانه",
    QUARTERLY: "سه‌ماهه",
    SEMESTER: "سمستر",
    ANNUAL: "سالانه",
    PROBATION: "دوره آزمایشی",
    SPECIAL: "ویژه",
  };
  return labels[period] || period;
};

export const getEvaluationCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    TEACHING: "تدریس",
    DISCIPLINE: "نظم و انضباط",
    COMMUNICATION: "ارتباطات",
    PROFESSIONAL: "حرفه‌ای",
    STUDENT_RELATION: "رابطه با شاگردان",
    ADMINISTRATIVE: "اداری",
    COLLABORATION: "همکاری",
    ATTENDANCE: "حضور",
    PUNCTUALITY: "وقت‌شناسی",
    OTHER: "سایر",
  };
  return labels[category] || category;
};