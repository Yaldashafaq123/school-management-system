import {
  adminUserApi,
  CreateUserData,
  UpdateUserData,
} from "@/src/config/adminUserApi";
import {
  Building,
  Edit2,
  Key,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Define TypeScript interfaces
interface StaffMember {
  id: number;
  fullName: string;
  position: string;
  department: string;
  email: string;
  phone: string | null; // Changed to match API type
  hireDate: string;
  status: "active" | "inactive" | "suspended";
}

interface NewStaff {
  fullName: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hireDate: string;
  status: "active" | "inactive" | "suspended";
}

interface Filter {
  id: string;
  label: string;
}

export default function NonTeachingStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newStaff, setNewStaff] = useState<NewStaff>({
    fullName: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    hireDate: "",
    status: "active",
  });

  const filters: Filter[] = [
    { id: "all", label: "همه" },
    { id: "Finance", label: "مالی" },
    { id: "IT", label: "فناوری اطلاعات" },
    { id: "Facilities", label: "تاسیسات" },
    { id: "Administration", label: "مدیریت" },
    { id: "Library", label: "کتابخانه" },
    { id: "Security", label: "امنیت" },
    { id: "Transport", label: "ترابری" },
    { id: "Health", label: "بهداشت" },
  ];

  const departments = [
    "مالی",
    "فناوری اطلاعات",
    "تاسیسات",
    "مدیریت",
    "کتابخانه",
    "امنیت",
    "ترابری",
    "بهداشت",
  ];
  const positions = [
    "حسابدار",
    "پشتیبان فناوری اطلاعات",
    "نگهداری",
    "دستیار اداری",
    "کتابدار",
    "نگهبان",
    "راننده",
    "پرستار",
  ];

  // Fetch staff users (users with role = 'admin' for non-teaching staff)
  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminUserApi.getUsers({
        role: "admin", // Get all admin users (non-teaching staff)
        limit: 100,
      });

      if (response.success && response.data.users) {
        // Transform AdminUser to StaffMember format
        const staffMembers: StaffMember[] = response.data.users.map((user) => ({
          id: user.id,
          fullName: user.fullName,
          position: "کارمند اداری", // Default position
          department: "مدیریت", // Default department
          email: user.email,
          phone: user.phone, // This is already string | null from API
          hireDate: new Date(user.createdAt).toISOString().split("T")[0],
          status: user.status,
        }));
        setStaff(staffMembers);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      Alert.alert("خطا", "در دریافت لیست کارکنان مشکلی پیش آمده");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleSaveStaff = async () => {
    if (!newStaff.fullName || !newStaff.position || !newStaff.department) {
      Alert.alert("خطا", "لطفاً فیلدهای اجباری را پر کنید");
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingStaff) {
        // Update existing staff
        const updateData: UpdateUserData = {
          fullName: newStaff.fullName,
          email: newStaff.email,
          phone: newStaff.phone || undefined,
          role: "admin", // Non-teaching staff are admins
          status: newStaff.status,
        };

        const response = await adminUserApi.updateUser(
          editingStaff.id,
          updateData,
        );

        if (response.success) {
          Alert.alert("موفقیت", "اطلاعات کارمند با موفقیت بروزرسانی شد");
          fetchStaff();
          setShowAddModal(false);
          setEditingStaff(null);
          resetForm();
        } else {
          Alert.alert(
            "خطا",
            response.message || "در بروزرسانی اطلاعات مشکلی پیش آمده",
          );
        }
      } else {
        // Create new staff
        const createData: CreateUserData = {
          fullName: newStaff.fullName,
          email: newStaff.email,
          phone: newStaff.phone || undefined,
          password: generateRandomPassword(),
          role: "admin", // Non-teaching staff are admins
        };

        const response = await adminUserApi.createUser(createData);

        if (response.success) {
          Alert.alert("موفقیت", "کارمند جدید با موفقیت اضافه شد");
          fetchStaff();
          setShowAddModal(false);
          resetForm();
        } else {
          Alert.alert(
            "خطا",
            response.message || "در ایجاد کارمند مشکلی پیش آمده",
          );
        }
      }
    } catch (error) {
      console.error("Error saving staff:", error);
      Alert.alert("خطا", "در ذخیره اطلاعات مشکلی پیش آمده");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateRandomPassword = () => {
    const length = 8;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const resetForm = () => {
    setNewStaff({
      fullName: "",
      position: "",
      department: "",
      email: "",
      phone: "",
      hireDate: "",
      status: "active",
    });
  };

  const handleEdit = (staffMember: StaffMember) => {
    setEditingStaff(staffMember);
    setNewStaff({
      fullName: staffMember.fullName,
      position: staffMember.position,
      department: staffMember.department,
      email: staffMember.email,
      phone: staffMember.phone || "",
      hireDate: staffMember.hireDate,
      status: staffMember.status,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: number) => {
    Alert.alert("حذف کارمند", "آیا از حذف این کارمند اطمینان دارید؟", [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await adminUserApi.deleteUser(id);

            if (response.success) {
              Alert.alert("موفقیت", "کارمند با موفقیت حذف شد");
              fetchStaff();
            } else {
              Alert.alert(
                "خطا",
                response.message || "در حذف کارمند مشکلی پیش آمده",
              );
            }
          } catch (error) {
            console.error("Error deleting staff:", error);
            Alert.alert("خطا", "در حذف کارمند مشکلی پیش آمده");
          }
        },
      },
    ]);
  };

  const handleResetPassword = async (staffMember: StaffMember) => {
    Alert.alert(
      "بازنشانی رمز عبور",
      `آیا از بازنشانی رمز عبور ${staffMember.fullName} اطمینان دارید؟`,
      [
        { text: "لغو", style: "cancel" },
        {
          text: "بازنشانی",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await adminUserApi.resetUserPassword(
                staffMember.id,
              );

              if (response.success) {
                Alert.alert(
                  "موفقیت",
                  `رمز عبور با موفقیت بازنشانی شد.\n${response.newPassword ? `رمز عبور جدید: ${response.newPassword}` : "پسورد جدید به ایمیل کاربر ارسال شد"}`,
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

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === "all" || member.department === selectedFilter;

    return matchesSearch && matchesFilter;
  });

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
            <Text style={styles.title}>کارکنان غیرآموزشی</Text>
            <Text style={styles.subtitle}>مدیریت کارکنان اداری و پشتیبانی</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>افزودن کارمند</Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filters */}
        <View style={styles.controls}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="جستجو بر اساس نام، سمت..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              textAlign="right"
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.id && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter.id && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={24} color="#007AFF" />
            <Text style={styles.statValue}>{staff.length}</Text>
            <Text style={styles.statLabel}>کل کارکنان</Text>
          </View>
          <View style={styles.statCard}>
            <Building size={24} color="#34C759" />
            <Text style={styles.statValue}>
              {new Set(staff.map((s) => s.department)).size}
            </Text>
            <Text style={styles.statLabel}>بخش‌ها</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={24} color="#FF9500" />
            <Text style={styles.statValue}>
              {staff.filter((s) => s.status === "active").length}
            </Text>
            <Text style={styles.statLabel}>فعال</Text>
          </View>
        </View>

        {/* Staff List */}
        <View style={styles.staffContainer}>
          <Text style={styles.sectionTitle}>
            لیست کارکنان ({filteredStaff.length})
          </Text>

          {filteredStaff.map((staffMember) => (
            <View key={staffMember.id} style={styles.staffCard}>
              <View style={styles.staffInfo}>
                <View style={styles.staffHeader}>
                  <Text style={styles.staffName}>{staffMember.fullName}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          staffMember.status === "active"
                            ? "#D4F7E2"
                            : "#FFE5E5",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            staffMember.status === "active"
                              ? "#34C759"
                              : "#FF3B30",
                        },
                      ]}
                    >
                      {staffMember.status === "active" ? "فعال" : "غیرفعال"}
                    </Text>
                  </View>
                </View>

                <View style={styles.staffDetails}>
                  <View style={styles.detailRow}>
                    <Building size={14} color="#8E8E93" />
                    <Text style={styles.detailText}>
                      {staffMember.position}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Building size={14} color="#8E8E93" />
                    <Text style={styles.detailText}>
                      {staffMember.department}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Mail size={14} color="#8E8E93" />
                    <Text style={styles.detailText}>{staffMember.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Phone size={14} color="#8E8E93" />
                    <Text style={styles.detailText}>
                      {staffMember.phone || "ثبت نشده"}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.staffActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleResetPassword(staffMember)}
                >
                  <Key size={16} color="#FF9500" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEdit(staffMember)}
                >
                  <Edit2 size={16} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#FFE5E5" }]}
                  onPress={() => handleDelete(staffMember.id)}
                >
                  <Trash2 size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingStaff ? "ویرایش کارمند" : "افزودن کارمند جدید"}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setShowAddModal(false);
                    setEditingStaff(null);
                    resetForm();
                  }}
                >
                  <X size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>نام کامل *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="نام کامل را وارد کنید"
                    value={newStaff.fullName}
                    onChangeText={(text) =>
                      setNewStaff({ ...newStaff, fullName: text })
                    }
                    textAlign="right"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>سمت *</Text>
                  <View style={styles.optionsGrid}>
                    {positions.map((position) => (
                      <TouchableOpacity
                        key={position}
                        style={[
                          styles.optionButton,
                          newStaff.position === position &&
                            styles.optionButtonActive,
                        ]}
                        onPress={() => setNewStaff({ ...newStaff, position })}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            newStaff.position === position &&
                              styles.optionTextActive,
                          ]}
                        >
                          {position}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>بخش *</Text>
                  <View style={styles.optionsGrid}>
                    {departments.map((dept) => (
                      <TouchableOpacity
                        key={dept}
                        style={[
                          styles.optionButton,
                          newStaff.department === dept &&
                            styles.optionButtonActive,
                        ]}
                        onPress={() =>
                          setNewStaff({ ...newStaff, department: dept })
                        }
                      >
                        <Text
                          style={[
                            styles.optionText,
                            newStaff.department === dept &&
                              styles.optionTextActive,
                          ]}
                        >
                          {dept}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>آدرس ایمیل</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ایمیل را وارد کنید"
                    value={newStaff.email}
                    onChangeText={(text) =>
                      setNewStaff({ ...newStaff, email: text })
                    }
                    keyboardType="email-address"
                    textAlign="right"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>شماره تماس</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="شماره تماس را وارد کنید"
                    value={newStaff.phone}
                    onChangeText={(text) =>
                      setNewStaff({ ...newStaff, phone: text })
                    }
                    keyboardType="phone-pad"
                    textAlign="right"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>تاریخ استخدام</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={newStaff.hireDate}
                    onChangeText={(text) =>
                      setNewStaff({ ...newStaff, hireDate: text })
                    }
                    textAlign="right"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>وضعیت</Text>
                  <View style={styles.statusOptions}>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        newStaff.status === "active" &&
                          styles.statusButtonActive,
                      ]}
                      onPress={() =>
                        setNewStaff({ ...newStaff, status: "active" })
                      }
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          newStaff.status === "active" &&
                            styles.statusButtonTextActive,
                        ]}
                      >
                        فعال
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        newStaff.status === "inactive" &&
                          styles.statusButtonActive,
                      ]}
                      onPress={() =>
                        setNewStaff({ ...newStaff, status: "inactive" })
                      }
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          newStaff.status === "inactive" &&
                            styles.statusButtonTextActive,
                        ]}
                      >
                        غیرفعال
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddModal(false);
                    setEditingStaff(null);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>لغو</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    isSubmitting && styles.saveButtonDisabled,
                  ]}
                  onPress={handleSaveStaff}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editingStaff ? "بروزرسانی" : "افزودن"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  controls: {
    backgroundColor: "white",
    padding: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f7",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#1d1d1f",
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f2f2f7",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#007AFF",
  },
  filterText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  filterTextActive: {
    color: "white",
    fontWeight: "500",
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#1d1d1f",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#8E8E93",
  },
  staffContainer: {
    padding: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 16,
  },
  staffCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  staffInfo: {
    flex: 1,
  },
  staffHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1d1d1f",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  staffDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  staffActions: {
    justifyContent: "center",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f2f2f7",
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
    padding: 20,
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
  input: {
    borderWidth: 1,
    borderColor: "#d1d1d6",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
    textAlign: "right",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f2f2f7",
  },
  optionButtonActive: {
    backgroundColor: "#007AFF",
  },
  optionText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  optionTextActive: {
    color: "white",
    fontWeight: "500",
  },
  statusOptions: {
    flexDirection: "row",
    gap: 12,
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f2f2f7",
    alignItems: "center",
  },
  statusButtonActive: {
    backgroundColor: "#007AFF",
  },
  statusButtonText: {
    fontSize: 14,
    color: "#8E8E93",
    fontWeight: "500",
  },
  statusButtonTextActive: {
    color: "white",
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
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
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
