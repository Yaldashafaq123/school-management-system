// app/(public)/announcements/create.tsx
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { announcementsApi, ClassOption } from "@/src/config/announcementApi";

// ==========================================================
// ROLE CONFIG — what each role can DO in this form
// ==========================================================
type Role = "ADMIN" | "PRINCIPAL" | "TEACHER" | "FINANCE" | "HR";

interface RoleConfig {
  types: string[];
  targetOptions: ("ALL" | "STUDENT" | "PARENT" | "TEACHER" | "SPECIFIC_CLASS")[];
  canTargetClasses: boolean;
  canSetEventFields: boolean;
  canSetLink: boolean;
  canSchedule: boolean;
}

const ROLE_CONFIGS: Record<Role, RoleConfig> = {
  ADMIN: {
    types: [
      "GENERAL", "ASSIGNMENT", "EXAM", "EVENT", "FEE",
      "GRADE_RESULT", "PARENT_MEETING", "TIMETABLE", "HOLIDAY", "WORKSHOP",
    ],
    targetOptions: ["ALL", "STUDENT", "PARENT", "TEACHER", "SPECIFIC_CLASS"],
    canTargetClasses: true,
    canSetEventFields: true,
    canSetLink: true,
    canSchedule: true,
  },
  PRINCIPAL: {
    types: [
      "GENERAL", "ASSIGNMENT", "EXAM", "EVENT", "FEE",
      "GRADE_RESULT", "PARENT_MEETING", "TIMETABLE", "HOLIDAY", "WORKSHOP",
    ],
    targetOptions: ["ALL", "STUDENT", "PARENT", "TEACHER", "SPECIFIC_CLASS"],
    canTargetClasses: true,
    canSetEventFields: true,
    canSetLink: true,
    canSchedule: true,
  },
  TEACHER: {
    // Teacher can't send ASSIGNMENT through announcements (they use their own module),
    // but they can announce events/exams for their own classes.
    types: ["GENERAL", "EXAM", "EVENT", "HOLIDAY", "WORKSHOP"],
    targetOptions: ["SPECIFIC_CLASS"], // only own classes — enforced here AND in backend
    canTargetClasses: true,
    canSetEventFields: true,
    canSetLink: false,
    canSchedule: true,
  },
  FINANCE: {
    // Finance ONLY sends FEE announcements
    types: ["FEE"],
    targetOptions: ["PARENT", "ALL"],
    canTargetClasses: false,
    canSetEventFields: true, // can add due date as eventDate
    canSetLink: false,
    canSchedule: true,
  },
  HR: {
    types: ["GENERAL", "PARENT_MEETING", "WORKSHOP"],
    targetOptions: ["ALL", "PARENT", "TEACHER"],
    canTargetClasses: false,
    canSetEventFields: true,
    canSetLink: true,
    canSchedule: true,
  },
};

const TYPE_META: Record<string, { label: string; icon: string; color: string }> = {
  GENERAL: { label: "عمومی", icon: "megaphone", color: "#3B82F6" },
  ASSIGNMENT: { label: "کارخانگی", icon: "document-text", color: "#10B981" },
  EXAM: { label: "آزمون", icon: "clipboard", color: "#F59E0B" },
  EVENT: { label: "رویداد", icon: "calendar", color: "#8B5CF6" },
  FEE: { label: "فیس", icon: "cash", color: "#EF4444" },
  GRADE_RESULT: { label: "نتیجه امتحان", icon: "school", color: "#06B6D4" },
  PARENT_MEETING: { label: "جلسه اولیا", icon: "people", color: "#EC4899" },
  TIMETABLE: { label: "برنامه هفتگی", icon: "time", color: "#14B8A6" },
  HOLIDAY: { label: "رخصتی", icon: "sunny", color: "#F97316" },
  WORKSHOP: { label: "کارگاه", icon: "construct", color: "#A855F7" },
};

const TARGET_META: Record<string, { label: string; icon: string }> = {
  ALL: { label: "همه کاربران", icon: "people" },
  STUDENT: { label: "فقط شاگردان", icon: "school" },
  PARENT: { label: "فقط والدین", icon: "person" },
  TEACHER: { label: "فقط معلمان", icon: "person-circle" },
  SPECIFIC_CLASS: { label: "صنف‌های خاص", icon: "list" },
};

const PRIORITIES = [
  { id: "LOW", label: "عادی", color: "#6B7280" },
  { id: "NORMAL", label: "متوسط", color: "#3B82F6" },
  { id: "HIGH", label: "مهم", color: "#F59E0B" },
  { id: "URGENT", label: "فوری", color: "#EF4444" },
];

// ==========================================================
// SCREEN
// ==========================================================
export default function CreateAnnouncementScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const role = (user?.role as Role) || "ADMIN";
  const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.ADMIN;

  // ----- form state -----
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState(config.types[0]);
  const [priority, setPriority] = useState("NORMAL");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");

  // audience
  const [targetAudience, setTargetAudience] =
    useState<RoleConfig["targetOptions"][number]>(
      config.targetOptions[0]
    );
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // event fields
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [eventLocation, setEventLocation] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // options
  const [requireConfirmation, setRequireConfirmation] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [scheduledFor, setScheduledFor] = useState<Date | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // --------------------------------------------------------
  // LOAD classes when needed
  // --------------------------------------------------------
  const needsClasses =
    config.canTargetClasses && targetAudience === "SPECIFIC_CLASS";

  useEffect(() => {
    if (!needsClasses || classes.length > 0) return;

    (async () => {
      setLoadingClasses(true);
      try {
        const res = await announcementsApi.getMyClasses();
        if (res.success) {
          setClasses(res.data.classes);
        }
      } catch (err) {
        console.error("getMyClasses:", err);
      } finally {
        setLoadingClasses(false);
      }
    })();
  }, [needsClasses]);

  // --------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------
  const showEventDate =
    config.canSetEventFields &&
    (type === "EVENT" || type === "PARENT_MEETING" || type === "EXAM" || type === "FEE");

  const showEventLocation = config.canSetEventFields && type === "EVENT";
  const showLink = config.canSetLink && type === "PARENT_MEETING";

  const toggleClass = (id: number) => {
    setSelectedClassIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const validate = (): string | null => {
    if (!title.trim()) return "عنوان اعلامیه الزامی است";
    if (!content.trim()) return "متن اعلامیه الزامی است";

    if (config.canTargetClasses && targetAudience === "SPECIFIC_CLASS" && selectedClassIds.length === 0) {
      return "لطفاً حداقل یک صنف را انتخاب کنید";
    }
    if (config.canSetEventFields && type === "EVENT" && !eventDate) {
      return "برای رویداد، تاریخ الزامی است";
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      Alert.alert("خطا", err);
      return;
    }

    setSubmitting(true);
    try {
      // Build payload — backend validates role/type/target combinations
      const payload: any = {
        title: title.trim(),
        content: content.trim(),
        type,
        priority,
        status,
        allowComments,
        requireConfirmation,
      };

      // Audience
      if (targetAudience === "SPECIFIC_CLASS") {
        payload.classIds = selectedClassIds;
      } else if (targetAudience === "ALL") {
        // no targetRole and no classIds = school-wide
      } else {
        // STUDENT / PARENT / TEACHER
        payload.targetRole = targetAudience;
      }

      // Event fields
      if (showEventDate && eventDate) {
        payload.eventDate = eventDate.toISOString();
      }
      if (showEventLocation && eventLocation) {
        payload.eventLocation = eventLocation;
      }
      if (showLink && linkUrl) {
        payload.linkUrl = linkUrl;
      }
      if (config.canSchedule && scheduledFor) {
        payload.scheduledFor = scheduledFor.toISOString();
      }

      const res = await announcementsApi.create(payload);
      if (res.success) {
        Alert.alert("موفقیت", "اعلامیه با موفقیت ایجاد شد", [
          { text: "باشه", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("خطا", res.message || "خطا در ایجاد اعلامیه");
      }
    } catch (err: any) {
      console.error("create error:", err);
      Alert.alert("خطا", err?.message || "مشکلی در ایجاد اعلامیه پیش آمد");
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="ایجاد اعلامیه"
        showBack
        onBackPress={() => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ROLE BANNER */}
          <View style={styles.roleBanner}>
            <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
            <Text style={styles.roleBannerText}>
              شما به عنوان <Text style={styles.roleBold}>{roleLabel(role)}</Text> وارد شده‌اید — فقط
              اعلامیه‌های مجاز برای نقش شما نمایش داده می‌شود
            </Text>
          </View>

          {/* TYPE */}
          <Section title="نوع اعلامیه" icon="pricetag">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
            >
              {config.types.map((tid) => {
                const meta = TYPE_META[tid];
                const active = type === tid;
                return (
                  <TouchableOpacity
                    key={tid}
                    style={[
                      styles.typeCard,
                      active && {
                        borderColor: meta.color,
                        backgroundColor: `${meta.color}15`,
                      },
                    ]}
                    onPress={() => setType(tid)}
                  >
                    <View
                      style={[
                        styles.typeIconCircle,
                        { backgroundColor: `${meta.color}20` },
                      ]}
                    >
                      <Ionicons name={meta.icon as any} size={22} color={meta.color} />
                    </View>
                    <Text style={styles.typeCardText}>{meta.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Section>

          {/* TITLE */}
          <Section title="عنوان" icon="text" required>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="عنوان اعلامیه را وارد کنید"
              placeholderTextColor={Colors.textSecondary}
              textAlign="right"
              maxLength={120}
            />
            <Text style={styles.helperText}>{title.length}/120</Text>
          </Section>

          {/* CONTENT */}
          <Section title="متن" icon="document-text" required>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={content}
              onChangeText={setContent}
              placeholder="متن اعلامیه..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              textAlign="right"
            />
          </Section>

          {/* PRIORITY */}
          <Section title="اولویت" icon="flag">
            <View style={styles.rowWrap}>
              {PRIORITIES.map((p) => {
                const active = priority === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.priorityChip,
                      active && { backgroundColor: p.color, borderColor: p.color },
                    ]}
                    onPress={() => setPriority(p.id)}
                  >
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: active ? "#fff" : p.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.priorityChipText,
                        active && { color: "#fff" },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Section>

          {/* AUDIENCE */}
          <Section title="مخاطبان" icon="people">
            <View style={{ gap: 8 }}>
              {config.targetOptions.map((opt) => {
                const meta = TARGET_META[opt];
                const active = targetAudience === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.audienceRow,
                      active && styles.audienceRowActive,
                    ]}
                    onPress={() => setTargetAudience(opt)}
                  >
                    <View style={[styles.radio, active && styles.radioActive]}>
                      {active && <View style={styles.radioInner} />}
                    </View>
                    <Ionicons
                      name={meta.icon as any}
                      size={18}
                      color={active ? Colors.primary : Colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.audienceLabel,
                        active && { color: Colors.primary, fontFamily: "VazirBold" },
                      ]}
                    >
                      {meta.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Class selection */}
            {needsClasses && (
              <View style={{ marginTop: 12 }}>
                {loadingClasses ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : classes.length === 0 ? (
                  <Text style={styles.helperText}>هیچ صنفی برای شما یافت نشد</Text>
                ) : (
                  <View style={styles.rowWrap}>
                    {classes.map((c) => {
                      const active = selectedClassIds.includes(c.id);
                      return (
                        <TouchableOpacity
                          key={c.id}
                          style={[
                            styles.classChip,
                            active && styles.classChipActive,
                          ]}
                          onPress={() => toggleClass(c.id)}
                        >
                          <Ionicons
                            name={active ? "checkmark-circle" : "ellipse-outline"}
                            size={14}
                            color={active ? "#fff" : Colors.primary}
                          />
                          <Text
                            style={[
                              styles.classChipText,
                              active && { color: "#fff" },
                            ]}
                          >
                            {c.displayName || c.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </Section>

          {/* EVENT FIELDS */}
          {showEventDate && (
            <Section
              title={type === "FEE" ? "تاریخ سررسید" : "تاریخ رویداد"}
              icon="calendar"
            >
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                <Text style={styles.dateButtonText}>
                  {eventDate
                    ? eventDate.toLocaleDateString("fa-IR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "انتخاب تاریخ"}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={eventDate || new Date()}
                  mode="date"
                  onChange={(_, d) => {
                    setShowDatePicker(false);
                    if (d) setEventDate(d);
                  }}
                />
              )}
            </Section>
          )}

          {showEventLocation && (
            <Section title="مکان" icon="location">
              <TextInput
                style={styles.input}
                value={eventLocation}
                onChangeText={setEventLocation}
                placeholder="مکان برگزاری"
                placeholderTextColor={Colors.textSecondary}
                textAlign="right"
              />
            </Section>
          )}

          {showLink && (
            <Section title="لینک جلسه آنلاین" icon="link">
              <TextInput
                style={styles.input}
                value={linkUrl}
                onChangeText={setLinkUrl}
                placeholder="https://..."
                placeholderTextColor={Colors.textSecondary}
                autoCapitalize="none"
                keyboardType="url"
                textAlign="left"
              />
            </Section>
          )}

          {/* OPTIONS */}
          <Section title="تنظیمات" icon="options">
            <ToggleRow
              icon="checkmark-done"
              label="نیاز به تایید حضور"
              value={requireConfirmation}
              onValueChange={setRequireConfirmation}
            />
            <ToggleRow
              icon="chatbubbles"
              label="فعال کردن نظرات"
              value={allowComments}
              onValueChange={setAllowComments}
            />
          </Section>

          {/* PUBLISH STATUS */}
          <Section title="وضعیت انتشار" icon="send">
            <View style={styles.rowWrap}>
              <TouchableOpacity
                style={[
                  styles.statusChip,
                  status === "PUBLISHED" && styles.statusChipPublished,
                ]}
                onPress={() => setStatus("PUBLISHED")}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={status === "PUBLISHED" ? "#fff" : Colors.success}
                />
                <Text
                  style={[
                    styles.statusChipText,
                    status === "PUBLISHED" && { color: "#fff" },
                  ]}
                >
                  انتشار فوری
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusChip,
                  status === "DRAFT" && styles.statusChipDraft,
                ]}
                onPress={() => setStatus("DRAFT")}
              >
                <Ionicons
                  name="document-outline"
                  size={16}
                  color={status === "DRAFT" ? "#fff" : "#64748B"}
                />
                <Text
                  style={[
                    styles.statusChipText,
                    status === "DRAFT" && { color: "#fff" },
                  ]}
                >
                  ذخیره پیش‌نویس
                </Text>
              </TouchableOpacity>
            </View>
          </Section>
        </ScrollView>

        {/* SUBMIT */}
        <View style={styles.submitBar}>
          <TouchableOpacity
            style={[styles.submitButton, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#fff" />
                <Text style={styles.submitButtonText}>
                  {status === "PUBLISHED" ? "انتشار اعلامیه" : "ذخیره پیش‌نویس"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==========================================================
// SMALL COMPONENTS
// ==========================================================
function Section({
  title,
  icon,
  required,
  children,
}: {
  title: string;
  icon: any;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
        <Text style={styles.sectionTitle}>
          {title}
          {required && <Text style={{ color: "#EF4444" }}> *</Text>}
        </Text>
      </View>
      {children}
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onValueChange,
}: {
  icon: any;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
        <Ionicons name={icon} size={18} color={Colors.textSecondary} />
        <Text style={styles.toggleLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: "#E2E8F0", true: Colors.primary + "80" }}
        thumbColor={value ? Colors.primary : "#F1F5F9"}
      />
    </View>
  );
}

function roleLabel(role: Role): string {
  const map: Record<Role, string> = {
    ADMIN: "مدیر",
    PRINCIPAL: "مدیر مکتب",
    TEACHER: "معلم",
    FINANCE: "کارمند مالی",
    HR: "منابع بشری",
  };
  return map[role] || role;
}

// ==========================================================
// STYLES
// ==========================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },

  roleBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    marginBottom: 16,
  },
  roleBannerText: { flex: 1, fontSize: 12, color: Colors.text, fontFamily: "Vazir", textAlign: "right" },
  roleBold: { fontFamily: "VazirBold", color: Colors.primary },

  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: "VazirBold",
    fontWeight: "700",
  },

  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    fontFamily: "Vazir",
  },
  textarea: { minHeight: 110, paddingTop: 12 },
  helperText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Vazir",
    textAlign: "left",
    marginTop: 4,
  },

  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

  typeCard: {
    width: 90,
    padding: 10,
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  typeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  typeCardText: { fontSize: 11, color: Colors.text, fontFamily: "Vazir", textAlign: "center" },

  priorityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priorityChipText: { fontSize: 13, color: Colors.text, fontFamily: "Vazir" },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },

  audienceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  audienceRowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  audienceLabel: { fontSize: 13, color: Colors.text, fontFamily: "Vazir", textAlign: "right" },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: Colors.primary },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },

  classChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.primary + "40",
  },
  classChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  classChipText: { fontSize: 12, color: Colors.text, fontFamily: "Vazir" },

  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateButtonText: { fontSize: 13, color: Colors.text, fontFamily: "Vazir" },

  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginBottom: 8,
  },
  toggleLabel: { fontSize: 13, color: Colors.text, fontFamily: "Vazir", textAlign: "right" },

  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
    justifyContent: "center",
  },
  statusChipText: { fontSize: 13, color: Colors.text, fontFamily: "Vazir" },
  statusChipPublished: { backgroundColor: Colors.success, borderColor: Colors.success },
  statusChipDraft: { backgroundColor: "#64748B", borderColor: "#64748B" },

  submitBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "VazirBold",
    fontWeight: "700",
  },
});