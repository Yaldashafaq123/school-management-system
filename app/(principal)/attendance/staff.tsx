/* eslint-disable react-hooks/set-state-in-effect */
// app/(principal)/attendance/staff.tsx
// Mirrors the HR attendance screen's look & behavior, scoped to teachers
import { principalApi } from "@/src/config/principalApi";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ==================== SHAMSI HELPERS (identical to HR) ====================

const SHAMSI_MONTH_NAMES: Record<number, string> = {
  1: "حمل",
  2: "ثور",
  3: "جوزا",
  4: "سرطان",
  5: "اسد",
  6: "سنبله",
  7: "میزان",
  8: "عقرب",
  9: "قوس",
  10: "جدی",
  11: "دلو",
  12: "حوت",
};

const SHAMSI_WEEKDAYS: Record<number, string> = {
  0: "یکشنبه",
  1: "دوشنبه",
  2: "سه‌شنبه",
  3: "چهارشنبه",
  4: "پنجشنبه",
  5: "جمعه",
  6: "شنبه",
};

function toShamsiParts(date: Date) {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();

  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  const gy2 = gy <= 1600 ? gy - 621 : gy - 1600;
  let days =
    gy <= 1600
      ? 365 * gy2 + Math.floor(gy2 / 4) + gd + g_d_m[gm - 1]
      : 365 * gy2 +
        Math.floor((gy2 + 3) / 4) -
        Math.floor((gy2 + 99) / 100) +
        Math.floor((gy2 + 399) / 400) -
        80 +
        gd +
        g_d_m[gm - 1];

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

  return {
    year: jy,
    month: jm,
    day: jd,
    monthName: SHAMSI_MONTH_NAMES[jm] || "",
    weekday: SHAMSI_WEEKDAYS[date.getDay()] || "",
  };
}

function toPersianDigits(input: number | string): string {
  return String(input).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);
}

function formatShamsiDate(date: Date): string {
  const s = toShamsiParts(date);
  return `${s.weekday}، ${toPersianDigits(s.day)} ${s.monthName} ${toPersianDigits(s.year)}`;
}

function shamsiToDateString(jy: number, jm: number, jd: number) {
  return `${jy}-${String(jm).padStart(2, "0")}-${String(jd).padStart(2, "0")}`;
}

function getShamsiMonthDays(month: number, year: number) {
  if (month === 12) {
    // crude leap check — most years this is fine
    const rem = ((year * 0.25 + 0.216) % 1) * 100;
    return rem < 1 ? 30 : 29;
  }
  return month <= 6 ? 31 : 30;
}

// ==================== PUNCH HELPERS ====================

const PUNCH_COLORS: Record<number, string> = {
  0: "#10b981",
  1: "#ef4444",
  2: "#f59e0b",
  3: "#8b5cf6",
  4: "#3b82f6",
  5: "#ec4899",
};

const PUNCH_ICONS: Record<number, string> = {
  0: "log-in-outline",
  1: "log-out-outline",
  2: "exit-outline",
  3: "enter-outline",
  4: "timer-outline",
  5: "timer-outline",
};

function getPunchColor(t: number | null | undefined): string {
  if (t === null || t === undefined) return "#94a3b8";
  return PUNCH_COLORS[t] || "#94a3b8";
}
function getPunchIcon(t: number | null | undefined): string {
  if (t === null || t === undefined) return "help-circle-outline";
  return PUNCH_ICONS[t] || "help-circle-outline";
}

// ==================== TYPES ====================

type TeacherRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  staffType: string;
  position: string | null;
  teacherCode?: string | null;
  status: "present" | "absent" | "late";
  hasCheckIn: boolean;
  hasCheckOut: boolean;
  isLate: boolean;
  isOnTime: boolean;
  firstCheckIn: { time: string; dateShamsi: string } | null;
  lastPunch: {
    type: number;
    label: string;
    labelFa: string;
    time: string;
  } | null;
  totalPunches: number;
  records: {
    punchType: number;
    labelFa: string;
    time: string;
    device: string | null;
  }[];
};

type TeacherMonthlyRow = {
  staffId: number;
  name: string;
  role: string;
  staffType: string;
  position: string | null;
  teacherCode?: string | null;
  daysPresent: number;
  lateDays: number;
  totalDays: number;
  attendanceRate: number;
  totalPunches: number;
};

// ==================== MAIN COMPONENT ====================

export default function PrincipalAttendanceScreen() {
  const [tab, setTab] = useState<"daily" | "monthly">("daily");

  // Bootstrap today's Shamsi from the server (avoids client drift)
  const [todayShamsi, setTodayShamsi] = useState<{
    year: number;
    month: number;
    day: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await principalApi.getStaffAttendanceByDate("");
        if (res.success && res.data) {
          const d: any = res.data;
          setTodayShamsi({
            year: d.shamsiYear,
            month: d.shamsiMonth,
            day: d.shamsiDay ?? 1,
          });
        }
      } catch {
        // fallback to client calc if endpoint fails
        const s = toShamsiParts(new Date());
        setTodayShamsi({ year: s.year, month: s.month, day: s.day });
      }
    })();
  }, []);

  if (!todayShamsi) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>در حال آماده‌سازی...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>حضور و غیاب استادان</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Tab switch */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "daily" && styles.tabBtnActive]}
          onPress={() => setTab("daily")}
        >
          <Text
            style={[
              styles.tabBtnText,
              tab === "daily" && styles.tabBtnTextActive,
            ]}
          >
            گزارش روزانه
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "monthly" && styles.tabBtnActive]}
          onPress={() => setTab("monthly")}
        >
          <Text
            style={[
              styles.tabBtnText,
              tab === "monthly" && styles.tabBtnTextActive,
            ]}
          >
            گزارش ماهانه
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "daily" ? (
        <DailyTab
          initialYear={todayShamsi.year}
          initialMonth={todayShamsi.month}
          initialDay={todayShamsi.day}
        />
      ) : (
        <MonthlyTab
          initialYear={todayShamsi.year}
          initialMonth={todayShamsi.month}
        />
      )}
    </View>
  );
}

// ==================== DAILY TAB ====================

function DailyTab({
  initialYear,
  initialMonth,
  initialDay,
}: {
  initialYear: number;
  initialMonth: number;
  initialDay: number;
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [day, setDay] = useState(initialDay);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [detailTeacher, setDetailTeacher] = useState<TeacherRow | null>(null);
  const [detailMonthly, setDetailMonthly] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const isToday =
    year === initialYear && month === initialMonth && day === initialDay;

  const fetchData = useCallback(async () => {
    try {
      const res = await principalApi.getStaffAttendanceByDate(
        shamsiToDateString(year, month, day),
      );
      if (res.success) setData(res.data);
    } catch (e) {
      console.error("Daily attendance error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [year, month, day]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const changeDay = (delta: number) => {
    let d = day + delta;
    let m = month;
    let y = year;
    const daysInMonth = getShamsiMonthDays(month, year);
    if (d < 1) {
      m -= 1;
      if (m < 1) {
        m = 12;
        y -= 1;
      }
      d = getShamsiMonthDays(m, y);
    } else if (d > daysInMonth) {
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
      d = 1;
    }
    // block future
    if (
      y > initialYear ||
      (y === initialYear && m > initialMonth) ||
      (y === initialYear && m === initialMonth && d > initialDay)
    ) {
      return;
    }
    setYear(y);
    setMonth(m);
    setDay(d);
  };

  const openTeacherDetail = async (t: TeacherRow) => {
    setDetailTeacher(t);
    setDetailLoading(true);
    try {
      const res = await principalApi.getStaffMonthlyAttendance(t.id, {
        year,
        month,
      });
      if (res.success) setDetailMonthly(res.data);
    } catch (e) {
      console.error("Monthly teacher error:", e);
    } finally {
      setDetailLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!data?.attendance?.length) {
      Alert.alert("اطلاعات", "هیچ داده‌ای برای تولید PDF وجود ندارد");
      return;
    }
    setIsGeneratingPDF(true);
    try {
      const html = buildDailyPDF(data);
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
        width: 1200,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `حضور استادان - ${data.dateShamsi}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("موفق", `PDF در مسیر زیر ذخیره شد:\n${uri}`);
      }
    } catch (e) {
      console.error(e);
      Alert.alert("خطا", "خطا در تولید PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  const rows: TeacherRow[] = data?.attendance || [];
  const summary = data?.summary || {};
  const schoolStartTime = data?.schoolStartTime || "07:30";

  return (
    <>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
          />
        }
        ListHeaderComponent={
          <>
            {/* Date Header */}
            <View style={styles.dateHeader}>
              <TouchableOpacity
                onPress={() => changeDay(-1)}
                style={styles.navButton}
              >
                <Ionicons name="chevron-back" size={24} color="#1e293b" />
              </TouchableOpacity>
              <View style={styles.dateTextWrapper}>
                <Text style={styles.dateText}>
                  {data?.dateShamsi ||
                    `${toPersianDigits(day)} ${SHAMSI_MONTH_NAMES[month]} ${toPersianDigits(year)}`}
                </Text>
                {!isToday && (
                  <Text style={styles.dateHintText}>برای امروز ضربه بزنید</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => changeDay(1)}
                style={[styles.navButton, isToday && styles.navButtonDisabled]}
                disabled={isToday}
              >
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={isToday ? "#cbd5e1" : "#1e293b"}
                />
              </TouchableOpacity>
            </View>

            {/* Scanner status */}
            <View style={styles.scannerStatus}>
              <View style={styles.scannerDot} />
              <Text style={styles.scannerText}>
                دستگاه حضور و غیاب متصل است
              </Text>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            </View>

            {/* School start */}
            <View style={styles.schoolTimeInfo}>
              <Ionicons name="time-outline" size={16} color="#64748b" />
              <Text style={styles.schoolTimeText}>
                ساعت شروع کار: {schoolStartTime}
              </Text>
              <Text style={styles.schoolTimeSubtext}>
                (تأخیر بعد از {schoolStartTime})
              </Text>
            </View>

            {/* Teacher-only banner */}
            <View style={styles.teacherOnlyBanner}>
              <Ionicons name="school-outline" size={16} color="#8b5cf6" />
              <Text style={styles.teacherOnlyText}>
                فقط استادان ({summary.total ?? 0})
              </Text>
              {(data?.excludedNonTeachersCount ?? 0) > 0 && (
                <Text style={styles.teacherOnlyExcluded}>
                  • {data.excludedNonTeachersCount} کارمند دیگر حذف شد
                </Text>
              )}
            </View>

            {/* Summary cards */}
            <View style={styles.summaryGrid}>
              <View
                style={[styles.summaryCard, { borderLeftColor: "#10b981" }]}
              >
                <Text style={[styles.summaryValue, { color: "#10b981" }]}>
                  {summary.present ?? 0}
                </Text>
                <Text style={styles.summaryLabel}>حاضر</Text>
              </View>
              <View
                style={[styles.summaryCard, { borderLeftColor: "#f59e0b" }]}
              >
                <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>
                  {summary.late ?? 0}
                </Text>
                <Text style={styles.summaryLabel}>تأخیر</Text>
              </View>
              <View
                style={[styles.summaryCard, { borderLeftColor: "#ef4444" }]}
              >
                <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
                  {summary.absent ?? 0}
                </Text>
                <Text style={styles.summaryLabel}>غایب</Text>
              </View>
              <View
                style={[styles.summaryCard, { borderLeftColor: "#8b5cf6" }]}
              >
                <Text style={[styles.summaryValue, { color: "#8b5cf6" }]}>
                  {summary.total ?? 0}
                </Text>
                <Text style={styles.summaryLabel}>مجموع</Text>
              </View>
            </View>

            {/* Breakdown */}
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <View
                  style={[styles.breakdownDot, { backgroundColor: "#10b981" }]}
                />
                <Text style={styles.breakdownText}>
                  سر وقت: {summary.onTime ?? 0}
                </Text>
              </View>
              <View style={styles.breakdownItem}>
                <View
                  style={[styles.breakdownDot, { backgroundColor: "#f59e0b" }]}
                />
                <Text style={styles.breakdownText}>
                  تأخیر: {summary.late ?? 0}
                </Text>
              </View>
              <View style={styles.breakdownItem}>
                <View
                  style={[styles.breakdownDot, { backgroundColor: "#3b82f6" }]}
                />
                <Text style={styles.breakdownText}>
                  ثبت‌ها: {summary.totalPunches ?? 0}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#dc2626" }]}
                onPress={generatePDF}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="#fff"
                  />
                )}
                <Text style={styles.actionButtonText}>
                  {isGeneratingPDF ? "در حال ساخت..." : "PDF"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* List header */}
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>لیست حضور استادان</Text>
              <Text style={styles.listSubtitle}>
                {summary.total ?? 0} استاد • {summary.totalPunches ?? 0} ثبت
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => {
          let statusLabel = "غایب";
          let statusColor = "#ef4444";
          let statusIcon:
            | "checkmark-circle"
            | "close-circle"
            | "time"
            | "checkmark-done-circle" = "close-circle";
          let statusBgColor = "#fef2f2";

          if (item.status === "late") {
            statusLabel = "تأخیر";
            statusColor = "#f59e0b";
            statusIcon = "time";
            statusBgColor = "#fef3c7";
          } else if (item.hasCheckIn && item.hasCheckOut) {
            statusLabel = "تکمیل";
            statusColor = "#10b981";
            statusIcon = "checkmark-done-circle";
            statusBgColor = "#d1fae5";
          } else if (item.hasCheckIn) {
            statusLabel = "حاضر";
            statusColor = "#10b981";
            statusIcon = "checkmark-circle";
            statusBgColor = "#d1fae5";
          }

          const lastPunch = item.lastPunch;
          const punchColor = lastPunch
            ? getPunchColor(lastPunch.type)
            : "#94a3b8";
          const punchIcon = lastPunch
            ? getPunchIcon(lastPunch.type)
            : "help-circle-outline";

          return (
            <TouchableOpacity
              style={[styles.card, item.status === "late" && styles.cardLate]}
              onPress={() => openTeacherDetail(item)}
              activeOpacity={0.7}
            >
              <View style={styles.cardLeft}>
                <View
                  style={[
                    styles.avatar,
                    item.status === "late" && styles.avatarLate,
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      item.status === "late" && styles.avatarTextLate,
                    ]}
                  >
                    {item.name.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.staffName}>{item.name}</Text>
                  <Text style={styles.roleText}>
                    {item.teacherCode ? `${item.teacherCode} • ` : ""}
                    {item.position || "استاد"}
                  </Text>
                  {lastPunch && (
                    <View style={styles.punchInfo}>
                      <Ionicons
                        name={punchIcon as any}
                        size={14}
                        color={punchColor}
                      />
                      <Text
                        style={[styles.punchTimeText, { color: punchColor }]}
                      >
                        {lastPunch.labelFa} • {lastPunch.time}
                      </Text>
                    </View>
                  )}
                  {item.isLate && item.firstCheckIn && (
                    <View style={styles.lateInfo}>
                      <Ionicons name="time-outline" size={12} color="#f59e0b" />
                      <Text style={styles.lateInfoText}>
                        ورود: {item.firstCheckIn.time} (تأخیر)
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.cardRight}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusBgColor },
                  ]}
                >
                  <Ionicons name={statusIcon} size={14} color={statusColor} />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {statusLabel}
                  </Text>
                </View>
                {item.totalPunches > 0 && (
                  <View style={styles.punchCountBadge}>
                    <Text style={styles.punchCountText}>
                      {item.totalPunches}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>هیچ رکوردی برای این روز نیست</Text>
            <Text style={styles.emptySubtext}>
              {formatShamsiDate(new Date(year, month - 1, day))}
            </Text>
          </View>
        }
      />

      {/* Detail modal */}
      <TeacherDetailModal
        visible={!!detailTeacher}
        teacher={detailTeacher}
        monthly={detailMonthly}
        loading={detailLoading}
        onClose={() => {
          setDetailTeacher(null);
          setDetailMonthly(null);
        }}
      />
    </>
  );
}

// ==================== MONTHLY TAB ====================

function MonthlyTab({
  initialYear,
  initialMonth,
}: {
  initialYear: number;
  initialMonth: number;
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  const fetchData = useCallback(async () => {
    try {
      const res = await principalApi.getStaffAttendanceSummary({ year, month });
      if (res.success) setData(res.data);
    } catch (e) {
      console.error("Monthly summary error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  const rows: TeacherMonthlyRow[] = data?.staff || [];
  const summary = data?.summary || {};

  return (
    <ScrollView
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchData();
          }}
        />
      }
    >
      {/* Month selector */}
      <View style={styles.dateHeader}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            const m = month === 1 ? 12 : month - 1;
            setMonth(m);
            if (m === 12) setYear(year - 1);
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.dateTextWrapper}>
          <Text style={styles.dateText}>
            {SHAMSI_MONTH_NAMES[month]} {toPersianDigits(year)}
          </Text>
          <Text style={styles.dateHintText}>
            {summary.averageAttendance ?? 0}% میانگین حضور
          </Text>
        </View>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => {
            const m = month === 12 ? 1 : month + 1;
            setMonth(m);
            if (m === 1) setYear(year + 1);
          }}
        >
          <Ionicons name="chevron-forward" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      {/* Summary cards */}
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { borderLeftColor: "#8b5cf6" }]}>
          <Text style={[styles.summaryValue, { color: "#8b5cf6" }]}>
            {summary.totalStaff ?? 0}
          </Text>
          <Text style={styles.summaryLabel}>کل استادان</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: "#10b981" }]}>
          <Text style={[styles.summaryValue, { color: "#10b981" }]}>
            {summary.totalPresent ?? 0}
          </Text>
          <Text style={styles.summaryLabel}>با حضور</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: "#f59e0b" }]}>
          <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>
            {summary.totalLate ?? 0}
          </Text>
          <Text style={styles.summaryLabel}>تأخیرها</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: "#3b82f6" }]}>
          <Text style={[styles.summaryValue, { color: "#3b82f6" }]}>
            {summary.totalPunches ?? 0}
          </Text>
          <Text style={styles.summaryLabel}>ثبت‌ها</Text>
        </View>
      </View>

      {/* Table header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.th, { flex: 2 }]}>نام استاد</Text>
        <Text style={styles.th}>حضور</Text>
        <Text style={styles.th}>تأخیر</Text>
        <Text style={styles.th}>فیصدی</Text>
      </View>

      {rows.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>هیچ استادی ثبت نشد</Text>
        </View>
      ) : (
        rows.map((r) => (
          <View key={r.staffId} style={styles.tableRow}>
            <View style={{ flex: 2 }}>
              <Text style={styles.tdName}>{r.name}</Text>
              <Text style={styles.tdMeta}>
                {r.teacherCode ? `${r.teacherCode} • ` : ""}
                {r.position || "استاد"}
              </Text>
            </View>
            <Text style={[styles.td, { color: "#10b981", fontWeight: "700" }]}>
              {r.daysPresent}
            </Text>
            <Text style={[styles.td, { color: "#f59e0b", fontWeight: "700" }]}>
              {r.lateDays}
            </Text>
            <View style={styles.rateCell}>
              <View style={styles.rateBarTrack}>
                <View
                  style={[
                    styles.rateBarFill,
                    {
                      width: `${Math.min(r.attendanceRate, 100)}%`,
                      backgroundColor:
                        r.attendanceRate >= 80
                          ? "#10b981"
                          : r.attendanceRate >= 50
                            ? "#f59e0b"
                            : "#ef4444",
                    },
                  ]}
                />
              </View>
              <Text style={styles.rateText}>{r.attendanceRate}%</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

// ==================== TEACHER DETAIL MODAL ====================

function TeacherDetailModal({
  visible,
  teacher,
  monthly,
  loading,
  onClose,
}: {
  visible: boolean;
  teacher: TeacherRow | null;
  monthly: any;
  loading: boolean;
  onClose: () => void;
}) {
  if (!teacher) return null;
  const summary = monthly?.summary;
  const daily = monthly?.daily || [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>{teacher.name}</Text>
              <Text style={styles.modalSubtitle}>
                {teacher.teacherCode ? `${teacher.teacherCode} • ` : ""}
                {teacher.position || "استاد"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
          ) : summary ? (
            <ScrollView
              style={{ maxHeight: 500 }}
              contentContainerStyle={{ padding: 16, gap: 12 }}
            >
              {/* Summary grid */}
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View
                  style={[styles.detailStat, { backgroundColor: "#d1fae5" }]}
                >
                  <Text style={[styles.detailStatValue, { color: "#047857" }]}>
                    {summary.presentDays}
                  </Text>
                  <Text style={styles.detailStatLabel}>روز حضور</Text>
                </View>
                <View
                  style={[styles.detailStat, { backgroundColor: "#fef3c7" }]}
                >
                  <Text style={[styles.detailStatValue, { color: "#92400e" }]}>
                    {summary.lateDays}
                  </Text>
                  <Text style={styles.detailStatLabel}>تأخیر</Text>
                </View>
                <View
                  style={[styles.detailStat, { backgroundColor: "#fee2e2" }]}
                >
                  <Text style={[styles.detailStatValue, { color: "#991b1b" }]}>
                    {summary.absentDays}
                  </Text>
                  <Text style={styles.detailStatLabel}>غایب</Text>
                </View>
                <View
                  style={[styles.detailStat, { backgroundColor: "#e0e7ff" }]}
                >
                  <Text style={[styles.detailStatValue, { color: "#3730a3" }]}>
                    {summary.attendanceRate}%
                  </Text>
                  <Text style={styles.detailStatLabel}>فیصدی</Text>
                </View>
              </View>

              {/* Daily rows */}
              {daily
                .filter((d: any) => !d.isFriday)
                .map((d: any) => (
                  <View key={d.date} style={styles.detailDayRow}>
                    <View style={styles.detailDayBadge}>
                      <Text style={styles.detailDayNum}>
                        {toPersianDigits(d.dayNumber)}
                      </Text>
                      <Text style={styles.detailDayWeek}>{d.dayOfWeek}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      {d.isPresent ? (
                        <>
                          <Text style={styles.detailDayTimes}>
                            {d.firstScan || "—"} → {d.lastScan || "—"}
                          </Text>
                          {d.isLate && (
                            <Text style={styles.detailDayLate}>تأخیر</Text>
                          )}
                        </>
                      ) : (
                        <Text style={styles.detailDayAbsent}>غایب</Text>
                      )}
                    </View>
                    <View
                      style={[
                        styles.detailStatusPill,
                        {
                          backgroundColor: d.isPresent
                            ? d.isLate
                              ? "#fef3c7"
                              : "#d1fae5"
                            : "#fee2e2",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontFamily: "VazirBold",
                          color: d.isPresent
                            ? d.isLate
                              ? "#92400e"
                              : "#047857"
                            : "#991b1b",
                        }}
                      >
                        {d.isPresent ? (d.isLate ? "تأخیر" : "حاضر") : "غایب"}
                      </Text>
                    </View>
                  </View>
                ))}
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

// ==================== PDF BUILDER ====================

function buildDailyPDF(data: any): string {
  const rows = data.attendance || [];
  const summary = data.summary || {};
  const dateShamsi = data.dateShamsi || "";
  const schoolStartTime = data.schoolStartTime || "07:30";

  const getStatusPersian = (s: string) =>
    s === "present" ? "حاضر" : s === "late" ? "تأخیر" : "غایب";
  const getStatusColor = (s: string) =>
    s === "present" ? "#10b981" : s === "late" ? "#f59e0b" : "#ef4444";
  const getStatusBgColor = (s: string) =>
    s === "present" ? "#d1fae5" : s === "late" ? "#fef3c7" : "#fef2f2";

  const tableRows = rows
    .map(
      (r: TeacherRow) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:14px;font-weight:500;color:#1e293b;">${r.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:13px;color:#64748b;">${r.teacherCode || "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">
          <span style="display:inline-block;padding:4px 14px;border-radius:20px;background:${getStatusBgColor(r.status)};color:${getStatusColor(r.status)};font-size:12px;font-weight:600;">${getStatusPersian(r.status)}</span>
        </td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:13px;color:#1e293b;">${r.firstCheckIn ? r.firstCheckIn.time : "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:13px;color:#1e293b;">${r.lastPunch ? r.lastPunch.time : "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:13px;color:#1e293b;">${r.lastPunch ? r.lastPunch.labelFa : "—"}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:13px;color:#64748b;">${r.totalPunches || 0}</td>
      </tr>`,
    )
    .join("");

  return `
    <!DOCTYPE html><html dir="rtl" lang="fa"><head><meta charset="UTF-8">
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap');
      * { margin:0;padding:0;box-sizing:border-box;}
      body { font-family:'Vazirmatn','Vazir',sans-serif;background:#f1f5f9;padding:20px;direction:rtl; }
      .report-container{max-width:1200px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden;}
      .report-header{background:linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%);padding:30px 40px;color:#fff;}
      .report-header h1{font-size:26px;font-weight:700;margin-bottom:6px;}
      .subtitle{font-size:15px;opacity:.9;}
      .date{font-size:14px;opacity:.85;margin-top:6px;}
      .school-time-info{display:flex;align-items:center;padding:10px 40px;background:#f8fafc;border-bottom:1px solid #e2e8f0;gap:8px;font-size:14px;color:#1e293b;}
      .summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:20px 40px;background:#f8fafc;border-bottom:1px solid #e2e8f0;}
      .summary-card{background:#fff;border-radius:12px;padding:16px;text-align:center;border-right:4px solid #8b5cf6;box-shadow:0 1px 3px rgba(0,0,0,.06);}
      .summary-card .value{font-size:26px;font-weight:700;}
      .summary-card .label{font-size:13px;color:#64748b;margin-top:4px;font-weight:500;}
      .summary-card.present{border-right-color:#10b981;}.summary-card.present .value{color:#10b981;}
      .summary-card.late{border-right-color:#f59e0b;}.summary-card.late .value{color:#f59e0b;}
      .summary-card.absent{border-right-color:#ef4444;}.summary-card.absent .value{color:#ef4444;}
      .summary-card.total{border-right-color:#8b5cf6;}.summary-card.total .value{color:#8b5cf6;}
      .table-section{padding:24px 40px 40px;}
      .table-title{font-size:18px;font-weight:600;color:#1e293b;margin-bottom:16px;}
      table{width:100%;border-collapse:collapse;font-family:'Vazirmatn','Vazir',sans-serif;}
      thead{background:#f1f5f9;}
      thead th{padding:14px 12px;text-align:center;font-size:14px;font-weight:600;color:#1e293b;border-bottom:2px solid #e2e8f0;white-space:nowrap;}
      thead th:first-child{text-align:right;}
      tbody td{padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#1e293b;}
      .report-footer{padding:16px 40px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:12px;color:#94a3b8;background:#f8fafc;}
    </style></head>
    <body>
      <div class="report-container">
        <div class="report-header">
          <h1>📋 گزارش حضور و غیاب استادان</h1>
          <div class="subtitle">خلاصه وضعیت حضور استادان مکتب</div>
          <div class="date">📅 ${dateShamsi}</div>
        </div>
        <div class="school-time-info">
          <span>⏰</span><span><strong>ساعت شروع کار:</strong> ${schoolStartTime}</span>
          <span style="color:#94a3b8;font-size:12px;">(تأخیر بعد از ${schoolStartTime})</span>
        </div>
        <div class="summary-grid">
          <div class="summary-card present"><div class="value">${summary.present || 0}</div><div class="label">✅ حاضر</div></div>
          <div class="summary-card late"><div class="value">${summary.late || 0}</div><div class="label">⏰ تأخیر</div></div>
          <div class="summary-card absent"><div class="value">${summary.absent || 0}</div><div class="label">❌ غایب</div></div>
          <div class="summary-card total"><div class="value">${summary.total || 0}</div><div class="label">👥 مجموع</div></div>
        </div>
        <div class="table-section">
          <div class="table-title">📊 لیست حضور استادان</div>
          <table>
            <thead>
              <tr>
                <th>نام استاد</th>
                <th>کد استاد</th>
                <th>وضعیت</th>
                <th>زمان ورود</th>
                <th>آخرین ثبت</th>
                <th>نوع ثبت</th>
                <th>تعداد ثبت</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
        <div class="report-footer">
          <span>📄 تاریخ تولید: ${new Date().toLocaleString("fa-IR")}</span>
          <span>نسخه PDF • سیستم حضور و غیاب استادان</span>
        </div>
      </div>
    </body></html>
  `;
}

// ==================== STYLES (mirrors HR) ====================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },

  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: "#fff",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
  },
  tabBtnActive: { backgroundColor: "#1e293b" },
  tabBtnText: { fontSize: 13, color: "#64748b", fontFamily: "Vazir" },
  tabBtnTextActive: { color: "#fff", fontFamily: "VazirBold" },

  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderRadius: 12,
    marginBottom: 12,
  },
  navButton: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  navButtonDisabled: { opacity: 0.4 },
  dateTextWrapper: { flex: 1, alignItems: "center", paddingVertical: 2 },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  dateHintText: {
    fontSize: 10,
    color: "#8b5cf6",
    fontFamily: "Vazir",
    marginTop: 2,
  },

  scannerStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#dcfce7",
    borderRadius: 12,
    marginBottom: 8,
  },
  scannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  scannerText: { flex: 1, fontSize: 14, color: "#10b981", fontFamily: "Vazir" },

  schoolTimeInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderRadius: 12,
    marginBottom: 8,
  },
  schoolTimeText: {
    fontSize: 13,
    color: "#1e293b",
    fontFamily: "Vazir",
    fontWeight: "500",
  },
  schoolTimeSubtext: { fontSize: 11, color: "#94a3b8", fontFamily: "Vazir" },

  teacherOnlyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ede9fe",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  teacherOnlyText: {
    fontSize: 13,
    color: "#6d28d9",
    fontFamily: "VazirBold",
    fontWeight: "600",
  },
  teacherOnlyExcluded: {
    fontSize: 11,
    color: "#8b5cf6",
    fontFamily: "Vazir",
    marginLeft: "auto",
  },

  summaryGrid: { flexDirection: "row", gap: 10, marginBottom: 8 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    alignItems: "center",
  },
  summaryValue: { fontSize: 22, fontWeight: "700", fontFamily: "VazirBold" },
  summaryLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },

  breakdownRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingVertical: 8,
    flexWrap: "wrap",
    marginBottom: 8,
  },
  breakdownItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  breakdownDot: { width: 10, height: 10, borderRadius: 5 },
  breakdownText: { fontSize: 12, color: "#64748b", fontFamily: "Vazir" },

  actionRow: { flexDirection: "row", gap: 10, marginBottom: 8 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Vazir",
  },

  listContent: { padding: 16, paddingBottom: 40, gap: 10 },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  listSubtitle: { fontSize: 12, color: "#94a3b8", fontFamily: "Vazir" },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardLate: { borderLeftWidth: 4, borderLeftColor: "#f59e0b" },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  cardRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLate: { backgroundColor: "#fef3c7" },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  avatarTextLate: { color: "#f59e0b" },
  staffName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  roleText: { fontSize: 12, color: "#94a3b8", fontFamily: "Vazir" },
  punchInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  punchTimeText: { fontSize: 11, fontFamily: "Vazir" },
  lateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 1,
  },
  lateInfoText: { fontSize: 10, color: "#f59e0b", fontFamily: "Vazir" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: { fontSize: 11, fontWeight: "600", fontFamily: "Vazir" },
  punchCountBadge: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  punchCountText: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "600",
    fontFamily: "VazirBold",
  },

  emptyContainer: { alignItems: "center", paddingVertical: 40 },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4,
    fontFamily: "Vazir",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  th: {
    flex: 1,
    fontSize: 11,
    color: "#64748b",
    fontFamily: "VazirBold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    gap: 6,
    marginTop: 8,
  },
  td: {
    flex: 1,
    fontSize: 13,
    color: "#1e293b",
    fontFamily: "Vazir",
    textAlign: "center",
  },
  tdName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  tdMeta: { fontSize: 11, color: "#64748b", fontFamily: "Vazir", marginTop: 2 },
  rateCell: { flex: 1, alignItems: "flex-end", gap: 4 },
  rateBarTrack: {
    width: 50,
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  rateBarFill: { height: "100%", borderRadius: 3 },
  rateText: { fontSize: 11, color: "#64748b", fontFamily: "VazirBold" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
    marginTop: 2,
  },
  detailStat: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  detailStatValue: { fontSize: 16, fontWeight: "700", fontFamily: "VazirBold" },
  detailStatLabel: {
    fontSize: 10,
    color: "#64748b",
    fontFamily: "Vazir",
    marginTop: 2,
  },
  detailDayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  detailDayBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
  },
  detailDayNum: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e40af",
    fontFamily: "VazirBold",
  },
  detailDayWeek: { fontSize: 9, color: "#3b82f6", fontFamily: "Vazir" },
  detailDayTimes: { fontSize: 13, color: "#1e293b", fontFamily: "VazirBold" },
  detailDayLate: {
    fontSize: 11,
    color: "#f59e0b",
    fontFamily: "Vazir",
    marginTop: 2,
  },
  detailDayAbsent: { fontSize: 13, color: "#ef4444", fontFamily: "Vazir" },
  detailStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
