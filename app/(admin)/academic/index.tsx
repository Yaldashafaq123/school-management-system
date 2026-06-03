import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import {
  BookOpen,
  Calendar,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Percent,
  Users,
} from "lucide-react-native";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface AcademicModule {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
}

export default function AcademicManagement() {
  const router = useRouter();

  const academicModules: AcademicModule[] = [
    {
      title: "تنظیم سال تحصیلی",
      description: "تنظیم ترم‌ها، رخصتی‌ها و تقویم آموزشی",
      icon: CalendarDays,
      href: "/(admin)/academic/years-setup",
      color: "#007AFF",
    },
    {
      title: "صنف‌ها و بخش‌ها",
      description: "ایجاد صنف‌ها و تعیین استادان",
      icon: Users,
      href: "/(admin)/academic/classes-sections",
      color: "#34C759",
    },
    {
      title: "مدیریت مضامین",
      description: "افزودن یا حذف مضامین و تعیین استادان",
      icon: BookOpen,
      href: "/(admin)/academic/subjects",
      color: "#FF9500",
    },
    {
      title: "ایجاد تقسیم اوقات",
      description: "ایجاد و ویرایش تقسیم اوقات مرکزی",
      icon: Calendar,
      href: "/(admin)/academic/timetable",
      color: "#5856D6",
    },
    {
      title: "مدیریت امتحانات",
      description: "تنظیم برنامه امتحانات و تعیین اطاق‌ها",
      icon: ClipboardList,
      href: "/(admin)/academic/exams",
      color: "#FF2D55",
    },
    {
      title: "سیستم نمره‌دهی",
      description: "تنظیم مقیاس نمرات و معیار قبولی",
      icon: Percent,
      href: "/(admin)/academic/grading-system",
      color: "#AF52DE",
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={24} color="#1d1d1f" />
              <Text style={styles.backButtonText}>بازگشت</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>مدیریت امور آموزشی</Text>
            <Text style={styles.subtitle}>
              مدیریت تمام فعالیت‌ها و تنظیمات آموزشی
            </Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.grid}>
          {academicModules.map((module, index) => (
            <Link href={module.href as any} key={index} asChild>
              <TouchableOpacity style={styles.card}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: module.color + "20" },
                  ]}
                >
                  <module.icon size={24} color={module.color} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{module.title}</Text>
                  <Text style={styles.cardDescription}>
                    {module.description}
                  </Text>
                </View>
                <ChevronRight size={20} color="#8E8E93" />
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>آمار سریع</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>صنف‌های فعال</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>45</Text>
              <Text style={styles.statLabel}>مضامین</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statLabel}>ترم‌ها</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>امتحانات پیشِ‌رو</Text>
            </View>
          </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.statsTitle}>آخرین تغییرات</Text>
          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View
                style={[styles.activityIcon, { backgroundColor: "#007AFF20" }]}
              >
                <Ionicons name="calendar-outline" size={18} color="#007AFF" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>
                  تقویم تحصیلی به‌روزرسانی شد
                </Text>
                <Text style={styles.activityTime}>۲ ساعت پیش</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View
                style={[styles.activityIcon, { backgroundColor: "#34C75920" }]}
              >
                <Ionicons name="people-outline" size={18} color="#34C759" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>صنف جدید هشتم اضافه شد</Text>
                <Text style={styles.activityTime}>دیروز</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View
                style={[styles.activityIcon, { backgroundColor: "#FF950020" }]}
              >
                <Ionicons name="book-outline" size={18} color="#FF9500" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>
                  ماده جدید ریاضی تعریف شد
                </Text>
                <Text style={styles.activityTime}>۳ روز پیش</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },
  header: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5ea",
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    right: 350,
    top: 0,
    zIndex: 10,
  },
  backButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5ea",
  },
  backButtonText: {
    fontSize: 8,
    fontWeight: "500",
    color: "#1d1d1f",
  },
  titleContainer: {
    flex: 1,
    marginRight: 80, // Space for back button
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1d1d1f",
    marginBottom: 4,
    textAlign: "right",
  },
  subtitle: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "right",
  },
  content: {
    paddingTop: 8,
  },
  grid: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e5ea",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 4,
    textAlign: "right",
  },
  cardDescription: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "right",
  },
  statsContainer: {
    padding: 20,
    backgroundColor: "white",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e5ea",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5ea",
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 16,
    textAlign: "right",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#f5f5f7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5ea",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
    textAlign: "center",
  },
  activitiesContainer: {
    padding: 20,
    backgroundColor: "white",
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f7",
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1d1d1f",
    marginBottom: 4,
    textAlign: "right",
  },
  activityTime: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "right",
  },
});
