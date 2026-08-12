// app/(hr)/staff/[id].tsx - COMPLETE DETAIL PAGE WITH ALL FIELDS
import { formatCurrency, getRoleLabel, hrApi } from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type StaffDetail = {
  id: number;
  fullName: string;
  nameFarsi?: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  verified: boolean;
  createdAt: string;
  profileImage?: string;
  rfidCode?: string;
  staffType?: string;
  position?: string;
  department?: string;
  joinDate?: string;
  salary?: number;
  specialization?: string;
  experience?: string;
  qualification?: string;
  attendanceCount?: number;
  
  // Personal Info
  fatherName?: string;
  fatherNameFarsi?: string;
  grandfatherName?: string;
  grandfatherNameFarsi?: string;
  sex?: string;
  maritalStatus?: string;
  bloodType?: string;
  civilId?: string;
  civilIdIssueDate?: string;
  civilIdExpiryDate?: string;
  birthDate?: string;
  birthPlace?: string;
  nationality?: string;
  currentAddress?: string;
  permanentAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  
  // Education
  educationLevel?: string;
  educationField?: string;
  educationInstitution?: string;
  graduationYear?: number;
  workExperience?: string;
  
  // Contract
  contractStartDate?: string;
  contractEndDate?: string;
  contractType?: string;
  workSchedule?: string;
  workShift?: string;
  baseSalary?: number;
  salaryCurrency?: string;
  hasContract?: boolean;
  notes?: string;
  
  // Bank
  bankAccountNumber?: string;
  bankName?: string;
  
  // Insurance
  insuranceNumber?: string;
  insuranceProvider?: string;
  hasInsurance?: boolean;
  
  // Relations
  staff?: {
    id: number;
    staffType: string;
    position: string;
    department: string;
    isActive: boolean;
    joinDate: string;
    salary: number;
    notes: string;
    specialization: string;
    emergencyContact: string;
    emergencyPhone: string;
    contractFile: string;
    idCardFile: string;
    photoFile: string;
  };
  Teacher?: {
    id: number;
    bio: string;
    experience: string;
    hourlyRate: number;
    certification: string;
    availability: boolean;
    rating: number;
    isActive: boolean;
    joiningDate: string;
    teacherCode: string;
    specialization: string;
    baseSalary: number;
    teachingExperience: number;
    languageSkills: string;
    awards: string;
    publications: string;
    contractEndDate: string;
    overtimeRate: number;
    TeacherSubject: { Subject: { id: number; name: string } }[];
  };
  FinanceStaff?: {
    id: number;
    position: string;
    department: string;
    isActive: boolean;
    joinDate: string;
    salary: number;
  };
  PrincipalStaff?: {
    id: number;
    position: string;
    isActive: boolean;
    joinDate: string;
    experience: string;
    qualification: string;
  };
  HRStaff?: {
    id: number;
    position: string;
    department: string;
    isActive: boolean;
    joinDate: string;
    salary: number;
  };
};

const getSexLabel = (sex?: string) => {
  const map: Record<string, string> = {
    MALE: "مرد",
    FEMALE: "زن",
    OTHER: "سایر",
  };
  return sex ? map[sex] || sex : "ثبت نشده";
};

const getMaritalStatusLabel = (status?: string) => {
  const map: Record<string, string> = {
    SINGLE: "مجرد",
    MARRIED: "متاهل",
    DIVORCED: "مطلقه",
    WIDOWED: "بیوه",
  };
  return status ? map[status] || status : "ثبت نشده";
};

const getEducationLevelLabel = (level?: string) => {
  const map: Record<string, string> = {
    NO_FORMAL: "بدون تحصیلات",
    PRIMARY: "ابتدایی",
    SECONDARY: "متوسطه",
    HIGH_SCHOOL: "دیپلم",
    BACHELORS: "لیسانس",
    MASTERS: "فوق لیسانس",
    DOCTORATE: "دکترا",
    OTHER: "سایر",
  };
  return level ? map[level] || level : "ثبت نشده";
};

const getContractTypeLabel = (type?: string) => {
  const map: Record<string, string> = {
    PERMANENT: "دائم",
    TEMPORARY: "موقت",
    CONTRACT: "قراردادی",
    CASUAL: "روزمزد",
    PROBATION: "آزمایشی",
  };
  return type ? map[type] || type : "ثبت نشده";
};

const getWorkShiftLabel = (shift?: string) => {
  const map: Record<string, string> = {
    MORNING: "قبل از ظهر",
    AFTERNOON: "بعد از ظهر",
    EVENING: "شام",
    NIGHT: "شب",
    ROTATING: "چرخشی",
    FLEXIBLE: "روز مکمل",
  };
  return shift ? map[shift] || shift : "ثبت نشده";
};

const getBloodTypeLabel = (type?: string) => {
  const map: Record<string, string> = {
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
  };
  return type ? map[type] || type : "ثبت نشده";
};

const getStaffTypeLabel = (type?: string) => {
  const map: Record<string, string> = {
    TEACHER: "استاد",
    ADMIN: "مدیر",
    FINANCE: "مالی",
    HR: "منابع بشری",
    PRINCIPAL: "مدیر مکتب",
    CHEF: "آشپز",
    GUARD: "نگهبان",
    DRIVER: "راننده",
    CLEANER: "نظافتچی",
    SECURITY: "امنیتی",
    MAINTENANCE: "تکنیسین",
    LIBRARIAN: "کتابدار",
    NURSE: "پرستار",
    COUNSELOR: "مشاور",
    COACH: "مربی",
    OTHER: "سایر",
  };
  return type ? map[type] || type : "ثبت نشده";
};

export default function StaffDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [staff, setStaff] = useState<StaffDetail | null>(null);

  const fetchStaff = async () => {
    try {
      const response = await hrApi.getStaffById(Number(id));
      if (response.success) {
        setStaff(response.data);
      }
    } catch (error) {
      console.error("Fetch staff error:", error);
      Alert.alert("خطا", "خطا در دریافت اطلاعات کارمند");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStaff();
    }
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStaff();
  };

  const handleDelete = () => {
    Alert.alert(
      "حذف کارمند",
      "آیا مطمئن هستید که می‌خواهید این کارمند را حذف کنید؟",
      [
        { text: "لغو", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await hrApi.deleteStaff(Number(id));
              if (response.success) {
                Alert.alert("موفقیت", "کارمند با موفقیت حذف شد", [
                  { text: "باشه", onPress: () => router.back() },
                ]);
              }
            } catch (error: any) {
              Alert.alert("خطا", error.message || "خطا در حذف کارمند");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  if (!staff) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>کارمند یافت نشد</Text>
      </View>
    );
  }

  const subjects = staff.Teacher?.TeacherSubject?.map((ts) => ts.Subject.name) || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{staff.fullName.charAt(0)}</Text>
        </View>
        <Text style={styles.staffName}>{staff.fullName}</Text>
        {staff.nameFarsi && (
          <Text style={styles.staffNameFarsi}>{staff.nameFarsi}</Text>
        )}
        <Text style={styles.staffPosition}>
          {staff.position || getStaffTypeLabel(staff.staffType || staff.role)}
        </Text>
        <Text style={styles.staffDepartment}>
          {staff.department || "عمومی"}
        </Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: staff.isActive ? "#d1fae5" : "#fef3c7" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: staff.isActive ? "#10b981" : "#f59e0b" },
              ]}
            >
              {staff.isActive ? "فعال" : "غیرفعال"}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: staff.verified ? "#dbeafe" : "#fef3c7" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: staff.verified ? "#3b82f6" : "#f59e0b" },
              ]}
            >
              {staff.verified ? "تایید شده" : "تایید نشده"}
            </Text>
          </View>
          {staff.staffType && (
            <View style={[styles.statusBadge, { backgroundColor: "#ede9fe" }]}>
              <Text style={[styles.statusText, { color: "#8b5cf6" }]}>
                {getStaffTypeLabel(staff.staffType)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Contact Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>اطلاعات تماس</Text>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>{staff.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>{staff.phone || "ثبت نشده"}</Text>
        </View>
        {staff.rfidCode && (
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>RFID: {staff.rfidCode}</Text>
          </View>
        )}
      </View>

      {/* Personal Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>اطلاعات شخصی</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>نام پدر: {staff.fatherName || "ثبت نشده"}</Text>
        </View>
        {staff.fatherNameFarsi && (
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>نام پدر (فارسی): {staff.fatherNameFarsi}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>نام پدر کلان: {staff.grandfatherName || "ثبت نشده"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="male-female-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>جنسیت: {getSexLabel(staff.sex)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="heart-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>وضعیت مدنی: {getMaritalStatusLabel(staff.maritalStatus)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="water-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>گروه خونی: {getBloodTypeLabel(staff.bloodType)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="document-text-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>شماره تذکره: {staff.civilId || "ثبت نشده"}</Text>
        </View>
        {staff.civilIdIssueDate && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>تاریخ صدور تذکره: {new Date(staff.civilIdIssueDate).toLocaleDateString("fa-IR")}</Text>
          </View>
        )}
        {staff.civilIdExpiryDate && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>تاریخ انقضای تذکره: {new Date(staff.civilIdExpiryDate).toLocaleDateString("fa-IR")}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>تاریخ تولد: {staff.birthDate ? new Date(staff.birthDate).toLocaleDateString("fa-IR") : "ثبت نشده"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>محل تولد: {staff.birthPlace || "ثبت نشده"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="flag-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>ملیت: {staff.nationality || "ثبت نشده"}</Text>
        </View>
      </View>

      {/* Address Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>آدرس</Text>
        {staff.permanentAddress && (
          <>
            <Text style={styles.subSectionTitle}>آدرس اصلی</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>{staff.permanentAddress}</Text>
            </View>
          </>
        )}
        {staff.currentAddress && (
          <>
            <Text style={styles.subSectionTitle}>آدرس فعلی</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>{staff.currentAddress}</Text>
            </View>
          </>
        )}
        {!staff.permanentAddress && !staff.currentAddress && (
          <Text style={styles.emptyText}>آدرسی ثبت نشده است</Text>
        )}
      </View>

      {/* Emergency Contact */}
      {(staff.emergencyContactName || staff.emergencyContactPhone) && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>اطلاعات اضطراری</Text>
          {staff.emergencyContactName && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>نام: {staff.emergencyContactName}</Text>
            </View>
          )}
          {staff.emergencyContactPhone && (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>شماره: {staff.emergencyContactPhone}</Text>
            </View>
          )}
          {staff.emergencyContactRelation && (
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>نسبت: {staff.emergencyContactRelation}</Text>
            </View>
          )}
        </View>
      )}

      {/* Employment Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>اطلاعات استخدامی</Text>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>
            تاریخ پیوستن: {staff.joinDate ? new Date(staff.joinDate).toLocaleDateString("fa-IR") : "ثبت نشده"}
          </Text>
        </View>
        {(staff.salary || staff.baseSalary) && (
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>
              معاش: {formatCurrency(staff.salary || staff.baseSalary || 0)} {staff.salaryCurrency || "AFN"}
            </Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Ionicons name="briefcase-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>نقش: {getRoleLabel(staff.role)}</Text>
        </View>
        {staff.experience && (
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>سابقه: {staff.experience}</Text>
          </View>
        )}
        {staff.workExperience && (
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>سابقه کار: {staff.workExperience}</Text>
          </View>
        )}
        {staff.notes && (
          <View style={styles.infoRow}>
            <Ionicons name="document-text-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>یادداشت: {staff.notes}</Text>
          </View>
        )}
      </View>

      {/* Contract Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>اطلاعات قرارداد</Text>
        <View style={styles.infoRow}>
          <Ionicons name="document-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>نوع قرارداد: {getContractTypeLabel(staff.contractType)}</Text>
        </View>
        {staff.contractStartDate && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>تاریخ شروع: {new Date(staff.contractStartDate).toLocaleDateString("fa-IR")}</Text>
          </View>
        )}
        {staff.contractEndDate && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>تاریخ پایان: {new Date(staff.contractEndDate).toLocaleDateString("fa-IR")}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>وقت کاری: {getWorkShiftLabel(staff.workShift || staff.workSchedule)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>
            دارای قرارداد: {staff.hasContract ? "بله" : "خیر"}
          </Text>
        </View>
      </View>

      {/* Education Info */}
      {staff.educationLevel || staff.educationField || staff.educationInstitution ? (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>تحصیلات</Text>
          {staff.educationLevel && (
            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>مدرک تحصیلی: {getEducationLevelLabel(staff.educationLevel)}</Text>
            </View>
          )}
          {staff.educationField && (
            <View style={styles.infoRow}>
              <Ionicons name="book-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>رشته تحصیلی: {staff.educationField}</Text>
            </View>
          )}
          {staff.educationInstitution && (
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>موسسه تحصیلی: {staff.educationInstitution}</Text>
            </View>
          )}
          {staff.graduationYear && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>سال فراغت: {staff.graduationYear}</Text>
            </View>
          )}
        </View>
      ) : null}

      {/* Teacher Specific Info */}
      {staff.Teacher && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>اطلاعات آموزشی (استاد)</Text>
          {staff.Teacher.teacherCode && (
            <View style={styles.infoRow}>
              <Ionicons name="id-card-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>کد استاد: {staff.Teacher.teacherCode}</Text>
            </View>
          )}
          {staff.Teacher.specialization && (
            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>تخصص: {staff.Teacher.specialization}</Text>
            </View>
          )}
          {staff.Teacher.teachingExperience && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>تجربه تدریس: {staff.Teacher.teachingExperience} سال</Text>
            </View>
          )}
          {staff.Teacher.rating > 0 && (
            <View style={styles.infoRow}>
              <Ionicons name="star-outline" size={20} color="#f59e0b" />
              <Text style={styles.infoText}>امتیاز: {staff.Teacher.rating}/5</Text>
            </View>
          )}
          {staff.Teacher.languageSkills && (
            <View style={styles.infoRow}>
              <Ionicons name="language-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>مهارت‌های زبانی: {staff.Teacher.languageSkills}</Text>
            </View>
          )}
          {staff.Teacher.awards && (
            <View style={styles.infoRow}>
              <Ionicons name="trophy-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>جوایز: {staff.Teacher.awards}</Text>
            </View>
          )}
          {staff.Teacher.publications && (
            <View style={styles.infoRow}>
              <Ionicons name="book-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>انتشارات: {staff.Teacher.publications}</Text>
            </View>
          )}
          {subjects.length > 0 && (
            <View style={styles.subjectsContainer}>
              <Text style={styles.subjectsLabel}>مواد درسی:</Text>
              <View style={styles.subjectsList}>
                {subjects.map((subject, index) => (
                  <View key={index} style={styles.subjectTag}>
                    <Text style={styles.subjectText}>{subject}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Principal Specific Info */}
      {staff.PrincipalStaff && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>اطلاعات مدیریت (مدیر مکتب)</Text>
          {staff.PrincipalStaff.qualification && (
            <View style={styles.infoRow}>
              <Ionicons name="school-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>مدرک تحصیلی: {staff.PrincipalStaff.qualification}</Text>
            </View>
          )}
          {staff.PrincipalStaff.experience && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>سابقه: {staff.PrincipalStaff.experience}</Text>
            </View>
          )}
        </View>
      )}

      {/* Bank Info */}
      {(staff.bankAccountNumber || staff.bankName) && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>اطلاعات بانکی</Text>
          {staff.bankName && (
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>نام بانک: {staff.bankName}</Text>
            </View>
          )}
          {staff.bankAccountNumber && (
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>شماره حساب: {staff.bankAccountNumber}</Text>
            </View>
          )}
        </View>
      )}

      {/* Insurance Info */}
      {(staff.insuranceNumber || staff.insuranceProvider) && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>اطلاعات بیمه</Text>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>دارای بیمه: {staff.hasInsurance ? "بله" : "خیر"}</Text>
          </View>
          {staff.insuranceProvider && (
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>شرکت بیمه: {staff.insuranceProvider}</Text>
            </View>
          )}
          {staff.insuranceNumber && (
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={20} color="#64748b" />
              <Text style={styles.infoText}>شماره بیمه: {staff.insuranceNumber}</Text>
            </View>
          )}
        </View>
      )}

      {/* Stats */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>آمار</Text>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#64748b" />
          <Text style={styles.infoText}>تاریخ ثبت: {new Date(staff.createdAt).toLocaleDateString("fa-IR")}</Text>
        </View>
        {staff.attendanceCount !== undefined && (
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#64748b" />
            <Text style={styles.infoText}>تعداد حضور: {staff.attendanceCount} روز</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#3b82f6" }]}
          onPress={() => router.push(`/(hr)/staff/${id}/edit` as any)}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>ویرایش اطلاعات</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#ef4444" }]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.actionText}>حذف کارمند</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  content: { padding: 16, paddingBottom: 40 },
  backButton: { marginBottom: 16 },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  staffName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  staffNameFarsi: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  staffPosition: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  staffDepartment: { fontSize: 14, color: "#94a3b8", fontFamily: "Vazir" },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, justifyContent: "center" },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 13, fontWeight: "600", fontFamily: "Vazir" },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
    fontFamily: "VazirBold",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 8,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
    marginTop: 8,
    marginBottom: 4,
    fontFamily: "VazirBold",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  infoText: { fontSize: 15, color: "#1e293b", fontFamily: "Vazir", flex: 1 },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: "Vazir",
    textAlign: "center",
    paddingVertical: 8,
  },
  subjectsContainer: { marginTop: 8 },
  subjectsLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
    fontFamily: "Vazir",
  },
  subjectsList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  subjectTag: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  subjectText: { fontSize: 13, color: "#8b5cf6", fontFamily: "Vazir" },
  actionContainer: { flexDirection: "row", gap: 12, marginTop: 8 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});