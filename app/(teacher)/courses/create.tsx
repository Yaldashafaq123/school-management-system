import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { apiRequest } from "@/src/config/api";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// تعریف نوع داده‌ها
interface Subject {
  id: number;
  name: string;
}

interface Class {
  id: number;
  name: string;
  section: string | null;
  academicYearId: number | null;
}

interface FormData {
  title: string;
  subjectId: number | null;
  subject: string; // For display
  classId: number | null;
  description: string;
  objectives: string[];
  requirements: string[];
  duration: string;
  schedule: string;
  capacity: string;
}

export default function CreateCourse() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [fetchingData, setFetchingData] = useState<boolean>(true);
  const [fetchingSubjects, setFetchingSubjects] = useState<boolean>(false);
  const [courseImage, setCourseImage] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  // State for dropdown visibility
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    subjectId: null,
    subject: "",
    classId: null,
    description: "",
    objectives: [""],
    requirements: [""],
    duration: "",
    schedule: "",
    capacity: "",
  });

  // دریافت اطلاعات اولیه
  useEffect(() => {
    fetchInitialData();
  }, []);

  // دریافت درس‌ها بر اساس کلاس انتخاب شده
  useEffect(() => {
    if (formData.classId) {
      fetchSubjectsByClass(formData.classId);
    } else {
      setSubjects([]);
    }
  }, [formData.classId]);

  const fetchInitialData = async (): Promise<void> => {
    try {
      setFetchingData(true);

      // دریافت صنف‌های موجود برای ایجاد دوره
      const classesResponse = await apiRequest("/teacher/available-classes");
      // Handle different response formats
      const classesData = classesResponse.data || classesResponse || [];
      setClasses(classesData);
    } catch (error) {
      console.error("خطا در دریافت اطلاعات:", error);
      Alert.alert(
        "خطا",
        "در دریافت اطلاعات خطا رخ داد. لطفاً صفحه را تازه‌سازی کنید.",
      );
      setClasses([]);
    } finally {
      setFetchingData(false);
    }
  };

  const fetchSubjectsByClass = async (classId: number): Promise<void> => {
    try {
      setFetchingSubjects(true);

      // Validate classId
      if (!classId) {
        console.log("No class ID provided");
        setSubjects([]);
        return;
      }

      console.log("📚 Fetching subjects for class:", classId);

      const response = await apiRequest(
        `/teacher/subjects/by-class/${classId}`,
      );

      console.log("📦 API Response:", response);

      // Handle different response formats
      let subjectsData = [];

      if (
        response &&
        response.success === true &&
        Array.isArray(response.data)
      ) {
        // Standard format: { success: true, data: [...] }
        subjectsData = response.data;
      } else if (Array.isArray(response)) {
        // Direct array format
        subjectsData = response;
      } else if (response && Array.isArray(response.subjects)) {
        // Alternative format
        subjectsData = response.subjects;
      }

      console.log(`✅ Found ${subjectsData.length} subjects:`, subjectsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error("❌ Error fetching subjects:", error);
      setSubjects([]);
      Alert.alert("خطا", "دریافت لیست دروس با مشکل مواجه شد.");
    } finally {
      setFetchingSubjects(false);
    }
  };

  const pickImage = async (): Promise<void> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("مجوز لازم", "برای انتخاب عکس به دسترسی گالری نیاز دارید.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCourseImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!courseImage) return null;

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append("image", {
        uri: courseImage,
        type: "image/jpeg",
        name: "course.jpg",
      } as any);

      const response = await apiRequest("/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("خطا", "آپلود عکس با مشکل مواجه شد.");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddItem = (type: "objectives" | "requirements"): void => {
    setFormData({
      ...formData,
      [type]: [...formData[type], ""],
    });
  };

  const handleUpdateItem = (
    type: "objectives" | "requirements",
    index: number,
    value: string,
  ): void => {
    const newItems = [...formData[type]];
    newItems[index] = value;
    setFormData({ ...formData, [type]: newItems });
  };

  const handleRemoveItem = (
    type: "objectives" | "requirements",
    index: number,
  ): void => {
    const newItems = formData[type].filter((_, i) => i !== index);
    setFormData({ ...formData, [type]: newItems });
  };

  const getSelectedSubjectName = () => {
    if (!formData.subjectId) return "ابتدا یک صنف انتخاب کنید";
    const selected = subjects.find((s) => s.id === formData.subjectId);
    return selected ? selected.name : "لطفا درس را انتخاب کنید";
  };

  const getSelectedClassName = () => {
    if (!formData.classId) return "لطفا صنف را انتخاب کنید";
    const selected = classes.find((c) => c.id === formData.classId);
    return selected
      ? `${selected.name}${selected.section ? ` - ${selected.section}` : ""}`
      : "لطفا صنف را انتخاب کنید";
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          Alert.alert("خطا", "عنوان دوره را وارد کنید.");
          return false;
        }
        if (!formData.classId) {
          Alert.alert("خطا", "لطفا ابتدا صنف را انتخاب کنید.");
          return false;
        }
        if (!formData.subjectId) {
          Alert.alert("خطا", "لطفا درس را انتخاب کنید.");
          return false;
        }
        return true;
      case 2:
        if (!formData.description.trim()) {
          Alert.alert("خطا", "توضیحات دوره را وارد کنید.");
          return false;
        }
        return true;
      case 3:
        if (!formData.duration) {
          Alert.alert("خطا", "مدت دوره را وارد کنید.");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = (): void => {
    if (validateStep()) {
      if (step < 3) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      setLoading(true);

      // First upload image if selected
      let thumbnailUrl = null;
      if (courseImage) {
        thumbnailUrl = await uploadImage();
        if (!thumbnailUrl && courseImage) {
          Alert.alert(
            "خطا",
            "آپلود عکس با مشکل مواجه شد. لطفا دوباره تلاش کنید.",
          );
          setLoading(false);
          return;
        }
      }

      // پیدا کردن نام درس انتخاب شده
      const selectedSubject = subjects.find((s) => s.id === formData.subjectId);

      // آماده‌سازی داده‌ها
      const courseData = {
        title: formData.title,
        description: formData.description,
        subject: selectedSubject?.name || formData.subject,
        duration: parseInt(formData.duration) || 0,
        schedule: formData.schedule || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        thumbnail: thumbnailUrl,
        classId: formData.classId,
        objectives: formData.objectives
          .filter((obj) => obj.trim() !== "")
          .map((text) => ({ text })),
        requirements: formData.requirements
          .filter((req) => req.trim() !== "")
          .map((text) => ({ text })),
      };

      console.log("Sending course data:", courseData);

      await apiRequest("/teacher/courses", {
        method: "POST",
        body: JSON.stringify(courseData),
      });

      Alert.alert("موفقیت", "دوره با موفقیت ایجاد شد.", [
        { text: "باشه", onPress: () => router.push("/(teacher)/courses") },
      ]);
    } catch (error: any) {
      console.error("خطا در ایجاد دوره:", error);
      Alert.alert("خطا", error.message || "مشکلی پیش آمد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const getClassName = (classId: number | null): string => {
    if (!classId) return "—";
    const cls = classes.find((c) => c.id === classId);
    return cls ? `${cls.name}${cls.section ? ` - ${cls.section}` : ""}` : "—";
  };

  const renderClassSelector = () => (
    <Modal
      visible={showClassModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowClassModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>انتخاب صنف</Text>
            <TouchableOpacity onPress={() => setShowClassModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={classes}
            keyExtractor={(item) => item.id.toString()}
            style={styles.modalList}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setFormData({
                    ...formData,
                    classId: item.id,
                    subjectId: null, // Reset subject when class changes
                  });
                  setShowClassModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    formData.classId === item.id &&
                      styles.modalItemTextSelected,
                  ]}
                >
                  {item.name}
                  {item.section ? ` - ${item.section}` : ""}
                </Text>
                {formData.classId === item.id && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  const renderSubjectSelector = () => (
    <Modal
      visible={showSubjectModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSubjectModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>انتخاب درس</Text>
            <TouchableOpacity onPress={() => setShowSubjectModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {fetchingSubjects ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.modalLoadingText}>در حال بارگذاری...</Text>
            </View>
          ) : subjects.length === 0 ? (
            <View style={styles.modalEmpty}>
              <Text style={styles.modalEmptyText}>
                درسی برای این صنف وجود ندارد
              </Text>
            </View>
          ) : (
            <FlatList
              data={subjects}
              keyExtractor={(item) => item.id.toString()}
              style={styles.modalList}
              showsVerticalScrollIndicator={true}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData({
                      ...formData,
                      subjectId: item.id,
                      subject: item.name,
                    });
                    setShowSubjectModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      formData.subjectId === item.id &&
                        styles.modalItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                  {formData.subjectId === item.id && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>اطلاعات پایه دوره</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {courseImage ? (
          <Image source={{ uri: courseImage }} style={styles.courseImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image" size={40} color={Colors.textSecondary} />
            <Text style={styles.imagePlaceholderText}>
              عکس دوره را انتخاب کنید
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.formGroup}>
        <Text style={styles.label}>عنوان دوره *</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          placeholder="مثال: ریاضی صنف هفتم"
          placeholderTextColor={Colors.textSecondary}
          textAlign="right"
        />
      </View>

      {/* Class Selection - Modal */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>صنف *</Text>
        {fetchingData ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <TouchableOpacity
            style={styles.selectorButton}
            onPress={() => setShowClassModal(true)}
          >
            <Text
              style={[
                styles.selectorText,
                !formData.classId && styles.selectorPlaceholder,
              ]}
            >
              {getSelectedClassName()}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Subject Selection - Modal */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>درس *</Text>
        {!formData.classId ? (
          <View style={[styles.selectorButton, styles.selectorDisabled]}>
            <Text style={[styles.selectorText, styles.selectorPlaceholder]}>
              ابتدا یک صنف انتخاب کنید
            </Text>
          </View>
        ) : fetchingSubjects ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <TouchableOpacity
            style={[
              styles.selectorButton,
              subjects.length === 0 && styles.selectorDisabled,
            ]}
            onPress={() => subjects.length > 0 && setShowSubjectModal(true)}
            disabled={subjects.length === 0}
          >
            <Text
              style={[
                styles.selectorText,
                !formData.subjectId && styles.selectorPlaceholder,
              ]}
            >
              {subjects.length === 0
                ? "درسی برای این صنف وجود ندارد"
                : getSelectedSubjectName()}
            </Text>
            {subjects.length > 0 && (
              <Ionicons
                name="chevron-down"
                size={20}
                color={Colors.textSecondary}
              />
            )}
          </TouchableOpacity>
        )}
      </View>

      {renderClassSelector()}
      {renderSubjectSelector()}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>توضیحات و اهداف</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>توضیحات دوره *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) =>
            setFormData({ ...formData, description: text })
          }
          placeholder="توضیحات کامل دوره را بنویسید..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          textAlign="right"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>اهداف یادگیری</Text>
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {formData.objectives.map((objective, index) => (
            <View key={index} style={styles.listItem}>
              <TextInput
                style={[styles.input, styles.listInput]}
                value={objective}
                onChangeText={(text) =>
                  handleUpdateItem("objectives", index, text)
                }
                placeholder={`هدف ${index + 1}`}
                placeholderTextColor={Colors.textSecondary}
                textAlign="right"
              />
              {formData.objectives.length > 1 && (
                <TouchableOpacity
                  style={styles.removeItemButton}
                  onPress={() => handleRemoveItem("objectives", index)}
                >
                  <Ionicons name="close" size={20} color={Colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={styles.addItemButton}
          onPress={() => handleAddItem("objectives")}
        >
          <Ionicons name="add" size={20} color={Colors.primary} />
          <Text style={styles.addItemText}>افزودن هدف یادگیری</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>پیش‌نیازها</Text>
        <ScrollView
          style={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {formData.requirements.map((requirement, index) => (
            <View key={index} style={styles.listItem}>
              <TextInput
                style={[styles.input, styles.listInput]}
                value={requirement}
                onChangeText={(text) =>
                  handleUpdateItem("requirements", index, text)
                }
                placeholder={`پیش‌نیاز ${index + 1}`}
                placeholderTextColor={Colors.textSecondary}
                textAlign="right"
              />
              {formData.requirements.length > 1 && (
                <TouchableOpacity
                  style={styles.removeItemButton}
                  onPress={() => handleRemoveItem("requirements", index)}
                >
                  <Ionicons name="close" size={20} color={Colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={styles.addItemButton}
          onPress={() => handleAddItem("requirements")}
        >
          <Ionicons name="add" size={20} color={Colors.primary} />
          <Text style={styles.addItemText}>افزودن پیش‌نیاز</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => {
    const selectedSubject = subjects.find((s) => s.id === formData.subjectId);

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>تنظیمات دوره</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>مدت دوره (ساعت) *</Text>
          <TextInput
            style={styles.input}
            value={formData.duration}
            onChangeText={(text) =>
              setFormData({ ...formData, duration: text })
            }
            placeholder="مثال: ۲۰"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="numeric"
            textAlign="right"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>ظرفیت دوره (نفر)</Text>
          <TextInput
            style={styles.input}
            value={formData.capacity}
            onChangeText={(text) =>
              setFormData({ ...formData, capacity: text })
            }
            placeholder="مثال: ۵۰ (خالی = نامحدود)"
            placeholderTextColor={Colors.textSecondary}
            keyboardType="numeric"
            textAlign="right"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>زمان‌بندی کلاس‌ها</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.schedule}
            onChangeText={(text) =>
              setFormData({ ...formData, schedule: text })
            }
            placeholder="مثال: روزهای زوج ساعت ۱۶-۱۸"
            placeholderTextColor={Colors.textSecondary}
            multiline
            textAlign="right"
          />
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>خلاصه دوره</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>عنوان:</Text>
            <Text style={styles.summaryValue}>{formData.title || "—"}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>درس:</Text>
            <Text style={styles.summaryValue}>
              {selectedSubject?.name || formData.subject || "—"}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>صنف:</Text>
            <Text style={styles.summaryValue}>
              {getClassName(formData.classId)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>مدت:</Text>
            <Text style={styles.summaryValue}>
              {formData.duration ? `${formData.duration} ساعت` : "—"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (fetchingData && step === 1) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header
          title="ایجاد دوره جدید"
          showBack
          onBackPress={() => router.back()}
        />
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
        title="ایجاد دوره جدید"
        showBack
        onBackPress={() => router.back()}
      />

      <View style={styles.progressBar}>
        {[1, 2, 3].map((stepNumber) => (
          <View key={stepNumber} style={styles.progressStep}>
            <View
              style={[
                styles.progressDot,
                step >= stepNumber && styles.progressDotActive,
              ]}
            >
              <Text
                style={[
                  styles.progressDotText,
                  step >= stepNumber && styles.progressDotTextActive,
                ]}
              >
                {stepNumber}
              </Text>
            </View>
            <Text
              style={[
                styles.progressLabel,
                step >= stepNumber && styles.progressLabelActive,
              ]}
            >
              {stepNumber === 1 && "اطلاعات پایه"}
              {stepNumber === 2 && "توضیحات"}
              {stepNumber === 3 && "تنظیمات"}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
            <Text style={styles.backButtonText}>مرحله قبل</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            (loading || uploadingImage) && styles.nextButtonDisabled,
            step === 1 && { marginStart: 0 },
          ]}
          onPress={handleNext}
          disabled={loading || uploadingImage}
        >
          <Text style={styles.nextButtonText}>
            {loading || uploadingImage
              ? uploadingImage
                ? "در حال آپلود..."
                : "در حال ایجاد..."
              : step === 3
                ? "ایجاد دوره"
                : "مرحله بعد"}
          </Text>
          <Ionicons
            name={step === 3 ? "checkmark" : "chevron-back"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  progressBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressStep: {
    alignItems: "center",
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
  },
  progressDotText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.textSecondary,
  },
  progressDotTextActive: {
    color: "#fff",
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressLabelActive: {
    color: Colors.primary,
    fontWeight: "500",
  },
  content: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 24,
    textAlign: "right",
  },
  imagePicker: {
    marginBottom: 24,
  },
  courseImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "right",
  },
  selectorButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    minHeight: 50,
  },
  selectorDisabled: {
    opacity: 0.6,
    backgroundColor: Colors.border,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    padding: 12,
    textAlign: "right",
  },
  selectorPlaceholder: {
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    textAlign: "right",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  listContainer: {
    maxHeight: 200,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  listInput: {
    flex: 1,
  },
  removeItemButton: {
    padding: 8,
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 8,
    gap: 8,
  },
  addItemText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
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
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalItemText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: "right",
  },
  modalItemTextSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },
  modalLoading: {
    padding: 40,
    alignItems: "center",
  },
  modalLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  modalEmpty: {
    padding: 40,
    alignItems: "center",
  },
  modalEmptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  summary: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
    textAlign: "right",
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 8,
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "500",
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  nextButtonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
