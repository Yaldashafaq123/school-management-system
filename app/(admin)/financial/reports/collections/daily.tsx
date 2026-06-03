import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PaymentItem {
  id: number;
  studentName: string;
  amount: number;
  paymentMethod: string;
}

export default function DailyCollectionsReport() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const response = await financeApi.getDailyCollections(selectedDate);
      if (response.success && response.data) {
        setPayments(response.data.payments || []);
        setTotalAmount(response.data.totalAmount || 0);
        // setTotalCount(response.data.totalCount || 0);
      } else {
        setPayments([]);
        setTotalAmount(0);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("Error loading daily collections:", error);
      setPayments([]);
      setTotalAmount(0);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "CASH": return "cash";
      case "BANK_TRANSFER": return "card";
      case "CARD": return "card-outline";
      case "CHECK": return "document-text";
      default: return "cash";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "CASH": return "نقدی";
      case "BANK_TRANSFER": return "انتقال بانکی";
      case "CARD": return "کارت";
      case "CHECK": return "چک";
      default: return method;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="گزارش دریافتی روزانه" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="گزارش دریافتی روزانه" showBack />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Date Picker */}
        <View style={styles.datePicker}>
          <Text style={styles.dateLabel}>تاریخ:</Text>
          <TextInput
            style={styles.dateInput}
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textSecondary}
            textAlign="center"
          />
          <TouchableOpacity style={styles.refreshBtn} onPress={loadData} activeOpacity={0.7}>
            <Ionicons name="refresh" size={18} color="white" />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderTopColor: Colors.success }]}>
            <Ionicons name="cash" size={22} color={Colors.success} />
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              {formatCurrency(totalAmount)}
            </Text>
            <Text style={styles.summaryLabel}>کل دریافتی</Text>
          </View>
          <View style={[styles.summaryCard, { borderTopColor: Colors.primary }]}>
            <Ionicons name="receipt" size={22} color={Colors.primary} />
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>
              {totalCount}
            </Text>
            <Text style={styles.summaryLabel}>تعداد پرداخت</Text>
          </View>
        </View>

        {/* Payments List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>پرداخت‌های ثبت شده</Text>
          
          {payments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cash-outline" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>هیچ پرداختی در این تاریخ ثبت نشده است</Text>
            </View>
          ) : (
            payments.map((payment) => (
              <View key={payment.id} style={styles.paymentItem}>
                <View style={styles.paymentHeader}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.avatarText}>{payment.studentName?.charAt(0) || "؟"}</Text>
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.studentName}>{payment.studentName}</Text>
                    <View style={styles.paymentMeta}>
                      <Ionicons name={getPaymentMethodIcon(payment.paymentMethod) as any} size={12} color={Colors.textSecondary} />
                      <Text style={styles.paymentMethod}>{getPaymentMethodLabel(payment.paymentMethod)}</Text>
                    </View>
                  </View>
                  <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  content: { flex: 1, padding: 16 },
  
  datePicker: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
  dateLabel: { fontSize: 14, color: Colors.text, fontFamily: "Vazirmatn" },
  dateInput: { flex: 1, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 14, color: Colors.text, fontFamily: "Vazirmatn" },
  refreshBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: Colors.primary, justifyContent: "center", alignItems: "center" },
  
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, padding: 14, alignItems: "center", borderTopWidth: 3, gap: 8 },
  summaryValue: { fontSize: 16, fontWeight: "bold", fontFamily: "Vazirmatn" },
  summaryLabel: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  
  section: { backgroundColor: Colors.card, borderRadius: 14, padding: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 12, textAlign: "right" },
  
  paymentItem: { borderBottomWidth: 1, borderBottomColor: Colors.border, paddingVertical: 10 },
  paymentHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  studentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: `${Colors.primary}15`, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 14, fontWeight: "bold", color: Colors.primary, fontFamily: "Vazirmatn" },
  paymentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: "500", color: Colors.text, fontFamily: "Vazirmatn", marginBottom: 2 },
  paymentMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  paymentMethod: { fontSize: 11, color: Colors.textSecondary, fontFamily: "Vazirmatn" },
  paymentAmount: { fontSize: 15, fontWeight: "bold", color: Colors.success, fontFamily: "Vazirmatn" },
  
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyText: { fontSize: 14, color: Colors.textSecondary, fontFamily: "Vazirmatn", marginTop: 12, textAlign: "center" },
});