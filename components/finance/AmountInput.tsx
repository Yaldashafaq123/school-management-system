// components/finance/AmountInput.tsx
import React from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";

interface AmountInputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  currency?: string;
  error?: string;
  maxAmount?: number;
  disabled?: boolean;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChangeText,
  label = "مبلغ",
  placeholder = "۰",
  currency = "افغانی",
  error,
  maxAmount,
  disabled = false,
}) => {
  const handleChange = (text: string) => {
    // Only allow numbers
    const cleaned = text.replace(/[^0-9]/g, "");
    if (maxAmount && Number(cleaned) > maxAmount) {
      return;
    }
    onChangeText(cleaned);
  };

  const formatDisplay = (text: string) => {
    if (!text) return "";
    return Number(text).toLocaleString("fa-AF");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error && styles.inputError, disabled && styles.disabled]}>
        <View style={styles.currencyBadge}>
          <Text style={styles.currencyText}>{currency}</Text>
        </View>
        <TextInput
          style={styles.input}
          value={formatDisplay(value)}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor="#cbd5e1"
          keyboardType="numeric"
          editable={!disabled}
          textAlign="right"
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {maxAmount && (
        <Text style={styles.hint}>
          حداکثر: {maxAmount.toLocaleString("fa-AF")} {currency}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
    fontFamily: "Vazir",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    overflow: "hidden",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  disabled: {
    backgroundColor: "#f1f5f9",
    opacity: 0.7,
  },
  currencyBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  currencyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
    fontFamily: "Vazir",
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: "VazirBold",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  hint: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    fontFamily: "Vazir",
  },
});