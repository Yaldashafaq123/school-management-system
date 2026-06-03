// components/CourseFilters.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { CourseFilter, Class, Subject } from '../types';

interface CourseFiltersProps {
  filters: CourseFilter;
  classes: Class[];
  subjects: Subject[];
  onFilterChange: (filters: CourseFilter) => void;
}

export const CourseFilters: React.FC<CourseFiltersProps> = ({
  filters,
  classes,
  subjects,
  onFilterChange,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  const difficultyOptions = [
    { id: 'beginner', label: 'مقدماتی', icon: 'trending-up' },
    { id: 'intermediate', label: 'متوسط', icon: 'trending-up' },
    { id: 'advanced', label: 'پیشرفته', icon: 'trending-up' },
  ];

  const featureOptions = [
    { id: 'free', label: 'رایگان', icon: 'pricetag' },
    { id: 'certificate', label: 'دارای گواهینامه', icon: 'ribbon' },
  ];

  const resetFilters = () => {
    const newFilters = {};
    setTempFilters(newFilters);
    onFilterChange(newFilters);
    setShowModal(false);
  };

  const applyFilters = () => {
    onFilterChange(tempFilters);
    setShowModal(false);
  };

  const toggleFilter = (key: keyof CourseFilter, value: any) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== undefined).length;
  };

  return (
    <>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="filter" size={20} color={Colors.primary} />
        <Text style={styles.filterButtonText}>فیلترها</Text>
        {getActiveFiltersCount() > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>فیلتر دوره‌ها</Text>
            <TouchableOpacity onPress={resetFilters}>
              <Text style={styles.resetText}>پاک کردن</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Class Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>کلاس</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {classes.map((classItem) => (
                  <TouchableOpacity
                    key={classItem.id}
                    style={[
                      styles.filterChip,
                      tempFilters.class_id === classItem.id && styles.filterChipActive,
                    ]}
                    onPress={() => toggleFilter('class_id', classItem.id)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        tempFilters.class_id === classItem.id && styles.filterChipTextActive,
                      ]}
                    >
                      {classItem.class_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Subject Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>موضوع</Text>
              <View style={styles.filterGrid}>
                {subjects.map((subject) => (
                  <TouchableOpacity
                    key={subject.id}
                    style={[
                      styles.filterChip,
                      styles.gridChip,
                      tempFilters.subject_id === subject.id && styles.filterChipActive,
                    ]}
                    onPress={() => toggleFilter('subject_id', subject.id)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        tempFilters.subject_id === subject.id && styles.filterChipTextActive,
                      ]}
                    >
                      {subject.subject_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Difficulty Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>سطح دشواری</Text>
              <View style={styles.filterGrid}>
                {difficultyOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.filterChip,
                      styles.gridChip,
                      tempFilters.difficulty === option.id && styles.filterChipActive,
                    ]}
                    onPress={() => toggleFilter('difficulty', option.id)}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={16}
                      color={tempFilters.difficulty === option.id ? '#fff' : Colors.text}
                      style={styles.filterIcon}
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        tempFilters.difficulty === option.id && styles.filterChipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Features Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>ویژگی‌ها</Text>
              <View style={styles.filterGrid}>
                {featureOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.filterChip,
                      styles.gridChip,
                      option.id === 'free' && tempFilters.is_free === true && styles.filterChipActive,
                      option.id === 'certificate' && tempFilters.has_certificate === true && styles.filterChipActive,
                    ]}
                    onPress={() => {
                      if (option.id === 'free') {
                        toggleFilter('is_free', tempFilters.is_free ? undefined : true);
                      } else if (option.id === 'certificate') {
                        toggleFilter('has_certificate', tempFilters.has_certificate ? undefined : true);
                      }
                    }}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={16}
                      color={
                        (option.id === 'free' && tempFilters.is_free === true) ||
                        (option.id === 'certificate' && tempFilters.has_certificate === true)
                          ? '#fff'
                          : Colors.text
                      }
                      style={styles.filterIcon}
                    />
                    <Text
                      style={[
                        styles.filterChipText,
                        (option.id === 'free' && tempFilters.is_free === true) ||
                        (option.id === 'certificate' && tempFilters.has_certificate === true)
                          ? styles.filterChipTextActive
                          : null,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>اعمال فیلترها</Text>
              <Text style={styles.filterCount}>
                ({getActiveFiltersCount()} فیلتر انتخاب شده)
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  filterBadge: {
    backgroundColor: Colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  resetText: {
    fontSize: 14,
    color: Colors.danger,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginTop: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 4,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridChip: {
    flex: 1,
    minWidth: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
  },
  filterIcon: {
    marginLeft: 4,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  filterCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
});