// app/(admin)/profile.tsx
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/src/config/adminApi";
import { Ionicons } from "@expo/vector-icons";
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

// Define admin-specific interface
interface AdminProfileData {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  profile_image?: string;
  role: string;
  bio?: string;
  department?: string;
  employeeId?: string;
  joinDate?: string;
  permissions?: string[];
  stats?: {
    managedUsers: number;
    totalRevenue: number;
    systemAlerts: number;
    activeTasks: number;
  };
}

const adminPermissions = [
  "مدیریت کاربران",
  "مدیریت دوره‌ها",
  // "مدیریت مالی",
  "مدیریت محتوا",
  "تنظیمات سیستم",
  "گزارش‌گیری",
  "پشتیبانی",
  "بررسی درخواست‌ها",
];

const adminDepartments = [
  "فنی و توسعه",
  "پشتیبانی",
  "مالی",
  "محتوا",
  "مدیریت",
  "بازاریابی",
  "کیفیت",
  "آموزش",
];

export default function AdminProfile() {
  const router = useRouter();
  const { user, updateProfile, logout, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.profile_image || null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfileData | null>(
    null,
  );

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: "",
    role: "مدیر سیستم",
    department: "",
    employeeId: "",
    joinDate: "",
    permissions: [] as string[],
    managedUsers: 0,
    totalRevenue: 0,
    systemAlerts: 0,
    activeTasks: 0,
  });

  const [notifications, setNotifications] = useState({
    userRegistrations: true,
    paymentIssues: true,
    systemAlerts: true,
    supportTickets: true,
    contentReports: true,
    systemUpdates: true,
    securityAlerts: true,
    performanceReports: false,
  });

  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getProfile();

      if (response.success && response.data) {
        const data = response.data;
        setAdminProfile(data);
        setProfileImage(data.profile_image || null);

        setFormData({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          bio: data.bio || "",
          role: data.role || "مدیر سیستم",
          department: data.department || "",
          employeeId: data.employeeId || "",
          joinDate: data.joinDate || new Date().toLocaleDateString("fa-IR"),
          permissions: data.permissions || ["مدیریت کاربران", "مدیریت دوره‌ها"],
          managedUsers: data.stats?.managedUsers || 0,
          totalRevenue: data.stats?.totalRevenue || 0,
          systemAlerts: data.stats?.systemAlerts || 0,
          activeTasks: data.stats?.activeTasks || 0,
        });
      }
    } catch (error) {
      console.error("Error loading admin profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAdminProfile();
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
      // Upload image to server
      await uploadProfileImage(result.assets[0].uri);
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    try {
      const formData = new FormData();
      const filename = imageUri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("profile_image", {
        uri: imageUri,
        type: type,
        name: filename,
      } as any);

      const response = await adminApi.uploadProfileImage(formData);

      if (response.success) {
        Alert.alert("موفقیت", "عکس پروفایل با موفقیت به‌روزرسانی شد.");
        loadAdminProfile();
      } else {
        Alert.alert("خطا", response.message || "آپلود عکس با مشکل مواجه شد");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("خطا", "در آپلود عکس خطایی رخ داد.");
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
        role: formData.role,
        department: formData.department,
        employeeId: formData.employeeId,
        permissions: formData.permissions,
      };

      const response = await adminApi.updateProfile(updateData);

      if (response.success) {
        Alert.alert("موفقیت", "پروفایل با موفقیت به‌روزرسانی شد.");
        setIsEditing(false);
        loadAdminProfile();
      } else {
        Alert.alert(
          "خطا",
          response.message || "در به‌روزرسانی پروفایل خطایی رخ داد.",
        );
      }
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

  const handleTogglePermission = (permission: string) => {
    const currentPermissions = formData.permissions || [];
    if (currentPermissions.includes(permission)) {
      setFormData({
        ...formData,
        permissions: currentPermissions.filter((p) => p !== permission),
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...currentPermissions, permission],
      });
    }
  };

  const handleSelectDepartment = (department: string) => {
    setFormData({ ...formData, department });
    setShowDepartmentModal(false);
  };

  const stats = [
    {
      label: "کاربران مدیریت شده",
      value: formData.managedUsers?.toLocaleString(),
      icon: "people" as const,
      color: Colors.primary,
    },
    {
      label: "درآمد کل",
      value: formData.totalRevenue?.toLocaleString(),
      icon: "cash" as const,
      color: Colors.success,
    },
    {
      label: "هشدارهای سیستم",
      value: formData.systemAlerts,
      icon: "warning" as const,
      color: Colors.warning,
    },
    {
      label: "وظایف فعال",
      value: formData.activeTasks,
      icon: "checkmark-done" as const,
      color: Colors.info,
    },
  ];

  const adminMenu = [
    {
      title: "مدیریت کاربران",
      icon: "people" as const,
      onPress: () => router.push("/(admin)/users"),
    },
    {
      title: "گزارش‌ گیری",
      icon: "document-text" as const,
      onPress: () => router.push("/(admin)/analytics"),
    },
    {
      title: "تنظیمات سیستم",
      icon: "settings" as const,
      onPress: () => router.push("/(admin)/settings"),
    },
    {
      title: "پشتیبانی",
      icon: "headset" as const,
      onPress: () => router.push("/(public)/info"),
    },
    {
      title: "لاگ سیستم",
      icon: "list" as const,
      onPress: () => router.push("/(public)/info"),
    },
    {
      title: "پشتیبان‌گیری",
      icon: "cloud-upload" as const,
      onPress: () => router.push("/(public)/info"),
    },
  ];

  const quickActions = [
    {
      title: "کاربر جدید",
      icon: "person-add" as const,
      action: () => router.push("/(admin)/users/create"),
    },
    {
      title: "دوره جدید",
      icon: "add-circle" as const,
      action: () => router.push("/(admin)/courses/create"),
    },
    {
      title: "گزارش مالی",
      icon: "bar-chart" as const,
      action: () => router.push("/(admin)/analytics"),
    },
    {
      title: "پیام‌ها",
      icon: "chatbubbles" as const,
      action: () => router.push("/(public)/info"),
    },
  ];

  if (loading && !adminProfile) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="پروفایل ادمین" showBack />
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
        title="پروفایل ادمین"
        showBack
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Ionicons
                name={isEditing ? "close" : "create"}
                size={24}
                color={Colors.text}
              />
            </TouchableOpacity>
          </View>
        }
      />

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
          colors={["#0f766e", "#14b8a6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeader}
        >
          <TouchableOpacity onPress={isEditing ? pickImage : undefined}>
            <View style={styles.profileImageContainer}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={[styles.profileImage, styles.placeholderImage]}>
                  <Ionicons name="person" size={40} color="#fff" />
                </View>
              )}
              {isEditing && (
                <View style={styles.editImageBadge}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <View style={styles.profileTitle}>
              <Text style={styles.profileName}>{formData.fullName}</Text>
              <View style={styles.adminBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#fff" />
                <Text style={styles.adminText}>ادمین</Text>
              </View>
            </View>

            <Text style={styles.profileTagline}>
              {formData.role} • {formData.department || "مدیریت"}
            </Text>

            <View style={styles.employeeInfo}>
              <Text style={styles.employeeId}>
                کد پرسنلی: {formData.employeeId || "نامشخص"}
              </Text>
              <Text style={styles.joinDate}>
                عضویت از: {formData.joinDate || "نامشخص"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: `${stat.color}20` },
                ]}
              >
                <Ionicons name={stat.icon} size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value || 0}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>دسترسی سریع</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={action.action}
              >
                <View style={styles.actionIcon}>
                  <Ionicons
                    name={action.icon}
                    size={20}
                    color={Colors.primary}
                  />
                </View>
                <Text style={styles.actionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Edit Form */}
        {isEditing ? (
          <View style={styles.editSection}>
            <Text style={styles.sectionTitle}>ویرایش اطلاعات ادمین</Text>

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
              <Text style={styles.label}>سمت</Text>
              <TextInput
                style={styles.input}
                value={formData.role}
                onChangeText={(text) =>
                  setFormData({ ...formData, role: text })
                }
                placeholder="مثال: مدیر ارشد"
                textAlign="right"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>دپارتمان</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowDepartmentModal(true)}
              >
                <Text style={styles.selectInputText}>
                  {formData.department || "انتخاب دپارتمان"}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>کد پرسنلی</Text>
              <TextInput
                style={styles.input}
                value={formData.employeeId}
                onChangeText={(text) =>
                  setFormData({ ...formData, employeeId: text })
                }
                placeholder="مثال: ADM-2023-001"
                textAlign="right"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>درباره من</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                placeholder="درباره خود و مسئولیت‌ها بنویسید..."
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
          </View>
        ) : (
          formData.bio && (
            <View style={styles.bioSection}>
              <Text style={styles.bioText}>{formData.bio}</Text>
            </View>
          )
        )}

        {/* Permissions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>مجوزهای دسترسی</Text>
            {isEditing && (
              <TouchableOpacity onPress={() => setShowPermissionsModal(true)}>
                <Ionicons name="add-circle" size={24} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.permissionsGrid}>
            {(formData.permissions || []).length > 0 ? (
              (formData.permissions || []).map(
                (permission: string, index: number) => (
                  <View key={index} style={styles.permissionChip}>
                    <Ionicons
                      name="shield-checkmark"
                      size={14}
                      color={Colors.primary}
                    />
                    <Text style={styles.permissionText}>{permission}</Text>
                    {isEditing && (
                      <TouchableOpacity
                        onPress={() => handleTogglePermission(permission)}
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
              <Text style={styles.emptyText}>هیچ مجوزی تعریف نشده است</Text>
            )}
          </View>
        </View>

        {/* Admin Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ابزارهای مدیریت</Text>
          <View style={styles.menuGrid}>
            {adminMenu.map((item, index) => (
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

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تنظیمات اطلاع‌رسانی سیستم</Text>
          <View style={styles.notificationsList}>
            <View style={styles.notificationItem}>
              <View>
                <Text style={styles.notificationTitle}>
                  ثبت‌نام کاربران جدید
                </Text>
                <Text style={styles.notificationDesc}>
                  اطلاع‌رسانی هنگام ثبت‌نام کاربر جدید
                </Text>
              </View>
              <Switch
                value={notifications.userRegistrations}
                onValueChange={(value) =>
                  setNotifications({
                    ...notifications,
                    userRegistrations: value,
                  })
                }
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            <View style={styles.notificationItem}>
              <View>
                <Text style={styles.notificationTitle}>هشدارهای امنیتی</Text>
                <Text style={styles.notificationDesc}>
                  اطلاع‌رسانی رویدادهای امنیتی
                </Text>
              </View>
              <Switch
                value={notifications.securityAlerts}
                onValueChange={(value) =>
                  setNotifications({ ...notifications, securityAlerts: value })
                }
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            <View style={styles.notificationItem}>
              <View>
                <Text style={styles.notificationTitle}>مشکلات پرداخت</Text>
                <Text style={styles.notificationDesc}>
                  اطلاع‌رسانی خطاهای پرداخت
                </Text>
              </View>
              <Switch
                value={notifications.paymentIssues}
                onValueChange={(value) =>
                  setNotifications({
                    ...notifications,
                    paymentIssues: value,
                  })
                }
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>

            <View style={styles.notificationItem}>
              <View>
                <Text style={styles.notificationTitle}>گزارش‌های عملکرد</Text>
                <Text style={styles.notificationDesc}>
                  ارسال گزارش هفتگی عملکرد سیستم
                </Text>
              </View>
              <Switch
                value={notifications.performanceReports}
                onValueChange={(value) =>
                  setNotifications({
                    ...notifications,
                    performanceReports: value,
                  })
                }
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            </View>
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

        {/* Permissions Selection Modal */}
        <Modal
          visible={showPermissionsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPermissionsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>مدیریت مجوزهای دسترسی</Text>
                <TouchableOpacity
                  onPress={() => setShowPermissionsModal(false)}
                >
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalList}>
                <View style={styles.modalGrid}>
                  {adminPermissions.map((permission) => (
                    <TouchableOpacity
                      key={permission}
                      style={[
                        styles.modalPermission,
                        (formData.permissions || []).includes(permission) &&
                          styles.modalPermissionSelected,
                      ]}
                      onPress={() => handleTogglePermission(permission)}
                    >
                      <Ionicons
                        name="shield-checkmark"
                        size={16}
                        color={
                          (formData.permissions || []).includes(permission)
                            ? "#fff"
                            : Colors.primary
                        }
                      />
                      <Text
                        style={[
                          styles.modalPermissionText,
                          (formData.permissions || []).includes(permission) &&
                            styles.modalPermissionTextSelected,
                        ]}
                      >
                        {permission}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={styles.modalDoneButton}
                onPress={() => setShowPermissionsModal(false)}
              >
                <Text style={styles.modalDoneButtonText}>تایید</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Department Selection Modal */}
        <Modal
          visible={showDepartmentModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDepartmentModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>انتخاب دپارتمان</Text>
                <TouchableOpacity onPress={() => setShowDepartmentModal(false)}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalList}>
                <View style={styles.modalListContent}>
                  {adminDepartments.map((department) => (
                    <TouchableOpacity
                      key={department}
                      style={[
                        styles.modalListItem,
                        formData.department === department &&
                          styles.modalListItemSelected,
                      ]}
                      onPress={() => handleSelectDepartment(department)}
                    >
                      <Text
                        style={[
                          styles.modalListItemText,
                          formData.department === department &&
                            styles.modalListItemTextSelected,
                        ]}
                      >
                        {department}
                      </Text>
                      {formData.department === department && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={Colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
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
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
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
  placeholderImage: {
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    borderStyle: "dashed",
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
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  adminText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "500",
  },
  profileTagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  employeeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  employeeId: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  joinDate: {
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
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  section: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    fontSize: 12,
    color: Colors.text,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    textAlign: "right",
  },
  selectInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectInputText: {
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  permissionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  permissionChip: {
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
  permissionText: {
    fontSize: 12,
    color: Colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    padding: 20,
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
  modalListContent: {
    padding: 20,
  },
  modalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 20,
    gap: 8,
  },
  modalPermission: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  modalPermissionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalPermissionText: {
    fontSize: 14,
    color: Colors.text,
  },
  modalPermissionTextSelected: {
    color: "#fff",
  },
  modalListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalListItemSelected: {
    backgroundColor: "rgba(59, 130, 246, 0.05)",
  },
  modalListItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  modalListItemTextSelected: {
    color: Colors.primary,
    fontWeight: "500",
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
