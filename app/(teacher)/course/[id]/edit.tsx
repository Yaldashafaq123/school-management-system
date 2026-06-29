import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { Lesson, teacherCoursesApi } from "@/src/config/teacherCoursesApi";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Subject {
  id: number;
  name: string;
}

interface Class {
  id: number;
  name: string;
}

export default function EditCourse() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    duration: "",
    capacity: "",
    schedule: "",
    thumbnail: "",
    classId: null as number | null,
    is_active: true,
    objectives: [] as string[],
    requirements: [] as string[],
  });

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
    is_free: false,
    order: 1,
  });

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await teacherCoursesApi.getCourse(Number(id));

      if (response.success && response.data) {
        const course = response.data;
        setFormData({
          title: course.title || "",
          description: course.description || "",
          subject: course.subject || "",
          duration: course.duration?.toString() || "",
          capacity: "",
          schedule: course.schedule || "",
          thumbnail: course.thumbnail_url || "",
          classId: course.class_id,
          is_active: course.is_active,
          objectives: course.objectives?.map((obj) => obj.text) || [],
          requirements: course.requirements?.map((req) => req.text) || [],
        });
        setImage(course.thumbnail_url || null);

        // Fetch lessons for this course
        await fetchCourseLessons();
      }
    } catch {
      Alert.alert("خطا", "مشکلی در دریافت اطلاعات دوره پیش آمد.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchCourseLessons = async () => {
    try {
      const response = await teacherCoursesApi.getCourseLessons(Number(id));
      if (response.success) {
        setLessons(response.data || []);
      }
    } catch {
      // Silently fail - just show empty lessons
    }
  };

  const fetchSubjectsAndClasses = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      // Fetch classes
      const classesResponse = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/teacher/available-classes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const classesData = await classesResponse.json();
      setClasses(classesData.data || []);

      // Fetch subjects
      const subjectsResponse = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/teacher/subjects`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const subjectsData = await subjectsResponse.json();
      setSubjects(subjectsData.data || []);
    } catch {
      // Silently fail
    }
  };

  useEffect(() => {
    fetchCourseData();
    fetchSubjectsAndClasses();
  }, [fetchCourseData]);

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setFormData((prev) => ({
          ...prev,
          thumbnail: result.assets[0].uri,
        }));
      }
    } catch {
      Alert.alert("خطا", "مشکلی در انتخاب تصویر پیش آمد.");
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!image || image === formData.thumbnail) return formData.thumbnail;

    try {
      setUploadingImage(true);
      const token = await AsyncStorage.getItem("auth_token");

      const formDataImage = new FormData();
      formDataImage.append("image", {
        uri: image,
        type: "image/jpeg",
        name: "course.jpg",
      } as any);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/upload`,
        {
          method: "POST",
          body: formDataImage,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      return data.url;
    } catch {
      Alert.alert("خطا", "آپلود عکس با مشکل مواجه شد.");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Lesson Management Functions
  const handleAddLesson = () => {
    setEditingLesson(null);
    setLessonForm({
      title: "",
      description: "",
      videoUrl: "",
      duration: "",
      is_free: false,
      order: lessons.length + 1,
    });
    setShowLessonModal(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration?.toString() || "", // Convert number to string for display
      is_free: lesson.isFree,
      order: lesson.order,
    });
    setShowLessonModal(true);
  };

  const handleDeleteLesson = async (lessonId: number) => {
    Alert.alert("حذف درس", "آیا از حذف این درس اطمینان دارید؟", [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await teacherCoursesApi.deleteLesson(lessonId);
            if (response.success) {
              setLessons(lessons.filter((lesson) => lesson.id !== lessonId));
              Alert.alert("موفقیت", "درس با موفقیت حذف شد.");
            }
          } catch {
            Alert.alert("خطا", "مشکلی در حذف درس پیش آمد.");
          }
        },
      },
    ]);
  };

  // FIXED: Convert duration to number before sending to API
  const handleSaveLesson = async () => {
    if (!lessonForm.title.trim()) {
      Alert.alert("خطا", "عنوان درس الزامی است.");
      return;
    }

    if (!lessonForm.videoUrl.trim()) {
      Alert.alert("خطا", "لینک ویدیو الزامی است.");
      return;
    }

    // Validate duration is a number
    const durationNum = lessonForm.duration ? parseInt(lessonForm.duration) : 0;
    if (lessonForm.duration && isNaN(durationNum)) {
      Alert.alert("خطا", "مدت زمان باید یک عدد باشد");
      return;
    }

    try {
      const lessonData = {
        title: lessonForm.title,
        description: lessonForm.description,
        videoUrl: lessonForm.videoUrl,
        duration: durationNum, // ✅ Convert string to number
        is_free: lessonForm.is_free,
        order: lessonForm.order,
      };

      if (editingLesson && editingLesson.id) {
        const response = await teacherCoursesApi.updateLesson(
          editingLesson.id,
          {
            ...lessonData,
            course_id: Number(id),
          },
        );

        if (response.success) {
          // Update local state with the converted duration
          const updatedLesson = {
            ...editingLesson,
            ...lessonData,
            id: editingLesson.id,
          };
          setLessons(
            lessons.map((lesson) =>
              lesson.id === editingLesson.id ? updatedLesson : lesson,
            ),
          );
          Alert.alert("موفقیت", "درس با موفقیت ویرایش شد.");
        }
      } else {
        const response = await teacherCoursesApi.createLesson(Number(id), {
          ...lessonData,
          course_id: Number(id),
        });

        if (response.success) {
          setLessons([...lessons, response.data]);
          Alert.alert("موفقیت", "درس جدید اضافه شد.");
        }
      }
      setShowLessonModal(false);
      setEditingLesson(null);
    } catch (error) {
      console.error("Error saving lesson:", error);
      Alert.alert("خطا", "مشکلی در ذخیره درس پیش آمد.");
    }
  };

  const handleAddItem = (type: "objectives" | "requirements") => {
    setFormData({
      ...formData,
      [type]: [...formData[type], ""],
    });
  };

  const handleUpdateItem = (
    type: "objectives" | "requirements",
    index: number,
    value: string,
  ) => {
    const newItems = [...formData[type]];
    newItems[index] = value;
    setFormData({ ...formData, [type]: newItems });
  };

  const handleRemoveItem = (
    type: "objectives" | "requirements",
    index: number,
  ) => {
    const newItems = formData[type].filter((_, i) => i !== index);
    setFormData({ ...formData, [type]: newItems });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert("خطا", "عنوان دوره الزامی است.");
      return false;
    }

    if (!formData.description.trim()) {
      Alert.alert("خطا", "توضیحات دوره الزامی است.");
      return false;
    }

    return true;
  };

  // FIXED: Ensure duration is sent as number
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      // Upload image if changed
      let thumbnailUrl = formData.thumbnail;
      if (image && image !== formData.thumbnail) {
        const uploaded = await teacherCoursesApi.uploadImage(image);
        thumbnailUrl = uploaded.url;
      }

      const updateData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        duration: parseInt(formData.duration) || 0, // ✅ Convert string to number
        schedule: formData.schedule,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        thumbnail: thumbnailUrl,
        classId: formData.classId,
        is_active: formData.is_active,
        objectives: formData.objectives
          .filter((obj) => obj.trim() !== "")
          .map((text) => ({ text })),
        requirements: formData.requirements
          .filter((req) => req.trim() !== "")
          .map((text) => ({ text })),
      };

      const response = await teacherCoursesApi.updateCourse(
        Number(id),
        updateData,
      );

      if (response.success) {
        Alert.alert("موفقیت", "تغییرات دوره با موفقیت ذخیره شد!", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error("Error updating course:", error);
      Alert.alert("خطا", "مشکلی در ذخیره تغییرات پیش آمد.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "حذف دوره",
      "آیا از حذف این دوره اطمینان دارید؟ این عمل قابل بازگشت نیست.",
      [
        { text: "لغو", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await teacherCoursesApi.deleteCourse(Number(id));
              if (response.success) {
                Alert.alert("موفقیت", "دوره با موفقیت حذف شد.");
                router.push("/(teacher)/courses");
              }
            } catch {
              Alert.alert("خطا", "مشکلی در حذف دوره پیش آمد.");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="ویرایش دوره" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            در حال بارگذاری اطلاعات دوره...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="ویرایش دوره"
        showBack
        onBackPress={() => router.back()}
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleAddLesson}
              style={styles.headerButton}
            >
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.headerButton}
            >
              <Ionicons name="trash-outline" size={24} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Course Image */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>تصویر دوره</Text>
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={handleImagePick}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.selectedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons
                  name="image-outline"
                  size={40}
                  color={Colors.textSecondary}
                />
                <Text style={styles.imagePlaceholderText}>انتخاب تصویر</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Lessons Management - Students will watch these videos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>درس‌های دوره (ویدیوها)</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddLesson}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>درس جدید</Text>
            </TouchableOpacity>
          </View>

          {lessons.length === 0 ? (
            <View style={styles.emptyLessons}>
              <Ionicons
                name="play-circle-outline"
                size={60}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyLessonsText}>
                هنوز درسی اضافه نکرده‌اید
              </Text>
              <Text style={styles.emptyLessonsSubtext}>
                دانش‌آموزان ویدیوهای هر درس را به ترتیب مشاهده خواهند کرد
              </Text>
              <TouchableOpacity
                style={styles.addFirstButton}
                onPress={handleAddLesson}
              >
                <Text style={styles.addFirstButtonText}>
                  اضافه کردن اولین درس
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.lessonsContainer}>
              <Text style={styles.lessonsCount}>
                {lessons.length} درس ({lessons.filter((l) => l.isFree).length}{" "}
                رایگان)
              </Text>

              {lessons
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((lesson, index) => (
                  <View key={lesson.id || index} style={styles.lessonItem}>
                    <View style={styles.lessonContent}>
                      <View style={styles.lessonHeader}>
                        <View style={styles.lessonOrder}>
                          <Text style={styles.lessonOrderText}>
                            {lesson.order || index + 1}
                          </Text>
                        </View>
                        <Text style={styles.lessonTitle} numberOfLines={1}>
                          {lesson.title}
                        </Text>
                        {lesson.isFree && (
                          <View style={styles.freeBadge}>
                            <Text style={styles.freeBadgeText}>رایگان</Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.lessonDescription} numberOfLines={2}>
                        {lesson.description}
                      </Text>

                      <View style={styles.lessonFooter}>
                        <View style={styles.lessonMeta}>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color={Colors.textSecondary}
                          />
                          <Text style={styles.lessonMetaText}>
                            {lesson.duration} دقیقه
                          </Text>
                        </View>

                        <View style={styles.lessonActions}>
                          <TouchableOpacity
                            style={styles.lessonAction}
                            onPress={() => handleEditLesson(lesson)}
                          >
                            <Ionicons
                              name="create-outline"
                              size={18}
                              color={Colors.primary}
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.lessonAction}
                            onPress={() =>
                              lesson.id && handleDeleteLesson(lesson.id)
                            }
                          >
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color={Colors.danger}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
            </View>
          )}
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات اصلی</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>عنوان دوره *</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: ریاضی پایه هفتم"
              placeholderTextColor={Colors.textSecondary}
              value={formData.title}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, title: text }))
              }
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>توضیحات دوره *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="توضیحات کامل دوره را وارد کنید..."
              placeholderTextColor={Colors.textSecondary}
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>موضوع</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {subjects.map((subject) => (
                  <TouchableOpacity
                    key={subject.id}
                    style={[
                      styles.chip,
                      formData.subject === subject.name && styles.chipSelected,
                    ]}
                    onPress={() =>
                      setFormData((prev) => ({
                        ...prev,
                        subject: subject.name,
                      }))
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        formData.subject === subject.name &&
                          styles.chipTextSelected,
                      ]}
                    >
                      {subject.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>مدت دوره (ساعت)</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: ۲۰"
              placeholderTextColor={Colors.textSecondary}
              value={formData.duration}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, duration: text }))
              }
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Course Content - Objectives & Requirements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>محتوای دوره</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>اهداف یادگیری</Text>
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
            <TouchableOpacity
              style={styles.addItemButton}
              onPress={() => handleAddItem("requirements")}
            >
              <Ionicons name="add" size={20} color={Colors.primary} />
              <Text style={styles.addItemText}>افزودن پیش‌نیاز</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تنظیمات</Text>

          <View style={styles.toggleGroup}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>فعال‌سازی دوره</Text>
              <Switch
                value={formData.is_active}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, is_active: value }))
                }
                trackColor={{ false: "#767577", true: Colors.success }}
              />
            </View>
            <Text style={styles.toggleDescription}>
              دوره غیرفعال برای دانش‌آموزان نمایش داده نمی‌شود
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>لغو</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              (saving || uploadingImage) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={saving || uploadingImage}
          >
            {saving || uploadingImage ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.submitButtonText}>
                  {uploadingImage ? "در حال آپلود..." : "در حال ذخیره..."}
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="save" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>ذخیره تغییرات</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Lesson Modal - For adding/editing videos */}
      <Modal
        visible={showLessonModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLessonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingLesson ? "ویرایش درس" : "درس جدید"}
              </Text>
              <TouchableOpacity onPress={() => setShowLessonModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>عنوان درس *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="مثال: آشنایی با اعداد صحیح"
                  value={lessonForm.title}
                  onChangeText={(text) =>
                    setLessonForm((prev) => ({ ...prev, title: text }))
                  }
                />
              </View>

              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>توضیحات</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="توضیحات کامل درس..."
                  value={lessonForm.description}
                  onChangeText={(text) =>
                    setLessonForm((prev) => ({ ...prev, description: text }))
                  }
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>لینک ویدیو *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="https://example.com/video.mp4"
                  value={lessonForm.videoUrl}
                  onChangeText={(text) =>
                    setLessonForm((prev) => ({ ...prev, videoUrl: text }))
                  }
                />
                <Text style={styles.modalHint}>
                  می‌توانید از لینک‌های آپارات، یوتیوب یا سرور خود استفاده کنید
                </Text>
              </View>

              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>مدت زمان (دقیقه)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="مثال: 20"
                  placeholderTextColor={Colors.textSecondary}
                  value={lessonForm.duration}
                  onChangeText={(text) =>
                    setLessonForm((prev) => ({ ...prev, duration: text }))
                  }
                  keyboardType="numeric"
                />
                <Text style={styles.modalHint}>
                  مدت زمان درس را به دقیقه وارد کنید
                </Text>
              </View>

              <View style={styles.modalFormGroup}>
                <View style={styles.modalToggleRow}>
                  <Text style={styles.modalLabel}>درس رایگان</Text>
                  <Switch
                    value={lessonForm.is_free}
                    onValueChange={(value) =>
                      setLessonForm((prev) => ({ ...prev, is_free: value }))
                    }
                    trackColor={{ false: "#767577", true: Colors.success }}
                  />
                </View>
                <Text style={styles.modalHint}>
                  درس‌های رایگان برای همه قابل مشاهده هستند
                </Text>
              </View>

              <View style={styles.modalFormGroup}>
                <Text style={styles.modalLabel}>ترتیب درس</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="شماره ترتیب"
                  value={lessonForm.order.toString()}
                  onChangeText={(text) =>
                    setLessonForm((prev) => ({
                      ...prev,
                      order: parseInt(text) || 0,
                    }))
                  }
                  keyboardType="numeric"
                />
                <Text style={styles.modalHint}>
                  دانش‌آموزان درس‌ها را به این ترتیب مشاهده می‌کنند
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowLessonModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>لغو</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveLesson}
              >
                <Text style={styles.modalSaveButtonText}>
                  {editingLesson ? "ذخیره" : "اضافه کردن"}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  imageSection: {
    backgroundColor: Colors.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  section: {
    backgroundColor: Colors.card,
    marginTop: 16,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  imagePicker: {
    height: 200,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyLessons: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyLessonsText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyLessonsSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  lessonsContainer: {
    gap: 12,
  },
  lessonsCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  lessonItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  lessonContent: {
    flex: 1,
    padding: 12,
  },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  lessonOrder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  lessonOrderText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  lessonTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  freeBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  freeBadgeText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: "bold",
  },
  lessonDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  lessonFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lessonMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  lessonMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lessonActions: {
    flexDirection: "row",
    gap: 8,
  },
  lessonAction: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    textAlign: "right",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  chipContainer: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.text,
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "bold",
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
  toggleGroup: {
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  toggleDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  spacer: {
    height: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    width: "100%",
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
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  modalFormGroup: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.text,
    textAlign: "right",
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalHint: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  modalToggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "bold",
  },
  modalSaveButton: {
    backgroundColor: Colors.primary,
  },
  modalSaveButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
});
