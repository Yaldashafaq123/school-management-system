// app/(principal)/(tabs)/profile.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Alert,
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
      route: "/(principal)/settings",
    },
    {
      id: "notifications",
      title: "اعلانات",
      icon: "notifications-outline",
      route: "/(principal)/notifications",
    },
    {
      id: "help",
      title: "راهنما و پشتیبانی",
      icon: "help-circle-outline",
      route: "/(principal)/help",
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
        <Text style={styles.userName}>{user?.fullName || "مدیر مکتب"}</Text>
        <Text style={styles.userRole}>مدیریت مکتب</Text>
        <Text style={styles.userEmail}>{user?.email || ""}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>۳۲۰</Text>
          <Text style={styles.statLabel}>شاگردان</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>۲۸</Text>
          <Text style={styles.statLabel}>اساتید</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>۹۲%</Text>
          <Text style={styles.statLabel}>حضور</Text>
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
