// app/(admin)/users.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '@/constants/Colors';
import { Header } from '@/components/Header';
import { User, UserRole } from '@/types';

export default function UserManagementScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'مدیر سیستم', email: 'admin@example.com', role: 'admin', profile_image: 'https://i.pravatar.cc/300' },
    { id: 2, name: 'معلم ریاضی', email: 'teacher1@example.com', role: 'teacher', profile_image: 'https://i.pravatar.cc/300' },
    { id: 3, name: 'معلم علوم', email: 'teacher2@example.com', role: 'teacher', profile_image: 'https://i.pravatar.cc/300' },
    { id: 4, name: 'دانش‌آموز ۱', email: 'student1@example.com', role: 'student', profile_image: 'https://i.pravatar.cc/300' },
    { id: 5, name: 'دانش‌آموز ۲', email: 'student2@example.com', role: 'student', profile_image: 'https://i.pravatar.cc/300' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student' as UserRole,
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: 'all', label: 'همه' },
    { id: 'admin', label: 'مدیر' },
    { id: 'teacher', label: 'معلم' },
    { id: 'student', label: 'دانش‌آموز' },
  ];

  const filteredUsers = users.filter(user => {
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedRole !== 'all' && user.role !== selectedRole) {
      return false;
    }
    return true;
  });

  const handleCreateUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      Alert.alert('خطا', 'لطفا تمام فیلدها را پر کنید');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUserObj: User = {
        id: users.length + 1,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profile_image: 'https://i.pravatar.cc/300',
      };

      setUsers([...users, newUserObj]);
      setNewUser({ name: '', email: '', role: 'student', password: '' });
      setShowUserModal(false);
      
      Alert.alert('موفقیت', 'کاربر جدید با موفقیت ایجاد شد');
    } catch (error) {
      Alert.alert('خطا', 'ایجاد کاربر ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      
      Alert.alert('موفقیت', 'کاربر با موفقیت حذف شد');
    } catch (error) {
      Alert.alert('خطا', 'حذف کاربر ناموفق بود');
    } finally {
      setLoading(false);
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="مدیریت کاربران"
        showBack
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity onPress={() => setShowUserModal(true)}>
            <Ionicons name="person-add" size={24} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search and Filters */}
        <View style={styles.searchSection}>
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

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {roles.map((role) => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.filterChip,
                  selectedRole === role.id && styles.filterChipActive,
                ]}
                onPress={() => setSelectedRole(role.id)}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedRole === role.id && styles.filterTextActive,
                  ]}
                >
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>کل کاربران</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.danger }]}>
              {users.filter(u => u.role === 'admin').length}
            </Text>
            <Text style={styles.statLabel}>مدیر</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>
              {users.filter(u => u.role === 'teacher').length}
            </Text>
            <Text style={styles.statLabel}>معلم</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.primary }]}>
              {users.filter(u => u.role === 'student').length}
            </Text>
            <Text style={styles.statLabel}>دانش‌آموز</Text>
          </View>
        </View>

        {/* Users List */}
        <View style={styles.usersList}>
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={60} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>کاربری یافت نشد</Text>
            </View>
          ) : (
            filteredUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {user.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>
                
                <View style={styles.userActions}>
                  <View style={[
                    styles.roleBadge,
                    { backgroundColor: `${getRoleColor(user.role)}20` }
                  ]}>
                    <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                      {getRoleText(user.role)}
                    </Text>
                  </View>
                  
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        setSelectedUser(user);
                        // Navigate to user details
                      }}
                    >
                      <Ionicons name="eye" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        setSelectedUser(user);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Ionicons name="trash" size={20} color={Colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create User Modal */}
      <Modal
        visible={showUserModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowUserModal(false)}>
              <Text style={styles.modalCancel}>لغو</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>ایجاد کاربر جدید</Text>
            <TouchableOpacity onPress={handleCreateUser}>
              <Text style={styles.modalSave}>ذخیره</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>نام کامل</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="نام و نام خانوادگی"
                  value={newUser.name}
                  onChangeText={(text) => setNewUser(prev => ({ ...prev, name: text }))}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>ایمیل</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="example@email.com"
                  value={newUser.email}
                  onChangeText={(text) => setNewUser(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>رمز عبور</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="رمز عبور"
                  value={newUser.password}
                  onChangeText={(text) => setNewUser(prev => ({ ...prev, password: text }))}
                  secureTextEntry
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>نقش کاربری</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={newUser.role}
                    onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
                    style={styles.picker}
                  >
                    <Picker.Item label="دانش‌آموز" value="student" />
                    <Picker.Item label="معلم" value="teacher" />
                    <Picker.Item label="مدیر" value="admin" />
                  </Picker>
                </View>
              </View>

              {loading && (
                <ActivityIndicator size="small" color={Colors.primary} style={styles.loadingIndicator} />
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <View style={styles.deleteModalHeader}>
              <Ionicons name="warning" size={40} color={Colors.danger} />
              <Text style={styles.deleteModalTitle}>حذف کاربر</Text>
              <Text style={styles.deleteModalText}>
                آیا از حذف کاربر {selectedUser?.name} مطمئن هستید؟
              </Text>
            </View>
            
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.deleteCancelButton}
                onPress={() => setShowDeleteModal(false)}
                disabled={loading}
              >
                <Text style={styles.deleteCancelText}>لغو</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={handleDeleteUser}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteConfirmText}>حذف</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    marginHorizontal: 12,
    textAlign: 'right',
  },
  filtersContainer: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterChip: {
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  usersList: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  userCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
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
  modalCancel: {
    fontSize: 16,
    color: Colors.danger,
  },
  modalSave: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  form: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  formInput: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 15,
    color: Colors.text,
    textAlign: 'right',
  },
  pickerContainer: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  picker: {
    color: Colors.text,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  deleteModalText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  deleteModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteCancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deleteCancelText: {
    fontSize: 16,
    color: Colors.text,
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: Colors.danger,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  deleteConfirmText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});