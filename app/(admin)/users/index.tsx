import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Header } from '../../../components/Header';
import { useAuth } from '../../../contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  coursesCount: number;
}

export default function UsersManagement() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, filterRole, filterStatus, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockUsers: User[] = [
        { id: '1', name: 'علی احمدی', email: 'ali@example.com', role: 'admin', status: 'active', joinDate: '۱۴۰۳/۰۱/۱۵', coursesCount: 12 },
        { id: '2', name: 'مریم رضایی', email: 'maryam@example.com', role: 'teacher', status: 'active', joinDate: '۱۴۰۳/۰۲/۲۰', coursesCount: 8 },
        { id: '3', name: 'رضا محمدی', email: 'reza@example.com', role: 'student', status: 'active', joinDate: '۱۴۰۳/۰۳/۱۰', coursesCount: 5 },
        { id: '4', name: 'سارا کریمی', email: 'sara@example.com', role: 'student', status: 'inactive', joinDate: '۱۴۰۳/۰۱/۰۵', coursesCount: 3 },
        { id: '5', name: 'محمد حسینی', email: 'mohammad@example.com', role: 'teacher', status: 'suspended', joinDate: '۱۴۰۲/۱۲/۱۵', coursesCount: 6 },
      ];
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } catch (error) {
      Alert.alert('خطا', 'در دریافت اطلاعات کاربران مشکلی پیش آمده');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.includes(searchQuery) ||
        user.email.includes(searchQuery)
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    setFilteredUsers(filtered);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return Colors.danger;
      case 'teacher': return Colors.warning;
      case 'student': return Colors.primary;
      default: return Colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return Colors.success;
      case 'inactive': return Colors.textSecondary;
      case 'suspended': return Colors.danger;
      default: return Colors.textSecondary;
    }
  };

  const handleDeleteUser = (userId: string) => {
    Alert.alert(
      'حذف کاربر',
      'آیا از حذف این کاربر اطمینان دارید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete API
            setUsers(users.filter(user => user.id !== userId));
            Alert.alert('موفق', 'کاربر با موفقیت حذف شد');
          },
        },
      ]
    );
  };

  const handleChangeStatus = (userId: string, newStatus: User['status']) => {
    // TODO: Implement status change API
    setUsers(users.map(user =>
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="مدیریت کاربران" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="مدیریت کاربران"
        rightComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(admin)/users/create')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content}>
        {/* Search and Filters */}
        <View style={styles.filterSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="جستجوی کاربر..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <View style={styles.filterRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filterChip, filterRole === 'all' && styles.filterChipActive]}
                onPress={() => setFilterRole('all')}
              >
                <Text style={[styles.filterChipText, filterRole === 'all' && styles.filterChipTextActive]}>
                  همه
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterRole === 'admin' && styles.filterChipActive]}
                onPress={() => setFilterRole('admin')}
              >
                <Text style={[styles.filterChipText, filterRole === 'admin' && styles.filterChipTextActive]}>
                  مدیران
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterRole === 'teacher' && styles.filterChipActive]}
                onPress={() => setFilterRole('teacher')}
              >
                <Text style={[styles.filterChipText, filterRole === 'teacher' && styles.filterChipTextActive]}>
                  مدرسان
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterRole === 'student' && styles.filterChipActive]}
                onPress={() => setFilterRole('student')}
              >
                <Text style={[styles.filterChipText, filterRole === 'student' && styles.filterChipTextActive]}>
                  دانش‌آموزان
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => {/* Open advanced filter modal */}}
            >
              <Ionicons name="filter" size={20} color={Colors.primary} />
              <Text style={styles.filterButtonText}>فیلتر پیشرفته</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>کاربر کل</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{users.filter(u => u.status === 'active').length}</Text>
            <Text style={styles.statLabel}>فعال</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{users.filter(u => u.role === 'teacher').length}</Text>
            <Text style={styles.statLabel}>مدرس</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{users.filter(u => u.role === 'admin').length}</Text>
            <Text style={styles.statLabel}>مدیر</Text>
          </View>
        </View>

        {/* Users List */}
        <View style={styles.usersList}>
          {filteredUsers.map(user => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user.name.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>
                <View style={styles.userActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/(admin)/users/${user.id}`)}
                  >
                    <Ionicons name="create-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteUser(user.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.userDetails}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>نقش:</Text>
                  <View style={[styles.roleBadge, { backgroundColor: `${getRoleColor(user.role)}20` }]}>
                    <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                      {user.role === 'admin' ? 'مدیر' : 
                       user.role === 'teacher' ? 'مدرس' : 'دانش‌آموز'}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>وضعیت:</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(user.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(user.status) }]}>
                      {user.status === 'active' ? 'فعال' :
                       user.status === 'inactive' ? 'غیرفعال' : 'معلق'}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>تاریخ عضویت:</Text>
                  <Text style={styles.detailValue}>{user.joinDate}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>تعداد دوره‌ها:</Text>
                  <Text style={styles.detailValue}>{user.coursesCount}</Text>
                </View>
              </View>

              <View style={styles.userFooter}>
                <TouchableOpacity
                  style={styles.statusButton}
                  onPress={() => handleChangeStatus(user.id, 'active')}
                >
                  <Text style={[styles.statusButtonText, { color: Colors.success }]}>فعال‌سازی</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.statusButton}
                  onPress={() => handleChangeStatus(user.id, 'suspended')}
                >
                  <Text style={[styles.statusButtonText, { color: Colors.danger }]}>تعلیق</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {filteredUsers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyStateText}>کاربری یافت نشد</Text>
          </View>
        )}
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginRight: 8,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
  userCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userDetails: {
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
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
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
  userFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '500',
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
});