import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  User,
  ChevronRight,
  Search,
  Building,
  X,
  BookOpen,
} from 'lucide-react-native';

interface ClassItem {
  id: string;
  name: string;
  grade: string;
  section: string;
  students: number;
  classTeacher: string;
  room: string;
  subjects: string[];
  capacity?: string;
}

interface NewClass {
  grade: string;
  section: string;
  classTeacher: string;
  room: string;
  capacity: string;
}

export default function ClassesSections() {
  const [classes, setClasses] = useState<ClassItem[]>([
    {
      id: '1',
      name: 'صنف ۱۰ الف',
      grade: '10',
      section: 'A',
      students: 35,
      classTeacher: 'استاد جان اسمیت',
      room: 'اطاق ۱۰۱',
      subjects: ['ریاضی', 'ساینس', 'انگلیسی'],
      capacity: '40',
    },
    {
      id: '2',
      name: 'صنف ۹ ب',
      grade: '9',
      section: 'B',
      students: 32,
      classTeacher: 'استاد سارا جانسن',
      room: 'اطاق ۲۰۵',
      subjects: ['ریاضی', 'ساینس', 'مطالعات اجتماعی'],
      capacity: '40',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState('all');

  const [newClass, setNewClass] = useState<NewClass>({
    grade: '',
    section: '',
    classTeacher: '',
    room: '',
    capacity: '40',
  });

  const grades = ['نرسری', 'KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D'];
  const teachers = [
    'استاد جان اسمیت',
    'استاد سارا جانسن',
    'استاد رابرت ویلسن',
    'استاد اما دیویس',
  ];
  const rooms = ['اطاق ۱۰۱', 'اطاق ۱۰۲', 'اطاق ۲۰۱', 'اطاق ۳۰۱'];

  const handleSaveClass = () => {
    if (!newClass.grade || !newClass.section || !newClass.classTeacher) {
      Alert.alert('خطا', 'لطفاً تمام بخش‌های ضروری را تکمیل کنید');
      return;
    }

    const classObj: ClassItem = {
      id: editingClass ? editingClass.id : Date.now().toString(),
      name: `صنف ${newClass.grade} ${newClass.section}`,
      grade: newClass.grade,
      section: newClass.section,
      students: editingClass ? editingClass.students : 0,
      classTeacher: newClass.classTeacher,
      room: newClass.room,
      subjects: editingClass ? editingClass.subjects : [],
      capacity: newClass.capacity,
    };

    if (editingClass) {
      setClasses(classes.map(c => (c.id === classObj.id ? classObj : c)));
      Alert.alert('موفقیت', 'صنف با موفقیت ویرایش شد');
    } else {
      setClasses([...classes, classObj]);
      Alert.alert('موفقیت', 'صنف جدید با موفقیت ایجاد شد');
    }

    setShowAddModal(false);
    setEditingClass(null);
    setNewClass({ grade: '', section: '', classTeacher: '', room: '', capacity: '40' });
  };

  const handleEditClass = (classItem: ClassItem) => {
    setEditingClass(classItem);
    setNewClass({
      grade: classItem.grade,
      section: classItem.section,
      classTeacher: classItem.classTeacher,
      room: classItem.room,
      capacity: classItem.capacity || '40',
    });
    setShowAddModal(true);
  };

  const handleDeleteClass = (id: string) => {
    Alert.alert(
      'حذف صنف',
      'آیا مطمئن هستید که می‌خواهید این صنف را حذف کنید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            setClasses(classes.filter(c => c.id !== id));
            Alert.alert('موفقیت', 'صنف با موفقیت حذف شد');
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setNewClass({ grade: '', section: '', classTeacher: '', room: '', capacity: '40' });
    setEditingClass(null);
    setShowAddModal(false);
  };

  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = 
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.classTeacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.room.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGrade = selectedGrade === 'all' || classItem.grade === selectedGrade;
    const matchesTeacher = selectedTeacher === 'all' || classItem.classTeacher === selectedTeacher;
    
    return matchesSearch && matchesGrade && matchesTeacher;
  });

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>صنف‌ها و بخش‌ها</Text>
            <Text style={styles.subtitle}>
              مدیریت ساختار صنف‌ها و تعیین مسئولیت‌ها
            </Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => {
            resetForm();
            setShowAddModal(true);
          }}>
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>افزودن صنف</Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجوی صنف، استاد، اطاق..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <TouchableOpacity 
            style={[styles.filterChip, selectedGrade === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedGrade('all')}
          >
            <Text style={[styles.filterChipText, selectedGrade === 'all' && styles.filterChipTextActive]}>
              تمام صنف‌ها
            </Text>
          </TouchableOpacity>
          
          {grades.map(grade => (
            <TouchableOpacity 
              key={grade}
              style={[styles.filterChip, selectedGrade === grade && styles.filterChipActive]}
              onPress={() => setSelectedGrade(grade)}
            >
              <Text style={[styles.filterChipText, selectedGrade === grade && styles.filterChipTextActive]}>
                صنف {grade}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Class List */}
        {filteredClasses.map(classItem => (
          <View key={classItem.id} style={styles.classCard}>
            <View style={styles.classHeader}>
              <View style={styles.classInfo}>
                <Text style={styles.className}>{classItem.name}</Text>
                <Text style={styles.classTeacher}>{classItem.classTeacher}</Text>
              </View>
              <View style={styles.studentCount}>
                <Users size={16} color="#007AFF" />
                <Text style={styles.studentCountText}>
                  {classItem.students}/{classItem.capacity} شاگردان
                </Text>
              </View>
            </View>
            
            <View style={styles.classDetails}>
              <View style={styles.detailItem}>
                <Building size={14} color="#8E8E93" />
                <Text style={styles.detailText}>{classItem.room}</Text>
              </View>
              <View style={styles.detailItem}>
                <BookOpen size={14} color="#8E8E93" />
                <Text style={styles.detailText}>{classItem.subjects.join('، ')}</Text>
              </View>
            </View>

            <View style={styles.classActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleEditClass(classItem)}
              >
                <Edit2 size={16} color="#007AFF" />
                <Text style={styles.actionText}>ویرایش</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDeleteClass(classItem.id)}
              >
                <Trash2 size={16} color="#FF3B30" />
                <Text style={[styles.actionText, { color: '#FF3B30' }]}>حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        
        {filteredClasses.length === 0 && (
          <View style={styles.emptyState}>
            <Users size={48} color="#C7C7CC" />
            <Text style={styles.emptyStateText}>هیچ صنفی یافت نشد</Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal 
        visible={showAddModal} 
        transparent 
        animationType="slide"
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingClass ? 'ویرایش صنف' : 'ایجاد صنف جدید'}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <X size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Grade Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>صنف *</Text>
                <View style={styles.optionsGrid}>
                  {grades.map(grade => (
                    <TouchableOpacity
                      key={grade}
                      style={[
                        styles.optionButton,
                        newClass.grade === grade && styles.optionButtonActive
                      ]}
                      onPress={() => setNewClass({...newClass, grade})}
                    >
                      <Text style={[
                        styles.optionText,
                        newClass.grade === grade && styles.optionTextActive
                      ]}>
                        {grade}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Section Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>بخش *</Text>
                <View style={styles.optionsRow}>
                  {sections.map(section => (
                    <TouchableOpacity
                      key={section}
                      style={[
                        styles.optionButton,
                        newClass.section === section && styles.optionButtonActive
                      ]}
                      onPress={() => setNewClass({...newClass, section})}
                    >
                      <Text style={[
                        styles.optionText,
                        newClass.section === section && styles.optionTextActive
                      ]}>
                        {section}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Class Teacher Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>استاد صنف *</Text>
                <View style={styles.selectContainer}>
                  {teachers.map(teacher => (
                    <TouchableOpacity
                      key={teacher}
                      style={[
                        styles.selectOption,
                        newClass.classTeacher === teacher && styles.selectOptionActive
                      ]}
                      onPress={() => setNewClass({...newClass, classTeacher: teacher})}
                    >
                      <User size={16} color="#8E8E93" />
                      <Text style={[
                        styles.selectOptionText,
                        newClass.classTeacher === teacher && styles.selectOptionTextActive
                      ]}>
                        {teacher}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Room Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>اطاق</Text>
                <View style={styles.selectContainer}>
                  {rooms.map(room => (
                    <TouchableOpacity
                      key={room}
                      style={[
                        styles.selectOption,
                        newClass.room === room && styles.selectOptionActive
                      ]}
                      onPress={() => setNewClass({...newClass, room})}
                    >
                      <Building size={16} color="#8E8E93" />
                      <Text style={[
                        styles.selectOptionText,
                        newClass.room === room && styles.selectOptionTextActive
                      ]}>
                        {room}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Capacity Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ظرفیت</Text>
                <View style={styles.capacityContainer}>
                  <TextInput
                    style={styles.capacityInput}
                    value={newClass.capacity}
                    onChangeText={(text) => setNewClass({...newClass, capacity: text})}
                    keyboardType="numeric"
                    placeholder="40"
                  />
                  <Text style={styles.capacityLabel}>شاگرد</Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetForm}
              >
                <Text style={styles.cancelButtonText}>لغو</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSaveClass}
              >
                <Text style={styles.saveButtonText}>
                  {editingClass ? 'به‌روزرسانی صنف' : 'ایجاد صنف'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  headerContent: {
    marginBottom: 12,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: '#1c1c1e'
  },
  subtitle: { 
    fontSize: 14, 
    color: '#8E8E93',
    marginTop: 4
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  addButtonText: { 
    color: 'white', 
    fontWeight: '600',
    fontSize: 16
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#f2f2f7',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  searchInput: { 
    marginLeft: 12, 
    flex: 1,
    fontSize: 16,
    color: '#1c1c1e',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f2f2f7',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: 'white',
  },
  classCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  classInfo: {
    flex: 1,
  },
  className: { 
    fontSize: 18, 
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 4
  },
  classTeacher: { 
    fontSize: 14,
    color: '#8E8E93',
  },
  studentCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f2f2f7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  studentCountText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  classDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  classActions: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f7',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: { 
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '600',
    color: '#1c1c1e'
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c1c1e',
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    minWidth: 50,
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  optionTextActive: {
    color: 'white',
  },
  selectContainer: {
    gap: 8,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  selectOptionActive: {
    backgroundColor: '#e3f2ff',
    borderColor: '#007AFF',
  },
  selectOptionText: {
    fontSize: 16,
    color: '#1c1c1e',
    flex: 1,
  },
  selectOptionTextActive: {
    color: '#007AFF',
    fontWeight: '500',
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
    overflow: 'hidden',
  },
  capacityInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#1c1c1e',
  },
  capacityLabel: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#8E8E93',
    backgroundColor: '#e5e5ea',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: { 
    color: 'white', 
    fontWeight: '600',
    fontSize: 16
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  cancelButtonText: { 
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500'
  },
});