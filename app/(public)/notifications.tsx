import { apiRequest } from '@/src/config/api';
// import { notificationApi, Notification } from '@/src/config/notificationApi';
export interface Notification {
  id: number;
  title: string;
  message: string;
  content?: string;
  time?: string;
  TYPE: 'ANNOUNCEMENT' | 'ASSIGNMENT' | 'EXAM' | 'MESSAGE' | 'ACHIEVEMENT' | 'SYSTEM';
  read: boolean;
  data?: any;
  createdAt: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  senderName?: string;
  targetUrl?: string;
}

export interface Template {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  icon?: string;
}

export const notificationApi = {
  // Get all notifications for current user
  getNotifications: async (): Promise<any> => {
    return apiRequest('/notifications');
  },

  // Mark a notification as read
  markAsRead: async (notificationId: number): Promise<any> => {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<any> => {
    return apiRequest('/notifications/read-all', {
      method: 'POST',
    });
  },

  // Delete a notification
  deleteNotification: async (notificationId: number): Promise<any> => {
    return apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },

  // Clear all notifications
  clearAllNotifications: async (): Promise<any> => {
    return apiRequest('/notifications/clear-all', {
      method: 'DELETE',
    });
  },

  // Get unread count
  getUnreadCount: async (): Promise<any> => {
    return apiRequest('/notifications/unread-count');
  },
};