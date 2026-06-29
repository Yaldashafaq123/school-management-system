// components/finance/FilterBar.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FilterOption {
  key: string;
  label: string;
  icon?: string;
}

interface FilterBarProps {
  options: FilterOption[];
  selected: string;
  onSelect: (key: string) => void;
  showIcon?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  options = [], // DEFAULT to empty array
  selected,
  onSelect,
  showIcon = true,
}) => {
  // Safety check
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {(options || []).map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterButton,
              selected === option.key && styles.filterButtonActive,
            ]}
            onPress={() => onSelect(option.key)}
          >
            {showIcon && option.icon && (
              <Ionicons
                name={option.icon as any}
                size={16}
                color={selected === option.key ? "#fff" : "#64748b"}
              />
            )}
            <Text
              style={[
                styles.filterText,
                selected === option.key && styles.filterTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  scrollContent: {
    gap: 8,
    paddingRight: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  filterText: {
    fontSize: 13,
    color: "#64748b",
    fontFamily: "Vazir",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});