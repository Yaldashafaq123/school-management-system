// app/(principal)/students/[id]/discipline-report.tsx
import { Colors } from "@/constants/Colors";
import { disciplineApi } from "@/src/config/disciplineApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ============ انواع داده ============
type FullReport = {
  student: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    profileImage: string | null;
    className: string | null;
    classSection: string | null;
  };
  stats: {
    totalRecords: number;
    pendingRecords: number;
    currentScore: number;
    startingScore: number;
    totalDeducted: number;
    grade: string;
    gradeLabel: string;
    totalIncidents: number;
    bySeverity: {
      minor: number;
      moderate: number;
      major: number;
      critical: number;
    };
    byCategory: Record<string, number>;
    lastIncidentAt: string | null;
  };
  records: any[];
  classRanking: {
    rank: number | null;
    total: number;
    top: any[];
    bottom: any[];
    average: number;
  } | null;
  schoolRanking: {
    rank: number | null;
    total: number;
    top: any[];
    average: number;
  };
  monthlyTrend: any[];
};

const severityFa: Record<string, { label: string; color: string }> = {
  MINOR: { label: "جزئی", color: "#F59E0B" },
  MODERATE: { label: "متوسط", color: "#3B82F6" },
  MAJOR: { label: "مهم", color: "#EF4444" },
  CRITICAL: { label: "بحرانی", color: "#DC2626" },
};

const statusFa: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار", color: "#F59E0B" },
  UNDER_REVIEW: { label: "در بررسی", color: "#3B82F6" },
  APPROVED: { label: "تأیید شده", color: "#10B981" },
  REJECTED: { label: "رد شده", color: "#EF4444" },
  PLANNED: { label: "برنامه‌ریزی‌شده", color: "#8B5CF6" },
  IN_PROGRESS: { label: "در جریان", color: "#F59E0B" },
  COMPLETED: { label: "تکمیل شده", color: "#10B981" },
  CANCELLED: { label: "لغو شده", color: "#94A3B8" },
};

const actionTypeFa: Record<string, string> = {
  VERBAL_WARNING: "تذکر شفاهی",
  WRITTEN_WARNING: "تذکر کتبی",
  PARENT_MEETING: "جلسه با والدین",
  DETENTION: "تنبیه",
  COMMUNITY_SERVICE: "خدمت به مکتب",
  SUSPENSION: "تعلیق موقت",
  EXPULSION: "اخراج",
  COUNSELING: "مشوره روانی",
  SCORE_DEDUCTION: "کسر امتیاز",
  EXTRA_ASSIGNMENT: "کار اضافی",
  OTHER: "سایر",
};

const gradeColor = (score: number) => {
  if (score >= 90) return "#10B981";
  if (score >= 80) return "#3B82F6";
  if (score >= 70) return "#8B5CF6";
  if (score >= 60) return "#F59E0B";
  return "#EF4444";
};

export default function DisciplineReportScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"overview" | "history" | "ranking">(
    "overview",
  );
  const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);

  const load = async () => {
    try {
      console.log("📊 [FullReport] Loading for student", id);
      const res = await disciplineApi.getStudentFullReport(Number(id));
      console.log("📊 [FullReport] Response:", res?.success);
      if (res.success) setData(res.data);
    } catch (e: any) {
      console.error("❌ [FullReport]", e?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری گزارش...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons
            name="alert-circle-outline"
            size={60}
            color={Colors.danger}
          />
          <Text style={styles.loadingText}>گزارشی یافت نشد</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { student, stats, records, classRanking, schoolRanking, monthlyTrend } =
    data;
  const scoreColor = gradeColor(stats.currentScore);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>گزارش انضباطی</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Profile mini */}
      <View style={styles.profileRow}>
        {student.profileImage ? (
          <Image source={{ uri: student.profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: scoreColor + "20" }]}>
            <Text style={[styles.avatarText, { color: scoreColor }]}>
              {student.fullName?.charAt(0) || "?"}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.studentName}>{student.fullName}</Text>
          <Text style={styles.studentClass}>
            {student.className || "بدون صنف"} {student.classSection || ""}
          </Text>
        </View>
      </View>

      {/* Score card */}
      <View style={[styles.scoreCard, { borderColor: scoreColor + "40" }]}>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.scoreLabel}>امتیاز نظم</Text>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>
            {stats.currentScore}
          </Text>
          <Text style={styles.scoreOutOf}>از ۱۰۰</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={{ flex: 1, gap: 6 }}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreRowLabel}>نمره:</Text>
            <Text style={[styles.scoreRowValue, { color: scoreColor }]}>
              {stats.gradeLabel}
            </Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreRowLabel}>کل تخلفات:</Text>
            <Text style={styles.scoreRowValue}>{stats.totalIncidents}</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreRowLabel}>کسر شده:</Text>
            <Text style={[styles.scoreRowValue, { color: Colors.danger }]}>
              {stats.totalDeducted}
            </Text>
          </View>
          {stats.pendingRecords > 0 && (
            <View style={styles.scoreRow}>
              <Text style={styles.scoreRowLabel}>در انتظار:</Text>
              <Text style={[styles.scoreRowValue, { color: Colors.warning }]}>
                {stats.pendingRecords}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Severity stats */}
      <View style={styles.severityGrid}>
        <SeverityBox
          label="جزئی"
          value={stats.bySeverity.minor}
          color={severityFa.MINOR.color}
        />
        <SeverityBox
          label="متوسط"
          value={stats.bySeverity.moderate}
          color={severityFa.MODERATE.color}
        />
        <SeverityBox
          label="مهم"
          value={stats.bySeverity.major}
          color={severityFa.MAJOR.color}
        />
        <SeverityBox
          label="بحرانی"
          value={stats.bySeverity.critical}
          color={severityFa.CRITICAL.color}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TabBtn
          label="نمای کلی"
          icon="stats-chart"
          active={tab === "overview"}
          onPress={() => setTab("overview")}
        />
        <TabBtn
          label="تاریخچه"
          icon="list"
          active={tab === "history"}
          onPress={() => setTab("history")}
        />
        <TabBtn
          label="رتبه‌بندی"
          icon="trophy"
          active={tab === "ranking"}
          onPress={() => setTab("ranking")}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ============ TAB: Overview ============ */}
        {tab === "overview" && (
          <>
            {/* Category breakdown */}
            {Object.keys(stats.byCategory).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>تخلفات بر اساس دسته</Text>
                {Object.entries(stats.byCategory).map(([cat, count]) => (
                  <View key={cat} style={styles.categoryRow}>
                    <Text style={styles.categoryName}>{cat}</Text>
                    <View style={styles.categoryBarBg}>
                      <View
                        style={[
                          styles.categoryBarFill,
                          {
                            width: `${
                              (count /
                                Math.max(...Object.values(stats.byCategory))) *
                              100
                            }%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.categoryCount}>{count}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Monthly trend */}
            {monthlyTrend.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>روند ۶ ماه اخیر</Text>
                <View style={styles.trendRow}>
                  {monthlyTrend.map((m) => {
                    const maxCount = Math.max(
                      ...monthlyTrend.map((x) => x.count),
                    );
                    const height = maxCount > 0 ? (m.count / maxCount) * 80 : 0;
                    return (
                      <View key={m.month} style={styles.trendBar}>
                        <Text style={styles.trendCount}>{m.count}</Text>
                        <View style={styles.trendBarBg}>
                          <View style={[styles.trendBarFill, { height }]} />
                        </View>
                        <Text style={styles.trendMonth}>
                          {new Date(m.month + "-01").toLocaleDateString(
                            "fa-IR",
                            {
                              month: "short",
                            },
                          )}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {records.length === 0 && (
              <View style={styles.emptyBox}>
                <Ionicons
                  name="shield-checkmark"
                  size={60}
                  color={Colors.success}
                />
                <Text style={styles.emptyText}>هیچ تخلفی ثبت نشده است</Text>
                <Text style={styles.emptySubtext}>این شاگرد نظم عالی دارد</Text>
              </View>
            )}
          </>
        )}

        {/* ============ TAB: History ============ */}
        {tab === "history" && (
          <>
            {records.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons
                  name="folder-open-outline"
                  size={60}
                  color={Colors.textSecondary}
                />
                <Text style={styles.emptyText}>هیچ تخلفی ثبت نشده است</Text>
              </View>
            ) : (
              records.map((r) => {
                const sev = severityFa[r.severity] || severityFa.MINOR;
                const isExpanded = expandedRecordId === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={styles.recordCard}
                    onPress={() =>
                      setExpandedRecordId(isExpanded ? null : r.id)
                    }
                    activeOpacity={0.8}
                  >
                    <View style={styles.recordHeader}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.recordTitleRow}>
                          <View
                            style={[
                              styles.severityDot,
                              { backgroundColor: sev.color },
                            ]}
                          />
                          <Text style={styles.recordTitle}>
                            {r.violationName}
                          </Text>
                        </View>
                        <Text style={styles.recordCategory}>
                          {r.categoryName}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.severityBadge,
                          { backgroundColor: sev.color + "20" },
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
                    </View>

                    <View style={styles.recordMeta}>
                      <Text style={styles.recordMetaText}>
                        📅{" "}
                        {new Date(r.incidentDate).toLocaleDateString("fa-IR")}
                      </Text>
                      <Text style={styles.recordMetaText}>
                        − {r.pointsDeducted} امتیاز
                      </Text>
                    </View>

                    {isExpanded && (
                      <View style={styles.recordDetails}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>شرح:</Text>
                          <Text style={styles.detailValue}>
                            {r.description}
                          </Text>
                        </View>
                        {r.location && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>مکان:</Text>
                            <Text style={styles.detailValue}>{r.location}</Text>
                          </View>
                        )}
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>گزارش‌دهنده:</Text>
                          <Text style={styles.detailValue}>
                            {r.reportedByName}
                          </Text>
                        </View>
                        {r.reviewedByName && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>بررسی‌کننده:</Text>
                            <Text style={styles.detailValue}>
                              {r.reviewedByName}
                            </Text>
                          </View>
                        )}
                        {r.reviewNotes && (
                          <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>یادداشت:</Text>
                            <Text style={styles.detailValue}>
                              {r.reviewNotes}
                            </Text>
                          </View>
                        )}

                        {r.isRepeatOffense && (
                          <View style={styles.repeatBanner}>
                            <Ionicons
                              name="warning"
                              size={14}
                              color="#EF4444"
                            />
                            <Text style={styles.repeatBannerText}>
                              تخلف تکراری
                            </Text>
                          </View>
                        )}

                        {/* Actions */}
                        {r.actions.length > 0 && (
                          <View style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>
                              اقدامات انجام‌شده
                            </Text>
                            {r.actions.map((a: any) => {
                              const st = statusFa[a.status] || statusFa.PENDING;
                              return (
                                <View key={a.id} style={styles.actionRow}>
                                  <View
                                    style={[
                                      styles.actionStatusDot,
                                      { backgroundColor: st.color },
                                    ]}
                                  />
                                  <View style={{ flex: 1 }}>
                                    <Text style={styles.actionTitle}>
                                      {actionTypeFa[a.actionType] ||
                                        a.actionType}
                                      {a.title ? `: ${a.title}` : ""}
                                    </Text>
                                    {a.description && (
                                      <Text style={styles.actionDesc}>
                                        {a.description}
                                      </Text>
                                    )}
                                    <View style={styles.actionMetaRow}>
                                      <Text
                                        style={[
                                          styles.actionStatus,
                                          { color: st.color },
                                        ]}
                                      >
                                        {st.label}
                                      </Text>
                                      {a.assignedTo && (
                                        <Text style={styles.actionAssign}>
                                          • {a.assignedTo}
                                        </Text>
                                      )}
                                    </View>
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        )}

                        {/* Notifications */}
                        {r.notifications.length > 0 && (
                          <View style={styles.subSection}>
                            <Text style={styles.subSectionTitle}>
                              اعلان‌های والدین
                            </Text>
                            {r.notifications.map((n: any) => (
                              <View key={n.id} style={styles.notifRow}>
                                <Ionicons
                                  name="mail-outline"
                                  size={16}
                                  color={Colors.info}
                                />
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.notifSubject}>
                                    {n.subject}
                                  </Text>
                                  <Text style={styles.notifMeta}>
                                    {n.readAt ? "خوانده شده" : "ارسال شده"}
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )}

                    <View style={styles.expandHint}>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={Colors.textSecondary}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        )}

        {/* ============ TAB: Ranking ============ */}
        {tab === "ranking" && (
          <>
            {/* Class ranking */}
            {classRanking && (
              <View style={styles.section}>
                <View style={styles.rankHeader}>
                  <Ionicons name="school" size={22} color={Colors.primary} />
                  <Text style={styles.rankTitle}>
                    رتبه در صنف {student.className}
                  </Text>
                </View>

                <View style={styles.rankBigBox}>
                  <Text style={styles.rankBigNumber}>
                    {classRanking.rank ?? "—"}
                  </Text>
                  <Text style={styles.rankBigOutOf}>
                    از {classRanking.total} شاگرد
                  </Text>
                  <Text style={styles.rankBigAvg}>
                    میانگین صنف: {classRanking.average}
                  </Text>
                </View>

                <Text style={styles.rankSubTitle}>🏆 برترین‌های صنف</Text>
                {classRanking.top.map((s: any, i) => (
                  <RankRow key={s.studentId} student={s} index={i} />
                ))}

                <Text style={[styles.rankSubTitle, { marginTop: 16 }]}>
                  ⚠️ نیاز به توجه
                </Text>
                {classRanking.bottom.map((s: any, i) => (
                  <RankRow key={s.studentId} student={s} index={i} warning />
                ))}
              </View>
            )}

            {/* School ranking */}
            <View style={styles.section}>
              <View style={styles.rankHeader}>
                <Ionicons name="trophy" size={22} color="#F59E0B" />
                <Text style={styles.rankTitle}>رتبه در مکتب</Text>
              </View>

              <View style={[styles.rankBigBox, { borderColor: "#F59E0B40" }]}>
                <Text style={[styles.rankBigNumber, { color: "#F59E0B" }]}>
                  {schoolRanking.rank ?? "—"}
                </Text>
                <Text style={styles.rankBigOutOf}>
                  از {schoolRanking.total} شاگرد
                </Text>
                <Text style={styles.rankBigAvg}>
                  میانگین مکتب: {schoolRanking.average}
                </Text>
              </View>

              <Text style={styles.rankSubTitle}>🌟 ده شاگرد برتر مکتب</Text>
              {schoolRanking.top.map((s: any, i) => (
                <RankRow key={s.studentId} student={s} index={i} showClass />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ============ کامپوننت‌های کمکی ============
function SeverityBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={[styles.severityBox, { borderColor: color + "40" }]}>
      <Text style={[styles.severityBoxValue, { color }]}>{value}</Text>
      <Text style={styles.severityBoxLabel}>{label}</Text>
    </View>
  );
}

function TabBtn({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: any;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tabBtn, active && styles.tabBtnActive]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={18}
        color={active ? "#fff" : Colors.textSecondary}
      />
      <Text style={[styles.tabBtnText, active && { color: "#fff" }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function RankRow({
  student,
  index,
  warning,
  showClass,
}: {
  student: any;
  index: number;
  warning?: boolean;
  showClass?: boolean;
}) {
  const color = gradeColor(student.score);
  return (
    <View
      style={[
        styles.rankRow,
        student.isMe && styles.rankRowMe,
        warning && { borderColor: "#EF444440" },
      ]}
    >
      <View style={[styles.rankBadge, { backgroundColor: color + "20" }]}>
        <Text style={[styles.rankBadgeText, { color }]}>{student.rank}</Text>
      </View>
      {student.profileImage ? (
        <Image
          source={{ uri: student.profileImage }}
          style={styles.rankAvatar}
        />
      ) : (
        <View style={[styles.rankAvatar, { backgroundColor: color + "20" }]}>
          <Text style={[styles.rankAvatarText, { color }]}>
            {student.studentName?.charAt(0) || "?"}
          </Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text
          style={[styles.rankName, student.isMe && { color: Colors.primary }]}
        >
          {student.studentName}
          {student.isMe ? " (این شاگرد)" : ""}
        </Text>
        {showClass && (
          <Text style={styles.rankClass}>
            {student.className} {student.classSection || ""}
          </Text>
        )}
      </View>
      <View style={[styles.rankScoreBox, { backgroundColor: color + "15" }]}>
        <Text style={[styles.rankScoreText, { color }]}>{student.score}</Text>
      </View>
    </View>
  );
}

// ============ استایل ============
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: Colors.text },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 22, fontWeight: "700" },
  studentName: { fontSize: 18, fontWeight: "700", color: Colors.text },
  studentClass: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  scoreCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  scoreLabel: { fontSize: 12, color: Colors.textSecondary },
  scoreValue: { fontSize: 40, fontWeight: "800", marginVertical: 2 },
  scoreOutOf: { fontSize: 11, color: Colors.textSecondary },
  scoreDivider: {
    width: 1,
    height: 70,
    backgroundColor: Colors.border,
  },
  scoreRow: { flexDirection: "row", justifyContent: "space-between" },
  scoreRowLabel: { fontSize: 13, color: Colors.textSecondary },
  scoreRowValue: { fontSize: 14, fontWeight: "700", color: Colors.text },
  severityGrid: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  severityBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    backgroundColor: Colors.card,
  },
  severityBoxValue: { fontSize: 20, fontWeight: "800" },
  severityBoxLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    paddingBottom: 8,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabBtnText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "600",
  },
  section: {
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  categoryName: {
    width: 100,
    fontSize: 12,
    color: Colors.text,
    fontWeight: "600",
  },
  categoryBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  categoryBarFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  categoryCount: {
    width: 30,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 120,
  },
  trendBar: {
    alignItems: "center",
    flex: 1,
  },
  trendCount: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  trendBarBg: {
    width: 24,
    height: 80,
    backgroundColor: Colors.border,
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  trendBarFill: {
    width: "100%",
    backgroundColor: Colors.danger,
    borderRadius: 6,
  },
  trendMonth: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  emptyBox: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  recordCard: {
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recordHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  recordTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
  recordTitle: { fontSize: 14, fontWeight: "700", color: Colors.text },
  recordCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  severityBadgeText: { fontSize: 11, fontWeight: "700" },
  recordMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  recordMetaText: { fontSize: 12, color: Colors.textSecondary },
  recordDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  detailRow: { flexDirection: "row", gap: 8 },
  detailLabel: {
    width: 80,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  detailValue: { flex: 1, fontSize: 13, color: Colors.text },
  repeatBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EF444420",
    padding: 8,
    borderRadius: 8,
  },
  repeatBannerText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "700",
  },
  subSection: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 6,
  },
  actionStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  actionTitle: { fontSize: 13, fontWeight: "600", color: Colors.text },
  actionDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  actionMetaRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  actionStatus: { fontSize: 11, fontWeight: "600" },
  actionAssign: { fontSize: 11, color: Colors.textSecondary },
  notifRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
    alignItems: "center",
  },
  notifSubject: { fontSize: 12, fontWeight: "600", color: Colors.text },
  notifMeta: { fontSize: 11, color: Colors.textSecondary },
  expandHint: { alignItems: "center", marginTop: 6 },
  rankHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  rankTitle: { fontSize: 15, fontWeight: "700", color: Colors.text },
  rankBigBox: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary + "40",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: Colors.primary + "08",
  },
  rankBigNumber: {
    fontSize: 48,
    fontWeight: "800",
    color: Colors.primary,
  },
  rankBigOutOf: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  rankBigAvg: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    fontStyle: "italic",
  },
  rankSubTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  rankRowMe: {
    backgroundColor: Colors.primary + "10",
    borderColor: Colors.primary,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  rankBadgeText: { fontSize: 13, fontWeight: "800" },
  rankAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  rankAvatarText: { fontSize: 14, fontWeight: "700" },
  rankName: { fontSize: 13, fontWeight: "600", color: Colors.text },
  rankClass: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  rankScoreBox: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankScoreText: { fontSize: 14, fontWeight: "800" },
});
