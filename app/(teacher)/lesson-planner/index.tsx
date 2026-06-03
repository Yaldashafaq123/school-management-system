import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Define TypeScript interfaces
type LessonStatus = 'scheduled' | 'completed';
type FilterType = 'all' | 'scheduled' | 'completed';

interface Lesson {
  id: string;
  title: string;
  date: string;
  time: string;
  class: string;
  status: LessonStatus;
  objectives: string[];
  materials: string[];
}

const lessonsData: Lesson[] = [
  { 
    id: '1', 
    title: 'مقدمه‌ای بر جبر', 
    date: '۱۴۰۲/۱۰/۳۰', 
    time: '۱۰:۳۰ - ۱۱:۳۰',
    class: 'ریاضی ۱۰۱',
    status: 'scheduled',
    objectives: ['درک مفاهیم پایه جبر', 'حل معادلات خطی'],
    materials: ['کتاب درسی فصل ۱', 'ورک‌شیت ۱A']
  },
  { 
    id: '2', 
    title: 'معادلات درجه دوم', 
    date: '۱۴۰۲/۱۰/۲۹', 
    time: '۱۰:۳۰ - ۱۱:۳۰',
    class: 'ریاضی ۱۰۱',
    status: 'completed',
    objectives: ['حل معادلات درجه دوم', 'رسم سهمی'],
    materials: ['کتاب درسی فصل ۲', 'کاغذ گراف']
  },
  { 
    id: '3', 
    title: 'مبانی مثلثات', 
    date: '۱۴۰۲/۱۱/۰۴', 
    time: '۱۰:۳۰ - ۱۱:۳۰',
    class: 'ریاضی ۱۰۱',
    status: 'scheduled',
    objectives: ['آشنایی با توابع مثلثاتی', 'حل مثلث‌های قائم‌الزاویه'],
    materials: ['کتاب درسی فصل ۳', 'ماشین حساب']
  },
];

export default function LessonPlannerPage() {
  const router = useRouter();
  const [lessons] = useState<Lesson[]>(lessonsData);
  const [showModal, setShowModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [filter, setFilter] = useState<FilterType>('all'); // 'all', 'scheduled', 'completed'

  const filteredLessons = lessons.filter(lesson => {
    if (filter === 'all') return true;
    return lesson.status === filter;
  });

  const viewLessonDetails = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowModal(true);
  };

  const createNewLesson = () => {
    router.push('/(teacher)/lesson-planner/create' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>برنامه‌ریزی درس</Text>
        <TouchableOpacity style={styles.addButton} onPress={createNewLesson}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            همه دروس
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'scheduled' && styles.filterButtonActive]}
          onPress={() => setFilter('scheduled')}
        >
          <Text style={[styles.filterText, filter === 'scheduled' && styles.filterTextActive]}>
            برنامه‌ریزی شده
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            تکمیل شده
          </Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Overview */}
      <View style={styles.calendarOverview}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarTitle}>این هفته</Text>
          <TouchableOpacity>
            <Text style={styles.viewCalendarText}>مشاهده تقویم</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.calendarDays}>
            {['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه'].map((day, index) => (
              <View key={day} style={styles.calendarDay}>
                <Text style={styles.dayName}>{day}</Text>
                <Text style={styles.dayNumber}> {30 + index}</Text>
                {index < 3 && (
                  <View style={styles.dayDot}>
                    <Text style={styles.dayDotText}>۲</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Lessons List */}
      <ScrollView style={styles.lessonsList} showsVerticalScrollIndicator={false}>
        {filteredLessons.map((lesson) => (
          <TouchableOpacity
            key={lesson.id}
            style={styles.lessonCard}
            onPress={() => viewLessonDetails(lesson)}
          >
            <View style={styles.lessonHeader}>
              <View style={styles.lessonTitleContainer}>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: lesson.status === 'completed' ? '#4CAF50' : '#2196F3' }
                ]} />
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </View>

            <View style={styles.lessonMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.metaText}>{lesson.date}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.metaText}>{lesson.time}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="school-outline" size={16} color="#666" />
                <Text style={styles.metaText}>{lesson.class}</Text>
              </View>
            </View>

            <View style={styles.objectivesContainer}>
              <Text style={styles.objectivesTitle}>اهداف یادگیری:</Text>
              {lesson.objectives.slice(0, 2).map((objective: string, index: number) => (
                <View key={index} style={styles.objectiveItem}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                  <Text style={styles.objectiveText}>{objective}</Text>
                </View>
              ))}
              {lesson.objectives.length > 2 && (
                <Text style={styles.moreText}>+{lesson.objectives.length - 2} بیشتر</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lesson Details Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedLesson && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedLesson.title}</Text>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {/* Lesson Info */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>اطلاعات درس</Text>
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Ionicons name="calendar-outline" size={20} color="#666" />
                        <Text style={styles.infoLabel}>تاریخ</Text>
                        <Text style={styles.infoValue}>{selectedLesson.date}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Ionicons name="time-outline" size={20} color="#666" />
                        <Text style={styles.infoLabel}>زمان</Text>
                        <Text style={styles.infoValue}>{selectedLesson.time}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Ionicons name="school-outline" size={20} color="#666" />
                        <Text style={styles.infoLabel}>کلاس</Text>
                        <Text style={styles.infoValue}>{selectedLesson.class}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Ionicons name="flag-outline" size={20} color="#666" />
                        <Text style={styles.infoLabel}>وضعیت</Text>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: selectedLesson.status === 'completed' ? '#4CAF50' : '#2196F3' }
                        ]}>
                          <Text style={styles.statusBadgeText}>
                            {selectedLesson.status === 'completed' ? 'تکمیل شده' : 'برنامه‌ریزی شده'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Learning Objectives */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>اهداف یادگیری</Text>
                    {selectedLesson.objectives.map((objective: string, index: number) => (
                      <View key={index} style={styles.objectiveItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        <Text style={styles.objectiveText}>{objective}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Required Materials */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionTitle}>مواد مورد نیاز</Text>
                    {selectedLesson.materials.map((material: string, index: number) => (
                      <View key={index} style={styles.materialItem}>
                        <Ionicons name="document-text-outline" size={20} color="#2196F3" />
                        <Text style={styles.materialText}>{material}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Actions */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="pencil-outline" size={20} color="#2196F3" />
                      <Text style={styles.actionText}>ویرایش درس</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="copy-outline" size={20} color="#4CAF50" />
                      <Text style={styles.actionText}>تکثیر</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="share-outline" size={20} color="#9C27B0" />
                      <Text style={styles.actionText}>اشتراک‌گذاری</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  addButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  calendarOverview: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
  },
  viewCalendarText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  calendarDays: {
    flexDirection: 'row',
  },
  calendarDay: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 8,
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dayDot: {
    backgroundColor: '#2196F3',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayDotText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  lessonsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lessonTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  lessonMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 4,
  },
  metaText: {
    marginRight: 4,
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  objectivesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  objectivesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'right',
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  objectiveText: {
    marginRight: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  moreText: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 4,
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'right',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 2,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  materialText: {
    marginRight: 12,
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    textAlign: 'center',
  },
});