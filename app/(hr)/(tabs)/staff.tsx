// app/(hr)/(tabs)/staff.tsx - Connected to Backend
import {
  getStatusColor,
  getStatusText,
  hrApi,
  StaffMember,
} from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function StaffScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async (pageNum: number = 1) => {
    try {
      const response = await hrApi.getStaff({
        search: search || undefined,
        page: pageNum,
        limit: 20,
      });

      if (response.success) {
        if (pageNum === 1) {
          setStaff(response.data.staff);
        } else {
          setStaff((prev) => [...prev, ...response.data.staff]);
        }
        setTotal(response.data.total);
        setHasMore(response.data.page < response.data.totalPages);
      }
    } catch (error) {
      console.error("Fetch staff error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchStaff(1);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchStaff(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchStaff(nextPage);
    }
  };

  const renderStaff = ({ item }: { item: StaffMember }) => {
    const status = item.isActive ? "active" : "inactive";
    const roleLabel =
      {
        ADMIN: "مدیر",
        TEACHER: "استاد",
        FINANCE: "مالی",
        HR: "منابع بشری",
        PRINCIPAL: "مدیر مکتب",
      }[item.role] || item.role;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/(hr)/staff/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.staffName}>{item.fullName}</Text>
            <Text style={styles.staffRole}>{item.position || roleLabel}</Text>
            <Text style={styles.staffDepartment}>
              {item.department || item.role}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(status) + "15" },
            ]}
          >
            <Text
              style={[styles.statusText, { color: getStatusColor(status) }]}
            >
              {getStatusText(status)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && staff.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#94a3b8"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="جستجوی کارمندان..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearch("");
              handleSearch();
            }}
          >
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push("/(hr)/staff/add")}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>کارمند جدید</Text>
      </TouchableOpacity>

      {/* Staff List */}
      <FlatList
        data={staff}
        renderItem={renderStaff}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && staff.length > 0 ? (
            <ActivityIndicator style={{ padding: 16 }} color="#8b5cf6" />
          ) : null
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ede9fe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#8b5cf6",
    fontFamily: "VazirBold",
  },
  cardInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  staffRole: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  staffDepartment: {
    fontSize: 12,
    color: "#94a3b8",
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
