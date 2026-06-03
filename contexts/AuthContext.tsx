// contexts/AuthContext.tsx - CONNECTED TO REAL BACKEND

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
  register: (data: RegisterData) => Promise<void>;
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
  // CHECK SAVED LOGIN
  // ========================
  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const userDataStr = await AsyncStorage.getItem("user_data");

      if (token && userDataStr) {
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user: JSON.parse(userDataStr), token },
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
  // FETCH USER PROFILE (for teachers and detailed data)
  // ========================
  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) return;

      const userDataStr = await AsyncStorage.getItem("user_data");
      if (!userDataStr) return;

      const currentUser = JSON.parse(userDataStr);
      const userRole = currentUser.role?.toUpperCase(); // Normalize to uppercase

      // Fetch appropriate profile based on role
      let endpoint = "";
      if (userRole === "TEACHER") {
        endpoint = "/teacher/profile";
      } else if (userRole === "STUDENT") {
        endpoint = "/student/profile";
      } else if (userRole === "PARENT") {
        endpoint = "/parent/profile";
      } else {
        return; // Admin or other roles
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profileData = await response.json();

        // Merge profile data with existing user data
        const updatedUser = {
          ...currentUser,
          ...profileData,
          // Ensure teacher-specific fields are included
          ...(userRole === "TEACHER" && {
            bio: profileData.bio,
            experience: profileData.experience,
            hourlyRate: profileData.hourlyRate,
            certification: profileData.certification,
            availability: profileData.availability,
            rating: profileData.rating,
            education: profileData.education,
            subjects: profileData.subjects,
            stats: profileData.stats,
          }),
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
  // REAL LOGIN (CONNECTED TO DB)
  // ========================
 // ========================
// REAL LOGIN (CONNECTED TO DB) - WITH DEBUG
// ========================
const login = async (credentials: LoginCredentials) => {
  try {
    dispatch({ type: "LOGIN_REQUEST" });

    console.log("Attempting login with:", credentials.email);

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

    const data = await response.json();
    
    // 🔴🔴🔴 DETAILED DEBUG LOGGING 🔴🔴🔴
    console.log("========== FULL LOGIN RESPONSE ==========");
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(data, null, 2));
    
    // Log specific paths
    console.log("\n--- Checking specific paths ---");
    console.log("data.user:", data.user);
    console.log("data.user?.teacher:", data.user?.teacher);
    console.log("data.user?.teacher?.id:", data.user?.teacher?.id);
    console.log("data.teacher:", data.teacher);
    console.log("data.teacher?.id:", data.teacher?.id);
    console.log("data.teacherId:", data.teacherId);
    console.log("data.id:", data.id);
    console.log("data.user?.id:", data.user?.id);
    console.log("data.role:", data.role);
    console.log("data.user?.role:", data.user?.role);
    console.log("==========================================");

    if (!response.ok) {
      throw new Error(data.message || "ایمیل یا رمز عبور اشتباه است");
    }

    const token = data.token;

    // Try to find teacherId in multiple possible locations
    let teacherId = null;
    
    if (data.user?.teacher?.id) {
      teacherId = data.user.teacher.id;
      console.log("✅ Found teacherId in data.user.teacher.id:", teacherId);
    } else if (data.teacher?.id) {
      teacherId = data.teacher.id;
      console.log("✅ Found teacherId in data.teacher.id:", teacherId);
    } else if (data.teacherId) {
      teacherId = data.teacherId;
      console.log("✅ Found teacherId in data.teacherId:", teacherId);
    } else if (data.user?.id && data.user?.role === 'TEACHER') {
      // If user is teacher, maybe the user.id is the teacherId
      teacherId = data.user.id;
      console.log("✅ Using user.id as teacherId since role is TEACHER:", teacherId);
    } else {
      console.log("❌ No teacherId found in any location");
    }

    // Create user object from login response
    const user: User = {
      id: data.user?.id || data.id || 0,
      fullName: data.user?.fullName || data.fullName || credentials.email.split("@")[0],
      email: data.user?.email || data.email || credentials.email,
      phone: data.user?.phone || data.phone || "",
      role: (data.user?.role || data.role || "STUDENT").toLowerCase(),
      verified: data.user?.verified || data.verified || true,
      createdAt: data.user?.createdAt || data.createdAt || new Date().toISOString(),
      profile_image: data.user?.profileImage || data.user?.profile_image || data.profile_image,
      teacherId: teacherId,
      studentId: data.user?.student?.id || data.student?.id || data.studentId || null,
      parentId: data.user?.parent?.id || data.parent?.id || data.parentId || null,
      stats: {},
      enrolledCourses: [],
      courseProgress: {},
      children: [],
      active_child_id: undefined,
    };

    console.log("✅ Final user object created:", JSON.stringify(user, null, 2));

    await AsyncStorage.setItem("auth_token", token);
    await AsyncStorage.setItem("user_data", JSON.stringify(user));

    dispatch({
      type: "LOGIN_SUCCESS",
      payload: { user, token },
    });

    // Fetch full profile after login
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
  // REAL REGISTER (FIXED TO MATCH BACKEND)
  // ========================
  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Map frontend field names to backend expected names
      const backendData = {
        fullName: data.name, // Map 'name' to 'fullName'
        email: data.email,
        password: data.password,
        role: data.role.toUpperCase(), // Convert to uppercase for backend
        phone: data.phone || "",
      };

      console.log("Register data:", backendData);

      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendData),
      });

      const result = await response.json();
      console.log("Register response:", result);

      if (!response.ok) {
        throw new Error(result.message || "ثبت‌نام ناموفق بود");
      }

      let token, user;

      if (result.token && result.user) {
        // Format: { token: "...", user: {...} }
        token = result.token;
        user = result.user;
      } else if (result.token) {
        // Format: { token: "...", role: "...", message: "..." }
        token = result.token;
        // Create user object from available data
        user = {
          id: Date.now(), // Temporary ID
          fullName: data.name,
          email: data.email,
          phone: data.phone || "",
          role: (result.role || data.role).toLowerCase(), // Convert to lowercase
          verified: true,
          createdAt: new Date().toISOString(),
        };
      } else {
        // Unexpected format
        throw new Error("Invalid response format from server");
      }

      // Ensure user has all required fields with defaults
      const fullUser: User = {
        id: user.id,
        fullName: user.fullName || data.name,
        email: user.email || data.email,
        phone: user.phone || data.phone || "",
        role: (user.role || data.role).toLowerCase(),
        verified: user.verified || false,
        createdAt: user.createdAt || new Date().toISOString(),
        profile_image: user.profile_image,
        stats: {},
        enrolledCourses: [],
        courseProgress: {},
        children: [],
        active_child_id: undefined,
      };

      await AsyncStorage.setItem("auth_token", token);
      await AsyncStorage.setItem("user_data", JSON.stringify(fullUser));

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: fullUser, token },
      });

      Alert.alert("ثبت‌نام موفق", "حساب شما با موفقیت ایجاد شد.");

      // Fetch full profile after registration
      setTimeout(() => {
        fetchUserProfile();
      }, 100);
    } catch (error: any) {
      console.error("Register error:", error);
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error.message,
      });
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("user_data");
    dispatch({ type: "LOGOUT" });
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!state.user) return;

    try {
      // If user is teacher, update via teacher API
      if (state.user.role === "teacher") {
        // Compare with lowercase
        const token = await AsyncStorage.getItem("auth_token");
        if (token) {
          await fetch(`${BASE_URL}/teacher/profile`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(profile),
          });
        }
      }

      // Update local storage
      const updatedUser = { ...state.user, ...profile };
      await AsyncStorage.setItem("user_data", JSON.stringify(updatedUser));
      dispatch({ type: "UPDATE_PROFILE", payload: updatedUser });

      Alert.alert("موفقیت", "پروفایل با موفقیت به‌روزرسانی شد.");
    } catch (error) {
      console.error("Update profile error:", error);
      Alert.alert("خطا", "در به‌روزرسانی پروفایل خطایی رخ داد.");
    }
  };

  // ========================
  // KEEP YOUR EXISTING LOGIC - These now work with defaults
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

  const getChildren = (): ParentChild[] =>
    state.user?.role === "parent" ? state.user.children || [] : [];

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

  const addChild = async () => {};
  const removeChild = async () => {};
  const refreshUserData = async () => {
    await fetchUserProfile();
  };
  const setLoading = (loading: boolean) =>
    dispatch({ type: "SET_LOADING", payload: loading });

  const value: AuthContextType = {
    ...state,
    isInitialized,
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
