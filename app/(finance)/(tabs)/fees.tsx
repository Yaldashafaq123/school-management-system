// app/(finance)/(tabs)/fees.tsx
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type FeeItem = {
  id: number;
  studentName: string;
  className: string;
  amount: number;
  paid: number;
  balance: number;
  status: string;
  dueDate: string;
};

export default function FeesScreen() {
  const router = useRouter();
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const response = await financeApi.getFeeAssignments();
      if (response.success) {
        // Transform data
        const formatted = response.data.map((item: any) => ({
          id: item.id,
          studentName: item.student?.user?.fullName || "نامشخص",
          className: item.student?.class?.name || "بدون صنف",
          amount: item.totalAmount || 0,
          paid: item.totalPaid || 0,
          balance: item.totalBalance || 0,
          status: item.status,
          dueDate: item.createdAt,
        }));
        setFees(formatted);
      }
    } catch (error) {
      console.error("Error fetching fees:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFees();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "#3b82f6";
      case "COMPLETED":
        return "#10b981";
      case "CANCELLED":
        return "#ef4444";
      default:
        return "#94a3b8";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "فعال";
      case "COMPLETED":
        return "تکمیل";
      case "CANCELLED":
        return "لغو";
      default:
        return status;
    }
  };

  const renderFeeItem = ({ item }: { item: FeeItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(finance)/fees/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.studentName}>{item.studentName}</Text>
          <Text style={styles.className}>{item.className}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "15" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>مجموع</Text>
          <Text style={styles.amountValue}>{formatCurrency(item.amount)}</Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>پرداخت شده</Text>
          <Text style={[styles.amountValue, { color: "#10b981" }]}>
            {formatCurrency(item.paid)}
          </Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>باقیمانده</Text>
          <Text
            style={[
              styles.amountValue,
              { color: item.balance > 0 ? "#ef4444" : "#10b981" },
            ]}
          >
            {formatCurrency(item.balance)}
          </Text>
        </View>
      </View>

      {item.balance > 0 && (
        <TouchableOpacity
          style={styles.payButton}
          onPress={() =>
            router.push(`/(finance)/payments/record?feeId=${item.id}`)
          }
        >
          <Ionicons name="wallet-outline" size={16} color="#fff" />
          <Text style={styles.payButtonText}>ثبت پرداخت</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={fees}
        renderItem={renderFeeItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>هیچ فیس پیدا نشد</Text>
          </View>
        }
      />
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
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  className: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  amountItem: {
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
    fontFamily: "VazirBold",
    color: "#1e293b",
  },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
    gap: 8,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
});
