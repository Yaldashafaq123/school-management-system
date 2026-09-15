// src/config/disciplineApi.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api"; // ← همان BASE_URL که کار می‌کند

console.log("🚀 [DisciplineApi] Using BASE_URL =", BASE_URL);

// =============================
// Helper: توکن از کلید auth_token
// =============================
async function getAuthHeaders() {
  const token = await AsyncStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
}

// =============================
// Helper: درخواست
// =============================
async function request(endpoint, options = {}) {
  console.log("🌐 [DisciplineApi]", options.method || "GET", endpoint);

  try {
    const headers = await getAuthHeaders();
    const fullUrl = `${BASE_URL}/discipline${endpoint}`;
    console.log("🌐 [DisciplineApi] URL:", fullUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(fullUrl, {
      ...options,
      headers: { ...headers, ...(options.headers || {}) },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log("📥 [DisciplineApi] Status:", response.status);

    const text = await response.text();
    console.log("📥 [DisciplineApi] Body:", text.substring(0, 300));

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`پاسخ نامعتبر از سرور (${response.status})`);
    }

    if (!response.ok) {
      throw new Error(data.message || `خطای ${response.status}`);
    }

    console.log("✅ [DisciplineApi] SUCCESS");
    return data;
  } catch (err) {
    console.error("❌ [DisciplineApi] FAILED:", err?.message);
    if (err.name === "AbortError") {
      throw new Error("درخواست زمان‌بر شد. لطفا اتصال اینترنت خود را بررسی کنید.");
    }
    throw err;
  }
}

// =============================
// APIها
// =============================
export const disciplineApi = {
  getCatalog: () => request("/catalog"),

  getTeacherClasses: () => request("/teacher/classes"),

  getStudentsForClass: (classId) =>
    request(`/teacher/classes/${classId}/students`),

  reportViolation: (payload) =>
    request("/teacher/report", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMyReports: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/teacher/my-reports${qs ? `?${qs}` : ""}`);
  },

  getRecordDetails: (id) => request(`/admin/records/${id}`),
  // در disciplineApi اضافه کنید:
getPraiseCatalog: () => request("/praise/catalog"),
getPraiseLeaderboard: (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/praise/leaderboard${qs ? `?${qs}` : ""}`);
},
reportPraise: (payload) =>
  request("/praise/report", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
getPendingPraise: (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return request(`/praise/pending${qs ? `?${qs}` : ""}`);
},
reviewPraise: (id, payload) =>
  request(`/praise/records/${id}/review`, {
    method: "POST",
    body: JSON.stringify(payload),
  }),
getMyPraise: () => request("/praise/me"),
  getStudentScore: (studentId) => request(`/student/${studentId}/score`),
  getStudentFullReport: (studentId) =>
    request(`/admin/student/${studentId}/full-report`),
  getClassRankings: () => request("/admin/class-ranking"),
  getStudentHistory: (studentId, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/student/${studentId}/history${qs ? `?${qs}` : ""}`);
  },
};