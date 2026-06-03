import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

interface ExpenseCategory {
  id: number;
  name: string;
  description: string | null;
  _count?: {
    expenses: number;
  };
}

const CATEGORY_ICONS: Record<string, string> = {
  "اجاره": "business",
  "حقوق": "wallet",
  "لوازم التحریر": "create",
  "تعمیرات": "construct",
  "آب و برق": "flash",
  "اینترنت": "wifi",
  "بیمه": "shield",
  "سایر": "ellipsis-horizontal",
};

export default function ExpenseCategories() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    try {
      const response = await financeApi.getExpenseCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری دسته‌بندی‌ها پیش آمد");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setErrors({});
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setModalVisible(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "نام دسته‌بندی الزامی است";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "نام باید حداقل ۲ کاراکتر باشد";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (editingCategory) {
        await financeApi.updateExpenseCategory(editingCategory.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
        Alert.alert("موفق", "دسته‌بندی با موفقیت بروزرسانی شد");
      } else {
        await financeApi.createExpenseCategory({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        });
        Alert.alert("موفق", "دسته‌بندی با موفقیت ایجاد شد");
      }
      setModalVisible(false);
      resetForm();
      loadData();
    } catch (error: any) {
      Alert.alert("خطا", error?.message || "عملیات ناموفق بود");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (category: ExpenseCategory) => {
    const expenseCount = category._count?.expenses || 0;
    Alert.alert(
      "حذف دسته‌بندی",
      `${expenseCount > 0 ? `این دسته‌بندی ${expenseCount} هزینه دارد. ` : ""}آیا از حذف "${category.name}" مطمئن هستید؟`,
      [
        { text: "انصراف", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              await financeApi.deleteExpenseCategory(category.id);
              Alert.alert("موفق", "دسته‌بندی با موفقیت حذف شد");
              loadData();
            } catch (error: any) {
              Alert.alert("خطا", error?.message || "حذف دسته‌بندی ناموفق بود");
            }
          },
        },
      ]
    );
  };

  const getCategoryIcon = (name: string) => {
    return CATEGORY_ICONS[name] || "pricetag";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="دسته‌بندی هزینه‌ها" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="دسته‌بندی هزینه‌ها" showBack />

      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{categories.length}</Text>
          <Text style={styles.summaryLabel}>دسته‌بندی</Text>
        </View>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
        renderItem={({ item }) => (
          <View style={styles.categoryCard}>
            <View style={styles.categoryInfo}>
              <View style={[styles.categoryIcon, { backgroundColor: `${Colors.primary}15` }]}>
                <Ionicons name={getCategoryIcon(item.name) as any} size={22} color={Colors.primary} />
              </View>
              <View style={styles.categoryDetails}>
                <Text style={styles.categoryName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.categoryDescription} numberOfLines={1}>
                    {item.description}
                  </Text>
                )}
                <Text style={styles.expenseCount}>
                  {item._count?.expenses || 0} هزینه ثبت شده
                </Text>
              </View>
            </View>
            <View style={styles.categoryActions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: `${Colors.primary}15` }]}
                onPress={() => openEditModal(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={16} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: `${Colors.danger}15` }]}
                onPress={() => handleDelete(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="pricetags-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>دسته‌بندی ثبت نشده است</Text>
            <Text style={styles.emptyDesc}>
              برای دسته‌بندی هزینه‌ها، ابتدا یک دسته‌بندی ایجاد کنید
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={openAddModal}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.emptyButtonText}>ایجاد دسته‌بندی جدید</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingCategory ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  نام دسته‌بندی <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.formInput, errors.name ? styles.inputError : null]}
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData({ ...formData, name: text });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="مثال: لوازم التحریر"
                  placeholderTextColor={Colors.textSecondary}
                  textAlign="right"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>توضیحات (اختیاری)</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="توضیحات اضافی..."
                  placeholderTextColor={Colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  textAlign="right"
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, (!formData.name.trim() || saving) && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={!formData.name.trim() || saving}
                activeOpacity={0.7}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveText}>{editingCategory ? "بروزرسانی" : "ایجاد"}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  summaryBar: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryItem: { alignItems: "center" },
  summaryValue: { fontSize: 16, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  summaryLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  listContent: { padding: 16, paddingBottom: 80 },
  
  categoryCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  categoryInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  categoryIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  categoryDetails: { flex: 1 },
  categoryName: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  categoryDescription: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 2 },
  expenseCount: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  categoryActions: { flexDirection: "row", gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginTop: 12, marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center", marginBottom: 20 },
  emptyButton: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, gap: 8 },
  emptyButtonText: { color: "white", fontSize: 14, fontWeight: "500", fontFamily: "Vazirmatn" },
  
  fab: { position: "absolute", right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center", shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "white", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: 17, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn" },
  modalBody: { padding: 20 },
  modalFooter: { flexDirection: "row", padding: 16, borderTopWidth: 1, borderTopColor: Colors.border, gap: 12 },
  
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 6, textAlign: "right" },
  required: { color: Colors.danger },
  formInput: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 14, color: Colors.text, fontFamily: "Vazirmatn", textAlign: "right" },
  inputError: { borderColor: Colors.danger },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  errorText: { fontSize: 12, color: Colors.danger, fontFamily: "Vazirmatn", marginTop: 6, textAlign: "right" },
  
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: Colors.background, alignItems: "center", borderWidth: 1, borderColor: Colors.border },
  cancelText: { fontSize: 15, fontWeight: "500", color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 10, backgroundColor: Colors.primary, alignItems: "center" },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: { fontSize: 15, fontWeight: "600", color: "white", fontFamily: "Vazirmatn" },
});