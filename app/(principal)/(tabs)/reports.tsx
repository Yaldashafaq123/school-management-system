// app/(principal)/(tabs)/reports.tsx - Class & Student Reports
import { principalApi } from "@/src/config/principalApi";
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

type Student = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  studentNumber: string;
  status: string;
  className: string;
  classId: number;
};

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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("classes");
  const [classData, setClassData] = useState<ClassReport[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceReport | null>(
    null,
  );
  const [selectedClass, setSelectedClass] = useState<ClassReport | null>(null);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [showStudents, setShowStudents] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const fetchReports = async () => {
    try {
      setLoading(true);

      if (activeTab === "classes") {
        const classes = await principalApi.getClassReport();
        if (classes.success) {
          setClassData(classes.data.classes || []);
        }
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

  const fetchClassStudents = async (classId: number, className: string) => {
    try {
      const response = await principalApi.getStudents({ classId, limit: 100 });
      if (response.success) {
        setClassStudents(response.data.students);
        const classInfo = classData.find((c) => c.id === classId);
        setSelectedClass(classInfo || null);
        setShowStudents(true);
      }
    } catch (error) {
      console.error("Fetch students error:", error);
    }
  };

  const handleStudentPress = (studentId: number) => {
    router.push(`/(principal)/students/${studentId}`);
  };

  const handleBackToClasses = () => {
    setShowStudents(false);
    setSelectedClass(null);
    setClassStudents([]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  const renderClassList = () => (
    <View>
      <Text style={styles.sectionTitle}>لیست صنوف</Text>
      {classData.map((cls) => (
        <TouchableOpacity
          key={cls.id}
          style={styles.classCard}
          onPress={() => fetchClassStudents(cls.id, cls.name)}
          activeOpacity={0.7}
        >
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
              <Text style={styles.classStatLabel}>نرخ وصول</Text>
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
          <View style={styles.viewDetailsContainer}>
            <Text style={styles.viewDetailsText}>مشاهده شاگردان</Text>
            <Ionicons name="chevron-forward" size={18} color="#f59e0b" />
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStudentList = () => (
    <View>
      <TouchableOpacity style={styles.backButton} onPress={handleBackToClasses}>
        <Ionicons name="arrow-back" size={20} color="#f59e0b" />
        <Text style={styles.backButtonText}>بازگشت به لیست صنوف</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>
        شاگردان صنف {selectedClass?.name} {selectedClass?.section}
      </Text>

      {classStudents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>هیچ شاگردی در این صنف نیست</Text>
        </View>
      ) : (
        classStudents.map((student) => (
          <TouchableOpacity
            key={student.id}
            style={styles.studentCard}
            onPress={() => handleStudentPress(student.id)}
            activeOpacity={0.7}
          >
            <View style={styles.studentAvatar}>
              <Text style={styles.studentAvatarText}>
                {student.fullName.charAt(0)}
              </Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{student.fullName}</Text>
              <Text style={styles.studentDetail}>
                {student.studentNumber} • {student.className}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    student.status === "ACTIVE" ? "#d1fae5" : "#fef3c7",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: student.status === "ACTIVE" ? "#10b981" : "#f59e0b",
                  },
                ]}
              >
                {student.status === "ACTIVE" ? "فعال" : "غیرفعال"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
          </TouchableOpacity>
        ))
      )}
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
          style={[styles.tab, activeTab === "classes" && styles.activeTab]}
          onPress={() => {
            setActiveTab("classes");
            setShowStudents(false);
            setSelectedClass(null);
          }}
        >
          <Ionicons
            name="school-outline"
            size={20}
            color={activeTab === "classes" ? "#f59e0b" : "#64748b"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "classes" && styles.activeTabText,
            ]}
          >
            صنوف
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "attendance" && styles.activeTab]}
          onPress={() => {
            setActiveTab("attendance");
            setShowStudents(false);
            setSelectedClass(null);
          }}
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
        {activeTab === "classes"
          ? showStudents
            ? renderStudentList()
            : renderClassList()
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
  viewDetailsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 10,
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 13,
    color: "#f59e0b",
    fontFamily: "Vazir",
  },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
  },
  studentAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f59e0b",
    fontFamily: "VazirBold",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  studentDetail: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 15,
    color: "#f59e0b",
    fontFamily: "Vazir",
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
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
});
