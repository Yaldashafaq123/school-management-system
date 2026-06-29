// components/finance/FinanceCard.tsx
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";

interface FinanceCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  gradientColors?: [string, string];
  onPress?: () => void;
  style?: ViewStyle;
  variant?: "default" | "compact" | "large";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const FinanceCard: React.FC<FinanceCardProps> = ({
  title,
  value,
  subtitle,
  icon = "cash-outline",
  iconColor = "#fff",
  gradientColors = ["#3b82f6", "#2563eb"],
  onPress,
  style,
  variant = "default",
  trend,
}) => {
  const cardHeight =
    variant === "compact" ? 100 : variant === "large" ? 160 : 130;

  const CardContent = () => (
    <LinearGradient
      colors={gradientColors}
      style={[styles.card, { height: cardHeight }, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={22} color={iconColor} />
        </View>
        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={trend.isPositive ? "trending-up" : "trending-down"}
              size={16}
              color="#fff"
            />
            <Text style={styles.trendText}>
              {trend.isPositive ? "+" : "-"}
              {Math.abs(trend.value)}%
            </Text>
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={styles.cardWrapper}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.cardWrapper}>
      <CardContent />
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    flex: 1,
    margin: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    justifyContent: "flex-end",
  },
  value: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    fontFamily: "VazirBold",
  },
  title: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  subtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
    fontFamily: "Vazir",
  },
});
