// app/(teacher)/attendance/take.tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../../contexts/AuthContext";
import { attendanceApi } from "../../../src/config/attendanceApi";

// Define TypeScript interfaces
type StudentStatus = "present" | "absent" | "late" | "excused";

interface Student {
  id: number;
  name: string;
  rollNumber: string;
  status: StudentStatus;
  profile_image?: string;
  email?: string;
  phone?: string;
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  excused: number;
}

const STATUS_COLORS: Record<StudentStatus, string> = {
  present: "#4CAF50",
  absent: "#F44336",
  late: "#FF9800",
  excused: "#9C27B0",
};

const STATUS_LABELS: Record<StudentStatus, string> = {
  present: "حاضر",
  absent: "غایب",
  late: "تأخیر",
  excused: "معذور",
};

export default function TakeAttendancePage() {
  const router = useRouter();
  const { classId } = useLocalSearchParams<{ classId: string }>();
  const { user } = useAuth();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [classInfo, setClassInfo] = useState({
    className: "",
    section: "",
    academicYear: "",
    totalStudents: 0,
  });

  useEffect(() => {
    if (classId) {
      fetchStudents();
    }
  }, [classId, date]);

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await attendanceApi.getStudentsByClass(
        Number(classId),
        date,
      );

      if (response.success) {
        setStudents(response.data.students);
        setClassInfo({
          className: response.data.className,
          section: response.data.section || "",
          academicYear: response.data.academicYear || "",
          totalStudents: response.data.totalStudents,
        });

        // Alert if attendance already exists for this date
        if (response.data.hasExistingAttendance) {
          Alert.alert(
            "توجه",
            "حضور و غیاب برای این تاریخ قبلاً ثبت شده است. با ثبت مجدد، موارد قبلی جایگزین می‌شوند.",
          );
        }
      }
    } catch (error: any) {
      console.error("Error fetching students:", error);
      Alert.alert(
        "خطا",
        error.response?.data?.message || "خطا در دریافت اطلاعات دانش‌آموزان",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStudentStatus = (id: number, status: StudentStatus) => {
    setStudents(
      students.map((student) =>
        student.id === id ? { ...student, status } : student,
      ),
    );
  };

  const getStats = (): AttendanceStats => {
    const stats: AttendanceStats = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };
    students.forEach((student) => {
      stats[student.status]++;
    });
    return stats;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const response = await attendanceApi.submitAttendance({
        date: date.toISOString(),
        classId: Number(classId),
        students: students.map((s) => ({
          id: s.id,
          status: s.status,
        })),
        notes,
      });

      if (response.success) {
        Alert.alert("موفقیت", response.message, [
          { text: "باشه", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      console.error("Error submitting attendance:", error);
      Alert.alert(
        "خطا",
        error.response?.data?.message || "خطا در ثبت حضور و غیاب",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const stats = getStats();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>در حال دریافت اطلاعات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-forward" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ثبت حضور و غیاب</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          style={[
            styles.submitButton,
            submitting && styles.submitButtonDisabled,
          ]}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitText}>ثبت</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Date Picker and Class Info */}
        <View style={styles.infoCard}>
          <TouchableOpacity
            style={styles.datePicker}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateText}>
              {new Intl.DateTimeFormat("fa-IR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }).format(date)}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          <Text style={styles.classInfo}>
            {classInfo.className}{" "}
            {classInfo.section ? `- ${classInfo.section}` : ""}
          </Text>
          {classInfo.academicYear ? (
            <Text style={styles.classInfo}>
              سال تحصیلی: {classInfo.academicYear}
            </Text>
          ) : null}
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View
              style={[
                styles.statDot,
                { backgroundColor: STATUS_COLORS.present },
              ]}
            />
            <Text style={styles.statNumber}>{stats.present}</Text>
            <Text style={styles.statLabel}>حاضر</Text>
          </View>
          <View style={styles.statItem}>
            <View
              style={[
                styles.statDot,
                { backgroundColor: STATUS_COLORS.absent },
              ]}
            />
            <Text style={styles.statNumber}>{stats.absent}</Text>
            <Text style={styles.statLabel}>غایب</Text>
          </View>
          <View style={styles.statItem}>
            <View
              style={[styles.statDot, { backgroundColor: STATUS_COLORS.late }]}
            />
            <Text style={styles.statNumber}>{stats.late}</Text>
            <Text style={styles.statLabel}>تأخیر</Text>
          </View>
          <View style={styles.statItem}>
            <View
              style={[
                styles.statDot,
                { backgroundColor: STATUS_COLORS.excused },
              ]}
            />
            <Text style={styles.statNumber}>{stats.excused}</Text>
            <Text style={styles.statLabel}>معذور</Text>
          </View>
        </View>

        {/* Student List */}
        <View style={styles.studentsContainer}>
          <Text style={styles.sectionTitle}>علامت‌گذاری حضور</Text>
          <Text style={styles.sectionSubtitle}>برای تغییر وضعیت کلیک کنید</Text>

          {students.map((student) => (
            <View key={student.id} style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.avatarText}>
                    {student.name.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentRoll}>
                    شماره: {student.rollNumber}
                  </Text>
                </View>
              </View>

              <View style={styles.statusButtons}>
                {(
                  Object.entries(STATUS_LABELS) as [StudentStatus, string][]
                ).map(([status, label]) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      student.status === status && {
                        backgroundColor: STATUS_COLORS[status],
                        borderColor: STATUS_COLORS[status],
                      },
                    ]}
                    onPress={() => updateStudentStatus(student.id, status)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        student.status === status &&
                          styles.statusButtonTextActive,
                      ]}
                    >
                      {label.charAt(0)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: STATUS_COLORS[student.status] },
                ]}
              >
                <Text style={styles.statusText}>
                  {STATUS_LABELS[student.status]}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Notes Section */}
        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>یادداشت</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="یادداشت‌های مربوط به حضور و غیاب امروز..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            textAlign="right"
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#90CAF9",
  },
  submitText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  datePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  dateText: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  classInfo: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    textAlign: "right",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  studentsContainer: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    textAlign: "right",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    textAlign: "right",
  },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  studentName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    textAlign: "right",
  },
  studentRoll: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    textAlign: "right",
  },
  statusButtons: {
    flexDirection: "row",
    marginHorizontal: 12,
  },
  statusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#666",
  },
  statusButtonTextActive: {
    color: "#fff",
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    minWidth: 70,
    alignItems: "center",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  notesContainer: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notesInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    marginTop: 8,
    textAlignVertical: "top",
    minHeight: 80,
  },
});
