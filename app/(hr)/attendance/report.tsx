// app/(hr)/attendance/index.tsx - Attendance Report Screen with SafeArea
import { hrApi } from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type AttendanceReport = {
  staffId: number;
  fullName: string;
  nameFarsi?: string;
  role: string;
  staffType: string;
  position: string | null;
  department: string | null;
  isActive: boolean;
  teacherCode: string | null;
  stats: {
    totalRecords: number;
    presentDays: number;
    totalWorkingDays: number;
    attendanceRate: number;
    firstScan: string | null;
    lastScan: string | null;
    punchIn: number;
    punchOut: number;
  };
};

type Summary = {
  totalStaff: number;
  activeStaff: number;
  totalPresent: number;
  averageAttendance: number;
  totalRecords: number;
};

type AttendanceResponse = {
  report: AttendanceReport[];
  summary: Summary;
  pagination: {
    page: number;
    total: number;
    totalPages: number;
    limit: number;
  };
};

export default function AttendanceReportScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<AttendanceResponse | null>(null);
  const [search, setSearch] = useState("");
  const [selectedStaffType, setSelectedStaffType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const staffTypes = [
    "all",
    "TEACHER",
    "ADMIN",
    "FINANCE",
    "HR",
    "PRINCIPAL",
    "CHEF",
    "GUARD",
    "DRIVER",
    "CLEANER",
    "SECURITY",
    "MAINTENANCE",
    "LIBRARIAN",
    "NURSE",
    "COUNSELOR",
    "COACH",
    "OTHER",
  ];

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async (pageNum: number = 1) => {
    try {
      const params: any = {
        page: pageNum,
        limit: 20,
      };

      if (selectedStaffType !== "all") params.staffType = selectedStaffType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (search) params.search = search;

      const response = await hrApi.getAttendanceReport(params);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Fetch report error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchReport(1);
  };

  const handleSearch = () => {
    setPage(1);
    fetchReport(1);
  };

  const applyFilters = () => {
    setPage(1);
    fetchReport(1);
  };

  const loadMore = () => {
    if (data && page < data.pagination.totalPages && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReport(nextPage);
    }
  };

  const renderSummary = () => {
    if (!data) return null;
    const { summary } = data;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.summaryScroll}
      >
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.totalStaff}</Text>
            <Text style={styles.summaryLabel}>کل کارمندان</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.activeStaff}</Text>
            <Text style={styles.summaryLabel}>فعال</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {summary.averageAttendance}%
            </Text>
            <Text style={styles.summaryLabel}>میانگین حضور</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.totalRecords}</Text>
            <Text style={styles.summaryLabel}>کل ثبت‌ها</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.totalPresent}</Text>
            <Text style={styles.summaryLabel}>حضور کل</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderItem = ({ item }: { item: AttendanceReport }) => {
    const rate = item.stats.attendanceRate;
    const rateColor =
      rate >= 90 ? "#10b981" : rate >= 70 ? "#f59e0b" : "#ef4444";
    const statusColor = item.isActive ? "#10b981" : "#ef4444";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(hr)/attendance/${item.staffId}` as any)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.staffName}>{item.fullName}</Text>
            <Text style={styles.staffDetails}>
              {item.position || item.staffType} • {item.department || "عمومی"}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                <Text style={styles.statText}>
                  {item.stats.presentDays} روز
                </Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={14} color="#64748b" />
                <Text style={styles.statText}>
                  {item.stats.totalRecords} ثبت
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.rateContainer}>
            <View
              style={[styles.rateBadge, { backgroundColor: rateColor + "20" }]}
            >
              <Text style={[styles.rateText, { color: rateColor }]}>
                {rate}%
              </Text>
            </View>
            <View
              style={[styles.statusDot, { backgroundColor: statusColor }]}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !data) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1e293b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>گزارش حضور</Text>
          <TouchableOpacity
            onPress={() => router.push("/(hr)/attendance/export" as any)}
          >
            <Ionicons name="download-outline" size={24} color="#8b5cf6" />
          </TouchableOpacity>
        </View>

        {/* Summary */}
        {renderSummary()}

        {/* Filter Toggle */}
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options-outline" size={20} color="#64748b" />
          <Text style={styles.filterToggleText}>
            {showFilters ? "پنهان کردن فیلترها" : "نمایش فیلترها"}
          </Text>
          <Ionicons
            name={showFilters ? "chevron-up" : "chevron-down"}
            size={20}
            color="#64748b"
          />
        </TouchableOpacity>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <TextInput
              style={styles.filterInput}
              placeholder="جستجوی کارمند..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
            />

            <View style={styles.filterRow}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>نوع کارمند</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterOptions}
                >
                  {staffTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.filterChip,
                        selectedStaffType === type && styles.filterChipActive,
                      ]}
                      onPress={() => setSelectedStaffType(type)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedStaffType === type &&
                            styles.filterChipTextActive,
                        ]}
                      >
                        {type === "all" ? "همه" : type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.filterRow}>
              <View style={styles.halfField}>
                <Text style={styles.filterLabel}>تاریخ شروع</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94a3b8"
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.filterLabel}>تاریخ پایان</Text>
                <TextInput
                  style={styles.filterInput}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94a3b8"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>اعمال فیلترها</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Staff List */}
        <FlatList
          data={data?.report || []}
          renderItem={renderItem}
          keyExtractor={(item) => item.staffId.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && data ? (
              <ActivityIndicator style={{ padding: 16 }} color="#8b5cf6" />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>هیچ داده‌ای یافت نشد</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingTop: StatusBar.currentHeight || 0,
  },
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  summaryScroll: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 80,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  filterToggleText: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  filtersContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  filterGroup: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
    fontFamily: "Vazir",
  },
  filterOptions: {
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: "#ede9fe",
  },
  filterChipText: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  filterChipTextActive: {
    color: "#8b5cf6",
    fontWeight: "600",
  },
  filterInput: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  halfField: {
    flex: 1,
  },
  applyButton: {
    backgroundColor: "#8b5cf6",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 12,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  cardInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  staffDetails: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  rateContainer: {
    alignItems: "center",
    gap: 4,
  },
  rateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rateText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
});
