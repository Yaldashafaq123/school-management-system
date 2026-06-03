import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import { StatCard } from "@/components/StatCard";
import { TransactionItem } from "@/components/TransactionItem";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Navigation Menu Item Type
interface QuickAction {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
  description?: string;
}

export default function FinancialDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);

  const loadDashboard = useCallback(async () => {
    try {
      const data = await financeApi.getDashboard();
      setDashboard(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری داشبورد پیش آمد");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const navigateTo = (route: string) => {
    router.push(route as any);
  };

  // =============================
  // QUICK ACTIONS - COMPLETE NAVIGATION
  // =============================

  const paymentActions: QuickAction[] = [
    {
      title: "ثبت پرداخت",
      icon: "cash",
      route: "/(admin)/financial/fees/collections/single",
      color: Colors.success,
      description: "ثبت پرداخت شهریه دانش‌آموز",
    },
    {
      title: "پرداخت گروهی",
      icon: "people",
      route: "/(admin)/financial/fees/collections/bulk",
      color: Colors.success,
      description: "ثبت پرداخت برای یک صنف کامل",
    },
    {
      title: "پرداخت سریع",
      icon: "flash",
      route: "/(admin)/financial/fees/collections/quick",
      color: Colors.info,
      description: "پرداخت سریع با حداقل اطلاعات",
    },
  ];

  const feeManagementActions: QuickAction[] = [
    {
      title: "همه شهریه‌ها",
      icon: "list",
      route: "/(admin)/financial/fees",
      color: Colors.primary,
      description: "مشاهده تمام شهریه‌های ثبت شده",
    },
    {
      title: "فیس‌های معوقه",
      icon: "alert-circle",
      route: "/(admin)/financial/outstanding",
      color: Colors.danger,
      description: "شهریه‌های پرداخت نشده",
    },
    {
      title: "تاریخچه پرداخت",
      icon: "time",
      route: "/(admin)/financial/fees/history",
      color: Colors.primary,
      description: "مشاهده تاریخچه تمام پرداخت‌ها",
    },
    {
      title: "قالب‌های شهریه",
      icon: "grid",
      route: "/(admin)/financial/fees/templates",
      color: Colors.info,
      description: "مدیریت قالب‌های شهریه",
    },
    {
      title: "ایجاد قالب جدید",
      icon: "add-circle",
      route: "/(admin)/financial/fees/templates/create",
      color: Colors.primary,
      description: "تعریف قالب شهریه جدید",
    },
    {
      title: "تخصیص قالب",
      icon: "people",
      route: "/(admin)/financial/fees/templates/assign",
      color: Colors.warning,
      description: "تخصیص قالب به دانش‌آموزان",
    },
  ];

  const studentActions: QuickAction[] = [
    {
      title: "لیست دانش‌آموزان",
      icon: "school",
      route: "/(admin)/financial/users/students",
      color: Colors.primary,
      description: "مشاهده تمام دانش‌آموزان",
    },
    {
      title: "افزودن دانش‌آموز",
      icon: "person-add",
      route: "/(admin)/financial/users/students/create",
      color: Colors.success,
      description: "ثبت دانش‌آموز جدید",
    },
    {
      title: "شهریه دانش‌آموزان",
      icon: "document-text",
      route: "/(admin)/financial/fees/students",
      color: Colors.info,
      description: "مشاهده شهریه هر دانش‌آموز",
    },
  ];

  const expenseActions: QuickAction[] = [
    {
      title: "همه هزینه‌ها",
      icon: "receipt",
      route: "/(admin)/financial/expenses",
      color: Colors.danger,
      description: "مشاهده تمام هزینه‌ها",
    },
    {
      title: "ثبت هزینه جدید",
      icon: "add-circle",
      route: "/(admin)/financial/expenses/create",
      color: Colors.danger,
      description: "ثبت هزینه جدید",
    },
    {
      title: "دسته‌بندی هزینه‌ها",
      icon: "pricetags",
      route: "/(admin)/financial/expenses/categories",
      color: Colors.warning,
      description: "مدیریت دسته‌بندی هزینه‌ها",
    },
  ];

  const salaryActions: QuickAction[] = [
    {
      title: "همه معاشات",
      icon: "wallet",
      route: "/(admin)/financial/salaries",
      color: Colors.warning,
      description: "مشاهده تمام معاشات",
    },
    {
      title: "پرداخت معاش",
      icon: "card",
      route: "/(admin)/financial/salaries/payments/record",
      color: Colors.success,
      description: "ثبت پرداخت معاش معلم",
    },
    {
      title: "تولید معاش ماهانه",
      icon: "calendar",
      route: "/(admin)/financial/salaries/generate",
      color: Colors.primary,
      description: "تولید معاش برای ماه جاری",
    },
    {
      title: "معاش معلمان",
      icon: "people",
      route: "/(admin)/financial/salaries/teachers",
      color: Colors.info,
      description: "مشاهده معاش هر معلم",
    },
  ];

  const reportActions: QuickAction[] = [
    {
      title: "گزارشات مالی",
      icon: "stats-chart",
      route: "/(admin)/financial/reports",
      color: Colors.primary,
      description: "مشاهده تمام گزارشات",
    },
    {
      title: "صورت درآمد",
      icon: "trending-up",
      route: "/(admin)/financial/reports/income-statement",
      color: Colors.success,
      description: "گزارش درآمد و هزینه",
    },
    {
      title: "جریان نقدی",
      icon: "swap-horizontal",
      route: "/(admin)/financial/reports/cash-flow",
      color: Colors.info,
      description: "گزارش جریان نقدینگی",
    },
    {
      title: "وصول روزانه",
      icon: "today",
      route: "/(admin)/financial/reports/collections/daily",
      color: Colors.success,
      description: "گزارش وصولی‌های امروز",
    },
    {
      title: "وصول ماهانه",
      icon: "calendar",
      route: "/(admin)/financial/reports/collections/monthly",
      color: Colors.primary,
      description: "گزارش وصولی‌های ماهانه",
    },
    {
      title: "وصول به تفکیک صنف",
      icon: "school",
      route: "/(admin)/financial/reports/collections/by-class",
      color: Colors.warning,
      description: "گزارش وصولی هر صنف",
    },
    {
      title: "گزارش معوقات",
      icon: "alert-circle",
      route: "/(admin)/financial/reports/outstanding",
      color: Colors.danger,
      description: "گزارش شهریه‌های معوقه",
    },
    {
      title: "گزارش قدمت معوقات",
      icon: "time",
      route: "/(admin)/financial/reports/outstanding/aging",
      color: Colors.warning,
      description: "قدمت شهریه‌های معوقه",
    },
    {
      title: "خروجی گزارش",
      icon: "download",
      route: "/(admin)/financial/reports/exports",
      color: Colors.info,
      description: "دانلود گزارشات",
    },
  ];

  const userActions: QuickAction[] = [
    {
      title: "همه کاربران",
      icon: "people",
      route: "/(admin)/financial/users",
      color: Colors.primary,
      description: "مشاهده تمام کاربران",
    },
    {
      title: "والدین",
      icon: "home",
      route: "/(admin)/financial/users/parents",
      color: Colors.info,
      description: "مدیریت والدین",
    },
    {
      title: "معلمان",
      icon: "briefcase",
      route: "/(admin)/financial/users/teachers",
      color: Colors.warning,
      description: "مدیریت معلمان",
    },
  ];

  // =============================
  // DATA PROCESSING
  // =============================

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  const summary = dashboard?.summary || {
    totalIncome: 0,
    monthlyIncome: 0,
    yearlyIncome: 0,
    pendingFees: 0,
    pendingFeesCount: 0,
    totalExpenses: 0,
    monthlyExpenses: 0,
    yearlyExpenses: 0,
    pendingSalaries: 0,
    totalStudents: 0,
    netProfit: 0,
    monthlyProfit: 0,
  };

  const recentPayments = dashboard?.recentPayments || [];
  const recentExpenses = dashboard?.recentExpenses || [];

  const totalIncome = summary.totalIncome || 0;
  const monthlyIncome = summary.monthlyIncome || 0;
  const monthlyExpenses = summary.monthlyExpenses || 0;
  const pendingFees = summary.pendingFees || 0;
  const pendingSalaries = summary.pendingSalaries || 0;
  const netProfit = summary.netProfit || totalIncome - (summary.totalExpenses || 0);
  const monthlyProfit = summary.monthlyProfit || monthlyIncome - monthlyExpenses;
  const pendingFeesCount = summary.pendingFeesCount || 0;
  const totalStudents = summary.totalStudents || 0;
  const collectionRate = totalStudents > 0
    ? Math.round(((totalStudents - pendingFeesCount) / totalStudents) * 100)
    : 0;

  const recentTransactions = [
    ...recentPayments.map((p: any) => ({
      id: `p-${p.id}`,
      description: p.feeTitle || p.studentName || "پرداخت",
      amount: p.amount,
      date: p.date,
      type: "INCOME" as const,
      category: "فیس",
    })),
    ...recentExpenses.map((e: any) => ({
      id: `e-${e.id}`,
      description: e.description || "هزینه",
      amount: e.amount,
      date: e.date,
      type: "EXPENSE" as const,
      category: e.category || "سایر",
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const overdueFees = recentPayments.filter((p: any) => p.status === "OVERDUE").length;
  const unpaidSalaries = pendingSalaries > 0 ? 1 : 0;

  // Render a single action button
  const renderActionButton = (action: QuickAction, index: number) => (
    <TouchableOpacity
      key={`${action.route}-${index}`}
      style={styles.actionCard}
      onPress={() => navigateTo(action.route)}
      activeOpacity={0.7}
    >
      <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
        <Ionicons name={action.icon} size={22} color={action.color} />
      </View>
      <View style={styles.actionInfo}>
        <Text style={styles.actionTitle} numberOfLines={1}>
          {action.title}
        </Text>
        {action.description && (
          <Text style={styles.actionDescription} numberOfLines={2}>
            {action.description}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  // Render a section with title and action buttons
  const renderSection = (title: string, icon: keyof typeof Ionicons.glyphMap, actions: QuickAction[]) => (
    <View style={styles.menuSection}>
      <View style={styles.menuSectionHeader}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
        <Text style={styles.menuSectionTitle}>{title}</Text>
      </View>
      <View style={styles.menuItems}>
        {actions.map((action, index) => renderActionButton(action, index))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* ============================= */}
        {/* STATS SECTION */}
        {/* ============================= */}
        <Text style={styles.sectionTitle}>خلاصه مالی</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="درآمد ماه جاری"
            value={formatCurrency(monthlyIncome)}
            icon="calendar"
            color={Colors.success}
            onPress={() => navigateTo("/(admin)/financial/reports/income-statement")}
          />
          <StatCard
            title="هزینه ماه جاری"
            value={formatCurrency(monthlyExpenses)}
            icon="receipt"
            color={Colors.danger}
            onPress={() => navigateTo("/(admin)/financial/expenses")}
          />
          <StatCard
            title="سود خالص ماه"
            value={formatCurrency(monthlyProfit)}
            icon="stats-chart"
            color={monthlyProfit >= 0 ? Colors.success : Colors.danger}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="کل درآمد"
            value={formatCurrency(totalIncome)}
            icon="trending-up"
            color={Colors.primary}
          />
          <StatCard
            title="کل هزینه‌ها"
            value={formatCurrency(summary.totalExpenses || 0)}
            icon="trending-down"
            color={Colors.warning}
          />
          <StatCard
            title="نرخ وصول"
            value={`${collectionRate}%`}
            icon="checkmark-circle"
            color={collectionRate >= 70 ? Colors.success : Colors.warning}
          />
        </View>

        {/* Pending Summary */}
        <View style={styles.pendingContainer}>
          <TouchableOpacity
            style={styles.pendingCard}
            onPress={() => navigateTo("/(admin)/financial/outstanding")}
          >
            <Text style={styles.pendingLabel}>فیس‌های معوقه</Text>
            <Text style={[styles.pendingValue, { color: Colors.danger }]}>
              {formatCurrency(pendingFees)}
            </Text>
            {pendingFeesCount > 0 && (
              <Text style={styles.pendingSubtext}>{pendingFeesCount} فقره در انتظار پرداخت</Text>
            )}
          </TouchableOpacity>
          <View style={styles.pendingDivider} />
          <TouchableOpacity
            style={styles.pendingCard}
            onPress={() => navigateTo("/(admin)/financial/salaries")}
          >
            <Text style={styles.pendingLabel}>معاشات پرداخت نشده</Text>
            <Text style={[styles.pendingValue, { color: Colors.warning }]}>
              {formatCurrency(pendingSalaries)}
            </Text>
            {unpaidSalaries > 0 && (
              <Text style={styles.pendingSubtext}>معاشات در انتظار پرداخت</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ============================= */}
        {/* QUICK ACTIONS - PAYMENTS */}
        {/* ============================= */}
        {renderSection("پرداخت‌ها", "cash", paymentActions)}

        {/* ============================= */}
        {/* FEE MANAGEMENT */}
        {/* ============================= */}
        {renderSection("مدیریت شهریه", "document-text", feeManagementActions)}

        {/* ============================= */}
        {/* STUDENTS */}
        {/* ============================= */}
        {renderSection("دانش‌آموزان", "school", studentActions)}

        {/* ============================= */}
        {/* EXPENSES */}
        {/* ============================= */}
        {renderSection("هزینه‌ها", "receipt", expenseActions)}

        {/* ============================= */}
        {/* SALARIES */}
        {/* ============================= */}
        {renderSection("معاشات", "wallet", salaryActions)}

        {/* ============================= */}
        {/* REPORTS */}
        {/* ============================= */}
        {renderSection("گزارشات", "stats-chart", reportActions)}

        {/* ============================= */}
        {/* USER MANAGEMENT */}
        {/* ============================= */}
        {renderSection("مدیریت کاربران", "people", userActions)}

        {/* ============================= */}
        {/* RECENT TRANSACTIONS */}
        {/* ============================= */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>تراکنش‌های اخیر</Text>
            <TouchableOpacity onPress={() => navigateTo("/(admin)/financial/fees/history")}>
              <Text style={styles.seeAllText}>مشاهده همه</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cash-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>تراکنشی ثبت نشده است</Text>
            </View>
          ) : (
            recentTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                id={typeof transaction.id === "string" ? parseInt(transaction.id.replace(/[^0-9]/g, "")) || 0 : transaction.id}
                title={transaction.description}
                amount={transaction.amount}
                date={transaction.date}
                type={transaction.type}
                category={transaction.category}
              />
            ))
          )}
        </View>

        {/* Alerts Section */}
        {(overdueFees > 0 || unpaidSalaries > 0) && (
          <View style={styles.alertsContainer}>
            <Text style={styles.alertsTitle}>هشدارها</Text>
            {overdueFees > 0 && (
              <TouchableOpacity
                style={styles.alertItem}
                onPress={() => navigateTo("/(admin)/financial/outstanding")}
              >
                <Ionicons name="alert-circle" size={20} color={Colors.danger} />
                <Text style={styles.alertText}>{overdueFees} دانش‌آموز شهریه معوقه دارند</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
            {unpaidSalaries > 0 && (
              <TouchableOpacity
                style={styles.alertItem}
                onPress={() => navigateTo("/(admin)/financial/salaries")}
              >
                <Ionicons name="warning" size={20} color={Colors.warning} />
                <Text style={styles.alertText}>معاشات پرداخت نشده وجود دارد</Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 20 }} />
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
    padding: 16,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  pendingContainer: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  pendingCard: {
    flex: 1,
    alignItems: "center",
  },
  pendingDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  pendingLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    marginBottom: 4,
  },
  pendingValue: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Vazirmatn",
    marginBottom: 2,
  },
  pendingSubtext: {
    fontSize: 9,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },

  // Menu Sections
  menuSection: {
    marginBottom: 20,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuSectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.text,
    fontFamily: "Vazirmatn",
  },
  menuItems: {
    gap: 6,
  },

  // Action Button
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 13,
    color: Colors.primary,
    fontFamily: "Vazirmatn",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: Colors.card,
    borderRadius: 14,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    marginTop: 10,
  },

  // Alerts
  alertsContainer: {
    backgroundColor: `${Colors.warning}10`,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  alertsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    marginBottom: 10,
    textAlign: "right",
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: `${Colors.border}50`,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    fontFamily: "Vazirmatn",
    textAlign: "right",
  },
});