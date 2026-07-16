// app/(principal)/students/[id]/edit.tsx - FIXED
import { principalApi } from "@/src/config/principalApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// ✅ Define StudentData interface matching what we need for the form
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
  const [scholarship, setScholarship] = useState(false);
  const [scholarshipPercentage, setScholarshipPercentage] = useState("");
  const [feeWaiver, setFeeWaiver] = useState(false);
  const [feeWaiverReason, setFeeWaiverReason] = useState("");

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
        const data = studentRes.data;

        // ✅ Map StudentDetail to StudentData
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
          scholarship: data.scholarship || false,
          scholarshipPercentage: data.scholarshipPercentage || null,
          feeWaiver: data.feeWaiver || false,
          feeWaiverReason: data.feeWaiverReason || "",
        };

        setStudent(mappedData);

        // Set form values
        setFullName(mappedData.fullName);
        setEmail(mappedData.email);
        setPhone(mappedData.phone);
        setStudentNumber(mappedData.studentNumber);
        setStatus(mappedData.status);
        setClassId(mappedData.classId);
        setEnrollmentDate(mappedData.enrollmentDate);
        setGraduationDate(mappedData.graduationDate || "");
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

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert("خطا", "نام شاگرد الزامی است");
      return;
    }

    setSubmitting(true);
    try {
      // ✅ Send only the fields that the API expects
      const response = await principalApi.updateStudent(Number(id), {
        status: status,
        classId: classId || undefined,
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>

      <Text style={styles.title}>ویرایش اطلاعات شاگرد</Text>
      <Text style={styles.subtitle}>{fullName || "شاگرد"}</Text>

      <View style={styles.card}>
        {/* Personal Info */}
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
          placeholder="ایمیل"
          placeholderTextColor="#94a3b8"
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
          placeholder="شماره شاگرد"
          placeholderTextColor="#94a3b8"
          value={studentNumber}
          editable={false}
        />

        {/* Status & Class */}
        <Text style={styles.label}>وضعیت</Text>
        <View style={styles.optionsGrid}>
          {["ACTIVE", "GRADUATED", "SUSPENDED", "LEFT"].map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.optionItem,
                status === opt && styles.optionSelected,
              ]}
              onPress={() => setStatus(opt)}
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

        {/* Dates */}
        <Text style={styles.label}>تاریخ ثبت نام</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94a3b8"
          value={enrollmentDate}
          onChangeText={setEnrollmentDate}
        />

        <Text style={styles.label}>تاریخ فراغت</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94a3b8"
          value={graduationDate}
          onChangeText={setGraduationDate}
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

        {/* Save Button */}
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 16,
  },
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
  disabledInput: {
    opacity: 0.7,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionSelected: {
    backgroundColor: "#fef3c7",
    borderColor: "#f59e0b",
  },
  optionText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  optionTextSelected: {
    color: "#f59e0b",
    fontWeight: "600",
  },
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
  saveDisabled: {
    opacity: 0.7,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
