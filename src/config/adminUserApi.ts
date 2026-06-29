// src/config/adminUserApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

// ============ Core Types ============
export type UserRole = "admin" | "teacher" | "student" | "parent";

export interface AdminUser {
  id: number;
  fullName: string;
  name?: string; // For backward compatibility
  email: string;
  phone?: string;
  role: UserRole;
  status: "active" | "inactive" | "suspended";
  verified: boolean;
  profileImage?: string | null;
  profile_image?: string; // For backward compatibility
  createdAt: string;
  stats?: {
    attendanceCount: number;
    assignmentCount: number;
    messageCount: number;
    coursesCount?: number;
    assignmentsCount?: number;
    attendanceRate?: number;
  };
  classId?: number;
  className?: string;
  classSection?: string;
  teacherId?: number;
  subjects?: string[];
  parentId?: number;
  children?: { id: number; name: string }[];
}

export interface UpdateUserData {
  fullName?: string;
  name?: string; // For backward compatibility
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: "active" | "inactive" | "suspended";
  verified?: boolean;
  classId?: number;
  subjects?: number[];
  teacherId?: number;
  childId?: number;
}

// src/config/adminUserApi.ts
// Add these new types and update existing ones

export interface CreateUserData {
  // Basic Info
  fullName: string;
  nameFarsi?: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  isActive?: boolean;
  verified?: boolean;

  // Personal Info
  fatherName?: string;
  fatherNameFarsi?: string;
  grandfatherName?: string;
  grandfatherNameFarsi?: string;
  sex?: string;
  maritalStatus?: string;
  bloodType?: string;
  civilId?: string;
  civilIdIssueDate?: Date | null;
  civilIdExpiryDate?: Date | null;
  birthDate?: Date | null;
  birthPlace?: string;
  nationality?: string;
  currentAddress?: string;
  permanentAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;

  // Education
  educationLevel?: string;
  educationField?: string;
  educationInstitution?: string;
  graduationYear?: number | null;
  workExperience?: string;

  // Employment
  joinDate?: Date | null;
  contractStartDate?: Date | null;
  contractEndDate?: Date | null;
  contractType?: string;
  workSchedule?: string;
  workShift?: string;
  baseSalary?: number | null;
  salaryCurrency?: string;
  bankAccountNumber?: string;
  bankName?: string;
  insuranceNumber?: string;
  insuranceProvider?: string;
  hasInsurance?: boolean;
  hasContract?: boolean;

  // Student fields
  classId?: number | null;
  studentNumber?: string;
  previousSchool?: string;
  enrollmentDate?: Date | null;
  enrollmentType?: string;
  transferSchool?: string;
  transferDate?: Date | null;
  isTransfer?: boolean;
  feeWaiver?: boolean;
  feeWaiverReason?: string;
  scholarship?: boolean;
  scholarshipType?: string;
  scholarshipPercentage?: number | null;
  studentGraduationDate?: Date | null;
  studentGraduationYear?: number | null;
  siblingCount?: number | null;
  siblingNames?: string;
  healthConditions?: string;
  allergies?: string;
  medication?: string;
  specialNeeds?: string;

  // Teacher fields
  teacherCode?: string;
  specialization?: string;
  teachingExperience?: number | null;
  languageSkills?: string;
  publications?: string;
  awards?: string;

  // Parent fields
  childId?: number | null;
  teacherId?: number | null;

  subjects?: number[];
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  admin: number;
  teacher: number;
  student: number;
  parent: number;
  newThisMonth: number;
  newUsersThisMonth?: number; // For backward compatibility
}

export interface UsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============ Dropdown Option Types ============
export interface ClassOption {
  id: number;
  name: string;
  displayName: string;
  section?: string;
}

export interface TeacherOption {
  id: number;
  name: string;
  fullName?: string;
  profileImage?: string;
  email?: string;
}

export interface SubjectOption {
  id: number;
  name: string;
}

export interface StudentInfo {
  id: number;
  name: string;
  fullName?: string;
  email: string;
  className?: string;
  classId?: number;
}

export interface RoleOption {
  id: string;
  name: string;
  label: string;
}

// ============ API Methods ============
export const adminUserApi = {
  // ============ User Management ============
  // Get all users with filters and pagination
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{ success: boolean; data: UsersResponse }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.role && params.role !== "all")
        queryParams.append("role", params.role);
      if (params?.status && params.status !== "all")
        queryParams.append("status", params.status);
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const url = `${BASE_URL}/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
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
      console.error("Error fetching users:", error);
      return {
        success: false,
        data: { users: [], total: 0, page: 1, limit: 20, totalPages: 0 },
      };
    }
  },

  // Get user by ID
  getUser: async (
    id: number,
  ): Promise<{ success: boolean; data: AdminUser }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/users/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching user:", error);
      return { success: false, data: null as any };
    }
  },

  // Get user statistics
  getUserStats: async (): Promise<{ success: boolean; data: UserStats }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/users/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return { success: false, data: null as any };
    }
  },

  // Create new user
  createUser: async (
    data: CreateUserData,
  ): Promise<{ success: boolean; message: string; data?: AdminUser }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      // Transform data to match backend expectations
      const payload = {
        fullName: data.fullName,
        name: data.fullName, // For backward compatibility
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
        classId: data.classId,
        teacherId: data.teacherId,
        childId: data.childId,
        subjects: data.subjects,
      };
      const response = await fetch(`${BASE_URL}/admin/users`, {
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
      console.error("Error creating user:", error);
      return { success: false, message: "خطا در ایجاد کاربر" };
    }
  },

  // Update user
  updateUser: async (
    id: number,
    data: UpdateUserData,
  ): Promise<{ success: boolean; message: string; data?: AdminUser }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      // Transform data to match backend expectations
      const payload = {
        fullName: data.fullName || data.name,
        name: data.fullName || data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        status: data.status,
        verified: data.verified,
        classId: data.classId,
        teacherId: data.teacherId,
        childId: data.childId,
        subjects: data.subjects,
      };
      const response = await fetch(`${BASE_URL}/admin/users/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, message: "خطا در به‌روزرسانی کاربر" };
    }
  },

  // Delete user
  deleteUser: async (
    id: number,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error deleting user:", error);
      return { success: false, message: "خطا در حذف کاربر" };
    }
  },

  // Update user status (activate/suspend)
  updateUserStatus: async (
    id: number,
    status: "active" | "inactive" | "suspended",
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/users/${id}/status`, {
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
      console.error("Error updating user status:", error);
      return { success: false, message: "خطا در تغییر وضعیت کاربر" };
    }
  },

  // Reset user password (ONLY ONE - removed duplicate)
  resetUserPassword: async (
    id: number,
  ): Promise<{ success: boolean; message: string; newPassword?: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/users/${id}/reset-password`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error resetting password:", error);
      return { success: false, message: "خطا در بازنشانی رمز عبور" };
    }
  },

  // ============ Dropdown Options ============
  // Get available roles for dropdown
  getRoles: async (): Promise<{ success: boolean; data: RoleOption[] }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/users/roles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching roles:", error);
      return { success: false, data: [] };
    }
  },

  // Get all classes for dropdown
  getClasses: async (): Promise<{ success: boolean; data: ClassOption[] }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/dropdown/classes`, {
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
          displayName: item.name,
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

  // Get all teachers for dropdown
  getTeachers: async (): Promise<{
    success: boolean;
    data: TeacherOption[];
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/dropdown/teachers`, {
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
          fullName: item.name,
          profileImage: item.profileImage,
          email: item.email,
        }));
        return { success: true, data: formattedData };
      }
      return result;
    } catch (error) {
      console.error("Error fetching teachers:", error);
      return { success: false, data: [] };
    }
  },

  // Get all subjects for dropdown
  getSubjects: async (): Promise<{
    success: boolean;
    data: SubjectOption[];
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/admin/dropdown/subjects`, {
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

  // Find student by email for parent assignment
  findStudentByEmail: async (
    email: string,
  ): Promise<{ success: boolean; data?: StudentInfo }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/students/find-by-email?email=${encodeURIComponent(email)}`,
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
      console.error("Error finding student:", error);
      return { success: false };
    }
  },

  // ============ Export Functions ============
  // Export users to CSV or PDF
  exportUsers: async (
    format: "csv" | "pdf" = "csv",
    filters?: {
      role?: string;
      status?: string;
    },
  ): Promise<{ success: boolean; data: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const queryParams = new URLSearchParams();
      queryParams.append("format", format);
      if (filters?.role) queryParams.append("role", filters.role);
      if (filters?.status) queryParams.append("status", filters.status);

      const response = await fetch(
        `${BASE_URL}/admin/users/export?${queryParams.toString()}`,
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
      console.error("Error exporting users:", error);
      return { success: false, data: "" };
    }
  },
};

// ============ Helper Functions ============
// Get role label in Persian
export const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case "admin":
      return "مدیر";
    case "teacher":
      return "معلم";
    case "student":
      return "دانش‌آموز";
    case "parent":
      return "والدین";
    default:
      return "کاربر";
  }
};

// Get role color
export const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case "admin":
      return "#FF3B30";
    case "teacher":
      return "#007AFF";
    case "student":
      return "#34C759";
    case "parent":
      return "#FF9500";
    default:
      return "#8E8E93";
  }
};

// Get status label in Persian
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case "active":
      return "فعال";
    case "inactive":
      return "غیرفعال";
    case "suspended":
      return "تعلیق شده";
    default:
      return status;
  }
};

// Get status color
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "active":
      return "#34C759";
    case "inactive":
      return "#FF9500";
    case "suspended":
      return "#FF3B30";
    default:
      return "#8E8E93";
  }
};

// Get status badge style
export const getStatusBadgeStyle = (
  status: string,
): { backgroundColor: string; textColor: string } => {
  switch (status) {
    case "active":
      return { backgroundColor: "#D4F7E2", textColor: "#34C759" };
    case "inactive":
      return { backgroundColor: "#FFF4E5", textColor: "#FF9500" };
    case "suspended":
      return { backgroundColor: "#FFE5E5", textColor: "#FF3B30" };
    default:
      return { backgroundColor: "#F2F2F7", textColor: "#8E8E93" };
  }
};

// ============ Default Values ============
export const defaultUserStats: UserStats = {
  total: 0,
  active: 0,
  inactive: 0,
  suspended: 0,
  admin: 0,
  teacher: 0,
  student: 0,
  parent: 0,
  newThisMonth: 0,
};

export const defaultAdminUser: AdminUser = {
  id: 0,
  fullName: "",
  email: "",
  role: "student",
  status: "active",
  verified: false,
  createdAt: "",
};
