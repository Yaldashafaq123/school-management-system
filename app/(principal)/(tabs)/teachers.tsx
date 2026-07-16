// app/(principal)/(tabs)/teachers.tsx - Connected to Backend
import { principalApi, Teacher } from "@/src/config/principalApi";
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

export default function PrincipalTeachersScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async (pageNum: number = 1) => {
    try {
      const response = await principalApi.getTeachers({
        search: search || undefined,
        page: pageNum,
        limit: 20,
      });

      if (response.success) {
        if (pageNum === 1) {
          setTeachers(response.data.teachers);
        } else {
          setTeachers((prev) => [...prev, ...response.data.teachers]);
        }
        setTotal(response.data.total);
        setHasMore(response.data.page < response.data.totalPages);
      }
    } catch (error) {
      console.error("Fetch teachers error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchTeachers(1);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchTeachers(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTeachers(nextPage);
    }
  };

  const renderTeacher = ({ item }: { item: Teacher }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`./teachers/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.teacherName}>{item.fullName}</Text>
          <Text style={styles.specialization}>
            {item.specialization || "متخصص"}
          </Text>
          <Text style={styles.teacherCode}>کد: {item.teacherCode}</Text>
        </View>
        <View style={styles.rightContainer}>
          {item.className && (
            <View style={styles.classBadge}>
              <Text style={styles.classBadgeText}>{item.className}</Text>
            </View>
          )}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.isActive ? "#d1fae5" : "#fef3c7" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: item.isActive ? "#10b981" : "#f59e0b" },
              ]}
            >
              {item.isActive ? "فعال" : "غیرفعال"}
            </Text>
          </View>
          {item.rating > 0 && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && teachers.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
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
          placeholder="جستجوی اساتید..."
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

      {/* Stats Summary */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>مجموع: {total} استاد</Text>
      </View>

      {/* Teacher List */}
      <FlatList
        data={teachers}
        renderItem={renderTeacher}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && teachers.length > 0 ? (
            <ActivityIndicator style={{ padding: 16 }} color="#f59e0b" />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>هیچ استادی یافت نشد</Text>
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
    marginBottom: 8,
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
  statsRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statsText: {
    fontSize: 14,
    color: "#64748b",
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
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3b82f6",
    fontFamily: "VazirBold",
  },
  cardInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  specialization: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  teacherCode: {
    fontSize: 12,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  rightContainer: {
    alignItems: "flex-end",
    gap: 4,
  },
  classBadge: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  classBadgeText: {
    fontSize: 11,
    color: "#8b5cf6",
    fontFamily: "Vazir",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#64748b",
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
