// app/(admin)/courses/create.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { adminCourseApi } from "../../../src/config/adminCourseApi";
import { BASE_URL } from "../../../src/config/api";

interface CourseForm {
  title: string;
  description: string;
  subject: string;
  duration: number | null; // Changed to allow null
  teacherId: number;
  classId: number | null;
  thumbnail: string;
  isActive: boolean;
  objectives: string[];
  requirements: string[];
}

interface Teacher {
  id: number;
  name: string;
  email?: string;
  profileImage?: string;
}

interface ClassOption {
  id: number;
  name: string;
  displayName: string;
  section?: string;
}

export default function CreateCourse() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState<CourseForm>({
    title: "",
    description: "",
    subject: "",
    duration: null, // Changed from 0 to null
    teacherId: 0,
    classId: null,
    thumbnail: "",
    isActive: false,
    objectives: [""],
    requirements: [""],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDropdownData();
  }, []);

  const loadDropdownData = async () => {
    try {
      setLoadingData(true);
      console.log("Loading dropdown data...");

      const [teachersRes, classesRes] = await Promise.all([
        adminCourseApi.getTeachers(),
        adminCourseApi.getClasses(),
      ]);

      console.log("Teachers response:", teachersRes);
      console.log("Classes response:", classesRes);

      if (teachersRes.success && teachersRes.data) {
        console.log("Teachers loaded:", teachersRes.data.length);
        setTeachers(teachersRes.data);
        if (teachersRes.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            teacherId: teachersRes.data[0].id,
          }));
        }
      } else {
        console.log("Failed to load teachers:", teachersRes);
      }

      if (classesRes.success && classesRes.data) {
        console.log("Classes loaded:", classesRes.data.length);
        setClasses(classesRes.data);
      } else {
        console.log("Failed to load classes:", classesRes);
        console.log("Attempting to fetch classes from adminUserApi...");
        const { adminUserApi } =
          await import("../../../src/config/adminUserApi");
        const userClassesRes = await adminUserApi.getClasses();
        if (userClassesRes.success && userClassesRes.data) {
          console.log(
            "Classes loaded from adminUserApi:",
            userClassesRes.data.length,
          );
          setClasses(userClassesRes.data);
        }
      }
    } catch (err) {
      console.error("Error loading dropdown data:", err);
      Alert.alert("خطا", "مشکلی در بارگذاری اطلاعات پیش آمد");
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "عنوان دوره الزامی است";
    }

    if (!formData.description.trim()) {
      newErrors.description = "توضیحات دوره الزامی است";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "موضوع دوره الزامی است";
    }

    if (!formData.teacherId || formData.teacherId === 0) {
      newErrors.teacherId = "انتخاب مدرس دوره الزامی است";
    }

    // Fix duration validation - check if duration is null or <= 0
    if (!formData.duration || formData.duration <= 0) {
      newErrors.duration = "مدت زمان دوره باید بیشتر از صفر باشد";
    }

    const hasValidObjective = formData.objectives.some((obj) => obj.trim());
    if (!hasValidObjective) {
      newErrors.objectives = "حداقل یک هدف یادگیری وارد کنید";
    }

    const hasValidRequirement = formData.requirements.some((req) => req.trim());
    if (!hasValidRequirement) {
      newErrors.requirements = "حداقل یک پیش‌نیاز وارد کنید";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async (imageUri: string): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const formDataUpload = new FormData();

      const filename = imageUri.split("/").pop() || "course.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formDataUpload.append("file", {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      const response = await fetch(`${BASE_URL}/admin/courses/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataUpload,
      });

      const result = await response.json();
      if (response.ok && result.success) {
        return result.data.url;
      }
      return null;
    } catch (err) {
      console.error("Error uploading image:", err);
      return null;
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploadingImage(true);

        const uploadedUrl = await uploadImage(result.assets[0].uri);

        if (uploadedUrl) {
          setFormData({ ...formData, thumbnail: uploadedUrl });
          Alert.alert("موفقیت", "تصویر با موفقیت آپلود شد");
        } else {
          Alert.alert("خطا", "آپلود تصویر ناموفق بود");
        }
      }
    } catch (err) {
      Alert.alert("خطا", "در انتخاب تصویر مشکلی پیش آمده");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddObjective = () => {
    setFormData({
      ...formData,
      objectives: [...formData.objectives, ""],
    });
  };

  const handleRemoveObjective = (index: number) => {
    const newObjectives = [...formData.objectives];
    newObjectives.splice(index, 1);
    setFormData({ ...formData, objectives: newObjectives });
  };

  const handleUpdateObjective = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData({ ...formData, objectives: newObjectives });
  };

  const handleAddRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, ""],
    });
  };

  const handleRemoveRequirement = (index: number) => {
    const newRequirements = [...formData.requirements];
    newRequirements.splice(index, 1);
    setFormData({ ...formData, requirements: newRequirements });
  };

  const handleUpdateRequirement = (index: number, value: string) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({ ...formData, requirements: newRequirements });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const courseData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        duration: formData.duration || 0, // Convert null to 0 for API
        teacherId: formData.teacherId,
        classId: formData.classId,
        thumbnail: formData.thumbnail || "",
        isActive: formData.isActive,
        objectives: formData.objectives.filter((o) => o.trim()),
        requirements: formData.requirements.filter((r) => r.trim()),
      };

      const response = await adminCourseApi.createCourse(courseData);

      if (response.success) {
        Alert.alert("موفقیت", "دوره جدید با موفقیت ایجاد شد", [
          {
            text: "باشه",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("خطا", response.message);
      }
    } catch (err) {
      console.error("Error creating course:", err);
      Alert.alert("خطا", "در ایجاد دوره مشکلی پیش آمده");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="ایجاد دوره جدید" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="ایجاد دوره جدید" showBack />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات پایه</Text>

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>عنوان دوره *</Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="عنوان دوره..."
              value={formData.title}
              onChangeText={(text) => {
                setFormData({ ...formData, title: text });
                if (errors.title) setErrors({ ...errors, title: "" });
              }}
              placeholderTextColor={Colors.textSecondary}
              textAlign="right"
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>توضیحات دوره *</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                errors.description && styles.inputError,
              ]}
              placeholder="توضیحات کامل دوره..."
              value={formData.description}
              onChangeText={(text) => {
                setFormData({ ...formData, description: text });
                if (errors.description)
                  setErrors({ ...errors, description: "" });
              }}
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              textAlign="right"
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
          </View>

          {/* Subject */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>موضوع دوره *</Text>
            <TextInput
              style={[styles.input, errors.subject && styles.inputError]}
              placeholder="مثال: ریاضی، علوم، زبان..."
              value={formData.subject}
              onChangeText={(text) => {
                setFormData({ ...formData, subject: text });
                if (errors.subject) setErrors({ ...errors, subject: "" });
              }}
              placeholderTextColor={Colors.textSecondary}
              textAlign="right"
            />
            {errors.subject && (
              <Text style={styles.errorText}>{errors.subject}</Text>
            )}
          </View>
        </View>

        {/* Teacher & Class Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مدرس و کلاس</Text>

          {/* Teacher Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>مدرس دوره *</Text>
            <View style={styles.selectContainer}>
              {teachers.length > 0 ? (
                teachers.map((teacher) => (
                  <TouchableOpacity
                    key={teacher.id}
                    style={[
                      styles.selectOption,
                      formData.teacherId === teacher.id &&
                        styles.selectOptionActive,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, teacherId: teacher.id });
                      if (errors.teacherId)
                        setErrors({ ...errors, teacherId: "" });
                    }}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formData.teacherId === teacher.id &&
                          styles.selectOptionTextActive,
                      ]}
                    >
                      {teacher.name}
                    </Text>
                    {formData.teacherId === teacher.id && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noDataText}>مدرسی یافت نشد</Text>
              )}
            </View>
            {errors.teacherId && (
              <Text style={styles.errorText}>{errors.teacherId}</Text>
            )}
          </View>

          {/* Class Selection (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>کلاس (اختیاری)</Text>
            <View style={styles.selectContainer}>
              <TouchableOpacity
                style={[
                  styles.selectOption,
                  formData.classId === null && styles.selectOptionActive,
                ]}
                onPress={() => setFormData({ ...formData, classId: null })}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    formData.classId === null && styles.selectOptionTextActive,
                  ]}
                >
                  بدون کلاس
                </Text>
                {formData.classId === null && (
                  <Ionicons name="checkmark" size={16} color={Colors.primary} />
                )}
              </TouchableOpacity>
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <TouchableOpacity
                    key={cls.id}
                    style={[
                      styles.selectOption,
                      formData.classId === cls.id && styles.selectOptionActive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, classId: cls.id })
                    }
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formData.classId === cls.id &&
                          styles.selectOptionTextActive,
                      ]}
                    >
                      {cls.displayName}
                    </Text>
                    {formData.classId === cls.id && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noDataText}>کلاسی یافت نشد</Text>
              )}
            </View>
          </View>
        </View>

        {/* Duration & Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مدت و وضعیت</Text>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>مدت زمان (ساعت) *</Text>
              <TextInput
                style={[styles.input, errors.duration && styles.inputError]}
                placeholder="۰"
                value={
                  formData.duration && formData.duration > 0
                    ? formData.duration.toString()
                    : ""
                }
                onChangeText={(text) => {
                  // Allow empty string to clear the input
                  if (text === "") {
                    setFormData({ ...formData, duration: null });
                    if (errors.duration) setErrors({ ...errors, duration: "" });
                    return;
                  }

                  // Parse the number and only set if valid
                  const parsed = parseInt(text);
                  if (!isNaN(parsed) && parsed >= 0) {
                    setFormData({ ...formData, duration: parsed });
                    if (errors.duration) setErrors({ ...errors, duration: "" });
                  }
                }}
                keyboardType="numeric"
                textAlign="right"
              />
              {errors.duration && (
                <Text style={styles.errorText}>{errors.duration}</Text>
              )}
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.label}>وضعیت انتشار</Text>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>
                  {formData.isActive ? "فعال" : "غیرفعال"}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.switchButton,
                    formData.isActive
                      ? styles.switchButtonActive
                      : styles.switchButtonInactive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, isActive: !formData.isActive })
                  }
                >
                  <View
                    style={[
                      styles.switchCircle,
                      formData.isActive
                        ? styles.switchCircleActive
                        : styles.switchCircleInactive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Thumbnail Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تصویر دوره</Text>
          <TouchableOpacity
            style={styles.imageUpload}
            onPress={pickImage}
            disabled={uploadingImage}
          >
            {formData.thumbnail ? (
              <Image
                source={{ uri: formData.thumbnail }}
                style={styles.uploadedImage}
              />
            ) : (
              <View style={styles.uploadPlaceholder}>
                {uploadingImage ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : (
                  <>
                    <Ionicons
                      name="camera"
                      size={48}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.uploadText}>انتخاب تصویر</Text>
                    <Text style={styles.uploadSubtext}>
                      تصویر دوره با نسبت ۱۶:۹
                    </Text>
                  </>
                )}
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Learning Objectives */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>اهداف یادگیری *</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddObjective}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          {formData.objectives.map((objective, index) => (
            <View key={index} style={styles.listItem}>
              <TextInput
                style={styles.listInput}
                placeholder={`هدف یادگیری ${index + 1}`}
                value={objective}
                onChangeText={(text) => handleUpdateObjective(index, text)}
                placeholderTextColor={Colors.textSecondary}
                textAlign="right"
              />
              {formData.objectives.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveObjective(index)}
                >
                  <Ionicons name="close" size={20} color={Colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {errors.objectives && (
            <Text style={styles.errorText}>{errors.objectives}</Text>
          )}
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>پیش‌نیازها *</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddRequirement}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          {formData.requirements.map((req, index) => (
            <View key={index} style={styles.listItem}>
              <TextInput
                style={styles.listInput}
                placeholder={`پیش‌نیاز ${index + 1}`}
                value={req}
                onChangeText={(text) => handleUpdateRequirement(index, text)}
                placeholderTextColor={Colors.textSecondary}
                textAlign="right"
              />
              {formData.requirements.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveRequirement(index)}
                >
                  <Ionicons name="close" size={20} color={Colors.danger} />
                </TouchableOpacity>
              )}
            </View>
          ))}
          {errors.requirements && (
            <Text style={styles.errorText}>{errors.requirements}</Text>
          )}
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            پس از ایجاد دوره، می‌توانید درس‌ها و محتوای آموزشی را به دوره اضافه
            کنید.
          </Text>
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
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>ایجاد دوره</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>انصراف</Text>
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
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    textAlign: "right",
  },
  inputError: {
    borderColor: Colors.danger,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  selectContainer: {
    gap: 8,
  },
  selectOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectOptionActive: {
    backgroundColor: Colors.primary + "10",
    borderColor: Colors.primary,
  },
  selectOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  selectOptionTextActive: {
    color: Colors.primary,
    fontWeight: "500",
  },
  noDataText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    padding: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  switchButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
  },
  switchButtonActive: {
    backgroundColor: Colors.primary,
  },
  switchButtonInactive: {
    backgroundColor: Colors.border,
  },
  switchCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  switchCircleActive: {
    backgroundColor: "#fff",
    marginLeft: 22,
  },
  switchCircleInactive: {
    backgroundColor: Colors.textSecondary,
    marginRight: 22,
  },
  imageUpload: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
  },
  uploadPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: 12,
  },
  uploadText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  listInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    textAlign: "right",
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "10",
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textSecondary,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginBottom: 32,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
  },
});
