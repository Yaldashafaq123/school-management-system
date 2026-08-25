// app/(hr)/attendance/[id].tsx - COMPLETELY REDESIGNED with working month navigation
import { hrApi } from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ==================== TYPES ====================

type DailyRecord = {
  time: string;
  punchType: number;
  label: string;
  labelFa: string;
  device: string;
};

type DailyAttendance = {
  date: string;
  dateShamsi: string;
  dayOfWeek: string;
  dayNumber: number;
  isPresent: boolean;
  isLate: boolean;
  lateStatus: string;
  recordCount: number;
  firstScan: string | null;
  firstScanShamsi: string | null;
  lastScan: string | null;
  lastScanShamsi: string | null;
  punchIn: number;
  punchOut: number;
  punchBreakdown: Record<string, number>;
  isFriday: boolean;
  records: DailyRecord[];
};

type StaffMonthlyAttendance = {
  staff: {
    id: number;
    fullName: string;
    nameFarsi: string;
    role: string;
    staffType: string;
    position: string;
    department: string;
    teacherCode: string;
  };
  shamsiMonth: number;
  shamsiYear: number;
  shamsiMonthName: string;
  gregorianStart: string;
  gregorianEnd: string;
  summary: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    onTimeDays: number;
    fridayDays: number;
    attendanceRate: number;
    workingDays: number;
    totalRecords: number;
    totalPunchIn: number;
    totalPunchOut: number;
    punchSummary: Record<string, number>;
  };
  daily: DailyAttendance[];
};

// ==================== HELPERS ====================

function getShamsiMonthName(month: number): string {
  const names = [
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
  return names[month - 1] || `ماه ${month}`;
}

function getStatusColor(
  isPresent: boolean,
  isFriday: boolean,
  isLate: boolean,
): string {
  if (isFriday) return "#94a3b8";
  if (isPresent && isLate) return "#f59e0b";
  if (isPresent) return "#10b981";
  return "#ef4444";
}

function getStatusText(
  isPresent: boolean,
  isFriday: boolean,
  isLate: boolean,
): string {
  if (isFriday) return "تعطیل";
  if (isPresent && isLate) return "تأخیر";
  if (isPresent) return "حاضر";
  return "غایب";
}

function getStatusIcon(
  isPresent: boolean,
  isFriday: boolean,
  isLate: boolean,
): string {
  if (isFriday) return "calendar-outline";
  if (isPresent && isLate) return "time-outline";
  if (isPresent) return "checkmark-circle";
  return "close-circle";
}

// ==================== COMPONENT ====================

export default function StaffAttendanceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<StaffMonthlyAttendance | null>(null);

  // ✅ Current Shamsi month/year
  const getCurrentShamsi = () => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        year: "numeric",
        month: "numeric",
      });
      const parts = formatter.format(now).split("/");
      return { month: parseInt(parts[1]), year: parseInt(parts[0]) };
    } catch {
      return {
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear() - 621,
      };
    }
  };

  const currentShamsi = getCurrentShamsi();
  const [selectedShamsiMonth, setSelectedShamsiMonth] = useState(
    currentShamsi.month,
  );
  const [selectedShamsiYear, setSelectedShamsiYear] = useState(
    currentShamsi.year,
  );

  // ✅ Fetch data function - wrapped in useCallback
  const fetchData = useCallback(async () => {
    if (!id) {
      Alert.alert("خطا", "شناسه کارمند یافت نشد");
      setLoading(false);
      return;
    }

    const staffId = parseInt(id);
    if (isNaN(staffId) || staffId <= 0) {
      Alert.alert("خطا", "شناسه کارمند نامعتبر است");
      setLoading(false);
      return;
    }

    try {
      console.log(`📡 Fetching attendance for staff ${staffId}`);
      console.log(
        `📡 Shamsi Month: ${selectedShamsiMonth}/${selectedShamsiYear}`,
      );

      const response = await hrApi.getStaffMonthlyAttendance(staffId, {
        year: selectedShamsiYear,
        month: selectedShamsiMonth,
      });

      console.log("📡 Response received:", response);

      if (response.success && response.data) {
        setData(response.data);
      } else {
        Alert.alert("خطا", response.message || "داده‌ای برای این ماه یافت نشد");
        // Set empty data to show "no data" state
        setData(null);
      }
    } catch (error: any) {
      console.error("Fetch data error:", error);
      Alert.alert("خطا", error.message || "خطا در دریافت اطلاعات حضور");
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, selectedShamsiMonth, selectedShamsiYear]);

  // ✅ useEffect with proper dependencies
  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchData();
    }
  }, [id, selectedShamsiMonth, selectedShamsiYear, fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // ✅ Month navigation functions with logging
  const goToPreviousMonth = () => {
    let newMonth = selectedShamsiMonth - 1;
    let newYear = selectedShamsiYear;
    if (newMonth === 0) {
      newMonth = 12;
      newYear = selectedShamsiYear - 1;
    }
    console.log(`🔄 Navigating to previous month: ${newMonth}/${newYear}`);
    setSelectedShamsiMonth(newMonth);
    setSelectedShamsiYear(newYear);
  };

  const goToNextMonth = () => {
    let newMonth = selectedShamsiMonth + 1;
    let newYear = selectedShamsiYear;
    if (newMonth === 13) {
      newMonth = 1;
      newYear = selectedShamsiYear + 1;
    }
    console.log(`🔄 Navigating to next month: ${newMonth}/${newYear}`);
    setSelectedShamsiMonth(newMonth);
    setSelectedShamsiYear(newYear);
  };

  const renderDayItem = ({ item }: { item: DailyAttendance }) => {
    const isPresent = item.isPresent || false;
    const isLate = item.isLate || false;
    const isFriday = item.isFriday || false;
    const statusColor = getStatusColor(isPresent, isFriday, isLate);
    const statusText = getStatusText(isPresent, isFriday, isLate);
    const statusIcon = getStatusIcon(isPresent, isFriday, isLate);

    const checkInTime = item.firstScan || null;
    const checkOutTime = item.lastScan || null;
    const hasRecords = item.records && item.records.length > 0;

    return (
      <TouchableOpacity
        style={[styles.dayCard, { borderRightColor: statusColor }]}
        onPress={() => {
          if (hasRecords) {
            let message = `📅 ${item.dateShamsi}\n`;
            message += `وضعیت: ${statusText}\n`;
            message += `تعداد ثبت: ${item.recordCount}\n`;
            if (checkInTime) message += `🟢 ورود: ${checkInTime}\n`;
            if (checkOutTime) message += `🔴 خروج: ${checkOutTime}\n`;
            message += `پانچ IN: ${item.punchIn}\n`;
            message += `پانچ OUT: ${item.punchOut}`;
            if (
              item.punchBreakdown &&
              Object.keys(item.punchBreakdown).length > 0
            ) {
              message += "\n\n📊 جزئیات:";
              Object.entries(item.punchBreakdown).forEach(([label, count]) => {
                message += `\n  ${label}: ${count}`;
              });
            }
            Alert.alert(
              `حضور ${item.dayNumber} ${data?.shamsiMonthName}`,
              message,
            );
          } else if (isFriday) {
            Alert.alert("جمعه", "روز تعطیل");
          } else {
            Alert.alert("غایب", "این روز حضور ثبت نشده است");
          }
        }}
      >
        <View style={styles.dayCardLeft}>
          <View style={styles.dayNumberContainer}>
            <Text style={styles.dayNumberText}>{item.dayNumber}</Text>
          </View>
          <View style={styles.dayInfo}>
            <Text style={styles.dayDateText}>{item.dateShamsi}</Text>
            <Text style={styles.dayWeekdayText}>{item.dayOfWeek}</Text>
          </View>
        </View>

        <View style={styles.dayCardCenter}>
          {hasRecords ? (
            <View style={styles.punchTimes}>
              {checkInTime && (
                <View style={styles.punchTimeRow}>
                  <Ionicons name="log-in-outline" size={14} color="#10b981" />
                  <Text style={styles.punchTimeText}>{checkInTime}</Text>
                </View>
              )}
              {checkOutTime && (
                <View style={styles.punchTimeRow}>
                  <Ionicons name="log-out-outline" size={14} color="#ef4444" />
                  <Text style={styles.punchTimeText}>{checkOutTime}</Text>
                </View>
              )}
              {!checkInTime && !checkOutTime && (
                <Text style={styles.noPunchText}>بدون ثبت</Text>
              )}
            </View>
          ) : (
            <Text style={styles.noPunchText}>
              {isFriday ? "روز تعطیل" : "بدون حضور"}
            </Text>
          )}
        </View>

        <View style={styles.dayCardRight}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + "15" },
            ]}
          >
            <Ionicons name={statusIcon as any} size={16} color={statusColor} />
            <Text style={[styles.statusBadgeText, { color: statusColor }]}>
              {statusText}
            </Text>
          </View>
          {hasRecords && (
            <View style={styles.recordCountBadge}>
              <Text style={styles.recordCountText}>{item.recordCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // ✅ Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ✅ Show error/no data state
  if (!data || !data.daily || data.daily.length === 0) {
    const monthName = getShamsiMonthName(selectedShamsiMonth);
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#1e293b" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>حضور کارمند</Text>
              <Text style={styles.headerSubtitle}>کارمند #{id}</Text>
            </View>
            <View style={{ width: 24 }} />
          </View>

          {/* Month Navigator */}
          <View style={styles.monthNavigator}>
            <TouchableOpacity
              style={styles.monthNavButton}
              onPress={goToPreviousMonth}
            >
              <Ionicons name="chevron-back" size={24} color="#64748b" />
            </TouchableOpacity>
            <View style={styles.monthCenter}>
              <Text style={styles.monthText}>
                {monthName} {selectedShamsiYear}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.monthNavButton}
              onPress={goToNextMonth}
            >
              <Ionicons name="chevron-forward" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.errorContainer}>
            <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
            <Text style={styles.errorText}>داده‌ای برای این ماه یافت نشد</Text>
            <Text style={styles.errorSubtext}>
              {monthName} {selectedShamsiYear}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setLoading(true);
                fetchData();
              }}
            >
              <Text style={styles.retryButtonText}>تلاش مجدد</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const { staff, summary, daily, shamsiMonthName } = data;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>حضور کارمند</Text>
            <Text style={styles.headerSubtitle}>{staff.fullName}</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Staff Summary Card */}
        <View style={styles.staffSummaryCard}>
          <View style={styles.staffSummaryRow}>
            <View style={styles.staffSummaryItem}>
              <Text style={styles.staffSummaryValue}>
                {summary.presentDays}
              </Text>
              <Text style={styles.staffSummaryLabel}>حضور</Text>
            </View>
            <View style={[styles.staffSummaryItem, styles.staffSummaryDivider]}>
              <Text style={[styles.staffSummaryValue, { color: "#f59e0b" }]}>
                {summary.lateDays || 0}
              </Text>
              <Text style={styles.staffSummaryLabel}>تأخیر</Text>
            </View>
            <View style={[styles.staffSummaryItem, styles.staffSummaryDivider]}>
              <Text style={[styles.staffSummaryValue, { color: "#ef4444" }]}>
                {summary.absentDays}
              </Text>
              <Text style={styles.staffSummaryLabel}>غیبت</Text>
            </View>
            <View style={styles.staffSummaryItem}>
              <Text style={[styles.staffSummaryValue, { color: "#8b5cf6" }]}>
                {summary.attendanceRate}%
              </Text>
              <Text style={styles.staffSummaryLabel}>نرخ حضور</Text>
            </View>
          </View>
        </View>

        {/* Month Navigator */}
        <View style={styles.monthNavigator}>
          <TouchableOpacity
            style={styles.monthNavButton}
            onPress={goToPreviousMonth}
          >
            <Ionicons name="chevron-back" size={24} color="#64748b" />
          </TouchableOpacity>
          <View style={styles.monthCenter}>
            <Text style={styles.monthText}>
              {shamsiMonthName} {selectedShamsiYear}
            </Text>
            <Text style={styles.monthSubtext}>
              {summary.totalDays} روز • {summary.workingDays} روز کاری
            </Text>
          </View>
          <TouchableOpacity
            style={styles.monthNavButton}
            onPress={goToNextMonth}
          >
            <Ionicons name="chevron-forward" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Punch Summary */}
        {summary.punchSummary &&
          Object.keys(summary.punchSummary).length > 0 && (
            <View style={styles.punchSummaryContainer}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={Object.entries(summary.punchSummary)}
                renderItem={({ item }) => (
                  <View style={styles.punchSummaryChip}>
                    <Text style={styles.punchSummaryChipText}>
                      {item[0]}: {item[1]}
                    </Text>
                  </View>
                )}
                keyExtractor={(item) => item[0]}
                contentContainerStyle={styles.punchSummaryRow}
              />
            </View>
          )}

        {/* Days List */}
        <FlatList
          data={daily}
          renderItem={renderDayItem}
          keyExtractor={(item, index) => `${item.date}-${index}`}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>هیچ روزی یافت نشد</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingTop: StatusBar.currentHeight || 0,
  },
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f1f5f9",
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  errorSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  staffSummaryCard: {
    backgroundColor: "#fff",
    margin: 12,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  staffSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  staffSummaryItem: {
    alignItems: "center",
    flex: 1,
  },
  staffSummaryDivider: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#e2e8f0",
  },
  staffSummaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  staffSummaryLabel: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  monthNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  monthNavButton: {
    padding: 8,
  },
  monthCenter: {
    alignItems: "center",
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  monthSubtext: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  punchSummaryContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    padding: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  punchSummaryRow: {
    paddingHorizontal: 4,
    gap: 6,
  },
  punchSummaryChip: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
  },
  punchSummaryChipText: {
    fontSize: 12,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
    gap: 8,
  },
  dayCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderRightWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  dayCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 80,
  },
  dayNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  dayNumberText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  dayInfo: {
    gap: 2,
  },
  dayDateText: {
    fontSize: 13,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  dayWeekdayText: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  dayCardCenter: {
    flex: 1,
    paddingHorizontal: 8,
    minWidth: 80,
  },
  punchTimes: {
    gap: 2,
  },
  punchTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  punchTimeText: {
    fontSize: 12,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  noPunchText: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  dayCardRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  recordCountBadge: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 18,
    alignItems: "center",
  },
  recordCountText: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "600",
    fontFamily: "VazirBold",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
});
