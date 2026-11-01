/* eslint-disable react-hooks/set-state-in-effect */
// app/(principal)/students/[id].tsx
import DisciplineReportForm from "@/components/discipline/DisciplineReportForm";
import PraiseForm from "@/components/discipline/PraiseForm";
import {
  getStudentStatusColor,
  getStudentStatusText,
  principalApi,
  StudentFullDetail
} from "@/src/config/principalApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ==================== HELPERS ====================

const labelize = (key?: string | null) => {
  if (!key) return "—";
  const map: Record<string, string> = {
    MALE: "مرد",
    FEMALE: "زن",
    OTHER: "سایر",
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
    SINGLE: "مجرد",
    MARRIED: "متأهل",
    DIVORCED: "طلاق داده",
    WIDOWED: "بیوه",
    NEW: "جدید",
    TRANSFER: "انتقالی",
    RE_ENROLL: "ثبت‌نام مجدد",
    DRAFT: "پیش‌نویس",
    PENDING_REVIEW: "در انتظار",
    SUBMITTED: "ارسال شده",
    ACKNOWLEDGED: "تأیید شده",
    DISPUTED: "اعتراض",
    ARCHIVED: "بایگانی",
    EXCELLENT: "عالی",
    VERY_GOOD: "خیلی خوب",
    GOOD: "خوب",
    SATISFACTORY: "قابل قبول",
    NEEDS_IMPROVEMENT: "نیاز به بهبود",
    UNSATISFACTORY: "ضعیف",
    MONTHLY: "ماهانه",
    QUARTERLY: "سه‌ماهه",
    SEMESTER: "سمستر",
    ANNUAL: "سالانه",
    PROBATION: "آزمایشی",
    SPECIAL: "ویژه",
    FIRST: "اول",
    SECOND: "دوم",
    THIRD: "سوم",
    SUMMER: "تابستانی",
    PRESENT: "حاضر",
    ABSENT: "غایب",
    LATE: "تأخیر",
    EXCUSED: "موجه",
  };
  return map[key] || key;
};

const fmtDate = (d?: string | null) => {
  if (!d) return "ثبت نشده";
  try {
    return new Date(d).toLocaleDateString("fa-AF", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "ثبت نشده";
  }
};

const getGradeColor = (grade?: string | null) => {
  const c: Record<string, string> = {
    EXCELLENT: "#10b981",
    VERY_GOOD: "#3b82f6",
    GOOD: "#f59e0b",
    SATISFACTORY: "#f97316",
    NEEDS_IMPROVEMENT: "#ef4444",
    UNSATISFACTORY: "#dc2626",
  };
  return c[grade || ""] || "#64748b";
};

const getStatusColor = (status?: string | null) => {
  const c: Record<string, string> = {
    DRAFT: "#94a3b8",
    PENDING_REVIEW: "#f59e0b",
    SUBMITTED: "#3b82f6",
    ACKNOWLEDGED: "#10b981",
    DISPUTED: "#ef4444",
    ARCHIVED: "#64748b",
  };
  return c[status || ""] || "#64748b";
};

// ==================== SMALL COMPONENTS ====================

const InfoRow = ({ icon, label, value }: any) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={18} color="#64748b" />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue} numberOfLines={2}>
      {value ?? "—"}
    </Text>
  </View>
);

const StatBox = ({ label, value, color, icon }: any) => (
  <View style={[styles.statBox, { borderLeftColor: color }]}>
    <Ionicons name={icon} size={20} color={color} />
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ==================== MAIN SCREEN ====================

export default function StudentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [student, setStudent] = useState<StudentFullDetail | null>(null);
  const [evaluations, setEvaluations] = useState<any>(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [creatingEval, setCreatingEval] = useState(false);

  // Modals
  const [showDisciplineModal, setShowDisciplineModal] = useState(false);
  const [showPraiseModal, setShowPraiseModal] = useState(false);
  const [showEvalPicker, setShowEvalPicker] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);

  const fetchAll = useCallback(async () => {
    try {
      const [detail, evals] = await Promise.all([
        principalApi.getStudentFullDetails(Number(id)),
        principalApi.getStudentEvaluations(Number(id)).catch(() => null),
      ]);

      if (detail.success) setStudent(detail.data);
      if (evals?.success) setEvaluations(evals.data);
    } catch (error) {
      console.error("Fetch student error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setEvalLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchAll();
  }, [id, fetchAll]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  // Open template picker for a new evaluation
  const startEvaluation = async () => {
    try {
      const res = await principalApi.getStudentEvaluationTemplates();
      if (res.success && res.data.length > 0) {
        setTemplates(res.data);
        setShowEvalPicker(true);
      } else {
        Alert.alert(
          "اطلاعات",
          "هیچ قالب ارزیابی موجود نیست. ابتدا قالب ایجاد کنید.",
        );
      }
    } catch (e: any) {
      Alert.alert("خطا", e.message || "خطا در دریافت قالب‌ها");
    }
  };

  const pickTemplate = async (templateId: number) => {
    setCreatingEval(true);
    setShowEvalPicker(false);
    try {
      const res = await principalApi.createStudentEvaluation({
        studentId: Number(id),
        templateId,
      });
      if (res.success) {
        router.push({
          pathname: "/(principal)/student-evaluations/[id]",
          params: { id: String(res.data.id) },
        } as any);
      }
    } catch (e: any) {
      Alert.alert("خطا", e.message || "خطا در ایجاد ارزیابی");
    } finally {
      setCreatingEval(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text style={styles.errorText}>شاگرد یافت نشد</Text>
      </View>
    );
  }

  const user = student.User;
  const att = student.attendanceSummary;
  const grade = student.gradeSummary;
  const fee = student.feeSummary;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Back */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>

        {/* PROFILE */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0) || "?"}
            </Text>
          </View>
          <Text style={styles.studentName}>{user?.fullName || "نامشخص"}</Text>
          {user?.nameFarsi ? (
            <Text style={styles.farsiName}>{user.nameFarsi}</Text>
          ) : null}
          <Text style={styles.classInfo}>
            {student.Class
              ? `${student.Class.name} ${student.Class.section || ""}`.trim()
              : "بدون صنف"}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStudentStatusColor(student.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStudentStatusColor(student.status) },
              ]}
            >
              {getStudentStatusText(student.status)}
            </Text>
          </View>

          {/* KPIs */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{att?.rate ?? 0}%</Text>
              <Text style={styles.kpiLabel}>حضور</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{grade?.average ?? 0}</Text>
              <Text style={styles.kpiLabel}>میانگین نمرات</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>
                {student.disciplineCount ?? 0}
              </Text>
              <Text style={styles.kpiLabel}>انضباطی</Text>
            </View>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{student.praiseCount ?? 0}</Text>
              <Text style={styles.kpiLabel}>تشویق</Text>
            </View>
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>اقدامات</Text>

          <TouchableOpacity
            style={[styles.bigActionButton, { backgroundColor: "#8b5cf6" }]}
            onPress={startEvaluation}
            disabled={creatingEval}
          >
            {creatingEval ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="school" size={22} color="#fff" />
                <Text style={styles.bigActionText}>ثبت ارزیابی شاگرد</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.bigActionButton,
              { backgroundColor: "#ef4444", marginTop: 10 },
            ]}
            onPress={() => setShowDisciplineModal(true)}
          >
            <Ionicons name="warning" size={22} color="#fff" />
            <Text style={styles.bigActionText}>درج مورد انضباطی</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.bigActionButton,
              { backgroundColor: "#10b981", marginTop: 10 },
            ]}
            onPress={() => setShowPraiseModal(true)}
          >
            <Ionicons name="gift" size={22} color="#fff" />
            <Text style={styles.bigActionText}>ثبت تشویق</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.bigActionButton,
              { backgroundColor: "#3b82f6", marginTop: 10 },
            ]}
            onPress={() => router.push(`./${id}/discipline-report` as any)}
          >
            <Ionicons name="stats-chart" size={22} color="#fff" />
            <Text style={styles.bigActionText}>گزارش کامل انضباطی</Text>
          </TouchableOpacity>
        </View>

        {/* EVALUATIONS */}
        <View style={styles.infoCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>
              ارزیابی‌های شاگرد
            </Text>
            {evalLoading ? (
              <ActivityIndicator size="small" color="#8b5cf6" />
            ) : null}
          </View>

          {!evaluations?.evaluations?.length ? (
            <View style={styles.emptyBox}>
              <Ionicons name="school-outline" size={40} color="#cbd5e1" />
              <Text style={styles.emptyText}>هنوز ارزیابی ثبت نشده</Text>
            </View>
          ) : (
            <>
              <View style={styles.evalSummaryRow}>
                <Text style={styles.evalSummaryText}>
                  مجموع: {evaluations.summary.total}
                </Text>
                <Text style={styles.evalSummaryText}>
                  نهایی: {evaluations.summary.completed}
                </Text>
                <Text style={[styles.evalSummaryText, { color: "#8b5cf6" }]}>
                  میانگین: {evaluations.summary.averagePercentage}%
                </Text>
              </View>

              {evaluations.evaluations.map((e: any) => (
                <TouchableOpacity
                  key={e.id}
                  style={styles.evalCard}
                  onPress={() =>
                    router.push({
                      pathname: "/(principal)/student-evaluations/[id]",
                      params: { id: String(e.id) },
                    } as any)
                  }
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.evalName}>{e.templateName}</Text>
                    <Text style={styles.evalMeta}>
                      {labelize(e.period)} • {labelize(e.term)} •{" "}
                      {e.academicYear || "—"}
                    </Text>
                    <Text style={styles.evalMeta}>
                      ارزیاب: {e.evaluatorName} • {fmtDate(e.evaluatedAt)}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <View
                      style={[
                        styles.evalGradeBadge,
                        { backgroundColor: getGradeColor(e.grade) + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.evalGradeText,
                          { color: getGradeColor(e.grade) },
                        ]}
                      >
                        {e.gradeLabel}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.evalStatusBadge,
                        { backgroundColor: getStatusColor(e.status) + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.evalStatusText,
                          { color: getStatusColor(e.status) },
                        ]}
                      >
                        {labelize(e.status)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        {/* CONTACT */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>اطلاعات تماس</Text>
          <InfoRow icon="mail-outline" label="ایمیل" value={user?.email} />
          <InfoRow icon="call-outline" label="تلفن" value={user?.phone} />
          {student.studentNumber && (
            <InfoRow
              icon="card-outline"
              label="شماره شاگرد"
              value={student.studentNumber}
            />
          )}
          <InfoRow
            icon="home-outline"
            label="آدرس فعلی"
            value={user?.currentAddress}
          />
          <InfoRow
            icon="home-outline"
            label="آدرس دایمی"
            value={user?.permanentAddress}
          />
        </View>

        {/* ENROLMENT */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>ثبت‌نام و وضعیت</Text>
          <InfoRow
            icon="calendar-outline"
            label="تاریخ شمولیت"
            value={fmtDate(student.enrollmentDate)}
          />
          <InfoRow
            icon="log-in-outline"
            label="نوع شمولیت"
            value={labelize(student.enrollmentType)}
          />
          <InfoRow
            icon="flag-outline"
            label="وضعیت"
            value={getStudentStatusText(student.status)}
          />
          {student.graduationDate && (
            <InfoRow
              icon="school-outline"
              label="تاریخ فراغت"
              value={fmtDate(student.graduationDate)}
            />
          )}
          {student.graduationYear && (
            <InfoRow
              icon="calendar"
              label="سال فراغت"
              value={student.graduationYear}
            />
          )}
          {student.leftDate && (
            <>
              <InfoRow
                icon="exit-outline"
                label="تاریخ ترک"
                value={fmtDate(student.leftDate)}
              />
              <InfoRow
                icon="information-circle-outline"
                label="دلیل ترک"
                value={student.leftReason}
              />
            </>
          )}
          {student.isTransfer && (
            <>
              <InfoRow
                icon="swap-horizontal-outline"
                label="تاریخ انتقال"
                value={fmtDate(student.transferDate)}
              />
              <InfoRow
                icon="business-outline"
                label="مکتب قبلی/مقصد"
                value={student.transferSchool || student.previousSchool}
              />
            </>
          )}
        </View>

        {/* PERSONAL */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>معلومات شخصی</Text>
          <InfoRow
            icon="person-outline"
            label="نام کامل"
            value={user?.fullName}
          />
          {user?.nameFarsi ? (
            <InfoRow
              icon="language-outline"
              label="نام به دری"
              value={user.nameFarsi}
            />
          ) : null}
          <InfoRow
            icon="male-female-outline"
            label="جنسیت"
            value={labelize(user?.sex)}
          />
          <InfoRow
            icon="calendar-outline"
            label="تاریخ تولد"
            value={fmtDate(student.birthDate || user?.birthDate)}
          />
          <InfoRow
            icon="location-outline"
            label="محل تولد"
            value={user?.birthPlace}
          />
          <InfoRow
            icon="water-outline"
            label="گروه خون"
            value={labelize(user?.bloodType)}
          />
          <InfoRow icon="flag-outline" label="ملیت" value={user?.nationality} />
          <InfoRow
            icon="person-outline"
            label="نام پدر"
            value={user?.fatherName}
          />
          <InfoRow
            icon="person-outline"
            label="نام پدرکلان"
            value={user?.grandfatherName}
          />
          <InfoRow
            icon="card-outline"
            label="شماره تذکره"
            value={user?.civilId}
          />
        </View>

        {/* HEALTH */}
        {(student.allergies ||
          student.healthConditions ||
          student.medication ||
          student.specialNeeds) && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>وضعیت صحی</Text>
            {student.allergies ? (
              <InfoRow
                icon="alert-circle-outline"
                label="حساسیت"
                value={student.allergies}
              />
            ) : null}
            {student.healthConditions ? (
              <InfoRow
                icon="medkit-outline"
                label="وضعیت صحی"
                value={student.healthConditions}
              />
            ) : null}
            {student.medication ? (
              <InfoRow
                icon="bandage-outline"
                label="ادویه"
                value={student.medication}
              />
            ) : null}
            {student.specialNeeds ? (
              <InfoRow
                icon="accessibility-outline"
                label="نیازهای ویژه"
                value={student.specialNeeds}
              />
            ) : null}
          </View>
        )}

        {/* EMERGENCY */}
        {(user?.emergencyContactName ||
          user?.emergencyContactPhone ||
          student.parentContact) && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>تماس اضطراری</Text>
            {user?.emergencyContactName ? (
              <InfoRow
                icon="person-outline"
                label="نام"
                value={user.emergencyContactName}
              />
            ) : null}
            {user?.emergencyContactPhone ? (
              <InfoRow
                icon="call-outline"
                label="تلفن"
                value={user.emergencyContactPhone}
              />
            ) : null}
            {user?.emergencyContactRelation ? (
              <InfoRow
                icon="git-network-outline"
                label="نسبت"
                value={user.emergencyContactRelation}
              />
            ) : null}
            {student.parentContact ? (
              <InfoRow
                icon="call-outline"
                label="تلفن والد"
                value={student.parentContact}
              />
            ) : null}
          </View>
        )}

        {/* PARENTS */}
        {student.ParentStudent && student.ParentStudent.length > 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>والدین</Text>
            {student.ParentStudent.map((ps: any, idx: number) => (
              <View key={ps.Parent?.id || idx} style={styles.parentItem}>
                <Text style={styles.parentName}>
                  {ps.Parent?.User?.fullName || "نامشخص"}
                </Text>
                <Text style={styles.parentPhone}>
                  {ps.Parent?.User?.phone || "—"}
                </Text>
                <Text style={styles.parentRelation}>
                  {ps.Parent?.relationship || "والد"}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ATTENDANCE */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>حضور و غیاب</Text>
          <View style={styles.statGrid}>
            <StatBox
              label="حاضر"
              value={att.present}
              color="#10b981"
              icon="checkmark-circle"
            />
            <StatBox
              label="تأخیر"
              value={att.late}
              color="#f59e0b"
              icon="time"
            />
            <StatBox
              label="غایب"
              value={att.absent}
              color="#ef4444"
              icon="close-circle"
            />
            <StatBox
              label="موجه"
              value={att.excused}
              color="#3b82f6"
              icon="shield-checkmark"
            />
          </View>
          <View style={styles.attRateRow}>
            <Text style={styles.attRateLabel}>فیصدی حضور</Text>
            <View style={styles.attBar}>
              <View
                style={[
                  styles.attBarFill,
                  {
                    width: `${Math.min(att.rate, 100)}%`,
                    backgroundColor:
                      att.rate >= 80
                        ? "#10b981"
                        : att.rate >= 50
                          ? "#f59e0b"
                          : "#ef4444",
                  },
                ]}
              />
            </View>
            <Text style={styles.attRateValue}>{att.rate}%</Text>
          </View>
        </View>

        {/* GRADES */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>نمرات</Text>
          {student.Grade.length === 0 ? (
            <Text style={styles.emptyText}>هیچ نمره‌ای ثبت نشده</Text>
          ) : (
            <>
              <View style={styles.gradeSummaryRow}>
                <Text style={styles.gradeSummaryText}>
                  تعداد: {grade.totalGrades}
                </Text>
                <Text
                  style={[
                    styles.gradeSummaryText,
                    { color: "#8b5cf6", fontWeight: "700" },
                  ]}
                >
                  میانگین: {grade.average}
                </Text>
              </View>
              {student.Grade.slice(0, 8).map((g: any) => (
                <View key={g.id} style={styles.gradeRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.gradeSubject}>
                      {g.Exam?.name || g.subject || "—"}
                    </Text>
                    <Text style={styles.gradeMeta}>
                      {g.Exam?.subject || ""}{" "}
                      {g.Exam?.type ? `• ${g.Exam.type}` : ""}{" "}
                      {g.Exam?.date ? `• ${fmtDate(g.Exam.date)}` : ""}
                    </Text>
                  </View>
                  <Text style={styles.gradeValue}>
                    {g.marks}/{g.Exam?.maxScore ?? "—"}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* BEHAVIOUR SUMMARY */}
        {student.disciplineScore && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>امتیاز انضباطی</Text>
            <View style={styles.disciplineRow}>
              <View
                style={[
                  styles.disciplineCircle,
                  {
                    borderColor:
                      student.disciplineScore.currentScore >= 80
                        ? "#10b981"
                        : student.disciplineScore.currentScore >= 50
                          ? "#f59e0b"
                          : "#ef4444",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.disciplineScoreText,
                    {
                      color:
                        student.disciplineScore.currentScore >= 80
                          ? "#10b981"
                          : student.disciplineScore.currentScore >= 50
                            ? "#f59e0b"
                            : "#ef4444",
                    },
                  ]}
                >
                  {student.disciplineScore.currentScore}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.disciplineGrade}>
                  {labelize(student.disciplineScore.grade)}
                </Text>
                <Text style={styles.disciplineMeta}>
                  مجموع موارد: {student.disciplineScore.totalIncidents}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* EDIT / PROMOTE */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#3b82f6" }]}
            onPress={() => router.push(`./${id}/edit` as any)}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.actionText}>ویرایش</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#8b5cf6" }]}
            onPress={() => router.push(`./${id}/promote` as any)}
          >
            <Ionicons name="arrow-up-outline" size={20} color="#fff" />
            <Text style={styles.actionText}>ارتقا صنف</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODALS */}
      <DisciplineReportForm
        visible={showDisciplineModal}
        onClose={() => setShowDisciplineModal(false)}
        studentId={student.id}
        studentName={user.fullName}
        className={
          student.Class
            ? `${student.Class.name}${student.Class.section ? ` - ${student.Class.section}` : ""}`
            : undefined
        }
        onSuccess={() => fetchAll()}
      />

      <PraiseForm
        visible={showPraiseModal}
        onClose={() => setShowPraiseModal(false)}
        studentId={student.id}
        studentName={user.fullName}
        className={
          student.Class
            ? `${student.Class.name}${student.Class.section ? ` - ${student.Class.section}` : ""}`
            : undefined
        }
        onSuccess={() => fetchAll()}
      />

      {/* TEMPLATE PICKER */}
      <Modal
        visible={showEvalPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEvalPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>انتخاب قالب ارزیابی</Text>
              <TouchableOpacity onPress={() => setShowEvalPicker(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            {templates.length === 0 ? (
              <Text style={styles.emptyText}>هیچ قالبی موجود نیست</Text>
            ) : (
              templates.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.templateRow}
                  onPress={() => pickTemplate(t.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.templateName}>{t.name}</Text>
                    <Text style={styles.templateMeta}>
                      {labelize(t.period)} • {t.criteriaCount} معیار
                    </Text>
                  </View>
                  <Ionicons name="chevron-back" size={18} color="#94a3b8" />
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  content: { padding: 16, paddingBottom: 40 },
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
    backgroundColor: "#f1f5f9",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  backButton: { marginBottom: 16 },

  // Profile
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
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#f59e0b",
    fontFamily: "VazirBold",
  },
  studentName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  farsiName: {
    fontSize: 15,
    color: "#475569",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  classInfo: {
    fontSize: 15,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  statusBadge: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 13, fontWeight: "600", fontFamily: "Vazir" },
  kpiRow: { flexDirection: "row", marginTop: 16, gap: 8, width: "100%" },
  kpiItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    paddingVertical: 10,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  kpiLabel: {
    fontSize: 11,
    color: "#64748b",
    fontFamily: "Vazir",
    marginTop: 2,
  },

  // Cards
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
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  // Info row
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  infoLabel: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
    width: 110,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Vazir",
    textAlign: "right",
  },

  // Actions
  bigActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  bigActionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
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

  // Evaluations
  emptyBox: { alignItems: "center", paddingVertical: 24 },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: "Vazir",
    textAlign: "center",
    marginTop: 8,
    padding: 16,
  },
  evalSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    marginBottom: 10,
  },
  evalSummaryText: { fontSize: 12, color: "#475569", fontFamily: "VazirBold" },
  evalCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 8,
  },
  evalName: { fontSize: 14, color: "#1e293b", fontFamily: "VazirBold" },
  evalMeta: {
    fontSize: 11,
    color: "#64748b",
    fontFamily: "Vazir",
    marginTop: 2,
  },
  evalGradeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  evalGradeText: { fontSize: 11, fontWeight: "700", fontFamily: "VazirBold" },
  evalStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  evalStatusText: { fontSize: 10, fontFamily: "Vazir" },

  // Fees
  feeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  feeItem: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  feeLabel: { fontSize: 12, color: "#94a3b8", fontFamily: "Vazir" },
  feeValue: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 4,
    fontFamily: "VazirBold",
    color: "#1e293b",
  },
  badgeRow: { marginTop: 12 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  badgeText: { fontSize: 12, fontFamily: "VazirBold" },

  // Parents
  parentItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  parentName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  parentPhone: { fontSize: 13, color: "#64748b", fontFamily: "Vazir" },
  parentRelation: { fontSize: 12, color: "#94a3b8", fontFamily: "Vazir" },

  // Attendance stats
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  statBox: {
    width: "48%",
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: "700", fontFamily: "VazirBold" },
  statLabel: { fontSize: 11, color: "#64748b", fontFamily: "Vazir" },
  attRateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  attRateLabel: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
    width: 80,
  },
  attBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    overflow: "hidden",
  },
  attBarFill: { height: "100%", borderRadius: 4 },
  attRateValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
    minWidth: 40,
    textAlign: "right",
  },

  // Grades
  gradeSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginBottom: 10,
  },
  gradeSummaryText: { fontSize: 12, color: "#475569", fontFamily: "Vazir" },
  gradeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  gradeSubject: { fontSize: 14, color: "#1e293b", fontFamily: "VazirBold" },
  gradeMeta: {
    fontSize: 11,
    color: "#64748b",
    fontFamily: "Vazir",
    marginTop: 2,
  },
  gradeValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },

  // Discipline
  disciplineRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  disciplineCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
  disciplineScoreText: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  disciplineGrade: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  disciplineMeta: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
    marginTop: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  templateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  templateName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  templateMeta: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
    marginTop: 2,
  },
});
