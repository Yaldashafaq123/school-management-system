// app/(principal)/students/[id].tsx - FIXED
import {
    formatCurrency,
    getStudentStatusColor,
    getStudentStatusText,
    principalApi,
} from "@/src/config/principalApi";
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

// ✅ Define local interface matching the actual data structure
interface StudentDetailType {
  id: number;
  User: {
    fullName: string;
    email: string;
    phone: string;
    profileImage?: string;
  };
  Class: {
    id: number;
    name: string;
    section: string;
    status?: string; // ✅ Added status as optional
    Teacher: {
      id: number;
      User: {
        fullName: string;
      };
    };
  } | null;
  studentNumber?: string;
  status?: string;
  classId?: number | null;
  enrollmentDate?: string;
  graduationDate?: string | null;
  scholarship?: boolean;
  scholarshipPercentage?: number | null;
  feeWaiver?: boolean;
  feeWaiverReason?: string | null;
  FeeAssignment?: any[];
  Grade?: any[];
  Attendance?: any[];
  ParentStudent?: any[];
  feeSummary?: {
    totalFees: number;
    totalPaid: number;
    totalBalance: number;
    collectionRate: number;
  };
}

export default function StudentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [student, setStudent] = useState<StudentDetailType | null>(null);

  // ✅ Define fetchStudent as a separate function
  const fetchStudent = async () => {
    try {
      const response = await principalApi.getStudentById(Number(id));
      if (response.success) {
        // ✅ Map the response to our local type
        const data = response.data;
        setStudent({
          id: data.id,
          User: data.User,
          Class: data.Class
            ? {
                ...data.Class,
                status: data.status || "ACTIVE",
              }
            : null,
          studentNumber: data.studentNumber,
          status: data.status || "ACTIVE",
          classId: data.classId,
          enrollmentDate: data.enrollmentDate,
          graduationDate: data.graduationDate,
          scholarship: data.scholarship,
          scholarshipPercentage: data.scholarshipPercentage,
          feeWaiver: data.feeWaiver,
          feeWaiverReason: data.feeWaiverReason,
          FeeAssignment: data.FeeAssignment,
          Grade: data.Grade,
          Attendance: data.Attendance,
          ParentStudent: data.ParentStudent,
          feeSummary: data.feeSummary,
        });
      }
    } catch (error) {
      console.error("Fetch student error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Add fetchStudent to dependency array
  useEffect(() => {
    if (id) {
      fetchStudent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudent();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>شاگرد یافت نشد</Text>
      </View>
    );
  }

  // Get status from student or from class
  const studentStatus = student.status || student.Class?.status || "ACTIVE";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {student.User.fullName.charAt(0)}
          </Text>
        </View>
        <Text style={styles.studentName}>{student.User.fullName}</Text>
        <Text style={styles.classInfo}>
          {student.Class?.name || "بدون صنف"} {student.Class?.section || ""}
        </Text>
        <View style={styles.statusBadge}>
          <Text
            style={[
              styles.statusText,
              { color: getStudentStatusColor(studentStatus) },
            ]}
          >
            {getStudentStatusText(studentStatus)}
          </Text>
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>اطلاعات تماس</Text>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>{student.User.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>
            {student.User.phone || "ثبت نشده"}
          </Text>
        </View>
        {student.studentNumber && (
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>
              شماره شاگرد: {student.studentNumber}
            </Text>
          </View>
        )}
      </View>

      {/* Fee Summary */}
      {student.feeSummary && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>خلاصه فیس</Text>
          <View style={styles.feeGrid}>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>کل فیس</Text>
              <Text style={styles.feeValue}>
                {formatCurrency(student.feeSummary.totalFees || 0)}
              </Text>
            </View>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>پرداخت شده</Text>
              <Text style={[styles.feeValue, { color: "#10b981" }]}>
                {formatCurrency(student.feeSummary.totalPaid || 0)}
              </Text>
            </View>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>باقیمانده</Text>
              <Text
                style={[
                  styles.feeValue,
                  {
                    color:
                      student.feeSummary.totalBalance > 0
                        ? "#ef4444"
                        : "#10b981",
                  },
                ]}
              >
                {formatCurrency(student.feeSummary.totalBalance || 0)}
              </Text>
            </View>
            <View style={styles.feeItem}>
              <Text style={styles.feeLabel}>نرخ وصول</Text>
              <Text style={[styles.feeValue, { color: "#8b5cf6" }]}>
                {student.feeSummary.collectionRate || 0}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Parents */}
      {student.ParentStudent && student.ParentStudent.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>والدین</Text>
          {student.ParentStudent.map((ps: any, index: number) => (
            <View key={ps.Parent?.id || index} style={styles.parentItem}>
              <Text style={styles.parentName}>
                {ps.Parent?.User?.fullName || "نامشخص"}
              </Text>
              <Text style={styles.parentPhone}>
                {ps.Parent?.User?.phone || ""}
              </Text>
              <Text style={styles.parentRelation}>
                {ps.Parent?.relationship || "والد"}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#3b82f6" }]}
          onPress={() => router.push(`./${id}/edit` as any)}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>ویرایش اطلاعات</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#8b5cf6" }]}
          onPress={() => router.push(`./${id}/promote` as any)}
        >
          <Ionicons name="arrow-up-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>ارتقا صنف</Text>
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
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#f59e0b",
    fontFamily: "VazirBold",
  },
  studentName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  classInfo: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Vazir",
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
  feeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  feeItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  feeLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  feeValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
    fontFamily: "VazirBold",
    color: "#1e293b",
  },
  parentItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  parentName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  parentPhone: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  parentRelation: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
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
