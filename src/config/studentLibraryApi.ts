// src/config/studentLibraryApi.ts
import { apiRequest } from './api';

export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  category: string;
  categoryId: number;
  subject: string;
  grade: number;
  pages: number;
  fileSize: string;
  fileFormat: string;
  fileUrl: string;
  isFavorite: boolean;
  lastRead?: {
    page: number;
    date: string;
  };
  readingProgress?: number;
}

export interface BookCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface LibraryData {
  categories: BookCategory[];
  books: Book[];
  recentReads: Book[];
  favorites: Book[];
  grades: number[];
}

export const studentLibraryApi = {
  // Get all library data
  getLibrary: async (): Promise<{ success: boolean; data: LibraryData }> => {
    try {
      const response = await apiRequest('/student/library', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching library:', error);
      throw error;
    }
  },

  // Get books by category
  getBooksByCategory: async (categoryId: number): Promise<{ success: boolean; data: Book[] }> => {
    try {
      const response = await apiRequest(`/student/library/category/${categoryId}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching books by category:', error);
      throw error;
    }
  },

  // Search books
  searchBooks: async (query: string): Promise<{ success: boolean; data: Book[] }> => {
    try {
      const response = await apiRequest(`/student/library/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  },

  // Get books by grade
  getBooksByGrade: async (grade: number): Promise<{ success: boolean; data: Book[] }> => {
    try {
      const response = await apiRequest(`/student/library/grade/${grade}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching books by grade:', error);
      throw error;
    }
  },

  // Toggle favorite
  toggleFavorite: async (bookId: number): Promise<{ success: boolean; isFavorite: boolean }> => {
    try {
      const response = await apiRequest(`/student/library/favorite/${bookId}`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  },

  // Update reading progress
  updateReadingProgress: async (bookId: number, page: number): Promise<{ success: boolean }> => {
    try {
      const response = await apiRequest(`/student/library/read/${bookId}`, {
        method: 'POST',
        body: JSON.stringify({ page }),
      });
      return response;
    } catch (error) {
      console.error('Error updating reading progress:', error);
      throw error;
    }
  },

  // Get favorite books
  getFavorites: async (): Promise<{ success: boolean; data: Book[] }> => {
    try {
      const response = await apiRequest('/student/library/favorites', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  },

  // Get recent reads
  getRecentReads: async (): Promise<{ success: boolean; data: Book[] }> => {
    try {
      const response = await apiRequest('/student/library/recent', {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error fetching recent reads:', error);
      throw error;
    }
  }
};

// Helper function to get category color
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'ریاضی': '#3B82F6',
    'علوم': '#10B981',
    'ادبیات': '#F59E0B',
    'تاریخ': '#8B5CF6',
    'زبان انگلیسی': '#EC4899',
    'کامپیوتر': '#06B6D4',
  };
  return colors[category] || '#3B82F6';
}