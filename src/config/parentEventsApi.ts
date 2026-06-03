// src/config/parentEventsApi.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "./api";

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  rsvp: boolean;
  attending: number;
  maxAttendees: number;
  priority?: string;
  author?: string;
  targetClasses?: { id: number; name: string; section: string }[];
}

export interface EventCategory {
  id: string;
  label: string;
}

export interface EventDetails extends Event {
  type: string;
  priority: string;
  createdAt: string;
  authorImage?: string;
  attachments: { id: number; url: string; type: string; filename: string }[];
  allowComments: boolean;
  requireConfirmation: boolean;
}

export const parentEventsApi = {
  // Get all events (from announcements with type=EVENT)
  getEvents: async (params?: {
    category?: string;
    childId?: number;
    upcoming?: boolean;
  }): Promise<{ success: boolean; data: Event[] }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      
      const queryParams = new URLSearchParams();
      queryParams.append("type", "EVENT");
      if (params?.upcoming) queryParams.append("upcoming", "true");
      
      const response = await fetch(
        `${BASE_URL}/announcements?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const result = await response.json();
      
      if (result.success && result.data) {
        const events: Event[] = result.data.items.map((announcement: any) => ({
          id: announcement.id,
          title: announcement.title,
          description: announcement.content,
          date: announcement.eventDate || announcement.scheduledFor || announcement.createdAt,
          time: announcement.eventDate 
            ? new Date(announcement.eventDate).toLocaleTimeString("fa-IR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          location: announcement.eventLocation || "سالن اجتماعات",
          category: announcement.type === "EVENT" ? "general" : "parent",
          rsvp: announcement.requireConfirmation || false,
          attending: announcement.confirmedBy?.length || 0,
          maxAttendees: 100,
          priority: announcement.priority,
          author: announcement.author?.fullName,
          targetClasses: announcement.targetClasses?.map((tc: any) => ({
            id: tc.class.id,
            name: tc.class.name,
            section: tc.class.section,
          })),
        }));
        
        return { success: true, data: events };
      }
      
      return { success: false, data: [] };
    } catch (error) {
      console.error("Error fetching events:", error);
      return { success: false, data: [] };
    }
  },

  // Get event categories
  getCategories: async (): Promise<{
    success: boolean;
    data: EventCategory[];
  }> => {
    try {
      const categories: EventCategory[] = [
        { id: "all", label: "همه" },
        { id: "academic", label: "تحصیلی" },
        { id: "sports", label: "ورزشی" },
        { id: "cultural", label: "فرهنگی" },
        { id: "parent", label: "والدین" },
      ];
      
      return { success: true, data: categories };
    } catch (error) {
      console.error("Error fetching categories:", error);
      return { success: false, data: [] };
    }
  },

  // Get event details
  getEventDetails: async (
    id: number
  ): Promise<{ success: boolean; data: EventDetails }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/announcements/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await response.json();
      
      if (result.success && result.data) {
        const announcement = result.data;
        const event: EventDetails = {
          id: announcement.id,
          title: announcement.title,
          description: announcement.content,
          date: announcement.eventDate || announcement.scheduledFor || announcement.createdAt,
          time: announcement.eventDate 
            ? new Date(announcement.eventDate).toLocaleTimeString("fa-IR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          location: announcement.eventLocation || "سالن اجتماعات",
          category: announcement.type === "EVENT" ? "general" : "parent",
          rsvp: announcement.requireConfirmation || false,
          attending: announcement.confirmedBy?.length || 0,
          maxAttendees: 100,
          priority: announcement.priority,
          author: announcement.author?.fullName,
          type: announcement.type,
          createdAt: announcement.createdAt,
          authorImage: announcement.author?.profileImage,
          attachments: announcement.attachments || [],
          allowComments: announcement.allowComments,
          requireConfirmation: announcement.requireConfirmation,
        };
        
        return { success: true, data: event };
      }
      
      return { success: false, data: null as any };
    } catch (error) {
      console.error("Error fetching event details:", error);
      return { success: false, data: null as any };
    }
  },

  // RSVP to event (uses announcement confirmation)
  rsvpEvent: async (
    id: number,
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(`${BASE_URL}/announcements/${id}/confirm`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error confirming event:", error);
      return { success: false, message: "خطا در تایید حضور" };
    }
  },

  // Alias for rsvpEvent (for compatibility)
  confirmEvent: async (
    id: number,
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    return parentEventsApi.rsvpEvent(id, notes);
  },
};