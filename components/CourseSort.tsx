// components/CourseSort.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { SortOption } from '../types';

interface CourseSortProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: SortOption[] = [
  { id: 'popular', label: 'محبوب‌ترین', field: 'popularity', order: 'desc' },
  { id: 'latest', label: 'جدیدترین', field: 'created_at', order: 'desc' },
  { id: 'rating', label: 'بالاترین امتیاز', field: 'rating', order: 'desc' },
  { id: 'price_low', label: 'قیمت (کم به زیاد)', field: 'price', order: 'asc' },
  { id: 'price_high', label: 'قیمت (زیاد به کم)', field: 'price', order: 'desc' },
  { id: 'title', label: 'نام دوره', field: 'title', order: 'asc' },
];

export const CourseSort: React.FC<CourseSortProps> = ({
  currentSort,
  onSortChange,
}) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="swap-vertical" size={20} color={Colors.text} />
        <Text style={styles.sortButtonText}>{currentSort.label}</Text>
        <Ionicons name="chevron-down" size={16} color={Colors.text} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>مرتب‌سازی بر اساس</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortOption,
                  currentSort.id === option.id && styles.sortOptionActive,
                ]}
                onPress={() => {
                  onSortChange(option);
                  setShowModal(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    currentSort.id === option.id && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {currentSort.id === option.id && (
                  <Ionicons name="checkmark" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  sortButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sortOptionActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
  },
  sortOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  sortOptionTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});