// config/app.ts
import { Platform, Dimensions } from 'react-native';

export const AppConfig = {
  // API Configuration
  api: {
    baseUrl: __DEV__ ? 'http://localhost:3000/api' : 'https://api.yourdomain.com/api',
    timeout: 30000,
    retryAttempts: 3,
  },

  // App Configuration
  app: {
    name: 'آموزش فارسی',
    version: '1.0.0',
    buildNumber: '1',
  },

  // Feature Flags
  features: {
    offlineMode: true,
    darkMode: true,
    rtlSupport: true,
    videoDownloads: true,
    pushNotifications: true,
    analytics: !__DEV__, // Disable in development
  },

  // Cache Configuration
  cache: {
    defaultTTL: 3600000, // 1 hour in milliseconds
    maxCacheSize: 50 * 1024 * 1024, // 50MB
    cleanupInterval: 86400000, // 24 hours
  },

  // Upload Configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    maxFiles: 5,
  },

  // Video Configuration
  video: {
    maxQuality: '1080p',
    allowDownloads: true,
    maxDownloadSize: 500 * 1024 * 1024, // 500MB
    backgroundPlayback: true,
  },

  // Analytics Configuration
  analytics: {
    enabled: !__DEV__,
    samplingRate: 1.0,
    logLevel: __DEV__ ? 'debug' : 'error',
  },
};

// Environment detection
export const isProduction = !__DEV__;
export const isDevelopment = __DEV__;
export const isTesting = process.env.NODE_ENV === 'test';

// Platform detection
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

// Screen size categories
const { width } = Dimensions.get('window');
export const isSmallScreen = width < 375;
export const isMediumScreen = width >= 375 && width < 768;
export const isLargeScreen = width >= 768;