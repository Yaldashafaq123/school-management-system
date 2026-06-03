// app/(admin)/academic/subjects.tsx
import { useAuth } from "@/contexts/AuthContext";
import {
  adminSubjectApi,
  Subject,
  SubjectStats,
} from "@/src/config/adminSubjectApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../../components/Header";
import { Colors } from "../../../constants/Colors";

// Simplified Subject Form
interface NewSubjectForm {
  name: string;
  description: string;
  teacherId: number | null;
}

export default function SubjectsManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<{ id: number; name: string }[]>([]);
  const [stats, setStats] = useState<SubjectStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newSubject, setNewSubject] = useState<NewSubjectForm>({
    name: "",
    description: "",
    teacherId: null,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [subjectsRes, statsRes, teachersRes] = await Promise.all([
        adminSubjectApi.getSubjects({ search: searchQuery || undefined }),
        adminSubjectApi.getSubjectStats(),
        adminSubjectApi.getTeachers(),
      ]);

      if (subjectsRes.success && subjectsRes.data) {
        setSubjects(subjectsRes.data.subjects);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (teachersRes.success && teachersRes.data) {
        setTeachers(teachersRes.data);
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const resetForm = () => {
    setNewSubject({
      name: "",
      description: "",
      teacherId: null,
    });
    setEditingSubject(null);
    setShowAddModal(false);
  };

  const handleSaveSubject = async () => {
    if (!newSubject.name) {
      Alert.alert("خطا", "لطفاً نام مضمون را وارد کنید");
      return;
    }

    setSubmitting(true);
    try {
      let response;
      const subjectData = {
        name: newSubject.name,
        description: newSubject.description,
        teacherId: newSubject.teacherId,
      };

      if (editingSubject) {
        response = await adminSubjectApi.updateSubject(
          editingSubject.id,
          subjectData,
        );
      } else {
        response = await adminSubjectApi.createSubject(subjectData);
      }

      if (response.success) {
        Alert.alert("موفقیت", response.message);
        resetForm();
        loadData();
      } else {
        Alert.alert("خطا", response.message);
      }
    } catch (error) {
      Alert.alert("خطا", "خطا در ذخیره مضمون");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setNewSubject({
      name: subject.name,
      description: subject.description || "",
      teacherId: subject.teacherId || null,
    });
    setShowAddModal(true);
  };

  const handleDeleteSubject = (id: number, name: string) => {
    Alert.alert("حذف مضمون", `آیا از حذف مضمون "${name}" مطمئن هستید؟`, [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await adminSubjectApi.deleteSubject(id);
            if (response.success) {
              Alert.alert("موفقیت", response.message);
              loadData();
            } else {
              Alert.alert("خطا", response.message);
            }
          } catch (error) {
            Alert.alert("خطا", "خطا در حذف مضمون");
          }
        },
      },
    ]);
  };

  const SubjectCard = ({ subject }: { subject: Subject }) => {
    return (
      <View style={styles.subjectCard}>
        <View style={styles.subjectHeader}>
          <Text style={styles.subjectName}>{subject.name}</Text>
          {subject.teacherName && (
            <View style={styles.teacherBadge}>
              <Ionicons name="person" size={12} color={Colors.primary} />
              <Text style={styles.teacherText}>{subject.teacherName}</Text>
            </View>
          )}
        </View>

        {subject.description && (
          <Text style={styles.subjectDescription} numberOfLines={2}>
            {subject.description}
          </Text>
        )}

        {subject.classes && subject.classes.length > 0 && (
          <View style={styles.classesContainer}>
            <Text style={styles.classesLabel}>صنف‌ها:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {subject.classes.map((cls, index) => (
                <View key={cls.id} style={styles.classChip}>
                  <Text style={styles.classChipText}>
                    {cls.name} {cls.section || ""}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.subjectActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditSubject(subject)}
          >
            <Ionicons name="create-outline" size={16} color={Colors.primary} />
            <Text style={styles.actionText}>ویرایش</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteSubject(subject.id, subject.name)}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.danger} />
            <Text style={[styles.actionText, { color: Colors.danger }]}>
              حذف
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="مدیریت مضامین" showBack />
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
        title="مدیریت مضامین"
        showBack
        rightComponent={
          <TouchableOpacity
            onPress={() => {
              resetForm();
              setShowAddModal(true);
            }}
          >
            <Ionicons name="add-circle" size={24} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="جستجوی مضمون، استاد..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          textAlign="right"
        />
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats?.total || 0}</Text>
          <Text style={styles.statLabel}>مضامین کل</Text>
        </View>
      </View>

      {/* Subjects List */}
      <FlatList
        data={subjects}
        renderItem={({ item }) => <SubjectCard subject={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyStateText}>هیچ مضمونی یافت نشد</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                resetForm();
                setShowAddModal(true);
              }}
            >
              <Text style={styles.addButtonText}>ایجاد مضمون جدید</Text>
            </TouchableOpacity>
          </View>
        }
      />

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
                {editingSubject ? "ویرایش مضمون" : "ایجاد مضمون جدید"}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Subject Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>نام مضمون *</Text>
                <TextInput
                  style={styles.textInput}
                  value={newSubject.name}
                  onChangeText={(text) =>
                    setNewSubject({ ...newSubject, name: text })
                  }
                  placeholder="مثال: ریاضی"
                  textAlign="right"
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>توضیحات (اختیاری)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newSubject.description}
                  onChangeText={(text) =>
                    setNewSubject({ ...newSubject, description: text })
                  }
                  placeholder="توضیحات مربوط به مضمون..."
                  multiline
                  numberOfLines={3}
                  textAlign="right"
                />
              </View>

              {/* Teacher Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>استاد مسئول (اختیاری)</Text>
                <ScrollView style={styles.teacherList} nestedScrollEnabled>
                  <TouchableOpacity
                    style={[
                      styles.teacherOption,
                      newSubject.teacherId === null &&
                        styles.teacherOptionActive,
                    ]}
                    onPress={() =>
                      setNewSubject({ ...newSubject, teacherId: null })
                    }
                  >
                    <Ionicons name="person-outline" size={16} color="#8E8E93" />
                    <Text style={styles.teacherOptionText}>بدون استاد</Text>
                    {newSubject.teacherId === null && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>

                  {teachers.map((teacher) => (
                    <TouchableOpacity
                      key={teacher.id}
                      style={[
                        styles.teacherOption,
                        newSubject.teacherId === teacher.id &&
                          styles.teacherOptionActive,
                      ]}
                      onPress={() =>
                        setNewSubject({ ...newSubject, teacherId: teacher.id })
                      }
                    >
                      <Ionicons
                        name="person-outline"
                        size={16}
                        color="#8E8E93"
                      />
                      <Text style={styles.teacherOptionText}>
                        {teacher.name}
                      </Text>
                      {newSubject.teacherId === teacher.id && (
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color={Colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelButtonText}>لغو</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveSubject}
                disabled={submitting}
              >
                <Text style={styles.saveButtonText}>
                  {submitting
                    ? "در حال..."
                    : editingSubject
                      ? "به‌روزرسانی"
                      : "ایجاد مضمون"}
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
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
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
  statsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  subjectCard: {
    backgroundColor: Colors.card,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  teacherBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  teacherText: {
    fontSize: 12,
    color: Colors.primary,
  },
  subjectDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  classesContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  classesLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  classChip: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  classChipText: {
    fontSize: 11,
    color: Colors.text,
  },
  subjectActions: {
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
    textAlign: "center",
  },
  addButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
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
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  teacherList: {
    maxHeight: 200,
    gap: 8,
  },
  teacherOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  teacherOptionActive: {
    backgroundColor: Colors.primary + "10",
    borderColor: Colors.primary,
  },
  teacherOptionText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
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
