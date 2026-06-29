// components/finance/CollectionProgress.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatCurrency } from "@/src/config/financeApi";

interface CollectionProgressProps {
  collected: number;
  total: number;
  label?: string;
  showAmounts?: boolean;
  size?: "small" | "medium" | "large";
}

export const CollectionProgress: React.FC<CollectionProgressProps> = ({
  collected,
  total,
  label = "نرخ وصول",
  showAmounts = true,
  size = "medium",
}) => {
  const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;
  
  const getColor = () => {
    if (percentage >= 90) return "#10b981";
    if (percentage >= 70) return "#3b82f6";
    if (percentage >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const color = getColor();
  const barHeight = size === "small" ? 6 : size === "large" ? 12 : 8;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentage, { color }]}>{percentage}%</Text>
        </View>
      </View>

      <View style={[styles.progressBar, { height: barHeight }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      {showAmounts && (
        <View style={styles.amounts}>
          <View style={styles.amountItem}>
            <View style={[styles.amountDot, { backgroundColor: color }]} />
            <Text style={styles.amountLabel}>وصول شده:</Text>
            <Text style={[styles.amountValue, { color }]}>
              {formatCurrency(collected)}
            </Text>
          </View>
          <View style={styles.amountItem}>
            <View style={[styles.amountDot, { backgroundColor: "#e2e8f0" }]} />
            <Text style={styles.amountLabel}>باقیمانده:</Text>
            <Text style={styles.amountValue}>
              {formatCurrency(total - collected)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    fontFamily: "Vazir",
  },
  percentageContainer: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentage: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
  progressBar: {
    backgroundColor: "#e2e8f0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  amounts: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  amountItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  amountDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  amountLabel: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
});