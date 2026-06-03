// components/admin/UserManagement.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '../../constants/Colors';
import { User, UserRole } from '../../types';

interface UserManagementProps {
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: number) => void;
  onAddUser: (userData: Partial<User>) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onEditUser,
  onDeleteUser,
  onAddUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student' as UserRole,
    password: '',
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const roleStats = {
    total: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    teacher: users.filter(u => u.role === 'teacher').length,
    student: users.filter(u => u.role === 'student').length,
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.password) {
      onAddUser(newUser);
      setNewUser({ name: '', email: '', role: 'student', password: '' });
      setShowAddModal(false);
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return Colors.danger;
      case 'teacher': return Colors.warning;
      case 'student': return Colors.primary;
      default: return Colors.textSecondary;
    }
  };

  const getRoleText = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'مدیر';
      case 'teacher': return 'معلم';
      case 'student': return 'دانش‌آموز';
      default: return 'کاربر';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Stats */}
      <View style={styles.header}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{roleStats.total}</Text>
            <Text style={styles.statLabel}>کل کاربران</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.danger }]}>
              {roleStats.admin}
            </Text>
            <Text style={styles.statLabel}>مدیر</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>
              {roleStats.teacher}
            </Text>
            <Text style={styles.statLabel}>معلم</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {roleStats.student}
            </Text>
            <Text style={styles.statLabel}>دانش‌آموز</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>کاربر جدید</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجوی کاربر..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.roleFilter}>
          <Picker
            selectedValue={roleFilter}
            style={styles.picker}
            onValueChange={(value) => setRoleFilter(value)}
          >
            <Picker.Item label="همه نقش‌ها" value="all" />
            <Picker.Item label="مدیر" value="admin" />
            <Picker.Item label="معلم" value="teacher" />
            <Picker.Item label="دانش‌آموز" value="student" />
          </Picker>
        </View>
      </View>

      {/* Users List */}
      <ScrollView style={styles.usersList}>
        {filteredUsers.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={[styles.avatar, { backgroundColor: getRoleColor(user.role) + '20' }]}>
                <Text style={[styles.avatarText, { color: getRoleColor(user.role) }]}>
                  {user.name.charAt(0)}
                </Text>
              </View>
              
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.userActions}>
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) + '20' }]}>
                <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                  {getRoleText(user.role)}
                </Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onEditUser(user)}
                >
                  <Ionicons name="create-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onDeleteUser(user.id)}
                >
                  <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add User Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>افزودن کاربر جدید</Text>
            <TouchableOpacity onPress={handleAddUser}>
              <Text style={styles.modalSave}>ذخیره</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>نام کامل</Text>
                <TextInput
                  style={styles.input}
                  placeholder="نام و نام خانوادگی"
                  value={newUser.name}
                  onChangeText={(text) => setNewUser(prev => ({ ...prev, name: text }))}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ایمیل</Text>
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  value={newUser.email}
                  onChangeText={(text) => setNewUser(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>رمز عبور</Text>
                <TextInput
                  style={styles.input}
                  placeholder="رمز عبور"
                  value={newUser.password}
                  onChangeText={(text) => setNewUser(prev => ({ ...prev, password: text }))}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>نقش کاربری</Text>
                <View style={styles.roleSelector}>
                  {(['student', 'teacher', 'admin'] as UserRole[]).map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.roleOption,
                        newUser.role === role && styles.roleOptionActive,
                      ]}
                      onPress={() => setNewUser(prev => ({ ...prev, role }))}
                    >
                      <View style={[
                        styles.roleOptionIcon,
                        { backgroundColor: getRoleColor(role) + '20' },
                      ]}>
                        <Ionicons
                          name={
                            role === 'admin' ? 'shield' :
                            role === 'teacher' ? 'school' :
                            'person'
                          }
                          size={20}
                          color={getRoleColor(role)}
                        />
                      </View>
                      <Text style={[
                        styles.roleOptionText,
                        newUser.role === role && styles.roleOptionTextActive,
                      ]}>
                        {getRoleText(role)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  filters: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    paddingVertical: 10,
    marginRight: 8,
    textAlign: 'right',
  },
  roleFilter: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 120,
  },
  picker: {
    color: Colors.text,
    height: 40,
  },
  usersList: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  userActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
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
  modalSave: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
    color: Colors.text,
    textAlign: 'right',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  roleOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  roleOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleOptionText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  roleOptionTextActive: {
    color: Colors.primary,
  },
});
