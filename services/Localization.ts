// services/Localization.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

export type Language = 'fa' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface Translation {
  [key: string]: string;
}

class LocalizationService {
  private currentLanguage: Language = 'fa';
  private translations: Map<Language, Translation> = new Map();
  private listeners: ((lang: Language) => void)[] = [];

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.loadTranslations();
    await this.loadSavedLanguage();
  }

  private async loadTranslations(): Promise<void> {
    // Load Farsi translations
    this.translations.set('fa', {
      // Common
      'app.name': 'آموزش فارسی',
      'common.loading': 'در حال بارگذاری...',
      'common.error': 'خطا',
      'common.success': 'موفقیت',
      'common.cancel': 'لغو',
      'common.save': 'ذخیره',
      'common.delete': 'حذف',
      'common.edit': 'ویرایش',
      'common.confirm': 'تأیید',
      
      // Navigation
      'navigation.home': 'خانه',
      'navigation.courses': 'دوره‌ها',
      'navigation.profile': 'پروفایل',
      'navigation.assignments': 'تکالیف',
      'navigation.exams': 'آزمون‌ها',
      
      // Auth
      'auth.login': 'ورود',
      'auth.register': 'ثبت‌نام',
      'auth.logout': 'خروج',
      'auth.email': 'ایمیل',
      'auth.password': 'رمز عبور',
      'auth.forgot_password': 'فراموشی رمز عبور',
      
      // Courses
      'courses.all': 'همه دوره‌ها',
      'courses.my_courses': 'دوره‌های من',
      'courses.enroll': 'ثبت‌نام',
      'courses.progress': 'پیشرفت',
      'courses.completed': 'تکمیل شده',
      'courses.in_progress': 'در حال یادگیری',
      
      // Assignments
      'assignments.pending': 'در انتظار',
      'assignments.submitted': 'تحویل داده‌شده',
      'assignments.graded': 'نمره‌دار',
      'assignments.late': 'تأخیر',
      'assignments.missing': 'غایب',
      
      // Profile
      'profile.settings': 'تنظیمات',
      'profile.certificates': 'گواهینامه‌ها',
      'profile.achievements': 'دستاوردها',
      'profile.statistics': 'آمار',
      
      // Errors
      'error.network': 'خطای شبکه',
      'error.server': 'خطای سرور',
      'error.offline': 'عدم اتصال به اینترنت',
      'error.retry': 'تلاش مجدد',
    });

    // Load English translations
    this.translations.set('en', {
      // Common
      'app.name': 'Farsi Learning',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.confirm': 'Confirm',
      
      // Navigation
      'navigation.home': 'Home',
      'navigation.courses': 'Courses',
      'navigation.profile': 'Profile',
      'navigation.assignments': 'Assignments',
      'navigation.exams': 'Exams',
      
      // Auth
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.logout': 'Logout',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.forgot_password': 'Forgot Password',
      
      // Courses
      'courses.all': 'All Courses',
      'courses.my_courses': 'My Courses',
      'courses.enroll': 'Enroll',
      'courses.progress': 'Progress',
      'courses.completed': 'Completed',
      'courses.in_progress': 'In Progress',
      
      // Assignments
      'assignments.pending': 'Pending',
      'assignments.submitted': 'Submitted',
      'assignments.graded': 'Graded',
      'assignments.late': 'Late',
      'assignments.missing': 'Missing',
      
      // Profile
      'profile.settings': 'Settings',
      'profile.certificates': 'Certificates',
      'profile.achievements': 'Achievements',
      'profile.statistics': 'Statistics',
      
      // Errors
      'error.network': 'Network Error',
      'error.server': 'Server Error',
      'error.offline': 'No Internet Connection',
      'error.retry': 'Retry',
    });
  }

  private async loadSavedLanguage(): Promise<void> {
    try {
      const savedLang = await AsyncStorage.getItem('app_language');
      if (savedLang && (savedLang === 'fa' || savedLang === 'en')) {
        await this.setLanguage(savedLang as Language, false);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  }

  async setLanguage(language: Language, save: boolean = true): Promise<void> {
    this.currentLanguage = language;
    
    // Update RTL/LTR
    const isRTL = language === 'fa';
    I18nManager.forceRTL(isRTL);
    
    // Save to storage
    if (save) {
      try {
        await AsyncStorage.setItem('app_language', language);
      } catch (error) {
        console.error('Error saving language:', error);
      }
    }
    
    // Notify listeners
    this.notifyListeners();
  }

  getLanguage(): Language {
    return this.currentLanguage;
  }

  getDirection(): Direction {
    return this.currentLanguage === 'fa' ? 'rtl' : 'ltr';
  }

  translate(key: string, params?: Record<string, string>): string {
    const translation = this.translations.get(this.currentLanguage)?.[key] || key;
    
    if (params) {
      return Object.entries(params).reduce(
        (text, [param, value]) => text.replace(`{{${param}}}`, value),
        translation
      );
    }
    
    return translation;
  }

  addListener(listener: (lang: Language) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }

  // Format numbers based on language
  formatNumber(num: number): string {
    if (this.currentLanguage === 'fa') {
      const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      return num.toString().replace(/\d/g, digit => persianDigits[parseInt(digit)]);
    }
    return num.toString();
  }

  // Format dates based on language
  formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: format === 'long' ? 'long' : 'short',
      day: 'numeric',
    };

    if (this.currentLanguage === 'fa') {
      // Use Persian calendar for Farsi
      return new Intl.DateTimeFormat('fa-IR', options).format(date);
    } else {
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
  }
}

export const localization = new LocalizationService();