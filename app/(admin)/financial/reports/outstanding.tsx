// app/(admin)/financial/reports/outstanding.tsx
import { EmptyState } from "@/components/finance/EmptyState";
import { ExportButton } from "@/components/finance/ExportButton";
import { FilterBar } from "@/components/finance/FilterBar";
import { FinanceCard } from "@/components/finance/FinanceCard";
import { OutstandingBadge } from "@/components/finance/OutstandingBadge";
import {
    financeApi,
    formatCurrency,
    OutstandingFee
} from "@/src/config/financeApi";
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

const AGING_FILTERS = [
  { key: "all", label: "همه", icon: "list-outline" },
  { key: "current", label: "جاری", icon: "time-outline" },
  { key: "30days", label: "۳۰ روز", icon: "alert-circle-outline" },
  { key: "60days", label: "۶۰ روز", icon: "warning-outline" },
  { key: "90days", label: "+۹۰ روز", icon: "flame-outline" },
];

export default function OutstandingReportScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [reportData, setReportData] = useState<any>(null);
  const [students, setStudents] = useState<OutstandingFee[]>([]);

  useEffect(() => {
    fetchOutstandingReport();
  }, []);

  const fetchOutstandingReport = async () => {
    try {
      const [feesRes, agingRes] = await Promise.all([
        financeApi.getOutstandingFees(),
        financeApi.getOutstandingAging(),
      ]);

      if (feesRes.success) {
        setStudents(feesRes.data.students || []);
        setReportData({
          ...feesRes.data,
          aging: agingRes.success ? agingRes.data : null,
        });
      }
    } catch (error) {
      console.error("Fetch outstanding error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (filter === "all") return true;
    // Filter by aging categories
    return true; // Placeholder - implement actual aging filter
  });

  const totalOutstanding = students.reduce((sum, s) => sum + s.totalBalance, 0);

  const renderStudent = ({
    item,
    index,
  }: {
    item: OutstandingFee;
    index: number;
  }) => (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() => router.push(`/financial/students/${item.studentId}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.rankSection}>
          <Text style={styles.rankNumber}>{index + 1}</Text>
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.studentName}</Text>
          <Text style={styles.studentClass}>
            {item.className || "بدون صنف"}
          </Text>
        </View>
        <View style={styles.amountSection}>
          <Text style={styles.totalBalance}>
            {formatCurrency(item.totalBalance)}
          </Text>
          <OutstandingBadge
            count={item.pendingItems?.length || 0}
            type="danger"
          />
        </View>
      </View>

      {/* Pending Items */}
      <View style={styles.pendingItems}>
        {item.pendingItems?.slice(0, 3).map((pending, idx) => (
          <View key={idx} style={styles.pendingItem}>
            <View
              style={[
                styles.pendingDot,
                {
                  backgroundColor:
                    pending.type === "monthly" ? "#f59e0b" : "#3b82f6",
                },
              ]}
            />
            <Text style={styles.pendingName} numberOfLines={1}>
              {pending.name}
              {pending.monthName ? ` - ${pending.monthName}` : ""}
            </Text>
            <Text style={styles.pendingAmount}>
              {formatCurrency(pending.balanceAmount)}
            </Text>
          </View>
        ))}
        {item.pendingItems?.length > 3 && (
          <Text style={styles.moreItems}>
            +{item.pendingItems.length - 3} مورد دیگر
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>بدهکارها</Text>
        <ExportButton reportType="outstanding" variant="icon" />
      </View>

      <View style={styles.content}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <FinanceCard
            title="کل بدهی"
            value={formatCurrency(totalOutstanding)}
            gradientColors={["#ef4444", "#dc2626"]}
            variant="compact"
            icon="alert-circle-outline"
          />
          <FinanceCard
            title="بدهکاران"
            value={`${students.length} نفر`}
            gradientColors={["#f59e0b", "#d97706"]}
            variant="compact"
            icon="people-outline"
          />
        </View>

        {/* Filter */}
        <View style={styles.filterContainer}>
          <FilterBar
            options={AGING_FILTERS}
            selected={filter}
            onSelect={setFilter}
          />
        </View>

        {/* Students List */}
        {filteredStudents.length === 0 ? (
          <EmptyState
            icon="checkmark-circle-outline"
            title="بدهکاری وجود ندارد"
            subtitle="همه شاگردان تسویه کرده‌اند"
          />
        ) : (
          <FlatList
            data={filteredStudents}
            renderItem={renderStudent}
            keyExtractor={(item) => item.studentId.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={fetchOutstandingReport}
              />
            }
          />
        )}
      </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  content: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: "row",
    padding: 12,
    marginHorizontal: 4,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    gap: 10,
  },
  studentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderRightWidth: 4,
    borderRightColor: "#ef4444",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  rankSection: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#fef2f2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ef4444",
    fontFamily: "VazirBold",
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  studentClass: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  amountSection: {
    alignItems: "flex-end",
  },
  totalBalance: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ef4444",
    fontFamily: "VazirBold",
    marginBottom: 4,
  },
  pendingItems: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 6,
  },
  pendingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pendingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pendingName: {
    flex: 1,
    fontSize: 12,
    color: "#475569",
    fontFamily: "Vazir",
  },
  pendingAmount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ef4444",
    fontFamily: "Vazir",
  },
  moreItems: {
    fontSize: 11,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
});
