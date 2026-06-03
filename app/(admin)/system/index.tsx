import { Link } from "expo-router";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle,
  ChevronRight,
  Database,
  Lock,
  RefreshCw,
  Server,
  Settings,
  Shield,
  Users,
  XCircle,
} from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// تعریف رابط‌های TypeScript
interface SystemStatus {
  status: "healthy" | "warning" | "error";
  message: string;
}

interface SystemStatusMap {
  app: SystemStatus;
  database: SystemStatus;
  api: SystemStatus;
  storage: SystemStatus;
}

interface SystemModule {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
}

interface Notifications {
  email: boolean;
  push: boolean;
  sms: boolean;
  maintenance: boolean;
}

interface RecentActivity {
  id: number;
  user: string;
  action: string;
  time: string;
  status: "success" | "failed";
}

export default function SystemManagement() {
  const [systemStatus, setSystemStatus] = useState<SystemStatusMap>({
    app: { status: "healthy", message: "تمامی سیستم‌ها فعال هستند" },
    database: {
      status: "healthy",
      message: "ارتباط با پایگاه داده پایدار است",
    },
    api: { status: "warning", message: "تأخیر بالا تشخیص داده شد" },
    storage: {
      status: "healthy",
      message: "۸۵ درصد فضای ذخیره‌سازی استفاده شده",
    },
  });

  const [notifications, setNotifications] = useState<Notifications>({
    email: true,
    push: true,
    sms: false,
    maintenance: true,
  });

  const systemModules: SystemModule[] = [
    {
      title: "ارسال اعلامیه",
      description: "ارسال اعلامیه به کل مدرسه",
      icon: Bell,
      href: "/(public)/notifications",
      color: "#FF9500",
    },
    {
      title: "تنظیمات سیستم",
      description: "پیکربندی تنظیمات و ترجیحات برنامه",
      icon: Settings,
      href: "/(admin)/system/system-settings",
      color: "#007AFF",
    },
    {
      title: "پشتیبان‌گیری و بازیابی",
      description: "مدیریت پشتیبان‌گیری و بازیابی داده‌ها",
      icon: Database,
      href: "/(admin)/system/backup-restore",
      color: "#34C759",
    },
    {
      title: "گزارش‌های حسابرسی",
      description: "مشاهده فعالیت کاربران و گزارش‌های سیستم",
      icon: Shield,
      href: "/(admin)/system/audit-logs",
      color: "#AF52DE",
    },
    {
      title: "مدیریت پایگاه داده",
      description: "پاکسازی، نگهداری و بهینه‌سازی",
      icon: Server,
      href: "/(admin)/system/database",
      color: "#5856D6",
    },
    {
      title: "مدیریت کاربران",
      description: "مدیریت تمام حساب‌های کاربری و نقش‌ها",
      icon: Users,
      href: "/(admin)/users",
      color: "#FF2D55",
    },
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: 1,
      user: "مدیر سیستم",
      action: "ورود به سیستم",
      time: "۲ دقیقه پیش",
      status: "success",
    },
    {
      id: 2,
      user: "معلم احمدی",
      action: "بروزرسانی نمرات",
      time: "۱۵ دقیقه پیش",
      status: "success",
    },
    {
      id: 3,
      user: "سیستم",
      action: "پشتیبان‌گیری روزانه",
      time: "۱ ساعت پیش",
      status: "success",
    },
    {
      id: 4,
      user: "ناشناس",
      action: "تلاش ناموفق برای ورود",
      time: "۳ ساعت پیش",
      status: "failed",
    },
  ];

  const getStatusColor = (status: SystemStatus["status"]) => {
    switch (status) {
      case "healthy":
        return "#34C759";
      case "warning":
        return "#FF9500";
      case "error":
        return "#FF3B30";
      default:
        return "#8E8E93";
    }
  };

  const getStatusIcon = (status: SystemStatus["status"]) => {
    switch (status) {
      case "healthy":
        return CheckCircle;
      case "warning":
        return AlertTriangle;
      case "error":
        return XCircle;
      default:
        return Activity;
    }
  };

  const toggleNotification = (type: keyof Notifications) => {
    setNotifications({ ...notifications, [type]: !notifications[type] });
  };

  const runSystemCheck = () => {
    // شبیه‌سازی بررسی سیستم
    Alert.alert("بررسی سیستم", "تشخیص سیستم با موفقیت انجام شد.");
  };

  return (
    <ScrollView style={styles.container}>
      {/* وضعیت سیستم */}
      <View style={styles.statusContainer}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>وضعیت سیستم</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={runSystemCheck}
          >
            <RefreshCw size={16} color="#007AFF" />
            <Text style={styles.refreshText}>بروزرسانی</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statusGrid}>
          {Object.entries(systemStatus).map(([key, value]) => {
            const StatusIcon = getStatusIcon(value.status);
            const statusNames: Record<string, string> = {
              app: "برنامه",
              database: "پایگاه داده",
              api: "API",
              storage: "ذخیره‌سازی",
            };
            return (
              <View key={key} style={styles.statusCard}>
                <View style={styles.statusHeaderRow}>
                  <StatusIcon size={20} color={getStatusColor(value.status)} />
                  <Text style={styles.statusName}>
                    {statusNames[key] || key.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.statusMessage}>{value.message}</Text>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getStatusColor(value.status) },
                  ]}
                />
              </View>
            );
          })}
        </View>
      </View>

      {/* تنظیمات اطلاع‌رسانی */}
      <View style={styles.notificationsContainer}>
        <View style={styles.sectionHeader}>
          <Bell size={20} color="#8E8E93" />
          <Text style={styles.sectionTitle}>تنظیمات اطلاع‌رسانی</Text>
        </View>

        <View style={styles.notificationList}>
          {Object.entries(notifications).map(([key, value]) => {
            const labels: Record<string, string> = {
              email: "ایمیل",
              push: "پوش نوتیفیکیشن",
              sms: "پیامک",
              maintenance: "نگهداری سیستم",
            };
            const descriptions: Record<string, string> = {
              email: "دریافت هشدارهای سیستمی از طریق ایمیل",
              push: "دریافت هشدارها به صورت نوتیفیکیشن",
              sms: "دریافت هشدارها از طریق پیامک",
              maintenance: "دریافت اطلاعیه‌های زمان نگهداری",
            };
            return (
              <View key={key} style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationLabel}>
                    {labels[key] || key} اطلاع‌رسانی
                  </Text>
                  <Text style={styles.notificationDescription}>
                    {descriptions[key] || `دریافت هشدارهای ${key}`}
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={() =>
                    toggleNotification(key as keyof Notifications)
                  }
                  trackColor={{ false: "#f2f2f7", true: "#34C759" }}
                  thumbColor={value ? "#fff" : "#fff"}
                />
              </View>
            );
          })}
        </View>
      </View>

      {/* ماژول‌های سیستم */}
      <View style={styles.modulesContainer}>
        <View style={styles.sectionHeader}>
          <Settings size={20} color="#8E8E93" />
          <Text style={styles.sectionTitle}>ماژول‌های سیستم</Text>
        </View>

        <View style={styles.modulesGrid}>
          {systemModules.map((module, index) => (
            <Link href={module.href as any} key={index} asChild>
              <TouchableOpacity style={styles.moduleCard}>
                <View
                  style={[
                    styles.moduleIcon,
                    { backgroundColor: module.color + "20" },
                  ]}
                >
                  <module.icon size={24} color={module.color} />
                </View>
                <View style={styles.moduleContent}>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleDescription}>
                    {module.description}
                  </Text>
                </View>
                <ChevronRight size={20} color="#8E8E93" />
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </View>

      {/* فعالیت‌های اخیر */}
      <View style={styles.activitiesContainer}>
        <View style={styles.sectionHeader}>
          <Activity size={20} color="#8E8E93" />
          <Text style={styles.sectionTitle}>فعالیت‌های اخیر</Text>
          <Link href="/(admin)/system/audit-logs" asChild>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>مشاهده همه</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.activitiesList}>
          {recentActivities.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityInfo}>
                <Text style={styles.activityUser}>{activity.user}</Text>
                <Text style={styles.activityAction}>{activity.action}</Text>
              </View>
              <View style={styles.activityMeta}>
                <Text style={styles.activityTime}>{activity.time}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        activity.status === "success" ? "#D4F7E2" : "#FFE5E5",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          activity.status === "success" ? "#34C759" : "#FF3B30",
                      },
                    ]}
                  >
                    {activity.status === "success" ? "موفق" : "ناموفق"}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* اقدامات سریع */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>اقدامات سریع</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionButton}>
            <Lock size={20} color="#007AFF" />
            <Text style={styles.actionText}>اسکن امنیتی</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Database size={20} color="#34C759" />
            <Text style={styles.actionText}>پاکسازی حافظه کش</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <RefreshCw size={20} color="#FF9500" />
            <Text style={styles.actionText}>راه‌اندازی مجدد سرویس‌ها</Text>
          </TouchableOpacity>
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
  statusContainer: {
    backgroundColor: "white",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5ea",
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1d1d1f",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f2f2f7",
    borderRadius: 6,
    gap: 6,
  },
  refreshText: {
    fontSize: 14,
    color: "#007AFF",
  },
  statusGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statusCard: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    position: "relative",
  },
  statusHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  statusName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1d1d1f",
  },
  statusMessage: {
    fontSize: 12,
    color: "#8E8E93",
  },
  statusIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationsContainer: {
    backgroundColor: "white",
    marginTop: 8,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d1d1f",
  },
  notificationList: {
    gap: 16,
  },
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f7",
  },
  notificationInfo: {
    flex: 1,
  },
  notificationLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1d1d1f",
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: "#8E8E93",
  },
  modulesContainer: {
    backgroundColor: "white",
    marginTop: 8,
    padding: 20,
  },
  modulesGrid: {
    gap: 12,
  },
  moduleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 4,
  },
  moduleDescription: {
    fontSize: 14,
    color: "#8E8E93",
  },
  activitiesContainer: {
    backgroundColor: "white",
    marginTop: 8,
    padding: 20,
  },
  viewAllText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  activitiesList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityUser: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1d1d1f",
    marginBottom: 4,
  },
  activityAction: {
    fontSize: 14,
    color: "#8E8E93",
  },
  activityMeta: {
    alignItems: "flex-end",
  },
  activityTime: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionsContainer: {
    backgroundColor: "white",
    marginTop: 8,
    padding: 20,
    marginBottom: 32,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1d1d1f",
    marginTop: 8,
  },
});
