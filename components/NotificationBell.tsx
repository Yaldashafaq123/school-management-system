// components/NotificationBell.tsx
// Reusable bell icon with unread badge.
// Drop into any <Header rightComponent={<NotificationBell />} />

import { announcementsApi } from "@/src/config/announcementApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";

const TAG = "[NotificationBell]";

interface NotificationBellProps {
  /** Optional: override the route. Defaults to notifications list */
  route?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  route = "/(public)/notifications",
}) => {
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  const loadUnread = useCallback(async () => {
    try {
      console.log(TAG, "fetching unread count...");

      if (!announcementsApi?.getAnnouncements) {
        console.warn(TAG, "❌ announcementsApi.getAnnouncements missing");
        return;
      }

      const res = await announcementsApi.getAnnouncements({
        page: 1,
        limit: 30,
      });
      console.log(
        TAG,
        "res.success =",
        res?.success,
        "| items =",
        res?.data?.announcements?.length,
      );

      if (res?.success) {
        const items = res.data?.announcements || res.data?.items || [];
        const count = items.filter((a: any) => a.isRead === false).length;
        console.log(TAG, "unread =", count);
        setUnread(count);
      }
    } catch (err: any) {
      console.warn(TAG, "fetch failed:", err?.message || err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUnread();
    }, [loadUnread]),
  );

  const onPress = () => {
    console.log(TAG, "tap → navigating to", route);
    router.push(route as any);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
      activeOpacity={0.7}
      accessibilityLabel="اعلامیه‌ها"
    >
      <Ionicons name="notifications-outline" size={24} color={Colors.text} />
      {unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread > 99 ? "99+" : unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.card,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
  },
});
