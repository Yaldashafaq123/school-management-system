import { useRouter } from "expo-router";
import {
  AlertCircle,
  Bell,
  Calendar,
  ChevronRight,
  DollarSign,
  MessageSquare,
  User,
} from "lucide-react-native";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ParentDashboard() {
  const router = useRouter();

  // فرزندان
  const children = [
    { id: 1, name: "عمر ویلسن", class: "صنف ۵ الف", active: true },
    { id: 2, name: "نوح ویلسن", class: "صنف ۳ ب", active: false },
  ];

  // اعلان‌ها
  const notifications = [
    {
      id: 1,
      title: "موعد فیس",
      message: "فیس سهماهه ظرف ۳ روز واجب است",
      type: "urgent",
    },
    {
      id: 2,
      title: "نشت والدین",
      message: "برای روز جمعه برنامه‌ریزی شده",
      type: "info",
    },
  ];

  // آمار سریع
  const quickStats = [
    { label: "حضور", value: "۹۵٪", icon: Calendar },
    { label: "فیس باقیمانده", value: "۴۵۰ $", icon: DollarSign },
    { label: "پیام‌های نخوانده", value: "۳", icon: MessageSquare },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* سربرگ با انتخاب‌کننده فرزند */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.childSelector}
          onPress={() => router.push("/(parent)/child-switch")}
        >
          <View style={styles.childInfo}>
            <User size={20} color="#4b5563" />
            <View style={styles.childDetails}>
              <Text style={styles.childName}>عمر ویلسن</Text>
              <Text style={styles.childClass}>صنف ۵ الف • فعال</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* آمار سریع */}
      <View style={styles.statsGrid}>
        {quickStats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <stat.icon size={24} color="#3b82f6" />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* اعلان‌ها */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Bell size={20} color="#374151" />
          <Text style={styles.sectionTitle}>اعلان‌ها</Text>
        </View>
        {notifications.map((notification) => (
          <View key={notification.id} style={styles.notificationCard}>
            <AlertCircle
              size={20}
              color={notification.type === "urgent" ? "#ef4444" : "#3b82f6"}
            />
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationMessage}>
                {notification.message}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* اقدامات سریع */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>اقدامات سریع</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(parent)/events")}
          >
            <Calendar size={24} color="#3b82f6" />
            <Text style={styles.actionText}>رویدادها</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(parent)/(tabs)/fees")}
          >
            <DollarSign size={24} color="#10b981" />
            <Text style={styles.actionText}>پرداخت فیس</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* رویدادهای آینده */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>رویدادهای آینده</Text>
          <TouchableOpacity onPress={() => router.push("/(parent)/events")}>
            <Text style={styles.seeAll}>مشاهده همه</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.eventCard}>
          <Text style={styles.eventTitle}>روز ورزش</Text>
          <Text style={styles.eventDate}>جمعه، ساعت ۱۰:۰۰ قبل از ظهر</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { padding: 16, backgroundColor: "white" },
  childSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 12,
  },
  childInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  childDetails: { gap: 2 },
  childName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right", // برای راست‌چین کردن متن دری
  },
  childClass: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "right", // برای راست‌چین کردن متن دری
  },
  statsGrid: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  section: { padding: 16, gap: 12 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right", // برای راست‌چین کردن متن دری
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  notificationContent: { flex: 1, gap: 4 },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right", // برای راست‌چین کردن متن دری
  },
  notificationMessage: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "right", // برای راست‌چین کردن متن دری
  },
  actionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  seeAll: {
    color: "#3b82f6",
    fontWeight: "500",
  },
  eventCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    gap: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right", // برای راست‌چین کردن متن دری
  },
  eventDate: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "right", // برای راست‌چین کردن متن دری
  },
});
