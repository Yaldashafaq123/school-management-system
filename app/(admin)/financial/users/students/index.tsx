import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { userApi } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
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

interface Student {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  className: string;
  status: string;
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
}

export default function StudentsList() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [classes, setClasses] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    try {
      const response = await userApi.getAllUsers({
        role: "STUDENT",
        search: searchQuery || undefined,
        limit: 100,
      });
      
      if (response.success) {
        const studentData = (response.data.users || []).map((u: any) => ({
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          className: u.student?.className || "ثبت نشده",
          status: u.student?.status || "ACTIVE",
          totalFees: 0,
          paidAmount: 0,
          pendingAmount: 0,
        }));
        setStudents(studentData);
        setTotal(response.data.total || 0);
        
        const uniqueClasses = [...new Set(studentData.map((s: Student) => s.className))];
        setClasses(uniqueClasses);
      }
    } catch (error) {
      console.error("Error loading students:", error);
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

  const filteredStudents = students.filter((student) => {
    if (selectedClass && student.className !== selectedClass) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return Colors.success;
      case "GRADUATED": return Colors.primary;
      case "SUSPENDED": return Colors.warning;
      case "LEFT": return Colors.danger;
      default: return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE": return "فعال";
      case "GRADUATED": return "فارغ التحصیل";
      case "SUSPENDED": return "تعلیق";
      case "LEFT": return "ترک تحصیل";
      default: return status;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="مدیریت دانش‌آموزان" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="مدیریت دانش‌آموزان" showBack />

      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{total}</Text>
          <Text style={styles.summaryLabel}>کل دانش‌آموزان</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>
            {students.filter(s => s.status === "ACTIVE").length}
          </Text>
          <Text style={styles.summaryLabel}>فعال</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجوی دانش‌آموز..."
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

      {/* Class Filter */}
      {classes.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classFilterScroll}>
          <View style={styles.classFilterRow}>
            <TouchableOpacity
              style={[styles.classChip, !selectedClass && styles.classChipActive]}
              onPress={() => setSelectedClass(null)}
            >
              <Text style={[styles.classChipText, !selectedClass && styles.classChipTextActive]}>همه صنوف</Text>
            </TouchableOpacity>
            {classes.map((cls) => (
              <TouchableOpacity
                key={cls}
                style={[styles.classChip, selectedClass === cls && styles.classChipActive]}
                onPress={() => setSelectedClass(cls)}
              >
                <Text style={[styles.classChipText, selectedClass === cls && styles.classChipTextActive]}>{cls}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.studentCard}
            onPress={() => router.push(`/(admin)/financial/users/students/${item.id}` as any)}
            activeOpacity={0.7}
          >
            <View style={styles.studentHeader}>
              <View style={styles.studentAvatar}>
                <Text style={styles.avatarText}>{item.fullName?.charAt(0) || "؟"}</Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{item.fullName}</Text>
                <Text style={styles.studentClass}>{item.className}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusLabel(item.status)}
                </Text>
              </View>
            </View>
            <View style={styles.studentFooter}>
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={12} color={Colors.textSecondary} />
                <Text style={styles.contactText}>{item.email}</Text>
              </View>
              {item.phone && (
                <View style={styles.contactRow}>
                  <Ionicons name="call-outline" size={12} color={Colors.textSecondary} />
                  <Text style={styles.contactText}>{item.phone}</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} style={styles.chevron} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>دانش‌آموزی یافت نشد</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery ? "دانش‌آموزی با این مشخصات یافت نشد" : "هیچ دانش‌آموزی ثبت نشده است"}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/(admin)/financial/users/students/create" as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.addButtonText}>افزودن دانش‌آموز جدید</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(admin)/financial/users/students/create" as any)}
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

  classFilterScroll: { paddingHorizontal: 16, marginBottom: 12 },
  classFilterRow: { flexDirection: "row", gap: 8 },
  classChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  classChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  classChipText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  classChipTextActive: { color: "white" },

  listContent: { padding: 16, paddingTop: 0, paddingBottom: 80 },

  studentCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  studentHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  studentAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${Colors.primary}15`, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 16, fontWeight: "bold", color: Colors.primary, fontFamily: "Vazirmatn" },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  studentClass: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: "500", fontFamily: "Vazirmatn" },
  studentFooter: { flexDirection: "row", gap: 12 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  contactText: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  chevron: { position: "absolute", right: 14, top: "50%", marginTop: -8 },

  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginTop: 12, marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center", marginBottom: 20 },
  addButton: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, gap: 8 },
  addButtonText: { color: "white", fontSize: 14, fontWeight: "500", fontFamily: "Vazirmatn" },

  fab: { position: "absolute", right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center", shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
});