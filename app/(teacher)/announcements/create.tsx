import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../../constants/Colors';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { announcementApi, AnnouncementData, Template } from '@/src/config/announcementApi';
import { apiRequest } from '../../../src/config/api';

interface ClassItem {
  id: number;
  name: string;
  selected: boolean;
}

export default function AnnouncementCreator() {
  const router = useRouter();
  const { user, token } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'GENERAL' as 'GENERAL' | 'ASSIGNMENT' | 'EXAM' | 'EVENT',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    attachments: [] as string[],
    scheduleDate: null as Date | null,
    allowComments: true,
    requireConfirmation: false,
  });
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch teacher's classes
  const fetchClasses = useCallback(async () => {
    try {
      setFetchLoading(true);
      const response = await apiRequest('/teacher/classes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.success) {
        setClasses(response.data.map((cls: any) => ({
          id: cls.id,
          name: cls.name,
          selected: false
        })));
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      Alert.alert('خطا', 'دریافت لیست کلاس‌ها با مشکل مواجه شد');
    } finally {
      setFetchLoading(false);
    }
  }, [token]);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await announcementApi.getTemplates();
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }, []);

  // Fetch teacher's classes
  useEffect(() => {
    fetchClasses();
    fetchTemplates();
  }, [fetchClasses, fetchTemplates]);

  const handleClassToggle = (classId: number) => {
    setClasses(classes.map(cls => 
      cls.id === classId ? { ...cls, selected: !cls.selected } : cls
    ));
  };

  const handleSelectAll = () => {
    const allSelected = classes.every(cls => cls.selected);
    setClasses(classes.map(cls => ({ ...cls, selected: !allSelected })));
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('مجوز لازم', 'برای انتخاب عکس به دسترسی گالری نیاز دارید.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setFormData({...formData, attachments: [...formData.attachments, result.assets[0].uri]});
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setFormData({...formData, attachments: []});
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      Alert.alert('خطا', 'لطفاً عنوان اعلان را وارد کنید');
      return;
    }

    if (!formData.content.trim()) {
      Alert.alert('خطا', 'لطفاً متن اعلان را وارد کنید');
      return;
    }

    const selectedClasses = classes.filter(cls => cls.selected);
    if (selectedClasses.length === 0) {
      Alert.alert('خطا', 'لطفاً حداقل یک کلاس را انتخاب کنید');
      return;
    }

    Alert.alert(
      'ایجاد اعلان',
      `آیا می‌خواهید اعلان "${formData.title}" را ارسال کنید؟`,
      [
        { text: 'لغو', style: 'cancel' },
        {
          text: 'ارسال',
          onPress: async () => {
            setLoading(true);
            try {
              const targetClassIds = selectedClasses.map(cls => cls.id);
              
              const announcementData: AnnouncementData = {
                title: formData.title,
                content: formData.content,
                type: formData.type, // Now matches the interface
                priority: formData.priority,
                targetClassIds,
                scheduledFor: formData.scheduleDate,
                allowComments: formData.allowComments,
                requireConfirmation: formData.requireConfirmation,
                attachments: formData.attachments.length > 0 ? [{
                  url: formData.attachments[0],
                  type: 'image',
                  filename: 'attachment.jpg',
                }] : undefined,
              };

              const response = await announcementApi.create(announcementData);

              if (response.success) {
                Alert.alert('موفقیت', 'اعلان با موفقیت ارسال شد');
                router.back();
              }
            } catch (error: any) {
              Alert.alert('خطا', error.message || 'ارسال اعلان ناموفق بود');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      const selectedClasses = classes.filter(cls => cls.selected);
      
      const draftData: Partial<AnnouncementData> = {
        title: formData.title,
        content: formData.content,
        type: formData.type, // Now matches the interface
        priority: formData.priority,
        targetClassIds: selectedClasses.map(cls => cls.id),
        scheduledFor: formData.scheduleDate,
        allowComments: formData.allowComments,
        requireConfirmation: formData.requireConfirmation,
        attachments: formData.attachments.length > 0 ? [{
          url: formData.attachments[0],
          type: 'image',
        }] : undefined,
      };

      const response = await announcementApi.saveDraft(draftData);

      if (response.success) {
        Alert.alert('موفقیت', 'پیش‌نویس با موفقیت ذخیره شد');
      }
    } catch (error: any) {
      Alert.alert('خطا', error.message || 'ذخیره پیش‌نویس ناموفق بود');
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (template: Template) => {
    // Convert template type to match AnnouncementData type
    const templateType = template.type.toUpperCase() as 'GENERAL' | 'ASSIGNMENT' | 'EXAM' | 'EVENT';
    
    setFormData({
      ...formData,
      title: template.title,
      content: template.content,
      type: templateType,
      priority: template.priority.toLowerCase() as any,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return Colors.success;
      case 'normal': return Colors.primary;
      case 'high': return Colors.warning;
      case 'urgent': return Colors.danger;
      default: return Colors.primary;
    }
  };

  if (fetchLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header title="ایجاد اعلان" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="ایجاد اعلان"
        showBack
        rightComponent={
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={handleSaveDraft} 
              style={styles.saveDraftButton}
              disabled={loading}
            >
              <Text style={styles.saveDraftText}>ذخیره پیش‌نویس</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} disabled={loading}>
              <Text style={styles.submitButton}>
                {loading ? 'در حال ارسال...' : 'ارسال'}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Type Selection */}
        <View style={styles.typeSelector}>
          <Text style={styles.sectionTitle}>نوع اعلان</Text>
          <View style={styles.typeButtons}>
            {(['GENERAL', 'ASSIGNMENT', 'EXAM', 'EVENT'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  formData.type === type && styles.typeButtonActive,
                  { backgroundColor: formData.type === type ? Colors.primary + '20' : Colors.card }
                ]}
                onPress={() => setFormData({...formData, type})}
              >
                <Ionicons
                  name={
                    type === 'GENERAL' ? 'megaphone' :
                    type === 'ASSIGNMENT' ? 'document-text' :
                    type === 'EXAM' ? 'clipboard' : 'calendar'
                  }
                  size={20}
                  color={formData.type === type ? Colors.primary : Colors.textSecondary}
                />
                <Text style={[
                  styles.typeButtonText,
                  { color: formData.type === type ? Colors.primary : Colors.text }
                ]}>
                  {type === 'GENERAL' ? 'عمومی' :
                   type === 'ASSIGNMENT' ? 'تکلیف' :
                   type === 'EXAM' ? 'آزمون' : 'رویداد'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority Selector */}
        <View style={styles.prioritySelector}>
          <Text style={styles.sectionTitle}>اولویت</Text>
          <View style={styles.priorityButtons}>
            {['low', 'normal', 'high', 'urgent'].map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.priorityButton,
                  formData.priority === priority && styles.priorityButtonActive
                ]}
                onPress={() => setFormData({...formData, priority: priority as any})}
              >
                <View style={[
                  styles.priorityDot,
                  { backgroundColor: getPriorityColor(priority) }
                ]} />
                <Text style={[
                  styles.priorityButtonText,
                  formData.priority === priority && styles.priorityButtonTextActive
                ]}>
                  {priority === 'low' ? 'کم' :
                   priority === 'normal' ? 'معمولی' :
                   priority === 'high' ? 'زیاد' : 'فوری'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>عنوان اعلان *</Text>
          <TextInput
            style={styles.input}
            placeholder="مثال: تغییر ساعت کلاس"
            value={formData.title}
            onChangeText={(text) => setFormData({...formData, title: text})}
            maxLength={100}
            editable={!loading}
          />
        </View>

        {/* Content Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>متن اعلان *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="متن اعلان را اینجا بنویسید..."
            value={formData.content}
            onChangeText={(text) => setFormData({...formData, content: text})}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            editable={!loading}
          />
        </View>

        {/* Image Attachment */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>افزودن تصویر (اختیاری)</Text>
          {selectedImage ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeImageButton} onPress={handleRemoveImage} disabled={loading}>
                <Ionicons name="close-circle" size={24} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.imageUploadButton} 
              onPress={handleImagePick}
              disabled={loading}
            >
              <Ionicons name="image" size={40} color={Colors.textSecondary} />
              <Text style={styles.uploadText}>افزودن تصویر</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Class Selection */}
        <View style={styles.formGroup}>
          <View style={styles.classHeader}>
            <Text style={styles.label}>کلاس‌های هدف *</Text>
            <TouchableOpacity onPress={handleSelectAll}>
              <Text style={styles.selectAllText}>
                {classes.every(cls => cls.selected) ? 'لغو انتخاب همه' : 'انتخاب همه'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.classesList}>
            {classes.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                style={[
                  styles.classChip,
                  cls.selected && styles.classChipSelected
                ]}
                onPress={() => handleClassToggle(cls.id)}
                disabled={loading}
              >
                <Ionicons
                  name={cls.selected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={cls.selected ? Colors.primary : Colors.textSecondary}
                />
                <Text style={[
                  styles.classChipText,
                  cls.selected && styles.classChipTextSelected
                ]}>
                  {cls.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Schedule Options */}
        <View style={styles.scheduleSection}>
          <Text style={styles.sectionTitle}>زمان‌بندی ارسال</Text>
          
          <View style={styles.scheduleOption}>
            <View style={styles.scheduleInfo}>
              <Ionicons name="time" size={20} color={Colors.text} />
              <View style={styles.scheduleText}>
                <Text style={styles.scheduleTitle}>ارسال فوری</Text>
                <Text style={styles.scheduleDescription}>
                  اعلان بلافاصله ارسال می‌شود
                </Text>
              </View>
            </View>
            <Switch
              value={formData.scheduleDate === null}
              onValueChange={(value) => {
                if (value) {
                  setFormData({...formData, scheduleDate: null});
                }
              }}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              disabled={loading}
            />
          </View>
          
          {formData.scheduleDate === null && (
            <TouchableOpacity
              style={styles.scheduleButton}
              onPress={() => setShowDatePicker(true)}
              disabled={loading}
            >
              <Ionicons name="calendar" size={20} color={Colors.primary} />
              <Text style={styles.scheduleButtonText}>تعیین زمان ارسال</Text>
            </TouchableOpacity>
          )}
          
          {formData.scheduleDate && (
            <View style={styles.scheduledDate}>
              <Text style={styles.scheduledDateText}>
                زمان ارسال: {formData.scheduleDate.toLocaleDateString('fa-IR')}
              </Text>
              <TouchableOpacity onPress={() => setFormData({...formData, scheduleDate: null})} disabled={loading}>
                <Ionicons name="close-circle" size={20} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Additional Options */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>تنظیمات اضافی</Text>
          
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Ionicons name="chatbubble" size={20} color={Colors.text} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>اجازه نظر دادن</Text>
                <Text style={styles.optionDescription}>
                  دانش‌آموزان می‌توانند نظر بدهند
                </Text>
              </View>
            </View>
            <Switch
              value={formData.allowComments}
              onValueChange={(value) => setFormData({...formData, allowComments: value})}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              disabled={loading}
            />
          </View>
          
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Ionicons name="checkmark-done" size={20} color={Colors.text} />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>درخواست تأیید</Text>
                <Text style={styles.optionDescription}>
                  دانش‌آموزان باید اعلان را تأیید کنند
                </Text>
              </View>
            </View>
            <Switch
              value={formData.requireConfirmation}
              onValueChange={(value) => setFormData({...formData, requireConfirmation: value})}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              disabled={loading}
            />
          </View>
        </View>

        {/* Preview Section */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>پیش‌نمایش</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.previewPriority}>
                <View style={[
                  styles.previewPriorityDot,
                  { backgroundColor: getPriorityColor(formData.priority) }
                ]} />
                <Text style={[
                  styles.previewPriorityText,
                  { color: getPriorityColor(formData.priority) }
                ]}>
                  {formData.priority === 'low' ? 'کم' :
                   formData.priority === 'normal' ? 'معمولی' :
                   formData.priority === 'high' ? 'زیاد' : 'فوری'}
                </Text>
              </View>
              <Text style={styles.previewTime}>لحظاتی پیش</Text>
            </View>
            
            <Text style={styles.previewTitle}>
              {formData.title || 'عنوان اعلان'}
            </Text>
            
            <Text style={styles.previewContent}>
              {formData.content || 'متن اعلان اینجا نمایش داده می‌شود...'}
            </Text>
            
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            )}
            
            <View style={styles.previewFooter}>
              <View style={styles.previewClasses}>
                <Ionicons name="school" size={16} color={Colors.textSecondary} />
                <Text style={styles.previewClassesText}>
                  {classes.filter(c => c.selected).map(c => c.name).join('، ') || 'همه کلاس‌ها'}
                </Text>
              </View>
              <Text style={styles.previewAuthor}>{user?.fullName || 'استاد'}</Text>
            </View>
          </View>
        </View>

        {/* Templates */}
        {templates.length > 0 && (
          <View style={styles.templatesSection}>
            <Text style={styles.sectionTitle}>قالب‌های از پیش تعریف شده</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {templates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={styles.templateCard}
                  onPress={() => applyTemplate(template)}
                  disabled={loading}
                >
                  <Ionicons 
                    name={
                      template.icon as any || 
                      (template.type === 'GENERAL' ? 'megaphone' :
                       template.type === 'ASSIGNMENT' ? 'document-text' :
                       template.type === 'EXAM' ? 'clipboard' : 'calendar')
                    } 
                    size={24} 
                    color={Colors.primary} 
                  />
                  <Text style={styles.templateTitle}>{template.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={formData.scheduleDate || new Date()}
          mode="datetime"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setFormData({...formData, scheduleDate: date});
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

// Keep your existing styles...
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  saveDraftButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.background,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveDraftText: {
    fontSize: 14,
    color: Colors.text,
  },
  submitButton: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  typeSelector: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
    flex: 1,
    minWidth: '48%',
  },
  typeButtonActive: {
    borderColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  prioritySelector: {
    marginBottom: 20,
  },
  priorityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
    flex: 1,
    minWidth: '48%',
  },
  priorityButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  priorityButtonText: {
    fontSize: 12,
    color: Colors.text,
    flex: 1,
  },
  priorityButtonTextActive: {
    color: Colors.primary,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'right',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  imageUploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 40,
    borderStyle: 'dashed',
  },
  uploadText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  imagePreview: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: Colors.border,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  classesList: {
    gap: 8,
  },
  classChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  classChipSelected: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  classChipText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  classChipTextSelected: {
    color: Colors.primary,
    fontWeight: '500',
  },
  scheduleSection: {
    marginBottom: 20,
  },
  scheduleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  scheduleText: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  scheduleDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  scheduleButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  scheduledDate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scheduledDateText: {
    fontSize: 14,
    color: Colors.text,
  },
  optionsSection: {
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  previewSection: {
    marginBottom: 20,
  },
  previewCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewPriority: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewPriorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewPriorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  previewTime: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  previewContent: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  previewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  previewClasses: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  previewClassesText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  previewAuthor: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  templatesSection: {
    marginBottom: 32,
  },
  templateCard: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 12,
    width: 120,
  },
  templateTitle: {
    fontSize: 12,
    color: Colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
});