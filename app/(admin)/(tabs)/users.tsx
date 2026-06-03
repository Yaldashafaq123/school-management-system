import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { AdminUser, adminUserApi, UserStats } from "@/src/config/adminUserApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UserManagementScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const roles = [
    { id: "all", label: "همه" },
    { id: "admin", label: "مدیر" },
    { id: "teacher", label: "معلم" },
    { id: "student", label: "دانش‌آموز" },
    { id: "parent", label: "والدین" },
  ];

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        adminUserApi.getUsers({
          search: searchQuery || undefined,
          role: selectedRole,
          page,
        }),
        adminUserApi.getUserStats(),
      ]);

      if (usersRes.success && usersRes.data) {
        setUsers(usersRes.data.users);
        setTotalPages(usersRes.data.totalPages);
        setHasMore(usersRes.data.page < usersRes.data.totalPages);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedRole, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await loadUsers();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      const response = await adminUserApi.deleteUser(selectedUser.id);
      if (response.success) {
        Alert.alert("موفقیت", response.message);
        setShowDeleteModal(false);
        setSelectedUser(null);
        loadUsers();
      } else {
        Alert.alert("خطا", response.message);
      }
    } catch (error) {
      Alert.alert("خطا", "حذف کاربر ناموفق بود");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return Colors.danger;
      case "teacher":
        return Colors.warning;
      case "student":
        return Colors.primary;
      case "parent":
        return Colors.secondary;
      default:
        return Colors.textSecondary;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case "admin":
        return "مدیر";
      case "teacher":
        return "معلم";
      case "student":
        return "دانش‌آموز";
      case "parent":
        return "والدین";
      default:
        return "کاربر";
    }
  };

  if (loading && page === 1) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header
          title="مدیریت کاربران"
          showBack
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="مدیریت کاربران"
        showBack
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity
            onPress={() => router.push("/(admin)/users/create")}
          >
            <Ionicons name="person-add" size={24} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="جستجوی کاربر..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setPage(1);
              }}
              textAlign="right"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {roles.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.filterChip,
                  selectedRole === role.id && styles.filterChipActive,
                ]}
                onPress={() => {
                  setSelectedRole(role.id);
                  setPage(1);
                }}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedRole === role.id && styles.filterTextActive,
                  ]}
                >
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.total || 0}</Text>
            <Text style={styles.statLabel}>کل کاربران</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.danger }]}>
              {stats?.admin || 0}
            </Text>
            <Text style={styles.statLabel}>مدیر</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>
              {stats?.teacher || 0}
            </Text>
            <Text style={styles.statLabel}>معلم</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {stats?.student || 0}
            </Text>
            <Text style={styles.statLabel}>دانش‌آموز</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.secondary }]}>
              {stats?.parent || 0}
            </Text>
            <Text style={styles.statLabel}>والدین</Text>
          </View>
        </View>

        {/* Users List */}
        <View style={styles.usersList}>
          {users.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="people-outline"
                size={60}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyStateText}>کاربری یافت نشد</Text>
              <Text style={styles.emptyStateSubtext}>
                برای ایجاد کاربر جدید، روی دکمه + در بالای صفحه کلیک کنید
              </Text>
            </View>
          ) : (
            users.map((user) => {
              // Get the user's display name (handle both fullName and name)
              const displayName = user.fullName || user.name || "کاربر";
              const userEmail = user.email || "";
              const userPhone = user.phone || "";

              return (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>
                        {displayName.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{displayName}</Text>
                      <Text style={styles.userEmail}>{userEmail}</Text>
                      {userPhone ? (
                        <Text style={styles.userPhone}>{userPhone}</Text>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.userActions}>
                    <View
                      style={[
                        styles.roleBadge,
                        { backgroundColor: `${getRoleColor(user.role)}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.roleText,
                          { color: getRoleColor(user.role) },
                        ]}
                      >
                        {getRoleText(user.role)}
                      </Text>
                    </View>

                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() =>
                          router.push(`/(admin)/users/${user.id}` as any)
                        }
                      >
                        <Ionicons
                          name="eye"
                          size={20}
                          color={Colors.textSecondary}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Ionicons
                          name="trash"
                          size={20}
                          color={Colors.danger}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}

          {hasMore && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
            >
              <Text style={styles.loadMoreText}>بارگذاری بیشتر</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalHeader}>
              <Ionicons name="warning" size={40} color={Colors.danger} />
              <Text style={styles.deleteModalTitle}>حذف کاربر</Text>
              <Text style={styles.deleteModalText}>
                آیا از حذف کاربر{" "}
                {selectedUser?.fullName || selectedUser?.name || "این کاربر"}{" "}
                مطمئن هستید؟
              </Text>
            </View>

            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.deleteCancelButton}
                onPress={() => setShowDeleteModal(false)}
                disabled={submitting}
              >
                <Text style={styles.deleteCancelText}>لغو</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={handleDeleteUser}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteConfirmText}>حذف</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    marginHorizontal: 12,
    textAlign: "right",
  },
  filtersContainer: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: "18%",
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  usersList: {
    gap: 12,
    marginBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 16,
    fontWeight: "bold",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  userCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  userPhone: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  deleteModalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  deleteModalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  deleteModalText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  deleteModalActions: {
    flexDirection: "row",
    gap: 12,
  },
  deleteCancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deleteCancelText: {
    fontSize: 16,
    color: Colors.text,
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: Colors.danger,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  deleteConfirmText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
});
