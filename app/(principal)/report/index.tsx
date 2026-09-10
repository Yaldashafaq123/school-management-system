// app/(principal)/reports/index.tsx

import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    BookOpen,
    Calendar,
    FileSpreadsheet,
    GraduationCap,
    Users,
} from "lucide-react-native";
import { useState } from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type ReportType = {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  route:
    | "/reports/class"
    | "/reports/student"
    | "/reports/class-results"
    | "/reports/attendance"
    | "/reports/student-transcript"
    | "/reports/school-summary";
  badge?: string;
};

export default function ReportsListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const reportTypes: ReportType[] = [
    {
      id: "class-report",
      title: "راپور صنف",
      description:
        "دریافت راپور کامل یک صنف شامل نمرات، حضور و غیاب و معلومات شاگردان",
      icon: Users,
      color: "#007AFF",
      route: "/reports/class",
      badge: "Excel",
    },
    {
      id: "student-report",
      title: "راپور شاگرد",
      description: "دریافت راپور کامل یک شاگرد شامل نمرات، حضور و معلومات شخصی",
      icon: GraduationCap,
      color: "#34C759",
      route: "/reports/student",
      badge: "Excel",
    },
    {
      id: "class-results",
      title: "نتایج امتحانات صنف",
      description:
        "دریافت نتایج امتحانات ماهانه و سالانه صنف به صورت فایل Excel",
      icon: FileSpreadsheet,
      color: "#FF9500",
      route: "/reports/class-results",
      badge: "Excel",
    },
    {
      id: "attendance-report",
      title: "راپور حضور و غیاب",
      description: "دریافت راپور حضور و غیاب شاگردان بر اساس صنف و ماه",
      icon: Calendar,
      color: "#5856D6",
      route: "/reports/attendance",
      badge: "Excel",
    },
    {
      id: "student-transcript",
      title: "کارنامه شاگرد",
      description: "دریافت کارنامه کامل شاگرد با نمرات تمام مضامین",
      icon: BookOpen,
      color: "#AF52DE",
      route: "/reports/student-transcript",
      badge: "Excel",
    },
    {
      id: "school-summary",
      title: "خلاصه گزارش مکتب",
      description:
        "دریافت گزارش خلاصه از وضعیت مکتب شامل آمار شاگردان و اساتید",
      icon: FileSpreadsheet,
      color: "#FF2D55",
      route: "/reports/school-summary",
      badge: "Excel",
    },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>راپورهای وزارتی</Text>
        <Text style={styles.headerSubtitle}>
          راپورهای معیاری برای وزارت معارف
        </Text>
      </View>

      {/* Report Cards */}
      <View style={styles.reportsGrid}>
        {reportTypes.map((report) => (
          <TouchableOpacity
            key={report.id}
            style={styles.reportCard}
            onPress={() => router.push(report.route)}
            activeOpacity={0.7}
          >
            <View style={styles.reportCardContent}>
              <View
                style={[
                  styles.reportIcon,
                  { backgroundColor: `${report.color}15` },
                ]}
              >
                <report.icon size={28} color={report.color} />
              </View>
              <View style={styles.reportInfo}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  {report.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{report.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.reportDescription} numberOfLines={2}>
                  {report.description}
                </Text>
              </View>
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer Note */}
      <View style={styles.footerNote}>
        <Ionicons name="information-circle" size={20} color="#94a3b8" />
        <Text style={styles.footerText}>
          تمام راپورها به صورت فایل Excel قابل دریافت می‌باشند
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  reportsGrid: {
    gap: 12,
  },
  reportCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  reportCardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  reportIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  reportInfo: {
    flex: 1,
  },
  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  badge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    color: "#d97706",
    fontFamily: "Vazir",
  },
  reportDescription: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  arrowContainer: {
    paddingLeft: 8,
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 24,
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
  },
  footerText: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
});
