import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Users, Plus, Edit2, Trash2, Phone, Mail, Building, Search } from 'lucide-react-native';

// Define TypeScript interfaces
interface StaffMember {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hireDate: string;
  status: 'Active' | 'On Leave';
}

interface NewStaff {
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hireDate: string;
  status: 'Active' | 'On Leave';
}

interface Filter {
  id: string;
  label: string;
}

export default function NonTeachingStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([
    {
      id: '1',
      name: 'John Smith',
      position: 'Accountant',
      department: 'Finance',
      email: 'john.smith@school.com',
      phone: '+1 (555) 123-4567',
      hireDate: '2020-05-15',
      status: 'Active',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      position: 'Librarian',
      department: 'Library',
      email: 'sarah.j@school.com',
      phone: '+1 (555) 987-6543',
      hireDate: '2019-08-22',
      status: 'Active',
    },
    {
      id: '3',
      name: 'Mike Wilson',
      position: 'IT Support',
      department: 'IT',
      email: 'mike.w@school.com',
      phone: '+1 (555) 456-7890',
      hireDate: '2021-01-10',
      status: 'Active',
    },
    {
      id: '4',
      name: 'Emma Davis',
      position: 'Administrative Assistant',
      department: 'Administration',
      email: 'emma.d@school.com',
      phone: '+1 (555) 234-5678',
      hireDate: '2018-11-30',
      status: 'On Leave',
    },
    {
      id: '5',
      name: 'Robert Brown',
      position: 'Maintenance Supervisor',
      department: 'Facilities',
      email: 'robert.b@school.com',
      phone: '+1 (555) 876-5432',
      hireDate: '2017-03-25',
      status: 'Active',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [newStaff, setNewStaff] = useState<NewStaff>({
    name: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    hireDate: '',
    status: 'Active',
  });

  const filters: Filter[] = [
    { id: 'all', label: 'All' },
    { id: 'finance', label: 'Finance' },
    { id: 'it', label: 'IT' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'administration', label: 'Admin' },
    { id: 'library', label: 'Library' },
  ];

  const departments = ['Finance', 'IT', 'Facilities', 'Administration', 'Library', 'Security', 'Transport', 'Health'];
  const positions = ['Accountant', 'IT Support', 'Maintenance', 'Administrative Assistant', 'Librarian', 'Security Guard', 'Driver', 'Nurse'];

  const handleSaveStaff = () => {
    if (!newStaff.name || !newStaff.position || !newStaff.department) {
      Alert.alert('Error', 'Please fill required fields');
      return;
    }

    if (editingStaff) {
      setStaff(staff.map(s => s.id === editingStaff.id ? { ...newStaff, id: editingStaff.id } : s));
      Alert.alert('Success', 'Staff updated successfully');
    } else {
      const staffMember: StaffMember = {
        id: Date.now().toString(),
        ...newStaff,
      };
      setStaff([...staff, staffMember]);
      Alert.alert('Success', 'Staff added successfully');
    }

    setShowAddModal(false);
    setEditingStaff(null);
    setNewStaff({
      name: '',
      position: '',
      department: '',
      email: '',
      phone: '',
      hireDate: '',
      status: 'Active',
    });
  };

  const handleEdit = (staffMember: StaffMember) => {
    setEditingStaff(staffMember);
    setNewStaff({ ...staffMember });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Staff',
      'Are you sure you want to delete this staff member?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setStaff(staff.filter(s => s.id !== id));
            Alert.alert('Success', 'Staff deleted successfully');
          }
        }
      ]
    );
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         member.department.toLowerCase().includes(selectedFilter.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Non-Teaching Staff</Text>
            <Text style={styles.subtitle}>Manage administrative and support staff</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>Add Staff</Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filters */}
        <View style={styles.controls}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#8E8E93" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search staff by name, position..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
            {filters.map(filter => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.id && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === filter.id && styles.filterTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Users size={24} color="#007AFF" />
            <Text style={styles.statValue}>{staff.length}</Text>
            <Text style={styles.statLabel}>Total Staff</Text>
          </View>
          <View style={styles.statCard}>
            <Building size={24} color="#34C759" />
            <Text style={styles.statValue}>{new Set(staff.map(s => s.department)).size}</Text>
            <Text style={styles.statLabel}>Departments</Text>
          </View>
          <View style={styles.statCard}>
            <Users size={24} color="#FF9500" />
            <Text style={styles.statValue}>
              {staff.filter(s => s.status === 'Active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        {/* Staff List */}
        <View style={styles.staffContainer}>
          <Text style={styles.sectionTitle}>Staff Members ({filteredStaff.length})</Text>
          
          {filteredStaff.map(staffMember => (
            <View key={staffMember.id} style={styles.staffCard}>
              <View style={styles.staffInfo}>
                <View style={styles.staffHeader}>
                  <Text style={styles.staffName}>{staffMember.name}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: staffMember.status === 'Active' ? '#D4F7E2' : '#FFF3CD' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: staffMember.status === 'Active' ? '#34C759' : '#FF9500' }
                    ]}>
                      {staffMember.status}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.staffDetails}>
                  <View style={styles.detailRow}>
                    <Building size={14} color="#8E8E93" />
                    <Text style={styles.detailText}>{staffMember.position}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Building size={14} color="#8E8E93" />
                    <Text style={styles.detailText}>{staffMember.department}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Mail size={14} color="#8E8E93" />
                    <Text style={styles.detailText}>{staffMember.email}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Phone size={14} color="#8E8E93" />
                    <Text style={styles.detailText}>{staffMember.phone}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.staffActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleEdit(staffMember)}
                >
                  <Edit2 size={16} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, { backgroundColor: '#FFE5E5' }]}
                  onPress={() => handleDelete(staffMember.id)}
                >
                  <Trash2 size={16} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingStaff ? 'Edit Staff' : 'Add New Staff'}
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => {
                    setShowAddModal(false);
                    setEditingStaff(null);
                    setNewStaff({
                      name: '',
                      position: '',
                      department: '',
                      email: '',
                      phone: '',
                      hireDate: '',
                      status: 'Active',
                    });
                  }}
                >
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter full name"
                    value={newStaff.name}
                    onChangeText={(text) => setNewStaff({ ...newStaff, name: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Position *</Text>
                  <View style={styles.optionsGrid}>
                    {positions.map(position => (
                      <TouchableOpacity
                        key={position}
                        style={[
                          styles.optionButton,
                          newStaff.position === position && styles.optionButtonActive
                        ]}
                        onPress={() => setNewStaff({ ...newStaff, position })}
                      >
                        <Text style={[
                          styles.optionText,
                          newStaff.position === position && styles.optionTextActive
                        ]}>
                          {position}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Department *</Text>
                  <View style={styles.optionsGrid}>
                    {departments.map(dept => (
                      <TouchableOpacity
                        key={dept}
                        style={[
                          styles.optionButton,
                          newStaff.department === dept && styles.optionButtonActive
                        ]}
                        onPress={() => setNewStaff({ ...newStaff, department: dept })}
                      >
                        <Text style={[
                          styles.optionText,
                          newStaff.department === dept && styles.optionTextActive
                        ]}>
                          {dept}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter email address"
                    value={newStaff.email}
                    onChangeText={(text) => setNewStaff({ ...newStaff, email: text })}
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter phone number"
                    value={newStaff.phone}
                    onChangeText={(text) => setNewStaff({ ...newStaff, phone: text })}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Hire Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={newStaff.hireDate}
                    onChangeText={(text) => setNewStaff({ ...newStaff, hireDate: text })}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.statusOptions}>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        newStaff.status === 'Active' && styles.statusButtonActive
                      ]}
                      onPress={() => setNewStaff({ ...newStaff, status: 'Active' })}
                    >
                      <Text style={[
                        styles.statusButtonText,
                        newStaff.status === 'Active' && styles.statusButtonTextActive
                      ]}>
                        Active
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        newStaff.status === 'On Leave' && styles.statusButtonActive
                      ]}
                      onPress={() => setNewStaff({ ...newStaff, status: 'On Leave' })}
                    >
                      <Text style={[
                        styles.statusButtonText,
                        newStaff.status === 'On Leave' && styles.statusButtonTextActive
                      ]}>
                        On Leave
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddModal(false);
                    setEditingStaff(null);
                    setNewStaff({
                      name: '',
                      position: '',
                      department: '',
                      email: '',
                      phone: '',
                      hireDate: '',
                      status: 'Active',
                    });
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveStaff}>
                  <Text style={styles.saveButtonText}>
                    {editingStaff ? 'Update Staff' : 'Add Staff'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  controls: {
    backgroundColor: 'white',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1d1d1f',
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  staffContainer: {
    padding: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  staffCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  staffInfo: {
    flex: 1,
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  staffDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  staffActions: {
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  formGroup: {
    marginBottom: 20,
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
  statusOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  statusButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#007AFF',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: 'white',
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