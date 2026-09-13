// components/discipline/DisciplineReportForm.tsx
import { Colors } from "@/constants/Colors";
import { disciplineApi } from "@/src/config/disciplineApi";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// =============================
// انواع داده
// =============================
type Violation = {
  id: number;
  code: string;
  name: string;
  severity: "MINOR" | "MODERATE" | "MAJOR" | "CRITICAL";
  description?: string;
  defaultDeduction: number;
  recommendedAction?: string;
};

type Category = {
  id: number;
  code: string;
  name: string;
  color: string;
  icon?: string;
  sortOrder: number;
  violations: Violation[];
};

type Props = {
  visible: boolean;
  onClose: () => void;
  studentId?: number;
  studentName?: string;
  className?: string;
  onSuccess?: () => void;
};

const severityFa: Record<string, { label: string; color: string }> = {
  MINOR: { label: "جزئی", color: "#F59E0B" },
  MODERATE: { label: "متوسط", color: "#3B82F6" },
  MAJOR: { label: "مهم", color: "#EF4444" },
  CRITICAL: { label: "بحرانی", color: "#DC2626" },
};

export default function DisciplineReportForm({
  visible,
  onClose,
  studentId,
  studentName,
  className,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(
    null,
  );

  const [incidentDate, setIncidentDate] = useState(
    new Date().toLocaleDateString("fa-IR"),
  );
  const [location, setLocation] = useState("");
  const [period, setPeriod] = useState("");
  const [description, setDescription] = useState("");
  const [witnesses, setWitnesses] = useState("");
  const [severityOverride, setSeverityOverride] = useState<string | null>(null);

  // =============================
  // بارگذاری کاتالوگ — با لاگ کامل
  // =============================
  useEffect(() => {
    console.log("═══════════════════════════════════════");
    console.log("🔵 [DisciplineForm] useEffect triggered");
    console.log("🔵 [DisciplineForm] visible =", visible);
    console.log("🔵 [DisciplineForm] studentId =", studentId);
    console.log("🔵 [DisciplineForm] studentName =", studentName);
    console.log("═══════════════════════════════════════");

    if (!visible) {
      console.log("⏭️ [DisciplineForm] Modal not visible, skipping load");
      return;
    }
    // eslint-disable-next-line react-hooks/immutability
    loadCatalog();
  }, [visible]);

  const loadCatalog = async () => {
    console.log("🚀 [DisciplineForm] loadCatalog() START");
    try {
      setLoading(true);
      console.log("⏳ [DisciplineForm] Calling disciplineApi.getCatalog()...");

      const res = await disciplineApi.getCatalog();

      console.log("✅ [DisciplineForm] Catalog response received");
      console.log("✅ [DisciplineForm] res.success =", res?.success);
      console.log("✅ [DisciplineForm] res.data length =", res?.data?.length);
      console.log(
        "✅ [DisciplineForm] res.data preview =",
        JSON.stringify(res?.data?.slice(0, 2), null, 2),
      );

      if (res.success) {
        setCategories(res.data);
        console.log(
          "✅ [DisciplineForm] Categories set:",
          res.data.length,
          "categories",
        );
      } else {
        console.warn("⚠️ [DisciplineForm] res.success is false:", res.message);
        Alert.alert("خطا", res.message || "خطا در دریافت فهرست تخلفات");
      }
    } catch (e: any) {
      console.error("❌ [DisciplineForm] loadCatalog FAILED");
      console.error("❌ [DisciplineForm] Error name:", e?.name);
      console.error("❌ [DisciplineForm] Error message:", e?.message);
      console.error("❌ [DisciplineForm] Error stack:", e?.stack);
      Alert.alert("خطا", e.message || "خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
      console.log("🏁 [DisciplineForm] loadCatalog() END, loading=false");
    }
  };

  // =============================
  // ریست فرم
  // =============================
  const resetForm = () => {
    setSelectedCategory(null);
    setSelectedViolation(null);
    setIncidentDate(new Date().toLocaleDateString("fa-IR"));
    setLocation("");
    setPeriod("");
    setDescription("");
    setWitnesses("");
    setSeverityOverride(null);
  };

  const handleClose = () => {
    console.log("🔴 [DisciplineForm] handleClose() called");
    resetForm();
    onClose();
  };

  // =============================
  // ارسال — با لاگ کامل
  // =============================
  const handleSubmit = async () => {
    console.log("═══════════════════════════════════════");
    console.log("📤 [DisciplineForm] handleSubmit() START");
    console.log("📤 [DisciplineForm] studentId =", studentId);
    console.log(
      "📤 [DisciplineForm] selectedViolation =",
      selectedViolation?.name,
    );
    console.log("📤 [DisciplineForm] description =", description);

    if (!studentId) {
      console.warn("⚠️ [DisciplineForm] No studentId, aborting");
      Alert.alert("خطا", "شناسه شاگرد مشخص نیست");
      return;
    }
    if (!selectedViolation) {
      console.warn("⚠️ [DisciplineForm] No violation selected, aborting");
      Alert.alert("خطا", "لطفاً نوع تخلف را انتخاب کنید");
      return;
    }
    if (!description.trim()) {
      console.warn("⚠️ [DisciplineForm] No description, aborting");
      Alert.alert("خطا", "شرح تخلف الزامی است");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        studentId,
        violationId: selectedViolation.id,
        incidentDate: new Date().toISOString(),
        location: location.trim() || undefined,
        period: period ? parseInt(period) : undefined,
        description: description.trim(),
        witnesses: witnesses.trim() || undefined,
        severity: severityOverride || undefined,
      };

      console.log(
        "📦 [DisciplineForm] Payload:",
        JSON.stringify(payload, null, 2),
      );
      console.log(
        "⏳ [DisciplineForm] Calling disciplineApi.reportViolation()...",
      );

      const res = await disciplineApi.reportViolation(payload);

      console.log("✅ [DisciplineForm] reportViolation response received");
      console.log("✅ [DisciplineForm] res:", JSON.stringify(res, null, 2));

      if (res.success) {
        console.log("🎉 [DisciplineForm] Violation reported successfully!");
        Alert.alert(
          "موفقیت",
          "تخلف با موفقیت ثبت شد و برای بررسی به مدیر ارسال گردید",
          [
            {
              text: "باشه",
              onPress: () => {
                resetForm();
                onSuccess?.();
                handleClose();
              },
            },
          ],
        );
      } else {
        console.warn("⚠️ [DisciplineForm] res.success is false");
        Alert.alert("خطا", res.message || "ثبت تخلف ناموفق بود");
      }
    } catch (e: any) {
      console.error("❌ [DisciplineForm] handleSubmit FAILED");
      console.error("❌ [DisciplineForm] Error message:", e?.message);
      Alert.alert("خطا", e.message || "خطا در ثبت تخلف");
    } finally {
      setSubmitting(false);
      console.log("🏁 [DisciplineForm] handleSubmit() END");
    }
  };

  // =============================
  // رندر
  // =============================
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>درج مورد انضباطی</Text>
              {studentName && (
                <Text style={styles.headerSubtitle}>
                  {studentName}
                  {className ? ` — ${className}` : ""}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={26} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>
                در حال بارگذاری فهرست تخلفات...
              </Text>
              <Text
                style={{
                  color: Colors.textSecondary,
                  fontSize: 11,
                  marginTop: 8,
                }}
              >
                (لاگ‌ها را در ترمینال Expo ببینید)
              </Text>
            </View>
          ) : categories.length === 0 ? (
            <View style={styles.loadingBox}>
              <Ionicons
                name="alert-circle-outline"
                size={60}
                color={Colors.warning}
              />
              <Text style={styles.loadingText}>
                هیچ دسته‌بندی تخلفی یافت نشد
              </Text>
              <Text
                style={{
                  color: Colors.textSecondary,
                  fontSize: 12,
                  marginTop: 8,
                  textAlign: "center",
                  paddingHorizontal: 20,
                }}
              >
                لطفاً با مدیر سیستم تماس بگیرید یا Seed را اجرا کنید
              </Text>
              <TouchableOpacity
                onPress={loadCatalog}
                style={{
                  marginTop: 16,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  backgroundColor: Colors.primary,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  تلاش مجدد
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.label}>دسته‌بندی تخلف</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8, paddingVertical: 6 }}
              >
                {categories.map((cat) => {
                  const active = selectedCategory?.id === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => {
                        console.log(
                          "🖱️ [DisciplineForm] Category selected:",
                          cat.name,
                        );
                        setSelectedCategory(cat);
                        setSelectedViolation(null);
                      }}
                      style={[
                        styles.catChip,
                        active && {
                          backgroundColor: cat.color || Colors.primary,
                          borderColor: cat.color || Colors.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.catChipText,
                          active && { color: "#fff", fontWeight: "700" },
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {selectedCategory && (
                <>
                  <Text style={[styles.label, { marginTop: 16 }]}>
                    نوع تخلف
                  </Text>
                  <View style={{ gap: 8 }}>
                    {selectedCategory.violations.map((v) => {
                      const active = selectedViolation?.id === v.id;
                      const sev = severityFa[v.severity];
                      return (
                        <TouchableOpacity
                          key={v.id}
                          onPress={() => {
                            console.log(
                              "🖱️ [DisciplineForm] Violation selected:",
                              v.name,
                            );
                            setSelectedViolation(v);
                          }}
                          style={[
                            styles.violationCard,
                            active && styles.violationCardActive,
                          ]}
                        >
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.violationName,
                                active && { color: Colors.primary },
                              ]}
                            >
                              {v.name}
                            </Text>
                            <View style={styles.violationMeta}>
                              <View
                                style={[
                                  styles.severityBadge,
                                  { backgroundColor: `${sev.color}20` },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.severityBadgeText,
                                    { color: sev.color },
                                  ]}
                                >
                                  {sev.label}
                                </Text>
                              </View>
                              <Text style={styles.deductionText}>
                                کسر امتیاز: {v.defaultDeduction}
                              </Text>
                            </View>
                          </View>
                          {active && (
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color={Colors.primary}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}

              {selectedViolation && (
                <>
                  {selectedViolation.recommendedAction && (
                    <View style={styles.recommendBox}>
                      <Ionicons
                        name="information-circle"
                        size={18}
                        color={Colors.info}
                      />
                      <Text style={styles.recommendText}>
                        اقدام پیشنهادی: {selectedViolation.recommendedAction}
                      </Text>
                    </View>
                  )}

                  <Text style={[styles.label, { marginTop: 16 }]}>
                    تاریخ وقوع
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={incidentDate}
                    onChangeText={setIncidentDate}
                    placeholder="مثال: ۱۴۰۳/۰۶/۱۵"
                    placeholderTextColor={Colors.textSecondary}
                  />

                  <Text style={[styles.label, { marginTop: 12 }]}>مکان</Text>
                  <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="مثال: صنف ۱۰ الف"
                    placeholderTextColor={Colors.textSecondary}
                  />

                  <Text style={[styles.label, { marginTop: 12 }]}>
                    زنگ / ساعت
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={period}
                    onChangeText={setPeriod}
                    keyboardType="numeric"
                    placeholder="مثال: ۳"
                    placeholderTextColor={Colors.textSecondary}
                  />

                  <Text style={[styles.label, { marginTop: 12 }]}>
                    شرح تخلف <Text style={{ color: Colors.danger }}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textarea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="توضیح دقیق تخلف..."
                    placeholderTextColor={Colors.textSecondary}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />

                  <Text style={[styles.label, { marginTop: 12 }]}>
                    شاهدان (اختیاری)
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={witnesses}
                    onChangeText={setWitnesses}
                    placeholder="نام شاهدان"
                    placeholderTextColor={Colors.textSecondary}
                  />

                  <Text style={[styles.label, { marginTop: 12 }]}>
                    شدت (پیش‌فرض: {severityFa[selectedViolation.severity].label}
                    )
                  </Text>
                  <View style={styles.severityRow}>
                    {(["MINOR", "MODERATE", "MAJOR", "CRITICAL"] as const).map(
                      (s) => {
                        const active = severityOverride === s;
                        const sev = severityFa[s];
                        return (
                          <TouchableOpacity
                            key={s}
                            onPress={() =>
                              setSeverityOverride(active ? null : s)
                            }
                            style={[
                              styles.severityChip,
                              active && {
                                backgroundColor: sev.color,
                                borderColor: sev.color,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.severityChipText,
                                active && { color: "#fff", fontWeight: "700" },
                              ]}
                            >
                              {sev.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      },
                    )}
                  </View>

                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryTitle}>خلاصه</Text>
                    <Text style={styles.summaryLine}>
                      تخلف: {selectedViolation.name}
                    </Text>
                    <Text style={styles.summaryLine}>
                      کسر امتیاز پیشنهادی: {selectedViolation.defaultDeduction}
                    </Text>
                    <Text style={styles.summaryHint}>
                      توجه: کسر امتیاز پس از تأیید مدیر اعمال می‌شود.
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>
          )}

          {!loading && categories.length > 0 && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.footerBtn, styles.cancelBtn]}
                onPress={handleClose}
                disabled={submitting}
              >
                <Text style={styles.cancelBtnText}>لغو</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.footerBtn,
                  styles.submitBtn,
                  (!selectedViolation || submitting) && { opacity: 0.5 },
                ]}
                onPress={handleSubmit}
                disabled={!selectedViolation || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#fff" />
                    <Text style={styles.submitBtnText}>ثبت و ارسال</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// =============================
// استایل‌ها
// =============================
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "92%",
    minHeight: "70%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  loadingBox: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.card,
  },
  textarea: {
    minHeight: 90,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  catChipText: {
    fontSize: 13,
    color: Colors.text,
  },
  violationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    gap: 10,
  },
  violationCardActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  violationName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  violationMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  severityBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  deductionText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  recommendBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: `${Colors.info}15`,
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  recommendText: {
    flex: 1,
    fontSize: 13,
    color: Colors.info,
  },
  severityRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  severityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  severityChipText: {
    fontSize: 12,
    color: Colors.text,
  },
  summaryBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: Colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  summaryLine: {
    fontSize: 13,
    color: Colors.text,
    marginBottom: 4,
  },
  summaryHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  cancelBtn: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "600",
  },
  submitBtn: {
    backgroundColor: Colors.primary,
  },
  submitBtnText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "700",
  },
});
