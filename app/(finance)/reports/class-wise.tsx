// app/(admin)/financial/reports/class-wise.tsx
import { CollectionProgress } from "@/components/finance/CollectionProgress";
import { EmptyState } from "@/components/finance/EmptyState";
import { ExportButton } from "@/components/finance/ExportButton";
import { FinanceCard } from "@/components/finance/FinanceCard";
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

export default function ClassWiseReportScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classesData, setClassesData] = useState<any[]>([]);
  const [totals, setTotals] = useState({ expected: 0, collected: 0 });

  useEffect(() => {
    fetchClassWiseReport();
  }, []);

  const fetchClassWiseReport = async () => {
    try {
      const response = await financeApi.getCollectionByClass();
      if (response.success) {
        setClassesData(response.data || []);

        // Calculate totals
        let totalExpected = 0;
        let totalCollected = 0;
        (response.data || []).forEach((cls: any) => {
          totalExpected += cls.expected || 0;
          totalCollected += cls.collected || 0;
        });
        setTotals({ expected: totalExpected, collected: totalCollected });
      }
    } catch (error) {
      console.error("Fetch class-wise error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderClass = ({ item, index }: { item: any; index: number }) => {
    const percentage =
      item.expected > 0
        ? Math.round((item.collected / item.expected) * 100)
        : 0;

    return (
      <TouchableOpacity
        style={styles.classCard}
        onPress={() => router.push(`../payments/bulk/${item.classId}`)}
      >
        <View style={styles.classHeader}>
          <View style={styles.classRank}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <View style={styles.classInfo}>
            <Text style={styles.className}>
              {item.className || `صنف ${item.classId}`}
            </Text>
            <Text style={styles.studentCount}>
              {item.studentCount || 0} شاگرد
            </Text>
          </View>
          <View
            style={[
              styles.rateBadge,
              {
                backgroundColor:
                  percentage >= 80
                    ? "#d1fae5"
                    : percentage >= 50
                      ? "#fef3c7"
                      : "#fecaca",
              },
            ]}
          >
            <Text
              style={[
                styles.rateText,
                {
                  color:
                    percentage >= 80
                      ? "#059669"
                      : percentage >= 50
                        ? "#d97706"
                        : "#dc2626",
                },
              ]}
            >
              {percentage}%
            </Text>
          </View>
        </View>

        <CollectionProgress
          collected={item.collected || 0}
          total={item.expected || 0}
          size="small"
          showAmounts={true}
        />

        <View style={styles.classActions}>
          <TouchableOpacity
            style={styles.classActionBtn}
            onPress={() =>
              router.push(`../payments/bulk/${item.classId}`)
            }
          >
            <Ionicons name="wallet-outline" size={16} color="#8b5cf6" />
            <Text style={styles.classActionText}>پرداخت جمعی</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.classActionBtn}
            onPress={() =>
              router.push(`../students?classId=${item.classId}`)
            }
          >
            <Ionicons name="people-outline" size={16} color="#3b82f6" />
            <Text style={styles.classActionText}>شاگردان</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
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
        <Text style={styles.title}>راپور صنف‌ها</Text>
        <ExportButton reportType="class-wise" variant="icon" />
      </View>

      {/* Overall Summary */}
      <View style={styles.overallSummary}>
        <FinanceCard
          title="کل وصولی"
          value={formatCurrency(totals.collected)}
          gradientColors={["#10b981", "#059669"]}
          variant="compact"
          icon="checkmark-circle-outline"
        />
        <FinanceCard
          title="کل مورد انتظار"
          value={formatCurrency(totals.expected)}
          gradientColors={["#3b82f6", "#2563eb"]}
          variant="compact"
          icon="trending-up-outline"
        />
      </View>

      {/* Overall Progress */}
      <View style={styles.overallProgress}>
        <CollectionProgress
          collected={totals.collected}
          total={totals.expected || 1}
          size="large"
          label="نرخ وصول کلی"
        />
      </View>

      {/* Class List */}
      {classesData.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="داده‌ای موجود نیست"
          subtitle="هنوز هیچ پرداختی ثبت نشده"
        />
      ) : (
        <FlatList
          data={classesData}
          renderItem={renderClass}
          keyExtractor={(item, index) =>
            item.classId?.toString() || index.toString()
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchClassWiseReport}
            />
          }
        />
      )}
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
  overallSummary: {
    flexDirection: "row",
    padding: 12,
    marginHorizontal: 4,
  },
  overallProgress: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    gap: 10,
  },
  classCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  classHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  classRank: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
    fontFamily: "VazirBold",
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  studentCount: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  rateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rateText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  classActions: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 8,
  },
  classActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    gap: 6,
  },
  classActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    fontFamily: "Vazir",
  },
});
