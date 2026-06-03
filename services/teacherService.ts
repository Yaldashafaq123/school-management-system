// services/teacherService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { BASE_URL } from "../constants/Config";
    import { BASE_URL } from "@/src/config/api";
export const getTeacherDashboard = async () => {
  try {
    const token = await AsyncStorage.getItem("auth_token");
    if (!token) throw new Error("No auth token found");

    const response = await fetch(`${BASE_URL}/teacher/dashboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch dashboard");

    return data; // { stats: {...}, recentActivities: [...], quickActions: [...] }
  } catch (error) {
    console.error("Teacher dashboard fetch error:", error);
    return null;
  }
};