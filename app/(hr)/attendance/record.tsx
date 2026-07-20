// app/(hr)/attendance/record.tsx
import { hrApi } from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Staff = {
  id: number;
  fullName: string;
  role: string;
};

export default function RecordAttendanceScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [staffRes, attendanceRes] = await Promise.all([
        hrApi.getStaff({ status: "active", limit: 100 }),
        hrApi.getTodayAttendance(),
      ]);

      if (staffRes.success) {
        setStaff(staffRes.data.staff);
      }

      if (attendanceRes.success) {
        const presentIds = new Set(
          attendanceRes.data.attendance.map((a) => a.id),
        );
        setTodayAttendance(presentIds);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleRecordAttendance = async (staffId: number) => {
    try {
      const response = await hrApi.recordAttendance({
        staffId,
        punchType: "IN",
      });

      if (response.success) {
        setTodayAttendance((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(staffId)) {
            newSet.delete(staffId);
          } else {
            newSet.add(staffId);
          }
          return newSet;
        });
        Alert.alert("موفقیت", "حضور با موفقیت ثبت شد");
      }
    } catch (error: any) {
      Alert.alert("خطا", error.message || "خطا در ثبت حضور");
    }
  };

  const renderStaff = ({ item }: { item: Staff }) => {
    const isPresent = todayAttendance.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.card, isPresent && styles.presentCard]}
        onPress={() => handleRecordAttendance(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.avatar, isPresent && styles.avatarPresent]}>
            <Text
              style={[styles.avatarText, isPresent && styles.avatarTextPresent]}
            >
              {item.fullName.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.staffName}>{item.fullName}</Text>
            <Text style={styles.staffRole}>{item.role}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            isPresent ? styles.presentBadge : styles.absentBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isPresent ? styles.presentText : styles.absentText,
            ]}
          >
            {isPresent ? "حاضر" : "ثبت حضور"}
          </Text>
          {isPresent && (
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ثبت حضور کارمندان</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <Text style={styles.subtitle}>
        برای ثبت حضور روی هر کارمند ضربه بزنید
      </Text>

      <FlatList
        data={staff}
        renderItem={renderStaff}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>هیچ کارمندی یافت نشد</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f5f9" },
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  headerPlaceholder: { width: 40 },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    paddingVertical: 12,
    fontFamily: "Vazir",
  },
  listContent: { padding: 16, gap: 12 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  presentCard: { borderWidth: 2, borderColor: "#10b981" },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPresent: { backgroundColor: "#d1fae5" },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  avatarTextPresent: { color: "#10b981" },
  staffName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  staffRole: { fontSize: 13, color: "#64748b", fontFamily: "Vazir" },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  presentBadge: { backgroundColor: "#d1fae5" },
  absentBadge: { backgroundColor: "#fef3c7" },
  statusText: { fontSize: 13, fontWeight: "600", fontFamily: "Vazir" },
  presentText: { color: "#10b981" },
  absentText: { color: "#f59e0b" },
  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
});
