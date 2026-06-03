import { Colors } from "@/constants/Colors";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";

interface LoadingSkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function LoadingSkeleton({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}: LoadingSkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[styles.skeleton, { width, height, borderRadius, opacity }, style]}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      {/* Stats Row */}
      <View style={styles.statsRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.statCard}>
            <LoadingSkeleton width={40} height={40} borderRadius={20} />
            <LoadingSkeleton width={80} height={24} style={{ marginTop: 8 }} />
            <LoadingSkeleton width={60} height={14} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        {[1, 2, 3].map((i) => (
          <LoadingSkeleton key={i} width="31%" height={80} borderRadius={12} />
        ))}
      </View>

      {/* Section Title */}
      <LoadingSkeleton
        width={120}
        height={20}
        style={{ marginTop: 16, marginBottom: 12 }}
      />

      {/* Transaction List */}
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.transactionItem}>
          <LoadingSkeleton width={40} height={40} borderRadius={20} />
          <View style={styles.transactionInfo}>
            <LoadingSkeleton width="60%" height={16} />
            <LoadingSkeleton width="40%" height={12} style={{ marginTop: 4 }} />
          </View>
          <LoadingSkeleton width={80} height={20} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  skeleton: {
    backgroundColor: `${Colors.textSecondary}20`,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  transactionInfo: {
    flex: 1,
  },
});
