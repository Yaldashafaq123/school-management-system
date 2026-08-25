// app/(hr)/(tabs)/attendance.tsx - FULLY FIXED with LATE support
import { hrApi } from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ==================== PUNCH TYPE HELPERS ====================

// ✅ Punch type mapping (matches backend)
const PUNCH_LABELS: Record<number, string> = {
  0: "ورود",
  1: "خروج",
  2: "خروج وقت استراحت",
  3: "ورود بعد از استراحت",
  4: "ورود اضافه کار",
  5: "خروج اضافه کار",
};

const PUNCH_COLORS: Record<number, string> = {
  0: "#10b981", // Green - Check-in
  1: "#ef4444", // Red - Check-out
  2: "#f59e0b", // Yellow - Break out
  3: "#8b5cf6", // Purple - Break in
  4: "#3b82f6", // Blue - Overtime in
  5: "#ec4899", // Pink - Overtime out
};

const PUNCH_ICONS: Record<number, string> = {
  0: "log-in-outline",
  1: "log-out-outline",
  2: "exit-outline",
  3: "enter-outline",
  4: "timer-outline",
  5: "timer-outline",
};

function getPunchColor(punchType: number | null | undefined): string {
  if (punchType === null || punchType === undefined) return "#94a3b8";
  return PUNCH_COLORS[punchType] || "#94a3b8";
}

function getPunchIcon(punchType: number | null | undefined): string {
  if (punchType === null || punchType === undefined)
    return "help-circle-outline";
  return PUNCH_ICONS[punchType] || "help-circle-outline";
}

// ✅ Helper to get Afghanistan date (UTC+4:30)
function getAfghanistanDate(date: Date): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 4.5 * 3600000);
}

function formatShamsiDate(date: Date): string {
  try {
    const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return formatter.format(date);
  } catch {
    return date.toLocaleDateString("fa-IR");
  }
}

// ==================== TYPES ====================

type PunchRecord = {
  punchType: number;
  label: string;
  labelFa: string;
  time: string;
  device: string;
};

type TodayAttendanceRecord = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "present" | "absent" | "late";
  hasCheckIn: boolean;
  hasCheckOut: boolean;
  isLate: boolean;
  isOnTime: boolean;
  lateStatus: "on_time" | "grace_period" | "late" | "no_checkin";
  schoolStartTime: string;
  firstCheckIn: {
    time: string;
    dateShamsi: string;
  } | null;
  lastPunch: {
    type: number;
    label: string;
    labelFa: string;
    time: string;
  } | null;
  totalPunches: number;
  punchCounts: Record<string, number>;
  records: PunchRecord[];
};

type AttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  checkedIn: number;
  checkedOut: number;
  total: number;
  totalPunches: number;
  onTime: number;
};

// ✅ This matches what the API actually returns
type TodayAttendanceData = {
  date: string;
  dateShamsi?: string;
  dateShamsiFull?: string;
  shamsiMonth?: number;
  shamsiYear?: number;
  shamsiMonthName?: string;
  shamsiWeekday?: string;
  schoolStartTime?: string;
  summary: {
    present: number;
    absent: number;
    late: number;
    checkedIn: number;
    checkedOut: number;
    total: number;
    totalPunches: number;
    onTime: number;
  };
  attendance: TodayAttendanceRecord[];
};

// ==================== COMPONENT ====================

export default function AttendanceScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendance, setAttendance] = useState<TodayAttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>({
    present: 0,
    absent: 0,
    late: 0,
    checkedIn: 0,
    checkedOut: 0,
    total: 0,
    totalPunches: 0,
    onTime: 0,
  });
  const [selectedDate] = useState(new Date());
  const [dateShamsi, setDateShamsi] = useState("");
  const [schoolStartTime, setSchoolStartTime] = useState("07:30");

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await hrApi.getTodayAttendance();

      if (response.success && response.data) {
        const data = response.data as unknown as TodayAttendanceData;

        setAttendance(data.attendance || []);
        setSummary({
          present: data.summary?.present || 0,
          absent: data.summary?.absent || 0,
          late: data.summary?.late || 0,
          checkedIn: data.summary?.checkedIn || 0,
          checkedOut: data.summary?.checkedOut || 0,
          total: data.summary?.total || 0,
          totalPunches: data.summary?.totalPunches || 0,
          onTime: data.summary?.onTime || 0,
        });

        if (data.schoolStartTime) {
          setSchoolStartTime(data.schoolStartTime);
        }

        if (data.dateShamsi) {
          setDateShamsi(data.dateShamsi);
        } else {
          const afghanDate = getAfghanistanDate(new Date());
          setDateShamsi(formatShamsiDate(afghanDate));
        }
      }
    } catch (error) {
      console.error("Fetch attendance error:", error);
      Alert.alert("خطا", "خطا در دریافت اطلاعات حضور و غیاب");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  const renderItem = ({ item }: { item: TodayAttendanceRecord }) => {
    const lastPunch = item.lastPunch;
    const punchColor = lastPunch ? getPunchColor(lastPunch.type) : "#94a3b8";
    const punchIcon = lastPunch
      ? getPunchIcon(lastPunch.type)
      : "help-circle-outline";

    // ✅ Determine status based on actual status from backend
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

    // ✅ Show late time if late
    const lateTime =
      item.isLate && item.firstCheckIn ? item.firstCheckIn.time : null;

    return (
      <View style={[styles.card, item.status === "late" && styles.cardLate]}>
        <View style={styles.cardLeft}>
          <View
            style={[styles.avatar, item.status === "late" && styles.avatarLate]}
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
          <View>
            <Text style={styles.staffName}>{item.name}</Text>
            <Text style={styles.roleText}>
              {item.role === "TEACHER"
                ? "استاد"
                : item.role === "ADMIN"
                  ? "مدیر"
                  : item.role === "FINANCE"
                    ? "مالی"
                    : item.role === "HR"
                      ? "منابع بشری"
                      : item.role === "PRINCIPAL"
                        ? "مدیر مکتب"
                        : item.role}
            </Text>
            {lastPunch && (
              <View style={styles.punchInfo}>
                <Ionicons
                  name={punchIcon as any}
                  size={14}
                  color={punchColor}
                />
                <Text style={[styles.punchTimeText, { color: punchColor }]}>
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
            style={[styles.statusBadge, { backgroundColor: statusBgColor }]}
          >
            <Ionicons name={statusIcon} size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>

          {item.totalPunches > 0 && (
            <View style={styles.punchCountBadge}>
              <Text style={styles.punchCountText}>{item.totalPunches}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Date Header with Navigation */}
      <View style={styles.dateHeader}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.dateText}>
          {dateShamsi || formatShamsiDate(getAfghanistanDate(selectedDate))}
        </Text>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      {/* Scanner Status */}
      <View style={styles.scannerStatus}>
        <View style={styles.scannerDot} />
        <Text style={styles.scannerText}>دستگاه حضور و غیاب متصل است</Text>
        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
      </View>

      {/* ⏰ School Start Time Info */}
      <View style={styles.schoolTimeInfo}>
        <Ionicons name="time-outline" size={16} color="#64748b" />
        <Text style={styles.schoolTimeText}>
          ساعت شروع کار: {schoolStartTime}
        </Text>
        <Text style={styles.schoolTimeSubtext}>
          (تأخیر بعد از {schoolStartTime})
        </Text>
      </View>

      {/* Summary Cards - with LATE */}
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { borderLeftColor: "#10b981" }]}>
          <Text style={[styles.summaryValue, { color: "#10b981" }]}>
            {summary.present}
          </Text>
          <Text style={styles.summaryLabel}>حاضر</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: "#f59e0b" }]}>
          <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>
            {summary.late}
          </Text>
          <Text style={styles.summaryLabel}>تأخیر</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: "#ef4444" }]}>
          <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
            {summary.absent}
          </Text>
          <Text style={styles.summaryLabel}>غایب</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: "#8b5cf6" }]}>
          <Text style={[styles.summaryValue, { color: "#8b5cf6" }]}>
            {summary.total}
          </Text>
          <Text style={styles.summaryLabel}>مجموع</Text>
        </View>
      </View>

      {/* ✅ On Time / Late Breakdown */}
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownItem}>
          <View style={[styles.breakdownDot, { backgroundColor: "#10b981" }]} />
          <Text style={styles.breakdownText}>سر وقت: {summary.onTime}</Text>
        </View>
        <View style={styles.breakdownItem}>
          <View style={[styles.breakdownDot, { backgroundColor: "#f59e0b" }]} />
          <Text style={styles.breakdownText}>تأخیر: {summary.late}</Text>
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#10b981" }]}
          onPress={() => {
            Alert.alert(
              "همگام‌سازی",
              "در حال دریافت داده از دستگاه حضور و غیاب...",
            );
          }}
        >
          <Ionicons name="sync-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>همگام‌سازی</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#8b5cf6" }]}
          onPress={() => router.push("/(hr)/attendance/record")}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>ثبت دستی</Text>
        </TouchableOpacity>
      </View>

      {/* Attendance List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>لیست حضور و غیاب</Text>
        <Text style={styles.listSubtitle}>
          {summary.total} کارمند • {summary.totalPunches} ثبت
        </Text>
      </View>

      <FlatList
        data={attendance}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>هیچ رکورد حضوری یافت نشد</Text>
            <Text style={styles.emptySubtext}>
              امروز {formatShamsiDate(getAfghanistanDate(new Date()))}
            </Text>
          </View>
        }
      />
    </View>
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
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
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
  },
  scannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  scannerText: {
    flex: 1,
    fontSize: 14,
    color: "#10b981",
    fontFamily: "Vazir",
  },
  schoolTimeInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  schoolTimeText: {
    fontSize: 13,
    color: "#1e293b",
    fontFamily: "Vazir",
    fontWeight: "500",
  },
  schoolTimeSubtext: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
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
  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
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
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  breakdownDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  breakdownText: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
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
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  listSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },
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
  cardLate: {
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLate: {
    backgroundColor: "#fef3c7",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  avatarTextLate: {
    color: "#f59e0b",
  },
  staffName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  roleText: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  punchInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  punchTimeText: {
    fontSize: 11,
    fontFamily: "Vazir",
  },
  lateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 1,
  },
  lateInfoText: {
    fontSize: 10,
    color: "#f59e0b",
    fontFamily: "Vazir",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
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
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
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
});
