// app/(student)/(tabs)/attendance.tsx
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  getStatusColor,
  getStatusIcon,
  getStatusText,
  studentAttendanceApi,
  StudentAttendanceData,
} from "@/src/config/studentAttendanceApi";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment-jalaali";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Configure moment for Persian/Jalaali calendar
moment.loadPersian({ dialect: "persian-modern" });

// Afghan Solar Hijri month names (Hamal to Hoot)
const AFGHAN_MONTHS = [
  "حمل", // 0
  "ثور", // 1
  "جوزا", // 2
  "سرطان", // 3
  "اسد", // 4
  "سنبله", // 5
  "میزان", // 6
  "عقرب", // 7
  "قوس", // 8
  "جدی", // 9
  "دلو", // 10
  "حوت", // 11
];

// Afghan weekdays (Saturday-based week)
const AFGHAN_WEEKDAYS = [
  "شنبه", // Saturday (0)
  "یکشنبه", // Sunday (1)
  "دوشنبه", // Monday (2)
  "سه‌شنبه", // Tuesday (3)
  "چهارشنبه", // Wednesday (4)
  "پنجشنبه", // Thursday (5)
  "جمعه", // Friday (6)
];

/**
 * Converts a Gregorian date string to Afghan Solar Hijri date string.
 * Uses moment-jalaali for accurate conversion (handles the ~20-day offset
 * between Gregorian and Solar Hijri months correctly).
 * Returns format: "DD MonthName YYYY" e.g. "5 حمل 1403"
 */
function toSolarHijri(gregorianDate: string): string {
  if (!gregorianDate) return "";
  const m = moment(gregorianDate);
  if (!m.isValid()) return gregorianDate;
  const year = m.jYear();
  const monthName = AFGHAN_MONTHS[m.jMonth()]; // jMonth() is 0-based
  const day = m.jDate();
  return `${day} ${monthName} ${year}`;
}

/**
 * Returns the Afghan weekday name for a given Gregorian date string.
 * Gregorian: 0=Sunday, 1=Monday, ..., 6=Saturday
 * Afghan week starts on Saturday, so Saturday=0 in our array.
 */
function getAfghanWeekday(gregorianDate: string): string {
  if (!gregorianDate) return "";
  const m = moment(gregorianDate);
  if (!m.isValid()) return "";
  // m.day(): 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday,
  //           4=Thursday, 5=Friday, 6=Saturday
  const gregorianDay = m.day();
  // Map to Afghan index (Saturday=0)
  const afghanIndex = gregorianDay === 6 ? 0 : gregorianDay + 1;
  return AFGHAN_WEEKDAYS[afghanIndex];
}

/**
 * Returns the Afghan month name for a given Gregorian date string.
 * Uses moment-jalaali for accurate Solar Hijri month calculation.
 * Do NOT use a simple Gregorian-month-name lookup — that is always ~20 days off.
 */
function toAfghanMonthName(gregorianDate: string): string {
  if (!gregorianDate) return gregorianDate;
  const m = moment(gregorianDate);
  if (!m.isValid()) return gregorianDate;
  return AFGHAN_MONTHS[m.jMonth()];
}

export default function AttendanceScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewType, setViewType] = useState<"daily" | "monthly" | "analytics">(
    "daily",
  );
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [attendanceData, setAttendanceData] =
    useState<StudentAttendanceData | null>(null);

  const loadAttendanceData = useCallback(async () => {
    try {
      const response = await studentAttendanceApi.getAttendanceOverview();
      if (response.success && response.data) {
        const transformedData = {
          ...response.data,

          // Convert each day's Gregorian date to Afghan Solar Hijri
          dailyAttendance: response.data.dailyAttendance.map((day) => ({
            ...day,
            // Store the original ISO date for weekday calculation before overwriting
            date: toSolarHijri(day.date),
            dayOfWeek: getAfghanWeekday(day.date),
          })),

          // Convert monthly summary month labels.
          // The backend sends the first day of the Gregorian month as an ISO
          // date string (e.g. "2024-04-01"). Convert that to Afghan month name.
          // If the backend already sends Afghan month names (e.g. "حمل"),
          // moment will not parse them as valid dates so toAfghanMonthName
          // returns the string unchanged — safe either way.
          monthlySummaries: response.data.monthlySummaries.map((summary) => ({
            ...summary,
            month: moment(summary.month).isValid()
              ? toAfghanMonthName(summary.month)
              : summary.month, // already an Afghan month name — leave it
          })),

          analytics: {
            ...response.data.analytics,
            monthlyTrend: {
              // Same logic: convert only if the label is a parseable date;
              // otherwise the backend already sent Afghan month names — keep them.
              labels: response.data.analytics.monthlyTrend.labels.map(
                (label) =>
                  moment(label).isValid() ? toAfghanMonthName(label) : label,
              ),
              data: response.data.analytics.monthlyTrend.data,
            },
          },
        };

        setAttendanceData(transformedData);
        if (transformedData.monthlySummaries.length > 0) {
          setSelectedMonth(transformedData.monthlySummaries[0].month);
        }
      }
    } catch (error) {
      console.error("Error loading attendance data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAttendanceData();
  }, [loadAttendanceData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAttendanceData();
  };

  const currentMonth =
    attendanceData?.monthlySummaries.find((m) => m.month === selectedMonth) ||
    attendanceData?.monthlySummaries[0];

  const pieData = currentMonth
    ? [
        {
          name: "حاضر",
          population: currentMonth.presentDays,
          color: Colors.success,
          legendFontColor: Colors.text,
          legendFontSize: 12,
        },
        {
          name: "غایب",
          population: currentMonth.absentDays,
          color: Colors.danger,
          legendFontColor: Colors.text,
          legendFontSize: 12,
        },
        {
          name: "تأخیر",
          population: currentMonth.lateDays,
          color: Colors.warning,
          legendFontColor: Colors.text,
          legendFontSize: 12,
        },
        {
          name: "موجه",
          population: currentMonth.excusedDays,
          color: Colors.info,
          legendFontColor: Colors.text,
          legendFontSize: 12,
        },
      ]
    : [];

  const lineChartData = {
    labels: attendanceData?.analytics?.monthlyTrend?.labels || [],
    datasets: [
      {
        data: attendanceData?.analytics?.monthlyTrend?.data?.length
          ? attendanceData.analytics.monthlyTrend.data
          : [0],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: Colors.card,
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: Colors.primary,
    },
  };

  const renderDailyView = () => (
    <View style={styles.dailyContainer}>
      <Text style={styles.sectionTitle}>حضور و غیاب روزانه</Text>

      {attendanceData?.dailyAttendance &&
      attendanceData.dailyAttendance.length > 0 ? (
        attendanceData.dailyAttendance.map((day, index) => (
          <View key={index} style={styles.dayCard}>
            <TouchableOpacity
              style={styles.dayHeader}
              onPress={() =>
                setShowDetails(showDetails === index ? null : index)
              }
            >
              <View style={styles.dateContainer}>
                <Text style={styles.dayOfWeek}>{day.dayOfWeek}</Text>
                <Text style={styles.dateText}>{day.date}</Text>
              </View>

              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(day.status)}20` },
                  ]}
                >
                  <Ionicons
                    name={getStatusIcon(day.status) as any}
                    size={16}
                    color={getStatusColor(day.status)}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(day.status) },
                    ]}
                  >
                    {getStatusText(day.status)}
                  </Text>
                </View>

                <Ionicons
                  name={showDetails === index ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={Colors.textSecondary}
                />
              </View>
            </TouchableOpacity>

            {showDetails === index &&
              day.subjects &&
              day.subjects.length > 0 && (
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailsTitle}>جزییات کلاس‌ها:</Text>
                  {day.subjects.map((subject, subIndex) => (
                    <View key={subIndex} style={styles.subjectRow}>
                      <View style={styles.subjectInfo}>
                        <Text style={styles.subjectName}>{subject.name}</Text>
                        <Text style={styles.subjectTime}>{subject.time}</Text>
                      </View>
                      <View
                        style={[
                          styles.subjectStatus,
                          subject.status === "present" && styles.presentStatus,
                          subject.status === "absent" && styles.absentStatus,
                          subject.status === "late" && styles.lateStatus,
                          subject.status === "excused" && styles.excusedStatus,
                        ]}
                      >
                        <Text style={styles.subjectStatusText}>
                          {subject.status === "present"
                            ? "حاضر"
                            : subject.status === "absent"
                              ? "غایب"
                              : subject.status === "late"
                                ? "تأخیر"
                                : "موجه"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name="calendar-outline"
            size={48}
            color={Colors.textSecondary}
          />
          <Text style={styles.emptyStateText}>
            هنوز حضور و غیابی ثبت نشده است
          </Text>
        </View>
      )}
    </View>
  );

  const renderMonthlyView = () => (
    <View style={styles.monthlyContainer}>
      <Text style={styles.sectionTitle}>خلاصه ماهانه</Text>

      {attendanceData?.monthlySummaries &&
      attendanceData.monthlySummaries.length > 0 ? (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.monthsSelector}
            contentContainerStyle={styles.monthsSelectorContent}
          >
            {attendanceData.monthlySummaries.map((month) => (
              <TouchableOpacity
                key={month.month}
                style={[
                  styles.monthChip,
                  selectedMonth === month.month && styles.monthChipActive,
                ]}
                onPress={() => setSelectedMonth(month.month)}
              >
                <Text
                  style={[
                    styles.monthChipText,
                    selectedMonth === month.month && styles.monthChipTextActive,
                  ]}
                >
                  {month.month}
                </Text>
                <Text style={styles.monthRate}>{month.attendanceRate}%</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {currentMonth && (
            <>
              <View style={styles.monthStats}>
                <View style={styles.monthStatCard}>
                  <Text style={styles.statValue}>{currentMonth.totalDays}</Text>
                  <Text style={styles.statLabel}>روز کاری</Text>
                </View>
                <View style={styles.monthStatCard}>
                  <Text style={[styles.statValue, { color: Colors.success }]}>
                    {currentMonth.presentDays}
                  </Text>
                  <Text style={styles.statLabel}>حاضر</Text>
                </View>
                <View style={styles.monthStatCard}>
                  <Text style={[styles.statValue, { color: Colors.danger }]}>
                    {currentMonth.absentDays}
                  </Text>
                  <Text style={styles.statLabel}>غایب</Text>
                </View>
                <View style={styles.monthStatCard}>
                  <Text style={[styles.statValue, { color: Colors.warning }]}>
                    {currentMonth.lateDays}
                  </Text>
                  <Text style={styles.statLabel}>تأخیر</Text>
                </View>
              </View>

              <View style={styles.attendanceRateCard}>
                <Text style={styles.rateTitle}>نرخ حضور</Text>
                <Text style={styles.rateValue}>
                  {currentMonth.attendanceRate}%
                </Text>
                <View style={styles.rateBar}>
                  <View
                    style={[
                      styles.rateFill,
                      { width: `${currentMonth.attendanceRate}%` },
                    ]}
                  />
                </View>
                <Text style={styles.rateSubtitle}>
                  {currentMonth.presentDays} از {currentMonth.totalDays} روز
                </Text>
              </View>

              <View style={styles.pieChartContainer}>
                <Text style={styles.chartTitle}>توزیع حضور و غیاب</Text>
                <PieChart
                  data={pieData}
                  width={SCREEN_WIDTH - 32}
                  height={200}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            </>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name="stats-chart-outline"
            size={48}
            color={Colors.textSecondary}
          />
          <Text style={styles.emptyStateText}>
            هنوز داده‌ای برای نمایش وجود ندارد
          </Text>
        </View>
      )}
    </View>
  );

  const renderAnalyticsView = () => (
    <View style={styles.analyticsContainer}>
      <Text style={styles.sectionTitle}>تحلیل آماری</Text>

      {attendanceData?.analytics &&
      attendanceData.analytics.monthlyTrend.data.length > 0 ? (
        <>
          <View style={styles.trendCard}>
            <Text style={styles.trendTitle}>روند حضور در ۶ ماه اخیر</Text>
            <LineChart
              data={lineChartData}
              width={SCREEN_WIDTH - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>

          <View style={styles.comparisonCard}>
            <Text style={styles.comparisonTitle}>مقایسه با کلاس</Text>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>میانگین شما</Text>
                <Text style={styles.comparisonValue}>
                  {attendanceData.analytics.comparison.studentAverage}%
                </Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>میانگین کلاس</Text>
                <Text style={styles.comparisonValue}>
                  {attendanceData.analytics.comparison.classAverage}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.insightsContainer}>
            <Text style={styles.insightsTitle}>نکات کلیدی</Text>
            {attendanceData.analytics.insights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <Ionicons
                  name={insight.icon as any}
                  size={20}
                  color={
                    insight.type === "positive"
                      ? Colors.success
                      : insight.type === "warning"
                        ? Colors.warning
                        : Colors.primary
                  }
                />
                <Text style={styles.insightText}>{insight.text}</Text>
              </View>
            ))}
          </View>

          {attendanceData.analytics.subjectBreakdown.length > 0 && (
            <View style={styles.subjectBreakdown}>
              <Text style={styles.breakdownTitle}>تحلیل دروس</Text>
              {attendanceData.analytics.subjectBreakdown.map(
                (subject, index) => (
                  <View key={index} style={styles.subjectBreakdownItem}>
                    <Text style={styles.subjectBreakdownName}>
                      {subject.subject}
                    </Text>
                    <View style={styles.subjectBreakdownBar}>
                      <View
                        style={[
                          styles.subjectBreakdownFill,
                          {
                            width: `${subject.rate}%`,
                            backgroundColor:
                              subject.rate >= 80
                                ? Colors.success
                                : subject.rate >= 60
                                  ? Colors.warning
                                  : Colors.danger,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.subjectBreakdownRate}>
                      {subject.rate}%
                    </Text>
                  </View>
                ),
              )}
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name="analytics-outline"
            size={48}
            color={Colors.textSecondary}
          />
          <Text style={styles.emptyStateText}>
            هنوز داده‌ای برای تحلیل وجود ندارد
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="حضور و غیاب" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const stats = attendanceData?.stats || {
    totalDays: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
    totalExcused: 0,
    averageRate: 0,
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="حضور و غیاب"
        rightComponent={
          <TouchableOpacity>
            <Ionicons name="download-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Ionicons name="calendar" size={24} color={Colors.primary} />
            <View style={styles.quickStatInfo}>
              <Text style={styles.quickStatValue}>{stats.totalDays}</Text>
              <Text style={styles.quickStatLabel}>روز کاری</Text>
            </View>
          </View>
          <View style={styles.quickStat}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={Colors.success}
            />
            <View style={styles.quickStatInfo}>
              <Text style={styles.quickStatValue}>{stats.totalPresent}</Text>
              <Text style={styles.quickStatLabel}>روز حاضر</Text>
            </View>
          </View>
          <View style={styles.quickStat}>
            <Ionicons name="trending-up" size={24} color={Colors.warning} />
            <View style={styles.quickStatInfo}>
              <Text style={styles.quickStatValue}>{stats.averageRate}%</Text>
              <Text style={styles.quickStatLabel}>میانگین حضور</Text>
            </View>
          </View>
        </View>

        {/* View Toggle */}
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewType === "daily" && styles.viewToggleActive,
            ]}
            onPress={() => setViewType("daily")}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={viewType === "daily" ? "#fff" : Colors.text}
            />
            <Text
              style={[
                styles.viewToggleText,
                viewType === "daily" && styles.viewToggleTextActive,
              ]}
            >
              روزانه
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewType === "monthly" && styles.viewToggleActive,
            ]}
            onPress={() => setViewType("monthly")}
          >
            <Ionicons
              name="stats-chart-outline"
              size={20}
              color={viewType === "monthly" ? "#fff" : Colors.text}
            />
            <Text
              style={[
                styles.viewToggleText,
                viewType === "monthly" && styles.viewToggleTextActive,
              ]}
            >
              ماهانه
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              viewType === "analytics" && styles.viewToggleActive,
            ]}
            onPress={() => setViewType("analytics")}
          >
            <Ionicons
              name="analytics-outline"
              size={20}
              color={viewType === "analytics" ? "#fff" : Colors.text}
            />
            <Text
              style={[
                styles.viewToggleText,
                viewType === "analytics" && styles.viewToggleTextActive,
              ]}
            >
              تحلیل
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        {viewType === "daily" && renderDailyView()}
        {viewType === "monthly" && renderMonthlyView()}
        {viewType === "analytics" && renderAnalyticsView()}

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>راهنمای رنگ‌ها:</Text>
          <View style={styles.legendGrid}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: Colors.success }]}
              />
              <Text style={styles.legendText}>حاضر</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: Colors.danger }]}
              />
              <Text style={styles.legendText}>غایب</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: Colors.warning }]}
              />
              <Text style={styles.legendText}>تأخیر</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: Colors.info }]}
              />
              <Text style={styles.legendText}>موجه</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  quickStats: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  quickStatInfo: {
    alignItems: "center",
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  quickStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  viewToggleContainer: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  viewToggleActive: {
    backgroundColor: Colors.primary,
  },
  viewToggleText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  viewToggleTextActive: {
    color: "#fff",
  },
  dailyContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: "center",
  },
  dayCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  dateContainer: {},
  dayOfWeek: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  detailsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  subjectRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  subjectInfo: {},
  subjectName: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  subjectTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  subjectStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  presentStatus: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  absentStatus: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  lateStatus: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },
  excusedStatus: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  subjectStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  monthlyContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  monthsSelector: {
    marginBottom: 20,
  },
  monthsSelectorContent: {
    gap: 8,
  },
  monthChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  monthChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  monthChipText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  monthChipTextActive: {
    color: "#fff",
  },
  monthRate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  monthStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  monthStatCard: {
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 80,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  attendanceRateCard: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  rateValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
  },
  rateBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  rateFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  rateSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pieChartContainer: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  analyticsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  trendCard: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  comparisonCard: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  comparisonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  comparisonItem: {
    alignItems: "center",
  },
  comparisonLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  insightsContainer: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  insightText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  subjectBreakdown: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },
  subjectBreakdownItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  subjectBreakdownName: {
    width: 80,
    fontSize: 14,
    color: Colors.text,
  },
  subjectBreakdownBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: "hidden",
  },
  subjectBreakdownFill: {
    height: "100%",
    borderRadius: 4,
  },
  subjectBreakdownRate: {
    width: 40,
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "right",
  },
  legendContainer: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text,
  },
});
