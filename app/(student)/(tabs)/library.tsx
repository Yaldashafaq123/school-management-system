// app/(student)/library/index.tsx
import { Header } from "@/components/Header";
import { Colors } from "@/constants/Colors";
import {
  Book,
  BookCategory,
  getCategoryColor,
  studentLibraryApi,
} from "@/src/config/studentLibraryApi";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LibraryScreen() {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [recentReads, setRecentReads] = useState<Book[]>([]);
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [grades, setGrades] = useState<number[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

  const loadLibraryData = useCallback(async () => {
    try {
      const response = await studentLibraryApi.getLibrary();
      if (response.success && response.data) {
        setCategories(response.data.categories || []);
        setBooks(response.data.books || []);
        setRecentReads(response.data.recentReads || []);
        setFavorites(response.data.favorites || []);
        setGrades(response.data.grades || []);
        setFilteredBooks(response.data.books || []);
      }
    } catch (error) {
      console.error("Error loading library:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLibraryData();
  }, [loadLibraryData]);

  useEffect(() => {
    // Apply filters
    let filtered = books;

    if (searchQuery) {
      filtered = filtered.filter(
        (book) =>
          book.title.includes(searchQuery) ||
          book.author.includes(searchQuery) ||
          book.description.includes(searchQuery),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((book) => book.category === selectedCategory);
    }

    if (selectedGrade) {
      filtered = filtered.filter((book) => book.grade === selectedGrade);
    }

    setFilteredBooks(filtered);
  }, [searchQuery, selectedCategory, selectedGrade, books]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLibraryData();
  };

  const toggleFavorite = async (bookId: number) => {
    try {
      const response = await studentLibraryApi.toggleFavorite(bookId);
      if (response.success) {
        // Update local state
        setBooks((prevBooks) =>
          prevBooks.map((book) =>
            book.id === bookId
              ? { ...book, isFavorite: response.isFavorite }
              : book,
          ),
        );
        setFilteredBooks((prevBooks) =>
          prevBooks.map((book) =>
            book.id === bookId
              ? { ...book, isFavorite: response.isFavorite }
              : book,
          ),
        );
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
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
                name={book.isFavorite ? "heart" : "heart-outline"}
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
                <Ionicons
                  name="school"
                  size={12}
                  color={Colors.textSecondary}
                />
                <Text style={styles.metaText}>پایه {book.grade}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons
                  name="document"
                  size={12}
                  color={Colors.textSecondary}
                />
                <Text style={styles.metaText}>{book.pages} صفحه</Text>
              </View>
            </View>

            <View
              style={[
                styles.categoryTag,
                { backgroundColor: `${getCategoryColor(book.category)}20` },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: getCategoryColor(book.category) },
                ]}
              >
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
            <Image
              source={{ uri: book.coverImage }}
              style={styles.bookImageList}
            />
            {book.lastRead && (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${book.readingProgress || 0}%` },
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
                  name={book.isFavorite ? "heart" : "heart-outline"}
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
                <Ionicons
                  name="school"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.detailText}>پایه {book.grade}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons
                  name="document"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.detailText}>{book.pages} صفحه</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons
                  name="download"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text style={styles.detailText}>{book.fileSize}</Text>
              </View>
            </View>

            <View style={styles.bookFooter}>
              <View
                style={[
                  styles.categoryTagList,
                  { backgroundColor: `${getCategoryColor(book.category)}20` },
                ]}
              >
                <Text
                  style={[
                    styles.categoryTextList,
                    { color: getCategoryColor(book.category) },
                  ]}
                >
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <Header title="کتابخانه دیجیتال" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>در حال بارگذاری کتابخانه...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header
        title="کتابخانه دیجیتال"
        rightComponent={
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => setViewType(viewType === "grid" ? "list" : "grid")}
            >
              <Ionicons
                name={viewType === "grid" ? "list" : "grid"}
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
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories */}
        {categories.length > 0 && (
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
                    selectedCategory === category.name &&
                      styles.categoryCardActive,
                  ]}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === category.name ? null : category.name,
                    )
                  }
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: `${category.color}20` },
                    ]}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={24}
                      color={category.color}
                    />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryCount}>
                    {category.count} کتاب
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Grade Filter */}
        {grades.length > 0 && (
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
                <Text
                  style={[
                    styles.gradeChipText,
                    selectedGrade === null && styles.gradeChipTextActive,
                  ]}
                >
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
                  onPress={() =>
                    setSelectedGrade(selectedGrade === grade ? null : grade)
                  }
                >
                  <Text
                    style={[
                      styles.gradeChipText,
                      selectedGrade === grade && styles.gradeChipTextActive,
                    ]}
                  >
                    پایه {grade}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Active Filters */}
        {(selectedCategory || selectedGrade || searchQuery) && (
          <View style={styles.activeFilters}>
            <Text style={styles.activeFiltersTitle}>فیلترهای فعال:</Text>
            <View style={styles.filterChips}>
              {selectedCategory && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>
                    موضوع: {selectedCategory}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedCategory(null)}>
                    <Ionicons name="close" size={14} color={Colors.text} />
                  </TouchableOpacity>
                </View>
              )}
              {selectedGrade && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>
                    پایه: {selectedGrade}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedGrade(null)}>
                    <Ionicons name="close" size={14} color={Colors.text} />
                  </TouchableOpacity>
                </View>
              )}
              {searchQuery && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>
                    جستجو: {searchQuery}
                  </Text>
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
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
            <Text style={styles.resultsCount}>{filteredBooks.length} کتاب</Text>
          </View>

          {filteredBooks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="book-outline"
                size={60}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyStateText}>کتابی یافت نشد</Text>
              <Text style={styles.emptyStateSubtext}>
                سعی کنید فیلترهای جستجو را تغییر دهید
              </Text>
            </View>
          ) : viewType === "grid" ? (
            renderGridView()
          ) : (
            renderListView()
          )}
        </View>

        {/* Recently Read */}
        {recentReads.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>آخرین خوانده‌ها</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentBooksContainer}
            >
              {recentReads.map((book) => (
                <TouchableOpacity key={book.id} style={styles.recentBookCard}>
                  <Image
                    source={{ uri: book.coverImage }}
                    style={styles.recentBookImage}
                  />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    gap: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    textAlign: "right",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    width: 100,
  },
  categoryCardActive: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "bold",
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
    color: "#fff",
    fontWeight: "bold",
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
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  booksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  bookCardGrid: {
    width: "48%",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  bookImageContainer: {
    position: "relative",
    height: 160,
  },
  bookImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  lastReadBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lastReadText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },
  bookInfo: {
    padding: 12,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  bookMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  categoryTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  booksList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  bookCardList: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  bookImageContainerList: {
    position: "relative",
    width: 100,
  },
  bookImageList: {
    width: "100%",
    height: 140,
    resizeMode: "cover",
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.border,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
  },
  bookInfoList: {
    flex: 1,
    padding: 12,
  },
  bookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  bookTitleList: {
    fontSize: 16,
    fontWeight: "bold",
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  bookFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryTagList: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryTextList: {
    fontSize: 12,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  readButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  readButtonText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  downloadButton: {
    width: 32,
    height: 32,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  recentBooksContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  recentBookCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    width: 280,
    overflow: "hidden",
  },
  recentBookImage: {
    width: 80,
    height: 120,
    resizeMode: "cover",
  },
  recentBookInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  recentBookTitle: {
    fontSize: 14,
    fontWeight: "bold",
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
