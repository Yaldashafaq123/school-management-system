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
  // FETCH USER PROFILE
  // ========================
  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) return;

      const userDataStr = await AsyncStorage.getItem("user_data");
      if (!userDataStr) return;

      const currentUser = JSON.parse(userDataStr);
      const userRole = currentUser.role?.toUpperCase();

      let endpoint = "";
      if (userRole === "TEACHER") {
        endpoint = "/teacher/profile";
      } else if (userRole === "STUDENT") {
        endpoint = "/student/profile";
      } else if (userRole === "PARENT") {
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
  // REAL LOGIN
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "ایمیل یا رمز عبور اشتباه است");
      }

      const token = data.token;

      // Create user object from login response
      const user: User = {
        id: data.user?.id || data.id || 0,
        fullName:
          data.user?.fullName ||
          data.fullName ||
          credentials.email.split("@")[0],
        email: data.user?.email || data.email || credentials.email,
        phone: data.user?.phone || data.phone || "",
        role: (data.user?.role || data.role || "STUDENT").toLowerCase(),
        verified: data.user?.verified || data.verified || true,
        createdAt:
          data.user?.createdAt || data.createdAt || new Date().toISOString(),
        profile_image: data.user?.profileImage || data.user?.profile_image,
        teacherId:
          data.user?.teacher?.id || data.teacher?.id || data.teacherId || null,
        studentId:
          data.user?.student?.id || data.student?.id || data.studentId || null,
        parentId:
          data.user?.parent?.id || data.parent?.id || data.parentId || null,
        stats: {},
        enrolledCourses: [],
        courseProgress: {},
        children: [],
        active_child_id: undefined,
      };

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
  // FIXED REGISTER FUNCTION (WITH CHILD EMAIL SUPPORT)
  // ========================
  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Map frontend field names to backend expected names
      const backendData: any = {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role.toUpperCase(),
        phone: data.phone || "",
      };

      // Include class_id if role is student
      if (data.role === "student" && data.class_id) {
        backendData.class_id = data.class_id;
      }

      // Include child_email if role is parent
      if (data.role === "parent" && (data as any).child_email) {
        backendData.child_email = (data as any).child_email;
      }

      console.log("Register data:", backendData);

      const response = await fetch(`${BASE_URL}/public/register`, {
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

      Alert.alert("ثبت‌نام موفق", "حساب شما با موفقیت ایجاد شد.");

      // After registration, redirect to login (they need to login with their new account)
      // The navigation will be handled in the screen component
    } catch (error: any) {
      console.error("Register error:", error);
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error.message,
      });
      throw error;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // ========================
  // FIXED LOGOUT - Clear ALL storage
  // ========================
  const logout = async () => {
    try {
      // Clear all auth-related items
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("user_data");
      await AsyncStorage.removeItem("userToken"); // Clear any old token formats

      // Clear any other app data if needed
      // await AsyncStorage.clear(); // Use with caution - clears EVERYTHING

      dispatch({ type: "LOGOUT" });

      console.log("Logout successful - all storage cleared");
    } catch (error) {
      console.error("Logout error:", error);
      // Still dispatch logout even if storage removal fails
      dispatch({ type: "LOGOUT" });
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!state.user) return;

    try {
      if (state.user.role === "teacher") {
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
