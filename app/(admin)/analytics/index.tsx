import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../../constants/Colors";

// Simple chart component since the ProgressChart might have different props
const SimpleChart = () => {
  const data = [65, 78, 92, 85, 76, 94];
  const maxValue = Math.max(...data);

  return (
    <View style={simpleChartStyles.container}>
      <View style={simpleChartStyles.chart}>
        {data.map((value, index) => (
          <View key={index} style={simpleChartStyles.barContainer}>
            <View style={simpleChartStyles.barWrapper}>
              <View
                style={[
                  simpleChartStyles.bar,
                  {
                    height: `${(value / maxValue) * 100}%`,
                    backgroundColor: Colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={simpleChartStyles.label}>
              {["حمل", "ثور", "جوزا", "سرطان", "اسد", "سنبله"][index]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const simpleChartStyles = StyleSheet.create({
  container: {
    height: 200,
  },
  chart: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 8,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
  },
  barWrapper: {
    width: 20,
    height: "80%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

// Afghan Dari/Hijri Solar Calendar Months
const afghanMonths = [
  "حمل", // Hamal (Mar-Apr)
  "ثور", // Saur (Apr-May)
  "جوزا", // Jawza (May-Jun)
  "سرطان", // Saratan (Jun-Jul)
  "اسد", // Asad (Jul-Aug)
  "سنبله", // Sonbola (Aug-Sep)
  "میزان", // Mizan (Sep-Oct)
  "عقرب", // Aqrab (Oct-Nov)
  "قوس", // Qaus (Nov-Dec)
  "جدی", // Jadi (Dec-Jan)
  "دلو", // Dalw (Jan-Feb)
  "حوت", // Hut (Feb-Mar)
];

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">(
    "month",
  );

  const stats = {
    totalRevenue: 24500000, // ریال
    newUsers: 142,
    activeUsers: 856,
    courseCompletions: 324,
    avgSessionTime: "۲۴:۳۶",
    bounceRate: "۳۲٪",
  };

  const topCourses = [
    { id: 1, title: "ریاضی پیشرفته", students: 245, rating: 4.8 },
    { id: 2, title: "برنامه‌نویسی پایتون", students: 198, rating: 4.9 },
    { id: 3, title: "زبان انگلیسی", students: 176, rating: 4.7 },
    { id: 4, title: "فیزیک مدرن", students: 154, rating: 4.6 },
    { id: 5, title: "آمار و احتمال", students: 132, rating: 4.5 },
  ];

  // User growth with Afghan Dari months
  const userGrowth = [
    { month: "حمل", newUsers: 120, activeUsers: 850 },
    { month: "ثور", newUsers: 135, activeUsers: 890 },
    { month: "جوزا", newUsers: 142, activeUsers: 920 },
    { month: "سرطان", newUsers: 128, activeUsers: 910 },
    { month: "اسد", newUsers: 155, activeUsers: 950 },
    { month: "سنبله", newUsers: 162, activeUsers: 980 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header with Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تحلیل و گزارشات</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Time Range Filter */}
        <View style={styles.timeRangeContainer}>
          {(["day", "week", "month", "year"] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {range === "day" && "امروز"}
                {range === "week" && "هفته"}
                {range === "month" && "ماه"}
                {range === "year" && "سال"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.metricCard}
          >
            <Text style={styles.metricValue}>
              {stats.totalRevenue.toLocaleString()} ریال
            </Text>
            <Text style={styles.metricLabel}>درآمد کل</Text>
            <View style={styles.metricTrend}>
              <Ionicons name="trending-up" size={16} color="#fff" />
              <Text style={styles.trendText}>۱۲٪+</Text>
            </View>
          </LinearGradient>

          <View style={styles.metricCardSecondary}>
            <View style={styles.metricIconSecondary}>
              <Ionicons name="person-add" size={24} color={Colors.success} />
            </View>
            <Text style={styles.metricValueSecondary}>{stats.newUsers}</Text>
            <Text style={styles.metricLabelSecondary}>کاربر جدید</Text>
          </View>

          <View style={styles.metricCardSecondary}>
            <View style={styles.metricIconSecondary}>
              <Ionicons name="people" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.metricValueSecondary}>
              {stats.activeUsers.toLocaleString()}
            </Text>
            <Text style={styles.metricLabelSecondary}>کاربر فعال</Text>
          </View>

          <View style={styles.metricCardSecondary}>
            <View style={styles.metricIconSecondary}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={Colors.secondary}
              />
            </View>
            <Text style={styles.metricValueSecondary}>
              {stats.courseCompletions}
            </Text>
            <Text style={styles.metricLabelSecondary}>تکمیل دوره</Text>
          </View>
        </View>

        {/* Charts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>رشد کاربران</Text>
            <TouchableOpacity
              onPress={() => router.push("/(admin)/analytics/users")}
            >
              <Text style={styles.seeAllText}>جزئیات بیشتر</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chartContainer}>
            <SimpleChart />
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: Colors.primary },
                  ]}
                />
                <Text style={styles.legendText}>کاربران جدید</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: Colors.success },
                  ]}
                />
                <Text style={styles.legendText}>کاربران فعال</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Top Courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>پربازدیدترین دوره‌ها</Text>
            <TouchableOpacity
              onPress={() => router.push("/(admin)/analytics/courses")}
            >
              <Text style={styles.seeAllText}>مشاهده همه</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.coursesList}>
            {topCourses.map((course, index) => (
              <View
                key={course.id}
                style={[
                  styles.courseItem,
                  index === topCourses.length - 1 && styles.lastItem,
                ]}
              >
                <View style={styles.courseRank}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <View style={styles.courseStats}>
                    <View style={styles.courseStat}>
                      <Ionicons
                        name="people"
                        size={14}
                        color={Colors.textSecondary}
                      />
                      <Text style={styles.courseStatText}>
                        {course.students} دانش‌آموز
                      </Text>
                    </View>
                    <View style={styles.courseStat}>
                      <Ionicons name="star" size={14} color={Colors.warning} />
                      <Text style={styles.courseStatText}>{course.rating}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity style={styles.courseButton}>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.primary}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* User Growth Table - Now with Afghan Dari months */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            آمار رشد کاربران (ماه‌های هجری شمسی)
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.tableCell]}>
                ماه
              </Text>
              <Text style={[styles.tableHeaderCell, styles.tableCell]}>
                کاربر جدید
              </Text>
              <Text style={[styles.tableHeaderCell, styles.tableCell]}>
                کاربر فعال
              </Text>
              <Text style={[styles.tableHeaderCell, styles.tableCell]}>
                رشد
              </Text>
            </View>
            {userGrowth.map((item, index) => {
              const growth =
                item.newUsers - (userGrowth[index - 1]?.newUsers || 0);
              return (
                <View
                  key={index}
                  style={[
                    styles.tableRow,
                    index === userGrowth.length - 1 && styles.tableRowLast,
                  ]}
                >
                  <Text style={[styles.tableCell, styles.tableCellFirst]}>
                    {item.month}
                  </Text>
                  <Text style={styles.tableCell}>{item.newUsers}</Text>
                  <Text style={styles.tableCell}>{item.activeUsers}</Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.growthCell,
                      { color: growth >= 0 ? Colors.success : Colors.danger },
                    ]}
                  >
                    {growth >= 0 ? "+" : ""}
                    {growth}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Reports */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>گزارشات سریع</Text>
          <View style={styles.reportsGrid}>
            <TouchableOpacity style={styles.reportCard}>
              <View
                style={[
                  styles.reportIcon,
                  { backgroundColor: `${Colors.primary}20` },
                ]}
              >
                <Ionicons name="download" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.reportTitle}>گزارش ماهانه</Text>
              <Text style={styles.reportDesc}>گزارش کامل عملکرد ماه</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportCard}>
              <View
                style={[
                  styles.reportIcon,
                  { backgroundColor: `${Colors.success}20` },
                ]}
              >
                <Ionicons name="person" size={24} color={Colors.success} />
              </View>
              <Text style={styles.reportTitle}>گزارش کاربران</Text>
              <Text style={styles.reportDesc}>تحلیل رفتار کاربران</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportCard}>
              <View
                style={[
                  styles.reportIcon,
                  { backgroundColor: `${Colors.secondary}20` },
                ]}
              >
                <Ionicons name="school" size={24} color={Colors.secondary} />
              </View>
              <Text style={styles.reportTitle}>گزارش دوره‌ها</Text>
              <Text style={styles.reportDesc}>آمار دوره‌های آموزشی</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reportCard}>
              <View
                style={[
                  styles.reportIcon,
                  { backgroundColor: `${Colors.warning}20` },
                ]}
              >
                <Ionicons name="cash" size={24} color={Colors.warning} />
              </View>
              <Text style={styles.reportTitle}>گزارش مالی</Text>
              <Text style={styles.reportDesc}>درآمد و هزینه‌ها</Text>
            </TouchableOpacity>
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
  // Custom Header Styles
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
  },
  headerRightPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  timeRangeContainer: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  timeRangeButtonActive: {
    backgroundColor: Colors.primary,
  },
  timeRangeText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  timeRangeTextActive: {
    color: "#fff",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 12,
  },
  metricTrend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  metricCardSecondary: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricIconSecondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    marginBottom: 12,
  },
  metricValueSecondary: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  metricLabelSecondary: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  chartContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  coursesList: {
    gap: 8,
  },
  courseItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  lastItem: {
    marginBottom: 0,
  },
  courseRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary,
  },
  courseInfo: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 4,
  },
  courseStats: {
    flexDirection: "row",
    gap: 16,
  },
  courseStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  courseStatText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  courseButton: {
    padding: 4,
  },
  table: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableHeaderCell: {
    fontWeight: "bold",
    color: Colors.text,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: Colors.text,
    textAlign: "center",
  },
  tableCellFirst: {
    textAlign: "right",
  },
  growthCell: {
    fontWeight: "bold",
  },
  reportsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  reportCard: {
    width: "48%",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reportIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
    textAlign: "center",
  },
  reportDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
