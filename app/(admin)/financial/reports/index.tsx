// app/(admin)/financial/reports/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const REPORT_CATEGORIES = [
  {
    title: "گزارشات روزانه و ماهانه",
    items: [
      {
        id: "daily",
        title: "راپور روزانه",
        subtitle: "وصولی امروز به تفکیک",
        icon: "today-outline",
        route: "/financial/reports/daily",
        color: "#3b82f6",
        gradient: ["#3b82f6", "#2563eb"],
      },
      {
        id: "monthly",
        title: "راپور ماهانه",
        subtitle: "وصولی ماه جاری",
        icon: "calendar-outline",
        route: "/financial/reports/monthly",
        color: "#8b5cf6",
        gradient: ["#8b5cf6", "#7c3aed"],
      },
    ],
  },
  {
    title: "گزارشات تحلیلی",
    items: [
      {
        id: "outstanding",
        title: "بدهکارها",
        subtitle: "شاگردان بدهکار و معوق",
        icon: "alert-circle-outline",
        route: "/financial/reports/outstanding",
        color: "#ef4444",
        gradient: ["#ef4444", "#dc2626"],
      },
      {
        id: "class-wise",
        title: "راپور صنف‌ها",
        subtitle: "وصولی به تفکیک صنف",
        icon: "people-outline",
        route: "/financial/reports/class-wise",
        color: "#10b981",
        gradient: ["#10b981", "#059669"],
      },
      {
        id: "income-statement",
        title: "صورت عایدات",
        subtitle: "عایدات و مصارف",
        icon: "stats-chart-outline",
        route: "/financial/reports/income-statement",
        color: "#f59e0b",
        gradient: ["#f59e0b", "#d97706"],
      },
    ],
  },
  {
    title: "صادرات",
    items: [
      {
        id: "export",
        title: "صدور راپور",
        subtitle: "Excel / PDF",
        icon: "download-outline",
        route: "/financial/reports/export",
        color: "#06b6d4",
        gradient: ["#06b6d4", "#0891b2"],
      },
    ],
  },
];

export default function ReportsMenuScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>راپورهای مالی</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <LinearGradient
            colors={["#1e293b", "#334155"]}
            style={styles.heroGradient}
          >
            <Ionicons name="analytics" size={40} color="#fff" />
            <Text style={styles.heroTitle}>گزارشات و تحلیل‌ها</Text>
            <Text style={styles.heroSubtitle}>مشاهده و تحلیل عملکرد مالی</Text>
          </LinearGradient>
        </View>

        {/* Report Categories */}
        {REPORT_CATEGORIES.map((category, catIndex) => (
          <View key={catIndex} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <View style={styles.reportsGrid}>
              {category.items.map((report) => (
                <TouchableOpacity
                  key={report.id}
                  style={styles.reportCard}
                  onPress={() => router.push(report.route as any)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={report.gradient as [string, string]}
                    style={styles.reportGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.reportIcon}>
                      <Ionicons
                        name={report.icon as any}
                        size={28}
                        color="#fff"
                      />
                    </View>
                    <View style={styles.reportInfo}>
                      <Text style={styles.reportTitle}>{report.title}</Text>
                      <Text style={styles.reportSubtitle}>
                        {report.subtitle}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="rgba(255,255,255,0.7)"
                    />
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Quick Stats */}
        <View style={styles.quickStatsSection}>
          <Text style={styles.categoryTitle}>دسترسی سریع</Text>
          <View style={styles.quickStatsGrid}>
            <TouchableOpacity
              style={styles.quickStatCard}
              onPress={() => router.push("/financial/reports/daily")}
            >
              <Ionicons name="today" size={24} color="#3b82f6" />
              <Text style={styles.quickStatText}>امروز</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickStatCard}
              onPress={() => router.push("/financial/reports/outstanding")}
            >
              <Ionicons name="warning" size={24} color="#ef4444" />
              <Text style={styles.quickStatText}>بدهکارها</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickStatCard}
              onPress={() => router.push("/financial/reports/class-wise")}
            >
              <Ionicons name="people" size={24} color="#10b981" />
              <Text style={styles.quickStatText}>صنف‌ها</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickStatCard}
              onPress={() => router.push("/financial/reports/income-statement")}
            >
              <Ionicons name="stats-chart" size={24} color="#f59e0b" />
              <Text style={styles.quickStatText}>عایدات</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  scrollView: {
    flex: 1,
  },

  // Hero
  heroBanner: {
    margin: 16,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  heroGradient: {
    padding: 24,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginTop: 12,
    fontFamily: "VazirBold",
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
    fontFamily: "Vazir",
  },

  // Categories
  categorySection: {
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    paddingHorizontal: 16,
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  reportsGrid: {
    paddingHorizontal: 16,
    gap: 10,
  },
  reportCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  reportGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
  },
  reportIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "VazirBold",
  },
  reportSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
    fontFamily: "Vazir",
  },

  // Quick Stats
  quickStatsSection: {
    marginTop: 16,
  },
  quickStatsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },
  quickStatCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    gap: 8,
  },
  quickStatText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    fontFamily: "Vazir",
  },
});
