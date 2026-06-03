import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Header } from '../../../components/Header';
import { useAuth } from '../../../contexts/AuthContext';

type SettingKey = 
  | 'notifications' 
  | 'emailNotifications' 
  | 'pushNotifications' 
  | 'maintenanceMode' 
  | 'registrationOpen' 
  | 'darkMode' 
  | 'rtlMode' 
  | 'autoBackup' 
  | 'twoFactorAuth';

interface SettingsType {
  notifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  maintenanceMode: boolean;
  registrationOpen: boolean;
  darkMode: boolean;
  rtlMode: boolean;
  autoBackup: boolean;
  twoFactorAuth: boolean;
}

interface SettingItem {
  icon: string;
  title: string;
  description: string;
  type: 'switch' | 'button';
  key?: SettingKey;
  action?: () => void;
  color: string;
}

export default function Settings() {
  const router = useRouter();
  const { logout } = useAuth();
  const [settings, setSettings] = useState<SettingsType>({
    notifications: true,
    emailNotifications: true,
    pushNotifications: false,
    maintenanceMode: false,
    registrationOpen: true,
    darkMode: false,
    rtlMode: true,
    autoBackup: true,
    twoFactorAuth: false,
  });

  const handleLogout = () => {
    Alert.alert(
      'خروج از سیستم',
      'آیا از خروج اطمینان دارید؟',
      [
        { text: 'لغو', style: 'cancel' },
        { text: 'خروج', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleToggle = (key: SettingKey) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    
    // Show alert for critical settings
    if (key === 'maintenanceMode' && !settings.maintenanceMode) {
      Alert.alert(
        'فعال کردن حالت تعمیرات',
        'با فعال کردن این حالت، سایت برای همه کاربران غیر از مدیران غیرفعال می‌شود.',
        [{ text: 'تایید' }]
      );
    }
  };

  const settingSections: Array<{
    title: string;
    items: SettingItem[];
  }> = [
    {
      title: 'سیستم',
      items: [
        {
          icon: 'construct',
          title: 'حالت تعمیرات',
          description: 'غیرفعال کردن سایت برای عموم',
          type: 'switch',
          key: 'maintenanceMode',
          color: Colors.warning,
        },
        {
          icon: 'person-add',
          title: 'ثبت‌نام آزاد',
          description: 'اجازه ثبت‌نام کاربران جدید',
          type: 'switch',
          key: 'registrationOpen',
          color: Colors.success,
        },
        {
          icon: 'cloud-upload',
          title: 'پشتیبان‌گیری خودکار',
          description: 'هر شب در ساعت ۲ بامداد',
          type: 'switch',
          key: 'autoBackup',
          color: Colors.info,
        },
      ],
    },
    {
      title: 'ظاهر',
      items: [
        {
          icon: 'moon',
          title: 'حالت تیره',
          description: 'استفاده از تم تیره',
          type: 'switch',
          key: 'darkMode',
          color: Colors.text,
        },
        {
          icon: 'swap-horizontal',
          title: 'جهت راست به چپ',
          description: 'نمایش متن از راست به چپ',
          type: 'switch',
          key: 'rtlMode',
          color: Colors.primary,
        },
      ],
    },
    {
      title: 'اعلان‌ها',
      items: [
        {
          icon: 'notifications',
          title: 'اعلان‌ها',
          description: 'فعال کردن همه اعلان‌ها',
          type: 'switch',
          key: 'notifications',
          color: Colors.secondary,
        },
        {
          icon: 'mail',
          title: 'ایمیل',
          description: 'ارسال اعلان از طریق ایمیل',
          type: 'switch',
          key: 'emailNotifications',
          color: Colors.info,
        },
        {
          icon: 'phone-portrait',
          title: 'پوش نوتیفیکیشن',
          description: 'اعلان‌های موبایل',
          type: 'switch',
          key: 'pushNotifications',
          color: Colors.success,
        },
      ],
    },
    {
      title: 'امنیت',
      items: [
        {
          icon: 'shield-checkmark',
          title: 'احراز هویت دو مرحله‌ای',
          description: 'افزایش امنیت حساب',
          type: 'switch',
          key: 'twoFactorAuth',
          color: Colors.danger,
        },
        {
          icon: 'key',
          title: 'تغییر رمز عبور',
          description: 'تغییر رمز عبور مدیر',
          type: 'button',
          action: () => router.push('/(admin)/settings/password'),
          color: Colors.warning,
        },
      ],
    },
  ];

  const actions = [
    {
      icon: 'document-text',
      title: 'گزارش سیستم',
      description: 'گزارش کامل عملکرد سیستم',
      action: () => router.push('/(admin)/settings/report'),
      color: Colors.primary,
    },
    {
      icon: 'save',
      title: 'پشتیبان‌گیری',
      description: 'ایجاد پشتیبان از داده‌ها',
      action: () => Alert.alert('پشتیبان‌گیری', 'عملیات پشتیبان‌گیری آغاز شد.'),
      color: Colors.success,
    },
    {
      icon: 'refresh',
      title: 'به‌روزرسانی سیستم',
      description: 'بررسی به‌روزرسانی‌ها',
      action: () => Alert.alert('بررسی به‌روزرسانی', 'در حال بررسی به‌روزرسانی‌ها...'),
      color: Colors.info,
    },
    {
      icon: 'trash',
      title: 'پاک‌سازی کش',
      description: 'پاک کردن داده‌های موقت',
      action: () => Alert.alert('پاک‌سازی کش', 'کش با موفقیت پاک شد.'),
      color: Colors.warning,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="تنظیمات سیستم" />

      <ScrollView style={styles.content}>
        {/* System Info */}
        <View style={styles.systemInfo}>
          <View style={styles.systemInfoHeader}>
            <Ionicons name="server" size={24} color={Colors.primary} />
            <Text style={styles.systemInfoTitle}>اطلاعات سیستم</Text>
          </View>
          <View style={styles.systemInfoGrid}>
            <View style={styles.systemInfoItem}>
              <Text style={styles.systemInfoLabel}>ورژن سیستم</Text>
              <Text style={styles.systemInfoValue}>۲.۱.۴</Text>
            </View>
            <View style={styles.systemInfoItem}>
              <Text style={styles.systemInfoLabel}>آخرین به‌روزرسانی</Text>
              <Text style={styles.systemInfoValue}>۱۴۰۳/۰۶/۱۵</Text>
            </View>
            <View style={styles.systemInfoItem}>
              <Text style={styles.systemInfoLabel}>وضعیت</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>آنلاین</Text>
              </View>
            </View>
            <View style={styles.systemInfoItem}>
              <Text style={styles.systemInfoLabel}>دیتابیس</Text>
              <Text style={styles.systemInfoValue}>MySQL ۸.۰</Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.settingsList}>
              {section.items.map((item, itemIndex) => (
                <View 
                  key={itemIndex} 
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 && styles.settingItemLast
                  ]}
                >
                  <View style={styles.settingIconContainer}>
                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingDescription}>{item.description}</Text>
                  </View>
                  {item.type === 'switch' && item.key ? (
                    <Switch
                      value={settings[item.key]}
                      onValueChange={() => handleToggle(item.key!)}
                      trackColor={{ false: Colors.border, true: Colors.primary }}
                      thumbColor={settings[item.key] ? '#fff' : Colors.textSecondary}
                    />
                  ) : (
                    <TouchableOpacity onPress={item.action}>
                      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>عملیات سریع</Text>
          <View style={styles.actionsGrid}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.action}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, styles.dangerSection]}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>ناحیه خطر</Text>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() => Alert.alert(
              'ریست سیستم',
              'این عمل تمام تنظیمات را به حالت پیش‌فرض بازمی‌گرداند. آیا ادامه می‌دهید؟',
              [
                { text: 'لغو', style: 'cancel' },
                {
                  text: 'ریست',
                  style: 'destructive',
                  onPress: () => Alert.alert('موفق', 'سیستم با موفقیت ریست شد.'),
                },
              ]
            )}
          >
            <Ionicons name="refresh-circle" size={24} color={Colors.danger} />
            <Text style={styles.dangerButtonText}>بازنشانی تنظیمات</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.dangerButton, styles.lastDangerButton]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={24} color={Colors.danger} />
            <Text style={styles.dangerButtonText}>خروج از سیستم</Text>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © ۱۴۰۳ سیستم آموزش الکترونیکی فارسی
          </Text>
          <Text style={styles.footerSubtext}>
            توسعه داده شده با ❤️ برای آموزش فارسی زبانان
          </Text>
        </View>
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
  systemInfo: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  systemInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  systemInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  systemInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  systemInfoItem: {
    width: '48%',
  },
  systemInfoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  systemInfoValue: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: `${Colors.success}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  settingsList: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  dangerSection: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  dangerTitle: {
    color: Colors.danger,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  lastDangerButton: {
    marginBottom: 0,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.danger,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});