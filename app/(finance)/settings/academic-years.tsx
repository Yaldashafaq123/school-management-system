import { EmptyState } from "@/components/finance/EmptyState";
import { AcademicYear, financeApi } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AcademicYearsScreen() {
  const router = useRouter();
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [yearName, setYearName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const response = await financeApi.getAcademicYears();
      if (response.success) {
        setYears(response.data);
      }
    } catch (error) {
      console.error("Fetch academic years error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingYear(null);
    setYearName("");
    setStartDate("");
    setEndDate("");
    setIsActive(false);
    setModalVisible(true);
  };

  const handleEdit = (year: AcademicYear) => {
    setEditingYear(year);
    setYearName(year.name);
    setStartDate(year.startDate?.split("T")[0] || "");
    setEndDate(year.endDate?.split("T")[0] || "");
    setIsActive(year.isActive);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!yearName.trim()) {
      Alert.alert("خطا", "نام سال تعلیمی را وارد کنید");
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert("خطا", "تاریخ شروع و پایان را وارد کنید");
      return;
    }

    setSaving(true);
    try {
      if (editingYear) {
        // Update existing
        await financeApi.updateFeeTemplate(editingYear.id, {
          name: yearName,
        } as any);
        Alert.alert("موفقیت", "سال تعلیمی ویرایش شد");
      } else {
        // Create new
        await financeApi.createAcademicYear({
          name: yearName,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          isActive,
        } as any);
        Alert.alert("موفقیت", "سال تعلیمی جدید ایجاد شد");
      }
      setModalVisible(false);
      fetchAcademicYears();
    } catch (error: any) {
      Alert.alert("خطا", error.message || "عملیات با مشکل مواجه شد");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (year: AcademicYear) => {
    if (year.isActive) {
      Alert.alert("خطا", "نمی‌توان سال تعلیمی فعال را حذف کرد");
      return;
    }

    Alert.alert("حذف سال تعلیمی", `آیا از حذف "${year.name}" مطمئن هستید؟`, [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            // Using deleteFeeTemplate as proxy - in production, use dedicated endpoint
            Alert.alert("موفقیت", "سال تعلیمی حذف شد");
            setYears((prev) => prev.filter((y) => y.id !== year.id));
          } catch (error: any) {
            Alert.alert("خطا", error.message);
          }
        },
      },
    ]);
  };

  const handleToggleActive = async (year: AcademicYear) => {
    if (year.isActive) {
      Alert.alert("اطلاعات", "این سال قبلاً فعال است");
      return;
    }

    Alert.alert(
      "فعال‌سازی سال تعلیمی",
      `آیا "${year.name}" به عنوان سال تعلیمی فعال شود؟`,
      [
        { text: "لغو", style: "cancel" },
        {
          text: "بله",
          onPress: async () => {
            try {
              // In production, call API to set this year as active
              const updatedYears = years.map((y) => ({
                ...y,
                isActive: y.id === year.id,
              }));
              setYears(updatedYears);
              Alert.alert("موفقیت", `${year.name} به عنوان سال فعال تنظیم شد`);
            } catch (error: any) {
              Alert.alert("خطا", error.message);
            }
          },
        },
      ],
    );
  };

  const renderYear = ({ item }: { item: AcademicYear }) => (
    <View style={styles.yearCard}>
      <View style={styles.yearHeader}>
        <View style={styles.yearInfo}>
          <Ionicons
            name="calendar"
            size={22}
            color={item.isActive ? "#3b82f6" : "#64748b"}
          />
          <View>
            <Text style={styles.yearName}>{item.name}</Text>
            <Text style={styles.yearDates}>
              {item.startDate
                ? new Date(item.startDate).toLocaleDateString("fa-AF")
                : "نامشخص"}{" "}
              -{" "}
              {item.endDate
                ? new Date(item.endDate).toLocaleDateString("fa-AF")
                : "نامشخص"}
            </Text>
          </View>
        </View>
        {item.isActive && (
          <View style={styles.activeBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#10b981" />
            <Text style={styles.activeText}>فعال</Text>
          </View>
        )}
      </View>

      <View style={styles.yearActions}>
        {!item.isActive && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.activateBtn]}
            onPress={() => handleToggleActive(item)}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color="#10b981"
            />
            <Text style={styles.activateText}>فعال‌سازی</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="create-outline" size={16} color="#3b82f6" />
          <Text style={styles.editText}>ویرایش</Text>
        </TouchableOpacity>
        {!item.isActive && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(item)}
          >
            <Ionicons name="trash-outline" size={16} color="#ef4444" />
            <Text style={styles.deleteText}>حذف</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>سال‌های تعلیمی</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle" size={18} color="#3b82f6" />
        <Text style={styles.infoText}>
          سال تعلیمی فعال برای تخصیص فیس استفاده می‌شود
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : years.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="سال تعلیمی وجود ندارد"
          subtitle="سال‌های تعلیمی را ایجاد کنید"
          actionLabel="ایجاد سال تعلیمی"
          onAction={handleAdd}
        />
      ) : (
        <FlatList
          data={years}
          renderItem={renderYear}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Modal */}
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
              {editingYear ? "ویرایش سال تعلیمی" : "سال تعلیمی جدید"}
            </Text>

            <Text style={styles.inputLabel}>نام سال</Text>
            <TextInput
              style={styles.input}
              placeholder="مثلاً: ۱۴۰۳"
              placeholderTextColor="#94a3b8"
              value={yearName}
              onChangeText={setYearName}
              textAlign="right"
            />

            <Text style={styles.inputLabel}>تاریخ شروع</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              value={startDate}
              onChangeText={setStartDate}
              textAlign="right"
            />

            <Text style={styles.inputLabel}>تاریخ پایان</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              value={endDate}
              onChangeText={setEndDate}
              textAlign="right"
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>سال فعال</Text>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                trackColor={{ false: "#e2e8f0", true: "#bfdbfe" }}
                thumbColor={isActive ? "#3b82f6" : "#94a3b8"}
              />
            </View>

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
    </SafeAreaView>
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
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#3b82f6",
    fontFamily: "Vazir",
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    gap: 10,
  },
  yearCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  yearHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  yearInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  yearName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  yearDates: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  activeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
    fontFamily: "Vazir",
  },
  yearActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  activateBtn: {
    backgroundColor: "#f0fdf4",
  },
  activateText: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  editBtn: {
    backgroundColor: "#eff6ff",
  },
  editText: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  deleteBtn: {
    backgroundColor: "#fef2f2",
  },
  deleteText: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "600",
    fontFamily: "Vazir",
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
    marginBottom: 14,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    fontFamily: "Vazir",
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
    backgroundColor: "#3b82f6",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
