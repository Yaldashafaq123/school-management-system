// app/(principal)/(tabs)/index.tsx - FIXED with relative paths

import { useAuth } from "@/contexts/AuthContext";
import { principalApi, PrincipalDashboard } from "@/src/config/principalApi";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  BookOpen,
  Calendar,
  CalendarDays,
  ClipboardList,
  Percent,
  Users,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type AcademicModule = {
  title: string;
  description: string;
  icon: any;
  route: any; // ✅ Changed to 'any' to fix TypeScript errors
  color: string;
};

export default function PrincipalDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<PrincipalDashboard | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await principalApi.getDashboard();
      if (response.success) {
        setDashboard(response.data);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  // ✅ Academic Management Modules - Using relative paths
  const academicModules: AcademicModule[] = [
    {
      title: "تنظیم سال تحصیلی",
      description: "تنظیم ترم‌ها، رخصتی‌ها و تقویم آموزشی",
      icon: CalendarDays,
      route: "./academic/years-setup",
      color: "#007AFF",
    },
    {
      title: "صنف‌ها و بخش‌ها",
      description: "ایجاد صنف‌ها و تعیین استادان",
      icon: Users,
      route: "./classes",
      color: "#34C759",
    },
    {
      title: "مدیریت مضامین",
      description: "افزودن یا حذف مضامین و تعیین استادان",
      icon: BookOpen,
      route: "./academic/subjects",
      color: "#FF9500",
    },
    {
      title: "ایجاد تقسیم اوقات",
      description: "ایجاد و ویرایش تقسیم اوقات مرکزی",
      icon: Calendar,
      route: "./academic/timetable",
      color: "#5856D6",
    },
    {
      title: "مدیریت امتحانات",
      description: "تنظیم برنامه امتحانات و تعیین اطاق‌ها",
      icon: ClipboardList,
      route: "./academic/exams",
      color: "#FF2D55",
    },
    {
      title: "سیستم نمره‌دهی",
      description: "تنظیم مقیاس نمرات و معیار قبولی",
      icon: Percent,
      route: "./academic/grading-system",
      color: "#AF52DE",
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  const stats = dashboard?.summary || {
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    attendanceRate: 0,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Card */}
      <LinearGradient
        colors={["#f59e0b", "#d97706"]}
        style={styles.welcomeCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.welcomeContent}>
          <View>
            <Text style={styles.welcomeGreeting}>سلام 👋</Text>
            <Text style={styles.welcomeName}>{user?.fullName || "مدیر"}</Text>
            <Text style={styles.welcomeRole}>مدیریت مکتب</Text>
          </View>
          <View style={styles.welcomeAvatar}>
            <Ionicons name="person" size={32} color="#f59e0b" />
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#fef3c7" }]}>
            <Ionicons name="school" size={24} color="#f59e0b" />
          </View>
          <Text style={styles.statValue}>{stats.totalStudents}</Text>
          <Text style={styles.statLabel}>شاگردان</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#dbeafe" }]}>
            <Ionicons name="people" size={24} color="#3b82f6" />
          </View>
          <Text style={styles.statValue}>{stats.totalTeachers}</Text>
          <Text style={styles.statLabel}>اساتید</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#d1fae5" }]}>
            <Ionicons name="book" size={24} color="#10b981" />
          </View>
          <Text style={styles.statValue}>{stats.totalClasses}</Text>
          <Text style={styles.statLabel}>صنوف</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#ede9fe" }]}>
            <Ionicons name="trending-up" size={24} color="#8b5cf6" />
          </View>
          <Text style={styles.statValue}>{stats.attendanceRate}%</Text>
          <Text style={styles.statLabel}>حضور</Text>
        </View>
      </View>

      {/* Quick Actions - Row 1 */}
      <Text style={styles.sectionTitle}>دسترسی سریع</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("./students")}
        >
          <View
            style={[styles.quickActionIcon, { backgroundColor: "#fef3c7" }]}
          >
            <Ionicons name="school" size={28} color="#f59e0b" />
          </View>
          <Text style={styles.quickActionTitle}>شاگردان</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("./teachers")}
        >
          <View
            style={[styles.quickActionIcon, { backgroundColor: "#dbeafe" }]}
          >
            <Ionicons name="people" size={28} color="#3b82f6" />
          </View>
          <Text style={styles.quickActionTitle}>اساتید</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("./classes")}
        >
          <View
            style={[styles.quickActionIcon, { backgroundColor: "#d1fae5" }]}
          >
            <Ionicons name="book" size={28} color="#10b981" />
          </View>
          <Text style={styles.quickActionTitle}>صنوف</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("./reports")}
        >
          <View
            style={[styles.quickActionIcon, { backgroundColor: "#ede9fe" }]}
          >
            <Ionicons name="bar-chart" size={28} color="#8b5cf6" />
          </View>
          <Text style={styles.quickActionTitle}>راپورها</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions - Row 2 (Academic Management) */}
      <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
        مدیریت امور آموزشی
      </Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("./academic/years-setup")}
        >
          <View
            style={[styles.quickActionIcon, { backgroundColor: "#007AFF15" }]}
          >
            <CalendarDays size={28} color="#007AFF" />
          </View>
          <Text style={styles.quickActionTitle}>سال تحصیلی</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("./academic/subjects")}
        >
          <View
            style={[styles.quickActionIcon, { backgroundColor: "#FF950015" }]}
          >
            <BookOpen size={28} color="#FF9500" />
          </View>
          <Text style={styles.quickActionTitle}>مضامین</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("./academic/timetable")}
        >
          <View
            style={[styles.quickActionIcon, { backgroundColor: "#5856D615" }]}
          >
            <Calendar size={28} color="#5856D6" />
          </View>
          <Text style={styles.quickActionTitle}>تقسیم اوقات</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("./academic")}
        >
          <View
            style={[styles.quickActionIcon, { backgroundColor: "#FF2D5515" }]}
          >
            <ClipboardList size={28} color="#FF2D55" />
          </View>
          <Text style={styles.quickActionTitle}>مدیریت امور آموزشی</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activities */}
      <Text style={styles.sectionTitle}>فعالیت‌های اخیر</Text>
      <View style={styles.activityCard}>
        <View style={styles.activityItem}>
          <View style={styles.activityDot} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>شاگرد جدید ثبت نام شد</Text>
            <Text style={styles.activityDesc}>احمد محمدی - صنف ۱۰</Text>
            <Text style={styles.activityTime}>۳ ساعت پیش</Text>
          </View>
        </View>

        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: "#10b981" }]} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>امتحانات ماهانه تکمیل شد</Text>
            <Text style={styles.activityDesc}>صنف ۹ - ۱۲</Text>
            <Text style={styles.activityTime}>۵ ساعت پیش</Text>
          </View>
        </View>

        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: "#f59e0b" }]} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>جلسه اساتید برگزار شد</Text>
            <Text style={styles.activityDesc}>حضور ۲۵ استاد</Text>
            <Text style={styles.activityTime}>۱ روز پیش</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  content: {
    padding: 16,
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  welcomeContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeGreeting: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Vazir",
  },
  welcomeName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "VazirBold",
  },
  welcomeRole: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  welcomeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  statLabel: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  quickActionCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f59e0b",
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  activityDesc: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  activityTime: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
});
