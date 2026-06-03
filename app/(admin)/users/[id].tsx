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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Header } from '../../../components/Header';
import apiService from '../../../services/api';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'teacher' | 'student';
  status: 'active' | 'inactive' | 'suspended';
  profile_image?: string;
  join_date: string;
  last_login?: string;
  enrolled_courses: number;
  completed_courses: number;
  total_hours: number;
  certificates: number;
  bio?: string;
  address?: string;
  education?: string;
}

export default function UserDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserDetail>>({});

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockUser: UserDetail = {
        id: id || '1',
        name: 'علی احمدی',
        email: 'ali@example.com',
        phone: '09123456789',
        role: 'admin',
        status: 'active',
        profile_image: 'https://i.pravatar.cc/300',
        join_date: '۱۴۰۳/۰۱/۱۵',
        last_login: '۱۴۰۳/۰۶/۲۰ ۱۴:۳۰',
        enrolled_courses: 12,
        completed_courses: 8,
        total_hours: 156,
        certificates: 5,
        bio: 'برنامه‌نویس و مدرس با ۵ سال سابقه تدریس',
        address: 'تهران، خیابان ولیعصر',
        education: 'کارشناسی ارشد مهندسی نرم‌افزار',
      };
      setUser(mockUser);
      setFormData(mockUser);
    } catch (error) {
      Alert.alert('خطا', 'در دریافت اطلاعات کاربر مشکلی پیش آمده');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // TODO: Implement update API
      Alert.alert('موفقیت', 'اطلاعات کاربر با موفقیت بروزرسانی شد');
      setEditing(false);
      fetchUserDetail();
    } catch (error) {
      Alert.alert('خطا', 'در بروزرسانی اطلاعات مشکلی پیش آمده');
    }
  };

  const handleStatusChange = (newStatus: UserDetail['status']) => {
    Alert.alert(
      'تغییر وضعیت',
      `آیا از تغییر وضعیت کاربر به "${newStatus === 'active' ? 'فعال' : newStatus === 'inactive' ? 'غیرفعال' : 'معلق'}" اطمینان دارید؟`,
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'تغییر',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement status change API
            setUser(prev => prev ? { ...prev, status: newStatus } : null);
            Alert.alert('موفقیت', 'وضعیت کاربر با موفقیت تغییر یافت');
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'حذف کاربر',
      'آیا از حذف دائمی این کاربر اطمینان دارید؟',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Implement delete API
              Alert.alert('موفقیت', 'کاربر با موفقیت حذف شد');
              router.back();
            } catch (error) {
              Alert.alert('خطا', 'در حذف کاربر مشکلی پیش آمده');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="جزئیات کاربر" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="جزئیات کاربر" />
        <View style={styles.errorContainer}>
          <Ionicons name="person-remove" size={64} color={Colors.danger} />
          <Text style={styles.errorText}>کاربر یافت نشد</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return Colors.success;
      case 'inactive': return Colors.textSecondary;
      case 'suspended': return Colors.danger;
      default: return Colors.textSecondary;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'مدیر';
      case 'teacher': return 'مدرس';
      case 'student': return 'دانش‌آموز';
      default: return role;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="جزئیات کاربر"
        rightComponent={
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditing(!editing)}
          >
            <Ionicons
              name={editing ? 'close' : 'create'}
              size={24}
              color={editing ? Colors.danger : Colors.primary}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: user.profile_image }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            {editing ? (
              <TextInput
                style={styles.editName}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            ) : (
              <Text style={styles.userName}>{user.name}</Text>
            )}
            <View style={styles.profileMeta}>
              <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(user.status)}20` }]}>
                <Text style={[styles.statusText, { color: getStatusColor(user.status) }]}>
                  {user.status === 'active' ? 'فعال' :
                   user.status === 'inactive' ? 'غیرفعال' : 'معلق'}
                </Text>
              </View>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{getRoleText(user.role)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* User Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="school" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{user.enrolled_courses}</Text>
            <Text style={styles.statLabel}>دوره ثبت‌نامی</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            <Text style={styles.statValue}>{user.completed_courses}</Text>
            <Text style={styles.statLabel}>دوره تکمیل شده</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={24} color={Colors.secondary} />
            <Text style={styles.statValue}>{user.total_hours}</Text>
            <Text style={styles.statLabel}>ساعت آموزش</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="ribbon" size={24} color={Colors.warning} />
            <Text style={styles.statValue}>{user.certificates}</Text>
            <Text style={styles.statLabel}>گواهینامه</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>اطلاعات تماس</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="mail" size={20} color={Colors.textSecondary} />
              {editing ? (
                <TextInput
                  style={styles.editInput}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="ایمیل"
                />
              ) : (
                <Text style={styles.infoText}>{user.email}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={20} color={Colors.textSecondary} />
              {editing ? (
                <TextInput
                  style={styles.editInput}
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  placeholder="شماره تماس"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoText}>{user.phone || 'ثبت نشده'}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={Colors.textSecondary} />
              <Text style={styles.infoText}>تاریخ عضویت: {user.join_date}</Text>
            </View>
            {user.last_login && (
              <View style={styles.infoRow}>
                <Ionicons name="log-in" size={20} color={Colors.textSecondary} />
                <Text style={styles.infoText}>آخرین ورود: {user.last_login}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Additional Info */}
        {user.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>درباره کاربر</Text>
            {editing ? (
              <TextInput
                style={[styles.infoCard, styles.editBio]}
                value={formData.bio}
                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                multiline
                numberOfLines={4}
                placeholder="درباره کاربر..."
              />
            ) : (
              <View style={styles.infoCard}>
                <Text style={styles.bioText}>{user.bio}</Text>
              </View>
            )}
          </View>
        )}

        {user.education && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تحصیلات</Text>
            {editing ? (
              <TextInput
                style={[styles.infoCard, styles.editInput]}
                value={formData.education}
                onChangeText={(text) => setFormData({ ...formData, education: text })}
                placeholder="تحصیلات"
              />
            ) : (
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>{user.education}</Text>
              </View>
            )}
          </View>
        )}

        {/* Status Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>مدیریت وضعیت</Text>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.statusAction, { backgroundColor: Colors.success + '20' }]}
              onPress={() => handleStatusChange('active')}
            >
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={[styles.statusActionText, { color: Colors.success }]}>
                فعال‌سازی
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusAction, { backgroundColor: Colors.danger + '20' }]}
              onPress={() => handleStatusChange('suspended')}
            >
              <Ionicons name="pause-circle" size={20} color={Colors.danger} />
              <Text style={[styles.statusActionText, { color: Colors.danger }]}>
                تعلیق
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusAction, { backgroundColor: Colors.warning + '20' }]}
              onPress={() => handleStatusChange('inactive')}
            >
              <Ionicons name="ban" size={20} color={Colors.warning} />
              <Text style={[styles.statusActionText, { color: Colors.warning }]}>
                غیرفعال
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>ناحیه خطر</Text>
          <View style={styles.dangerCard}>
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={24} color={Colors.danger} />
              <Text style={styles.dangerButtonText}>حذف کاربر</Text>
            </TouchableOpacity>
            <Text style={styles.dangerWarning}>
              این عمل قابل بازگشت نیست. تمام اطلاعات کاربر به صورت دائمی حذف خواهد شد.
            </Text>
          </View>
        </View>

        {/* Save/Cancel Buttons */}
        {editing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>ذخیره تغییرات</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => {
                setEditing(false);
                setFormData(user);
              }}
            >
              <Text style={styles.cancelButtonText}>لغو</Text>
            </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: Colors.danger,
    marginTop: 16,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  editName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    backgroundColor: Colors.background,
  },
  profileMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  roleBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleText: {
    fontSize: 12,
    color: Colors.text,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  dangerTitle: {
    color: Colors.danger,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  bioText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 24,
  },
  editInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 8,
    backgroundColor: Colors.background,
  },
  editBio: {
    height: 100,
    textAlignVertical: 'top',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  statusActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dangerCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    gap: 8,
    marginBottom: 12,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.danger,
  },
  dangerWarning: {
    fontSize: 12,
    color: Colors.danger,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
});