import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { ProgressChart } from "react-native-chart-kit";

export default function ChildProgress() {
  const screenWidth = Dimensions.get("window").width - 32;

  const subjects = [
    { name: "ریاضیات", grade: "A", score: 92, color: "#3b82f6" },
    { name: "ساینس", grade: "A-", score: 88, color: "#10b981" },
    { name: "انګلیسی", grade: "B+", score: 85, color: "#8b5cf6" },
    { name: "تاریخ", grade: "A", score: 90, color: "#f59e0b" },
    { name: "هنر", grade: "A+", score: 96, color: "#ef4444" },
  ];

  const chartData = {
    labels: ["ریاضی", "ساینس", "انګلیسی", "تاریخ", "هنر"],
    data: [0.92, 0.88, 0.85, 0.9, 0.96],
    colors: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"],
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>عملکرد تحصیلی</Text>
        <Text style={styles.subtitle}>عمر ویلسن • صنف ۵ الف</Text>
      </View>

      {/* نمودار پیشرفت کلی */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>پیشرفت کلی</Text>
        <View style={styles.chartContainer}>
          <ProgressChart
            data={chartData}
            width={screenWidth}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              color: (opacity = 1, index = 0) =>
                chartData.colors[index] || "#3b82f6",
            }}
            hideLegend={false}
          />
        </View>
      </View>

      {/* عملکرد بر اساس مضمون */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>جزئیات مضامین</Text>
        {subjects.map((subject, index) => (
          <View key={index} style={styles.subjectCard}>
            <View style={styles.subjectHeader}>
              <View
                style={[
                  styles.colorIndicator,
                  { backgroundColor: subject.color },
                ]}
              />
              <Text style={styles.subjectName}>{subject.name}</Text>
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeText}>{subject.grade}</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${subject.score}%`,
                    backgroundColor: subject.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.scoreText}>{subject.score}٪</Text>
          </View>
        ))}
      </View>

      {/* نظریات معلم */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}> نظریات معلم</Text>
        <View style={styles.commentCard}>
          <Text style={styles.commentText}>
            عمر در تمام مضامین پیشرفت عالی نشان می‌دهد. او به طور فعال در مباحث
            صنفی اشتراک می‌کند و تکالیف خود را به موقع تکمیل می‌کند. کار عالی
            خود را ادامه دهید!
          </Text>
          <Text style={styles.teacherName}>- خانم جانسون، معلم صنف</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { padding: 20, backgroundColor: "white" },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "right",
  },
  section: { padding: 20, gap: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  chartContainer: { backgroundColor: "white", padding: 16, borderRadius: 12 },
  subjectCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  subjectHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorIndicator: { width: 4, height: 24, borderRadius: 2 },
  subjectName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  gradeBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  gradeText: { color: "white", fontWeight: "600", fontSize: 14 },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    textAlign: "right",
  },
  commentCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  commentText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    textAlign: "right",
  },
  teacherName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3b82f6",
    textAlign: "right",
  },
});