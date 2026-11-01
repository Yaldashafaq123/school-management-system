/* eslint-disable react-hooks/immutability */
// app/(principal)/students/[id]/edit.tsx - FIXED with lifecycle management
import { principalApi } from "@/src/config/principalApi";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type StudentData = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  studentNumber: string;
  status: string;
  classId: number | null;
  enrollmentDate: string;
  graduationDate: string | null;
  graduationYear?: number | null;
  leftDate?: string | null;
  leftReason?: string | null;
  scholarship: boolean;
  scholarshipPercentage: number | null;
  feeWaiver: boolean;
  feeWaiverReason: string | null;
};

type ClassOption = {
  id: number;
  name: string;
  section: string;
};

type PendingStatusAction =
  | { type: "GRADUATED"; date: Date }
  | { type: "LEFT"; date: Date; reason: string }
  | null;

export default function EditStudentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [classes, setClasses] = useState<ClassOption[]>([]);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [classId, setClassId] = useState<number | null>(null);
  const [enrollmentDate, setEnrollmentDate] = useState("");
  const [graduationDate, setGraduationDate] = useState("");
  const [leftDate, setLeftDate] = useState<string>("");
  const [leftReason, setLeftReason] = useState("");
  const [scholarship, setScholarship] = useState(false);
  const [scholarshipPercentage, setScholarshipPercentage] = useState("");
  const [feeWaiver, setFeeWaiver] = useState(false);
  const [feeWaiverReason, setFeeWaiverReason] = useState("");

  // Modal state for GRADUATED / LEFT confirmation
  const [pendingAction, setPendingAction] = useState<PendingStatusAction>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [studentRes, classesRes] = await Promise.all([
        principalApi.getStudentById(Number(id)),
        principalApi.getClasses(),
      ]);

      if (studentRes.success) {
        const data: any = studentRes.data;

        const mappedData: StudentData = {
          id: data.id,
          fullName: data.User?.fullName || "",
          email: data.User?.email || "",
          phone: data.User?.phone || "",
          studentNumber: data.studentNumber || data.id.toString(),
          status: data.status || "ACTIVE",
          classId: data.classId || data.Class?.id || null,
          enrollmentDate: data.enrollmentDate || "",
          graduationDate: data.graduationDate || null,
          graduationYear: data.graduationYear ?? null,
          leftDate: data.leftDate ?? null,
          leftReason: data.leftReason ?? null,
          scholarship: data.scholarship || false,
          scholarshipPercentage: data.scholarshipPercentage || null,
          feeWaiver: data.feeWaiver || false,
          feeWaiverReason: data.feeWaiverReason || "",
        };

        setStudent(mappedData);

        setFullName(mappedData.fullName);
        setEmail(mappedData.email);
        setPhone(mappedData.phone);
        setStudentNumber(mappedData.studentNumber);
        setStatus(mappedData.status);
        setClassId(mappedData.classId);
        setEnrollmentDate(
          mappedData.enrollmentDate
            ? new Date(mappedData.enrollmentDate).toISOString().split("T")[0]
            : "",
        );
        setGraduationDate(
          mappedData.graduationDate
            ? new Date(mappedData.graduationDate).toISOString().split("T")[0]
            : "",
        );
        setLeftDate(
          mappedData.leftDate
            ? new Date(mappedData.leftDate).toISOString().split("T")[0]
            : "",
        );
        setLeftReason(mappedData.leftReason || "");
        setScholarship(mappedData.scholarship);
        setScholarshipPercentage(
          mappedData.scholarshipPercentage?.toString() || "",
        );
        setFeeWaiver(mappedData.feeWaiver);
        setFeeWaiverReason(mappedData.feeWaiverReason || "");
      }

      if (classesRes.success) {
        setClasses(classesRes.data);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
      Alert.alert("خطا", "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  };

  // When user taps a status option, decide what to do
  const handleStatusChange = (newStatus: string) => {
    if (newStatus === status) return;

    // GRADUATED — open modal to pick date
    if (newStatus === "GRADUATED") {
      const initialDate = graduationDate
        ? new Date(graduationDate)
        : new Date();
      setPendingAction({ type: "GRADUATED", date: initialDate });
      return;
    }

    // LEFT — open modal to pick date + reason
    if (newStatus === "LEFT") {
      const initialDate = leftDate ? new Date(leftDate) : new Date();
      setPendingAction({
        type: "LEFT",
        date: initialDate,
        reason: leftReason || "",
      });
      return;
    }

    // ACTIVE / SUSPENDED — just change immediately
    setStatus(newStatus);
    if (newStatus === "ACTIVE") {
      // Clear graduate/leave data when reverting to active
      setGraduationDate("");
      setLeftDate("");
      setLeftReason("");
    }
  };

  // Confirm the pending GRADUATED / LEFT action
  const confirmPendingAction = async () => {
    if (!pendingAction) return;

    if (pendingAction.type === "LEFT" && !pendingAction.reason.trim()) {
      Alert.alert("خطا", "لطفاً دلیل ترک مکتب را وارد کنید");
      return;
    }

    setSubmitting(true);
    try {
      const isoDate = pendingAction.date.toISOString().split("T")[0];

      if (pendingAction.type === "GRADUATED") {
        await principalApi.markStudentGraduated(Number(id), {
          graduationDate: isoDate,
        });
        setGraduationDate(isoDate);
        setStatus("GRADUATED");
        Alert.alert("موفقیت", "شاگرد به عنوان فارغ‌التحصیل ثبت شد");
      } else {
        await principalApi.markStudentLeft(Number(id), {
          leftDate: isoDate,
          leftReason: pendingAction.reason.trim(),
        });
        setLeftDate(isoDate);
        setLeftReason(pendingAction.reason.trim());
        setStatus("LEFT");
        setClassId(null);
        Alert.alert("موفقیت", "شاگرد به عنوان ترک‌کننده ثبت شد");
      }

      setPendingAction(null);
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در ثبت اطلاعات");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("خطا", "نام شاگرد الزامی است");
      return;
    }

    // If status is GRADUATED or LEFT but user hasn't gone through the modal
    // (e.g. loaded from DB but changed something else), save via normal update
    if (
      (status === "GRADUATED" && !graduationDate) ||
      (status === "LEFT" && (!leftDate || !leftReason.trim()))
    ) {
      Alert.alert(
        "خطا",
        status === "GRADUATED"
          ? "لطفاً تاریخ فراغت را وارد کنید"
          : "لطفاً تاریخ و دلیل ترک را وارد کنید",
      );
      return;
    }

    setSubmitting(true);
    try {
      const response = await principalApi.updateStudent(Number(id), {
        status: status,
        classId: status === "LEFT" ? undefined : classId || undefined,
        studentNumber: studentNumber || undefined,
        enrollmentDate: enrollmentDate || undefined,
        graduationDate: graduationDate || undefined,
        scholarship: scholarship,
        scholarshipPercentage: scholarshipPercentage
          ? parseFloat(scholarshipPercentage)
          : undefined,
        feeWaiver: feeWaiver,
        feeWaiverReason: feeWaiverReason || undefined,
      });

      if (response.success) {
        Alert.alert("موفقیت", "اطلاعات شاگرد با موفقیت به‌روزرسانی شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در به‌روزرسانی اطلاعات");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>

        <Text style={styles.title}>ویرایش اطلاعات شاگرد</Text>
        <Text style={styles.subtitle}>{fullName || "شاگرد"}</Text>

        {/* LIFECYCLE BANNER — only shown when student is GRADUATED or LEFT */}
        {(status === "GRADUATED" || status === "LEFT") && (
          <View
            style={[
              styles.lifecycleBanner,
              status === "GRADUATED"
                ? styles.lifecycleBannerGreen
                : styles.lifecycleBannerRed,
            ]}
          >
            <Ionicons
              name={status === "GRADUATED" ? "school" : "exit-outline"}
              size={20}
              color={status === "GRADUATED" ? "#047857" : "#dc2626"}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.lifecycleTitle,
                  status === "GRADUATED"
                    ? { color: "#047857" }
                    : { color: "#dc2626" },
                ]}
              >
                {status === "GRADUATED" ? "فارغ‌التحصیل" : "ترک کرده"}
              </Text>
              {status === "GRADUATED" && graduationDate ? (
                <Text style={styles.lifecycleMeta}>
                  تاریخ فراغت: {graduationDate}
                </Text>
              ) : null}
              {status === "LEFT" && leftDate ? (
                <Text style={styles.lifecycleMeta}>
                  تاریخ ترک: {leftDate} • دلیل: {leftReason || "—"}
                </Text>
              ) : null}
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>اطلاعات شخصی</Text>

          <Text style={styles.label}>نام کامل *</Text>
          <TextInput
            style={styles.input}
            placeholder="نام کامل شاگرد"
            placeholderTextColor="#94a3b8"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>ایمیل</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={email}
            editable={false}
          />

          <Text style={styles.label}>شماره تماس</Text>
          <TextInput
            style={styles.input}
            placeholder="شماره تماس"
            placeholderTextColor="#94a3b8"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>شماره شاگرد</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={studentNumber}
            editable={false}
          />

          {/* STATUS SELECTOR */}
          <Text style={styles.label}>وضعیت</Text>
          <View style={styles.optionsGrid}>
            {["ACTIVE", "GRADUATED", "SUSPENDED", "LEFT"].map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.optionItem,
                  status === opt && styles.optionSelected,
                ]}
                onPress={() => handleStatusChange(opt)}
              >
                <Text
                  style={[
                    styles.optionText,
                    status === opt && styles.optionTextSelected,
                  ]}
                >
                  {opt === "ACTIVE"
                    ? "فعال"
                    : opt === "GRADUATED"
                      ? "فارغ"
                      : opt === "SUSPENDED"
                        ? "معلق"
                        : "ترک کرده"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Show the saved lifecycle info if applicable */}
          {status === "GRADUATED" && (
            <>
              <Text style={styles.label}>تاریخ فراغت</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setPendingAction({
                    type: "GRADUATED",
                    date: graduationDate
                      ? new Date(graduationDate)
                      : new Date(),
                  });
                }}
              >
                <Ionicons name="calendar" size={18} color="#10b981" />
                <Text style={styles.dateText}>
                  {graduationDate || "انتخاب تاریخ"}
                </Text>
                <Ionicons
                  name="pencil"
                  size={14}
                  color="#94a3b8"
                  style={{ marginLeft: "auto" }}
                />
              </TouchableOpacity>
            </>
          )}

          {status === "LEFT" && (
            <>
              <Text style={styles.label}>تاریخ ترک</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => {
                  setPendingAction({
                    type: "LEFT",
                    date: leftDate ? new Date(leftDate) : new Date(),
                    reason: leftReason,
                  });
                }}
              >
                <Ionicons name="calendar" size={18} color="#dc2626" />
                <Text style={styles.dateText}>
                  {leftDate || "انتخاب تاریخ"}
                </Text>
                <Ionicons
                  name="pencil"
                  size={14}
                  color="#94a3b8"
                  style={{ marginLeft: "auto" }}
                />
              </TouchableOpacity>

              <Text style={styles.label}>دلیل ترک</Text>
              <TextInput
                style={[styles.input, { minHeight: 60 }]}
                placeholder="دلیل ترک مکتب"
                placeholderTextColor="#94a3b8"
                value={leftReason}
                onChangeText={setLeftReason}
                multiline
                textAlignVertical="top"
              />
            </>
          )}

          {/* Class selector — hidden when LEFT since we detach them */}
          {status !== "LEFT" && (
            <>
              <Text style={styles.label}>صنف</Text>
              <View style={styles.optionsGrid}>
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    classId === null && styles.optionSelected,
                  ]}
                  onPress={() => setClassId(null)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      classId === null && styles.optionTextSelected,
                    ]}
                  >
                    بدون صنف
                  </Text>
                </TouchableOpacity>
                {classes.map((cls) => (
                  <TouchableOpacity
                    key={cls.id}
                    style={[
                      styles.optionItem,
                      classId === cls.id && styles.optionSelected,
                    ]}
                    onPress={() => setClassId(cls.id)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        classId === cls.id && styles.optionTextSelected,
                      ]}
                    >
                      {cls.name} {cls.section}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Enrollment date */}
          <Text style={styles.label}>تاریخ ثبت نام</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
            value={enrollmentDate}
            onChangeText={setEnrollmentDate}
          />

          {/* Scholarship */}
          <View style={styles.switchRow}>
            <Text style={styles.label}>بورسیه</Text>
            <Switch
              value={scholarship}
              onValueChange={setScholarship}
              trackColor={{ false: "#e2e8f0", true: "#f59e0b" }}
            />
          </View>

          {scholarship && (
            <TextInput
              style={styles.input}
              placeholder="درصد بورسیه (مثال: 50)"
              placeholderTextColor="#94a3b8"
              value={scholarshipPercentage}
              onChangeText={setScholarshipPercentage}
              keyboardType="numeric"
            />
          )}

          {/* Fee Waiver */}
          <View style={styles.switchRow}>
            <Text style={styles.label}>معافیت از فیس</Text>
            <Switch
              value={feeWaiver}
              onValueChange={setFeeWaiver}
              trackColor={{ false: "#e2e8f0", true: "#f59e0b" }}
            />
          </View>

          {feeWaiver && (
            <TextInput
              style={styles.input}
              placeholder="دلیل معافیت"
              placeholderTextColor="#94a3b8"
              value={feeWaiverReason}
              onChangeText={setFeeWaiverReason}
            />
          )}

          <TouchableOpacity
            style={[styles.saveButton, submitting && styles.saveDisabled]}
            onPress={handleSave}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.saveText}>ذخیره تغییرات</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ============ LIFECYCLE MODAL ============ */}
      <Modal
        visible={!!pendingAction}
        transparent
        animationType="slide"
        onRequestClose={() => setPendingAction(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {pendingAction && (
              <>
                <View style={styles.modalHeader}>
                  <Ionicons
                    name={
                      pendingAction.type === "GRADUATED"
                        ? "school"
                        : "exit-outline"
                    }
                    size={24}
                    color={
                      pendingAction.type === "GRADUATED" ? "#10b981" : "#dc2626"
                    }
                  />
                  <Text style={styles.modalTitle}>
                    {pendingAction.type === "GRADUATED"
                      ? "ثبت فارغ‌التحصیلی"
                      : "ثبت ترک مکتب"}
                  </Text>
                </View>

                <Text style={styles.modalSubtitle}>
                  {pendingAction.type === "GRADUATED"
                    ? `آیا مطمئن هستید که ${fullName} فارغ‌التحصیل شده؟`
                    : `آیا مطمئن هستید که ${fullName} مکتب را ترک کرده؟`}
                </Text>

                {/* Date picker row */}
                <Text style={styles.fieldLabel}>
                  {pendingAction.type === "GRADUATED"
                    ? "تاریخ فراغت *"
                    : "تاریخ ترک *"}
                </Text>
                <TouchableOpacity
                  style={styles.modalDateInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={18} color="#f59e0b" />
                  <Text style={styles.modalDateText}>
                    {pendingAction.date.toISOString().split("T")[0]}
                  </Text>
                </TouchableOpacity>

                {showDatePicker && (
                  <DateTimePicker
                    value={pendingAction.date}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    maximumDate={new Date()}
                    onChange={(event, date) => {
                      setShowDatePicker(Platform.OS === "ios");
                      if (date && pendingAction) {
                        setPendingAction({ ...pendingAction, date });
                      }
                    }}
                  />
                )}

                {/* Reason — only for LEFT */}
                {pendingAction.type === "LEFT" && (
                  <>
                    <Text style={styles.fieldLabel}>دلیل ترک *</Text>
                    <TextInput
                      style={[styles.modalInput, { minHeight: 80 }]}
                      placeholder="مثلاً: نقل مکان خانواده به هرات"
                      placeholderTextColor="#94a3b8"
                      value={pendingAction.reason}
                      onChangeText={(t) =>
                        setPendingAction({ ...pendingAction, reason: t })
                      }
                      multiline
                      textAlignVertical="top"
                    />
                  </>
                )}

                {pendingAction.type === "LEFT" && (
                  <View style={styles.warningBox}>
                    <Ionicons name="warning" size={16} color="#f59e0b" />
                    <Text style={styles.warningText}>
                      شاگرد از صنف فعلی حذف شده و در لیست ترک‌کنندگان ثبت
                      می‌شود.
                    </Text>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setPendingAction(null)}
                  >
                    <Text style={styles.modalCancelText}>انصراف</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modalConfirmBtn,
                      {
                        backgroundColor:
                          pendingAction.type === "GRADUATED"
                            ? "#10b981"
                            : "#dc2626",
                      },
                      submitting && { opacity: 0.6 },
                    ]}
                    onPress={confirmPendingAction}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#fff"
                        />
                        <Text style={styles.modalConfirmText}>تأیید و ثبت</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
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
  content: { padding: 16, paddingBottom: 40 },
  backButton: { marginBottom: 16 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
    fontFamily: "VazirBold",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 12,
    marginBottom: 6,
    fontFamily: "Vazir",
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  disabledInput: { opacity: 0.7 },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionSelected: { backgroundColor: "#fef3c7", borderColor: "#f59e0b" },
  optionText: { fontSize: 14, color: "#64748b", fontFamily: "Vazir" },
  optionTextSelected: { color: "#f59e0b", fontWeight: "600" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f59e0b",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  saveDisabled: { opacity: 0.7 },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Vazir",
  },

  // Date input
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
  },
  dateText: { fontSize: 14, color: "#1e293b", fontFamily: "Vazir" },

  // Lifecycle banner
  lifecycleBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  lifecycleBannerGreen: { backgroundColor: "#d1fae5" },
  lifecycleBannerRed: { backgroundColor: "#fee2e2" },
  lifecycleTitle: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  lifecycleMeta: {
    fontSize: 12,
    color: "#475569",
    fontFamily: "Vazir",
    marginTop: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
    lineHeight: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    fontFamily: "Vazir",
    marginTop: 4,
  },
  modalDateInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  modalDateText: {
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  warningBox: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    backgroundColor: "#fef3c7",
    borderRadius: 10,
    alignItems: "flex-start",
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#78350f",
    fontFamily: "Vazir",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    fontSize: 14,
    color: "#475569",
    fontFamily: "VazirBold",
  },
  modalConfirmBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  modalConfirmText: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "VazirBold",
  },
});
