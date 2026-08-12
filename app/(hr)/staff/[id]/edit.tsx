// app/(hr)/staff/[id]/edit.tsx - COMPLETE WITH ALL FIELDS MATCHING CREATE PAGE
import { hrApi, StaffType } from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

const STAFF_TYPES: { key: StaffType; label: string; icon: string }[] = [
  { key: "TEACHER", label: "استاد", icon: "school" },
  { key: "ADMIN", label: "مدیر", icon: "business" },
  { key: "FINANCE", label: "مالی", icon: "cash" },
  { key: "HR", label: "منابع بشری", icon: "people" },
  { key: "PRINCIPAL", label: "مدیر مکتب", icon: "ribbon" },
  { key: "CHEF", label: "آشپز", icon: "restaurant" },
  { key: "GUARD", label: "نگهبان", icon: "shield" },
  { key: "DRIVER", label: "راننده", icon: "car" },
  { key: "CLEANER", label: "نظافتچی", icon: "brush" },
  { key: "SECURITY", label: "امنیتی", icon: "lock" },
  { key: "MAINTENANCE", label: "تکنیسین", icon: "construct" },
  { key: "LIBRARIAN", label: "کتابدار", icon: "library" },
  { key: "NURSE", label: "پرستار", icon: "medkit" },
  { key: "COUNSELOR", label: "مشاور", icon: "chatbubbles" },
  { key: "COACH", label: "مربی", icon: "fitness" },
  { key: "OTHER", label: "سایر", icon: "ellipsis" },
];

const SEX_OPTIONS = [
  { key: "MALE", label: "مرد", value: "MALE" },
  { key: "FEMALE", label: "زن", value: "FEMALE" },
  { key: "OTHER", label: "سایر", value: "OTHER" },
];

const MARITAL_STATUS = [
  { key: "SINGLE", label: "مجرد", value: "SINGLE" },
  { key: "MARRIED", label: "متاهل", value: "MARRIED" },
  { key: "DIVORCED", label: "مطلقه", value: "DIVORCED" },
  { key: "WIDOWED", label: "بیوه", value: "WIDOWED" },
];

const EDUCATION_LEVELS = [
  { key: "NO_FORMAL", label: "بدون تحصیلات" },
  { key: "PRIMARY", label: "ابتدایی" },
  { key: "SECONDARY", label: "متوسطه" },
  { key: "HIGH_SCHOOL", label: "دیپلم" },
  { key: "BACHELORS", label: "لیسانس" },
  { key: "MASTERS", label: "فوق لیسانس" },
  { key: "DOCTORATE", label: "دکترا" },
  { key: "OTHER", label: "سایر" },
];

const CONTRACT_TYPES = [
  { key: "PERMANENT", label: "دائم" },
  { key: "TEMPORARY", label: "موقت" },
  { key: "CONTRACT", label: "قراردادی" },
  { key: "CASUAL", label: "روزمزد" },
  { key: "PROBATION", label: "آزمایشی" },
];

const WORK_SHIFTS = [
  { key: "MORNING", label: "قبل از ظهر" },
  { key: "AFTERNOON", label: "بعد از ظهر" },
  { key: "FLEXIBLE", label: "روز مکمل" },
  { key: "EVENING", label: "شام" },
  { key: "NIGHT", label: "شب" },
  { key: "ROTATING", label: "چرخشی" },
];

const BLOOD_TYPES = [
  { key: "A_POSITIVE", label: "A+" },
  { key: "A_NEGATIVE", label: "A-" },
  { key: "B_POSITIVE", label: "B+" },
  { key: "B_NEGATIVE", label: "B-" },
  { key: "AB_POSITIVE", label: "AB+" },
  { key: "AB_NEGATIVE", label: "AB-" },
  { key: "O_POSITIVE", label: "O+" },
  { key: "O_NEGATIVE", label: "O-" },
];

export default function EditStaffScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Info
    fullName: "",
    nameFarsi: "",
    email: "",
    phone: "",
    staffType: "TEACHER" as StaffType,

    // Employment
    position: "",
    department: "",
    joinDate: "",
    contractStartDate: "",
    contractEndDate: "",
    workSchedule: "MORNING",
    salary: "",
    isActive: true,
    notes: "",

    // Teacher Specific
    specialization: "",
    experience: "",
    teacherCode: "",
    qualification: "",

    // Personal Info
    fatherName: "",
    fatherNameFarsi: "",
    grandfatherName: "",
    grandfatherNameFarsi: "",
    sex: "MALE",
    maritalStatus: "SINGLE",
    bloodType: "",
    civilId: "",
    civilIdIssueDate: "",
    civilIdExpiryDate: "",
    birthDate: "",
    birthPlace: "",
    nationality: "افغان",

    // Address
    permanentProvince: "",
    permanentDistrict: "",
    permanentArea: "",
    currentProvince: "",
    currentDistrict: "",
    currentArea: "",
    currentHomeNo: "",

    // Emergency Contact
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",

    // Education
    educationLevel: "",
    educationField: "",
    educationInstitution: "",
    graduationYear: "",
    workExperience: "",

    // Contract
    contractType: "PERMANENT",
    workShift: "",
    baseSalary: "",
    salaryCurrency: "AFN",

    // Bank
    bankAccountNumber: "",
    bankName: "",

    // Insurance
    insuranceNumber: "",
    insuranceProvider: "",
    hasInsurance: false,
    hasContract: false,

    // PHP Specific Fields
    tin: "",
    paymentType: "0",
    taxMonth: "",
    absentDeduction: "",
    overtimeGuarantee: "",
    staffsIdNo: "",
  });

  useEffect(() => {
    if (id) fetchStaff();
  }, [id]);

  const fetchStaff = async () => {
    try {
      const response = await hrApi.getStaffById(Number(id));
      if (response.success) {
        const data = response.data;

        // Parse address fields from combined strings
        const currentAddress = data.currentAddress || "";
        const permanentAddress = data.permanentAddress || "";

        // Split addresses (simple parsing)
        const currentParts = currentAddress.split("، ");
        const permanentParts = permanentAddress.split("، ");

        setFormData({
          // Basic Info
          fullName: data.fullName || "",
          nameFarsi: data.nameFarsi || "",
          email: data.email || "",
          phone: data.phone || "",
          staffType: data.staff?.staffType || data.role || "TEACHER",

          // Employment
          position: data.staff?.position || data.position || "",
          department: data.staff?.department || data.department || "",
          joinDate:
            data.staff?.joinDate?.split("T")[0] ||
            data.joinDate?.split("T")[0] ||
            "",
          contractStartDate: data.contractStartDate?.split("T")[0] || "",
          contractEndDate: data.contractEndDate?.split("T")[0] || "",
          workSchedule: data.workShift || data.workSchedule || "MORNING",
          salary:
            data.staff?.salary?.toString() ||
            data.salary ||
            data.baseSalary?.toString() ||
            "",
          isActive: data.isActive !== undefined ? data.isActive : true,
          notes: data.staff?.notes || data.notes || "",

          // Teacher Specific
          specialization:
            data.Teacher?.specialization || data.staff?.specialization || "",
          experience: data.Teacher?.experience || "",
          teacherCode: data.Teacher?.teacherCode || "",
          qualification: data.PrincipalStaff?.qualification || "",

          // Personal Info
          fatherName: data.fatherName || "",
          fatherNameFarsi: data.fatherNameFarsi || "",
          grandfatherName: data.grandfatherName || "",
          grandfatherNameFarsi: data.grandfatherNameFarsi || "",
          sex: data.sex || "MALE",
          maritalStatus: data.maritalStatus || "SINGLE",
          bloodType: data.bloodType || "",
          civilId: data.civilId || "",
          civilIdIssueDate: data.civilIdIssueDate?.split("T")[0] || "",
          civilIdExpiryDate: data.civilIdExpiryDate?.split("T")[0] || "",
          birthDate: data.birthDate?.split("T")[0] || "",
          birthPlace: data.birthPlace || "",
          nationality: data.nationality || "افغان",

          // Address
          permanentProvince: permanentParts[0] || "",
          permanentDistrict: permanentParts[1] || "",
          permanentArea: permanentParts[2] || "",
          currentProvince: currentParts[0] || "",
          currentDistrict: currentParts[1] || "",
          currentArea: currentParts[2] || "",
          currentHomeNo: currentParts[3] || "",

          // Emergency Contact
          emergencyContactName: data.emergencyContactName || "",
          emergencyContactPhone: data.emergencyContactPhone || "",
          emergencyContactRelation: data.emergencyContactRelation || "",

          // Education
          educationLevel: data.educationLevel || "",
          educationField: data.educationField || "",
          educationInstitution: data.educationInstitution || "",
          graduationYear: data.graduationYear?.toString() || "",
          workExperience: data.workExperience || "",

          // Contract
          contractType: data.contractType || "PERMANENT",
          workShift: data.workShift || "",
          baseSalary: data.baseSalary?.toString() || "",
          salaryCurrency: data.salaryCurrency || "AFN",

          // Bank
          bankAccountNumber: data.bankAccountNumber || "",
          bankName: data.bankName || "",

          // Insurance
          insuranceNumber: data.insuranceNumber || "",
          insuranceProvider: data.insuranceProvider || "",
          hasInsurance: data.hasInsurance || false,
          hasContract: data.hasContract || false,

          // PHP Specific
          tin: "",
          paymentType: "0",
          taxMonth: "",
          absentDeduction: "",
          overtimeGuarantee: "",
          staffsIdNo: "",
        });
      }
    } catch (error) {
      console.error("Fetch staff error:", error);
      Alert.alert("خطا", "خطا در دریافت اطلاعات کارمند");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim()) {
      Alert.alert("خطا", "نام کامل الزامی است");
      return;
    }

    setSubmitting(true);
    try {
      // Build address strings from components
      const permanentAddress = [
        formData.permanentProvince,
        formData.permanentDistrict,
        formData.permanentArea,
      ]
        .filter(Boolean)
        .join("، ");

      const currentAddress = [
        formData.currentProvince,
        formData.currentDistrict,
        formData.currentArea,
        formData.currentHomeNo,
      ]
        .filter(Boolean)
        .join("، ");

      const response = await hrApi.updateStaff(Number(id), {
        // Basic Info
        fullName: formData.fullName.trim(),
        nameFarsi: formData.nameFarsi || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        staffType: formData.staffType,

        // Employment
        position: formData.position || undefined,
        department: formData.department || undefined,
        joinDate: formData.joinDate || undefined,
        contractStartDate: formData.contractStartDate || undefined,
        contractEndDate: formData.contractEndDate || undefined,
        workSchedule: formData.workSchedule || undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        isActive: formData.isActive,
        notes: formData.notes || undefined,

        // Teacher Specific
        specialization: formData.specialization || undefined,
        experience: formData.experience || undefined,
        teacherCode: formData.teacherCode || undefined,
        qualification: formData.qualification || undefined,

        // Personal Info
        fatherName: formData.fatherName || undefined,
        fatherNameFarsi: formData.fatherNameFarsi || undefined,
        grandfatherName: formData.grandfatherName || undefined,
        grandfatherNameFarsi: formData.grandfatherNameFarsi || undefined,
        sex: formData.sex,
        maritalStatus: formData.maritalStatus || undefined,
        bloodType: formData.bloodType || undefined,
        civilId: formData.civilId || undefined,
        civilIdIssueDate: formData.civilIdIssueDate || undefined,
        civilIdExpiryDate: formData.civilIdExpiryDate || undefined,
        birthDate: formData.birthDate || undefined,
        birthPlace: formData.birthPlace || undefined,
        nationality: formData.nationality || "افغان",

        // Address
        permanentAddress: permanentAddress || undefined,
        currentAddress: currentAddress || undefined,

        // Emergency Contact
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        emergencyContactRelation:
          formData.emergencyContactRelation || undefined,

        // Education
        educationLevel: formData.educationLevel || undefined,
        educationField: formData.educationField || undefined,
        educationInstitution: formData.educationInstitution || undefined,
        graduationYear: formData.graduationYear
          ? parseInt(formData.graduationYear)
          : undefined,
        workExperience: formData.workExperience || undefined,

        // Contract
        contractType: formData.contractType || undefined,
        workShift: formData.workShift || undefined,
        baseSalary: formData.baseSalary
          ? parseFloat(formData.baseSalary)
          : undefined,
        salaryCurrency: formData.salaryCurrency || "AFN",

        // Bank
        bankAccountNumber: formData.bankAccountNumber || undefined,
        bankName: formData.bankName || undefined,

        // Insurance
        insuranceNumber: formData.insuranceNumber || undefined,
        insuranceProvider: formData.insuranceProvider || undefined,
        hasInsurance: formData.hasInsurance,
        hasContract: formData.hasContract,
      });

      if (response.success) {
        Alert.alert("موفقیت", "اطلاعات کارمند به‌روزرسانی شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در به‌روزرسانی");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>

      <Text style={styles.title}>ویرایش کارمند</Text>

      <View style={styles.card}>
        {/* ===== BASIC INFO ===== */}
        <Text style={styles.sectionTitle}>معلومات اساسی کارمند</Text>

        <Text style={styles.label}>نام کامل *</Text>
        <TextInput
          style={styles.input}
          placeholder="نام کامل"
          placeholderTextColor="#94a3b8"
          value={formData.fullName}
          onChangeText={(text) => setFormData({ ...formData, fullName: text })}
        />

        <Text style={styles.label}>نام به فارسی</Text>
        <TextInput
          style={styles.input}
          placeholder="نام به فارسی"
          placeholderTextColor="#94a3b8"
          value={formData.nameFarsi}
          onChangeText={(text) => setFormData({ ...formData, nameFarsi: text })}
        />

        <Text style={styles.label}>ایمیل</Text>
        <TextInput
          style={styles.input}
          placeholder="ایمیل"
          placeholderTextColor="#94a3b8"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>شماره تماس</Text>
        <TextInput
          style={styles.input}
          placeholder="شماره تماس"
          placeholderTextColor="#94a3b8"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />

        {/* ===== STAFF TYPE ===== */}
        <Text style={styles.label}>نوع کارمند</Text>
        <View style={styles.optionsGrid}>
          {STAFF_TYPES.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.optionItem,
                formData.staffType === type.key && styles.optionSelected,
              ]}
              onPress={() => setFormData({ ...formData, staffType: type.key })}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.staffType === type.key && styles.optionTextSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ===== EMPLOYMENT INFO ===== */}
        <Text style={styles.sectionTitle}>اطلاعات استخدامی</Text>

        <Text style={styles.label}>سمت</Text>
        <TextInput
          style={styles.input}
          placeholder="سمت"
          placeholderTextColor="#94a3b8"
          value={formData.position}
          onChangeText={(text) => setFormData({ ...formData, position: text })}
        />

        <Text style={styles.label}>بخش</Text>
        <TextInput
          style={styles.input}
          placeholder="بخش"
          placeholderTextColor="#94a3b8"
          value={formData.department}
          onChangeText={(text) =>
            setFormData({ ...formData, department: text })
          }
        />

        <Text style={styles.label}>تاریخ پیوستن</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94a3b8"
          value={formData.joinDate}
          onChangeText={(text) => setFormData({ ...formData, joinDate: text })}
        />

        <Text style={styles.label}>معاش</Text>
        <TextInput
          style={styles.input}
          placeholder="معاش (افغانی)"
          placeholderTextColor="#94a3b8"
          value={formData.salary}
          onChangeText={(text) => {
            setFormData({ ...formData, salary: text });
            if (text && parseFloat(text) > 0) {
              const tax = (parseFloat(text) * 5) / 100;
              setFormData((prev) => ({ ...prev, taxMonth: tax.toString() }));
            }
          }}
          keyboardType="numeric"
        />

        <View style={styles.switchRow}>
          <Text style={styles.label}>فعال</Text>
          <Switch
            value={formData.isActive}
            onValueChange={(value) =>
              setFormData({ ...formData, isActive: value })
            }
            trackColor={{ false: "#e2e8f0", true: "#10b981" }}
          />
        </View>

        <Text style={styles.label}>یادداشت</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="یادداشت..."
          placeholderTextColor="#94a3b8"
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* ===== TEACHER SPECIFIC ===== */}
        {formData.staffType === "TEACHER" && (
          <>
            <Text style={styles.sectionTitle}>اطلاعات آموزشی (استاد)</Text>

            <Text style={styles.label}>تخصص</Text>
            <TextInput
              style={styles.input}
              placeholder="تخصص"
              placeholderTextColor="#94a3b8"
              value={formData.specialization}
              onChangeText={(text) =>
                setFormData({ ...formData, specialization: text })
              }
            />

            <Text style={styles.label}>سابقه کار</Text>
            <TextInput
              style={styles.input}
              placeholder="سابقه کار"
              placeholderTextColor="#94a3b8"
              value={formData.experience}
              onChangeText={(text) =>
                setFormData({ ...formData, experience: text })
              }
            />

            <Text style={styles.label}>کد استاد</Text>
            <TextInput
              style={styles.input}
              placeholder="کد استاد"
              placeholderTextColor="#94a3b8"
              value={formData.teacherCode}
              onChangeText={(text) =>
                setFormData({ ...formData, teacherCode: text })
              }
            />
          </>
        )}

        {/* ===== ADVANCED INFO ===== */}
        <TouchableOpacity
          style={styles.advancedToggle}
          onPress={() => setShowAdvanced(!showAdvanced)}
        >
          <Text style={styles.advancedToggleText}>
            {showAdvanced ? "🔽 اطلاعات تکمیلی" : "▶️ اطلاعات تکمیلی"}
          </Text>
        </TouchableOpacity>

        {showAdvanced && (
          <>
            {/* Personal Info */}
            <Text style={styles.sectionTitle}>اطلاعات شخصی</Text>

            <Text style={styles.label}>نام پدر</Text>
            <TextInput
              style={styles.input}
              placeholder="نام پدر"
              placeholderTextColor="#94a3b8"
              value={formData.fatherName}
              onChangeText={(text) =>
                setFormData({ ...formData, fatherName: text })
              }
            />

            <Text style={styles.label}>نام پدر به فارسی</Text>
            <TextInput
              style={styles.input}
              placeholder="نام پدر به فارسی"
              placeholderTextColor="#94a3b8"
              value={formData.fatherNameFarsi}
              onChangeText={(text) =>
                setFormData({ ...formData, fatherNameFarsi: text })
              }
            />

            <Text style={styles.label}>نام پدر کلان</Text>
            <TextInput
              style={styles.input}
              placeholder="نام پدر کلان"
              placeholderTextColor="#94a3b8"
              value={formData.grandfatherName}
              onChangeText={(text) =>
                setFormData({ ...formData, grandfatherName: text })
              }
            />

            <Text style={styles.label}>جنسیت</Text>
            <View style={styles.optionsGrid}>
              {SEX_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionItem,
                    formData.sex === opt.key && styles.optionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, sex: opt.key })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.sex === opt.key && styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>وضعیت تاهل</Text>
            <View style={styles.optionsGrid}>
              {MARITAL_STATUS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionItem,
                    formData.maritalStatus === opt.key && styles.optionSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, maritalStatus: opt.key })
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.maritalStatus === opt.key &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>گروه خونی</Text>
            <View style={styles.optionsGrid}>
              {BLOOD_TYPES.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionItem,
                    formData.bloodType === opt.key && styles.optionSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, bloodType: opt.key })
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.bloodType === opt.key &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>شماره تذکره</Text>
            <TextInput
              style={styles.input}
              placeholder="شماره تذکره"
              placeholderTextColor="#94a3b8"
              value={formData.civilId}
              onChangeText={(text) =>
                setFormData({ ...formData, civilId: text })
              }
            />

            <Text style={styles.label}>تاریخ صدور تذکره</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              value={formData.civilIdIssueDate}
              onChangeText={(text) =>
                setFormData({ ...formData, civilIdIssueDate: text })
              }
            />

            <Text style={styles.label}>تاریخ انقضای تذکره</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              value={formData.civilIdExpiryDate}
              onChangeText={(text) =>
                setFormData({ ...formData, civilIdExpiryDate: text })
              }
            />

            <Text style={styles.label}>تاریخ تولد</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              value={formData.birthDate}
              onChangeText={(text) =>
                setFormData({ ...formData, birthDate: text })
              }
            />

            <Text style={styles.label}>محل تولد</Text>
            <TextInput
              style={styles.input}
              placeholder="محل تولد"
              placeholderTextColor="#94a3b8"
              value={formData.birthPlace}
              onChangeText={(text) =>
                setFormData({ ...formData, birthPlace: text })
              }
            />

            <Text style={styles.label}>ملیت</Text>
            <TextInput
              style={styles.input}
              placeholder="ملیت"
              placeholderTextColor="#94a3b8"
              value={formData.nationality}
              onChangeText={(text) =>
                setFormData({ ...formData, nationality: text })
              }
            />

            {/* Address */}
            <Text style={styles.sectionTitle}>آدرس کارمند</Text>

            <Text style={styles.subSectionTitle}>آدرس اصلی</Text>
            <View style={styles.row}>
              <View style={styles.thirdField}>
                <Text style={styles.label}>ولایت</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ولایت اصلی"
                  placeholderTextColor="#94a3b8"
                  value={formData.permanentProvince}
                  onChangeText={(text) =>
                    setFormData({ ...formData, permanentProvince: text })
                  }
                />
              </View>
              <View style={styles.thirdField}>
                <Text style={styles.label}>ناحیه</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ناحیه اصلی"
                  placeholderTextColor="#94a3b8"
                  value={formData.permanentDistrict}
                  onChangeText={(text) =>
                    setFormData({ ...formData, permanentDistrict: text })
                  }
                />
              </View>
              <View style={styles.thirdField}>
                <Text style={styles.label}>منطقه</Text>
                <TextInput
                  style={styles.input}
                  placeholder="منطقه اصلی"
                  placeholderTextColor="#94a3b8"
                  value={formData.permanentArea}
                  onChangeText={(text) =>
                    setFormData({ ...formData, permanentArea: text })
                  }
                />
              </View>
            </View>

            <Text style={styles.subSectionTitle}>آدرس فعلی</Text>
            <View style={styles.row}>
              <View style={styles.thirdField}>
                <Text style={styles.label}>ولایت</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ولایت فعلی"
                  placeholderTextColor="#94a3b8"
                  value={formData.currentProvince}
                  onChangeText={(text) =>
                    setFormData({ ...formData, currentProvince: text })
                  }
                />
              </View>
              <View style={styles.thirdField}>
                <Text style={styles.label}>ناحیه</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ناحیه فعلی"
                  placeholderTextColor="#94a3b8"
                  value={formData.currentDistrict}
                  onChangeText={(text) =>
                    setFormData({ ...formData, currentDistrict: text })
                  }
                />
              </View>
              <View style={styles.thirdField}>
                <Text style={styles.label}>منطقه</Text>
                <TextInput
                  style={styles.input}
                  placeholder="منطقه فعلی"
                  placeholderTextColor="#94a3b8"
                  value={formData.currentArea}
                  onChangeText={(text) =>
                    setFormData({ ...formData, currentArea: text })
                  }
                />
              </View>
            </View>
            <Text style={styles.label}>نمبر خانه</Text>
            <TextInput
              style={styles.input}
              placeholder="نمبر خانه فعلی"
              placeholderTextColor="#94a3b8"
              value={formData.currentHomeNo}
              onChangeText={(text) =>
                setFormData({ ...formData, currentHomeNo: text })
              }
            />

            {/* Emergency Contact */}
            <Text style={styles.sectionTitle}>اطلاعات اضطراری</Text>

            <Text style={styles.label}>نام شخص اضطراری</Text>
            <TextInput
              style={styles.input}
              placeholder="نام شخص اضطراری"
              placeholderTextColor="#94a3b8"
              value={formData.emergencyContactName}
              onChangeText={(text) =>
                setFormData({ ...formData, emergencyContactName: text })
              }
            />

            <Text style={styles.label}>شماره شخص اضطراری</Text>
            <TextInput
              style={styles.input}
              placeholder="شماره شخص اضطراری"
              placeholderTextColor="#94a3b8"
              value={formData.emergencyContactPhone}
              onChangeText={(text) =>
                setFormData({ ...formData, emergencyContactPhone: text })
              }
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>نسبت با شخص اضطراری</Text>
            <TextInput
              style={styles.input}
              placeholder="نسبت"
              placeholderTextColor="#94a3b8"
              value={formData.emergencyContactRelation}
              onChangeText={(text) =>
                setFormData({ ...formData, emergencyContactRelation: text })
              }
            />

            {/* Education */}
            <Text style={styles.sectionTitle}>تحصیلات</Text>

            <Text style={styles.label}>مدرک تحصیلی</Text>
            <View style={styles.optionsGrid}>
              {EDUCATION_LEVELS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionItem,
                    formData.educationLevel === opt.key &&
                      styles.optionSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, educationLevel: opt.key })
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.educationLevel === opt.key &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>رشته تحصیلی</Text>
            <TextInput
              style={styles.input}
              placeholder="رشته تحصیلی"
              placeholderTextColor="#94a3b8"
              value={formData.educationField}
              onChangeText={(text) =>
                setFormData({ ...formData, educationField: text })
              }
            />

            <Text style={styles.label}>موسسه تحصیلی</Text>
            <TextInput
              style={styles.input}
              placeholder="موسسه تحصیلی"
              placeholderTextColor="#94a3b8"
              value={formData.educationInstitution}
              onChangeText={(text) =>
                setFormData({ ...formData, educationInstitution: text })
              }
            />

            <Text style={styles.label}>سال فراغت</Text>
            <TextInput
              style={styles.input}
              placeholder="سال فراغت"
              placeholderTextColor="#94a3b8"
              value={formData.graduationYear}
              onChangeText={(text) =>
                setFormData({ ...formData, graduationYear: text })
              }
              keyboardType="numeric"
            />

            <Text style={styles.label}>سابقه کار</Text>
            <TextInput
              style={styles.input}
              placeholder="سابقه کار"
              placeholderTextColor="#94a3b8"
              value={formData.workExperience}
              onChangeText={(text) =>
                setFormData({ ...formData, workExperience: text })
              }
            />

            {/* Contract */}
            <Text style={styles.sectionTitle}>قرارداد</Text>

            <Text style={styles.label}>تاریخ شروع قرارداد</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              value={formData.contractStartDate}
              onChangeText={(text) =>
                setFormData({ ...formData, contractStartDate: text })
              }
            />

            <Text style={styles.label}>تاریخ پایان قرارداد</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              value={formData.contractEndDate}
              onChangeText={(text) =>
                setFormData({ ...formData, contractEndDate: text })
              }
            />

            <Text style={styles.label}>نوع قرارداد</Text>
            <View style={styles.optionsGrid}>
              {CONTRACT_TYPES.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionItem,
                    formData.contractType === opt.key && styles.optionSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, contractType: opt.key })
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.contractType === opt.key &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>وقت کاری</Text>
            <View style={styles.optionsGrid}>
              {WORK_SHIFTS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionItem,
                    formData.workSchedule === opt.key && styles.optionSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, workSchedule: opt.key })
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      formData.workSchedule === opt.key &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>دارای قرارداد</Text>
              <Switch
                value={formData.hasContract}
                onValueChange={(value) =>
                  setFormData({ ...formData, hasContract: value })
                }
                trackColor={{ false: "#e2e8f0", true: "#8b5cf6" }}
              />
            </View>

            {/* Bank */}
            <Text style={styles.sectionTitle}>اطلاعات بانکی</Text>

            <Text style={styles.label}>شماره حساب بانکی</Text>
            <TextInput
              style={styles.input}
              placeholder="شماره حساب"
              placeholderTextColor="#94a3b8"
              value={formData.bankAccountNumber}
              onChangeText={(text) =>
                setFormData({ ...formData, bankAccountNumber: text })
              }
            />

            <Text style={styles.label}>نام بانک</Text>
            <TextInput
              style={styles.input}
              placeholder="نام بانک"
              placeholderTextColor="#94a3b8"
              value={formData.bankName}
              onChangeText={(text) =>
                setFormData({ ...formData, bankName: text })
              }
            />

            {/* Insurance */}
            <Text style={styles.sectionTitle}>بیمه</Text>

            <Text style={styles.label}>شماره بیمه</Text>
            <TextInput
              style={styles.input}
              placeholder="شماره بیمه"
              placeholderTextColor="#94a3b8"
              value={formData.insuranceNumber}
              onChangeText={(text) =>
                setFormData({ ...formData, insuranceNumber: text })
              }
            />

            <Text style={styles.label}>شرکت بیمه</Text>
            <TextInput
              style={styles.input}
              placeholder="شرکت بیمه"
              placeholderTextColor="#94a3b8"
              value={formData.insuranceProvider}
              onChangeText={(text) =>
                setFormData({ ...formData, insuranceProvider: text })
              }
            />

            <View style={styles.switchRow}>
              <Text style={styles.label}>دارای بیمه</Text>
              <Switch
                value={formData.hasInsurance}
                onValueChange={(value) =>
                  setFormData({ ...formData, hasInsurance: value })
                }
                trackColor={{ false: "#e2e8f0", true: "#8b5cf6" }}
              />
            </View>
          </>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.submitText}>ذخیره تغییرات</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  content: { padding: 16, paddingBottom: 40 },
  backButton: { marginBottom: 16 },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8b5cf6",
    marginTop: 16,
    marginBottom: 12,
    fontFamily: "VazirBold",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 4,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginTop: 10,
    marginBottom: 8,
    fontFamily: "VazirBold",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 12,
    marginBottom: 6,
    fontFamily: "Vazir",
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  textArea: { minHeight: 60 },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  halfField: {
    flex: 1,
  },
  thirdField: {
    flex: 1,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  optionItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionSelected: {
    backgroundColor: "#ede9fe",
    borderColor: "#8b5cf6",
  },
  optionText: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  optionTextSelected: {
    color: "#8b5cf6",
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  advancedToggle: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  advancedToggleText: {
    fontSize: 15,
    color: "#8b5cf6",
    fontFamily: "Vazir",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
