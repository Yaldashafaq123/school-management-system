// hooks/useTeacherGrades.ts
import { apiRequest } from "@/src/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

interface TeacherGradeStats {
  totalClasses: number;
  totalSubjects: number;
  pendingGrades: number;
  publishedResults: number;
  studentsAwaiting: number;
}

export function useTeacherGradeStats() {
  const [data, setData] = useState<TeacherGradeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${apiRequest}/api/teacher/grades/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || "Failed to load stats");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}
