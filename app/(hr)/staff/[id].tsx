// app/(hr)/staff/[id].tsx - FIXED
import { formatCurrency, getRoleLabel, hrApi } from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// ✅ FIX: Use proper type with union discrimination
type StaffDetail = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  verified: boolean;
  createdAt: string;
  profileImage?: string;
  rfidCode?: string;
  Teacher?: {
    id: number;
    bio: string;
    experience: string;
    hourlyRate: number;
    certification: string;
    availability: boolean;
    rating: number;
    isActive: boolean;
    joiningDate: string;
    teacherCode: string;
    specialization: string;
    baseSalary: number;
    teachingExperience: number;
    languageSkills: string;
    awards: string;
    publications: string;
    contractEndDate: string;
    overtimeRate: number;
    TeacherSubject: { Subject: { name: string } }[];
  };
  FinanceStaff?: {
    id: number;
    position: string;
    department: string;
    isActive: boolean;
    joinDate: string;
    salary: number;
  };
  PrincipalStaff?: {
    id: number;
    position: string;
    isActive: boolean;
    joinDate: string;
    experience: string;
    qualification: string;
  };
  HRStaff?: {
    id: number;
    position: string;
    department: string;
    isActive: boolean;
    joinDate: string;
    salary: number;
  };
};

// ✅ FIX: Helper function to safely get role data
const getRoleData = (staff: StaffDetail) => {
  if (staff.Teacher) {
    return {
      position: "استاد",
      department: "تعلیمی",
      joinDate: staff.Teacher.joiningDate,
      salary: staff.Teacher.baseSalary,
      specialization: staff.Teacher.specialization,
      experience: staff.Teacher.experience,
    };
  } else if (staff.FinanceStaff) {
    return {
      position: staff.FinanceStaff.position || "کارمند مالی",
      department: staff.FinanceStaff.department || "مالی",
      joinDate: staff.FinanceStaff.joinDate,
      salary: staff.FinanceStaff.salary,
      specialization: null,
      experience: null,
    };
  } else if (staff.PrincipalStaff) {
    return {
      position: staff.PrincipalStaff.position || "مدیر مکتب",
      department: "مدیریت",
      joinDate: staff.PrincipalStaff.joinDate,
      salary: null,
      specialization: null,
      experience: staff.PrincipalStaff.experience,
    };
  } else if (staff.HRStaff) {
    return {
      position: staff.HRStaff.position || "کارمند منابع بشری",
      department: staff.HRStaff.department || "منابع بشری",
      joinDate: staff.HRStaff.joinDate,
      salary: staff.HRStaff.salary,
      specialization: null,
      experience: null,
    };
  }
  return {
    position: getRoleLabel(staff.role),
    department: "عمومی",
    joinDate: staff.createdAt,
    salary: null,
    specialization: null,
    experience: null,
  };
};

export default function StaffDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [staff, setStaff] = useState<StaffDetail | null>(null);

  // ✅ FIX: Define fetchStaff as a separate function
  const fetchStaff = async () => {
    try {
      const response = await hrApi.getStaffById(Number(id));
      if (response.success) {
        setStaff(response.data);
      }
    } catch (error) {
      console.error("Fetch staff error:", error);
      Alert.alert("خطا", "خطا در دریافت اطلاعات کارمند");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ FIX: Add fetchStaff to dependency array
  useEffect(() => {
    if (id) {
      fetchStaff();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStaff();
  };

  const handleDelete = () => {
    Alert.alert(
      "حذف کارمند",
      "آیا مطمئن هستید که می‌خواهید این کارمند را حذف کنید؟",
      [
        { text: "لغو", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await hrApi.deleteStaff(Number(id));
              if (response.success) {
                Alert.alert("موفقیت", "کارمند با موفقیت حذف شد", [
                  { text: "باشه", onPress: () => router.back() },
                ]);
              }
            } catch (error: any) {
              Alert.alert("خطا", error.message || "خطا در حذف کارمند");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  if (!staff) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>کارمند یافت نشد</Text>
      </View>
    );
  }

  // ✅ FIX: Use helper function to get role data
  const roleData = getRoleData(staff);
  const position = roleData.position;
  const department = roleData.department;
  const joiningDate = roleData.joinDate;
  const salary = roleData.salary || 0;
  const specialization = roleData.specialization;
  const experience = roleData.experience;

  // Get subjects for teacher
  const subjects =
    staff.Teacher?.TeacherSubject?.map((ts) => ts.Subject.name) || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{staff.fullName.charAt(0)}</Text>
        </View>
        <Text style={styles.staffName}>{staff.fullName}</Text>
        <Text style={styles.staffPosition}>{position}</Text>
        <Text style={styles.staffDepartment}>{department}</Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: staff.isActive ? "#d1fae5" : "#fef3c7" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: staff.isActive ? "#10b981" : "#f59e0b" },
              ]}
            >
              {staff.isActive ? "فعال" : "غیرفعال"}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: staff.verified ? "#dbeafe" : "#fef3c7" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: staff.verified ? "#3b82f6" : "#f59e0b" },
              ]}
            >
              {staff.verified ? "تایید شده" : "تایید نشده"}
            </Text>
          </View>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>اطلاعات تماس</Text>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>{staff.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>{staff.phone || "ثبت نشده"}</Text>
        </View>
        {staff.rfidCode && (
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>RFID: {staff.rfidCode}</Text>
          </View>
        )}
      </View>

      {/* Employment Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>اطلاعات استخدامی</Text>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>
            تاریخ پیوستن:{" "}
            {joiningDate
              ? new Date(joiningDate).toLocaleDateString("fa-IR")
              : "ثبت نشده"}
          </Text>
        </View>
        {salary > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>معاش: {formatCurrency(salary)}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Ionicons name="briefcase-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>نقش: {getRoleLabel(staff.role)}</Text>
        </View>
        {experience && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>سابقه: {experience}</Text>
          </View>
        )}
      </View>

      {/* Teacher Specific Info */}
      {staff.Teacher && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>اطلاعات آموزشی</Text>
          {staff.Teacher.teacherCode && (
            <View style={styles.infoRow}>
              <Ionicons name="id-card-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>
                کد استاد: {staff.Teacher.teacherCode}
              </Text>
            </View>
          )}
          {specialization && (
            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>تخصص: {specialization}</Text>
            </View>
          )}
          {staff.Teacher.rating > 0 && (
            <View style={styles.infoRow}>
              <Ionicons name="star-outline" size={20} color="#f59e0b" />
              <Text style={styles.infoText}>
                امتیاز: {staff.Teacher.rating}
              </Text>
            </View>
          )}
          {subjects.length > 0 && (
            <View style={styles.subjectsContainer}>
              <Text style={styles.subjectsLabel}>مواد درسی:</Text>
              <View style={styles.subjectsList}>
                {subjects.map((subject, index) => (
                  <View key={index} style={styles.subjectTag}>
                    <Text style={styles.subjectText}>{subject}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Principal Specific Info */}
      {staff.PrincipalStaff && staff.PrincipalStaff.qualification && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>مدارک تحصیلی</Text>
          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>
              {staff.PrincipalStaff.qualification}
            </Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#3b82f6" }]}
          onPress={() => router.push(`/(hr)/staff/${id}/edit` as any)}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>ویرایش اطلاعات</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#ef4444" }]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>حذف کارمند</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  content: { padding: 16, paddingBottom: 40 },
  backButton: { marginBottom: 16 },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  staffName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  staffPosition: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  staffDepartment: { fontSize: 14, color: "#94a3b8", fontFamily: "Vazir" },
  statusRow: { flexDirection: "row", gap: 8, marginTop: 8 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 13, fontWeight: "600", fontFamily: "Vazir" },
  infoCard: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  infoText: { fontSize: 15, color: "#1e293b", fontFamily: "Vazir" },
  subjectsContainer: { marginTop: 8 },
  subjectsLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
    fontFamily: "Vazir",
  },
  subjectsList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  subjectTag: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  subjectText: { fontSize: 13, color: "#8b5cf6", fontFamily: "Vazir" },
  actionContainer: { flexDirection: "row", gap: 12, marginTop: 8 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
