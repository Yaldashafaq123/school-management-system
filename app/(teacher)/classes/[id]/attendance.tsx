/* eslint-disable react-hooks/set-state-in-effect */
// app/(teacher)/classes/[id]/attendance.tsx
// Class Monthly Attendance Report — mirrors HR overview pattern
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { apiRequest } from "../../../../src/config/api";

// ==================== DEBUG FLAG ====================
const DEBUG = true;

// ==================== TYPES ====================

type StudentRow = {
  studentId: number;
  name: string;
  email: string;
  phone: string;
  studentNumber: string | null;
  profileImage: string | null;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  rate: number;
};

type Report = {
  class: {
    id: number;
    name: string;
    section?: string;
    grade: string;
    supervisor?: string;
    isSupervisor: boolean;
  };
  period: {
    shamsiMonth: number;
    shamsiYear: number;
    shamsiMonthName: string;
    workingDays: number;
    fridayDays: number;
    daysInMonth: number;
    gregorianStart: string;
    gregorianEnd: string;
  };
  summary: {
    totalRecords: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    totalStudents: number;
    totalDaysMarked: number;
    workingDays: number;
    fridayDays: number;
    attendanceRate: number;
  };
  byStudent: StudentRow[];
  byDate: any[];
  daily: any[];
};

type StatusFilter =
  | "all"
  | "perfect"
  | "good"
  | "needs_attention"
  | "critical"
  | "absent"
  | "late";

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

function getStatusFilterLabel(filter: StatusFilter): string {
  const labels: Record<StatusFilter, string> = {
    all: "همه",
    perfect: "بدون غیبت",
    good: "خوب (۸۰٪+)",
    needs_attention: "نیاز به توجه",
    critical: "بحرانی",
    absent: "دارای غیبت",
    late: "دارای تأخیر",
  };
  return labels[filter];
}

function getStatusFilterDescription(filter: StatusFilter): string {
  const labels: Record<StatusFilter, string> = {
    all: "",
    perfect: "کسانی که هیچ غیبت یا تأخیری ندارند",
    good: "نرخ حضور ۸۰٪ یا بیشتر",
    needs_attention: "نرخ حضور بین ۶۰٪ و ۸۰٪",
    critical: "نرخ حضور کمتر از ۶۰٪",
    absent: "کسانی که حداقل یک روز غیبت دارند",
    late: "کسانی که حداقل یک روز تأخیر دارند",
  };
  return labels[filter];
}

/**
 * ✅ Compute current Shamsi month/year on any RN engine.
 */
function getCurrentShamsi(): { month: number; year: number } {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US-u-ca-persian", {
      year: "numeric",
      month: "numeric",
    });

    const parts = formatter.formatToParts(now);
    const yearPart = parts.find((p) => p.type === "year")?.value || "";
    const monthPart = parts.find((p) => p.type === "month")?.value || "";

    const toLatinDigits = (s: string) =>
      s
        .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
        .replace(/[^\d]/g, "");

    const year = parseInt(toLatinDigits(yearPart), 10);
    const month = parseInt(toLatinDigits(monthPart), 10);

    if (
      Number.isFinite(year) &&
      Number.isFinite(month) &&
      year > 1300 &&
      month >= 1 &&
      month <= 12
    ) {
      return { month, year };
    }
    throw new Error("Intl parse failed");
  } catch {
    const now = new Date();
    const gy = now.getFullYear();
    const gm = now.getMonth() + 1;
    const gd = now.getDate();

    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy = gy <= 1600 ? 0 : 979;
    const gy2 = gy <= 1600 ? gy - 621 : gy - 1600;
    const gm2 = gm > 2 ? 1 : 0;
    let gd2 =
      365 * gy2 +
      Math.floor((gy2 + 3) / 4) -
      Math.floor((gy2 + 99) / 100) +
      Math.floor((gy2 + 399) / 400) -
      80 +
      gd +
      g_d_m[gm - 1] +
      gm2;

    jy += 33 * Math.floor(gd2 / 12053);
    gd2 %= 12053;
    jy += 4 * Math.floor(gd2 / 1461);
    gd2 %= 1461;
    if (gd2 > 365) {
      jy += Math.floor((gd2 - 1) / 365);
      gd2 = (gd2 - 1) % 365;
    }
    const jm =
      gd2 < 186 ? 1 + Math.floor(gd2 / 31) : 7 + Math.floor((gd2 - 186) / 30);

    return { month: jm, year: jy };
  }
}

function getRateColor(rate: number, total: number): string {
  if (total === 0) return "#94a3b8";
  if (rate >= 90) return "#10b981";
  if (rate >= 75) return "#3b82f6";
  if (rate >= 60) return "#f59e0b";
  return "#ef4444";
}

// ==================== PDF GENERATOR ====================

function generateClassAttendancePDF(
  report: Report,
  rows: StudentRow[],
  filterLabel: string,
): string {
  const monthName = report.period.shamsiMonthName;
  const year = report.period.shamsiYear;
  const className = report.class.name;
  const section = report.class.section ? ` - شعبه ${report.class.section}` : "";

  const totals = rows.reduce(
    (acc, r) => {
      acc.present += r.present || 0;
      acc.absent += r.absent || 0;
      acc.late += r.late || 0;
      acc.excused += r.excused || 0;
      acc.total += r.total || 0;
      return acc;
    },
    { present: 0, absent: 0, late: 0, excused: 0, total: 0 },
  );

  const avgRate =
    rows.length > 0
      ? Math.round(rows.reduce((s, r) => s + (r.rate || 0), 0) / rows.length)
      : 0;

  const tableRows = rows
    .map((s, idx) => {
      const rate = s.rate || 0;
      const rateColor =
        s.total === 0
          ? "#94a3b8"
          : rate >= 90
            ? "#10b981"
            : rate >= 75
              ? "#3b82f6"
              : rate >= 60
                ? "#f59e0b"
                : "#ef4444";

      return `
        <tr style="${idx % 2 === 0 ? "background:#f8fafc;" : ""}">
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;font-weight:500;">${idx + 1}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;">
            <strong>${s.name}</strong>
            ${s.studentNumber ? `<br><span style="font-size:11px;color:#94a3b8;">شماره: ${s.studentNumber}</span>` : ""}
          </td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;color:#10b981;font-weight:700;">${s.present || 0}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;color:#ef4444;font-weight:700;">${s.absent || 0}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;color:#f59e0b;font-weight:700;">${s.late || 0}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;color:#3b82f6;font-weight:600;">${s.excused || 0}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">${s.total || 0}</td>
          <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:center;">
            <span style="display:inline-block;padding:4px 10px;border-radius:10px;background:${rateColor}20;color:${rateColor};font-weight:700;font-size:12px;min-width:44px;">${s.total === 0 ? "—" : rate + "%"}</span>
          </td>
        </tr>`;
    })
    .join("");

  const filterBadge =
    filterLabel && filterLabel !== "همه"
      ? `<span style="display:inline-block;margin-right:8px;padding:3px 12px;border-radius:10px;background:rgba(255,255,255,0.25);font-size:12px;font-weight:600;">🔎 فلتر: ${filterLabel}</span>`
      : "";

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8" />
      <title>گزارش حضور صنف ${className} - ${monthName} ${year}</title>
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
        .header {
          background:linear-gradient(135deg,#8b5cf6 0%,#6d28d9 100%);
          padding:32px 40px;
          color:#fff;
        }
        .header h1 { font-size:26px; font-weight:800; margin-bottom:6px; }
        .header .subtitle { font-size:15px; opacity:.95; font-weight:500; }
        .header .meta { font-size:13px; opacity:.8; margin-top:8px; }
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
          padding:12px 10px; text-align:center; font-size:12px; font-weight:700;
          color:#1e293b; border-bottom:2px solid #e2e8f0; white-space:nowrap;
        }
        tbody td { font-size:13px; color:#1e293b; }
        tbody tr:hover { background:#f1f5f9; }
        .footer {
          padding:16px 40px; border-top:1px solid #e2e8f0;
          display:flex; justify-content:space-between;
          font-size:11px; color:#94a3b8; background:#f8fafc;
        }
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
          <h1>📊 گزارش ماهانه حضور و غیاب صنف</h1>
          <div class="subtitle">${className}${section} — ${monthName} ${year} ${filterBadge}</div>
          <div class="meta">
            تعداد دانش‌آموزان: ${rows.length} &nbsp;•&nbsp;
            روزهای کاری: ${report.period.workingDays} &nbsp;•&nbsp;
            تاریخ تولید: ${new Date().toLocaleString("fa-IR")}
          </div>
        </div>

        <div class="summary">
          <div class="card"><div class="v">${rows.length}</div><div class="l">دانش‌آموز</div></div>
          <div class="card g"><div class="v">${totals.present}</div><div class="l">مجموع حضور</div></div>
          <div class="card r"><div class="v">${totals.absent}</div><div class="l">مجموع غیبت</div></div>
          <div class="card y"><div class="v">${totals.late}</div><div class="l">مجموع تأخیر</div></div>
          <div class="card b"><div class="v">${totals.excused}</div><div class="l">موجه</div></div>
          <div class="card p"><div class="v">${avgRate}%</div><div class="l">میانگین نرخ حضور</div></div>
        </div>

        <div class="table-wrap">
          <div class="table-title">
            <h2>📋 لیست تفصیلی دانش‌آموزان</h2>
            <div class="count">${rows.length} ردیف</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th style="text-align:right;">نام و تخلص</th>
                <th>حضور</th>
                <th>غیبت</th>
                <th>تأخیر</th>
                <th>موجه</th>
                <th>کل ثبت</th>
                <th>نرخ</th>
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

export default function ClassAttendanceReportScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const classId = rawId ? parseInt(String(rawId), 10) : NaN;
  const isValidId = !isNaN(classId) && classId > 0;

  const currentShamsi = getCurrentShamsi();
  const [selectedShamsiMonth, setSelectedShamsiMonth] = useState(
    currentShamsi.month,
  );
  const [selectedShamsiYear, setSelectedShamsiYear] = useState(
    currentShamsi.year,
  );

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showFilters, setShowFilters] = useState(false);

  // 🐛 DEBUG: track last loaded month/year
  const [lastLoadedMonth, setLastLoadedMonth] = useState<number | null>(null);
  const [lastLoadedYear, setLastLoadedYear] = useState<number | null>(null);

  const statusFilters: StatusFilter[] = [
    "all",
    "perfect",
    "good",
    "needs_attention",
    "critical",
    "absent",
    "late",
  ];

  // ✅ Client-side filter by search + status
  const filteredStudents = useMemo(() => {
    if (!report?.byStudent) return [];
    let list = report.byStudent;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.studentNumber?.toLowerCase().includes(q),
      );
    }

    switch (statusFilter) {
      case "perfect":
        list = list.filter((s) => s.absent === 0 && s.late === 0);
        break;
      case "good":
        list = list.filter((s) => s.total > 0 && s.rate >= 80);
        break;
      case "needs_attention":
        list = list.filter((s) => s.total > 0 && s.rate >= 60 && s.rate < 80);
        break;
      case "critical":
        list = list.filter((s) => s.total > 0 && s.rate < 60);
        break;
      case "absent":
        list = list.filter((s) => s.absent > 0);
        break;
      case "late":
        list = list.filter((s) => s.late > 0);
        break;
      case "all":
      default:
        break;
    }

    return list;
  }, [report, search, statusFilter]);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (search.trim()) n++;
    if (statusFilter !== "all") n++;
    return n;
  }, [search, statusFilter]);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------
  const fetchReport = useCallback(async () => {
    if (DEBUG) {
      console.log(
        `🚀 [fetchReport] month=${selectedShamsiMonth}/${selectedShamsiYear} classId=${classId}`,
      );
    }

    if (!isValidId) {
      console.error("❌ [fetchReport] invalid classId");
      setLoading(false);
      Alert.alert("خطا", "شناسه صنف نامعتبر است", [
        { text: "بازگشت", onPress: () => router.back() },
      ]);
      return;
    }

    if (
      !Number.isFinite(selectedShamsiMonth) ||
      !Number.isFinite(selectedShamsiYear) ||
      selectedShamsiMonth < 1 ||
      selectedShamsiMonth > 12
    ) {
      console.error("❌ [fetchReport] invalid month/year");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setLoading(true);

      // ✅ Send SHAMSI month/year
      const url = `/teacher/classes/${classId}/monthly-report/attendance?month=${selectedShamsiMonth}&year=${selectedShamsiYear}`;

      if (DEBUG) console.log("📡 GET", url);

      const res = await apiRequest(url);

      if (DEBUG) {
        console.log("📥 success:", res?.success);
        console.log("📥 period:", res?.data?.period);
        console.log("📥 students:", res?.data?.byStudent?.length);
        console.log("📥 summary:", res?.data?.summary);
      }

      if (res?.success && res.data) {
        setReport(res.data);
        setLastLoadedMonth(selectedShamsiMonth);
        setLastLoadedYear(selectedShamsiYear);
      } else {
        setReport(null);
      }
    } catch (err: any) {
      console.error("❌ [fetchReport]", err);
      Alert.alert("خطا", err?.message || "خطا در دریافت گزارش");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [classId, isValidId, selectedShamsiMonth, selectedShamsiYear, router]);

  // Initial + refetch on month change
  useEffect(() => {
    if (DEBUG) {
      console.log(
        `🔥 [useEffect] FIRED month=${selectedShamsiMonth}/${selectedShamsiYear}`,
      );
    }
    setLoading(true);
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShamsiMonth, selectedShamsiYear]);

  const onRefresh = useCallback(() => {
    if (DEBUG) console.log("🔄 [onRefresh]");
    setRefreshing(true);
    fetchReport();
  }, [fetchReport]);

  const applyFilters = useCallback(() => {
    if (DEBUG) console.log("🎛️ [applyFilters]");
    // Filters are client-side, no refetch needed
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
  }, []);

  // ---------------------------------------------------------------------------
  // Month navigation (Shamsi wrap)
  // ---------------------------------------------------------------------------
  const goToPreviousMonth = () => {
    let m = selectedShamsiMonth - 1;
    let y = selectedShamsiYear;
    if (m === 0) {
      m = 12;
      y -= 1;
    }
    if (DEBUG) {
      console.log(
        `🔙 [goToPreviousMonth] ${selectedShamsiMonth}/${selectedShamsiYear} → ${m}/${y}`,
      );
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
    if (DEBUG) {
      console.log(
        `🔜 [goToNextMonth] ${selectedShamsiMonth}/${selectedShamsiYear} → ${m}/${y}`,
      );
    }
    setSelectedShamsiMonth(m);
    setSelectedShamsiYear(y);
  };

  // ---------------------------------------------------------------------------
  // PDF
  // ---------------------------------------------------------------------------
  const generatePDF = async () => {
    if (!report || filteredStudents.length === 0) {
      Alert.alert("اطلاعات", "داده‌ای برای تولید PDF وجود ندارد");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const filterLabel = getStatusFilterLabel(statusFilter);
      const html = generateClassAttendancePDF(
        report,
        filteredStudents,
        filterLabel,
      );

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
        width: 1300,
      });

      console.log("📄 PDF generated:", uri);

      const suffix = statusFilter !== "all" ? ` - ${filterLabel}` : "";
      const fileLabel = `گزارش ${report.class.name} ${report.period.shamsiMonthName} ${report.period.shamsiYear}${suffix}`;

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: fileLabel,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("موفق", `PDF ذخیره شد:\n${uri}`);
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
    if (!report?.summary) return null;
    const s = report.summary;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.summaryScroll}
      >
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{s.totalStudents}</Text>
            <Text style={styles.summaryLabel}>کل دانش‌آموزان</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#10b981" }]}>
              {s.present}
            </Text>
            <Text style={styles.summaryLabel}>مجموع حضور</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
              {s.absent}
            </Text>
            <Text style={styles.summaryLabel}>مجموع غیبت</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>
              {s.late}
            </Text>
            <Text style={styles.summaryLabel}>مجموع تأخیر</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#3b82f6" }]}>
              {s.excused}
            </Text>
            <Text style={styles.summaryLabel}>موجه</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: "#8b5cf6" }]}>
              {s.attendanceRate}%
            </Text>
            <Text style={styles.summaryLabel}>میانگین حضور</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderItem = ({ item }: { item: StudentRow }) => {
    const rate = item.rate || 0;
    const rateColor = getRateColor(rate, item.total);

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(item.name || "?").charAt(0)}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.staffName}>{item.name}</Text>
            <Text style={styles.staffDetails}>
              {item.studentNumber ? `شماره: ${item.studentNumber} • ` : ""}
              {item.email || "بدون ایمیل"}
            </Text>
          </View>
          <View style={styles.rateContainer}>
            <View
              style={[styles.rateBadge, { backgroundColor: rateColor + "20" }]}
            >
              <Text style={[styles.rateText, { color: rateColor }]}>
                {item.total === 0 ? "—" : `${rate}%`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: "#ecfdf5" }]}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text style={[styles.statNumber, { color: "#10b981" }]}>
              {item.present || 0}
            </Text>
            <Text style={styles.statLabel}>حضور</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: "#fef2f2" }]}>
            <Ionicons name="close-circle" size={16} color="#ef4444" />
            <Text style={[styles.statNumber, { color: "#ef4444" }]}>
              {item.absent || 0}
            </Text>
            <Text style={styles.statLabel}>غیبت</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: "#fffbeb" }]}>
            <Ionicons name="time" size={16} color="#f59e0b" />
            <Text style={[styles.statNumber, { color: "#f59e0b" }]}>
              {item.late || 0}
            </Text>
            <Text style={styles.statLabel}>تأخیر</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: "#eff6ff" }]}>
            <Ionicons name="document-text" size={16} color="#3b82f6" />
            <Text style={[styles.statNumber, { color: "#3b82f6" }]}>
              {item.total || 0}
            </Text>
            <Text style={styles.statLabel}>کل ثبت</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !report) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>
          در حال بارگذاری گزارش حضور صنف...
        </Text>
        <Text style={styles.loadingSubtext}>
          {getShamsiMonthName(selectedShamsiMonth)} {selectedShamsiYear}
        </Text>
      </SafeAreaView>
    );
  }

  const monthName = getShamsiMonthName(selectedShamsiMonth);

  // 🐛 DEBUG: stale check
  const isStale =
    lastLoadedMonth !== null &&
    lastLoadedYear !== null &&
    (lastLoadedMonth !== selectedShamsiMonth ||
      lastLoadedYear !== selectedShamsiYear);

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
          <Text style={styles.headerTitle}>گزارش حضور صنف</Text>
          <TouchableOpacity
            style={styles.pdfButton}
            onPress={generatePDF}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="share-outline" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* 🐛 DEBUG BANNER */}
        {DEBUG && (
          <View
            style={{
              backgroundColor: isStale ? "#fef2f2" : "#f0fdf4",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderBottomWidth: 1,
              borderBottomColor: isStale ? "#fecaca" : "#bbf7d0",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                color: isStale ? "#dc2626" : "#16a34a",
                textAlign: "center",
              }}
            >
              DEBUG • selected={selectedShamsiMonth}/{selectedShamsiYear} •
              loaded={lastLoadedMonth ?? "?"}/{lastLoadedYear ?? "?"} •
              students={report?.byStudent?.length ?? 0} • filtered=
              {filteredStudents.length} • {isStale ? "⚠️ STALE" : "✅ OK"} •
              loading={loading ? "Y" : "N"}
              {report?.period
                ? ` • backend=${report.period.shamsiMonth}/${report.period.shamsiYear}`
                : ""}
            </Text>
          </View>
        )}

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
              {report?.class?.name || "..."} • {filteredStudents.length} از{" "}
              {report?.summary?.totalStudents ?? 0} دانش‌آموز
            </Text>
            {DEBUG && isStale && (
              <Text
                style={{
                  fontSize: 9,
                  color: "#dc2626",
                  marginTop: 2,
                }}
              >
                ⏳ در حال به‌روزرسانی...
              </Text>
            )}
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
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
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
              placeholder="جستجوی دانش‌آموز..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={applyFilters}
              returnKeyType="search"
            />

            <View style={styles.filterRow}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>وضعیت حضور (در این ماه)</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterOptions}
                >
                  {statusFilters.map((sf) => {
                    const isActive = statusFilter === sf;
                    const tint =
                      sf === "absent"
                        ? "#ef4444"
                        : sf === "late"
                          ? "#f59e0b"
                          : sf === "critical"
                            ? "#dc2626"
                            : sf === "good"
                              ? "#10b981"
                              : sf === "perfect"
                                ? "#3b82f6"
                                : sf === "needs_attention"
                                  ? "#f59e0b"
                                  : "#8b5cf6";
                    return (
                      <TouchableOpacity
                        key={sf}
                        style={[
                          styles.filterChip,
                          isActive && {
                            backgroundColor: tint + "20",
                            borderColor: tint,
                            borderWidth: 1,
                          },
                        ]}
                        onPress={() => setStatusFilter(sf)}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            isActive && { color: tint, fontWeight: "700" },
                          ]}
                        >
                          {getStatusFilterLabel(sf)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                {statusFilter !== "all" && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#64748b",
                      marginTop: 4,
                    }}
                  >
                    {getStatusFilterDescription(statusFilter)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.applyButton, { flex: 1 }]}
                onPress={applyFilters}
              >
                <Text style={styles.applyButtonText}>اعمال فیلترها</Text>
              </TouchableOpacity>

              {activeFilterCount > 0 && (
                <TouchableOpacity
                  style={[styles.clearButton, { flex: 1 }]}
                  onPress={clearAllFilters}
                >
                  <Text style={styles.clearButtonText}>پاک کردن همه</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Student List */}
        <FlatList
          key={`${selectedShamsiMonth}-${selectedShamsiYear}-${statusFilter}`}
          data={filteredStudents}
          renderItem={renderItem}
          keyExtractor={(item) => item.studentId.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#8b5cf6"]}
              tintColor="#8b5cf6"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>
                {statusFilter !== "all"
                  ? `هیچ دانش‌آموزی با وضعیت «${getStatusFilterLabel(statusFilter)}» در این ماه یافت نشد`
                  : report?.summary?.totalRecords === 0
                    ? `هیچ حضور و غیابی برای ${monthName} ${selectedShamsiYear} ثبت نشده است`
                    : "هیچ داده‌ای یافت نشد"}
              </Text>
              {statusFilter !== "all" && (
                <TouchableOpacity
                  onPress={clearAllFilters}
                  style={styles.emptyClearButton}
                >
                  <Text style={styles.emptyClearButtonText}>
                    پاک کردن فیلترها
                  </Text>
                </TouchableOpacity>
              )}
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
  },
  loadingSubtext: {
    marginTop: 6,
    fontSize: 12,
    color: "#94a3b8",
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
  monthCenter: { alignItems: "center", flex: 1 },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  monthSubtext: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
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
  },
  summaryLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
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
  },
  filterBadge: {
    backgroundColor: "#8b5cf6",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
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
    marginTop: 12,
  },
  filterGroup: { flex: 1 },
  filterLabel: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 6,
  },
  filterOptions: { flexDirection: "row" },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    marginRight: 6,
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterChipActive: { backgroundColor: "#ede9fe" },
  filterChipText: {
    fontSize: 12,
    color: "#64748b",
  },
  filterChipTextActive: { color: "#8b5cf6", fontWeight: "600" },
  filterInput: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: "#1e293b",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  applyButton: {
    backgroundColor: "#8b5cf6",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  clearButton: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  clearButtonText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
  },
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
  },
  cardInfo: { flex: 1 },
  staffName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  staffDetails: {
    fontSize: 12,
    color: "#64748b",
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
  },
  statLabel: {
    fontSize: 10,
    color: "#64748b",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 22,
  },
  emptyClearButton: {
    marginTop: 16,
    backgroundColor: "#ede9fe",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptyClearButtonText: {
    color: "#8b5cf6",
    fontSize: 13,
    fontWeight: "700",
  },
});
