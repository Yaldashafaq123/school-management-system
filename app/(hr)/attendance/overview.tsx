// app/(hr)/attendance/overview.tsx - Admin Monthly Attendance Overview
// Shows ALL staff with their monthly attendance stats in one list
import { hrApi } from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

// ==================== TYPES ====================

type StaffMonthlyRow = {
  staffId: number;
  fullName: string;
  nameFarsi?: string;
  role: string;
  staffType: string;
  position: string | null;
  department: string | null;
  isActive: boolean;
  teacherCode: string | null;
  // monthly stats (returned by backend when year/month provided)
  presentDays: number;
  absentDays: number;
  lateDays: number;
  onTimeDays: number;
  fridayDays: number;
  workingDays: number;
  totalRecords: number;
  attendanceRate: number;
  totalPunchIn: number;
  totalPunchOut: number;
};

type OverviewSummary = {
  totalStaff: number;
  activeStaff: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  averageAttendance: number;
  totalRecords: number;
};

type OverviewResponse = {
  report: StaffMonthlyRow[];
  summary: OverviewSummary;
  pagination: {
    page: number;
    total: number;
    totalPages: number;
    limit: number;
  };
};

// ==================== HELPERS ====================

function getShamsiMonthName(month: number): string {
  const names = [
    "حمل",
    "ثور",
    "جوزا",
    "سرطان",
    "اسد",
    "سنبله",
    "میزان",
    "عقرب",
    "قوس",
    "جدی",
    "دلو",
    "حوت",
  ];
  return names[month - 1] || `ماه ${month}`;
}

function getCurrentShamsi(): { month: number; year: number } {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      year: "numeric",
      month: "numeric",
    });
    const parts = formatter.format(now).split("/");
    return { month: parseInt(parts[1]), year: parseInt(parts[0]) };
  } catch {
    return {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear() - 621,
    };
  }
}

// ==================== COMPONENT ====================

export default function AdminAttendanceOverviewScreen() {
  const router = useRouter();

  const currentShamsi = getCurrentShamsi();
  const [selectedShamsiMonth, setSelectedShamsiMonth] = useState(
    currentShamsi.month,
  );
  const [selectedShamsiYear, setSelectedShamsiYear] = useState(
    currentShamsi.year,
  );

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [staffList, setStaffList] = useState<StaffMonthlyRow[]>([]);
  const [summary, setSummary] = useState<OverviewSummary | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    limit: 20,
  });

  const [search, setSearch] = useState("");
  const [selectedStaffType, setSelectedStaffType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const isLoadingMoreRef = useRef(false);
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
  // Fetch — replace or append
  // ---------------------------------------------------------------------------
  const fetchOverview = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (append) {
        if (isLoadingMoreRef.current) return;
        isLoadingMoreRef.current = true;
        setLoadingMore(true);
      }

      try {
        const params: any = {
          page: pageNum,
          limit: pagination.limit,
          year: selectedShamsiYear,
          month: selectedShamsiMonth,
        };

        if (selectedStaffType !== "all") params.staffType = selectedStaffType;
        if (search) params.search = search;

        // 🎯 Uses the SAME endpoint — the backend returns monthly stats
        // when year/month params are present.
        const response = await hrApi.getAttendanceReport(params);

        if (response.success && response.data) {
          const incoming: StaffMonthlyRow[] = response.data.report || [];

          if (append) {
            setStaffList((prev) => {
              const existingIds = new Set(prev.map((s) => s.staffId));
              return [
                ...prev,
                ...incoming.filter((s) => !existingIds.has(s.staffId)),
              ];
            });
          } else {
            setStaffList(incoming);
          }

          setSummary(response.data.summary);
          setPagination(response.data.pagination);
          pageRef.current = response.data.pagination.page;
        }
      } catch (error) {
        console.error("Fetch overview error:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        if (append) {
          isLoadingMoreRef.current = false;
          setLoadingMore(false);
        }
      }
    },
    [
      selectedStaffType,
      search,
      pagination.limit,
      selectedShamsiMonth,
      selectedShamsiYear,
    ],
  );

  // Initial + refetch on month change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    pageRef.current = 1;
    fetchOverview(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShamsiMonth, selectedShamsiYear]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    pageRef.current = 1;
    fetchOverview(1, false);
  }, [fetchOverview]);

  const handleSearch = useCallback(() => {
    pageRef.current = 1;
    setLoading(true);
    fetchOverview(1, false);
  }, [fetchOverview]);

  const applyFilters = useCallback(() => {
    pageRef.current = 1;
    setLoading(true);
    fetchOverview(1, false);
  }, [fetchOverview]);

  const loadMore = useCallback(() => {
    if (isLoadingMoreRef.current) return;
    if (loading || refreshing || loadingMore) return;

    const currentPage = pageRef.current;
    const totalPages = pagination.totalPages || 1;
    if (currentPage >= totalPages) return;

    fetchOverview(currentPage + 1, true);
  }, [loading, refreshing, loadingMore, pagination.totalPages, fetchOverview]);

  // ---------------------------------------------------------------------------
  // Month navigation
  // ---------------------------------------------------------------------------
  const goToPreviousMonth = () => {
    let m = selectedShamsiMonth - 1;
    let y = selectedShamsiYear;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
    setSelectedShamsiMonth(m);
    setSelectedShamsiYear(y);
  };

  const goToNextMonth = () => {
    let m = selectedShamsiMonth + 1;
    let y = selectedShamsiYear;
    if (m === 13) {
      m = 1;
      y += 1;
    }
    setSelectedShamsiMonth(m);
    setSelectedShamsiYear(y);
  };

  // ---------------------------------------------------------------------------
  // PDF — full team monthly report
  // ---------------------------------------------------------------------------
  const generateTeamPDF = async () => {
    if (staffList.length === 0) {
      Alert.alert("اطلاعات", "داده‌ای برای تولید PDF وجود ندارد");
      return;
    }

    try {
      const monthName = getShamsiMonthName(selectedShamsiMonth);

      const rows = staffList
        .map((s) => {
          const rate = s.attendanceRate || 0;
          const rateColor =
            rate >= 90 ? "#10b981" : rate >= 70 ? "#f59e0b" : "#ef4444";
          return `
            <tr>
              <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${s.staffId}</td>
              <td style="padding:8px;border-bottom:1px solid #e2e8f0;">${s.fullName}</td>
              <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${s.position || s.staffType}</td>
              <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${s.department || "—"}</td>
              <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;color:#10b981;font-weight:600;">${s.presentDays || 0}</td>
              <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;color:#ef4444;font-weight:600;">${s.absentDays || 0}</td>
              <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;color:#f59e0b;font-weight:600;">${s.lateDays || 0}</td>
              <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">${s.workingDays || 0}</td>
              <td style="padding:8px;border-bottom:1px solid #e2e8f0;text-align:center;">
                <span style="display:inline-block;padding:3px 10px;border-radius:10px;background:${rateColor}20;color:${rateColor};font-weight:600;font-size:12px;">${rate}%</span>
              </td>
            </tr>`;
        })
        .join("");

      const html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="fa">
        <head>
          <meta charset="UTF-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap');
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family:'Vazirmatn','Vazir',sans-serif; background:#f1f5f9; padding:20px; direction:rtl; }
            .container { max-width:1200px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.08); }
            .header { background:linear-gradient(135deg,#8b5cf6,#6d28d9); padding:28px 40px; color:#fff; }
            .header h1 { font-size:22px; margin-bottom:4px; }
            .header p { font-size:14px; opacity:.9; }
            .summary { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; padding:18px 40px; background:#f8fafc; border-bottom:1px solid #e2e8f0; }
            .card { background:#fff; padding:12px; border-radius:10px; text-align:center; border-right:3px solid #8b5cf6; }
            .card .v { font-size:20px; font-weight:700; color:#1e293b; }
            .card .l { font-size:11px; color:#64748b; margin-top:2px; }
            .card.g { border-right-color:#10b981; } .card.g .v { color:#10b981; }
            .card.r { border-right-color:#ef4444; } .card.r .v { color:#ef4444; }
            .card.y { border-right-color:#f59e0b; } .card.y .v { color:#f59e0b; }
            .table-wrap { padding:24px 40px 40px; }
            table { width:100%; border-collapse:collapse; }
            thead { background:#f1f5f9; }
            thead th { padding:10px; font-size:12px; color:#1e293b; border-bottom:2px solid #e2e8f0; text-align:center; }
            tbody td { font-size:12px; color:#1e293b; }
            tbody tr:nth-child(even) { background:#f8fafc; }
            .footer { padding:14px 40px; border-top:1px solid #e2e8f0; font-size:11px; color:#94a3b8; background:#f8fafc; display:flex; justify-content:space-between; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 گزارش ماهانه حضور و غیاب کارمندان</h1>
              <p>${monthName} ${selectedShamsiYear} • ${staffList.length} کارمند</p>
            </div>
            <div class="summary">
              <div class="card"><div class="v">${summary?.totalStaff ?? 0}</div><div class="l">کل کارمندان</div></div>
              <div class="card g"><div class="v">${summary?.totalPresent ?? 0}</div><div class="l">مجموع حضور</div></div>
              <div class="card r"><div class="v">${summary?.totalAbsent ?? 0}</div><div class="l">مجموع غیبت</div></div>
              <div class="card y"><div class="v">${summary?.totalLate ?? 0}</div><div class="l">مجموع تأخیر</div></div>
              <div class="card"><div class="v">${summary?.averageAttendance ?? 0}%</div><div class="l">میانگین حضور</div></div>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>کد</th>
                    <th>نام</th>
                    <th>وظیفه</th>
                    <th>بخش</th>
                    <th>حضور</th>
                    <th>غیبت</th>
                    <th>تأخیر</th>
                    <th>روز کاری</th>
                    <th>نرخ</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
            <div class="footer">
              <span>📄 تولید: ${new Date().toLocaleString("fa-IR")}</span>
              <span>سیستم حضور و غیاب</span>
            </div>
          </div>
        </body>
        </html>`;

      const { uri } = await Print.printToFileAsync({ html, base64: false });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `گزارش ماهانه - ${monthName} ${selectedShamsiYear}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("موفق", `PDF ذخیره شد:\n${uri}`);
      }
    } catch (err) {
      console.error("PDF error:", err);
      Alert.alert("خطا", "خطا در تولید PDF");
    }
  };

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
            <Text style={[styles.summaryValue, { color: "#10b981" }]}>
              {summary.totalPresent}
            </Text>
            <Text style={styles.summaryLabel}>مجموع حضور</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
              {summary.totalAbsent ?? 0}
            </Text>
            <Text style={styles.summaryLabel}>مجموع غیبت</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>
              {summary.totalLate ?? 0}
            </Text>
            <Text style={styles.summaryLabel}>مجموع تأخیر</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#8b5cf6" }]}>
              {summary.averageAttendance}%
            </Text>
            <Text style={styles.summaryLabel}>میانگین حضور</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{summary.totalRecords}</Text>
            <Text style={styles.summaryLabel}>کل ثبت‌ها</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderItem = ({ item }: { item: StaffMonthlyRow }) => {
    const rate = item.attendanceRate || 0;
    const rateColor =
      rate >= 90 ? "#10b981" : rate >= 70 ? "#f59e0b" : "#ef4444";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(hr)/attendance/${item.staffId}` as any)}
      >
        {/* Top row — avatar, name, rate badge */}
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(item.fullName || "?").charAt(0)}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.staffName}>{item.fullName}</Text>
            <Text style={styles.staffDetails}>
              {item.position || item.staffType} • {item.department || "عمومی"}
            </Text>
          </View>
          <View style={styles.rateContainer}>
            <View
              style={[styles.rateBadge, { backgroundColor: rateColor + "20" }]}
            >
              <Text style={[styles.rateText, { color: rateColor }]}>
                {rate}%
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom row — day chips */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: "#ecfdf5" }]}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text style={[styles.statNumber, { color: "#10b981" }]}>
              {item.presentDays || 0}
            </Text>
            <Text style={styles.statLabel}>حضور</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: "#fef2f2" }]}>
            <Ionicons name="close-circle" size={16} color="#ef4444" />
            <Text style={[styles.statNumber, { color: "#ef4444" }]}>
              {item.absentDays || 0}
            </Text>
            <Text style={styles.statLabel}>غیبت</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: "#fffbeb" }]}>
            <Ionicons name="time" size={16} color="#f59e0b" />
            <Text style={[styles.statNumber, { color: "#f59e0b" }]}>
              {item.lateDays || 0}
            </Text>
            <Text style={styles.statLabel}>تأخیر</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: "#eff6ff" }]}>
            <Ionicons name="calendar" size={16} color="#3b82f6" />
            <Text style={[styles.statNumber, { color: "#3b82f6" }]}>
              {item.workingDays || 0}
            </Text>
            <Text style={styles.statLabel}>روز کاری</Text>
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
        <Text style={styles.loadingText}>در حال بارگذاری گزارش ماهانه...</Text>
      </SafeAreaView>
    );
  }

  const monthName = getShamsiMonthName(selectedShamsiMonth);

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
          <Text style={styles.headerTitle}>گزارش ماهانه کارمندان</Text>
          <TouchableOpacity onPress={generateTeamPDF}>
            <Ionicons name="download-outline" size={24} color="#8b5cf6" />
          </TouchableOpacity>
        </View>

        {/* Month Navigator */}
        <View style={styles.monthNavigator}>
          <TouchableOpacity
            style={styles.monthNavButton}
            onPress={goToPreviousMonth}
          >
            <Ionicons name="chevron-back" size={24} color="#64748b" />
          </TouchableOpacity>
          <View style={styles.monthCenter}>
            <Text style={styles.monthText}>
              {monthName} {selectedShamsiYear}
            </Text>
            <Text style={styles.monthSubtext}>
              {pagination.total} کارمند
            </Text>
          </View>
          <TouchableOpacity
            style={styles.monthNavButton}
            onPress={goToNextMonth}
          >
            <Ionicons name="chevron-forward" size={24} color="#64748b" />
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

            <TouchableOpacity
              style={styles.applyButton}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>اعمال فیلترها</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Staff Monthly List */}
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
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews={true}
        />
      </View>
    </SafeAreaView>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingTop: StatusBar.currentHeight || 0,
  },
  container: { flex: 1, backgroundColor: "#f1f5f9" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
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
  backButton: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },

  // Month navigator
  monthNavigator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  monthNavButton: { padding: 8 },
  monthCenter: { alignItems: "center" },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  monthSubtext: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "Vazir",
    marginTop: 2,
  },

  // Summary
  summaryScroll: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    flexGrow: 0,
    marginTop: 12,
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
    minWidth: 90,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  summaryLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },

  // Filters
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
  filterGroup: { flex: 1 },
  filterLabel: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
    fontFamily: "Vazir",
  },
  filterOptions: { flexDirection: "row" },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    marginRight: 6,
  },
  filterChipActive: { backgroundColor: "#ede9fe" },
  filterChipText: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  filterChipTextActive: { color: "#8b5cf6", fontWeight: "600" },
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

  // List
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
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
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  cardInfo: { flex: 1 },
  staffName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  staffDetails: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
    marginTop: 2,
  },
  rateContainer: { alignItems: "center" },
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

  // Stats grid (4 day-count boxes)
  statsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
    gap: 2,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  statLabel: {
    fontSize: 10,
    color: "#64748b",
    fontFamily: "Vazir",
  },

  // Footer / empty
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