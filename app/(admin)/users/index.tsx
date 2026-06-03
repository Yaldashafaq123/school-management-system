// app/(admin)/users/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "../../../components/Header";
import { Colors } from "../../../constants/Colors";
import { useAuth } from "../../../contexts/AuthContext";
import {
  AdminUser,
  adminUserApi,
  UserStats,
} from "../../../src/config/adminUserApi";

export default function UsersManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [stats, setStats] = useState<UserStats | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        adminUserApi.getUsers({
          search: searchQuery || undefined,
          role: filterRole !== "all" ? filterRole : undefined,
          status: filterStatus !== "all" ? filterStatus : undefined,
          limit: 100,
        }),
        adminUserApi.getUserStats(),
      ]);

      console.log("Users API Response:", usersRes); // Debug log

      if (usersRes.success && usersRes.data && usersRes.data.users) {
        // Map backend data to frontend format
        const mappedUsers: AdminUser[] = usersRes.data.users.map(
          (userData: any) => ({
            id: userData.id,
            name: userData.name || userData.fullName || "نامشخص",
            email: userData.email,
            phone: userData.phone,
            role: userData.role || "student",
            status: userData.verified ? "active" : "inactive",
            verified: userData.verified,
            profile_image: userData.profile_image,
            createdAt: userData.createdAt,
            stats: userData.stats || {
              attendanceCount: 0,
              assignmentCount: 0,
              messageCount: 0,
            },
            classId: userData.classId,
            className: userData.className,
            classSection: userData.classSection,
            teacherId: userData.teacherId,
            subjects: userData.subjects,
            parentId: userData.parentId,
            children: userData.children,
          }),
        );

        console.log("Mapped Users:", mappedUsers.length); // Debug log
        setUsers(mappedUsers);
        setFilteredUsers(mappedUsers);
      } else {
        console.log("No users data:", usersRes);
        setUsers([]);
        setFilteredUsers([]);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("خطا", "در دریافت اطلاعات کاربران مشکلی پیش آمده");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, filterRole, filterStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = [...users];

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          (user.name && user.name.includes(searchQuery)) ||
          (user.email && user.email.includes(searchQuery)),
      );
    }

    if (filterRole !== "all") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((user) => user.status === filterStatus);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, filterRole, filterStatus, users]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
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
        return "مدرس";
      case "student":
        return "دانش‌آموز";
      case "parent":
        return "والدین";
      default:
        return "کاربر";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return Colors.success;
      case "inactive":
        return Colors.textSecondary;
      case "suspended":
        return Colors.danger;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "فعال";
      case "inactive":
        return "غیرفعال";
      case "suspended":
        return "معلق";
      default:
        return "نامشخص";
    }
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    Alert.alert("حذف کاربر", `آیا از حذف کاربر "${userName}" اطمینان دارید؟`, [
      { text: "لغو", style: "cancel" },
      {
        text: "حذف",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await adminUserApi.deleteUser(userId);
            if (response.success) {
              Alert.alert("موفق", "کاربر با موفقیت حذف شد");
              fetchUsers();
            } else {
              Alert.alert("خطا", response.message);
            }
          } catch (error) {
            Alert.alert("خطا", "خطا در حذف کاربر");
          }
        },
      },
    ]);
  };

  const handleChangeStatus = async (
    userId: number,
    newStatus: "active" | "inactive" | "suspended",
  ) => {
    try {
      const response = await adminUserApi.updateUserStatus(userId, newStatus);
      if (response.success) {
        Alert.alert("موفق", "وضعیت کاربر با موفقیت تغییر کرد");
        fetchUsers();
      } else {
        Alert.alert("خطا", response.message);
      }
    } catch (error) {
      Alert.alert("خطا", "خطا در تغییر وضعیت کاربر");
    }
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="مدیریت کاربران" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="مدیریت کاربران"
        rightComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/(admin)/users/create")}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Search and Filters */}
        <View style={styles.filterSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="جستجوی کاربر..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textSecondary}
              textAlign="right"
            />
          </View>

          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterRole === "all" && styles.filterChipActive,
                ]}
                onPress={() => setFilterRole("all")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterRole === "all" && styles.filterChipTextActive,
                  ]}
                >
                  همه
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterRole === "admin" && styles.filterChipActive,
                ]}
                onPress={() => setFilterRole("admin")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterRole === "admin" && styles.filterChipTextActive,
                  ]}
                >
                  مدیران
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterRole === "teacher" && styles.filterChipActive,
                ]}
                onPress={() => setFilterRole("teacher")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterRole === "teacher" && styles.filterChipTextActive,
                  ]}
                >
                  مدرسان
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterRole === "student" && styles.filterChipActive,
                ]}
                onPress={() => setFilterRole("student")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterRole === "student" && styles.filterChipTextActive,
                  ]}
                >
                  دانش‌آموزان
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterRole === "parent" && styles.filterChipActive,
                ]}
                onPress={() => setFilterRole("parent")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterRole === "parent" && styles.filterChipTextActive,
                  ]}
                >
                  والدین
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.total || 0}</Text>
            <Text style={styles.statLabel}>کاربر کل</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.active || 0}</Text>
            <Text style={styles.statLabel}>فعال</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.teacher || 0}</Text>
            <Text style={styles.statLabel}>مدرس</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.admin || 0}</Text>
            <Text style={styles.statLabel}>مدیر</Text>
          </View>
        </View>

        {/* Users List */}
        <View style={styles.usersList}>
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="people-outline"
                size={64}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyStateText}>کاربری یافت نشد</Text>
              <Text style={styles.emptyStateSubtext}>
                برای ایجاد کاربر جدید، روی دکمه + در بالای صفحه کلیک کنید
              </Text>
            </View>
          ) : (
            filteredUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {user.name?.charAt(0) || "?"}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                      {user.phone && (
                        <Text style={styles.userPhone}>{user.phone}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.userActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => router.push(`/(admin)/users/${user.id}`)}
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color={Colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteUser(user.id, user.name)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={Colors.danger}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.userDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>نقش:</Text>
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
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>وضعیت:</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(user.status)}20` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(user.status) },
                        ]}
                      >
                        {getStatusText(user.status)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>تاریخ عضویت:</Text>
                    <Text style={styles.detailValue}>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("fa-IR")
                        : "نامشخص"}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>تعداد دوره‌ها:</Text>
                    <Text style={styles.detailValue}>
                      {user.stats?.assignmentCount || 0}
                    </Text>
                  </View>
                  {user.className && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>کلاس:</Text>
                      <Text style={styles.detailValue}>
                        {user.className} {user.classSection || ""}
                      </Text>
                    </View>
                  )}
                  {user.subjects && user.subjects.length > 0 && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>دروس:</Text>
                      <Text style={styles.detailValue} numberOfLines={1}>
                        {user.subjects.join("، ")}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.userFooter}>
                  {user.status !== "active" && (
                    <TouchableOpacity
                      style={styles.statusButton}
                      onPress={() => handleChangeStatus(user.id, "active")}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          { color: Colors.success },
                        ]}
                      >
                        فعال‌سازی
                      </Text>
                    </TouchableOpacity>
                  )}
                  {user.status !== "suspended" && (
                    <TouchableOpacity
                      style={styles.statusButton}
                      onPress={() => handleChangeStatus(user.id, "suspended")}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          { color: Colors.danger },
                        ]}
                      >
                        تعلیق
                      </Text>
                    </TouchableOpacity>
                  )}
                  {user.status !== "inactive" && (
                    <TouchableOpacity
                      style={styles.statusButton}
                      onPress={() => handleChangeStatus(user.id, "inactive")}
                    >
                      <Text
                        style={[
                          styles.statusButtonText,
                          { color: Colors.textSecondary },
                        ]}
                      >
                        غیرفعال
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  filterSection: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginRight: 8,
    fontSize: 16,
    color: Colors.text,
    textAlign: "right",
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterChipTextActive: {
    color: "#fff",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
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
  },
  userCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  userPhone: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  userActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: "500",
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  userFooter: {
    flexDirection: "row",
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: "500",
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
});
