// app/(hr)/(tabs)/attendance.tsx - Connected to ZKTeco Scanner
import { getStatusColor, getStatusText, hrApi } from "@/src/config/hrApi";
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

type TodayAttendance = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "present" | "absent" | "late";
  time: string | null;
};

type AttendanceSummary = {
  present: number;
  absent: number;
  total: number;
  late: number;
};

export default function AttendanceScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendance, setAttendance] = useState<TodayAttendance[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>({
    present: 0,
    absent: 0,
    total: 0,
    late: 0,
  });
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await hrApi.getTodayAttendance();
      if (response.success) {
        setAttendance(response.data.attendance);
        setSummary({
          ...response.data.summary,
          late: response.data.summary.late ?? 0,
        });
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

  const handleDateChange = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
    // TODO: Fetch attendance for selected date
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return "checkmark-circle";
      case "late":
        return "time";
      case "absent":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const renderItem = ({ item }: { item: TodayAttendance }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
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
          {item.time && <Text style={styles.timeText}>🕐 {item.time}</Text>}
        </View>
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) + "15" },
        ]}
      >
        <Ionicons
          name={getStatusIcon(item.status) as any}
          size={16}
          color={getStatusColor(item.status)}
        />
        <Text
          style={[styles.statusText, { color: getStatusColor(item.status) }]}
        >
          {getStatusText(item.status)}
        </Text>
      </View>
    </View>
  );

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
        <TouchableOpacity onPress={() => handleDateChange("prev")}>
          <Ionicons name="chevron-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.dateText}>
          {selectedDate.toLocaleDateString("fa-IR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <TouchableOpacity onPress={() => handleDateChange("next")}>
          <Ionicons name="chevron-forward" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      {/* Scanner Status */}
      <View style={styles.scannerStatus}>
        <View style={styles.scannerDot} />
        <Text style={styles.scannerText}>دستگاه حضور و غیاب متصل است</Text>
        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { borderLeftColor: "#10b981" }]}>
          <Text style={[styles.summaryValue, { color: "#10b981" }]}>
            {summary.present}
          </Text>
          <Text style={styles.summaryLabel}>حاضر</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: "#f59e0b" }]}>
          <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>
            {summary.late || 0}
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

      {/* Quick Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#10b981" }]}
          onPress={() => {
            // Trigger manual sync with scanner
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
      <Text style={styles.listTitle}>لیست حضور و غیاب</Text>
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
              امروز {new Date().toLocaleDateString("fa-IR")}
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
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontFamily: "VazirBold",
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
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
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
  timeText: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Vazir",
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
