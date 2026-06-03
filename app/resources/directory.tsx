import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Search, Filter, Phone, Mail, Building, User, ChevronRight } from 'lucide-react-native';

export default function SchoolDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const filters = [
    { id: 'all', label: 'All Staff' },
    { id: 'teaching', label: 'Teaching' },
    { id: 'non-teaching', label: 'Non-Teaching' },
    { id: 'administration', label: 'Administration' },
  ];

  const departments = [
    { id: 'all', label: 'All Departments', count: 85 },
    { id: 'mathematics', label: 'Mathematics', count: 12 },
    { id: 'science', label: 'Science', count: 15 },
    { id: 'english', label: 'English', count: 10 },
    { id: 'administration', label: 'Administration', count: 8 },
    { id: 'finance', label: 'Finance', count: 5 },
    { id: 'it', label: 'IT Support', count: 6 },
    { id: 'facilities', label: 'Facilities', count: 7 },
  ];

  const staffMembers = [
    {
      id: '1',
      name: 'Dr. John Smith',
      role: 'Principal',
      department: 'administration',
      email: 'john.smith@school.com',
      phone: '+1 (555) 123-4567',
      extension: '101',
      type: 'administration',
      office: 'Main Building, Room 101',
    },
    {
      id: '2',
      name: 'Mrs. Sarah Johnson',
      role: 'Mathematics Teacher',
      department: 'mathematics',
      email: 'sarah.j@school.com',
      phone: '+1 (555) 987-6543',
      extension: '205',
      type: 'teaching',
      office: 'Math Block, Room 205',
    },
    {
      id: '3',
      name: 'Mr. Robert Wilson',
      role: 'Science Department Head',
      department: 'science',
      email: 'robert.w@school.com',
      phone: '+1 (555) 456-7890',
      extension: '301',
      type: 'teaching',
      office: 'Science Block, Room 301',
    },
    {
      id: '4',
      name: 'Ms. Emma Davis',
      role: 'English Teacher',
      department: 'english',
      email: 'emma.d@school.com',
      phone: '+1 (555) 234-5678',
      extension: '402',
      type: 'teaching',
      office: 'Language Block, Room 402',
    },
    {
      id: '5',
      name: 'Mr. Mike Brown',
      role: 'IT Support Manager',
      department: 'it',
      email: 'mike.b@school.com',
      phone: '+1 (555) 876-5432',
      extension: '501',
      type: 'non-teaching',
      office: 'IT Center, Room 501',
    },
    {
      id: '6',
      name: 'Mrs. Lisa Taylor',
      role: 'Finance Officer',
      department: 'finance',
      email: 'lisa.t@school.com',
      phone: '+1 (555) 345-6789',
      extension: '601',
      type: 'non-teaching',
      office: 'Finance Office, Room 601',
    },
  ];

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || staff.type === activeFilter;
    const matchesDepartment = selectedDepartment === 'all' || staff.department === selectedDepartment;
    
    return matchesSearch && matchesFilter && matchesDepartment;
  });

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>School Directory</Text>
            <Text style={styles.subtitle}>Contact information for school staff</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search staff by name, role..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Type Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFilters}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.typeButton,
                activeFilter === filter.id && styles.typeButtonActive
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text style={[
                styles.typeText,
                activeFilter === filter.id && styles.typeTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Department Filters */}
        <View style={styles.departmentsContainer}>
          <Text style={styles.sectionTitle}>Departments</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.departmentsRow}>
              {departments.map(dept => (
                <TouchableOpacity
                  key={dept.id}
                  style={[
                    styles.departmentButton,
                    selectedDepartment === dept.id && styles.departmentButtonActive
                  ]}
                  onPress={() => setSelectedDepartment(dept.id)}
                >
                  <Text style={[
                    styles.departmentText,
                    selectedDepartment === dept.id && styles.departmentTextActive
                  ]}>
                    {dept.label}
                  </Text>
                  <Text style={styles.departmentCount}>{dept.count}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Staff List */}
        <View style={styles.staffContainer}>
          <View style={styles.staffHeader}>
            <Text style={styles.sectionTitle}>
              Staff Members ({filteredStaff.length})
            </Text>
          </View>

          {filteredStaff.map(staff => (
            <TouchableOpacity key={staff.id} style={styles.staffCard}>
              <View style={styles.staffHeaderRow}>
                <View style={styles.staffAvatar}>
                  <User size={20} color="#007AFF" />
                </View>
                <View style={styles.staffInfo}>
                  <Text style={styles.staffName}>{staff.name}</Text>
                  <Text style={styles.staffRole}>{staff.role}</Text>
                </View>
                <ChevronRight size={20} color="#8E8E93" />
              </View>

              <View style={styles.staffDetails}>
                <View style={styles.detailRow}>
                  <Building size={14} color="#8E8E93" />
                  <Text style={styles.detailText}>{staff.department}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Mail size={14} color="#8E8E93" />
                  <Text style={styles.detailText}>{staff.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Phone size={14} color="#8E8E93" />
                  <Text style={styles.detailText}>{staff.phone} (Ext: {staff.extension})</Text>
                </View>
              </View>

              <View style={styles.staffActions}>
                <TouchableOpacity style={styles.contactButton}>
                  <Phone size={16} color="#007AFF" />
                  <Text style={styles.contactText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButton}>
                  <Mail size={16} color="#34C759" />
                  <Text style={styles.contactText}>Email</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency Contacts */}
        <View style={styles.emergencyContainer}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyItem}>
              <View style={styles.emergencyInfo}>
                <Text style={styles.emergencyTitle}>School Office</Text>
                <Text style={styles.emergencyNumber}>+1 (555) 111-2222</Text>
              </View>
              <TouchableOpacity style={styles.emergencyButton}>
                <Phone size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.emergencyItem}>
              <View style={styles.emergencyInfo}>
                <Text style={styles.emergencyTitle}>Security</Text>
                <Text style={styles.emergencyNumber}>+1 (555) 333-4444</Text>
              </View>
              <TouchableOpacity style={styles.emergencyButton}>
                <Phone size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
            <View style={styles.emergencyItem}>
              <View style={styles.emergencyInfo}>
                <Text style={styles.emergencyTitle}>Medical Emergency</Text>
                <Text style={styles.emergencyNumber}>+1 (555) 555-6666</Text>
              </View>
              <TouchableOpacity style={styles.emergencyButton}>
                <Phone size={20} color="#34C759" />
              </TouchableOpacity>
            </View>
          </View>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1d1d1f',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1d1d1f',
  },
  typeFilters: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    marginRight: 12,
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  typeTextActive: {
    color: 'white',
  },
  departmentsContainer: {
    backgroundColor: 'white',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  departmentsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  departmentButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    minWidth: 120,
  },
  departmentButtonActive: {
    backgroundColor: '#007AFF',
  },
  departmentText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 4,
  },
  departmentTextActive: {
    color: 'white',
  },
  departmentCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  staffContainer: {
    padding: 16,
  },
  staffHeader: {
    marginBottom: 16,
  },
  staffCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  staffHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  staffAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  staffRole: {
    fontSize: 14,
    color: '#8E8E93',
  },
  staffDetails: {
    gap: 12,
    marginBottom: 20,
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
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f2f2f7',
    borderRadius: 8,
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#1d1d1f',
    fontWeight: '500',
  },
  emergencyContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 32,
  },
  emergencyCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
  },
  emergencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  emergencyNumber: {
    fontSize: 16,
    color: '#007AFF',
  },
  emergencyButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});