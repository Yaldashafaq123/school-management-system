// app/(parent)/(tabs)/fees.tsx
import { useAuth } from "@/contexts/AuthContext";
import {
  FeeSummary,
  Invoice,
  parentFeeApi,
  PaymentHistory,
} from "@/src/config/parentFeeApi";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Wallet,
} from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Currency symbol for Afghanistan (Afghani)
const CURRENCY = "؋";
const CURRENCY_NAME = "افغانی";

export default function FeeManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<FeeSummary | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, invoicesRes, historyRes] = await Promise.all([
        parentFeeApi.getFeeSummary(),
        parentFeeApi.getInvoices(),
        parentFeeApi.getPaymentHistory(),
      ]);

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
      if (invoicesRes.success && invoicesRes.data) {
        setInvoices(invoicesRes.data);
      }
      if (historyRes.success && historyRes.data) {
        setPaymentHistory(historyRes.data);
      }
    } catch (error) {
      console.error("Error loading fee data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleViewInvoice = (invoiceId: number) => {
    router.push(`/(parent)/fees/invoice/${invoiceId}`);
  };

  const handleDownloadInvoice = async (invoiceId: number) => {
    try {
      const response = await parentFeeApi.downloadInvoice(invoiceId);
      if (response.success && response.url) {
        Alert.alert("موفقیت", "فاکتور با موفقیت دانلود شد");
      } else {
        Alert.alert("خطا", "خطا در دانلود فاکتور");
      }
    } catch (error) {
      Alert.alert("خطا", "خطا در دانلود فاکتور");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle size={20} color="#10b981" />;
      case "pending":
        return <Clock size={20} color="#f59e0b" />;
      case "overdue":
        return <AlertTriangle size={20} color="#ef4444" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "overdue":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "پرداخت شده";
      case "pending":
        return "در انتظار";
      case "overdue":
        return "معوق";
      default:
        return status;
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("fa-AF") + " " + CURRENCY;
  };

  const pendingInvoices = invoices.filter((inv) => inv.status !== "paid");
  const totalDue = summary?.totalDue || 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3b82f6"]}
          />
        }
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Wallet size={24} color="#3b82f6" />
            <Text style={styles.summaryTitle}>خلاصه هزینه‌ها</Text>
          </View>
          <Text style={styles.totalAmount}>{formatAmount(totalDue)}</Text>
          <Text style={styles.totalLabel}>مجموع مبلغ معوق</Text>
          {summary && (
            <View style={styles.summaryDetails}>
              <View style={styles.summaryDetailItem}>
                <Text style={styles.summaryDetailValue}>
                  {formatAmount(summary.totalPaid)}
                </Text>
                <Text style={styles.summaryDetailLabel}>پرداخت شده</Text>
              </View>
              <View style={styles.summaryDetailItem}>
                <Text style={styles.summaryDetailValue}>
                  {summary.totalPending}
                </Text>
                <Text style={styles.summaryDetailLabel}>فاکتور در انتظار</Text>
              </View>
              <View style={styles.summaryDetailItem}>
                <Text style={[styles.summaryDetailValue, { color: "#ef4444" }]}>
                  {summary.overdueCount}
                </Text>
                <Text style={styles.summaryDetailLabel}>معوق</Text>
              </View>
            </View>
          )}
        </View>

        {/* Pending Invoices */}
        {pendingInvoices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>فاکتورهای معوق</Text>
            {pendingInvoices.map((invoice) => (
              <View key={invoice.id} style={styles.invoiceCard}>
                <View style={styles.invoiceHeader}>
                  <View style={styles.invoiceInfo}>
                    <Text style={styles.invoiceTitle}>{invoice.title}</Text>
                    <Text style={styles.invoiceAmount}>
                      {formatAmount(invoice.amount)}
                    </Text>
                  </View>
                  {getStatusIcon(invoice.status)}
                </View>
                <View style={styles.invoiceDetails}>
                  <Text style={styles.invoiceDate}>
                    موعد: {invoice.dueDate}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusColor(invoice.status) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(invoice.status) },
                      ]}
                    >
                      {getStatusText(invoice.status)}
                    </Text>
                  </View>
                </View>
                <View style={styles.invoiceActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleViewInvoice(invoice.id)}
                  >
                    <Eye size={16} color="#3b82f6" />
                    <Text style={styles.actionText}>مشاهده</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDownloadInvoice(invoice.id)}
                  >
                    <Download size={16} color="#10b981" />
                    <Text style={styles.actionText}>دانلود</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تاریخچه پرداخت‌ها</Text>
            {paymentHistory.map((payment) => (
              <View key={payment.id} style={styles.historyCard}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyDescription}>
                    {payment.description}
                  </Text>
                  <Text style={styles.historyDate}>{payment.date}</Text>
                  <Text style={styles.historyMethod}>{payment.method}</Text>
                </View>
                <View style={styles.historyAmount}>
                  <Text style={styles.amountText}>
                    {formatAmount(payment.amount)}
                  </Text>
                  <View style={styles.paidBadge}>
                    <Text style={styles.paidText}>پرداخت شده</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {invoices.length === 0 && (
          <View style={styles.emptyState}>
            <FileText size={60} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>هیچ فاکتوری یافت نشد</Text>
            <Text style={styles.emptyStateText}>
              برای فرزند شما هیچ فاکتوری ثبت نشده است
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() =>
              Alert.alert(
                "در حال توسعه",
                "دانلود همه فاکتورها به زودی اضافه می‌شود",
              )
            }
          >
            <Download size={24} color="#3b82f6" />
            <Text style={styles.quickActionText}>دانلود همه</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push("/(parent)/fees/history")}
          >
            <Eye size={24} color="#10b981" />
            <Text style={styles.quickActionText}>مشاهده رسیدها</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  summaryCard: {
    backgroundColor: "white",
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    textAlign: "right",
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
    textAlign: "center",
  },
  summaryDetails: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  summaryDetailItem: {
    alignItems: "center",
  },
  summaryDetailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  summaryDetailLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    textAlign: "right",
  },
  invoiceCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  invoiceInfo: {
    gap: 4,
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },
  invoiceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  invoiceDate: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "right",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  invoiceActions: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    flex: 1,
  },
  actionText: {
    fontSize: 13,
    color: "#374151",
    textAlign: "center",
  },
  historyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
  },
  historyInfo: {
    gap: 4,
    alignItems: "flex-end",
    flex: 2,
  },
  historyDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    textAlign: "right",
  },
  historyDate: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "right",
  },
  historyMethod: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "right",
  },
  historyAmount: {
    alignItems: "flex-end",
    gap: 4,
    flex: 1,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    textAlign: "right",
  },
  paidBadge: {
    backgroundColor: "#10b98120",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  paidText: {
    color: "#10b981",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  quickActions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    marginBottom: 20,
  },
  quickAction: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    backgroundColor: "white",
    margin: 20,
    borderRadius: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});
