// app/(tabs)/teacher/profile.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
import { Header } from "../../../components/Header";
import { Colors } from "../../../constants/Colors";
import { apiRequest, BASE_URL } from "../../../src/config/api";

// Teacher profile data matching your Prisma schema
interface TeacherProfileData {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  profileImage?: string;
  bio?: string;
  experience?: string;
  hourlyRate?: number;
  certification?: string;
  availability?: boolean;
  rating?: number;
  isActive?: boolean;
  joiningDate?: string;
  educations?: TeacherEducation[];
  subjects?: TeacherSubject[];
  classes?: ClassInfo[];
}

interface TeacherEducation {
  id: number;
  title: string;
}

interface TeacherSubject {
  id: number;
  subjectId: number;
  subject: {
    id: number;
    name: string;
  };
}

interface ClassInfo {
  id: number;
  name: string;
  section?: string;
}

// Default image - use a valid URL or local asset
const defaultProfileImage =
  "https://via.placeholder.com/200/3B82F6/FFFFFF?text=معلم";

const teachingSubjects = [
  "ریاضی",
  "فیزیک",
  "شیمی",
  "ادبیات فارسی",
  "زبان انگلیسی",
  "علوم تجربی",
  "تاریخ",
  "جغرافیا",
  "دینی",
  "هنر",
  "ورزش",
  "کامپیوتر",
  "موسیقی",
  "زبان عربی",
  "فلسفه",
  "روانشناسی",
];

export default function TeacherProfile() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // IMPORTANT: Initialize with user's profile image or default
  const [profileImage, setProfileImage] = useState(
    user?.profile_image || defaultProfileImage,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [showSubjectsModal, setShowSubjectsModal] = useState(false);
  const [teacherProfile, setTeacherProfile] =
    useState<TeacherProfileData | null>(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: "",
    education: [] as string[],
    subjects: [] as string[],
    experience: "",
    hourlyRate: 0,
    certification: "",
    availability: true,
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

  // Fetch teacher profile data
  const fetchTeacherProfile = useCallback(async () => {
    try {
      setFetchLoading(true);
      const response = await apiRequest("/teacher/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(
        "Teacher profile response:",
        JSON.stringify(response, null, 2),
      );

      const profileData = response.data || response;
      setTeacherProfile(profileData);

      // Initialize form data with fetched profile
      setFormData({
        fullName: profileData.fullName || user?.fullName || "",
        email: profileData.email || user?.email || "",
        phone: profileData.phone || user?.phone || "",
        bio: profileData.bio || "",
        education:
          profileData.educations?.map((e: TeacherEducation) => e.title) || [],
        subjects:
          profileData.subjects?.map((s: TeacherSubject) => s.subject.name) ||
          [],
        experience: profileData.experience || "",
        hourlyRate: profileData.hourlyRate || 0,
        certification: profileData.certification || "",
        availability: profileData.availability ?? true,
      });

      // CRITICAL: Update profile image from response
      if (profileData.profileImage) {
        // Check if it's a full URL or relative path
        let imageUrl = profileData.profileImage;
        if (!imageUrl.startsWith("http")) {
          // If it's a relative path, prepend BASE_URL
          imageUrl = `${BASE_URL}${imageUrl}`;
        }
        console.log("Setting profile image to:", imageUrl);
        setProfileImage(imageUrl);
      } else if (user?.profile_image) {
        // Fallback to user profile image from auth context
        let imageUrl = user.profile_image;
        if (!imageUrl.startsWith("http")) {
          imageUrl = `${BASE_URL}${imageUrl}`;
        }
        setProfileImage(imageUrl);
      }
    } catch (error: any) {
      console.error("Error fetching teacher profile:", error);
      // Fallback to user data from auth context
      setTeacherProfile({
        id: user?.id || 0,
        userId: user?.id || 0,
        fullName: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        profileImage: user?.profile_image,
        bio: "",
        experience: "۱۲ سال",
        hourlyRate: 60000,
        certification: "استاد",
        availability: true,
        rating: 4.9,
        isActive: true,
      });

      // Set fallback image
      if (user?.profile_image) {
        let imageUrl = user.profile_image;
        if (!imageUrl.startsWith("http")) {
          imageUrl = `${BASE_URL}${imageUrl}`;
        }
        setProfileImage(imageUrl);
      }
    } finally {
      setFetchLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (token) {
      fetchTeacherProfile();
    }
  }, [token, fetchTeacherProfile]);

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
      // Set image locally first for immediate feedback
      setProfileImage(result.assets[0].uri);
      // Upload to server
      await uploadProfileImage(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    try {
      setLoading(true);

      const formData = new FormData();
      const filename = imageUri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("profile_image", {
        uri: imageUri,
        type: type,
        name: filename,
      } as any);

      console.log("Uploading to:", `${BASE_URL}/teacher/profile/image`);

      const response = await fetch(`${BASE_URL}/teacher/profile/image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const result = await response.json();
      console.log("Upload response:", result);

      if (response.ok) {
        Alert.alert("موفقیت", "عکس پروفایل با موفقیت به‌روزرسانی شد.");

        // CRITICAL: Update image with the returned URL
        if (result.image) {
          let imageUrl = result.image;
          if (!imageUrl.startsWith("http")) {
            imageUrl = `${BASE_URL}${imageUrl}`;
          }
          console.log("Setting profile image to uploaded URL:", imageUrl);
          setProfileImage(imageUrl);
        } else if (result.data?.profileImage) {
          let imageUrl = result.data.profileImage;
          if (!imageUrl.startsWith("http")) {
            imageUrl = `${BASE_URL}${imageUrl}`;
          }
          setProfileImage(imageUrl);
        }

        // Refresh profile to get updated data
        await fetchTeacherProfile();
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("خطا", "در آپلود عکس خطایی رخ داد. لطفا مجددا تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        education: formData.education,
        subjects: formData.subjects,
        experience: formData.experience,
        hourlyRate: formData.hourlyRate,
        certification: formData.certification,
        availability: formData.availability,
      };

      const response = await apiRequest("/teacher/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      console.log("Profile update response:", response);

      if (response.success) {
        Alert.alert("موفقیت", "پروفایل با موفقیت به‌روزرسانی شد.");
        setIsEditing(false);
        await fetchTeacherProfile();
      } else {
        throw new Error(response.message || "Update failed");
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      Alert.alert(
        "خطا",
        error.message || "در به‌روزرسانی پروفایل خطایی رخ داد.",
      );
    } finally {
      setLoading(false);
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
      [
        { text: "لغو", style: "cancel" },
        {
          text: "افزودن",
          onPress: (education?: string) => {
            if (education && education.trim()) {
              setFormData({
                ...formData,
                education: [...(formData.education || []), education.trim()],
              });
            }
          },
        },
      ],
      "plain-text",
    );
  };

  const handleRemoveEducation = (index: number) => {
    const newEducation = [...(formData.education || [])];
    newEducation.splice(index, 1);
    setFormData({ ...formData, education: newEducation });
  };

  const handleToggleSubject = (subject: string) => {
    const currentSubjects = formData.subjects || [];
    if (currentSubjects.includes(subject)) {
      setFormData({
        ...formData,
        subjects: currentSubjects.filter((s) => s !== subject),
      });
    } else {
      setFormData({
        ...formData,
        subjects: [...currentSubjects, subject],
      });
    }
  };

  const stats = [
    {
      label: "تعداد دوره‌ها",
      value: teacherProfile?.classes?.length || 0,
      icon: "book" as const,
    },
    {
      label: "دانش‌آموزان",
      value: 0,
      icon: "people" as const,
    },
    {
      label: "ساعات تدریس",
      value: 0,
      icon: "time" as const,
    },
    {
      label: "امتیاز",
      value: teacherProfile?.rating || 0,
      icon: "star" as const,
    },
  ];

  const teacherMenu = [
    {
      title: "تقویم تدریس",
      icon: "calendar" as const,
      onPress: () =>
        Alert.alert("در حال توسعه", "این بخش به زودی اضافه خواهد شد"),
    },
    {
      title: "مدارک و گواهینامه‌ها",
      icon: "document" as const,
      onPress: () =>
        Alert.alert("در حال توسعه", "این بخش به زودی اضافه خواهد شد"),
    },
    {
      title: "تنظیمات پیشرفته",
      icon: "settings" as const,
      onPress: () =>
        Alert.alert("در حال توسعه", "این بخش به زودی اضافه خواهد شد"),
    },
  ];

  if (fetchLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="پروفایل معلم" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال دریافت اطلاعات...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="پروفایل معلم"
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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                source={{
                  uri: profileImage || defaultProfileImage,
                }}
                style={styles.profileImage}
                onError={(e) => {
                  console.error("Image load error:", e.nativeEvent.error);
                  // Fallback to default if image fails to load
                  setProfileImage(defaultProfileImage);
                }}
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
              <Text style={styles.profileName}>
                {formData.fullName || teacherProfile?.fullName || "معلم"}
              </Text>
              {user?.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.verifiedText}>تایید شده</Text>
                </View>
              )}
            </View>

            <Text style={styles.profileTagline}>
              معلم {formData.experience || "۰"} سال سابقه
            </Text>

            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={styles.ratingText}>
                {teacherProfile?.rating || 0}
              </Text>
              <Text style={styles.ratingCount}>(۰ نظر)</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Ionicons name={stat.icon} size={20} color={Colors.primary} />
              <Text style={styles.statValue}>
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString("fa-IR")
                  : stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Edit Form */}
        {isEditing ? (
          <View style={styles.editSection}>
            <Text style={styles.sectionTitle}>ویرایش اطلاعات</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>نام و نام خانوادگی</Text>
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) =>
                  setFormData({ ...formData, fullName: text })
                }
                placeholder="نام و نام خانوادگی"
                textAlign="right"
              />
            </View>

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
              <Text style={styles.label}>ایمیل</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                placeholder="ایمیل"
                keyboardType="email-address"
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
              <Text style={styles.label}>سابقه تدریس</Text>
              <TextInput
                style={styles.input}
                value={formData.experience}
                onChangeText={(text) =>
                  setFormData({ ...formData, experience: text })
                }
                placeholder="مثال: ۱۲ سال"
                textAlign="right"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>گواهینامه</Text>
              <TextInput
                style={styles.input}
                value={formData.certification}
                onChangeText={(text) =>
                  setFormData({ ...formData, certification: text })
                }
                placeholder="مدرک یا گواهینامه تدریس"
                textAlign="right"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>نرخ ساعتی (افغانی)</Text>
              <TextInput
                style={styles.input}
                value={String(formData.hourlyRate)}
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  setFormData({ ...formData, hourlyRate: num });
                }}
                placeholder="مثال: ۵۰۰۰۰"
                keyboardType="numeric"
                textAlign="right"
              />
            </View>
          </View>
        ) : (
          <View style={styles.bioSection}>
            <Text style={styles.bioText}>
              {formData.bio || "معلم . دارای مدرک از دانشگاه ."}
            </Text>
            {formData.certification && (
              <Text style={styles.bioDetail}>
                گواهینامه: {formData.certification}
              </Text>
            )}
            {formData.hourlyRate > 0 && (
              <Text style={styles.bioDetail}>
                نرخ ساعتی: {formData.hourlyRate.toLocaleString()} افغانی
              </Text>
            )}
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
            {(formData.education || []).length > 0 ? (
              (formData.education || []).map((edu: string, index: number) => (
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
              ))
            ) : (
              <Text style={styles.emptyText}>مدرک تحصیلی ثبت نشده است</Text>
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
            {(formData.subjects || []).length > 0 ? (
              (formData.subjects || []).map(
                (subject: string, index: number) => (
                  <View key={index} style={styles.subjectChip}>
                    <Text style={styles.subjectText}>{subject}</Text>
                    {isEditing && (
                      <TouchableOpacity
                        onPress={() => handleToggleSubject(subject)}
                      >
                        <Ionicons
                          name="close"
                          size={14}
                          color={Colors.textSecondary}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                ),
              )
            ) : (
              <Text style={styles.emptyText}>درسی انتخاب نشده است</Text>
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
                  وضعیت تدریس: {formData.availability ? "آماده تدریس" : "مشغول"}
                </Text>
                <Text style={styles.availabilitySubtitle}>
                  {formData.availability
                    ? "دانش‌آموزان می‌توانند برای شما درخواست ثبت کنند"
                    : "در حال حاضر ظرفیت تدریس ندارید"}
                </Text>
              </View>
            </View>
            {isEditing && (
              <Switch
                value={formData.availability || false}
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
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={styles.saveButtonText}>
                {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
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

        {/* Subjects Selection Modal */}
        <Modal
          visible={showSubjectsModal}
          animationType="slide"
          transparent={true}
        >
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
                  {teachingSubjects.map((subject) => (
                    <TouchableOpacity
                      key={subject}
                      style={[
                        styles.modalSubject,
                        (formData.subjects || []).includes(subject) &&
                          styles.modalSubjectSelected,
                      ]}
                      onPress={() => handleToggleSubject(subject)}
                    >
                      <Text
                        style={[
                          styles.modalSubjectText,
                          (formData.subjects || []).includes(subject) &&
                            styles.modalSubjectTextSelected,
                        ]}
                      >
                        {subject}
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
      </ScrollView>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    padding: 16,
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
    backgroundColor: "#1e40af", // Fallback background color
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
    marginBottom: 4,
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
    marginBottom: 8,
  },
  bioDetail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
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
