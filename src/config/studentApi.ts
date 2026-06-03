import { apiRequest } from './api';

export interface StudentDetail {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  profile_image?: string;
  birth_date?: string;
  address?: string;
  grade?: string;
  
  // Parent info
  parent?: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
  };
  
  // Teacher info
  teacher?: {
    id: number;
    fullName: string;
    email: string;
  };
  
  // Courses the student is enrolled in
  courses: Array<{
    id: number;
    name: string;
    teacher: string;
    grade?: string;
    progress: number;
    classId: number;
  }>;
  
  // Attendance records
  attendance: Array<{
    id: number;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  }>;
  
  // Performance stats
  performance: {
    assignments_completed: number;
    assignments_total: number;
    average_grade: string;
    attendance_rate: number;
    last_active: string;
  };
  
  // Class info
  class?: {
    id: number;
    name: string;
    section?: string;
    academicYearId: number;
  };
  
  enrollment_date: string;
  notes?: string;
}

export const studentApi = {
  // Get student details by ID
  getStudentById: async (studentId: number): Promise<{ success: boolean; data: StudentDetail }> => {
    return apiRequest(`/students/${studentId}`);
  },
  
  // Update student details
  updateStudent: async (studentId: number, data: Partial<StudentDetail>) => {
    return apiRequest(`/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Mark attendance
  markAttendance: async (studentId: number, data: { date: string; status: string }) => {
    return apiRequest('/attendance', {
      method: 'POST',
      body: JSON.stringify({
        studentId,
        ...data,
      }),
    });
  },
  
  // Update course grade
  updateGrade: async (studentId: number, courseId: number, grade: string) => {
    return apiRequest('/grades', {
      method: 'POST',
      body: JSON.stringify({
        studentId,
        courseId,
        grade,
      }),
    });
  },
};