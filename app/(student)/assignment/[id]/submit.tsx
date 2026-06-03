import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '@/constants/Colors';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { studentApi, Assignment } from '@/src/config/studentApi';

type Attachment = {
  id: string;
  uri: string;
  name: string;
  type: 'image' | 'pdf' | 'document';
  size?: number;
};

export default function AssignmentSubmitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    loadAssignment();
  }, [id]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const response = await studentApi.getAssignmentDetail(Number(id));
      if (response.success && response.data) {
        setAssignment(response.data);
        // If already submitted, load existing submission
        if (response.data.submission) {
          setContent(response.data.submission.content || '');
        }
      } else {
        Alert.alert('خطا', 'تکلیف مورد نظر یافت نشد');
        router.back();
      }
    } catch (error) {
      console.error('Error loading assignment:', error);
      Alert.alert('خطا', 'مشکل در بارگذاری تکلیف');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        name: result.assets[0].fileName || `image_${Date.now()}.jpg`,
        type: 'image',
      };
      setAttachments([...attachments, newAttachment]);
    }
    setShowMenu(false);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('خطا', 'دسترسی به دورانه داده نشده است');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        name: `photo_${Date.now()}.jpg`,
        type: 'image',
      };
      setAttachments([...attachments, newAttachment]);
    }
    setShowMenu(false);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        uri: file.uri,
        name: file.name,
        type: file.mimeType?.includes('pdf') ? 'pdf' : 
              file.mimeType?.includes('image') ? 'image' : 'document',
        size: file.size,
      };
      setAttachments([...attachments, newAttachment]);
    }
    setShowMenu(false);
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) {
      Alert.alert('خطا', 'لطفاً توضیحات یا فایل تکلیف را وارد کنید');
      return;
    }

    Alert.alert(
      'تأیید تحویل',
      'آیا از تحویل تکلیف مطمئن هستید؟ پس از تحویل نمی‌توانید تغییراتی اعمال کنید.',
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'تحویل',
          style: 'default',
          onPress: async () => {
            try {
              setSubmitting(true);
              
              // Create file attachments for upload
              const files = attachments.map(att => ({
                uri: att.uri,
                name: att.name,
                type: att.type === 'image' ? 'image/jpeg' : 'application/pdf',
              } as any));

              const response = await studentApi.submitAssignment(Number(id), {
                content,
                attachments: files,
              });
              
              if (response.success) {
                Alert.alert(
                  'موفق',
                  'تکلیف با موفقیت تحویل داده شد',
                  [{ text: 'باشه', onPress: () => router.back() }]
                );
              } else {
                Alert.alert('خطا', response.message || 'مشکل در تحویل تکلیف');
              }
            } catch (error) {
              console.error('Error submitting assignment:', error);
              Alert.alert('خطا', 'مشکل در ارتباط با سرور');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="تحویل تکلیف" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!assignment) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="خطا" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color={Colors.danger} />
          <Text style={styles.errorText}>تکلیف مورد نظر یافت نشد</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>بازگشت</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="تحویل تکلیف"
        rightComponent={
          <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name="checkmark" size={24} color={Colors.primary} />
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content}>
        {/* Assignment Info */}
        <View style={styles.infoCard}>
          <Text style={styles.assignmentTitle}>{assignment.title}</Text>
          <Text style={styles.courseName}>{assignment.course_name}</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              مهلت: {formatDate(assignment.due_date)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="star" size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              نمره: {assignment.max_score}
            </Text>
          </View>

          {assignment.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>توضیحات:</Text>
              <Text style={styles.description}>{assignment.description}</Text>
            </View>
          )}

          {assignment.instructions && (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>دستورالعمل:</Text>
              <Text style={styles.instructions}>{assignment.instructions}</Text>
            </View>
          )}
        </View>

        {/* Answer Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>پاسخ شما</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="توضیحات خود را وارد کنید..."
            placeholderTextColor={Colors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Attachments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>فایل‌های پیوست</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowMenu(true)}>
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
              <Text style={styles.addButtonText}>افزودن فایل</Text>
            </TouchableOpacity>
          </View>

          {attachments.length === 0 ? (
            <View style={styles.emptyAttachments}>
              <Ionicons name="attach-outline" size={40} color={Colors.textSecondary} />
              <Text style={styles.emptyAttachmentsText}>هنوز فایلی اضافه نشده است</Text>
              <Text style={styles.emptyAttachmentsSubtext}>
                می‌توانید عکس، PDF یا فایل Word آپلود کنید
              </Text>
            </View>
          ) : (
            <View style={styles.attachmentsList}>
              {attachments.map((attachment) => (
                <View key={attachment.id} style={styles.attachmentItem}>
                  {attachment.type === 'image' ? (
                    <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                  ) : (
                    <View style={styles.attachmentIcon}>
                      <Ionicons
                        name={attachment.type === 'pdf' ? 'document-text' : 'document'}
                        size={32}
                        color={Colors.primary}
                      />
                    </View>
                  )}
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      {attachment.name}
                    </Text>
                    {attachment.size && (
                      <Text style={styles.attachmentSize}>
                        {Math.round(attachment.size / 1024)} KB
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeAttachment(attachment.id)}
                  >
                    <Ionicons name="close-circle" size={24} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>تحویل تکلیف</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Attachment Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>انتخاب فایل</Text>
            
            <TouchableOpacity style={styles.menuItem} onPress={takePhoto}>
              <Ionicons name="camera" size={24} color={Colors.primary} />
              <Text style={styles.menuItemText}>گرفتن عکس</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={pickImage}>
              <Ionicons name="images" size={24} color={Colors.primary} />
              <Text style={styles.menuItemText}>انتخاب از گالری</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={pickDocument}>
              <Ionicons name="document" size={24} color={Colors.primary} />
              <Text style={styles.menuItemText}>انتخاب فایل</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.menuItem, styles.cancelItem]} onPress={() => setShowMenu(false)}>
              <Text style={styles.cancelText}>لغو</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  assignmentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  descriptionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  instructionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 6,
  },
  instructions: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  contentInput: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  emptyAttachments: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyAttachmentsText: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyAttachmentsSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  attachmentsList: {
    gap: 12,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  attachmentImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  attachmentIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  attachmentSize: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  removeButton: {
    padding: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  cancelItem: {
    justifyContent: 'center',
    borderBottomWidth: 0,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.danger,
    fontWeight: '500',
    textAlign: 'center',
  },
});