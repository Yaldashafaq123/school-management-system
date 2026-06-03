import { apiRequest } from "./api";

// ============ Dashboard Types ============
export interface StudentStats {
  total_courses: number;
  enrolled_courses: number;
  completed_courses: number;
  total_hours: number;
  certificates: number;
  assignments_pending: number;
  exams_upcoming: number;
  average_score: number;
  streak_days: number;
}

export interface UpcomingExam {
  id: number;
  title: string;
  course_name: string;
  date: string;
  time: string;
  duration: number;
  is_tomorrow: boolean;
}

export interface RecentActivity {
  id: number;
  type: "assignment" | "exam" | "course" | "certificate" | "announcement";
  title: string;
  description: string;
  time: string;
  course_name?: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  teacher_id: number;
  teacher_name: string;
  class_id: number | null;
  subject_id: number | null;
  is_general: boolean;
  progress: number;
  enrolled: boolean;
  next_lesson?: string;
  time_remaining?: string;
  grade?: string;

  slug?: string;
  instructor?: string;
  revenue?: number;
  rating?: number;
  is_active?: boolean;
  created_at?: string;
  assignments_count?: number;
  exams_count?: number;
  objectives?: any[];
  requirements?: any[];
}

export interface ContinueLearningItem extends Course {
  next_lesson: string;
  time_remaining: string;
}

export interface DashboardData {
  stats: StudentStats;
  recentActivities: RecentActivity[];
  upcomingExams: UpcomingExam[];
  myCourses: Course[];
  continueLearning: ContinueLearningItem[];
}

// ============ Student Detail Types ============
export interface StudentDetail {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  profile_image?: string;
  birth_date?: string;
  address?: string;
  grade?: string;

  parent?: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
  };

  teacher?: {
    id: number;
    fullName: string;
    email: string;
  };

  courses: {
    id: number;
    name: string;
    teacher: string;
    grade?: string;
    progress: number;
    classId: number;
    thumbnail_url?: string;
    description?: string;
  }[];

  attendance: {
    id: number;
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  }[];

  performance: {
    assignments_completed: number;
    assignments_total: number;
    average_grade: string;
    attendance_rate: number;
    last_active: string;
    total_points?: number;
    rank?: number;
  };

  class?: {
    id: number;
    name: string;
    section?: string;
    academicYearId: number;
    academicYear?: {
      id: number;
      name: string;
      isActive: boolean;
    };
  };

  enrollment_date: string;
  notes?: string;
}

// ============ Lesson Types ============
export interface LessonResource {
  id: number;
  title: string;
  type: "pdf" | "image" | "link";
  url: string;
}

export interface Note {
  id: number;
  content: string;
  timestamp: number;
  createdAt: string;
}

export interface LessonDetail {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  courseId: number;
  courseTitle: string;
  resources: LessonResource[];
  notes: Note[];
  nextLesson?: {
    id: number;
    title: string;
  };
  prevLesson?: {
    id: number;
    title: string;
  };
}

// ============ Calendar Types ============
export interface CalendarEvent {
  id: number;
  title: string;
  type: "exam" | "assignment" | "class" | "event";
  date: string;
  time?: string;
  course_name?: string;
  color?: string;
}

// ============ Assignment Types ============
export interface Assignment {
  id: number;
  course_id: number;
  course_name: string;
  title: string;
  description: string;
  instructions: string;
  due_date: string;
  max_score: number;
  created_at: string;
  updated_at: string;
  attachments: any[];
  teacher_name: string;
  submission?: {
    id: number;
    assignment_id: number;
    student_id: number;
    submitted_at: string;
    grade?: number;
    feedback?: string;
    graded_at?: string;
    graded_by?: number;
    grader_name?: string;
    attachments: any[];
    content?: string;
  };
  status: "pending" | "submitted" | "graded" | "late";
}

export interface AssignmentStats {
  total: number;
  pending: number;
  submitted: number;
  graded: number;
  late: number;
}

// ============ Course Detail Types ============
export interface CourseDetail {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  teacher_id: number;
  teacher_name: string;
  teacher_image?: string;
  teacher_bio?: string;
  class_id: number | null;
  class_name?: string;
  subject_id: number | null;
  is_general: boolean;
  progress: number;
  enrolled: boolean;
  duration: number;
  created_at: string;
  objectives: any[];
  requirements: any[];
  student_count: number;
  rating: number;
  related_courses: RelatedCourse[];
}

export interface RelatedCourse {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  teacher_name: string;
  student_count: number;
  duration: number;
}

// ============ Library Types ============
export interface LibraryCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface LibraryBook {
  id: number;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  category: string;
  categoryId: number;
  subject?: string;
  grade?: number;
  pages?: number;
  fileSize?: string;
  fileFormat?: string;
  fileUrl?: string;
  isFavorite: boolean;
  lastRead?: {
    page: number;
    date: string;
  };
  readingProgress?: number;
}

// ============ API Methods ============
export const studentApi = {
  // ===== Dashboard Methods =====
  getDashboard: async (): Promise<{
    success: boolean;
    data: DashboardData;
  }> => {
    try {
      const response = await apiRequest("/student/dashboard", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching student dashboard:", error);
      throw error;
    }
  },

  getMyCourses: async (): Promise<{ success: boolean; data: Course[] }> => {
    try {
      const response = await apiRequest("/student/courses", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching student courses:", error);
      throw error;
    }
  },

  getUpcomingExams: async (): Promise<{
    success: boolean;
    data: UpcomingExam[];
  }> => {
    try {
      const response = await apiRequest("/student/exams/upcoming", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching upcoming exams:", error);
      throw error;
    }
  },

  getRecentActivities: async (): Promise<{
    success: boolean;
    data: RecentActivity[];
  }> => {
    try {
      const response = await apiRequest("/student/activities/recent", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      throw error;
    }
  },

  getContinueLearning: async (): Promise<{
    success: boolean;
    data: ContinueLearningItem[];
  }> => {
    try {
      const response = await apiRequest("/student/courses/continue", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching continue learning:", error);
      throw error;
    }
  },

  getStats: async (): Promise<{ success: boolean; data: StudentStats }> => {
    try {
      const response = await apiRequest("/student/stats", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching student stats:", error);
      throw error;
    }
  },

  // ===== Lesson Methods =====
  getLessonDetail: async (
    lessonId: number,
  ): Promise<{ success: boolean; data?: LessonDetail }> => {
    try {
      const response = await apiRequest(`/student/lessons/${lessonId}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching lesson detail:", error);
      return { success: false };
    }
  },

  completeLesson: async (lessonId: number): Promise<{ success: boolean }> => {
    try {
      const response = await apiRequest(
        `/student/lessons/${lessonId}/complete`,
        {
          method: "POST",
        },
      );
      return response;
    } catch (error) {
      console.error("Error completing lesson:", error);
      return { success: false };
    }
  },

  saveLessonNote: async (
    lessonId: number,
    data: { content: string; timestamp: number },
  ): Promise<{ success: boolean }> => {
    try {
      const response = await apiRequest(`/student/lessons/${lessonId}/notes`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error("Error saving lesson note:", error);
      return { success: false };
    }
  },

  // ===== Calendar Methods =====
  getCalendarEvents: async (
    year: number,
    month: number,
  ): Promise<{ success: boolean; data?: CalendarEvent[] }> => {
    try {
      const response = await apiRequest(
        `/student/calendar?year=${year}&month=${month}`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      return { success: false };
    }
  },

  // ===== Assignment Methods =====
  getAssignments: async (): Promise<{
    success: boolean;
    data?: Assignment[];
  }> => {
    try {
      const response = await apiRequest("/student/assignments", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching assignments:", error);
      return { success: false };
    }
  },

  getAssignmentStats: async (): Promise<{
    success: boolean;
    data?: AssignmentStats;
  }> => {
    try {
      const response = await apiRequest("/student/assignments/stats", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching assignment stats:", error);
      return { success: false };
    }
  },

  getAssignmentsByStatus: async (
    status: string,
  ): Promise<{ success: boolean; data?: Assignment[] }> => {
    try {
      const response = await apiRequest(
        `/student/assignments/status/${status}`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching assignments by status:", error);
      return { success: false };
    }
  },

  getAssignmentDetail: async (
    assignmentId: number,
  ): Promise<{ success: boolean; data?: Assignment }> => {
    try {
      const response = await apiRequest(
        `/student/assignments/${assignmentId}`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching assignment detail:", error);
      return { success: false };
    }
  },

  submitAssignment: async (
    assignmentId: number,
    data: { content?: string; attachments?: any[] },
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiRequest(
        `/student/assignments/${assignmentId}/submit`,
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
      return response;
    } catch (error) {
      console.error("Error submitting assignment:", error);
      return { success: false };
    }
  },

  // ===== Course Methods =====
  getStudentCourses: async (params?: {
    page?: number;
    limit?: number;
    class_id?: number;
    subject_id?: number;
    search?: string;
  }): Promise<{
    success: boolean;
    data?: {
      items: Course[];
      total: number;
      page: number;
      totalPages: number;
      hasMore: boolean;
    };
  }> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.class_id)
        queryParams.append("class_id", params.class_id.toString());
      if (params?.subject_id)
        queryParams.append("subject_id", params.subject_id.toString());
      if (params?.search) queryParams.append("search", params.search);

      const response = await apiRequest(
        `/student/courses?${queryParams.toString()}`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching student courses:", error);
      return { success: false };
    }
  },

  getCourseDetail: async (
    courseId: number,
  ): Promise<{ success: boolean; data?: CourseDetail }> => {
    try {
      const response = await apiRequest(`/student/courses/${courseId}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching course detail:", error);
      return { success: false };
    }
  },

  getEnrolledCourses: async (): Promise<{
    success: boolean;
    data?: Course[];
  }> => {
    try {
      const response = await apiRequest("/student/courses/enrolled", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
      return { success: false };
    }
  },

  getCourseStats: async (): Promise<{
    success: boolean;
    data?: {
      total: number;
      enrolled: number;
      completed: number;
      in_progress: number;
    };
  }> => {
    try {
      const response = await apiRequest("/student/courses/stats", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching course stats:", error);
      return { success: false };
    }
  },

  searchCourses: async (
    query: string,
  ): Promise<{ success: boolean; data?: Course[] }> => {
    try {
      const response = await apiRequest(
        `/student/courses/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error searching courses:", error);
      return { success: false };
    }
  },

  getClasses: async (): Promise<{
    success: boolean;
    data?: {
      id: number;
      class_name: string;
      description?: string;
      student_count?: number;
      course_count?: number;
    }[];
  }> => {
    try {
      const response = await apiRequest("/student/courses/classes", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching classes:", error);
      return { success: false };
    }
  },

  getSubjects: async (): Promise<{
    success: boolean;
    data?: {
      id: number;
      subject_name: string;
      classes?: { id: number; name: string }[];
    }[];
  }> => {
    try {
      const response = await apiRequest("/student/courses/subjects", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return { success: false };
    }
  },

  getSubjectsByClass: async (
    classId: number,
  ): Promise<{
    success: boolean;
    data?: { id: number; subject_name: string }[];
  }> => {
    try {
      const response = await apiRequest(
        `/student/courses/subjects/class/${classId}`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching subjects by class:", error);
      return { success: false };
    }
  },

  enrollCourse: async (
    courseId: number,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiRequest(`/student/courses/${courseId}/enroll`, {
        method: "POST",
      });
      return response;
    } catch (error) {
      console.error("Error enrolling in course:", error);
      return { success: false };
    }
  },

  // ===== Library Methods =====
  getLibrary: async (): Promise<{
    success: boolean;
    data?: {
      categories: LibraryCategory[];
      books: LibraryBook[];
      recentReads: LibraryBook[];
      favorites: LibraryBook[];
      grades: number[];
    };
  }> => {
    try {
      const response = await apiRequest("/student/library", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching library:", error);
      return { success: false };
    }
  },

  getBooksByCategory: async (
    categoryId: number,
  ): Promise<{ success: boolean; data?: LibraryBook[] }> => {
    try {
      const response = await apiRequest(
        `/student/library/category/${categoryId}`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching books by category:", error);
      return { success: false };
    }
  },

  searchBooks: async (
    query: string,
  ): Promise<{ success: boolean; data?: LibraryBook[] }> => {
    try {
      const response = await apiRequest(
        `/student/library/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error searching books:", error);
      return { success: false };
    }
  },

  getBooksByGrade: async (
    grade: number,
  ): Promise<{ success: boolean; data?: LibraryBook[] }> => {
    try {
      const response = await apiRequest(`/student/library/grade/${grade}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching books by grade:", error);
      return { success: false };
    }
  },

  toggleFavorite: async (
    bookId: number,
  ): Promise<{ success: boolean; isFavorite?: boolean }> => {
    try {
      const response = await apiRequest(`/student/library/favorite/${bookId}`, {
        method: "POST",
      });
      return response;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      return { success: false };
    }
  },

  updateReadingProgress: async (
    bookId: number,
    page: number,
  ): Promise<{ success: boolean }> => {
    try {
      const response = await apiRequest(`/student/library/read/${bookId}`, {
        method: "POST",
        body: JSON.stringify({ page }),
      });
      return response;
    } catch (error) {
      console.error("Error updating reading progress:", error);
      return { success: false };
    }
  },

  getFavorites: async (): Promise<{
    success: boolean;
    data?: LibraryBook[];
  }> => {
    try {
      const response = await apiRequest("/student/library/favorites", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching favorites:", error);
      return { success: false };
    }
  },

  getRecentReads: async (): Promise<{
    success: boolean;
    data?: LibraryBook[];
  }> => {
    try {
      const response = await apiRequest("/student/library/recent", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching recent reads:", error);
      return { success: false };
    }
  },

  // ===== Timetable Methods =====
  getWeeklyTimetable: async (): Promise<{ success: boolean; data?: any }> => {
    try {
      const response = await apiRequest("/student/timetable/weekly", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching weekly timetable:", error);
      return { success: false };
    }
  },

  getDayTimetable: async (
    day: number,
  ): Promise<{ success: boolean; data?: any }> => {
    try {
      const response = await apiRequest(`/student/timetable/day/${day}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching day timetable:", error);
      return { success: false };
    }
  },

  getCurrentWeek: async (): Promise<{ success: boolean; data?: any }> => {
    try {
      const response = await apiRequest("/student/timetable/current", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching current week:", error);
      return { success: false };
    }
  },

  // ===== Attendance Methods =====
  getAttendanceOverview: async (): Promise<{
    success: boolean;
    data?: any;
  }> => {
    try {
      const response = await apiRequest("/student/attendance/overview", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching attendance overview:", error);
      return { success: false };
    }
  },

  getDailyAttendance: async (
    month?: number,
    year?: number,
  ): Promise<{ success: boolean; data?: any }> => {
    try {
      let url = "/student/attendance/daily";
      if (month && year) {
        url += `?month=${month}&year=${year}`;
      }
      const response = await apiRequest(url, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching daily attendance:", error);
      return { success: false };
    }
  },

  getMonthlySummaries: async (): Promise<{ success: boolean; data?: any }> => {
    try {
      const response = await apiRequest("/student/attendance/monthly", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching monthly summaries:", error);
      return { success: false };
    }
  },

  getAttendanceAnalytics: async (): Promise<{
    success: boolean;
    data?: any;
  }> => {
    try {
      const response = await apiRequest("/student/attendance/analytics", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching attendance analytics:", error);
      return { success: false };
    }
  },

  getAttendanceByDate: async (
    date: string,
  ): Promise<{ success: boolean; data?: any }> => {
    try {
      const response = await apiRequest(`/student/attendance/date/${date}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching attendance by date:", error);
      return { success: false };
    }
  },

  // ===== Grades Methods =====
  getGrades: async (): Promise<{ success: boolean; data?: any }> => {
    try {
      const response = await apiRequest("/student/grades", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching grades:", error);
      return { success: false };
    }
  },

  getTerms: async (): Promise<{ success: boolean; data?: any }> => {
    try {
      const response = await apiRequest("/student/grades/terms", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching terms:", error);
      return { success: false };
    }
  },

  getTermGrades: async (
    termId: number,
  ): Promise<{ success: boolean; data?: any }> => {
    try {
      const response = await apiRequest(`/student/grades/term/${termId}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching term grades:", error);
      return { success: false };
    }
  },

  getCurrentTermGrades: async (): Promise<{ success: boolean; data?: any }> => {
    try {
      const response = await apiRequest("/student/grades/current", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching current term grades:", error);
      return { success: false };
    }
  },

  // ===== Profile Methods =====
  getProfile: async (): Promise<{ success: boolean; data?: any }> => {
    try {
      const response = await apiRequest("/student/profile", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return { success: false };
    }
  },

  updateProfile: async (
    data: any,
  ): Promise<{ success: boolean; message?: string; data?: any }> => {
    try {
      const response = await apiRequest("/student/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false };
    }
  },

  uploadProfileImage: async (
    formData: FormData,
  ): Promise<{ success: boolean; image?: string }> => {
    try {
      const response = await apiRequest("/student/profile/image", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      return { success: false };
    }
  },

  updateNotifications: async (
    settings: any,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await apiRequest("/student/notifications", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      return response;
    } catch (error) {
      console.error("Error updating notifications:", error);
      return { success: false };
    }
  },

  // ===== Student Management Methods (UPDATED to use teacher routes) =====
  getStudentById: async (
    studentId: number,
  ): Promise<{ success: boolean; data: StudentDetail }> => {
    try {
      // Use teacher route since teachers access student data
      const response = await apiRequest(`/teacher/students/${studentId}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching student details:", error);
      throw error;
    }
  },

  updateStudent: async (
    studentId: number,
    data: Partial<StudentDetail>,
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      const response = await apiRequest(`/teacher/students/${studentId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error("Error updating student:", error);
      throw error;
    }
  },

  markAttendance: async (
    studentId: number,
    data: { date: string; status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" },
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest("/teacher/attendance", {
        method: "POST",
        body: JSON.stringify({
          studentId,
          ...data,
        }),
      });
      return response;
    } catch (error) {
      console.error("Error marking attendance:", error);
      throw error;
    }
  },

  updateGrade: async (
    studentId: number,
    courseId: number,
    grade: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiRequest("/teacher/grades", {
        method: "POST",
        body: JSON.stringify({
          studentId,
          courseId,
          grade,
        }),
      });
      return response;
    } catch (error) {
      console.error("Error updating grade:", error);
      throw error;
    }
  },

  getStudentFullDetails: async (
    studentId: number,
  ): Promise<{ success: boolean; data: StudentDetail }> => {
    try {
      const response = await apiRequest(
        `/teacher/students/${studentId}/full-details`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching full student details:", error);
      throw error;
    }
  },

  getStudentPerformance: async (
    studentId: number,
  ): Promise<{ success: boolean; data: StudentDetail["performance"] }> => {
    try {
      const response = await apiRequest(
        `/teacher/students/${studentId}/performance`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching student performance:", error);
      throw error;
    }
  },

  getStudentAttendance: async (
    studentId: number,
    days: number = 30,
  ): Promise<{ success: boolean; data: StudentDetail["attendance"] }> => {
    try {
      const response = await apiRequest(
        `/teacher/students/${studentId}/attendance?days=${days}`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      throw error;
    }
  },

  getStudentCoursesWithGrades: async (
    studentId: number,
  ): Promise<{ success: boolean; data: StudentDetail["courses"] }> => {
    try {
      const response = await apiRequest(
        `/teacher/students/${studentId}/courses-with-grades`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching student courses with grades:", error);
      throw error;
    }
  },

  getStudentClass: async (
    studentId: number,
  ): Promise<{ success: boolean; data: StudentDetail["class"] }> => {
    try {
      const response = await apiRequest(
        `/teacher/students/${studentId}/class`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching student class:", error);
      throw error;
    }
  },

  getStudentParent: async (
    studentId: number,
  ): Promise<{ success: boolean; data: StudentDetail["parent"] }> => {
    try {
      const response = await apiRequest(
        `/teacher/students/${studentId}/parent`,
        {
          method: "GET",
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching student parent:", error);
      throw error;
    }
  },
};

// ============ Type Guards ============
export function isStudentDetail(obj: any): obj is StudentDetail {
  return (
    obj &&
    typeof obj === "object" &&
    "id" in obj &&
    "fullName" in obj &&
    "email" in obj
  );
}

export function isDashboardData(obj: any): obj is DashboardData {
  return (
    obj &&
    typeof obj === "object" &&
    "stats" in obj &&
    "myCourses" in obj &&
    "recentActivities" in obj
  );
}

export function isCourse(obj: any): obj is Course {
  return (
    obj &&
    typeof obj === "object" &&
    "id" in obj &&
    "title" in obj &&
    "progress" in obj
  );
}

// ============ Default Values ============
export const defaultStudentStats: StudentStats = {
  total_courses: 0,
  enrolled_courses: 0,
  completed_courses: 0,
  total_hours: 0,
  certificates: 0,
  assignments_pending: 0,
  exams_upcoming: 0,
  average_score: 0,
  streak_days: 0,
};

export const defaultDashboardData: DashboardData = {
  stats: defaultStudentStats,
  recentActivities: [],
  upcomingExams: [],
  myCourses: [],
  continueLearning: [],
};
