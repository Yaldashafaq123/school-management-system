import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Header } from '@/components/Header';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه'];
const PERIODS = ['۸:۰۰', '۹:۰۰', '۱۰:۰۰', '۱۱:۰۰', '۱۲:۰۰', '۱۳:۰۰', '۱۴:۰۰'];

type TimetableEntry = {
  id: number;
  day: number; // 0-5 for Saturday to Thursday
  period: number; // 0-6 for periods
  subject: string;
  teacher: string;
  room: string;
  color: string;
};

export default function WeeklyTimetableScreen() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - This will come from API based on student's class
  const timetableData: TimetableEntry[] = [
    // Saturday
    { id: 1, day: 0, period: 0, subject: 'ریاضی', teacher: 'احمدی', room: '۲۰۱', color: '#3B82F6' },
    { id: 2, day: 0, period: 1, subject: 'فیزیک', teacher: 'کریمی', room: '۱۰۲', color: '#10B981' },
    { id: 3, day: 0, period: 2, subject: 'شیمی', teacher: 'رحیمی', room: 'آزمایشگاه', color: '#F59E0B' },
    
    // Sunday
    { id: 4, day: 1, period: 0, subject: 'ادبیات', teacher: 'محمدی', room: '۳۰۳', color: '#8B5CF6' },
    { id: 5, day: 1, period: 1, subject: 'دینی', teacher: 'حسینی', room: '۱۰۱', color: '#EC4899' },
    
    // Monday
    { id: 6, day: 2, period: 0, subject: 'زبان انگلیسی', teacher: 'اکبری', room: '۲۰۴', color: '#06B6D4' },
    { id: 7, day: 2, period: 1, subject: 'ورزش', teacher: 'نوری', room: 'سالن ورزش', color: '#22C55E' },
    
    // Tuesday
    { id: 8, day: 3, period: 0, subject: 'هنر', teacher: 'فرهادی', room: 'اتاق هنر', color: '#F97316' },
    { id: 9, day: 3, period: 1, subject: 'ریاضی', teacher: 'احمدی', room: '۲۰۱', color: '#3B82F6' },
    
    // Wednesday
    { id: 10, day: 4, period: 0, subject: 'علوم', teacher: 'رستمی', room: '۱۰۲', color: '#84CC16' },
    { id: 11, day: 4, period: 1, subject: 'زبان عربی', teacher: 'صادقی', room: '۲۰۵', color: '#14B8A6' },
    
    // Thursday
    { id: 12, day: 5, period: 0, subject: 'کامپیوتر', teacher: 'شریفی', room: 'کامپیوتر', color: '#6366F1' },
    { id: 13, day: 5, period: 1, subject: 'مطالعات', teacher: 'امینی', room: '۱۰۱', color: '#A855F7' },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getClassesForDay = (dayIndex: number) => {
    return timetableData.filter(entry => entry.day === dayIndex);
  };

  const getClassesForPeriod = (dayIndex: number, periodIndex: number) => {
    return timetableData.find(entry => entry.day === dayIndex && entry.period === periodIndex);
  };

  const DayView = ({ dayIndex }: { dayIndex: number }) => {
    const dayClasses = getClassesForDay(dayIndex);
    
    if (selectedDay !== null && selectedDay !== dayIndex) {
      return null;
    }

    return (
      <View style={styles.dayViewContainer}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayHeaderText}>{DAYS[dayIndex]}</Text>
          <Text style={styles.classesCount}>{dayClasses.length} کلاس</Text>
        </View>
        
        {dayClasses.length === 0 ? (
          <View style={styles.emptyDay}>
            <Ionicons name="calendar-outline" size={40} color={Colors.textSecondary} />
            <Text style={styles.emptyDayText}>کلاسی برای این روز برنامه‌ریزی نشده</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {dayClasses.map((entry) => (
              <View
                key={entry.id}
                style={[
                  styles.classCard,
                  { borderLeftColor: entry.color, borderLeftWidth: 4 }
                ]}
              >
                <View style={styles.classHeader}>
                  <View style={styles.subjectContainer}>
                    <View
                      style={[styles.colorDot, { backgroundColor: entry.color }]}
                    />
                    <Text style={styles.subjectText}>{entry.subject}</Text>
                  </View>
                  <Text style={styles.periodText}>ساعت {PERIODS[entry.period]}</Text>
                </View>
                
                <View style={styles.classDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="person" size={16} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>{entry.teacher}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={16} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>{entry.room}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const GridView = () => {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {/* Header row */}
          <View style={styles.gridHeader}>
            <View style={[styles.gridCell, styles.timeCell]} />
            {DAYS.map((day, index) => (
              <View key={index} style={[styles.gridCell, styles.dayHeaderCell]}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Time slots */}
          {PERIODS.map((time, periodIndex) => (
            <View key={periodIndex} style={styles.gridRow}>
              <View style={[styles.gridCell, styles.timeCell]}>
                <Text style={styles.timeText}>{time}</Text>
              </View>
              
              {DAYS.map((_, dayIndex) => {
                const entry = getClassesForPeriod(dayIndex, periodIndex);
                return (
                  <TouchableOpacity
                    key={`${dayIndex}-${periodIndex}`}
                    style={[
                      styles.gridCell,
                      styles.classCell,
                      entry && { backgroundColor: `${entry.color}20` }
                    ]}
                    onPress={() => entry && setSelectedDay(dayIndex)}
                  >
                    {entry ? (
                      <View style={styles.gridClassContent}>
                        <Text style={[styles.gridSubject, { color: entry.color }]}>
                          {entry.subject}
                        </Text>
                        <Text style={styles.gridTeacher}>{entry.teacher}</Text>
                        <Text style={styles.gridRoom}>{entry.room}</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="برنامه هفتگی"
        rightComponent={
          <TouchableOpacity>
            <Ionicons name="download-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
      >
        {/* View Toggle */}
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              selectedDay === null && styles.viewToggleActive,
            ]}
            onPress={() => setSelectedDay(null)}
          >
            <Ionicons
              name="grid"
              size={20}
              color={selectedDay === null ? '#fff' : Colors.text}
            />
            <Text style={[
              styles.viewToggleText,
              selectedDay === null && styles.viewToggleTextActive,
            ]}>
              جدول
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              selectedDay !== null && styles.viewToggleActive,
            ]}
            onPress={() => setSelectedDay(selectedDay !== null ? selectedDay : 0)}
          >
            <Ionicons
              name="list"
              size={20}
              color={selectedDay !== null ? '#fff' : Colors.text}
            />
            <Text style={[
              styles.viewToggleText,
              selectedDay !== null && styles.viewToggleTextActive,
            ]}>
              روزانه
            </Text>
          </TouchableOpacity>
        </View>

        {/* Day Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.daySelector}
          contentContainerStyle={styles.daySelectorContent}
        >
          {DAYS.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayChip,
                (selectedDay === null || selectedDay === index) && styles.dayChipActive,
              ]}
              onPress={() => {
                if (selectedDay === index) {
                  setSelectedDay(null);
                } else {
                  setSelectedDay(index);
                }
              }}
            >
              <Text style={[
                styles.dayChipText,
                (selectedDay === null || selectedDay === index) && styles.dayChipTextActive,
              ]}>
                {day}
              </Text>
              {getClassesForDay(index).length > 0 && (
                <View style={styles.classCountBadge}>
                  <Text style={styles.classCountText}>
                    {getClassesForDay(index).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Timetable Content */}
        <View style={styles.timetableContainer}>
          {selectedDay === null ? (
            <GridView />
          ) : (
            <DayView dayIndex={selectedDay} />
          )}
        </View>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>خلاصه هفته</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <Ionicons name="book" size={20} color={Colors.primary} />
              <Text style={styles.summaryValue}>{timetableData.length}</Text>
              <Text style={styles.summaryLabel}>کلاس کل</Text>
            </View>
            <View style={styles.summaryStat}>
              <Ionicons name="time" size={20} color={Colors.warning} />
              <Text style={styles.summaryValue}>{timetableData.length * 45}</Text>
              <Text style={styles.summaryLabel}>دقیقه کلاس</Text>
            </View>
            <View style={styles.summaryStat}>
              <Ionicons name="school" size={20} color={Colors.success} />
              <Text style={styles.summaryValue}>
                {new Set(timetableData.map(t => t.teacher)).size}
              </Text>
              <Text style={styles.summaryLabel}>معلم</Text>
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
  },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    margin: 16,
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  viewToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  viewToggleActive: {
    backgroundColor: Colors.primary,
  },
  viewToggleText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  viewToggleTextActive: {
    color: '#fff',
  },
  daySelector: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  daySelectorContent: {
    gap: 8,
  },
  dayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  dayChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  dayChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  classCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  classCountText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  timetableContainer: {
    minHeight: 400,
  },
  gridContainer: {
    paddingHorizontal: 16,
  },
  gridHeader: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  gridRow: {
    flexDirection: 'row',
    height: 80,
    marginBottom: 4,
  },
  gridCell: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeCell: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.card,
  },
  dayHeaderCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.card,
  },
  classCell: {
    flex: 1,
    padding: 4,
    backgroundColor: Colors.background,
  },
  timeText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  dayHeaderText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: 'bold',
  },
  gridClassContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridSubject: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  gridTeacher: {
    fontSize: 8,
    color: Colors.textSecondary,
  },
  gridRoom: {
    fontSize: 8,
    color: Colors.textSecondary,
  },
  dayViewContainer: {
    paddingHorizontal: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  classesCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyDay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyDayText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 12,
  },
  classCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  periodText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  classDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryContainer: {
    backgroundColor: Colors.card,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginVertical: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});