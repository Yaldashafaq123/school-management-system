import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
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
import { Header } from "../../../components/Header";
import { Colors } from "../../../constants/Colors";

// Parent-specific interface
interface ParentProfileData {
  bio?: string;
  occupation?: string;
  children?: string[];
  address?: string;
  emergencyContact?: string;
  relationship?: string;
  verified?: boolean;
  subscription?: {
    plan: string;
    status: "active" | "expired" | "cancelled";
    expiryDate?: string;
  };
}

const defaultProfileImage =
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80";

const childrenGrades = [
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

export default function ParentProfile() {
  const router = useRouter();
  const { user, updateProfile, logout } = useAuth();
  const [profileImage, setProfileImage] = useState(
    user?.profile_image || defaultProfileImage,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showChildrenModal, setShowChildrenModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildGrade, setNewChildGrade] = useState("");

  // Parent-specific data
  const parentData: ParentProfileData = {
    bio:
      (user as any)?.bio ||
      "والدین دو دانش‌آموز فعال در سیستم آموزشی. متعهد به همراهی در تحصیل و پیشرفت فرزندانم.",
    occupation: (user as any)?.occupation || "مهندس نرم‌افزار",
    children: (user as any)?.children || ["سارا احمدی", "علی احمدی"],
    address: (user as any)?.address || "تهران، خیابان ولیعصر",
    emergencyContact: (user as any)?.emergencyContact || "09123456789",
    relationship: (user as any)?.relationship || "مادر",
    verified: (user as any)?.verified ?? true,
    subscription: (user as any)?.subscription || {
      plan: "پرمیوم",
      status: "active",
      expiryDate: "۱۴۰۴/۰۶/۳۰",
    },
  };

  const [formData, setFormData] = useState({
    name: user?.name || "فاطمه احمدی",
    email: user?.email || "fateme.ahmadi@example.com",
    phone: user?.phone || "09123456789",
    ...parentData,
  });

  const [notifications, setNotifications] = useState({
    childAttendance: true,
    examResults: true,
    teacherMessages: true,
    homeworkReminders: true,
    schoolEvents: true,
    paymentReminders: true,
    systemAnnouncements: true,
    marketingEmails: false,
  });

  const [children, setChildren] = useState<
    Array<{ name: string; grade: string }>
  >([
    { name: "سارا احمدی", grade: "چهارم ابتدایی" },
    { name: "علی احمدی", grade: "دوم ابتدایی" },
  ]);

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
        occupation: formData.occupation,
        children: children.map((child) => `${child.name} (${child.grade})`),
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        relationship: formData.relationship,
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

  const handleLogout = () => {
    Alert.alert("خروج از حساب", "آیا مطمئن هستید که می‌خواهید خارج شوید؟", [
      { text: "لغو", style: "cancel" },
      {
        text: "خروج",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            await new Promise((resolve) => setTimeout(resolve, 100));
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("خطا", "در خروج از حساب خطایی رخ داد.");
          }
        },
      },
    ]);
  };

  const handleAddChild = () => {
    if (!newChildName.trim() || !newChildGrade.trim()) {
      Alert.alert("خطا", "لطفا نام فرزند و پایه تحصیلی را وارد کنید.");
      return;
    }

    setChildren([...children, { name: newChildName, grade: newChildGrade }]);
    setNewChildName("");
    setNewChildGrade("");
    setShowChildrenModal(false);
    setShowGradeModal(false);
  };

  const handleRemoveChild = (index: number) => {
    const newChildren = [...children];
    newChildren.splice(index, 1);
    setChildren(newChildren);
  };

  const stats = [
    {
      label: "فرزندان",
      value: children.length,
      icon: "people" as const,
    },
    {
      label: "پیام‌های جدید",
      value: 3,
      icon: "chatbubble" as const,
    },
    {
      label: "تکالیف",
      value: 8,
      icon: "book" as const,
    },
    {
      label: "حضور و غیاب",
      value: "۹۷٪",
      icon: "calendar" as const,
    },
  ];

  const parentMenu = [
    {
      title: "پروفایل فرزندان",
      icon: "people" as const,
      onPress: () => router.push("/(parent)/child-switch"),
    },
    {
      title: "گزارش پیشرفت",
      icon: "stats-chart" as const,
      onPress: () => router.push("/(parent)/(tabs)/progress"),
    },
    {
      title: "پیام‌ها",
      icon: "chatbubbles" as const,
      onPress: () => router.push("./"),
    },
    {
      title: "حسابداری",
      icon: "wallet" as const,
      onPress: () => router.push("/(parent)/(tabs)/fees"),
    },
    {
      title: "تقویم مدرسه",
      icon: "calendar" as const,
      onPress: () => router.push("/(parent)/events"),
    },
    {
      title: "تنظیمات",
      icon: "settings" as const,
      onPress: () => router.push("/(public)/settings/index"),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="پروفایل والدین"
        showBack
        rightComponent={
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Ionicons
              name={isEditing ? "close" : "create"}
              size={24}
              color={Colors.text}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={["#7c3aed", "#8b5cf6"]}
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
              <Text style={styles.profileName}>{formData.name}</Text>
              {formData.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.verifiedText}>تایید شده</Text>
                </View>
              )}
            </View>

            <Text style={styles.profileTagline}>
              {formData.relationship} {children.length} فرزند
            </Text>

            <View style={styles.subscriptionBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#fff" />
              <Text style={styles.subscriptionText}>
                {formData.subscription?.plan || "پرمیوم"}
              </Text>
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

        {/* Edit Form */}
        {isEditing ? (
          <View style={styles.editSection}>
            <Text style={styles.sectionTitle}>ویرایش اطلاعات</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>نام و نام خانوادگی</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="نام و نام خانوادگی"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>نسبت</Text>
              <TextInput
                style={styles.input}
                value={formData.relationship}
                onChangeText={(text) =>
                  setFormData({ ...formData, relationship: text })
                }
                placeholder="مادر، پدر، ..."
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>درباره من</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                placeholder="درباره خود بنویسید..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>شغل</Text>
              <TextInput
                style={styles.input}
                value={formData.occupation}
                onChangeText={(text) =>
                  setFormData({ ...formData, occupation: text })
                }
                placeholder="شغل"
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
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>تماس اضطراری</Text>
              <TextInput
                style={styles.input}
                value={formData.emergencyContact}
                onChangeText={(text) =>
                  setFormData({ ...formData, emergencyContact: text })
                }
                placeholder="شماره تماس اضطراری"
                keyboardType="phone-pad"
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
              />
            </View>
          </View>
        ) : (
          <View style={styles.bioSection}>
            <Text style={styles.bioText}>{formData.bio}</Text>
            <View style={styles.bioDetails}>
              <View style={styles.detailItem}>
                <Ionicons
                  name="briefcase"
                  size={16}
                  color={Colors.textSecondary}
                />
                <Text style={styles.detailText}>{formData.occupation}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="home" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{formData.address}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="call" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>
                  {formData.emergencyContact}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Children Management */}
        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>فرزندان من</Text>
            {isEditing && (
              <TouchableOpacity onPress={() => setShowChildrenModal(true)}>
                <Ionicons name="add-circle" size={24} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.childrenList}>
            {children.map((child, index) => (
              <View key={index} style={styles.childCard}>
                <View style={styles.childInfo}>
                  <View style={styles.childAvatar}>
                    <Ionicons name="person" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.childDetails}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childGrade}>{child.grade}</Text>
                  </View>
                </View>
                <View style={styles.childActions}>
                  <TouchableOpacity
                    style={styles.childActionButton}
                    onPress={() => router.push(`/(parent)/child-switch`)}
                  >
                    <Ionicons
                      name="eye"
                      size={18}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                  {isEditing && (
                    <TouchableOpacity
                      style={styles.childActionButton}
                      onPress={() => handleRemoveChild(index)}
                    >
                      <Ionicons name="trash" size={18} color={Colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View> */}

        {/* Subscription Status */}
        <View style={styles.section}>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionInfo}>
              <Ionicons
                name="shield-checkmark"
                size={24}
                color={Colors.success}
              />
              <View style={styles.subscriptionDetails}>
                <Text style={styles.subscriptionTitle}>
                  اشتراک {formData.subscription?.plan}
                </Text>
                <Text style={styles.subscriptionStatus}>
                  وضعیت:{" "}
                  <Text
                    style={[
                      styles.statusText,
                      formData.subscription?.status === "active"
                        ? styles.statusActive
                        : styles.statusExpired,
                    ]}
                  >
                    {formData.subscription?.status === "active"
                      ? "فعال"
                      : "منقضی"}
                  </Text>
                </Text>
                {formData.subscription?.expiryDate && (
                  <Text style={styles.subscriptionExpiry}>
                    تاریخ انقضا: {formData.subscription.expiryDate}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => router.push("/(parent)/(tabs)/fees")}
            >
              <Text style={styles.upgradeButtonText}>
                {formData.subscription?.status === "active"
                  ? "تمدید"
                  : "خرید اشتراک"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تنظیمات اطلاع‌رسانی</Text>
          <View style={styles.notificationsList}>
            <View style={styles.notificationItem}>
              <View>
                <Text style={styles.notificationTitle}>
                  حضور و غیاب فرزندان
                </Text>
                <Text style={styles.notificationDesc}>
                  اطلاع‌رسانی روزانه حضور و غیاب
                </Text>
              </View>
              <Switch
                value={notifications.childAttendance}
                onValueChange={(value) =>
                  setNotifications({ ...notifications, childAttendance: value })
                }
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            <View style={styles.notificationItem}>
              <View>
                <Text style={styles.notificationTitle}>نتایج امتحانات</Text>
                <Text style={styles.notificationDesc}>
                  اطلاع‌رسانی نتایج امتحانات
                </Text>
              </View>
              <Switch
                value={notifications.examResults}
                onValueChange={(value) =>
                  setNotifications({ ...notifications, examResults: value })
                }
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            <View style={styles.notificationItem}>
              <View>
                <Text style={styles.notificationTitle}>پیام‌های معلمان</Text>
                <Text style={styles.notificationDesc}>
                  دریافت پیام از معلمان
                </Text>
              </View>
              <Switch
                value={notifications.teacherMessages}
                onValueChange={(value) =>
                  setNotifications({ ...notifications, teacherMessages: value })
                }
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            <View style={styles.notificationItem}>
              <View>
                <Text style={styles.notificationTitle}>یادآوری تکالیف</Text>
                <Text style={styles.notificationDesc}>
                  یادآوری زمان تحویل تکالیف
                </Text>
              </View>
              <Switch
                value={notifications.homeworkReminders}
                onValueChange={(value) =>
                  setNotifications({
                    ...notifications,
                    homeworkReminders: value,
                  })
                }
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>
          </View>
        </View>

        {/* Parent Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ابزارهای والدین</Text>
          <View style={styles.menuGrid}>
            {parentMenu.map((item, index) => (
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

        {/* Add Child Modal */}
        <Modal
          visible={showChildrenModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>افزودن فرزند</Text>
                <TouchableOpacity onPress={() => setShowChildrenModal(false)}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>نام فرزند</Text>
                <TextInput
                  style={styles.modalInput}
                  value={newChildName}
                  onChangeText={setNewChildName}
                  placeholder="نام و نام خانوادگی فرزند"
                />

                <Text style={styles.modalLabel}>پایه تحصیلی</Text>
                <TouchableOpacity
                  style={styles.gradeSelector}
                  onPress={() => setShowGradeModal(true)}
                >
                  <Text
                    style={
                      newChildGrade
                        ? styles.gradeSelected
                        : styles.gradePlaceholder
                    }
                  >
                    {newChildGrade || "انتخاب پایه تحصیلی"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleAddChild}
                disabled={!newChildName || !newChildGrade}
              >
                <Text style={styles.modalAddButtonText}>افزودن فرزند</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Grade Selection Modal */}
        <Modal
          visible={showGradeModal}
          animationType="slide"
          transparent={true}
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
                {childrenGrades.map((grade, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.gradeItem}
                    onPress={() => {
                      setNewChildGrade(grade);
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
  subscriptionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    gap: 4,
  },
  subscriptionText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
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
    marginBottom: 16,
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
    minHeight: 80,
    textAlignVertical: "top",
  },
  childrenList: {
    gap: 12,
  },
  childCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  childInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  childGrade: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  childActions: {
    flexDirection: "row",
    gap: 8,
  },
  childActionButton: {
    padding: 6,
  },
  subscriptionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subscriptionInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  subscriptionDetails: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  subscriptionStatus: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  statusText: {
    fontWeight: "bold",
  },
  statusActive: {
    color: Colors.success,
  },
  statusExpired: {
    color: Colors.danger,
  },
  subscriptionExpiry: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
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
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    textAlign: "right",
    marginBottom: 16,
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
    marginBottom: 20,
  },
  gradePlaceholder: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  gradeSelected: {
    fontSize: 16,
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
  modalAddButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  modalAddButtonDisabled: {
    opacity: 0.5,
  },
  modalAddButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
