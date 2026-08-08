import { EmptyState } from "@/components/finance/EmptyState";
import { FilterBar } from "@/components/finance/FilterBar";
import { OutstandingBadge } from "@/components/finance/OutstandingBadge";
import {
  financeApi,
  formatCurrency,
  StudentFeeStatus,
} from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CLASS_FILTERS = [
  { key: "all", label: "همه صنوف", icon: "people-outline" },
  { key: "pending", label: "بدهکار", icon: "alert-circle-outline" },
  { key: "overdue", label: "معوق", icon: "warning-outline" },
];

export default function PendingStudentsScreen() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentFeeStatus[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentFeeStatus[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [summary, setSummary] = useState<any>(null);

  const fetchStudents = useCallback(async () => {
    try {
      const response = await financeApi.getStudentsWithPendingFees();
      if (response.success) {
        setStudents(response.data);
        setSummary(response.summary);
        applyFilters(response.data, filter, searchQuery);
      }
    } catch (error) {
      console.error("Fetch students error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, []);

  const applyFilters = (
    data: StudentFeeStatus[],
    currentFilter: string,
    query: string,
  ) => {
    let filtered = [...data];

    // Apply status filter
    if (currentFilter === "pending") {
      filtered = filtered.filter((s) => s.totalPending > 0);
    } else if (currentFilter === "overdue") {
      filtered = filtered.filter((s) =>
        s.pendingFees?.some((f) => f.status === "OVERDUE"),
      );
    }

    // Apply search
    if (query.trim()) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name?.toLowerCase().includes(searchLower) ||
          s.phone?.includes(query) ||
          s.className?.toLowerCase().includes(searchLower),
      );
    }

    // Sort by pending amount (highest first)
    filtered.sort((a, b) => b.totalPending - a.totalPending);
    setFilteredStudents(filtered);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    applyFilters(students, newFilter, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(students, filter, query);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStudents();
  };

  const handleCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleNotify = (student: StudentFeeStatus) => {
    Alert.alert("ارسال اطلاعیه", `ارسال اطلاعیه پرداخت به ${student.name}؟`, [
      { text: "لغو", style: "cancel" },
      {
        text: "ارسال",
        onPress: () => {
          Alert.alert("موفقیت", "اطلاعیه ارسال شد");
        },
      },
    ]);
  };

  const renderStudent = ({
    item,
    index,
  }: {
    item: StudentFeeStatus;
    index: number;
  }) => (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() => router.push(`/(finance)/students/${item.id}`)}
      activeOpacity={0.7}
    >
      {/* Rank Badge */}
      {item.totalPending > 0 && index < 3 && (
        <View
          style={[
            styles.rankBadge,
            index === 0
              ? styles.rankGold
              : index === 1
                ? styles.rankSilver
                : styles.rankBronze,
          ]}
        >
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>
      )}

      {/* Student Info */}
      <View style={styles.studentHeader}>
        <View style={styles.studentAvatar}>
          <Ionicons name="person" size={24} color="#3b82f6" />
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentClass}>
            {item.className || "بدون صنف"}
            {item.classSection ? ` - ${item.classSection}` : ""}
          </Text>
          {item.phone && <Text style={styles.studentPhone}>{item.phone}</Text>}
        </View>
        <View style={styles.statusContainer}>
          {item.totalPending > 0 ? (
            <OutstandingBadge
              count={item.pendingFees?.length || 0}
              amount={item.totalPending}
              type="danger"
            />
          ) : (
            <OutstandingBadge type="success" label="پرداخت شده" />
          )}
        </View>
      </View>

      {/* Progress Bar */}
      {item.totalFees > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round((item.totalPaid / item.totalFees) * 100)}%`,
                  backgroundColor:
                    item.totalPending > 0 ? "#f59e0b" : "#10b981",
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round((item.totalPaid / item.totalFees) * 100)}%
          </Text>
        </View>
      )}

      {/* Pending Fees Summary */}
      {item.pendingFees && item.pendingFees.length > 0 && (
        <View style={styles.pendingFeesContainer}>
          {item.pendingFees.slice(0, 3).map((fee, idx) => (
            <View key={idx} style={styles.pendingFeeItem}>
              <View
                style={[
                  styles.pendingFeeDot,
                  {
                    backgroundColor:
                      fee.status === "OVERDUE" ? "#ef4444" : "#f59e0b",
                  },
                ]}
              />
              <Text style={styles.pendingFeeText} numberOfLines={1}>
                {fee.monthName || fee.status} -{" "}
                {formatCurrency(fee.balanceAmount)}
              </Text>
            </View>
          ))}
          {item.pendingFees.length > 3 && (
            <Text style={styles.moreFeesText}>
              +{item.pendingFees.length - 3} مورد دیگر
            </Text>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionRow}>
        {item.phone && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.callBtn]}
            onPress={() => handleCall(item.phone!)}
          >
            <Ionicons name="call-outline" size={16} color="#3b82f6" />
            <Text style={styles.callText}>تماس</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionBtn, styles.notifyBtn]}
          onPress={() => handleNotify(item)}
        >
          <Ionicons name="notifications-outline" size={16} color="#8b5cf6" />
          <Text style={styles.notifyText}>اطلاع‌رسانی</Text>
        </TouchableOpacity>
        {item.totalPending > 0 && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.payBtn]}
            onPress={() =>
              router.push(`/(finance)/payments/record?studentId=${item.id}`)
            }
          >
            <Ionicons name="wallet-outline" size={16} color="#fff" />
            <Text style={styles.payText}>پرداخت</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>در حال بارگذاری شاگردان...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>شاگردان بدهکار</Text>
        <TouchableOpacity
          style={styles.searchIconButton}
          onPress={() => router.push("/(finance)/students/search")}
        >
          <Ionicons name="search" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Summary Banner */}
      {summary && (
        <View style={styles.summaryBanner}>
          <View style={styles.summaryItem}>
            <Ionicons name="people" size={18} color="#3b82f6" />
            <Text style={styles.summaryValue}>
              {summary.studentsWithPending || filteredStudents.length}
            </Text>
            <Text style={styles.summaryLabel}>شاگرد بدهکار</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Ionicons name="cash" size={18} color="#ef4444" />
            <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
              {formatCurrency(summary.totalPendingAmount || 0)}
            </Text>
            <Text style={styles.summaryLabel}>مجموع بدهی</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Ionicons name="trending-up" size={18} color="#f59e0b" />
            <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>
              {formatCurrency(summary.averagePending || 0)}
            </Text>
            <Text style={styles.summaryLabel}>میانگین بدهی</Text>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="جستجوی نام، تلفن یا صنف..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={handleSearch}
          textAlign="right"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <FilterBar
          options={CLASS_FILTERS}
          selected={filter}
          onSelect={handleFilterChange}
        />
      </View>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon="checkmark-circle-outline"
          title={searchQuery ? "شاگردی پیدا نشد" : "همه پرداخت کرده‌اند"}
          subtitle={
            searchQuery
              ? "جستجوی دیگری انجام دهید"
              : "هیچ شاگرد بدهکاری وجود ندارد"
          }
          actionLabel={searchQuery ? undefined : "مشاهده همه شاگردان"}
          onAction={searchQuery ? undefined : () => handleFilterChange("all")}
        />
      ) : (
        <FlatList
          data={filteredStudents}
          renderItem={renderStudent}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  searchIconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },

  // Summary Banner
  summaryBanner: {
    flexDirection: "row",
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  summaryLabel: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "#e2e8f0",
    marginHorizontal: 8,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b",
    paddingVertical: 10,
    fontFamily: "Vazir",
  },

  // Filter
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  // List
  listContent: {
    padding: 16,
    paddingTop: 4,
    gap: 10,
  },

  // Student Card
  studentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    position: "relative",
  },
  rankBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  rankGold: {
    backgroundColor: "#fbbf24",
  },
  rankSilver: {
    backgroundColor: "#94a3b8",
  },
  rankBronze: {
    backgroundColor: "#d97706",
  },
  rankText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    fontFamily: "VazirBold",
  },
  studentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  studentClass: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  studentPhone: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  statusContainer: {
    alignItems: "flex-end",
  },

  // Progress
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    fontFamily: "Vazir",
    minWidth: 36,
    textAlign: "center",
  },

  // Pending Fees
  pendingFeesContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 4,
  },
  pendingFeeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pendingFeeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pendingFeeText: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  moreFeesText: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "Vazir",
    marginTop: 2,
  },

  // Actions
  actionRow: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  callBtn: {
    backgroundColor: "#eff6ff",
  },
  callText: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  notifyBtn: {
    backgroundColor: "#f3e8ff",
  },
  notifyText: {
    fontSize: 12,
    color: "#8b5cf6",
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  payBtn: {
    backgroundColor: "#10b981",
    flex: 1,
    justifyContent: "center",
  },
  payText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
