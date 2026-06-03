import { adminUserApi, UserStats } from "@/src/config/adminUserApi";
import {
  Edit,
  Lock,
  Plus,
  Save,
  Shield,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Define types
type PermissionKey =
  | "dashboard"
  | "users"
  | "courses"
  | "financial"
  | "academic"
  | "system"
  | "reports"
  | "settings";

type Permissions = {
  [key in PermissionKey]: boolean;
};

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: Permissions;
}

interface ApiRole {
  id: number;
  name: string;
  permissions: string[];
}

export default function RolePermissions() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "admin",
      name: "مدیر سیستم",
      description: "دسترسی کامل به سیستم",
      userCount: 0,
      permissions: {
        dashboard: true,
        users: true,
        courses: true,
        financial: true,
        academic: true,
        system: true,
        reports: true,
        settings: true,
      },
    },
    {
      id: "teacher",
      name: "مدرس",
      description: "دسترسی به بخش آموزشی",
      userCount: 0,
      permissions: {
        dashboard: true,
        users: false,
        courses: true,
        financial: false,
        academic: true,
        system: false,
        reports: true,
        settings: false,
      },
    },
    {
      id: "student",
      name: "دانش‌آموز",
      description: "دسترسی به دوره‌های ثبت‌نامی",
      userCount: 0,
      permissions: {
        dashboard: true,
        users: false,
        courses: true,
        financial: false,
        academic: false,
        system: false,
        reports: false,
        settings: false,
      },
    },
    {
      id: "parent",
      name: "والد",
      description: "دسترسی به پیشرفت فرزندان",
      userCount: 0,
      permissions: {
        dashboard: true,
        users: false,
        courses: true,
        financial: true,
        academic: false,
        system: false,
        reports: true,
        settings: false,
      },
    },
  ]);

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newRole, setNewRole] = useState<{
    name: string;
    description: string;
    permissions: Permissions;
  }>({
    name: "",
    description: "",
    permissions: {
      dashboard: false,
      users: false,
      courses: false,
      financial: false,
      academic: false,
      system: false,
      reports: false,
      settings: false,
    },
  });

  const permissionGroups = [
    {
      title: "دسترسی‌های اصلی",
      permissions: ["dashboard", "users", "courses"] as PermissionKey[],
    },
    {
      title: "مدیریت",
      permissions: ["financial", "academic", "system"] as PermissionKey[],
    },
    {
      title: "داده‌ها و تنظیمات",
      permissions: ["reports", "settings"] as PermissionKey[],
    },
  ];

  const getPermissionLabel = (key: PermissionKey): string => {
    const labels: Record<PermissionKey, string> = {
      dashboard: "داشبورد",
      users: "مدیریت کاربران",
      courses: "مدیریت دوره‌ها",
      financial: "مدیریت مالی",
      academic: "مدیریت آموزشی",
      system: "مدیریت سیستم",
      reports: "گزارش‌ها",
      settings: "تنظیمات سیستم",
    };
    return labels[key];
  };

  // Fetch user statistics to get user counts per role
  const fetchUserStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminUserApi.getUserStats();

      if (response.success && response.data) {
        setUserStats(response.data);

        // Update role user counts based on stats
        setRoles((prevRoles) =>
          prevRoles.map((role) => {
            let count = 0;
            switch (role.id) {
              case "admin":
                count = response.data.admin;
                break;
              case "teacher":
                count = response.data.teacher;
                break;
              case "student":
                count = response.data.student;
                break;
              case "parent":
                count = response.data.parent;
                break;
              default:
                count = 0;
            }
            return { ...role, userCount: count };
          }),
        );
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
      Alert.alert("خطا", "در دریافت آمار کاربران مشکلی پیش آمده");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  const handleSaveRole = async () => {
    if (!newRole.name.trim()) {
      Alert.alert("خطا", "لطفاً نام نقش را وارد کنید");
      return;
    }

    setIsSaving(true);

    try {
      if (editingRole) {
        // Update existing role (in a real app, you would call an API to update permissions)
        setRoles(
          roles.map((r) =>
            r.id === editingRole.id
              ? {
                  ...newRole,
                  id: editingRole.id,
                  userCount: editingRole.userCount,
                }
              : r,
          ),
        );
        Alert.alert("موفقیت", "نقش با موفقیت بروزرسانی شد");
      } else {
        // Add new role (in a real app, you would call an API to create a new role)
        const role: Role = {
          id: Date.now().toString(),
          name: newRole.name,
          description: newRole.description,
          userCount: 0,
          permissions: { ...newRole.permissions },
        };
        setRoles([...roles, role]);
        Alert.alert("موفقیت", "نقش جدید با موفقیت اضافه شد");
      }

      setShowAddModal(false);
      setEditingRole(null);
      resetNewRole();
    } catch (error) {
      console.error("Error saving role:", error);
      Alert.alert("خطا", "در ذخیره نقش مشکلی پیش آمده");
    } finally {
      setIsSaving(false);
    }
  };

  const resetNewRole = () => {
    setNewRole({
      name: "",
      description: "",
      permissions: {
        dashboard: false,
        users: false,
        courses: false,
        financial: false,
        academic: false,
        system: false,
        reports: false,
        settings: false,
      },
    });
  };

  const handleEdit = (role: Role) => {
    // Prevent editing default roles in production
    if (["admin", "teacher", "student", "parent"].includes(role.id)) {
      Alert.alert("توجه", "نقش‌های پیش‌فرض سیستم قابل ویرایش نیستند");
      return;
    }

    setEditingRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: { ...role.permissions },
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    const role = roles.find((r) => r.id === id);
    if (!role) return;

    // Prevent deleting default roles
    if (["admin", "teacher", "student", "parent"].includes(id)) {
      Alert.alert("توجه", "نقش‌های پیش‌فرض سیستم قابل حذف نیستند");
      return;
    }

    if (role.userCount > 0) {
      Alert.alert(
        "خطا",
        "این نقش دارای کاربران اختصاصی است. ابتدا کاربران را جابجا کنید.",
      );
      return;
    }

    Alert.alert("حذف نقش", "آیا از حذف این نقش اطمینان دارید؟", [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            // In a real app, you would call an API to delete the role
            setRoles(roles.filter((r) => r.id !== id));
            Alert.alert("موفقیت", "نقش با موفقیت حذف شد");
          } catch (error) {
            console.error("Error deleting role:", error);
            Alert.alert("خطا", "در حذف نقش مشکلی پیش آمده");
          }
        },
      },
    ]);
  };

  const togglePermission = (permission: PermissionKey) => {
    setNewRole({
      ...newRole,
      permissions: {
        ...newRole.permissions,
        [permission]: !newRole.permissions[permission],
      },
    });
  };

  const toggleAllPermissions = (value: boolean) => {
    const allPermissions: Permissions = {
      dashboard: value,
      users: value,
      courses: value,
      financial: value,
      academic: value,
      system: value,
      reports: value,
      settings: value,
    };

    setNewRole({
      ...newRole,
      permissions: allPermissions,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>نقش‌ها و دسترسی‌ها</Text>
            <Text style={styles.subtitle}>
              مدیریت نقش‌های کاربران و سطوح دسترسی
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>افزودن نقش</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        {userStats && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userStats.total}</Text>
              <Text style={styles.statLabel}>کل کاربران</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userStats.active}</Text>
              <Text style={styles.statLabel}>کاربران فعال</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{roles.length}</Text>
              <Text style={styles.statLabel}>نقش‌های تعریف شده</Text>
            </View>
          </View>
        )}

        {/* Roles Grid */}
        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <View key={role.id} style={styles.roleCard}>
              <View style={styles.roleHeader}>
                <View style={styles.roleIcon}>
                  {role.id === "admin" ? (
                    <Shield size={20} color="#007AFF" />
                  ) : role.id === "teacher" ? (
                    <User size={20} color="#FF9500" />
                  ) : role.id === "student" ? (
                    <Users size={20} color="#34C759" />
                  ) : (
                    <Users size={20} color="#5856D6" />
                  )}
                </View>
                <View style={styles.roleInfo}>
                  <Text style={styles.roleName}>{role.name}</Text>
                  <Text style={styles.roleDescription}>{role.description}</Text>
                </View>
                <View style={styles.roleStats}>
                  <Users size={16} color="#8E8E93" />
                  <Text style={styles.userCount}>{role.userCount} کاربر</Text>
                </View>
              </View>

              <View style={styles.permissionsPreview}>
                <Text style={styles.permissionsTitle}>دسترسی‌های کلیدی:</Text>
                <View style={styles.permissionTags}>
                  {(
                    Object.entries(role.permissions) as [
                      PermissionKey,
                      boolean,
                    ][]
                  )
                    .filter(([_, value]) => value)
                    .slice(0, 3)
                    .map(([key]) => (
                      <View key={key} style={styles.permissionTag}>
                        <Text style={styles.permissionTagText}>
                          {getPermissionLabel(key)}
                        </Text>
                      </View>
                    ))}
                  {Object.values(role.permissions).filter((v) => v).length >
                    3 && (
                    <Text style={styles.moreText}>
                      +
                      {Object.values(role.permissions).filter((v) => v).length -
                        3}{" "}
                      مورد دیگر
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.roleActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEdit(role)}
                >
                  <Edit size={16} color="#007AFF" />
                  <Text style={styles.actionText}>ویرایش</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(role.id)}
                >
                  <Trash2 size={16} color="#FF3B30" />
                  <Text style={[styles.actionText, styles.deleteText]}>
                    حذف
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Permission Matrix */}
        <View style={styles.matrixContainer}>
          <Text style={styles.sectionTitle}>ماتریس دسترسی‌ها</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={styles.matrixCard}>
              <View style={styles.matrixHeader}>
                <Text
                  style={[
                    styles.matrixHeaderCell,
                    styles.matrixHeaderFirstCell,
                  ]}
                >
                  دسترسی
                </Text>
                {roles.map((role) => (
                  <Text key={role.id} style={styles.matrixHeaderCell}>
                    {role.name.length > 10
                      ? role.name.substring(0, 8) + "..."
                      : role.name}
                  </Text>
                ))}
              </View>

              {(
                Object.keys(roles[0]?.permissions || {}) as PermissionKey[]
              ).map((permission) => (
                <View key={permission} style={styles.matrixRow}>
                  <Text
                    style={[
                      styles.permissionLabel,
                      styles.matrixHeaderFirstCell,
                    ]}
                  >
                    {getPermissionLabel(permission)}
                  </Text>
                  {roles.map((role) => (
                    <View key={role.id} style={styles.permissionCell}>
                      {role.permissions[permission] ? (
                        <View style={styles.allowedBadge}>
                          <Lock size={12} color="#34C759" />
                        </View>
                      ) : (
                        <View style={styles.deniedBadge}>
                          <Lock size={12} color="#FF3B30" />
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingRole ? "ویرایش نقش" : "افزودن نقش جدید"}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingRole(null);
                  resetNewRole();
                }}
              >
                <X size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Role Details */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>اطلاعات نقش</Text>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>نام نقش *</Text>
                  <View style={styles.textInputContainer}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="نام نقش را وارد کنید"
                      value={newRole.name}
                      onChangeText={(text) =>
                        setNewRole({ ...newRole, name: text })
                      }
                      textAlign="right"
                    />
                  </View>
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>توضیحات</Text>
                  <View style={styles.textInputContainer}>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      placeholder="توضیحات نقش را وارد کنید"
                      value={newRole.description}
                      onChangeText={(text) =>
                        setNewRole({ ...newRole, description: text })
                      }
                      multiline
                      numberOfLines={3}
                      textAlign="right"
                    />
                  </View>
                </View>
              </View>

              {/* Permissions */}
              <View style={styles.formSection}>
                <View style={styles.permissionsHeader}>
                  <Text style={styles.sectionTitle}>دسترسی‌ها</Text>
                  <TouchableOpacity
                    style={styles.toggleAllButton}
                    onPress={() =>
                      toggleAllPermissions(
                        !Object.values(newRole.permissions).every((v) => v),
                      )
                    }
                  >
                    <Text style={styles.toggleAllText}>
                      {Object.values(newRole.permissions).every((v) => v)
                        ? "لغو همه"
                        : "انتخاب همه"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {permissionGroups.map((group, index) => (
                  <View key={index} style={styles.permissionGroup}>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    {group.permissions.map((permission) => (
                      <View key={permission} style={styles.permissionItem}>
                        <View style={styles.permissionInfo}>
                          <Lock size={16} color="#8E8E93" />
                          <Text style={styles.permissionName}>
                            {getPermissionLabel(permission)}
                          </Text>
                        </View>
                        <Switch
                          value={newRole.permissions[permission]}
                          onValueChange={() => togglePermission(permission)}
                          trackColor={{ false: "#f2f2f7", true: "#34C759" }}
                          thumbColor={
                            newRole.permissions[permission] ? "#fff" : "#fff"
                          }
                        />
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setEditingRole(null);
                  resetNewRole();
                }}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>لغو</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  isSaving && styles.saveButtonDisabled,
                ]}
                onPress={handleSaveRole}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Save size={20} color="white" />
                    <Text style={styles.saveButtonText}>
                      {editingRole ? "بروزرسانی" : "ذخیره"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f7",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8E8E93",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5ea",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1d1d1f",
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1d1d1f",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#8E8E93",
  },
  rolesContainer: {
    padding: 16,
  },
  roleCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  roleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f2f2f7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: "#8E8E93",
  },
  roleStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userCount: {
    fontSize: 14,
    color: "#8E8E93",
  },
  permissionsPreview: {
    marginBottom: 16,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1d1d1f",
    marginBottom: 8,
  },
  permissionTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  permissionTag: {
    backgroundColor: "#f2f2f7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  permissionTagText: {
    fontSize: 12,
    color: "#1d1d1f",
  },
  moreText: {
    fontSize: 12,
    color: "#8E8E93",
    alignSelf: "center",
  },
  roleActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#f2f2f7",
    borderRadius: 8,
    gap: 8,
  },
  deleteButton: {
    backgroundColor: "#FFE5E5",
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#007AFF",
  },
  deleteText: {
    color: "#FF3B30",
  },
  matrixContainer: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 16,
  },
  matrixCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 500,
  },
  matrixHeader: {
    flexDirection: "row",
    backgroundColor: "#e5e5ea",
    padding: 16,
  },
  matrixHeaderCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1d1d1f",
    textAlign: "center",
    minWidth: 80,
  },
  matrixHeaderFirstCell: {
    textAlign: "right",
    minWidth: 120,
  },
  matrixRow: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f7",
  },
  permissionLabel: {
    flex: 1,
    fontSize: 14,
    color: "#1d1d1f",
    minWidth: 120,
  },
  permissionCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  allowedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D4F7E2",
    justifyContent: "center",
    alignItems: "center",
  },
  deniedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFE5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5ea",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1d1d1f",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f2f2f7",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    maxHeight: 400,
  },
  formSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f7",
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1d1d1f",
    marginBottom: 8,
    textAlign: "right",
  },
  textInputContainer: {
    borderWidth: 1,
    borderColor: "#d1d1d6",
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  textInput: {
    padding: 12,
    fontSize: 16,
    color: "#1d1d1f",
    textAlign: "right",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  permissionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  toggleAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f2f2f7",
    borderRadius: 6,
  },
  toggleAllText: {
    fontSize: 14,
    color: "#007AFF",
  },
  permissionGroup: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 12,
    textAlign: "right",
  },
  permissionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f7",
  },
  permissionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  permissionName: {
    fontSize: 16,
    color: "#1d1d1f",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e5ea",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f2f2f7",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#8E8E93",
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#d1d1d6",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
