import { Colors } from "@/constants/Colors";
import { formatCurrency } from "@/src/config/financeApi";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  maxAmount?: number;
  showPreview?: boolean;
  required?: boolean;
}

export function AmountInput({ 
  value, 
  onChange, 
  label, 
  placeholder = "مبلغ را وارد کنید",
  error,
  maxAmount,
  showPreview = true,
  required = false
}: AmountInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  const numericValue = parseFloat(value);
  const previewAmount = !isNaN(numericValue) && numericValue > 0 ? formatCurrency(numericValue) : '';
  const isExceeded = maxAmount && numericValue > maxAmount;

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  const handleChange = (text: string) => {
    // Allow only numbers and decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    const sanitized = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
    onChange(sanitized);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
      ]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          keyboardType="decimal-pad"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          textAlign="center"
        />
        <Text style={styles.currency}>AFN</Text>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {isExceeded && (
        <Text style={styles.warningText}>
          مبلغ وارد شده بیشتر از حد مجاز ({formatCurrency(maxAmount!)}) است
        </Text>
      )}

      {showPreview && previewAmount && !error && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewLabel}>پیش‌نمایش:</Text>
          <Text style={styles.previewValue}>{previewAmount}</Text>
        </View>
      )}

      {/* Quick Amount Buttons */}
      <View style={styles.quickAmounts}>
        {quickAmounts.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[
              styles.quickAmountBtn,
              value === amount.toString() && styles.quickAmountBtnActive,
            ]}
            onPress={() => onChange(amount.toString())}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.quickAmountText,
              value === amount.toString() && styles.quickAmountTextActive,
            ]}>
              {formatCurrency(amount)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    fontFamily: 'Vazirmatn',
    marginBottom: 8,
    textAlign: 'right',
  },
  required: {
    color: Colors.danger,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputContainerFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: Colors.danger,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    fontFamily: 'Vazirmatn',
    textAlign: 'center',
  },
  currency: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'Vazirmatn',
    backgroundColor: Colors.background,
    height: '100%',
    textAlignVertical: 'center',
    paddingVertical: 14,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    fontFamily: 'Vazirmatn',
    marginTop: 6,
    textAlign: 'right',
  },
  warningText: {
    fontSize: 12,
    color: Colors.warning,
    fontFamily: 'Vazirmatn',
    marginTop: 6,
    textAlign: 'right',
  },
  previewContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  previewLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Vazirmatn',
  },
  previewValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    fontFamily: 'Vazirmatn',
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  quickAmountBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickAmountBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  quickAmountText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Vazirmatn',
  },
  quickAmountTextActive: {
    color: 'white',
    fontWeight: '500',
  },
});