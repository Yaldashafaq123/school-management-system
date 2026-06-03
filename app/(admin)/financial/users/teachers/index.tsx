import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { userApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Teacher {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  baseSalary: number;
  hourlyRate: number;
  isActive: boolean;
  subjects: string[];
}

export default function TeachersList() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const loadData = useCallback(async () => {
    try {
      const response = await userApi.getAllUsers({
        role: "TEACHER",
        search: searchQuery || undefined,
        limit: 100,
      });
      
      if (response.success) {
        const teacherData = (response.data.users || []).map((u: any) => ({
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          baseSalary: u.teacher?.baseSalary || 0,
          hourlyRate: u.teacher?.hourlyRate || 0,
          isActive: u.teacher?.isActive ?? true,
          subjects: u.teacher?.subjects?.map((s: any) => s.subject?.name) || [],
        }));
        setTeachers(teacherData);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error loading teachers:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredTeachers = teachers.filter((teacher) => {
    if (statusFilter === "active" && !teacher.isActive) return false;
    if (statusFilter === "inactive" && teacher.isActive) return false;
    return true;
  });

  const activeCount = teachers.filter(t => t.isActive).length;
  const totalSalary = teachers.reduce((sum, t) => sum + (t.baseSalary || t.hourlyRate * 160), 0);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="مدیریت معلمین" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="مدیریت معلمین" showBack />

      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{total}</Text>
          <Text style={styles.summaryLabel}>کل معلمین</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>{activeCount}</Text>
          <Text style={styles.summaryLabel}>فعال</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.primary }]}>
            {formatCurrency(totalSalary)}
          </Text>
          <Text style={styles.summaryLabel}>مجموع حقوق ماهیانه</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجوی معلم..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filters */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === "all" && styles.filterChipActive]}
          onPress={() => setStatusFilter("all")}
        >
          <Text style={[styles.filterChipText, statusFilter === "all" && styles.filterChipTextActive]}>همه</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === "active" && styles.filterChipActive]}
          onPress={() => setStatusFilter("active")}
        >
          <Text style={[styles.filterChipText, statusFilter === "active" && styles.filterChipTextActive]}>فعال</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, statusFilter === "inactive" && styles.filterChipActive]}
          onPress={() => setStatusFilter("inactive")}
        >
          <Text style={[styles.filterChipText, statusFilter === "inactive" && styles.filterChipTextActive]}>غیرفعال</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTeachers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
        renderItem={({ item }) => {
          const monthlySalary = item.baseSalary > 0 ? item.baseSalary : item.hourlyRate * 160;
          return (
            <TouchableOpacity
              style={styles.teacherCard}
              onPress={() => router.push(`/(admin)/financial/users/teachers/${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.teacherAvatar}>
                  <Text style={styles.avatarText}>{item.fullName?.charAt(0) || "؟"}</Text>
                </View>
                <View style={styles.teacherInfo}>
                  <Text style={styles.teacherName}>{item.fullName}</Text>
                  <Text style={styles.teacherEmail}>{item.email}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.isActive ? `${Colors.success}15` : `${Colors.danger}15` }]}>
                  <Text style={[styles.statusText, { color: item.isActive ? Colors.success : Colors.danger }]}>
                    {item.isActive ? "فعال" : "غیرفعال"}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.salaryRow}>
                  <View style={styles.salaryItem}>
                    <Text style={styles.salaryLabel}>حقوق پایه</Text>
                    <Text style={styles.salaryValue}>{formatCurrency(item.baseSalary)}</Text>
                  </View>
                  <View style={styles.salaryDivider} />
                  <View style={styles.salaryItem}>
                    <Text style={styles.salaryLabel}>حقوق ماهیانه</Text>
                    <Text style={styles.salaryValue}>{formatCurrency(monthlySalary)}</Text>
                  </View>
                </View>
                {item.subjects.length > 0 && (
                  <View style={styles.subjectsRow}>
                    <Ionicons name="book" size={12} color={Colors.textSecondary} />
                    <Text style={styles.subjectsText} numberOfLines={1}>
                      {item.subjects.join("، ")}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.cardFooter}>
                {item.phone && (
                  <View style={styles.contactRow}>
                    <Ionicons name="call-outline" size={12} color={Colors.textSecondary} />
                    <Text style={styles.contactText}>{item.phone}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>معلمی یافت نشد</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery ? "معلمی با این مشخصات یافت نشد" : "هیچ معلمی ثبت نشده است"}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/(admin)/financial/users/teachers/create")}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.addButtonText}>افزودن معلم جدید</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(admin)/financial/users/teachers/create")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },

  summaryBar: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryItem: { alignItems: "center" },
  summaryDivider: { width: 1, height: 24, backgroundColor: Colors.border },
  summaryValue: { fontSize: 16, fontWeight: "bold", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  summaryLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn" },

  searchContainer: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 13, color: Colors.text, marginLeft: 6, textAlign: "right", fontFamily: "Vazirmatn" },

  filterRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  filterChipTextActive: { color: "white" },

  listContent: { padding: 16, paddingTop: 0, paddingBottom: 80 },

  teacherCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  teacherAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: `${Colors.primary}15`, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 18, fontWeight: "bold", color: Colors.primary, fontFamily: "Vazirmatn" },
  teacherInfo: { flex: 1 },
  teacherName: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  teacherEmail: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: "500", fontFamily: "Vazirmatn" },

  cardBody: { backgroundColor: Colors.background, borderRadius: 10, padding: 10, marginBottom: 10 },
  salaryRow: { flexDirection: "row", gap: 12 },
  salaryItem: { flex: 1, alignItems: "center" },
  salaryDivider: { width: 1, backgroundColor: Colors.border },
  salaryLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 2 },
  salaryValue: { fontSize: 13, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },
  subjectsRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  subjectsText: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn", flex: 1, textAlign: "right" },

  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  contactText: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },

  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginTop: 12, marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center", marginBottom: 20 },
  addButton: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, gap: 8 },
  addButtonText: { color: "white", fontSize: 14, fontWeight: "500", fontFamily: "Vazirmatn" },

  fab: { position: "absolute", right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center", shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
});