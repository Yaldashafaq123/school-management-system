// components/discipline/MyDisciplineReports.tsx
import { Colors } from "@/constants/Colors";
import { disciplineApi } from "@/src/config/disciplineApi";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const statusFa: Record<string, { label: string; color: string }> = {
  PENDING: { label: "در انتظار بررسی", color: "#F59E0B" },
  UNDER_REVIEW: { label: "در حال بررسی", color: "#3B82F6" },
  APPROVED: { label: "تأیید شده", color: "#10B981" },
  REJECTED: { label: "رد شده", color: "#EF4444" },
  APPEALED: { label: "تجدیدنظر", color: "#8B5CF6" },
  RESOLVED: { label: "حل شده", color: "#10B981" },
};

const severityFa: Record<string, { label: string; color: string }> = {
  MINOR: { label: "جزئی", color: "#F59E0B" },
  MODERATE: { label: "متوسط", color: "#3B82F6" },
  MAJOR: { label: "مهم", color: "#EF4444" },
  CRITICAL: { label: "بحرانی", color: "#DC2626" },
};

export default function MyDisciplineReports({
  refreshKey,
}: {
  refreshKey?: number;
}) {
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(async () => {
    console.log("═══════════════════════════════════════");
    console.log("🔄 [MyReports] load() START, filter =", filter);
    try {
      const params: any = { limit: 50 };
      if (filter !== "all") params.status = filter;

      console.log("📦 [MyReports] params:", params);
      console.log("⏳ [MyReports] Calling disciplineApi.getMyReports()...");

      const res = await disciplineApi.getMyReports(params);

      console.log("✅ [MyReports] Response received");
      console.log("✅ [MyReports] res.success =", res?.success);
      console.log(
        "✅ [MyReports] res.data.records length =",
        res?.data?.records?.length,
      );
      console.log("✅ [MyReports] res.data.stats =", res?.data?.stats);

      if (res.success) {
        setRecords(res.data.records || []);
        setStats(res.data.stats || null);
      }
    } catch (e: any) {
      console.error("❌ [MyReports] load FAILED:", e?.message);
      console.error("❌ [MyReports] Full error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log("🏁 [MyReports] load() END");
    }
  }, [filter]);

  useEffect(() => {
    console.log("🔵 [MyReports] useEffect, refreshKey =", refreshKey);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    load();
  }, [load, refreshKey]);

  const onRefresh = () => {
    console.log("🔄 [MyReports] Pull to refresh");
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ color: Colors.textSecondary, marginTop: 12 }}>
          در حال بارگذاری...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.filters}>
        {[
          { key: "all", label: "همه" },
          { key: "PENDING", label: "در انتظار" },
          { key: "APPROVED", label: "تأیید شده" },
          { key: "REJECTED", label: "رد شده" },
        ].map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => {
                console.log("🖱️ [MyReports] Filter changed to:", f.key);
                setFilter(f.key);
              }}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active && { color: "#fff", fontWeight: "700" },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {stats && (
        <View style={styles.statsRow}>
          <StatBox label="کل" value={stats.total} color={Colors.primary} />
          <StatBox label="در انتظار" value={stats.pending} color="#F59E0B" />
          <StatBox label="تأیید" value={stats.approved} color="#10B981" />
          <StatBox label="رد" value={stats.rejected} color="#EF4444" />
        </View>
      )}

      <FlatList
        data={records}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 12, paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="folder-open-outline"
              size={60}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyText}>هیچ تخلفی ثبت نشده است</Text>
          </View>
        }
        renderItem={({ item }) => {
          const sev = severityFa[item.severity] || severityFa.MINOR;
          const st = statusFa[item.status] || statusFa.PENDING;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.studentName}>{item.studentName}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${st.color}20` },
                  ]}
                >
                  <Text style={[styles.statusBadgeText, { color: st.color }]}>
                    {st.label}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 6,
                }}
              >
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: `${sev.color}20` },
                  ]}
                >
                  <Text
                    style={[styles.severityBadgeText, { color: sev.color }]}
                  >
                    {sev.label}
                  </Text>
                </View>
                <Text style={styles.violationText}>{item.violationName}</Text>
              </View>

              {item.categoryName && (
                <Text style={styles.categoryText}>
                  دسته: {item.categoryName}
                </Text>
              )}

              {item.className && (
                <Text style={styles.classText}>
                  صنف: {item.className} {item.classSection || ""}
                </Text>
              )}

              <View style={styles.footerRow}>
                <Text style={styles.dateText}>
                  تاریخ:{" "}
                  {new Date(item.incidentDate).toLocaleDateString("fa-IR")}
                </Text>
                {item.pointsDeducted > 0 ? (
                  <Text style={styles.pointsDeductedText}>
                    کسر: {item.pointsDeducted}
                  </Text>
                ) : (
                  <Text style={styles.pointsPendingText}>
                    کسر پیشنهادی: {item.suggestedDeduction}
                  </Text>
                )}
              </View>

              {item.isRepeatOffense && (
                <View style={styles.repeatBadge}>
                  <Ionicons name="warning" size={12} color="#EF4444" />
                  <Text style={styles.repeatText}>
                    تخلف تکراری ({item.previousCount} بار قبل)
                  </Text>
                </View>
              )}

              {item.reviewNotes && (
                <View style={styles.reviewBox}>
                  <Text style={styles.reviewLabel}>یادداشت مدیر:</Text>
                  <Text style={styles.reviewText}>{item.reviewNotes}</Text>
                </View>
              )}

              {item.rejectionReason && (
                <View
                  style={[styles.reviewBox, { backgroundColor: "#EF444415" }]}
                >
                  <Text style={[styles.reviewLabel, { color: "#EF4444" }]}>
                    دلیل رد:
                  </Text>
                  <Text style={[styles.reviewText, { color: "#EF4444" }]}>
                    {item.rejectionReason}
                  </Text>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View style={[styles.statBox, { borderColor: `${color}50` }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  filters: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: Colors.text,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
  },
  statBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: Colors.card,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  empty: {
    alignItems: "center",
    padding: 60,
  },
  emptyText: {
    marginTop: 12,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  studentName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  severityBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  violationText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "600",
  },
  categoryText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  classText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  pointsDeductedText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "700",
  },
  pointsPendingText: {
    fontSize: 12,
    color: "#F59E0B",
    fontWeight: "600",
  },
  repeatBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EF444415",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  repeatText: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "600",
  },
  reviewBox: {
    backgroundColor: "#F3F4F6",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  reviewLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  reviewText: {
    fontSize: 12,
    color: Colors.text,
  },
});