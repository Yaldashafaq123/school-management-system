import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { Calendar, Clock, X } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Exam {
  id: string;
  name: string;
  subject: string;
  class: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  room: string;
  invigilator: string;
  totalMarks: number;
  passingMarks: number;
  isPublished: boolean;
  students: number;
}

interface ExamModalProps {
  visible: boolean;
  exam: Exam | null;
  onClose: () => void;
  onSave: (exam: Exam) => void;
}

export function ExamModal({ visible, exam, onClose, onSave }: ExamModalProps) {
  const [form, setForm] = useState({
    name: '',
    subject: '',
    class: '',
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    room: '',
    invigilator: '',
    totalMarks: '',
    passingMarks: '',
    isPublished: false,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const classes = ['9A', '9B', '9C', '10A', '10B', '10C', '11A', '11B', '11C', '12A', '12B', '12C'];
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Computer Science', 'Economics', 'Business Studies'];
  const rooms = ['Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202', 'Room 203', 'Lab 1', 'Lab 2', 'Lab 3', 'Auditorium'];
  const teachers = ['Mr. Johnson', 'Dr. Smith', 'Mrs. Wilson', 'Mr. Brown', 'Ms. Davis', 'Prof. Taylor', 'Dr. Lee'];

  useEffect(() => {
    if (exam) {
      setForm({
        name: exam.name,
        subject: exam.subject,
        class: exam.class,
        date: new Date(exam.date),
        startTime: new Date(`2000-01-01T${exam.startTime}`),
        endTime: new Date(`2000-01-01T${exam.endTime}`),
        room: exam.room,
        invigilator: exam.invigilator,
        totalMarks: exam.totalMarks.toString(),
        passingMarks: exam.passingMarks.toString(),
        isPublished: exam.isPublished,
      });
    } else {
      setForm({
        name: '',
        subject: '',
        class: '',
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        room: '',
        invigilator: '',
        totalMarks: '',
        passingMarks: '',
        isPublished: false,
      });
    }
  }, [exam]);

  const calculateDuration = (start: Date, end: Date) => {
    const totalMinutes = (end.getHours() * 60 + end.getMinutes()) - (start.getHours() * 60 + start.getMinutes());
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
  };

  const handleSave = () => {
    if (!form.name || !form.subject || !form.class || !form.room) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const duration = calculateDuration(form.startTime, form.endTime);
    const now = new Date();
    const status = form.date > now ? 'upcoming' : 
                  form.date.toDateString() === now.toDateString() ? 'ongoing' : 'completed';

    const examData: Exam = {
      id: exam?.id || Date.now().toString(),
      name: form.name,
      subject: form.subject,
      class: form.class,
      date: form.date.toISOString().split('T')[0],
      startTime: form.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: form.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      duration,
      room: form.room,
      invigilator: form.invigilator,
      status,
      totalMarks: parseInt(form.totalMarks) || 0,
      passingMarks: parseInt(form.passingMarks) || 0,
      isPublished: form.isPublished,
      students: exam?.students || 0,
    };

    onSave(examData);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {exam ? 'Edit Exam' : 'Create New Exam'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Exam Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Mid-Term Mathematics"
                    value={form.name}
                    onChangeText={(text) => setForm({ ...form, name: text })}
                  />
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Subject *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Select subject"
                      value={form.subject}
                      onChangeText={(text) => setForm({ ...form, subject: text })}
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Class *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Select class"
                      value={form.class}
                      onChangeText={(text) => setForm({ ...form, class: text })}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Schedule</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Date *</Text>
                  <TouchableOpacity 
                    style={styles.dateInput}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Calendar size={20} color="#8E8E93" />
                    <Text style={styles.dateText}>
                      {form.date.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={form.date}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setForm({ ...form, date: selectedDate });
                      }}
                    />
                  )}
                </View>

                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Start Time *</Text>
                    <TouchableOpacity 
                      style={styles.timeInput}
                      onPress={() => setShowStartTimePicker(true)}
                    >
                      <Clock size={20} color="#8E8E93" />
                      <Text style={styles.timeText}>
                        {form.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </TouchableOpacity>
                    {showStartTimePicker && (
                      <DateTimePicker
                        value={form.startTime}
                        mode="time"
                        display="default"
                        onChange={(event, time) => {
                          setShowStartTimePicker(false);
                          if (time) setForm({ ...form, startTime: time });
                        }}
                      />
                    )}
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>End Time *</Text>
                    <TouchableOpacity 
                      style={styles.timeInput}
                      onPress={() => setShowEndTimePicker(true)}
                    >
                      <Clock size={20} color="#8E8E93" />
                      <Text style={styles.timeText}>
                        {form.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </TouchableOpacity>
                    {showEndTimePicker && (
                      <DateTimePicker
                        value={form.endTime}
                        mode="time"
                        display="default"
                        onChange={(event, time) => {
                          setShowEndTimePicker(false);
                          if (time) setForm({ ...form, endTime: time });
                        }}
                      />
                    )}
                  </View>
                </View>

                <View style={styles.durationContainer}>
                  <Text style={styles.durationLabel}>Duration:</Text>
                  <Text style={styles.durationValue}>
                    {calculateDuration(form.startTime, form.endTime) || 'Select start and end time'}
                  </Text>
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Marks & Settings</Text>
                
                <View style={styles.formRow}>
                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Total Marks</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 100"
                      value={form.totalMarks}
                      onChangeText={(text) => setForm({ ...form, totalMarks: text })}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Passing Marks</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 40"
                      value={form.passingMarks}
                      onChangeText={(text) => setForm({ ...form, passingMarks: text })}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.publishContainer}>
                  <View style={styles.publishInfo}>
                    <Text style={styles.publishLabel}>Publish Exam</Text>
                    <Text style={styles.publishDescription}>
                      {form.isPublished 
                        ? 'Exam will be visible to students' 
                        : 'Exam will remain in draft mode'}
                    </Text>
                  </View>
                  <Switch
                    value={form.isPublished}
                    onValueChange={(value) => setForm({ ...form, isPublished: value })}
                    trackColor={{ false: '#f2f2f7', true: '#34C759' }}
                    thumbColor="white"
                  />
                </View>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>
                  {exam ? 'Update Exam' : 'Create Exam'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
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
  modalBody: {
    padding: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#1d1d1f',
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    gap: 12,
  },
  timeText: {
    fontSize: 16,
    color: '#1d1d1f',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  durationLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  durationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  publishContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  publishInfo: {
    flex: 1,
  },
  publishLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  publishDescription: {
    fontSize: 14,
    color: '#8E8E93',
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
});