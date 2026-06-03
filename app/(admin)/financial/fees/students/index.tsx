import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency, StudentFee } from "@/src/config/financeApi";
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
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface StudentFeeStatus {
  studentId: number;
  studentName: string;
  className: string;
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: "PAID" | "PARTIAL" | "PENDING" | "OVERDUE";
  lastPaymentDate?: string;
}

export default function StudentsFeeStatus() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState<StudentFeeStatus[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [classes, setClasses] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    try {
      // Use getAllStudentFees instead of non-existent getAllStudentsFeeStatus
      const response = await financeApi.getAllStudentFees({
        status: statusFilter === "all" ? undefined : statusFilter,
        classId: classFilter === "all" ? undefined : parseInt(classFilter) || undefined,
        page: 1,
        limit: 100,
      });

      if (response.success && response.data) {
        // Transform API response to match StudentFeeStatus interface
        const feeData = response.data.fees || [];
        
        // Group fees by student
        const studentMap = new Map<number, StudentFeeStatus>();
        
        feeData.forEach((fee: StudentFee) => {
          const studentId = fee.studentId;
          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              studentId: fee.studentId,
              studentName: fee.studentName,
              className: fee.className || "نامشخص",
              totalFees: 0,
              paidAmount: 0,
              pendingAmount: 0,
              paymentStatus: "PENDING",
              lastPaymentDate: undefined,
            });
          }
          
          const student = studentMap.get(studentId)!;
          student.totalFees += fee.amount;
          student.paidAmount += fee.paidAmount;
          student.pendingAmount += fee.remainingAmount;
          
          // Determine overall status
          if (student.pendingAmount === 0) {
            student.paymentStatus = "PAID";
          } else if (student.paidAmount > 0) {
            student.paymentStatus = "PARTIAL";
          } else if (fee.status === "OVERDUE") {
            student.paymentStatus = "OVERDUE";
          } else {
            student.paymentStatus = "PENDING";
          }
        });
        
        const studentList = Array.from(studentMap.values());
        
        // Filter by search query
        let filteredStudents = studentList;
        if (searchQuery) {
          filteredStudents = studentList.filter(s => 
            s.studentName.includes(searchQuery)
          );
        }
        
        setStudents(filteredStudents);
        setTotal(filteredStudents.length);
        
        // Extract unique class names
        const uniqueClasses = [...new Set(filteredStudents.map((s: StudentFeeStatus) => s.className))];
        setClasses(uniqueClasses);
      }
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, classFilter, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PAID":
        return { label: "پرداخت شده", color: Colors.success, icon: "checkmark-circle" };
      case "PARTIAL":
        return { label: "ناقص", color: Colors.warning, icon: "time" };
      case "PENDING":
        return { label: "در انتظار", color: Colors.info, icon: "hourglass" };
      case "OVERDUE":
        return { label: "معوقه", color: Colors.danger, icon: "alert-circle" };
      default:
        return { label: status, color: Colors.textSecondary, icon: "help-circle" };
    }
  };

  const totalPendingAmount = students.reduce((sum, s) => sum + s.pendingAmount, 0);
  const totalCollected = students.reduce((sum, s) => sum + s.paidAmount, 0);

  const renderStudentCard = ({ item }: { item: StudentFeeStatus }) => {
    const statusConfig = getStatusConfig(item.paymentStatus);
    const paymentPercent = item.totalFees > 0 ? (item.paidAmount / item.totalFees) * 100 : 0;

    return (
      <TouchableOpacity
        style={styles.studentCard}
        onPress={() => router.push(`/(admin)/financial/fees/students/${item.studentId}` as any)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.studentInfo}>
            <View style={[styles.studentAvatar, { backgroundColor: `${statusConfig.color}15` }]}>
              <Text style={[styles.avatarText, { color: statusConfig.color }]}>
                {item.studentName?.charAt(0) || "؟"}
              </Text>
            </View>
            <View>
              <Text style={styles.studentName}>{item.studentName}</Text>
              <Text style={styles.className}>{item.className}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}15` }]}>
            <Ionicons name={statusConfig.icon as any} size={12} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Amounts */}
        <View style={styles.amountsRow}>
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>کل هزینه</Text>
            <Text style={styles.amountValue}>{formatCurrency(item.totalFees)}</Text>
          </View>
          <View style={styles.amountDivider} />
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>پرداخت شده</Text>
            <Text style={[styles.amountValue, { color: Colors.success }]}>
              {formatCurrency(item.paidAmount)}
            </Text>
          </View>
          <View style={styles.amountDivider} />
          <View style={styles.amountItem}>
            <Text style={styles.amountLabel}>مانده</Text>
            <Text style={[styles.amountValue, { color: item.pendingAmount > 0 ? Colors.danger : Colors.success }]}>
              {formatCurrency(item.pendingAmount)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${paymentPercent}%`,
                  backgroundColor: item.paymentStatus === "PAID" ? Colors.success : Colors.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{Math.round(paymentPercent)}%</Text>
        </View>

        {/* Action Button */}
        {item.pendingAmount > 0 && (
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => router.push(`/(admin)/financial/fees/collections/single?studentId=${item.studentId}` as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="cash" size={16} color="white" />
            <Text style={styles.payButtonText}>ثبت پرداخت</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const stats = [
    { label: "کل دانش‌آموزان", value: total, color: Colors.primary },
    { label: "مجموع مانده", value: formatCurrency(totalPendingAmount), color: Colors.danger },
    { label: "مجموع وصولی", value: formatCurrency(totalCollected), color: Colors.success },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="وضعیت شهریه دانش‌آموزان" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="وضعیت شهریه دانش‌آموزان" showBack />

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
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

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
        <View style={styles.filtersRow}>
          <TouchableOpacity
            style={[styles.filterChip, statusFilter === "all" && styles.filterChipActive]}
            onPress={() => setStatusFilter("all")}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, statusFilter === "all" && styles.filterChipTextActive]}>همه</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, statusFilter === "OVERDUE" && styles.filterChipActive]}
            onPress={() => setStatusFilter("OVERDUE")}
            activeOpacity={0.7}
          >
            <Ionicons name="alert-circle" size={12} color={statusFilter === "OVERDUE" ? "white" : Colors.danger} />
            <Text style={[styles.filterChipText, statusFilter === "OVERDUE" && styles.filterChipTextActive]}>معوقه</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, statusFilter === "PARTIAL" && styles.filterChipActive]}
            onPress={() => setStatusFilter("PARTIAL")}
            activeOpacity={0.7}
          >
            <Ionicons name="time" size={12} color={statusFilter === "PARTIAL" ? "white" : Colors.warning} />
            <Text style={[styles.filterChipText, statusFilter === "PARTIAL" && styles.filterChipTextActive]}>ناقص</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, statusFilter === "PAID" && styles.filterChipActive]}
            onPress={() => setStatusFilter("PAID")}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-circle" size={12} color={statusFilter === "PAID" ? "white" : Colors.success} />
            <Text style={[styles.filterChipText, statusFilter === "PAID" && styles.filterChipTextActive]}>پرداخت شده</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Class Filter */}
      {classes.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classFilterScroll}>
          <View style={styles.classFilterRow}>
            <TouchableOpacity
              style={[styles.classChip, classFilter === "all" && styles.classChipActive]}
              onPress={() => setClassFilter("all")}
              activeOpacity={0.7}
            >
              <Text style={[styles.classChipText, classFilter === "all" && styles.classChipTextActive]}>همه صنوف</Text>
            </TouchableOpacity>
            {classes.map((cls) => (
              <TouchableOpacity
                key={cls}
                style={[styles.classChip, classFilter === cls && styles.classChipActive]}
                onPress={() => setClassFilter(cls)}
                activeOpacity={0.7}
              >
                <Text style={[styles.classChipText, classFilter === cls && styles.classChipTextActive]}>{cls}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      <FlatList
        data={students}
        keyExtractor={(item) => item.studentId.toString()}
        renderItem={renderStudentCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>دانش‌آموزی یافت نشد</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery ? "با فیلترهای اعمال شده دانش‌آموزی یافت نشد" : "هیچ دانش‌آموزی ثبت نشده است"}
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
  
  // Stats Row
  statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 12, padding: 12, alignItems: "center" },
  statValue: { fontSize: 15, fontWeight: "bold", fontFamily: "Vazirmatn", marginBottom: 4 },
  statLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  // Search
  searchContainer: { paddingHorizontal: 16, paddingBottom: 10 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.card, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: 13, color: Colors.text, marginLeft: 6, textAlign: "right", fontFamily: "Vazirmatn" },
  
  // Filters
  filtersScroll: { paddingHorizontal: 16, marginBottom: 8 },
  filtersRow: { flexDirection: "row", gap: 8 },
  filterChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, gap: 4 },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  filterChipTextActive: { color: "white" },
  
  // Class Filter
  classFilterScroll: { paddingHorizontal: 16, marginBottom: 12 },
  classFilterRow: { flexDirection: "row", gap: 8 },
  classChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  classChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  classChipText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  classChipTextActive: { color: "white" },
  
  // List
  listContent: { padding: 16, paddingTop: 0, paddingBottom: 30 },
  
  // Student Card
  studentCard: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  studentInfo: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  studentAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 16, fontWeight: "bold", fontFamily: "Vazirmatn" },
  studentName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  className: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, gap: 4 },
  statusText: { fontSize: 10, fontWeight: "500", fontFamily: "Vazirmatn" },
  
  amountsRow: { flexDirection: "row", backgroundColor: Colors.background, borderRadius: 10, padding: 12, marginBottom: 12 },
  amountItem: { flex: 1, alignItems: "center" },
  amountDivider: { width: 1, backgroundColor: Colors.border },
  amountLabel: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginBottom: 2 },
  amountValue: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn" },
  
  progressSection: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  progressBar: { flex: 1, height: 6, backgroundColor: Colors.background, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: { fontSize: 10, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  payButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.success, paddingVertical: 10, borderRadius: 10, gap: 6 },
  payButtonText: { color: "white", fontSize: 13, fontWeight: "500", fontFamily: "Vazirmatn" },
  
  // Empty State
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: Colors.textSecondary, fontFamily: "Vazirmatn", textAlign: "center" },
});