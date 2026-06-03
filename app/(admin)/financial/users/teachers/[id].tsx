import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { formatCurrency, userApi } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface TeacherDetail {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  baseSalary: number;
  hourlyRate: number;
  overtimeRate: number;
  experience: string;
  certification: string;
  isActive: boolean;
  subjects: { id: number; name: string }[];
  joiningDate?: string;
}

export default function TeacherDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teacher, setTeacher] = useState<TeacherDetail | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    baseSalary: "",
    hourlyRate: "",
    overtimeRate: "",
    experience: "",
    certification: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const response = await userApi.getUserById(parseInt(id));
      if (response.success && response.data) {
        const user = response.data;
        setTeacher({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone || "",
          baseSalary: user.teacher?.baseSalary || 0,
          hourlyRate: user.teacher?.hourlyRate || 0,
          overtimeRate: user.teacher?.overtimeRate || 0,
          experience: user.teacher?.experience || "",
          certification: user.teacher?.certification || "",
          isActive: user.teacher?.isActive ?? true,
          subjects: user.teacher?.subjects || [],
          joiningDate: user.createdAt,
        });
        setEditForm({
          fullName: user.fullName,
          phone: user.phone || "",
          baseSalary: (user.teacher?.baseSalary || 0).toString(),
          hourlyRate: (user.teacher?.hourlyRate || 0).toString(),
          overtimeRate: (user.teacher?.overtimeRate || 0).toString(),
          experience: user.teacher?.experience || "",
          certification: user.teacher?.certification || "",
          isActive: user.teacher?.isActive ?? true,
        });
      } else {
        Alert.alert("خطا", "معلم یافت نشد");
        router.back();
      }
    } catch (error) {
      console.error("Error loading teacher:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری اطلاعات پیش آمد");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userApi.updateUser(parseInt(id), {
        fullName: editForm.fullName,
        phone: editForm.phone || undefined,
      });

      await userApi.updateTeacherProfile(parseInt(id), {
        baseSalary: editForm.baseSalary
          ? parseFloat(editForm.baseSalary)
          : undefined,
        hourlyRate: editForm.hourlyRate
          ? parseFloat(editForm.hourlyRate)
          : undefined,
        overtimeRate: editForm.overtimeRate
          ? parseFloat(editForm.overtimeRate)
          : undefined,
        experience: editForm.experience || undefined,
        certification: editForm.certification || undefined,
        isActive: editForm.isActive,
      });

      Alert.alert("موفق", "اطلاعات معلم با موفقیت بروزرسانی شد");
      setEditModalVisible(false);
      loadData();
    } catch (error: any) {
      Alert.alert("خطا", error?.message || "بروزرسانی ناموفق بود");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="جزئیات معلم" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!teacher) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="جزئیات معلم" showBack />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.danger} />
          <Text style={styles.errorText}>معلم یافت نشد</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>بازگشت</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="جزئیات معلم"
        showBack
        rightComponent={
          <TouchableOpacity
            onPress={() => setEditModalVisible(true)}
            style={styles.editBtn}
          >
            <Ionicons name="create-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{teacher.fullName.charAt(0)}</Text>
          </View>
          <Text style={styles.teacherName}>{teacher.fullName}</Text>
          <Text style={styles.teacherEmail}>{teacher.email}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: teacher.isActive
                  ? `${Colors.success}15`
                  : `${Colors.danger}15`,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: teacher.isActive ? Colors.success : Colors.danger },
              ]}
            >
              {teacher.isActive ? "فعال" : "غیرفعال"}
            </Text>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات تماس</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons
                name="call-outline"
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={styles.infoLabel}>تلفن:</Text>
              <Text style={styles.infoValue}>
                {teacher.phone || "ثبت نشده"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={styles.infoLabel}>تاریخ عضویت:</Text>
              <Text style={styles.infoValue}>
                {new Date(teacher.joiningDate || "").toLocaleDateString(
                  "fa-IR",
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Salary Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات حقوقی</Text>
          <View style={styles.salaryCard}>
            <View style={styles.salaryRow}>
              <View style={styles.salaryItem}>
                <Text style={styles.salaryLabel}>حقوق پایه</Text>
                <Text style={styles.salaryValue}>
                  {formatCurrency(teacher.baseSalary)}
                </Text>
              </View>
              <View style={styles.salaryDivider} />
              <View style={styles.salaryItem}>
                <Text style={styles.salaryLabel}>حقوق ساعتی</Text>
                <Text style={styles.salaryValue}>
                  {formatCurrency(teacher.hourlyRate)}
                </Text>
              </View>
              <View style={styles.salaryDivider} />
              <View style={styles.salaryItem}>
                <Text style={styles.salaryLabel}>اضافه‌کار</Text>
                <Text style={styles.salaryValue}>
                  {formatCurrency(teacher.overtimeRate)}
                </Text>
              </View>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>حقوق ماهیانه تخمینی:</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(
                  teacher.baseSalary > 0
                    ? teacher.baseSalary
                    : teacher.hourlyRate * 160,
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Professional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات حرفه‌ای</Text>
          <View style={styles.infoCard}>
            {teacher.experience ? (
              <View style={styles.infoRow}>
                <Ionicons
                  name="briefcase-outline"
                  size={16}
                  color={Colors.textSecondary}
                />
                <Text style={styles.infoLabel}>سابقه:</Text>
                <Text style={styles.infoValue}>{teacher.experience}</Text>
              </View>
            ) : null}
            {teacher.certification ? (
              <View style={styles.infoRow}>
                <Ionicons
                  name="ribbon-outline"
                  size={16}
                  color={Colors.textSecondary}
                />
                <Text style={styles.infoLabel}>مدرک:</Text>
                <Text style={styles.infoValue}>{teacher.certification}</Text>
              </View>
            ) : null}
            {teacher.subjects.length > 0 && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="book-outline"
                  size={16}
                  color={Colors.textSecondary}
                />
                <Text style={styles.infoLabel}>مضامین:</Text>
                <Text style={styles.infoValue}>
                  {teacher.subjects.map((s) => s.name).join("، ")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.salaryHistoryBtn}
            onPress={() =>
              router.push(`/(admin)/financial/salaries/teachers/${teacher.id}`)
            }
            activeOpacity={0.7}
          >
            <Ionicons name="document-text-outline" size={18} color="white" />
            <Text style={styles.actionBtnText}>تاریخچه حقوق</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.paySalaryBtn}
            onPress={() =>
              router.push(
                `/(admin)/financial/salaries/payments/record?teacherId=${teacher.id}`,
              )
            }
            activeOpacity={0.7}
          >
            <Ionicons name="cash" size={18} color="white" />
            <Text style={styles.actionBtnText}>پرداخت معاش</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>ویرایش اطلاعات</Text>
              <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>نام و نام خانوادگی</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.fullName}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, fullName: text })
                  }
                  textAlign="right"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>شماره تلفن</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.phone}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, phone: text })
                  }
                  keyboardType="phone-pad"
                  textAlign="right"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>حقوق پایه (افغانی)</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.baseSalary}
                  onChangeText={(text) =>
                    setEditForm({
                      ...editForm,
                      baseSalary: text.replace(/[^0-9.]/g, ""),
                    })
                  }
                  keyboardType="decimal-pad"
                  textAlign="right"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>حقوق ساعتی (افغانی)</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.hourlyRate}
                  onChangeText={(text) =>
                    setEditForm({
                      ...editForm,
                      hourlyRate: text.replace(/[^0-9.]/g, ""),
                    })
                  }
                  keyboardType="decimal-pad"
                  textAlign="right"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  نرخ اضافه‌کار (افغانی/ساعت)
                </Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.overtimeRate}
                  onChangeText={(text) =>
                    setEditForm({
                      ...editForm,
                      overtimeRate: text.replace(/[^0-9.]/g, ""),
                    })
                  }
                  keyboardType="decimal-pad"
                  textAlign="right"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>سابقه تدریس</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.experience}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, experience: text })
                  }
                  textAlign="right"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>مدرک تحصیلی</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.certification}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, certification: text })
                  }
                  textAlign="right"
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.formLabel}>وضعیت فعال</Text>
                  <Switch
                    value={editForm.isActive}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, isActive: value })
                    }
                    trackColor={{
                      false: Colors.border,
                      true: `${Colors.success}50`,
                    }}
                    thumbColor={editForm.isActive ? Colors.success : "#f4f3f4"}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelText}>انصراف</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveText}>ذخیره</Text>
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  errorText: {
    fontSize: 16,
    color: Colors.danger,
    marginTop: 12,
    fontFamily: "Vazirmatn",
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: { color: "white", fontSize: 14, fontFamily: "Vazirmatn" },
  content: { flex: 1, padding: 16 },
  editBtn: { padding: 4 },

  profileHeader: {
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    fontFamily: "Vazirmatn",
  },
  teacherName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    marginBottom: 4,
  },
  teacherEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    marginBottom: 8,
  },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: "500", fontFamily: "Vazirmatn" },

  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    marginBottom: 10,
    textAlign: "right",
  },
  infoCard: { backgroundColor: Colors.card, borderRadius: 12, padding: 14 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  infoRowLast: { marginBottom: 0 },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    width: 60,
    textAlign: "right",
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    fontFamily: "Vazirmatn",
    textAlign: "right",
  },

  salaryCard: { backgroundColor: Colors.card, borderRadius: 12, padding: 14 },
  salaryRow: { flexDirection: "row", marginBottom: 12 },
  salaryItem: { flex: 1, alignItems: "center" },
  salaryDivider: { width: 1, backgroundColor: Colors.border },
  salaryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    marginBottom: 4,
  },
  salaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Vazirmatn",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text,
    fontFamily: "Vazirmatn",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary,
    fontFamily: "Vazirmatn",
  },

  actionButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  salaryHistoryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.info,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  paySalaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.success,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Vazirmatn",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.text,
    fontFamily: "Vazirmatn",
  },
  modalBody: { padding: 20 },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },

  formGroup: { marginBottom: 16 },
  formLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    marginBottom: 6,
    textAlign: "right",
  },
  formInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    fontFamily: "Vazirmatn",
    textAlign: "right",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
    fontFamily: "Vazirmatn",
  },
});
