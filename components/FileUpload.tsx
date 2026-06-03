// components/FileUpload.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'; // Removed unused Platform
import * as DocumentPicker from 'expo-document-picker';
// Removed unused FileSystem import
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface FileUploadProps {
  onFilesSelected: (files: any[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  existingFiles?: any[];
  onRemoveFile?: (fileId: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  maxFiles = 5,
  maxSize = 10, // 10MB default
  allowedTypes = [
    'application/pdf',
    'image/*',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  existingFiles = [],
  onRemoveFile,
}) => {
  const [, setUploading] = useState(false); // Prefix with underscore since it's not used
  const [selectedFiles, setSelectedFiles] = useState<any[]>(existingFiles);

  const pickDocument = async () => {
    if (selectedFiles.length >= maxFiles) {
      Alert.alert(
        'حداکثر تعداد فایل',
        `شما نمی‌توانید بیشتر از ${maxFiles} فایل آپلود کنید.`
      );
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const files = result.assets;
      const validFiles = [];
      const invalidFiles = [];

      for (const file of files) {
        // Check file size - use optional chaining and provide default
        const fileSizeMB = (file.size || 0) / (1024 * 1024);
        if (fileSizeMB > maxSize) {
          invalidFiles.push({
            name: file.name,
            reason: `حجم فایل (${fileSizeMB.toFixed(1)}MB) بیشتر از حد مجاز (${maxSize}MB) است.`,
          });
          continue;
        }

        // Check file type
        const fileType = file.mimeType || '';
        const isTypeAllowed = allowedTypes.some(type => {
          if (type.endsWith('/*')) {
            const category = type.split('/')[0];
            return fileType.startsWith(category + '/');
          }
          return fileType === type;
        });

        if (!isTypeAllowed) {
          invalidFiles.push({
            name: file.name,
            reason: 'نوع فایل مجاز نیست.',
          });
          continue;
        }

        // Generate unique ID
        const fileWithId = {
          ...file,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          size: file.size || 0, // Provide default value
          type: fileType,
          localUri: file.uri,
        };

        validFiles.push(fileWithId);
      }

      // Show warnings for invalid files
      if (invalidFiles.length > 0) {
        const message = invalidFiles
          .map(f => `${f.name}: ${f.reason}`)
          .join('\n');
        Alert.alert('فایل‌های نامعتبر', message);
      }

      if (validFiles.length > 0) {
        const newFiles = [...selectedFiles, ...validFiles].slice(0, maxFiles);
        setSelectedFiles(newFiles);
        onFilesSelected(newFiles);
      }

    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('خطا', 'در انتخاب فایل خطایی رخ داد.');
    }
  };

  const removeFile = (fileId: string) => {
    const newFiles = selectedFiles.filter(file => file.id !== fileId);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
    
    if (onRemoveFile) {
      onRemoveFile(fileId);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'document-text';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document-text';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'document-text';
    if (mimeType.includes('text')) return 'document-text';
    return 'document-attach';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const uploading = false; // Added for the conditional rendering below

  return (
    <View style={styles.container}>
      {/* Upload Button */}
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={pickDocument}
        disabled={selectedFiles.length >= maxFiles}
      >
        {uploading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <>
            <Ionicons name="cloud-upload" size={24} color={Colors.primary} />
            <View style={styles.uploadTextContainer}>
              <Text style={styles.uploadButtonText}>افزودن فایل</Text>
              <Text style={styles.uploadInfoText}>
                حداکثر {maxFiles} فایل • هر فایل تا {maxSize}MB
              </Text>
            </View>
          </>
        )}
      </TouchableOpacity>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <View style={styles.filesList}>
          <Text style={styles.filesTitle}>
            فایل‌های انتخاب شده ({selectedFiles.length}/{maxFiles})
          </Text>
          
          {selectedFiles.map((file) => (
            <View key={file.id} style={styles.fileItem}>
              <View style={styles.fileInfo}>
                <View style={styles.fileIcon}>
                  <Ionicons
                    name={getFileIcon(file.type) as any}
                    size={20}
                    color={Colors.primary}
                  />
                </View>
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.fileMeta}>
                    {formatFileSize(file.size)} • {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeFile(file.id)}
              >
                <Ionicons name="close-circle" size={20} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* File Type Info */}
      <View style={styles.fileTypesInfo}>
        <Text style={styles.fileTypesTitle}>انواع فایل مجاز:</Text>
        <View style={styles.fileTypesList}>
          <View style={styles.fileTypeBadge}>
            <Ionicons name="document-text" size={12} color={Colors.primary} />
            <Text style={styles.fileTypeText}>PDF</Text>
          </View>
          <View style={styles.fileTypeBadge}>
            <Ionicons name="image" size={12} color={Colors.primary} />
            <Text style={styles.fileTypeText}>عکس</Text>
          </View>
          <View style={styles.fileTypeBadge}>
            <Ionicons name="document-text" size={12} color={Colors.primary} />
            <Text style={styles.fileTypeText}>Word</Text>
          </View>
          <View style={styles.fileTypeBadge}>
            <Ionicons name="document-text" size={12} color={Colors.primary} />
            <Text style={styles.fileTypeText}>Excel</Text>
          </View>
          <View style={styles.fileTypeBadge}>
            <Ionicons name="document-text" size={12} color={Colors.primary} />
            <Text style={styles.fileTypeText}>Text</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  uploadTextContainer: {
    flex: 1,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  uploadInfoText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  filesList: {
    gap: 8,
  },
  filesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  fileIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 2,
  },
  fileMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  removeButton: {
    padding: 4,
  },
  fileTypesInfo: {
    gap: 8,
  },
  fileTypesTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  fileTypesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fileTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  fileTypeText: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '500',
  },
});