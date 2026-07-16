// app/(principal)/(tabs)/index.tsx
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PrincipalDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const stats = {
    totalStudents: 320,
    totalTeachers: 28,
    totalClasses: 12,
    attendanceRate: 92,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => setRefreshing(false)}
        />
      }
    >
      {/* Welcome Card */}
      <LinearGradient
        colors={["#f59e0b", "#d97706"]}
        style={styles.welcomeCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.welcomeContent}>
          <View>
            <Text style={styles.welcomeGreeting}>سلام 👋</Text>
            <Text style={styles.welcomeName}>
              {user?.fullName || "مدیر"}
            </Text>
            <Text style={styles.welcomeRole}>مدیریت مکتب</Text>
          </View>
          <View style={styles.welcomeAvatar}>
            <Ionicons name="person" size={32} color="#f59e0b" />
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#fef3c7" }]}>
            <Ionicons name="school" size={24} color="#f59e0b" />
          </View>
          <Text style={styles.statValue}>{stats.totalStudents}</Text>
          <Text style={styles.statLabel}>شاگردان</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#dbeafe" }]}>
            <Ionicons name="people" size={24} color="#3b82f6" />
          </View>
          <Text style={styles.statValue}>{stats.totalTeachers}</Text>
          <Text style={styles.statLabel}>اساتید</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#d1fae5" }]}>
            <Ionicons name="book" size={24} color="#10b981" />
          </View>
          <Text style={styles.statValue}>{stats.totalClasses}</Text>
          <Text style={styles.statLabel}>صنوف</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "#ede9fe" }]}>
            <Ionicons name="trending-up" size={24} color="#8b5cf6" />
          </View>
          <Text style={styles.statValue}>{stats.attendanceRate}%</Text>
          <Text style={styles.statLabel}>حضور</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>دسترسی سریع</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/(principal)/students")}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: "#fef3c7" }]}>
            <Ionicons name="school" size={28} color="#f59e0b" />
          </View>
          <Text style={styles.quickActionTitle}>شاگردان</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/(principal)/teachers")}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: "#dbeafe" }]}>
            <Ionicons name="people" size={28} color="#3b82f6" />
          </View>
          <Text style={styles.quickActionTitle}>اساتید</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/(principal)/reports")}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: "#d1fae5" }]}>
            <Ionicons name="bar-chart" size={28} color="#10b981" />
          </View>
          <Text style={styles.quickActionTitle}>راپورها</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionCard}
          onPress={() => router.push("/(principal)/profile")}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: "#ede9fe" }]}>
            <Ionicons name="person" size={28} color="#8b5cf6" />
          </View>
          <Text style={styles.quickActionTitle}>پروفایل</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activities */}
      <Text style={styles.sectionTitle}>فعالیت‌های اخیر</Text>
      <View style={styles.activityCard}>
        <View style={styles.activityItem}>
          <View style={styles.activityDot} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>شاگرد جدید ثبت نام شد</Text>
            <Text style={styles.activityDesc}>احمد محمدی - صنف ۱۰</Text>
            <Text style={styles.activityTime}>۳ ساعت پیش</Text>
          </View>
        </View>

        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: "#10b981" }]} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>امتحانات ماهانه تکمیل شد</Text>
            <Text style={styles.activityDesc}>صنف ۹ - ۱۲</Text>
            <Text style={styles.activityTime}>۵ ساعت پیش</Text>
          </View>
        </View>

        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: "#f59e0b" }]} />
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>جلسه اساتید برگزار شد</Text>
            <Text style={styles.activityDesc}>حضور ۲۵ استاد</Text>
            <Text style={styles.activityTime}>۱ روز پیش</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  content: {
    padding: 16,
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  welcomeContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeGreeting: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Vazir",
  },
  welcomeName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "VazirBold",
  },
  welcomeRole: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  welcomeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  statLabel: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
    fontFamily: "VazirBold",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  quickActionCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  activityCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f59e0b",
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  activityDesc: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  activityTime: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
});