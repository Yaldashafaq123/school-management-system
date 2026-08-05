// app/(admin)/financial/expenses/categories.tsx
import { EmptyState } from "@/components/finance/EmptyState";
import { financeApi } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ExpenseCategoriesScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await financeApi.getExpenseCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Fetch categories error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setModalVisible(true);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert("خطا", "نام دسته‌بندی را وارد کنید");
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await financeApi.updateExpenseCategory(editingCategory.id, {
          name: categoryName,
          description: categoryDescription,
        });
        Alert.alert("موفقیت", "دسته‌بندی ویرایش شد");
      } else {
        await financeApi.createExpenseCategory({
          name: categoryName,
          description: categoryDescription,
        });
        Alert.alert("موفقیت", "دسته‌بندی جدید ایجاد شد");
      }
      setModalVisible(false);
      fetchCategories();
    } catch (error: any) {
      Alert.alert("خطا", error.message || "عملیات با مشکل مواجه شد");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (category: any) => {
    Alert.alert("حذف دسته‌بندی", `آیا از حذف "${category.name}" مطمئن هستید؟`, [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            await financeApi.deleteExpenseCategory(category.id);
            setCategories((prev) => prev.filter((c) => c.id !== category.id));
            Alert.alert("موفقیت", "دسته‌بندی حذف شد");
          } catch (error: any) {
            Alert.alert("خطا", error.message);
          }
        },
      },
    ]);
  };

  const renderCategory = ({ item }: { item: any }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryIcon}>
        <Ionicons name={getCategoryIcon(item.name)} size={24} color="#ef4444" />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.categoryDescription}>{item.description}</Text>
        )}
        {item._count && (
          <Text style={styles.categoryCount}>
            {item._count.expenses} مصرف ثبت شده
          </Text>
        )}
      </View>
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="create-outline" size={18} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>دسته‌بندی مصارف</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ef4444" />
        </View>
      ) : categories.length === 0 ? (
        <EmptyState
          icon="pricetags-outline"
          title="دسته‌بندی وجود ندارد"
          subtitle="دسته‌بندی‌های مصرف را ایجاد کنید"
          actionLabel="ایجاد دسته‌بندی"
          onAction={handleAdd}
        />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
            </Text>

            <Text style={styles.inputLabel}>نام</Text>
            <TextInput
              style={styles.input}
              placeholder="نام دسته‌بندی"
              placeholderTextColor="#94a3b8"
              value={categoryName}
              onChangeText={setCategoryName}
              textAlign="right"
            />

            <Text style={styles.inputLabel}>توضیحات (اختیاری)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="توضیحات..."
              placeholderTextColor="#94a3b8"
              value={categoryDescription}
              onChangeText={setCategoryDescription}
              multiline
              numberOfLines={2}
              textAlign="right"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>لغو</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveText}>ذخیره</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function getCategoryIcon(categoryName: string): string {
  const icons: Record<string, string> = {
    اجاره: "home-outline",
    معاش: "cash-outline",
    برق: "flash-outline",
    آب: "water-outline",
    انترنت: "wifi-outline",
    تعمیرات: "build-outline",
    لوازم: "cart-outline",
    "حمل و نقل": "car-outline",
    غذا: "restaurant-outline",
  };
  return icons[categoryName] || "receipt-outline";
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
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    gap: 12,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  categoryDescription: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  categoryCount: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  categoryActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "VazirBold",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
    fontFamily: "Vazir",
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Vazir",
    minHeight: 60,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f1f5f9",
  },
  cancelText: {
    color: "#64748b",
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  saveButton: {
    backgroundColor: "#ef4444",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
