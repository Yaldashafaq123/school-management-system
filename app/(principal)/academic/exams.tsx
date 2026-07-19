// app/(principal)/academic/exams.tsx
import { Exam, principalAcademicApi } from "@/src/config/principalAcademicApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollResponderEvent,
    ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
const STATUS_FILTERS = [
  { key: "all", label: "همه" },
  { key: "upcoming", label: "پیشِ‌رو" },
  { key: "ongoing", label: "در حال اجرا" },
  { key: "completed", label: "تکمیل شده" },
];

export default function ExamsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    classId: 0,
    date: "",
    startTime: "",
    totalMarks: 100,
    isPublished: false,
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    await Promise.all([fetchExams(), fetchClasses()]);
  };

  const fetchExams = async () => {
    try {
      const response = await principalAcademicApi.getExams({
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: 50,
      });
      if (response.success) {
        setExams(response.data.exams);
      }
    } catch (error) {
      console.error("Fetch exams error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/principal/classes`,
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );
      const result = await response.json();
      if (result.success) {
        setClasses(result.data);
      }
    } catch (error) {
      console.error("Fetch classes error:", error);
    }
  };

  const getToken = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    return token;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchExams();
  };

  const handleSave = async () => {
    if (!formData.name || !formData.classId || !formData.date) {
      Alert.alert("خطا", "لطفاً تمام فیلدهای الزامی را پر کنید");
      return;
    }

    try {
      let response;
      if (editingExam) {
        response = await principalAcademicApi.updateExam(
          editingExam.id,
          formData,
        );
      } else {
        response = await principalAcademicApi.createExam(formData);
      }

      if (response.success) {
        Alert.alert(
          "موفقیت",
          editingExam ? "امتحان به‌روزرسانی شد" : "امتحان ایجاد شد",
        );
        setModalVisible(false);
        setEditingExam(null);
        setFormData({
          name: "",
          subject: "",
          classId: 0,
          date: "",
          startTime: "",
          totalMarks: 100,
          isPublished: false,
        });
        fetchExams();
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در ذخیره‌سازی");
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("حذف امتحان", "آیا مطمئن هستید؟", [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await principalAcademicApi.deleteExam(id);
            if (response.success) {
              Alert.alert("موفقیت", "امتحان حذف شد");
              fetchExams();
            }
          } catch (error: any) {
            Alert.alert("خطا", error.message || "خطا در حذف");
          }
        },
      },
    ]);
  };

  const togglePublish = async (id: number) => {
    try {
      const response = await principalAcademicApi.toggleExamPublish(id);
      if (response.success) {
        fetchExams();
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در تغییر وضعیت انتشار");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "#3b82f6";
      case "ongoing":
        return "#f59e0b";
      case "completed":
        return "#10b981";
      default:
        return "#94a3b8";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "پیشِ‌رو";
      case "ongoing":
        return "در حال اجرا";
      case "completed":
        return "تکمیل شده";
      default:
        return status;
    }
  };

  const renderExam = ({ item }: { item: Exam }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubject}>{item.subject || "بدون مضمون"}</Text>
          <Text style={styles.cardClass}>{item.className}</Text>
        </View>
        <View style={styles.cardRight}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + "15" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusText(item.status)}
            </Text>
          </View>
          <Text style={styles.cardDate}>
            {new Date(item.date).toLocaleDateString("fa-IR")}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardMarks}>نمره: {item.totalMarks}</Text>
        <Text style={styles.cardStudents}>{item.studentCount} شاگرد</Text>
        <TouchableOpacity
          style={[
            styles.publishButton,
            { backgroundColor: item.isPublished ? "#10b981" : "#94a3b8" },
          ]}
          onPress={() => togglePublish(item.id)}
        >
          <Text style={styles.publishText}>
            {item.isPublished ? "منتشر شده" : "پیش‌نویس"}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#3b82f6" }]}
          onPress={() => {
            setEditingExam(item);
            setFormData({
              name: item.name,
              subject: item.subject,
              classId: item.classId,
              date: new Date(item.date).toISOString().split("T")[0],
              startTime: "",
              totalMarks: item.totalMarks,
              isPublished: item.isPublished,
            });
            setModalVisible(true);
          }}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.actionText}>ویرایش</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#ef4444" }]}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#fff" />
          <Text style={styles.actionText}>حذف</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>مدیریت امتحانات</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingExam(null);
            setFormData({
              name: "",
              subject: "",
              classId: 0,
              date: "",
              startTime: "",
              totalMarks: 100,
              isPublished: false,
            });
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {STATUS_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              statusFilter === filter.key && styles.filterActive,
            ]}
            onPress={() => setStatusFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={exams}
        renderItem={renderExam}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="clipboard-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>هیچ امتحانی یافت نشد</Text>
          </View>
        }
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingExam ? "ویرایش امتحان" : "ایجاد امتحان جدید"}
            </Text>

            <Text style={styles.label}>نام امتحان *</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: امتحان نیم‌سال اول"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <Text style={styles.label}>مضمون</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: ریاضی"
              value={formData.subject}
              onChangeText={(text) =>
                setFormData({ ...formData, subject: text })
              }
            />

            <Text style={styles.label}>صنف *</Text>
            <View style={styles.classSelector}>
              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls.id}
                  style={[
                    styles.classOption,
                    formData.classId === cls.id && styles.classOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, classId: cls.id })}
                >
                  <Text
                    style={[
                      styles.classOptionText,
                      formData.classId === cls.id &&
                        styles.classOptionTextSelected,
                    ]}
                  >
                    {cls.name} {cls.section}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>تاریخ *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.date}
              onChangeText={(text) => setFormData({ ...formData, date: text })}
            />

            <Text style={styles.label}>زمان شروع</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              value={formData.startTime}
              onChangeText={(text) =>
                setFormData({ ...formData, startTime: text })
              }
            />

            <Text style={styles.label}>نمره کل</Text>
            <TextInput
              style={styles.input}
              placeholder="100"
              keyboardType="numeric"
              value={formData.totalMarks.toString()}
              onChangeText={(text) =>
                setFormData({ ...formData, totalMarks: parseInt(text) || 0 })
              }
            />

            <TouchableOpacity
              style={[styles.checkboxRow, { marginVertical: 8 }]}
              onPress={() =>
                setFormData({ ...formData, isPublished: !formData.isPublished })
              }
            >
              <View
                style={[
                  styles.checkbox,
                  formData.isPublished && styles.checkboxChecked,
                ]}
              >
                {formData.isPublished && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>انتشار امتحان</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>لغو</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>ذخیره</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 8,
  },
  filterActive: { backgroundColor: "#f59e0b" },
  filterText: { fontSize: 13, color: "#64748b", fontFamily: "Vazir" },
  filterTextActive: { color: "#fff" },
  listContent: { padding: 16, gap: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  cardSubject: { fontSize: 13, color: "#64748b", fontFamily: "Vazir" },
  cardClass: { fontSize: 13, color: "#94a3b8", fontFamily: "Vazir" },
  cardRight: { alignItems: "flex-end" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: "600", fontFamily: "Vazir" },
  cardDate: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  cardMarks: { fontSize: 13, color: "#64748b", fontFamily: "Vazir" },
  cardStudents: { fontSize: 13, color: "#64748b", fontFamily: "Vazir" },
  publishButton: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
  publishText: { color: "#fff", fontSize: 11, fontFamily: "Vazir" },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  actionText: { color: "#fff", fontSize: 13, fontFamily: "Vazir" },
  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 16,
    fontFamily: "VazirBold",
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 8,
    marginBottom: 4,
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
  classSelector: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  classOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "transparent",
  },
  classOptionSelected: { backgroundColor: "#fef3c7", borderColor: "#f59e0b" },
  classOptionText: { fontSize: 14, color: "#64748b", fontFamily: "Vazir" },
  classOptionTextSelected: { color: "#f59e0b", fontWeight: "600" },
  checkboxRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: { backgroundColor: "#f59e0b", borderColor: "#f59e0b" },
  checkboxLabel: { fontSize: 15, color: "#1e293b", fontFamily: "Vazir" },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 16 },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: { backgroundColor: "#f1f5f9" },
  cancelButtonText: { color: "#64748b", fontSize: 15, fontFamily: "Vazir" },
  saveButton: { backgroundColor: "#f59e0b" },
  saveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
