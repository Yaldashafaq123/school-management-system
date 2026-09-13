// app/(hr)/attendance/index.tsx - Attendance Report Screen with Infinite Scroll
import { hrApi } from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [staffList, setStaffList] = useState<AttendanceReport[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    limit: 20,
  });
  const [search, setSearch] = useState("");
  const [selectedStaffType, setSelectedStaffType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Prevents duplicate loadMore calls while a request is in-flight
  const isLoadingMoreRef = useRef(false);
  // Tracks the current page so loadMore always uses fresh value
  const pageRef = useRef(1);

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

  // ---------------------------------------------------------------------------
  // Core fetch — supports both "replace" (page 1) and "append" (page > 1)
  // ---------------------------------------------------------------------------
  const fetchReport = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      // Guard against duplicate loadMore requests
      if (append) {
        if (isLoadingMoreRef.current) return;
        isLoadingMoreRef.current = true;
        setLoadingMore(true);
      }

      try {
        const params: any = {
          page: pageNum,
          limit: pagination.limit,
        };

        if (selectedStaffType !== "all") params.staffType = selectedStaffType;
        if (search) params.search = search;

        const response = await hrApi.getAttendanceReport(params);

        if (response.success && response.data) {
          const incoming: AttendanceReport[] = response.data.report || [];

          if (append) {
            // ✅ APPEND — keep existing items, add new ones
            setStaffList((prev) => {
              // Dedupe by staffId in case backend returns overlapping pages
              const existingIds = new Set(prev.map((s) => s.staffId));
              const merged = [
                ...prev,
                ...incoming.filter((s) => !existingIds.has(s.staffId)),
              ];
              return merged;
            });
          } else {
            // ✅ REPLACE — fresh load (page 1 / refresh / filter change)
            setStaffList(incoming);
          }

          setSummary(response.data.summary);
          setPagination(response.data.pagination);
          pageRef.current = response.data.pagination.page;
        }
      } catch (error) {
        console.error("Fetch report error:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        if (append) {
          isLoadingMoreRef.current = false;
          setLoadingMore(false);
        }
      }
    },
    [selectedStaffType, search, pagination.limit],
  );

  // ---------------------------------------------------------------------------
  // Initial load
  // ---------------------------------------------------------------------------
  useEffect(() => {
    fetchReport(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Refresh — reset to page 1
  // ---------------------------------------------------------------------------
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    pageRef.current = 1;
    fetchReport(1, false);
  }, [fetchReport]);

  // ---------------------------------------------------------------------------
  // Search — reset to page 1
  // ---------------------------------------------------------------------------
  const handleSearch = useCallback(() => {
    pageRef.current = 1;
    setLoading(true);
    fetchReport(1, false);
  }, [fetchReport]);

  // ---------------------------------------------------------------------------
  // Apply filters — reset to page 1
  // ---------------------------------------------------------------------------
  const applyFilters = useCallback(() => {
    pageRef.current = 1;
    setLoading(true);
    fetchReport(1, false);
  }, [fetchReport]);

  // ---------------------------------------------------------------------------
  // Infinite scroll — load next page and APPEND
  // ---------------------------------------------------------------------------
  const loadMore = useCallback(() => {
    if (isLoadingMoreRef.current) return;
    if (loading || refreshing || loadingMore) return;

    const currentPage = pageRef.current;
    const totalPages = pagination.totalPages || 1;

    if (currentPage >= totalPages) return;

    const nextPage = currentPage + 1;
    fetchReport(nextPage, true);
  }, [loading, refreshing, loadingMore, pagination.totalPages, fetchReport]);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------
  const renderSummary = () => {
    if (!summary) return null;

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

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="small" color="#8b5cf6" />
          <Text style={styles.footerText}>در حال بارگذاری...</Text>
        </View>
      );
    }
    // End-of-list indicator
    if (
      staffList.length > 0 &&
      pageRef.current >= (pagination.totalPages || 1)
    ) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>پایان لیست</Text>
        </View>
      );
    }
    return null;
  };

  if (loading && staffList.length === 0) {
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

        {/* Filters (no date fields) */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <TextInput
              style={styles.filterInput}
              placeholder="جستجوی کارمند..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
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

            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>اعمال فیلترها</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Staff List */}
        <FlatList
          data={staffList}
          renderItem={renderItem}
          keyExtractor={(item) => item.staffId.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#8b5cf6"]}
              tintColor="#8b5cf6"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>هیچ داده‌ای یافت نشد</Text>
            </View>
          }
          // Performance tweaks for large lists
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={true}
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
    flexGrow: 0,
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
  footerContainer: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
});
