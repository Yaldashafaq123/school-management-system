import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Header } from '@/components/Header';

type Book = {
  id: number;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  category: string;
  subject: string;
  grade: number;
  pages: number;
  fileSize: string;
  fileFormat: string;
  isFavorite: boolean;
  lastRead?: {
    page: number;
    date: string;
  };
};

type Category = {
  id: number;
  name: string;
  icon: string;
  count: number;
};

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  // Mock data
  const categories: Category[] = [
    { id: 1, name: 'ریاضی', icon: 'calculator', count: 24 },
    { id: 2, name: 'علوم', icon: 'flask', count: 18 },
    { id: 3, name: 'ادبیات', icon: 'book', count: 32 },
    { id: 4, name: 'تاریخ', icon: 'time', count: 15 },
    { id: 5, name: 'زبان انگلیسی', icon: 'language', count: 28 },
    { id: 6, name: 'کامپیوتر', icon: 'desktop', count: 12 },
  ];

  const grades = [7, 8, 9, 10, 11, 12];

  const books: Book[] = [
    {
      id: 1,
      title: 'ریاضیات پایه هفتم',
      author: 'سازمان پژوهش و برنامه‌ریزی آموزشی',
      description: 'کتاب درسی ریاضی پایه هفتم دوره اول متوسطه',
      coverImage: 'https://via.placeholder.com/150x200/3B82F6/FFFFFF?text=ریاضی',
      category: 'ریاضی',
      subject: 'ریاضی',
      grade: 7,
      pages: 180,
      fileSize: '25.4 MB',
      fileFormat: 'PDF',
      isFavorite: true,
      lastRead: { page: 45, date: '۱۴۰۳/۱۰/۱۵' },
    },
    {
      id: 2,
      title: 'علوم تجربی هفتم',
      author: 'سازمان پژوهش و برنامه‌ریزی آموزشی',
      description: 'کتاب درسی علوم تجربی پایه هفتم',
      coverImage: 'https://via.placeholder.com/150x200/10B981/FFFFFF?text=علوم',
      category: 'علوم',
      subject: 'علوم تجربی',
      grade: 7,
      pages: 210,
      fileSize: '32.1 MB',
      fileFormat: 'PDF',
      isFavorite: false,
    },
    {
      id: 3,
      title: 'ادبیات فارسی هفتم',
      author: 'سازمان پژوهش و برنامه‌ریزی آموزشی',
      description: 'کتاب درسی ادبیات فارسی پایه هفتم',
      coverImage: 'https://via.placeholder.com/150x200/F59E0B/FFFFFF?text=ادبیات',
      category: 'ادبیات',
      subject: 'ادبیات فارسی',
      grade: 7,
      pages: 165,
      fileSize: '28.7 MB',
      fileFormat: 'PDF',
      isFavorite: true,
      lastRead: { page: 89, date: '۱۴۰۳/۱۰/۱۰' },
    },
    {
      id: 4,
      title: 'تاریخ ایران باستان',
      author: 'دکتر احمد احمدی',
      description: 'کتاب کمک‌آموزشی تاریخ ایران باستان',
      coverImage: 'https://via.placeholder.com/150x200/8B5CF6/FFFFFF?text=تاریخ',
      category: 'تاریخ',
      subject: 'مطالعات اجتماعی',
      grade: 8,
      pages: 245,
      fileSize: '41.3 MB',
      fileFormat: 'PDF',
      isFavorite: false,
    },
    {
      id: 5,
      title: 'آموزش زبان انگلیسی',
      author: 'خانم سارا محمدی',
      description: 'کتاب مکالمه زبان انگلیسی سطح مقدماتی',
      coverImage: 'https://via.placeholder.com/150x200/EC4899/FFFFFF?text=انگلیسی',
      category: 'زبان انگلیسی',
      subject: 'زبان انگلیسی',
      grade: 9,
      pages: 190,
      fileSize: '29.8 MB',
      fileFormat: 'PDF',
      isFavorite: true,
    },
    {
      id: 6,
      title: 'مبانی کامپیوتر',
      author: 'مهندس علی کریمی',
      description: 'آموزش مبانی کامپیوتر و برنامه‌نویسی',
      coverImage: 'https://via.placeholder.com/150x200/06B6D4/FFFFFF?text=کامپیوتر',
      category: 'کامپیوتر',
      subject: 'کار و فناوری',
      grade: 10,
      pages: 320,
      fileSize: '52.6 MB',
      fileFormat: 'PDF',
      isFavorite: false,
      lastRead: { page: 120, date: '۱۴۰۳/۰۹/۲۸' },
    },
    {
      id: 7,
      title: 'هندسه تحلیلی',
      author: 'دکتر محمود رحیمی',
      description: 'کتاب هندسه تحلیلی برای دانش‌آموزان متوسطه',
      coverImage: 'https://via.placeholder.com/150x200/84CC16/FFFFFF?text=هندسه',
      category: 'ریاضی',
      subject: 'هندسه',
      grade: 11,
      pages: 275,
      fileSize: '38.9 MB',
      fileFormat: 'PDF',
      isFavorite: true,
    },
    {
      id: 8,
      title: 'شیمی عمومی',
      author: 'دکتر فاطمه حسینی',
      description: 'کتاب شیمی عمومی پایه دهم',
      coverImage: 'https://via.placeholder.com/150x200/F97316/FFFFFF?text=شیمی',
      category: 'علوم',
      subject: 'شیمی',
      grade: 10,
      pages: 295,
      fileSize: '43.2 MB',
      fileFormat: 'PDF',
      isFavorite: false,
    },
  ];

  const filteredBooks = books.filter(book => {
    if (searchQuery) {
      return book.title.includes(searchQuery) ||
             book.author.includes(searchQuery) ||
             book.description.includes(searchQuery);
    }
    if (selectedCategory) {
      return book.category === selectedCategory;
    }
    if (selectedGrade) {
      return book.grade === selectedGrade;
    }
    return true;
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const toggleFavorite = (bookId: number) => {
    // In real app, this would update the API
    console.log('Toggle favorite for book:', bookId);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'ریاضی': '#3B82F6',
      'علوم': '#10B981',
      'ادبیات': '#F59E0B',
      'تاریخ': '#8B5CF6',
      'زبان انگلیسی': '#EC4899',
      'کامپیوتر': '#06B6D4',
    };
    return colors[category] || Colors.primary;
  };

  const renderGridView = () => (
    <View style={styles.booksGrid}>
      {filteredBooks.map((book) => (
        <TouchableOpacity key={book.id} style={styles.bookCardGrid}>
          <View style={styles.bookImageContainer}>
            <Image source={{ uri: book.coverImage }} style={styles.bookImage} />
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => toggleFavorite(book.id)}
            >
              <Ionicons
                name={book.isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={book.isFavorite ? Colors.danger : Colors.text}
              />
            </TouchableOpacity>
            {book.lastRead && (
              <View style={styles.lastReadBadge}>
                <Text style={styles.lastReadText}>
                  صفحه {book.lastRead.page}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle} numberOfLines={1}>
              {book.title}
            </Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {book.author}
            </Text>
            
            <View style={styles.bookMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="school" size={12} color={Colors.textSecondary} />
                <Text style={styles.metaText}>پایه {book.grade}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="document" size={12} color={Colors.textSecondary} />
                <Text style={styles.metaText}>{book.pages} صفحه</Text>
              </View>
            </View>
            
            <View style={[
              styles.categoryTag,
              { backgroundColor: `${getCategoryColor(book.category)}20` }
            ]}>
              <Text style={[
                styles.categoryText,
                { color: getCategoryColor(book.category) }
              ]}>
                {book.category}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderListView = () => (
    <View style={styles.booksList}>
      {filteredBooks.map((book) => (
        <TouchableOpacity key={book.id} style={styles.bookCardList}>
          <View style={styles.bookImageContainerList}>
            <Image source={{ uri: book.coverImage }} style={styles.bookImageList} />
            {book.lastRead && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(book.lastRead.page / book.pages) * 100}%` }
                  ]}
                />
              </View>
            )}
          </View>
          
          <View style={styles.bookInfoList}>
            <View style={styles.bookHeader}>
              <View>
                <Text style={styles.bookTitleList}>{book.title}</Text>
                <Text style={styles.bookAuthorList}>{book.author}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(book.id)}>
                <Ionicons
                  name={book.isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={book.isFavorite ? Colors.danger : Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.bookDescription} numberOfLines={2}>
              {book.description}
            </Text>
            
            <View style={styles.bookDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="school" size={14} color={Colors.textSecondary} />
                <Text style={styles.detailText}>پایه {book.grade}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="document" size={14} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{book.pages} صفحه</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="download" size={14} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{book.fileSize}</Text>
              </View>
            </View>
            
            <View style={styles.bookFooter}>
              <View style={[
                styles.categoryTagList,
                { backgroundColor: `${getCategoryColor(book.category)}20` }
              ]}>
                <Text style={[
                  styles.categoryTextList,
                  { color: getCategoryColor(book.category) }
                ]}>
                  {book.category}
                </Text>
              </View>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.readButton}>
                  <Ionicons name="book" size={16} color="#fff" />
                  <Text style={styles.readButtonText}>خواندن</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.downloadButton}>
                  <Ionicons name="download" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="کتابخانه دیجیتال"
        rightComponent={
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => setViewType(viewType === 'grid' ? 'list' : 'grid')}>
              <Ionicons
                name={viewType === 'grid' ? 'list' : 'grid'}
                size={24}
                color={Colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="bookmark-outline" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
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
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="جستجوی کتاب..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>دسته‌بندی موضوعی</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.name && styles.categoryCardActive,
                ]}
                onPress={() => setSelectedCategory(
                  selectedCategory === category.name ? null : category.name
                )}
              >
                <View style={[
                  styles.categoryIcon,
                  { backgroundColor: `${getCategoryColor(category.name)}20` }
                ]}>
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={getCategoryColor(category.name)}
                  />
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.count} کتاب</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Grade Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>پایه تحصیلی</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.gradesContainer}
          >
            <TouchableOpacity
              style={[
                styles.gradeChip,
                selectedGrade === null && styles.gradeChipActive,
              ]}
              onPress={() => setSelectedGrade(null)}
            >
              <Text style={[
                styles.gradeChipText,
                selectedGrade === null && styles.gradeChipTextActive,
              ]}>
                همه پایه‌ها
              </Text>
            </TouchableOpacity>
            {grades.map((grade) => (
              <TouchableOpacity
                key={grade}
                style={[
                  styles.gradeChip,
                  selectedGrade === grade && styles.gradeChipActive,
                ]}
                onPress={() => setSelectedGrade(
                  selectedGrade === grade ? null : grade
                )}
              >
                <Text style={[
                  styles.gradeChipText,
                  selectedGrade === grade && styles.gradeChipTextActive,
                ]}>
                  پایه {grade}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Active Filters */}
        {(selectedCategory || selectedGrade || searchQuery) && (
          <View style={styles.activeFilters}>
            <Text style={styles.activeFiltersTitle}>فیلترهای فعال:</Text>
            <View style={styles.filterChips}>
              {selectedCategory && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>موضوع: {selectedCategory}</Text>
                  <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                    <Ionicons name="close" size={14} color={Colors.text} />
                  </TouchableOpacity>
                </View>
              )}
              {selectedGrade && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>پایه: {selectedGrade}</Text>
                  <TouchableOpacity onPress={() => setSelectedGrade(null)}>
                    <Ionicons name="close" size={14} color={Colors.text} />
                  </TouchableOpacity>
                </View>
              )}
              {searchQuery && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>جستجو: {searchQuery}</Text>
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close" size={14} color={Colors.text} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Results */}
        <View style={styles.section}>
          <View style={styles.resultsHeader}>
            <Text style={styles.sectionTitle}>کتاب‌ها</Text>
            <Text style={styles.resultsCount}>
              {filteredBooks.length} کتاب
            </Text>
          </View>

          {filteredBooks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={60} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>کتابی یافت نشد</Text>
              <Text style={styles.emptyStateSubtext}>
                سعی کنید فیلترهای جستجو را تغییر دهید
              </Text>
            </View>
          ) : viewType === 'grid' ? (
            renderGridView()
          ) : (
            renderListView()
          )}
        </View>

        {/* Recently Read */}
        {books.some(b => b.lastRead) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>آخرین خوانده‌ها</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentBooksContainer}
            >
              {books
                .filter(b => b.lastRead)
                .sort((a, b) => new Date(b.lastRead!.date).getTime() - new Date(a.lastRead!.date).getTime())
                .slice(0, 5)
                .map((book) => (
                  <TouchableOpacity key={book.id} style={styles.recentBookCard}>
                    <Image source={{ uri: book.coverImage }} style={styles.recentBookImage} />
                    <View style={styles.recentBookInfo}>
                      <Text style={styles.recentBookTitle} numberOfLines={1}>
                        {book.title}
                      </Text>
                      <Text style={styles.recentBookProgress}>
                        صفحه {book.lastRead!.page} از {book.pages}
                      </Text>
                      <Text style={styles.recentBookDate}>
                        {book.lastRead!.date}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}
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
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    marginHorizontal: 12,
    textAlign: 'right',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    width: 100,
  },
  categoryCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  gradesContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  gradeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gradeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  gradeChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  gradeChipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activeFilters: {
    backgroundColor: Colors.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFiltersTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  filterChipText: {
    fontSize: 12,
    color: Colors.text,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  bookCardGrid: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  bookImageContainer: {
    position: 'relative',
    height: 160,
  },
  bookImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastReadBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lastReadText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  booksList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  bookCardList: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  bookImageContainerList: {
    position: 'relative',
    width: 100,
  },
  bookImageList: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  bookInfoList: {
    flex: 1,
    padding: 12,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookTitleList: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  bookAuthorList: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bookDescription: {
    fontSize: 12,
    color: Colors.text,
    marginBottom: 12,
    lineHeight: 18,
  },
  bookDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bookFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTagList: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTextList: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  readButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  readButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  downloadButton: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentBooksContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  recentBookCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    width: 280,
    overflow: 'hidden',
  },
  recentBookImage: {
    width: 80,
    height: 120,
    resizeMode: 'cover',
  },
  recentBookInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  recentBookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  recentBookProgress: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  recentBookDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});