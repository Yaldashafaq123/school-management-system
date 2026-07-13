// app/(finance)/(tabs)/transactions.tsx
import { financeApi, formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
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

type Transaction = {
  id: number;
  type: "income" | "expense";
  title: string;
  amount: number;
  date: string;
  category: string;
  studentName?: string;
};

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await financeApi.getPaymentHistory({ limit: 50 });
      if (response.success) {
        const payments = response.data.payments || [];
        const formatted: Transaction[] = payments.map((p: any) => ({
          id: p.id,
          type: p.type === "monthly" ? "income" : "income",
          title: p.feeTitle || "پرداخت فیس",
          amount: p.amount,
          date: p.date,
          category: "STUDENT_FEE",
          studentName: p.studentName,
        }));
        setTransactions(formatted);
      }
    } catch (error) {
      console.error("Transactions error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: item.type === "income" ? "#d1fae5" : "#fef3c7",
            },
          ]}
        >
          <Ionicons
            name={item.type === "income" ? "arrow-up" : "arrow-down"}
            size={20}
            color={item.type === "income" ? "#10b981" : "#f59e0b"}
          />
        </View>
        <View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>
            {item.studentName || item.category || "عمومی"}
          </Text>
          <Text style={styles.date}>
            {new Date(item.date).toLocaleDateString("fa-IR")}
          </Text>
        </View>
      </View>
      <Text
        style={[
          styles.amount,
          { color: item.type === "income" ? "#10b981" : "#ef4444" },
        ]}
      >
        {item.type === "income" ? "+" : "-"}
        {formatCurrency(item.amount)}
      </Text>
    </View>
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
      {/* Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity style={[styles.filterButton, styles.filterActive]}>
          <Text style={styles.filterText}>همه</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>عواید</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>مصارف</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>هیچ تراکنشی یافت نشد</Text>
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
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  filterActive: {
    backgroundColor: "#3b82f6",
  },
  filterText: {
    fontSize: 13,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  date: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "VazirBold",
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
