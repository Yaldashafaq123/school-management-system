// app/(finance)/(tabs)/index.tsx
import { useAuth } from "@/contexts/AuthContext";
import {
    DashboardSummary,
    financeApi,
    formatCurrency,
} from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

const { width } = Dimensions.get("window");
const CARD_GAP = 12;
const CARD_WIDTH = (width - 48 - CARD_GAP) / 2;

// Quick action buttons
const QUICK_ACTIONS = [
  {
    id: "record-payment",
    title: "ثبت پرداخت",
    icon: "add-circle",
    iconPack: "Ionicons",
    route: "/(finance)/payments/record",
    color: "#10b981",
  },
  {
    id: "new-fee",
    title: "فیس جدید",
    icon: "create",
    iconPack: "Ionicons",
    route: "/(finance)/fees/create",
    color: "#3b82f6",
  },
  {
    id: "search-student",
    title: "جستجوی شاگرد",
    icon: "search",
    iconPack: "Ionicons",
    route: "/(finance)/students/search",
    color: "#f59e0b",
  },
  {
    id: "daily-report",
    title: "راپور روزانه",
    icon: "today",
    iconPack: "Ionicons",
    route: "/(finance)/reports/daily",
    color: "#8b5cf6",
  },
];

// Navigation items configuration
const FINANCE_SECTIONS = [
  {
    id: "fees",
    title: "فیس شاگردان",
    subtitle: "تعرفه و تخصیص فیس",
    icon: "school-outline",
    iconPack: "Ionicons",
    route: "/(finance)/fees",
    color: "#3b82f6",
    gradient: ["#3b82f6", "#2563eb"],
  },
  {
    id: "fees-assign",
    title: "تعیین فیس",
    subtitle: "تخصیص فیس به شاگردان",
    icon: "add-circle-outline",
    iconPack: "Ionicons",
    route: "/(finance)/fees/assign",
    color: "#8b5cf6",
    gradient: ["#8b5cf6", "#7c3aed"],
  },
  {
    id: "payments",
    title: "پرداخت‌ها",
    subtitle: "ثبت و تاریخچه پرداخت",
    icon: "wallet-outline",
    iconPack: "Ionicons",
    route: "/(finance)/payments",
    color: "#10b981",
    gradient: ["#10b981", "#059669"],
  },
  {
    id: "students",
    title: "شاگردان بدهکار",
    subtitle: "لیست بدهی شاگردان",
    icon: "people-outline",
    iconPack: "Ionicons",
    route: "/(finance)/students",
    color: "#f59e0b",
    gradient: ["#f59e0b", "#d97706"],
  },
  {
    id: "bulk",
    title: "پرداخت جمعی",
    subtitle: "وصول فیس صنف",
    icon: "people-circle-outline",
    iconPack: "Ionicons",
    route: "/(finance)/payments/bulk",
    color: "#8b5cf6",
    gradient: ["#8b5cf6", "#7c3aed"],
  },
  {
    id: "templates",
    title: "قالب‌های فیس",
    subtitle: "مدیریت قالب‌ها",
    icon: "copy-outline",
    iconPack: "Ionicons",
    route: "/(finance)/fees/templates",
    color: "#06b6d4",
    gradient: ["#06b6d4", "#0891b2"],
  },
  {
    id: "reports",
    title: "راپورها",
    subtitle: "گزارشات مالی",
    icon: "bar-chart-outline",
    iconPack: "Ionicons",
    route: "/(finance)/reports",
    color: "#ec4899",
    gradient: ["#ec4899", "#db2777"],
  },
  {
    id: "expenses",
    title: "مصارف",
    subtitle: "مدیریت هزینه‌ها",
    icon: "trending-down-outline",
    iconPack: "Ionicons",
    route: "/(finance)/expenses",
    color: "#ef4444",
    gradient: ["#ef4444", "#dc2626"],
  },
  {
    id: "salaries",
    title: "معاشات",
    subtitle: "پرداخت معاش اساتید",
    icon: "cash-outline",
    iconPack: "Ionicons",
    route: "/(finance)/salaries",
    color: "#f97316",
    gradient: ["#f97316", "#ea580c"],
  },
  {
    id: "academic-years",
    title: "سال تعلیمی",
    subtitle: "تنظیم سال تحصیلی",
    icon: "calendar-outline",
    iconPack: "Ionicons",
    route: "/(finance)/settings/academic-years",
    color: "#14b8a6",
    gradient: ["#14b8a6", "#0d9488"],
  },
];

export default function FinanceDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setError(null);
      const response = await financeApi.getDashboard();
      if (response.success) {
        setDashboard(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const renderIcon = (item: any, size: number = 28) => {
    const iconProps = {
      name: item.icon,
      size: size,
      color: "#fff",
    };
    return <Ionicons {...iconProps} />;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Finance Staff Info */}
        <View style={styles.welcomeCard}>
          <LinearGradient
            colors={["#3b82f6", "#2563eb"]}
            style={styles.welcomeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.welcomeContent}>
              <View>
                <Text style={styles.welcomeGreeting}>سلام 👋</Text>
                <Text style={styles.welcomeName}>
                  {user?.fullName || "کارمند مالی"}
                </Text>
                <Text style={styles.welcomeRole}>مدیریت مالی</Text>
              </View>
              <View style={styles.welcomeAvatar}>
                <Ionicons name="person" size={32} color="#3b82f6" />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchDashboard}>
              <Text style={styles.retryText}>تلاش مجدد</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Summary Cards */}
        {dashboard && (
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>خلاصه مالی</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <LinearGradient
                  colors={["#3b82f6", "#2563eb"]}
                  style={styles.summaryGradient}
                >
                  <Ionicons name="calendar" size={20} color="#fff" />
                  <Text style={styles.summaryLabel}>وصولی این ماه</Text>
                  <Text style={styles.summaryAmount}>
                    {formatCurrency(dashboard.monthlyCollection || 0)}
                  </Text>
                </LinearGradient>
              </View>

              <View style={styles.summaryCard}>
                <LinearGradient
                  colors={["#ef4444", "#dc2626"]}
                  style={styles.summaryGradient}
                >
                  <Ionicons name="alert-circle" size={20} color="#fff" />
                  <Text style={styles.summaryLabel}>باقیمانده</Text>
                  <Text style={styles.summaryAmount}>
                    {formatCurrency(dashboard.totalOutstanding || 0)}
                  </Text>
                </LinearGradient>
              </View>

              <View style={styles.summaryCard}>
                <LinearGradient
                  colors={["#10b981", "#059669"]}
                  style={styles.summaryGradient}
                >
                  <Ionicons name="document-text" size={20} color="#fff" />
                  <Text style={styles.summaryLabel}>فیس‌های فعال</Text>
                  <Text style={styles.summaryAmount}>
                    {dashboard.activeAssignments || 0}
                  </Text>
                </LinearGradient>
              </View>

              <View style={styles.summaryCard}>
                <LinearGradient
                  colors={["#8b5cf6", "#7c3aed"]}
                  style={styles.summaryGradient}
                >
                  <Ionicons name="layers" size={20} color="#fff" />
                  <Text style={styles.summaryLabel}>مجموع فیس‌ها</Text>
                  <Text style={styles.summaryAmount}>
                    {dashboard.totalAssignments || 0}
                  </Text>
                </LinearGradient>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>دسترسی سریع</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsScroll}
          >
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionButton}
                onPress={() => router.push(action.route as any)}
              >
                <View
                  style={[
                    styles.quickActionIcon,
                    { backgroundColor: action.color + "15" },
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color={action.color}
                  />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Navigation Grid */}
        <View style={styles.navigationContainer}>
          <Text style={styles.sectionTitle}>بخش‌های مالی</Text>
          <View style={styles.navigationGrid}>
            {FINANCE_SECTIONS.map((section) => (
              <TouchableOpacity
                key={section.id}
                style={styles.navCard}
                onPress={() => router.push(section.route as any)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={section.gradient as [string, string]}
                  style={styles.navCardGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.navIconContainer}>
                    <Ionicons
                      name={section.icon as any}
                      size={24}
                      color="#fff"
                    />
                  </View>
                  <View style={styles.navTextContainer}>
                    <Text style={styles.navTitle}>{section.title}</Text>
                    <Text style={styles.navSubtitle}>{section.subtitle}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="rgba(255,255,255,0.7)"
                    style={styles.navArrow}
                  />
                </LinearGradient>
              </TouchableOpacity>
            ))}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

  // Welcome Card
  welcomeCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  welcomeGradient: {
    padding: 20,
  },
  welcomeContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeGreeting: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Vazir",
  },
  welcomeName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "VazirBold",
  },
  welcomeRole: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  welcomeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  // Error
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    color: "#dc2626",
    fontSize: 14,
    fontFamily: "Vazir",
  },
  retryText: {
    color: "#3b82f6",
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "Vazir",
  },

  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },

  // Summary
  summaryContainer: {
    marginBottom: 20,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
  },
  summaryCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryGradient: {
    padding: 16,
    minHeight: 100,
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 8,
    fontFamily: "Vazir",
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginTop: 4,
    fontFamily: "VazirBold",
  },

  // Quick Actions
  quickActionsContainer: {
    marginBottom: 20,
  },
  quickActionsScroll: {
    gap: 12,
    paddingRight: 8,
  },
  quickActionButton: {
    alignItems: "center",
    width: 80,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: "#475569",
    textAlign: "center",
    fontFamily: "Vazir",
  },

  // Navigation
  navigationContainer: {
    marginBottom: 16,
  },
  navigationGrid: {
    gap: CARD_GAP,
  },
  navCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  navCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    minHeight: 80,
  },
  navIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  navTextContainer: {
    flex: 1,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "VazirBold",
  },
  navSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  navArrow: {
    marginLeft: 8,
  },
});
