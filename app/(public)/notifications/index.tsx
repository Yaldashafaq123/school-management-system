import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  priority: string;
  createdAt: string;
  eventDate?: string;
  eventLocation?: string;
  linkUrl?: string;
  isRead: boolean;
  isConfirmed?: boolean;
  requireConfirmation?: boolean;
  author: {
    fullName: string;
    role: string;
  };
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedType, setSelectedType] = useState<string>("all");

  const types = [
    { id: "all", label: "همه", icon: "apps" },
    { id: "GENERAL", label: "عمومی", icon: "megaphone" },
    { id: "ASSIGNMENT", label: "کارخانگی", icon: "document-text" },
    { id: "EXAM", label: "آزمون‌ها", icon: "clipboard" },
    { id: "EVENT", label: "رویدادها", icon: "calendar" },
    { id: "FEE", label: "فیس", icon: "cash" },
    { id: "GRADE_RESULT", label: "نمرات", icon: "school" },
    { id: "PARENT_MEETING", label: "جلسات", icon: "people" },
  ];

  const loadAnnouncements = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      const url =
        selectedType === "all"
          ? "https://asraschools.cloud/api/announcements"
          : `https://asraschools.cloud/api/announcements?type=${selectedType}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (result.success) {
        setAnnouncements(result.data.items || []);
      }
    } catch (error) {
      console.error("Error loading announcements:", error);
      Alert.alert("خطا", "مشکلی در بارگذاری اعلامیه‌ها پیش آمد");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedType]);

  const loadUnreadCount = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");

      const response = await fetch(
        "https://asraschools.cloud/api/announcements/unread-count",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();

      if (result.success) {
        setUnreadCount(result.data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
    loadUnreadCount();
  }, [loadAnnouncements, loadUnreadCount]);

  const handleAnnouncementPress = async (announcement: Announcement) => {
    try {
      if (!announcement.isRead) {
        const token = await AsyncStorage.getItem("auth_token");

        await fetch(
          `https://asraschools.cloud/api/announcements/${announcement.id}/read`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === announcement.id ? { ...a, isRead: true } : a
          )
        );

        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }

      router.push(`/(public)/notifications/${announcement.id}` as any);
    } catch (error) {
      console.error("Error marking read:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadAnnouncements(), loadUnreadCount()]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="اعلامیه‌ها"
        showBack
        onBackPress={() => router.back()}
        rightComponent={
          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}

            {(user?.role === "admin" || user?.role === "teacher") && (
              <TouchableOpacity
                onPress={() =>
                  router.push("/(public)/notifications/create" as any)
                }
              >
                <Ionicons name="add-circle" size={28} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {types.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.filterChip,
              selectedType === type.id && styles.filterChipActive,
            ]}
            onPress={() => setSelectedType(type.id)}
          >
            <Ionicons
              name={type.icon as any}
              size={16}
              color={selectedType === type.id ? "#fff" : Colors.text}
            />
            <Text
              style={[
                styles.filterText,
                selectedType === type.id && styles.filterTextActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        {announcements.map((announcement) => (
          <TouchableOpacity
            key={announcement.id}
            style={[
              styles.card,
              !announcement.isRead && styles.unreadCard,
            ]}
            onPress={() => handleAnnouncementPress(announcement)}
          >
            <Text style={styles.title}>{announcement.title}</Text>

            <Text style={styles.content} numberOfLines={2}>
              {announcement.content}
            </Text>

            <View style={styles.footer}>
              <Text style={styles.author}>
                {announcement.author.fullName}
              </Text>
            </View>

            {!announcement.isRead && (
              <View style={styles.unreadDot} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  unreadBadge: {
    backgroundColor: Colors.danger,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  unreadBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  filtersContainer: {
    padding: 10,
  },

  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.card,
    borderRadius: 20,
    marginRight: 8,
    flexDirection: "row",
    gap: 6,
  },

  filterChipActive: {
    backgroundColor: Colors.primary,
  },

  filterText: {
    color: Colors.text,
  },

  filterTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    backgroundColor: Colors.card,
    padding: 16,
    margin: 10,
    borderRadius: 12,
  },

  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },

  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: Colors.text,
  },

  content: {
    marginTop: 4,
    color: Colors.textSecondary,
  },

  footer: {
    marginTop: 8,
  },

  author: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  unreadDot: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});