// components/finance/MonthPicker.tsx
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
import { getAfghanMonths } from "@/src/config/financeApi";

interface MonthPickerProps {
  value?: string;
  onSelect: (month: string) => void;
  label?: string;
  showYear?: boolean;
  year?: number;
  onYearChange?: (year: number) => void;
}

export const MonthPicker: React.FC<MonthPickerProps> = ({
  value,
  onSelect,
  label = "انتخاب ماه",
  showYear = false,
  year = 1403,
  onYearChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const months = getAfghanMonths();

  const selectedMonth = months.find((m) => m.key === value);

  const handleYearChange = (increment: number) => {
    if (onYearChange) {
      onYearChange(year + increment);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.picker}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        {selectedMonth ? (
          <View style={styles.selectedContainer}>
            <Ionicons name="calendar" size={22} color="#3b82f6" />
            <Text style={styles.selectedText}>
              {selectedMonth.name}
              {showYear && ` ${year}`}
            </Text>
          </View>
        ) : (
          <View style={styles.selectedContainer}>
            <Ionicons name="calendar" size={22} color="#94a3b8" />
            <Text style={styles.placeholder}>انتخاب کنید...</Text>
          </View>
        )}
        <Ionicons name="chevron-down" size={20} color="#64748b" />
      </TouchableOpacity>

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
              <Text style={styles.modalTitle}>انتخاب ماه</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {showYear && (
              <View style={styles.yearSelector}>
                <TouchableOpacity
                  style={styles.yearButton}
                  onPress={() => handleYearChange(-1)}
                >
                  <Ionicons name="chevron-back" size={24} color="#3b82f6" />
                </TouchableOpacity>
                <Text style={styles.yearText}>{year}</Text>
                <TouchableOpacity
                  style={styles.yearButton}
                  onPress={() => handleYearChange(1)}
                >
                  <Ionicons name="chevron-forward" size={24} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            )}

            <FlatList
              data={months}
              keyExtractor={(item) => item.key}
              numColumns={3}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.monthItem,
                    item.key === value && styles.monthItemActive,
                  ]}
                  onPress={() => {
                    onSelect(item.key);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.monthText,
                      item.key === value && styles.monthTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.monthsGrid}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  yearSelector: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    gap: 20,
  },
  yearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  yearText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    fontFamily: "VazirBold",
  },
  monthsGrid: {
    padding: 16,
    gap: 8,
  },
  monthItem: {
    flex: 1,
    margin: 4,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  monthItemActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
  },
  monthText: {
    fontSize: 15,
    color: "#475569",
    fontFamily: "Vazir",
  },
  monthTextActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },
});