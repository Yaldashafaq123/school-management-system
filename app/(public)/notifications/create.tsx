// app/(admin)/announcements/create.tsx - COMPLETELY FIXED
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface AnnouncementType {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface ClassOption {
  id: number;
  name: string;
}

export default function CreateAnnouncement() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "GENERAL",
    priority: "NORMAL",
    targetRole: null as string | null,
    targetClasses: [] as number[],
    requireConfirmation: false,
    allowComments: true,
    eventDate: null as Date | null,
    eventLocation: "",
    linkUrl: "",
    scheduledFor: null as Date | null,
  });

  const announcementTypes: AnnouncementType[] = [
    { id: "GENERAL", label: "عمومی", icon: "megaphone", color: "#3B82F6" },
    {
      id: "ASSIGNMENT",
      label: "کارخانگی",
      icon: "document-text",
      color: "#10B981",
    },
    { id: "EXAM", label: "آزمون", icon: "clipboard", color: "#F59E0B" },
    { id: "EVENT", label: "رویداد", icon: "calendar", color: "#8B5CF6" },
    { id: "FEE", label: "فیس", icon: "cash", color: "#EF4444" },
    {
      id: "GRADE_RESULT",
      label: "نتیجه امتحان",
      icon: "school",
      color: "#06B6D4",
    },
    {
      id: "PARENT_MEETING",
      label: "جلسه اولیا",
      icon: "people",
      color: "#EC4899",
    },
    { id: "TIMETABLE", label: "برنامه هفتگی", icon: "time", color: "#14B8A6" },
    { id: "HOLIDAY", label: "رخصتی", icon: "sunny", color: "#F97316" },
  ];

  const priorities = [
    { id: "LOW", label: "عادی", color: "#6B7280" },
    { id: "NORMAL", label: "متوسط", color: "#3B82F6" },
    { id: "HIGH", label: "مهم", color: "#F59E0B" },
    { id: "URGENT", label: "فوری", color: "#EF4444" },
  ];

  // Target options using Role enum values
  const targetOptions = [
    { id: null, label: "همه کاربران" },
    { id: "STUDENT", label: "فقط دانش‌آموزان" },
    { id: "PARENT", label: "فقط والدین" },
    { id: "TEACHER", label: "فقط معلمان" },
    { id: "SPECIFIC_CLASS", label: "صنف های خاص" },
  ];

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const response = await fetch(
        "https://asraschools.cloud/api/admin/classes/list",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json();
      if (result.success) {
        setClasses(result.data);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const toggleClassSelection = (classId: number) => {
    setFormData((prev) => ({
      ...prev,
      targetClasses: prev.targetClasses.includes(classId)
        ? prev.targetClasses.filter((id) => id !== classId)
        : [...prev.targetClasses, classId],
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert("خطا", "عنوان اعلامیه الزامی است");
      return false;
    }
    if (!formData.content.trim()) {
      Alert.alert("خطا", "متن اعلامیه الزامی است");
      return false;
    }
    if (
      formData.targetRole === "SPECIFIC_CLASS" &&
      formData.targetClasses.length === 0
    ) {
      Alert.alert("خطا", "لطفا حداقل یک صنف را انتخاب کنید");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");

      // Prepare data matching backend expected fields - NO targetType!
      const payload: any = {
        title: formData.title,
        content: formData.content,
        type: formData.type,
        priority: formData.priority,
        allowComments: formData.allowComments,
        requireConfirmation: formData.requireConfirmation,
      };

      // Add targetRole if not null (only for role-specific announcements)
      if (formData.targetRole && formData.targetRole !== "SPECIFIC_CLASS") {
        payload.targetRole = formData.targetRole;
      }

      // Add target classes if specific class is selected
      if (
        formData.targetRole === "SPECIFIC_CLASS" &&
        formData.targetClasses.length > 0
      ) {
        payload.targetClasses = formData.targetClasses;
      }

      // Add event date for events, exams, parent meetings
      if (
        formData.eventDate &&
        (formData.type === "EVENT" ||
          formData.type === "EXAM" ||
          formData.type === "PARENT_MEETING")
      ) {
        payload.eventDate = formData.eventDate.toISOString();
      }

      // Add event location
      if (
        formData.eventLocation &&
        (formData.type === "EVENT" || formData.type === "PARENT_MEETING")
      ) {
        payload.eventLocation = formData.eventLocation;
      }

      // Add link URL for online meetings
      if (formData.linkUrl && formData.type === "PARENT_MEETING") {
        payload.linkUrl = formData.linkUrl;
      }

      // Add scheduled for if set
      if (formData.scheduledFor) {
        payload.scheduledFor = formData.scheduledFor.toISOString();
      }

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(
        "https://asraschools.cloud/api/announcements/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();
      console.log("Response:", result);

      if (result.success) {
        Alert.alert("موفقیت", "اعلامیه با موفقیت ایجاد شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("خطا", result.message || "خطا در ایجاد اعلامیه");
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      Alert.alert("خطا", "مشکلی در ایجاد اعلامیه پیش آمد");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setFormData({ ...formData, eventDate: date });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="ایجاد اعلامیه جدید"
        showBack
        onBackPress={() => router.back()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نوع اعلامیه</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typesContainer}
          >
            {announcementTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  formData.type === type.id && styles.typeCardActive,
                  { borderColor: type.color },
                ]}
                onPress={() => setFormData({ ...formData, type: type.id })}
              >
                <View
                  style={[
                    styles.typeIcon,
                    { backgroundColor: `${type.color}20` },
                  ]}
                >
                  <Ionicons
                    name={type.icon as any}
                    size={24}
                    color={type.color}
                  />
                </View>
                <Text style={styles.typeLabel}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>عنوان *</Text>
          <TextInput
            style={styles.input}
            placeholder="عنوان اعلامیه"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            textAlign="right"
          />
        </View>

        {/* Content */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>متن اعلامیه *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="متن اعلامیه را وارد کنید..."
            value={formData.content}
            onChangeText={(text) => setFormData({ ...formData, content: text })}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            textAlign="right"
          />
        </View>

        {/* Priority */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>اولویت</Text>
          <View style={styles.priorityContainer}>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority.id}
                style={[
                  styles.priorityOption,
                  formData.priority === priority.id &&
                    styles.priorityOptionActive,
                  { borderColor: priority.color },
                ]}
                onPress={() =>
                  setFormData({ ...formData, priority: priority.id })
                }
              >
                <Text
                  style={[styles.priorityOptionText, { color: priority.color }]}
                >
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Target Audience */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>مخاطبان</Text>
          {targetOptions.map((option) => (
            <TouchableOpacity
              key={option.id === null ? "ALL" : option.id}
              style={[
                styles.radioOption,
                formData.targetRole === option.id && styles.radioOptionActive,
              ]}
              onPress={() =>
                setFormData({ ...formData, targetRole: option.id })
              }
            >
              <View style={styles.radioCircle}>
                {formData.targetRole === option.id && (
                  <View style={styles.radioSelected} />
                )}
              </View>
              <Text style={styles.radioLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Class Selection (if specific class) */}
        {formData.targetRole === "SPECIFIC_CLASS" && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>انتخاب کلاس‌ها</Text>
            {loadingClasses ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <View style={styles.classesContainer}>
                {classes.map((cls) => (
                  <TouchableOpacity
                    key={cls.id}
                    style={[
                      styles.classChip,
                      formData.targetClasses.includes(cls.id) &&
                        styles.classChipActive,
                    ]}
                    onPress={() => toggleClassSelection(cls.id)}
                  >
                    <Text
                      style={[
                        styles.classChipText,
                        formData.targetClasses.includes(cls.id) &&
                          styles.classChipTextActive,
                      ]}
                    >
                      {cls.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Event Date (for events, exams, parent meetings) */}
        {(formData.type === "EVENT" ||
          formData.type === "EXAM" ||
          formData.type === "PARENT_MEETING") && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>تاریخ رویداد</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar"
                size={20}
                color={Colors.textSecondary}
              />
              <Text style={styles.dateButtonText}>
                {selectedDate
                  ? selectedDate.toLocaleDateString("fa-IR")
                  : "انتخاب تاریخ"}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate || new Date()}
                mode="date"
                onChange={handleDateChange}
              />
            )}
          </View>
        )}

        {/* Event Location */}
        {(formData.type === "EVENT" || formData.type === "PARENT_MEETING") && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>مکان رویداد</Text>
            <TextInput
              style={styles.input}
              placeholder="مکان برگزاری"
              value={formData.eventLocation}
              onChangeText={(text) =>
                setFormData({ ...formData, eventLocation: text })
              }
              textAlign="right"
            />
          </View>
        )}

        {/* Link URL (for online meetings) */}
        {formData.type === "PARENT_MEETING" && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>لینک جلسه آنلاین</Text>
            <TextInput
              style={styles.input}
              placeholder="https://..."
              value={formData.linkUrl}
              onChangeText={(text) =>
                setFormData({ ...formData, linkUrl: text })
              }
              keyboardType="url"
              textAlign="right"
            />
          </View>
        )}

        {/* Options */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>تنظیمات پیشرفته</Text>

          <TouchableOpacity
            style={styles.checkboxOption}
            onPress={() =>
              setFormData({
                ...formData,
                requireConfirmation: !formData.requireConfirmation,
              })
            }
          >
            <View style={styles.checkbox}>
              {formData.requireConfirmation && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>
              نیاز به تایید (برای جلسات اولیا)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxOption}
            onPress={() =>
              setFormData({
                ...formData,
                allowComments: !formData.allowComments,
              })
            }
          >
            <View style={styles.checkbox}>
              {formData.allowComments && (
                <Ionicons name="checkmark" size={14} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>فعال کردن نظرات</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>ارسال اعلامیه</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  typesContainer: {
    flexDirection: "row",
  },
  typeCard: {
    width: 100,
    alignItems: "center",
    padding: 12,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  typeCardActive: {
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    borderWidth: 2,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 12,
    color: Colors.text,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    textAlign: "right",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  priorityContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  priorityOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priorityOptionActive: {
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    borderWidth: 2,
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  radioOptionActive: {
    opacity: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  radioLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  classesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  classChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  classChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  classChipText: {
    fontSize: 12,
    color: Colors.text,
  },
  classChipTextActive: {
    color: "#fff",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  checkboxOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
