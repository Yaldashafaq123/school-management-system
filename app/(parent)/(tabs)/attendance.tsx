import { Calendar, TrendingUp } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function AttendanceMonitor() {
  const attendanceData = [
    { month: "جنوری", present: 22, total: 24 },
    { month: "فبروری", present: 20, total: 22 },
    { month: "مارچ", present: 23, total: 23 },
    { month: "اپریل", present: 21, total: 22 },
    { month: "می", present: 22, total: 24 },
    { month: "جون", present: 18, total: 20 },
  ];

  const dailyAttendance = [
    { day: "دوشنبه", date: "۱۲", status: "present" },
    { day: "سه‌شنبه", date: "۱۳", status: "present" },
    { day: "چهارشنبه", date: "۱۴", status: "absent" },
    { day: "پنجشنبه", date: "۱۵", status: "present" },
    { day: "جمعه", date: "۱۶", status: "present" },
    { day: "شنبه", date: "۱۷", status: "holiday" },
    { day: "یکشنبه", date: "۱۸", status: "weekend" },
  ];

  const totalPresent = attendanceData.reduce(
    (sum, month) => sum + month.present,
    0,
  );
  const totalDays = attendanceData.reduce((sum, month) => sum + month.total, 0);
  const attendanceRate = ((totalPresent / totalDays) * 100).toFixed(1);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statsCard}>
          <Calendar size={32} color="#3b82f6" />
          <View style={styles.statsContent}>
            <Text style={styles.statsValue}>{attendanceRate}٪</Text>
            <Text style={styles.statsLabel}>حضور کلی</Text>
          </View>
          <TrendingUp size={24} color="#10b981" />
        </View>
      </View>

      {/* حضور هفته جاری */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>این هفته</Text>
        <View style={styles.weekGrid}>
          {dailyAttendance.map((day, index) => (
            <View key={index} style={styles.dayCard}>
              <Text style={styles.dayName}>{day.day}</Text>
              <View
                style={[
                  styles.dateCircle,
                  day.status === "present" && styles.present,
                  day.status === "absent" && styles.absent,
                  day.status === "holiday" && styles.holiday,
                  day.status === "weekend" && styles.weekend,
                ]}
              >
                <Text style={styles.dateText}>{day.date}</Text>
              </View>
              <Text style={styles.statusText}>{getStatusText(day.status)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* روند ماهانه */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>روند حضور ماهانه</Text>
        <View style={styles.monthlyContainer}>
          {attendanceData.map((month, index) => {
            const percentage = (month.present / month.total) * 100;
            return (
              <View key={index} style={styles.monthCard}>
                <Text style={styles.monthName}>{month.month}</Text>
                <View style={styles.progressBackground}>
                  <View
                    style={[styles.progressFill, { height: `${percentage}%` }]}
                  />
                </View>
                <Text style={styles.monthStats}>
                  {month.present}/{month.total}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* خلاصه حضور */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>خلاصه</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalPresent}</Text>
            <Text style={styles.summaryLabel}>روزهای حاضر</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, styles.absentText]}>
              {totalDays - totalPresent}
            </Text>
            <Text style={styles.summaryLabel}>روزهای غایب</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalDays}</Text>
            <Text style={styles.summaryLabel}>روزهای کل</Text>
          </View>
        </View>
      </View>

      {/* راهنما */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.present]} />
          <Text style={styles.legendText}>حاضر</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.absent]} />
          <Text style={styles.legendText}>غایب</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.holiday]} />
          <Text style={styles.legendText}>تعطیل</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.weekend]} />
          <Text style={styles.legendText}>آخرهفته</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// تابع برای گرفتن متن وضعیت به دری
function getStatusText(status: string) {
  switch (status) {
    case "present":
      return "حاضر";
    case "absent":
      return "غایب";
    case "holiday":
      return "تعطیل";
    case "weekend":
      return "آخرهفته";
    default:
      return status;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { padding: 20 },
  statsCard: {
    flexDirection: "row-reverse", // تغییر جهت برای راست‌چین
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statsContent: {
    flex: 1,
    marginRight: 16, // تغییر از marginLeft به marginRight
    alignItems: "flex-end", // تراز راست
  },
  statsValue: {
    fontSize: 36,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right", // راست‌چین برای دری
  },
  statsLabel: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "right", // راست‌چین برای دری
  },
  section: { padding: 20, gap: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right", // راست‌چین برای دری
  },
  weekGrid: {
    flexDirection: "row-reverse", // تغییر جهت برای راست‌چین
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
  },
  dayCard: {
    alignItems: "center",
    gap: 8,
  },
  dayName: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center", // تراز وسط
  },
  dateCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16, // کمی بزرگتر برای خوانایی بهتر
  },
  present: { backgroundColor: "#10b981" },
  absent: { backgroundColor: "#ef4444" },
  holiday: { backgroundColor: "#f59e0b" },
  weekend: { backgroundColor: "#9ca3af" },
  statusText: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center", // تراز وسط
  },
  monthlyContainer: {
    flexDirection: "row-reverse", // تغییر جهت برای راست‌چین
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    height: 200,
  },
  monthCard: {
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  monthName: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center", // تراز وسط
  },
  progressBackground: {
    width: 20,
    height: 120,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  progressFill: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
  },
  monthStats: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center", // تراز وسط
  },
  summaryGrid: {
    flexDirection: "row-reverse", // تغییر جهت برای راست‌چین
    gap: 12,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
  },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center", // تراز وسط
  },
  summaryLabel: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center", // تراز وسط
  },
  absentText: { color: "#ef4444" },
  legend: {
    flexDirection: "row-reverse", // تغییر جهت برای راست‌چین
    justifyContent: "center",
    gap: 24,
    padding: 20,
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
  },
  legendItem: {
    flexDirection: "row-reverse", // تغییر جهت برای راست‌چین
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "right", // راست‌چین برای دری
  },
});
