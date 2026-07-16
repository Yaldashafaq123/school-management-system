// app/(hr)/(tabs)/profile.tsx - Connected to Backend
import { useAuth } from "@/contexts/AuthContext";
import { hrApi, HRProfile } from "@/src/config/hrApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type MenuItem = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route?: string;
  onPress?: () => void;
  color?: string;
};

export default function HRProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<HRProfile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await hrApi.getProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error("Profile error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const menuItems: MenuItem[] = [
    {
      id: "profile",
      title: "اطلاعات پروفایل",
      icon: "person-outline",
      route: "/(hr)/profile/edit",
    },
    {
      id: "settings",
      title: "تنظیمات",
      icon: "settings-outline",
      route: "/(hr)/settings",
    },
    {
      id: "notifications",
      title: "اعلانات",
      icon: "notifications-outline",
      route: "/(hr)/notifications",
    },
    {
      id: "help",
      title: "راهنما و پشتیبانی",
      icon: "help-circle-outline",
      route: "/(hr)/help",
    },
    {
      id: "logout",
      title: "خروج از حساب",
      icon: "log-out-outline",
      color: "#ef4444",
      onPress: () => {
        Alert.alert("خروج از حساب", "آیا مطمئن هستید که می‌خواهید خارج شوید؟", [
          { text: "لغو", style: "cancel" },
          {
            text: "خروج",
            style: "destructive",
            onPress: async () => {
              await logout();
              router.replace("/(auth)/login");
            },
          },
        ]);
      },
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
      </View>
    );
  }

  const stats = profile?.statistics || {
    totalStaff: 0,
    activeStaff: 0,
    onLeave: 0,
    pendingRequests: 0,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
        <Text style={styles.userName}>
          {profile?.user.fullName || user?.fullName || "کارمند HR"}
        </Text>
        <Text style={styles.userRole}>
          {profile?.hrStaff.position || "مدیریت منابع بشری"}
        </Text>
        <Text style={styles.userEmail}>
          {profile?.user.email || user?.email || ""}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalStaff}</Text>
          <Text style={styles.statLabel}>کارمندان</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.pendingRequests}</Text>
          <Text style={styles.statLabel}>درخواست‌ها</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {stats.totalStaff > 0
              ? Math.round((stats.activeStaff / stats.totalStaff) * 100)
              : 0}
            %
          </Text>
          <Text style={styles.statLabel}>حضور</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => {
              if (item.onPress) {
                item.onPress();
              } else if (item.route) {
                router.push(item.route as any);
              }
            }}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name={item.icon}
                size={22}
                color={item.color || "#64748b"}
              />
              <Text
                style={[
                  styles.menuTitle,
                  item.color ? { color: item.color } : {},
                ]}
              >
                {item.title}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Version */}
      <Text style={styles.version}>نسخه ۱.۰.۰</Text>
    </ScrollView>
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
  content: {
    paddingBottom: 40,
  },
  profileHeader: {
    backgroundColor: "#fff",
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#8b5cf6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  userRole: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  userEmail: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: -20,
    paddingVertical: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  statLabel: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e2e8f0",
  },
  menuContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuTitle: {
    fontSize: 15,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  version: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 24,
    fontFamily: "Vazir",
  },
});
