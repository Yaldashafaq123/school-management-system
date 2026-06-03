// contexts/TeacherContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from 'react-native';

interface TeacherContextType {
  isLoading: boolean;
  teacherStats: any;
  refreshTeacherData: () => Promise<void>;
  createCourse: (courseData: any) => Promise<any>;
  createAssignment: (assignmentData: any) => Promise<any>;
  gradeAssignment: (submissionId: number, grade: number, feedback: string) => Promise<any>;
  getTeacherCourses: () => Promise<any[]>;
  getTeacherStudents: () => Promise<any[]>;
}

const TeacherContext = createContext<TeacherContextType | undefined>(undefined);

export const TeacherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [teacherStats, setTeacherStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingAssignments: 0,
    revenue: 0,
  });

  const refreshTeacherData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - Replace with actual API calls
      const mockStats = {
        totalCourses: 8,
        totalStudents: 245,
        pendingAssignments: 12,
        revenue: 12500000,
      };
      
      setTeacherStats(mockStats);
    } catch (error) {
      Alert.alert('خطا', 'بارگذاری اطلاعات ناموفق بود');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCourse = async (courseData: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response
      return {
        success: true,
        courseId: Date.now(),
        message: 'دوره با موفقیت ایجاد شد',
      };
    } catch (error) {
      Alert.alert('خطا', 'ایجاد دوره ناموفق بود');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createAssignment = async (assignmentData: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response
      return {
        success: true,
        assignmentId: Date.now(),
        message: 'تکلیف با موفقیت ایجاد شد',
      };
    } catch (error) {
      Alert.alert('خطا', 'ایجاد تکلیف ناموفق بود');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const gradeAssignment = async (submissionId: number, grade: number, feedback: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response
      return {
        success: true,
        message: 'نمره با موفقیت ثبت شد',
      };
    } catch (error) {
      Alert.alert('خطا', 'ثبت نمره ناموفق بود');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getTeacherCourses = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock data
    return [
      {
        id: 1,
        title: 'ریاضی پایه هفتم',
        studentCount: 45,
        assignmentCount: 8,
        progress: 85,
      },
      // ... more courses
    ];
  };

  const getTeacherStudents = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock data
    return [
      {
        id: 1,
        name: 'علی رضایی',
        course: 'ریاضی هفتم',
        progress: 75,
        lastActivity: 'دیروز',
      },
      // ... more students
    ];
  };

  return (
    <TeacherContext.Provider
      value={{
        isLoading,
        teacherStats,
        refreshTeacherData,
        createCourse,
        createAssignment,
        gradeAssignment,
        getTeacherCourses,
        getTeacherStudents,
      }}
    >
      {children}
    </TeacherContext.Provider>
  );
};

export const useTeacher = () => {
  const context = useContext(TeacherContext);
  if (context === undefined) {
    throw new Error('useTeacher must be used within a TeacherProvider');
  }
  return context;
};