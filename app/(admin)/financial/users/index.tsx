import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { userApi } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  verified: boolean;
  createdAt: string;
}

const ROLE_FILTERS = [
  { value: "all", label: "همه", icon: "people", color: Colors.primary },
  {
    value: "ADMIN",
    label: "مدیران",
    icon: "shield-checkmark",
    color: Colors.danger,
  },
  { value: "TEACHER", label: "معلمین", icon: "school", color: Colors.warning },
  {
    value: "STUDENT",
    label: "دانش‌آموزان",
    icon: "book",
    color: Colors.success,
  },
  {
    value: "PARENT",
    label: "والدین",
    icon: "people-circle",
    color: Colors.info,
  },
];

export default function UsersList() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const response = await userApi.getAllUsers({
        role: selectedRole === "all" ? undefined : selectedRole,
        search: searchQuery || undefined,
        page,
        limit: 20,
      });

      if (response.success) {
        if (page === 1) {
          setUsers(response.data.users || []);
        } else {
          setUsers((prev) => [...prev, ...(response.data.users || [])]);
        }
        setTotal(response.data.total || 0);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRole, searchQuery, page]);

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      loadUsers();
    }, [loadUsers]),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadUsers();
  };

  const handleLoadMore = () => {
    if (page < totalPages && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    setPage(1);
  };

  const getRoleBadge = (role: string) => {
    const filter = ROLE_FILTERS.find((f) => f.value === role);
    return {
      label: filter?.label || role,
      color: filter?.color || Colors.textSecondary,
      icon: filter?.icon || "person",
    };
  };

  const getRoleBackground = (role: string) => {
    switch (role) {
      case "ADMIN":
        return `${Colors.danger}15`;
      case "TEACHER":
        return `${Colors.warning}15`;
      case "STUDENT":
        return `${Colors.success}15`;
      case "PARENT":
        return `${Colors.info}15`;
      default:
        return `${Colors.textSecondary}15`;
    }
  };

  const navigateToCreate = () => {
    router.push("/(admin)/financial/users/students/create" as any);
  };

  const navigateToUser = (userId: number, role: string) => {
    const route =
      role === "STUDENT"
        ? "students"
        : role === "TEACHER"
          ? "teachers"
          : "parents";
    router.push(`/(admin)/financial/users/${route}/${userId}` as any);
  };

  const renderUserCard = ({ item }: { item: User }) => {
    const roleBadge = getRoleBadge(item.role);
    const isActive = item.verified;

    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => navigateToUser(item.id, item.role)}
        activeOpacity={0.7}
      >
        <View style={styles.userHeader}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: getRoleBackground(item.role) },
            ]}
          >
            <Text style={[styles.avatarText, { color: roleBadge.color }]}>
              {item.fullName?.charAt(0) || "؟"}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.fullName}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {item.email}
            </Text>
            {item.phone && (
              <View style={styles.phoneRow}>
                <Ionicons
                  name="call-outline"
                  size={11}
                  color={Colors.textSecondary}
                />
                <Text style={styles.userPhone}>{item.phone}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.userFooter}>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: getRoleBackground(item.role) },
            ]}
          >
            <Ionicons
              name={roleBadge.icon as any}
              size={12}
              color={roleBadge.color}
            />
            <Text style={[styles.roleText, { color: roleBadge.color }]}>
              {roleBadge.label}
            </Text>
          </View>

          <View style={styles.footerRight}>
            {isActive ? (
              <View style={styles.verifiedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={Colors.success}
                />
                <Text style={styles.verifiedText}>تایید شده</Text>
              </View>
            ) : (
              <View style={styles.unverifiedBadge}>
                <Ionicons name="close-circle" size={14} color={Colors.danger} />
                <Text style={styles.unverifiedText}>تایید نشده</Text>
              </View>
            )}
            <Ionicons
              name="chevron-forward"
              size={16}
              color={Colors.textSecondary}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const totalActive = users.filter((u) => u.verified).length;

  if (loading && page === 1) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="مدیریت کاربران" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header title="مدیریت کاربران" showBack />

      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{total}</Text>
          <Text style={styles.summaryLabel}>کل کاربران</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>
            {totalActive}
          </Text>
          <Text style={styles.summaryLabel}>تایید شده</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.primary }]}>
            {selectedRole === "all"
              ? "همه"
              : ROLE_FILTERS.find((f) => f.value === selectedRole)?.label}
          </Text>
          <Text style={styles.summaryLabel}>نقش</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجو بر اساس نام، ایمیل یا تلفن..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            textAlign="right"
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons
                name="close-circle"
                size={16}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Role Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
      >
        <View style={styles.filterRow}>
          {ROLE_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterChip,
                selectedRole === filter.value && {
                  backgroundColor: filter.color,
                  borderColor: filter.color,
                },
              ]}
              onPress={() => {
                setSelectedRole(filter.value);
                setPage(1);
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={filter.icon as any}
                size={14}
                color={selectedRole === filter.value ? "white" : filter.color}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedRole === filter.value && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUserCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={64}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>کاربری یافت نشد</Text>
            <Text style={styles.emptyDesc}>
              {searchQuery
                ? "کاربری با این مشخصات یافت نشد"
                : "هیچ کاربری ثبت نشده است"}
            </Text>
          </View>
        }
        ListFooterComponent={
          page < totalPages ? (
            <View style={styles.loadMoreContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : null
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={navigateToCreate}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },

  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryItem: { alignItems: "center" },
  summaryDivider: { width: 1, height: 24, backgroundColor: Colors.border },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },

  searchContainer: { paddingHorizontal: 16, paddingVertical: 10 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    marginLeft: 6,
    textAlign: "right",
    fontFamily: "Vazirmatn",
  },

  filterScroll: { paddingHorizontal: 16, marginBottom: 12 },
  filterRow: { flexDirection: "row", gap: 8 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  filterChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  filterChipTextActive: { color: "white" },

  listContent: { padding: 16, paddingTop: 0, paddingBottom: 80 },

  userCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "bold", fontFamily: "Vazirmatn" },
  userInfo: { flex: 1 },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
  },

  userFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  roleText: { fontSize: 10, fontWeight: "500", fontFamily: "Vazirmatn" },
  footerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  verifiedText: {
    fontSize: 10,
    color: Colors.success,
    fontFamily: "Vazirmatn",
  },
  unverifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  unverifiedText: {
    fontSize: 10,
    color: Colors.danger,
    fontFamily: "Vazirmatn",
  },

  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "Vazirmatn",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    textAlign: "center",
  },

  loadMoreContainer: { paddingVertical: 20, alignItems: "center" },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
