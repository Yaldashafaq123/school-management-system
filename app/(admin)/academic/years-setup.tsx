// app/(admin)/academic/index.tsx
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { AcademicYear, adminAcademicApi } from "@/src/config/adminAcademicApi";
import { Calendar, Edit2, Plus, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
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

export default function AcademicYearSetup() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newYear, setNewYear] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isActive: false,
  });

  useEffect(() => {
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    try {
      setLoading(true);
      const response = await adminAcademicApi.getAcademicYears();
      if (response.success && response.data) {
        setAcademicYears(response.data);
      }
    } catch (error) {
      console.error("Error loading academic years:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAcademicYears();
    setRefreshing(false);
  };

  const handleAddAcademicYear = async () => {
    if (!newYear.name || !newYear.startDate || !newYear.endDate) {
      Alert.alert("خطا", "لطفا تمام فیلدها را پر کنید");
      return;
    }

    // Validate date format (Jalali: 1403/01/01)
    const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/;
    if (
      !dateRegex.test(newYear.startDate) ||
      !dateRegex.test(newYear.endDate)
    ) {
      Alert.alert("خطا", "فرمت تاریخ باید به صورت ۱۴۰۳/۰۱/۰۱ باشد");
      return;
    }

    setSubmitting(true);
    try {
      const response = await adminAcademicApi.createAcademicYear(newYear);
      if (response.success) {
        Alert.alert("موفقیت", response.message);
        setShowAddModal(false);
        setNewYear({ name: "", startDate: "", endDate: "", isActive: false });
        loadAcademicYears();
      } else {
        Alert.alert("خطا", response.message);
      }
    } catch (error) {
      Alert.alert("خطا", "خطا در ایجاد سال تحصیلی");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetActive = async (id: number) => {
    try {
      const response = await adminAcademicApi.setActiveAcademicYear(id);
      if (response.success) {
        Alert.alert("موفقیت", response.message);
        loadAcademicYears();
      } else {
        Alert.alert("خطا", response.message);
      }
    } catch (error) {
      Alert.alert("خطا", "خطا در تنظیم سال تحصیلی فعال");
    }
  };

  const handleDeleteYear = async (id: number, name: string) => {
    Alert.alert(
      "حذف سال تحصیلی",
      `آیا از حذف سال تحصیلی "${name}" مطمئن هستید؟`,
      [
        { text: "لغو", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await adminAcademicApi.deleteAcademicYear(id);
              if (response.success) {
                Alert.alert("موفقیت", response.message);
                loadAcademicYears();
              } else {
                Alert.alert("خطا", response.message);
              }
            } catch (error) {
              Alert.alert("خطا", "خطا در حذف سال تحصیلی");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="سال‌های تحصیلی" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="سال‌های تحصیلی"
        showBack
        rightComponent={
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <Plus size={24} color={Colors.primary} />
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
        {/* Academic Years List */}
        <View style={styles.listContainer}>
          {academicYears.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={60} color={Colors.textSecondary} />
              <Text style={styles.emptyStateTitle}>سال تحصیلی ثبت نشده</Text>
              <Text style={styles.emptyStateText}>
                برای افزودن سال تحصیلی جدید، روی دکمه + در بالای صفحه کلیک کنید
              </Text>
            </View>
          ) : (
            academicYears.map((year) => (
              <View key={year.id} style={styles.yearCard}>
                <View style={styles.yearHeader}>
                  <View style={styles.yearInfo}>
                    <Text style={styles.yearName}>{year.name}</Text>
                    <Text style={styles.yearDates}>
                      {year.startDate} تا {year.endDate}
                    </Text>
                    {year.stats && (
                      <Text style={styles.yearStats}>
                        {year.stats.totalClasses} صنف •{" "}
                        {year.stats.totalStudents} دانش‌آموز
                      </Text>
                    )}
                  </View>
                  <View style={styles.yearActions}>
                    <Switch
                      value={year.isActive}
                      onValueChange={() => handleSetActive(year.id)}
                      trackColor={{
                        false: Colors.border,
                        true: Colors.primary,
                      }}
                    />
                    <Text
                      style={[
                        styles.activeLabel,
                        year.isActive && styles.activeLabelActive,
                      ]}
                    >
                      {year.isActive ? "فعال" : "غیرفعال"}
                    </Text>
                  </View>
                </View>

                <View style={styles.yearFooter}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => Alert.alert("ویرایش", "در حال توسعه")}
                  >
                    <Edit2 size={16} color={Colors.primary} />
                    <Text style={styles.editButtonText}>ویرایش</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteYear(year.id, year.name)}
                  >
                    <Trash2 size={16} color={Colors.danger} />
                    <Text style={styles.deleteButtonText}>حذف</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add New Year Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>لغو</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>افزودن سال تحصیلی جدید</Text>
            <TouchableOpacity
              onPress={handleAddAcademicYear}
              disabled={submitting}
            >
              <Text style={styles.modalSave}>
                {submitting ? "در حال..." : "ذخیره"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>نام سال تحصیلی *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="مثال: ۱۴۰۴-۱۴۰۵"
                  value={newYear.name}
                  onChangeText={(text) =>
                    setNewYear({ ...newYear, name: text })
                  }
                  textAlign="right"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>تاریخ شروع (جلالی) *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="۱۴۰۴/۰۱/۰۱"
                  value={newYear.startDate}
                  onChangeText={(text) =>
                    setNewYear({ ...newYear, startDate: text })
                  }
                  textAlign="right"
                />
                <Text style={styles.formHint}>
                  فرمت: سال/ماه/روز (مثال: ۱۴۰۴/۰۱/۰۱)
                </Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>تاریخ پایان (جلالی) *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="۱۴۰۵/۱۲/۲۹"
                  value={newYear.endDate}
                  onChangeText={(text) =>
                    setNewYear({ ...newYear, endDate: text })
                  }
                  textAlign="right"
                />
                <Text style={styles.formHint}>
                  فرمت: سال/ماه/روز (مثال: ۱۴۰۵/۱۲/۲۹)
                </Text>
              </View>

              <View style={styles.formGroup}>
                <View style={styles.switchRow}>
                  <Text style={styles.formLabel}>فعال کردن این سال تحصیلی</Text>
                  <Switch
                    value={newYear.isActive}
                    onValueChange={(value) =>
                      setNewYear({ ...newYear, isActive: value })
                    }
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                  />
                </View>
                {newYear.isActive && (
                  <Text style={styles.switchHint}>
                    با فعال کردن این سال، سال تحصیلی قبلی غیرفعال می‌شود
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  listContainer: {
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  yearCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  yearHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  yearInfo: {
    flex: 1,
  },
  yearName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  yearDates: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  yearStats: {
    fontSize: 12,
    color: Colors.primary,
  },
  yearActions: {
    alignItems: "center",
  },
  activeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  activeLabelActive: {
    color: Colors.success,
    fontWeight: "bold",
  },
  yearFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  editButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  deleteButtonText: {
    fontSize: 14,
    color: Colors.danger,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  modalCancel: {
    fontSize: 16,
    color: Colors.danger,
  },
  modalSave: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  form: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  formInput: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 15,
    color: Colors.text,
    textAlign: "right",
  },
  formHint: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
