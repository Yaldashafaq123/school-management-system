/* eslint-disable react-hooks/set-state-in-effect */
// app/(admin)/link-parents.tsx
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_BASE_URL = "https://asraschools.cloud/api";

// ============ Types ============
interface Parent {
  id: number;
  name: string;
  email: string;
  phone: string;
  profileImage: string | null;
  childCount: number;
  children: { studentId: number; name: string; className: string }[];
}

interface Student {
  id: number;
  name: string;
  email: string;
  profileImage: string | null;
  studentNumber: string;
  className: string;
  classId: number | null;
  isLinked: boolean;
}

interface Link {
  parentId: number;
  studentId: number;
  parent: {
    id: number;
    name: string;
    email: string;
    phone: string;
    profileImage: string | null;
  };
  student: {
    id: number;
    name: string;
    email: string;
    profileImage: string | null;
    studentNumber: string;
    className: string;
    classId: number | null;
  };
}

// ============ Screen ============
export default function LinkParentsScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<"link" | "view">("link");

  // ─── Link mode state ───
  const [parents, setParents] = useState<Parent[]>([]);
  const [parentSearch, setParentSearch] = useState("");
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());

  const [loadingParents, setLoadingParents] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  // ─── View mode state ───
  const [links, setLinks] = useState<Link[]>([]);
  const [linkSearch, setLinkSearch] = useState("");
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getToken = useCallback(async () => {
    return await AsyncStorage.getItem("auth_token");
  }, []);

  // ============================================================
  // Load parents
  // ============================================================
  const loadParents = useCallback(async () => {
    setLoadingParents(true);
    try {
      const token = await getToken();
      const url = parentSearch
        ? `${API_BASE_URL}/admin/parent-links/parents?search=${encodeURIComponent(parentSearch)}`
        : `${API_BASE_URL}/admin/parent-links/parents`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setParents(data.data || []);
    } catch (e) {
      console.error("loadParents:", e);
      Alert.alert("خطا", "بارگذاری والدین ناموفق بود");
    } finally {
      setLoadingParents(false);
    }
  }, [parentSearch, getToken]);

  // ============================================================
  // Load students (re-fetch when parent changes to know what's linked)
  // ============================================================
  const loadStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const token = await getToken();
      const params = new URLSearchParams();
      if (studentSearch) params.append("search", studentSearch);
      if (selectedParentId) params.append("parentId", String(selectedParentId));

      const res = await fetch(
        `${API_BASE_URL}/admin/parent-links/students?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        setStudents(data.data || []);
        // Pre-fill the checkboxes with already-linked ones
        if (selectedParentId) {
          const linked = new Set<number>(
            (data.data || []).filter((s: Student) => s.isLinked).map((s: Student) => s.id)
          );
          setSelectedStudentIds(linked);
        }
      }
    } catch (e) {
      console.error("loadStudents:", e);
      Alert.alert("خطا", "بارگذاری شاگردان ناموفق بود");
    } finally {
      setLoadingStudents(false);
    }
  }, [studentSearch, selectedParentId, getToken]);

  // ============================================================
  // Load existing links (view mode)
  // ============================================================
  const loadLinks = useCallback(async () => {
    setLoadingLinks(true);
    try {
      const token = await getToken();
      const url = linkSearch
        ? `${API_BASE_URL}/admin/parent-links?search=${encodeURIComponent(linkSearch)}`
        : `${API_BASE_URL}/admin/parent-links`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setLinks(data.data.links || []);
    } catch (e) {
      console.error("loadLinks:", e);
      Alert.alert("خطا", "بارگذاری ارتباط‌ها ناموفق بود");
    } finally {
      setLoadingLinks(false);
      setRefreshing(false);
    }
  }, [linkSearch, getToken]);

  // ============================================================
  // Load on tab change / parent change
  // ============================================================
  useEffect(() => {
    if (tab === "link") {
      loadParents();
    } else {
      loadLinks();
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "link" && selectedParentId) {
      loadStudents();
    }
  }, [selectedParentId]);

  // ============================================================
  // Toggle student checkbox
  // ============================================================
  const toggleStudent = (id: number) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ============================================================
  // Save
  // ============================================================
  const saveLinks = async () => {
    if (!selectedParentId) {
      Alert.alert("خطا", "ابتدا یک والد را انتخاب کنید");
      return;
    }
    if (selectedStudentIds.size === 0) {
      Alert.alert("خطا", "حداقل یک شاگرد را انتخاب کنید");
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/admin/parent-links`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentId: selectedParentId,
          studentIds: Array.from(selectedStudentIds),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "خطا در ذخیره");
      }

      Alert.alert("موفقیت", data.message, [
        {
          text: "باشه",
          onPress: () => {
            setSelectedParentId(null);
            setSelectedStudentIds(new Set());
            setStudentSearch("");
            loadParents();
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert("خطا", err?.message || "ذخیره ناموفق بود");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // Unlink
  // ============================================================
  const unlink = (parentId: number, studentId: number, parentName: string, studentName: string) => {
    Alert.alert(
      "قطع ارتباط",
      `آیا مطمئن هستید که می‌خواهید ارتباط ${parentName} از ${studentName} را قطع کنید؟`,
      [
        { text: "لغو", style: "cancel" },
        {
          text: "قطع",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken();
              const res = await fetch(
                `${API_BASE_URL}/admin/parent-links/${parentId}/${studentId}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                }
              );
              const data = await res.json();
              if (!res.ok) throw new Error(data.message);

              setLinks((prev) =>
                prev.filter((l) => !(l.parentId === parentId && l.studentId === studentId))
              );
            } catch (err: any) {
              Alert.alert("خطا", err?.message || "قطع ارتباط ناموفق بود");
            }
          },
        },
      ]
    );
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>اتصال والدین به شاگردان</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === "link" && styles.tabActive]}
          onPress={() => setTab("link")}
        >
          <Ionicons
            name="link"
            size={18}
            color={tab === "link" ? "#fff" : Colors.textSecondary}
          />
          <Text style={[styles.tabText, tab === "link" && styles.tabTextActive]}>
            اتصال جدید
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === "view" && styles.tabActive]}
          onPress={() => setTab("view")}
        >
          <Ionicons
            name="list"
            size={18}
            color={tab === "view" ? "#fff" : Colors.textSecondary}
          />
          <Text style={[styles.tabText, tab === "view" && styles.tabTextActive]}>
            ارتباط‌های موجود
          </Text>
        </TouchableOpacity>
      </View>

      {/* ────────────── LINK MODE ────────────── */}
      {tab === "link" && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step 1 — Pick parent */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              1. انتخاب والد ({parents.length})
            </Text>

            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="جستجو بر اساس نام، ایمیل یا شماره تلفن"
                placeholderTextColor={Colors.textSecondary}
                value={parentSearch}
                onChangeText={setParentSearch}
                onSubmitEditing={loadParents}
                textAlign="right"
              />
              <TouchableOpacity onPress={loadParents}>
                <Ionicons name="refresh" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {loadingParents ? (
              <ActivityIndicator style={{ marginVertical: 24 }} color={Colors.primary} />
            ) : parents.length === 0 ? (
              <Text style={styles.emptyText}>هیچ والدی یافت نشد</Text>
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {parents.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.parentRow,
                      selectedParentId === p.id && styles.parentRowActive,
                    ]}
                    onPress={() => setSelectedParentId(p.id)}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{p.name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.parentName}>{p.name}</Text>
                      <Text style={styles.parentPhone}>{p.phone || p.email || '—'}</Text>
                      {p.childCount > 0 && (
                        <Text style={styles.childCount}>
                          {p.childCount} فرزند متصل
                        </Text>
                      )}
                    </View>
                    {selectedParentId === p.id && (
                      <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Step 2 — Pick students */}
          {selectedParentId && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                2. انتخاب شاگردان ({selectedStudentIds.size} انتخاب‌شده)
              </Text>

              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={Colors.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="جستجوی شاگرد..."
                  placeholderTextColor={Colors.textSecondary}
                  value={studentSearch}
                  onChangeText={setStudentSearch}
                  onSubmitEditing={loadStudents}
                  textAlign="right"
                />
                <TouchableOpacity onPress={loadStudents}>
                  <Ionicons name="refresh" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              {loadingStudents ? (
                <ActivityIndicator style={{ marginVertical: 24 }} color={Colors.primary} />
              ) : students.length === 0 ? (
                <Text style={styles.emptyText}>هیچ شاگردی یافت نشد</Text>
              ) : (
                students.map((s) => {
                  const isSelected = selectedStudentIds.has(s.id);
                  return (
                    <TouchableOpacity
                      key={s.id}
                      style={[styles.studentRow, isSelected && styles.studentRowActive]}
                      onPress={() => toggleStudent(s.id)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxActive,
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        )}
                      </View>
                      <View style={styles.avatarSm}>
                        <Text style={styles.avatarTextSm}>
                          {s.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.studentName}>{s.name}</Text>
                        <Text style={styles.studentMeta}>
                          {s.className} · {s.studentNumber || "بدون شماره"}
                        </Text>
                      </View>
                      {s.isLinked && (
                        <View style={styles.linkedBadge}>
                          <Text style={styles.linkedBadgeText}>قبلاً متصل</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* ────────────── VIEW MODE ────────────── */}
      {tab === "view" && (
        <View style={{ flex: 1 }}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="جستجو..."
              placeholderTextColor={Colors.textSecondary}
              value={linkSearch}
              onChangeText={setLinkSearch}
              onSubmitEditing={loadLinks}
              textAlign="right"
            />
            <TouchableOpacity onPress={loadLinks}>
              <Ionicons name="refresh" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {loadingLinks && links.length === 0 ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
          ) : (
            <FlatList
              data={links}
              keyExtractor={(item) => `${item.parentId}-${item.studentId}`}
              contentContainerStyle={{ padding: 16, gap: 10 }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    setRefreshing(true);
                    loadLinks();
                  }}
                />
              }
              renderItem={({ item }) => (
                <View style={styles.linkCard}>
                  <View style={styles.linkRow}>
                    <View style={[styles.avatar, { backgroundColor: "#ede9fe" }]}>
                      <Text style={[styles.avatarText, { color: "#7c3aed" }]}>
                        {item.parent.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.parentName}>{item.parent.name}</Text>
                      <Text style={styles.parentPhone}>
                        {item.parent.phone || item.parent.email}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.linkDivider}>
                    <Ionicons name="arrow-down" size={16} color={Colors.textSecondary} />
                  </View>

                  <View style={styles.linkRow}>
                    <View style={[styles.avatar, { backgroundColor: "#dbeafe" }]}>
                      <Text style={[styles.avatarText, { color: "#3b82f6" }]}>
                        {item.student.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentName}>{item.student.name}</Text>
                      <Text style={styles.studentMeta}>
                        {item.student.className} · {item.student.studentNumber || "—"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        unlink(
                          item.parentId,
                          item.studentId,
                          item.parent.name,
                          item.student.name
                        )
                      }
                      style={styles.unlinkBtn}
                    >
                      <Ionicons name="unlink" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={{ alignItems: "center", padding: 40 }}>
                  <Ionicons name="link-outline" size={48} color="#cbd5e1" />
                  <Text style={styles.emptyText}>هیچ ارتباطی یافت نشد</Text>
                </View>
              }
            />
          )}
        </View>
      )}

      {/* ────────────── SAVE BAR (link mode) ────────────── */}
      {tab === "link" && selectedParentId && (
        <View style={styles.saveBar}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={saveLinks}
            disabled={saving || selectedStudentIds.size === 0}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="link" size={20} color="#fff" />
                <Text style={styles.saveBtnText}>
                  ذخیره ({selectedStudentIds.size} شاگرد)
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ============================================================
// Styles
// ============================================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "VazirBold",
  },

  tabs: {
    flexDirection: "row",
    padding: 8,
    gap: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Vazir",
  },
  tabTextActive: { color: "#fff", fontFamily: "VazirBold" },

  section: { padding: 16 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "VazirBold",
    marginBottom: 10,
    textAlign: "right",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontFamily: "Vazir",
    paddingVertical: 10,
  },

  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
    fontFamily: "Vazir",
  },

  parentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  parentRowActive: { borderColor: Colors.primary },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#059669",
    fontFamily: "VazirBold",
  },
  avatarSm: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarTextSm: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
    fontFamily: "VazirBold",
  },
  parentName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "VazirBold",
    textAlign: "right",
  },
  parentPhone: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Vazir",
    textAlign: "right",
  },
  childCount: {
    fontSize: 11,
    color: "#7c3aed",
    fontFamily: "Vazir",
    marginTop: 2,
    textAlign: "right",
  },

  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  studentRowActive: { borderColor: Colors.primary, backgroundColor: "#eff6ff" },
  studentName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Vazir",
    textAlign: "right",
  },
  studentMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Vazir",
    textAlign: "right",
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  linkedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "#d1fae5",
  },
  linkedBadgeText: {
    fontSize: 10,
    color: "#059669",
    fontFamily: "Vazir",
  },

  linkCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  linkDivider: { alignItems: "center", paddingVertical: 4 },
  unlinkBtn: { padding: 8 },

  saveBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
});