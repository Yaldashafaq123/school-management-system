import { apiRequest } from './api';

// Define Template interface
export interface Template {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  icon?: string;
}

export interface AnnouncementData {
  title: string;
  content: string;
  type: 'GENERAL' | 'ASSIGNMENT' | 'EXAM' | 'EVENT'; // Changed from TYPE to type
  priority: 'low' | 'normal' | 'high' | 'urgent';
  targetClassIds: number[];
  scheduledFor?: Date | null;
  allowComments: boolean;
  requireConfirmation: boolean;
  attachments?: Array<{
    url: string;
    type: string;
    filename?: string;
    size?: number;
  }>;
}

export const announcementApi = {
  // Create new announcement
  create: async (data: AnnouncementData) => {
    return apiRequest('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Save as draft
  saveDraft: async (data: Partial<AnnouncementData>) => {
    return apiRequest('/announcements/draft', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get teacher's announcements
  getMyAnnouncements: async () => {
    return apiRequest('/announcements');
  },

  // Get templates
  getTemplates: async () => {
    return apiRequest('/announcements/templates');
  },

  // Student endpoints
  getStudentAnnouncements: async () => {
    return apiRequest('/announcements/student');
  },

  markAsRead: async (announcementId: number) => {
    return apiRequest(`/announcements/${announcementId}/read`, {
      method: 'POST',
    });
  },

  confirm: async (announcementId: number, notes?: string) => {
    return apiRequest(`/announcements/${announcementId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },
};