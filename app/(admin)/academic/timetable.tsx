import { Calendar, Edit2, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// TypeScript Interfaces
interface Period {
  id: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
  isBreak?: boolean;
}

interface DaySchedule {
  [day: string]: Period[];
}

interface ClassTimetable {
  [classId: string]: DaySchedule;
}

interface NewPeriod {
  time: string;
  subject: string;
  teacher: string;
  room: string;
  isBreak: boolean;
}

export default function TimetableGenerator() {
  const [selectedClass, setSelectedClass] = useState<string>('10A');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [showAddPeriod, setShowAddPeriod] = useState<boolean>(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);

  const classes = ['10A', '10B', '9A', '9B', '11A', '11B', '12A', '12B'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = [
    '8:00 - 8:45', '8:45 - 9:30', '9:30 - 10:15', '10:15 - 11:00',
    '11:00 - 11:45', '11:45 - 12:30', '12:30 - 1:15', '1:15 - 2:00',
  ];

  const subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Geography',
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Physical Education',
  ];

  const teachers = [
    'Mr. John Smith', 'Mrs. Sarah Johnson', 'Mr. Robert Wilson',
    'Ms. Emma Davis', 'Dr. Mike Brown',
  ];

  const rooms = ['Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202', 'Lab 1', 'Lab 2', 'Auditorium'];

  const [timetable, setTimetable] = useState<ClassTimetable>({
    '10A': {
      Monday: [
        { id: '1', time: '8:00 - 8:45', subject: 'Mathematics', teacher: 'Mr. John Smith', room: 'Room 101' },
        { id: '2', time: '8:45 - 9:30', subject: 'Science', teacher: 'Mrs. Sarah Johnson', room: 'Lab 1' },
        { id: '3', time: '9:30 - 10:15', subject: 'English', teacher: 'Mr. Robert Wilson', room: 'Room 102' },
        { id: '4', time: '10:15 - 11:00', subject: 'BREAK', teacher: '', room: '', isBreak: true },
        { id: '5', time: '11:00 - 11:45', subject: 'History', teacher: 'Ms. Emma Davis', room: 'Room 103' },
        { id: '6', time: '11:45 - 12:30', subject: 'Geography', teacher: 'Dr. Mike Brown', room: 'Room 201' },
      ],
      Tuesday: [
        { id: '7', time: '8:00 - 8:45', subject: 'Physics', teacher: 'Mr. John Smith', room: 'Lab 2' },
        { id: '8', time: '8:45 - 9:30', subject: 'Chemistry', teacher: 'Mrs. Sarah Johnson', room: 'Lab 1' },
        { id: '9', time: '9:30 - 10:15', subject: 'Biology', teacher: 'Dr. Mike Brown', room: 'Lab 1' },
        { id: '10', time: '10:15 - 11:00', subject: 'BREAK', teacher: '', room: '', isBreak: true },
        { id: '11', time: '11:00 - 11:45', subject: 'Computer Science', teacher: 'Mr. Robert Wilson', room: 'Room 202' },
        { id: '12', time: '11:45 - 12:30', subject: 'Physical Education', teacher: '', room: 'Playground' },
      ],
    },
  });

  const [newPeriod, setNewPeriod] = useState<NewPeriod>({
    time: '', subject: '', teacher: '', room: '', isBreak: false,
  });

  // Add or Update Period
  const handleAddPeriod = () => {
    if (!newPeriod.time || (!newPeriod.subject && !newPeriod.isBreak)) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const period: Period = {
      id: editingPeriod ? editingPeriod.id : Date.now().toString(),
      ...newPeriod,
      subject: newPeriod.isBreak ? 'BREAK' : newPeriod.subject,
      teacher: newPeriod.isBreak ? '' : newPeriod.teacher,
      room: newPeriod.isBreak ? '' : newPeriod.room,
    };

    setTimetable(prev => {
      const updated = { ...prev };
      if (!updated[selectedClass]) updated[selectedClass] = {};
      if (!updated[selectedClass][selectedDay]) updated[selectedClass][selectedDay] = [];

      if (editingPeriod) {
        const index = updated[selectedClass][selectedDay].findIndex(p => p.id === period.id);
        if (index !== -1) updated[selectedClass][selectedDay][index] = period;
        Alert.alert('Success', 'Period updated successfully');
      } else {
        updated[selectedClass][selectedDay].push(period);
        Alert.alert('Success', 'Period added successfully');
      }
      return updated;
    });

    setShowAddPeriod(false);
    setEditingPeriod(null);
    setNewPeriod({ time: '', subject: '', teacher: '', room: '', isBreak: false });
  };

  const handleEditPeriod = (period: Period) => {
    setEditingPeriod(period);
    setNewPeriod({
      time: period.time,
      subject: period.subject,
      teacher: period.teacher,
      room: period.room,
      isBreak: period.isBreak || false,
    });
    setShowAddPeriod(true);
  };

  const handleDeletePeriod = (periodId: string) => {
    Alert.alert('Delete Period', 'Are you sure you want to delete this period?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          setTimetable(prev => {
            const updated = { ...prev };
            updated[selectedClass][selectedDay] = updated[selectedClass][selectedDay].filter(p => p.id !== periodId);
            return updated;
          });
          Alert.alert('Success', 'Period deleted successfully');
        },
      },
    ]);
  };

  const handleGenerateTimetable = () => Alert.alert('Generate Timetable', 'Timetable generated successfully!');
  const handleExport = () => Alert.alert('Export', 'Timetable exported successfully!');

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      'Mathematics': '#007AFF',
      'Science': '#34C759',
      'English': '#FF9500',
      'History': '#AF52DE',
      'Geography': '#FF2D55',
      'Physics': '#5856D6',
      'Chemistry': '#FF3B30',
      'Biology': '#5AC8FA',
      'Computer Science': '#FFCC00',
      'Physical Education': '#4CD964',
      'BREAK': '#8E8E93',
    };
    return colors[subject] || '#8E8E93';
  };

  const currentSchedule = timetable[selectedClass]?.[selectedDay] || [];

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Timetable Generator</Text>
            <Text style={styles.subtitle}>Create and manage class schedules</Text>
          </View>
          <TouchableOpacity style={styles.generateButton} onPress={handleGenerateTimetable}>
            <Calendar size={20} color="white" />
            <Text style={styles.generateButtonText}>Generate</Text>
          </TouchableOpacity>
        </View>

        {/* Class Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>Select Class</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.selectorButtons}>
              {classes.map(cls => (
                <TouchableOpacity
                  key={cls}
                  style={[styles.selectorButton, selectedClass === cls && styles.selectorButtonActive]}
                  onPress={() => setSelectedClass(cls)}
                >
                  <Text style={[styles.selectorButtonText, selectedClass === cls && styles.selectorButtonTextActive]}>
                    {cls}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Day Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>Select Day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.selectorButtons}>
              {days.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[styles.selectorButton, selectedDay === day && styles.selectorButtonActive]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.selectorButtonText, selectedDay === day && styles.selectorButtonTextActive]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Timetable Grid */}
        <View style={styles.timetableContainer}>
          <View style={styles.timetableHeader}>
            <Text style={styles.timetableTitle}>{selectedClass} - {selectedDay}</Text>
            <TouchableOpacity style={styles.addPeriodButton} onPress={() => { setEditingPeriod(null); setNewPeriod({ time: '', subject: '', teacher: '', room: '', isBreak: false }); setShowAddPeriod(true); }}>
              <Plus size={20} color="white" />
              <Text style={styles.addPeriodButtonText}>Add Period</Text>
            </TouchableOpacity>
          </View>

          {currentSchedule.length === 0 ? (
            <View style={styles.emptyTimetable}>
              <Calendar size={48} color="#8E8E93" />
              <Text style={styles.emptyTitle}>No Schedule Yet</Text>
              <Text style={styles.emptyText}>No periods scheduled for {selectedClass} on {selectedDay}</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddPeriod(true)}>
                <Text style={styles.emptyButtonText}>Add First Period</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.timetableGrid}>
              {currentSchedule.map(period => (
                <TouchableOpacity
                  key={period.id}
                  style={[styles.periodCard, period.isBreak && styles.breakCard, { borderLeftColor: period.isBreak ? '#8E8E93' : getSubjectColor(period.subject) }]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <View style={styles.periodHeader}>
                    <Text style={styles.periodTime}>{period.time}</Text>
                    <View style={styles.periodActions}>
                      <TouchableOpacity style={styles.periodActionButton} onPress={() => handleEditPeriod(period)}>
                        <Edit2 size={14} color="#007AFF" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.periodActionButton} onPress={() => handleDeletePeriod(period.id)}>
                        <Trash2 size={14} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {period.isBreak ? (
                    <Text style={styles.breakText}>BREAK</Text>
                  ) : (
                    <>
                      <Text style={styles.periodSubject}>{period.subject}</Text>
                      <View style={styles.periodDetails}>
                        <Text style={styles.periodTeacher}>{period.teacher}</Text>
                        <Text style={styles.periodRoom}>{period.room}</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1d1d1f',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  selectorContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 12,
  },
  selectorButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  selectorButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
  },
  selectorButtonActive: {
    backgroundColor: '#007AFF',
  },
  selectorButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  selectorButtonTextActive: {
    color: 'white',
  },
  timetableContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  timetableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  timetableTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  addPeriodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addPeriodButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyTimetable: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e5ea',
    borderStyle: 'dashed',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  timetableGrid: {
    gap: 12,
  },
  periodCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  breakCard: {
    backgroundColor: '#f8f9fa',
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  periodActions: {
    flexDirection: 'row',
    gap: 8,
  },
  periodActionButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8E8E93',
    textAlign: 'center',
  },
  periodSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  periodDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodTeacher: {
    fontSize: 14,
    color: '#8E8E93',
  },
  periodRoom: {
    fontSize: 14,
    color: '#8E8E93',
  },
  actionsContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1d1d1f',
    marginTop: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#8E8E93',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1d1d1f',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  optionTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  breakToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d1d6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  breakLabel: {
    fontSize: 16,
    color: '#1d1d1f',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  periodDetailsModal: {
    padding: 20,
    alignItems: 'center',
  },
  periodIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  periodIconText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  periodDetailsTime: {
    fontSize: 18,
    color: '#8E8E93',
    marginBottom: 8,
  },
  periodDetailsSubject: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  detailLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1d1d1f',
  },
});