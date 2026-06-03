// components/LessonContent.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions
} from 'react-native';
import RenderHtml, { HTMLSource } from 'react-native-render-html';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Lesson, LessonResource } from '../types';

interface LessonContentProps {
  lesson: Lesson;
  onDownload?: (resource: LessonResource) => void;
  onShare?: (resource: LessonResource) => void;
}

export const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  onDownload,
  onShare,
}) => {
  const htmlSource: HTMLSource = {
    html: lesson.content || '',
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'document-text';
      case 'image':
        return 'image';
      case 'audio':
        return 'musical-notes';
      case 'link':
        return 'link';
      default:
        return 'document-attach';
    }
  };

  const handleResourcePress = async (resource: LessonResource) => {
    if (resource.type === 'link') {
      try {
        await Linking.openURL(resource.url);
      } catch (error) {
        console.error('Error opening link:', error);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Lesson Title */}
      <View style={styles.header}>
        <Text style={styles.title}>{lesson.title}</Text>
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{lesson.duration} دقیقه</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="bookmark-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.metaText}>درس {lesson.order_no}</Text>
          </View>
        </View>
      </View>

      {/* Lesson Content */}
      <View style={styles.content}>
        <RenderHtml
          source={htmlSource}
          contentWidth={width - 32}
          baseStyle={styles.htmlBase}
          tagsStyles={{
            p: { marginBottom: 16, lineHeight: 24, textAlign: 'right' },
            h1: { marginBottom: 16, fontSize: 24, fontWeight: 'bold', textAlign: 'right' },
            h2: { marginBottom: 14, fontSize: 20, fontWeight: 'bold', textAlign: 'right' },
            h3: { marginBottom: 12, fontSize: 18, fontWeight: 'bold', textAlign: 'right' },
            ul: { marginBottom: 16, paddingRight: 20 },
            ol: { marginBottom: 16, paddingRight: 20 },
            li: { marginBottom: 8, textAlign: 'right' },
            a: { color: Colors.primary, textDecorationLine: 'none' },
            strong: { fontWeight: 'bold' },
            em: { fontStyle: 'italic' },
            code: {
              backgroundColor: Colors.border,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              fontFamily: 'monospace',
            },
          }}
        />
      </View>

      {/* Resources */}
      {lesson.resources && lesson.resources.length > 0 && (
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>منابع آموزشی</Text>
          <View style={styles.resourcesList}>
            {lesson.resources.map((resource) => (
              <TouchableOpacity
                key={resource.id}
                style={styles.resourceCard}
                onPress={() => handleResourcePress(resource)}
              >
                <View style={styles.resourceHeader}>
                  <View style={styles.resourceIcon}>
                    <Ionicons
                      name={getResourceIcon(resource.type) as any}
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <View style={styles.resourceInfo}>
                    <Text style={styles.resourceTitle}>{resource.title}</Text>
                    <Text style={styles.resourceType}>
                      {resource.type.toUpperCase()}
                      {resource.file_size && ` • ${formatFileSize(resource.file_size)}`}
                    </Text>
                  </View>
                </View>

                <View style={styles.resourceActions}>
                  {onDownload && resource.type !== 'link' && (
                    <TouchableOpacity
                      style={styles.resourceAction}
                      onPress={() => onDownload(resource)}
                    >
                      <Ionicons name="download-outline" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                  {onShare && (
                    <TouchableOpacity
                      style={styles.resourceAction}
                      onPress={() => onShare(resource)}
                    >
                      <Ionicons name="share-outline" size={20} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Completion Status */}
      <View style={styles.completionSection}>
        <TouchableOpacity style={styles.completionButton}>
          <Ionicons
            name={lesson.is_completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={24}
            color={lesson.is_completed ? Colors.success : Colors.textSecondary}
          />
          <Text style={styles.completionText}>
            {lesson.is_completed ? 'تکمیل شده' : 'علامت‌گذاری به عنوان تکمیل شده'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'right',
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  content: {
    padding: 20,
  },
  htmlBase: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 28,
    textAlign: 'right',
  },
  resourcesSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'right',
  },
  resourcesList: {
    gap: 12,
  },
  resourceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  resourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  resourceType: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  resourceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  resourceAction: {
    padding: 8,
  },
  completionSection: {
    padding: 20,
    paddingTop: 0,
  },
  completionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  completionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
});