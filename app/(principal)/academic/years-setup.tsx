// app/(principal)/academic/years-setup.tsx
import {
    AcademicYear,
    principalAcademicApi,
} from "@/src/config/principalAcademicApi";
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
} from "react-native";

export default function YearsSetupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isActive: false,
  });

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      const response = await principalAcademicApi.getAcademicYears();
      if (response.success) {
        setYears(response.data);
      }
    } catch (error) {
      console.error("Fetch years error:", error);
      Alert.alert("خطا", "خطا در دریافت سال‌های تحصیلی");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchYears();
  };

  const handleSave = async () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      Alert.alert("خطا", "لطفاً تمام فیلدها را پر کنید");
      return;
    }

    try {
      let response;
      if (editingYear) {
        response = await principalAcademicApi.updateAcademicYear(
          editingYear.id,
          formData,
        );
      } else {
        response = await principalAcademicApi.createAcademicYear(formData);
      }

      if (response.success) {
        Alert.alert(
          "موفقیت",
          editingYear ? "سال تحصیلی به‌روزرسانی شد" : "سال تحصیلی ایجاد شد",
        );
        setModalVisible(false);
        setEditingYear(null);
        setFormData({ name: "", startDate: "", endDate: "", isActive: false });
        fetchYears();
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در ذخیره‌سازی");
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("حذف سال تحصیلی", "آیا مطمئن هستید؟", [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await principalAcademicApi.deleteAcademicYear(id);
            if (response.success) {
              Alert.alert("موفقیت", "سال تحصیلی حذف شد");
              fetchYears();
            }
          } catch (error: any) {
            Alert.alert("خطا", error.message || "خطا در حذف");
          }
        },
      },
    ]);
  };

  const renderYear = ({ item }: { item: AcademicYear }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDate}>
            {new Date(item.startDate).toLocaleDateString("fa-IR")} -{" "}
            {new Date(item.endDate).toLocaleDateString("fa-IR")}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: item.isActive ? "#d1fae5" : "#fef3c7" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: item.isActive ? "#10b981" : "#f59e0b" },
            ]}
          >
            {item.isActive ? "فعال" : "غیرفعال"}
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#3b82f6" }]}
          onPress={() => {
            setEditingYear(item);
            setFormData({
              name: item.name,
              startDate: new Date(item.startDate).toISOString().split("T")[0],
              endDate: new Date(item.endDate).toISOString().split("T")[0],
              isActive: item.isActive,
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
        <Text style={styles.headerTitle}>سال‌های تحصیلی</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingYear(null);
            setFormData({
              name: "",
              startDate: "",
              endDate: "",
              isActive: false,
            });
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={years}
        renderItem={renderYear}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>هیچ سال تحصیلی یافت نشد</Text>
          </View>
        }
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingYear ? "ویرایش سال تحصیلی" : "ایجاد سال تحصیلی جدید"}
            </Text>

            <Text style={styles.label}>نام سال تحصیلی</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: سال تحصیلی ۱۴۰۴-۱۴۰۵"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <Text style={styles.label}>تاریخ شروع</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.startDate}
              onChangeText={(text) =>
                setFormData({ ...formData, startDate: text })
              }
            />

            <Text style={styles.label}>تاریخ پایان</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.endDate}
              onChangeText={(text) =>
                setFormData({ ...formData, endDate: text })
              }
            />

            <TouchableOpacity
              style={[styles.checkboxRow, { marginVertical: 12 }]}
              onPress={() =>
                setFormData({ ...formData, isActive: !formData.isActive })
              }
            >
              <View
                style={[
                  styles.checkbox,
                  formData.isActive && styles.checkboxChecked,
                ]}
              >
                {formData.isActive && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>فعال</Text>
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
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  cardDate: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: "600", fontFamily: "Vazir" },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
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
    marginTop: 12,
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
