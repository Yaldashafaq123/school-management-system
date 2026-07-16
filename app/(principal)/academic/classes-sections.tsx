// app/(admin)/classes/index.tsx
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import {
  adminClassApi,
  ClassItem,
  Teacher,
} from "@/src/config/adminClassApi";
import { useRouter } from "expo-router";
import {
  Edit2,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  X
} from "lucide-react-native";
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

export default function ClassesSections() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newClass, setNewClass] = useState({
    name: "",
    section: "",
    teacherId: null as number | null,
    capacity: "40",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [classesRes, teachersRes, gradesRes] =
        await Promise.all([
          adminClassApi.getClasses({
            search: searchQuery || undefined,
            grade: selectedGrade !== "all" ? selectedGrade : undefined,
          }),
          adminClassApi.getTeachers(),
          adminClassApi.getGrades(),
        ]);

      if (classesRes.success && classesRes.data) {
        setClasses(classesRes.data.classes);
      }
      if (teachersRes.success && teachersRes.data) {
        setTeachers(teachersRes.data);
      }
      if (gradesRes.success && gradesRes.data) {
        setGrades(gradesRes.data);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedGrade]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSaveClass = async () => {
    if (!newClass.name) {
      Alert.alert("خطا", "لطفاً نام صنف را وارد کنید");
      return;
    }

    setSubmitting(true);
    try {
      let response;
      const classData = {
        name: newClass.name,
        section: newClass.section,
        teacherId: newClass.teacherId,
        capacity: newClass.capacity,
      };

      if (editingClass) {
        response = await adminClassApi.updateClass(editingClass.id, classData);
      } else {
        response = await adminClassApi.createClass(classData);
      }

      if (response.success) {
        Alert.alert("موفقیت", response.message);
        setShowAddModal(false);
        resetForm();
        loadData();
      } else {
        Alert.alert("خطا", response.message);
      }
    } catch (error) {
      console.error("Save class error:", error);
      Alert.alert("خطا", "خطا در ذخیره اطلاعات");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClass = (classItem: ClassItem) => {
    setEditingClass(classItem);
    setNewClass({
      name: classItem.name,
      section: classItem.section || "",
      teacherId: classItem.teacherId || null,
      capacity: classItem.capacity || "40",
    });
    setShowAddModal(true);
  };

  const handleDeleteClass = async (id: number, name: string) => {
    Alert.alert("حذف صنف", `آیا از حذف صنف "${name}" مطمئن هستید؟`, [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await adminClassApi.deleteClass(id);
            if (response.success) {
              Alert.alert("موفقیت", response.message);
              loadData();
            } else {
              Alert.alert("خطا", response.message);
            }
          } catch (error) {
            Alert.alert("خطا", "خطا در حذف صنف");
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setNewClass({
      name: "",
      section: "",
      teacherId: null,
      capacity: "40",
    });
    setEditingClass(null);
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="صنف‌ها و بخش‌ها" showBack />
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
        title="صنف‌ها و بخش‌ها"
        showBack
        rightComponent={
          <TouchableOpacity
            onPress={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <Plus size={24} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجوی صنف، استاد..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>

        {/* Grade Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedGrade === "all" && styles.filterChipActive,
            ]}
            onPress={() => setSelectedGrade("all")}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedGrade === "all" && styles.filterChipTextActive,
              ]}
            >
              تمام صنف‌ها
            </Text>
          </TouchableOpacity>

          {grades.map((grade) => (
            <TouchableOpacity
              key={grade}
              style={[
                styles.filterChip,
                selectedGrade === grade && styles.filterChipActive,
              ]}
              onPress={() => setSelectedGrade(grade)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedGrade === grade && styles.filterChipTextActive,
                ]}
              >
                {grade}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Class List */}
        {classes.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color="#C7C7CC" />
            <Text style={styles.emptyStateText}>هیچ صنفی یافت نشد</Text>
            <Text style={styles.emptyStateSubtext}>
              برای ایجاد صنف جدید، روی دکمه + در بالای صفحه کلیک کنید
            </Text>
          </View>
        ) : (
          classes.map((classItem) => (
            <View key={classItem.id} style={styles.classCard}>
              <View style={styles.classHeader}>
                <View style={styles.classInfo}>
                  <Text style={styles.className}>{classItem.name}</Text>
                  {classItem.section ? (
                    <Text style={styles.classSection}>{classItem.section}</Text>
                  ) : null}
                  <Text style={styles.classTeacher}>
                    {classItem.classTeacher || "نامشخص"}
                  </Text>
                </View>
                <View style={styles.studentCount}>
                  <Users size={16} color={Colors.primary} />
                  <Text style={styles.studentCountText}>
                    {classItem.students}/{classItem.capacity} شاگردان
                  </Text>
                </View>
              </View>

              <View style={styles.classActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEditClass(classItem)}
                >
                  <Edit2 size={16} color={Colors.primary} />
                  <Text style={styles.actionText}>ویرایش</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    handleDeleteClass(classItem.id, classItem.name)
                  }
                >
                  <Trash2 size={16} color={Colors.danger} />
                  <Text style={[styles.actionText, { color: Colors.danger }]}>
                    حذف
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingClass ? "ویرایش صنف" : "ایجاد صنف جدید"}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <X size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Class Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>نام صنف *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="مثال: دوازدهم"
                  value={newClass.name}
                  onChangeText={(text) =>
                    setNewClass({ ...newClass, name: text })
                  }
                  textAlign="right"
                />
              </View>

              {/* Section Input (Optional) */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>بخش (اختیاری)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="مثال: الف"
                  value={newClass.section}
                  onChangeText={(text) =>
                    setNewClass({ ...newClass, section: text })
                  }
                  textAlign="right"
                />
              </View>

              {/* Teacher Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>استاد صنف</Text>
                <ScrollView style={styles.selectContainer} nestedScrollEnabled>
                  {teachers.length === 0 ? (
                    <Text style={styles.noDataText}>هیچ استادی یافت نشد</Text>
                  ) : (
                    teachers.map((teacher) => (
                      <TouchableOpacity
                        key={teacher.id}
                        style={[
                          styles.selectOption,
                          newClass.teacherId === teacher.id &&
                            styles.selectOptionActive,
                        ]}
                        onPress={() =>
                          setNewClass({
                            ...newClass,
                            teacherId: teacher.id,
                          })
                        }
                      >
                        <User size={16} color="#8E8E93" />
                        <Text
                          style={[
                            styles.selectOptionText,
                            newClass.teacherId === teacher.id &&
                              styles.selectOptionTextActive,
                          ]}
                        >
                          {teacher.name}
                        </Text>
                        {newClass.teacherId === teacher.id && (
                          <View style={styles.checkMark}>
                            <Text style={styles.checkMarkText}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
              </View>

              {/* Capacity Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ظرفیت</Text>
                <View style={styles.capacityContainer}>
                  <TextInput
                    style={styles.capacityInput}
                    value={newClass.capacity}
                    onChangeText={(text) =>
                      setNewClass({ ...newClass, capacity: text })
                    }
                    keyboardType="numeric"
                    placeholder="40"
                    textAlign="right"
                  />
                  <Text style={styles.capacityLabel}>شاگرد</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>لغو</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveClass}
                disabled={submitting}
              >
                <Text style={styles.saveButtonText}>
                  {submitting
                    ? "در حال..."
                    : editingClass
                      ? "به‌روزرسانی صنف"
                      : "ایجاد صنف"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    marginLeft: 12,
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.card,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "white",
  },
  classCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  classHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  classSection: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 4,
  },
  classTeacher: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  studentCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  studentCountText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  classActions: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
    fontWeight: "bold",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  formInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
    color: Colors.text,
    textAlign: "right",
  },
  selectContainer: {
    maxHeight: 200,
    gap: 8,
  },
  selectOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectOptionActive: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderColor: Colors.primary,
  },
  selectOptionText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  selectOptionTextActive: {
    color: Colors.primary,
    fontWeight: "500",
  },
  checkMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  checkMarkText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  noDataText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    padding: 20,
  },
  capacityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  capacityInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    textAlign: "right",
  },
  capacityLabel: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textSecondary,
    backgroundColor: Colors.border,
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  saveButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
});