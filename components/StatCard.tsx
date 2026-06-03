import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onPress?: () => void;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  icon,
  color = Colors.primary,
  trend,
  onPress,
  loading,
}: StatCardProps) {
  const CardContent = () => (
    <View style={[styles.card, onPress && styles.cardPressable]}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>

        {loading ? (
          <View style={styles.skeleton} />
        ) : (
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={[styles.value, { color }]}
          >
            {value}
          </Text>
        )}

        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={trend.isPositive ? "trending-up" : "trending-down"}
              size={12}
              color={trend.isPositive ? Colors.success : Colors.danger}
            />
            <Text
              style={[
                styles.trendText,
                {
                  color: trend.isPositive ? Colors.success : Colors.danger,
                },
              ]}
            >
              {trend.value}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.wrapper}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.wrapper}>
      <CardContent />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },

  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    minHeight: 90,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  cardPressable: {
    opacity: 0.95,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: "Vazirmatn",
    marginBottom: 4,
    textAlign: "right",
  },

  value: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Vazirmatn",
  },

  skeleton: {
    height: 22,
    width: 70,
    backgroundColor: `${Colors.textSecondary}20`,
    borderRadius: 6,
  },

  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },

  trendText: {
    fontSize: 10,
    fontFamily: "Vazirmatn",
  },
});
