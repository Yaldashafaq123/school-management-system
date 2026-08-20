// app/(admin)/academic/timetable.tsx - FIXED VERSION
import { useAuth } from "@/contexts/AuthContext";
import {
  adminTimetableApi,
  ClassOption,
  Period,
  SubjectOption,
} from "@/src/config/adminTimetableApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Calendar, Edit2, Trash2, Users } from "lucide-react-native";
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

// Color mapping for subjects
const getSubjectColor = (subject: string) => {
  if (!subject) return "#8E8E93";
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

export default function AdminTimetableScreen() {
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
  const [error, setError] = useState<string | null>(null);

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
      setError(null);

      // Fetch classes using adminTimetableApi
      const classesResult = await adminTimetableApi.getClasses();

      if (classesResult.success && classesResult.data) {
        setClasses(classesResult.data);
        if (classesResult.data.length > 0 && !selectedClassId) {
          setSelectedClassId(classesResult.data[0].id);
        }
      } else {
        setError("خطا در بارگذاری صنف‌ها");
      }

      // Fetch subjects using adminTimetableApi
      const subjectsResult = await adminTimetableApi.getSubjects();

      if (subjectsResult.success && subjectsResult.data) {
        setSubjects(subjectsResult.data);
      } else {
        setError("خطا در بارگذاری مضامین");
      }
    } catch (err) {
      console.error("Error loading data:", err);
      setError("خطا در ارتباط با سرور");
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
        // ✅ FIX: Check if response.data is an array or has a periods property
        let periods: Period[] = [];

        if (Array.isArray(response.data)) {
          periods = response.data;
        } else if (
          response.data.periods &&
          Array.isArray(response.data.periods)
        ) {
          periods = response.data.periods;
        } else if (response.data.periods) {
          // If periods exists but is not an array, try to convert
          periods = Object.values(response.data.periods);
        } else {
          // If data is an object with numeric keys, convert to array
          periods = Object.values(response.data);
        }

        setSchedule(periods);
      } else {
        setSchedule([]);
      }
    } catch (err) {
      console.error("Error loading timetable:", err);
      setSchedule([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    await loadTimetable();
    setRefreshing(false);
  };

  const handleAddPeriod = async () => {
    if (!selectedClassId) {
      Alert.alert("خطا", "لطفاً ابتدا یک صنف را انتخاب کنید");
      return;
    }

    if (newPeriod.isBreak) {
      if (newPeriod.period === undefined || newPeriod.period === null) {
        Alert.alert("خطا", "لطفاً زنگ را انتخاب کنید");
        return;
      }
    } else {
      if (newPeriod.period === undefined || newPeriod.period === null) {
        Alert.alert("خطا", "لطفاً زنگ را انتخاب کنید");
        return;
      }
      if (!newPeriod.subjectId || newPeriod.subjectId === 0) {
        Alert.alert("خطا", "لطفاً مضمون را انتخاب کنید");
        return;
      }
    }

    setSubmitting(true);
    try {
      // Find BREAK subject id if isBreak is true
      let subjectId = newPeriod.subjectId;
      if (newPeriod.isBreak) {
        const breakSubject = subjects.find((s) => s.isBreak);
        subjectId = breakSubject?.id || 0;
      }

      const response = await adminTimetableApi.savePeriod({
        classId: selectedClassId,
        day: selectedDay,
        period: newPeriod.period,
        subjectId: subjectId,
        teacherId: newPeriod.teacherId,
        room: newPeriod.room || "",
        isBreak: newPeriod.isBreak,
      });

      if (response.success) {
        Alert.alert("موفقیت", response.message || "برنامه با موفقیت ذخیره شد");
        setShowAddModal(false);
        setEditingPeriod(null);
        setNewPeriod({
          period: 0,
          subjectId: 0,
          teacherId: undefined,
          room: "",
          isBreak: false,
        });
        await loadTimetable();
      } else {
        Alert.alert("خطا", response.message || "خطا در ذخیره برنامه");
      }
    } catch (err) {
      console.error("Error saving period:", err);
      Alert.alert("خطا", "خطا در ذخیره برنامه");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPeriod = (period: Period) => {
    const subject = subjects.find((s) => s.name === period.subject);
    setEditingPeriod(period);
    setNewPeriod({
      period: period.period || 0,
      subjectId: subject?.id || 0,
      teacherId: undefined,
      room: period.room || "",
      isBreak: period.isBreak || false,
    });
    setShowAddModal(true);
  };

  const handleDeletePeriod = async (periodId: number) => {
    if (!periodId) {
      Alert.alert("خطا", "شناسه برنامه نامعتبر است");
      return;
    }

    Alert.alert("حذف برنامه", "آیا از حذف این زنگ مطمئن هستید؟", [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await adminTimetableApi.deletePeriod(periodId);
            if (response.success) {
              Alert.alert(
                "موفقیت",
                response.message || "برنامه با موفقیت حذف شد",
              );
              await loadTimetable();
            } else {
              Alert.alert("خطا", response.message || "خطا در حذف برنامه");
            }
          } catch (err) {
            console.error("Error deleting period:", err);
            Alert.alert("خطا", "خطا در حذف برنامه");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>برنامه هفتگی</Text>
          <TouchableOpacity
            style={styles.addButton}
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
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>برنامه هفتگی</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>تلاش مجدد</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ✅ FIX: Ensure schedule is always an array
  const scheduleArray = Array.isArray(schedule) ? schedule : [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>برنامه هفتگی</Text>
        <TouchableOpacity
          style={styles.addButton}
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
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#f59e0b"]}
          />
        }
      >
        {/* Class Selector */}
        <View style={styles.selectorContainer}>
          <View style={styles.selectorHeader}>
            <Users size={20} color="#64748b" />
            <Text style={styles.selectorLabel}>انتخاب صنف</Text>
          </View>
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
                    {cls.displayName || cls.name}
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
              {classes.find((c) => c.id === selectedClassId)?.displayName ||
                classes.find((c) => c.id === selectedClassId)?.name ||
                "صنف"}{" "}
              - {PERSIAN_DAYS[selectedDay]}
            </Text>
            <Text style={styles.periodCount}>{scheduleArray.length} زنگ</Text>
          </View>

          {scheduleArray.length === 0 ? (
            <View style={styles.emptyTimetable}>
              <Calendar size={48} color="#8E8E93" />
              <Text style={styles.emptyTitle}>برنامه‌ای ثبت نشده</Text>
              <Text style={styles.emptyText}>
                برای{" "}
                {classes.find((c) => c.id === selectedClassId)?.displayName ||
                  classes.find((c) => c.id === selectedClassId)?.name ||
                  "این صنف"}{" "}
                در روز {PERSIAN_DAYS[selectedDay]} برنامه‌ای ثبت نشده است
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
              {scheduleArray.map((period) => (
                <TouchableOpacity
                  key={period.id || Math.random()}
                  style={[
                    styles.periodCard,
                    period.isBreak && styles.breakCard,
                    { borderLeftColor: getSubjectColor(period.subject || "") },
                  ]}
                  onPress={() => handleEditPeriod(period)}
                >
                  <View style={styles.periodHeader}>
                    <Text style={styles.periodTime}>{period.time || ""}</Text>
                    <View style={styles.periodActions}>
                      <TouchableOpacity
                        style={styles.periodActionButton}
                        onPress={() => handleEditPeriod(period)}
                      >
                        <Edit2 size={14} color="#3b82f6" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.periodActionButton}
                        onPress={() => handleDeletePeriod(period.id)}
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {period.isBreak ? (
                    <Text style={styles.breakText}>زنگ تفریح</Text>
                  ) : (
                    <>
                      <Text style={styles.periodSubject}>
                        {period.subject || "بدون مضمون"}
                      </Text>
                      <View style={styles.periodDetails}>
                        <Text style={styles.periodTeacher}>
                          {period.teacher || ""}
                        </Text>
                        <Text style={styles.periodRoom}>
                          {period.room || ""}
                        </Text>
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
              {/* Class Display */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>صنف</Text>
                <Text style={styles.infoText}>
                  {classes.find((c) => c.id === selectedClassId)?.displayName ||
                    classes.find((c) => c.id === selectedClassId)?.name ||
                    ""}
                </Text>
              </View>

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
                      teacherId: undefined,
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
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
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
    color: "#64748b",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  selectorContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  selectorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  selectorButtons: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
  },
  selectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectorButtonActive: {
    backgroundColor: "#f59e0b",
    borderColor: "#f59e0b",
  },
  selectorButtonText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  selectorButtonTextActive: {
    color: "#fff",
  },
  timetableContainer: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  timetableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  timetableTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  periodCount: {
    fontSize: 14,
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyTimetable: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: "#f59e0b",
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
    backgroundColor: "#f8fafc",
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
    backgroundColor: "#f1f5f9",
  },
  periodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  periodTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  periodActions: {
    flexDirection: "row",
    gap: 8,
  },
  periodActionButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  breakText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#64748b",
    textAlign: "center",
  },
  periodSubject: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  periodDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  periodTeacher: {
    fontSize: 14,
    color: "#64748b",
  },
  periodRoom: {
    fontSize: 14,
    color: "#64748b",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
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
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
  },
  closeButtonText: {
    fontSize: 20,
    color: "#64748b",
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 8,
    textAlign: "right",
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
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minWidth: 60,
    alignItems: "center",
  },
  optionButtonActive: {
    backgroundColor: "#f59e0b",
    borderColor: "#f59e0b",
  },
  optionText: {
    fontSize: 14,
    color: "#64748b",
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
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#f59e0b",
    borderColor: "#f59e0b",
  },
  checkmark: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  breakLabel: {
    fontSize: 16,
    color: "#1e293b",
  },
  textInput: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: "#1e293b",
    textAlign: "right",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748b",
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f59e0b",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
