import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardStats } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
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

// Student-specific interface
interface StudentProfileData {
  bio?: string;
  grade?: string;
  school?: string;
  birthDate?: string;
  parentContact?: string;
  address?: string;
  interests?: string[];
}

const defaultProfileImage = "https://i.pravatar.cc/300";

const studentGrades = [
  "اول ابتدایی",
  "دوم ابتدایی",
  "سوم ابتدایی",
  "چهارم ابتدایی",
  "پنجم ابتدایی",
  "ششم ابتدایی",
  "اول متوسطه",
  "دوم متوسطه",
  "سوم متوسطه",
  "چهارم متوسطه",
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(
    user?.profile_image || defaultProfileImage,
  );
  const [showGradeModal, setShowGradeModal] = useState(false);

  // Student-specific data
  const studentData: StudentProfileData = {
    bio: (user as any)?.bio || "دانش‌آموز علاقه‌مند به ریاضی و علوم",
    grade: (user as any)?.grade || "چهارم ابتدایی",
    school: (user as any)?.school || "دبستان نمونه دولتی فرهنگ",
    birthDate: (user as any)?.birthDate || "۱۳۹۵/۰۶/۱۵",
    parentContact: (user as any)?.parentContact || "۰۹۱۲۳۴۵۶۷۸۹",
    address: (user as any)?.address || "تهران، خیابان ولیعصر",
    interests: (user as any)?.interests || ["ریاضی", "علوم", "هنر", "ورزش"],
  };

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    ...studentData,
  });

  const [notifications, setNotifications] = useState({
    classUpdates: true,
    examReminders: true,
    homeworkDeadlines: true,
    teacherMessages: true,
    schoolEvents: true,
    assignmentGrades: true,
    systemAnnouncements: true,
  });

  const stats: DashboardStats = {
    total_courses: 12,
    enrolled_courses: 5,
    completed_courses: 2,
    total_hours: 48,
    certificates: 3,
    assignments_pending: 2,
    exams_upcoming: 1,
  };

  const menuItems = [
    {
      title: "دوره‌های من",
      icon: "book-outline",
      color: Colors.primary,
      onPress: () => router.push("/my-courses" as any),
    },
    {
      title: "گواهینامه‌ها",
      icon: "trophy-outline",
      color: Colors.warning,
      onPress: () => router.push("/certificates" as any),
    },
    {
      title: "تکالیف",
      icon: "document-text-outline",
      color: Colors.success,
      onPress: () => router.push("/(student)/assignments" as any),
    },
    {
      title: "آزمون‌ها",
      icon: "clipboard-outline",
      color: Colors.danger,
      onPress: () => router.push("/app/(public)/exams.tsx" as any),
    },
    {
      title: "تنظیمات",
      icon: "settings-outline",
      color: Colors.textSecondary,
      onPress: () => router.push("./" as any),
    },
    {
      title: "راهنما و پشتیبانی",
      icon: "help-circle-outline",
      color: Colors.info,
      onPress: () => router.push("/help" as any),
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      "خروج از حساب",
      "آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟",
      [
        { text: "لغو", style: "cancel" },
        {
          text: "خروج",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login");
          },
        },
      ],
    );
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
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        profile_image: profileImage,
        bio: formData.bio,
        grade: formData.grade,
        school: formData.school,
        birthDate: formData.birthDate,
        parentContact: formData.parentContact,
        address: formData.address,
        interests: formData.interests,
      };

      await updateProfile(updateData);
      Alert.alert("موفقیت", "پروفایل با موفقیت به‌روزرسانی شد.");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Profile update error:", error);
      Alert.alert("خطا", "در به‌روزرسانی پروفایل خطایی رخ داد.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(!isEditing);
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "مدیر سیستم";
      case "teacher":
        return "معلم";
      case "student":
        return "دانش‌آموز";
      default:
        return "کاربر";
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="پروفایل"
        rightComponent={
          <TouchableOpacity onPress={handleEditProfile}>
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
        <View style={styles.profileHeader}>
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
            {isEditing ? (
              <View style={styles.formGroup}>
                <Text style={styles.label}>نام و نام خانوادگی</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  placeholder="نام و نام خانوادگی"
                  textAlign="right"
                />
              </View>
            ) : (
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{user?.name}</Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleText}>
                    {getRoleText(user?.role || "student")}
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.profileEmail}>{user?.email}</Text>

            {!isEditing && (
              <Text style={styles.profileBio}>{studentData.bio}</Text>
            )}
          </View>

          {!isEditing && (
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={handleEditProfile}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color={Colors.primary}
              />
              <Text style={styles.editProfileText}>ویرایش پروفایل</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Edit Form Section */}
        {isEditing && (
          <View style={styles.editSection}>
            <Text style={styles.sectionTitle}>ویرایش اطلاعات دانش‌آموز</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>درباره من</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                placeholder="درباره خود بنویسید..."
                multiline
                numberOfLines={3}
                textAlign="right"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>پایه تحصیلی</Text>
              <TouchableOpacity
                style={styles.gradeSelector}
                onPress={() => setShowGradeModal(true)}
              >
                <Text
                  style={
                    formData.grade
                      ? styles.gradeSelected
                      : styles.gradePlaceholder
                  }
                >
                  {formData.grade || "انتخاب پایه تحصیلی"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>مدرسه</Text>
              <TextInput
                style={styles.input}
                value={formData.school}
                onChangeText={(text) =>
                  setFormData({ ...formData, school: text })
                }
                placeholder="نام مدرسه"
                textAlign="right"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>تاریخ تولد</Text>
              <TextInput
                style={styles.input}
                value={formData.birthDate}
                onChangeText={(text) =>
                  setFormData({ ...formData, birthDate: text })
                }
                placeholder="مثال: ۱۳۹۵/۰۶/۱۵"
                textAlign="right"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>تماس والدین</Text>
              <TextInput
                style={styles.input}
                value={formData.parentContact}
                onChangeText={(text) =>
                  setFormData({ ...formData, parentContact: text })
                }
                placeholder="شماره تماس والدین"
                keyboardType="phone-pad"
                textAlign="right"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>آدرس</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(text) =>
                  setFormData({ ...formData, address: text })
                }
                placeholder="آدرس محل سکونت"
                multiline
                numberOfLines={2}
                textAlign="right"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>علاقه‌مندی‌ها</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.interests?.join("، ")}
                onChangeText={(text) =>
                  setFormData({ ...formData, interests: text.split("، ") })
                }
                placeholder="علاقه‌مندی‌های خود را با کاما جدا کنید"
                multiline
                numberOfLines={2}
                textAlign="right"
              />
            </View>
          </View>
        )}

        {/* Bio Section (Non-edit mode) */}
        {!isEditing && (
          <View style={styles.bioSection}>
            <View style={styles.bioDetails}>
              <View style={styles.detailItem}>
                <Ionicons
                  name="school"
                  size={16}
                  color={Colors.textSecondary}
                />
                <Text style={styles.detailText}>
                  {studentData.grade} - {studentData.school}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons
                  name="calendar"
                  size={16}
                  color={Colors.textSecondary}
                />
                <Text style={styles.detailText}>
                  تاریخ تولد: {studentData.birthDate}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="call" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>
                  تماس والدین: {studentData.parentContact}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons
                  name="location"
                  size={16}
                  color={Colors.textSecondary}
                />
                <Text style={styles.detailText}>{studentData.address}</Text>
              </View>
              {studentData.interests && studentData.interests.length > 0 && (
                <View style={styles.detailItem}>
                  <Ionicons
                    name="heart"
                    size={16}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.detailText}>
                    علاقه‌مندی‌ها: {studentData.interests.join("، ")}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>آمار کلی</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: "rgba(59, 130, 246, 0.1)" },
                ]}
              >
                <Ionicons name="book" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.statValue}>{stats.enrolled_courses}</Text>
              <Text style={styles.statLabel}>دوره فعال</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: "rgba(16, 185, 129, 0.1)" },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={Colors.success}
                />
              </View>
              <Text style={styles.statValue}>{stats.completed_courses}</Text>
              <Text style={styles.statLabel}>تکمیل شده</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: "rgba(245, 158, 11, 0.1)" },
                ]}
              >
                <Ionicons name="time" size={20} color={Colors.warning} />
              </View>
              <Text style={styles.statValue}>{stats.total_hours}</Text>
              <Text style={styles.statLabel}>ساعت</Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: "rgba(139, 92, 246, 0.1)" },
                ]}
              >
                <Ionicons name="trophy" size={20} color={Colors.secondary} />
              </View>
              <Text style={styles.statValue}>{stats.certificates}</Text>
              <Text style={styles.statLabel}>گواهینامه</Text>
            </View>
          </View>
        </View>

        {/* Notifications Section */}
        {isEditing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تنظیمات اطلاع‌رسانی</Text>
            <View style={styles.notificationsList}>
              <View style={styles.notificationItem}>
                <View>
                  <Text style={styles.notificationTitle}>
                    به‌روزرسانی کلاس‌ها
                  </Text>
                  <Text style={styles.notificationDesc}>
                    اطلاع‌رسانی تغییرات کلاس
                  </Text>
                </View>
                <Switch
                  value={notifications.classUpdates}
                  onValueChange={(value) =>
                    setNotifications({ ...notifications, classUpdates: value })
                  }
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                />
              </View>

              <View style={styles.notificationItem}>
                <View>
                  <Text style={styles.notificationTitle}>یادآوری آزمون</Text>
                  <Text style={styles.notificationDesc}>
                    یادآوری آزمون‌های پیش رو
                  </Text>
                </View>
                <Switch
                  value={notifications.examReminders}
                  onValueChange={(value) =>
                    setNotifications({ ...notifications, examReminders: value })
                  }
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                />
              </View>

              <View style={styles.notificationItem}>
                <View>
                  <Text style={styles.notificationTitle}>مهلت تکالیف</Text>
                  <Text style={styles.notificationDesc}>
                    یادآوری زمان تحویل تکالیف
                  </Text>
                </View>
                <Switch
                  value={notifications.homeworkDeadlines}
                  onValueChange={(value) =>
                    setNotifications({
                      ...notifications,
                      homeworkDeadlines: value,
                    })
                  }
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                />
              </View>

              <View style={styles.notificationItem}>
                <View>
                  <Text style={styles.notificationTitle}>پیام‌های معلم</Text>
                  <Text style={styles.notificationDesc}>
                    دریافت پیام از معلمان
                  </Text>
                </View>
                <Switch
                  value={notifications.teacherMessages}
                  onValueChange={(value) =>
                    setNotifications({
                      ...notifications,
                      teacherMessages: value,
                    })
                  }
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                />
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>دسترسی سریع</Text>
          <View style={styles.menuGrid}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: `${item.color}10` },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={item.color}
                  />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pending Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اقدامات در انتظار</Text>
          <View style={styles.pendingItems}>
            {stats.assignments_pending > 0 && (
              <TouchableOpacity style={styles.pendingItem}>
                <View style={styles.pendingItemLeft}>
                  <View
                    style={[
                      styles.pendingIcon,
                      { backgroundColor: "rgba(239, 68, 68, 0.1)" },
                    ]}
                  >
                    <Ionicons
                      name="document-text"
                      size={20}
                      color={Colors.danger}
                    />
                  </View>
                  <View>
                    <Text style={styles.pendingTitle}>
                      {stats.assignments_pending} تکلیف
                    </Text>
                    <Text style={styles.pendingSubtitle}>
                      تکالیف در انتظار تحویل
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            )}

            {stats.exams_upcoming > 0 && (
              <TouchableOpacity style={styles.pendingItem}>
                <View style={styles.pendingItemLeft}>
                  <View
                    style={[
                      styles.pendingIcon,
                      { backgroundColor: "rgba(59, 130, 246, 0.1)" },
                    ]}
                  >
                    <Ionicons
                      name="clipboard"
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <View>
                    <Text style={styles.pendingTitle}>
                      {stats.exams_upcoming} آزمون
                    </Text>
                    <Text style={styles.pendingSubtitle}>آزمون‌های پیش رو</Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            )}
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
              <Ionicons
                name="log-out-outline"
                size={20}
                color={Colors.danger}
              />
              <Text style={styles.logoutText}>خروج از حساب</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Grade Selection Modal */}
      <Modal
        visible={showGradeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>انتخاب پایه تحصیلی</Text>
              <TouchableOpacity onPress={() => setShowGradeModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {studentGrades.map((grade, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.gradeItem}
                  onPress={() => {
                    setFormData({ ...formData, grade });
                    setShowGradeModal(false);
                  }}
                >
                  <Text style={styles.gradeItemText}>{grade}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: "center",
    padding: 24,
    backgroundColor: Colors.card,
    marginBottom: 24,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: Colors.card,
  },
  editImageBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.card,
  },
  profileInfo: {
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  roleBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "500",
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 15,
    color: Colors.text,
    textAlign: "center",
    lineHeight: 22,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
  },
  editProfileText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  editSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    marginBottom: 24,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  bioSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    marginBottom: 24,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  bioDetails: {
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  menuItem: {
    width: "30%",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  menuText: {
    fontSize: 12,
    color: Colors.text,
    textAlign: "center",
  },
  pendingItems: {
    gap: 12,
  },
  pendingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pendingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  pendingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 2,
  },
  pendingSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
    textAlign: "right",
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
    minHeight: 80,
    textAlignVertical: "top",
  },
  gradeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
  },
  gradePlaceholder: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "right",
  },
  gradeSelected: {
    fontSize: 16,
    color: Colors.text,
    textAlign: "right",
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
    gap: 8,
    padding: 16,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  logoutText: {
    fontSize: 16,
    color: Colors.danger,
    fontWeight: "500",
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
    maxHeight: "60%",
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
    maxHeight: 300,
  },
  gradeItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  gradeItemText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: "right",
  },
});
