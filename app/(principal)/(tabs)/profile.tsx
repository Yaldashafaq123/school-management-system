// app/(principal)/(tabs)/profile.tsx - Connected to Backend
import { useAuth } from "@/contexts/AuthContext";
import { principalApi, PrincipalProfile } from "@/src/config/principalApi";
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

export default function PrincipalProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<PrincipalProfile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await principalApi.getProfile();
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
      route: "/(principal)/profile/edit",
    },
    {
      id: "settings",
      title: "تنظیمات",
      icon: "settings-outline",
      route: "/(public)/settings",
    },
    {
      id: "notifications",
      title: "اعلانات",
      icon: "notifications-outline",
      route: "/(public)/notifications",
    },
    {
      id: "help",
      title: "راهنما و پشتیبانی",
      icon: "help-circle-outline",
      route: "/(public)/info",
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
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  const stats = profile?.statistics || {
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    attendanceRate: 0,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
        <Text style={styles.userName}>
          {profile?.user.fullName || user?.fullName || "مدیر مکتب"}
        </Text>
        <Text style={styles.userRole}>
          {profile?.principalStaff.position || "مدیریت مکتب"}
        </Text>
        <Text style={styles.userEmail}>
          {profile?.user.email || user?.email || ""}
        </Text>
        {profile?.principalStaff.experience && (
          <Text style={styles.userExperience}>
            سابقه: {profile.principalStaff.experience}
          </Text>
        )}
        {profile?.principalStaff.qualification && (
          <Text style={styles.userQualification}>
            مدرک: {profile.principalStaff.qualification}
          </Text>
        )}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalStudents}</Text>
          <Text style={styles.statLabel}>شاگردان</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalTeachers}</Text>
          <Text style={styles.statLabel}>اساتید</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalClasses}</Text>
          <Text style={styles.statLabel}>صنوف</Text>
        </View>
      </View>

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
    backgroundColor: "#f59e0b",
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
  userExperience: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  userQualification: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
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
