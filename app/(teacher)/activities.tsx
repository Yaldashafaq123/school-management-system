import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Header } from '../../components/Header';

const mockActivities = [
  {
    title: 'امروز',
    data: [
      {
        id: 1,
        type: 'assignment',
        title: '۵ تکلیف جدید ارسال شد',
        description: 'تکلیف فصل دوم ریاضی هفتم',
        course: 'ریاضی هفتم',
        time: '۲ ساعت پیش',
        icon: 'document-text',
        color: Colors.primary,
      },
      {
        id: 2,
        type: 'exam',
        title: 'آزمون میان‌ترم شروع شد',
        description: '۴۵ دانش‌آموز در حال شرکت در آزمون',
        course: 'علوم تجربی',
        time: '۳ ساعت پیش',
        icon: 'clipboard',
        color: Colors.warning,
      },
      {
        id: 3,
        type: 'submission',
        title: '۱۲ تحویل جدید',
        description: 'پروژه نهایی علوم تجربی',
        course: 'علوم تجربی',
        time: '۵ ساعت پیش',
        icon: 'arrow-up-circle',
        color: Colors.success,
      },
    ],
  },
  {
    title: 'دیروز',
    data: [
      {
        id: 4,
        type: 'grade',
        title: 'تصحیح تکالیف کامل شد',
        description: '۳۸ تکلیف تصحیح شد',
        course: 'ریاضی هفتم',
        time: 'دیروز',
        icon: 'checkmark-done',
        color: Colors.success,
      },
      {
        id: 5,
        type: 'announcement',
        title: 'اعلان جدید منتشر شد',
        description: 'تغییر زمان کلاس علوم',
        course: 'علوم تجربی',
        time: 'دیروز',
        icon: 'megaphone',
        color: Colors.secondary,
      },
      {
        id: 6,
        type: 'enrollment',
        title: '۵ دانش‌آموز جدید',
        description: 'ثبت‌نام در دوره ادبیات فارسی',
        course: 'ادبیات فارسی',
        time: 'دیروز',
        icon: 'person-add',
        color: Colors.info,
      },
    ],
  },
  {
    title: 'هفته گذشته',
    data: [
      {
        id: 7,
        type: 'course',
        title: 'دوره جدید ایجاد شد',
        description: 'ریاضی پایه هشتم',
        course: 'ریاضی هشتم',
        time: '۳ روز پیش',
        icon: 'book',
        color: Colors.primary,
      },
      {
        id: 8,
        type: 'payment',
        title: 'دریافت پرداخت',
        description: '۲,۵۰۰,۰۰۰ تومان',
        course: 'ریاضی هفتم',
        time: '۴ روز پیش',
        icon: 'cash',
        color: Colors.success,
      },
      {
        id: 9,
        type: 'student',
        title: 'پیام دانش‌آموز',
        description: 'سوال درباره تکلیف فصل اول',
        course: 'ریاضی هفتم',
        time: '۵ روز پیش',
        icon: 'chatbubble',
        color: Colors.info,
      },
      {
        id: 10,
        type: 'report',
        title: 'گزارش ماهانه تولید شد',
        description: 'گزارش عملکرد نوامبر',
        course: '',
        time: '۶ روز پیش',
        icon: 'stats-chart',
        color: Colors.secondary,
      },
    ],
  },
];

const activityFilters = [
  { id: 'all', title: 'همه', icon: 'grid' },
  { id: 'assignments', title: 'تکالیف', icon: 'document-text' },
  { id: 'exams', title: 'آزمون‌ها', icon: 'clipboard' },
  { id: 'grades', title: 'نمرات', icon: 'star' },
  { id: 'announcements', title: 'اعلان‌ها', icon: 'megaphone' },
  { id: 'payments', title: 'پرداخت‌ها', icon: 'cash' },
];

export default function Activities() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [filteredActivities, setFilteredActivities] = useState(mockActivities);

  const filterActivities = useCallback(() => {
    if (filter === 'all') {
      setFilteredActivities(mockActivities);
    } else {
      const filtered = mockActivities.map(section => ({
        ...section,
        data: section.data.filter(activity => {
          switch (filter) {
            case 'assignments':
              return activity.type === 'assignment' || activity.type === 'submission';
            case 'exams':
              return activity.type === 'exam';
            case 'grades':
              return activity.type === 'grade';
            case 'announcements':
              return activity.type === 'announcement';
            case 'payments':
              return activity.type === 'payment';
            default:
              return true;
          }
        })
      })).filter(section => section.data.length > 0);
      
      setFilteredActivities(filtered);
    }
  }, [filter]);

  useEffect(() => {
    filterActivities();
  }, [filter, filterActivities]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleActivityPress = (activity: any) => {
    switch (activity.type) {
      case 'assignment':
        router.push('./(teacher)/assignments');
        break;
      case 'exam':
        router.push('./(teacher)/exam/create');
        break;
      case 'submission':
        router.push('./(teacher)/grading');
        break;
      case 'grade':
        router.push('./(teacher)/grading');
        break;
      case 'announcement':
        router.push('./(teacher)/announcement/create');
        break;
      case 'enrollment':
        router.push('./(teacher)/students');
        break;
      case 'course':
        router.push('./(teacher)/courses');
        break;
      case 'payment':
        router.push('./(teacher)/revenue');
        break;
      case 'student':
        router.push('./(teacher)/students');
        break;
      case 'report':
        router.push('./(teacher)/analytics');
        break;
    }
  };

  const getActivityStats = () => {
    const today = mockActivities[0].data.length;
    const yesterday = mockActivities[1].data.length;
    const lastWeek = mockActivities[2].data.length;
    
    return {
      today,
      yesterday,
      lastWeek,
      total: today + yesterday + lastWeek,
    };
  };

  const stats = getActivityStats();

  const renderActivityItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.activityCard}
      onPress={() => handleActivityPress(item)}
    >
      <View style={styles.activityIconContainer}>
        <View style={[styles.activityIcon, { backgroundColor: `${item.color}20` }]}>
          <Ionicons name={item.icon as any} size={20} color={item.color} />
        </View>
      </View>
      
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityDescription}>{item.description}</Text>
        <View style={styles.activityMeta}>
          {item.course ? (
            <View style={styles.courseBadge}>
              <Ionicons name="book" size={12} color={Colors.textSecondary} />
              <Text style={styles.courseText}>{item.course}</Text>
            </View>
          ) : null}
          <Text style={styles.activityTime}>{item.time}</Text>
        </View>
      </View>
      
      <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: any }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length} فعالیت</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="فعالیت‌ها" />

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="today" size={24} color={Colors.primary} />
            <Text style={styles.statValue}>{stats.today}</Text>
            <Text style={styles.statLabel}>امروز</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color={Colors.warning} />
            <Text style={styles.statValue}>{stats.yesterday}</Text>
            <Text style={styles.statLabel}>دیروز</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color={Colors.success} />
            <Text style={styles.statValue}>{stats.lastWeek}</Text>
            <Text style={styles.statLabel}>هفته گذشته</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="stats-chart" size={24} color={Colors.secondary} />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>کل</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        <View style={styles.filters}>
          {activityFilters.map((filterItem) => (
            <TouchableOpacity
              key={filterItem.id}
              style={[styles.filterButton, filter === filterItem.id && styles.filterButtonActive]}
              onPress={() => setFilter(filterItem.id)}
            >
              <Ionicons
                name={filterItem.icon as any}
                size={16}
                color={filter === filterItem.id ? '#fff' : Colors.text}
              />
              <Text style={[styles.filterText, filter === filterItem.id && styles.filterTextActive]}>
                {filterItem.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Activities List */}
      <SectionList
        sections={filteredActivities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderActivityItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={60} color={Colors.textSecondary} />
            <Text style={styles.emptyStateTitle}>فعالیتی یافت نشد</Text>
            <Text style={styles.emptyStateText}>
              با فیلتر انتخاب شده فعالیتی وجود ندارد.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  statsContainer: {
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.background,
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
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  filtersContainer: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 12,
    color: Colors.text,
  },
  filterTextActive: {
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    gap: 12,
  },
  activityIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  courseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  courseText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  activityTime: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
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
    lineHeight: 20,
  },
});