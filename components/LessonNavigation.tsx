// components/LessonNavigation.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Lesson, Topic } from '../types';

interface LessonNavigationProps {
  topics: Topic[];
  lessons: Lesson[];
  currentLessonId: number;
  onLessonSelect: (lessonId: number) => void;
}

export const LessonNavigation: React.FC<LessonNavigationProps> = ({
  topics,
  lessons,
  currentLessonId,
  onLessonSelect,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [expandedTopic, setExpandedTopic] = useState<number | null>(null);

  const getLessonsForTopic = (topicId: number) => {
    return lessons
      .filter(lesson => lesson.topic_id === topicId)
      .sort((a, b) => a.order_no - b.order_no);
  };

  const getNextLesson = () => {
    const currentLesson = lessons.find(l => l.id === currentLessonId);
    if (!currentLesson) return null;

    const topicLessons = getLessonsForTopic(currentLesson.topic_id);
    const currentIndex = topicLessons.findIndex(l => l.id === currentLessonId);
    
    if (currentIndex < topicLessons.length - 1) {
      return topicLessons[currentIndex + 1];
    } else {
      // Find next topic
      const currentTopicIndex = topics.findIndex(t => t.id === currentLesson.topic_id);
      if (currentTopicIndex < topics.length - 1) {
        const nextTopic = topics[currentTopicIndex + 1];
        const nextTopicLessons = getLessonsForTopic(nextTopic.id);
        return nextTopicLessons[0];
      }
    }
    
    return null;
  };

  const getPreviousLesson = () => {
    const currentLesson = lessons.find(l => l.id === currentLessonId);
    if (!currentLesson) return null;

    const topicLessons = getLessonsForTopic(currentLesson.topic_id);
    const currentIndex = topicLessons.findIndex(l => l.id === currentLessonId);
    
    if (currentIndex > 0) {
      return topicLessons[currentIndex - 1];
    } else {
      // Find previous topic
      const currentTopicIndex = topics.findIndex(t => t.id === currentLesson.topic_id);
      if (currentTopicIndex > 0) {
        const prevTopic = topics[currentTopicIndex - 1];
        const prevTopicLessons = getLessonsForTopic(prevTopic.id);
        return prevTopicLessons[prevTopicLessons.length - 1];
      }
    }
    
    return null;
  };

  const nextLesson = getNextLesson();
  const previousLesson = getPreviousLesson();

  const toggleTopic = (topicId: number) => {
    setExpandedTopic(expandedTopic === topicId ? null : topicId);
  };

  const handleLessonSelect = (lessonId: number) => {
    onLessonSelect(lessonId);
    setShowModal(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, !previousLesson && styles.navButtonDisabled]}
          onPress={() => previousLesson && onLessonSelect(previousLesson.id)}
          disabled={!previousLesson}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={previousLesson ? Colors.primary : Colors.textSecondary}
          />
          <View style={styles.navButtonText}>
            <Text style={[styles.navLabel, !previousLesson && styles.navLabelDisabled]}>
              درس قبلی
            </Text>
            {previousLesson && (
              <Text style={styles.navTitle} numberOfLines={1}>
                {previousLesson.title}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chaptersButton}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="list" size={20} color={Colors.primary} />
          <Text style={styles.chaptersText}>فهرست دروس</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, !nextLesson && styles.navButtonDisabled]}
          onPress={() => nextLesson && onLessonSelect(nextLesson.id)}
          disabled={!nextLesson}
        >
          <View style={styles.navButtonText}>
            <Text style={[styles.navLabel, !nextLesson && styles.navLabelDisabled]}>
              درس بعدی
            </Text>
            {nextLesson && (
              <Text style={styles.navTitle} numberOfLines={1}>
                {nextLesson.title}
              </Text>
            )}
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={nextLesson ? Colors.primary : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Lessons Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>فهرست دروس</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {topics.map((topic) => {
              const topicLessons = getLessonsForTopic(topic.id);
              const isExpanded = expandedTopic === topic.id || topicLessons.some(l => l.id === currentLessonId);
              
              return (
                <View key={topic.id} style={styles.topicSection}>
                  <TouchableOpacity
                    style={styles.topicHeader}
                    onPress={() => toggleTopic(topic.id)}
                  >
                    <View style={styles.topicInfo}>
                      <Text style={styles.topicTitle}>{topic.title}</Text>
                      <Text style={styles.topicStats}>
                        {topicLessons.length} درس • {topicLessons.reduce((sum, l) => sum + l.duration, 0)} دقیقه
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={24}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.lessonsList}>
                      {topicLessons.map((lesson) => (
                        <TouchableOpacity
                          key={lesson.id}
                          style={[
                            styles.lessonItem,
                            lesson.id === currentLessonId && styles.lessonItemActive,
                          ]}
                          onPress={() => handleLessonSelect(lesson.id)}
                        >
                          <View style={styles.lessonIcon}>
                            {lesson.is_completed ? (
                              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                            ) : lesson.id === currentLessonId ? (
                              <Ionicons name="play-circle" size={20} color={Colors.primary} />
                            ) : (
                              <Ionicons name="play-circle-outline" size={20} color={Colors.textSecondary} />
                            )}
                          </View>
                          <View style={styles.lessonInfo}>
                            <Text style={[
                              styles.lessonTitle,
                              lesson.id === currentLessonId && styles.lessonTitleActive,
                            ]}>
                              درس {lesson.order_no}: {lesson.title}
                            </Text>
                            <View style={styles.lessonMeta}>
                              <Text style={styles.lessonDuration}>{lesson.duration} دقیقه</Text>
                              {lesson.is_completed && (
                                <View style={styles.completedBadge}>
                                  <Text style={styles.completedText}>تکمیل شده</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    flex: 1,
  },
  navLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  navLabelDisabled: {
    color: Colors.textSecondary,
  },
  navTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  chaptersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
  },
  chaptersText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  topicSection: {
    marginBottom: 16,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  topicStats: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  lessonsList: {
    marginTop: 8,
    paddingRight: 8,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  lessonItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  lessonIcon: {
    width: 40,
    alignItems: 'center',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  lessonTitleActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lessonDuration: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  completedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completedText: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: '500',
  },
});