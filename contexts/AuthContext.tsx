// contexts/AuthContext.tsx - Updated with FINANCE support

import { BASE_URL } from "@/src/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { Alert } from "react-native";
import { mockCourses } from "../constants/mockData";
import {
  AuthState,
  Course,
  DashboardStats,
  LoginCredentials,
  ParentChild,
  RegisterData,
  User,
  UserProfile,
  UserRole,
} from "../types";

type AuthAction =
  | { type: "LOGIN_REQUEST" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "UPDATE_PROFILE"; payload: User }
  | { type: "UPDATE_USER_STATS"; payload: DashboardStats }
  | { type: "SET_ACTIVE_CHILD"; payload: number }
  | { type: "SET_LOADING"; payload: boolean };

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData & { childEmail?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  getUserStats: () => DashboardStats;
  getEnrolledCourses: () => Course[];
  getCourseProgress: (courseId: number) => number;
  getChildren: () => ParentChild[];
  getActiveChild: () => ParentChild | null;
  setActiveChild: (childId: number) => void;
  addChild: (childData: Omit<ParentChild, "id">) => Promise<void>;
  removeChild: (childId: number) => Promise<void>;
  refreshUserData: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  isInitialized: boolean;
  userRole: UserRole | null;
  isFinance: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_REQUEST":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
        loading: false,
      };
    case "UPDATE_PROFILE":
      return { ...state, user: action.payload };
    case "SET_ACTIVE_CHILD":
      return {
        ...state,
        user: state.user
          ? { ...state.user, active_child_id: action.payload }
          : state.user,
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // ========================
  // HELPER: Normalize role to lowercase
  // ========================
  const normalizeRole = (role: string | undefined): UserRole | null => {
    if (!role) return null;
    const lowerRole = role.toLowerCase();
    // ✅ ADDED: 'finance' to valid roles
    const validRoles: UserRole[] = [
      "admin",
      "teacher",
      "student",
      "parent",
      "finance",
      "hr",
      "principal",
    ];
    if (validRoles.includes(lowerRole as UserRole)) {
      return lowerRole as UserRole;
    }
    return null;
  };

  // ========================
  // CHECK SAVED LOGIN
  // ========================
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const userDataStr = await AsyncStorage.getItem("user_data");

      if (token && userDataStr) {
        const userData = JSON.parse(userDataStr);
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user: userData, token },
        });
      } else {
        dispatch({ type: "LOGIN_FAILURE", payload: "No credentials" });
      }
    } catch (err) {
      console.error("Auth check error:", err);
      dispatch({
        type: "LOGIN_FAILURE",
        payload: "Auth check failed",
      });
    } finally {
      setIsInitialized(true);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // ========================
  // FETCH USER PROFILE - Updated
  // ========================
  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) return;

      const userDataStr = await AsyncStorage.getItem("user_data");
      if (!userDataStr) return;

      const currentUser = JSON.parse(userDataStr);
      const userRole = normalizeRole(currentUser.role);
      const userType = currentUser.userType || userRole;

      // Skip profile fetch for admin/finance users (they don't have profile endpoints)
      if (userRole === "admin" || userRole === "finance") {
        return;
      }

      let endpoint = "";
      if (userRole === "teacher") {
        endpoint = "/teacher/profile";
      } else if (userRole === "student") {
        endpoint = "/student/profile";
      } else if (userRole === "parent") {
        endpoint = "/parent/profile";
      } else {
        return;
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        const updatedUser = {
          ...currentUser,
          ...profileData,
        };

        await AsyncStorage.setItem("user_data", JSON.stringify(updatedUser));
        dispatch({
          type: "UPDATE_PROFILE",
          payload: updatedUser,
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // ========================
  // LOGIN - Updated for FINANCE
  // ========================
  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: "LOGIN_REQUEST" });

      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error(
          "Server returned non-JSON response. Please check if the API endpoint is correct.",
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "ایمیل یا رمز عبور اشتباه است");
      }

      const token = data.token;
      const userData = data.User || data.user || data;

      // ✅ Use userType from backend for routing, fallback to role
      const routeRole = userData.userType || userData.role;
      const normalizedRole = normalizeRole(routeRole) || "student";

      // ✅ Extract finance staff data
      const financeStaff = userData.FinanceStaff || userData.finance || null;

      const user: User = {
        id: userData.id || 0,
        fullName: userData.fullName || credentials.email.split("@")[0],
        email: userData.email || credentials.email,
        phone: userData.phone || "",
        role: normalizedRole,
        // ✅ Store original role for reference
        originalRole: userData.role,
        userType: routeRole,
        verified: userData.verified || true,
        createdAt: userData.createdAt || new Date().toISOString(),
        profile_image: userData.profileImage || userData.profile_image,
        teacherId: userData.Teacher?.id || userData.teacher?.id || null,
        studentId: userData.Student?.id || userData.student?.id || null,
        parentId: userData.Parent?.id || userData.parent?.id || null,
        financeId: financeStaff?.id || null, // ✅ NEW
        financeStaff: financeStaff, // ✅ NEW
        stats: {},
        enrolledCourses: [],
        courseProgress: {},
        children: [],
        active_child_id: undefined,
      };

      console.log("✅ User role extracted:", user.role);
      console.log("✅ User type for routing:", user.userType || user.role);
      console.log("✅ Finance staff data:", user.financeStaff);

      await AsyncStorage.setItem("auth_token", token);
      await AsyncStorage.setItem("user_data", JSON.stringify(user));

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      });

      setTimeout(() => {
        fetchUserProfile();
      }, 100);
    } catch (error: any) {
      console.error("Login error:", error);
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error.message,
      });
      throw error;
    }
  };

  // ========================
  // REGISTER - Updated for FINANCE
  // ========================
  const register = async (
    data: RegisterData & {
      childEmail?: string;
      position?: string;
      department?: string;
      joinDate?: string;
      salary?: number;
    },
  ) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const backendData: any = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role.toUpperCase(), // Send uppercase to backend
        phone: data.phone || "",
      };

      // ✅ Add finance-specific fields
      if (data.role === "finance") {
        backendData.position = data.position || "Finance Officer";
        backendData.department = data.department || "Finance Department";
        backendData.joinDate = data.joinDate || new Date().toISOString();
        backendData.salary = data.salary || 0;
      }

      // Add child email if parent registration
      if (data.role === "parent" && data.childEmail) {
        backendData.childEmail = data.childEmail;
      }

      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "ثبت‌نام با خطا مواجه شد");
      }

      Alert.alert(
        "ثبت‌نام موفق",
        "حساب کاربری شما با موفقیت ایجاد شد. لطفاً وارد شوید.",
        [{ text: "ورود", onPress: () => {} }],
      );
    } catch (error: any) {
      console.error("Register error:", error);
      Alert.alert("خطا", error.message || "ثبت‌نام با خطا مواجه شد");
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // ========================
  // LOGOUT
  // ========================
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("user_data");
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("user_role");

      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(
        (key) =>
          key.startsWith("course_") ||
          key.startsWith("progress_") ||
          key.startsWith("attendance_"),
      );
      if (appKeys.length > 0) {
        await AsyncStorage.multiRemove(appKeys);
      }

      dispatch({ type: "LOGOUT" });
      console.log("✅ Logout successful - all storage cleared");
    } catch (error) {
      console.error("Logout error:", error);
      dispatch({ type: "LOGOUT" });
    }
  };

  // ========================
  // UPDATE PROFILE - Updated
  // ========================
  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!state.user) return;

    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) return;

      const userRole = state.user.role;
      let endpoint = "";

      if (userRole === "teacher") {
        endpoint = "/teacher/profile";
      } else if (userRole === "student") {
        endpoint = "/student/profile";
      } else if (userRole === "parent") {
        endpoint = "/parent/profile";
      } else {
        // Admin, Finance, or other roles
        const updatedUser = { ...state.user, ...profile };
        await AsyncStorage.setItem("user_data", JSON.stringify(updatedUser));
        dispatch({ type: "UPDATE_PROFILE", payload: updatedUser });
        Alert.alert("موفقیت", "پروفایل با موفقیت به‌روزرسانی شد.");
        return;
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const updatedData = await response.json();
        const updatedUser = { ...state.user, ...updatedData };
        await AsyncStorage.setItem("user_data", JSON.stringify(updatedUser));
        dispatch({ type: "UPDATE_PROFILE", payload: updatedUser });
        Alert.alert("موفقیت", "پروفایل با موفقیت به‌روزرسانی شد.");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      Alert.alert("خطا", "در به‌روزرسانی پروفایل خطایی رخ داد.");
    }
  };

  // ========================
  // HELPER FUNCTIONS
  // ========================
  const getUserStats = () => state.user?.stats || {};

  const getEnrolledCourses = (): Course[] => {
    if (!state.user?.enrolledCourses || state.user.enrolledCourses.length === 0)
      return [];
    return mockCourses.filter((c) =>
      state.user?.enrolledCourses?.includes(c.id),
    );
  };

  const getCourseProgress = (courseId: number) =>
    state.user?.courseProgress?.[courseId] || 0;

  const getChildren = (): ParentChild[] => {
    if (state.user?.role === "parent") {
      return state.user.children || [];
    }
    return [];
  };

  const getActiveChild = (): ParentChild | null => {
    if (state.user?.role !== "parent") return null;
    return (
      state.user.children?.find((c) => c.id === state.user?.active_child_id) ||
      state.user.children?.[0] ||
      null
    );
  };

  const setActiveChild = (childId: number) => {
    if (!state.user) return;
    const updatedUser = { ...state.user, active_child_id: childId };
    AsyncStorage.setItem("user_data", JSON.stringify(updatedUser));
    dispatch({ type: "SET_ACTIVE_CHILD", payload: childId });
  };

  const addChild = async () => {
    Alert.alert("اطلاعات", "این قابلیت در نسخه بعدی اضافه خواهد شد.");
  };

  const removeChild = async () => {
    Alert.alert("اطلاعات", "این قابلیت در نسخه بعدی اضافه خواهد شد.");
  };

  const refreshUserData = async () => {
    await fetchUserProfile();
  };

  const setLoading = (loading: boolean) =>
    dispatch({ type: "SET_LOADING", payload: loading });

  // ✅ Computed properties
  const userRole = state.user?.role || null;
  const isFinance = userRole === "finance";

  const value: AuthContextType = {
    ...state,
    isInitialized,
    userRole,
    isFinance,
    login,
    register,
    logout,
    updateProfile,
    getUserStats,
    getEnrolledCourses,
    getCourseProgress,
    getChildren,
    getActiveChild,
    setActiveChild,
    addChild,
    removeChild,
    refreshUserData,
    setLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
