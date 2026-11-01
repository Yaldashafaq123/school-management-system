/* eslint-disable react-hooks/set-state-in-effect */
// app/(principal)/teachers/[id].tsx
import { formatCurrency, principalApi } from "@/src/config/principalApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ==================== TYPES ====================

type TeacherUser = {
  id: number;
  fullName: string;
  nameFarsi?: string | null;
  email: string;
  phone: string;
  profileImage?: string | null;
  birthDate?: string | null;
  birthPlace?: string | null;
  sex?: string | null;
  bloodType?: string | null;
  maritalStatus?: string | null;
  nationality?: string | null;
  civilId?: string | null;
  civilIdIssueDate?: string | null;
  civilIdExpiryDate?: string | null;
  fatherName?: string | null;
  grandfatherName?: string | null;
  currentAddress?: string | null;
  permanentAddress?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  educationLevel?: string | null;
  educationField?: string | null;
  educationInstitution?: string | null;
  graduationYear?: number | null;
  workExperience?: string | null;
  workShift?: string | null;
  workSchedule?: string | null;
  contractType?: string | null;
  contractStartDate?: string | null;
  contractEndDate?: string | null;
  hasContract?: boolean;
  hasInsurance?: boolean;
  insuranceProvider?: string | null;
  insuranceNumber?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  baseSalary?: number | string | null;
  salaryCurrency?: string | null;
  joinDate?: string | null;
  notes?: string | null;
  isActive: boolean;
  verified?: boolean;
  deviceUserId?: string | null;
  rfidCode?: string | null;
  createdAt: string;
};

type AttendanceDay = {
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  hoursWorked: number | null;
  punches: {
    id: number;
    scanTime: string;
    punchType: number | null;
    deviceName: string | null;
  }[];
};

type TimetableEntry = {
  id: number;
  day: number;
  dayName: string;
  period: number;
  time: string;
  subject: string;
  subjectId: number;
  className: string;
  classId: number;
  room: string;
};

type SalaryRecord = {
  id: number;
  amount: number;
  baseSalary: number;
  finalAmount: number;
  paidAmount: number;
  bonusAmount: number;
  deductionAmount: number;
  overtimeAmount: number;
  overtimeHours: number;
  month: number;
  year: number;
  status: string;
  paidAt: string | null;
  notes: string | null;
  createdAt: string;
};

type TeacherDetail = {
  id: number;
  userId: number;
  teacherCode: string;
  isActive: boolean;
  availability: boolean;
  joiningDate: string;
  specialization: string;
  experience: string;
  certification: string;
  rating: number;
  baseSalary: number;
  hourlyRate: number | null;
  overtimeRate: number | null;
  contractEndDate: string | null;
  bio: string | null;
  awards: string | null;
  publications: string | null;
  languageSkills: string | null;
  teachingExperience: number | null;

  User: TeacherUser;
  subjects: string[];
  studentCount: number;
  TeacherSubject: { Subject: { id: number; name: string } }[];
  Class:
    | {
        id: number;
        name: string;
        section: string;
        _count?: { Student: number };
      }[]
    | null;

  attendance: {
    range: { from: string; to: string };
    summary: { totalScans: number; totalDaysPresent: number; records: number };
    days: AttendanceDay[];
    raw: any[];
  };

  Salary: SalaryRecord[];
  salarySummary: {
    totalPaid: number;
    totalPending: number;
    recordCount: number;
  };

  timetable: TimetableEntry[];
  timetableByDay: Record<string, TimetableEntry[]>;
};

type Evaluation = {
  id: number;
  templateName: string;
  period: string;
  term: string;
  academicYear: string;
  evaluatorName: string;
  evaluatorRole: string;
  overallScore: number;
  percentage: number;
  grade: string;
  gradeLabel: string;
  status: string;
  evaluatedAt: string;
  submittedAt: string;
  scoresCount: number;
  actionPlansCount: number;
};

type PerformanceSummary = {
  teacher: {
    id: number;
    fullName: string;
    email: string;
    profileImage: string | null;
  };
  hasEvaluations: boolean;
  summary?: {
    totalEvaluations: number;
    averagePercentage: number;
    averageGrade: string;
    averageGradeLabel: string;
    trend: string;
    trendLabel: string;
  };
  categoryAverages?: {
    teaching: number;
    discipline: number;
    communication: number;
    professional: number;
    studentRelation: number;
  };
  latestEvaluation?: {
    id: number;
    templateName: string;
    academicYear: string;
    percentage: number;
    grade: string;
    gradeLabel: string;
    evaluatedAt: string;
  };
  evaluationHistory?: {
    id: number;
    templateName: string;
    academicYear: string;
    period: string;
    percentage: number;
    grade: string;
    gradeLabel: string;
    evaluatedAt: string;
  }[];
};

// ==================== SHAMSI HELPERS ====================

const SHAMSI_MONTH_NAMES = [
  "حمل",
  "ثور",
  "جوزا",
  "سرطان",
  "اسد",
  "سنبله",
  "میزان",
  "عقرب",
  "قوس",
  "جدی",
  "دلو",
  "حوت",
];

const SCHOOL_START_HOUR = 7;
const SCHOOL_START_MINUTE = 30;

function toShamsiParts(date: Date) {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();

  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  const gy2 = gy <= 1600 ? gy - 621 : gy - 1600;
  const gm2 = gm - 1;
  let days =
    gy <= 1600
      ? 365 * gy2 + Math.floor(gy2 / 4) + gd + g_d_m[gm2]
      : 365 * gy2 +
        Math.floor((gy2 + 3) / 4) -
        Math.floor((gy2 + 99) / 100) +
        Math.floor((gy2 + 399) / 400) -
        80 +
        gd +
        g_d_m[gm2];

  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  const jm =
    days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);

  return { year: jy, month: jm, day: jd };
}

function groupAttendanceByShamsiMonth(raw: any[]) {
  type MonthBucket = {
    shamsiYear: number;
    shamsiMonth: number;
    monthName: string;
    days: Record<
      string,
      { firstIn: Date | null; lastOut: Date | null; isLate: boolean }
    >;
    daysPresent: number;
    lateDays: number;
    absentDays: number;
    workingDays: number;
  };

  const buckets: Record<string, MonthBucket> = {};

  for (const r of raw || []) {
    const scanTime = new Date(r.scanTime);
    const sp = toShamsiParts(scanTime);
    const key = `${sp.year}-${sp.month}`;

    if (!buckets[key]) {
      buckets[key] = {
        shamsiYear: sp.year,
        shamsiMonth: sp.month,
        monthName: SHAMSI_MONTH_NAMES[sp.month - 1],
        days: {},
        daysPresent: 0,
        lateDays: 0,
        absentDays: 0,
        workingDays: 0,
      };
    }

    const dayKey = scanTime.toISOString().split("T")[0];
    if (!buckets[key].days[dayKey]) {
      buckets[key].days[dayKey] = {
        firstIn: null,
        lastOut: null,
        isLate: false,
      };
    }
    const entry = buckets[key].days[dayKey];

    if (r.punchType === 0 || r.punchType === null) {
      if (!entry.firstIn || scanTime < entry.firstIn) {
        entry.firstIn = scanTime;
        const schoolStart = new Date(scanTime);
        schoolStart.setHours(SCHOOL_START_HOUR, SCHOOL_START_MINUTE, 0, 0);
        entry.isLate = scanTime > schoolStart;
      }
    } else if (r.punchType === 1) {
      if (!entry.lastOut || scanTime > entry.lastOut) {
        entry.lastOut = scanTime;
      }
    }
  }

  const sortedKeys = Object.keys(buckets).sort((a, b) => {
    const [ay, am] = a.split("-").map(Number);
    const [by, bm] = b.split("-").map(Number);
    if (ay !== by) return ay - by;
    return am - bm;
  });

  return sortedKeys.map((k) => {
    const b = buckets[k];
    const daysArr = Object.values(b.days);
    b.daysPresent = daysArr.filter((d) => d.firstIn).length;
    b.lateDays = daysArr.filter((d) => d.isLate).length;

    const monthDays = b.shamsiMonth <= 6 ? 31 : b.shamsiMonth <= 11 ? 30 : 29;
    const assumedFridays = 4;
    b.workingDays = monthDays - assumedFridays;
    b.absentDays = Math.max(0, b.workingDays - b.daysPresent);

    return {
      shamsiYear: b.shamsiYear,
      shamsiMonth: b.shamsiMonth,
      monthName: b.monthName,
      daysPresent: b.daysPresent,
      lateDays: b.lateDays,
      absentDays: b.absentDays,
      workingDays: b.workingDays,
      totalPunches: daysArr.length,
      attendanceRate:
        b.workingDays > 0
          ? Math.round((b.daysPresent / b.workingDays) * 100)
          : 0,
    };
  });
}

// ==================== HELPERS ====================

const getGradeColor = (grade: string) => {
  const colors: Record<string, string> = {
    EXCELLENT: "#10b981",
    VERY_GOOD: "#3b82f6",
    GOOD: "#f59e0b",
    SATISFACTORY: "#f97316",
    NEEDS_IMPROVEMENT: "#ef4444",
    UNSATISFACTORY: "#dc2626",
  };
  return colors[grade] || "#64748b";
};

const getStatusLabelFarsi = (status: string) => {
  const labels: Record<string, string> = {
    DRAFT: "پیش‌نویس",
    PENDING_REVIEW: "در انتظار بررسی",
    SUBMITTED: "ارسال شده",
    ACKNOWLEDGED: "تأیید شده",
    DISPUTED: "اعتراض",
    ARCHIVED: "بایگانی",
  };
  return labels[status] || status;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    DRAFT: "#94a3b8",
    PENDING_REVIEW: "#f59e0b",
    SUBMITTED: "#3b82f6",
    ACKNOWLEDGED: "#10b981",
    DISPUTED: "#ef4444",
    ARCHIVED: "#64748b",
  };
  return colors[status] || "#64748b";
};

const getTrendIcon = (trend: string): keyof typeof Ionicons.glyphMap => {
  if (trend === "IMPROVING") return "trending-up";
  if (trend === "DECLINING") return "trending-down";
  return "remove";
};

const getTrendColor = (trend: string) => {
  if (trend === "IMPROVING") return "#10b981";
  if (trend === "DECLINING") return "#ef4444";
  return "#64748b";
};

const getPeriodLabelFarsi = (period: string) => {
  const labels: Record<string, string> = {
    MONTHLY: "ماهانه",
    QUARTERLY: "سه‌ماهه",
    SEMESTER: "سمستر",
    ANNUAL: "سالانه",
    PROBATION: "دوره آزمایشی",
    SPECIAL: "ویژه",
  };
  return labels[period] || period;
};

const getMonthName = (month: number) => {
  const months = [
    "حمل",
    "ثور",
    "جوزا",
    "سرطان",
    "اسد",
    "سنبله",
    "میزان",
    "عقرب",
    "قوس",
    "جدی",
    "دلو",
    "حوت",
  ];
  return months[month - 1] || month;
};

const formatDate = (d: string | null | undefined) => {
  if (!d) return "ثبت نشده";
  try {
    return new Date(d).toLocaleDateString("fa-AF", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "ثبت نشده";
  }
};

const formatTime = (d: string | null | undefined) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleTimeString("fa-AF", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const labelize = (key: string) => {
  const map: Record<string, string> = {
    MALE: "مرد",
    FEMALE: "زن",
    OTHER: "سایر",
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
    SINGLE: "مجرد",
    MARRIED: "متأهل",
    DIVORCED: "طلاق داده",
    WIDOWED: "بیوه",
    PERMANENT: "دایمی",
    TEMPORARY: "موقت",
    CONTRACT: "قراردادی",
    CASUAL: "روزانه",
    PROBATION: "آزمایشی",
    MORNING: "صبح",
    AFTERNOON: "بعد از ظهر",
    EVENING: "شب",
    NIGHT: "شبانه",
    ROTATING: "چرخشی",
    FLEXIBLE: "انعطاف‌پذیر",
    NO_FORMAL: "بدون تحصیلات رسمی",
    PRIMARY: "ابتدایی",
    SECONDARY: "متوسطه",
    HIGH_SCHOOL: "لیسه",
    BACHELORS: "بکلوریا",
    MASTERS: "ماستری",
    DOCTORATE: "دکتورا",
    PAID: "پرداخت شده",
    PENDING: "در انتظار",
    PARTIAL: "نیمه پرداخت",
    CANCELLED: "لغو شده",
  };
  return map[key] || key;
};

// ==================== SMALL COMPONENTS ====================

const CircularProgress = ({
  percentage,
  size = 100,
  strokeWidth = 10,
  color = "#3b82f6",
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) => (
  <View
    style={{
      width: size,
      height: size,
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: "#e2e8f0",
      }}
    />
    <View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: color,
        borderTopColor: "transparent",
        borderRightColor: percentage > 25 ? color : "transparent",
        borderBottomColor: percentage > 50 ? color : "transparent",
        borderLeftColor: percentage > 75 ? color : "transparent",
        transform: [{ rotate: `${(percentage / 100) * 360 - 45}deg` }],
      }}
    />
    <View
      style={{
        width: size - strokeWidth * 2,
        height: size - strokeWidth * 2,
        borderRadius: (size - strokeWidth * 2) / 2,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: size * 0.22,
          fontWeight: "700",
          color,
          fontFamily: "VazirBold",
        }}
      >
        {Math.round(percentage)}%
      </Text>
    </View>
  </View>
);

const ScoreBar = ({
  label,
  score,
  maxScore = 100,
  color = "#3b82f6",
}: {
  label: string;
  score: number;
  maxScore?: number;
  color?: string;
}) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  return (
    <View style={styles.scoreBarContainer}>
      <View style={styles.scoreBarHeader}>
        <Text style={styles.scoreBarLabel}>{label}</Text>
        <Text style={[styles.scoreBarValue, { color }]}>
          {Math.round(score)}%
        </Text>
      </View>
      <View style={styles.scoreBarTrack}>
        <View
          style={[
            styles.scoreBarFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number | null | undefined;
}) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={18} color="#64748b" />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={2}>
      {value ?? "—"}
    </Text>
  </View>
);

// ==================== MAIN SCREEN ====================

export default function TeacherDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [performanceSummary, setPerformanceSummary] =
    useState<PerformanceSummary | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [showAllEvaluations, setShowAllEvaluations] = useState(false);
  const [attendanceWindow, setAttendanceWindow] = useState<7 | 30 | 60>(30);

  const fetchTeacher = useCallback(
    async (days?: number) => {
      try {
        // Always fetch a full year of raw punches so we can group by Shamsi month.
        // The `days` argument only affects how many days the recent-window list shows.
        const yearStart = new Date(new Date().getFullYear(), 0, 1);
        const yearEnd = new Date(new Date().getFullYear(), 11, 31);

        const response = await principalApi.getTeacherById(Number(id), {
          attendanceFrom: yearStart.toISOString().split("T")[0],
          attendanceTo: yearEnd.toISOString().split("T")[0],
          attendanceLimit: 5000,
        });
        if (response.success) setTeacher(response.data as any);
      } catch (error) {
        console.error("Fetch teacher error:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  const fetchEvaluations = useCallback(async () => {
    try {
      setEvalLoading(true);
      const response = await principalApi.getTeacherEvaluations(Number(id));
      if (response.success) {
        setEvaluations(response.data.evaluations || []);
      }
    } catch (error) {
      console.error("Fetch evaluations error:", error);
    } finally {
      setEvalLoading(false);
    }
  }, [id]);

  const fetchPerformanceSummary = useCallback(async () => {
    try {
      const response = await principalApi.getTeacherPerformanceSummary(
        Number(id),
      );
      if (response.success && response.data.hasEvaluations) {
        setPerformanceSummary(response.data);
      }
    } catch (error) {
      console.error("Fetch performance summary error:", error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchTeacher();
      fetchEvaluations();
      fetchPerformanceSummary();
    }
  }, [id, fetchTeacher, fetchEvaluations, fetchPerformanceSummary]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeacher();
    fetchEvaluations();
    fetchPerformanceSummary();
  };

  const handleStartEvaluation = () => {
    router.push({
      pathname: "/(principal)/teacher-evaluations/new",
      params: { teacherId: id },
    } as any);
  };

  const handleViewEvaluation = (evaluationId: number) => {
    router.push({
      pathname: "/(principal)/teacher-evaluations/[id]",
      params: { id: String(evaluationId) },
    } as any);
  };

  const handleViewReportCard = (evaluationId: number) => {
    router.push({
      pathname: "/(principal)/teacher-evaluations/report/[id]",
      params: { id: String(evaluationId) },
    } as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!teacher) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>استاد یافت نشد</Text>
      </View>
    );
  }

  const user = teacher.User;
  const displayedEvaluations = showAllEvaluations
    ? evaluations
    : evaluations.slice(0, 3);
  const attendanceDays = teacher.attendance?.days || [];
  const timetableByDay = teacher.timetableByDay || {};
  const weekDays = [
    "شنبه",
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
  ];

  // Monthly breakdown derived from the raw punches (all year)
  const monthlyBreakdown = groupAttendanceByShamsiMonth(
    teacher.attendance?.raw || [],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Back */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.fullName?.charAt(0) || "?"}
          </Text>
        </View>
        <Text style={styles.teacherName}>{user?.fullName || "نامشخص"}</Text>
        {user?.nameFarsi ? (
          <Text style={styles.farsiName}>{user.nameFarsi}</Text>
        ) : null}
        <Text style={styles.specializationText}>
          {teacher.specialization || "متخصص"}
        </Text>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: teacher.isActive ? "#d1fae5" : "#fef3c7" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: teacher.isActive ? "#10b981" : "#f59e0b" },
              ]}
            >
              {teacher.isActive ? "فعال" : "غیرفعال"}
            </Text>
          </View>
          {teacher.availability && (
            <View style={[styles.statusBadge, { backgroundColor: "#dbeafe" }]}>
              <Text style={[styles.statusText, { color: "#3b82f6" }]}>
                در دسترس
              </Text>
            </View>
          )}
          {user?.verified && (
            <View style={[styles.statusBadge, { backgroundColor: "#e0f2fe" }]}>
              <Ionicons name="checkmark-circle" size={12} color="#0ea5e9" />
              <Text
                style={[styles.statusText, { color: "#0ea5e9", marginLeft: 2 }]}
              >
                تأیید شده
              </Text>
            </View>
          )}
        </View>

        {teacher.rating > 0 && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#f59e0b" />
            <Text style={styles.ratingText}>{teacher.rating}</Text>
          </View>
        )}

        {/* Quick KPIs */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiValue}>{teacher.subjects.length}</Text>
            <Text style={styles.kpiLabel}>مضامین</Text>
          </View>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiValue}>{teacher.Class?.length || 0}</Text>
            <Text style={styles.kpiLabel}>صنوف</Text>
          </View>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiValue}>{teacher.studentCount}</Text>
            <Text style={styles.kpiLabel}>شاگردان</Text>
          </View>
          <View style={styles.kpiItem}>
            <Text style={styles.kpiValue}>
              {teacher.attendance?.summary?.totalDaysPresent || 0}
            </Text>
            <Text style={styles.kpiLabel}>روز حضور</Text>
          </View>
        </View>
      </View>

      {/* ==================== EVALUATION SECTION ==================== */}
      <View style={styles.infoCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="school-outline" size={22} color="#8b5cf6" />
            <Text style={styles.sectionTitle}>ارزیابی عملکرد</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleStartEvaluation}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.addButtonText}>ارزیابی جدید</Text>
          </TouchableOpacity>
        </View>

        {evalLoading ? (
          <View style={styles.evalLoadingContainer}>
            <ActivityIndicator size="small" color="#8b5cf6" />
            <Text style={styles.evalLoadingText}>
              در حال بارگذاری ارزیابی‌ها...
            </Text>
          </View>
        ) : !performanceSummary?.hasEvaluations && evaluations.length === 0 ? (
          <View style={styles.emptyEvalContainer}>
            <Ionicons name="clipboard-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyEvalTitle}>هنوز ارزیابی ثبت نشده</Text>
            <Text style={styles.emptyEvalSubtitle}>
              برای ارزیابی این معلم، دکمه «ارزیابی جدید» را بزنید
            </Text>
          </View>
        ) : (
          <>
            {performanceSummary?.hasEvaluations && (
              <View style={styles.performanceSummaryCard}>
                <View style={styles.performanceMainRow}>
                  <CircularProgress
                    percentage={
                      performanceSummary.summary?.averagePercentage || 0
                    }
                    size={110}
                    strokeWidth={12}
                    color={getGradeColor(
                      performanceSummary.summary?.averageGrade || "GOOD",
                    )}
                  />
                  <View style={styles.performanceInfo}>
                    <Text style={styles.performanceGradeLabel}>
                      {performanceSummary.summary?.averageGradeLabel}
                    </Text>
                    <Text style={styles.performanceGradeSubtext}>
                      میانگین {performanceSummary.summary?.totalEvaluations}{" "}
                      ارزیابی
                    </Text>
                    <View
                      style={[
                        styles.trendBadge,
                        {
                          backgroundColor:
                            getTrendColor(
                              performanceSummary.summary?.trend || "STABLE",
                            ) + "20",
                        },
                      ]}
                    >
                      <Ionicons
                        name={getTrendIcon(
                          performanceSummary.summary?.trend || "STABLE",
                        )}
                        size={16}
                        color={getTrendColor(
                          performanceSummary.summary?.trend || "STABLE",
                        )}
                      />
                      <Text
                        style={[
                          styles.trendText,
                          {
                            color: getTrendColor(
                              performanceSummary.summary?.trend || "STABLE",
                            ),
                          },
                        ]}
                      >
                        {performanceSummary.summary?.trendLabel}
                      </Text>
                    </View>
                  </View>
                </View>

                {performanceSummary.categoryAverages && (
                  <View style={styles.categoryAveragesContainer}>
                    <Text style={styles.categoryAveragesTitle}>
                      میانگین دسته‌ها
                    </Text>
                    <ScoreBar
                      label="تدریس"
                      score={performanceSummary.categoryAverages.teaching}
                      color="#3b82f6"
                    />
                    <ScoreBar
                      label="نظم و انضباط"
                      score={performanceSummary.categoryAverages.discipline}
                      color="#8b5cf6"
                    />
                    <ScoreBar
                      label="ارتباطات"
                      score={performanceSummary.categoryAverages.communication}
                      color="#10b981"
                    />
                    <ScoreBar
                      label="حرفه‌ای"
                      score={performanceSummary.categoryAverages.professional}
                      color="#f59e0b"
                    />
                    <ScoreBar
                      label="رابطه با شاگردان"
                      score={
                        performanceSummary.categoryAverages.studentRelation
                      }
                      color="#ec4899"
                    />
                  </View>
                )}
              </View>
            )}

            {evaluations.length > 0 && (
              <View style={styles.evaluationsListContainer}>
                <Text style={styles.evaluationsListTitle}>
                  تاریخچه ارزیابی‌ها ({evaluations.length})
                </Text>

                {displayedEvaluations.map((evaluation) => (
                  <TouchableOpacity
                    key={evaluation.id}
                    style={styles.evaluationItem}
                    onPress={() => handleViewEvaluation(evaluation.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.evaluationItemHeader}>
                      <View style={styles.evaluationItemLeft}>
                        <View
                          style={[
                            styles.evaluationScoreBadge,
                            {
                              backgroundColor:
                                getGradeColor(evaluation.grade) + "15",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.evaluationScoreText,
                              { color: getGradeColor(evaluation.grade) },
                            ]}
                          >
                            {evaluation.percentage}%
                          </Text>
                        </View>
                        <View style={styles.evaluationItemInfo}>
                          <Text style={styles.evaluationTemplateName}>
                            {evaluation.templateName}
                          </Text>
                          <Text style={styles.evaluationMeta}>
                            {getPeriodLabelFarsi(evaluation.period)} •{" "}
                            {evaluation.academicYear || "—"}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.evaluationStatusBadge,
                          {
                            backgroundColor:
                              getStatusColor(evaluation.status) + "20",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.evaluationStatusText,
                            { color: getStatusColor(evaluation.status) },
                          ]}
                        >
                          {getStatusLabelFarsi(evaluation.status)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.evaluationItemFooter}>
                      <View style={styles.evaluationItemFooterLeft}>
                        <Ionicons
                          name="person-outline"
                          size={14}
                          color="#64748b"
                        />
                        <Text style={styles.evaluationFooterText}>
                          {evaluation.evaluatorName}
                        </Text>
                      </View>
                      <View style={styles.evaluationItemFooterRight}>
                        {evaluation.evaluatedAt && (
                          <Text style={styles.evaluationFooterText}>
                            {new Date(
                              evaluation.evaluatedAt,
                            ).toLocaleDateString("fa-IR")}
                          </Text>
                        )}
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="#94a3b8"
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}

                {evaluations.length > 3 && (
                  <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => setShowAllEvaluations(!showAllEvaluations)}
                  >
                    <Text style={styles.showMoreText}>
                      {showAllEvaluations
                        ? "نمایش کمتر"
                        : `نمایش همه (${evaluations.length})`}
                    </Text>
                    <Ionicons
                      name={showAllEvaluations ? "chevron-up" : "chevron-down"}
                      size={16}
                      color="#8b5cf6"
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {performanceSummary?.latestEvaluation && (
              <TouchableOpacity
                style={styles.reportCardButton}
                onPress={() =>
                  handleViewReportCard(performanceSummary.latestEvaluation!.id)
                }
              >
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#8b5cf6"
                />
                <Text style={styles.reportCardButtonText}>
                  مشاهده کارنامه آخرین ارزیابی
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#8b5cf6" />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      {/* ==================== ATTENDANCE SECTION ==================== */}
      <View style={styles.infoCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="time-outline" size={22} color="#0ea5e9" />
            <Text style={styles.sectionTitle}>حضور و غیاب ماهانه</Text>
          </View>
        </View>

        {/* Window chips (recent activity) */}
        <View style={styles.rangeChipsRow}>
          {([7, 30, 60] as const).map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => {
                setAttendanceWindow(d);
                fetchTeacher(d);
              }}
              style={[
                styles.rangeChip,
                attendanceWindow === d && styles.rangeChipActive,
              ]}
            >
              <Text
                style={[
                  styles.rangeChipText,
                  attendanceWindow === d && styles.rangeChipTextActive,
                ]}
              >
                {d === 7
                  ? "۷ روز اخیر"
                  : d === 30
                    ? "۳۰ روز اخیر"
                    : "۶۰ روز اخیر"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary of the recent window */}
        <View style={styles.attendanceStatsRow}>
          <View style={styles.attendanceStatBox}>
            <Text style={styles.attendanceStatValue}>
              {teacher.attendance?.summary?.totalDaysPresent || 0}
            </Text>
            <Text style={styles.attendanceStatLabel}>روز حضور (بازه)</Text>
          </View>
          <View style={styles.attendanceStatBox}>
            <Text style={styles.attendanceStatValue}>
              {teacher.attendance?.summary?.totalScans || 0}
            </Text>
            <Text style={styles.attendanceStatLabel}>ثبت ورود/خروج</Text>
          </View>
          <View style={styles.attendanceStatBox}>
            <Text style={styles.attendanceStatValue}>
              {attendanceDays.length > 0
                ? (
                    attendanceDays.reduce(
                      (s, d) => s + (d.hoursWorked || 0),
                      0,
                    ) / attendanceDays.length
                  ).toFixed(1)
                : "0.0"}
            </Text>
            <Text style={styles.attendanceStatLabel}>میانگین ساعت</Text>
          </View>
        </View>

        {/* ============ MONTHLY BREAKDOWN ============ */}
        <Text style={styles.monthlyBreakdownTitle}>خلاصه ماه‌های سال</Text>

        {monthlyBreakdown.length === 0 ? (
          <View style={styles.emptyEvalContainer}>
            <Ionicons name="calendar-clear-outline" size={40} color="#cbd5e1" />
            <Text style={styles.emptyEvalTitle}>
              هیچ رکورد حضوری برای این سال ثبت نشده
            </Text>
          </View>
        ) : (
          monthlyBreakdown.map((m) => (
            <View
              key={`${m.shamsiYear}-${m.shamsiMonth}`}
              style={styles.monthRow}
            >
              <View style={styles.monthHeaderRow}>
                <View style={styles.monthBadge}>
                  <Text style={styles.monthBadgeText}>{m.monthName}</Text>
                  <Text style={styles.monthBadgeYear}>{m.shamsiYear}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.monthTitleText}>
                    {m.daysPresent} / {m.workingDays} روز حضور
                  </Text>
                  <View style={styles.monthProgressTrack}>
                    <View
                      style={[
                        styles.monthProgressFill,
                        {
                          width: `${Math.min(m.attendanceRate, 100)}%`,
                          backgroundColor:
                            m.attendanceRate >= 80
                              ? "#10b981"
                              : m.attendanceRate >= 50
                                ? "#f59e0b"
                                : "#ef4444",
                        },
                      ]}
                    />
                  </View>
                </View>
                <Text
                  style={[
                    styles.monthRateText,
                    {
                      color:
                        m.attendanceRate >= 80
                          ? "#10b981"
                          : m.attendanceRate >= 50
                            ? "#f59e0b"
                            : "#ef4444",
                    },
                  ]}
                >
                  {m.attendanceRate}%
                </Text>
              </View>

              <View style={styles.monthStatsRow}>
                <View
                  style={[styles.monthStatChip, { backgroundColor: "#d1fae5" }]}
                >
                  <Ionicons name="checkmark-circle" size={14} color="#047857" />
                  <Text style={[styles.monthStatValue, { color: "#047857" }]}>
                    {m.daysPresent}
                  </Text>
                  <Text style={styles.monthStatLabel}>حاضر</Text>
                </View>
                <View
                  style={[styles.monthStatChip, { backgroundColor: "#fef3c7" }]}
                >
                  <Ionicons name="time" size={14} color="#92400e" />
                  <Text style={[styles.monthStatValue, { color: "#92400e" }]}>
                    {m.lateDays}
                  </Text>
                  <Text style={styles.monthStatLabel}>تأخیر</Text>
                </View>
                <View
                  style={[styles.monthStatChip, { backgroundColor: "#fee2e2" }]}
                >
                  <Ionicons name="close-circle" size={14} color="#dc2626" />
                  <Text style={[styles.monthStatValue, { color: "#dc2626" }]}>
                    {m.absentDays}
                  </Text>
                  <Text style={styles.monthStatLabel}>غایب</Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* ============ RECENT DAILY LIST ============ */}
        <Text style={[styles.monthlyBreakdownTitle, { marginTop: 16 }]}>
          رکوردهای اخیر ({attendanceWindow} روز)
        </Text>

        {attendanceDays.length === 0 ? (
          <View style={styles.emptyEvalContainer}>
            <Ionicons name="calendar-clear-outline" size={40} color="#cbd5e1" />
            <Text style={styles.emptyEvalTitle}>
              هیچ رکورد حضوری در این بازه نیست
            </Text>
          </View>
        ) : (
          attendanceDays.slice(0, 15).map((day) => (
            <View key={day.date} style={styles.attendanceDayRow}>
              <View style={styles.attendanceDateBadge}>
                <Text style={styles.attendanceDayNum}>
                  {new Date(day.date).getDate()}
                </Text>
                <Text style={styles.attendanceDayMonth}>
                  {new Date(day.date).toLocaleDateString("fa-AF", {
                    month: "short",
                  })}
                </Text>
              </View>
              <View style={styles.attendanceTimesCol}>
                <View style={styles.attendanceTimeRow}>
                  <Ionicons name="log-in-outline" size={14} color="#10b981" />
                  <Text style={styles.attendanceTimeLabel}>ورود</Text>
                  <Text style={styles.attendanceTimeValue}>
                    {formatTime(day.checkIn)}
                  </Text>
                </View>
                <View style={styles.attendanceTimeRow}>
                  <Ionicons name="log-out-outline" size={14} color="#ef4444" />
                  <Text style={styles.attendanceTimeLabel}>خروج</Text>
                  <Text style={styles.attendanceTimeValue}>
                    {formatTime(day.checkOut)}
                  </Text>
                </View>
              </View>
              <View style={styles.hoursBadge}>
                <Text style={styles.hoursText}>
                  {day.hoursWorked ? `${day.hoursWorked}h` : "—"}
                </Text>
              </View>
            </View>
          ))
        )}

        {attendanceDays.length > 15 && (
          <Text style={styles.moreRecordsHint}>
            نمایش ۱۵ رکورد اخیر از {attendanceDays.length}
          </Text>
        )}
      </View>

      {/* ==================== WEEKLY SCHEDULE ==================== */}
      <View style={styles.infoCard}>
        <View style={styles.sectionHeaderLeft}>
          <Ionicons name="calendar-outline" size={22} color="#5856d6" />
          <Text
            style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}
          >
            جدول هفتگی
          </Text>
        </View>

        {teacher.timetable?.length === 0 ? (
          <View style={styles.emptyEvalContainer}>
            <Ionicons name="calendar-clear-outline" size={40} color="#cbd5e1" />
            <Text style={styles.emptyEvalTitle}>جدولی ثبت نشده</Text>
          </View>
        ) : (
          weekDays.map((dayName) => {
            const entries = timetableByDay[dayName] || [];
            if (entries.length === 0) return null;
            return (
              <View key={dayName} style={styles.scheduleDayBlock}>
                <Text style={styles.scheduleDayTitle}>{dayName}</Text>
                {entries.map((entry) => (
                  <View key={entry.id} style={styles.scheduleRow}>
                    <View style={styles.schedulePeriodBadge}>
                      <Text style={styles.schedulePeriodText}>
                        {entry.period + 1}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.scheduleSubject}>
                        {entry.subject}
                      </Text>
                      <Text style={styles.scheduleMeta}>
                        {entry.className} • {entry.time}
                      </Text>
                    </View>
                    {entry.room ? (
                      <View style={styles.roomBadge}>
                        <Text style={styles.roomText}>{entry.room}</Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            );
          })
        )}
      </View>

      {/* ==================== SALARY SECTION ==================== */}
      <View style={styles.infoCard}>
        <View style={styles.sectionHeaderLeft}>
          <Ionicons name="cash-outline" size={22} color="#10b981" />
          <Text
            style={[styles.sectionTitle, { marginLeft: 8, marginBottom: 0 }]}
          >
            معاشات
          </Text>
        </View>

        <View style={styles.salarySummaryRow}>
          <View
            style={[styles.salarySummaryCard, { backgroundColor: "#d1fae5" }]}
          >
            <Text style={styles.salarySummaryLabel}>پرداخت شده</Text>
            <Text style={[styles.salarySummaryValue, { color: "#047857" }]}>
              {formatCurrency(teacher.salarySummary?.totalPaid || 0)}
            </Text>
          </View>
          <View
            style={[styles.salarySummaryCard, { backgroundColor: "#fef3c7" }]}
          >
            <Text style={styles.salarySummaryLabel}>در انتظار</Text>
            <Text style={[styles.salarySummaryValue, { color: "#92400e" }]}>
              {formatCurrency(teacher.salarySummary?.totalPending || 0)}
            </Text>
          </View>
        </View>

        {teacher.Salary?.length === 0 ? (
          <View style={styles.emptyEvalContainer}>
            <Ionicons name="cash-outline" size={40} color="#cbd5e1" />
            <Text style={styles.emptyEvalTitle}>
              هیچ رکورد معاشی وجود ندارد
            </Text>
          </View>
        ) : (
          teacher.Salary.map((s) => (
            <View key={s.id} style={styles.salaryItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.salaryMonth}>
                  {getMonthName(s.month)} {s.year}
                </Text>
                {s.overtimeAmount > 0 && (
                  <Text style={styles.salaryNote}>
                    اضافه‌کاری: {formatCurrency(s.overtimeAmount)} (
                    {s.overtimeHours}h)
                  </Text>
                )}
                {s.bonusAmount > 0 && (
                  <Text style={styles.salaryNote}>
                    پاداش: {formatCurrency(s.bonusAmount)}
                  </Text>
                )}
                {s.deductionAmount > 0 && (
                  <Text style={[styles.salaryNote, { color: "#dc2626" }]}>
                    کسر: {formatCurrency(s.deductionAmount)}
                  </Text>
                )}
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.salaryAmount}>
                  {formatCurrency(s.finalAmount || s.amount)}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        s.status === "PAID" ? "#d1fae5" : "#fef3c7",
                      marginTop: 4,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: s.status === "PAID" ? "#10b981" : "#f59e0b",
                        fontSize: 11,
                      },
                    ]}
                  >
                    {labelize(s.status)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* ==================== PERSONAL INFO ==================== */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>معلومات شخصی</Text>

        <InfoRow
          icon="person-outline"
          label="نام کامل"
          value={user?.fullName}
        />
        {user?.nameFarsi ? (
          <InfoRow
            icon="language-outline"
            label="نام به دری"
            value={user.nameFarsi}
          />
        ) : null}
        <InfoRow
          icon="male-female-outline"
          label="جنسیت"
          value={labelize(user?.sex || "")}
        />
        <InfoRow
          icon="calendar-outline"
          label="تاریخ تولد"
          value={formatDate(user?.birthDate)}
        />
        <InfoRow
          icon="location-outline"
          label="محل تولد"
          value={user?.birthPlace}
        />
        <InfoRow
          icon="water-outline"
          label="گروه خون"
          value={labelize(user?.bloodType || "")}
        />
        <InfoRow
          icon="heart-outline"
          label="وضعیت تأهل"
          value={labelize(user?.maritalStatus || "")}
        />
        <InfoRow icon="flag-outline" label="ملیت" value={user?.nationality} />
        <InfoRow
          icon="person-outline"
          label="نام پدر"
          value={user?.fatherName}
        />
        <InfoRow
          icon="person-outline"
          label="نام پدرکلان"
          value={user?.grandfatherName}
        />
        <InfoRow
          icon="card-outline"
          label="شماره تذکره"
          value={user?.civilId}
        />
        <InfoRow
          icon="calendar-outline"
          label="تاریخ صدور تذکره"
          value={formatDate(user?.civilIdIssueDate)}
        />
        <InfoRow
          icon="calendar-outline"
          label="تاریخ انقضای تذکره"
          value={formatDate(user?.civilIdExpiryDate)}
        />
      </View>

      {/* ==================== CONTACT INFO ==================== */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>اطلاعات تماس</Text>
        <InfoRow icon="mail-outline" label="ایمیل" value={user?.email} />
        <InfoRow icon="call-outline" label="تلفن" value={user?.phone} />
        <InfoRow
          icon="home-outline"
          label="آدرس فعلی"
          value={user?.currentAddress}
        />
        <InfoRow
          icon="home-outline"
          label="آدرس دایمی"
          value={user?.permanentAddress}
        />
      </View>

      {/* ==================== EMERGENCY CONTACT ==================== */}
      {(user?.emergencyContactName || user?.emergencyContactPhone) && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>تماس اضطراری</Text>
          <InfoRow
            icon="person-outline"
            label="نام"
            value={user?.emergencyContactName}
          />
          <InfoRow
            icon="call-outline"
            label="تلفن"
            value={user?.emergencyContactPhone}
          />
          <InfoRow
            icon="git-network-outline"
            label="نسبت"
            value={user?.emergencyContactRelation}
          />
        </View>
      )}

      {/* ==================== PROFESSIONAL INFO ==================== */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>معلومات حرفه‌ای</Text>
        <InfoRow
          icon="card-outline"
          label="کد استاد"
          value={teacher.teacherCode}
        />
        <InfoRow
          icon="calendar-outline"
          label="تاریخ پیوستن"
          value={formatDate(teacher.joiningDate)}
        />
        {teacher.experience ? (
          <InfoRow
            icon="briefcase-outline"
            label="تجربه"
            value={teacher.experience}
          />
        ) : null}
        {teacher.teachingExperience ? (
          <InfoRow
            icon="briefcase-outline"
            label="سال‌های تدریس"
            value={`${teacher.teachingExperience} سال`}
          />
        ) : null}
        {teacher.certification ? (
          <InfoRow
            icon="document-outline"
            label="تصدیق‌نامه"
            value={teacher.certification}
          />
        ) : null}
        {teacher.languageSkills ? (
          <InfoRow
            icon="language-outline"
            label="زبان‌ها"
            value={teacher.languageSkills}
          />
        ) : null}
        {teacher.awards ? (
          <InfoRow icon="trophy-outline" label="جوایز" value={teacher.awards} />
        ) : null}
        {teacher.publications ? (
          <InfoRow
            icon="book-outline"
            label="انتشارات"
            value={teacher.publications}
          />
        ) : null}
        {teacher.baseSalary > 0 && (
          <InfoRow
            icon="cash-outline"
            label="معاش پایه"
            value={formatCurrency(teacher.baseSalary)}
          />
        )}
      </View>

      {/* ==================== CONTRACT & INSURANCE ==================== */}
      {(user?.hasContract || user?.hasInsurance) && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>قرارداد و بیمه</Text>
          {user?.hasContract && (
            <>
              <InfoRow
                icon="document-text-outline"
                label="نوع قرارداد"
                value={labelize(user?.contractType || "")}
              />
              <InfoRow
                icon="calendar-outline"
                label="شروع قرارداد"
                value={formatDate(user?.contractStartDate)}
              />
              <InfoRow
                icon="calendar-outline"
                label="پایان قرارداد"
                value={formatDate(
                  user?.contractEndDate || teacher.contractEndDate,
                )}
              />
            </>
          )}
          {user?.hasInsurance && (
            <>
              <InfoRow
                icon="shield-checkmark-outline"
                label="شرکت بیمه"
                value={user?.insuranceProvider}
              />
              <InfoRow
                icon="card-outline"
                label="شماره بیمه"
                value={user?.insuranceNumber}
              />
            </>
          )}
        </View>
      )}

      {/* ==================== EDUCATION ==================== */}
      {(user?.educationLevel ||
        user?.educationField ||
        user?.educationInstitution) && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>تحصیلات</Text>
          <InfoRow
            icon="school-outline"
            label="سطح"
            value={labelize(user?.educationLevel || "")}
          />
          <InfoRow
            icon="book-outline"
            label="رشته"
            value={user?.educationField}
          />
          <InfoRow
            icon="business-outline"
            label="مؤسسه"
            value={user?.educationInstitution}
          />
          {user?.graduationYear ? (
            <InfoRow
              icon="calendar-outline"
              label="سال فراغت"
              value={user.graduationYear}
            />
          ) : null}
        </View>
      )}

      {/* ==================== BANK INFO ==================== */}
      {(user?.bankName || user?.bankAccountNumber) && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>معلومات بانکی</Text>
          <InfoRow
            icon="business-outline"
            label="بانک"
            value={user?.bankName}
          />
          <InfoRow
            icon="card-outline"
            label="شماره حساب"
            value={user?.bankAccountNumber}
          />
          <InfoRow
            icon="cash-outline"
            label="واحد پول"
            value={user?.salaryCurrency || "AFN"}
          />
        </View>
      )}

      {/* ==================== SUBJECTS ==================== */}
      {teacher.subjects.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>مواد درسی</Text>
          <View style={styles.subjectsContainer}>
            {teacher.subjects.map((subject, index) => (
              <View key={index} style={styles.subjectTag}>
                <Text style={styles.subjectText}>{subject}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ==================== CLASSES ==================== */}
      {teacher.Class && teacher.Class.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>صنوف تدریس</Text>
          {teacher.Class.map((cls) => (
            <View key={cls.id} style={styles.classInfoCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.className}>
                  {cls.name} {cls.section || ""}
                </Text>
                <Text style={styles.classStudents}>
                  تعداد شاگردان: {cls._count?.Student ?? 0}
                </Text>
              </View>
              <Ionicons name="school-outline" size={24} color="#3b82f6" />
            </View>
          ))}
        </View>
      )}

      {/* ==================== NOTES ==================== */}
      {user?.notes ? (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>یادداشت‌ها</Text>
          <Text style={styles.notesText}>{user.notes}</Text>
        </View>
      ) : null}

      {/* ==================== ACTIONS ==================== */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#3b82f6" }]}
          onPress={() =>
            router.push({
              pathname: "/(principal)/teachers/[id]/edit",
              params: { id },
            } as any)
          }
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>ویرایش اطلاعات</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  content: { padding: 16, paddingBottom: 40 },
  backButton: { marginBottom: 16 },

  // Profile
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#3b82f6",
    fontFamily: "VazirBold",
  },
  teacherName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  farsiName: {
    fontSize: 16,
    color: "#475569",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  specializationText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 13, fontWeight: "600", fontFamily: "Vazir" },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f59e0b",
    fontFamily: "VazirBold",
  },
  kpiRow: { flexDirection: "row", marginTop: 16, gap: 8, width: "100%" },
  kpiItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    paddingVertical: 10,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  kpiLabel: {
    fontSize: 11,
    color: "#64748b",
    fontFamily: "Vazir",
    marginTop: 2,
  },

  // Cards
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 8 },

  // Info rows
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
    width: 100,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Vazir",
    textAlign: "right",
  },

  // Evaluation (kept from original)
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "VazirBold",
  },
  evalLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8,
  },
  evalLoadingText: { fontSize: 14, color: "#64748b", fontFamily: "Vazir" },
  emptyEvalContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyEvalTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 12,
    fontFamily: "VazirBold",
    textAlign: "center",
  },
  emptyEvalSubtitle: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 6,
    textAlign: "center",
    fontFamily: "Vazir",
  },
  performanceSummaryCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  performanceMainRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  performanceInfo: { flex: 1 },
  performanceGradeLabel: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  performanceGradeSubtext: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginTop: 8,
  },
  trendText: { fontSize: 12, fontWeight: "600", fontFamily: "VazirBold" },
  categoryAveragesContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  categoryAveragesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  scoreBarContainer: { marginBottom: 10 },
  scoreBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  scoreBarLabel: { fontSize: 13, color: "#475569", fontFamily: "Vazir" },
  scoreBarValue: { fontSize: 13, fontWeight: "700", fontFamily: "VazirBold" },
  scoreBarTrack: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  scoreBarFill: { height: "100%", borderRadius: 4 },
  evaluationsListContainer: { marginTop: 8 },
  evaluationsListTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  evaluationItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  evaluationItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  evaluationItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  evaluationScoreBadge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  evaluationScoreText: {
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  evaluationItemInfo: { flex: 1 },
  evaluationTemplateName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  evaluationMeta: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  evaluationStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  evaluationStatusText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "VazirBold",
  },
  evaluationItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  evaluationItemFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  evaluationItemFooterRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  evaluationFooterText: { fontSize: 12, color: "#64748b", fontFamily: "Vazir" },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 4,
  },
  showMoreText: {
    fontSize: 13,
    color: "#8b5cf6",
    fontWeight: "600",
    fontFamily: "VazirBold",
  },
  reportCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3e8ff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e9d5ff",
  },
  reportCardButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },

  // Attendance
  rangeChipsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  rangeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  rangeChipActive: { backgroundColor: "#0ea5e9" },
  rangeChipText: { fontSize: 12, color: "#64748b", fontFamily: "Vazir" },
  rangeChipTextActive: { color: "#fff", fontFamily: "VazirBold" },
  attendanceStatsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  attendanceStatBox: {
    flex: 1,
    backgroundColor: "#f0f9ff",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  attendanceStatValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0369a1",
    fontFamily: "VazirBold",
  },
  attendanceStatLabel: {
    fontSize: 11,
    color: "#64748b",
    fontFamily: "Vazir",
    marginTop: 2,
  },
  attendanceDayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  attendanceDateBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  attendanceDayNum: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e40af",
    fontFamily: "VazirBold",
  },
  attendanceDayMonth: { fontSize: 10, color: "#3b82f6", fontFamily: "Vazir" },
  attendanceTimesCol: { flex: 1, gap: 4 },
  attendanceTimeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  attendanceTimeLabel: {
    fontSize: 11,
    color: "#64748b",
    fontFamily: "Vazir",
    width: 36,
  },
  attendanceTimeValue: {
    fontSize: 13,
    color: "#1e293b",
    fontFamily: "Vazir",
    fontWeight: "600",
  },
  hoursBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#d1fae5",
  },
  hoursText: { fontSize: 12, color: "#047857", fontFamily: "VazirBold" },
  moreRecordsHint: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
    textAlign: "center",
    marginTop: 8,
  },

  // Monthly breakdown
  monthlyBreakdownTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    fontFamily: "VazirBold",
    marginTop: 12,
    marginBottom: 8,
  },
  monthRow: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  monthHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  monthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    minWidth: 60,
  },
  monthBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6d28d9",
    fontFamily: "VazirBold",
  },
  monthBadgeYear: {
    fontSize: 10,
    color: "#8b5cf6",
    fontFamily: "Vazir",
    marginTop: 1,
  },
  monthTitleText: {
    fontSize: 12,
    color: "#475569",
    fontFamily: "Vazir",
    marginBottom: 4,
  },
  monthProgressTrack: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  monthProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  monthRateText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "VazirBold",
    minWidth: 40,
    textAlign: "right",
  },
  monthStatsRow: {
    flexDirection: "row",
    gap: 8,
  },
  monthStatChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    gap: 4,
  },
  monthStatValue: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  monthStatLabel: {
    fontSize: 10,
    color: "#64748b",
    fontFamily: "Vazir",
  },

  // Schedule
  scheduleDayBlock: { marginTop: 12 },
  scheduleDayTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
    fontFamily: "VazirBold",
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    marginBottom: 6,
  },
  schedulePeriodBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#5856d6",
    alignItems: "center",
    justifyContent: "center",
  },
  schedulePeriodText: { fontSize: 12, color: "#fff", fontFamily: "VazirBold" },
  scheduleSubject: { fontSize: 13, color: "#1e293b", fontFamily: "VazirBold" },
  scheduleMeta: {
    fontSize: 11,
    color: "#64748b",
    fontFamily: "Vazir",
    marginTop: 2,
  },
  roomBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#ede9fe",
  },
  roomText: { fontSize: 11, color: "#8b5cf6", fontFamily: "Vazir" },

  // Salary
  salarySummaryRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  salarySummaryCard: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  salarySummaryLabel: { fontSize: 12, color: "#64748b", fontFamily: "Vazir" },
  salarySummaryValue: {
    fontSize: 15,
    fontFamily: "VazirBold",
    marginTop: 4,
    fontWeight: "700",
  },
  salaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  salaryMonth: {
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Vazir",
    fontWeight: "600",
  },
  salaryNote: {
    fontSize: 11,
    color: "#64748b",
    fontFamily: "Vazir",
    marginTop: 2,
  },
  salaryAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },

  // Subjects / Classes
  subjectsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  subjectTag: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  subjectText: { fontSize: 13, color: "#8b5cf6", fontFamily: "Vazir" },
  classInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  className: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  classStudents: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },

  // Notes
  notesText: {
    fontSize: 13,
    color: "#475569",
    fontFamily: "Vazir",
    lineHeight: 20,
  },

  // Actions
  actionContainer: { flexDirection: "row", gap: 12, marginTop: 8 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  // eslint-disable-next-line no-unused-expressions
});
