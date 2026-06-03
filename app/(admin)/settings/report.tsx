import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { Header } from '../../../components/Header';

interface SystemReport {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  generated_at: string;
  file_size: string;
  download_url?: string;
  status: 'generating' | 'ready' | 'failed';
}

interface SystemStats {
  uptime: string;
  memory_usage: string;
  cpu_usage: string;
  disk_usage: string;
  active_sessions: number;
  api_requests: number;
  database_size: string;
  last_backup: string;
}

export default function SystemReport() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reports, setReports] = useState<SystemReport[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [selectedType, setSelectedType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetchData();
  }, [selectedType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API calls
      const mockReports: SystemReport[] = [
        {
          id: '1',
          title: 'گزارش ماهانه شهریور ۱۴۰۳',
          type: 'monthly',
          generated_at: '۱۴۰۳/۰۶/۰۵ ۱۰:۳۰',
          file_size: '۲.۵ مگابایت',
          download_url: 'https://example.com/report1.pdf',
          status: 'ready',
        },
        {
          id: '2',
          title: 'گزارش هفتگی هفته سوم',
          type: 'weekly',
          generated_at: '۱۴۰۳/۰۶/۲۰ ۱۴:۱۵',
          file_size: '۱.۲ مگابایت',
          download_url: 'https://example.com/report2.pdf',
          status: 'ready',
        },
        {
          id: '3',
          title: 'گزارش سالیانه ۱۴۰۲',
          type: 'yearly',
          generated_at: '۱۴۰۲/۱۲/۲۹ ۰۹:۴۵',
          file_size: '۸.۷ مگابایت',
          download_url: 'https://example.com/report3.pdf',
          status: 'ready',
        },
        {
          id: '4',
          title: 'گزارش ماهانه مرداد ۱۴۰۳',
          type: 'monthly',
          generated_at: '۱۴۰۳/۰۵/۳۰ ۱۱:۲۰',
          file_size: '۲.۱ مگابایت',
          status: 'generating',
        },
      ];

      const mockStats: SystemStats = {
        uptime: '۹۹.۹٪',
        memory_usage: '۶۸٪',
        cpu_usage: '۲۴٪',
        disk_usage: '۵۶٪',
        active_sessions: 342,
        api_requests: 12456,
        database_size: '۲.۸ گیگابایت',
        last_backup: '۱۴۰۳/۰۶/۲۵ ۰۲:۰۰',
      };

      setReports(mockReports.filter(r => r.type === selectedType || selectedType === 'monthly'));
      setStats(mockStats);
    } catch (error) {
      Alert.alert('خطا', 'در دریافت اطلاعات مشکلی پیش آمده');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (type: SystemReport['type']) => {
    try {
      setGenerating(true);
      
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newReport: SystemReport = {
        id: Date.now().toString(),
        title: `گزارش ${getTypeLabel(type)} ${new Date().toLocaleDateString('fa-IR')}`,
        type,
        generated_at: new Date().toLocaleString('fa-IR'),
        file_size: 'در حال تولید...',
        status: 'generating',
      };

      setReports([newReport, ...reports]);

      Alert.alert(
        'موفقیت',
        'گزارش در حال تولید است و پس از آماده‌سازی در لیست نمایش داده خواهد شد.',
        [
          {
            text: 'باشه',
            onPress: () => {
              // Simulate report generation completion
              setTimeout(() => {
                setReports(prev =>
                  prev.map(r =>
                    r.id === newReport.id
                      ? {
                          ...r,
                          status: 'ready',
                          file_size: '۱.۸ مگابایت',
                          download_url: 'https://example.com/report-new.pdf',
                        }
                      : r
                  )
                );
              }, 3000);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('خطا', 'در تولید گزارش مشکلی پیش آمده');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (report: SystemReport) => {
    if (report.status !== 'ready') {
      Alert.alert('توجه', 'گزارش هنوز آماده نیست');
      return;
    }
    
    Alert.alert('دانلود', `گزارش ${report.title} دانلود خواهد شد.`);
    // TODO: Implement download functionality
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'روزانه';
      case 'weekly': return 'هفتگی';
      case 'monthly': return 'ماهانه';
      case 'yearly': return 'سالیانه';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return Colors.success;
      case 'generating': return Colors.warning;
      case 'failed': return Colors.danger;
      default: return Colors.textSecondary;
    }
  };

  if (loading || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="گزارش سیستم" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="گزارش سیستم" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* System Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>وضعیت سیستم</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{stats.uptime}</Text>
              <Text style={styles.statLabel}>آپتایم</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="hardware-chip" size={24} color={Colors.warning} />
              <Text style={styles.statValue}>{stats.cpu_usage}</Text>
              <Text style={styles.statLabel}>CPU</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="server" size={24} color={Colors.success} />
              <Text style={styles.statValue}>{stats.memory_usage}</Text>
              <Text style={styles.statLabel}>RAM</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="save" size={24} color={Colors.secondary} />
              <Text style={styles.statValue}>{stats.disk_usage}</Text>
              <Text style={styles.statLabel}>فضا</Text>
            </View>
          </View>

          <View style={styles.additionalStats}>
            <View style={styles.additionalStat}>
              <Text style={styles.additionalStatLabel}>سشن فعال:</Text>
              <Text style={styles.additionalStatValue}>{stats.active_sessions.toLocaleString()}</Text>
            </View>
            <View style={styles.additionalStat}>
              <Text style={styles.additionalStatLabel}>درخواست API:</Text>
              <Text style={styles.additionalStatValue}>{stats.api_requests.toLocaleString()}</Text>
            </View>
            <View style={styles.additionalStat}>
              <Text style={styles.additionalStatLabel}>اندازه دیتابیس:</Text>
              <Text style={styles.additionalStatValue}>{stats.database_size}</Text>
            </View>
            <View style={styles.additionalStat}>
              <Text style={styles.additionalStatLabel}>آخرین پشتیبان:</Text>
              <Text style={styles.additionalStatValue}>{stats.last_backup}</Text>
            </View>
          </View>
        </View>

        {/* Generate Report */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تولید گزارش جدید</Text>
          <View style={styles.generateGrid}>
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.generateCard,
                  generating && styles.generateCardDisabled,
                ]}
                onPress={() => handleGenerateReport(type)}
                disabled={generating}
              >
                <View style={[styles.generateIcon, { backgroundColor: `${Colors.primary}20` }]}>
                  <Ionicons name="document-text" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.generateText}>{getTypeLabel(type)}</Text>
                <Text style={styles.generateSubtext}>
                  {generating ? 'در حال تولید...' : 'ایجاد گزارش'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Report Type Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>گزارش‌های ذخیره شده</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {(['monthly', 'weekly', 'yearly', 'daily'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterChip,
                  selectedType === type && styles.filterChipActive,
                ]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedType === type && styles.filterChipTextActive,
                ]}>
                  {getTypeLabel(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Reports List */}
        <View style={styles.section}>
          <View style={styles.reportsList}>
            {reports.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={64} color={Colors.textSecondary} />
                <Text style={styles.emptyStateText}>گزارشی یافت نشد</Text>
              </View>
            ) : (
              reports.map(report => (
                <View key={report.id} style={styles.reportCard}>
                  <View style={styles.reportHeader}>
                    <View style={styles.reportInfo}>
                      <Text style={styles.reportTitle}>{report.title}</Text>
                      <View style={styles.reportMeta}>
                        <View style={styles.reportMetaItem}>
                          <Ionicons name="calendar" size={12} color={Colors.textSecondary} />
                          <Text style={styles.reportMetaText}>{report.generated_at}</Text>
                        </View>
                        <View style={styles.reportMetaItem}>
                          <Ionicons name="document" size={12} color={Colors.textSecondary} />
                          <Text style={styles.reportMetaText}>{report.file_size}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.reportStatus}>
                      <View style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(report.status)}20` },
                      ]}>
                        <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                          {report.status === 'ready' ? 'آماده' :
                           report.status === 'generating' ? 'در حال تولید' : 'ناموفق'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.reportActions}>
                    {report.status === 'ready' && report.download_url ? (
                      <>
                        <TouchableOpacity
                          style={styles.reportButton}
                          onPress={() => handleDownload(report)}
                        >
                          <Ionicons name="download" size={20} color={Colors.primary} />
                          <Text style={styles.reportButtonText}>دانلود</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.reportButton, styles.shareButton]}
                        >
                          <Ionicons name="share" size={20} color={Colors.text} />
                          <Text style={[styles.reportButtonText, styles.shareButtonText]}>
                            اشتراک
                          </Text>
                        </TouchableOpacity>
                      </>
                    ) : report.status === 'generating' ? (
                      <View style={styles.generatingContainer}>
                        <ActivityIndicator size="small" color={Colors.warning} />
                        <Text style={styles.generatingText}>در حال تولید...</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.reportButton, styles.retryButton]}
                        onPress={() => handleGenerateReport(report.type)}
                      >
                        <Ionicons name="refresh" size={20} color={Colors.danger} />
                        <Text style={[styles.reportButtonText, styles.retryButtonText]}>
                          تلاش مجدد
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Report Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تنظیمات گزارش</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="notifications" size={20} color={Colors.text} />
              <Text style={styles.settingText}>ارسال گزارش به ایمیل</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="cloud-upload" size={20} color={Colors.text} />
              <Text style={styles.settingText}>ذخیره خودکار در فضای ابری</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Ionicons name="trash" size={20} color={Colors.text} />
              <Text style={styles.settingText}>مدیریت گزارش‌های قدیمی</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>خروجی‌های پشتیبانی شده</Text>
          <View style={styles.exportGrid}>
            <View style={styles.exportItem}>
              <Ionicons name="document-text" size={24} color={Colors.danger} />
              <Text style={styles.exportText}>PDF</Text>
            </View>
            <View style={styles.exportItem}>
              <Ionicons name="document" size={24} color={Colors.success} />
              <Text style={styles.exportText}>Excel</Text>
            </View>
            <View style={styles.exportItem}>
              <Ionicons name="stats-chart" size={24} color={Colors.warning} />
              <Text style={styles.exportText}>CSV</Text>
            </View>
            <View style={styles.exportItem}>
              <Ionicons name="logo-html5" size={24} color={Colors.primary} />
              <Text style={styles.exportText}>HTML</Text>
            </View>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
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
  additionalStats: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  additionalStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  additionalStatLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  additionalStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  generateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  generateCard: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  generateCardDisabled: {
    opacity: 0.5,
  },
  generateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  generateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  generateSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  filterScroll: {
    marginBottom: 16,
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
  reportsList: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 16,
  },
  reportCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reportInfo: {
    flex: 1,
    marginRight: 12,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  reportMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  reportMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  reportStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  reportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  shareButton: {
    backgroundColor: Colors.card,
  },
  shareButtonText: {
    color: Colors.text,
  },
  retryButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  retryButtonText: {
    color: Colors.danger,
  },
  generatingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  generatingText: {
    fontSize: 14,
    color: Colors.warning,
  },
  settingsCard: {
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
  settingText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  exportGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  exportItem: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exportText: {
    fontSize: 12,
    color: Colors.text,
    marginTop: 4,
  },
});