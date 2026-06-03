// app/(parent)/attendance/index.tsx
import { parentAttendanceApi, AttendanceOverview, MonthlyAttendanceData, WeeklyAttendance } from '@/src/config/parentAttendanceApi';
import { parentChildApi } from '@/src/config/parentChildApi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { Calendar, TrendingUp, ChevronDown } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
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

interface Child {
  id: number;
  name: string;
  class: string;
}

// Helper function to get status text in Persian
function getStatusText(status: string) {
  switch (status) {
    case "present":
      return "حاضر";
    case "absent":
      return "غایب";
    case "late":
      return "تأخیر";
    case "excused":
      return "مرخصی";
    case "holiday":
      return "تعطیل";
    case "weekend":
      return "آخرهفته";
    case "future":
      return "آینده";
    default:
      return status;
  }
}

// Helper function to get status style
function getStatusStyle(status: string) {
  switch (status) {
    case "present":
      return styles.present;
    case "absent":
      return styles.absent;
    case "late":
      return styles.late;
    case "excused":
      return styles.excused;
    case "holiday":
      return styles.holiday;
    case "weekend":
      return styles.weekend;
    default:
      return styles.weekend;
  }
}

export default function AttendanceMonitor() {
  const router = useRouter();
  const { user: _user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceOverview | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [showChildSelector, setShowChildSelector] = useState(false);

  // Load children list
  const loadChildren = useCallback(async () => {
    try {
      const response = await parentChildApi.getChildren();
      console.log("Children response:", response);
      
      if (response.success && response.data) {
        setChildren(response.data.children);
        
        // Get stored active child or use first child
        const storedId = await parentChildApi.getStoredActiveChildId();
        if (storedId && response.data.children.some(c => c.id === storedId)) {
          setSelectedChildId(storedId);
        } else if (response.data.children.length > 0) {
          setSelectedChildId(response.data.children[0].id);
          await parentChildApi.setActiveChild(response.data.children[0].id);
        }
      }
    } catch (error) {
      console.error("Error loading children:", error);
    }
  }, []);

  const loadAttendance = useCallback(async () => {
    if (!selectedChildId) {
      console.log("No child selected yet");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log("Fetching attendance for child:", selectedChildId);
      const response = await parentAttendanceApi.getAttendanceOverview(selectedChildId);
      console.log("Attendance API response:", response);
      
      if (response.success && response.data) {
        setAttendanceData(response.data);
      } else {
        console.log("No attendance data or API failed");
        setAttendanceData(null);
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
      setAttendanceData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedChildId]);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  // Load attendance when child ID changes
  useEffect(() => {
    if (selectedChildId) {
      loadAttendance();
    }
  }, [selectedChildId, loadAttendance]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAttendance();
    setRefreshing(false);
  };

  const handleChildSelect = async (childId: number) => {
    setSelectedChildId(childId);
    await parentChildApi.setActiveChild(childId);
    setShowChildSelector(false);
  };

  const selectedChild = children.find(c => c.id === selectedChildId);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </SafeAreaView>
    );
  }

  // Show child selector if no children
  if (children.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>هیچ فرزندی یافت نشد</Text>
          <Text style={styles.emptySubtitle}>
            لطفاً از طریق پروفایل خود فرزند خود را اضافه کنید
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>بازگشت</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show message if no attendance data
  if (!attendanceData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.childSelectorButton}
            onPress={() => setShowChildSelector(true)}
          >
            <Text style={styles.childSelectorText}>
              {selectedChild?.name || "انتخاب فرزند"} <ChevronDown size={16} color="#6b7280" />
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyDataContainer}>
          <Text style={styles.emptyDataTitle}>اطلاعات حضور و غیاب موجود نیست</Text>
          <Text style={styles.emptyDataSubtitle}>
            هنوز هیچ ثبت حضور و غیابی برای این دانش‌آموز انجام نشده است
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = attendanceData?.stats;
  const monthlyData = attendanceData?.monthlyData || [];
  const weeklyData = attendanceData?.weeklyData || [];

  const totalPresent = stats?.present || 0;
  const totalDays = stats?.totalDays || 0;
  const attendanceRate = stats?.attendanceRate || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3b82f6']}
          />
        }
      >
        {/* Header with Child Selector */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.childSelectorButton}
            onPress={() => setShowChildSelector(true)}
          >
            <Text style={styles.childSelectorText}>
              {attendanceData?.student?.name || "دانش‌آموز"} <ChevronDown size={16} color="#6b7280" />
            </Text>
          </TouchableOpacity>
          <Text style={styles.studentClass}>
            {attendanceData?.student?.className || ""}
          </Text>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCardContainer}>
          <View style={styles.statsCard}>
            <Calendar size={32} color="#3b82f6" />
            <View style={styles.statsContent}>
              <Text style={styles.statsValue}>{attendanceRate}٪</Text>
              <Text style={styles.statsLabel}>حضور کلی</Text>
            </View>
            <TrendingUp size={24} color="#10b981" />
          </View>
        </View>

        {/* Weekly Attendance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>این هفته</Text>
          <View style={styles.weekGrid}>
            {weeklyData.length > 0 ? (
              weeklyData.map((day: WeeklyAttendance, index: number) => (
                <View key={index} style={styles.dayCard}>
                  <Text style={styles.dayName}>{day.day}</Text>
                  <View
                    style={[
                      styles.dateCircle,
                      getStatusStyle(day.status),
                    ]}
                  >
                    <Text style={styles.dateText}>{day.date}</Text>
                  </View>
                  <Text style={[styles.statusText, getStatusStyle(day.status) === styles.present && styles.statusPresentText]}>
                    {getStatusText(day.status)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>اطلاعاتی برای این هفته موجود نیست</Text>
            )}
          </View>
        </View>

        {/* Monthly Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>روند حضور ماهانه</Text>
          <View style={styles.monthlyContainer}>
            {monthlyData.length > 0 ? (
              monthlyData.map((month: MonthlyAttendanceData, index: number) => {
                const percentage = month.rate;
                return (
                  <View key={index} style={styles.monthCard}>
                    <Text style={styles.monthName}>{month.month}</Text>
                    <View style={styles.progressBackground}>
                      <View
                        style={[styles.progressFill, { height: `${percentage}%` }]}
                      />
                    </View>
                    <Text style={styles.monthStats}>
                      {month.present}/{month.total}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.emptyText}>اطلاعاتی برای ماهانه موجود نیست</Text>
            )}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>خلاصه</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{totalPresent}</Text>
              <Text style={styles.summaryLabel}>روزهای حاضر</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, styles.absentText]}>
                {totalDays - totalPresent}
              </Text>
              <Text style={styles.summaryLabel}>روزهای غایب</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{totalDays}</Text>
              <Text style={styles.summaryLabel}>روزهای کل</Text>
            </View>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.present]} />
            <Text style={styles.legendText}>حاضر</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.absent]} />
            <Text style={styles.legendText}>غایب</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.late]} />
            <Text style={styles.legendText}>تأخیر</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.excused]} />
            <Text style={styles.legendText}>مرخصی</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.holiday]} />
            <Text style={styles.legendText}>تعطیل</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, styles.weekend]} />
            <Text style={styles.legendText}>آخرهفته</Text>
          </View>
        </View>
      </ScrollView>

      {/* Child Selector Modal */}
      {showChildSelector && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>انتخاب فرزند</Text>
              <TouchableOpacity onPress={() => setShowChildSelector(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.modalChildItem,
                  selectedChildId === child.id && styles.modalChildItemActive,
                ]}
                onPress={() => handleChildSelect(child.id)}
              >
                <Text style={styles.modalChildName}>{child.name}</Text>
                <Text style={styles.modalChildClass}>{child.class}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyDataTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  emptyDataSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  header: {
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    alignItems: "center",
  },
  childSelectorButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    gap: 6,
  },
  childSelectorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  studentClass: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  statsCardContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statsContent: {
    flex: 1,
    marginLeft: 16,
    alignItems: "flex-start",
  },
  statsValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#111827",
    textAlign: "left",
  },
  statsLabel: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "left",
  },
  section: {
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  weekGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
  },
  dayCard: {
    alignItems: "center",
    gap: 8,
  },
  dayName: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  dateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  present: { backgroundColor: "#10b981" },
  absent: { backgroundColor: "#ef4444" },
  late: { backgroundColor: "#f59e0b" },
  excused: { backgroundColor: "#8b5cf6" },
  holiday: { backgroundColor: "#f59e0b" },
  weekend: { backgroundColor: "#9ca3af" },
  statusText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
  statusPresentText: {
    color: "#10b981",
    fontWeight: "500",
  },
  monthlyContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    height: 200,
  },
  monthCard: {
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  monthName: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  progressBackground: {
    width: 20,
    height: 120,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  progressFill: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
  },
  monthStats: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
  },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  absentText: { color: "#ef4444" },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    padding: 20,
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "right",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    padding: 20,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "80%",
    maxHeight: "60%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  modalClose: {
    fontSize: 20,
    color: "#6b7280",
    padding: 4,
  },
  modalChildItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalChildItemActive: {
    backgroundColor: "#eff6ff",
  },
  modalChildName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  modalChildClass: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "right",
  },
});