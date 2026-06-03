import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface TeacherSalaryInfo {
  id: number;
  name: string;
  email: string;
  phone: string;
  hourlyRate: number;
  baseSalary: number;
  overtimeRate: number;
  totalEarned: number;
  pendingAmount: number;
  lastSalary?: {
    month: number;
    year: number;
    amount: number;
    status: string;
  };
}

export default function TeachersSalaryList() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teachers, setTeachers] = useState<TeacherSalaryInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalPending, setTotalPending] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const response = await financeApi.getTeachersForSalary();
      if (response.success) {
        // Transform API data to match TeacherSalaryInfo interface
        const transformedData = response.data.map((teacher: any) => ({
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          phone: teacher.phone || "",
          hourlyRate: teacher.hourlyRate || 0,
          baseSalary: teacher.baseSalary || 0,
          overtimeRate: teacher.overtimeRate || 0,
          totalEarned: teacher.totalEarned || 0,
          pendingAmount: teacher.pendingAmount || 0,
          lastSalary: teacher.lastSalary,
        }));
        setTeachers(transformedData);
        const pending = transformedData.reduce((sum: number, t: TeacherSalaryInfo) => sum + t.pendingAmount, 0);
        setTotalPending(pending);
      }
    } catch (error) {
      console.error("Error loading teachers:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری اطلاعات پیش آمد");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "PAID": return Colors.success;
      case "PARTIAL": return Colors.warning;
      case "PENDING": return Colors.danger;
      default: return Colors.textSecondary;
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case "PAID": return "پرداخت شده";
      case "PARTIAL": return "ناقص";
      case "PENDING": return "در انتظار";
      default: return "ثبت نشده";
    }
  };

  const filteredTeachers = teachers.filter(
    (t) => t.name.includes(searchQuery) || t.email.includes(searchQuery) || t.phone?.includes(searchQuery)
  );

  const renderTeacherCard = ({ item }: { item: TeacherSalaryInfo }) => (
    <TouchableOpacity
      style={styles.teacherCard}
      onPress={() => router.push(`/(admin)/financial/salaries/teachers/${item.id}`)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.teacherInfo}>
          <View style={styles.teacherAvatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.teacherName}>{item.name}</Text>
            <Text style={styles.teacherEmail}>{item.email}</Text>
          </View>
        </View>
        {item.lastSalary && (
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.lastSalary.status)}15` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.lastSalary.status) }]}>
              {getStatusLabel(item.lastSalary.status)}
            </Text>
          </View>
        )}
      </View>

      {/* Salary Details */}
      <View style={styles.salaryDetails}>
        <View style={styles.salaryRow}>
          <View style={styles.salaryItem}>
            <Text style={styles.salaryLabel}>حقوق پایه</Text>
            <Text style={styles.salaryValue}>
              {item.baseSalary > 0 ? formatCurrency(item.baseSalary) : (item.hourlyRate > 0 ? formatCurrency(item.hourlyRate * 160) : "ثبت نشده")}
            </Text>
          </View>
          <View style={styles.salaryDivider} />
          <View style={styles.salaryItem}>
            <Text style={styles.salaryLabel}>ساعتی</Text>
            <Text style={styles.salaryValue}>
              {item.hourlyRate > 0 ? formatCurrency(item.hourlyRate) : "ثبت نشده"}
            </Text>
          </View>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>کل دریافتی</Text>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>
            {formatCurrency(item.totalEarned)}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>معوقه</Text>
          <Text style={[styles.summaryValue, { color: item.pendingAmount > 0 ? Colors.danger : Colors.success }]}>
            {formatCurrency(item.pendingAmount)}
          </Text>
        </View>
      </View>

      {/* Last Salary Info */}
      {item.lastSalary && (
        <View style={styles.lastSalaryRow}>
          <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
          <Text style={styles.lastSalaryText}>
            آخرین معاش: {item.lastSalary.month}/{item.lastSalary.year} - {formatCurrency(item.lastSalary.amount)}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: `${Colors.primary}15` }]}
          onPress={() => router.push(`/(admin)/financial/salaries/teachers/${item.id}`)}
          activeOpacity={0.7}
        >
          <Ionicons name="document-text-outline" size={14} color={Colors.primary} />
          <Text style={[styles.actionText, { color: Colors.primary }]}>تاریخچه</Text>
        </TouchableOpacity>
        {item.pendingAmount > 0 && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.success }]}
            onPress={() => router.push(`/(admin)/financial/salaries/payments/record?teacherId=${item.id}`)}
            activeOpacity={0.7}
          >
            <Ionicons name="cash" size={14} color="white" />
            <Text style={[styles.actionText, { color: "white" }]}>پرداخت معاش</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="معلمین" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="معلمین" showBack />

      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{teachers.length}</Text>
          <Text style={styles.summaryLabel}>معلم</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.danger }]}>
            {formatCurrency(totalPending)}
          </Text>
          <Text style={styles.summaryLabel}>مجموع معوقه</Text>
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

      <FlatList
        data={filteredTeachers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTeacherCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>معلمی یافت نشد</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery ? "معلمی با این مشخصات یافت نشد" : "هیچ معلمی ثبت نشده است"}
            </Text>
          </View>
        }
      />
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
  
  listContent: { padding: 16, paddingTop: 0, paddingBottom: 30 },
  
  teacherCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  teacherInfo: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  teacherAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: `${Colors.primary}15`, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 16, fontWeight: "bold", color: Colors.primary, fontFamily: "Vazirmatn" },
  teacherName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  teacherEmail: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: "500", fontFamily: "Vazirmatn" },
  
  salaryDetails: { backgroundColor: Colors.background, borderRadius: 10, padding: 12, marginBottom: 12 },
  salaryRow: { flexDirection: "row", gap: 12 },
  salaryItem: { flex: 1, alignItems: "center" },
  salaryDivider: { width: 1, backgroundColor: Colors.border },
  salaryLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 2 },
  salaryValue: { fontSize: 13, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn" },
  
  summaryRow: { flexDirection: "row", marginBottom: 10 },
  
  lastSalaryRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 12 },
  lastSalaryText: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  cardActions: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, borderRadius: 8, gap: 6 },
  actionText: { fontSize: 12, fontWeight: "500", fontFamily: "Vazirmatn" },
  
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginTop: 12, marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center" },
});