// app/(principal)/(tabs)/reports.tsx - FIXED
import { formatCurrency, principalApi } from "@/src/config/principalApi";
import { Ionicons } from "@expo/vector-icons";
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

// ✅ FIXED: Removed incorrect array brackets []
type ReportData = {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    totalFees: number;
    totalSalaries: number;
  };
  expenseBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  incomeBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
};

type ClassReport = {
  id: number;
  name: string;
  section: string;
  studentCount: number;
  teacherName: string;
  totalFees: number;
  totalPaid: number;
  collectionRate: number;
};

// ✅ FIXED: Removed incorrect array brackets []
type AttendanceReport = {
  month: number;
  year: number;
  monthName: string;
  summary: {
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalRecords: number;
    overallRate: number;
  };
  classAttendance: {
    className: string;
    section: string;
    studentCount: number;
    present: number;
    absent: number;
    late: number;
    total: number;
    rate: number;
  }[];
};

export default function PrincipalReportsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("financial");
  const [financialData, setFinancialData] = useState<ReportData | null>(null);
  const [classData, setClassData] = useState<ClassReport[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceReport | null>(
    null,
  );

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const fetchReports = async () => {
    try {
      setLoading(true);

      if (activeTab === "financial") {
        const [financial, classes] = await Promise.all([
          principalApi.getFinancialReport(),
          principalApi.getClassReport(),
        ]);

        if (financial.success) setFinancialData(financial.data);
        if (classes.success) setClassData(classes.data.classes || []);
      } else if (activeTab === "attendance") {
        const response = await principalApi.getAttendanceReport();
        if (response.success) setAttendanceData(response.data);
      }
    } catch (error) {
      console.error("Reports error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  const renderFinancialReport = () => (
    <View>
      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { backgroundColor: "#d1fae5" }]}>
          <Text style={styles.summaryLabel}>عواید کل</Text>
          <Text style={[styles.summaryValue, { color: "#10b981" }]}>
            {formatCurrency(financialData?.summary.totalIncome || 0)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#fef3c7" }]}>
          <Text style={styles.summaryLabel}>مصارف کل</Text>
          <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>
            {formatCurrency(financialData?.summary.totalExpenses || 0)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: "#dbeafe" }]}>
          <Text style={styles.summaryLabel}>عواید خالص</Text>
          <Text style={[styles.summaryValue, { color: "#3b82f6" }]}>
            {formatCurrency(financialData?.summary.netIncome || 0)}
          </Text>
        </View>
      </View>

      {/* Class Collection Report */}
      <Text style={styles.sectionTitle}>وصول فیس بر اساس صنف</Text>
      {classData.map((cls) => (
        <View key={cls.id} style={styles.classCard}>
          <View style={styles.classHeader}>
            <Text style={styles.className}>
              {cls.name} {cls.section}
            </Text>
            <Text style={styles.classTeacher}>{cls.teacherName}</Text>
          </View>
          <View style={styles.classStats}>
            <View style={styles.classStat}>
              <Text style={styles.classStatLabel}>شاگردان</Text>
              <Text style={styles.classStatValue}>{cls.studentCount}</Text>
            </View>
            <View style={styles.classStat}>
              <Text style={styles.classStatLabel}>فیس</Text>
              <Text style={styles.classStatValue}>
                {formatCurrency(cls.totalFees)}
              </Text>
            </View>
            <View style={styles.classStat}>
              <Text style={styles.classStatLabel}>وصول</Text>
              <Text style={styles.classStatValue}>{cls.collectionRate}%</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${cls.collectionRate}%`,
                  backgroundColor:
                    cls.collectionRate >= 80 ? "#10b981" : "#f59e0b",
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );

  const renderAttendanceReport = () => (
    <View>
      {attendanceData && (
        <>
          {/* Summary */}
          <View style={styles.attendanceSummary}>
            <Text style={styles.attendanceTitle}>
              خلاصه حضور {attendanceData.monthName} {attendanceData.year}
            </Text>
            <View style={styles.attendanceStats}>
              <View style={styles.attendanceStat}>
                <Text
                  style={[styles.attendanceStatValue, { color: "#10b981" }]}
                >
                  {attendanceData.summary.totalPresent}
                </Text>
                <Text style={styles.attendanceStatLabel}>حاضر</Text>
              </View>
              <View style={styles.attendanceStat}>
                <Text
                  style={[styles.attendanceStatValue, { color: "#f59e0b" }]}
                >
                  {attendanceData.summary.totalLate}
                </Text>
                <Text style={styles.attendanceStatLabel}>تأخیر</Text>
              </View>
              <View style={styles.attendanceStat}>
                <Text
                  style={[styles.attendanceStatValue, { color: "#ef4444" }]}
                >
                  {attendanceData.summary.totalAbsent}
                </Text>
                <Text style={styles.attendanceStatLabel}>غایب</Text>
              </View>
              <View style={styles.attendanceStat}>
                <Text
                  style={[styles.attendanceStatValue, { color: "#8b5cf6" }]}
                >
                  {attendanceData.summary.overallRate}%
                </Text>
                <Text style={styles.attendanceStatLabel}>نرخ</Text>
              </View>
            </View>
          </View>

          {/* Class Attendance */}
          <Text style={styles.sectionTitle}>حضور بر اساس صنف</Text>
          {attendanceData.classAttendance.map((cls, index) => (
            <View key={cls.className + index} style={styles.classCard}>
              <View style={styles.classHeader}>
                <Text style={styles.className}>
                  {cls.className} {cls.section}
                </Text>
                <Text style={styles.classTeacher}>{cls.rate}%</Text>
              </View>
              <View style={styles.classStats}>
                <View style={styles.classStat}>
                  <Text style={styles.classStatLabel}>شاگردان</Text>
                  <Text style={styles.classStatValue}>{cls.studentCount}</Text>
                </View>
                <View style={styles.classStat}>
                  <Text style={styles.classStatLabel}>حاضر</Text>
                  <Text style={[styles.classStatValue, { color: "#10b981" }]}>
                    {cls.present}
                  </Text>
                </View>
                <View style={styles.classStat}>
                  <Text style={styles.classStatLabel}>غایب</Text>
                  <Text style={[styles.classStatValue, { color: "#ef4444" }]}>
                    {cls.absent}
                  </Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${cls.rate}%`,
                      backgroundColor: cls.rate >= 80 ? "#10b981" : "#f59e0b",
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "financial" && styles.activeTab]}
          onPress={() => setActiveTab("financial")}
        >
          <Ionicons
            name="cash-outline"
            size={20}
            color={activeTab === "financial" ? "#f59e0b" : "#64748b"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "financial" && styles.activeTabText,
            ]}
          >
            مالی
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "attendance" && styles.activeTab]}
          onPress={() => setActiveTab("attendance")}
        >
          <Ionicons
            name="time-outline"
            size={20}
            color={activeTab === "attendance" ? "#f59e0b" : "#64748b"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "attendance" && styles.activeTabText,
            ]}
          >
            حضور
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === "financial"
          ? renderFinancialReport()
          : renderAttendanceReport()}
      </ScrollView>
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: "#fef3c7",
  },
  tabText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  activeTabText: {
    color: "#f59e0b",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
    fontFamily: "VazirBold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  classCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  className: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  classTeacher: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  classStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  classStat: {
    alignItems: "center",
  },
  classStatLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  classStatValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 2,
    fontFamily: "VazirBold",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  attendanceSummary: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  attendanceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  attendanceStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  attendanceStat: {
    alignItems: "center",
  },
  attendanceStatValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  attendanceStatLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
});
