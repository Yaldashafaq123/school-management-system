// components/discipline/PraiseForm.tsx
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

type PraiseType = {
  id: number;
  code: string;
  name: string;
  severity: "MINOR" | "MODERATE" | "MAJOR" | "EXCEPTIONAL";
  description?: string;
  defaultPoints: number;
  suggestedReward?: string;
};

type Category = {
  id: number;
  code: string;
  name: string;
  color: string;
  icon?: string;
  praises: PraiseType[];
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
  MINOR: { label: "کوچک", color: "#10B981" },
  MODERATE: { label: "متوسط", color: "#3B82F6" },
  MAJOR: { label: "مهم", color: "#F59E0B" },
  EXCEPTIONAL: { label: "استثنایی", color: "#8B5CF6" },
};

export default function PraiseForm({
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
  const [selectedPraise, setSelectedPraise] = useState<PraiseType | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [severityOverride, setSeverityOverride] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    // eslint-disable-next-line react-hooks/immutability
    loadCatalog();
  }, [visible]);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const res = await disciplineApi.getPraiseCatalog();
      if (res.success) setCategories(res.data);
    } catch (e: any) {
      Alert.alert("خطا", e.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setSelectedPraise(null);
    setDescription("");
    setLocation("");
    setSeverityOverride(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!studentId || !selectedPraise || !description.trim()) {
      Alert.alert("خطا", "لطفاً نوع تشویق و شرح را وارد کنید");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        studentId,
        praiseTypeId: selectedPraise.id,
        occurredAt: new Date().toISOString(),
        location: location.trim() || undefined,
        description: description.trim(),
        severity: severityOverride || undefined,
      };

      const res = await disciplineApi.reportPraise(payload);
      if (res.success) {
        Alert.alert("🎉 آفرین!", "تشویق ثبت شد و برای تأیید ارسال گردید", [
          {
            text: "باشه",
            onPress: () => {
              resetForm();
              onSuccess?.();
              handleClose();
            },
          },
        ]);
      } else {
        Alert.alert("خطا", res.message);
      }
    } catch (e: any) {
      Alert.alert("خطا", e.message);
    } finally {
      setSubmitting(false);
    }
  };

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
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Text style={{ fontSize: 22 }}>🎉</Text>
                <Text style={styles.headerTitle}>ثبت تشویق</Text>
              </View>
              {studentName && (
                <Text style={styles.headerSubtitle}>
                  {studentName}
                  {className ? ` — ${className}` : ""}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={26} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color={Colors.success} />
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            >
              <Text style={styles.label}>دسته تشویق</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {categories.map((cat) => {
                  const active = selectedCategory?.id === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => {
                        setSelectedCategory(cat);
                        setSelectedPraise(null);
                      }}
                      style={[
                        styles.catChip,
                        active && {
                          backgroundColor: cat.color,
                          borderColor: cat.color,
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
                    نوع تشویق
                  </Text>
                  {selectedCategory.praises.map((p) => {
                    const active = selectedPraise?.id === p.id;
                    const sev = severityFa[p.severity];
                    return (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() => setSelectedPraise(p)}
                        style={[
                          styles.praiseCard,
                          active && styles.praiseCardActive,
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.praiseName,
                              active && { color: Colors.success },
                            ]}
                          >
                            {p.name}
                          </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 8,
                              marginTop: 6,
                            }}
                          >
                            <View
                              style={[
                                styles.badge,
                                { backgroundColor: sev.color + "20" },
                              ]}
                            >
                              <Text
                                style={[styles.badgeText, { color: sev.color }]}
                              >
                                {sev.label}
                              </Text>
                            </View>
                            <Text style={styles.pointsText}>
                              + {p.defaultPoints} امتیاز
                            </Text>
                          </View>
                        </View>
                        {active && (
                          <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color={Colors.success}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}

              {selectedPraise && (
                <>
                  {selectedPraise.suggestedReward && (
                    <View style={styles.rewardBox}>
                      <Ionicons name="gift" size={18} color="#8B5CF6" />
                      <Text style={styles.rewardText}>
                        پاداش پیشنهادی: {selectedPraise.suggestedReward}
                      </Text>
                    </View>
                  )}

                  <Text style={[styles.label, { marginTop: 16 }]}>
                    شرح تشویق *
                  </Text>
                  <TextInput
                    style={[styles.input, styles.textarea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="چه کار خوبی انجام داد؟"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />

                  <Text style={[styles.label, { marginTop: 12 }]}>
                    مکان (اختیاری)
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={location}
                    onChangeText={setLocation}
                    placeholder="مثال: صنف ۱۰ الف"
                  />

                  <Text style={[styles.label, { marginTop: 12 }]}>
                    سطح تشویق
                  </Text>
                  <View
                    style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}
                  >
                    {(
                      ["MINOR", "MODERATE", "MAJOR", "EXCEPTIONAL"] as const
                    ).map((s) => {
                      const active = severityOverride === s;
                      const sev = severityFa[s];
                      return (
                        <TouchableOpacity
                          key={s}
                          onPress={() => setSeverityOverride(active ? null : s)}
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
                    })}
                  </View>

                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryTitle}>خلاصه</Text>
                    <Text style={styles.summaryLine}>
                      تشویق: {selectedPraise.name}
                    </Text>
                    <Text style={styles.summaryLine}>
                      امتیاز پیشنهادی: +{selectedPraise.defaultPoints}
                    </Text>
                    <Text style={styles.summaryHint}>
                      توجه: امتیاز پس از تأیید مدیر اضافه می‌شود
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>
          )}

          {!loading && (
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
                  (!selectedPraise || submitting) && { opacity: 0.5 },
                ]}
                onPress={handleSubmit}
                disabled={!selectedPraise || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="gift" size={18} color="#fff" />
                    <Text style={styles.submitBtnText}>ثبت تشویق 🎉</Text>
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
  headerTitle: { fontSize: 18, fontWeight: "bold", color: Colors.text },
  headerSubtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
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
  textarea: { minHeight: 90 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  catChipText: { fontSize: 13, color: Colors.text },
  praiseCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    marginBottom: 8,
    gap: 10,
  },
  praiseCardActive: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + "10",
  },
  praiseName: { fontSize: 14, fontWeight: "600", color: Colors.text },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  pointsText: { fontSize: 12, color: Colors.success, fontWeight: "700" },
  rewardBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#8B5CF615",
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  rewardText: { flex: 1, fontSize: 13, color: "#8B5CF6" },
  severityChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  severityChipText: { fontSize: 12, color: Colors.text },
  summaryBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: Colors.success + "10",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.success + "40",
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  summaryLine: { fontSize: 13, color: Colors.text, marginBottom: 4 },
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
  cancelBtnText: { fontSize: 14, color: Colors.text, fontWeight: "600" },
  submitBtn: { backgroundColor: Colors.success },
  submitBtnText: { fontSize: 14, color: "#fff", fontWeight: "700" },
});
