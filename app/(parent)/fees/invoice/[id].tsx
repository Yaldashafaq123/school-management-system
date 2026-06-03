// app/(parent)/fees/invoice/[id].tsx
import { parentFeeApi, Invoice } from "@/src/config/parentFeeApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Wallet,
} from "lucide-react-native";

const CURRENCY = "؋";

export default function InvoiceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const loadInvoice = useCallback(async () => {
    try {
      setLoading(true);
      const response = await parentFeeApi.getInvoiceDetails(Number(id));
      if (response.success && response.data) {
        setInvoice(response.data);
      }
    } catch (err) {
      console.error("Error loading invoice:", err);
      Alert.alert("خطا", "مشکلی در بارگذاری فاکتور پیش آمد");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const handleDownload = async () => {
    try {
      const response = await parentFeeApi.downloadInvoice(Number(id));
      if (response.success && response.url) {
        Alert.alert("موفقیت", "فاکتور با موفقیت دانلود شد");
      } else {
        Alert.alert("خطا", "خطا در دانلود فاکتور");
      }
    } catch (err) {
      Alert.alert("خطا", "خطا در دانلود فاکتور");
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("fa-AF") + " " + CURRENCY;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle size={24} color="#10b981" />;
      case "pending":
        return <Clock size={24} color="#f59e0b" />;
      case "overdue":
        return <AlertTriangle size={24} color="#ef4444" />;
      default:
        return null;
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

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>در حال بارگذاری...</Text>
      </SafeAreaView>
    );
  }

  if (!invoice) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <FileText size={60} color="#9ca3af" />
          <Text style={styles.errorTitle}>فاکتور یافت نشد</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>بازگشت</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>جزئیات فاکتور</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>بستن</Text>
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View
          style={[
            styles.statusCard,
            { backgroundColor: getStatusColor(invoice.status) + "10" },
          ]}
        >
          {getStatusIcon(invoice.status)}
          <Text style={[styles.statusText, { color: getStatusColor(invoice.status) }]}>
            {getStatusText(invoice.status)}
          </Text>
        </View>

        {/* Invoice Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>عنوان فاکتور:</Text>
            <Text style={styles.infoValue}>{invoice.title}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>مبلغ:</Text>
            <Text style={styles.infoValueAmount}>{formatAmount(invoice.amount)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>تاریخ سررسید:</Text>
            <View style={styles.infoValueWithIcon}>
              <Calendar size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{invoice.dueDate}</Text>
            </View>
          </View>

          {invoice.date && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>تاریخ پرداخت:</Text>
              <Text style={styles.infoValue}>{invoice.date}</Text>
            </View>
          )}

          {invoice.studentName && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>نام دانش‌آموز:</Text>
              <Text style={styles.infoValue}>{invoice.studentName}</Text>
            </View>
          )}
        </View>

        {/* Download Button */}
        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
          <Download size={20} color="#fff" />
          <Text style={styles.downloadButtonText}>دانلود فاکتور</Text>
        </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeButtonText: {
    fontSize: 14,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 12,
    gap: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  infoValueAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  infoValueWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3b82f6",
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  downloadButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});