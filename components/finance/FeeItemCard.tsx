// components/finance/FeeItemCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency, getFeeStatusColor, getFeeStatusLabel } from "@/src/config/financeApi";

interface FeeItemCardProps {
  name: string;
  amount: number;
  paid?: number;
  balance?: number;
  status: "PENDING" | "PAID" | "PARTIAL" | "OVERDUE" | "CANCELLED";
  month?: string;
  monthName?: string;
  year?: number;
  isRecurring?: boolean;
  feeType?: string;
  onPress?: () => void;
  onPay?: () => void;
}

export const FeeItemCard: React.FC<FeeItemCardProps> = ({
  name,
  amount,
  paid = 0,
  balance,
  status,
  month,
  monthName,
  year,
  isRecurring = false,
  feeType,
  onPress,
  onPay,
}) => {
  const statusColor = getFeeStatusColor(status);
  const statusLabel = getFeeStatusLabel(status);
  const displayBalance = balance !== undefined ? balance : amount - paid;
  const percentage = amount > 0 ? Math.round((paid / amount) * 100) : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.leftSection}>
        <View style={[styles.typeIndicator, { backgroundColor: statusColor }]}>
          <Ionicons
            name={
              isRecurring ? "repeat" : "receipt-outline"
            }
            size={20}
            color="#fff"
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          {month && (
            <Text style={styles.month}>
              {monthName || month} {year || ""}
            </Text>
          )}
          {feeType && <Text style={styles.type}>{feeType}</Text>}
        </View>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{formatCurrency(amount)}</Text>
          {displayBalance > 0 && status !== "CANCELLED" && (
            <Text style={styles.balance}>
              باقی: {formatCurrency(displayBalance)}
            </Text>
          )}
        </View>

        {isRecurring && status !== "CANCELLED" && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${percentage}%`, backgroundColor: statusColor },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: statusColor }]}>
              {percentage}%
            </Text>
          </View>
        )}

        <View style={styles.statusRow}>
          <View
            style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}
          >
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>

          {onPay && (status === "PENDING" || status === "PARTIAL") && (
            <TouchableOpacity style={styles.payButton} onPress={onPay}>
              <Ionicons name="wallet-outline" size={18} color="#fff" />
              <Text style={styles.payText}>پرداخت</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  typeIndicator: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  month: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  type: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  rightSection: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 12,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  balance: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    width: 100,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e2e8f0",
    borderRadius: 2,
    marginRight: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b981",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  payText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
});