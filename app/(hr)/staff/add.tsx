// app/(hr)/staff/add.tsx - COMPLETE WITH ALL STAFF TYPES AND PHP FORM FIELDS
import { hrApi, StaffType } from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
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

// ✅ All staff types including new ones
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

export default function AddStaffScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    // ===== BASIC INFO (PHP: name, lname, staffs_id_no) =====
    fullName: "",
    nameFarsi: "",
    email: "",
    phone: "",
    password: "",
    staffType: "TEACHER" as StaffType,

    // ===== EMPLOYMENT (PHP: type_id, year, date_start, date_end, work_time) =====
    position: "",
    department: "",
    joinDate: "",
    contractStartDate: "",
    contractEndDate: "",
    workSchedule: "MORNING",
    salary: "",
    isActive: true,
    notes: "",

    // ===== TEACHER SPECIFIC =====
    specialization: "",
    experience: "",
    teacherCode: "",
    qualification: "",

    // ===== PERSONAL INFO (PHP: fname, gender, state, blood_no, birth_date, idcord_no) =====
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

    // ===== ADDRESS (PHP: main_pro, main_dis, main_area, current_pro, current_dis, current_area, current_home_no) =====
    permanentProvince: "",
    permanentDistrict: "",
    permanentArea: "",
    currentProvince: "",
    currentDistrict: "",
    currentArea: "",
    currentHomeNo: "",

    // ===== EMERGENCY CONTACT =====
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",

    // ===== EDUCATION (PHP: education_degree, education_faculty) =====
    educationLevel: "",
    educationField: "",
    educationInstitution: "",
    graduationYear: "",
    workExperience: "",

    // ===== CONTRACT =====
    contractType: "PERMANENT",
    workShift: "",
    baseSalary: "",
    salaryCurrency: "AFN",

    // ===== BANK =====
    bankAccountNumber: "",
    bankName: "",

    // ===== INSURANCE =====
    insuranceNumber: "",
    insuranceProvider: "",
    hasInsurance: false,
    hasContract: false,

    // ===== PHP SPECIFIC FIELDS =====
    tin: "", // نمبر تشخیصیه (TIN)
    paymentType: "0", // شیوه پرداخت معاش (0=ماهوار)
    taxMonth: "", // مالیه یک ماه %
    absentDeduction: "", // قطع معاش در یک روز غیرحاضری
    overtimeGuarantee: "", // مقدار تضمین هر ماه
    staffsIdNo: "", // آی دی کارمند
  });

  const handleSubmit = async () => {
    // Validate required fields (matches PHP form)
    if (!formData.fullName.trim()) {
      Alert.alert("خطا", "اسم کارمند الزامی است");
      return;
    }
    if (!formData.email.trim() || !formData.password.trim()) {
      Alert.alert("خطا", "ایمیل و رمز عبور الزامی است");
      return;
    }
    if (formData.password.length < 6) {
      Alert.alert("خطا", "رمز عبور باید حداقل ۶ کاراکتر باشد");
      return;
    }
    if (!formData.staffType) {
      Alert.alert("خطا", "نوعیت کارمند الزامی است");
      return;
    }

    setLoading(true);
    try {
      // Build address strings from components (matching PHP format)
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

      const response = await hrApi.createStaff({
        // ===== BASIC INFO =====
        fullName: formData.fullName.trim(),
        nameFarsi: formData.nameFarsi || undefined,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone || undefined,
        password: formData.password,
        staffType: formData.staffType,

        // ===== EMPLOYMENT =====
        position: formData.position || undefined,
        department: formData.department || undefined,
        joinDate: formData.joinDate || undefined,
        contractStartDate: formData.contractStartDate || undefined,
        contractEndDate: formData.contractEndDate || undefined,
        workSchedule: formData.workSchedule || undefined,
        salary: formData.salary ? parseFloat(formData.salary) : undefined,
        isActive: formData.isActive,
        notes: formData.notes || undefined,

        // ===== TEACHER SPECIFIC =====
        specialization: formData.specialization || undefined,
        workExperience: formData.experience || undefined,
        // teacherCode: formData.teacherCode || undefined,

        // ===== PERSONAL INFO =====
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

        // ===== ADDRESS =====
        permanentAddress: permanentAddress || undefined,
        currentAddress: currentAddress || undefined,

        // ===== EMERGENCY CONTACT =====
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        emergencyContactRelation:
          formData.emergencyContactRelation || undefined,

        // ===== EDUCATION =====
        educationLevel: formData.educationLevel || undefined,
        educationField: formData.educationField || undefined,
        educationInstitution: formData.educationInstitution || undefined,
        graduationYear: formData.graduationYear
          ? parseInt(formData.graduationYear)
          : undefined,

        // ===== CONTRACT =====
        contractType: formData.contractType || undefined,
        workShift: formData.workShift || undefined,
        baseSalary: formData.baseSalary
          ? parseFloat(formData.baseSalary)
          : formData.salary
            ? parseFloat(formData.salary)
            : undefined,
        salaryCurrency: formData.salaryCurrency || "AFN",

        // ===== BANK =====
        bankAccountNumber: formData.bankAccountNumber || undefined,
        bankName: formData.bankName || undefined,

        // ===== INSURANCE =====
        insuranceNumber: formData.insuranceNumber || undefined,
        insuranceProvider: formData.insuranceProvider || undefined,
        hasInsurance: formData.hasInsurance,
        hasContract: formData.hasContract,

        // ===== PHP SPECIFIC FIELDS =====
        tin: formData.tin || undefined,
        paymentType: formData.paymentType || "0",
        taxMonth: formData.taxMonth ? parseFloat(formData.taxMonth) : undefined,
        absentDeduction: formData.absentDeduction
          ? parseFloat(formData.absentDeduction)
          : undefined,
        overtimeGuarantee: formData.overtimeGuarantee
          ? parseFloat(formData.overtimeGuarantee)
          : undefined,
        staffsIdNo: formData.staffsIdNo || undefined,
      });

      if (response.success) {
        Alert.alert("موفقیت", "کارمند با موفقیت ثبت شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در ثبت کارمند");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>

      <Text style={styles.title}>ثبت کارمند جدید</Text>

      <View style={styles.card}>
        {/* ===== BASIC INFO (PHP: name, lname, staffs_id_no) ===== */}
        <Text style={styles.sectionTitle}>معلومات اساسی کارمند</Text>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>آی دی کارمند</Text>
            <TextInput
              style={[styles.input, styles.readonlyInput]}
              placeholder="آی دی خودکار"
              placeholderTextColor="#94a3b8"
              value={formData.staffsIdNo}
              editable={false}
            />
          </View>
          <View style={styles.halfField}>
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
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>اسم *</Text>
            <TextInput
              style={styles.input}
              placeholder="اسم کارمند"
              placeholderTextColor="#94a3b8"
              value={formData.fullName}
              onChangeText={(text) =>
                setFormData({ ...formData, fullName: text })
              }
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>تخلص</Text>
            <TextInput
              style={styles.input}
              placeholder="اسم خانواده گی"
              placeholderTextColor="#94a3b8"
              value={formData.nameFarsi}
              onChangeText={(text) =>
                setFormData({ ...formData, nameFarsi: text })
              }
            />
          </View>
        </View>

        <Text style={styles.label}>اسم پدر</Text>
        <TextInput
          style={styles.input}
          placeholder="اسم پدر کارمند"
          placeholderTextColor="#94a3b8"
          value={formData.fatherName}
          onChangeText={(text) =>
            setFormData({ ...formData, fatherName: text })
          }
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>جنسیت</Text>
            <View style={styles.radioGroup}>
              {SEX_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.radioButton,
                    formData.sex === opt.key && styles.radioSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, sex: opt.key })}
                >
                  <Text
                    style={[
                      styles.radioText,
                      formData.sex === opt.key && styles.radioTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>حالت مدنی</Text>
            <View style={styles.radioGroup}>
              {MARITAL_STATUS.slice(0, 2).map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.radioButton,
                    formData.maritalStatus === opt.key && styles.radioSelected,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, maritalStatus: opt.key })
                  }
                >
                  <Text
                    style={[
                      styles.radioText,
                      formData.maritalStatus === opt.key &&
                        styles.radioTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.label}>گروپ خون</Text>
        <View style={styles.optionsGrid}>
          {BLOOD_TYPES.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.optionItem,
                formData.bloodType === opt.key && styles.optionSelected,
              ]}
              onPress={() => setFormData({ ...formData, bloodType: opt.key })}
            >
              <Text
                style={[
                  styles.optionText,
                  formData.bloodType === opt.key && styles.optionTextSelected,
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
          placeholder="شماره تذکره کارمند"
          placeholderTextColor="#94a3b8"
          value={formData.civilId}
          onChangeText={(text) => setFormData({ ...formData, civilId: text })}
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
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
          </View>
          <View style={styles.halfField}>
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
          </View>
        </View>

        <Text style={styles.label}>شماره تماس</Text>
        <TextInput
          style={styles.input}
          placeholder="شماره تماس کارمند"
          placeholderTextColor="#94a3b8"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>ایمیل آدرس *</Text>
        <TextInput
          style={styles.input}
          placeholder="ایمیل آدرس کارمند"
          placeholderTextColor="#94a3b8"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>رمز عبور *</Text>
        <TextInput
          style={styles.input}
          placeholder="حداقل ۶ کاراکتر"
          placeholderTextColor="#94a3b8"
          value={formData.password}
          onChangeText={(text) => setFormData({ ...formData, password: text })}
          secureTextEntry
        />

        {/* ===== ADDRESS (PHP: main_pro, main_dis, main_area, current_pro, current_dis, current_area, current_home_no) ===== */}
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

        {/* ===== EDUCATION (PHP: education_degree, education_faculty) ===== */}
        <Text style={styles.sectionTitle}>تحصیلات</Text>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>درجه تحصیلی</Text>
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
          </View>
          <View style={styles.halfField}>
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
          </View>
        </View>

        {/* ===== CONTRACT (PHP: type_id, year, date_start, date_end, work_time) ===== */}
        <Text style={styles.sectionTitle}>قرارداد</Text>

        <Text style={styles.label}>نوعیت کارمند *</Text>
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

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>تاریخ آغاز قرارداد</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              value={formData.contractStartDate}
              onChangeText={(text) =>
                setFormData({ ...formData, contractStartDate: text })
              }
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>تاریخ ختم قرارداد</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              value={formData.contractEndDate}
              onChangeText={(text) =>
                setFormData({ ...formData, contractEndDate: text })
              }
            />
          </View>
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

        <View style={styles.row}>
          <View style={styles.halfField}>
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
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>سمت</Text>
            <TextInput
              style={styles.input}
              placeholder="سمت کارمند"
              placeholderTextColor="#94a3b8"
              value={formData.position}
              onChangeText={(text) =>
                setFormData({ ...formData, position: text })
              }
            />
          </View>
        </View>

        <Text style={styles.label}>بخش</Text>
        <TextInput
          style={styles.input}
          placeholder="بخش کارمند"
          placeholderTextColor="#94a3b8"
          value={formData.department}
          onChangeText={(text) =>
            setFormData({ ...formData, department: text })
          }
        />

        {/* ===== PHP SPECIFIC FIELDS ===== */}
        <Text style={styles.sectionTitle}>معلومات مالی</Text>

        <Text style={styles.label}>نمبر تشخیصیه (TIN)</Text>
        <TextInput
          style={styles.input}
          placeholder="نمبر تشخیصیه کارمند"
          placeholderTextColor="#94a3b8"
          value={formData.tin}
          onChangeText={(text) => setFormData({ ...formData, tin: text })}
          keyboardType="numeric"
        />

        <Text style={styles.label}>شیوه پرداخت معاش</Text>
        <View style={styles.optionsGrid}>
          <TouchableOpacity
            style={[
              styles.optionItem,
              formData.paymentType === "0" && styles.optionSelected,
            ]}
            onPress={() => setFormData({ ...formData, paymentType: "0" })}
          >
            <Text
              style={[
                styles.optionText,
                formData.paymentType === "0" && styles.optionTextSelected,
              ]}
            >
              ماهوار
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>معاش یک ماه</Text>
            <TextInput
              style={styles.input}
              placeholder="معاش یک ماه"
              placeholderTextColor="#94a3b8"
              value={formData.salary}
              onChangeText={(text) => {
                setFormData({ ...formData, salary: text });
                // Auto-calculate tax if needed
                if (text && parseFloat(text) > 0) {
                  const tax = (parseFloat(text) * 5) / 100;
                  setFormData((prev) => ({
                    ...prev,
                    taxMonth: tax.toString(),
                  }));
                }
              }}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>مالیه یک ماه %</Text>
            <TextInput
              style={styles.input}
              placeholder="مالیه یک ماه"
              placeholderTextColor="#94a3b8"
              value={formData.taxMonth}
              onChangeText={(text) =>
                setFormData({ ...formData, taxMonth: text })
              }
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>قطع معاش در یک روز غیرحاضری</Text>
            <TextInput
              style={styles.input}
              placeholder="قطع معاش در یک روز"
              placeholderTextColor="#94a3b8"
              value={formData.absentDeduction}
              onChangeText={(text) =>
                setFormData({ ...formData, absentDeduction: text })
              }
              keyboardType="numeric"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>مقدار تضمین هر ماه</Text>
            <TextInput
              style={styles.input}
              placeholder="مقدار تضمین هر ماه"
              placeholderTextColor="#94a3b8"
              value={formData.overtimeGuarantee}
              onChangeText={(text) =>
                setFormData({ ...formData, overtimeGuarantee: text })
              }
              keyboardType="numeric"
            />
          </View>
        </View>

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
          </>
        )}

        {/* Submit */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.submitText}>ثبت کارمند</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setFormData({
                fullName: "",
                nameFarsi: "",
                email: "",
                phone: "",
                password: "",
                staffType: "TEACHER",
                position: "",
                department: "",
                joinDate: "",
                contractStartDate: "",
                contractEndDate: "",
                workSchedule: "MORNING",
                salary: "",
                isActive: true,
                notes: "",
                specialization: "",
                experience: "",
                teacherCode: "",
                qualification: "",
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
                permanentProvince: "",
                permanentDistrict: "",
                permanentArea: "",
                currentProvince: "",
                currentDistrict: "",
                currentArea: "",
                currentHomeNo: "",
                emergencyContactName: "",
                emergencyContactPhone: "",
                emergencyContactRelation: "",
                educationLevel: "",
                educationField: "",
                educationInstitution: "",
                graduationYear: "",
                workExperience: "",
                contractType: "PERMANENT",
                workShift: "",
                baseSalary: "",
                salaryCurrency: "AFN",
                bankAccountNumber: "",
                bankName: "",
                insuranceNumber: "",
                insuranceProvider: "",
                hasInsurance: false,
                hasContract: false,
                tin: "",
                paymentType: "0",
                taxMonth: "",
                absentDeduction: "",
                overtimeGuarantee: "",
                staffsIdNo: "",
              });
            }}
          >
            <Text style={styles.resetText}>پاک کردن فارم</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
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
  readonlyInput: {
    backgroundColor: "#e2e8f0",
    color: "#64748b",
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
  radioGroup: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "transparent",
  },
  radioSelected: {
    backgroundColor: "#ede9fe",
    borderColor: "#8b5cf6",
  },
  radioText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  radioTextSelected: {
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
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  resetButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0",
    paddingVertical: 14,
    borderRadius: 12,
  },
  resetText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "Vazir",
  },
});
