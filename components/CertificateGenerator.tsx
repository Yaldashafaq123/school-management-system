// components/CertificateGenerator.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { Certificate } from '../types';
import { Colors } from '../constants/Colors';

interface CertificateGeneratorProps {
  certificate: Certificate;
  onDownload?: (url: string) => void;
  onShare?: (url: string) => void;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  certificate,
  onDownload,
  onShare,
}) => {
  const certificateRef = useRef<View>(null);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const generateCertificateImage = async (): Promise<string> => {
    if (!certificateRef.current) {
      throw new Error('Certificate ref not found');
    }

    try {
      const uri = await captureRef(certificateRef.current, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      return uri;
    } catch (error) {
      console.error('Error capturing certificate:', error);
      throw error;
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const uri = await generateCertificateImage();
      
      // Save to local storage
      const fileName = `certificate_${certificate.certificate_number}.png`;
      // Use FileSystem.documentDirectory if available, otherwise use a fallback
      let destination;
      
      // Check if we're in a web environment
      if (Platform.OS === 'web') {
        // For web, create a download link directly
        const link = document.createElement('a');
        link.href = uri;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        destination = uri; // Use the original URI as destination
      } else {
        // For native, try to get the document directory
        try {
          // Try to access the document directory (available in newer versions)
          if ((FileSystem as any).documentDirectory) {
            destination = `${(FileSystem as any).documentDirectory}${fileName}`;
          } else if ((FileSystem as any).cacheDirectory) {
            // Fallback to cache directory
            destination = `${(FileSystem as any).cacheDirectory}${fileName}`;
          } else {
            // Last resort: use the app's document directory path
            destination = fileName;
          }
          
          await FileSystem.copyAsync({
            from: uri,
            to: destination,
          });
        } catch (fsError: any) {
          console.error('FileSystem error:', fsError);
          // If FileSystem fails, just share the original URI
          destination = uri;
        }
      }

      if (onDownload) {
        onDownload(destination);
      }

      Alert.alert(
        'موفقیت',
        'گواهینامه با موفقیت ذخیره شد.',
        [{ text: 'باشه' }]
      );
    } catch (error: any) {
      console.error('Download error:', error);
      Alert.alert('خطا', 'ذخیره گواهینامه ناموفق بود.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    setGenerating(true);
    try {
      const uri = await generateCertificateImage();
      
      if (Platform.OS === 'web') {
        // For web, create a download link
        const link = document.createElement('a');
        link.href = uri;
        link.download = `certificate_${certificate.certificate_number}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For mobile, use the Share API
        await Share.share({
          url: uri,
          title: `گواهینامه ${certificate.course_title}`,
        });
      }

      if (onShare) {
        onShare(uri);
      }
    } catch (error: any) {
      console.error('Share error:', error);
      Alert.alert('خطا', 'اشتراک‌گذاری گواهینامه ناموفق بود.');
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.certificateContainer}>
        <ViewShot ref={certificateRef} options={{ format: 'png', quality: 1 }}>
          {/* Certificate Design */}
          <View style={styles.certificate}>
            {/* Background Pattern */}
            <View style={styles.pattern}>
              <View style={styles.cornerDecoration} />
              <View style={[styles.cornerDecoration, styles.topRight]} />
              <View style={[styles.cornerDecoration, styles.bottomLeft]} />
              <View style={[styles.cornerDecoration, styles.bottomRight]} />
              
              {/* Decorative Border */}
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.border}
              />
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.institution}>آموزش فارسی</Text>
                <Text style={styles.institutionSub}>مرکز آموزش آنلاین</Text>
              </View>

              {/* Title */}
              <View style={styles.titleContainer}>
                <Text style={styles.certificateTitle}>گواهینامه</Text>
                <Text style={styles.certificateSubtitle}>مدرک تکمیل دوره</Text>
              </View>

              {/* Awarded To */}
              <View style={styles.awardedTo}>
                <Text style={styles.awardedToLabel}>تقدیم به</Text>
                <Text style={styles.studentName}>{certificate.student_name}</Text>
              </View>

              {/* Course Info */}
              <View style={styles.courseInfo}>
                <Text style={styles.courseInfoText}>
                  برای موفقیت در تکمیل دوره آموزشی
                </Text>
                <Text style={styles.courseTitle}>{certificate.course_title}</Text>
              </View>

              {/* Details */}
              <View style={styles.details}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>تاریخ صدور:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(certificate.issue_date)}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>شماره گواهینامه:</Text>
                  <Text style={styles.detailValue}>
                    {certificate.certificate_number}
                  </Text>
                </View>
                {certificate.grade && (
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>نمره:</Text>
                    <Text style={styles.detailValue}>{certificate.grade}</Text>
                  </View>
                )}
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>میزان تکمیل:</Text>
                  <Text style={styles.detailValue}>
                    {certificate.completion_percentage}%
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <View style={styles.signatureContainer}>
                  <Text style={styles.signatureLabel}>امضا</Text>
                  <Text style={styles.signatureName}>
                    {certificate.metadata?.instructor || 'استاد دوره'}
                  </Text>
                  <Text style={styles.signatureTitle}>استاد دوره</Text>
                </View>
                
                <View style={styles.issuedBy}>
                  <Text style={styles.issuedByLabel}>صادر شده توسط</Text>
                  <Text style={styles.issuedByName}>
                    {certificate.metadata?.issued_by || 'آموزش فارسی'}
                  </Text>
                </View>
              </View>

              {/* Decorative Seal */}
              <View style={styles.seal}>
                <View style={styles.sealCircle}>
                  <Text style={styles.sealText}>✓</Text>
                </View>
              </View>
            </View>
          </View>
        </ViewShot>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.downloadButton]}
          onPress={handleDownload}
          disabled={downloading || generating}
        >
          {downloading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="download" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>دانلود</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShare}
          disabled={downloading || generating}
        >
          {generating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="share-social" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>اشتراک‌گذاری</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Certificate Info */}
      <View style={styles.info}>
        <Text style={styles.infoTitle}>اطلاعات گواهینامه</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>معتبر:</Text>
            <Text style={styles.infoValue}>بله</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>نوع:</Text>
            <Text style={styles.infoValue}>الکترونیکی</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>قالب:</Text>
            <Text style={styles.infoValue}>PNG</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>وضعیت:</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>فعال</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  certificateContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  certificate: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  pattern: {
    ...StyleSheet.absoluteFillObject,
  },
  cornerDecoration: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    top: -30,
    left: -30,
    transform: [{ rotate: '45deg' }],
  },
  topRight: {
    top: -30,
    right: -30,
    left: 'auto',
  },
  bottomLeft: {
    top: 'auto',
    bottom: -30,
    left: -30,
  },
  bottomRight: {
    top: 'auto',
    bottom: -30,
    right: -30,
    left: 'auto',
  },
  border: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderWidth: 2,
    borderRadius: 4,
  },
  content: {
    padding: 32,
    position: 'relative',
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  institution: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  institutionSub: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  certificateTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  certificateSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  awardedTo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  awardedToLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  studentName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  courseInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  courseInfoText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  details: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 8,
    padding: 20,
    marginBottom: 40,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  signatureContainer: {
    alignItems: 'center',
  },
  signatureLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  signatureName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  signatureTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  issuedBy: {
    alignItems: 'center',
  },
  issuedByLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  issuedByName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seal: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    marginLeft: -30,
  },
  sealCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sealText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  downloadButton: {
    backgroundColor: Colors.primary,
  },
  shareButton: {
    backgroundColor: Colors.secondary,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },
});