import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onApply: () => void;
  onClear: () => void;
}

export function DateRangePicker({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange, 
  onApply, 
  onClear 
}: DateRangePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const hasDates = startDate || endDate;

  const handleApply = () => {
    onStartDateChange(tempStartDate);
    onEndDateChange(tempEndDate);
    onApply();
    setModalVisible(false);
  };

  const handleClear = () => {
    setTempStartDate('');
    setTempEndDate('');
    onStartDateChange('');
    onEndDateChange('');
    onClear();
    setModalVisible(false);
  };

  const onStartDateSelected = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setTempStartDate(formatted);
    }
  };

  const onEndDateSelected = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      setTempEndDate(formatted);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, hasDates && styles.buttonActive]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar" size={16} color={hasDates ? 'white' : Colors.primary} />
        <Text style={[styles.buttonText, hasDates && styles.buttonTextActive]}>
          {startDate && endDate ? `${startDate} - ${endDate}` : 'انتخاب بازه زمانی'}
        </Text>
        {hasDates && (
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={16} color="white" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>انتخاب بازه زمانی</Text>
              <TouchableOpacity onPress={handleClear}>
                <Text style={styles.clearText}>پاک کردن</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Start Date */}
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>از تاریخ</Text>
                <TouchableOpacity 
                  style={styles.dateInput}
                  onPress={() => setShowStartPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dateValue}>{tempStartDate || 'انتخاب کنید'}</Text>
                  <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* End Date */}
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>تا تاریخ</Text>
                <TouchableOpacity 
                  style={styles.dateInput}
                  onPress={() => setShowEndPicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dateValue}>{tempEndDate || 'انتخاب کنید'}</Text>
                  <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Apply Button */}
              <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.7}>
                <Text style={styles.applyButtonText}>اعمال بازه</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DateTimePicker for iOS/Android */}
      {showStartPicker && (
        <DateTimePicker
          value={tempStartDate ? new Date(tempStartDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onStartDateSelected}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={tempEndDate ? new Date(tempEndDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onEndDateSelected}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  buttonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  buttonText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'Vazirmatn',
  },
  buttonTextActive: {
    color: 'white',
  },
  clearBtn: {
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.text,
    fontFamily: 'Vazirmatn',
  },
  clearText: {
    fontSize: 14,
    color: Colors.danger,
    fontFamily: 'Vazirmatn',
  },
  modalBody: {
    padding: 16,
    gap: 16,
  },
  dateField: {
    gap: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Vazirmatn',
    textAlign: 'right',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 12,
  },
  dateValue: {
    fontSize: 14,
    color: Colors.text,
    fontFamily: 'Vazirmatn',
  },
  applyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Vazirmatn',
  },
});