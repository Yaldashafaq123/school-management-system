// app/(admin)/financial/fees/templates/[id].tsx
import { EmptyState } from "@/components/finance/EmptyState";
import { BulkStudent, FeeTemplate, financeApi } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function TemplateDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [template, setTemplate] = useState<FeeTemplate | null>(null);
  const [students, setStudents] = useState<BulkStudent[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<number>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadTemplate();
    loadStudents();
  }, [id]);

  const loadTemplate = async () => {
    try {
      const response = await financeApi.getFeeTemplateById(Number(id));
      if (response.success) setTemplate(response.data);
    } catch (error) {
      console.error("Load template error:", error);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await financeApi.getStudentsForTemplate(Number(id));
      if (response.success) setStudents(response.data);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (studentId: number) => {
    const newSet = new Set(selectedStudents);
    if (newSet.has(studentId)) {
      newSet.delete(studentId);
    } else {
      newSet.add(studentId);
    }
    setSelectedStudents(newSet);
  };

  const toggleAll = () => {
    if (
      selectedStudents.size === students.filter((s) => !s.existingFee).length
    ) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(
        new Set(students.filter((s) => !s.existingFee).map((s) => s.id)),
      );
    }
  };

  const handleAssign = async () => {
    if (selectedStudents.size === 0) {
      Alert.alert("خطا", "حداقل یک شاگرد انتخاب کنید");
      return;
    }

    setAssigning(true);
    try {
      const response = await financeApi.assignTemplateToStudents({
        templateId: Number(id),
        studentIds: Array.from(selectedStudents),
      });

      if (response.success) {
        Alert.alert("موفقیت", "قالب با موفقیت به شاگردان تخصیص داده شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "تخصیص با مشکل مواجه شد");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  if (!template) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>قالب پیدا نشد</Text>
      </View>
    );
  }

  const totalAmount = template.templateItems.reduce(
    (sum, item) => sum + Number(item.amount),
    0,
  );
  const availableStudents = students.filter((s) => !s.existingFee);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>جزئیات قالب</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push(`/financial/fees/templates/create?id=${id}`)
          }
        >
          <Ionicons name="create-outline" size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Template Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.iconContainer}>
              <Ionicons name="copy" size={32} color="#06b6d4" />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateMeta}>
                {template.class
                  ? `${template.class.name} ${template.class.section || ""}`
                  : "همه صنوف"}
                {" • "}
                {template.academicYear?.name}
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="layers" size={20} color="#06b6d4" />
              <Text style={styles.statValue}>
                {template.templateItems.length}
              </Text>
              <Text style={styles.statLabel}>اقلام</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="cash" size={20} color="#8b5cf6" />
              <Text style={styles.statValue}>
                {totalAmount.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>افغانی</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="people" size={20} color="#3b82f6" />
              <Text style={styles.statValue}>{students.length}</Text>
              <Text style={styles.statLabel}>شاگرد</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.statValue}>
                {students.filter((s) => s.existingFee).length}
              </Text>
              <Text style={styles.statLabel}>تخصیص شده</Text>
            </View>
          </View>
        </View>

        {/* Fee Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اقلام فیس</Text>
          {template.templateItems.map((item, index) => (
            <View key={item.id || index} style={styles.feeItem}>
              <View
                style={[
                  styles.feeItemDot,
                  { backgroundColor: item.isRecurring ? "#f59e0b" : "#3b82f6" },
                ]}
              />
              <View style={styles.feeItemInfo}>
                <Text style={styles.feeItemName}>{item.name}</Text>
                <Text style={styles.feeItemType}>
                  {item.isRecurring ? "ماهانه" : "یکباره"}
                  {item.isMandatory ? " • اجباری" : ""}
                </Text>
              </View>
              <Text style={styles.feeItemAmount}>
                {Number(item.amount).toLocaleString()} افغانی
              </Text>
            </View>
          ))}
        </View>

        {/* Students Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              تخصیص به شاگردان ({availableStudents.length})
            </Text>
            {availableStudents.length > 0 && (
              <TouchableOpacity
                onPress={toggleAll}
                style={styles.selectAllButton}
              >
                <Ionicons
                  name={
                    selectedStudents.size === availableStudents.length
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={20}
                  color="#3b82f6"
                />
                <Text style={styles.selectAllText}>
                  {selectedStudents.size === availableStudents.length
                    ? "حذف همه"
                    : "انتخاب همه"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {availableStudents.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title="همه شاگردان تخصیص شده‌اند"
              subtitle="همه شاگردان این صنف قبلاً فیس دارند"
            />
          ) : (
            availableStudents.map((student) => (
              <TouchableOpacity
                key={student.id}
                style={[
                  styles.studentItem,
                  selectedStudents.has(student.id) &&
                    styles.studentItemSelected,
                ]}
                onPress={() => toggleStudent(student.id)}
              >
                <Ionicons
                  name={
                    selectedStudents.has(student.id)
                      ? "checkbox"
                      : "square-outline"
                  }
                  size={22}
                  color={
                    selectedStudents.has(student.id) ? "#3b82f6" : "#cbd5e1"
                  }
                />
                <View style={styles.studentAvatar}>
                  <Ionicons name="person" size={18} color="#3b82f6" />
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentRoll}>{student.rollNumber}</Text>
                </View>
                {student.existingFee && (
                  <View style={styles.existingBadge}>
                    <Text style={styles.existingText}>فیس دارد</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}

          {students.filter((s) => s.existingFee).length > 0 && (
            <View style={styles.existingNote}>
              <Ionicons name="information-circle" size={16} color="#f59e0b" />
              <Text style={styles.existingNoteText}>
                {students.filter((s) => s.existingFee).length} شاگرد قبلاً فیس
                دارند و در لیست نیستند
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Assign Button */}
      {selectedStudents.size > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerCount}>
              {selectedStudents.size} شاگرد انتخاب شده
            </Text>
            <Text style={styles.footerAmount}>
              مجموع: {(totalAmount * selectedStudents.size).toLocaleString()}{" "}
              افغانی
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.assignButton,
              assigning && styles.assignButtonDisabled,
            ]}
            onPress={handleAssign}
            disabled={assigning}
          >
            {assigning ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={styles.assignText}>تخصیص فیس</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    gap: 12,
  },
  errorText: { fontSize: 16, color: "#64748b", fontFamily: "Vazir" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: { flex: 1 },
  infoCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#ecfeff",
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: { flex: 1 },
  templateName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  templateMeta: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  statsGrid: { flexDirection: "row", gap: 8 },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 4,
    fontFamily: "VazirBold",
  },
  statLabel: { fontSize: 11, color: "#94a3b8", fontFamily: "Vazir" },
  section: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    fontFamily: "VazirBold",
  },
  selectAllButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  selectAllText: { fontSize: 13, color: "#3b82f6", fontFamily: "Vazir" },
  feeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    gap: 10,
  },
  feeItemDot: { width: 8, height: 8, borderRadius: 4 },
  feeItemInfo: { flex: 1 },
  feeItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  feeItemType: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  feeItemAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    fontFamily: "Vazir",
  },
  studentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 10,
    marginBottom: 4,
  },
  studentItemSelected: { backgroundColor: "#eff6ff" },
  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  studentInfo: { flex: 1 },
  studentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  studentRoll: { fontSize: 12, color: "#94a3b8", fontFamily: "Vazir" },
  existingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#fef3c7",
    borderRadius: 6,
  },
  existingText: { fontSize: 11, color: "#d97706", fontFamily: "Vazir" },
  existingNote: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 10,
    backgroundColor: "#fffbeb",
    borderRadius: 8,
    gap: 8,
  },
  existingNoteText: {
    fontSize: 12,
    color: "#92400e",
    flex: 1,
    fontFamily: "Vazir",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  footerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  footerCount: { fontSize: 14, color: "#475569", fontFamily: "Vazir" },
  footerAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  assignButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#06b6d4",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  assignButtonDisabled: { opacity: 0.6 },
  assignText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
});
