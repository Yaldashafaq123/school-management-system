// hooks/useGrades.ts

import { gradesApi } from "@/src/config/gradesapi";
import {
  AcademicYear,
  AssessmentFilters,
  Class,
  DashboardStats,
  Exam,
  GradeEntry,
  ResultSummary,
  StudentResult,
  Subject,
} from "@/types/grades.types";
import { useCallback, useEffect, useState } from "react";

// hooks/useGrades.ts - Update the dashboard hook

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStats>({
    totalClasses: 0,
    totalSubjects: 0,
    pendingGrades: 0,
    publishedResults: 0,
    studentsAwaiting: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await gradesApi.getDashboardStats();
      setData(stats);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
      // Keep default data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useAcademicYears() {
  const [data, setData] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gradesApi
      .getAcademicYears()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

export function useClasses(academicYearId?: number) {
  const [data, setData] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (academicYearId) {
      setLoading(true);
      gradesApi
        .getClasses(academicYearId)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [academicYearId]);

  return { data, loading };
}

export function useSubjects(classId?: number) {
  const [data, setData] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classId) {
      setLoading(true);
      gradesApi
        .getSubjects(classId)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [classId]);

  return { data, loading };
}

export function useExams(filters: AssessmentFilters) {
  const [data, setData] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!filters.classId) return;
    try {
      setLoading(true);
      const exams = await gradesApi.getExams(filters);
      setData(exams);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load exams");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useGrades(examId?: number) {
  const [data, setData] = useState<GradeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (examId) {
      setLoading(true);
      gradesApi
        .getGradesByExam(examId)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [examId]);

  const save = async (grades: GradeEntry[]) => {
    if (!examId) return;
    setSaving(true);
    try {
      await gradesApi.saveGrades(examId, grades);
    } finally {
      setSaving(false);
    }
  };

  return { data, loading, saving, save };
}

export function useStudentResult(studentId?: number, examId?: number) {
  const [data, setData] = useState<StudentResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (studentId) {
      setLoading(true);
      gradesApi
        .getStudentResult(studentId, examId)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [studentId, examId]);

  return { data, loading };
}

export function useClassResults(classId?: number, examType?: string) {
  const [summary, setSummary] = useState<ResultSummary | null>(null);
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classId) {
      setLoading(true);
      gradesApi
        .getClassResults(classId, examType)
        .then(({ summary, students }) => {
          setSummary(summary);
          setStudents(students);
        })
        .finally(() => setLoading(false));
    }
  }, [classId, examType]);

  return { summary, students, loading };
}
