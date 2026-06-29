// components/finance/PaymentMethodPicker.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PaymentMethod {
  value: string;
  label: string;
  icon: string;
  description?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    value: "CASH",
    label: "نقدی",
    icon: "cash-outline",
    description: "پرداخت به صورت پول نقد",
  },
  {
    value: "BANK_TRANSFER",
    label: "انتقال بانکی",
    icon: "swap-horizontal-outline",
    description: "از طریق حساب بانکی",
  },
  {
    value: "CARD",
    label: "کارت",
    icon: "card-outline",
    description: "پرداخت با کارت بانکی",
  },
  {
    value: "MOBILE_MONEY",
    label: "پول موبایلی",
    icon: "phone-portrait-outline",
    description: "از طریق خدمات موبایلی",
  },
  {
    value: "CHECK",
    label: "چک",
    icon: "document-text-outline",
    description: "پرداخت با چک بانکی",
  },
];

interface PaymentMethodPickerProps {
  value: string;
  onSelect: (method: string) => void;
  label?: string;
  error?: string;
}

export const PaymentMethodPicker: React.FC<PaymentMethodPickerProps> = ({
  value,
  onSelect,
  label = "روش پرداخت",
  error,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedMethod = PAYMENT_METHODS.find((m) => m.value === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.picker, error && styles.pickerError]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        {selectedMethod ? (
          <>
            <View style={styles.selectedContainer}>
              <Ionicons
                name={selectedMethod.icon as any}
                size={22}
                color="#3b82f6"
              />
              <Text style={styles.selectedText}>{selectedMethod.label}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#64748b" />
          </>
        ) : (
          <>
            <Text style={styles.placeholder}>انتخاب کنید...</Text>
            <Ionicons name="chevron-down" size={20} color="#94a3b8" />
          </>
        )}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>انتخاب روش پرداخت</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={PAYMENT_METHODS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.methodItem,
                    item.value === value && styles.methodItemActive,
                  ]}
                  onPress={() => {
                    onSelect(item.value);
                    setModalVisible(false);
                  }}
                >
                  <View
                    style={[
                      styles.methodIcon,
                      item.value === value && styles.methodIconActive,
                    ]}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={item.value === value ? "#fff" : "#3b82f6"}
                    />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodLabel}>{item.label}</Text>
                    {item.description && (
                      <Text style={styles.methodDescription}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                  {item.value === value && (
                    <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              )}
              style={styles.methodList}
            />
          </View>
        </Pressable>
      </Modal>
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
  picker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  pickerError: {
    borderColor: "#ef4444",
  },
  selectedContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectedText: {
    fontSize: 16,
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  placeholder: {
    fontSize: 16,
    color: "#94a3b8",
    fontFamily: "Vazir",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
    fontFamily: "Vazir",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  methodList: {
    paddingHorizontal: 16,
  },
  methodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginVertical: 4,
  },
  methodItemActive: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  methodIconActive: {
    backgroundColor: "#3b82f6",
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    fontFamily: "Vazir",
  },
  methodDescription: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
    fontFamily: "Vazir",
  },
});