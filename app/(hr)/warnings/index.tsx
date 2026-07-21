// app/(hr)/warnings/index.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Warning = {
  id: number;
  userId: number;
  type: string;
  title: string;
  description: string;
  issuedDate: string;
  status: string;
  resolution: string;
  resolvedAt: string;
  User: { fullName: string };
  Issuer: { fullName: string };
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "#ef4444";
    case "RESOLVED":
      return "#10b981";
    case "EXPIRED":
      return "#94a3b8";
    default:
      return "#94a3b8";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "فعال";
    case "RESOLVED":
      return "حل شده";
    case "EXPIRED":
      return "منقضی";
    default:
      return status;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "alert-circle";
    case "RESOLVED":
      return "checkmark-circle";
    case "EXPIRED":
      return "time";
    default:
      return "help-circle";
  }
};

const getTypeText = (type: string) => {
  switch (type) {
    case "VERBAL":
      return "شفاهی";
    case "WRITTEN":
      return "کتبی";
    case "FINAL":
      return "نهایی";
    case "TERMINATION":
      return "اخراج";
    default:
      return type;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "VERBAL":
      return "#f59e0b";
    case "WRITTEN":
      return "#f97316";
    case "FINAL":
      return "#ef4444";
    case "TERMINATION":
      return "#dc2626";
    default:
      return "#94a3b8";
  }
};

export default function WarningsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [stats, setStats] = useState({ active: 0, resolved: 0, expired: 0 });

  useEffect(() => {
    fetchWarnings();
  }, []);

  const fetchWarnings = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/hr/warnings`,
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );
      const result = await response.json();
      if (result.success) {
        setWarnings(result.data.warnings);
        // Calculate stats
        const active = result.data.warnings.filter(
          (w: Warning) => w.status === "ACTIVE",
        ).length;
        const resolved = result.data.warnings.filter(
          (w: Warning) => w.status === "RESOLVED",
        ).length;
        const expired = result.data.warnings.filter(
          (w: Warning) => w.status === "EXPIRED",
        ).length;
        setStats({ active, resolved, expired });
      }
    } catch (error) {
      console.error("Fetch warnings error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getToken = async () => {
    const token = await AsyncStorage.getItem("auth_token");
    return token;
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchWarnings();
  };

  const handleResolve = (id: number) => {
    Alert.prompt("حل اخطار", "راه حل را وارد کنید", [
      { text: "لغو", style: "cancel" },
      {
        text: "تایید",
        onPress: async (resolution: any) => {
          try {
            const response = await fetch(
              `${process.env.EXPO_PUBLIC_API_URL}/api/hr/warnings/${id}/resolve`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${await getToken()}`,
                },
                body: JSON.stringify({ resolution: resolution || "" }),
              },
            );
            const result = await response.json();
            if (result.success) {
              Alert.alert("موفقیت", "اخطار با موفقیت حل شد");
              fetchWarnings();
            }
          } catch (error: any) {
            Alert.alert("خطا", error.message || "خطا در حل اخطار");
          }
        },
      },
    ]);
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <View style={[styles.statIcon, { backgroundColor: "#fef2f2" }]}>
          <Ionicons name="alert-circle" size={20} color="#ef4444" />
        </View>
        <Text style={[styles.statNumber, { color: "#ef4444" }]}>
          {stats.active}
        </Text>
        <Text style={styles.statLabel}>فعال</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <View style={[styles.statIcon, { backgroundColor: "#d1fae5" }]}>
          <Ionicons name="checkmark-circle" size={20} color="#10b981" />
        </View>
        <Text style={[styles.statNumber, { color: "#10b981" }]}>
          {stats.resolved}
        </Text>
        <Text style={styles.statLabel}>حل شده</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <View style={[styles.statIcon, { backgroundColor: "#f1f5f9" }]}>
          <Ionicons name="time" size={20} color="#94a3b8" />
        </View>
        <Text style={[styles.statNumber, { color: "#94a3b8" }]}>
          {stats.expired}
        </Text>
        <Text style={styles.statLabel}>منقضی</Text>
      </View>
    </View>
  );

  const renderWarning = ({ item }: { item: Warning }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);
    const typeColor = getTypeColor(item.type);
    const isActive = item.status === "ACTIVE";

    return (
      <View style={[styles.card, isActive && styles.activeCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View
              style={[styles.typeBadge, { backgroundColor: typeColor + "15" }]}
            >
              <Text style={[styles.typeText, { color: typeColor }]}>
                {getTypeText(item.type)}
              </Text>
            </View>
            <Text style={styles.warningTitle}>{item.title}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + "15" },
            ]}
          >
            <Ionicons name={statusIcon as any} size={14} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.staffInfo}>
          <View style={styles.staffAvatar}>
            <Text style={styles.staffAvatarText}>
              {item.User?.fullName?.charAt(0) || "?"}
            </Text>
          </View>
          <Text style={styles.staffName}>
            {item.User?.fullName || "نامشخص"}
          </Text>
        </View>

        {item.description && (
          <View style={styles.descriptionContainer}>
            <Ionicons name="document-text-outline" size={16} color="#94a3b8" />
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            <Ionicons name="person-outline" size={14} color="#94a3b8" />
            <Text style={styles.footerText}>
              {item.Issuer?.fullName || "نامشخص"}
            </Text>
          </View>
          <View style={styles.footerRight}>
            <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
            <Text style={styles.footerText}>
              {new Date(item.issuedDate).toLocaleDateString("fa-IR")}
            </Text>
          </View>
        </View>

        {item.status === "RESOLVED" && item.resolution && (
          <View style={styles.resolutionContainer}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text style={styles.resolutionText}>راه حل: {item.resolution}</Text>
          </View>
        )}

        {isActive && (
          <TouchableOpacity
            style={styles.resolveButton}
            onPress={() => handleResolve(item.id)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.resolveText}>حل اخطار</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#8b5cf6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>سیستم اخطار</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push("/(hr)/warnings/create")}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {warnings.length > 0 && renderStats()}

      <FlatList
        data={warnings}
        renderItem={renderWarning}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="checkmark-circle-outline"
              size={64}
              color="#d1d5db"
            />
            <Text style={styles.emptyTitle}>هیچ اخطاری یافت نشد</Text>
            <Text style={styles.emptyText}>
              سیستم اخطار در حال حاضر خالی است
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push("/(hr)/warnings/create")}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>ایجاد اخطار جدید</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
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
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  backButton: {
    padding: 4,
    minWidth: 40,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#8b5cf6",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 0,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  statLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e2e8f0",
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 20,
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
  activeCard: {
    borderWidth: 2,
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  staffInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },
  staffAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  staffAvatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  staffName: {
    fontSize: 14,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  descriptionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginTop: 8,
  },
  description: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b",
    fontFamily: "Vazir",
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  resolutionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
  },
  resolutionText: {
    flex: 1,
    fontSize: 13,
    color: "#10b981",
    fontFamily: "Vazir",
  },
  resolveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  resolveText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: "#94a3b8",
    fontFamily: "Vazir",
    textAlign: "center",
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});
