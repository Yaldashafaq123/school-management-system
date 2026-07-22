// app/(teacher)/attendance/report.tsx - FULLY FIXED WITH ABSENT DAYS
import {
  AttendanceRecord,
  AttendanceSummary,
  processAttendanceData,
  teacherApi,
} from "@/src/config/teacherApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/Colors";
import { useAuth } from "../../../contexts/AuthContext";

const STATUS_COLORS = {
  present: "#10b981",
  absent: "#ef4444",
  late: "#f59e0b",
  excused: "#3b82f6",
};

const STATUS_LABELS = {
  present: "حاضر",
  absent: "غایب",
  late: "تأخیر",
  excused: "معاف",
};

// ✅ Persian month names in Afghan (Dari)
const AFGHAN_MONTH_NAMES = [
  "حمل", // 1
  "ثور", // 2
  "جوزا", // 3
  "سرطان", // 4
  "اسد", // 5
  "سنبله", // 6
  "میزان", // 7
  "عقرب", // 8
  "قوس", // 9
  "جدی", // 10
  "دلو", // 11
  "حوت", // 12
];

// ✅ Persian month names in Iranian (from backend)
const PERSIAN_MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

// ✅ Map Persian (Iranian) to Afghan (Dari)
const PERSIAN_TO_AFGHAN: Record<string, string> = {
  فروردین: "حمل",
  اردیبهشت: "ثور",
  خرداد: "جوزا",
  تیر: "سرطان",
  مرداد: "اسد",
  شهریور: "سنبله",
  مهر: "میزان",
  آبان: "عقرب",
  آذر: "قوس",
  دی: "جدی",
  بهمن: "دلو",
  اسفند: "حوت",
};

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

// ✅ Check if a day is Friday
const isFriday = (date: Date): boolean => {
  return date.getDay() === 5;
};

export default function AttendanceReportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>(
    [],
  );
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);

  const currentPersian = getCurrentPersianMonth();
  const [selectedPersianMonth, setSelectedPersianMonth] = useState(
    currentPersian.month,
  );
  const [selectedPersianYear, setSelectedPersianYear] = useState(
    currentPersian.year,
  );
  const [displayMonthName, setDisplayMonthName] = useState(
    AFGHAN_MONTH_NAMES[currentPersian.month - 1] || "",
  );

  // ✅ Get ALL Gregorian months that could contain the Persian month
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

  // ✅ Generate all days of a Persian month
  const generateAllDays = (
    persianMonth: number,
    persianYear: number,
    records: AttendanceRecord[],
  ): AttendanceRecord[] => {
    const daysInMonth = PERSIAN_MONTH_DAYS[persianMonth - 1] || 30;
    const persianMonthName = PERSIAN_MONTH_NAMES[persianMonth - 1];
    const afghanMonthName = AFGHAN_MONTH_NAMES[persianMonth - 1];

    // Create a map of existing records by date
    const recordsMap: Record<string, AttendanceRecord> = {};
    records.forEach((record) => {
      recordsMap[record.date] = record;
    });

    const allDays: AttendanceRecord[] = [];

    // ✅ Calculate the Gregorian start date for this Persian month
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

    const start = startDays[persianMonth];
    if (!start) return [];

    let gregorianYear = persianYear + 621;
    let startMonth = start.month;
    if (startMonth === 1 || startMonth === 2) {
      gregorianYear = gregorianYear + 1;
    }

    // Generate all days
    for (let day = 1; day <= daysInMonth; day++) {
      // Create a Date object for this Persian date
      // We need to convert Persian date to Gregorian
      // This is a simplified approach - for production use moment-jalaali
      const gregorianDate = new Date(
        gregorianYear,
        startMonth - 1,
        start.day + day - 1,
      );

      // Skip Fridays (weekend)
      if (isFriday(gregorianDate)) {
        continue;
      }

      const dateStr = `${day} ${afghanMonthName} ${persianYear}`;

      // Check if we have a record for this date
      const existingRecord = recordsMap[dateStr];

      if (existingRecord) {
        // Use existing record
        allDays.push(existingRecord);
      } else {
        // Create an absent record
        allDays.push({
          id: -day, // negative ID to distinguish from real records
          date: dateStr,
          status: "absent",
          checkIn: "---",
          checkOut: "---",
          hours: 0,
        });
      }
    }

    return allDays;
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedPersianMonth, selectedPersianYear]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const gregorianMonths = getGregorianMonthsForPersian(
        selectedPersianMonth,
        selectedPersianYear,
      );

      console.log(
        `📡 Persian: ${selectedPersianMonth}/${selectedPersianYear} (${AFGHAN_MONTH_NAMES[selectedPersianMonth - 1]})`,
      );
      console.log(`📡 Fetching Gregorian months:`, gregorianMonths);

      const promises = gregorianMonths.map(({ month, year }) =>
        teacherApi.getAttendanceReport({
          month,
          year,
        }),
      );

      const responses = await Promise.all(promises);

      let allRecordsData: AttendanceRecord[] = [];

      for (const response of responses) {
        if (response.success) {
          const processed = processAttendanceData(response.data);
          allRecordsData = [...allRecordsData, ...processed.records];
        }
      }

      console.log(`📊 Total records fetched: ${allRecordsData.length}`);

      setAllRecords(allRecordsData);

      const afghanMonthName = AFGHAN_MONTH_NAMES[selectedPersianMonth - 1];
      const persianMonthName = PERSIAN_MONTH_NAMES[selectedPersianMonth - 1];

      console.log(
        `🔍 Filtering for month: ${afghanMonthName} (${persianMonthName})`,
      );

      // Filter existing records
      const filtered = allRecordsData.filter((record) => {
        return (
          record.date.includes(persianMonthName) ||
          record.date.includes(afghanMonthName)
        );
      });

      console.log(
        `📊 Found ${filtered.length} existing records for ${afghanMonthName}`,
      );

      // ✅ Generate ALL days of the month (including absent ones)
      const allDays = generateAllDays(
        selectedPersianMonth,
        selectedPersianYear,
        filtered,
      );

      console.log(
        `📊 Generated ${allDays.length} total days for ${afghanMonthName}`,
      );

      setFilteredRecords(allDays);

      // ✅ Calculate summary for all days
      const present = allDays.filter((r) => r.status === "present").length;
      const absent = allDays.filter((r) => r.status === "absent").length;
      const late = allDays.filter((r) => r.status === "late").length;
      const excused = allDays.filter((r) => r.status === "excused").length;
      const total = present + absent + late + excused;
      const attendanceRate =
        total > 0 ? Math.round((present / total) * 100) : 0;

      setSummary({
        totalDays: total,
        present: present,
        absent: absent,
        late: late,
        excused: excused,
        attendanceRate: attendanceRate,
        monthName: afghanMonthName,
        monthlyData: [],
      });

      setDisplayMonthName(afghanMonthName);
    } catch (error) {
      console.error("Fetch attendance error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
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
    setDisplayMonthName(AFGHAN_MONTH_NAMES[newMonth - 1] || "...");
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
    setDisplayMonthName(AFGHAN_MONTH_NAMES[newMonth - 1] || "...");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>گزارش حضور و غیاب</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={goToPreviousMonth}>
            <Ionicons name="chevron-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {displayMonthName || "..."} {selectedPersianYear}
          </Text>
          <TouchableOpacity onPress={goToNextMonth}>
            <Ionicons name="chevron-forward" size={24} color="#1e293b" />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        {summary && (
          <View style={styles.summaryGrid}>
            <View
              style={[
                styles.summaryCard,
                { borderLeftColor: STATUS_COLORS.present },
              ]}
            >
              <Text
                style={[styles.summaryValue, { color: STATUS_COLORS.present }]}
              >
                {summary.present}
              </Text>
              <Text style={styles.summaryLabel}>حاضر</Text>
            </View>
            <View
              style={[
                styles.summaryCard,
                { borderLeftColor: STATUS_COLORS.absent },
              ]}
            >
              <Text
                style={[styles.summaryValue, { color: STATUS_COLORS.absent }]}
              >
                {summary.absent}
              </Text>
              <Text style={styles.summaryLabel}>غایب</Text>
            </View>
            <View
              style={[
                styles.summaryCard,
                { borderLeftColor: STATUS_COLORS.late },
              ]}
            >
              <Text
                style={[styles.summaryValue, { color: STATUS_COLORS.late }]}
              >
                {summary.late}
              </Text>
              <Text style={styles.summaryLabel}>تأخیر</Text>
            </View>
            <View
              style={[
                styles.summaryCard,
                { borderLeftColor: STATUS_COLORS.excused },
              ]}
            >
              <Text
                style={[styles.summaryValue, { color: STATUS_COLORS.excused }]}
              >
                {summary.excused}
              </Text>
              <Text style={styles.summaryLabel}>معاف</Text>
            </View>
          </View>
        )}

        {/* Attendance Rate */}
        {summary && (
          <View style={styles.rateCard}>
            <Text style={styles.rateLabel}>نرخ حضور</Text>
            <Text style={styles.rateValue}>{summary.attendanceRate}%</Text>
            <View style={styles.rateBar}>
              <View
                style={[
                  styles.rateFill,
                  { width: `${summary.attendanceRate}%` },
                ]}
              />
            </View>
            <Text style={styles.rateTotal}>
              {summary.present} از {summary.totalDays} روز
            </Text>
          </View>
        )}

        {/* Daily Records */}
        <Text style={styles.recordsTitle}>رکوردهای روزانه</Text>
        {filteredRecords.length === 0 ? (
          <View style={styles.emptyRecords}>
            <Text style={styles.emptyRecordsText}>
              هیچ رکورد حضوری برای {displayMonthName} یافت نشد
            </Text>
          </View>
        ) : (
          filteredRecords.map((record) => (
            <View
              key={record.id}
              style={[
                styles.recordCard,
                record.status === "absent" && styles.recordCardAbsent,
              ]}
            >
              <View style={styles.recordLeft}>
                <Text
                  style={[
                    styles.recordDate,
                    record.status === "absent" && styles.recordDateAbsent,
                  ]}
                >
                  {record.date}
                </Text>
                <Text
                  style={[
                    styles.recordTime,
                    record.status === "absent" && styles.recordTimeAbsent,
                  ]}
                >
                  {record.checkIn && record.checkOut && record.checkIn !== "---"
                    ? `${record.checkIn} - ${record.checkOut}`
                    : "ثبت نشده"}
                </Text>
              </View>
              <View
                style={[
                  styles.recordStatus,
                  { backgroundColor: STATUS_COLORS[record.status] + "20" },
                ]}
              >
                <Text
                  style={[
                    styles.recordStatusText,
                    { color: STATUS_COLORS[record.status] },
                  ]}
                >
                  {STATUS_LABELS[record.status]}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#64748b" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1e293b" },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  monthText: { fontSize: 16, fontWeight: "600", color: "#1e293b" },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  summaryValue: { fontSize: 24, fontWeight: "700" },
  summaryLabel: { fontSize: 13, color: "#64748b", marginTop: 2 },
  rateCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  rateLabel: { fontSize: 14, color: "#64748b" },
  rateValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#1e293b",
    marginVertical: 4,
  },
  rateBar: {
    width: "100%",
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  rateFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  rateTotal: { fontSize: 13, color: "#94a3b8", marginTop: 8 },
  recordsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  recordCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  recordCardAbsent: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  recordLeft: { flex: 1 },
  recordDate: { fontSize: 14, fontWeight: "500", color: "#1e293b" },
  recordDateAbsent: { color: "#dc2626" },
  recordTime: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  recordTimeAbsent: { color: "#dc2626" },
  recordStatus: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
  recordStatusText: { fontSize: 12, fontWeight: "600" },
  emptyRecords: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyRecordsText: { fontSize: 14, color: "#94a3b8" },
});
