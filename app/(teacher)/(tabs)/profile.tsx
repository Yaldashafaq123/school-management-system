import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { Header } from "../../../components/Header";
import { Colors } from "../../../constants/Colors";
import { BASE_URL } from "../../../src/config/api";

interface Subject {
  id: number;
  name: string;
}

interface TeacherProfileData {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  profileImage: string;
  bio: string;
  experience: string;
  hourlyRate: number;
  certification: string;
  availability: boolean;
  rating: number;
  education: string[];
  subjects: Subject[];
  stats: {
    totalStudents: number;
    totalCourses: number;
    totalHours: number;
    rating: number;
  };
}

const defaultProfileImage = "https://via.placeholder.com/150";

export default function TeacherProfile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<TeacherProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [profileImage, setProfileImage] = useState(defaultProfileImage);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Edit form state
  const [formData, setFormData] = useState({
    bio: "",
    experience: "",
    hourlyRate: 0,
    certification: "",
    availability: true,
    phone: "",
    profileImage: "",
    education: [] as string[],
    subjects: [] as number[],
  });

  const [notifications, setNotifications] = useState({
    assignmentSubmissions: true,
    examResults: true,
    studentMessages: true,
    courseEnrollments: true,
    paymentNotifications: true,
    systemAnnouncements: true,
    marketingEmails: false,
  });

  // Fetch teacher profile
  const fetchProfile = async () => {
    try {
      setFetchError(null);
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        setFetchError("No token found");
        return;
      }

      console.log("Fetching profile from:", `${BASE_URL}/teacher/profile`);
      
      const response = await fetch(`${BASE_URL}/teacher/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Profile response:", data);

      if (response.ok) {
        // Check if data has the expected structure
        const profileData = data.data || data; // Handle both {data: {...}} and direct response
        
        setProfile(profileData);
        setProfileImage(profileData.profileImage || defaultProfileImage);
        
        // Initialize form data
        setFormData({
          bio: profileData.bio || "",
          experience: profileData.experience || "",
          hourlyRate: profileData.hourlyRate || 0,
          certification: profileData.certification || "",
          availability: profileData.availability ?? true,
          phone: profileData.phone || "",
          profileImage: profileData.profileImage || "",
          education: profileData.education || [],
          subjects: profileData.subjects?.map((s: Subject) => s.id) || [],
        });
      } else {
        console.error("Profile fetch failed:", data);
        setFetchError(data.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      setFetchError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch all subjects for selection - FIXED: This endpoint might not exist
  const fetchSubjects = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) return;

      // Try multiple possible endpoints for subjects
      const possibleEndpoints = [
        "/teacher/subjects",
        "/subjects",
        "/api/subjects",
        "/subjects/all"
      ];
      
      let subjectsData = [];
      let found = false;

      for (const endpoint of possibleEndpoints) {
        try {
          console.log("Trying subjects endpoint:", `${BASE_URL}${endpoint}`);
          const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            subjectsData = data.data || data;
            console.log(`✅ Subjects found at ${endpoint}:`, subjectsData);
            found = true;
            break;
          }
        } catch (e) {
          console.log(`❌ Failed at ${endpoint}:`, e);
        }
      }

      if (found && Array.isArray(subjectsData)) {
        setAllSubjects(subjectsData);
      } else {
        // If no subjects endpoint works, use mock data
        console.log("Using mock subjects data");
        setAllSubjects([
          { id: 1, name: "ریاضی" },
          { id: 2, name: "فیزیک" },
          { id: 3, name: "شیمی" },
          { id: 4, name: "زیست‌شناسی" },
          { id: 5, name: "ادبیات" },
          { id: 6, name: "زبان انگلیسی" },
          { id: 7, name: "عربی" },
          { id: 8, name: "تاریخ" },
          { id: 9, name: "جغرافیا" },
          { id: 10, name: "برنامه‌نویسی" },
        ]);
      }
    } catch (error) {
      console.error("Fetch subjects error:", error);
      // Set mock subjects as fallback
      setAllSubjects([
        { id: 1, name: "ریاضی" },
        { id: 2, name: "فیزیک" },
        { id: 3, name: "شیمی" },
      ]);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchSubjects();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
    fetchSubjects();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("مجوز لازم", "برای انتخاب عکس به دسترسی گالری نیاز دارید.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      setFormData({ ...formData, profileImage: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) return;

      console.log("Saving profile:", formData);

      const response = await fetch(`${BASE_URL}/teacher/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("موفقیت", "پروفایل با موفقیت به‌روزرسانی شد.");
        setIsEditing(false);
        fetchProfile(); // Refresh profile data
      } else {
        Alert.alert(
          "خطا",
          data.message || "در به‌روزرسانی پروفایل خطایی رخ داد.",
        );
      }
    } catch (error) {
      console.error("Profile update error:", error);
      Alert.alert("خطا", "در به‌روزرسانی پروفایل خطایی رخ داد.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("خروج از حساب", "آیا مطمئن هستید که می‌خواهید خارج شوید؟", [
      { text: "لغو", style: "cancel" },
      {
        text: "خروج",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("خطا", "در خروج از حساب خطایی رخ داد.");
          }
        },
      },
    ]);
  };

  const handleAddEducation = () => {
    Alert.prompt(
      "افزودن مدرک تحصیلی",
      "مدرک تحصیلی جدید را وارد کنید:",
      (education) => {
        if (education) {
          setFormData({
            ...formData,
            education: [...formData.education, education],
          });
        }
      },
    );
  };

  const handleRemoveEducation = (index: number) => {
    const newEducation = [...formData.education];
    newEducation.splice(index, 1);
    setFormData({ ...formData, education: newEducation });
  };

  const handleToggleSubject = (subjectId: number) => {
    const currentSubjects = [...formData.subjects];
    if (currentSubjects.includes(subjectId)) {
      setFormData({
        ...formData,
        subjects: currentSubjects.filter((id) => id !== subjectId),
      });
    } else {
      setFormData({
        ...formData,
        subjects: [...currentSubjects, subjectId],
      });
    }
  };

  const getSubjectName = (subjectId: number) => {
    return allSubjects.find((s) => s.id === subjectId)?.name || "";
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </SafeAreaView>
    );
  }

  if (fetchError || !profile) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle" size={48} color={Colors.danger} />
        <Text style={styles.errorText}>{fetchError || "خطا در بارگذاری پروفایل"}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfile}>
          <Text style={styles.retryButtonText}>تلاش مجدد</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Safe access to stats with defaults
  const stats = [
    {
      label: "تعداد دوره‌ها",
      value: profile.stats?.totalCourses || 0,
      icon: "book" as const,
    },
    {
      label: "دانش‌آموزان",
      value: profile.stats?.totalStudents || 0,
      icon: "people" as const,
    },
    {
      label: "ساعات تدریس",
      value: profile.stats?.totalHours || 0,
      icon: "time" as const,
    },
    {
      label: "امتیاز",
      value: profile.stats?.rating || profile.rating || 0,
      icon: "star" as const,
    },
  ];

  const teacherMenu = [
    {
      title: "دریافت‌های مالی",
      icon: "wallet" as const,
      onPress: () => router.push("/not-found" as any),
    },
    {
      title: "تقویم تدریس",
      icon: "calendar" as const,
      onPress: () => router.push("/(teacher)/timetable" as any),
    },
    {
      title: "تنظیمات پیشرفته",
      icon: "settings" as const,
      onPress: () => router.push("/not-found" as any),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="پروفایل معلم"
        showBack
        rightComponent={
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Ionicons
              name={isEditing ? "close" : "create-outline"}
              size={24}
              color={Colors.text}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <LinearGradient
          colors={["#1e40af", "#3b82f6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeader}
        >
          <TouchableOpacity onPress={isEditing ? pickImage : undefined}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
              {isEditing && (
                <View style={styles.editImageBadge}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <View style={styles.profileTitle}>
              <Text style={styles.profileName}>{profile.fullName}</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                <Text style={styles.verifiedText}>تایید شده</Text>
              </View>
            </View>

            <Text style={styles.profileTagline}>
              {profile.subjects && profile.subjects.length > 0
                ? `معلم ${profile.subjects[0]?.name} • ${profile.experience || "۰"} سال سابقه`
                : `معلم • ${profile.experience || "۰"} سال سابقه`}
            </Text>

            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={styles.ratingText}>{profile.rating || 0}</Text>
              <Text style={styles.ratingCount}>(۱۲۴ نظر)</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Ionicons name={stat.icon} size={20} color={Colors.primary} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Edit Form or Bio */}
        {isEditing ? (
          <View style={styles.editSection}>
            <Text style={styles.sectionTitle}>ویرایش اطلاعات</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>درباره من</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                placeholder="درباره خود و سابقه تدریس بنویسید..."
                multiline
                numberOfLines={4}
                textAlign="right"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>شماره تلفن</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                placeholder="شماره تلفن"
                keyboardType="phone-pad"
                textAlign="right"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>سابقه تدریس (سال)</Text>
              <TextInput
                style={styles.input}
                value={formData.experience}
                onChangeText={(text) =>
                  setFormData({ ...formData, experience: text })
                }
                placeholder="مثال: ۱۲"
                keyboardType="numeric"
                textAlign="right"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>مدرک/گواهینامه</Text>
              <TextInput
                style={styles.input}
                value={formData.certification}
                onChangeText={(text) =>
                  setFormData({ ...formData, certification: text })
                }
                placeholder="مثال: دکتری ریاضی"
                textAlign="right"
              />
            </View>
          </View>
        ) : (
          <View style={styles.bioSection}>
            <Text style={styles.bioText}>{profile.bio || "هنوز بیوگرافی وارد نشده است."}</Text>
          </View>
        )}

        {/* Education */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>مدارک تحصیلی</Text>
            {isEditing && (
              <TouchableOpacity onPress={handleAddEducation}>
                <Ionicons name="add-circle" size={24} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.educationList}>
            {(isEditing ? formData.education : profile.education || []).map(
              (edu: string, index: number) => (
                <View key={index} style={styles.educationItem}>
                  <Ionicons name="school" size={20} color={Colors.primary} />
                  <Text style={styles.educationText}>{edu}</Text>
                  {isEditing && (
                    <TouchableOpacity
                      onPress={() => handleRemoveEducation(index)}
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={Colors.danger}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ),
            )}
            {(!isEditing && (!profile.education || profile.education.length === 0)) && (
              <Text style={styles.emptyText}>مدرکی ثبت نشده است</Text>
            )}
          </View>
        </View>

        {/* Teaching Subjects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>دروس تدریس</Text>
            {isEditing && (
              <TouchableOpacity onPress={() => setShowSubjectsModal(true)}>
                <Ionicons name="add-circle" size={24} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.subjectsGrid}>
            {(isEditing
              ? formData.subjects.map((id) => getSubjectName(id))
              : (profile.subjects || []).map((s) => s.name)
            ).map((subject: string, index: number) => (
              <View key={index} style={styles.subjectChip}>
                <Text style={styles.subjectText}>{subject}</Text>
                {isEditing && (
                  <TouchableOpacity
                    onPress={() => {
                      const subjectId = profile.subjects?.[index]?.id;
                      if (subjectId) handleToggleSubject(subjectId);
                    }}
                  >
                    <Ionicons
                      name="close"
                      size={14}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {(!isEditing && (!profile.subjects || profile.subjects.length === 0)) && (
              <Text style={styles.emptyText}>درسی ثبت نشده است</Text>
            )}
          </View>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <View style={styles.availabilityCard}>
            <View style={styles.availabilityInfo}>
              <Ionicons name="calendar" size={24} color={Colors.success} />
              <View style={styles.availabilityText}>
                <Text style={styles.availabilityTitle}>
                  وضعیت تدریس:{" "}
                  {(isEditing ? formData.availability : profile.availability)
                    ? "آماده تدریس"
                    : "مشغول"}
                </Text>
                <Text style={styles.availabilitySubtitle}>
                  {(isEditing ? formData.availability : profile.availability)
                    ? "دانش‌آموزان می‌توانند برای شما درخواست ثبت کنند"
                    : "در حال حاضر ظرفیت تدریس ندارید"}
                </Text>
              </View>
            </View>
            {isEditing && (
              <Switch
                value={formData.availability}
                onValueChange={(value) =>
                  setFormData({ ...formData, availability: value })
                }
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            )}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تنظیمات اطلاع‌رسانی</Text>
          <View style={styles.notificationsList}>
            <View style={styles.notificationItem}>
              <View>
                <Text style={styles.notificationTitle}>
                  ارسال تکلیف دانش‌آموزان
                </Text>
                <Text style={styles.notificationDesc}>
                  وقتی دانش‌آموزی تکلیف ارسال می‌کند
                </Text>
              </View>
              <Switch
                value={notifications.assignmentSubmissions}
                onValueChange={(value) =>
                  setNotifications({
                    ...notifications,
                    assignmentSubmissions: value,
                  })
                }
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            <View style={styles.notificationItem}>
              <View>
                <Text style={styles.notificationTitle}>
                  پیام‌های دانش‌آموزان
                </Text>
                <Text style={styles.notificationDesc}>
                  دریافت پیام از دانش‌آموزان
                </Text>
              </View>
              <Switch
                value={notifications.studentMessages}
                onValueChange={(value) =>
                  setNotifications({ ...notifications, studentMessages: value })
                }
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            <View style={styles.notificationItem}>
              <View>
                <Text style={styles.notificationTitle}>ثبت‌نام در دوره</Text>
                <Text style={styles.notificationDesc}>
                  وقتی دانش‌آموزی در دوره ثبت‌نام می‌کند
                </Text>
              </View>
              <Switch
                value={notifications.courseEnrollments}
                onValueChange={(value) =>
                  setNotifications({
                    ...notifications,
                    courseEnrollments: value,
                  })
                }
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            <View style={styles.notificationItem}>
              <View>
                <Text style={styles.notificationTitle}>دریافت پرداخت</Text>
                <Text style={styles.notificationDesc}>
                  وقتی دانش‌آموزی پرداخت انجام می‌دهد
                </Text>
              </View>
              <Switch
                value={notifications.paymentNotifications}
                onValueChange={(value) =>
                  setNotifications({
                    ...notifications,
                    paymentNotifications: value,
                  })
                }
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>
          </View>
        </View>

        {/* Teacher Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ابزارهای معلم</Text>
          <View style={styles.menuGrid}>
            {teacherMenu.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon} size={24} color={Colors.primary} />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          {isEditing ? (
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>
                {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={20} color={Colors.danger} />
              <Text style={styles.logoutText}>خروج از حساب</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Subjects Selection Modal */}
      <Modal visible={showSubjectsModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>انتخاب دروس تدریس</Text>
              <TouchableOpacity onPress={() => setShowSubjectsModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              <View style={styles.modalGrid}>
                {allSubjects.map((subject) => (
                  <TouchableOpacity
                    key={subject.id}
                    style={[
                      styles.modalSubject,
                      formData.subjects.includes(subject.id) &&
                        styles.modalSubjectSelected,
                    ]}
                    onPress={() => handleToggleSubject(subject.id)}
                  >
                    <Text
                      style={[
                        styles.modalSubjectText,
                        formData.subjects.includes(subject.id) &&
                          styles.modalSubjectTextSelected,
                      ]}
                    >
                      {subject.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => setShowSubjectsModal(false)}
            >
              <Text style={styles.modalDoneButtonText}>تایید</Text>
            </TouchableOpacity>
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
   emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 16,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.danger,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  editImageBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileInfo: {
    flex: 1,
  },
  profileTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  profileTagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  ratingCount: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  editSection: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bioSection: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bioText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 24,
    textAlign: "justify",
  },
  section: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  formGroup: {
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
  educationList: {
    gap: 12,
  },
  educationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  educationText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  subjectsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  subjectChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  subjectText: {
    fontSize: 12,
    color: Colors.text,
  },
  availabilityCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  availabilityInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  availabilityText: {
    flex: 1,
  },
  availabilityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  availabilitySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  notificationsList: {
    gap: 16,
  },
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 2,
  },
  notificationDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  menuItem: {
    width: "48%",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  menuText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "500",
    textAlign: "center",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
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
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  modalList: {
    maxHeight: 400,
  },
  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    gap: 8,
  },
  modalSubject: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalSubjectSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalSubjectText: {
    fontSize: 14,
    color: Colors.text,
  },
  modalSubjectTextSelected: {
    color: "#fff",
  },
  modalDoneButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  modalDoneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
