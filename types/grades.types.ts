// types/grades.types.ts

export interface Student {
  id: number;
  userId: number;
  fullName: string;
  classId: number;
  studentId?: string;
  photo?: string;
}

export interface Class {
  id: number;
  name: string;
  section?: string;
  academicYearId: number;
}

export interface Subject {
  id: number;
  name: string;
}

export interface Exam {
  id: number;
  name: string;
  type: "MONTHLY" | "HALF_YEARLY" | "FINAL";
  classId: number;
  subjectId: number;
  maxScore: number;
  date: string;
  isPublished: boolean;
  status: "DRAFT" | "PUBLISHED" | "LOCKED";
}

export interface Grade {
  id: number;
  examId: number;
  studentId: number;
  subject: string;
  marks: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GradeEntry {
  studentId: number;
  studentName: string;
  score: number | null;
  remarks?: string;
  status: "pending" | "completed" | "missing";
}

export interface AssessmentFilters {
  academicYearId?: number;
  classId?: number;
  subjectId?: number;
  assessmentType?: "MONTHLY" | "HALF_YEARLY" | "FINAL";
}

export interface DashboardStats {
  totalClasses: number;
  totalSubjects: number;
  pendingGrades: number;
  publishedResults: number;
  studentsAwaiting: number;
}

export interface ResultSummary {
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  totalStudents: number;
}

export interface StudentResult {
  student: Student;
  grades: Grade[];
  totalMarks: number;
  percentage: number;
  grade: string;
  rank: number;
  status: "PASSED" | "FAILED";
  comments?: string;
}

export interface SupervisorEvaluation {
  studentId: number;
  studentName: string;
  behaviorScore: number;
  disciplineScore: number;
  attendanceScore: number;
  participationScore: number;
  comments: string;
}

export interface AcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}
