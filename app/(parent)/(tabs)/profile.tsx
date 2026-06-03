// app/(parent)/profile.tsx
import { useAuth } from "@/contexts/AuthContext";
import { BASE_URL } from "@/src/config/api";
import {
  Child,
  parentProfileApi,
  ParentProfile as ParentProfileType,
} from "@/src/config/parentProfileApi";
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
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/Colors";

export default function ParentProfile() {
  const router = useRouter();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<ParentProfileType | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showChildrenModal, setShowChildrenModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildGrade, setNewChildGrade] = useState("");
  const [localChildren, setLocalChildren] = useState<Child[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    bio: "",
    occupation: "",
    address: "",
    emergencyContact: "",
    relationship: "",
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading profile...");
      const response = await parentProfileApi.getProfile();
      console.log("Profile response:", response);

      if (response.success && response.data) {
        setProfile(response.data);
        setProfileImage(response.data.profileImage || null);
        setLocalChildren(response.data.children || []);
        setFormData({
          fullName: response.data.fullName || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          bio: response.data.bio || "",
          occupation: response.data.occupation || "",
          address: response.data.address || "",
          emergencyContact: response.data.emergencyContact || "",
          relationship: response.data.relationship || "والدین",
        });
        console.log("Children loaded:", response.data.children?.length);
      } else {
        setError(response.message || "خطا در دریافت اطلاعات");
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      setError(error.message || "خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
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
      try {
        const formData = new FormData();
        const filename = result.assets[0].uri.split("/").pop() || "profile.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("profile_image", {
          uri: result.assets[0].uri,
          type: type,
          name: filename,
        } as any);

        const response = await parentProfileApi.uploadProfileImage(formData);
        if (response.success) {
          Alert.alert("موفقیت", "عکس پروفایل با موفقیت به‌روزرسانی شد");
          loadProfile();
        } else {
          Alert.alert("خطا", response.message);
        }
      } catch (error) {
        Alert.alert("خطا", "آپلود عکس با مشکل مواجه شد");
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        fullName: formData.fullName,
        phone: formData.phone,
        bio: formData.bio,
        occupation: formData.occupation,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        relationship: formData.relationship,
      };

      const response = await parentProfileApi.updateProfile(updateData);
      if (response.success) {
        Alert.alert("موفقیت", response.message);
        setIsEditing(false);
        loadProfile();
      } else {
        Alert.alert("خطا", response.message);
      }
    } catch (error: any) {
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

  const handleAddChild = () => {
    if (!newChildName.trim() || !newChildGrade.trim()) {
      Alert.alert("خطا", "لطفا نام فرزند و پایه تحصیلی را وارد کنید.");
      return;
    }

    setLocalChildren([
      ...localChildren,
      {
        id: Date.now(),
        name: newChildName,
        grade: newChildGrade,
        classId: 0,
        attendanceRate: 0,
      },
    ]);
    setNewChildName("");
    setNewChildGrade("");
    setShowChildrenModal(false);
    setShowGradeModal(false);
  };

  const getImageUrl = (
    imagePath: string | null | undefined,
  ): string | undefined => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/uploads")) return `${BASE_URL}${imagePath}`;
    return imagePath;
  };

  const stats = [
    {
      label: "فرزندان",
      value: profile?.stats?.childrenCount || 0,
      icon: "people" as const,
    },
    {
      label: "پیام‌های جدید",
      value: profile?.stats?.unreadMessages || 0,
      icon: "chatbubble" as const,
    },
    {
      label: "فعالیت",
      value: profile?.stats?.pendingAssignments || 0,
      icon: "book" as const,
    },
    {
      label: "حضور و غیاب",
      value: `${profile?.stats?.attendanceRate || 0}٪`,
      icon: "calendar" as const,
    },
  ];

  const parentMenu = [
    {
      title: "پروفایل فرزندان",
      icon: "people" as const,
      onPress: () => router.push("/(parent)/child-switch" as any),
    },
    {
      title: "گزارش پیشرفت",
      icon: "stats-chart" as const,
      onPress: () => router.push("/(parent)/progress" as any),
    },
    {
      title: "پیام‌ها",
      icon: "chatbubbles" as const,
      onPress: () => router.push("/(public)/info" as any),
    },
    {
      title: "حسابداری",
      icon: "wallet" as const,
      onPress: () => router.push("/(parent)/fees" as any),
    },
    {
      title: "تقویم مکتب",
      icon: "calendar" as const,
      onPress: () => router.push("/(parent)/events" as any),
    },
    {
      title: "تنظیمات",
      icon: "settings" as const,
      onPress: () => router.push("/(parent)/settings" as any),
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>تلاش مجدد</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Profile Header */}
        <LinearGradient
          colors={["#7c3aed", "#8b5cf6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeader}
        >
          <TouchableOpacity onPress={isEditing ? pickImage : undefined}>
            <View style={styles.profileImageContainer}>
              {profileImage ? (
                <Image
                  source={{ uri: getImageUrl(profileImage) }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={[styles.profileImage, styles.placeholderImage]}>
                  <Ionicons name="person" size={50} color="#fff" />
                </View>
              )}
              {isEditing && (
                <View style={styles.editImageBadge}>
                  <Ionicons name="camera" size={18} color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <View style={styles.profileTitle}>
              <Text style={styles.profileName}>
                {formData.fullName || "والد"}
              </Text>
              {profile?.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                  <Text style={styles.verifiedText}>تایید شده</Text>
                </View>
              )}
            </View>

            <Text style={styles.profileTagline}>
              {formData.relationship || "والد"} {localChildren.length} فرزند
            </Text>

            <View style={styles.subscriptionBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#fff" />
              <Text style={styles.subscriptionText}>
                {profile?.subscription?.plan || "پایه"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <Ionicons name={stat.icon} size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Contact Info (Always Visible) */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>اطلاعات تماس</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactRow}>
              <Ionicons
                name="call-outline"
                size={18}
                color={Colors.textSecondary}
              />
              <Text style={styles.contactText}>
                {formData.phone || "شماره تماس ثبت نشده"}
              </Text>
            </View>
            <View style={styles.contactRow}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={Colors.textSecondary}
              />
              <Text style={styles.contactText}>{formData.email}</Text>
            </View>
            {formData.emergencyContact && (
              <View style={styles.contactRow}>
                <Ionicons
                  name="warning-outline"
                  size={18}
                  color={Colors.danger}
                />
                <Text style={styles.contactText}>
                  اضطراری: {formData.emergencyContact}
                </Text>
              </View>
            )}
          </View>
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
              <Text style={styles.label}>نسبت (مادر، پدر، ...)</Text>
              <TextInput
                style={styles.input}
                value={formData.relationship}
                onChangeText={(text) =>
                  setFormData({ ...formData, relationship: text })
                }
                placeholder="نسبت با فرزند"
                textAlign="right"
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
                textAlign="right"
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
              <Text style={styles.label}>تماس اضطراری</Text>
              <TextInput
                style={styles.input}
                value={formData.emergencyContact}
                onChangeText={(text) =>
                  setFormData({ ...formData, emergencyContact: text })
                }
                placeholder="شماره تماس اضطراری"
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
          </View>
        ) : (
          <View style={styles.bioSection}>
            <Text style={styles.bioText}>
              {formData.bio || "درباره خود چیزی بنویسید..."}
            </Text>
            <View style={styles.bioDetails}>
              {formData.occupation ? (
                <View style={styles.detailItem}>
                  <Ionicons
                    name="briefcase"
                    size={16}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.detailText}>{formData.occupation}</Text>
                </View>
              ) : null}
              {formData.address ? (
                <View style={styles.detailItem}>
                  <Ionicons
                    name="home"
                    size={16}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.detailText}>{formData.address}</Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* Children Management */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>فرزندان من</Text>
            {isEditing && (
              <TouchableOpacity onPress={() => setShowChildrenModal(true)}>
                <Ionicons name="add-circle" size={28} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.childrenList}>
            {localChildren.length === 0 ? (
              <View style={styles.emptyChildrenContainer}>
                <Ionicons
                  name="people-outline"
                  size={48}
                  color={Colors.textSecondary}
                />
                <Text style={styles.emptyText}>هیچ فرزندی ثبت نشده است</Text>
                {isEditing && (
                  <TouchableOpacity
                    style={styles.addChildButton}
                    onPress={() => setShowChildrenModal(true)}
                  >
                    <Text style={styles.addChildButtonText}>
                      افزودن فرزند جدید
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              localChildren.map((child, index) => (
                <View key={child.id} style={styles.childCard}>
                  <View style={styles.childInfo}>
                    <View style={styles.childAvatar}>
                      <Ionicons
                        name="person"
                        size={24}
                        color={Colors.primary}
                      />
                    </View>
                    <View style={styles.childDetails}>
                      <Text style={styles.childName}>{child.name}</Text>
                      <Text style={styles.childGrade}>{child.grade}</Text>
                      <Text style={styles.childAttendance}>
                        میزان حضور: {child.attendanceRate || 0}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.childActions}>
                    <TouchableOpacity
                      style={styles.childActionButton}
                      onPress={() =>
                        router.push(`/(parent)/child/${child.id}` as any)
                      }
                    >
                      <Ionicons name="eye" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    {isEditing && (
                      <TouchableOpacity
                        style={styles.childActionButton}
                        onPress={() => {
                          const newChildren = [...localChildren];
                          newChildren.splice(index, 1);
                          setLocalChildren(newChildren);
                        }}
                      >
                        <Ionicons
                          name="trash"
                          size={20}
                          color={Colors.danger}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Subscription Status */}
        {profile?.subscription && (
          <View style={styles.section}>
            <View style={styles.subscriptionCard}>
              <View style={styles.subscriptionInfo}>
                <Ionicons
                  name="shield-checkmark"
                  size={28}
                  color={Colors.success}
                />
                <View style={styles.subscriptionDetails}>
                  <Text style={styles.subscriptionTitle}>
                    اشتراک {profile.subscription.plan}
                  </Text>
                  <Text style={styles.subscriptionStatus}>
                    وضعیت:{" "}
                    <Text
                      style={[
                        styles.statusText,
                        profile.subscription.status === "active"
                          ? styles.statusActive
                          : styles.statusExpired,
                      ]}
                    >
                      {profile.subscription.status === "active"
                        ? "فعال"
                        : "منقضی"}
                    </Text>
                  </Text>
                  {profile.subscription.expiryDate && (
                    <Text style={styles.subscriptionExpiry}>
                      تاریخ انقضا: {profile.subscription.expiryDate}
                    </Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => router.push("/(parent)/fees" as any)}
              >
                <Text style={styles.upgradeButtonText}>
                  {profile.subscription.status === "active"
                    ? "تمدید اشتراک"
                    : "خرید اشتراک"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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
                  <Ionicons name={item.icon} size={28} color={Colors.primary} />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {isEditing ? (
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Ionicons name="save" size={22} color="#fff" />
              <Text style={styles.saveButtonText}>
                {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={22} color={Colors.danger} />
              <Text style={styles.logoutText}>خروج از حساب</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Edit Profile Button - Fixed Position */}
      <View style={styles.editButtonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <Ionicons
            name={isEditing ? "close" : "create"}
            size={22}
            color="#fff"
          />
          <Text style={styles.editButtonText}>
            {isEditing ? "لغو ویرایش" : "ویرایش پروفایل"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Child Modal */}
      <Modal
        visible={showChildrenModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChildrenModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>افزودن فرزند</Text>
              <TouchableOpacity onPress={() => setShowChildrenModal(false)}>
                <Ionicons name="close" size={26} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>نام فرزند</Text>
              <TextInput
                style={styles.modalInput}
                value={newChildName}
                onChangeText={setNewChildName}
                placeholder="نام و نام خانوادگی فرزند"
                placeholderTextColor={Colors.textSecondary}
                textAlign="right"
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
              style={[
                styles.modalAddButton,
                (!newChildName || !newChildGrade) &&
                  styles.modalAddButtonDisabled,
              ]}
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
        onRequestClose={() => setShowGradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>انتخاب پایه تحصیلی</Text>
              <TouchableOpacity onPress={() => setShowGradeModal(false)}>
                <Ionicons name="close" size={26} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {[
                "پیش دبستانی",
                "اول ابتدایی",
                "دوم ابتدایی",
                "سوم ابتدایی",
                "چهارم ابتدایی",
                "پنجم ابتدایی",
                "ششم ابتدایی",
                "هفتم متوسطه اول",
                "هشتم متوسطه اول",
                "نهم متوسطه اول",
                "دهم متوسطه دوم",
                "یازدهم متوسطه دوم",
                "دوازدهم متوسطه دوم",
              ].map((grade) => (
                <TouchableOpacity
                  key={grade}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.danger,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  editButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: Colors.background,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  profileHeader: {
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
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
  },
  placeholderImage: {
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  editImageBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
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
    marginBottom: 6,
    flexWrap: "wrap",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
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
    marginBottom: 10,
  },
  subscriptionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
    gap: 6,
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
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  contactSection: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contactInfo: {
    marginTop: 12,
    gap: 12,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
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
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  emptyChildrenContainer: {
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
  },
  addChildButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addChildButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
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
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
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
    gap: 14,
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  childGrade: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  childAttendance: {
    fontSize: 12,
    color: Colors.success,
  },
  childActions: {
    flexDirection: "row",
    gap: 12,
  },
  childActionButton: {
    padding: 8,
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
    gap: 14,
  },
  subscriptionDetails: {
    flex: 1,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  subscriptionStatus: {
    fontSize: 13,
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
    paddingVertical: 10,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  menuText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500",
    textAlign: "center",
  },
  actionSection: {
    padding: 20,
    backgroundColor: Colors.card,
    marginBottom: 20,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
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
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
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
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
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
    borderRadius: 10,
    padding: 14,
    marginBottom: 24,
  },
  gradePlaceholder: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  gradeSelected: {
    fontSize: 15,
    color: Colors.text,
  },
  modalList: {
    maxHeight: 400,
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
    padding: 18,
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
