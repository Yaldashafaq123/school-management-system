// app/(admin)/users/[id].tsx
import {
  AdminUser,
  adminUserApi,
  ClassOption,
  getRoleLabel,
  getStatusColor,
  getStatusLabel,
  SubjectOption,
  TeacherOption,
  UpdateUserData,
} from "@/src/config/adminUserApi";
import { Ionicons } from "@expo/vector-icons";
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
import { Header } from "../../../components/Header";
import { Colors } from "../../../constants/Colors";

// Complete ExtendedUser interface matching your Prisma schema
export interface ExtendedUser extends AdminUser {
  // Personal Information
  bio?: string;
  address?: string;
  birthDate?: string;
  rfidCode?: string; // Attendance card ID!

  // Academic Information
  grade?: string;
  school?: string;
  interests?: string[];

  // Student specific (from your schema)
  studentId?: number;
  studentStatus?: "ACTIVE" | "GRADUATED" | "SUSPENDED" | "LEFT";
  attendanceRecords?: {
    id: number;
    date: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    scannedAt?: string;
  }[];
  grades?: {
    id: number;
    subject: string;
    marks: number;
    exam: { name: string; date: string };
  }[];
  studentFees?: {
    id: number;
    amount: number;
    status: "PENDING" | "PAID" | "OVERDUE" | "PARTIAL";
    dueDate: string;
    feeCategory: { title: string; description?: string };
    payments?: { id: number; amount: number; confirmedAt: string }[];
  }[];

  // Teacher specific (from your schema)
  teacherId?: number;
  experience?: string;
  certification?: string;
  hourlyRate?: number;
  rating?: number;
  joiningDate?: string;
  contractEndDate?: string;
  baseSalary?: number;
  overtimeRate?: number;
  isActive?: boolean;
  teacherEducations?: { id: number; title: string }[];
  salaries?: {
    id: number;
    amount: number;
    month: number;
    year: number;
    status: "PENDING" | "PAID" | "PARTIAL";
    paidAmount?: number;
  }[];

  // Parent specific (from your schema)
  parentId?: number;
  children?: {
    id: number;
    name: string;
    email?: string;
    class?: string;
    className?: string;
  }[];
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionExpiry?: string;
  emergencyContact?: string;
  occupation?: string;
  relationship?: string;

  // Stats & Dates
  join_date?: string;
  last_login?: string;
  enrolled_courses?: number;
  completed_courses?: number;
  total_hours?: number;
  certificates?: number;
}

export default function UserDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ExtendedUser>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Reset Password Modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Modal states
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [searchStudentEmail, setSearchStudentEmail] = useState("");
  const [searchingStudent, setSearchingStudent] = useState(false);

  // Dropdown options
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Fetch dropdown options
  const fetchDropdownOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const [classesRes, teachersRes, subjectsRes] = await Promise.all([
        adminUserApi.getClasses(),
        adminUserApi.getTeachers(),
        adminUserApi.getSubjects(),
      ]);
      if (classesRes.success) setClasses(classesRes.data);
      if (teachersRes.success) setTeachers(teachersRes.data);
      if (subjectsRes.success) setSubjects(subjectsRes.data);
    } catch (error) {
      console.error("Error fetching options:", error);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  const fetchUserDetail = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await adminUserApi.getUser(parseInt(id));

      if (response.success && response.data) {
        // Transform all fields from your backend response
        const rawData = response.data as any;

        const extendedUser: ExtendedUser = {
          ...response.data,
          // Dates
          join_date: rawData.createdAt
            ? new Date(rawData.createdAt).toLocaleDateString("fa-IR")
            : "",
          last_login: rawData.lastLogin
            ? new Date(rawData.lastLogin).toLocaleString("fa-IR")
            : new Date(rawData.createdAt).toLocaleString("fa-IR"),
          // Stats
          enrolled_courses:
            rawData._count?.courses || rawData.stats?.coursesCount || 0,
          completed_courses: rawData.stats?.assignmentCount || 0,
          total_hours: 0,
          certificates: 0,
          // Personal from User model
          bio: rawData.bio || "",
          address: rawData.address || "",
          birthDate: rawData.birthDate || "",
          rfidCode: rawData.rfidCode || "", // ← Attendance card ID!
          // Student fields
          studentId: rawData.student?.id,
          studentStatus: rawData.student?.status || "ACTIVE",
          grade: rawData.student?.grade || "",
          school: rawData.student?.school || "",
          interests: rawData.student?.interests || [],
          attendanceRecords: rawData.student?.attendances || [],
          grades: rawData.student?.grades || [],
          studentFees: rawData.student?.studentFees || [],
          // Teacher fields
          teacherId: rawData.teacher?.id,
          experience: rawData.teacher?.experience,
          certification: rawData.teacher?.certification,
          hourlyRate: rawData.teacher?.hourlyRate,
          rating: rawData.teacher?.rating || 0,
          joiningDate: rawData.teacher?.joiningDate,
          contractEndDate: rawData.teacher?.contractEndDate,
          baseSalary: rawData.teacher?.baseSalary,
          overtimeRate: rawData.teacher?.overtimeRate,
          isActive: rawData.teacher?.isActive,
          teacherEducations: rawData.teacher?.educations || [],
          salaries: rawData.teacher?.salaries || [],
          subjects:
            rawData.teacher?.subjects?.map((s: any) => s.subject?.name || s) ||
            rawData.subjects ||
            [],
          // Parent fields
          parentId: rawData.parent?.id,
          children:
            rawData.parent?.students?.map((ps: any) => ({
              id: ps.student?.id,
              name: ps.student?.user?.fullName,
              email: ps.student?.user?.email,
              class: ps.student?.class?.name,
              className: ps.student?.class?.name,
            })) ||
            rawData.children ||
            [],
          subscriptionPlan: rawData.parent?.subscriptionPlan || "پایه",
          subscriptionStatus: rawData.parent?.subscriptionStatus || "active",
          subscriptionExpiry: rawData.parent?.subscriptionExpiry,
          emergencyContact: rawData.parent?.emergencyContact,
          occupation: rawData.parent?.occupation,
          relationship: rawData.parent?.relationship,
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
    fetchDropdownOptions();
  }, [fetchUserDetail, fetchDropdownOptions]);

  // ========== RESET PASSWORD FUNCTIONS ==========
  const handleOpenResetModal = () => {
    setResetPassword("");
    setResetConfirmPassword("");
    setShowResetModal(true);
  };

  const handleResetPasswordSubmit = async () => {
    if (!resetPassword || !resetConfirmPassword) {
      Alert.alert("خطا", "لطفاً رمز عبور جدید را وارد کنید");
      return;
    }

    if (resetPassword !== resetConfirmPassword) {
      Alert.alert("خطا", "رمز عبور جدید با تکرار آن مطابقت ندارد");
      return;
    }

    if (resetPassword.length < 6) {
      Alert.alert("خطا", "رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }

    setResettingPassword(true);
    try {
      const response = await adminUserApi.resetPasswordByEmail({
        email: user?.email || "",
        newPassword: resetPassword,
        confirmPassword: resetConfirmPassword,
      });

      if (response.success) {
        Alert.alert(
          "موفقیت",
          response.message || "رمز عبور با موفقیت تغییر کرد",
          [{ text: "متوجه شدم" }],
        );
        setShowResetModal(false);
        setResetPassword("");
        setResetConfirmPassword("");
        fetchUserDetail(); // Refresh user data
      } else {
        Alert.alert("خطا", response.message || "خطا در تغییر رمز عبور");
      }
    } catch (error: any) {
      console.error("Error resetting password:", error);
      Alert.alert(
        "خطا",
        error.response?.data?.message || "خطا در تغییر رمز عبور",
      );
    } finally {
      setResettingPassword(false);
    }
  };

  // ========== SEARCH STUDENT ==========
  const handleSearchStudent = async () => {
    if (!searchStudentEmail.trim()) {
      Alert.alert("خطا", "لطفا ایمیل دانش‌آموز را وارد کنید");
      return;
    }

    setSearchingStudent(true);
    try {
      const response =
        await adminUserApi.findStudentByEmail(searchStudentEmail);
      if (response.success && response.data) {
        setAvailableStudents([response.data]);
        Alert.alert(
          "دانش‌آموز یافت شد",
          `${response.data.name}\nکلاس: ${response.data.className || "نامشخص"}`,
          [
            { text: "لغو", style: "cancel" },
            {
              text: "اضافه کردن",
              onPress: () =>
                addChildToParent(response.data!.id, response.data!.name),
            },
          ],
        );
      } else {
        Alert.alert("خطا", "دانش‌آموزی با این ایمیل یافت نشد");
      }
    } catch (error) {
      console.error("Error searching student:", error);
      Alert.alert("خطا", "خطا در جستجوی دانش‌آموز");
    } finally {
      setSearchingStudent(false);
    }
  };

  const addChildToParent = async (studentId: number, studentName: string) => {
    if (!user?.id) return;

    // Update parent with new child
    const updateData: UpdateUserData = {
      childId: studentId,
    };

    try {
      const response = await adminUserApi.updateUser(user.id, updateData);
      if (response.success) {
        Alert.alert("موفقیت", `${studentName} با موفقیت اضافه شد`);
        fetchUserDetail(); // Refresh user data
        setShowChildSelector(false);
        setSearchStudentEmail("");
      } else {
        Alert.alert("خطا", response.message || "خطا در اضافه کردن دانش‌آموز");
      }
    } catch (error) {
      console.error("Error adding child:", error);
      Alert.alert("خطا", "خطا در اضافه کردن دانش‌آموز");
    }
  };

  // ========== SAVE USER ==========
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
        subjects: formData.subjects
          ?.map((s) => {
            // Handle both string subjects and IDs
            if (typeof s === "number") return s;
            const subject = subjects.find((sub) => sub.name === s);
            return subject?.id || 0;
          })
          .filter((id) => id > 0) as number[],
        teacherId: formData.teacherId,
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

  const handleSaveRfidCode = async () => {
    if (!user?.id || !formData.rfidCode) return;

    try {
      const response = await adminUserApi.updateUser(user.id, {
        ...formData,
        rfidCode: formData.rfidCode,
      } as any);

      if (response.success) {
        Alert.alert("موفقیت", "کد کارت حضور با موفقیت ثبت شد");
        setEditing(false);
        fetchUserDetail();
      } else {
        Alert.alert("خطا", response.message || "خطا در ثبت کد کارت");
      }
    } catch (error) {
      console.error("Error saving RFID:", error);
      Alert.alert("خطا", "خطا در ثبت کد کارت");
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
            {/* 🆕 Reset Password Button */}
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={handleOpenResetModal}
            >
              <Ionicons name="key" size={24} color={Colors.warning} />
            </TouchableOpacity>

            {/* Edit Button */}
            <TouchableOpacity
              style={styles.headerActionButton}
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

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user.stats?.coursesCount || user.stats?.assignmentCount || 0}
            </Text>
            <Text style={styles.statLabel}>دوره‌ها</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user.stats?.attendanceCount ||
                user.attendanceRecords?.length ||
                0}
            </Text>
            <Text style={styles.statLabel}>حضور</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.grades?.length || 0}</Text>
            <Text style={styles.statLabel}>نمرات</Text>
          </View>
        </View>

        {/* ========== CONTACT INFORMATION ========== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات تماس</Text>
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

        {/* ========== ATTENDANCE CARD ID (RFID) ========== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>کارت حضور</Text>
          <View style={[styles.infoCard, styles.rfidCard]}>
            <Ionicons name="card" size={24} color={Colors.primary} />
            {editing ? (
              <View style={styles.rfidEditContainer}>
                <TextInput
                  style={styles.rfidInput}
                  value={formData.rfidCode}
                  onChangeText={(text) =>
                    setFormData({ ...formData, rfidCode: text })
                  }
                  placeholder="شناسه کارت RFID را اسکن یا وارد کنید"
                  textAlign="center"
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.rfidSaveButton}
                  onPress={handleSaveRfidCode}
                >
                  <Text style={styles.rfidSaveText}>ذخیره کارت</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.rfidValue}>
                {user.rfidCode || "هیچ کارتی ثبت نشده است"}
              </Text>
            )}
            <Text style={styles.rfidHint}>
              برای ثبت کارت حضور، آن را روی دستگاه اسکنر قرار دهید یا کد را وارد
              کنید
            </Text>
          </View>
        </View>

        {/* ========== PERSONAL INFORMATION ========== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات شخصی</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons
                name="document-text"
                size={20}
                color={Colors.textSecondary}
              />
              {editing ? (
                <TextInput
                  style={[styles.editInput, styles.multilineInput]}
                  value={formData.bio}
                  onChangeText={(text) =>
                    setFormData({ ...formData, bio: text })
                  }
                  placeholder="بیوگرافی"
                  multiline
                  numberOfLines={3}
                  textAlign="right"
                />
              ) : (
                <Text style={styles.infoText}>{user.bio || "ثبت نشده"}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="location"
                size={20}
                color={Colors.textSecondary}
              />
              {editing ? (
                <TextInput
                  style={styles.editInput}
                  value={formData.address}
                  onChangeText={(text) =>
                    setFormData({ ...formData, address: text })
                  }
                  placeholder="آدرس"
                  textAlign="right"
                />
              ) : (
                <Text style={styles.infoText}>
                  {user.address || "ثبت نشده"}
                </Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="calendar"
                size={20}
                color={Colors.textSecondary}
              />
              {editing ? (
                <TextInput
                  style={styles.editInput}
                  value={formData.birthDate}
                  onChangeText={(text) =>
                    setFormData({ ...formData, birthDate: text })
                  }
                  placeholder="تاریخ تولد (مثال: 1380/01/01)"
                  textAlign="right"
                />
              ) : (
                <Text style={styles.infoText}>
                  {user.birthDate || "ثبت نشده"}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ========== STUDENT SPECIFIC ========== */}
        {user.role === "student" && (
          <>
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
                    <View style={styles.dropdownContainer}>
                      <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => {
                          Alert.alert(
                            "انتخاب کلاس",
                            classes.map((c) => `${c.id}: ${c.name}`).join("\n"),
                            [
                              { text: "لغو", style: "cancel" },
                              {
                                text: "وارد کردن ID",
                                onPress: () => {
                                  const id = prompt("شناسه کلاس را وارد کنید:");
                                  if (id)
                                    setFormData({
                                      ...formData,
                                      classId: parseInt(id),
                                    });
                                },
                              },
                            ],
                          );
                        }}
                      >
                        <Text style={styles.dropdownText}>
                          {formData.classId
                            ? classes.find((c) => c.id === formData.classId)
                                ?.name || `کلاس ${formData.classId}`
                            : "انتخاب کلاس"}
                        </Text>
                        <Ionicons
                          name="chevron-down"
                          size={16}
                          color={Colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.infoText}>
                      {user.className || user.classId
                        ? `کلاس ${user.className || user.classId}`
                        : "ثبت نشده"}
                    </Text>
                  )}
                </View>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="ribbon"
                    size={20}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.infoText}>
                    وضعیت تحصیلی:{" "}
                    {user.studentStatus === "ACTIVE"
                      ? "فعال"
                      : user.studentStatus === "GRADUATED"
                        ? "فارغ التحصیل"
                        : user.studentStatus === "SUSPENDED"
                          ? "تعلیق"
                          : "ترک تحصیل"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="business"
                    size={20}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.infoText}>
                    مدرسه: {user.school || "ثبت نشده"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Attendance Records */}
            {user.attendanceRecords && user.attendanceRecords.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>سوابق حضور و غیاب</Text>
                <View style={styles.infoCard}>
                  {user.attendanceRecords.slice(0, 10).map((record) => (
                    <View key={record.id} style={styles.attendanceRow}>
                      <Text style={styles.attendanceDate}>
                        {new Date(record.date).toLocaleDateString("fa-IR")}
                      </Text>
                      <View
                        style={[
                          styles.attendanceBadge,
                          {
                            backgroundColor:
                              record.status === "PRESENT"
                                ? "#D4F7E2"
                                : record.status === "LATE"
                                  ? "#FFF4E5"
                                  : "#FFE5E5",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.attendanceStatus,
                            {
                              color:
                                record.status === "PRESENT"
                                  ? "#34C759"
                                  : record.status === "LATE"
                                    ? "#FF9500"
                                    : "#FF3B30",
                            },
                          ]}
                        >
                          {record.status === "PRESENT"
                            ? "حاضر"
                            : record.status === "ABSENT"
                              ? "غایب"
                              : record.status === "LATE"
                                ? "تأخیر"
                                : "مرخصی"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Grades */}
            {user.grades && user.grades.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>نمرات</Text>
                <View style={styles.infoCard}>
                  {user.grades.map((grade) => (
                    <View key={grade.id} style={styles.gradeRow}>
                      <View>
                        <Text style={styles.gradeSubject}>{grade.subject}</Text>
                        <Text style={styles.gradeExam}>
                          {grade.exam?.name || "امتحان"}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.gradeValue,
                          {
                            backgroundColor:
                              grade.marks >= 10 ? "#D4F7E2" : "#FFE5E5",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.gradeText,
                            {
                              color: grade.marks >= 10 ? "#34C759" : "#FF3B30",
                            },
                          ]}
                        >
                          {grade.marks}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Student Fees */}
            {user.studentFees && user.studentFees.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>شهریه‌ها</Text>
                <View style={styles.infoCard}>
                  {user.studentFees.map((fee) => (
                    <View key={fee.id} style={styles.feeRow}>
                      <View style={styles.feeLeft}>
                        <Text style={styles.feeTitle}>
                          {fee.feeCategory.title}
                        </Text>
                        <Text style={styles.feeDueDate}>
                          سررسید:{" "}
                          {new Date(fee.dueDate).toLocaleDateString("fa-IR")}
                        </Text>
                        {fee.feeCategory.description && (
                          <Text style={styles.feeDesc}>
                            {fee.feeCategory.description}
                          </Text>
                        )}
                      </View>
                      <View style={styles.feeRight}>
                        <Text style={styles.feeAmount}>
                          {fee.amount.toLocaleString()} تومان
                        </Text>
                        <View
                          style={[
                            styles.feeStatusBadge,
                            {
                              backgroundColor:
                                fee.status === "PAID"
                                  ? "#D4F7E2"
                                  : fee.status === "PARTIAL"
                                    ? "#FFF4E5"
                                    : "#FFE5E5",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.feeStatusText,
                              {
                                color:
                                  fee.status === "PAID"
                                    ? "#34C759"
                                    : fee.status === "PARTIAL"
                                      ? "#FF9500"
                                      : "#FF3B30",
                              },
                            ]}
                          >
                            {fee.status === "PAID"
                              ? "پرداخت شده"
                              : fee.status === "PENDING"
                                ? "در انتظار"
                                : fee.status === "PARTIAL"
                                  ? "پرداخت جزئی"
                                  : "جریمه"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* ========== TEACHER SPECIFIC ========== */}
        {user.role === "teacher" && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>اطلاعات حرفه‌ای</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="briefcase"
                    size={20}
                    color={Colors.textSecondary}
                  />
                  {editing ? (
                    <TextInput
                      style={styles.editInput}
                      value={formData.experience}
                      onChangeText={(text) =>
                        setFormData({ ...formData, experience: text })
                      }
                      placeholder="سابقه کاری"
                      textAlign="right"
                    />
                  ) : (
                    <Text style={styles.infoText}>
                      {user.experience || "ثبت نشده"}
                    </Text>
                  )}
                </View>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="ribbon"
                    size={20}
                    color={Colors.textSecondary}
                  />
                  {editing ? (
                    <TextInput
                      style={styles.editInput}
                      value={formData.certification}
                      onChangeText={(text) =>
                        setFormData({ ...formData, certification: text })
                      }
                      placeholder="گواهینامه‌ها"
                      textAlign="right"
                    />
                  ) : (
                    <Text style={styles.infoText}>
                      {user.certification || "ثبت نشده"}
                    </Text>
                  )}
                </View>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="cash"
                    size={20}
                    color={Colors.textSecondary}
                  />
                  {editing ? (
                    <TextInput
                      style={styles.editInput}
                      value={formData.hourlyRate?.toString()}
                      onChangeText={(text) =>
                        setFormData({
                          ...formData,
                          hourlyRate: parseFloat(text) || 0,
                        })
                      }
                      placeholder="نرخ ساعتی (تومان)"
                      keyboardType="numeric"
                      textAlign="right"
                    />
                  ) : (
                    <Text style={styles.infoText}>
                      {user.hourlyRate
                        ? `${user.hourlyRate.toLocaleString()} تومان`
                        : "ثبت نشده"}
                    </Text>
                  )}
                </View>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="trending-up"
                    size={20}
                    color={Colors.textSecondary}
                  />
                  {editing ? (
                    <TextInput
                      style={styles.editInput}
                      value={formData.baseSalary?.toString()}
                      onChangeText={(text) =>
                        setFormData({
                          ...formData,
                          baseSalary: parseFloat(text) || 0,
                        })
                      }
                      placeholder="حقوق پایه (تومان)"
                      keyboardType="numeric"
                      textAlign="right"
                    />
                  ) : (
                    <Text style={styles.infoText}>
                      {user.baseSalary
                        ? `${user.baseSalary.toLocaleString()} تومان`
                        : "ثبت نشده"}
                    </Text>
                  )}
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="star" size={20} color={Colors.warning} />
                  <Text style={styles.infoText}>
                    امتیاز: {user.rating || 0} / 5
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="calendar"
                    size={20}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.infoText}>
                    تاریخ شروع: {user.joiningDate || "ثبت نشده"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="alert-circle"
                    size={20}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.infoText}>
                    وضعیت: {user.isActive !== false ? "فعال" : "غیرفعال"}
                  </Text>
                </View>

                {/* Subjects taught */}
                {user.subjects && user.subjects.length > 0 && (
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="bookmarks"
                      size={20}
                      color={Colors.textSecondary}
                    />
                    <View style={styles.subjectsContainer}>
                      {user.subjects.map((subject, index) => (
                        <View key={index} style={styles.subjectTag}>
                          <Text style={styles.subjectText}>{subject}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Teacher Educations */}
            {user.teacherEducations && user.teacherEducations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>تحصیلات</Text>
                <View style={styles.infoCard}>
                  {user.teacherEducations.map((edu) => (
                    <View key={edu.id} style={styles.educationItem}>
                      <Ionicons
                        name="school-outline"
                        size={16}
                        color={Colors.primary}
                      />
                      <Text style={styles.educationText}>{edu.title}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Teacher Salaries */}
            {user.salaries && user.salaries.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>سوابق حقوق</Text>
                <View style={styles.infoCard}>
                  {user.salaries.map((salary) => (
                    <View key={salary.id} style={styles.salaryRow}>
                      <View>
                        <Text style={styles.salaryPeriod}>
                          {salary.month}/{salary.year}
                        </Text>
                        <Text style={styles.salaryAmount}>
                          {salary.amount.toLocaleString()} تومان
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.salaryStatusBadge,
                          {
                            backgroundColor:
                              salary.status === "PAID"
                                ? "#D4F7E2"
                                : salary.status === "PARTIAL"
                                  ? "#FFF4E5"
                                  : "#FFE5E5",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.salaryStatusText,
                            {
                              color:
                                salary.status === "PAID"
                                  ? "#34C759"
                                  : salary.status === "PARTIAL"
                                    ? "#FF9500"
                                    : "#FF3B30",
                            },
                          ]}
                        >
                          {salary.status === "PAID"
                            ? "پرداخت شده"
                            : salary.status === "PARTIAL"
                              ? "پرداخت جزئی"
                              : "در انتظار"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* ========== PARENT SPECIFIC ========== */}
        {user.role === "parent" && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>اطلاعات والدین</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="briefcase"
                    size={20}
                    color={Colors.textSecondary}
                  />
                  {editing ? (
                    <TextInput
                      style={styles.editInput}
                      value={formData.occupation}
                      onChangeText={(text) =>
                        setFormData({ ...formData, occupation: text })
                      }
                      placeholder="شغل"
                      textAlign="right"
                    />
                  ) : (
                    <Text style={styles.infoText}>
                      {user.occupation || "ثبت نشده"}
                    </Text>
                  )}
                </View>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="people"
                    size={20}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.infoText}>
                    پلن اشتراک: {user.subscriptionPlan || "پایه"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.infoText}>
                    وضعیت اشتراک:{" "}
                    {user.subscriptionStatus === "active" ? "فعال" : "غیرفعال"}
                  </Text>
                </View>
                {user.subscriptionExpiry && (
                  <View style={styles.infoRow}>
                    <Ionicons name="time" size={20} color={Colors.warning} />
                    <Text style={styles.infoText}>
                      انقضای اشتراک:{" "}
                      {new Date(user.subscriptionExpiry).toLocaleDateString(
                        "fa-IR",
                      )}
                    </Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.infoText}>
                    تماس اضطراری: {user.emergencyContact || "ثبت نشده"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="heart"
                    size={20}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.infoText}>
                    نسبت با دانش‌آموز: {user.relationship || "ثبت نشده"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Children Management */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>فرزندان</Text>
              <View style={styles.infoCard}>
                {user.children && user.children.length > 0 ? (
                  user.children.map((child) => (
                    <View key={child.id} style={styles.childItem}>
                      <Ionicons
                        name="person"
                        size={16}
                        color={Colors.primary}
                      />
                      <View style={styles.childInfo}>
                        <Text style={styles.childName}>{child.name}</Text>
                        <Text style={styles.childEmail}>{child.email}</Text>
                        {child.class && (
                          <Text style={styles.childClass}>{child.class}</Text>
                        )}
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>هیچ فرزندی ثبت نشده است</Text>
                )}

                {/* Add child button for parents in edit mode */}
                {editing && (
                  <TouchableOpacity
                    style={styles.addChildButton}
                    onPress={() => setShowChildSelector(true)}
                  >
                    <Ionicons
                      name="add-circle"
                      size={20}
                      color={Colors.primary}
                    />
                    <Text style={styles.addChildText}>افزودن فرزند جدید</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </>
        )}

        {/* ========== MANAGEMENT ACTIONS ========== */}
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
          <View style={styles.verifiedRow}>
            <Text style={styles.verifiedLabel}>تأیید شده:</Text>
            {editing ? (
              <Switch
                value={formData.verified}
                onValueChange={(value) =>
                  setFormData({ ...formData, verified: value })
                }
                trackColor={{ false: Colors.border, true: Colors.primary }}
              />
            ) : (
              <Text
                style={[
                  styles.verifiedValue,
                  { color: user.verified ? Colors.success : Colors.danger },
                ]}
              >
                {user.verified ? "بله" : "خیر"}
              </Text>
            )}
          </View>
        </View>

        {/* ========== DANGER ZONE ========== */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>
            منطقه خطر
          </Text>
          <View style={styles.dangerCard}>
            {/* 🆕 Reset Password Button in Danger Zone */}
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleOpenResetModal}
            >
              <Ionicons name="key" size={20} color={Colors.warning} />
              <Text style={styles.dangerButtonText}>بازنشانی رمز عبور</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dangerButton, styles.deleteButton]}
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

        {/* ========== SAVE/CANCEL BUTTONS ========== */}
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

      {/* ========== RESET PASSWORD MODAL ========== */}
      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowResetModal(false);
          setResetPassword("");
          setResetConfirmPassword("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>بازنشانی رمز عبور</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowResetModal(false);
                  setResetPassword("");
                  setResetConfirmPassword("");
                }}
              >
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              تغییر رمز عبور برای:{" "}
              <Text style={styles.emailHighlight}>{user?.email}</Text>
            </Text>

            <View style={styles.resetInputContainer}>
              <Ionicons
                name="lock-closed"
                size={20}
                color={Colors.textSecondary}
              />
              <TextInput
                style={styles.resetInput}
                placeholder="رمز عبور جدید"
                placeholderTextColor={Colors.textSecondary}
                value={resetPassword}
                onChangeText={setResetPassword}
                secureTextEntry={!showResetPassword}
                textAlign="right"
              />
              <TouchableOpacity
                onPress={() => setShowResetPassword(!showResetPassword)}
              >
                <Ionicons
                  name={showResetPassword ? "eye" : "eye-off"}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.resetInputContainer}>
              <Ionicons
                name="lock-closed"
                size={20}
                color={Colors.textSecondary}
              />
              <TextInput
                style={styles.resetInput}
                placeholder="تکرار رمز عبور جدید"
                placeholderTextColor={Colors.textSecondary}
                value={resetConfirmPassword}
                onChangeText={setResetConfirmPassword}
                secureTextEntry={!showResetPassword}
                textAlign="right"
              />
            </View>

            <View style={styles.passwordHint}>
              <Text style={styles.hintText}>
                • رمز عبور باید حداقل ۶ کاراکتر باشد
              </Text>
            </View>

            <View style={styles.resetActions}>
              <TouchableOpacity
                style={[styles.resetButton, styles.cancelResetButton]}
                onPress={() => {
                  setShowResetModal(false);
                  setResetPassword("");
                  setResetConfirmPassword("");
                }}
                disabled={resettingPassword}
              >
                <Text style={styles.cancelResetText}>لغو</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resetButton, styles.confirmResetButton]}
                onPress={handleResetPasswordSubmit}
                disabled={resettingPassword}
              >
                {resettingPassword ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmResetText}>تغییر رمز عبور</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for adding child to parent */}
      <Modal
        visible={showChildSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChildSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>افزودن فرزند</Text>
            <Text style={styles.modalSubtitle}>
              برای افزودن دانش‌آموز به عنوان فرزند، ایمیل او را وارد کنید
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="ایمیل دانش‌آموز"
              value={searchStudentEmail}
              onChangeText={setSearchStudentEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.modalSearchButton}
              onPress={handleSearchStudent}
              disabled={searchingStudent}
            >
              {searchingStudent ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalSearchText}>جستجو</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowChildSelector(false);
                setSearchStudentEmail("");
              }}
            >
              <Text style={styles.modalCancelText}>لغو</Text>
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
  headerActionButton: {
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
    alignItems: "flex-start",
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
  multilineInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  dropdownContainer: {
    flex: 1,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 8,
    backgroundColor: Colors.background,
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.text,
  },
  subjectsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    flex: 1,
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
  // RFID Card styles
  rfidCard: {
    alignItems: "center",
    backgroundColor: Colors.primary + "10",
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  rfidEditContainer: {
    width: "100%",
    marginTop: 12,
  },
  rfidInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "monospace",
    textAlign: "center",
    backgroundColor: Colors.background,
  },
  rfidValue: {
    fontSize: 16,
    fontFamily: "monospace",
    fontWeight: "bold",
    color: Colors.primary,
    marginTop: 8,
  },
  rfidSaveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    alignItems: "center",
  },
  rfidSaveText: {
    color: "#fff",
    fontWeight: "bold",
  },
  rfidHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  // Attendance styles
  attendanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  attendanceDate: {
    fontSize: 14,
    color: Colors.text,
  },
  attendanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  attendanceStatus: {
    fontSize: 12,
    fontWeight: "500",
  },
  // Grade styles
  gradeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  gradeSubject: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  gradeExam: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  gradeValue: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  gradeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  // Fee styles
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  feeLeft: {
    flex: 1,
  },
  feeTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  feeDueDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  feeDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  feeRight: {
    alignItems: "flex-end",
  },
  feeAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
  },
  feeStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  feeStatusText: {
    fontSize: 10,
    fontWeight: "500",
  },
  // Teacher styles
  educationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  educationText: {
    fontSize: 14,
    color: Colors.text,
  },
  salaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  salaryPeriod: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  salaryAmount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  salaryStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  salaryStatusText: {
    fontSize: 11,
    fontWeight: "500",
  },
  // Parent styles
  childItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  childEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  childClass: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingVertical: 16,
  },
  addChildButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    backgroundColor: Colors.primary + "10",
    borderRadius: 8,
    marginTop: 8,
  },
  addChildText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  // Management styles
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
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
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  verifiedLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  verifiedValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  // Danger zone
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
  deleteButton: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
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
  // Action buttons
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
  // Reset Password Modal styles
  resetInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  resetInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginHorizontal: 8,
  },
  resetActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelResetButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelResetText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  confirmResetButton: {
    backgroundColor: Colors.warning,
  },
  confirmResetText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  passwordHint: {
    marginBottom: 12,
  },
  hintText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emailHighlight: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.background,
    marginBottom: 16,
  },
  modalSearchButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  modalSearchText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalCancelButton: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCancelText: {
    color: Colors.text,
    fontSize: 16,
  },
});
