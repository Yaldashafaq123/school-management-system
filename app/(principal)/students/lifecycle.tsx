/* eslint-disable react-hooks/set-state-in-effect */
// app/(principal)/students/lifecycle.tsx
import { principalApi, Student } from "@/src/config/principalApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

// ==================== CONSTANTS ====================

const AFGHAN_MONTHS = [
  "حمل", "ثور", "جوزا", "سرطان", "اسد", "سنبله",
  "میزان", "عقرب", "قوس", "جدی", "دلو", "حوت",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3];

type TabType = "overview" | "graduates" | "left";

// ==================== MAIN COMPONENT ====================

export default function StudentLifecycleScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>("overview");
  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Data is loaded by each child component; this just triggers refresh
      setRefreshing(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>فارغ‌التحصیلان و ترک‌کنندگان</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* YEAR SELECTOR */}
      <View style={styles.yearRow}>
        <Text style={styles.yearLabel}>سال:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {YEARS.map((y) => (
            <TouchableOpacity
              key={y}
              onPress={() => setYear(y)}
              style={[styles.yearChip, year === y && styles.yearChipActive]}
            >
              <Text style={[styles.yearChipText, year === y && styles.yearChipTextActive]}>
                {y}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* TABS */}
      <View style={styles.tabsRow}>
        {[
          { key: "overview" as TabType, label: "خلاصه", icon: "stats-chart" },
          { key: "graduates" as TabType, label: "فارغ‌التحصیلان", icon: "school" },
          { key: "left" as TabType, label: "ترک‌کنندگان", icon: "exit-outline" },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            style={[styles.tabBtn, tab === t.key && styles.tabBtnActive]}
          >
            <Ionicons
              name={t.icon as any}
              size={16}
              color={tab === t.key ? "#fff" : "#64748b"}
            />
            <Text style={[styles.tabBtnText, tab === t.key && styles.tabBtnTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CONTENT */}
      {tab === "overview" && <OverviewTab year={year} refreshing={refreshing} onRefresh={onRefresh} />}
      {tab === "graduates" && <GraduatesTab year={year} refreshing={refreshing} onRefresh={onRefresh} />}
      {tab === "left" && <LeftTab year={year} refreshing={refreshing} onRefresh={onRefresh} />}
    </View>
  );
}

// ==================== OVERVIEW TAB ====================

function OverviewTab({ year, refreshing, onRefresh }: { year: number; refreshing: boolean; onRefresh: () => void }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await principalApi.getEnrollmentStats({ year });
      if (res.success) setStats(res.data);
    } catch (e) {
      console.error("Overview error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>داده‌ای یافت نشد</Text>
      </View>
    );
  }

  const cards = [
    { label: "ثبت‌نام جدید", value: stats.totals.enrolled, color: "#3b82f6", icon: "person-add" },
    { label: "فارغ‌التحصیل", value: stats.totals.graduated, color: "#10b981", icon: "school" },
    { label: "ترک‌کننده", value: stats.totals.left, color: "#ef4444", icon: "exit" },
    { label: "انتقال خارج", value: stats.totals.transferOut, color: "#f59e0b", icon: "arrow-forward" },
    { label: "انتقال داخل", value: stats.totals.transferIn, color: "#8b5cf6", icon: "arrow-back" },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.cardsGrid}>
        {cards.map((c) => (
          <View key={c.label} style={[styles.statCard, { borderLeftColor: c.color, borderLeftWidth: 4 }]}>
            <Ionicons name={c.icon as any} size={22} color={c.color} />
            <Text style={styles.statNumber}>{c.value}</Text>
            <Text style={styles.statLabel}>{c.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>تفکیک ماهانه سال {year}</Text>
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 2 }]}>ماه</Text>
          <Text style={styles.th}>ثبت‌نام</Text>
          <Text style={styles.th}>فارغ</Text>
          <Text style={styles.th}>ترک</Text>
          <Text style={styles.th}>انتقال</Text>
        </View>
        {stats.months.map((m: any) => (
          <View key={m.month} style={styles.tableRow}>
            <Text style={[styles.td, { flex: 2 }]}>{AFGHAN_MONTHS[m.month - 1]}</Text>
            <Text style={styles.td}>{m.enrolled}</Text>
            <Text style={[styles.td, { color: "#10b981" }]}>{m.graduated}</Text>
            <Text style={[styles.td, { color: "#ef4444" }]}>{m.left}</Text>
            <Text style={[styles.td, { color: "#8b5cf6" }]}>{m.transferOut + m.transferIn}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ==================== GRADUATES TAB ====================

function GraduatesTab({ year, refreshing, onRefresh }: { year: number; refreshing: boolean; onRefresh: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await principalApi.getGraduates({
        year,
        month: month || undefined,
        search: search || undefined,
        limit: 100,
      });
      if (res.success) setData(res.data);
    } catch (e) {
      console.error("Graduates error:", e);
    } finally {
      setLoading(false);
    }
  }, [year, month, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <View style={{ flex: 1 }}>
      {/* Filters */}
      <View style={styles.filtersRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجو..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      {/* Month chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}>
        <TouchableOpacity
          onPress={() => setMonth(null)}
          style={[styles.monthChip, month === null && styles.monthChipActive]}
        >
          <Text style={[styles.monthChipText, month === null && styles.monthChipTextActive]}>همه</Text>
        </TouchableOpacity>
        {AFGHAN_MONTHS.map((m, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setMonth(i + 1)}
            style={[styles.monthChip, month === i + 1 && styles.monthChipActive]}
          >
            <Text style={[styles.monthChipText, month === i + 1 && styles.monthChipTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary */}
      {data && (
        <View style={styles.summaryStrip}>
          <Text style={styles.summaryText}>
            مجموع فارغ‌التحصیلان {year}: <Text style={styles.bold}>{data.summary.totalThisYear}</Text>
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      ) : (
        <FlatList
          data={data?.students || []}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="school-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>هیچ فارغ‌التحصیلی ثبت نشده</Text>
            </View>
          }
          renderItem={({ item }: { item: any }) => (
            <View style={styles.studentCard}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{item.fullName?.[0] || "؟"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>{item.fullName}</Text>
                <Text style={styles.studentMeta}>
                  {item.studentNumber || "—"} • {item.className}
                </Text>
                <Text style={styles.studentDate}>
                  <Ionicons name="calendar-outline" size={11} color="#64748b" />{" "}
                  {item.graduationDate
                    ? new Date(item.graduationDate).toLocaleDateString("fa-AF")
                    : `سال ${item.graduationYear}`}
                </Text>
              </View>
              <View style={styles.badgeGreen}>
                <Text style={styles.badgeGreenText}>فارغ</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

// ==================== LEFT TAB ====================

function LeftTab({ year, refreshing, onRefresh }: { year: number; refreshing: boolean; onRefresh: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [activeStudents, setActiveStudents] = useState<Student[]>([]);
  const [loadingActive, setLoadingActive] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await principalApi.getLeftStudents({
        year,
        month: month || undefined,
        search: search || undefined,
        limit: 100,
      });
      if (res.success) setData(res.data);
    } catch (e) {
      console.error("Left error:", e);
    } finally {
      setLoading(false);
    }
  }, [year, month, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openMarkModal = async () => {
    setShowMarkModal(true);
    setLoadingActive(true);
    try {
      const res = await principalApi.getStudents({ status: "ACTIVE", limit: 200 });
      if (res.success) setActiveStudents(res.data.students);
    } catch (e) {
      console.error("Active students error:", e);
    } finally {
      setLoadingActive(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header with "Mark Left" button */}
      <View style={styles.topActionRow}>
        <TouchableOpacity style={styles.primaryBtn} onPress={openMarkModal}>
          <Ionicons name="add-circle" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>ثبت ترک شاگرد</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجو..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      {/* Month chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}>
        <TouchableOpacity
          onPress={() => setMonth(null)}
          style={[styles.monthChip, month === null && styles.monthChipActive]}
        >
          <Text style={[styles.monthChipText, month === null && styles.monthChipTextActive]}>همه</Text>
        </TouchableOpacity>
        {AFGHAN_MONTHS.map((m, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setMonth(i + 1)}
            style={[styles.monthChip, month === i + 1 && styles.monthChipActive]}
          >
            <Text style={[styles.monthChipText, month === i + 1 && styles.monthChipTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {data && (
        <View style={styles.summaryStrip}>
          <Text style={styles.summaryText}>
            مجموع ترک‌کنندگان {year}: <Text style={styles.bold}>{data.summary.totalThisYear}</Text>
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#f59e0b" />
        </View>
      ) : (
        <FlatList
          data={data?.students || []}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="exit-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>هیچ ترک‌کننده‌ای ثبت نشده</Text>
            </View>
          }
          renderItem={({ item }: { item: any }) => (
            <View style={styles.studentCard}>
              <View style={[styles.avatarCircle, { backgroundColor: "#fee2e2" }]}>
                <Text style={[styles.avatarText, { color: "#dc2626" }]}>
                  {item.fullName?.[0] || "؟"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>{item.fullName}</Text>
                <Text style={styles.studentMeta}>
                  {item.studentNumber || "—"} • {item.className}
                </Text>
                <Text style={styles.reasonText}>
                  <Ionicons name="information-circle-outline" size={11} color="#dc2626" />{" "}
                  {item.leftReason}
                </Text>
                <Text style={styles.studentDate}>
                  <Ionicons name="calendar-outline" size={11} color="#64748b" />{" "}
                  {item.leftDate ? new Date(item.leftDate).toLocaleDateString("fa-AF") : "—"}
                </Text>
              </View>
              <View style={styles.badgeRed}>
                <Text style={styles.badgeRedText}>ترک</Text>
              </View>
            </View>
          )}
        />
      )}

      <MarkLeftModal
        visible={showMarkModal}
        onClose={() => setShowMarkModal(false)}
        students={activeStudents}
        loading={loadingActive}
        onSaved={() => {
          setShowMarkModal(false);
          fetchData();
        }}
      />
    </View>
  );
}

// ==================== MARK LEFT MODAL ====================

function MarkLeftModal({
  visible,
  onClose,
  students,
  loading,
  onSaved,
}: {
  visible: boolean;
  onClose: () => void;
  students: Student[];
  loading: boolean;
  onSaved: () => void;
}) {
  const [step, setStep] = useState<"select" | "details">("select");
  const [selected, setSelected] = useState<Student | null>(null);
  const [leftDate, setLeftDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [leftReason, setLeftReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const reset = () => {
    setStep("select");
    setSelected(null);
    setLeftDate(new Date());
    setLeftReason("");
    setSearch("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    if (!selected) return;
    if (!leftReason.trim()) {
      Alert.alert("خطا", "لطفاً دلیل ترک را وارد کنید");
      return;
    }
    setSaving(true);
    try {
      const res = await principalApi.markStudentLeft(selected.id, {
        leftDate: leftDate.toISOString().split("T")[0],
        leftReason: leftReason.trim(),
      });
      if (res.success) {
        Alert.alert("موفق", "شاگرد با موفقیت به عنوان ترک‌کننده ثبت شد");
        reset();
        onSaved();
      }
    } catch (e: any) {
      Alert.alert("خطا", e.message || "ثبت ناموفق");
    } finally {
      setSaving(false);
    }
  };

  const filtered = students.filter(
    (s) =>
      !search ||
      s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.studentNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {step === "select" ? "انتخاب شاگرد" : "ثبت ترک مکتب"}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {step === "select" && (
            <>
              <View style={[styles.searchBox, { margin: 16 }]}>
                <Ionicons name="search" size={16} color="#94a3b8" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="جستجوی شاگرد..."
                  value={search}
                  onChangeText={setSearch}
                  placeholderTextColor="#94a3b8"
                />
              </View>
              {loading ? (
                <View style={styles.center}>
                  <ActivityIndicator size="large" color="#f59e0b" />
                </View>
              ) : (
                <FlatList
                  data={filtered}
                  keyExtractor={(item) => item.id.toString()}
                  style={{ maxHeight: 400 }}
                  contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>هیچ شاگرد فعالی یافت نشد</Text>
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.selectRow}
                      onPress={() => {
                        setSelected(item);
                        setStep("details");
                      }}
                    >
                      <View style={styles.avatarSmall}>
                        <Text style={styles.avatarSmallText}>{item.fullName?.[0] || "؟"}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.studentName}>{item.fullName}</Text>
                        <Text style={styles.studentMeta}>
                          {item.studentNumber || "—"} • {item.className}
                        </Text>
                      </View>
                      <Ionicons name="chevron-back" size={18} color="#94a3b8" />
                    </TouchableOpacity>
                  )}
                />
              )}
            </>
          )}

          {step === "details" && selected && (
            <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
              <View style={styles.selectedCard}>
                <View style={styles.avatarSmall}>
                  <Text style={styles.avatarSmallText}>{selected.fullName?.[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentName}>{selected.fullName}</Text>
                  <Text style={styles.studentMeta}>
                    {selected.studentNumber} • {selected.className}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setStep("select")}>
                  <Text style={{ color: "#3b82f6", fontSize: 12, fontFamily: "Vazir" }}>تغییر</Text>
                </TouchableOpacity>
              </View>

              <View>
                <Text style={styles.fieldLabel}>تاریخ ترک *</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={styles.dateInput}
                >
                  <Ionicons name="calendar" size={18} color="#f59e0b" />
                  <Text style={styles.dateText}>
                    {leftDate.toLocaleDateString("fa-AF")}
                  </Text>
                </TouchableOpacity>
              </View>

              <View>
                <Text style={styles.fieldLabel}>دلیل ترک *</Text>
                <TextInput
                  style={[styles.textArea]}
                  placeholder="مثلاً: نقل مکان خانواده به هرات"
                  value={leftReason}
                  onChangeText={setLeftReason}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#94a3b8"
                />
              </View>

              <View style={styles.warningBox}>
                <Ionicons name="warning" size={16} color="#f59e0b" />
                <Text style={styles.warningText}>
                  این شاگرد از صنف فعلی حذف شده و وضعیتش به «ترک کرده» تغییر می‌کند.
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
                <TouchableOpacity
                  style={[styles.secondaryBtn, { flex: 1 }]}
                  onPress={() => setStep("select")}
                >
                  <Text style={styles.secondaryBtnText}>بازگشت</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dangerBtn, { flex: 2 }, saving && { opacity: 0.6 }]}
                  onPress={submit}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color="#fff" />
                      <Text style={styles.dangerBtnText}>ثبت ترک</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={leftDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, date) => {
                setShowDatePicker(Platform.OS === "ios");
                if (date) setLeftDate(date);
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: "Vazir",
    textAlign: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 56 : 20,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },

  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    gap: 8,
  },
  yearLabel: { fontSize: 13, color: "#64748b", fontFamily: "Vazir" },
  yearChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  yearChipActive: { backgroundColor: "#f59e0b" },
  yearChipText: { fontSize: 13, color: "#64748b", fontFamily: "Vazir" },
  yearChipTextActive: { color: "#fff", fontFamily: "VazirBold" },

  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
  },
  tabBtnActive: { backgroundColor: "#1e293b" },
  tabBtnText: { fontSize: 12, color: "#64748b", fontFamily: "Vazir" },
  tabBtnTextActive: { color: "#fff", fontFamily: "VazirBold" },

  content: { padding: 16, gap: 16 },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "31%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    fontFamily: "Vazir",
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },

  tableCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  th: {
    flex: 1,
    fontSize: 11,
    color: "#64748b",
    fontFamily: "VazirBold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  td: {
    flex: 1,
    fontSize: 12,
    color: "#1e293b",
    fontFamily: "Vazir",
    textAlign: "center",
  },

  filtersRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: { flex: 1, fontSize: 13, color: "#1e293b", fontFamily: "Vazir" },

  monthRow: {
    paddingVertical: 10,
  },
  monthChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  monthChipActive: { backgroundColor: "#f59e0b", borderColor: "#f59e0b" },
  monthChipText: { fontSize: 12, color: "#64748b", fontFamily: "Vazir" },
  monthChipTextActive: { color: "#fff", fontFamily: "VazirBold" },

  summaryStrip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#fef3c7",
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 6,
  },
  summaryText: { fontSize: 13, color: "#78350f", fontFamily: "Vazir" },
  bold: { fontFamily: "VazirBold", fontWeight: "700" },

  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#047857",
    fontFamily: "VazirBold",
  },
  studentName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  studentMeta: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
    marginTop: 2,
  },
  studentDate: {
    fontSize: 11,
    color: "#64748b",
    fontFamily: "Vazir",
    marginTop: 4,
  },
  reasonText: {
    fontSize: 12,
    color: "#dc2626",
    fontFamily: "Vazir",
    marginTop: 2,
  },

  badgeGreen: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#d1fae5",
  },
  badgeGreenText: { fontSize: 11, color: "#047857", fontFamily: "VazirBold" },
  badgeRed: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#fee2e2",
  },
  badgeRedText: { fontSize: 11, color: "#dc2626", fontFamily: "VazirBold" },

  topActionRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f59e0b",
    borderRadius: 10,
    paddingVertical: 12,
  },
  primaryBtnText: { color: "#fff", fontSize: 14, fontFamily: "VazirBold" },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
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
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#1e293b", fontFamily: "VazirBold" },

  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSmallText: { fontSize: 14, fontWeight: "700", color: "#1e40af", fontFamily: "VazirBold" },

  selectedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
  },

  fieldLabel: {
    fontSize: 13,
    color: "#475569",
    fontFamily: "Vazir",
    marginBottom: 6,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
  },
  dateText: { fontSize: 14, color: "#1e293b", fontFamily: "Vazir" },
  textArea: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: "#1e293b",
    fontFamily: "Vazir",
    minHeight: 100,
  },

  warningBox: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    backgroundColor: "#fef3c7",
    borderRadius: 10,
    alignItems: "flex-start",
  },
  warningText: { flex: 1, fontSize: 12, color: "#78350f", fontFamily: "Vazir" },

  secondaryBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: { fontSize: 14, color: "#475569", fontFamily: "VazirBold" },
  dangerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#dc2626",
  },
  dangerBtnText: { fontSize: 14, color: "#fff", fontFamily: "VazirBold" },
});