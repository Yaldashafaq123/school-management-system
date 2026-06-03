// app/certificates/index.tsx
import { CertificateGenerator } from '@/components/CertificateGenerator';
import { Header } from '@/components/Header';
import { Colors } from '@/constants/Colors';
import { Certificate } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data - Replace with API calls
const mockCertificates: Certificate[] = [
  {
    id: 'CERT-2024-001',
    course_id: 1,
    course_title: 'ریاضی پایه هفتم',
    student_name: 'علی رضایی',
    issue_date: '2024-12-20',
    certificate_number: 'MATH-7-2024-001',
    grade: 'A',
    completion_percentage: 95,
    download_url: 'https://example.com/certificates/cert1.pdf',
    share_url: 'https://example.com/certificates/cert1',
    metadata: {
      issued_by: 'آموزش فارسی',
      instructor: 'دکتر احمدی',
      duration: '۴۸ ساعت',
      credits: 3,
      signature_url: 'https://example.com/signatures/sig1.png',
      seal_url: 'https://example.com/seals/seal1.png',
    },
  },
  {
    id: 'CERT-2024-002',
    course_id: 2,
    course_title: 'علوم تجربی هفتم',
    student_name: 'علی رضایی',
    issue_date: '2024-12-15',
    certificate_number: 'SCI-7-2024-001',
    grade: 'B+',
    completion_percentage: 88,
    download_url: 'https://example.com/certificates/cert2.pdf',
    share_url: 'https://example.com/certificates/cert2',
    metadata: {
      issued_by: 'آموزش فارسی',
      instructor: 'خانم رحیمی',
      duration: '۴۰ ساعت',
      credits: 3,
    },
  },
  {
    id: 'CERT-2024-003',
    course_id: 3,
    course_title: 'آموزش برنامه‌نویسی پایتون',
    student_name: 'علی رضایی',
    issue_date: '2024-11-30',
    certificate_number: 'PY-101-2024-001',
    grade: 'A+',
    completion_percentage: 100,
    expiry_date: '2026-11-30',
    download_url: 'https://example.com/certificates/cert3.pdf',
    share_url: 'https://example.com/certificates/cert3',
    metadata: {
      issued_by: 'آموزش فارسی',
      instructor: 'مهندس کریمی',
      duration: '۶۰ ساعت',
      credits: 5,
    },
  },
];

export default function CertificatesScreen() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);
  const [loading, setLoading] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(mockCertificates[0]);
  const [filter, setFilter] = useState<'all' | 'recent' | 'expiring'>('all');

  const loadCertificates = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filtered = [...mockCertificates];
      if (filter === 'recent') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(cert => 
          new Date(cert.issue_date) > thirtyDaysAgo
        );
      } else if (filter === 'expiring') {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        filtered = filtered.filter(cert => 
          cert.expiry_date && 
          new Date(cert.expiry_date) > today &&
          new Date(cert.expiry_date) < thirtyDaysFromNow
        );
      }
      
      setCertificates(filtered);
      if (filtered.length > 0 && !selectedCertificate) {
        setSelectedCertificate(filtered[0]);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
      Alert.alert('خطا', 'بارگذاری گواهینامه‌ها ناموفق بود');
    } finally {
      setLoading(false);
    }
  }, [filter, selectedCertificate]);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  const handleCertificateSelect = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
  };

  const handleDownload = async (url: string) => {
    // Handle certificate download
    console.log('Downloading certificate from:', url);
    Alert.alert('در حال دانلود', 'گواهینامه در حال دانلود است...');
  };

  const handleShare = async (url: string) => {
    // Handle certificate sharing
    console.log('Sharing certificate:', url);
    Alert.alert('اشتراک‌گذاری', 'لینک گواهینامه کپی شد.');
  };

  const verifyCertificate = async (certificateNumber: string) => {
    try {
      // Simulate API call for verification
      await new Promise(resolve => setTimeout(resolve, 500));
      Alert.alert(
        'تأیید اعتبار',
        `گواهینامه شماره ${certificateNumber} معتبر است.`,
        [{ text: 'باشه' }]
      );
    } catch (error) {
      console.error('Error verifying certificate:', error);
      Alert.alert('خطا', 'تأیید اعتبار ناموفق بود');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && certificates.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="گواهینامه‌ها"
        showBack
        onBackPress={() => router.back()}
        rightComponent={
          <TouchableOpacity onPress={() => router.push('certificates/verify' as any)}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{certificates.length}</Text>
            <Text style={styles.statLabel}>گواهینامه</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {certificates.filter(c => !c.expiry_date).length}
            </Text>
            <Text style={styles.statLabel}>بدون انقضا</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {certificates.filter(c => c.grade === 'A' || c.grade === 'A+').length}
            </Text>
            <Text style={styles.statLabel}>درجه A</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterList}
          >
            {[
              { id: 'all', label: 'همه', icon: 'apps' },
              { id: 'recent', label: 'اخیر', icon: 'time' },
              { id: 'expiring', label: 'در حال انقضا', icon: 'alert-circle' },
            ].map((filterItem) => (
              <TouchableOpacity
                key={filterItem.id}
                style={[
                  styles.filterChip,
                  filter === filterItem.id && styles.filterChipActive,
                ]}
                onPress={() => setFilter(filterItem.id as any)}
              >
                <Ionicons
                  name={filterItem.icon as any}
                  size={16}
                  color={filter === filterItem.id ? '#fff' : Colors.text}
                />
                <Text
                  style={[
                    styles.filterText,
                    filter === filterItem.id && styles.filterTextActive,
                  ]}
                >
                  {filterItem.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Certificates List */}
        {certificates.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={60} color={Colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>گواهینامه‌ای ندارید</Text>
            <Text style={styles.emptyStateText}>
              پس از تکمیل دوره‌ها، گواهینامه‌های شما اینجا نمایش داده می‌شوند.
            </Text>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.certificatesList}
              contentContainerStyle={styles.certificatesListContent}
            >
              {certificates.map((certificate) => (
                <TouchableOpacity
                  key={certificate.id}
                  style={[
                    styles.certificateCard,
                    selectedCertificate?.id === certificate.id && styles.certificateCardActive,
                  ]}
                  onPress={() => handleCertificateSelect(certificate)}
                >
                  <View style={styles.certificateCardHeader}>
                    <View style={styles.certificateIcon}>
                      <Ionicons name="ribbon" size={20} color={Colors.primary} />
                    </View>
                    <View style={styles.certificateInfo}>
                      <Text style={styles.certificateTitle} numberOfLines={1}>
                        {certificate.course_title}
                      </Text>
                      <Text style={styles.certificateNumber}>
                        #{certificate.certificate_number}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.certificateDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>تاریخ:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(certificate.issue_date)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>درجه:</Text>
                      <View style={styles.gradeBadge}>
                        <Text style={styles.gradeText}>{certificate.grade}</Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>تکمیل:</Text>
                      <Text style={styles.detailValue}>
                        {certificate.completion_percentage}%
                      </Text>
                    </View>
                  </View>
                  
                  {certificate.expiry_date && (
                    <View style={styles.expiryBadge}>
                      <Ionicons name="timer" size={12} color={Colors.warning} />
                      <Text style={styles.expiryText}>
                        انقضا: {formatDate(certificate.expiry_date)}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Selected Certificate Preview */}
            {selectedCertificate && (
              <View style={styles.previewSection}>
                <Text style={styles.previewTitle}>پیش‌نمایش گواهینامه</Text>
                <CertificateGenerator
                  certificate={selectedCertificate}
                  onDownload={handleDownload}
                  onShare={handleShare}
                />
                
                {/* Actions */}
                <View style={styles.certificateActions}>
                  <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={() => verifyCertificate(selectedCertificate.certificate_number)}
                  >
                    <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
                    <Text style={styles.verifyButtonText}>تأیید اعتبار</Text>
                  </TouchableOpacity>
                  
                  {selectedCertificate.expiry_date && (
                    <View style={styles.expiryWarning}>
                      <Ionicons name="alert-circle" size={16} color={Colors.warning} />
                      <Text style={styles.expiryWarningText}>
                        این گواهینامه در {formatDate(selectedCertificate.expiry_date)} منقضی می‌شود
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </>
        )}

        {/* How to Earn */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>چگونه گواهینامه دریافت کنیم؟</Text>
          <View style={styles.stepsList}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>۱</Text>
              </View>
              <Text style={styles.stepText}>دوره را تا انتها کامل کنید</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>۲</Text>
              </View>
              <Text style={styles.stepText}>تمامی تکالیف و آزمون‌ها را انجام دهید</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>۳</Text>
              </View>
              <Text style={styles.stepText}>حداقل نمره قبولی را کسب کنید</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>۴</Text>
              </View>
              <Text style={styles.stepText}>گواهینامه شما به طور خودکار صادر می‌شود</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterList: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    gap: 6,
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
  certificatesList: {
    marginHorizontal: -16,
    marginBottom: 20,
  },
  certificatesListContent: {
    paddingHorizontal: 16,
  },
  certificateCard: {
    width: 200,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  certificateCardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  certificateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  certificateIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  certificateInfo: {
    flex: 1,
  },
  certificateTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  certificateNumber: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  certificateDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  gradeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gradeText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: 'bold',
  },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 12,
    gap: 4,
  },
  expiryText: {
    fontSize: 10,
    color: Colors.warning,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  previewSection: {
    marginBottom: 32,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  certificateActions: {
    marginTop: 16,
    gap: 12,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  verifyButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  expiryWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  expiryWarningText: {
    flex: 1,
    fontSize: 14,
    color: Colors.warning,
  },
  infoSection: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  stepsList: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
});