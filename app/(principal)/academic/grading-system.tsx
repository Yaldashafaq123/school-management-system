// app/(principal)/academic/grading-system.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type GradeRange = {
  grade: string;
  range: string;
  points: number;
  remark: string;
};

type GradingScheme = {
  id: string;
  name: string;
  description: string;
  type: string;
  passingGrade: string;
  isDefault: boolean;
  grades: GradeRange[];
  createdAt: string;
};

export default function GradingSystemScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [schemes, setSchemes] = useState<GradingScheme[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingScheme, setEditingScheme] = useState<GradingScheme | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "percentage",
    passingGrade: "50",
    isDefault: false,
    grades: [
      { grade: "A", range: "90-100", points: 4.0, remark: "عالی" },
      { grade: "B", range: "80-89", points: 3.0, remark: "خوب" },
      { grade: "C", range: "70-79", points: 2.0, remark: "متوسط" },
      { grade: "D", range: "60-69", points: 1.0, remark: "قابل قبول" },
      { grade: "F", range: "0-59", points: 0.0, remark: "ناکام" },
    ] as GradeRange[],
  });

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/principal/academic/grading-schemes`,
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );
      const result = await response.json();
      if (result.success) {
        setSchemes(result.data);
      }
    } catch (error) {
      console.error("Fetch schemes error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getToken = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    return token;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSchemes();
  };

  const handleSave = async () => {
    if (
      !formData.name ||
      !formData.passingGrade ||
      formData.grades.length === 0
    ) {
      Alert.alert("خطا", "لطفاً تمام فیلدهای الزامی را پر کنید");
      return;
    }

    try {
      const url = editingScheme
        ? `${process.env.EXPO_PUBLIC_API_URL}/principal/academic/grading-schemes/${editingScheme.id}`
        : `${process.env.EXPO_PUBLIC_API_URL}/principal/academic/grading-schemes`;

      const response = await fetch(url, {
        method: editingScheme ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert(
          "موفقیت",
          editingScheme
            ? "سیستم نمره‌دهی به‌روزرسانی شد"
            : "سیستم نمره‌دهی ایجاد شد",
        );
        setModalVisible(false);
        setEditingScheme(null);
        resetForm();
        fetchSchemes();
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در ذخیره‌سازی");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "percentage",
      passingGrade: "50",
      isDefault: false,
      grades: [
        { grade: "A", range: "90-100", points: 4.0, remark: "عالی" },
        { grade: "B", range: "80-89", points: 3.0, remark: "خوب" },
        { grade: "C", range: "70-79", points: 2.0, remark: "متوسط" },
        { grade: "D", range: "60-69", points: 1.0, remark: "قابل قبول" },
        { grade: "F", range: "0-59", points: 0.0, remark: "ناکام" },
      ],
    });
  };

  const handleDelete = (id: string) => {
    Alert.alert("حذف سیستم نمره‌دهی", "آیا مطمئن هستید؟", [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(
              `${process.env.EXPO_PUBLIC_API_URL}/principal/academic/grading-schemes/${id}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${await getToken()}` },
              },
            );
            const result = await response.json();
            if (result.success) {
              Alert.alert("موفقیت", "سیستم نمره‌دهی حذف شد");
              fetchSchemes();
            }
          } catch (error: any) {
            Alert.alert("خطا", error.message || "خطا در حذف");
          }
        },
      },
    ]);
  };

  const setDefault = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/principal/academic/grading-schemes/${id}/default`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );
      const result = await response.json();
      if (result.success) {
        Alert.alert("موفقیت", "سیستم نمره‌دهی پیش‌فرض تنظیم شد");
        fetchSchemes();
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در تنظیم پیش‌فرض");
    }
  };

  const addGradeRow = () => {
    const newGrade: GradeRange = {
      grade: String.fromCharCode(65 + formData.grades.length),
      range: "0-100",
      points: 0,
      remark: "",
    };
    setFormData({ ...formData, grades: [...formData.grades, newGrade] });
  };

  const removeGradeRow = (index: number) => {
    const grades = [...formData.grades];
    grades.splice(index, 1);
    setFormData({ ...formData, grades });
  };

  const updateGradeRow = (
    index: number,
    field: keyof GradeRange,
    value: string | number,
  ) => {
    const grades = [...formData.grades];
    grades[index] = { ...grades[index], [field]: value };
    setFormData({ ...formData, grades });
  };

  const renderScheme = ({ item }: { item: GradingScheme }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardDesc}>{item.description}</Text>
        </View>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>پیش‌فرض</Text>
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.infoText}>نوع: {item.type}</Text>
        <Text style={styles.infoText}>درجه قبولی: {item.passingGrade}%</Text>
        <Text style={styles.infoText}>تعداد درجه‌ها: {item.grades.length}</Text>
      </View>
      <View style={styles.cardActions}>
        {!item.isDefault && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#10b981" }]}
            onPress={() => setDefault(item.id)}
          >
            <Ionicons name="star-outline" size={18} color="#fff" />
            <Text style={styles.actionText}>پیش‌فرض</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#3b82f6" }]}
          onPress={() => {
            setEditingScheme(item);
            setFormData({
              name: item.name,
              description: item.description || "",
              type: item.type,
              passingGrade: item.passingGrade,
              isDefault: item.isDefault,
              grades: item.grades,
            });
            setModalVisible(true);
          }}
        >
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.actionText}>ویرایش</Text>
        </TouchableOpacity>
        {!item.isDefault && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#ef4444" }]}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.actionText}>حذف</Text>
          </TouchableOpacity>
        )}
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
        <Text style={styles.headerTitle}>سیستم نمره‌دهی</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingScheme(null);
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={schemes}
        renderItem={renderScheme}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="stats-chart-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>هیچ سیستم نمره‌دهی یافت نشد</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => {
                setEditingScheme(null);
                resetForm();
                setModalVisible(true);
              }}
            >
              <Text style={styles.createButtonText}>ایجاد سیستم جدید</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalScrollContent}
          >
            <Text style={styles.modalTitle}>
              {editingScheme
                ? "ویرایش سیستم نمره‌دهی"
                : "ایجاد سیستم نمره‌دهی جدید"}
            </Text>

            <Text style={styles.label}>نام سیستم *</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: سیستم نمره‌دهی استاندارد"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <Text style={styles.label}>توضیحات</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="توضیحات..."
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />

            <Text style={styles.label}>نوع</Text>
            <View style={styles.optionsRow}>
              {["percentage", "letter", "gpa"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionItem,
                    formData.type === type && styles.optionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, type })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.type === type && styles.optionTextSelected,
                    ]}
                  >
                    {type === "percentage"
                      ? "درصدی"
                      : type === "letter"
                        ? "حرفی"
                        : "GPA"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>درجه قبولی (%) *</Text>
            <TextInput
              style={styles.input}
              placeholder="50"
              keyboardType="numeric"
              value={formData.passingGrade}
              onChangeText={(text) =>
                setFormData({ ...formData, passingGrade: text })
              }
            />

            <Text style={styles.label}>محدوده‌های نمره *</Text>
            {formData.grades.map((grade, index) => (
              <View key={index} style={styles.gradeRow}>
                <TextInput
                  style={[styles.gradeInput, styles.gradeSmall]}
                  placeholder="A"
                  value={grade.grade}
                  onChangeText={(text) => updateGradeRow(index, "grade", text)}
                />
                <TextInput
                  style={[styles.gradeInput, styles.gradeMedium]}
                  placeholder="90-100"
                  value={grade.range}
                  onChangeText={(text) => updateGradeRow(index, "range", text)}
                />
                <TextInput
                  style={[styles.gradeInput, styles.gradeSmall]}
                  placeholder="4.0"
                  keyboardType="numeric"
                  value={grade.points.toString()}
                  onChangeText={(text) =>
                    updateGradeRow(index, "points", parseFloat(text) || 0)
                  }
                />
                <TextInput
                  style={[styles.gradeInput, styles.gradeLarge]}
                  placeholder="توضیح"
                  value={grade.remark}
                  onChangeText={(text) => updateGradeRow(index, "remark", text)}
                />
                <TouchableOpacity
                  style={styles.removeGradeButton}
                  onPress={() => removeGradeRow(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addGradeButton}
              onPress={addGradeRow}
            >
              <Ionicons name="add-circle-outline" size={24} color="#3b82f6" />
              <Text style={styles.addGradeText}>افزودن محدوده نمره</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.checkboxRow, { marginVertical: 8 }]}
              onPress={() =>
                setFormData({ ...formData, isDefault: !formData.isDefault })
              }
            >
              <View
                style={[
                  styles.checkbox,
                  formData.isDefault && styles.checkboxChecked,
                ]}
              >
                {formData.isDefault && (
                  <Ionicons name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>تنظیم به‌عنوان پیش‌فرض</Text>
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
          </ScrollView>
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
    alignItems: "flex-start",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  cardDesc: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  defaultBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  defaultText: { fontSize: 11, color: "#10b981", fontFamily: "Vazir" },
  cardInfo: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  infoText: { fontSize: 12, color: "#94a3b8", fontFamily: "Vazir" },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 12 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
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
  createButton: {
    marginTop: 16,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
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
    width: "100%",
    maxWidth: 500,
    maxHeight: "90%",
  },
  modalScrollContent: { padding: 24 },
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
  textArea: { minHeight: 60 },
  optionsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionSelected: { backgroundColor: "#fef3c7", borderColor: "#f59e0b" },
  optionText: { fontSize: 14, color: "#64748b", fontFamily: "Vazir" },
  optionTextSelected: { color: "#f59e0b", fontWeight: "600" },
  gradeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  gradeInput: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  gradeSmall: { flex: 1 },
  gradeMedium: { flex: 2 },
  gradeLarge: { flex: 3 },
  removeGradeButton: { padding: 4 },
  addGradeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  addGradeText: { fontSize: 14, color: "#3b82f6", fontFamily: "Vazir" },
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
