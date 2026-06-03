// app/(admin)/users/[id].tsx
import {
  AdminUser,
  adminUserApi,
  getRoleLabel,
  getStatusColor,
  getStatusLabel,
  UpdateUserData
} from "@/src/config/adminUserApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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

interface ExtendedUser extends AdminUser {
  join_date?: string;
  last_login?: string;
  enrolled_courses?: number;
  completed_courses?: number;
  total_hours?: number;
  certificates?: number;
  bio?: string;
  address?: string;
  education?: string;
}

export default function UserDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ExtendedUser>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUserDetail = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await adminUserApi.getUser(parseInt(id));

      if (response.success && response.data) {
        // Transform AdminUser to ExtendedUser
        const extendedUser: ExtendedUser = {
          ...response.data,
          join_date: new Date(response.data.createdAt).toLocaleDateString(
            "fa-IR",
          ),
          last_login: new Date(response.data.createdAt).toLocaleString("fa-IR"),
          enrolled_courses: response.data.stats?.coursesCount || 0,
          completed_courses: response.data.stats?.assignmentCount || 0,
          total_hours: 0,
          certificates: 0,
          bio: "",
          address: "",
          education: "",
        };
        setUser(extendedUser);
        setFormData(extendedUser);
      } else {
        Alert.alert("خطا", "کاربر یافت نشد");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      Alert.alert("خطا", "در دریافت اطلاعات کاربر مشکلی پیش آمده");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchUserDetail();
  }, [fetchUserDetail]);

  const handleSave = async () => {
    if (!user?.id) return;

    try {
      setIsUpdating(true);

      const updateData: UpdateUserData = {
        fullName: formData.fullName || formData.name,
        email: formData.email,
        phone: formData.phone || "",
        role: formData.role,
        status: formData.status,
        verified: formData.verified,
        classId: formData.classId,
        subjects: formData.subjects?.map((s) => parseInt(s as any)) as number[],
      };

      const response = await adminUserApi.updateUser(user.id, updateData);

      if (response.success) {
        Alert.alert("موفقیت", "اطلاعات کاربر با موفقیت بروزرسانی شد");
        setEditing(false);
        fetchUserDetail();
      } else {
        Alert.alert(
          "خطا",
          response.message || "در بروزرسانی اطلاعات مشکلی پیش آمده",
        );
      }
    } catch (error) {
      console.error("Error updating user:", error);
      Alert.alert("خطا", "در بروزرسانی اطلاعات مشکلی پیش آمده");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (
    newStatus: "active" | "inactive" | "suspended",
  ) => {
    if (!user?.id) return;

    Alert.alert(
      "تغییر وضعیت",
      `آیا از تغییر وضعیت کاربر به "${getStatusLabel(newStatus)}" اطمینان دارید؟`,
      [
        { text: "لغو", style: "cancel" },
        {
          text: "تغییر",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await adminUserApi.updateUserStatus(
                user.id,
                newStatus,
              );

              if (response.success) {
                Alert.alert("موفقیت", "وضعیت کاربر با موفقیت تغییر یافت");
                fetchUserDetail();
              } else {
                Alert.alert(
                  "خطا",
                  response.message || "در تغییر وضعیت مشکلی پیش آمده",
                );
              }
            } catch (error) {
              console.error("Error changing status:", error);
              Alert.alert("خطا", "در تغییر وضعیت کاربر مشکلی پیش آمده");
            }
          },
        },
      ],
    );
  };

  const handleResetPassword = async () => {
    if (!user?.id) return;

    Alert.alert(
      "بازنشانی رمز عبور",
      "آیا از بازنشانی رمز عبور این کاربر اطمینان دارید؟ رمز عبور جدید برای کاربر ارسال خواهد شد.",
      [
        { text: "لغو", style: "cancel" },
        {
          text: "بازنشانی",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await adminUserApi.resetUserPassword(user.id);

              if (response.success) {
                Alert.alert(
                  "موفقیت",
                  `رمز عبور با موفقیت بازنشانی شد.\nرمز عبور جدید: ${response.newPassword || "پسورد جدید به ایمیل کاربر ارسال شد"}`,
                  [{ text: "متوجه شدم" }],
                );
              } else {
                Alert.alert(
                  "خطا",
                  response.message || "در بازنشانی رمز عبور مشکلی پیش آمده",
                );
              }
            } catch (error) {
              console.error("Error resetting password:", error);
              Alert.alert("خطا", "در بازنشانی رمز عبور مشکلی پیش آمده");
            }
          },
        },
      ],
    );
  };

  const handleDelete = async () => {
    if (!user?.id) return;

    Alert.alert(
      "حذف کاربر",
      "آیا از حذف دائمی این کاربر اطمینان دارید؟ این عمل قابل بازگشت نیست.",
      [
        { text: "لغو", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await adminUserApi.deleteUser(user.id);

              if (response.success) {
                Alert.alert("موفقیت", "کاربر با موفقیت حذف شد");
                router.back();
              } else {
                Alert.alert(
                  "خطا",
                  response.message || "در حذف کاربر مشکلی پیش آمده",
                );
              }
            } catch (error) {
              console.error("Error deleting user:", error);
              Alert.alert("خطا", "در حذف کاربر مشکلی پیش آمده");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="جزئیات کاربر" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="جزئیات کاربر" showBack />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.danger} />
          <Text style={styles.errorText}>کاربر یافت نشد</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="جزئیات کاربر"
        showBack
        rightComponent={
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(!editing)}
            >
              <Ionicons
                name={editing ? "close" : "create"}
                size={24}
                color={editing ? Colors.danger : Colors.primary}
              />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImagePlaceholder}>
            {user.profile_image ? (
              <Image
                source={{ uri: user.profile_image }}
                style={styles.profileImage}
              />
            ) : (
              <Ionicons name="person" size={40} color={Colors.textSecondary} />
            )}
          </View>
          <View style={styles.profileInfo}>
            {editing ? (
              <TextInput
                style={styles.editName}
                value={formData.fullName || formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, fullName: text })
                }
                placeholder="نام کامل"
                textAlign="right"
              />
            ) : (
              <Text style={styles.userName}>{user.fullName || user.name}</Text>
            )}
            <View style={styles.profileMeta}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: `${getStatusColor(user.status)}20` },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(user.status) },
                  ]}
                >
                  {getStatusLabel(user.status)}
                </Text>
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{getRoleLabel(user.role)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user.stats?.coursesCount || user.stats?.assignmentCount || 0}
            </Text>
            <Text style={styles.statLabel}>دوره‌ها</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user.stats?.attendanceCount || 0}
            </Text>
            <Text style={styles.statLabel}>حضور</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user.stats?.messageCount || 0}
            </Text>
            <Text style={styles.statLabel}>پیام‌ها</Text>
          </View>
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات شخصی</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color={Colors.textSecondary} />
              {editing ? (
                <TextInput
                  style={styles.editInput}
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  placeholder="ایمیل"
                  keyboardType="email-address"
                  textAlign="right"
                />
              ) : (
                <Text style={styles.infoText}>{user.email}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color={Colors.textSecondary} />
              {editing ? (
                <TextInput
                  style={styles.editInput}
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone: text })
                  }
                  placeholder="شماره تلفن"
                  keyboardType="phone-pad"
                  textAlign="right"
                />
              ) : (
                <Text style={styles.infoText}>{user.phone || "ثبت نشده"}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="calendar"
                size={20}
                color={Colors.textSecondary}
              />
              <Text style={styles.infoText}>
                تاریخ عضویت: {user.join_date || "نامشخص"}
              </Text>
            </View>
          </View>
        </View>

        {/* Class Info (for students) */}
        {user.role === "student" && user.className && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اطلاعات تحصیلی</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons
                  name="school"
                  size={20}
                  color={Colors.textSecondary}
                />
                {editing ? (
                  <TextInput
                    style={styles.editInput}
                    value={formData.classId?.toString()}
                    onChangeText={(text) =>
                      setFormData({ ...formData, classId: parseInt(text) })
                    }
                    placeholder="شناسه کلاس"
                    keyboardType="numeric"
                    textAlign="right"
                  />
                ) : (
                  <Text style={styles.infoText}>
                    {user.className} {user.classSection || ""}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Subjects (for teachers) */}
        {user.role === "teacher" &&
          user.subjects &&
          user.subjects.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>دروس تدریس</Text>
              <View style={styles.infoCard}>
                <View style={styles.subjectsContainer}>
                  {user.subjects.map((subject, index) => (
                    <View key={index} style={styles.subjectTag}>
                      <Text style={styles.subjectText}>{subject}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

        {/* Children (for parents) */}
        {user.role === "parent" &&
          user.children &&
          user.children.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>فرزندان</Text>
              <View style={styles.infoCard}>
                {user.children.map((child) => (
                  <View key={child.id} style={styles.childItem}>
                    <Ionicons name="person" size={16} color={Colors.primary} />
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childId}> (ID: {child.id})</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        {/* Status Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مدیریت کاربر</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.statusAction,
                { backgroundColor: `${Colors.success}20` },
              ]}
              onPress={() => handleStatusChange("active")}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.success}
              />
              <Text
                style={[styles.statusActionText, { color: Colors.success }]}
              >
                فعال‌سازی
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.statusAction,
                { backgroundColor: `${Colors.danger}20` },
              ]}
              onPress={() => handleStatusChange("suspended")}
            >
              <Ionicons name="ban" size={20} color={Colors.danger} />
              <Text style={[styles.statusActionText, { color: Colors.danger }]}>
                تعلیق
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>
            منطقه خطر
          </Text>
          <View style={styles.dangerCard}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleResetPassword}
            >
              <Ionicons name="refresh" size={20} color={Colors.warning} />
              <Text style={styles.dangerButtonText}>بازنشانی رمز عبور</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={20} color={Colors.danger} />
              <Text style={[styles.dangerButtonText, { color: Colors.danger }]}>
                حذف کاربر
              </Text>
            </TouchableOpacity>
            <Text style={styles.dangerWarning}>
              با حذف کاربر، تمام اطلاعات مرتبط با این کاربر نیز حذف خواهد شد.
            </Text>
          </View>
        </View>

        {/* Save/Cancel Buttons */}
        {editing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>ذخیره تغییرات</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setEditing(false);
                setFormData(user);
              }}
            >
              <Text style={styles.cancelButtonText}>لغو</Text>
            </TouchableOpacity>
          </View>
        )}
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: Colors.danger,
    marginTop: 16,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  editName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    backgroundColor: Colors.background,
  },
  profileMeta: {
    flexDirection: "row",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  roleBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleText: {
    fontSize: 12,
    color: Colors.text,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  dangerTitle: {
    color: Colors.danger,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  editInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 8,
    backgroundColor: Colors.background,
  },
  subjectsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  subjectTag: {
    backgroundColor: Colors.primary + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  subjectText: {
    fontSize: 14,
    color: Colors.primary,
  },
  childItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  childName: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  childId: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statusAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  statusActionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dangerCard: {
    backgroundColor: "rgba(239, 68, 68, 0.05)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    gap: 8,
    marginBottom: 12,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.warning,
  },
  dangerWarning: {
    fontSize: 12,
    color: Colors.danger,
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
});
