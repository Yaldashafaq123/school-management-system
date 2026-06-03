import { AlertTriangle, Bell, Bookmark, Calendar, Filter, Info, Share, LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type FilterType = 'all' | 'academic' | 'events' | 'important' | 'general';
type PriorityType = 'high' | 'medium' | 'low';
type CategoryType = 'academic' | 'events' | 'important' | 'general';

interface Notice {
  id: string;
  title: string;
  content: string;
  category: CategoryType;
  priority: PriorityType;
  date: string;
  time: string;
  author: string;
  important: boolean;
}

export default function NoticeBoard() {
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [bookmarks, setBookmarks] = useState<string[]>(['1', '3']);

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All Notices' },
    { id: 'academic', label: 'Academic' },
    { id: 'events', label: 'Events' },
    { id: 'important', label: 'Important' },
    { id: 'general', label: 'General' },
  ];

  const notices: Notice[] = [
    {
      id: '1',
      title: 'School Holiday Announcement',
      content: 'School will remain closed on Monday, January 29th, 2024 for maintenance work. All classes will resume on Tuesday as per regular schedule.',
      category: 'general',
      priority: 'high',
      date: '2024-01-25',
      time: '10:30 AM',
      author: 'Principal Office',
      important: true,
    },
    {
      id: '2',
      title: 'Final Exam Schedule',
      content: 'Final examinations for the academic year 2023-2024 will commence from February 15th, 2024. Detailed timetable will be shared next week.',
      category: 'academic',
      priority: 'high',
      date: '2024-01-24',
      time: '2:00 PM',
      author: 'Examination Department',
      important: true,
    },
    {
      id: '3',
      title: 'Annual Sports Day',
      content: 'Annual Sports Day will be held on February 28th, 2024. All students are requested to participate actively. Registration begins next Monday.',
      category: 'events',
      priority: 'medium',
      date: '2024-01-23',
      time: '9:00 AM',
      author: 'Sports Department',
      important: false,
    },
    {
      id: '4',
      title: 'Library Renovation',
      content: 'School library will undergo renovation from February 1st to 15th, 2024. Students can borrow extra books before the closure.',
      category: 'general',
      priority: 'medium',
      date: '2024-01-22',
      time: '11:30 AM',
      author: 'Library Department',
      important: false,
    },
    {
      id: '5',
      title: 'Science Fair Registration',
      content: 'Registration for the Annual Science Fair is now open. Last date for submission is February 10th, 2024. Prizes worth $5000 to be won.',
      category: 'academic',
      priority: 'medium',
      date: '2024-01-21',
      time: '3:45 PM',
      author: 'Science Department',
      important: false,
    },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const toggleBookmark = (id: string) => {
    if (bookmarks.includes(id)) {
      setBookmarks(bookmarks.filter(bookmarkId => bookmarkId !== id));
    } else {
      setBookmarks([...bookmarks, id]);
    }
  };

  const getPriorityColor = (priority: PriorityType): string => {
    switch (priority) {
      case 'high': return '#FF3B30';
      case 'medium': return '#FF9500';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getCategoryIcon = (category: CategoryType): LucideIcon => {
    switch (category) {
      case 'academic': return Bookmark;
      case 'events': return Calendar;
      case 'important': return AlertTriangle;
      default: return Info;
    }
  };

  const filteredNotices = notices.filter(notice => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'important') return notice.important;
    return notice.category === activeFilter;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Notice Board</Text>
            <Text style={styles.subtitle}>School announcements and updates</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButtonLarge,
                activeFilter === filter.id && styles.filterButtonActive
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text style={[
                styles.filterText,
                activeFilter === filter.id && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Bell size={20} color="#007AFF" />
            <Text style={styles.statValue}>{notices.length}</Text>
            <Text style={styles.statLabel}>Total Notices</Text>
          </View>
          <View style={styles.statCard}>
            <AlertTriangle size={20} color="#FF3B30" />
            <Text style={styles.statValue}>
              {notices.filter(n => n.important).length}
            </Text>
            <Text style={styles.statLabel}>Important</Text>
          </View>
          <View style={styles.statCard}>
            <Bookmark size={20} color="#FF9500" />
            <Text style={styles.statValue}>{bookmarks.length}</Text>
            <Text style={styles.statLabel}>Bookmarked</Text>
          </View>
        </View>

        {/* Notices List */}
        <View style={styles.noticesContainer}>
          {filteredNotices.map(notice => {
            const CategoryIcon = getCategoryIcon(notice.category);
            return (
              <View key={notice.id} style={styles.noticeCard}>
                <View style={styles.noticeHeader}>
                  <View style={styles.noticeTitleRow}>
                    <CategoryIcon size={16} color="#007AFF" />
                    <Text style={styles.noticeTitle}>{notice.title}</Text>
                    {notice.important && (
                      <View style={styles.importantBadge}>
                        <AlertTriangle size={12} color="#FF3B30" />
                        <Text style={styles.importantText}>Important</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.noticeActions}>
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => toggleBookmark(notice.id)}
                    >
                      <Bookmark 
                        size={16} 
                        color={bookmarks.includes(notice.id) ? '#FF9500' : '#8E8E93'} 
                        fill={bookmarks.includes(notice.id) ? '#FF9500' : 'transparent'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Share size={16} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.noticeContent} numberOfLines={3}>
                  {notice.content}
                </Text>

                <View style={styles.noticeFooter}>
                  <View style={styles.noticeMeta}>
                    <View style={styles.metaItem}>
                      <Text style={styles.metaLabel}>By:</Text>
                      <Text style={styles.metaValue}>{notice.author}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Calendar size={12} color="#8E8E93" />
                      <Text style={styles.metaValue}>
                        {notice.date} • {notice.time}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(notice.priority) + '20' }
                  ]}>
                    <Text style={[
                      styles.priorityText,
                      { color: getPriorityColor(notice.priority) }
                    ]}>
                      {notice.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Empty State */}
        {filteredNotices.length === 0 && (
          <View style={styles.emptyContainer}>
            <Bell size={48} color="#8E8E93" />
            <Text style={styles.emptyTitle}>No Notices Found</Text>
            <Text style={styles.emptyText}>
              There are no notices matching your current filter.
            </Text>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => setActiveFilter('all')}
            >
              <Text style={styles.resetButtonText}>Show All Notices</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1d1d1f',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  filterButtonLarge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f2f2f7',
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1d1d1f',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  noticesContainer: {
    padding: 16,
  },
  noticeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  noticeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d1d1f',
    flex: 1,
  },
  importantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  importantText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
  noticeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeContent: {
    fontSize: 16,
    color: '#1d1d1f',
    lineHeight: 24,
    marginBottom: 16,
  },
  noticeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f7',
  },
  noticeMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  metaValue: {
    fontSize: 14,
    color: '#1d1d1f',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1d1d1f',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});