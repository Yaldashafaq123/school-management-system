// src/config/gradesapi.ts (or services/api/grades.api.ts)

import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.100:3000/api"; // Update with your actual IP

class GradesApiService {
  private async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem("token");
      return token;
    } catch {
      return null;
    }
  }

  private async fetchAPI<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<T> {
    const token = await this.getAuthToken();

    const url = `${BASE_URL}${endpoint}`;
    console.log("📡 API Request:", url);

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options?.headers,
        },
        ...options,
      });

      // Log response status
      console.log("📡 Response Status:", response.status);

      // Try to parse JSON
      const text = await response.text();
      console.log("📡 Response Text:", text.substring(0, 200));

      if (!response.ok) {
        // Try to parse error message
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Use the text as error message
          if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      const data = JSON.parse(text);

      // Your backend wraps data in { success: true, data: ... }
      return data.data !== undefined ? data.data : data;
    } catch (error: any) {
      console.error("🔥 API Error:", error.message);
      throw error;
    }
  }

  // =============================
  // DASHBOARD STATS - Using your existing teacher endpoints
  // =============================
  async getDashboardStats() {
    try {
      // Get classes count
      let totalClasses = 0;
      try {
        const classes = await this.fetchAPI<any[]>("/teacher/classes");
        totalClasses = classes?.length || 0;
      } catch (err) {
        console.log("Could not fetch classes:", err);
      }

      // Get pending submissions count
      let pendingGrades = 0;
      try {
        const pending = await this.fetchAPI<any[]>(
          "/teacher/submissions/pending",
        );
        pendingGrades = pending?.length || 0;
      } catch (err) {
        console.log("Could not fetch pending submissions:", err);
      }

      // Get graded submissions for published count
      let publishedResults = 0;
      try {
        const graded = await this.fetchAPI<any[]>(
          "/teacher/submissions/graded",
        );
        publishedResults = graded?.length || 0;
      } catch (err) {
        console.log("Could not fetch graded submissions:", err);
      }

      return {
        totalClasses,
        totalSubjects: 0,
        pendingGrades,
        publishedResults,
        studentsAwaiting: pendingGrades,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Return default values instead of throwing
      return {
        totalClasses: 0,
        totalSubjects: 0,
        pendingGrades: 0,
        publishedResults: 0,
        studentsAwaiting: 0,
      };
    }
  }

  // =============================
  // ACADEMIC YEARS
  // =============================
  async getAcademicYears() {
    // If you don't have this endpoint, return a default
    return [
      {
        id: 1,
        name: "۱۴۰۴-۱۴۰۵",
        startDate: "2025-03-21",
        endDate: "2026-03-20",
        isActive: true,
      },
      {
        id: 2,
        name: "۱۴۰۳-۱۴۰۴",
        startDate: "2024-03-21",
        endDate: "2025-03-20",
        isActive: false,
      },
    ];
  }

  // =============================
  // CLASSES - Uses your getAvailableClasses
  // =============================
  async getClasses(academicYearId?: number) {
    try {
      const classes = await this.fetchAPI<any[]>("/teacher/classes");
      return classes || [];
    } catch (error) {
      console.error("Error fetching classes:", error);
      return [];
    }
  }

  // =============================
  // SUBJECTS - Uses your getSubjectsByClass
  // =============================
  async getSubjects(classId?: number) {
    if (!classId) return [];

    try {
      const subjects = await this.fetchAPI<any[]>(
        `/teacher/subjects/class/${classId}`,
      );
      return subjects || [];
    } catch (error) {
      console.error("Error fetching subjects:", error);
      return [];
    }
  }

  // =============================
  // SUBJECTS FOR GRADING - Uses your getSubjectsForGrading
  // =============================
  async getSubjectsForGrading(classId: number) {
    try {
      const subjects = await this.fetchAPI<any[]>(
        `/teacher/subjects/grading/${classId}`,
      );
      return subjects || [];
    } catch (error) {
      console.error("Error fetching grading subjects:", error);
      return [];
    }
  }

  // =============================
  // EXAMS - Uses your getExamsByClass
  // =============================
  async getExams(classId: number) {
    if (!classId) return [];

    try {
      const exams = await this.fetchAPI<any[]>(
        `/teacher/exams/class/${classId}`,
      );
      return (exams || []).map((exam) => ({
        id: exam.id,
        name: exam.title || exam.name || "Untitled",
        type: exam.type || "MONTHLY",
        classId: classId,
        maxScore: exam.maxScore || 100,
        date: exam.examDate || exam.date || new Date().toISOString(),
        isPublished: exam.status === "PUBLISHED" || exam.isPublished,
        status: exam.status || "DRAFT",
        totalStudents: exam.totalStudents || 0,
        gradedCount: exam.gradedCount || 0,
      }));
    } catch (error) {
      console.error("Error fetching exams:", error);
      return [];
    }
  }

  // =============================
  // GET OR CREATE EXAM - Uses your getOrCreateExam
  // =============================
  async getOrCreateExam(params: {
    classId: number;
    subjectId: number;
    examType: string;
    month?: number;
    year?: number;
  }) {
    try {
      const result = await this.fetchAPI<any>("/teacher/exams/get-or-create", {
        method: "POST",
        body: JSON.stringify(params),
      });

      return {
        exam: {
          id: result.exam.id,
          name: result.exam.name,
          type: result.exam.type,
          maxScore: result.exam.maxScore,
          date: new Date().toISOString(),
          isPublished: false,
          status: "DRAFT",
          classId: params.classId,
          subjectId: params.subjectId,
        },
        students: (result.students || []).map((s: any) => ({
          studentId: s.id,
          studentName: s.name,
          score: s.score || null,
          remarks: s.feedback || "",
          status: s.isSaved ? "completed" : "pending",
        })),
        totalStudents: result.totalStudents || 0,
        gradedCount: result.gradedCount || 0,
      };
    } catch (error) {
      console.error("Error getting/creating exam:", error);
      throw error;
    }
  }

  // =============================
  // GET EXAM FOR GRADING - Uses your getExamForGrading
  // =============================
  async getExamForGrading(examId: number) {
    try {
      const data = await this.fetchAPI<any>(`/teacher/exams/${examId}/grading`);

      return {
        exam: {
          id: data.id,
          name: data.name || data.title,
          type: data.type,
          maxScore: data.maxScore || 100,
          date: data.date || new Date().toISOString(),
          isPublished: data.isPublished || false,
          status: data.status || "DRAFT",
        },
        students: (data.students || []).map((s: any) => ({
          studentId: s.id,
          studentName: s.name,
          score: s.score || s.grade?.marks || null,
          remarks: s.feedback || s.grade?.feedback || "",
          status: s.score || s.grade?.marks ? "completed" : "pending",
        })),
      };
    } catch (error) {
      console.error("Error fetching exam for grading:", error);
      throw error;
    }
  }

  // =============================
  // SAVE GRADES - Uses your saveExamGrades
  // =============================
  async saveGrades(examId: number, grades: any[], publishResults = false) {
    try {
      const result = await this.fetchAPI<any>("/teacher/exams/grades", {
        method: "POST",
        body: JSON.stringify({
          examId,
          grades: grades.map((g) => ({
            studentId: g.studentId,
            score: g.score,
            feedback: g.remarks || g.feedback || "",
          })),
          publishResults,
        }),
      });
      return result;
    } catch (error) {
      console.error("Error saving grades:", error);
      throw error;
    }
  }

  // =============================
  // PUBLISH EXAM RESULTS - Uses your publishExamResults
  // =============================
  async publishResults(examId: number, announcement?: string) {
    try {
      return await this.fetchAPI<any>(`/teacher/exams/${examId}/publish`, {
        method: "POST",
        body: JSON.stringify({ announcement }),
      });
    } catch (error) {
      console.error("Error publishing results:", error);
      throw error;
    }
  }

  // =============================
  // GET CLASS STUDENTS - Uses your getClassStudents
  // =============================
  async getClassStudents(classId: number) {
    try {
      const students = await this.fetchAPI<any[]>(
        `/teacher/students/class/${classId}`,
      );
      return (students || []).map((s) => ({
        id: s.id,
        fullName: s.name || s.fullName,
        email: s.email,
        rollNumber: s.rollNumber || `STU-${String(s.id).padStart(3, "0")}`,
      }));
    } catch (error) {
      console.error("Error fetching students:", error);
      return [];
    }
  }

  // =============================
  // GET STUDENT RESULT
  // =============================
  async getStudentResult(studentId: number) {
    try {
      const student = await this.fetchAPI<any>(
        `/teacher/students/${studentId}`,
      );

      const grades = student.grades || [];
      const totalMarks = grades.reduce(
        (sum: number, g: any) => sum + (g.marks || g.score || 0),
        0,
      );
      const maxPossible = grades.length * 100;
      const percentage = maxPossible > 0 ? (totalMarks / maxPossible) * 100 : 0;

      return {
        student: {
          id: student.id,
          userId: student.userId || student.user?.id,
          fullName: student.fullName || student.name || student.user?.fullName,
          classId: student.class?.id || student.classId,
          studentId:
            student.rollNumber || `STU-${String(student.id).padStart(3, "0")}`,
          photo: student.profile_image || student.profileImage,
        },
        grades: grades.map((g: any) => ({
          id: g.id,
          examId: g.examId,
          studentId: student.id,
          subject: g.subject || g.exam?.subject || "",
          marks: g.marks || g.score || 0,
          feedback: g.feedback || "",
          createdAt: g.createdAt || new Date().toISOString(),
          updatedAt: g.updatedAt || new Date().toISOString(),
        })),
        totalMarks,
        percentage: Math.round(percentage * 10) / 10,
        grade:
          percentage >= 90
            ? "A"
            : percentage >= 80
              ? "B"
              : percentage >= 70
                ? "C"
                : percentage >= 60
                  ? "D"
                  : "F",
        rank: 0,
        status: percentage >= 60 ? "PASSED" : "FAILED",
        comments: student.notes || "",
      };
    } catch (error) {
      console.error("Error fetching student result:", error);
      throw error;
    }
  }

  // =============================
  // GET CLASS RESULTS
  // =============================
  async getClassResults(classId: number, examType?: string) {
    try {
      const exams = await this.getExams(classId);
      const filteredExams = examType
        ? exams.filter((e) => e.type === examType)
        : exams;

      // Get all students
      const students = await this.getClassStudents(classId);

      // For each student, get their grades
      const studentResults = await Promise.all(
        students.map(async (student) => {
          try {
            return await this.getStudentResult(student.id);
          } catch {
            return {
              student: {
                id: student.id,
                userId: 0,
                fullName: student.fullName,
                classId,
                studentId: student.rollNumber,
              },
              grades: [],
              totalMarks: 0,
              percentage: 0,
              grade: "F",
              rank: 0,
              status: "FAILED" as const,
            };
          }
        }),
      );

      // Sort and assign ranks
      studentResults.sort((a, b) => b.percentage - a.percentage);
      studentResults.forEach((result, index) => {
        result.rank = index + 1;
      });

      // Calculate summary
      const scores = studentResults.map((s) => s.percentage);
      const summary = {
        averageScore:
          scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0,
        highestScore: scores.length > 0 ? Math.max(...scores) : 0,
        lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
        passRate:
          scores.length > 0
            ? Math.round(
                (scores.filter((s) => s >= 60).length / scores.length) * 100,
              )
            : 0,
        totalStudents: scores.length,
      };

      return { summary, students: studentResults };
    } catch (error) {
      console.error("Error fetching class results:", error);
      throw error;
    }
  }

  // =============================
  // SUPERVISOR EVALUATIONS
  // =============================
  async getSupervisorEvaluations(classId: number) {
    try {
      const students = await this.getClassStudents(classId);
      return students.map((student) => ({
        studentId: student.id,
        studentName: student.fullName,
        behaviorScore: 0,
        disciplineScore: 0,
        attendanceScore: 0,
        participationScore: 0,
        comments: "",
      }));
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      return [];
    }
  }

  async saveSupervisorEvaluations(evaluations: any[]) {
    try {
      return await this.fetchAPI("/teacher/evaluations", {
        method: "POST",
        body: JSON.stringify({ evaluations }),
      });
    } catch (error) {
      console.error("Error saving evaluations:", error);
      throw error;
    }
  }

  // =============================
  // REPORT CARD
  // =============================
  async getReportCard(studentId: number) {
    try {
      return await this.getStudentResult(studentId);
    } catch (error) {
      console.error("Error fetching report card:", error);
      throw error;
    }
  }
}

export const gradesApi = new GradesApiService();
