// src/config/adminAnalyticsApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

// ============ Core Analytics Types ============
export interface AnalyticsStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  newUsersGrowth: number;
  totalCourses: number;
  completedCourses: number;
  totalHours: number;
  averageScore: number;
  completionRate: number;
  activeRate: number;
}

export interface UserGrowthItem {
  month: string;
  users: number;
}

export interface CoursePerformanceItem {
  name: string;
  completion: number;
  avgScore: number;
}

export interface TopTeacher {
  name: string;
  courses: number;
  students: number;
  rating: number;
}

export interface SystemMetrics {
  uptime: number; // System uptime in hours
  responseTime: number; // Average response time in ms
  cpuLoad: number; // CPU load percentage
  storageUsed: number; // Storage used in MB
}

// ============ Main Analytics Data ============
export interface AnalyticsData {
  stats: AnalyticsStats;
  userGrowth: UserGrowthItem[];
  coursePerformance: CoursePerformanceItem[];
  topTeachers: TopTeacher[];
}

// ============ User Analytics Types ============
export interface UserDistribution {
  students: number;
  teachers: number;
  admins: number;
  parents: number;
}

export interface DeviceDistribution {
  mobile: number;
  desktop: number;
  tablet: number;
}

export interface CountryDistribution {
  country: string;
  users: number;
  percentage: number;
}

export interface MonthlyGrowth {
  month: string;
  newUsers: number;
  activeUsers: number;
}

export interface UserAnalytics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  growthRate: number;
  retentionRate: number;
  avgSessionTime: number;
  userDistribution: UserDistribution;
  deviceDistribution: DeviceDistribution;
  countryDistribution: CountryDistribution[];
  monthlyGrowth: MonthlyGrowth[];
}

// ============ Course Analytics Types ============
export interface CourseAnalytics {
  course: {
    id: number;
    title: string;
    teacher: string;
    totalEnrollments: number;
    completedEnrollments: number;
    inProgressEnrollments: number;
    completionRate: number;
    averageGrade: number;
    totalLessons: number;
    completionOverTime: { month: string; completed: number }[];
  };
  students: {
    id: number;
    name: string;
    enrolledAt: string;
    status: string;
    progress: number;
  }[];
}

// ============ Revenue Analytics Types ============
export interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
  topCourses: { id: number; title: string; revenue: number }[];
}

// ============ API Methods ============
export const adminAnalyticsApi = {
  // ============ Main Analytics ============
  // Get main analytics data
  getAnalytics: async (
    range: "day" | "week" | "month" | "year" = "month",
  ): Promise<{ success: boolean; data: AnalyticsData }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/analytics?range=${range}`,
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
      console.error("Error fetching analytics:", error);
      return { success: false, data: null as any };
    }
  },

  // Get system metrics
  getSystemMetrics: async (): Promise<{
    success: boolean;
    data: SystemMetrics;
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/analytics/system-metrics`,
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
      console.error("Error fetching system metrics:", error);
      return { success: false, data: null as any };
    }
  },

  // Get top courses
  getTopCourses: async (
    limit: number = 10,
  ): Promise<{
    success: boolean;
    data: { id: number; title: string; students: number; rating: number }[];
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/analytics/top-courses?limit=${limit}`,
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
      console.error("Error fetching top courses:", error);
      return { success: false, data: [] };
    }
  },

  // Get top teachers
  getTopTeachers: async (
    limit: number = 5,
  ): Promise<{
    success: boolean;
    data: TopTeacher[];
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/analytics/top-teachers?limit=${limit}`,
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
      console.error("Error fetching top teachers:", error);
      return { success: false, data: [] };
    }
  },

  // ============ User Analytics ============
  // Get user analytics
  getUserAnalytics: async (
    range: "day" | "week" | "month" | "year" = "month",
  ): Promise<{
    success: boolean;
    data: UserAnalytics;
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/analytics/users?range=${range}`,
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
      console.error("Error fetching user analytics:", error);
      return { success: false, data: null as any };
    }
  },

  // Get user distribution (simplified)
  getUserDistribution: async (): Promise<{
    success: boolean;
    data: UserDistribution;
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/analytics/users/distribution`,
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
      console.error("Error fetching user distribution:", error);
      return { success: false, data: null as any };
    }
  },

  // ============ Course Analytics ============
  // Get course-specific analytics
  getCourseAnalytics: async (
    courseId: number,
  ): Promise<{ success: boolean; data: CourseAnalytics }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/analytics/course/${courseId}`,
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
      console.error("Error fetching course analytics:", error);
      return { success: false, data: null as any };
    }
  },

  // ============ Revenue Analytics ============
  // Get revenue analytics
  getRevenueAnalytics: async (
    range: "day" | "week" | "month" | "year" = "month",
  ): Promise<{
    success: boolean;
    data: RevenueAnalytics;
  }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/analytics/revenue?range=${range}`,
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
      console.error("Error fetching revenue analytics:", error);
      return { success: false, data: null as any };
    }
  },

  // ============ Export Functions ============
  // Export analytics report
  exportAnalytics: async (
    format: "csv" | "pdf" = "csv",
    range: "day" | "week" | "month" | "year" = "month",
  ): Promise<{ success: boolean; data: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/analytics/export?format=${format}&range=${range}`,
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
      console.error("Error exporting analytics:", error);
      return { success: false, data: "" };
    }
  },

  // Export course analytics
  exportCourseAnalytics: async (
    courseId: number,
    format: "csv" | "pdf" = "csv",
  ): Promise<{ success: boolean; data: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        `${BASE_URL}/admin/analytics/course/${courseId}/export?format=${format}`,
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
      console.error("Error exporting course analytics:", error);
      return { success: false, data: "" };
    }
  },
};

// ============ Helper Functions ============
// Format number with Persian separators
export const formatNumber = (num: number): string => {
  return num.toLocaleString("fa-IR");
};

// Format percentage
export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString("fa-IR") + " تومان";
};

// Format time duration
export const formatDuration = (hours: number): string => {
  if (hours < 24) return `${hours} ساعت`;
  const days = Math.floor(hours / 24);
  return `${days} روز`;
};

// Get trend icon and color
export const getTrendInfo = (
  growth: number,
): { icon: string; color: string; text: string } => {
  if (growth > 0) {
    return { icon: "trending-up", color: "#34C759", text: `${growth}% افزایش` };
  } else if (growth < 0) {
    return {
      icon: "trending-down",
      color: "#FF3B30",
      text: `${Math.abs(growth)}% کاهش`,
    };
  }
  return { icon: "trending-flat", color: "#FF9500", text: "بدون تغییر" };
};

// Get status color for metrics
export const getMetricStatusColor = (
  value: number,
  threshold: number,
): string => {
  if (value >= threshold) return "#34C759";
  if (value >= threshold * 0.7) return "#FF9500";
  return "#FF3B30";
};

// Get performance rating
export const getPerformanceRating = (
  completionRate: number,
  avgScore: number,
): string => {
  const avg = (completionRate + avgScore) / 2;
  if (avg >= 85) return "عالی";
  if (avg >= 70) return "خوب";
  if (avg >= 50) return "متوسط";
  return "نیاز به بهبود";
};

// Get performance rating color
export const getPerformanceRatingColor = (
  completionRate: number,
  avgScore: number,
): string => {
  const avg = (completionRate + avgScore) / 2;
  if (avg >= 85) return "#34C759";
  if (avg >= 70) return "#FF9500";
  if (avg >= 50) return "#FFC107";
  return "#FF3B30";
};

// Get color for user role
export const getUserRoleColor = (role: string): string => {
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

// Get device icon
export const getDeviceIcon = (device: string): string => {
  switch (device) {
    case "mobile":
      return "phone-portrait";
    case "desktop":
      return "desktop";
    case "tablet":
      return "tablet-portrait";
    default:
      return "devices";
  }
};

// Get country flag emoji (simplified)
export const getCountryFlag = (country: string): string => {
  const flags: Record<string, string> = {
    Afghanistan: "🇦🇫",
    Iran: "🇮🇷",
    USA: "🇺🇸",
    UK: "🇬🇧",
    Canada: "🇨🇦",
    Germany: "🇩🇪",
    France: "🇫🇷",
    Australia: "🇦🇺",
  };
  return flags[country] || "🌍";
};

// ============ Default Values ============
export const defaultAnalyticsStats: AnalyticsStats = {
  totalUsers: 0,
  activeUsers: 0,
  newUsers: 0,
  newUsersGrowth: 0,
  totalCourses: 0,
  completedCourses: 0,
  totalHours: 0,
  averageScore: 0,
  completionRate: 0,
  activeRate: 0,
};

export const defaultUserAnalytics: UserAnalytics = {
  totalUsers: 0,
  newUsers: 0,
  activeUsers: 0,
  growthRate: 0,
  retentionRate: 0,
  avgSessionTime: 0,
  userDistribution: {
    students: 0,
    teachers: 0,
    admins: 0,
    parents: 0,
  },
  deviceDistribution: {
    mobile: 0,
    desktop: 0,
    tablet: 0,
  },
  countryDistribution: [],
  monthlyGrowth: [],
};

export const defaultSystemMetrics: SystemMetrics = {
  uptime: 0,
  responseTime: 0,
  cpuLoad: 0,
  storageUsed: 0,
};

export const defaultAnalyticsData: AnalyticsData = {
  stats: defaultAnalyticsStats,
  userGrowth: [],
  coursePerformance: [],
  topTeachers: [],
};
