// components/finance/FeeTypePicker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const FEE_TYPES = [
  { value: 'MONTHLY_TUITION', label: 'شهریه ماهانه', isRecurring: true },
  { value: 'MONTHLY_TRANSPORT', label: 'حمل و نقل ماهانه', isRecurring: true },
  { value: 'ONE_TIME_ADMISSION', label: 'هزینه پذیرش', isRecurring: false },
  { value: 'ONE_TIME_REGISTRATION', label: 'هزینه ثبت نام', isRecurring: false },
  { value: 'ONE_TIME_BOOKS', label: 'کتاب‌ها', isRecurring: false },
  { value: 'ONE_TIME_UNIFORM', label: 'یونیفورم', isRecurring: false },
  { value: 'ONE_TIME_EXAM', label: 'هزینه امتحانات', isRecurring: false },
  { value: 'ANNUAL', label: 'هزینه سالانه', isRecurring: false },
  { value: 'OTHER', label: 'سایر', isRecurring: false },
];

interface FeeTypePickerProps {
  value: string;
  onSelect: (value: string) => void;
  label?: string;
}

export const FeeTypePicker: React.FC<FeeTypePickerProps> = ({
  value,
  onSelect,
  label = 'نوع فیس',
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.optionsContainer}>
          {FEE_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.option,
                value === type.value && styles.optionActive,
              ]}
              onPress={() => onSelect(type.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  value === type.value && styles.optionTextActive,
                ]}
              >
                {type.label}
              </Text>
              {type.isRecurring && (
                <View style={styles.recurringBadge}>
                  <Text style={styles.recurringBadgeText}>ماهانه</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
    fontFamily: 'Vazir',
  },
  scrollView: {
    flexGrow: 0,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 6,
  },
  optionActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  optionText: {
    fontSize: 13,
    color: '#475569',
    fontFamily: 'Vazir',
  },
  optionTextActive: {
    color: '#3b82f6',
  },
  recurringBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  recurringBadgeText: {
    fontSize: 9,
    color: '#3b82f6',
    fontFamily: 'Vazir',
  },
});