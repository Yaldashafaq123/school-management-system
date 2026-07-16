// app/(principal)/classes/[id].tsx
import { ClassItem, principalApi } from "@/src/config/principalApi";
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

type ClassDetail = ClassItem & {
  students: {
    id: number;
    fullName: string;
    studentNumber: string;
    status: string;
  }[];
};

export default function ClassDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classData, setClassData] = useState<ClassDetail | null>(null);

  useEffect(() => {
    if (id) fetchClass();
  }, [id]);

  const fetchClass = async () => {
    try {
      const [classRes, studentsRes] = await Promise.all([
        principalApi.getClasses(),
        principalApi.getStudents({ classId: Number(id), limit: 100 }),
      ]);

      if (classRes.success) {
        const cls = classRes.data.find((c: any) => c.id === Number(id));
        if (cls) {
          setClassData({
            ...cls,
            students: studentsRes.success ? studentsRes.data.students : [],
          });
        }
      }
    } catch (error) {
      console.error("Fetch class error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchClass();
  };

  const handleDelete = () => {
    Alert.alert(
      "حذف صنف",
      "آیا مطمئن هستید که می‌خواهید این صنف را حذف کنید؟",
      [
        { text: "لغو", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await principalApi.deleteClass(Number(id));
              if (response.success) {
                Alert.alert("موفقیت", "صنف با موفقیت حذف شد", [
                  { text: "باشه", onPress: () => router.back() },
                ]);
              }
            } catch (error: any) {
              Alert.alert("خطا", error.message || "خطا در حذف صنف");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!classData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>صنف یافت نشد</Text>
      </View>
    );
  }

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

      {/* Class Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.classHeader}>
          <View style={styles.classIcon}>
            <Ionicons name="book" size={32} color="#f59e0b" />
          </View>
          <View>
            <Text style={styles.className}>
              {classData.name} {classData.section}
            </Text>
            <Text style={styles.classTeacher}>
              استاد: {classData.teacherName}
            </Text>
            <Text style={styles.classYear}>{classData.academicYear}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{classData.studentCount}</Text>
            <Text style={styles.statLabel}>شاگردان</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {classData.students?.length || 0}
            </Text>
            <Text style={styles.statLabel}>فعال</Text>
          </View>
        </View>
      </View>

      {/* Students List */}
      <Text style={styles.sectionTitle}>شاگردان صنف</Text>
      {classData.students && classData.students.length > 0 ? (
        classData.students.map((student) => (
          <TouchableOpacity
            key={student.id}
            style={styles.studentItem}
            onPress={() => router.push(`/students/${student.id}`)}
          >
            <View style={styles.studentAvatar}>
              <Text style={styles.studentAvatarText}>
                {student.fullName.charAt(0)}
              </Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{student.fullName}</Text>
              <Text style={styles.studentNumber}>{student.studentNumber}</Text>
            </View>
            <View style={styles.studentStatus}>
              <Text
                style={[
                  styles.statusText,
                  {
                    color: student.status === "ACTIVE" ? "#10b981" : "#94a3b8",
                  },
                ]}
              >
                {student.status === "ACTIVE" ? "فعال" : "غیرفعال"}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={32} color="#94a3b8" />
          <Text style={styles.emptyText}>هیچ شاگردی در این صنف نیست</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#3b82f6" }]}
          onPress={() => router.push(`/classes/${id}/edit`)}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>ویرایش صنف</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#ef4444" }]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>حذف صنف</Text>
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
  classHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  classIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
  },
  className: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  classTeacher: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  classYear: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  statLabel: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    elevation: 1,
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
  studentNumber: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  studentStatus: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  actionContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
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
