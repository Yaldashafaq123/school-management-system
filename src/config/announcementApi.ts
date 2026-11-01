// src/config/announcementsApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api"; // ← your existing base URL constant

// ==========================================================
// TYPES
// ==========================================================
export interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  status: string;
  scheduledFor: string | null;
  publishedAt: string | null;
  allowComments: boolean;
  requireConfirmation: boolean;
  eventDate: string | null;
  eventLocation: string | null;
  linkUrl: string | null;
  targetRole: string | null;
  createdAt: string;
  updatedAt: string;
  isEvent: boolean;

  author: {
    id: number;
    fullName: string;
    profileImage: string | null;
    role: string;
  } | null;

  classes: {
    id: number;
    name: string;
    section: string | null;
    displayName: string;
  }[];

  attachments: {
    id: number;
    url: string;
    type: string;
    filename: string | null;
    size: number | null;
  }[];

  isRead?: boolean;
  isConfirmed?: boolean;
  readCount?: number;
  confirmationCount?: number;
}

export interface ClassOption {
  id: number;
  name: string;
  section: string | null;
  displayName: string;
}

export interface CalendarDay {
  date: string;
  eventCount: number;
  events: any[];
}

// ==========================================================
// LOW-LEVEL FETCH
// ==========================================================
async function request<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await AsyncStorage.getItem("auth_token");
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    json = { success: false, message: text };
  }

  if (!res.ok && json?.success !== true) {
    throw new Error(json?.message || `HTTP ${res.status}`);
  }

  return json;
}

// ==========================================================
// API
// ==========================================================
export const announcementsApi = {
  // LIST
  getAnnouncements: (params?: {
    type?: string;
    status?: string;
    priority?: string;
    search?: string;
    classId?: number;
    page?: number;
    limit?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") qs.append(k, String(v));
      });
    }
    return request(`/announcements?${qs.toString()}`);
  },

  // DETAIL
  getById: (id: number) => request(`/announcements/${id}`),

  // READ
  markAsRead: (id: number) =>
    request(`/announcements/${id}/read`, { method: "POST" }),

  // CONFIRM
  confirm: (id: number, notes?: string) =>
    request(`/announcements/${id}/confirm`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    }),

  // CREATE
  create: (payload: any) =>
    request(`/announcements`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // UPDATE
  update: (id: number, payload: any) =>
    request(`/announcements/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),

  // DELETE
  delete: (id: number) => request(`/announcements/${id}`, { method: "DELETE" }),

  // PUBLISH
  publish: (id: number) =>
    request(`/announcements/${id}/publish`, { method: "POST" }),

  // READERS (author/admin)
  getReaders: (id: number) => request(`/announcements/${id}/readers`),

  // CALENDAR
  getCalendar: (month?: number, year?: number, from?: string, to?: string) => {
    const qs = new URLSearchParams();
    if (month) qs.append("month", String(month));
    if (year) qs.append("year", String(year));
    if (from) qs.append("from", from);
    if (to) qs.append("to", to);
    return request(`/announcements/calendar?${qs.toString()}`);
  },

  // TEACHER HELPER — own classes only
  getMyClasses: () => request(`/announcements/my-classes`),
};
