// components/finance/OutstandingBadge.tsx
import { formatCurrency } from "@/src/config/financeApi";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface OutstandingBadgeProps {
  count?: number;
  amount?: number;
  type?: "warning" | "danger" | "success" | "info";
  label?: string;
  showIcon?: boolean;
}

export const OutstandingBadge: React.FC<OutstandingBadgeProps> = ({
  count,
  amount,
  type = "warning",
  label,
  showIcon = true,
}) => {
  const config = {
    warning: {
      bg: "#fef3c7",
      text: "#d97706",
      icon: "alert-circle",
      defaultLabel: "معوق",
    },
    danger: {
      bg: "#fecaca",
      text: "#dc2626",
      icon: "warning",
      defaultLabel: "بدهکار",
    },
    success: {
      bg: "#d1fae5",
      text: "#059669",
      icon: "checkmark-circle",
      defaultLabel: "پرداخت شده",
    },
    info: {
      bg: "#dbeafe",
      text: "#2563eb",
      icon: "information-circle",
      defaultLabel: "اطلاعات",
    },
  };

  const { bg, text, icon, defaultLabel } = config[type];

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {showIcon && <Ionicons name={icon as any} size={16} color={text} />}
      <Text style={[styles.text, { color: text }]}>
        {label || defaultLabel}
      </Text>
      {count !== undefined && count > 0 && (
        <View style={[styles.countBadge, { backgroundColor: text }]}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      )}
      {amount !== undefined && amount > 0 && (
        <Text style={[styles.amountText, { color: text }]}>
          {formatCurrency(amount)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Vazir",
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  countText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "Vazir",
  },
  amountText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: "VazirBold",
  },
});
