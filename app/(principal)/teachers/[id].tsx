// app/(principal)/teachers/[id].tsx
import { formatCurrency, principalApi } from "@/src/config/principalApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
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

type TeacherDetail = {
  id: number;
  User: {
    fullName: string;
    email: string;
    phone: string;
    profileImage?: string;
  };
  teacherCode: string;
  isActive: boolean;
  joiningDate: string;
  specialization: string;
  rating: number;
  baseSalary: number;
  experience: string;
  certification: string;
  availability: boolean;
  TeacherSubject: {
    Subject: {
      id: number;
      name: string;
    };
  }[];
  Class: {
    id: number;
    name: string;
    section: string;
    _count: {
      Student: number;
    };
  } | null;
  Salary: {
    id: number;
    amount: number;
    month: number;
    year: number;
    status: string;
  }[];
};

export default function TeacherDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);

  useEffect(() => {
    if (id) fetchTeacher();
  }, [id]);

  const fetchTeacher = async () => {
    try {
      const response = await principalApi.getTeacherById(Number(id));
      if (response.success) {
        setTeacher(response.data);
      }
    } catch (error) {
      console.error("Fetch teacher error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTeacher();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!teacher) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>استاد یافت نشد</Text>
      </View>
    );
  }

  const subjects = teacher.TeacherSubject?.map((ts) => ts.Subject.name) || [];

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
          <Text style={styles.avatarText}>
            {teacher.User.fullName.charAt(0)}
          </Text>
        </View>
        <Text style={styles.teacherName}>{teacher.User.fullName}</Text>
        <Text style={styles.specializationText}>
          {teacher.specialization || "متخصص"}
        </Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: teacher.isActive ? "#d1fae5" : "#fef3c7" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: teacher.isActive ? "#10b981" : "#f59e0b" },
              ]}
            >
              {teacher.isActive ? "فعال" : "غیرفعال"}
            </Text>
          </View>
          {teacher.availability && (
            <View style={[styles.statusBadge, { backgroundColor: "#dbeafe" }]}>
              <Text style={[styles.statusText, { color: "#3b82f6" }]}>
                در دسترس
              </Text>
            </View>
          )}
        </View>
        {teacher.rating > 0 && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#f59e0b" />
            <Text style={styles.ratingText}>{teacher.rating}</Text>
          </View>
        )}
      </View>

      {/* Contact Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>اطلاعات تماس</Text>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>{teacher.User.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>
            {teacher.User.phone || "ثبت نشده"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>کد: {teacher.teacherCode}</Text>
        </View>
      </View>

      {/* Professional Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>اطلاعات حرفه‌ای</Text>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>
            تاریخ پیوستن:{" "}
            {new Date(teacher.joiningDate).toLocaleDateString("fa-IR")}
          </Text>
        </View>
        {teacher.experience && (
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>{teacher.experience}</Text>
          </View>
        )}
        {teacher.certification && (
          <View style={styles.infoRow}>
            <Ionicons name="document-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>{teacher.certification}</Text>
          </View>
        )}
        {teacher.baseSalary > 0 && (
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>
              معاش پایه: {formatCurrency(teacher.baseSalary)}
            </Text>
          </View>
        )}
      </View>

      {/* Subjects */}
      {subjects.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>مواد درسی</Text>
          <View style={styles.subjectsContainer}>
            {subjects.map((subject, index) => (
              <View key={index} style={styles.subjectTag}>
                <Text style={styles.subjectText}>{subject}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Class Info */}
      {teacher.Class && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>صنف</Text>
          <View style={styles.classInfoCard}>
            <Text style={styles.className}>
              {teacher.Class.name} {teacher.Class.section}
            </Text>
            <Text style={styles.classStudents}>
              تعداد شاگردان: {teacher.Class._count.Student}
            </Text>
          </View>
        </View>
      )}

      {/* Recent Salaries */}
      {teacher.Salary && teacher.Salary.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>معاشات اخیر</Text>
          {teacher.Salary.slice(0, 5).map((salary) => (
            <View key={salary.id} style={styles.salaryItem}>
              <Text style={styles.salaryMonth}>
                {getMonthName(salary.month)} {salary.year}
              </Text>
              <Text style={styles.salaryAmount}>
                {formatCurrency(salary.amount)}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      salary.status === "PAID" ? "#d1fae5" : "#fef3c7",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: salary.status === "PAID" ? "#10b981" : "#f59e0b" },
                  ]}
                >
                  {salary.status === "PAID" ? "پرداخت شد" : "در انتظار"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#3b82f6" }]}
          onPress={() => router.push(`./${id}/edit`)}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>ویرایش اطلاعات</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const getMonthName = (month: number) => {
  const months = [
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
  return months[month - 1] || month;
};

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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 16,
  },
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
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#3b82f6",
    fontFamily: "VazirBold",
  },
  teacherName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  specializationText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f59e0b",
    fontFamily: "VazirBold",
  },
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
  infoText: {
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  subjectsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  subjectTag: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  subjectText: {
    fontSize: 13,
    color: "#8b5cf6",
    fontFamily: "Vazir",
  },
  classInfoCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
  },
  className: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  classStudents: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  salaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  salaryMonth: {
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  salaryAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  actionContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
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
