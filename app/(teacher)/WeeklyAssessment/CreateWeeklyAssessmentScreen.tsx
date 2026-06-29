// app/(teacher)/WeeklyAssessment/CreateWeeklyAssessmentScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
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
import { apiRequest } from "../../../src/config/api";

interface Class {
  id: number;
  name: string;
  section: string;
}

interface Subject {
  id: number;
  name: string;
}

interface FormData {
  title: string;
  classId: string;
  subjectId: string;
  weekNumber: string;
  maxMarks: string;
}

export default function CreateWeeklyAssessmentScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    classId: "",
    subjectId: "",
    weekNumber: "",
    maxMarks: "100",
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch subjects when class is selected
  useEffect(() => {
    if (formData.classId) {
      fetchSubjectsByClass(formData.classId);
    } else {
      setSubjects([]);
      setFormData((prev) => ({ ...prev, subjectId: "" }));
    }
  }, [formData.classId]);

  const fetchClasses = async () => {
    try {
      const response = await apiRequest("/teacher/classes");
      if (response.success && response.data) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchSubjectsByClass = async (classId: string) => {
    try {
      setLoadingSubjects(true);
      const response = await apiRequest(
        `/teacher/subjects/by-class/${classId}`,
      );
      if (response.success && response.data) {
        setSubjects(response.data);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert("خطا", "لطفاً عنوان ارزیابی را وارد کنید");
      return;
    }
    if (!formData.classId) {
      Alert.alert("خطا", "لطفاً کلاس را انتخاب کنید");
      return;
    }
    if (!formData.subjectId) {
      Alert.alert("خطا", "لطفاً درس را انتخاب کنید");
      return;
    }
    if (!formData.weekNumber) {
      Alert.alert("خطا", "لطفاً شماره هفته را وارد کنید");
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("/teacher/weekly-assessments", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          classId: parseInt(formData.classId),
          subjectId: parseInt(formData.subjectId),
          weekNumber: parseInt(formData.weekNumber),
          maxMarks: parseFloat(formData.maxMarks) || 100,
        }),
      });

      if (response.success) {
        Alert.alert("موفق", "ارزیابی هفتگی با موفقیت ایجاد شد", [
          {
            text: "ورود به ارزیابی",
            onPress: () =>
              router.push({
                pathname:
                  "/(teacher)/WeeklyAssessment/WeeklyAssessmentDetailScreen",
                params: { assessmentId: response.data.id.toString() },
              }),
          },
          {
            text: "بازگشت به لیست",
            onPress: () => router.back(),
            style: "cancel",
          },
        ]);
      } else {
        Alert.alert(
          "خطا",
          response.message || "مشکلی در ایجاد ارزیابی پیش آمد",
        );
      }
    } catch (error) {
      console.error("Error creating assessment:", error);
      Alert.alert("خطا", "مشکلی در ایجاد ارزیابی پیش آمد");
    } finally {
      setLoading(false);
    }
  };

  const selectedClass = classes.find(
    (c) => c.id.toString() === formData.classId,
  );
  const selectedSubject = subjects.find(
    (s) => s.id.toString() === formData.subjectId,
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="ایجاد ارزیابی جدید"
        rightComponent={
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              عنوان ارزیابی <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="مثلاً: ارزیابی هفته اول"
              placeholderTextColor={Colors.textSecondary}
              textAlign="right"
            />
          </View>

          {/* Class Picker */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              کلاس <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowClassPicker(!showClassPicker)}
              activeOpacity={0.7}
            >
              <Text
                style={
                  selectedClass ? styles.pickerText : styles.pickerPlaceholder
                }
              >
                {selectedClass
                  ? `${selectedClass.name}${selectedClass.section ? ` - ${selectedClass.section}` : ""}`
                  : "انتخاب کلاس..."}
              </Text>
              <Ionicons
                name={showClassPicker ? "chevron-up" : "chevron-down"}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            {showClassPicker && (
              <View style={styles.pickerListContainer}>
                <ScrollView
                  style={styles.pickerListScroll}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {classes.map((cls) => (
                    <TouchableOpacity
                      key={cls.id}
                      style={[
                        styles.pickerItem,
                        formData.classId === cls.id.toString() &&
                          styles.pickerItemActive,
                      ]}
                      onPress={() => {
                        setFormData({
                          ...formData,
                          classId: cls.id.toString(),
                          subjectId: "", // Reset subject when class changes
                        });
                        setShowClassPicker(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.pickerItemText}>
                        {cls.name}
                        {cls.section ? ` - ${cls.section}` : ""}
                      </Text>
                      {formData.classId === cls.id.toString() && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={Colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Subject Picker */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              درس <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => {
                if (!formData.classId) {
                  Alert.alert("خطا", "لطفاً ابتدا کلاس را انتخاب کنید");
                  return;
                }
                setShowSubjectPicker(!showSubjectPicker);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={
                  selectedSubject ? styles.pickerText : styles.pickerPlaceholder
                }
              >
                {loadingSubjects
                  ? "در حال بارگذاری..."
                  : selectedSubject
                    ? selectedSubject.name
                    : subjects.length > 0
                      ? "انتخاب درس..."
                      : "ابتدا کلاس را انتخاب کنید"}
              </Text>
              <Ionicons
                name={showSubjectPicker ? "chevron-up" : "chevron-down"}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            {showSubjectPicker && (
              <View style={styles.pickerListContainer}>
                {loadingSubjects ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.loadingText}>
                      در حال بارگذاری دروس...
                    </Text>
                  </View>
                ) : subjects.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      هیچ درسی برای این کلاس یافت نشد
                    </Text>
                  </View>
                ) : (
                  <ScrollView
                    style={styles.pickerListScroll}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    {subjects.map((sub) => (
                      <TouchableOpacity
                        key={sub.id}
                        style={[
                          styles.pickerItem,
                          formData.subjectId === sub.id.toString() &&
                            styles.pickerItemActive,
                        ]}
                        onPress={() => {
                          setFormData({
                            ...formData,
                            subjectId: sub.id.toString(),
                          });
                          setShowSubjectPicker(false);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.pickerItemText}>{sub.name}</Text>
                        {formData.subjectId === sub.id.toString() && (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={Colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>

          {/* Week Number */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              شماره هفته <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={formData.weekNumber}
              onChangeText={(text) =>
                setFormData({ ...formData, weekNumber: text })
              }
              placeholder="مثلاً: 1"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
              textAlign="right"
            />
          </View>

          {/* Max Marks */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>حداکثر نمره</Text>
            <TextInput
              style={styles.input}
              value={formData.maxMarks}
              onChangeText={(text) =>
                setFormData({ ...formData, maxMarks: text })
              }
              placeholder="۱۰۰"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
              textAlign="right"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>ایجاد ارزیابی</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 6,
    textAlign: "right",
  },
  required: {
    color: Colors.danger,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.card,
    textAlign: "right",
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.card,
  },
  pickerText: {
    fontSize: 16,
    color: Colors.text,
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  pickerListContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: Colors.card,
    maxHeight: 200,
  },
  pickerListScroll: {
    maxHeight: 200,
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerItemActive: {
    backgroundColor: `${Colors.primary}10`,
  },
  pickerItemText: {
    fontSize: 15,
    color: Colors.text,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
