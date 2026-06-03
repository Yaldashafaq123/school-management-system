// app/(tabs)/courses.tsx
import { CourseCard } from '@/components/CourseCard';
import { CourseFilters } from '@/components/CourseFilters';
import { CourseGridItem } from '@/components/CourseGridItem';
import { CourseSort } from '@/components/CourseSort';
import { CourseStatsComponent } from '@/components/CourseStats';
import { Header } from '@/components/Header';
import { ViewToggle } from '@/components/ViewToggle';
import { Colors } from '@/constants/Colors';
import { mockClasses, mockCourses, mockSubjects } from '@/constants/mockData';
import { Course, CourseFilter, CourseStats, SortOption, ViewMode } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PAGE_SIZE = 10;

export default function CoursesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // State
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(mockCourses);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Filters and Sort
  const [filters, setFilters] = useState<CourseFilter>({});
  const [sort, setSort] = useState<SortOption>({
    id: 'popular',
    label: 'محبوب‌ترین',
    field: 'popularity',
    order: 'desc',
  });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Stats
  const [stats, setStats] = useState<CourseStats>({
    total: 150,
    enrolled: 45,
    completed: 12,
    in_progress: 33,
  });

  // Apply filters from URL params
  useEffect(() => {
    if (params.class) {
      const classId = parseInt(params.class as string);
      setFilters(prev => ({ ...prev, class_id: classId }));
    }
  }, [params]);

  // Filter and sort courses
  useEffect(() => {
    applyFiltersAndSort();
  }, [filters, sort, searchQuery, courses]);

  const applyFiltersAndSort = () => {
    let filtered = [...courses];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply other filters
    if (filters.class_id) {
      filtered = filtered.filter(course => course.class_id === filters.class_id);
    }
    if (filters.subject_id) {
      filtered = filtered.filter(course => course.subject_id === filters.subject_id);
    }
    if (filters.is_free !== undefined) {
      filtered = filtered.filter(course => course.is_general === filters.is_free);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sort.field === 'title') {
        return sort.order === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      // Default: sort by popularity (enrollment count)
      return sort.order === 'asc' ? a.id - b.id : b.id - a.id;
    });

    setFilteredCourses(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    // Simulate API call for more data
    setTimeout(() => {
      // In real app, fetch next page from API
      setLoading(false);
      setHasMore(filteredCourses.length < 50); // Example limit
    }, 500);
  };

  const renderCourseItem = ({ item }: { item: Course }) => {
    if (viewMode === 'grid') {
      return (
        <CourseGridItem
          course={item}
          onPress={() => router.push(`/course/${item.id}`)}
          showProgress
        />
      );
    }

    return (
      <CourseCard
        course={item}
        onPress={() => router.push(`/course/${item.id}`)}
        showProgress
      />
    );
  };

  const renderHeader = () => (
    <>
      {/* Search Bar */}
      {showSearch ? (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="جستجوی دوره‌ها..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.cancelSearch}
            onPress={() => {
              setShowSearch(false);
              setSearchQuery('');
            }}
          >
            <Text style={styles.cancelSearchText}>انصراف</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => setShowSearch(true)}
        >
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>جستجوی دوره‌ها...</Text>
        </TouchableOpacity>
      )}

      {/* Stats */}
      <CourseStatsComponent stats={stats} />

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlsLeft}>
          <CourseFilters
            filters={filters}
            classes={mockClasses}
            subjects={mockSubjects}
            onFilterChange={setFilters}
          />
          <CourseSort currentSort={sort} onSortChange={setSort} />
        </View>
        <ViewToggle mode={viewMode} onModeChange={setViewMode} />
      </View>

      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <View style={styles.activeFilters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {Object.entries(filters).map(([key, value]) => {
              if (value === undefined || value === null) return null;
              
              let label = '';
              if (key === 'class_id') {
                const classItem = mockClasses.find(c => c.id === value);
                label = classItem ? classItem.class_name : '';
              } else if (key === 'subject_id') {
                const subject = mockSubjects.find(s => s.id === value);
                label = subject ? subject.subject_name : '';
              } else if (key === 'difficulty') {
                label = value === 'beginner' ? 'مقدماتی' :
                        value === 'intermediate' ? 'متوسط' : 'پیشرفته';
              } else if (key === 'is_free') {
                label = 'رایگان';
              } else if (key === 'has_certificate') {
                label = 'دارای گواهینامه';
              }

              if (!label) return null;

              return (
                <View key={key} style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>{label}</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setFilters(prev => ({ ...prev, [key]: undefined }));
                    }}
                  >
                    <Ionicons name="close" size={16} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            style={styles.clearAllButton}
            onPress={() => setFilters({})}
          >
            <Text style={styles.clearAllText}>پاک کردن همه</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredCourses.length} دوره یافت شد
        </Text>
        {searchQuery && (
          <Text style={styles.searchQuery}>برای {searchQuery}</Text>
        )}
      </View>
    </>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search" size={60} color={Colors.textSecondary} />
      <Text style={styles.emptyStateTitle}>دوره‌ای یافت نشد</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? 'هیچ دوره‌ای با کلمات جستجوی شما مطابقت ندارد'
          : 'با فیلترهای فعلی دوره‌ای وجود ندارد'}
      </Text>
      {(searchQuery || Object.keys(filters).length > 0) && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            setSearchQuery('');
            setFilters({});
          }}
        >
          <Text style={styles.resetButtonText}>پاک کردن جستجو و فیلترها</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="دوره‌ها"
        rightComponent={
          !showSearch && (
            <TouchableOpacity onPress={() => setShowSearch(true)}>
              <Ionicons name="search" size={24} color={Colors.text} />
            </TouchableOpacity>
          )
        }
      />

      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        key={viewMode}
        keyExtractor={(item) => item.id.toString()}
        numColumns={viewMode === 'grid' ? 2 : 1}
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: Colors.textSecondary,
    marginHorizontal: 12,
    textAlign: 'right',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    marginHorizontal: 12,
    textAlign: 'right',
  },
  cancelSearch: {
    paddingVertical: 8,
  },
  cancelSearchText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  controlsLeft: {
    flexDirection: 'row',
    gap: 12,
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  activeFilterText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 12,
    color: Colors.danger,
    fontWeight: '500',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  searchQuery: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  gridRow: {
    paddingHorizontal: 12,
  },
  loadingFooter: {
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
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
    lineHeight: 22,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});