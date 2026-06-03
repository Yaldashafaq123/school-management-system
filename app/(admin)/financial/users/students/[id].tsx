import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { classApi, formatCurrency, userApi } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ClassItem {
  id: number;
  name: string;
  section: string;
}

interface StudentDetail {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  className: string;
  classId: number | null;
  grade: string;
  school: string;
  birthDate: string;
  parentContact: string;
  address: string;
  status: string;
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  createdAt: string;
}

export default function StudentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    classId: null as number | null,
    grade: "",
    school: "",
    birthDate: "",
    parentContact: "",
    address: "",
    status: "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const loadClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);
      const response = await classApi.getAllClasses({ limit: 200 });
      if (response.success) {
        const raw = response.data.classes || [];
        // Ensure section is always a string to match ClassItem type
        const mapped: ClassItem[] = raw.map((c: any) => ({
          id: c.id,
          name: c.name,
          section: c.section || "",
        }));
        setClasses(mapped);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      const response = await userApi.getUserById(parseInt(id));
      if (response.success && response.data) {
        const user = response.data;
        const totalFees = 0; // Calculate from API if needed
        setStudent({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone || "",
          className: user.student?.className || "ثبت نشده",
          classId: user.student?.classId || null,
          grade: user.student?.grade || "",
          school: user.student?.school || "",
          birthDate: user.student?.birthDate || "",
          parentContact: user.student?.parentContact || "",
          address: user.student?.address || "",
          status: user.student?.status || "ACTIVE",
          totalFees: totalFees,
          paidAmount: 0,
          pendingAmount: 0,
          createdAt: user.createdAt,
        });
        setEditForm({
          fullName: user.fullName,
          phone: user.phone || "",
          classId: user.student?.classId || null,
          grade: user.student?.grade || "",
          school: user.student?.school || "",
          birthDate: user.student?.birthDate || "",
          parentContact: user.student?.parentContact || "",
          address: user.student?.address || "",
          status: user.student?.status || "ACTIVE",
        });
      } else {
        Alert.alert("خطا", "دانش‌آموز یافت نشد");
        router.back();
      }
    } catch (error) {
      console.error("Error loading student:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری اطلاعات پیش آمد");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadClasses();
    loadData();
  }, [loadClasses, loadData]);

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

      await userApi.updateStudentProfile(parseInt(id), {
        classId: editForm.classId || undefined,
        grade: editForm.grade || undefined,
        school: editForm.school || undefined,
        birthDate: editForm.birthDate || undefined,
        parentContact: editForm.parentContact || undefined,
        address: editForm.address || undefined,
        status: editForm.status,
      });

      Alert.alert("موفق", "اطلاعات دانش‌آموز با موفقیت بروزرسانی شد");
      setEditModalVisible(false);
      loadData();
    } catch (error: any) {
      Alert.alert("خطا", error?.message || "بروزرسانی ناموفق بود");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return Colors.success;
      case "GRADUATED":
        return Colors.primary;
      case "SUSPENDED":
        return Colors.warning;
      case "LEFT":
        return Colors.danger;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "فعال";
      case "GRADUATED":
        return "فارغ التحصیل";
      case "SUSPENDED":
        return "تعلیق";
      case "LEFT":
        return "ترک تحصیل";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="جزئیات دانش‌آموز" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!student) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="جزئیات دانش‌آموز" showBack />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.danger} />
          <Text style={styles.errorText}>دانش‌آموز یافت نشد</Text>
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
        title="جزئیات دانش‌آموز"
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
            <Text style={styles.avatarText}>{student.fullName.charAt(0)}</Text>
          </View>
          <Text style={styles.studentName}>{student.fullName}</Text>
          <Text style={styles.studentEmail}>{student.email}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(student.status)}15` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(student.status) },
              ]}
            >
              {getStatusLabel(student.status)}
            </Text>
          </View>
        </View>

        {/* Academic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات تحصیلی</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons
                name="school-outline"
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={styles.infoLabel}>کلاس:</Text>
              <Text style={styles.infoValue}>{student.className}</Text>
            </View>
            {student.grade && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="layers-outline"
                  size={16}
                  color={Colors.textSecondary}
                />
                <Text style={styles.infoLabel}>پایه:</Text>
                <Text style={styles.infoValue}>{student.grade}</Text>
              </View>
            )}
            {student.school && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="business-outline"
                  size={16}
                  color={Colors.textSecondary}
                />
                <Text style={styles.infoLabel}>مدرسه:</Text>
                <Text style={styles.infoValue}>{student.school}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات تماس</Text>
          <View style={styles.infoCard}>
            {student.phone && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="call-outline"
                  size={16}
                  color={Colors.textSecondary}
                />
                <Text style={styles.infoLabel}>تلفن:</Text>
                <Text style={styles.infoValue}>{student.phone}</Text>
              </View>
            )}
            {student.parentContact && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={Colors.textSecondary}
                />
                <Text style={styles.infoLabel}>تماس والدین:</Text>
                <Text style={styles.infoValue}>{student.parentContact}</Text>
              </View>
            )}
            {student.birthDate && (
              <View style={styles.infoRow}>
                <Ionicons
                  name={"cake-outline" as any}
                  size={16}
                  color={Colors.textSecondary}
                />
                <Text style={styles.infoLabel}>تاریخ تولد:</Text>
                <Text style={styles.infoValue}>{student.birthDate}</Text>
              </View>
            )}
            {student.address && (
              <View style={styles.infoRow}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={Colors.textSecondary}
                />
                <Text style={styles.infoLabel}>آدرس:</Text>
                <Text style={styles.infoValue}>{student.address}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={styles.infoLabel}>تاریخ ثبت‌نام:</Text>
              <Text style={styles.infoValue}>
                {new Date(student.createdAt).toLocaleDateString("fa-IR")}
              </Text>
            </View>
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>خلاصه مالی</Text>
          <View style={styles.financialCard}>
            <View style={styles.financialRow}>
              <View style={styles.financialItem}>
                <Text style={styles.financialLabel}>کل هزینه‌ها</Text>
                <Text style={styles.financialValue}>
                  {formatCurrency(student.totalFees)}
                </Text>
              </View>
              <View style={styles.financialDivider} />
              <View style={styles.financialItem}>
                <Text style={styles.financialLabel}>پرداخت شده</Text>
                <Text
                  style={[styles.financialValue, { color: Colors.success }]}
                >
                  {formatCurrency(student.paidAmount)}
                </Text>
              </View>
              <View style={styles.financialDivider} />
              <View style={styles.financialItem}>
                <Text style={styles.financialLabel}>مانده</Text>
                <Text
                  style={[
                    styles.financialValue,
                    {
                      color:
                        student.pendingAmount > 0
                          ? Colors.danger
                          : Colors.success,
                    },
                  ]}
                >
                  {formatCurrency(student.pendingAmount)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.feesButton}
            onPress={() =>
              router.push(`/(admin)/financial/fees/students/${student.id}` as any)
            }
            activeOpacity={0.7}
          >
            <Ionicons name="document-text-outline" size={18} color="white" />
            <Text style={styles.actionBtnText}>مشاهده شهریه</Text>
          </TouchableOpacity>
          {student.pendingAmount > 0 && (
            <TouchableOpacity
              style={styles.payButton}
              onPress={() =>
                router.push(
                  `/(admin)/financial/fees/collections/single?studentId=${student.id}` as any,
                )
              }
              activeOpacity={0.7}
            >
              <Ionicons name="cash" size={18} color="white" />
              <Text style={styles.actionBtnText}>ثبت پرداخت</Text>
            </TouchableOpacity>
          )}
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
                <Text style={styles.formLabel}>کلاس</Text>
                {loadingClasses ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipContainer}>
                      {classes.map((cls) => (
                        <TouchableOpacity
                          key={cls.id}
                          style={[
                            styles.chip,
                            editForm.classId === cls.id && styles.chipActive,
                          ]}
                          onPress={() =>
                            setEditForm({ ...editForm, classId: cls.id })
                          }
                        >
                          <Text
                            style={[
                              styles.chipText,
                              editForm.classId === cls.id &&
                                styles.chipTextActive,
                            ]}
                          >
                            {cls.name} {cls.section || ""}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>پایه تحصیلی</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.grade}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, grade: text })
                  }
                  textAlign="right"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>نام مدرسه</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.school}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, school: text })
                  }
                  textAlign="right"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>تماس والدین</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.parentContact}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, parentContact: text })
                  }
                  keyboardType="phone-pad"
                  textAlign="right"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>تاریخ تولد</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.birthDate}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, birthDate: text })
                  }
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={Colors.textSecondary}
                  textAlign="right"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>آدرس</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  value={editForm.address}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, address: text })
                  }
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  textAlign="right"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>وضعیت</Text>
                <View style={styles.statusRow}>
                  {["ACTIVE", "SUSPENDED", "GRADUATED", "LEFT"].map(
                    (status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusChip,
                          editForm.status === status && styles.statusChipActive,
                        ]}
                        onPress={() => setEditForm({ ...editForm, status })}
                      >
                        <Text
                          style={[
                            styles.statusChipText,
                            editForm.status === status &&
                              styles.statusChipTextActive,
                          ]}
                        >
                          {status === "ACTIVE"
                            ? "فعال"
                            : status === "SUSPENDED"
                              ? "تعلیق"
                              : status === "GRADUATED"
                                ? "فارغ التحصیل"
                                : "ترک تحصیل"}
                        </Text>
                      </TouchableOpacity>
                    ),
                  )}
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
  studentName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    marginBottom: 4,
  },
  studentEmail: {
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
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    width: 80,
    textAlign: "right",
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    fontFamily: "Vazirmatn",
    textAlign: "right",
  },

  financialCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
  },
  financialRow: { flexDirection: "row" },
  financialItem: { flex: 1, alignItems: "center" },
  financialDivider: { width: 1, backgroundColor: Colors.border },
  financialLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    marginBottom: 4,
  },
  financialValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Vazirmatn",
  },

  actionButtons: { flexDirection: "row", gap: 12, marginTop: 8 },
  feesButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.info,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  payButton: {
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
  textArea: { minHeight: 80, textAlignVertical: "top" },
  chipContainer: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  chipTextActive: { color: "white" },
  statusRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  statusChipTextActive: { color: "white" },
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