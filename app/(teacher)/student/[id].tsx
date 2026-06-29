import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  StudentDetail as StudentDetailType,
  teacherStudentApi,
} from "@/src/config/teacherStdApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StudentDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const [student, setStudent] = useState<StudentDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<StudentDetailType>>({});
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState("");
  const [selectedAttendanceStatus, setSelectedAttendanceStatus] = useState<
    "PRESENT" | "ABSENT" | "LATE" | "EXCUSED"
  >("PRESENT");

  const userRole = user?.role?.toLowerCase() || "teacher";
  const isTeacher = userRole === "teacher";
  const isAdmin = userRole === "admin";

  const fetchStudentDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate id exists
      if (!id) {
        setError("شناسه دانش‌آموز یافت نشد");
        setStudent(null);
        return;
      }

      // ✅ FIXED: Use teacherStudentApi instead of studentApi
      const response = await teacherStudentApi.getStudentById(Number(id));

      if (response.success && response.data) {
        setStudent(response.data);
        setEditData(response.data);
      } else {
        setStudent(null);
        setError("دانش‌آموزی با این شناسه یافت نشد");
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      setStudent(null);
      setError("خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchStudentDetails();
    } else {
      setLoading(false);
      setError("شناسه دانش‌آموز معتبر نیست");
    }
  }, [id, fetchStudentDetails]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudentDetails();
    setRefreshing(false);
  };

  const handleSaveChanges = async () => {
    if (!student) return;

    try {
      // ✅ FIXED: Use teacherStudentApi instead of studentApi
      const response = await teacherStudentApi.updateStudent(
        Number(id),
        editData,
      );
      if (response.success) {
        setStudent({ ...student, ...editData });
        setIsEditing(false);
        Alert.alert("موفقیت", "تغییرات با موفقیت ذخیره شد.");
      } else {
        Alert.alert("خطا", response.message || "ذخیره تغییرات ناموفق بود");
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      Alert.alert("خطا", "ذخیره تغییرات ناموفق بود");
    }
  };

  const handleWhatsAppClick = () => {
    const phone = student?.parent?.phone || student?.phone;
    if (phone) {
      const cleanPhone = phone.replace(/\s/g, "").replace(/^0/, "+93");
      const url = `whatsapp://send?phone=${cleanPhone}`;
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Alert.alert("خطا", "واتساپ روی دستگاه نصب نیست.");
          }
        })
        .catch(() => {
          Alert.alert("خطا", "خطا در باز کردن واتساپ.");
        });
    } else {
      Alert.alert("خطا", "شماره تلفنی برای تماس وجود ندارد.");
    }
  };

  const handleAddAttendance = async () => {
    if (!selectedAttendanceDate) {
      Alert.alert("خطا", "لطفاً تاریخ را انتخاب کنید.");
      return;
    }

    try {
      // ✅ FIXED: Use teacherStudentApi instead of studentApi
      const response = await teacherStudentApi.markAttendance(Number(id), {
        date: selectedAttendanceDate,
        status: selectedAttendanceStatus,
      });

      if (response.success) {
        await fetchStudentDetails();
        setShowAttendanceModal(false);
        setSelectedAttendanceDate("");
        setSelectedAttendanceStatus("PRESENT");
        Alert.alert("موفقیت", "حضور و غیاب ثبت شد.");
      } else {
        Alert.alert("خطا", response.message || "ثبت حضور و غیاب ناموفق بود");
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      Alert.alert("خطا", "ثبت حضور و غیاب ناموفق بود");
    }
  };

  const renderAttendanceStatus = (status: string) => {
    const statusConfig: Record<
      string,
      { icon: string; color: string; text: string }
    > = {
      PRESENT: {
        icon: "checkmark-circle",
        color: Colors.success,
        text: "حاضر",
      },
      ABSENT: { icon: "close-circle", color: Colors.danger, text: "غایب" },
      LATE: { icon: "time", color: Colors.warning, text: "تأخیر" },
      EXCUSED: { icon: "medical", color: Colors.info, text: "معذور" },
    };

    const config = statusConfig[status] || statusConfig.PRESENT;

    return (
      <View
        style={[
          styles.attendanceBadge,
          { backgroundColor: `${config.color}15` },
        ]}
      >
        <Ionicons name={config.icon as any} size={14} color={config.color} />
        <Text style={[styles.attendanceText, { color: config.color }]}>
          {config.text}
        </Text>
      </View>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="پروفایل دانش‌آموز" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error/empty state with retry button - This handles all error cases
  if (!student || error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="پروفایل دانش‌آموز" showBack />
        <View style={styles.errorContainer}>
          <Ionicons
            name="person-outline"
            size={60}
            color={Colors.textSecondary}
          />
          <Text style={styles.errorTitle}>دانش‌آموز یافت نشد</Text>
          <Text style={styles.errorText}>
            {error || "اطلاعاتی برای این دانش‌آموز وجود ندارد"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchStudentDetails}
          >
            <Ionicons name="refresh" size={20} color={Colors.primary} />
            <Text style={styles.retryButtonText}>تلاش مجدد</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Safely render student data - all data access is now safe because student is guaranteed to exist
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="پروفایل دانش‌آموز"
        showBack
        rightComponent={
          <View style={styles.headerRight}>
            {(isAdmin || isTeacher) && (
              <TouchableOpacity
                onPress={() => setIsEditing(!isEditing)}
                style={styles.headerButton}
              >
                <Ionicons
                  name={isEditing ? "close" : "create-outline"}
                  size={24}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            )}
            {student?.parent?.phone && (
              <TouchableOpacity
                onPress={handleWhatsAppClick}
                style={styles.headerButton}
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={24}
                  color={Colors.success}
                />
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{
              uri: student.profile_image || "https://via.placeholder.com/80",
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            {isEditing ? (
              <TextInput
                style={[styles.profileName, styles.editInput]}
                value={editData.fullName || ""}
                onChangeText={(text) =>
                  setEditData({ ...editData, fullName: text })
                }
              />
            ) : (
              <Text style={styles.profileName}>
                {student.fullName || "نامشخص"}
              </Text>
            )}
            <Text style={styles.profileEmail}>
              {student.email || "ایمیل نامشخص"}
            </Text>
            {student.class && (
              <View style={styles.gradeBadge}>
                <Ionicons name="school" size={16} color={Colors.primary} />
                <Text style={styles.gradeText}>
                  کلاس {student.class.name}
                  {student.class.section ? ` - ${student.class.section}` : ""}
                </Text>
              </View>
            )}
            {student.teacher && (
              <Text style={styles.supervisorText}>
                <Ionicons
                  name="person"
                  size={14}
                  color={Colors.textSecondary}
                />
                {" استاد راهنما: "}
                {student.teacher.fullName}
              </Text>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {student?.parent?.phone && (
            <TouchableOpacity
              style={styles.quickAction}
              onPress={handleWhatsAppClick}
            >
              <Ionicons name="logo-whatsapp" size={24} color={Colors.success} />
              <Text style={styles.quickActionText}>واتساپ</Text>
            </TouchableOpacity>
          )}

          {(isAdmin || isTeacher) && (
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => setShowAttendanceModal(true)}
            >
              <Ionicons name="calendar" size={24} color={Colors.primary} />
              <Text style={styles.quickActionText}>حضور و غیاب</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="document-text" size={24} color={Colors.warning} />
            <Text style={styles.quickActionText}>کارنامه</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information - Check for existence of any data before rendering section */}
        {(student.birth_date ||
          student.address ||
          student.parent ||
          student.phone ||
          student.enrollment_date) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>اطلاعات شخصی</Text>
              <Ionicons name="person-circle" size={20} color={Colors.primary} />
            </View>

            <View style={styles.infoGrid}>
              {student.birth_date && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>تاریخ تولد:</Text>
                  <Text style={styles.infoValue}>{student.birth_date}</Text>
                </View>
              )}

              {student.address && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>آدرس:</Text>
                  <Text style={styles.infoValue}>{student.address}</Text>
                </View>
              )}

              {student.parent && (
                <>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>نام پدر/مادر:</Text>
                    <Text style={styles.infoValue}>
                      {student.parent.fullName || "نامشخص"}
                    </Text>
                  </View>

                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>تلفن والدین:</Text>
                    <Text style={styles.infoValue}>
                      {student.parent.phone || "نامشخص"}
                    </Text>
                  </View>
                </>
              )}

              {student.phone && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>تلفن دانش‌آموز:</Text>
                  <Text style={styles.infoValue}>{student.phone}</Text>
                </View>
              )}

              {student.enrollment_date && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>تاریخ ثبت‌نام:</Text>
                  <Text style={styles.infoValue}>
                    {student.enrollment_date}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Courses - Safely check if courses exist and have length */}
        {student.courses &&
          Array.isArray(student.courses) &&
          student.courses.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>دوره‌ها</Text>
                <Ionicons name="book" size={20} color={Colors.primary} />
              </View>

              {student.courses.map((course) => (
                <View key={course.id} style={styles.courseCard}>
                  <View style={styles.courseHeader}>
                    <Text style={styles.courseName}>
                      {course.name || "بدون نام"}
                    </Text>
                    <Text style={styles.courseTeacher}>
                      {course.teacher || "نامشخص"}
                    </Text>
                  </View>

                  {course.progress > 0 && (
                    <View style={styles.courseStat}>
                      <Text style={styles.courseStatLabel}>پیشرفت:</Text>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${Math.min(course.progress, 100)}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {Math.min(course.progress, 100)}%
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

        {/* Attendance - Safely check if attendance exists and has length */}
        {student.attendance &&
          Array.isArray(student.attendance) &&
          student.attendance.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>حضور و غیاب</Text>
                {student.performance?.attendance_rate &&
                  student.performance.attendance_rate > 0 && (
                    <Text style={styles.attendanceRate}>
                      میزان حضور: {student.performance.attendance_rate}%
                    </Text>
                  )}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.attendanceList}>
                  {student.attendance.map((item) => (
                    <View key={item.id} style={styles.attendanceItem}>
                      <Text style={styles.attendanceDate}>
                        {item.date || "نامشخص"}
                      </Text>
                      {renderAttendanceStatus(item.status)}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

        {/* Performance - Safely check if performance exists */}
        {student.performance && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>عملکرد تحصیلی</Text>
              <Ionicons name="analytics" size={20} color={Colors.primary} />
            </View>

            <View style={styles.analyticsGrid}>
              {student.performance.assignments_total !== undefined &&
                student.performance.assignments_total > 0 && (
                  <View style={styles.analyticCard}>
                    <Ionicons
                      name="checkmark-done-circle"
                      size={30}
                      color={Colors.success}
                    />
                    <Text style={styles.analyticValue}>
                      {student.performance.assignments_completed || 0}/
                      {student.performance.assignments_total}
                    </Text>
                    <Text style={styles.analyticLabel}>کارخانگی</Text>
                  </View>
                )}

              {student.performance.average_grade && (
                <View style={styles.analyticCard}>
                  <Ionicons name="star" size={30} color={Colors.warning} />
                  <Text style={styles.analyticValue}>
                    {student.performance.average_grade}
                  </Text>
                  <Text style={styles.analyticLabel}>معدل</Text>
                </View>
              )}

              {student.performance.attendance_rate &&
                student.performance.attendance_rate > 0 && (
                  <View style={styles.analyticCard}>
                    <Ionicons
                      name="calendar"
                      size={30}
                      color={Colors.primary}
                    />
                    <Text style={styles.analyticValue}>
                      {student.performance.attendance_rate}%
                    </Text>
                    <Text style={styles.analyticLabel}>حضور</Text>
                  </View>
                )}

              {student.performance.last_active && (
                <View style={styles.analyticCard}>
                  <Ionicons name="time" size={30} color={Colors.info} />
                  <Text style={styles.analyticValue}>
                    {student.performance.last_active}
                  </Text>
                  <Text style={styles.analyticLabel}>آخرین فعالیت</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Notes - Safely check if notes exist */}
        {student.notes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>یادداشت‌ها</Text>
              <Ionicons name="document-text" size={20} color={Colors.primary} />
            </View>

            {isEditing ? (
              <TextInput
                style={[styles.notesInput, styles.editInput]}
                value={editData.notes || ""}
                onChangeText={(text) =>
                  setEditData({ ...editData, notes: text })
                }
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            ) : (
              <Text style={styles.notesText}>{student.notes}</Text>
            )}
          </View>
        )}

        {/* Edit Mode Actions */}
        {isEditing && (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.editButton, styles.cancelButton]}
              onPress={() => {
                setIsEditing(false);
                setEditData(student);
              }}
            >
              <Text style={styles.cancelButtonText}>لغو</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.editButton, styles.saveButton]}
              onPress={handleSaveChanges}
            >
              <Text style={styles.saveButtonText}>ذخیره تغییرات</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Spacing */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Attendance Modal */}
      <Modal
        visible={showAttendanceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttendanceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ثبت حضور و غیاب</Text>
              <TouchableOpacity onPress={() => setShowAttendanceModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>تاریخ:</Text>
              <TextInput
                style={styles.modalInput}
                value={selectedAttendanceDate}
                onChangeText={setSelectedAttendanceDate}
                placeholder="مثال: ۱۴۰۲/۱۰/۲۰"
              />

              <Text style={styles.modalLabel}>وضعیت:</Text>
              <View style={styles.statusOptions}>
                {(["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const).map(
                  (status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusOption,
                        selectedAttendanceStatus === status &&
                          styles.statusOptionActive,
                      ]}
                      onPress={() => setSelectedAttendanceStatus(status)}
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          selectedAttendanceStatus === status &&
                            styles.statusOptionTextActive,
                        ]}
                      >
                        {status === "PRESENT"
                          ? "حاضر"
                          : status === "ABSENT"
                            ? "غایب"
                            : status === "LATE"
                              ? "تأخیر"
                              : "معذور"}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setShowAttendanceModal(false)}
              >
                <Text style={styles.cancelModalButtonText}>لغو</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={handleAddAttendance}
              >
                <Text style={styles.confirmModalButtonText}>ثبت</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  profileHeader: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.border,
  },
  profileInfo: {
    flex: 1,
    marginRight: 16,
    justifyContent: "center",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  gradeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 6,
  },
  gradeText: {
    fontSize: 12,
    color: Colors.primary,
  },
  supervisorText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  quickActions: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    padding: 12,
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    backgroundColor: Colors.card,
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoItem: {
    width: "48%",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
  },
  editInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  courseCard: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  courseName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  courseTeacher: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  courseStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  courseStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressBar: {
    width: 60,
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  attendanceRate: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  attendanceList: {
    flexDirection: "row",
    gap: 8,
  },
  attendanceItem: {
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 100,
  },
  attendanceDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  attendanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  attendanceText: {
    fontSize: 12,
    fontWeight: "500",
  },
  analyticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  analyticCard: {
    width: "48%",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  analyticValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 8,
  },
  analyticLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  notesText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 24,
  },
  editActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
  },
  spacer: {
    height: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  modalBody: {
    padding: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 16,
  },
  statusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  statusOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusOptionText: {
    fontSize: 12,
    color: Colors.text,
  },
  statusOptionTextActive: {
    color: "#fff",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmModalButton: {
    backgroundColor: Colors.primary,
  },
  confirmModalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  cancelModalButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelModalButtonText: {
    color: Colors.text,
    fontSize: 14,
  },
});
