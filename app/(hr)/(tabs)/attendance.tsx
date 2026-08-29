// app/(hr)/(tabs)/attendance.tsx - WITH PROPER TABLE PDF REPORT
import { hrApi } from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// ==================== PUNCH TYPE HELPERS ====================

const PUNCH_LABELS: Record<number, string> = {
  0: "ورود",
  1: "خروج",
  2: "خروج وقت استراحت",
  3: "ورود بعد از استراحت",
  4: "ورود اضافه کار",
  5: "خروج اضافه کار",
};

const PUNCH_COLORS: Record<number, string> = {
  0: "#10b981",
  1: "#ef4444",
  2: "#f59e0b",
  3: "#8b5cf6",
  4: "#3b82f6",
  5: "#ec4899",
};

const PUNCH_ICONS: Record<number, string> = {
  0: "log-in-outline",
  1: "log-out-outline",
  2: "exit-outline",
  3: "enter-outline",
  4: "timer-outline",
  5: "timer-outline",
};

function getPunchColor(punchType: number | null | undefined): string {
  if (punchType === null || punchType === undefined) return "#94a3b8";
  return PUNCH_COLORS[punchType] || "#94a3b8";
}

function getPunchIcon(punchType: number | null | undefined): string {
  if (punchType === null || punchType === undefined)
    return "help-circle-outline";
  return PUNCH_ICONS[punchType] || "help-circle-outline";
}

function getAfghanistanDate(date: Date): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 4.5 * 3600000);
}

function formatShamsiDate(date: Date): string {
  try {
    const formatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return formatter.format(date);
  } catch {
    return date.toLocaleDateString("fa-IR");
  }
}

// ==================== TYPES ====================

type PunchRecord = {
  punchType: number;
  label: string;
  labelFa: string;
  time: string;
  device: string;
};

type TodayAttendanceRecord = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "present" | "absent" | "late";
  hasCheckIn: boolean;
  hasCheckOut: boolean;
  isLate: boolean;
  isOnTime: boolean;
  lateStatus: "on_time" | "grace_period" | "late" | "no_checkin";
  schoolStartTime: string;
  firstCheckIn: {
    time: string;
    dateShamsi: string;
  } | null;
  lastPunch: {
    type: number;
    label: string;
    labelFa: string;
    time: string;
  } | null;
  totalPunches: number;
  punchCounts: Record<string, number>;
  records: PunchRecord[];
};

type AttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  checkedIn: number;
  checkedOut: number;
  total: number;
  totalPunches: number;
  onTime: number;
};

type TodayAttendanceData = {
  date: string;
  dateShamsi?: string;
  dateShamsiFull?: string;
  shamsiMonth?: number;
  shamsiYear?: number;
  shamsiMonthName?: string;
  shamsiWeekday?: string;
  schoolStartTime?: string;
  summary: {
    present: number;
    absent: number;
    late: number;
    checkedIn: number;
    checkedOut: number;
    total: number;
    totalPunches: number;
    onTime: number;
  };
  attendance: TodayAttendanceRecord[];
};

// ==================== PDF GENERATION - TABLE REPORT ====================

function generateTableReportHTML(
  attendanceData: TodayAttendanceRecord[],
  summary: AttendanceSummary,
  dateShamsi: string,
  schoolStartTime: string,
): string {
  const getStatusPersian = (status: string) => {
    switch (status) {
      case "present":
        return "حاضر";
      case "absent":
        return "غایب";
      case "late":
        return "تأخیر";
      default:
        return "نامشخص";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "#10b981";
      case "absent":
        return "#ef4444";
      case "late":
        return "#f59e0b";
      default:
        return "#94a3b8";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "present":
        return "#d1fae5";
      case "absent":
        return "#fef2f2";
      case "late":
        return "#fef3c7";
      default:
        return "#f1f5f9";
    }
  };

  const getRolePersian = (role: string) => {
    switch (role) {
      case "TEACHER":
        return "استاد";
      case "ADMIN":
        return "مدیر";
      case "FINANCE":
        return "مالی";
      case "HR":
        return "منابع بشری";
      case "PRINCIPAL":
        return "مدیر مکتب";
      default:
        return role;
    }
  };

  // Generate table rows for ALL data
  const tableRows = attendanceData
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 14px; font-weight: 500; color: #1e293b;">
        ${item.name}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px; color: #64748b;">
        ${getRolePersian(item.role)}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">
        <span style="display: inline-block; padding: 4px 14px; border-radius: 20px; background-color: ${getStatusBgColor(
          item.status,
        )}; color: ${getStatusColor(item.status)}; font-size: 12px; font-weight: 600;">
          ${getStatusPersian(item.status)}
        </span>
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px; color: #1e293b;">
        ${item.firstCheckIn ? item.firstCheckIn.time : "—"}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px; color: #1e293b;">
        ${item.lastPunch ? item.lastPunch.time : "—"}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px; color: #1e293b;">
        ${item.lastPunch ? item.lastPunch.labelFa : "—"}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px; color: #64748b;">
        ${item.totalPunches || 0}
      </td>
    </tr>
  `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>گزارش حضور و غیاب - ${dateShamsi}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Vazirmatn', 'Vazir', sans-serif;
          background: #f1f5f9;
          padding: 20px;
          direction: rtl;
        }
        
        .report-container {
          max-width: 1200px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }
        
        /* Header */
        .report-header {
          background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
          padding: 30px 40px;
          color: white;
        }
        
        .report-header h1 {
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 6px;
          letter-spacing: 0.5px;
        }
        
        .report-header .subtitle {
          font-size: 15px;
          opacity: 0.9;
          font-weight: 400;
        }
        
        .report-header .date {
          font-size: 14px;
          opacity: 0.85;
          margin-top: 6px;
        }
        
        /* Scanner Status */
        .scanner-status {
          display: flex;
          align-items: center;
          padding: 10px 40px;
          background: #f0fdf4;
          border-bottom: 1px solid #dcfce7;
          gap: 8px;
        }
        
        .scanner-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
        }
        
        .scanner-text {
          flex: 1;
          font-size: 14px;
          color: #10b981;
        }
        
        /* School Time Info */
        .school-time-info {
          display: flex;
          align-items: center;
          padding: 10px 40px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          gap: 8px;
          font-size: 14px;
          color: #1e293b;
        }
        
        .school-time-info .subtext {
          font-size: 12px;
          color: #94a3b8;
        }
        
        /* Summary Cards */
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          padding: 20px 40px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .summary-card {
          background: white;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          border-right: 4px solid #8b5cf6;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        
        .summary-card .value {
          font-size: 26px;
          font-weight: 700;
        }
        
        .summary-card .label {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
          font-weight: 500;
        }
        
        .summary-card.present { border-right-color: #10b981; }
        .summary-card.present .value { color: #10b981; }
        .summary-card.late { border-right-color: #f59e0b; }
        .summary-card.late .value { color: #f59e0b; }
        .summary-card.absent { border-right-color: #ef4444; }
        .summary-card.absent .value { color: #ef4444; }
        .summary-card.total { border-right-color: #8b5cf6; }
        .summary-card.total .value { color: #8b5cf6; }
        .summary-card.punches { border-right-color: #3b82f6; }
        .summary-card.punches .value { color: #3b82f6; }
        
        /* Breakdown */
        .breakdown-row {
          display: flex;
          justify-content: center;
          gap: 30px;
          padding: 10px 40px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .breakdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #64748b;
        }
        
        .breakdown-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        
        /* Table Section */
        .table-section {
          padding: 24px 40px 40px;
        }
        
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        
        .table-title {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
        }
        
        .table-subtitle {
          font-size: 13px;
          color: #94a3b8;
        }
        
        .table-wrapper {
          overflow-x: auto;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Vazirmatn', 'Vazir', sans-serif;
        }
        
        thead {
          background: #f1f5f9;
        }
        
        thead th {
          padding: 14px 12px;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
          border-bottom: 2px solid #e2e8f0;
          white-space: nowrap;
        }
        
        thead th:first-child {
          text-align: right;
        }
        
        tbody tr:hover {
          background: #f8fafc;
        }
        
        tbody tr:last-child td {
          border-bottom: none;
        }
        
        tbody td {
          padding: 10px 12px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 14px;
          color: #1e293b;
        }
        
        tbody td:first-child {
          text-align: right;
          font-weight: 500;
        }
        
        /* Footer */
        .report-footer {
          padding: 16px 40px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #94a3b8;
          background: #f8fafc;
        }
        
        /* Print Styles */
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .report-container {
            box-shadow: none;
            border-radius: 0;
          }
          .no-print {
            display: none !important;
          }
          thead {
            display: table-header-group;
          }
          tbody tr {
            page-break-inside: avoid;
          }
        }
        
        @media (max-width: 768px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
            padding: 16px;
          }
          .report-header {
            padding: 20px;
          }
          .report-header h1 {
            font-size: 20px;
          }
          .table-section {
            padding: 16px;
          }
          .scanner-status, .school-time-info, .breakdown-row {
            padding: 8px 16px;
          }
          .report-footer {
            flex-direction: column;
            gap: 6px;
            text-align: center;
            padding: 12px 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <!-- Header -->
        <div class="report-header">
          <h1>📋 گزارش حضور و غیاب</h1>
          <div class="subtitle">خلاصه وضعیت حضور کارمندان</div>
          <div class="date">📅 ${dateShamsi}</div>
        </div>
        
        <!-- Scanner Status -->
        <div class="scanner-status">
          <div class="scanner-dot"></div>
          <div class="scanner-text">دستگاه حضور و غیاب متصل است</div>
          <span style="color: #10b981; font-size: 18px;">✓</span>
        </div>
        
        <!-- School Time Info -->
        <div class="school-time-info">
          <span>⏰</span>
          <span><strong>ساعت شروع کار:</strong> ${schoolStartTime}</span>
          <span class="subtext">(تأخیر بعد از ${schoolStartTime})</span>
        </div>
        
        <!-- Summary Cards -->
        <div class="summary-grid">
          <div class="summary-card present">
            <div class="value">${summary.present}</div>
            <div class="label">✅ حاضر</div>
          </div>
          <div class="summary-card late">
            <div class="value">${summary.late}</div>
            <div class="label">⏰ تأخیر</div>
          </div>
          <div class="summary-card absent">
            <div class="value">${summary.absent}</div>
            <div class="label">❌ غایب</div>
          </div>
          <div class="summary-card total">
            <div class="value">${summary.total}</div>
            <div class="label">👥 مجموع</div>
          </div>
          <div class="summary-card punches">
            <div class="value">${summary.totalPunches}</div>
            <div class="label">📌 ثبت‌ها</div>
          </div>
        </div>
        
        <!-- Breakdown -->
        <div class="breakdown-row">
          <div class="breakdown-item">
            <div class="breakdown-dot" style="background: #10b981;"></div>
            <span>سر وقت: ${summary.onTime} نفر</span>
          </div>
          <div class="breakdown-item">
            <div class="breakdown-dot" style="background: #f59e0b;"></div>
            <span>تأخیر: ${summary.late} نفر</span>
          </div>
        </div>
        
        <!-- Table Section -->
        <div class="table-section">
          <div class="table-header">
            <div class="table-title">📊 لیست حضور و غیاب</div>
            <div class="table-subtitle">${summary.total} کارمند • ${summary.totalPunches} ثبت</div>
          </div>
          
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>نام کارمند</th>
                  <th>نقش</th>
                  <th>وضعیت</th>
                  <th>زمان ورود</th>
                  <th>آخرین ثبت</th>
                  <th>نوع ثبت</th>
                  <th>تعداد ثبت</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="report-footer">
          <span class="generated-at">📄 تاریخ تولید: ${new Date().toLocaleString(
            "fa-IR",
          )}</span>
          <span>نسخه PDF • سیستم حضور و غیاب</span>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ==================== COMPONENT ====================

export default function AttendanceScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [attendance, setAttendance] = useState<TodayAttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>({
    present: 0,
    absent: 0,
    late: 0,
    checkedIn: 0,
    checkedOut: 0,
    total: 0,
    totalPunches: 0,
    onTime: 0,
  });
  const [selectedDate] = useState(new Date());
  const [dateShamsi, setDateShamsi] = useState("");
  const [schoolStartTime, setSchoolStartTime] = useState("07:30");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await hrApi.getTodayAttendance();

      if (response.success && response.data) {
        const data = response.data as unknown as TodayAttendanceData;

        setAttendance(data.attendance || []);
        setSummary({
          present: data.summary?.present || 0,
          absent: data.summary?.absent || 0,
          late: data.summary?.late || 0,
          checkedIn: data.summary?.checkedIn || 0,
          checkedOut: data.summary?.checkedOut || 0,
          total: data.summary?.total || 0,
          totalPunches: data.summary?.totalPunches || 0,
          onTime: data.summary?.onTime || 0,
        });

        if (data.schoolStartTime) {
          setSchoolStartTime(data.schoolStartTime);
        }

        if (data.dateShamsi) {
          setDateShamsi(data.dateShamsi);
        } else {
          const afghanDate = getAfghanistanDate(new Date());
          setDateShamsi(formatShamsiDate(afghanDate));
        }
      }
    } catch (error) {
      console.error("Fetch attendance error:", error);
      Alert.alert("خطا", "خطا در دریافت اطلاعات حضور و غیاب");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  // Generate PDF with ALL data in table format
  const generatePDF = async () => {
    if (attendance.length === 0) {
      Alert.alert("اطلاعات", "هیچ داده‌ای برای تولید PDF وجود ندارد");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const html = generateTableReportHTML(
        attendance,
        summary,
        dateShamsi || formatShamsiDate(getAfghanistanDate(new Date())),
        schoolStartTime,
      );

      // Generate PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
        width: 1200,
      });

      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `گزارش حضور و غیاب - ${dateShamsi}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("موفق", `PDF در مسیر زیر ذخیره شد:\n${uri}`, [
          { text: "باشه" },
        ]);
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      Alert.alert("خطا", "خطا در تولید فایل PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const renderItem = ({ item }: { item: TodayAttendanceRecord }) => {
    const lastPunch = item.lastPunch;
    const punchColor = lastPunch ? getPunchColor(lastPunch.type) : "#94a3b8";
    const punchIcon = lastPunch
      ? getPunchIcon(lastPunch.type)
      : "help-circle-outline";

    let statusLabel = "غایب";
    let statusColor = "#ef4444";
    let statusIcon:
      | "checkmark-circle"
      | "close-circle"
      | "time"
      | "checkmark-done-circle" = "close-circle";
    let statusBgColor = "#fef2f2";

    if (item.status === "late") {
      statusLabel = "تأخیر";
      statusColor = "#f59e0b";
      statusIcon = "time";
      statusBgColor = "#fef3c7";
    } else if (item.hasCheckIn && item.hasCheckOut) {
      statusLabel = "تکمیل";
      statusColor = "#10b981";
      statusIcon = "checkmark-done-circle";
      statusBgColor = "#d1fae5";
    } else if (item.hasCheckIn) {
      statusLabel = "حاضر";
      statusColor = "#10b981";
      statusIcon = "checkmark-circle";
      statusBgColor = "#d1fae5";
    }

    return (
      <View style={[styles.card, item.status === "late" && styles.cardLate]}>
        <View style={styles.cardLeft}>
          <View
            style={[styles.avatar, item.status === "late" && styles.avatarLate]}
          >
            <Text
              style={[
                styles.avatarText,
                item.status === "late" && styles.avatarTextLate,
              ]}
            >
              {item.name.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.staffName}>{item.name}</Text>
            <Text style={styles.roleText}>
              {item.role === "TEACHER"
                ? "استاد"
                : item.role === "ADMIN"
                  ? "مدیر"
                  : item.role === "FINANCE"
                    ? "مالی"
                    : item.role === "HR"
                      ? "منابع بشری"
                      : item.role === "PRINCIPAL"
                        ? "مدیر مکتب"
                        : item.role}
            </Text>
            {lastPunch && (
              <View style={styles.punchInfo}>
                <Ionicons
                  name={punchIcon as any}
                  size={14}
                  color={punchColor}
                />
                <Text style={[styles.punchTimeText, { color: punchColor }]}>
                  {lastPunch.labelFa} • {lastPunch.time}
                </Text>
              </View>
            )}
            {item.isLate && item.firstCheckIn && (
              <View style={styles.lateInfo}>
                <Ionicons name="time-outline" size={12} color="#f59e0b" />
                <Text style={styles.lateInfoText}>
                  ورود: {item.firstCheckIn.time} (تأخیر)
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardRight}>
          <View
            style={[styles.statusBadge, { backgroundColor: statusBgColor }]}
          >
            <Ionicons name={statusIcon} size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>

          {item.totalPunches > 0 && (
            <View style={styles.punchCountBadge}>
              <Text style={styles.punchCountText}>{item.totalPunches}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Date Header with Navigation */}
      <View style={styles.dateHeader}>
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.dateText}>
          {dateShamsi || formatShamsiDate(getAfghanistanDate(selectedDate))}
        </Text>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

      {/* Scanner Status */}
      <View style={styles.scannerStatus}>
        <View style={styles.scannerDot} />
        <Text style={styles.scannerText}>دستگاه حضور و غیاب متصل است</Text>
        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
      </View>

      {/* ⏰ School Start Time Info */}
      <View style={styles.schoolTimeInfo}>
        <Ionicons name="time-outline" size={16} color="#64748b" />
        <Text style={styles.schoolTimeText}>
          ساعت شروع کار: {schoolStartTime}
        </Text>
        <Text style={styles.schoolTimeSubtext}>
          (تأخیر بعد از {schoolStartTime})
        </Text>
      </View>

      {/* Summary Cards - with LATE */}
      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { borderLeftColor: "#10b981" }]}>
          <Text style={[styles.summaryValue, { color: "#10b981" }]}>
            {summary.present}
          </Text>
          <Text style={styles.summaryLabel}>حاضر</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: "#f59e0b" }]}>
          <Text style={[styles.summaryValue, { color: "#f59e0b" }]}>
            {summary.late}
          </Text>
          <Text style={styles.summaryLabel}>تأخیر</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: "#ef4444" }]}>
          <Text style={[styles.summaryValue, { color: "#ef4444" }]}>
            {summary.absent}
          </Text>
          <Text style={styles.summaryLabel}>غایب</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: "#8b5cf6" }]}>
          <Text style={[styles.summaryValue, { color: "#8b5cf6" }]}>
            {summary.total}
          </Text>
          <Text style={styles.summaryLabel}>مجموع</Text>
        </View>
      </View>

      {/* ✅ On Time / Late Breakdown */}
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownItem}>
          <View style={[styles.breakdownDot, { backgroundColor: "#10b981" }]} />
          <Text style={styles.breakdownText}>سر وقت: {summary.onTime}</Text>
        </View>
        <View style={styles.breakdownItem}>
          <View style={[styles.breakdownDot, { backgroundColor: "#f59e0b" }]} />
          <Text style={styles.breakdownText}>تأخیر: {summary.late}</Text>
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#10b981" }]}
          onPress={() => {
            Alert.alert(
              "همگام‌سازی",
              "در حال دریافت داده از دستگاه حضور و غیاب...",
            );
          }}
        >
          <Ionicons name="sync-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>همگام‌سازی</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#8b5cf6" }]}
          onPress={() => router.push("/(hr)/attendance/record")}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.actionButtonText}>ثبت دستی</Text>
        </TouchableOpacity>
        {/* PDF Download Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: "#dc2626" },
            isGeneratingPDF && styles.actionButtonDisabled,
          ]}
          onPress={generatePDF}
          disabled={isGeneratingPDF}
        >
          {isGeneratingPDF ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="document-text-outline" size={18} color="#fff" />
          )}
          <Text style={styles.actionButtonText}>
            {isGeneratingPDF ? "در حال ساخت..." : "PDF"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Attendance List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>لیست حضور و غیاب</Text>
        <Text style={styles.listSubtitle}>
          {summary.total} کارمند • {summary.totalPunches} ثبت
        </Text>
      </View>

      <FlatList
        data={attendance}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>هیچ رکورد حضوری یافت نشد</Text>
            <Text style={styles.emptySubtext}>
              امروز {formatShamsiDate(getAfghanistanDate(new Date()))}
            </Text>
          </View>
        }
      />
    </View>
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
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  scannerStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#dcfce7",
  },
  scannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  scannerText: {
    flex: 1,
    fontSize: 14,
    color: "#10b981",
    fontFamily: "Vazir",
  },
  schoolTimeInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  schoolTimeText: {
    fontSize: 13,
    color: "#1e293b",
    fontFamily: "Vazir",
    fontWeight: "500",
  },
  schoolTimeSubtext: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  breakdownDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  breakdownText: {
    fontSize: 12,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  listSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 10,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardLate: {
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLate: {
    backgroundColor: "#fef3c7",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  avatarTextLate: {
    color: "#f59e0b",
  },
  staffName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  roleText: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  punchInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  punchTimeText: {
    fontSize: 11,
    fontFamily: "Vazir",
  },
  lateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 1,
  },
  lateInfoText: {
    fontSize: 10,
    color: "#f59e0b",
    fontFamily: "Vazir",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  punchCountBadge: {
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  punchCountText: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "600",
    fontFamily: "VazirBold",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4,
    fontFamily: "Vazir",
  },
});
