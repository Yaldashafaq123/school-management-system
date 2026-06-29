// components/finance/PaymentHistoryItem.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatCurrency } from "@/src/config/financeApi";
import { PaymentRecord } from "@/src/config/financeApi";

interface PaymentHistoryItemProps {
  payment: PaymentRecord;
  onPress?: () => void;
}

export const PaymentHistoryItem: React.FC<PaymentHistoryItemProps> = ({
  payment,
  onPress,
}) => {
  const getMethodIcon = (method: string) => {
    switch (method) {
      case "CASH":
        return "cash-outline";
      case "BANK_TRANSFER":
        return "swap-horizontal-outline";
      case "CARD":
        return "card-outline";
      case "MOBILE_MONEY":
        return "phone-portrait-outline";
      case "CHECK":
        return "document-text-outline";
      default:
        return "cash-outline";
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "CASH":
        return "نقدی";
      case "BANK_TRANSFER":
        return "بانکی";
      case "CARD":
        return "کارت";
      case "MOBILE_MONEY":
        return "موبایلی";
      case "CHECK":
        return "چک";
      default:
        return method;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fa-AF", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("fa-AF", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={getMethodIcon(payment.paymentMethod)}
            size={22}
            color="#10b981"
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.studentName}>{payment.studentName}</Text>
          <Text style={styles.feeTitle}>{payment.feeTitle}</Text>
          <Text style={styles.className}>{payment.className}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.amount}>
          + {formatCurrency(payment.amount)}
        </Text>
        <View style={styles.methodBadge}>
          <Text style={styles.methodText}>
            {getMethodLabel(payment.paymentMethod)}
          </Text>
        </View>
        <Text style={styles.date}>{formatDate(payment.date)}</Text>
        <Text style={styles.time}>{formatTime(payment.date)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderRightWidth: 4,
    borderRightColor: "#10b981",
  },
  leftSection: {
    flexDirection: "row",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ecfdf5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  feeTitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  className: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
    fontFamily: "Vazir",
  },
  rightSection: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10b981",
    fontFamily: "VazirBold",
  },
  methodBadge: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  methodText: {
    fontSize: 11,
    color: "#059669",
    fontFamily: "Vazir",
  },
  date: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  time: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 1,
    fontFamily: "Vazir",
  },
});