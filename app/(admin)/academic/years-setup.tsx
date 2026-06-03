import { Calendar, Edit2, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Term {
  id: string;
  name: string;
  start: string;
  end: string;
}

interface Holiday {
  id: string;
  name: string;
  start: string;
  end: string;
}

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  terms: Term[];
  holidays: Holiday[];
}

export default function AcademicYearSetup() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([
    {
      id: '1',
      name: '2024-2025',
      startDate: '2024-06-01',
      endDate: '2025-05-31',
      isActive: true,
      terms: [
        { id: '1', name: 'Term 1', start: '2024-06-01', end: '2024-09-30' },
        { id: '2', name: 'Term 2', start: '2024-10-01', end: '2025-01-31' },
        { id: '3', name: 'Term 3', start: '2025-02-01', end: '2025-05-31' },
      ],
      holidays: [
        { id: '1', name: 'Summer Break', start: '2024-05-15', end: '2024-05-31' },
        { id: '2', name: 'Winter Break', start: '2024-12-23', end: '2025-01-05' },
      ],
    },
  ]);

  const [newYear, setNewYear] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });

  const addAcademicYear = () => {
    if (!newYear.name || !newYear.startDate || !newYear.endDate) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const newYearObj: AcademicYear = {
      id: Date.now().toString(),
      name: newYear.name,
      startDate: newYear.startDate,
      endDate: newYear.endDate,
      isActive: false,
      terms: [],
      holidays: [],
    };

    setAcademicYears([...academicYears, newYearObj]);
    setNewYear({ name: '', startDate: '', endDate: '' });
  };

  const setActiveYear = (yearId: string) => {
    const updatedYears = academicYears.map((year) => ({
      ...year,
      isActive: year.id === yearId,
    }));
    setAcademicYears(updatedYears);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Calendar size={24} color="#007AFF" />
        <Text style={styles.headerTitle}>Academic Year Setup</Text>
      </View>

      {/* Add New Year Form */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Add New Academic Year</Text>
        <TextInput
          style={styles.input}
          placeholder="Academic Year (e.g., 2024-2025)"
          value={newYear.name}
          onChangeText={(text) => setNewYear({ ...newYear, name: text })}
        />
        <View style={styles.dateRow}>
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>Start Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={newYear.startDate}
              onChangeText={(text) => setNewYear({ ...newYear, startDate: text })}
            />
          </View>
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>End Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={newYear.endDate}
              onChangeText={(text) => setNewYear({ ...newYear, endDate: text })}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={addAcademicYear}>
          <Plus size={20} color="white" />
          <Text style={styles.addButtonText}>Add Academic Year</Text>
        </TouchableOpacity>
      </View>

      {/* Academic Years List */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Academic Years</Text>
        {academicYears.map((year) => (
          <View key={year.id} style={styles.yearCard}>
            <View style={styles.yearHeader}>
              <View style={styles.yearInfo}>
                <Text style={styles.yearName}>{year.name}</Text>
                <Text style={styles.yearDates}>
                  {year.startDate} to {year.endDate}
                </Text>
              </View>
              <View style={styles.yearActions}>
                <Switch value={year.isActive} onValueChange={() => setActiveYear(year.id)} />
                <Text style={styles.activeLabel}>{year.isActive ? 'Active' : 'Set Active'}</Text>
              </View>
            </View>

            {/* Terms Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Terms ({year.terms.length})</Text>
              {year.terms.map((term) => (
                <View key={term.id} style={styles.termItem}>
                  <Text style={styles.termName}>{term.name}</Text>
                  <Text style={styles.termDates}>
                    {term.start} - {term.end}
                  </Text>
                  <TouchableOpacity style={styles.iconButton}>
                    <Edit2 size={16} color="#8E8E93" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton}>
                    <Trash2 size={16} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addTermButton}>
                <Plus size={16} color="#007AFF" />
                <Text style={styles.addTermText}>Add Term</Text>
              </TouchableOpacity>
            </View>

            {/* Holidays Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Holidays ({year.holidays.length})</Text>
              {year.holidays.map((holiday) => (
                <View key={holiday.id} style={styles.holidayItem}>
                  <Text style={styles.holidayName}>{holiday.name}</Text>
                  <Text style={styles.holidayDates}>
                    {holiday.start} - {holiday.end}
                  </Text>
                  <TouchableOpacity style={styles.iconButton}>
                    <Trash2 size={16} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addTermButton}>
                <Plus size={16} color="#007AFF" />
                <Text style={styles.addTermText}>Add Holiday</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e5ea' },
  headerTitle: { fontSize: 20, fontWeight: '600', marginLeft: 12, color: '#1d1d1f' },
  formCard: { backgroundColor: 'white', margin: 16, padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#e5e5ea' },
  formTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#1d1d1f' },
  input: { borderWidth: 1, borderColor: '#d1d1d6', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  dateInputContainer: { flex: 1, marginHorizontal: 4 },
  dateLabel: { fontSize: 14, color: '#8E8E93', marginBottom: 4 },
  addButton: { backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 8 },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  listContainer: { padding: 16 },
  listTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16, color: '#1d1d1f' },
  yearCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e5ea' },
  yearHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  yearInfo: { flex: 1 },
  yearName: { fontSize: 18, fontWeight: '600', color: '#1d1d1f' },
  yearDates: { fontSize: 14, color: '#8E8E93', marginTop: 4 },
  yearActions: { alignItems: 'center' },
  activeLabel: { fontSize: 12, color: '#8E8E93', marginTop: 4 },
  section: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f2f2f7' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#1d1d1f' },
  termItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f7', padding: 12, borderRadius: 8, marginBottom: 8 },
  termName: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1d1d1f' },
  termDates: { fontSize: 12, color: '#8E8E93', marginRight: 12 },
  holidayItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff3e0', padding: 12, borderRadius: 8, marginBottom: 8 },
  holidayName: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1d1d1f' },
  holidayDates: { fontSize: 12, color: '#8E8E93', marginRight: 12 },
  iconButton: { padding: 4 },
  addTermButton: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#007AFF', borderStyle: 'dashed', justifyContent: 'center', marginTop: 8 },
  addTermText: { color: '#007AFF', fontSize: 14, fontWeight: '500', marginLeft: 8 },
});
