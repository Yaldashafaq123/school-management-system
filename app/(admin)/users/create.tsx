// app/(admin)/users/create.tsx
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import {
  adminUserApi,
  ClassOption,
  TeacherOption,
  UserRole,
} from "@/src/config/adminUserApi";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Enums matching your schema
type Sex = "MALE" | "FEMALE" | "OTHER";
type MaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED";
type BloodType =
  | "A_POSITIVE"
  | "A_NEGATIVE"
  | "B_POSITIVE"
  | "B_NEGATIVE"
  | "AB_POSITIVE"
  | "AB_NEGATIVE"
  | "O_POSITIVE"
  | "O_NEGATIVE";
type EducationLevel =
  | "NO_FORMAL"
  | "PRIMARY"
  | "SECONDARY"
  | "HIGH_SCHOOL"
  | "BACHELORS"
  | "MASTERS"
  | "DOCTORATE"
  | "OTHER";
type ContractType =
  | "PERMANENT"
  | "TEMPORARY"
  | "CONTRACT"
  | "CASUAL"
  | "PROBATION";
type WorkShift =
  | "MORNING"
  | "AFTERNOON"
  | "EVENING"
  | "NIGHT"
  | "ROTATING"
  | "FLEXIBLE";
type EnrollmentType = "NEW" | "TRANSFER" | "RE_ENROLL";

export default function CreateUserScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [childEmail, setChildEmail] = useState("");
  const [searchingChild, setSearchingChild] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<{
    visible: boolean;
    field: string;
  }>({ visible: false, field: "" });

  const [formData, setFormData] = useState({
    // Basic Info
    fullName: "",
    nameFarsi: "",
    email: "",
    phone: "",
    password: "",
    role: "student" as UserRole,
    isActive: true,
    verified: true,

    // Personal Info
    fatherName: "",
    fatherNameFarsi: "",
    grandfatherName: "",
    grandfatherNameFarsi: "",
    sex: "" as Sex | "",
    maritalStatus: "" as MaritalStatus | "",
    bloodType: "" as BloodType | "",
    civilId: "",
    civilIdIssueDate: null as Date | null,
    civilIdExpiryDate: null as Date | null,
    birthDate: null as Date | null,
    birthPlace: "",
    nationality: "",
    currentAddress: "",
    permanentAddress: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",

    // Education (for staff)
    educationLevel: "" as EducationLevel | "",
    educationField: "",
    educationInstitution: "",
    graduationYear: null as number | null,
    workExperience: "",

    // Employment (for staff)
    joinDate: null as Date | null,
    contractStartDate: null as Date | null,
    contractEndDate: null as Date | null,
    contractType: "" as ContractType | "",
    workSchedule: "",
    workShift: "" as WorkShift | "",
    baseSalary: null as number | null,
    salaryCurrency: "AFN",
    bankAccountNumber: "",
    bankName: "",
    insuranceNumber: "",
    insuranceProvider: "",
    hasInsurance: false,
    hasContract: false,

    // Student specific
    classId: null as number | null,
    studentNumber: "",
    previousSchool: "",
    enrollmentDate: null as Date | null,
    enrollmentType: "" as EnrollmentType | "",
    transferSchool: "",
    transferDate: null as Date | null,
    isTransfer: false,
    feeWaiver: false,
    feeWaiverReason: "",
    scholarship: false,
    scholarshipType: "",
    scholarshipPercentage: null as number | null,
    studentGraduationDate: null as Date | null,
    studentGraduationYear: null as number | null,
    siblingCount: null as number | null,
    siblingNames: "",
    healthConditions: "",
    allergies: "",
    medication: "",
    specialNeeds: "",

    // Teacher specific
    teacherCode: "",
    specialization: "",
    teachingExperience: null as number | null,
    languageSkills: "",
    publications: "",
    awards: "",

    // Class assignment (for teacher)
    assignedClassId: null as number | null, // ← ADDED: For assigning teacher to a class

    // Parent specific
    childId: null as number | null,
    teacherId: null as number | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Reset role-specific fields when role changes
  useEffect(() => {
    if (formData.role === "student") {
      setFormData((prev) => ({
        ...prev,
        teacherId: null,
        childId: null,
        assignedClassId: null,
      }));
    } else if (formData.role === "teacher") {
      setFormData((prev) => ({ ...prev, classId: null, childId: null }));
    } else if (formData.role === "parent") {
      setFormData((prev) => ({
        ...prev,
        classId: null,
        teacherId: null,
        assignedClassId: null,
      }));
    }
  }, [formData.role]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [classesRes, teachersRes] = await Promise.all([
        adminUserApi.getClasses(),
        adminUserApi.getTeachers(),
      ]);

      if (classesRes.success && classesRes.data) {
        setClasses(classesRes.data);
      }
      if (teachersRes.success && teachersRes.data) {
        setTeachers(teachersRes.data);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const searchStudentByEmail = async () => {
    if (!childEmail.trim()) {
      Alert.alert("خطا", "لطفاً ایمیل دانش‌آموز را وارد کنید");
      return;
    }

    setSearchingChild(true);
    try {
      const response = await adminUserApi.findStudentByEmail(childEmail);
      if (response.success && response.data) {
        Alert.alert(
          "دانش‌آموز یافت شد",
          `دانش‌آموز: ${response.data.name}\nایمیل: ${response.data.email}\nصنف: ${response.data.className || "نامشخص"}`,
          [
            { text: "لغو", style: "cancel" },
            {
              text: "انتخاب",
              onPress: () => {
                setFormData((prev) => ({
                  ...prev,
                  childId: response.data?.id || null,
                }));
                setSelectedChildId(response.data?.id || null);
                setChildEmail("");
              },
            },
          ],
        );
      } else {
        Alert.alert("خطا", "دانش‌آموزی با این ایمیل یافت نشد");
      }
    } catch (err) {
      Alert.alert("خطا", "مشکل در جستجوی دانش‌آموز");
    } finally {
      setSearchingChild(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Basic validation
    if (!formData.fullName)
      newErrors.fullName = "نام و نام خانوادگی الزامی است";
    if (!formData.email) newErrors.email = "ایمیل الزامی است";
    if (!formData.password) newErrors.password = "رمز عبور الزامی است";
    if (formData.password && formData.password.length < 6)
      newErrors.password = "رمز عبور باید حداقل ۶ کاراکتر باشد";

    // Role-specific validation
    if (formData.role === "student") {
      if (!formData.classId) newErrors.classId = "انتخاب صنف الزامی است";
    } else if (formData.role === "teacher") {
      // Teacher class assignment is optional
      // They can be assigned later
    } else if (formData.role === "parent") {
      if (!formData.childId) newErrors.childId = "انتخاب دانش‌آموز الزامی است";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        // Basic info
        name: formData.fullName,
        nameFarsi: formData.nameFarsi,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        isActive: formData.isActive,
        verified: formData.verified,

        // Personal info
        fatherName: formData.fatherName,
        fatherNameFarsi: formData.fatherNameFarsi,
        grandfatherName: formData.grandfatherName,
        grandfatherNameFarsi: formData.grandfatherNameFarsi,
        sex: formData.sex || undefined,
        maritalStatus: formData.maritalStatus || undefined,
        bloodType: formData.bloodType || undefined,
        civilId: formData.civilId || undefined,
        civilIdIssueDate: formData.civilIdIssueDate,
        civilIdExpiryDate: formData.civilIdExpiryDate,
        birthDate: formData.birthDate,
        birthPlace: formData.birthPlace,
        nationality: formData.nationality,
        currentAddress: formData.currentAddress,
        permanentAddress: formData.permanentAddress,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelation: formData.emergencyContactRelation,

        // Education
        educationLevel: formData.educationLevel || undefined,
        educationField: formData.educationField,
        educationInstitution: formData.educationInstitution,
        graduationYear: formData.graduationYear,
        workExperience: formData.workExperience,

        // Employment
        joinDate: formData.joinDate,
        contractStartDate: formData.contractStartDate,
        contractEndDate: formData.contractEndDate,
        contractType: formData.contractType || undefined,
        workSchedule: formData.workSchedule,
        workShift: formData.workShift || undefined,
        baseSalary: formData.baseSalary,
        salaryCurrency: formData.salaryCurrency,
        bankAccountNumber: formData.bankAccountNumber,
        bankName: formData.bankName,
        insuranceNumber: formData.insuranceNumber,
        insuranceProvider: formData.insuranceProvider,
        hasInsurance: formData.hasInsurance,
        hasContract: formData.hasContract,

        // Student fields
        classId: formData.classId,
        studentNumber: formData.studentNumber,
        previousSchool: formData.previousSchool,
        enrollmentDate: formData.enrollmentDate,
        enrollmentType: formData.enrollmentType || undefined,
        transferSchool: formData.transferSchool,
        transferDate: formData.transferDate,
        isTransfer: formData.isTransfer,
        feeWaiver: formData.feeWaiver,
        feeWaiverReason: formData.feeWaiverReason,
        scholarship: formData.scholarship,
        scholarshipType: formData.scholarshipType,
        scholarshipPercentage: formData.scholarshipPercentage,
        graduationDate: formData.studentGraduationDate,
        siblingCount: formData.siblingCount,
        siblingNames: formData.siblingNames,
        healthConditions: formData.healthConditions,
        allergies: formData.allergies,
        medication: formData.medication,
        specialNeeds: formData.specialNeeds,

        // Teacher fields
        teacherCode: formData.teacherCode,
        specialization: formData.specialization,
        teachingExperience: formData.teachingExperience,
        languageSkills: formData.languageSkills,
        publications: formData.publications,
        awards: formData.awards,

        // ← ADDED: Pass assigned class for teacher
        teacherId: formData.assignedClassId, // This assigns teacher as supervisor of a class

        // Parent fields
        childId: formData.childId,
      };

      const response = await adminUserApi.createUser(payload);

      if (response.success) {
        Alert.alert("موفقیت", response.message, [
          { text: "باشه", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("خطا", response.message || "مشکل در ایجاد کاربر");
      }
    } catch (err: any) {
      Alert.alert("خطا", err.message || "مشکل در ایجاد کاربر");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="ایجاد کاربر جدید" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات پایه</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نام و نام خانوادگی *</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData({ ...formData, fullName: text })
              }
              placeholder="مثال: علی احمدی"
              textAlign="right"
            />
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نام به فارسی</Text>
            <TextInput
              style={styles.input}
              value={formData.nameFarsi}
              onChangeText={(text) =>
                setFormData({ ...formData, nameFarsi: text })
              }
              placeholder="مثال: علی احمدی"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ایمیل *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="example@school.com"
              keyboardType="email-address"
              autoCapitalize="none"
              textAlign="right"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>شماره تلفن</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="۰۷۸۱۲۳۴۵۶۷"
              keyboardType="phone-pad"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رمز عبور *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  errors.password && styles.inputError,
                ]}
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                placeholder="حداقل ۶ کاراکتر"
                secureTextEntry={!showPassword}
                textAlign="right"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Status Toggle */}
          <View style={styles.rowGroup}>
            <View style={styles.toggleContainer}>
              <Text style={styles.label}>وضعیت فعال</Text>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  formData.isActive && styles.toggleButtonActive,
                ]}
                onPress={() =>
                  setFormData({ ...formData, isActive: !formData.isActive })
                }
              >
                <Text
                  style={[
                    styles.toggleText,
                    formData.isActive && styles.toggleTextActive,
                  ]}
                >
                  {formData.isActive ? "فعال" : "غیرفعال"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Role Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نقش کاربری</Text>
          <View style={styles.roleContainer}>
            {(["student", "teacher", "parent", "admin"] as UserRole[]).map(
              (role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    formData.role === role && styles.roleButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, role })}
                >
                  <Text
                    style={[
                      styles.roleText,
                      formData.role === role && styles.roleTextActive,
                    ]}
                  >
                    {role === "student"
                      ? "دانش‌آموز"
                      : role === "teacher"
                        ? "معلم"
                        : role === "parent"
                          ? "والدین"
                          : "مدیر"}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات شخصی</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نام پدر</Text>
            <TextInput
              style={styles.input}
              value={formData.fatherName}
              onChangeText={(text) =>
                setFormData({ ...formData, fatherName: text })
              }
              placeholder="نام پدر"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نام پدر به فارسی</Text>
            <TextInput
              style={styles.input}
              value={formData.fatherNameFarsi}
              onChangeText={(text) =>
                setFormData({ ...formData, fatherNameFarsi: text })
              }
              placeholder="نام پدر به فارسی"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نام پدر بزرگ</Text>
            <TextInput
              style={styles.input}
              value={formData.grandfatherName}
              onChangeText={(text) =>
                setFormData({ ...formData, grandfatherName: text })
              }
              placeholder="نام پدر بزرگ"
              textAlign="right"
            />
          </View>

          <View style={styles.rowGroup}>
            <View style={[styles.halfGroup, styles.halfGroupRight]}>
              <Text style={styles.label}>جنسیت</Text>
              <View style={styles.selectContainer}>
                {["MALE", "FEMALE"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.smallSelectOption,
                      formData.sex === option && styles.selectOptionActive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, sex: option as Sex })
                    }
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formData.sex === option &&
                          styles.selectOptionTextActive,
                      ]}
                    >
                      {option === "MALE" ? "مذکر" : "مونث"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.halfGroup, styles.halfGroupLeft]}>
              <Text style={styles.label}>وضعیت تأهل</Text>
              <View style={styles.selectContainer}>
                {["SINGLE", "MARRIED"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.smallSelectOption,
                      formData.maritalStatus === option &&
                        styles.selectOptionActive,
                    ]}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        maritalStatus: option as MaritalStatus,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formData.maritalStatus === option &&
                          styles.selectOptionTextActive,
                      ]}
                    >
                      {option === "SINGLE" ? "مجرد" : "متاهل"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>گروه خونی</Text>
            <View style={styles.selectContainer}>
              {[
                "A_POSITIVE",
                "A_NEGATIVE",
                "B_POSITIVE",
                "B_NEGATIVE",
                "AB_POSITIVE",
                "AB_NEGATIVE",
                "O_POSITIVE",
                "O_NEGATIVE",
              ].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.smallSelectOption,
                    formData.bloodType === option && styles.selectOptionActive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, bloodType: option as BloodType })
                  }
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      formData.bloodType === option &&
                        styles.selectOptionTextActive,
                    ]}
                  >
                    {option.replace("_", " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>شماره تذکره</Text>
            <TextInput
              style={styles.input}
              value={formData.civilId}
              onChangeText={(text) =>
                setFormData({ ...formData, civilId: text })
              }
              placeholder="شماره تذکره"
              textAlign="right"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.rowGroup}>
            <View style={[styles.halfGroup, styles.halfGroupRight]}>
              <Text style={styles.label}>تاریخ تولد</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() =>
                  setShowDatePicker({ visible: true, field: "birthDate" })
                }
              >
                <Text
                  style={
                    formData.birthDate
                      ? styles.dateText
                      : styles.datePlaceholder
                  }
                >
                  {formData.birthDate
                    ? formData.birthDate.toLocaleDateString("fa-IR")
                    : "انتخاب تاریخ"}
                </Text>
                <Ionicons name="calendar" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.halfGroup, styles.halfGroupLeft]}>
              <Text style={styles.label}>محل تولد</Text>
              <TextInput
                style={styles.input}
                value={formData.birthPlace}
                onChangeText={(text) =>
                  setFormData({ ...formData, birthPlace: text })
                }
                placeholder="محل تولد"
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ملیت</Text>
            <TextInput
              style={styles.input}
              value={formData.nationality}
              onChangeText={(text) =>
                setFormData({ ...formData, nationality: text })
              }
              placeholder="ملیت"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>آدرس فعلی</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.currentAddress}
              onChangeText={(text) =>
                setFormData({ ...formData, currentAddress: text })
              }
              placeholder="آدرس فعلی"
              textAlign="right"
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>آدرس دایمی</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.permanentAddress}
              onChangeText={(text) =>
                setFormData({ ...formData, permanentAddress: text })
              }
              placeholder="آدرس دایمی"
              textAlign="right"
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Emergency Contact */}
          <Text style={styles.subLabel}>اطلاعات اضطراری</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>نام شخص برای مواقع ضروری</Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContactName}
              onChangeText={(text) =>
                setFormData({ ...formData, emergencyContactName: text })
              }
              placeholder="نام"
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>شماره تماس ضروری</Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContactPhone}
              onChangeText={(text) =>
                setFormData({ ...formData, emergencyContactPhone: text })
              }
              placeholder="شماره تماس"
              textAlign="right"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>رابطه با شخص ضروری</Text>
            <TextInput
              style={styles.input}
              value={formData.emergencyContactRelation}
              onChangeText={(text) =>
                setFormData({ ...formData, emergencyContactRelation: text })
              }
              placeholder="مثال: پدر، مادر، برادر"
              textAlign="right"
            />
          </View>
        </View>

        {/* Education Section (for staff) */}
        {(formData.role === "teacher" || formData.role === "admin") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اطلاعات تحصیلی</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>سطح تحصیلات</Text>
              <View style={styles.selectContainer}>
                {[
                  "NO_FORMAL",
                  "PRIMARY",
                  "SECONDARY",
                  "HIGH_SCHOOL",
                  "BACHELORS",
                  "MASTERS",
                  "DOCTORATE",
                  "OTHER",
                ].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.smallSelectOption,
                      formData.educationLevel === option &&
                        styles.selectOptionActive,
                    ]}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        educationLevel: option as EducationLevel,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formData.educationLevel === option &&
                          styles.selectOptionTextActive,
                      ]}
                    >
                      {option === "NO_FORMAL"
                        ? "بدون تحصیلات رسمی"
                        : option === "PRIMARY"
                          ? "ابتدایی"
                          : option === "SECONDARY"
                            ? "متوسطه"
                            : option === "HIGH_SCHOOL"
                              ? "لیسه"
                              : option === "BACHELORS"
                                ? "لیسانس"
                                : option === "MASTERS"
                                  ? "ماستری"
                                  : option === "DOCTORATE"
                                    ? "دکتورا"
                                    : "سایر"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>رشته تحصیلی</Text>
              <TextInput
                style={styles.input}
                value={formData.educationField}
                onChangeText={(text) =>
                  setFormData({ ...formData, educationField: text })
                }
                placeholder="رشته تحصیلی"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>موسسه تحصیلی</Text>
              <TextInput
                style={styles.input}
                value={formData.educationInstitution}
                onChangeText={(text) =>
                  setFormData({ ...formData, educationInstitution: text })
                }
                placeholder="نام موسسه"
                textAlign="right"
              />
            </View>

            <View style={styles.rowGroup}>
              <View style={[styles.halfGroup, styles.halfGroupRight]}>
                <Text style={styles.label}>سال فراغت</Text>
                <TextInput
                  style={styles.input}
                  value={formData.graduationYear?.toString() || ""}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      graduationYear: text ? parseInt(text) : null,
                    })
                  }
                  placeholder="سال فراغت"
                  textAlign="right"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.halfGroup, styles.halfGroupLeft]}>
                <Text style={styles.label}>تجربه کاری</Text>
                <TextInput
                  style={styles.input}
                  value={formData.workExperience}
                  onChangeText={(text) =>
                    setFormData({ ...formData, workExperience: text })
                  }
                  placeholder="تجربه کاری"
                  textAlign="right"
                />
              </View>
            </View>
          </View>
        )}

        {/* Employment Section (for staff) */}
        {(formData.role === "teacher" || formData.role === "admin") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اطلاعات استخدامی</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>تاریخ استخدام</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() =>
                  setShowDatePicker({ visible: true, field: "joinDate" })
                }
              >
                <Text
                  style={
                    formData.joinDate ? styles.dateText : styles.datePlaceholder
                  }
                >
                  {formData.joinDate
                    ? formData.joinDate.toLocaleDateString("fa-IR")
                    : "انتخاب تاریخ"}
                </Text>
                <Ionicons name="calendar" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowGroup}>
              <View style={[styles.halfGroup, styles.halfGroupRight]}>
                <Text style={styles.label}>تاریخ شروع قرارداد</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() =>
                    setShowDatePicker({
                      visible: true,
                      field: "contractStartDate",
                    })
                  }
                >
                  <Text
                    style={
                      formData.contractStartDate
                        ? styles.dateText
                        : styles.datePlaceholder
                    }
                  >
                    {formData.contractStartDate
                      ? formData.contractStartDate.toLocaleDateString("fa-IR")
                      : "انتخاب تاریخ"}
                  </Text>
                  <Ionicons name="calendar" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={[styles.halfGroup, styles.halfGroupLeft]}>
                <Text style={styles.label}>تاریخ پایان قرارداد</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() =>
                    setShowDatePicker({
                      visible: true,
                      field: "contractEndDate",
                    })
                  }
                >
                  <Text
                    style={
                      formData.contractEndDate
                        ? styles.dateText
                        : styles.datePlaceholder
                    }
                  >
                    {formData.contractEndDate
                      ? formData.contractEndDate.toLocaleDateString("fa-IR")
                      : "انتخاب تاریخ"}
                  </Text>
                  <Ionicons name="calendar" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>نوع قرارداد</Text>
              <View style={styles.selectContainer}>
                {[
                  "PERMANENT",
                  "TEMPORARY",
                  "CONTRACT",
                  "CASUAL",
                  "PROBATION",
                ].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.smallSelectOption,
                      formData.contractType === option &&
                        styles.selectOptionActive,
                    ]}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        contractType: option as ContractType,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formData.contractType === option &&
                          styles.selectOptionTextActive,
                      ]}
                    >
                      {option === "PERMANENT"
                        ? "دایم"
                        : option === "TEMPORARY"
                          ? "موقت"
                          : option === "CONTRACT"
                            ? "قراردادی"
                            : option === "CASUAL"
                              ? "موردی"
                              : "آزمایشی"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>وقت کاری</Text>
              <TextInput
                style={styles.input}
                value={formData.workSchedule}
                onChangeText={(text) =>
                  setFormData({ ...formData, workSchedule: text })
                }
                placeholder="مثال: ۸ صبح تا ۴ بعد از ظهر"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>شیفت کاری</Text>
              <View style={styles.selectContainer}>
                {["MORNING", "AFTERNOON", "EVENING", "NIGHT", "ROTATING"].map(
                  (option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.smallSelectOption,
                        formData.workShift === option &&
                          styles.selectOptionActive,
                      ]}
                      onPress={() =>
                        setFormData({
                          ...formData,
                          workShift: option as WorkShift,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.selectOptionText,
                          formData.workShift === option &&
                            styles.selectOptionTextActive,
                        ]}
                      >
                        {option === "MORNING"
                          ? "صبح"
                          : option === "AFTERNOON"
                            ? "بعد از ظهر"
                            : option === "EVENING"
                              ? "شام"
                              : option === "NIGHT"
                                ? "شب"
                                : "چرخشی"}
                      </Text>
                    </TouchableOpacity>
                  ),
                )}
              </View>
            </View>

            <View style={styles.rowGroup}>
              <View style={[styles.halfGroup, styles.halfGroupRight]}>
                <Text style={styles.label}>معاش پایه (افغانی)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.baseSalary?.toString() || ""}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      baseSalary: text ? parseFloat(text) : null,
                    })
                  }
                  placeholder="معاش پایه"
                  textAlign="right"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.halfGroup, styles.halfGroupLeft]}>
                <Text style={styles.label}>واحد پول</Text>
                <TextInput
                  style={styles.input}
                  value={formData.salaryCurrency}
                  onChangeText={(text) =>
                    setFormData({ ...formData, salaryCurrency: text })
                  }
                  placeholder="AFN"
                  textAlign="right"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>شماره حساب بانکی</Text>
              <TextInput
                style={styles.input}
                value={formData.bankAccountNumber}
                onChangeText={(text) =>
                  setFormData({ ...formData, bankAccountNumber: text })
                }
                placeholder="شماره حساب"
                textAlign="right"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>نام بانک</Text>
              <TextInput
                style={styles.input}
                value={formData.bankName}
                onChangeText={(text) =>
                  setFormData({ ...formData, bankName: text })
                }
                placeholder="نام بانک"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>شماره بیمه</Text>
              <TextInput
                style={styles.input}
                value={formData.insuranceNumber}
                onChangeText={(text) =>
                  setFormData({ ...formData, insuranceNumber: text })
                }
                placeholder="شماره بیمه"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>شرکت بیمه</Text>
              <TextInput
                style={styles.input}
                value={formData.insuranceProvider}
                onChangeText={(text) =>
                  setFormData({ ...formData, insuranceProvider: text })
                }
                placeholder="نام شرکت بیمه"
                textAlign="right"
              />
            </View>

            <View style={styles.rowGroup}>
              <View style={[styles.halfGroup, styles.halfGroupRight]}>
                <Text style={styles.label}>بیمه دارد؟</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    formData.hasInsurance && styles.toggleButtonActive,
                  ]}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      hasInsurance: !formData.hasInsurance,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.toggleText,
                      formData.hasInsurance && styles.toggleTextActive,
                    ]}
                  >
                    {formData.hasInsurance ? "بله" : "خیر"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.halfGroup, styles.halfGroupLeft]}>
                <Text style={styles.label}>قرارداد دارد؟</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    formData.hasContract && styles.toggleButtonActive,
                  ]}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      hasContract: !formData.hasContract,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.toggleText,
                      formData.hasContract && styles.toggleTextActive,
                    ]}
                  >
                    {formData.hasContract ? "بله" : "خیر"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Student Fields */}
        {formData.role === "student" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اطلاعات دانش‌آموز</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>شماره دانش‌آموزی (Asas)</Text>
              <TextInput
                style={styles.input}
                value={formData.studentNumber}
                onChangeText={(text) =>
                  setFormData({ ...formData, studentNumber: text })
                }
                placeholder="مثال: 1402-001"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>صنف *</Text>
              <View style={styles.selectContainer}>
                {classes.map((cls) => (
                  <TouchableOpacity
                    key={cls.id}
                    style={[
                      styles.selectOption,
                      formData.classId === cls.id && styles.selectOptionActive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, classId: cls.id })
                    }
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formData.classId === cls.id &&
                          styles.selectOptionTextActive,
                      ]}
                    >
                      {cls.displayName}
                    </Text>
                    {formData.classId === cls.id && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              {errors.classId && (
                <Text style={styles.errorText}>{errors.classId}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>مکتب قبلی</Text>
              <TextInput
                style={styles.input}
                value={formData.previousSchool}
                onChangeText={(text) =>
                  setFormData({ ...formData, previousSchool: text })
                }
                placeholder="نام مکتب قبلی"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>تاریخ ثبت نام</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() =>
                  setShowDatePicker({ visible: true, field: "enrollmentDate" })
                }
              >
                <Text
                  style={
                    formData.enrollmentDate
                      ? styles.dateText
                      : styles.datePlaceholder
                  }
                >
                  {formData.enrollmentDate
                    ? formData.enrollmentDate.toLocaleDateString("fa-IR")
                    : "انتخاب تاریخ"}
                </Text>
                <Ionicons name="calendar" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>نوع ثبت نام</Text>
              <View style={styles.selectContainer}>
                {["NEW", "TRANSFER", "RE_ENROLL"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.smallSelectOption,
                      formData.enrollmentType === option &&
                        styles.selectOptionActive,
                    ]}
                    onPress={() =>
                      setFormData({
                        ...formData,
                        enrollmentType: option as EnrollmentType,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formData.enrollmentType === option &&
                          styles.selectOptionTextActive,
                      ]}
                    >
                      {option === "NEW"
                        ? "جدید"
                        : option === "TRANSFER"
                          ? "انتقالی"
                          : "ثبت نام مجدد"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>مکتب انتقالی</Text>
              <TextInput
                style={styles.input}
                value={formData.transferSchool}
                onChangeText={(text) =>
                  setFormData({ ...formData, transferSchool: text })
                }
                placeholder="نام مکتب قبلی (برای انتقالی)"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>تاریخ انتقال</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() =>
                  setShowDatePicker({ visible: true, field: "transferDate" })
                }
              >
                <Text
                  style={
                    formData.transferDate
                      ? styles.dateText
                      : styles.datePlaceholder
                  }
                >
                  {formData.transferDate
                    ? formData.transferDate.toLocaleDateString("fa-IR")
                    : "انتخاب تاریخ"}
                </Text>
                <Ionicons name="calendar" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.rowGroup}>
              <View style={[styles.halfGroup, styles.halfGroupRight]}>
                <Text style={styles.label}>انتقالی است؟</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    formData.isTransfer && styles.toggleButtonActive,
                  ]}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      isTransfer: !formData.isTransfer,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.toggleText,
                      formData.isTransfer && styles.toggleTextActive,
                    ]}
                  >
                    {formData.isTransfer ? "بله" : "خیر"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.halfGroup, styles.halfGroupLeft]}>
                <Text style={styles.label}>معافیت از هزینه</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    formData.feeWaiver && styles.toggleButtonActive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, feeWaiver: !formData.feeWaiver })
                  }
                >
                  <Text
                    style={[
                      styles.toggleText,
                      formData.feeWaiver && styles.toggleTextActive,
                    ]}
                  >
                    {formData.feeWaiver ? "بله" : "خیر"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {formData.feeWaiver && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>دلیل معافیت از هزینه</Text>
                <TextInput
                  style={styles.input}
                  value={formData.feeWaiverReason}
                  onChangeText={(text) =>
                    setFormData({ ...formData, feeWaiverReason: text })
                  }
                  placeholder="دلیل معافیت"
                  textAlign="right"
                />
              </View>
            )}

            <View style={styles.rowGroup}>
              <View style={[styles.halfGroup, styles.halfGroupRight]}>
                <Text style={styles.label}>بورسیه دارد؟</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    formData.scholarship && styles.toggleButtonActive,
                  ]}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      scholarship: !formData.scholarship,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.toggleText,
                      formData.scholarship && styles.toggleTextActive,
                    ]}
                  >
                    {formData.scholarship ? "بله" : "خیر"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.halfGroup, styles.halfGroupLeft]}>
                <Text style={styles.label}>نوع بورسیه</Text>
                <TextInput
                  style={styles.input}
                  value={formData.scholarshipType}
                  onChangeText={(text) =>
                    setFormData({ ...formData, scholarshipType: text })
                  }
                  placeholder="نوع بورسیه"
                  textAlign="right"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>درصد بورسیه</Text>
              <TextInput
                style={styles.input}
                value={formData.scholarshipPercentage?.toString() || ""}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    scholarshipPercentage: text ? parseFloat(text) : null,
                  })
                }
                placeholder="درصد بورسیه"
                textAlign="right"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.rowGroup}>
              <View style={[styles.halfGroup, styles.halfGroupRight]}>
                <Text style={styles.label}>تاریخ فراغت</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() =>
                    setShowDatePicker({
                      visible: true,
                      field: "studentGraduationDate",
                    })
                  }
                >
                  <Text
                    style={
                      formData.studentGraduationDate
                        ? styles.dateText
                        : styles.datePlaceholder
                    }
                  >
                    {formData.studentGraduationDate
                      ? formData.studentGraduationDate.toLocaleDateString(
                          "fa-IR",
                        )
                      : "انتخاب تاریخ"}
                  </Text>
                  <Ionicons name="calendar" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={[styles.halfGroup, styles.halfGroupLeft]}>
                <Text style={styles.label}>سال فراغت</Text>
                <TextInput
                  style={styles.input}
                  value={formData.studentGraduationYear?.toString() || ""}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      studentGraduationYear: text ? parseInt(text) : null,
                    })
                  }
                  placeholder="سال فراغت"
                  textAlign="right"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.rowGroup}>
              <View style={[styles.halfGroup, styles.halfGroupRight]}>
                <Text style={styles.label}>تعداد خواهر و برادر</Text>
                <TextInput
                  style={styles.input}
                  value={formData.siblingCount?.toString() || ""}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      siblingCount: text ? parseInt(text) : null,
                    })
                  }
                  placeholder="تعداد"
                  textAlign="right"
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.halfGroup, styles.halfGroupLeft]}>
                <Text style={styles.label}>نام خواهر و برادر</Text>
                <TextInput
                  style={styles.input}
                  value={formData.siblingNames}
                  onChangeText={(text) =>
                    setFormData({ ...formData, siblingNames: text })
                  }
                  placeholder="نام‌ها"
                  textAlign="right"
                />
              </View>
            </View>

            <Text style={styles.subLabel}>اطلاعات صحی</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>وضعیت صحی</Text>
              <TextInput
                style={styles.input}
                value={formData.healthConditions}
                onChangeText={(text) =>
                  setFormData({ ...formData, healthConditions: text })
                }
                placeholder="وضعیت صحی"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>آلرژی‌ها</Text>
              <TextInput
                style={styles.input}
                value={formData.allergies}
                onChangeText={(text) =>
                  setFormData({ ...formData, allergies: text })
                }
                placeholder="آلرژی‌ها"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>داروهای خاص</Text>
              <TextInput
                style={styles.input}
                value={formData.medication}
                onChangeText={(text) =>
                  setFormData({ ...formData, medication: text })
                }
                placeholder="داروهای خاص"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>نیازهای خاص</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.specialNeeds}
                onChangeText={(text) =>
                  setFormData({ ...formData, specialNeeds: text })
                }
                placeholder="نیازهای خاص"
                textAlign="right"
                multiline
                numberOfLines={2}
              />
            </View>
          </View>
        )}

        {/* Teacher Fields */}
        {formData.role === "teacher" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اطلاعات معلم</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>کد معلم</Text>
              <TextInput
                style={styles.input}
                value={formData.teacherCode}
                onChangeText={(text) =>
                  setFormData({ ...formData, teacherCode: text })
                }
                placeholder="مثال: TCH-001"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>تخصص</Text>
              <TextInput
                style={styles.input}
                value={formData.specialization}
                onChangeText={(text) =>
                  setFormData({ ...formData, specialization: text })
                }
                placeholder="تخصص معلم"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>سال های تجربه تدریس</Text>
              <TextInput
                style={styles.input}
                value={formData.teachingExperience?.toString() || ""}
                onChangeText={(text) =>
                  setFormData({
                    ...formData,
                    teachingExperience: text ? parseInt(text) : null,
                  })
                }
                placeholder="تعداد سال"
                textAlign="right"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>مهارت‌های زبانی</Text>
              <TextInput
                style={styles.input}
                value={formData.languageSkills}
                onChangeText={(text) =>
                  setFormData({ ...formData, languageSkills: text })
                }
                placeholder="مثال: انگلیسی، دری، پشتو"
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>انتشارات</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.publications}
                onChangeText={(text) =>
                  setFormData({ ...formData, publications: text })
                }
                placeholder="لیست انتشارات"
                textAlign="right"
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>جوایز</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.awards}
                onChangeText={(text) =>
                  setFormData({ ...formData, awards: text })
                }
                placeholder="لیست جوایز"
                textAlign="right"
                multiline
                numberOfLines={2}
              />
            </View>

            {/* ← ADDED: Class Assignment for Teacher */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>تعیین به عنوان سرپرست صنف</Text>
              <Text style={styles.sectionSubtitle}>
                (اختیاری) معلم به عنوان سرپرست صنف تعیین می‌شود
              </Text>
              <View style={styles.selectContainer}>
                <TouchableOpacity
                  style={[
                    styles.selectOption,
                    formData.assignedClassId === null &&
                      styles.selectOptionActive,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, assignedClassId: null })
                  }
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      formData.assignedClassId === null &&
                        styles.selectOptionTextActive,
                    ]}
                  >
                    بدون سرپرستی
                  </Text>
                  {formData.assignedClassId === null && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={Colors.primary}
                    />
                  )}
                </TouchableOpacity>
                {classes.map((cls) => (
                  <TouchableOpacity
                    key={cls.id}
                    style={[
                      styles.selectOption,
                      formData.assignedClassId === cls.id &&
                        styles.selectOptionActive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, assignedClassId: cls.id })
                    }
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        formData.assignedClassId === cls.id &&
                          styles.selectOptionTextActive,
                      ]}
                    >
                      {cls.displayName}
                    </Text>
                    {formData.assignedClassId === cls.id && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.infoBox}>
                <Ionicons
                  name="information-circle"
                  size={20}
                  color={Colors.info}
                />
                <Text style={styles.infoText}>
                  با انتخاب یک صنف، این معلم به عنوان سرپرست آن صنف تعیین
                  می‌شود. می‌تواند حضور و غیاب دانش‌آموزان را ثبت کند و دروس آن
                  صنف را مدیریت نماید.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Parent Fields */}
        {formData.role === "parent" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>اطلاعات والدین</Text>
            <Text style={styles.sectionSubtitle}>
              دانش‌آموز خود را انتخاب کنید
            </Text>

            {selectedChildId ? (
              <View style={styles.selectedChildContainer}>
                <Text style={styles.selectedChildText}>
                  دانش‌آموز انتخاب شده: {formData.childId}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedChildId(null);
                    setFormData({ ...formData, childId: null });
                  }}
                >
                  <Text style={styles.changeChildText}>تغییر</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  value={childEmail}
                  onChangeText={setChildEmail}
                  placeholder="ایمیل دانش‌آموز را وارد کنید"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textAlign="right"
                />
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={searchStudentByEmail}
                  disabled={searchingChild}
                >
                  <Text style={styles.searchButtonText}>
                    {searchingChild ? "جستجو..." : "جستجو"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {errors.childId && (
              <Text style={styles.errorText}>{errors.childId}</Text>
            )}
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleCreateUser}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "در حال ایجاد..." : "ایجاد کاربر"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker.visible && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, selectedDate) => {
            setShowDatePicker({ visible: false, field: "" });
            if (selectedDate) {
              const field = showDatePicker.field;
              setFormData((prev) => ({ ...prev, [field]: selectedDate }));
            }
          }}
        />
      )}
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
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  subLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  inputGroup: {
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
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
  },
  rowGroup: {
    flexDirection: "row",
    gap: 12,
  },
  halfGroup: {
    flex: 1,
  },
  halfGroupRight: {
    marginRight: 6,
  },
  halfGroupLeft: {
    marginLeft: 6,
  },
  roleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    minWidth: "45%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  roleTextActive: {
    color: "#fff",
  },
  selectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    paddingRight: 45,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    padding: 8,
  },
  selectOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: "30%",
    flex: 1,
  },
  smallSelectOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: "22%",
  },
  selectOptionActive: {
    backgroundColor: Colors.primary + "10",
    borderColor: Colors.primary,
  },
  selectOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  selectOptionTextActive: {
    color: Colors.primary,
    fontWeight: "500",
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  toggleTextActive: {
    color: "#fff",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: Colors.text,
  },
  datePlaceholder: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  selectedChildContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedChildText: {
    fontSize: 14,
    color: Colors.text,
  },
  changeChildText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "10",
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
