export type UserRole = "admin" | "teacher" | "student" | "parent" | "finance";

export interface FinanceStaff {
  id: number;
  position: string;
  department: string;
  isActive: boolean;
  joinDate: string;
  salary?: number;
}
export interface User {
  id: number;
  fullName: string; // Changed from 'fullname' to match backend
  email: string;
  password?: string;
  role: UserRole;
  profile_image?: string;
  class_id?: number;
  phone?: string;
  verified?: boolean;
  createdAt?: string;
    originalRole?: string;  // Original role from backend (ADMIN, FINANCE, etc.)
  userType?: string;      // For routing
  // ✅ Add these role-specific ID fields
  teacherId?: number | null; // For TEACHER role
  studentId?: number | null; // For STUDENT role
  parentId?: number | null; // For PARENT role
  financeId?: number | null; // ✅ NEW
  financeStaff?: FinanceStaff | null; // ✅ NEW
  // Optional fields - defined ONLY ONCE
  stats?: DashboardStats;
  enrolledCourses?: number[];
  courseProgress?: Record<number, number>;
  children?: ParentChild[]; // For parents
  active_child_id?: number; // For parents
  // New: Notification related
  notificationCount?: number;
  lastLogin?: string;
  updatedAt?: string;
}
export interface ParentChild {
  id: number;
  name: string;
  grade: string;
  class_name: string;
  profile_image?: string;
  is_active: boolean;
  teacher_id?: number;
  teacher_name?: string;
  attendance_rate?: number;
  average_grade?: number;
}
export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  teacher_id: number;
  teacher_name?: string;
  class_id: number | null; // Changed to accept null
  subject_id: number | null; // Changed to accept null
  is_general: boolean;
  progress?: number;
  enrolled?: boolean;
  instructor?: string;
}

export interface Class {
  id: number;
  class_name: string;
  description?: string;
  student_count?: number;
}

export interface Subject {
  id: number;
  subject_name: string;
  class_id?: number;
}

export interface Topic {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  order_no: number;
}

export interface Progress {
  student_id: number;
  course_id: number;
  completed_lessons: number[];
  last_lesson_id?: number;
  progress_percentage: number;
}
// types/index.ts - Add new types
export interface FeaturedCourse {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  teacher_name: string;
  rating: number;
  student_count: number;
  is_free: boolean;
}

export interface ClassCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  course_count: number;
}

export interface ProgressItem {
  course_id: number;
  course_title: string;
  progress_percentage: number;
  next_lesson_title?: string;
  last_accessed?: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  course_name?: string;
}
// types/index.ts - Add new types for courses page
// types/index.ts - Add new types for courses page
export type ViewMode = "grid" | "list";

export interface CourseFilter {
  class_id?: number;
  subject_id?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
  is_free?: boolean;
  has_certificate?: boolean;
  rating_min?: number;
  price_range?: [number, number];
}

export interface SortOption {
  id: string;
  label: string;
  field: string;
  order: "asc" | "desc";
}

export interface FilterOption {
  id: string;
  label: string;
  icon: string;
  type: "class" | "subject" | "difficulty" | "price" | "features";
  value: any;
}

export interface CourseStats {
  total: number;
  enrolled: number;
  completed: number;
  in_progress: number;
}
// types/index.ts - Add authentication types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  class_id?: number;
  phone?: string;
}

export interface UserProfile extends User {
  bio?: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  education?: string;
  website?: string;
  social_links?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface DashboardStats {
  // Common stats
  total_courses?: number;
  enrolled_courses?: number;
  completed_courses?: number;
  total_hours?: number;
  certificates?: number;
  assignments_pending?: number;
  exams_upcoming?: number;

  // Student specific
  class_rank?: number;
  average_grade?: number;

  // Teacher specific
  total_students?: number;
  active_courses?: number;
  pending_grading?: number;

  // Admin specific
  total_users?: number;
  active_users?: number;
  total_revenue?: number;

  // Parent specific stats
  children_count?: number;
  attendance_rate?: number;
  pending_fees?: number;
  unread_messages?: number;
  upcoming_events?: number;
  fee_overdue?: number;
}
// types/index.ts - Add learning interface types
export interface Lesson {
  id: number;
  course_id: number;
  topic_id: number;
  title: string;
  youtube_id: string;
  content: string;
  order_no: number;
  duration: number;
  is_completed: boolean;
  resources?: LessonResource[];
  notes?: Note[];
  created_at: string;
}

export interface LessonResource {
  id: number;
  lesson_id: number;
  title: string;
  type: "pdf" | "image" | "audio" | "link" | "document";
  url: string;
  file_size?: number;
}

export interface Note {
  id: number;
  lesson_id: number;
  user_id: number;
  content: string;
  timestamp: number;
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  lesson_id: number;
  progress_seconds: number;
  total_seconds: number;
  percentage: number;
  last_watched: string;
  is_completed: boolean;
}

export interface Discussion {
  id: number;
  lesson_id: number;
  user_id: number;
  user_name: string;
  user_avatar: string;
  content: string;
  likes: number;
  is_liked: boolean;
  replies: Reply[];
  created_at: string;
}

export interface Reply {
  id: number;
  discussion_id: number;
  user_id: number;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
}

export interface Quiz {
  id: number;
  lesson_id: number;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passing_score: number;
  time_limit: number;
  attempts_allowed: number;
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  question: string;
  type: "multiple_choice" | "true_false" | "short_answer";
  options?: string[];
  correct_answer: string;
  explanation?: string;
}
// types/index.ts - Add assignment types
export interface Assignment {
  id: number;
  course_id: number;
  course_name?: string;
  title: string;
  description: string;
  instructions: string;
  due_date: string;
  max_score: number;
  created_at: string;
  updated_at: string;
  attachments: AssignmentAttachment[];
  submission?: Submission;
  status: "pending" | "submitted" | "graded" | "late" | "missing";
}

export interface AssignmentAttachment {
  id: number;
  assignment_id: number;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  content?: string;
  attachments: SubmissionAttachment[];
  submitted_at: string;
  grade?: number;
  feedback?: string;
  graded_at?: string;
  graded_by?: number;
}

export interface SubmissionAttachment {
  id: number;
  submission_id: number;
  name: string;
  url: string;
  type: string;
  size: number;
  uploaded_at: string;
}

export interface GradingRubric {
  id: number;
  assignment_id: number;
  criteria: GradingCriteria[];
  total_points: number;
}

export interface GradingCriteria {
  id: number;
  rubric_id: number;
  title: string;
  description: string;
  max_score: number;
  score?: number;
  feedback?: string;
}
// Consolidated Exam interface - removed duplicate and fixed conflicts
export interface Exam {
  id: number;
  course_id: number;
  course_name?: string;
  title: string;
  description: string;
  instructions: string; // Made mandatory to match first declaration
  duration: number; // in minutes
  passing_score: number;
  scheduled_at: string;
  max_score: number; // Made mandatory to match first declaration
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  created_at: string; // Made mandatory to match first declaration
  updated_at: string; // Made mandatory to match first declaration
  questions_count?: number;
  attempts_allowed: number; // Made mandatory to match first declaration
  is_active?: boolean;
  is_published?: boolean;
  show_results?: boolean;
  shuffle_questions?: boolean;
  shuffle_options?: boolean;
  start_date?: string;
  end_date?: string;
  questions?: ExamQuestion[];
}

export interface ExamQuestion {
  id: number;
  exam_id: number;
  question: string;
  type: "multiple_choice" | "true_false" | "short_answer" | "essay";
  options?: ExamOption[];
  correct_answer?: string;
  explanation?: string;
  points: number;
  order_no: number;
  image_url?: string;
  is_required: boolean;
}

export interface ExamOption {
  id: number;
  question_id: number;
  text: string;
  is_correct: boolean;
  order_no: number;
}

export interface ExamAttempt {
  id: number;
  exam_id: number;
  student_id: number;
  student_name?: string;
  started_at: string;
  submitted_at?: string;
  time_spent_minutes?: number;
  score?: number;
  is_passed?: boolean;
  status: "in_progress" | "submitted" | "graded" | "expired";
  answers?: ExamAnswer[];
  auto_graded: boolean;
}

export interface ExamAnswer {
  id: number;
  attempt_id: number;
  question_id: number;
  answer_text?: string;
  selected_option_id?: number;
  is_correct?: boolean;
  points_earned?: number;
  teacher_feedback?: string;
}

export interface ExamResult {
  attempt_id: number;
  exam_id: number;
  student_id: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
  score: number;
  max_score: number;
  percentage: number;
  is_passed: boolean;
  time_spent_minutes: number;
  submitted_at: string;
  detailed_results: QuestionResult[];
}

export interface QuestionResult {
  question_id: number;
  question_text: string;
  question_type: string;
  your_answer?: string;
  correct_answer?: string;
  is_correct: boolean;
  points_earned: number;
  max_points: number;
  explanation?: string;
}
// types/index.ts - Add dashboard types
export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalCourses: number;
  activeCourses: number;
  totalEnrollments: number;
  completionRate: number;
  totalRevenue: number;
  avgSessionDuration: number;
}

export interface UserActivity {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  details: string;
  timestamp: string;
  ip_address?: string;
}

export interface SystemLog {
  id: number;
  level: "info" | "warning" | "error";
  message: string;
  source: string;
  timestamp: string;
  details?: string;
}

export interface RevenueData {
  date: string;
  amount: number;
  courses: number;
  subscriptions: number;
}

export interface EnrollmentTrend {
  date: string;
  enrollments: number;
  completions: number;
}

export interface TeacherStats {
  totalStudents: number;
  activeStudents: number;
  totalCourses: number;
  totalRevenue: number;
  avgRating: number;
  pendingGrading: number;
}

export interface StudentPerformance {
  student_id: number;
  student_name: string;
  enrolled_courses: number;
  completed_courses: number;
  avg_grade: number;
  last_active: string;
}

export interface CourseAnalytics {
  course_id: number;
  course_title: string;
  total_students: number;
  completion_rate: number;
  avg_grade: number;
  avg_time_spent: number;
  revenue: number;
}
// types/index.ts - Add exam types

export interface QuestionOption {
  id: number;
  question_id: number;
  text: string;
  is_correct: boolean;
  order_no: number;
}

export interface ExamAnalytics {
  total_students: number;
  total_attempts: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  pass_rate: number;
  question_analysis: QuestionAnalysis[];
}

export interface QuestionAnalysis {
  question_id: number;
  question_text: string;
  total_attempts: number;
  correct_attempts: number;
  success_rate: number;
  common_mistakes: string[];
}

// types/index.ts - Add new types
export interface Notification {
  id: string;
  type: "assignment" | "exam" | "announcement" | "course" | "system";
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
  deep_link?: string;
}

export interface ProgressAnalytics {
  course_id: number;
  course_title: string;
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
  total_hours: number;
  time_spent: number;
  last_accessed: string;
  streak_days: number;
  average_score: number;
  assignments_completed: number;
  assignments_total: number;
  exams_completed: number;
  exams_total: number;
  weekly_progress: WeeklyProgress[];
}

export interface WeeklyProgress {
  week: string;
  lessons_completed: number;
  time_spent: number;
  average_score?: number;
}

export interface Certificate {
  id: string;
  course_id: number;
  course_title: string;
  student_name: string;
  issue_date: string;
  expiry_date?: string;
  certificate_number: string;
  grade?: string;
  completion_percentage: number;
  download_url?: string;
  share_url?: string;
  metadata: CertificateMetadata;
}

export interface CertificateMetadata {
  issued_by: string;
  instructor: string;
  duration: string;
  credits?: number;
  signature_url?: string;
  seal_url?: string;
}

export interface NotificationPreferences {
  assignments: boolean;
  exams: boolean;
  announcements: boolean;
  course_updates: boolean;
  system_messages: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  quiet_hours?: {
    enabled: boolean;
    start_time: string;
    end_time: string;
  };
}
// Student Dashboard Types
export interface DailySchedule {
  id: number;
  date: string;
  dayOfWeek: string;
  classes: ClassSchedule[];
}

export interface ClassSchedule {
  id: number;
  time: string;
  duration: string;
  subject: string;
  teacher: string;
  teacherImage: string;
  room: string;
  type: "regular" | "exam" | "lab";
  status: "upcoming" | "ongoing" | "completed";
}

export interface WeeklyTimetable {
  id: number;
  weekNumber: number;
  startDate: string;
  endDate: string;
  days: TimetableDay[];
}

export interface TimetableDay {
  id: number;
  dayName: string;
  date: string;
  periods: TimetablePeriod[];
}

export interface TimetablePeriod {
  id: number;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
  color: string;
}

export interface GradeTerm {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  subjects: SubjectGrade[];
  overallAverage: number;
  classRank: number;
  totalStudents: number;
  attendanceRate: number;
}

export interface SubjectGrade {
  id: number;
  subject: string;
  teacher: string;
  firstExam?: number;
  secondExam?: number;
  finalExam?: number;
  homework?: number;
  project?: number;
  participation?: number;
  total: number;
  average: number;
  rank: number;
  status: "pass" | "fail" | "conditional";
  teacherComments?: string;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  dayOfWeek: string;
  status: "present" | "absent" | "late" | "excused";
  checkInTime?: string;
  checkOutTime?: string;
  subjects: SubjectAttendance[];
  notes?: string;
}

export interface SubjectAttendance {
  id: number;
  subject: string;
  teacher: string;
  status: "present" | "absent" | "late";
  time: string;
  duration: string;
}

export interface AttendanceSummary {
  month: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
  trend: "up" | "down" | "stable";
}

export interface DigitalBook {
  id: number;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  category: string;
  subject: string;
  grade: number;
  pages: number;
  fileSize: string;
  fileFormat: "pdf" | "epub" | "mobi";
  isFavorite: boolean;
  downloadUrl: string;
  readUrl: string;
  lastRead?: {
    page: number;
    date: string;
  };
  rating?: number;
  reviews?: number;
  tags: string[];
}

export interface LibraryCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface HomeworkTask {
  id: number;
  title: string;
  subject: string;
  subjectColor: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed" | "overdue";
  completedAt?: string;
  attachments?: HomeworkAttachment[];
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  courseId?: number;
  teacher?: string;
}

export interface HomeworkAttachment {
  id: number;
  name: string;
  url: string;
  type: "pdf" | "image" | "doc" | "link";
  size?: number;
}

export interface HomeworkStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  completionRate: number;
  averageTime: number;
}

export interface StudyTip {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  category:
    | "time-management"
    | "study-techniques"
    | "productivity"
    | "wellness";
}

// Analytics Types
export interface StudentAnalytics {
  academicPerformance: AcademicPerformance;
  attendanceTrends: AttendanceTrend[];
  homeworkCompletion: HomeworkCompletion;
  studyPatterns: StudyPattern[];
}

export interface AcademicPerformance {
  overallAverage: number;
  classRank: number;
  termComparison: {
    previousTerm: number;
    currentTerm: number;
    change: number;
  };
  subjectStrengths: SubjectPerformance[];
  subjectWeaknesses: SubjectPerformance[];
}

export interface SubjectPerformance {
  subject: string;
  average: number;
  classAverage: number;
  trend: "up" | "down" | "stable";
}

export interface AttendanceTrend {
  month: string;
  attendanceRate: number;
  presentDays: number;
  absentDays: number;
}

export interface HomeworkCompletion {
  completionRate: number;
  onTimeRate: number;
  averageCompletionTime: number;
  bySubject: HomeworkSubjectStats[];
}

export interface HomeworkSubjectStats {
  subject: string;
  total: number;
  completed: number;
  onTime: number;
  averageTime: number;
}

export interface StudyPattern {
  dayOfWeek: string;
  studyHours: number;
  homeworkCount: number;
  mostActiveTime: string;
}

// User Preferences Types
export interface StudentPreferences {
  notifications: {
    scheduleUpdates: boolean;
    gradeUpdates: boolean;
    attendanceAlerts: boolean;
    homeworkReminders: boolean;
    libraryUpdates: boolean;
    examNotifications: boolean;
  };
  display: {
    theme: "light" | "dark" | "auto";
    fontSize: "small" | "medium" | "large";
    language: "fa" | "en";
  };
  study: {
    defaultView: "grid" | "list";
    showCompleted: boolean;
    sortBy: "dueDate" | "priority" | "subject";
    autoMarkComplete: boolean;
  };
  privacy: {
    showGrades: boolean;
    showAttendance: boolean;
    showProgress: boolean;
    allowClassRank: boolean;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Mock Data Types for Development
export interface MockData {
  dailySchedule: DailySchedule[];
  weeklyTimetable: WeeklyTimetable[];
  gradeTerms: GradeTerm[];
  attendanceRecords: AttendanceRecord[];
  digitalBooks: DigitalBook[];
  homeworkTasks: HomeworkTask[];
  libraryCategories: LibraryCategory[];
  studyTips: StudyTip[];
  studentAnalytics: StudentAnalytics;
}

// Constants Types
export interface AppConstants {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  subjects: {
    id: number;
    name: string;
    color: string;
    icon: string;
  }[];
  priorities: {
    high: { color: string; label: string; icon: string };
    medium: { color: string; label: string; icon: string };
    low: { color: string; label: string; icon: string };
  };
  statusColors: {
    present: string;
    absent: string;
    late: string;
    excused: string;
    completed: string;
    inProgress: string;
    pending: string;
    overdue: string;
  };
}

export interface ExamStats {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
}

// export interface FilterOption {
//   id: string;
//   label: string;
// }

export interface ExamFormData {
  name: string;
  subject: string;
  class: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  duration: string;
  room: string;
  invigilator: string;
  totalMarks: string;
  passingMarks: string;
  instructions: string;
  isPublished: boolean;
}
