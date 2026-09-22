/* eslint-disable react-hooks/set-state-in-effect */
// app/(hr)/attendance/overview.tsx - Admin Monthly Attendance Overview
// Fetches staff list, then fetches each person's monthly summary in parallel
// and renders + exports a shareable PDF report.
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

function getStaffTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    TEACHER: "استاد",
    ADMIN: "مدیر",
    FINANCE: "مالی",
    HR: "منابع بشری",
    PRINCIPAL: "مدیر مکتب",
    CHEF: "آشپز",
    GUARD: "نگهبان",
    DRIVER: "راننده",
    CLEANER: "پاک‌کن",
    SECURITY: "امنیت",
    MAINTENANCE: "تعمیرات",
    LIBRARIAN: "کتابدار",
    NURSE: "نرس",
    COUNSELOR: "مشاور",
    COACH: "مربی",
    OTHER: "سایر",
  };
  return labels[type] || type;
}

// ==================== PDF GENERATOR ====================

function generateTeamMonthlyPDF(
  rows: StaffMonthlyRow[],
  summary: OverviewSummary | null,
  monthName: string,
  year: number,
): string {
  const totals = rows.reduce(
    (acc, r) => {
      acc.present += r.presentDays || 0;
      acc.absent += r.absentDays || 0;
      acc.late += r.lateDays || 0;
      acc.working += r.workingDays || 0;
      acc.records += r.totalRecords || 0;
      return acc;
    },
    { present: 0, absent: 0, late: 0, working: 0, records: 0 },
  );

  const avgRate =
    rows.length > 0
      ? Math.round(
          rows.reduce((s, r) => s + (r.attendanceRate || 0), 0) / rows.length,
        )
      : 0;

  const tableRows = rows
    .map((s, idx) => {
      const rate = s.attendanceRate || 0;
      const rateColor =
        rate >= 90 ? "#10b981" : rate >= 70 ? "#f59e0b" : "#ef4444";
      const statusColor = s.isActive ? "#10b981" : "#94a3b8";
      const statusText = s.isActive ? "فعال" : "غیرفعال";

      return `
        <tr style="${idx % 2 === 0 ? "background:#f8fafc;" : ""}">
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:500;">${
            idx + 1
          }</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${
            s.fullName
          }${s.nameFarsi ? `<br><span style="font-size:11px;color:#94a3b8;">${s.nameFarsi}</span>` : ""}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">${getStaffTypeLabel(s.staffType)}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">${s.department || "—"}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;color:#10b981;font-weight:700;">${s.presentDays || 0}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;color:#ef4444;font-weight:700;">${s.absentDays || 0}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;color:#f59e0b;font-weight:700;">${s.lateDays || 0}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;color:#3b82f6;font-weight:600;">${s.workingDays || 0}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">
            <span style="display:inline-block;padding:4px 10px;border-radius:10px;background:${rateColor}20;color:${rateColor};font-weight:700;font-size:12px;min-width:44px;">${rate}%</span>
          </td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">
            <span style="display:inline-block;padding:2px 8px;border-radius:8px;background:${statusColor}20;color:${statusColor};font-size:11px;font-weight:600;">${statusText}</span>
          </td>
        </tr>`;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>گزارش ماهانه حضور - ${monthName} ${year}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body {
          font-family:'Vazirmatn','Vazir',sans-serif;
          background:#f1f5f9;
          padding:20px;
          direction:rtl;
          color:#1e293b;
        }
        .report {
          max-width:1300px;
          margin:0 auto;
          background:#fff;
          border-radius:16px;
          overflow:hidden;
          box-shadow:0 4px 24px rgba(0,0,0,.08);
        }
        /* Header */
        .header {
          background:linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%);
          padding:32px 40px;
          color:#fff;
        }
        .header h1 { font-size:26px; font-weight:800; margin-bottom:6px; letter-spacing:.3px; }
        .header .subtitle { font-size:15px; opacity:.95; font-weight:500; }
        .header .meta { font-size:13px; opacity:.8; margin-top:8px; }
        /* Summary grid */
        .summary {
          display:grid;
          grid-template-columns:repeat(6,1fr);
          gap:12px;
          padding:22px 40px;
          background:#f8fafc;
          border-bottom:1px solid #e2e8f0;
        }
        .card {
          background:#fff;
          border-radius:12px;
          padding:14px;
          text-align:center;
          border-right:4px solid #8b5cf6;
          box-shadow:0 1px 3px rgba(0,0,0,.06);
        }
        .card .v { font-size:24px; font-weight:800; }
        .card .l { font-size:11px; color:#64748b; margin-top:4px; font-weight:500; }
        .card.g { border-right-color:#10b981; } .card.g .v { color:#10b981; }
        .card.r { border-right-color:#ef4444; } .card.r .v { color:#ef4444; }
        .card.y { border-right-color:#f59e0b; } .card.y .v { color:#f59e0b; }
        .card.b { border-right-color:#3b82f6; } .card.b .v { color:#3b82f6; }
        .card.p { border-right-color:#ec4899; } .card.p .v { color:#ec4899; }
        /* Table */
        .table-wrap { padding:24px 40px 40px; }
        .table-title {
          display:flex; justify-content:space-between; align-items:center;
          margin-bottom:16px;
        }
        .table-title h2 { font-size:18px; font-weight:700; }
        .table-title .count { font-size:13px; color:#94a3b8; }
        table { width:100%; border-collapse:collapse; font-family:inherit; }
        thead { background:#f1f5f9; }
        thead th {
          padding:12px 10px;
          text-align:center;
          font-size:12px;
          font-weight:700;
          color:#1e293b;
          border-bottom:2px solid #e2e8f0;
          white-space:nowrap;
        }
        tbody td { font-size:13px; color:#1e293b; }
        tbody tr:hover { background:#f1f5f9; }
        /* Footer */
        .footer {
          padding:16px 40px;
          border-top:1px solid #e2e8f0;
          display:flex;
          justify-content:space-between;
          font-size:11px;
          color:#94a3b8;
          background:#f8fafc;
        }
        /* Print */
        @media print {
          body { background:#fff; padding:0; }
          .report { box-shadow:none; border-radius:0; }
          thead { display:table-header-group; }
          tbody tr { page-break-inside:avoid; }
        }
      </style>
    </head>
    <body>
      <div class="report">
        <div class="header">
          <h1>📊 گزارش ماهانه حضور و غیاب کارمندان</h1>
          <div class="subtitle">${monthName} ${year}</div>
          <div class="meta">
            تعداد کارمندان: ${rows.length} &nbsp;•&nbsp;
            تاریخ تولید: ${new Date().toLocaleString("fa-IR")}
          </div>
        </div>

        <div class="summary">
          <div class="card"><div class="v">${rows.length}</div><div class="l">کل کارمندان</div></div>
          <div class="card g"><div class="v">${totals.present}</div><div class="l">مجموع حضور</div></div>
          <div class="card r"><div class="v">${totals.absent}</div><div class="l">مجموع غیبت</div></div>
          <div class="card y"><div class="v">${totals.late}</div><div class="l">مجموع تأخیر</div></div>
          <div class="card b"><div class="v">${totals.working}</div><div class="l">مجموع روز کاری</div></div>
          <div class="card p"><div class="v">${avgRate}%</div><div class="l">میانگین نرخ حضور</div></div>
        </div>

        <div class="table-wrap">
          <div class="table-title">
            <h2>📋 لیست تفصیلی کارمندان</h2>
            <div class="count">${rows.length} ردیف</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>نام و تخلص</th>
                <th>وظیفه</th>
                <th>بخش</th>
                <th>حضور</th>
                <th>غیبت</th>
                <th>تأخیر</th>
                <th>روز کاری</th>
                <th>نرخ</th>
                <th>وضعیت</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>

        <div class="footer">
          <span>📄 سیستم مدیریت حضور و غیاب</span>
          <span>گزارش رسمی — قابل ارائه به مدیریت</span>
        </div>
      </div>
    </body>
    </html>
  `;
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
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
  // Fetch — staff list + per-person monthly summary
  // ---------------------------------------------------------------------------
  const fetchOverview = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (append) {
        if (isLoadingMoreRef.current) return;
        isLoadingMoreRef.current = true;
        setLoadingMore(true);
      }

      try {
        // 1) Get paginated staff list
        const listParams: any = {
          page: pageNum,
          limit: pagination.limit,
        };
        if (selectedStaffType !== "all")
          listParams.staffType = selectedStaffType;
        if (search) listParams.search = search;

        console.log("📡 [1/2] Fetch staff list:", listParams);

        const listRes = await hrApi.getAttendanceReport(listParams);

        if (!listRes?.success || !listRes.data) {
          console.warn("⚠️ Staff list response invalid:", listRes);
          return;
        }

        const incoming: any[] = listRes.data.report || [];
        console.log(`✅ Got ${incoming.length} staff (page ${pageNum})`);

        if (incoming.length === 0) {
          if (!append) setStaffList([]);
          setPagination(
            listRes.data.pagination || {
              page: 1,
              total: 0,
              totalPages: 1,
              limit: 20,
            },
          );
          return;
        }

        // 2) Fetch monthly summary for each staff (parallel, capped)
        const staffIds = incoming.map((s) => s.staffId).filter(Boolean);
        console.log(
          `📡 [2/2] Fetching monthly summaries for ${staffIds.length} staff ` +
            `(${selectedShamsiMonth}/${selectedShamsiYear})...`,
        );

        const monthlyMap = await hrApi.getBulkStaffMonthlyAttendance(
          staffIds,
          { year: selectedShamsiYear, month: selectedShamsiMonth },
          6,
        );

        console.log(
          `✅ Monthly summaries received: ${Object.keys(monthlyMap).length}/${staffIds.length}`,
        );

        // 3) Merge profile + monthly summary
        const merged: StaffMonthlyRow[] = incoming.map((s) => {
          const m = monthlyMap[s.staffId];
          const ms = m?.summary || {};

          return {
            staffId: s.staffId,
            fullName: s.fullName,
            nameFarsi: s.nameFarsi,
            role: s.role,
            staffType: s.staffType,
            position: s.position,
            department: s.department,
            isActive: s.isActive,
            teacherCode: s.teacherCode,
            presentDays: ms.presentDays ?? 0,
            absentDays: ms.absentDays ?? 0,
            lateDays: ms.lateDays ?? 0,
            onTimeDays: ms.onTimeDays ?? 0,
            fridayDays: ms.fridayDays ?? 0,
            workingDays: ms.workingDays ?? 0,
            totalRecords: ms.totalRecords ?? 0,
            attendanceRate: ms.attendanceRate ?? 0,
            totalPunchIn: ms.totalPunchIn ?? 0,
            totalPunchOut: ms.totalPunchOut ?? 0,
          };
        });

        // 4) Update state
        let nextList: StaffMonthlyRow[];
        if (append) {
          setStaffList((prev) => {
            const existingIds = new Set(prev.map((x) => x.staffId));
            const appended = [
              ...prev,
              ...merged.filter((x) => !existingIds.has(x.staffId)),
            ];
            nextList = appended;
            return appended;
          });
        } else {
          nextList = merged;
          setStaffList(merged);
        }

        // Aggregate summary across all loaded rows
        const allRows = append ? staffList.concat(merged) : merged;
        const totals = allRows.reduce(
          (acc, r) => {
            acc.totalPresent += r.presentDays;
            acc.totalAbsent += r.absentDays;
            acc.totalLate += r.lateDays;
            acc.totalRecords += r.totalRecords;
            acc.rateSum += r.attendanceRate;
            return acc;
          },
          {
            totalPresent: 0,
            totalAbsent: 0,
            totalLate: 0,
            totalRecords: 0,
            rateSum: 0,
          },
        );

        setSummary({
          totalStaff:
            listRes.data.pagination?.total ??
            listRes.data.summary?.totalStaff ??
            0,
          activeStaff: listRes.data.summary?.activeStaff ?? 0,
          totalPresent: totals.totalPresent,
          totalAbsent: totals.totalAbsent,
          totalLate: totals.totalLate,
          averageAttendance: allRows.length
            ? Math.round(totals.rateSum / allRows.length)
            : 0,
          totalRecords: totals.totalRecords,
        });

        setPagination(
          listRes.data.pagination || {
            page: pageNum,
            total: merged.length,
            totalPages: 1,
            limit: pagination.limit,
          },
        );
        pageRef.current = listRes.data.pagination?.page ?? pageNum;
      } catch (error) {
        console.error("❌ Fetch overview error:", error);
        Alert.alert("خطا", "خطا در دریافت گزارش. لطفا دوباره تلاش کنید.");
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
      staffList,
    ],
  );

  // Initial + refetch on month change
  useEffect(() => {
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
  // PDF — share with manager
  // ---------------------------------------------------------------------------
  const generateTeamPDF = async () => {
    if (staffList.length === 0) {
      Alert.alert("اطلاعات", "داده‌ای برای تولید PDF وجود ندارد");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const monthName = getShamsiMonthName(selectedShamsiMonth);
      const html = generateTeamMonthlyPDF(
        staffList,
        summary,
        monthName,
        selectedShamsiYear,
      );

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
        width: 1300,
      });

      console.log("📄 PDF generated:", uri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `گزارش ماهانه - ${monthName} ${selectedShamsiYear}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("موفق", `فایل PDF در مسیر زیر ذخیره شد:\n${uri}`, [
          { text: "باشه" },
        ]);
      }
    } catch (err) {
      console.error("❌ PDF error:", err);
      Alert.alert("خطا", "خطا در تولید فایل PDF");
    } finally {
      setIsGeneratingPDF(false);
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
              {summary.totalAbsent}
            </Text>
            <Text style={styles.summaryLabel}>مجموع غیبت</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>
              {summary.totalLate}
            </Text>
            <Text style={styles.summaryLabel}>مجموع تأخیر</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#8b5cf6" }]}>
              {summary.averageAttendance}%
            </Text>
            <Text style={styles.summaryLabel}>میانگین حضور</Text>
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
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(item.fullName || "?").charAt(0)}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.staffName}>{item.fullName}</Text>
            <Text style={styles.staffDetails}>
              {item.position || getStaffTypeLabel(item.staffType)} •{" "}
              {item.department || "عمومی"}
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
        <Text style={styles.loadingSubtext}>
          دریافت اطلاعات {pagination.limit} کارمند
        </Text>
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
          <TouchableOpacity
            style={styles.pdfButton}
            onPress={generateTeamPDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="share-outline" size={20} color="#fff" />
            )}
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
            <Text style={styles.monthSubtext}>{pagination.total} کارمند</Text>
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
                        {type === "all" ? "همه" : getStaffTypeLabel(type)}
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
    fontSize: 15,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  loadingSubtext: {
    marginTop: 6,
    fontSize: 12,
    color: "#94a3b8",
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
    fontSize: 17,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
    flex: 1,
    textAlign: "center",
  },
  pdfButton: {
    backgroundColor: "#8b5cf6",
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
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
