// app/(parent)/fees/history.tsx
import { parentFeeApi, PaymentHistory } from "@/src/config/parentFeeApi";
import { useRouter } from "expo-router";
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
import { CheckCircle, Download, FileText } from "lucide-react-native";

const CURRENCY = "؋";

export default function PaymentHistoryScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await parentFeeApi.getPaymentHistory(undefined, 50);
      if (response.success && response.data) {
        setPayments(response.data);
      }
    } catch (err) {
      console.error("Error loading payment history:", err);
      Alert.alert("خطا", "مشکلی در بارگذاری تاریخچه پرداخت پیش آمد");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("fa-AF") + " " + CURRENCY;
  };

  const formatDate = (dateString: string) => {
    return dateString;
  };

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>بازگشت</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تاریخچه پرداخت‌ها</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#3b82f6"]}
          />
        }
      >
        {payments.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={60} color="#9ca3af" />
            <Text style={styles.emptyStateTitle}>هیچ پرداختی یافت نشد</Text>
            <Text style={styles.emptyStateText}>
              شما هنوز هیچ پرداختی انجام نداده‌اید
            </Text>
          </View>
        ) : (
          <View style={styles.paymentsList}>
            {payments.map((payment) => (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentIcon}>
                    <CheckCircle size={24} color="#10b981" />
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentDescription}>
                      {payment.description}
                    </Text>
                    <Text style={styles.paymentDate}>
                      {formatDate(payment.date)}
                    </Text>
                  </View>
                </View>

                <View style={styles.paymentDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>مبلغ:</Text>
                    <Text style={styles.detailValueAmount}>
                      {formatAmount(payment.amount)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>روش پرداخت:</Text>
                    <Text style={styles.detailValue}>{payment.method}</Text>
                  </View>

                  {payment.transactionId && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>شماره تراکنش:</Text>
                      <Text style={styles.detailValue}>{payment.transactionId}</Text>
                    </View>
                  )}

                  {payment.receiptUrl && (
                    <TouchableOpacity style={styles.receiptButton}>
                      <Download size={16} color="#3b82f6" />
                      <Text style={styles.receiptButtonText}>دانلود رسید</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: "#3b82f6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    margin: 20,
    backgroundColor: "white",
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
  paymentsList: {
    padding: 16,
    gap: 16,
  },
  paymentCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#10b98120",
    justifyContent: "center",
    alignItems: "center",
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },
  paymentDate: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "right",
  },
  paymentDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
  },
  detailValueAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  receiptButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  receiptButtonText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "500",
  },
});