// app/(teacher)/attendance/report.tsx - Connected to Backend
import {
  AttendanceRecord,
  AttendanceSummary,
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

const AFGHAN_MONTHS = [
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

export default function AttendanceReportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  const fetchAttendance = async () => {
    try {
      const response = await teacherApi.getAttendanceReport({
        month: selectedMonth,
        year: selectedYear,
      });

      if (response.success) {
        setRecords(response.data.records || []);
        setSummary(response.data.summary);
      }
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

  const getMonthName = (month: number) => {
    return AFGHAN_MONTHS[month - 1] || month.toString();
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
          <TouchableOpacity
            onPress={() => {
              if (selectedMonth === 1) {
                setSelectedMonth(12);
                setSelectedYear(selectedYear - 1);
              } else {
                setSelectedMonth(selectedMonth - 1);
              }
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.monthText}>
            {getMonthName(selectedMonth)} {selectedYear}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (selectedMonth === 12) {
                setSelectedMonth(1);
                setSelectedYear(selectedYear + 1);
              } else {
                setSelectedMonth(selectedMonth + 1);
              }
            }}
          >
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

        {/* Monthly Trend */}
        {summary && summary.monthlyData && summary.monthlyData.length > 0 && (
          <View style={styles.trendCard}>
            <Text style={styles.trendTitle}>روند ماهانه</Text>
            {summary.monthlyData.map((item, index) => (
              <View key={index} style={styles.trendItem}>
                <Text style={styles.trendMonth}>{item.month}</Text>
                <View style={styles.trendBarContainer}>
                  <View
                    style={[
                      styles.trendBar,
                      {
                        width: `${(item.present / item.total) * 100}%`,
                        backgroundColor:
                          item.present / item.total >= 0.8
                            ? "#10b981"
                            : "#f59e0b",
                      },
                    ]}
                  />
                </View>
                <Text style={styles.trendValue}>
                  {item.present}/{item.total}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Daily Records */}
        <Text style={styles.recordsTitle}>رکوردهای روزانه</Text>
        {records.length === 0 ? (
          <View style={styles.emptyRecords}>
            <Text style={styles.emptyRecordsText}>
              هیچ رکورد حضوری برای این ماه یافت نشد
            </Text>
          </View>
        ) : (
          records.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordLeft}>
                <Text style={styles.recordDate}>
                  {new Date(record.date).toLocaleDateString("fa-IR")}
                </Text>
                <Text style={styles.recordTime}>
                  {record.checkIn && record.checkOut
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
  trendCard: {
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
  trendTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  trendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  trendMonth: { width: 40, fontSize: 14, color: "#64748b" },
  trendBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  trendBar: { height: "100%", borderRadius: 3 },
  trendValue: { width: 50, fontSize: 12, color: "#64748b", textAlign: "right" },
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
  recordLeft: { flex: 1 },
  recordDate: { fontSize: 14, fontWeight: "500", color: "#1e293b" },
  recordTime: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
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
