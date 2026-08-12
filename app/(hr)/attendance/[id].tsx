// app/(hr)/attendance/[id].tsx - FIXED with proper data handling
import { hrApi } from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type DailyAttendance = {
  date: Date;
  dayOfWeek: string;
  dayNumber: number;
  isPresent: boolean;
  recordCount: number;
  firstScan: string | null;
  lastScan: string | null;
  punchIn: number;
  punchOut: number;
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
  month: number;
  year: number;
  summary: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    attendanceRate: number;
    totalRecords: number;
  };
  daily: DailyAttendance[];
};

// app/(hr)/attendance/[id].tsx - FIXED shamsiToGregorian function

// ==================== SHAMSI CALENDAR HELPERS (from working teacher report) ====================

// ✅ Persian month names in Afghan (Dari)
const AFGHAN_MONTH_NAMES = [
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

// ✅ Days in each Persian month
const PERSIAN_MONTH_DAYS = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

// ✅ Get current Persian month (rough estimate)
const getCurrentPersianMonth = (): { month: number; year: number } => {
  const now = new Date();
  const gregorianMonth = now.getMonth() + 1;
  const gregorianDay = now.getDate();

  let persianMonth = 0;
  let persianYear = now.getFullYear() - 621;

  if (gregorianMonth === 3 && gregorianDay >= 21) persianMonth = 12;
  else if (gregorianMonth === 4) persianMonth = 1;
  else if (gregorianMonth === 5) persianMonth = 2;
  else if (gregorianMonth === 6) persianMonth = 3;
  else if (gregorianMonth === 7) persianMonth = 4;
  else if (gregorianMonth === 8) persianMonth = 5;
  else if (gregorianMonth === 9) persianMonth = 6;
  else if (gregorianMonth === 10) persianMonth = 7;
  else if (gregorianMonth === 11) persianMonth = 8;
  else if (gregorianMonth === 12) persianMonth = 9;
  else if (gregorianMonth === 1) persianMonth = 10;
  else if (gregorianMonth === 2) persianMonth = 11;
  else if (gregorianMonth === 3 && gregorianDay < 21) persianMonth = 11;

  if (persianMonth === 0) persianMonth = 1;

  return { month: persianMonth, year: persianYear };
};

// ✅ Get Gregorian months for a Persian month (from working teacher report)
const getGregorianMonthsForPersian = (
  persianMonth: number,
  persianYear: number,
): { month: number; year: number }[] => {
  const startDays: Record<number, { month: number; day: number }> = {
    1: { month: 3, day: 21 },
    2: { month: 4, day: 21 },
    3: { month: 5, day: 22 },
    4: { month: 6, day: 22 },
    5: { month: 7, day: 23 },
    6: { month: 8, day: 23 },
    7: { month: 9, day: 23 },
    8: { month: 10, day: 23 },
    9: { month: 11, day: 22 },
    10: { month: 12, day: 22 },
    11: { month: 1, day: 21 },
    12: { month: 2, day: 20 },
  };

  const gregorianYear = persianYear + 621;
  const start = startDays[persianMonth];
  if (!start) return [];

  const result: { month: number; year: number }[] = [];
  let startMonth = start.month;
  let startYear = gregorianYear;

  if (startMonth === 1 || startMonth === 2) {
    startYear = gregorianYear + 1;
  }

  result.push({ month: startMonth, year: startYear });

  let nextMonth = startMonth + 1;
  let nextYear = startYear;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear = startYear + 1;
  }
  result.push({ month: nextMonth, year: nextYear });

  if (start.day > 25) {
    let thirdMonth = nextMonth + 1;
    let thirdYear = nextYear;
    if (thirdMonth > 12) {
      thirdMonth = 1;
      thirdYear = nextYear + 1;
    }
    result.push({ month: thirdMonth, year: thirdYear });
  }

  return result.filter(
    (item, index, self) =>
      index ===
      self.findIndex((t) => t.month === item.month && t.year === item.year),
  );
};

// ✅ Helper to convert Gregorian to Shamsi using Intl
const toShamsi = (date: Date): { year: number; month: number; day: number } => {
  try {
    const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const parts = formatter.format(date).split("/");
    return {
      year: parseInt(parts[0]),
      month: parseInt(parts[1]),
      day: parseInt(parts[2]),
    };
  } catch (error) {
    return {
      year: date.getFullYear() - 621,
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }
};

export default function StaffAttendanceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<StaffMonthlyAttendance | null>(null);

  // ✅ Use Persian/Shamsi calendar
  const currentPersian = getCurrentPersianMonth();
  const [selectedPersianMonth, setSelectedPersianMonth] = useState(
    currentPersian.month,
  );
  const [selectedPersianYear, setSelectedPersianYear] = useState(
    currentPersian.year,
  );

  const fetchData = async () => {
    if (!id) {
      console.error("No staff ID provided");
      Alert.alert("خطا", "شناسه کارمند یافت نشد");
      setLoading(false);
      return;
    }

    const staffId = parseInt(id);
    if (isNaN(staffId) || staffId <= 0) {
      console.error("Invalid staff ID:", id);
      Alert.alert("خطا", "شناسه کارمند نامعتبر است");
      setLoading(false);
      return;
    }

    try {
      // ✅ Get Gregorian months for the selected Persian month
      const gregorianMonths = getGregorianMonthsForPersian(
        selectedPersianMonth,
        selectedPersianYear,
      );

      const afghanMonthName = AFGHAN_MONTH_NAMES[selectedPersianMonth - 1];
      console.log(
        `📡 Persian: ${selectedPersianMonth}/${selectedPersianYear} (${afghanMonthName})`,
      );
      console.log(`📡 Fetching Gregorian months:`, gregorianMonths);

      // ✅ Fetch data for each Gregorian month
      let allDaily: DailyAttendance[] = [];
      let combinedStaff = null;
      let combinedSummary = {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        attendanceRate: 0,
        totalRecords: 0,
      };

      for (const { month, year } of gregorianMonths) {
        console.log(`📡 Fetching for month: ${month}/${year}`);

        try {
          const response = await hrApi.getStaffMonthlyAttendance(staffId, {
            month: month,
            year: year,
          });

          console.log(`📡 Response for ${month}/${year}:`, response);

          if (response.success && response.data) {
            const responseData = response.data;

            // ✅ Get staff info
            if (responseData.staff) {
              combinedStaff = responseData.staff;
            }

            // ✅ Combine daily records - USE ALL DAILY RECORDS FROM THE RESPONSE
            if (responseData.daily && Array.isArray(responseData.daily)) {
              allDaily = [...allDaily, ...responseData.daily];
            }

            // ✅ Combine summary
            if (responseData.summary) {
              combinedSummary.totalDays += responseData.summary.totalDays || 0;
              combinedSummary.presentDays +=
                responseData.summary.presentDays || 0;
              combinedSummary.absentDays +=
                responseData.summary.absentDays || 0;
              combinedSummary.totalRecords +=
                responseData.summary.totalRecords || 0;
            }
          }
        } catch (error) {
          console.error(`❌ Error fetching for ${month}/${year}:`, error);
        }
      }

      // ✅ If no daily records, use the first month's data if available
      if (allDaily.length === 0 && gregorianMonths.length > 0) {
        // Try to get data from the first month again as fallback
        try {
          const { month, year } = gregorianMonths[0];
          const response = await hrApi.getStaffMonthlyAttendance(staffId, {
            month: month,
            year: year,
          });
          if (response.success && response.data) {
            if (response.data.daily) {
              allDaily = response.data.daily;
            }
            if (response.data.staff) {
              combinedStaff = response.data.staff;
            }
            if (response.data.summary) {
              combinedSummary = response.data.summary;
            }
          }
        } catch (error) {
          console.error("❌ Fallback error:", error);
        }
      }

      // ✅ Calculate attendance rate
      if (combinedSummary.totalDays > 0) {
        combinedSummary.attendanceRate = Math.round(
          (combinedSummary.presentDays / combinedSummary.totalDays) * 100,
        );
      }

      // ✅ Set the data directly - no filtering needed since the API returns the right data
      if (allDaily.length > 0) {
        setData({
          staff: combinedStaff || {
            id: staffId,
            fullName: "",
            nameFarsi: "",
            role: "",
            staffType: "",
            position: "",
            department: "",
            teacherCode: "",
          },
          month: selectedPersianMonth,
          year: selectedPersianYear,
          summary: combinedSummary,
          daily: allDaily,
        });
      } else {
        // ✅ Generate default days if no data
        const daysInMonth = PERSIAN_MONTH_DAYS[selectedPersianMonth - 1] || 30;
        const defaultDays: DailyAttendance[] = [];

        // Get staff info
        let staffInfo = combinedStaff;
        if (!staffInfo) {
          try {
            const staffResponse = await hrApi.getStaffById(staffId);
            if (staffResponse.success && staffResponse.data) {
              staffInfo = {
                id: staffResponse.data.id,
                fullName: staffResponse.data.fullName || "",
                nameFarsi: staffResponse.data.nameFarsi || "",
                role: staffResponse.data.role || "",
                staffType: staffResponse.data.staffType || "",
                position: staffResponse.data.position || "",
                department: staffResponse.data.department || "",
                teacherCode: staffResponse.data.teacherCode || "",
              };
            }
          } catch (error) {
            console.error("❌ Error fetching staff info:", error);
          }
        }

        // Generate days from the selected Persian month
        const gregorianMonthsForDays = getGregorianMonthsForPersian(
          selectedPersianMonth,
          selectedPersianYear,
        );

        if (gregorianMonthsForDays.length > 0) {
          const firstMonth = gregorianMonthsForDays[0];
          const startDate = new Date(firstMonth.year, firstMonth.month - 1, 1);

          for (let i = 0; i < daysInMonth; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);

            // Skip if date is in a different month (shouldn't happen with correct mapping)
            const shamsiDate = toShamsi(date);
            if (shamsiDate.month !== selectedPersianMonth) continue;

            defaultDays.push({
              date: date,
              dayOfWeek: date.toLocaleDateString("fa-IR", { weekday: "long" }),
              dayNumber: i + 1,
              isPresent: false,
              recordCount: 0,
              firstScan: null,
              lastScan: null,
              punchIn: 0,
              punchOut: 0,
            });
          }
        }

        if (defaultDays.length > 0) {
          setData({
            staff: staffInfo || {
              id: staffId,
              fullName: "",
              nameFarsi: "",
              role: "",
              staffType: "",
              position: "",
              department: "",
              teacherCode: "",
            },
            month: selectedPersianMonth,
            year: selectedPersianYear,
            summary: {
              totalDays: defaultDays.length,
              presentDays: 0,
              absentDays: defaultDays.length,
              attendanceRate: 0,
              totalRecords: 0,
            },
            daily: defaultDays,
          });
        } else {
          Alert.alert("خطا", "داده‌ای برای این ماه یافت نشد");
        }
      }
    } catch (error: any) {
      console.error("Fetch data error:", error);
      Alert.alert("خطا", error.message || "خطا در دریافت اطلاعات حضور");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, selectedPersianMonth, selectedPersianYear]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const goToPreviousMonth = () => {
    let newMonth = selectedPersianMonth - 1;
    let newYear = selectedPersianYear;
    if (newMonth === 0) {
      newMonth = 12;
      newYear = selectedPersianYear - 1;
    }
    setSelectedPersianMonth(newMonth);
    setSelectedPersianYear(newYear);
  };

  const goToNextMonth = () => {
    let newMonth = selectedPersianMonth + 1;
    let newYear = selectedPersianYear;
    if (newMonth === 13) {
      newMonth = 1;
      newYear = selectedPersianYear + 1;
    }
    setSelectedPersianMonth(newMonth);
    setSelectedPersianYear(newYear);
  };

  const getDayStatus = (isPresent: boolean) => {
    return isPresent ? styles.dayPresent : styles.dayAbsent;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  if (!data || !data.daily || data.daily.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>داده‌ای برای این ماه یافت نشد</Text>
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
    );
  }

  const { staff, summary, daily } = data;
  const shamsiMonthName = AFGHAN_MONTH_NAMES[selectedPersianMonth - 1] || "";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>حضور کارمند</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Staff Info */}
      <View style={styles.staffCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{staff.fullName.charAt(0)}</Text>
        </View>
        <Text style={styles.staffName}>{staff.fullName}</Text>
        <Text style={styles.staffDetails}>
          {staff.position || staff.staffType} • {staff.department || "عمومی"}
        </Text>
        {staff.teacherCode && (
          <Text style={styles.staffDetails}>کد: {staff.teacherCode}</Text>
        )}
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{summary.presentDays}</Text>
          <Text style={styles.summaryLabel}>حضور</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{summary.absentDays}</Text>
          <Text style={styles.summaryLabel}>غیبت</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: "#8b5cf6" }]}>
            {summary.attendanceRate}%
          </Text>
          <Text style={styles.summaryLabel}>نرخ حضور</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{summary.totalRecords}</Text>
          <Text style={styles.summaryLabel}>کل ثبت</Text>
        </View>
      </View>

      {/* Month Navigator - Shamsi */}
      <View style={styles.monthNavigator}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Ionicons name="chevron-back" size={24} color="#64748b" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {shamsiMonthName} {selectedPersianYear}
        </Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <Ionicons name="chevron-forward" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      {/* Day Grid */}
      <View style={styles.daysGrid}>
        <View style={styles.dayHeaders}>
          <Text style={styles.dayHeader}>ش</Text>
          <Text style={styles.dayHeader}>ی</Text>
          <Text style={styles.dayHeader}>د</Text>
          <Text style={styles.dayHeader}>س</Text>
          <Text style={styles.dayHeader}>چ</Text>
          <Text style={styles.dayHeader}>پ</Text>
          <Text style={styles.dayHeader}>ج</Text>
        </View>
        <View style={styles.daysContainer}>
          {daily.map((day, index) => {
            // Get the day number from the date
            const dayNumber = new Date(day.date).getDate();
            const shamsiDate = toShamsi(new Date(day.date));
            return (
              <TouchableOpacity
                key={index}
                style={[styles.dayCell, getDayStatus(day.isPresent)]}
                onPress={() => {
                  if (day.isPresent && day.recordCount > 0) {
                    Alert.alert(
                      `حضور ${dayNumber} ${shamsiMonthName} ${shamsiDate.year}`,
                      `تعداد ثبت: ${day.recordCount}\n` +
                        `ورود: ${day.firstScan ? new Date(day.firstScan).toLocaleTimeString("fa-IR") : "—"}\n` +
                        `خروج: ${day.lastScan ? new Date(day.lastScan).toLocaleTimeString("fa-IR") : "—"}\n` +
                        `پانچ IN: ${day.punchIn}\n` +
                        `پانچ OUT: ${day.punchOut}`,
                    );
                  }
                }}
              >
                <Text
                  style={[
                    styles.dayText,
                    !day.isPresent && styles.dayTextAbsent,
                  ]}
                >
                  {dayNumber}
                </Text>
                {day.isPresent && day.recordCount > 0 && (
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeText}>{day.recordCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#10b981" }]} />
          <Text style={styles.legendText}>حاضر</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: "#ef4444" }]} />
          <Text style={styles.legendText}>غایب</Text>
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
    color: "#64748b",
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  staffCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  staffName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 8,
    fontFamily: "VazirBold",
  },
  staffDetails: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  summaryGrid: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  monthNavigator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  daysGrid: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
  },
  dayHeaders: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  dayHeader: {
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: "Vazir",
    width: 40,
    textAlign: "center",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  dayCell: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  dayPresent: {
    backgroundColor: "#d1fae5",
  },
  dayAbsent: {
    backgroundColor: "#fef2f2",
  },
  dayText: {
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  dayTextAbsent: {
    color: "#ef4444",
  },
  dayBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#8b5cf6",
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 14,
    alignItems: "center",
  },
  dayBadgeText: {
    fontSize: 8,
    color: "#fff",
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
});
