// contexts/NotificationContext.tsx
import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, NotificationPreferences } from '../types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  loading: boolean;
  error: string | null;
}

type NotificationAction =
  | { type: 'FETCH_NOTIFICATIONS_REQUEST' }
  | { type: 'FETCH_NOTIFICATIONS_SUCCESS'; payload: Notification[] }
  | { type: 'FETCH_NOTIFICATIONS_FAILURE'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'DELETE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<NotificationPreferences> };

interface NotificationContextType extends NotificationState {
  requestPermissions: () => Promise<boolean>;
  scheduleNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
  fetchNotifications: () => Promise<void>;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  preferences: {
    assignments: true,
    exams: true,
    announcements: true,
    course_updates: true,
    system_messages: true,
    email_notifications: true,
    push_notifications: true,
    quiet_hours: {
      enabled: false,
      start_time: '22:00',
      end_time: '07:00',
    },
  },
  loading: false,
  error: null,
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'FETCH_NOTIFICATIONS_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_NOTIFICATIONS_SUCCESS':
      return {
        ...state,
        loading: false,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length,
      };
    case 'FETCH_NOTIFICATIONS_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + (action.payload.read ? 0 : 1),
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      };
    case 'DELETE_NOTIFICATION':
      const notificationToDelete = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: notificationToDelete?.read ? state.unreadCount : Math.max(0, state.unreadCount - 1),
      };
    case 'CLEAR_ALL_NOTIFICATIONS':
      return { ...state, notifications: [], unreadCount: 0 };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };
    default:
      return state;
  }
};

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  // Keep token for future use if needed
  const [_expoPushToken, setExpoPushToken] = useState<string>('');

  const markAsRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
    const updatedNotifications = state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updatedNotifications);
  }, [state.notifications]);

  const registerForPushNotifications = useCallback(async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Replace with your project ID
    })).data;
    setExpoPushToken(token);
    
    // Send token to your backend
    await sendPushTokenToBackend(token);
  }, []);

  const sendPushTokenToBackend = async (token: string) => {
    // Implement API call to save push token
    console.log('Push token:', token);
  };

  const loadPreferences = async () => {
    try {
      const savedPrefs = await AsyncStorage.getItem('notification_preferences');
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        dispatch({ type: 'UPDATE_PREFERENCES', payload: prefs });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadNotifications = async () => {
    dispatch({ type: 'FETCH_NOTIFICATIONS_REQUEST' });
    try {
      const savedNotifications = await AsyncStorage.getItem('notifications');
      if (savedNotifications) {
        const notifications = JSON.parse(savedNotifications);
        dispatch({ type: 'FETCH_NOTIFICATIONS_SUCCESS', payload: notifications });
      } else {
        // Load mock data for development
        const mockNotifications: Notification[] = [
          {
            id: '1',
            type: 'assignment',
            title: 'تکلیف جدید',
            message: 'تمرین ریاضی فصل ۲ اضافه شد',
            read: false,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            deep_link: '/assignment/1',
          },
          {
            id: '2',
            type: 'exam',
            title: 'آزمون پیش رو',
            message: 'آزمون علوم در تاریخ ۱۴۰۳/۱۰/۱۵ برگزار می‌شود',
            read: true,
            created_at: new Date(Date.now() - 86400000).toISOString(),
            deep_link: '/exam/1',
          },
          {
            id: '3',
            type: 'announcement',
            title: 'اطلاعیه سیستم',
            message: 'سامانه در تاریخ ۱۴۰۳/۱۰/۱۲ از ساعت ۲ تا ۴ صبح در دسترس نخواهد بود',
            read: false,
            created_at: new Date(Date.now() - 172800000).toISOString(),
          },
        ];
        dispatch({ type: 'FETCH_NOTIFICATIONS_SUCCESS', payload: mockNotifications });
        await AsyncStorage.setItem('notifications', JSON.stringify(mockNotifications));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'خطا در بارگذاری اعلانات';
      dispatch({ type: 'FETCH_NOTIFICATIONS_FAILURE', payload: errorMessage });
    }
  };

  const saveNotifications = async (notifications: Notification[]) => {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const savePreferences = async (preferences: NotificationPreferences) => {
    try {
      await AsyncStorage.setItem('notification_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  useEffect(() => {
    registerForPushNotifications();
    loadPreferences();
    loadNotifications();
    
    // Listen for incoming notifications while app is foregrounded
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const newNotification: Notification = {
        id: notification.request.identifier,
        type: notification.request.content.data?.type as Notification['type'] || 'system',
        title: notification.request.content.title || '',
        message: notification.request.content.body || '',
        data: notification.request.content.data,
        read: false,
        created_at: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    });

    // Handle notification response (user taps on notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const notificationId = response.notification.request.identifier;
      markAsRead(notificationId);
      
      // Handle deep linking
      const deepLink = response.notification.request.content.data?.deep_link;
      if (deepLink) {
        console.log('Deep link:', deepLink);
        // Handle navigation to deep link
      }
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, [registerForPushNotifications, markAsRead]);

  const requestPermissions = async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  };

  const scheduleNotification = async (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
    if (!state.preferences.push_notifications) return;

    // Check quiet hours
    if (state.preferences.quiet_hours?.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [startHour, startMinute] = state.preferences.quiet_hours.start_time.split(':').map(Number);
      const [endHour, endMinute] = state.preferences.quiet_hours.end_time.split(':').map(Number);
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      
      if (currentTime >= startTime || currentTime < endTime) {
        console.log('Quiet hours - notification suppressed');
        return;
      }
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.message,
        data: { ...notification.data, deep_link: notification.deep_link },
        sound: true,
        badge: 1,
      },
      trigger: null, // Send immediately
    });

    const newNotification: Notification = {
      ...notification,
      id: identifier,
      read: false,
      created_at: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    await saveNotifications([newNotification, ...state.notifications]);
  };

  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
    const updatedNotifications = state.notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updatedNotifications);
  };

  const deleteNotification = (id: string) => {
    dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
    const updatedNotifications = state.notifications.filter(n => n.id !== id);
    saveNotifications(updatedNotifications);
  };

  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
    saveNotifications([]);
  };

  const updatePreferences = (preferences: Partial<NotificationPreferences>) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences });
    const newPrefs = { ...state.preferences, ...preferences };
    savePreferences(newPrefs);
  };

  const fetchNotifications = async () => {
    await loadNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        ...state,
        requestPermissions,
        scheduleNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        updatePreferences,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};