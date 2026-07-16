// app/(principal)/(tabs)/students.tsx - Connected to Backend
import {
  getStudentStatusColor,
  getStudentStatusText,
  principalApi,
  Student,
} from "@/src/config/principalApi";
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

export default function PrincipalStudentsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (pageNum: number = 1) => {
    try {
      const response = await principalApi.getStudents({
        search: search || undefined,
        page: pageNum,
        limit: 20,
      });

      if (response.success) {
        if (pageNum === 1) {
          setStudents(response.data.students);
        } else {
          setStudents((prev) => [...prev, ...response.data.students]);
        }
        setTotal(response.data.total);
        setHasMore(response.data.page < response.data.totalPages);
      }
    } catch (error) {
      console.error("Fetch students error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchStudents(1);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchStudents(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchStudents(nextPage);
    }
  };

  const renderStudent = ({ item }: { item: Student }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/students/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.fullName.charAt(0)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.studentName}>{item.fullName}</Text>
          <Text style={styles.className}>{item.className}</Text>
          <Text style={styles.studentNumber}>شماره: {item.studentNumber}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStudentStatusColor(item.status) + "15" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStudentStatusColor(item.status) },
            ]}
          >
            {getStudentStatusText(item.status)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && students.length === 0) {
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
          placeholder="جستجوی شاگردان..."
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
        <Text style={styles.statsText}>مجموع: {total} شاگرد</Text>
      </View>

      {/* Student List */}
      <FlatList
        data={students}
        renderItem={renderStudent}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && students.length > 0 ? (
            <ActivityIndicator style={{ padding: 16 }} color="#f59e0b" />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>هیچ شاگردی یافت نشد</Text>
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
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f59e0b",
    fontFamily: "VazirBold",
  },
  cardInfo: {
    flex: 1,
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
    fontFamily: "Vazir",
  },
  studentNumber: {
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
