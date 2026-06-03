// app/(admin)/academic/timetable.tsx
import { useAuth } from "@/contexts/AuthContext";
import {
  adminTimetableApi,
  ClassOption,
  Period,
  SubjectOption,
} from "@/src/config/adminTimetableApi";
import { Calendar, Edit2, Plus, Trash2 } from "lucide-react-native";
import { useEffect, useState } from "react";
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
import { Header } from "../../../components/Header";
import { Colors } from "../../../constants/Colors";

// Persian days mapping
const PERSIAN_DAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
];

// Time slots for periods
const timeSlots = [
  "7:30 - 8:15",
  "8:15 - 9:00",
  "9:00 - 9:45",
  "10:00 - 10:45",
  "10:45 - 11:30",
  "11:30 - 12:15",
  "12:15 - 13:00",
];

export default function TimetableGenerator() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [schedule, setSchedule] = useState<Period[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newPeriod, setNewPeriod] = useState({
    period: 0,
    subjectId: 0,
    teacherId: undefined as number | undefined,
    room: "",
    isBreak: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedClassId !== null) {
      loadTimetable();
    }
  }, [selectedClassId, selectedDay]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesRes, subjectsRes] = await Promise.all([
        adminTimetableApi.getClasses(),
        adminTimetableApi.getSubjects(),
      ]);

      if (classesRes.success && classesRes.data) {
        setClasses(classesRes.data);
        if (classesRes.data.length > 0) {
          setSelectedClassId(classesRes.data[0].id);
        }
      }
      if (subjectsRes.success && subjectsRes.data) {
        setSubjects(subjectsRes.data);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTimetable = async () => {
    if (!selectedClassId) return;

    try {
      const response = await adminTimetableApi.getTimetable(
        selectedClassId,
        selectedDay,
      );
      if (response.success && response.data) {
        setSchedule(response.data);
      }
    } catch (err) {
      console.error("Error loading timetable:", err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await loadTimetable();
    setRefreshing(false);
  };

  const handleAddPeriod = async () => {
    if (!selectedClassId) return;

    if (newPeriod.isBreak) {
      if (newPeriod.period === undefined) {
        Alert.alert("خطا", "لطفاً زنگ را انتخاب کنید");
        return;
      }
    } else {
      if (newPeriod.period === undefined || !newPeriod.subjectId) {
        Alert.alert("خطا", "لطفاً زنگ و مضمون را انتخاب کنید");
        return;
      }
    }

    setSubmitting(true);
    try {
      // Find BREAK subject id
      let subjectId = newPeriod.subjectId;
      if (newPeriod.isBreak) {
        const breakSubject = subjects.find((s) => s.name === "BREAK");
        subjectId = breakSubject?.id || 0;
      }

      const response = await adminTimetableApi.savePeriod({
        classId: selectedClassId,
        day: selectedDay,
        period: newPeriod.period,
        subjectId: subjectId,
        teacherId: newPeriod.teacherId,
        room: newPeriod.room,
        isBreak: newPeriod.isBreak,
      });

      if (response.success) {
        Alert.alert("موفقیت", response.message);
        setShowAddModal(false);
        setEditingPeriod(null);
        setNewPeriod({
          period: 0,
          subjectId: 0,
          teacherId: undefined,
          room: "",
          isBreak: false,
        });
        loadTimetable();
      } else {
        Alert.alert("خطا", response.message);
      }
    } catch (err) {
      Alert.alert("خطا", "خطا در ذخیره برنامه");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPeriod = (period: Period) => {
    const subject = subjects.find((s) => s.name === period.subject);
    setEditingPeriod(period);
    setNewPeriod({
      period: period.period,
      subjectId: subject?.id || 0,
      teacherId: undefined,
      room: period.room,
      isBreak: period.isBreak,
    });
    setShowAddModal(true);
  };

  const handleDeletePeriod = async (periodId: number) => {
    Alert.alert("حذف برنامه", "آیا از حذف این زنگ مطمئن هستید؟", [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await adminTimetableApi.deletePeriod(periodId);
            if (response.success) {
              Alert.alert("موفقیت", response.message);
              loadTimetable();
            } else {
              Alert.alert("خطا", response.message);
            }
          } catch (err) {
            Alert.alert("خطا", "خطا در حذف برنامه");
          }
        },
      },
    ]);
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      ریاضی: "#007AFF",
      علوم: "#34C759",
      انگلیسی: "#FF9500",
      تاریخ: "#AF52DE",
      جغرافیا: "#FF2D55",
      فیزیک: "#5856D6",
      شیمی: "#FF3B30",
      بیولوژی: "#5AC8FA",
      کامپیوتر: "#FFCC00",
      ورزش: "#4CD964",
      BREAK: "#8E8E93",
      تفسیر: "#8B5CF6",
      کیمیا: "#F59E0B",
      عقاید: "#EC4899",
      دری: "#06B6D4",
      پشتو: "#14B8A6",
    };
    return colors[subject] || "#8E8E93";
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="برنامه هفتگی" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentSchedule = schedule;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="برنامه هفتگی"
        showBack
        rightComponent={
          <TouchableOpacity
            onPress={() => {
              setEditingPeriod(null);
              setNewPeriod({
                period: 0,
                subjectId: 0,
                teacherId: undefined,
                room: "",
                isBreak: false,
              });
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
        {/* Class Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>انتخاب صنف</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.selectorButtons}>
              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls.id}
                  style={[
                    styles.selectorButton,
                    selectedClassId === cls.id && styles.selectorButtonActive,
                  ]}
                  onPress={() => setSelectedClassId(cls.id)}
                >
                  <Text
                    style={[
                      styles.selectorButtonText,
                      selectedClassId === cls.id &&
                        styles.selectorButtonTextActive,
                    ]}
                  >
                    {cls.displayName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Day Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>انتخاب روز</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.selectorButtons}>
              {PERSIAN_DAYS.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.selectorButton,
                    selectedDay === index && styles.selectorButtonActive,
                  ]}
                  onPress={() => setSelectedDay(index)}
                >
                  <Text
                    style={[
                      styles.selectorButtonText,
                      selectedDay === index && styles.selectorButtonTextActive,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Timetable Grid */}
        <View style={styles.timetableContainer}>
          <View style={styles.timetableHeader}>
            <Text style={styles.timetableTitle}>
              {classes.find((c) => c.id === selectedClassId)?.displayName} -{" "}
              {PERSIAN_DAYS[selectedDay]}
            </Text>
          </View>

          {currentSchedule.length === 0 ? (
            <View style={styles.emptyTimetable}>
              <Calendar size={48} color="#8E8E93" />
              <Text style={styles.emptyTitle}>برنامه‌ای ثبت نشده</Text>
              <Text style={styles.emptyText}>
                برای{" "}
                {classes.find((c) => c.id === selectedClassId)?.displayName} در
                روز {PERSIAN_DAYS[selectedDay]} برنامه‌ای ثبت نشده است
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.emptyButtonText}>افزودن برنامه</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.timetableGrid}>
              {currentSchedule.map((period) => (
                <TouchableOpacity
                  key={period.id}
                  style={[
                    styles.periodCard,
                    period.isBreak && styles.breakCard,
                    { borderLeftColor: getSubjectColor(period.subject) },
                  ]}
                  onPress={() => handleEditPeriod(period)}
                >
                  <View style={styles.periodHeader}>
                    <Text style={styles.periodTime}>{period.time}</Text>
                    <View style={styles.periodActions}>
                      <TouchableOpacity
                        style={styles.periodActionButton}
                        onPress={() => handleEditPeriod(period)}
                      >
                        <Edit2 size={14} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.periodActionButton}
                        onPress={() => handleDeletePeriod(period.id)}
                      >
                        <Trash2 size={14} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {period.isBreak ? (
                    <Text style={styles.breakText}>زنگ تفریح</Text>
                  ) : (
                    <>
                      <Text style={styles.periodSubject}>{period.subject}</Text>
                      <View style={styles.periodDetails}>
                        <Text style={styles.periodTeacher}>
                          {period.teacher}
                        </Text>
                        <Text style={styles.periodRoom}>{period.room}</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Period Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPeriod ? "ویرایش زنگ" : "افزودن زنگ جدید"}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Period Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>زنگ</Text>
                <View style={styles.optionsGrid}>
                  {timeSlots.map((slot, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        newPeriod.period === index && styles.optionButtonActive,
                      ]}
                      onPress={() =>
                        setNewPeriod({ ...newPeriod, period: index })
                      }
                    >
                      <Text
                        style={[
                          styles.optionText,
                          newPeriod.period === index && styles.optionTextActive,
                        ]}
                      >
                        {slot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Break Toggle */}
              <View style={styles.formGroup}>
                <TouchableOpacity
                  style={styles.breakToggle}
                  onPress={() =>
                    setNewPeriod({
                      ...newPeriod,
                      isBreak: !newPeriod.isBreak,
                      subjectId: 0,
                    })
                  }
                >
                  <View
                    style={[
                      styles.checkbox,
                      newPeriod.isBreak && styles.checkboxChecked,
                    ]}
                  >
                    {newPeriod.isBreak && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.breakLabel}>زنگ تفریح</Text>
                </TouchableOpacity>
              </View>

              {!newPeriod.isBreak && (
                <>
                  {/* Subject Selection */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>مضمون</Text>
                    <View style={styles.optionsGrid}>
                      {subjects
                        .filter((s) => !s.isBreak)
                        .map((subject) => (
                          <TouchableOpacity
                            key={subject.id}
                            style={[
                              styles.optionButton,
                              newPeriod.subjectId === subject.id &&
                                styles.optionButtonActive,
                            ]}
                            onPress={() =>
                              setNewPeriod({
                                ...newPeriod,
                                subjectId: subject.id,
                              })
                            }
                          >
                            <Text
                              style={[
                                styles.optionText,
                                newPeriod.subjectId === subject.id &&
                                  styles.optionTextActive,
                              ]}
                            >
                              {subject.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                  </View>

                  {/* Room Input */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>اطاق</Text>
                    <TextInput
                      style={styles.textInput}
                      value={newPeriod.room}
                      onChangeText={(text: string) =>
                        setNewPeriod({ ...newPeriod, room: text })
                      }
                      placeholder="مثال: اطاق ۱۰۱"
                      textAlign="right"
                    />
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>لغو</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddPeriod}
                disabled={submitting}
              >
                <Text style={styles.saveButtonText}>
                  {submitting
                    ? "در حال..."
                    : editingPeriod
                      ? "به‌روزرسانی"
                      : "افزودن"}
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  selectorContainer: {
    backgroundColor: Colors.card,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  selectorButtons: {
    flexDirection: "row",
    gap: 12,
  },
  selectorButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectorButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectorButtonText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  selectorButtonTextActive: {
    color: "#fff",
  },
  timetableContainer: {
    backgroundColor: Colors.card,
    padding: 20,
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timetableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  timetableTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
  },
  emptyTimetable: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  timetableGrid: {
    gap: 12,
  },
  periodCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  breakCard: {
    backgroundColor: Colors.background,
  },
  periodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  periodTime: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  periodActions: {
    flexDirection: "row",
    gap: 8,
  },
  periodActionButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  breakText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textSecondary,
    textAlign: "center",
  },
  periodSubject: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  periodDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  periodTeacher: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  periodRoom: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  closeButtonText: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  optionTextActive: {
    color: "white",
  },
  breakToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  breakLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    textAlign: "right",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
